/**
 * Achievement Functions
 * 
 * Manages user achievements stored in Cosmos DB
 */

import { getContainer } from '../services/cosmosdb.service'
import { ulid } from 'ulid'

export interface UserAchievement {
  id: string
  tenantId: string
  userId: string
  achievementId: string
  unlockedAt: number
  createdAt: string
  updatedAt: string
}

export interface UserStats {
  totalCoursesCompleted: number
  totalModulesCompleted: number
  totalAssessmentsPassed: number
  averageScore: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: number
  achievementsUnlocked: UserAchievement[]
  totalXP: number
  level: number
}

/**
 * Get user achievements
 */
export async function getUserAchievements(
  tenantId: string,
  userId: string
): Promise<UserAchievement[]> {
  const container = getContainer('achievements')

  const { resources } = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.userId = @userId ORDER BY c.unlockedAt DESC',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@userId', value: userId }
      ]
    })
    .fetchAll()

  return resources.map((r: any) => ({
    id: r.id,
    tenantId: r.tenantId,
    userId: r.userId,
    achievementId: r.achievementId,
    unlockedAt: r.unlockedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }))
}

/**
 * Unlock an achievement for a user
 */
export async function unlockAchievement(
  tenantId: string,
  userId: string,
  achievementId: string
): Promise<UserAchievement> {
  const container = getContainer('achievements')

  // Check if already unlocked
  const { resources: existing } = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.userId = @userId AND c.achievementId = @achievementId',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@userId', value: userId },
        { name: '@achievementId', value: achievementId }
      ]
    })
    .fetchAll()

  if (existing.length > 0) {
    return existing[0] as UserAchievement
  }

  const now = new Date().toISOString()
  const achievement: UserAchievement = {
    id: ulid(),
    tenantId,
    userId,
    achievementId,
    unlockedAt: Date.now(),
    createdAt: now,
    updatedAt: now
  }

  await container.items.create(achievement)

  return achievement
}

/**
 * Get user stats (for achievement checking)
 */
export async function getUserStats(
  tenantId: string,
  userId: string
): Promise<UserStats> {
  const achievements = await getUserAchievements(tenantId, userId)
  
  // Get user progress data
  const progressContainer = getContainer('user-progress')
  const { resources: progressList } = await progressContainer.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.userId = @userId',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@userId', value: userId }
      ]
    })
    .fetchAll()

  // Get user data for XP and level
  const usersContainer = getContainer('users')
  const { resource: user } = await usersContainer.item(userId, tenantId).read()
  
  // Calculate stats from progress
  const totalCoursesCompleted = progressList.filter((p: any) => p.status === 'completed').length
  const totalModulesCompleted = progressList.reduce((sum: number, p: any) => sum + (p.completedLessons?.length || 0), 0)
  const totalAssessmentsPassed = progressList.reduce((sum: number, p: any) => {
    return sum + (p.quizScores?.filter((q: any) => q.score >= 70).length || 0)
  }, 0)
  
  const allScores = progressList.flatMap((p: any) => 
    (p.quizScores || []).map((q: any) => q.score)
  )
  const averageScore = allScores.length > 0
    ? Math.round(allScores.reduce((sum: number, score: number) => sum + score, 0) / allScores.length)
    : 0

  // Calculate streak (simplified - would need daily activity tracking)
  const currentStreak = 0 // TODO: Implement proper streak calculation
  const longestStreak = 0 // TODO: Implement proper streak calculation
  const lastActivityDate = progressList.length > 0
    ? Math.max(...progressList.map((p: any) => new Date(p.lastAccessedAt || 0).getTime()))
    : 0

  return {
    totalCoursesCompleted,
    totalModulesCompleted,
    totalAssessmentsPassed,
    averageScore,
    currentStreak,
    longestStreak,
    lastActivityDate,
    achievementsUnlocked: achievements,
    totalXP: user?.totalXP || 0,
    level: user?.level || 1
  }
}

/**
 * Check and unlock achievements based on user stats
 */
export async function checkAndUnlockAchievements(
  tenantId: string,
  userId: string,
  stats: Partial<UserStats>
): Promise<UserAchievement[]> {
  const currentStats = await getUserStats(tenantId, userId)
  const mergedStats = { ...currentStats, ...stats }
  
  const achievements = await getUserAchievements(tenantId, userId)
  const unlockedIds = new Set(achievements.map(a => a.achievementId))
  
  const newlyUnlocked: UserAchievement[] = []
  
  // Import achievement definitions from frontend (would need to be shared or duplicated)
  // For now, we'll check common achievement patterns
  const achievementChecks = [
    { id: 'first-steps', category: 'course', requirement: 1 },
    { id: 'learning-specialist-i', category: 'course', requirement: 5 },
    { id: 'learning-specialist-ii', category: 'course', requirement: 10 },
    { id: 'learning-specialist-iii', category: 'course', requirement: 15 },
    { id: 'learning-master', category: 'course', requirement: 25 },
    { id: 'first-try', category: 'assessment', requirement: 1 },
    { id: 'perfect-score', category: 'assessment', requirement: 1 },
    { id: 'streak-master', category: 'streak', requirement: 7 },
    { id: 'streak-champion', category: 'streak', requirement: 30 },
  ]

  for (const check of achievementChecks) {
    if (unlockedIds.has(check.id)) continue

    let shouldUnlock = false

    switch (check.category) {
      case 'course':
        shouldUnlock = mergedStats.totalCoursesCompleted >= check.requirement
        break
      case 'assessment':
        if (check.id === 'first-try') {
          shouldUnlock = mergedStats.totalAssessmentsPassed >= 1
        } else if (check.id === 'perfect-score') {
          shouldUnlock = mergedStats.averageScore >= 100
        } else {
          shouldUnlock = mergedStats.totalAssessmentsPassed >= check.requirement
        }
        break
      case 'streak':
        shouldUnlock = mergedStats.currentStreak >= check.requirement
        break
    }

    if (shouldUnlock) {
      const achievement = await unlockAchievement(tenantId, userId, check.id)
      newlyUnlocked.push(achievement)
    }
  }

  return newlyUnlocked
}

