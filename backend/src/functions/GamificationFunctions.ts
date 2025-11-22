/**
 * Gamification Functions
 * 
 * Manages XP, levels, badges, and achievements in Cosmos DB
 * 
 * Uses logarithmic/infinite level system:
 * - Levels 1-5: Exponential growth (100 * 1.5^(level-1))
 * - Levels 6-20: Linear growth (base + 200 per level)
 * - Levels 21+: Linear growth with higher increment (base + 500 per level)
 * This ensures infinite levels while making each level progressively harder
 */

import { getContainer } from '../services/cosmosdb.service'
import { User } from '../models/User'

/**
 * Generate XP threshold for a given level (logarithmic/infinite system)
 */
function generateInfiniteLevelThresholds(level: number): number {
  if (level <= 1) return 0
  if (level <= 5) {
    return Math.floor(100 * Math.pow(1.5, level - 1))
  }
  if (level <= 20) {
    const baseXP = 100 * Math.pow(1.5, 4) // ~506 XP at level 5
    return Math.floor(baseXP + (level - 5) * 200)
  }
  // Level 21+: Higher increment for infinite scalability
  const baseXP = 100 * Math.pow(1.5, 4) + (15 * 200) // ~3506 XP at level 20
  return Math.floor(baseXP + (level - 20) * 500)
}

/**
 * Calculate level from total XP (logarithmic/infinite system)
 */
export function getLevelFromXP(xp: number): number {
  let level = 1
  while (generateInfiniteLevelThresholds(level + 1) <= xp) {
    level++
    if (level > 10000) break // Safety limit
  }
  return level
}

/**
 * Get XP required for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  return generateInfiniteLevelThresholds(currentLevel + 1)
}

/**
 * Get XP required for current level
 */
export function getXPForCurrentLevel(currentLevel: number): number {
  return generateInfiniteLevelThresholds(currentLevel)
}

/**
 * Award XP to a user and update level if needed
 * Uses logarithmic/infinite level system
 */
export async function awardXP(
  userId: string,
  tenantId: string,
  xpAmount: number,
  reason?: string
): Promise<{ user: User; levelUp: boolean; newLevel?: number; newlyAwardedBadges?: string[] }> {
  const usersContainer = getContainer('users')
  
  const { resource: user } = await usersContainer.item(userId, tenantId).read<User>()
  if (!user) {
    throw new Error('User not found')
  }

  const oldLevel = user.level || 1
  const oldXP = user.totalXP || 0
  const newXP = oldXP + xpAmount
  
  // Calculate level using logarithmic/infinite system
  const newLevel = getLevelFromXP(newXP)
  const levelUp = newLevel > oldLevel

  user.totalXP = newXP
  user.level = newLevel
  user.updatedAt = new Date().toISOString()

  // Check and award level-based badges automatically
  let newlyAwardedBadges: string[] = []
  if (levelUp && newLevel) {
    newlyAwardedBadges = await checkAndAwardLevelBadges(userId, tenantId, newLevel)
    // Re-read user to get updated badges
    const { resource: updatedUserWithBadges } = await usersContainer.item(userId, tenantId).read<User>()
    if (updatedUserWithBadges) {
      user.badges = updatedUserWithBadges.badges
    }
  }

  const { resource: updatedUser } = await usersContainer.item(userId, tenantId).replace<User>(user)

  return {
    user: updatedUser!,
    levelUp,
    newLevel: levelUp ? newLevel : undefined,
    newlyAwardedBadges: newlyAwardedBadges.length > 0 ? newlyAwardedBadges : undefined,
  }
}

/**
 * Get user's gamification stats
 */
export async function getUserGamificationStats(
  userId: string,
  tenantId: string
): Promise<{
  totalXP: number
  level: number
  badges: string[]
  achievements: string[]
}> {
  const usersContainer = getContainer('users')
  
  const { resource: user } = await usersContainer.item(userId, tenantId).read<User>()
  if (!user) {
    throw new Error('User not found')
  }

  return {
    totalXP: user.totalXP || 0,
    level: user.level || 1,
    badges: user.badges || [],
    achievements: [], // TODO: Implement achievements container
  }
}

/**
 * Award a badge to a user
 */
export async function awardBadge(
  userId: string,
  tenantId: string,
  badgeId: string
): Promise<User> {
  const usersContainer = getContainer('users')
  
  const { resource: user } = await usersContainer.item(userId, tenantId).read<User>()
  if (!user) {
    throw new Error('User not found')
  }

  if (!user.badges) {
    user.badges = []
  }

  if (!user.badges.includes(badgeId)) {
    user.badges.push(badgeId)
    user.updatedAt = new Date().toISOString()
    await usersContainer.item(userId, tenantId).replace<User>(user)
  }

  return user
}

/**
 * Remove a badge from a user
 */
