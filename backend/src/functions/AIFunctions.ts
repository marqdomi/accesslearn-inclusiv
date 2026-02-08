/**
 * AI Functions - API handlers for Gemini-powered features.
 * All endpoints are under /api/ai/*
 */

import { Request, Response } from 'express';
import { getContainer } from '../services/cosmosdb.service';
import {
  getAICourseRecommendations,
  generateQuizFromContent,
  generateCourseSummary,
  chatWithAssistant,
  generateAnalyticsInsights,
  generateLessonContent,
  extractContentFromDocument,
  isGeminiConfigured,
  testGeminiConnection,
  type ChatMessage,
} from '../services/gemini.service';

// ─── Health Check ─────────────────────────────────────────────

export async function aiHealthCheck(req: Request, res: Response) {
  if (!isGeminiConfigured()) {
    return res.status(503).json({ error: 'AI service not configured', configured: false });
  }
  const health = await testGeminiConnection();
  return res.json({ configured: true, ...health });
}

// ─── Course Recommendations ───────────────────────────────────

export async function getRecommendations(req: Request, res: Response) {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const userId = (req as any).user?.userId;
    const tenantId = (req as any).user?.tenantId;
    if (!userId || !tenantId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Gather user profile from DB
    const usersContainer = getContainer('users');
    const progressContainer = getContainer('user-progress');
    const coursesContainer = getContainer('courses');

    // Get user data
    const { resources: userRecords } = await usersContainer.items
      .query({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: userId }] })
      .fetchAll();
    const user = userRecords[0];

    // Get user progress
    const { resources: progressRecords } = await progressContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.userId = @userId AND c.tenantId = @tenantId',
        parameters: [
          { name: '@userId', value: userId },
          { name: '@tenantId', value: tenantId },
        ],
      })
      .fetchAll();

    // Get all published courses for the tenant
    const { resources: allCourses } = await coursesContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.status = "published"',
        parameters: [{ name: '@tenantId', value: tenantId }],
      })
      .fetchAll();

    // Build user learning profile
    const completedIds = new Set(
      progressRecords.filter((p: any) => p.status === 'completed').map((p: any) => p.courseId),
    );
    const inProgressIds = new Set(
      progressRecords.filter((p: any) => p.status !== 'completed').map((p: any) => p.courseId),
    );

    const completedCourses = allCourses
      .filter((c: any) => completedIds.has(c.id))
      .map((c: any) => ({
        title: c.title,
        category: c.category || 'General',
        score: progressRecords.find((p: any) => p.courseId === c.id)?.averageScore,
      }));

    const inProgressCourses = allCourses
      .filter((c: any) => inProgressIds.has(c.id))
      .map((c: any) => ({
        title: c.title,
        category: c.category || 'General',
        progress: progressRecords.find((p: any) => p.courseId === c.id)?.overallProgress || 0,
      }));

    // Available courses = not enrolled yet
    const enrolledIds = new Set([...completedIds, ...inProgressIds]);
    const availableCourses = allCourses
      .filter((c: any) => !enrolledIds.has(c.id))
      .map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description?.slice(0, 200) || '',
        category: c.category || 'General',
        level: c.level || 'beginner',
        tags: c.tags || [],
      }));

    if (availableCourses.length === 0) {
      return res.json({ recommendations: [], message: 'Ya estás inscrito en todos los cursos disponibles' });
    }

    const recommendations = await getAICourseRecommendations(
      {
        completedCourses,
        inProgressCourses,
        interests: user?.interests || [],
        role: user?.role || 'student',
      },
      availableCourses,
      Math.min(5, availableCourses.length),
    );

    return res.json({ recommendations });
  } catch (error: any) {
    console.error('[AI] Recommendations error:', error);
    return res.status(500).json({ error: 'Failed to generate recommendations' });
  }
}

// ─── Quiz Generation ──────────────────────────────────────────

