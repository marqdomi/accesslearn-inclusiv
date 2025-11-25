import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useActivityFeed } from './use-activity-feed'
import { useMentorXP } from './use-mentor-xp'
import { useTranslation } from 'react-i18next'
import { ApiService } from '@/services/api.service'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'

export const XP_REWARDS = {
  DAILY_LOGIN: 10,
  LESSON_BLOCK_COMPLETE: 15,
  INTERACTIVE_CHALLENGE_COMPLETE: 30,
  LESSON_COMPLETE: 50,
  MODULE_COMPLETE: 100,
  QUIZ_PASS: 150,
  QUIZ_PERFECT: 250,
  COURSE_COMPLETE: 500,
  ASSESSMENT_FINAL_PASS: 500,
  ASSESSMENT_FINAL_PERFECT: 750,
  STREAK_3_DAYS: 25,
  STREAK_7_DAYS: 75,
  STREAK_30_DAYS: 300,
  FIRST_TRY_BONUS: 100,
  SPEED_BONUS: 50,
  RETURN_AFTER_FAILURE: 25,
  COMPLETE_WITH_ACCESSIBILITY: 20,
} as const

function generateInfiniteLevelThresholds(level: number): number {
  if (level <= 1) return 0
  if (level <= 5) {
    return Math.floor(100 * Math.pow(1.5, level - 1))
  }
  if (level <= 20) {
    const baseXP = 100 * Math.pow(1.5, 4)
    return Math.floor(baseXP + (level - 5) * 200)
  }
  const baseXP = 100 * Math.pow(1.5, 4) + (15 * 200)
  return Math.floor(baseXP + (level - 20) * 500)
}

export function getLevelFromXP(xp: number): number {
  let level = 1
  while (generateInfiniteLevelThresholds(level + 1) <= xp) {
    level++
    if (level > 10000) break
  }
  return level
}

export function getXPForNextLevel(currentLevel: number): number {
  return generateInfiniteLevelThresholds(currentLevel + 1)
}

export function getXPForCurrentLevel(currentLevel: number): number {
  return generateInfiniteLevelThresholds(currentLevel)
}

export const RANK_KEYS = [
  'userTitle.novice',
  'userTitle.apprentice',
  'userTitle.apprentice',
  'userTitle.scholar',
  'userTitle.scholar',
  'userTitle.expert',
  'userTitle.expert',
  'userTitle.master',
  'userTitle.master',
  'userTitle.grandMaster',
  'userTitle.grandMaster',
  'userTitle.legend',
]

export function getRankKey(level: number): string {
  const rankIndex = Math.min(Math.floor((level - 1) / 5), RANK_KEYS.length - 1)
  return RANK_KEYS[rankIndex]
}

/**
 * Check if a level is a milestone (important level)
 */
export function isMilestoneLevel(level: number): boolean {
  const milestoneLevels = [5, 10, 25, 50, 75, 100, 150, 200, 250, 500]
  return milestoneLevels.includes(level)
}

