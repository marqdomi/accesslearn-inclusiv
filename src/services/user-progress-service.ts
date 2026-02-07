/**
 * User Progress Service
 * 
 * Manages user progress on courses with proper data scoping
 */

import { UserScopedService, DataValidator } from './base-service'
import { UserProgress } from '@/lib/types'

interface UserProgressRecord extends UserProgress {
  id: string
  userId: string
}

class UserProgressServiceClass extends UserScopedService<UserProgressRecord> {
  constructor() {
    super('user-progress')
  }

  /**
   * Get user's progress for a specific course
   */
  async getUserCourseProgress(userId: string, courseId: string): Promise<UserProgress | null> {
    const records = await this.find(p => p.userId === userId && p.courseId === courseId)
    return records.length > 0 ? records[0] : null
  }

  /**
   * Get all progress for a user
   */
  async getUserProgress(userId: string): Promise<Record<string, UserProgress>> {
    const records = await this.getByUserId(userId)
    const progress: Record<string, UserProgress> = {}
    
    records.forEach(record => {
      progress[record.courseId] = {
        courseId: record.courseId,
        status: record.status,
        completedModules: record.completedModules,
        currentModule: record.currentModule,
        lastAccessed: record.lastAccessed,
        assessmentScore: record.assessmentScore,
        assessmentAttempts: record.assessmentAttempts
      }
    })
    
    return progress
  }

  /**
   * Update or create progress
   */
  async upsertProgress(userId: string, progress: UserProgress): Promise<UserProgressRecord> {
    try {
      // Check if progress already exists
      const existing = await this.getUserCourseProgress(userId, progress.courseId)
      const id = `${userId}-${progress.courseId}`

      if (existing) {
        // Update existing progress
        const updated = await this.update(id, {
          ...progress,
          userId,
          id
        })
        return updated!
      } else {
        // Create new progress
        const newProgress: UserProgressRecord = {
          ...progress,
          userId,
          id
        }
        return await this.create(newProgress)
      }
    } catch (error) {
      console.error('Error upserting progress:', error)
      throw error
    }
  }

  /**
   * Mark module as completed
   */
  async completeModule(userId: string, courseId: string, moduleId: string): Promise<UserProgressRecord | null> {
    try {
      const progress = await this.getUserCourseProgress(userId, courseId)
      
      if (!progress) {
        // Create new progress
        return this.upsertProgress(userId, {
          courseId,
          status: 'in-progress',
          completedModules: [moduleId],
          lastAccessed: Date.now(),
          assessmentAttempts: 0
        })
      }

      // Update existing progress
      const completedModules = progress.completedModules.includes(moduleId)
        ? progress.completedModules
        : [...progress.completedModules, moduleId]

      return this.upsertProgress(userId, {
        ...progress,
        completedModules,
        status: 'in-progress',
        lastAccessed: Date.now()
      })
    } catch (error) {
      console.error('Error completing module:', error)
      return null
    }
  }

  /**
   * Mark course as completed
   */
  async completeCourse(userId: string, courseId: string, score?: number): Promise<UserProgressRecord | null> {
    try {
      const progress = await this.getUserCourseProgress(userId, courseId)
      
      if (!progress) {
        return this.upsertProgress(userId, {
          courseId,
          status: 'completed',
          completedModules: [],
          lastAccessed: Date.now(),
          assessmentScore: score,
          assessmentAttempts: 0
        })
      }

      return this.upsertProgress(userId, {
        ...progress,
        status: 'completed',
        assessmentScore: score,
        lastAccessed: Date.now()
      })
    } catch (error) {
      console.error('Error completing course:', error)
      return null
    }
  }

  /**
   * Get completion statistics for a course
   */
  async getCourseStats(courseId: string): Promise<{
    totalEnrolled: number
    completed: number
    inProgress: number
    notStarted: number
  }> {
    const all = await this.find(p => p.courseId === courseId)
    
    return {
      totalEnrolled: all.length,
      completed: all.filter(p => p.status === 'completed').length,
      inProgress: all.filter(p => p.status === 'in-progress').length,
      notStarted: all.filter(p => p.status === 'not-started').length
    }
  }
}

// Export singleton instance
export const UserProgressService = new UserProgressServiceClass()