export async function generateQuiz(req: Request, res: Response) {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const { courseId, moduleIndex, questionCount = 5, difficulty = 'medium' } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const coursesContainer = getContainer('courses');
    const { resources } = await coursesContainer.items
      .query({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: courseId }] })
      .fetchAll();

    const course = resources[0];
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Extract content from modules/lessons
    let contentText = `Curso: ${course.title}\nDescripción: ${course.description || ''}\n\n`;

    if (course.modules && Array.isArray(course.modules)) {
      const targetModules =
        moduleIndex !== undefined ? [course.modules[moduleIndex]] : course.modules;

      for (const mod of targetModules) {
        if (!mod) continue;
        contentText += `\nMódulo: ${mod.title}\n`;
        if (mod.lessons && Array.isArray(mod.lessons)) {
          for (const lesson of mod.lessons) {
            contentText += `Lección: ${lesson.title}\n`;
            if (lesson.blocks && Array.isArray(lesson.blocks)) {
              for (const block of lesson.blocks) {
                if (block.type === 'text' && block.content) {
                  contentText += block.content + '\n';
                }
              }
            }
          }
        }
      }
    }

    const questions = await generateQuizFromContent(
      course.title,
      contentText,
      Math.min(questionCount, 10),
      difficulty,
    );

    return res.json({ courseId, questions, count: questions.length });
  } catch (error: any) {
    console.error('[AI] Quiz generation error:', error);
    return res.status(500).json({ error: 'Failed to generate quiz' });
  }
}

// ─── Course Summary ──────────────────────────────────────────

export async function summarizeCourse(req: Request, res: Response) {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const { courseId } = req.params;
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const coursesContainer = getContainer('courses');
    const { resources } = await coursesContainer.items
      .query({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: courseId }] })
      .fetchAll();

    const course = resources[0];
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const moduleTitles = (course.modules || []).map((m: any) => m.title);
    let lessonsContent = '';
    for (const mod of course.modules || []) {
      for (const lesson of mod.lessons || []) {
        lessonsContent += `${lesson.title}: `;
        for (const block of lesson.blocks || []) {
          if (block.type === 'text' && block.content) {
            lessonsContent += block.content + ' ';
          }
        }
        lessonsContent += '\n';
      }
    }

    const summary = await generateCourseSummary(
      course.title,
      course.description || '',
      moduleTitles,
      lessonsContent,
    );

    return res.json({ courseId, summary });
  } catch (error: any) {
    console.error('[AI] Summary error:', error);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
}

// ─── Learning Assistant Chat ─────────────────────────────────

export async function chatAssistant(req: Request, res: Response) {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const { courseId, message, history = [] } = req.body;
    if (!courseId || !message) {
      return res.status(400).json({ error: 'courseId and message are required' });
    }

    const coursesContainer = getContainer('courses');
    const { resources } = await coursesContainer.items
      .query({ query: 'SELECT * FROM c WHERE c.id = @id', parameters: [{ name: '@id', value: courseId }] })
      .fetchAll();

    const course = resources[0];
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Build content string from course
    let contentText = '';
    for (const mod of course.modules || []) {
      contentText += `Módulo: ${mod.title}\n`;
      for (const lesson of mod.lessons || []) {
        contentText += `Lección: ${lesson.title}\n`;
        for (const block of lesson.blocks || []) {
          if (block.type === 'text' && block.content) {
            contentText += block.content + '\n';
          }
        }
      }
    }

    const reply = await chatWithAssistant(
      {
        title: course.title,
        description: course.description || '',
        content: contentText,
      },
      history as ChatMessage[],
      message,
    );

    return res.json({ reply });
  } catch (error: any) {
    console.error('[AI] Chat error:', error);
    return res.status(500).json({ error: 'Failed to process chat message' });
  }
}

// ─── Analytics Insights ──────────────────────────────────────

export async function getInsights(req: Request, res: Response) {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const tenantId = (req as any).user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const usersContainer = getContainer('users');
    const coursesContainer = getContainer('courses');
    const progressContainer = getContainer('user-progress');

    // Gather stats
    const { resources: users } = await usersContainer.items
      .query({
        query: 'SELECT c.id, c.status FROM c WHERE c.tenantId = @t',
        parameters: [{ name: '@t', value: tenantId }],
      })
      .fetchAll();

    const { resources: courses } = await coursesContainer.items
      .query({
        query: 'SELECT c.id, c.title, c.status FROM c WHERE c.tenantId = @t AND c.status = "published"',
        parameters: [{ name: '@t', value: tenantId }],
      })
      .fetchAll();

    const { resources: progress } = await progressContainer.items
      .query({
        query: 'SELECT c.courseId, c.status, c.overallProgress, c.averageScore FROM c WHERE c.tenantId = @t',
        parameters: [{ name: '@t', value: tenantId }],
      })
      .fetchAll();

    const totalUsers = users.length;
    const activeUsers = users.filter((u: any) => u.status === 'active').length;
    const totalCourses = courses.length;

    const completedProgress = progress.filter((p: any) => p.status === 'completed');
    const avgCompletion =
      progress.length > 0
        ? Math.round(progress.reduce((sum: number, p: any) => sum + (p.overallProgress || 0), 0) / progress.length)
        : 0;
    const avgScore =
      completedProgress.length > 0
        ? Math.round(
            completedProgress.reduce((sum: number, p: any) => sum + (p.averageScore || 0), 0) / completedProgress.length,
          )
        : 0;

    // Top courses by completion count
    const courseCompletions: Record<string, number> = {};
    for (const p of completedProgress) {
      courseCompletions[p.courseId] = (courseCompletions[p.courseId] || 0) + 1;
    }
    const topCourses = courses
      .map((c: any) => ({ title: c.title, completions: courseCompletions[c.id] || 0 }))
      .sort((a: any, b: any) => b.completions - a.completions)
      .slice(0, 5);

    const insights = await generateAnalyticsInsights({
      totalUsers,
      activeUsers,
      totalCourses,
      avgCompletion,
      avgScore,
      topCourses,
      recentTrends: [], // TODO: calculate from timestamps
    });

    return res.json({ insights, stats: { totalUsers, activeUsers, totalCourses, avgCompletion, avgScore } });
  } catch (error: any) {
    console.error('[AI] Insights error:', error);
    return res.status(500).json({ error: 'Failed to generate insights' });
  }
}

