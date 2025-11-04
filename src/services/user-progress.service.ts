import { DB } from '@github/spark/db'
import { UserProgressSchema, type UserProgress } from '@/schemas/progress.schema'

const COLLECTION_NAME = 'user-progress'

/**
 * User Progress Service
 * Manages user progress through courses and modules
 */
class UserProgressServiceClass {
  private db: DB

  constructor() {
    this.db = new DB()
  }

  /**
   * Get all progress records for a user
   */
  async getByUserId(userId: string): Promise<UserProgress[]> {
    const allProgress = await this.db.getAll<Omit<UserProgress, 'id'>>(COLLECTION_NAME)
    return allProgress.filter(p => p.userId === userId)
  }

  /**
   * Get progress for a specific user and course
   */
  async getByUserAndCourse(userId: string, courseId: string): Promise<UserProgress | null> {
    const allProgress = await this.getByUserId(userId)
    return allProgress.find(p => p.courseId === courseId) || null
  }

  /**
   * Create or update user progress
   */
  async upsert(userId: string, courseId: string, progressData: Partial<Omit<UserProgress, 'id' | 'userId' | 'courseId'>>): Promise<UserProgress> {
    const existing = await this.getByUserAndCourse(userId, courseId)
    
    if (existing) {
      // Update existing progress
      const updated = await this.db.update(
        COLLECTION_NAME,
        existing.id,
        UserProgressSchema.omit({ id: true }),
        {
          ...progressData,
          lastAccessed: Date.now(),
        }
      )
      return updated!
    } else {
      // Create new progress record
      const newProgress = await this.db.insert(
        COLLECTION_NAME,
        UserProgressSchema.omit({ id: true }),
        {
          userId,
          courseId,
          status: 'not-started',
          completedModules: [],
          assessmentAttempts: 0,
          lastAccessed: Date.now(),
          ...progressData,
        }
      )
      return newProgress
    }
  }

  /**
   * Mark a module as completed
   */
  async completeModule(userId: string, courseId: string, moduleId: string): Promise<UserProgress> {
    const progress = await this.getByUserAndCourse(userId, courseId)
    
    if (!progress) {
      // Create new progress if it doesn't exist
      return await this.upsert(userId, courseId, {
        status: 'in-progress',
        completedModules: [moduleId],
      })
    }

    const completedModules = [...new Set([...progress.completedModules, moduleId])]
    
    return await this.upsert(userId, courseId, {
      status: 'in-progress',
      completedModules,
    })
  }

  /**
   * Mark a course as completed
   */
  async completeCourse(userId: string, courseId: string, assessmentScore?: number): Promise<UserProgress> {
    return await this.upsert(userId, courseId, {
      status: 'completed',
      assessmentScore,
    })
  }

  /**
   * Get all progress for a course (admin view)
   */
  async getByCourseId(courseId: string): Promise<UserProgress[]> {
    const allProgress = await this.db.getAll<Omit<UserProgress, 'id'>>(COLLECTION_NAME)
    return allProgress.filter(p => p.courseId === courseId)
  }

  /**
   * Delete progress record
   */
  async delete(id: string): Promise<boolean> {
    return await this.db.delete(COLLECTION_NAME, id)
  }

  /**
   * Get completion statistics for a course
   */
  async getCourseStats(courseId: string): Promise<{
    total: number
    notStarted: number
    inProgress: number
    completed: number
    averageScore: number
  }> {
    const progressRecords = await this.getByCourseId(courseId)
    
    const stats = {
      total: progressRecords.length,
      notStarted: progressRecords.filter(p => p.status === 'not-started').length,
      inProgress: progressRecords.filter(p => p.status === 'in-progress').length,
      completed: progressRecords.filter(p => p.status === 'completed').length,
      averageScore: 0,
    }

    const scoresWithValues = progressRecords
      .filter(p => p.assessmentScore !== undefined)
      .map(p => p.assessmentScore!)
    
    if (scoresWithValues.length > 0) {
      stats.averageScore = scoresWithValues.reduce((a, b) => a + b, 0) / scoresWithValues.length
    }

    return stats
  }
}

// Export singleton instance
export const UserProgressService = new UserProgressServiceClass()
