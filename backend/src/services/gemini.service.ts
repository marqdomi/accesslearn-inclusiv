/**
 * Gemini AI Service
 * 
 * Centralized service for all AI features using Google Gemini API (free tier).
 * Model: gemini-2.0-flash (fast, free, 15 RPM / 1M TPM / 1500 req/day)
 * 
 * Features:
 * - Course recommendations
 * - Quiz generation from course content
 * - Course summary generation
 * - Learning assistant chat
 * - Analytics insights
 */

import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  if (!model) {
    model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });
  }
  return model;
}

// ─── Course Recommendations ───────────────────────────────────

interface UserLearningProfile {
  completedCourses: { title: string; category: string; score?: number }[];
  inProgressCourses: { title: string; category: string; progress: number }[];
  interests: string[];
  role: string;
}

interface CourseOption {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  tags: string[];
}

export interface CourseRecommendation {
  courseId: string;
  reason: string;
  relevanceScore: number;
}

export async function getAICourseRecommendations(
  userProfile: UserLearningProfile,
  availableCourses: CourseOption[],
  limit: number = 5,
): Promise<CourseRecommendation[]> {
  const m = getModel();

  const prompt = `Eres un sistema de recomendación de cursos para una plataforma de aprendizaje corporativo inclusiva.

PERFIL DEL USUARIO:
- Rol: ${userProfile.role}
- Cursos completados: ${JSON.stringify(userProfile.completedCourses)}
- Cursos en progreso: ${JSON.stringify(userProfile.inProgressCourses)}
- Intereses: ${userProfile.interests.join(', ') || 'No especificados'}

CURSOS DISPONIBLES:
${availableCourses.map(c => `- ID: ${c.id} | "${c.title}" | Categoría: ${c.category} | Nivel: ${c.level} | Tags: ${c.tags.join(', ')}`).join('\n')}

Recomienda los ${limit} cursos más relevantes para este usuario. Para cada uno, explica brevemente por qué lo recomiendas (en español, máximo 1 oración). Asigna un score de relevancia de 0 a 100.

Responde SOLO con JSON válido, sin markdown, sin backticks:
[{"courseId": "...", "reason": "...", "relevanceScore": 85}]`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as CourseRecommendation[];
  } catch (error) {
    console.error('[GeminiService] Recommendations error:', error);
    return [];
  }
}

// ─── Quiz Generation ──────────────────────────────────────────

export interface GeneratedQuizQuestion {
  question: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export async function generateQuizFromContent(
  courseTitle: string,
  content: string,
  questionCount: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
): Promise<GeneratedQuizQuestion[]> {
  const m = getModel();

  const prompt = `Eres un experto en diseño instruccional. Genera un quiz basado en el siguiente contenido de curso.

CURSO: "${courseTitle}"
DIFICULTAD: ${difficulty}
CANTIDAD DE PREGUNTAS: ${questionCount}

CONTENIDO:
${content.slice(0, 8000)}

Genera preguntas variadas (multiple-choice y true-false). Para multiple-choice, incluye 4 opciones. Todas las preguntas y opciones van en español.

Responde SOLO con JSON válido, sin markdown, sin backticks:
[{"question": "...", "type": "multiple-choice", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..."}]`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as GeneratedQuizQuestion[];
  } catch (error) {
    console.error('[GeminiService] Quiz generation error:', error);
    return [];
  }
}

// ─── Course Summary ──────────────────────────────────────────

export interface CourseSummary {
  summary: string;
  keyTopics: string[];
  learningObjectives: string[];
  estimatedDuration: string;
  targetAudience: string;
}

