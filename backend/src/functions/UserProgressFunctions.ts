/**
 * User Progress Functions
 * 
 * Manages user progress for courses stored in Cosmos DB
 */

import { getContainer } from '../services/cosmosdb.service'
import { UserProgress } from '../models/User'

/**
 * Get user progress for a specific course
 */
export async function getUserProgress(
  userId: string,
  tenantId: string,
  courseId: string
): Promise<UserProgress | null> {
  const container = getContainer('user-progress')
  
  const query = {
    query: 'SELECT * FROM c WHERE c.userId = @userId AND c.tenantId = @tenantId AND c.courseId = @courseId',
    parameters: [
      { name: '@userId', value: userId },
      { name: '@tenantId', value: tenantId },
      { name: '@courseId', value: courseId }
    ]
  }
  
  const { resources } = await container.items.query<UserProgress>(query).fetchAll()
  return resources.length > 0 ? resources[0] : null
}

/**
 * Get all progress for a user
 */
export async function getAllUserProgress(
  userId: string,
  tenantId: string
): Promise<UserProgress[]> {
  const container = getContainer('user-progress')
  
  const query = {
    query: 'SELECT * FROM c WHERE c.userId = @userId AND c.tenantId = @tenantId ORDER BY c.lastAccessedAt DESC',
    parameters: [
      { name: '@userId', value: userId },
      { name: '@tenantId', value: tenantId }
    ]
  }
  
  const { resources } = await container.items.query<UserProgress>(query).fetchAll()
  return resources
}

/**
 * Get all progress for a course (all users)
 */
export async function getCourseProgress(
  courseId: string,
  tenantId: string
): Promise<UserProgress[]> {
  const container = getContainer('user-progress')
  
  const query = {
    query: 'SELECT * FROM c WHERE c.courseId = @courseId AND c.tenantId = @tenantId',
    parameters: [
      { name: '@courseId', value: courseId },
      { name: '@tenantId', value: tenantId }
    ]
  }
  
  const { resources } = await container.items.query<UserProgress>(query).fetchAll()
  return resources
}

/**
 * Create or update user progress
 */
export async function upsertUserProgress(
  progress: UserProgress
): Promise<UserProgress> {
  const container = getContainer('user-progress')
  
  // Generate ID if not present
  if (!progress.id) {
    progress.id = `progress-${progress.userId}-${progress.courseId}`
  }
  
  // Update timestamp
  progress.lastAccessedAt = new Date().toISOString()
  
  const { resource } = await container.items.upsert<UserProgress>(progress)
  return resource!
}

/**
 * Update progress percentage and status
 */
export async function updateProgress(
  userId: string,
  tenantId: string,
  courseId: string,
  progress: number,
  completedLessons?: string[]
): Promise<UserProgress> {
  const existing = await getUserProgress(userId, tenantId, courseId)
  
  const updated: UserProgress = existing || {
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
    currentAttempt: 1
  }
  
  updated.progress = Math.min(100, Math.max(0, progress))
  updated.status = updated.progress === 100 ? 'completed' : updated.progress > 0 ? 'in-progress' : 'not-started'
  
  if (completedLessons) {
    updated.completedLessons = [...new Set([...updated.completedLessons, ...completedLessons])]
  }
  
  return await upsertUserProgress(updated)
}

