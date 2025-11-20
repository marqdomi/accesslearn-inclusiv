/**
 * Library Functions - Gestión de biblioteca de cursos y re-intentos
 */

import { getContainer } from '../services/cosmosdb.service';
import { UserProgress, CourseAttempt } from '../models/User';

/**
 * Obtener biblioteca del usuario (todos sus cursos)
 */
export async function getUserLibrary(
  userId: string,
  tenantId: string
): Promise<UserProgress[]> {
  const container = getContainer('user-progress');

  const query = {
    query: 'SELECT * FROM c WHERE c.userId = @userId AND c.tenantId = @tenantId ORDER BY c.lastAccessedAt DESC',
    parameters: [
      { name: '@userId', value: userId },
      { name: '@tenantId', value: tenantId },
    ],
  };

  const { resources } = await container.items.query<UserProgress>(query).fetchAll();
  return resources;
}

/**
 * Obtener historial de intentos de un curso específico
 */
export async function getCourseAttempts(
  userId: string,
  tenantId: string,
  courseId: string
): Promise<CourseAttempt[]> {
  const container = getContainer('user-progress');

  const query = {
    query: 'SELECT * FROM c WHERE c.userId = @userId AND c.tenantId = @tenantId AND c.courseId = @courseId',
    parameters: [
      { name: '@userId', value: userId },
      { name: '@tenantId', value: tenantId },
      { name: '@courseId', value: courseId },
    ],
  };

  const { resources } = await container.items.query<UserProgress>(query).fetchAll();
  
  if (resources.length === 0) {
    return [];
  }

  return resources[0].attempts || [];
}

/**
 * Calcular XP diferencial para re-intento
 * Solo otorga XP por la mejora respecto al mejor intento anterior
 */
export function calculateDifferentialXP(
  newScore: number,
  bestPreviousScore: number,
  totalCourseXP: number = 500
): {
  xpEarned: number;
  breakdown: {
    improvement: number;
    improvementXP: number;
    persistenceBonus: number;
    total: number;
  };
} {
  // Si el nuevo score es peor o igual, no hay XP de mejora
  const improvement = Math.max(0, newScore - bestPreviousScore);
  
  // XP proporcional a la mejora
  const improvementXP = Math.floor((improvement / 100) * totalCourseXP);
  
  // Bonus por persistencia (25 XP por intentarlo de nuevo)
  const persistenceBonus = improvement > 0 ? 25 : 0;
  
  const total = improvementXP + persistenceBonus;

  return {
    xpEarned: total,
    breakdown: {
      improvement,
      improvementXP,
      persistenceBonus,
      total,
    },
  };
}

/**
 * Iniciar un nuevo intento de curso
 */
export async function startCourseRetake(
  userId: string,
  tenantId: string,
  courseId: string
): Promise<UserProgress> {
  const container = getContainer('user-progress');

  const query = {
    query: 'SELECT * FROM c WHERE c.userId = @userId AND c.tenantId = @tenantId AND c.courseId = @courseId',
    parameters: [
      { name: '@userId', value: userId },
      { name: '@tenantId', value: tenantId },
      { name: '@courseId', value: courseId },
    ],
  };

  const { resources } = await container.items.query<UserProgress>(query).fetchAll();

  let progressData: UserProgress;

  if (resources.length === 0) {
    // Primer intento - crear nuevo registro
    progressData = {
      id: `progress-${userId}-${courseId}`,
      userId,
      tenantId,
      courseId,
      status: 'in-progress',
      progress: 0,
      lastAccessedAt: new Date().toISOString(),
      completedLessons: [],
      quizScores: [],
      certificateEarned: false,
      attempts: [],
      bestScore: 0,
      totalXpEarned: 0,
      currentAttempt: 1,
    };
  } else {
    // Re-intento - actualizar registro existente
    progressData = resources[0];
    progressData.status = 'in-progress'; // Marcar como en progreso al reintentar
    progressData.currentAttempt = (progressData.currentAttempt || progressData.attempts?.length || 0) + 1;
    progressData.lastAccessedAt = new Date().toISOString();
  }

  // Crear nuevo intento
  const newAttempt: CourseAttempt = {
    attemptNumber: progressData.currentAttempt,
    startedAt: new Date().toISOString(),
    finalScore: 0,
    xpEarned: 0,
    completedLessons: [],
    quizScores: [],
  };

  if (!progressData.attempts) {
    progressData.attempts = [];
  }
  progressData.attempts.push(newAttempt);

  await container.items.upsert(progressData);
  return progressData;
}

