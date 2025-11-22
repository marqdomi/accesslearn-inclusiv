/**
 * Quiz Attempt Functions
 * 
 * Manages quiz attempts stored in Cosmos DB
 */

import { getContainer } from '../services/cosmosdb.service'
import { ulid } from 'ulid'

export interface QuizAttempt {
  id: string
  tenantId: string
  userId: string
  courseId: string
  quizId: string
  score: number
  answers: Array<{
    questionId: string
    selectedAnswer: number | number[] | string
    correct: boolean
  }>
  completedAt: number
  createdAt: string
  updatedAt: string
}

/**
 * Create a new quiz attempt
 */
export async function createQuizAttempt(
  tenantId: string,
  userId: string,
  courseId: string,
  quizId: string,
  score: number,
  answers: Array<{
    questionId: string
    selectedAnswer: number | number[] | string
    correct: boolean
  }>
): Promise<QuizAttempt> {
  const container = getContainer('quiz-attempts')

  const now = new Date().toISOString()
  const attempt: QuizAttempt = {
    id: ulid(),
    tenantId,
    userId,
    courseId,
    quizId,
    score,
    answers,
    completedAt: Date.now(),
    createdAt: now,
    updatedAt: now
  }

  await container.items.create(attempt)

  return attempt
}

/**
 * Get all quiz attempts for a user
 */
export async function getUserQuizAttempts(
  tenantId: string,
  userId: string,
  quizId?: string
): Promise<QuizAttempt[]> {
  const container = getContainer('quiz-attempts')

  let query = 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.userId = @userId'
  const parameters: any[] = [
    { name: '@tenantId', value: tenantId },
    { name: '@userId', value: userId }
  ]

  if (quizId) {
    query += ' AND c.quizId = @quizId'
    parameters.push({ name: '@quizId', value: quizId })
  }

  query += ' ORDER BY c.completedAt DESC'

  const { resources } = await container.items
    .query({ query, parameters })
    .fetchAll()

  return resources.map((r: any) => ({
    id: r.id,
    tenantId: r.tenantId,
    userId: r.userId,
    courseId: r.courseId,
    quizId: r.quizId,
    score: r.score,
    answers: r.answers || [],
    completedAt: r.completedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }))
}

/**
 * Get all quiz attempts for a quiz
 */
export async function getQuizAttemptsByQuiz(
  tenantId: string,
  quizId: string
): Promise<QuizAttempt[]> {
  const container = getContainer('quiz-attempts')

  const { resources } = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.quizId = @quizId ORDER BY c.completedAt DESC',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@quizId', value: quizId }
      ]
    })
    .fetchAll()

  return resources.map((r: any) => ({
    id: r.id,
    tenantId: r.tenantId,
    userId: r.userId,
    courseId: r.courseId,
    quizId: r.quizId,
    score: r.score,
    answers: r.answers || [],
    completedAt: r.completedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }))
}

/**
 * Get all quiz attempts for a course
 */
export async function getCourseQuizAttempts(
  tenantId: string,
  courseId: string,
  userId?: string
): Promise<QuizAttempt[]> {
  const container = getContainer('quiz-attempts')

  let query = 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.courseId = @courseId'
  const parameters: any[] = [
    { name: '@tenantId', value: tenantId },
    { name: '@courseId', value: courseId }
  ]

  if (userId) {
    query += ' AND c.userId = @userId'
    parameters.push({ name: '@userId', value: userId })
  }

  query += ' ORDER BY c.completedAt DESC'

  const { resources } = await container.items
    .query({ query, parameters })
    .fetchAll()

  return resources.map((r: any) => ({
    id: r.id,
    tenantId: r.tenantId,
    userId: r.userId,
    courseId: r.courseId,
    quizId: r.quizId,
    score: r.score,
    answers: r.answers || [],
    completedAt: r.completedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }))
}

/**
 * Get best score for a user on a quiz
 */
export async function getBestQuizScore(
  tenantId: string,
  userId: string,
  quizId: string
): Promise<number> {
  const attempts = await getUserQuizAttempts(tenantId, userId, quizId)
  
  if (attempts.length === 0) {
    return 0
  }

  return Math.max(...attempts.map(a => a.score))
}

/**
 * Get quiz attempt statistics
 */
export async function getQuizAttemptStats(
  tenantId: string,
  quizId: string
): Promise<{
  totalAttempts: number
  averageScore: number
  passRate: number
  uniqueUsers: number
}> {
  const attempts = await getQuizAttemptsByQuiz(tenantId, quizId)

  const totalAttempts = attempts.length
  const uniqueUsers = new Set(attempts.map(a => a.userId)).size

  const averageScore = totalAttempts > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
    : 0

  // Assuming passing score is 70
  const passingScore = 70
  const passRate = totalAttempts > 0
    ? Math.round((attempts.filter(a => a.score >= passingScore).length / totalAttempts) * 100)
    : 0

  return {
    totalAttempts,
    averageScore,
    passRate,
    uniqueUsers
  }
}

