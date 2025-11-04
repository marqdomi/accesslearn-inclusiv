import { DB } from '@github/spark/db'
import { UserAchievementSchema, UserStatsSchema, XPEventSchema, type UserAchievement, type UserStats, type XPEvent } from '@/schemas/progress.schema'

const ACHIEVEMENTS_COLLECTION = 'user-achievements'
const STATS_COLLECTION = 'user-stats'
const XP_EVENTS_COLLECTION = 'xp-events'

/**
 * Achievement Service
 * Manages user achievements, stats, and XP
 */
class AchievementServiceClass {
  private db: DB

  constructor() {
    this.db = new DB()
  }

  // ========== User Achievements ==========

  /**
   * Get all achievements for a user
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const allAchievements = await this.db.getAll<Omit<UserAchievement, 'id'>>(ACHIEVEMENTS_COLLECTION)
    return allAchievements.filter(a => a.userId === userId)
  }

  /**
   * Unlock an achievement for a user
   */
  async unlockAchievement(userId: string, achievementId: string, progress?: number): Promise<UserAchievement> {
    // Check if already unlocked
    const existing = await this.getUserAchievements(userId)
    const alreadyUnlocked = existing.find(a => a.achievementId === achievementId)
    
    if (alreadyUnlocked) {
      return alreadyUnlocked
    }

    const newAchievement = await this.db.insert(
      ACHIEVEMENTS_COLLECTION,
      UserAchievementSchema.omit({ id: true }),
      {
        userId,
        achievementId,
        unlockedAt: Date.now(),
        progress,
      }
    )
    return newAchievement
  }

  /**
   * Check if a user has an achievement
   */
  async hasAchievement(userId: string, achievementId: string): Promise<boolean> {
    const achievements = await this.getUserAchievements(userId)
    return achievements.some(a => a.achievementId === achievementId)
  }

  // ========== User Stats ==========

  /**
   * Get user stats
   */
  async getUserStats(userId: string): Promise<UserStats | null> {
    return await this.db.get<Omit<UserStats, 'id'>>(STATS_COLLECTION, userId)
  }

  /**
   * Create initial stats for a user
   */
  async createUserStats(userId: string): Promise<UserStats> {
    const newStats = await this.db.insert(
      STATS_COLLECTION,
      UserStatsSchema.omit({ id: true }),
      {
        id: userId, // Use userId as the stats ID
        totalCoursesCompleted: 0,
        totalModulesCompleted: 0,
        totalAssessmentsPassed: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: Date.now(),
        totalXP: 0,
        level: 1,
      }
    )
    return newStats
  }

  /**
   * Get or create user stats
   */
  async getOrCreateUserStats(userId: string): Promise<UserStats> {
    const existing = await this.getUserStats(userId)
    if (existing) {
      return existing
    }
    return await this.createUserStats(userId)
  }

  /**
   * Update user stats
   */
  async updateUserStats(userId: string, updates: Partial<Omit<UserStats, 'id'>>): Promise<UserStats> {
    const stats = await this.getOrCreateUserStats(userId)
    
    const updated = await this.db.update(
      STATS_COLLECTION,
      userId,
      UserStatsSchema.omit({ id: true }),
      updates
    )
    return updated!
  }

  /**
   * Add XP to user
   */
  async addXP(userId: string, amount: number, type: XPEvent['type'], label: string): Promise<UserStats> {
    const stats = await this.getOrCreateUserStats(userId)
    
    const newTotalXP = stats.totalXP + amount
    const newLevel = this.calculateLevel(newTotalXP)

    // Record the XP event
    await this.db.insert(
      XP_EVENTS_COLLECTION,
      XPEventSchema.omit({ id: true }),
      {
        userId,
        type,
        amount,
        timestamp: Date.now(),
        label,
      }
    )

    // Update stats
    return await this.updateUserStats(userId, {
      totalXP: newTotalXP,
      level: newLevel,
      lastActivityDate: Date.now(),
    })
  }

  /**
   * Calculate level from total XP
   */
  private calculateLevel(totalXP: number): number {
    // Levels 1-5: Fast progression (100 XP × 1.5^level)
    // Levels 6-20: Moderate scaling (+200 XP per level)
    // Levels 21+: Linear scaling (+500 XP per level)
    
    let level = 1
    let xpRequired = 0
    let xpForNextLevel = 100

    while (totalXP >= xpRequired + xpForNextLevel) {
      xpRequired += xpForNextLevel
      level++

      if (level <= 5) {
        xpForNextLevel = Math.floor(100 * Math.pow(1.5, level))
      } else if (level <= 20) {
        xpForNextLevel = 200
      } else {
        xpForNextLevel = 500
      }
    }

    return level
  }

  /**
   * Get XP events for a user
   */
  async getXPEvents(userId: string, limit?: number): Promise<XPEvent[]> {
    const allEvents = await this.db.getAll<Omit<XPEvent, 'id'>>(XP_EVENTS_COLLECTION)
    const userEvents = allEvents
      .filter(e => e.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)

    return limit ? userEvents.slice(0, limit) : userEvents
  }

  /**
   * Increment course completion count
   */
  async incrementCoursesCompleted(userId: string): Promise<UserStats> {
    const stats = await this.getOrCreateUserStats(userId)
    return await this.updateUserStats(userId, {
      totalCoursesCompleted: stats.totalCoursesCompleted + 1,
    })
  }

  /**
   * Increment module completion count
   */
  async incrementModulesCompleted(userId: string): Promise<UserStats> {
    const stats = await this.getOrCreateUserStats(userId)
    return await this.updateUserStats(userId, {
      totalModulesCompleted: stats.totalModulesCompleted + 1,
    })
  }

  /**
   * Update streak
   */
  async updateStreak(userId: string, currentStreak: number): Promise<UserStats> {
    const stats = await this.getOrCreateUserStats(userId)
    const longestStreak = Math.max(stats.longestStreak, currentStreak)
    
    return await this.updateUserStats(userId, {
      currentStreak,
      longestStreak,
      lastActivityDate: Date.now(),
    })
  }
}

// Export singleton instance
export const AchievementService = new AchievementServiceClass()