export async function generateCourseSummary(
  courseTitle: string,
  courseDescription: string,
  modulesTitles: string[],
  lessonsContent: string,
): Promise<CourseSummary | null> {
  const m = getModel();

  const prompt = `Eres un especialista en e-learning. Genera un resumen ejecutivo de este curso.

CURSO: "${courseTitle}"
DESCRIPCIÓN ORIGINAL: ${courseDescription}
MÓDULOS: ${modulesTitles.join(', ')}
CONTENIDO DE LECCIONES (extracto):
${lessonsContent.slice(0, 6000)}

Genera un resumen atractivo que invite a inscribirse, identifica los temas clave, objetivos de aprendizaje, duración estimada y audiencia objetivo. Todo en español.

Responde SOLO con JSON válido, sin markdown, sin backticks:
{"summary": "...", "keyTopics": ["..."], "learningObjectives": ["..."], "estimatedDuration": "...", "targetAudience": "..."}`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as CourseSummary;
  } catch (error) {
    console.error('[GeminiService] Summary generation error:', error);
    return null;
  }
}

// ─── Learning Assistant Chat ─────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithAssistant(
  courseContext: { title: string; description: string; content: string },
  conversationHistory: ChatMessage[],
  userMessage: string,
): Promise<string> {
  const m = getModel();

  const historyText = conversationHistory
    .slice(-6) // Only last 6 messages for context window
    .map(msg => `${msg.role === 'user' ? 'Estudiante' : 'Asistente'}: ${msg.content}`)
    .join('\n');

  const prompt = `Eres un asistente de aprendizaje amigable e inclusivo para la plataforma "AccessLearn". Ayudas a estudiantes con dudas sobre el contenido de sus cursos. Responde siempre en español, de forma clara y concisa.

CONTEXTO DEL CURSO:
Título: "${courseContext.title}"
Descripción: ${courseContext.description}
Contenido relevante: ${courseContext.content.slice(0, 4000)}

HISTORIAL DE CONVERSACIÓN:
${historyText || '(primera interacción)'}

Estudiante: ${userMessage}

Responde de forma útil, breve y amigable. Si la pregunta no está relacionada con el curso, redirige amablemente al tema. Máximo 200 palabras.`;

  try {
    const result = await m.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('[GeminiService] Chat error:', error);
    return 'Lo siento, tuve un problema al procesar tu pregunta. ¿Podrías intentar de nuevo?';
  }
}

// ─── Analytics Insights ──────────────────────────────────────

export interface AnalyticsInsight {
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'suggestion';
  metric?: string;
}

export async function generateAnalyticsInsights(
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalCourses: number;
    avgCompletion: number;
    avgScore: number;
    topCourses: { title: string; completions: number }[];
    recentTrends: { period: string; enrollments: number; completions: number }[];
  },
): Promise<AnalyticsInsight[]> {
  const m = getModel();

  const prompt = `Eres un analista de datos de una plataforma de aprendizaje corporativo. Analiza las siguientes métricas y genera insights accionables.

MÉTRICAS:
- Usuarios totales: ${stats.totalUsers}
- Usuarios activos: ${stats.activeUsers}
- Cursos publicados: ${stats.totalCourses}
- Tasa de completación promedio: ${stats.avgCompletion}%
- Score promedio: ${stats.avgScore}%
- Cursos más populares: ${JSON.stringify(stats.topCourses)}
- Tendencias recientes: ${JSON.stringify(stats.recentTrends)}

Genera 3-5 insights en español. Cada insight debe ser accionable y relevante para un administrador de la plataforma.

Responde SOLO con JSON válido, sin markdown, sin backticks:
[{"title": "...", "description": "...", "type": "positive|warning|suggestion", "metric": "..."}]`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as AnalyticsInsight[];
  } catch (error) {
    console.error('[GeminiService] Analytics insights error:', error);
    return [];
  }
}

// ─── Lesson Content Generation ──────────────────────────────

export interface GeneratedLessonBlock {
  type: 'text' | 'challenge';
  content: string;
  characterMessage?: string;
}

export interface GeneratedLessonContent {
  blocks: GeneratedLessonBlock[];
  suggestedTitle?: string;
}