// ─── Lesson Content Generation ───────────────────────────────

export async function generateContent(req: Request, res: Response) {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const { topic, courseTitle, lessonTitle, context, blockCount = 4 } = req.body;
    if (!topic || !courseTitle) {
      return res.status(400).json({ error: 'topic and courseTitle are required' });
    }

    const content = await generateLessonContent(
      topic,
      courseTitle,
      lessonTitle || 'Lección',
      context || '',
      Math.min(blockCount, 8),
    );

    if (!content) {
      return res.status(500).json({ error: 'No se pudo generar el contenido' });
    }

    return res.json({ content });
  } catch (error: any) {
    console.error('[AI] Content generation error:', error);
    return res.status(500).json({ error: 'Failed to generate content' });
  }
}

// ─── Document Upload & Extraction ────────────────────────────

export async function extractFromDocument(req: Request, res: Response) {
  try {
    if (!isGeminiConfigured()) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    const file = (req as any).file;
    const { courseTitle, generateQuestions, generateStructure, blockCount } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!courseTitle) {
      return res.status(400).json({ error: 'courseTitle is required' });
    }

    // Extract text from the uploaded file
    let documentText = '';
    const mimeType = file.mimetype;
    const buffer = file.buffer as Buffer;

    if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
      documentText = buffer.toString('utf-8');
    } else if (mimeType === 'text/html') {
      // Strip HTML tags for plain text
      documentText = buffer.toString('utf-8').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } else if (mimeType === 'application/pdf') {
      // Dynamic import pdf-parse for PDF extraction
      try {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        documentText = pdfData.text;
      } catch (pdfError) {
        console.error('[AI] PDF parsing error:', pdfError);
        return res.status(400).json({ 
          error: 'Error al procesar PDF. Asegúrate de que el archivo no esté protegido.',
          details: 'pdf-parse library may not be installed. Run: npm install pdf-parse' 
        });
      }
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      // Dynamic import mammoth for Word document extraction  
      try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        documentText = result.value;
      } catch (docError) {
        console.error('[AI] DOCX parsing error:', docError);
        return res.status(400).json({ 
          error: 'Error al procesar documento Word.',
          details: 'mammoth library may not be installed. Run: npm install mammoth'
        });
      }
    } else {
      return res.status(400).json({ 
        error: `Tipo de archivo no soportado: ${mimeType}. Formatos válidos: PDF, DOCX, TXT, MD, HTML` 
      });
    }

    if (!documentText || documentText.trim().length < 50) {
      return res.status(400).json({ error: 'El documento no contiene suficiente texto para procesar' });
    }

    console.log(`[AI] Extracting content from document: ${file.originalname} (${documentText.length} chars)`);

    const extracted = await extractContentFromDocument(
      documentText,
      courseTitle,
      {
        generateQuestions: generateQuestions !== 'false',
        generateStructure: generateStructure !== 'false',
        blockCount: blockCount ? parseInt(blockCount) : 6,
      },
    );

    if (!extracted) {
      return res.status(500).json({ error: 'No se pudo extraer contenido del documento' });
    }

    return res.json({ 
      extracted,
      documentInfo: {
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        textLength: documentText.length,
      }
    });
  } catch (error: any) {
    console.error('[AI] Document extraction error:', error);
    return res.status(500).json({ error: 'Failed to extract content from document' });
  }
}