export function useXP(userId?: string) {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const { currentTenant } = useTenant()
  const effectiveUserId = userId || currentUser?.id
  const [totalXP, setTotalXP] = useState<number>(0)
  const [currentLevel, setCurrentLevel] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const { postLevelUp } = useActivityFeed()
  const { awardMentorBonus } = useMentorXP()

  // Load XP and level from backend
  useEffect(() => {
    if (effectiveUserId && currentTenant) {
      loadStats()
    } else {
      // Fallback to user data if available
      if (currentUser) {
        setTotalXP(currentUser.totalXP || 0)
        setCurrentLevel(currentUser.level || 1)
        setLoading(false)
      }
    }
  }, [effectiveUserId, currentTenant?.id, currentUser?.id])

  const loadStats = async () => {
    if (!effectiveUserId || !currentTenant) return

    try {
      setLoading(true)
      const stats = await ApiService.getGamificationStats(effectiveUserId)
      setTotalXP(stats.totalXP)
      setCurrentLevel(stats.level)
    } catch (error) {
      console.error('Error loading gamification stats:', error)
      // Fallback to user data
      if (currentUser) {
        setTotalXP(currentUser.totalXP || 0)
        setCurrentLevel(currentUser.level || 1)
      }
    } finally {
      setLoading(false)
    }
  }

  const awardXP = async (amount: number, reason: string, showNotification = true) => {
    if (!effectiveUserId || !currentTenant) {
      // Fallback to local state if no backend
      const newXP = totalXP + amount
      const oldLevel = getLevelFromXP(totalXP)
      const newLevel = getLevelFromXP(newXP)
      
      setTotalXP(newXP)
      if (newLevel > oldLevel) {
        setCurrentLevel(newLevel)
      }
      return
    }

    try {
      const result = await ApiService.awardXP(effectiveUserId, amount, reason)
      
      // Update local state
      setTotalXP(result.user.totalXP || 0)
      setCurrentLevel(result.user.level || 1)

      if (showNotification) {
        toast.success(`+${amount} XP`, {
          description: reason,
          duration: 3000,
          className: 'bg-gradient-to-r from-lime-500 to-green-600 text-white',
        })
      }

      if (effectiveUserId) {
        awardMentorBonus(effectiveUserId, amount)
      }

      if (result.levelUp && result.newLevel) {
        if (effectiveUserId) {
          postLevelUp(effectiveUserId, result.newLevel)
        }
        
        // Check if it's a milestone level
        const isMilestone = isMilestoneLevel(result.newLevel)
        const hasNewBadges = result.newlyAwardedBadges && result.newlyAwardedBadges.length > 0
        
        setTimeout(() => {
          const rankKey = getRankKey(result.newLevel!)
          
          if (hasNewBadges) {
            // Special notification for milestone levels with badges
            toast.success(`🏆 ¡Nivel ${result.newLevel} alcanzado!`, {
              description: `Has obtenido ${result.newlyAwardedBadges!.length} nueva(s) insignia(s)`,
              duration: 7000,
              className: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white',
            })
          } else if (isMilestone) {
            // Milestone level notification
            toast.success(`🎉 ¡Hito alcanzado! Nivel ${result.newLevel}`, {
              description: `${t(rankKey)}!`,
              duration: 6000,
              className: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
            })
          } else {
            // Regular level up
            toast.success(`🎉 ${t('playerIdentity.level')} ${result.newLevel}`, {
              description: `${t(rankKey)}!`,
              duration: 5000,
              className: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
            })
          }
        }, 500)
      }
    } catch (error) {
      console.error('Error awarding XP:', error)
      // Fallback to local update
      const newXP = totalXP + amount
      const oldLevel = getLevelFromXP(totalXP)
      const newLevel = getLevelFromXP(newXP)
      
      setTotalXP(newXP)
      if (newLevel > oldLevel) {
        setCurrentLevel(newLevel)
      }
      
      if (showNotification) {
        toast.success(`+${amount} XP`, {
          description: reason,
          duration: 3000,
          className: 'bg-gradient-to-r from-lime-500 to-green-600 text-white',
        })
      }
    }
  }

  const getProgressToNextLevel = () => {
    const xp = totalXP || 0
    const level = currentLevel || 1
    const currentLevelXP = getXPForCurrentLevel(level)
    const nextLevelXP = getXPForNextLevel(level)
    const xpInCurrentLevel = Math.max(0, xp - currentLevelXP)
    const xpNeededForNextLevel = Math.max(1, nextLevelXP - currentLevelXP)

    const percentage = Math.max(0, Math.min(100, (xpInCurrentLevel / xpNeededForNextLevel) * 100))

    return {
      current: xpInCurrentLevel,
      required: xpNeededForNextLevel,
      percentage: isNaN(percentage) ? 0 : percentage,
    }
  }

  return {
    totalXP: totalXP || 0,
    currentLevel: currentLevel || 1,
    loading,
    awardXP,
    getProgressToNextLevel,
    getRankName: () => t(getRankKey(currentLevel || 1)),
    refresh: loadStats,
  }
}