export async function generateLessonContent(
  topic: string,
  courseTitle: string,
  lessonTitle: string,
  context: string = '',
  blockCount: number = 4,
): Promise<GeneratedLessonContent | null> {
  const m = getModel();

  const prompt = `Eres un diseñador instruccional experto. Genera contenido de lección para una plataforma de e-learning inclusiva.

CURSO: "${courseTitle}"
LECCIÓN: "${lessonTitle}"
TEMA/PROMPT DEL USUARIO: "${topic}"
${context ? `CONTEXTO ADICIONAL:\n${context.slice(0, 4000)}` : ''}
CANTIDAD DE BLOQUES: ${blockCount}

Genera ${blockCount} bloques de contenido educativo en español. Incluye:
- Bloques de tipo "text" con contenido HTML rico (usa <h3>, <p>, <ul>, <ol>, <strong>, <em>, <blockquote>)
- Opcionalmente 1 bloque de tipo "challenge" con un ejercicio práctico
- Cada bloque puede tener un "characterMessage" opcional (mensaje motivacional corto del personaje guía)

El contenido debe ser:
- Claro, inclusivo y accesible
- Progresivo (de conceptos básicos a avanzados)
- Con ejemplos prácticos
- Bien estructurado con subtítulos

Responde SOLO con JSON válido, sin markdown, sin backticks:
{"blocks": [{"type": "text", "content": "<h3>...</h3><p>...</p>", "characterMessage": "..."}, ...], "suggestedTitle": "..."}`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as GeneratedLessonContent;
  } catch (error) {
    console.error('[GeminiService] Lesson content generation error:', error);
    return null;
  }
}

// ─── Document Content Extraction ────────────────────────────

export interface ExtractedContent {
  summary: string;
  blocks: GeneratedLessonBlock[];
  suggestedQuestions: Array<{
    question: string;
    type: 'multiple-choice' | 'true-false';
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
  keyTopics: string[];
  suggestedModules: Array<{
    title: string;
    lessons: string[];
  }>;
}

export async function extractContentFromDocument(
  documentText: string,
  courseTitle: string,
  options: { generateQuestions?: boolean; generateStructure?: boolean; blockCount?: number } = {},
): Promise<ExtractedContent | null> {
  const m = getModel();
  const { generateQuestions = true, generateStructure = true, blockCount = 6 } = options;

  const prompt = `Eres un experto en diseño instruccional y creación de contenido e-learning. A partir del siguiente texto extraído de un documento, genera contenido educativo estructurado.

CURSO: "${courseTitle}"
TEXTO DEL DOCUMENTO:
${documentText.slice(0, 12000)}

INSTRUCCIONES:
1. Genera un resumen ejecutivo del documento (2-3 oraciones)
2. Crea ${blockCount} bloques de contenido educativo en HTML (usa <h3>, <p>, <ul>, <ol>, <strong>, <em>)
3. ${generateQuestions ? 'Genera 5 preguntas de evaluación basadas en el contenido' : 'No generes preguntas'}
4. Identifica los temas clave (máximo 8)
5. ${generateStructure ? 'Sugiere una estructura de módulos y lecciones para organizar este contenido' : 'No sugieras estructura'}

Todo el contenido debe ser en español, claro, inclusivo y accesible.

Responde SOLO con JSON válido, sin markdown, sin backticks:
{
  "summary": "...",
  "blocks": [{"type": "text", "content": "<h3>...</h3><p>...</p>", "characterMessage": "..."}],
  "suggestedQuestions": ${generateQuestions ? '[{"question": "...", "type": "multiple-choice", "options": ["A","B","C","D"], "correctAnswer": "A", "explanation": "..."}]' : '[]'},
  "keyTopics": ["..."],
  "suggestedModules": ${generateStructure ? '[{"title": "...", "lessons": ["..."]}]' : '[]'}
}`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]) as ExtractedContent;
  } catch (error) {
    console.error('[GeminiService] Document extraction error:', error);
    return null;
  }
}

// ─── Service health check ────────────────────────────────────

export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY;
}

export async function testGeminiConnection(): Promise<{ ok: boolean; model: string; error?: string }> {
  try {
    const m = getModel();
    const result = await m.generateContent('Responde solo con "OK"');
    const text = result.response.text().trim();
    return { ok: text.toLowerCase().includes('ok'), model: 'gemini-2.0-flash' };
  } catch (error: any) {
    return { ok: false, model: 'gemini-2.0-flash', error: error.message };
  }
}