/**
 * Completar un intento de curso
 */
export async function completeCourseAttempt(
  userId: string,
  tenantId: string,
  courseId: string,
  finalScore: number,
  completedLessons: string[],
  quizScores: { quizId: string; score: number; completedAt: string }[]
): Promise<{
  progress: UserProgress;
  xpAwarded: {
    xpEarned: number;
    breakdown: {
      improvement: number;
      improvementXP: number;
      persistenceBonus: number;
      total: number;
    };
  };
}> {
  const container = getContainer('user-progress');

  const query = {
    query: 'SELECT * FROM c WHERE c.userId = @userId AND c.tenantId = @tenantId AND c.courseId = @courseId',
    parameters: [
      { name: '@userId', value: userId },
      { name: '@tenantId', value: tenantId },
      { name: '@courseId', value: courseId },
    ],
  };

  const { resources } = await container.items.query<UserProgress>(query).fetchAll();

  if (resources.length === 0) {
    throw new Error('No se encontró progreso del curso');
  }

  const progressData = resources[0];
  const currentAttemptNumber = progressData.currentAttempt;
  const attemptIndex = progressData.attempts.findIndex(
    (a) => a.attemptNumber === currentAttemptNumber
  );

  if (attemptIndex === -1) {
    throw new Error('No se encontró el intento actual');
  }

  // Calcular XP diferencial
  const bestPreviousScore = progressData.bestScore || 0;
  const xpCalculation = calculateDifferentialXP(finalScore, bestPreviousScore);

  // Actualizar el intento actual
  progressData.attempts[attemptIndex].completedAt = new Date().toISOString();
  progressData.attempts[attemptIndex].finalScore = finalScore;
  progressData.attempts[attemptIndex].xpEarned = xpCalculation.xpEarned;
  progressData.attempts[attemptIndex].completedLessons = completedLessons;
  progressData.attempts[attemptIndex].quizScores = quizScores;

  // Actualizar best score y progress si mejoró
  if (finalScore > progressData.bestScore) {
    progressData.bestScore = finalScore;
    progressData.progress = finalScore;
  }

  // Acumular XP total
  progressData.totalXpEarned = (progressData.totalXpEarned || 0) + xpCalculation.xpEarned;

  // Marcar como completado cuando el intento termine
  progressData.status = 'completed';

  // Si llegó a 100%, marcar certificado como ganado
  if (finalScore >= 100 && !progressData.certificateEarned) {
    progressData.certificateEarned = true;
    progressData.certificateId = `cert-${userId}-${courseId}-${Date.now()}`;
  }

  // Actualizar lecciones y quizzes acumulativos
  progressData.completedLessons = [
    ...new Set([...progressData.completedLessons, ...completedLessons]),
  ];
  
  progressData.quizScores = quizScores.map((newQuiz) => {
    const existingQuiz = progressData.quizScores.find((q) => q.quizId === newQuiz.quizId);
    if (existingQuiz) {
      return {
        ...existingQuiz,
        score: Math.max(existingQuiz.score, newQuiz.score),
        attempts: existingQuiz.attempts + 1,
        completedAt: newQuiz.completedAt,
      };
    }
    return {
      ...newQuiz,
      attempts: 1,
    };
  });

  progressData.lastAccessedAt = new Date().toISOString();

  await container.items.upsert(progressData);

  return {
    progress: progressData,
    xpAwarded: xpCalculation,
  };
}
