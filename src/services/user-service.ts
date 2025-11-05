/**
 * User and Achievement Services
 * 
 * Manages users, achievements, and XP tracking
 */

import { BaseService, UserScopedService } from './base-service'
import { UserProfile, UserStats, UserAchievement, XPEvent } from '@/lib/types'

// Constants
export const XP_PER_LEVEL = 1000
export const DEFAULT_USER_STATS: UserStats = {
  totalCoursesCompleted: 0,
  totalModulesCompleted: 0,
  totalAssessmentsPassed: 0,
  averageScore: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: 0,
  achievementsUnlocked: [],
  totalXP: 0,
  level: 1
}

interface UserStatsRecord extends UserStats {
  id: string
  userId: string
}

interface XPEventRecord extends XPEvent {
  id: string
  userId: string
}

class UserProfileServiceClass extends BaseService<UserProfile> {
  constructor() {
    super('user-profiles')
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<UserProfile | null> {
    const users = await this.find(u => u.email.toLowerCase() === email.toLowerCase())
    return users.length > 0 ? users[0] : null
  }

  /**
   * Get users by role
   */
  async getByRole(role: 'employee' | 'admin' | 'mentor'): Promise<UserProfile[]> {
    return this.find(u => u.role === role)
  }

  /**
   * Get users by department
   */
  async getByDepartment(department: string): Promise<UserProfile[]> {
    return this.find(u => u.department === department)
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId: string): Promise<UserProfile | null> {
    return this.update(userId, {
      lastLoginAt: Date.now()
    } as Partial<UserProfile>)
  }
}

class UserStatsServiceClass extends UserScopedService<UserStatsRecord> {
  constructor() {
    super('user-stats')
  }

  /**
   * Get stats for a user (creates default if not exists)
   */
  async getUserStats(userId: string): Promise<UserStats> {
    const records = await this.getByUserId(userId)
    
    if (records.length === 0) {
      // Create default stats
      const defaultStats: UserStatsRecord = {
        ...DEFAULT_USER_STATS,
        id: userId,
        userId
      }
      await this.create(defaultStats)
      return DEFAULT_USER_STATS
    }

    const record = records[0]
    const { id, userId: _userId, ...stats } = record
    return stats
  }

  /**
   * Update user stats
   */
  async updateStats(userId: string, updates: Partial<UserStats>): Promise<UserStats> {
    try {
      const current = await this.getUserStats(userId)
      const updated: UserStatsRecord = {
        ...current,
        ...updates,
        id: userId,
        userId
      }

      await this.update(userId, updated)
      const { id, userId: _userId, ...stats } = updated
      return stats
    } catch (error) {
      console.error('Error updating user stats:', error)
      throw error
    }
  }

  /**
   * Add XP to user
   */
  async addXP(userId: string, amount: number): Promise<UserStats> {
    const stats = await this.getUserStats(userId)
    const newTotalXP = stats.totalXP + amount
    const newLevel = Math.floor(newTotalXP / XP_PER_LEVEL) + 1

    return this.updateStats(userId, {
      totalXP: newTotalXP,
      level: newLevel,
      lastActivityDate: Date.now()
    })
  }

  /**
   * Unlock achievement
   */
  async unlockAchievement(
    userId: string,
    achievementId: string,
    progress?: number
  ): Promise<UserStats> {
    const stats = await this.getUserStats(userId)
    
    // Check if already unlocked
    if (stats.achievementsUnlocked.some(a => a.achievementId === achievementId)) {
      return stats
    }

    const achievement: UserAchievement = {
      achievementId,
      unlockedAt: Date.now(),
      progress
    }

    return this.updateStats(userId, {
      achievementsUnlocked: [...stats.achievementsUnlocked, achievement],
      lastActivityDate: Date.now()
    })
  }

  /**
   * Complete module
   */
  async completeModule(userId: string): Promise<UserStats> {
    const stats = await this.getUserStats(userId)
    return this.updateStats(userId, {
      totalModulesCompleted: stats.totalModulesCompleted + 1,
      lastActivityDate: Date.now()
    })
  }

  /**
   * Complete course
   */
  async completeCourse(userId: string, score?: number): Promise<UserStats> {
    const stats = await this.getUserStats(userId)
    
    const newTotalCompleted = stats.totalCoursesCompleted + 1
    const newAverageScore = score !== undefined
      ? (stats.averageScore * stats.totalCoursesCompleted + score) / newTotalCompleted
      : stats.averageScore

    return this.updateStats(userId, {
      totalCoursesCompleted: newTotalCompleted,
      averageScore: newAverageScore,
      lastActivityDate: Date.now()
    })
  }

  /**
   * Pass assessment
   */
  async passAssessment(userId: string): Promise<UserStats> {
    const stats = await this.getUserStats(userId)
    return this.updateStats(userId, {
      totalAssessmentsPassed: stats.totalAssessmentsPassed + 1,
      lastActivityDate: Date.now()
    })
  }

  /**
   * Update streak
   */
  async updateStreak(userId: string, currentStreak: number): Promise<UserStats> {
    const stats = await this.getUserStats(userId)
    const longestStreak = Math.max(stats.longestStreak, currentStreak)

    return this.updateStats(userId, {
      currentStreak,
      longestStreak,
      lastActivityDate: Date.now()
    })
  }
}

class XPEventServiceClass extends UserScopedService<XPEventRecord> {
  constructor() {
    super('xp-events')
  }

  /**
   * Record XP event
   */
  async recordEvent(userId: string, event: Omit<XPEvent, 'timestamp'>): Promise<XPEventRecord> {
    const record: XPEventRecord = {
      ...event,
      id: `${userId}-${Date.now()}`,
      userId,
      timestamp: Date.now()
    }

    return this.create(record)
  }

  /**
   * Get recent XP events for user
   */
  async getRecentEvents(userId: string, limit: number = 10): Promise<XPEvent[]> {
    const events = await this.getByUserId(userId)
    const sorted = events.sort((a, b) => b.timestamp - a.timestamp)
    const recent = sorted.slice(0, limit)

    return recent.map(({ id, userId: _userId, ...event }) => event)
  }
}

// Export singleton instances
export const UserProfileService = new UserProfileServiceClass()
export const UserStatsService = new UserStatsServiceClass()
export const XPEventService = new XPEventServiceClass()