export async function removeBadge(
  userId: string,
  tenantId: string,
  badgeId: string
): Promise<User> {
  const usersContainer = getContainer('users')
  
  const { resource: user } = await usersContainer.item(userId, tenantId).read<User>()
  if (!user) {
    throw new Error('User not found')
  }

  if (user.badges) {
    user.badges = user.badges.filter(b => b !== badgeId)
    user.updatedAt = new Date().toISOString()
    await usersContainer.item(userId, tenantId).replace<User>(user)
  }

  return user
}

/**
 * Badge definitions for level milestones
 */
export const LEVEL_BADGES = [
  { level: 5, badgeId: 'level-5', name: 'Aprendiz', description: 'Alcanzaste el nivel 5' },
  { level: 10, badgeId: 'level-10', name: 'Estudiante', description: 'Alcanzaste el nivel 10' },
  { level: 25, badgeId: 'level-25', name: 'Estudiante Avanzado', description: 'Alcanzaste el nivel 25' },
  { level: 50, badgeId: 'level-50', name: 'Experto', description: 'Alcanzaste el nivel 50' },
  { level: 75, badgeId: 'level-75', name: 'Maestro', description: 'Alcanzaste el nivel 75' },
  { level: 100, badgeId: 'level-100', name: 'Gran Maestro', description: 'Alcanzaste el nivel 100' },
  { level: 150, badgeId: 'level-150', name: 'Leyenda', description: 'Alcanzaste el nivel 150' },
  { level: 200, badgeId: 'level-200', name: 'Ídolo', description: 'Alcanzaste el nivel 200' },
  { level: 250, badgeId: 'level-250', name: 'Mito', description: 'Alcanzaste el nivel 250' },
  { level: 500, badgeId: 'level-500', name: 'Dios del Aprendizaje', description: 'Alcanzaste el nivel 500' },
]

/**
 * Achievement definitions for level ranges
 */
export const LEVEL_ACHIEVEMENTS = [
  { minLevel: 1, maxLevel: 10, achievementId: 'novice', name: 'Novato', description: 'Completaste los primeros 10 niveles' },
  { minLevel: 11, maxLevel: 25, achievementId: 'apprentice', name: 'Aprendiz', description: 'Completaste los niveles 11-25' },
  { minLevel: 26, maxLevel: 50, achievementId: 'scholar', name: 'Erudito', description: 'Completaste los niveles 26-50' },
  { minLevel: 51, maxLevel: 100, achievementId: 'expert', name: 'Experto', description: 'Completaste los niveles 51-100' },
  { minLevel: 101, maxLevel: 200, achievementId: 'master', name: 'Maestro', description: 'Completaste los niveles 101-200' },
  { minLevel: 201, maxLevel: 500, achievementId: 'grandmaster', name: 'Gran Maestro', description: 'Completaste los niveles 201-500' },
  { minLevel: 501, maxLevel: Infinity, achievementId: 'legend', name: 'Leyenda', description: 'Superaste el nivel 500' },
]

/**
 * Check and award level-based badges automatically
 */
export async function checkAndAwardLevelBadges(
  userId: string,
  tenantId: string,
  newLevel: number
): Promise<string[]> {
  const usersContainer = getContainer('users')
  
  const { resource: user } = await usersContainer.item(userId, tenantId).read<User>()
  if (!user) {
    throw new Error('User not found')
  }

  const currentBadges = user.badges || []
  const newlyAwarded: string[] = []

  // Check for level milestone badges
  for (const badgeDef of LEVEL_BADGES) {
    if (newLevel >= badgeDef.level && !currentBadges.includes(badgeDef.badgeId)) {
      currentBadges.push(badgeDef.badgeId)
      newlyAwarded.push(badgeDef.badgeId)
    }
  }

  // Update user if new badges were awarded
  if (newlyAwarded.length > 0) {
    user.badges = currentBadges
    user.updatedAt = new Date().toISOString()
    await usersContainer.item(userId, tenantId).replace<User>(user)
  }

  return newlyAwarded
}

/**
 * Get achievement for a given level
 */
export function getAchievementForLevel(level: number): typeof LEVEL_ACHIEVEMENTS[0] | null {
  for (const achievement of LEVEL_ACHIEVEMENTS) {
    if (level >= achievement.minLevel && level <= achievement.maxLevel) {
      return achievement
    }
  }
  return null
}

/**
 * Check if a level is a milestone (important level)
 */
export function isMilestoneLevel(level: number): boolean {
  return LEVEL_BADGES.some(badge => badge.level === level)
}

/**
 * Get badge information by ID
 */
export function getBadgeInfo(badgeId: string): typeof LEVEL_BADGES[0] | null {
  return LEVEL_BADGES.find(badge => badge.badgeId === badgeId) || null
}

