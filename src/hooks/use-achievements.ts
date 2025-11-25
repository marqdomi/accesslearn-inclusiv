import { useState, useEffect, useCallback } from 'react'
import { UserStats, UserAchievement } from '@/lib/types'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useActivityFeed } from './use-activity-feed'

const DEFAULT_USER_STATS: UserStats = {
  totalCoursesCompleted: 0,
  totalModulesCompleted: 0,
  totalAssessmentsPassed: 0,
  averageScore: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: 0,
  achievementsUnlocked: [],
  totalXP: 0,
  level: 1,
}

export function useAchievements(userId?: string) {
  const { currentTenant } = useTenant()
  const { t } = useTranslation()
  const { postAchievementUnlocked } = useActivityFeed(userId)
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_USER_STATS)
  const [loading, setLoading] = useState(false)

  const loadStats = useCallback(async () => {
    if (!currentTenant || !userId) return

    try {
      setLoading(true)
      const stats = await ApiService.getUserStats(userId)
      setUserStats(stats)
    } catch (error) {
      console.error('Error loading user stats:', error)
    } finally {
      setLoading(false)
    }
  }, [currentTenant, userId])

  // Auto-load on mount
  useEffect(() => {
    if (currentTenant && userId) {
      loadStats()
    }
  }, [currentTenant?.id, userId, loadStats])

  const checkAndUnlockAchievements = useCallback(async (updatedStats?: Partial<UserStats>) => {
    if (!currentTenant || !userId) return

    try {
      const result = await ApiService.checkAndUnlockAchievements(updatedStats)
      
      if (result.newlyUnlocked.length > 0) {
        // Reload stats to get newly unlocked achievements
        await loadStats()
        
        // Show notifications for newly unlocked achievements
        result.newlyUnlocked.forEach((achievement) => {
          const achievementDef = ACHIEVEMENTS.find(a => a.id === achievement.achievementId)
          if (achievementDef) {
            const title = achievementDef.titleKey ? t(achievementDef.titleKey) : achievementDef.title
            const description = achievementDef.descriptionKey ? t(achievementDef.descriptionKey) : achievementDef.description
            
            toast.success(t('achievementCard.unlocked'), {
              description: `${title} - ${description}`,
              duration: 5000,
            })

            // Post to activity feed
            postAchievementUnlocked(title, achievementDef.icon)
          }
        })
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  }, [currentTenant, userId, loadStats, postAchievementUnlocked, t])

  const updateCourseCompletion = async () => {
    if (!currentTenant || !userId) return

    try {
      const stats = await ApiService.getUserStats(userId)
      const updated = {
        ...stats,
        totalCoursesCompleted: stats.totalCoursesCompleted + 1,
        lastActivityDate: Date.now(),
      }
      setUserStats(updated)
      await checkAndUnlockAchievements(updated)
    } catch (error) {
      console.error('Error updating course completion:', error)
    }
  }

  const updateModuleCompletion = async () => {
    if (!currentTenant || !userId) return

    try {
      const stats = await ApiService.getUserStats(userId)
      const updated = {
        ...stats,
        totalModulesCompleted: stats.totalModulesCompleted + 1,
        lastActivityDate: Date.now(),
      }
      setUserStats(updated)
      await checkAndUnlockAchievements(updated)
    } catch (error) {
      console.error('Error updating module completion:', error)
    }
  }

  const updateAssessmentCompletion = async (score: number, isFirstAttempt: boolean) => {
    if (!currentTenant || !userId) return

    try {
      const stats = await ApiService.getUserStats(userId)
      const passedWithHighScore = score >= 70
      const perfectScore = score === 100

      const totalAssessments = stats.totalAssessmentsPassed + (passedWithHighScore ? 1 : 0)
      const totalScore = stats.averageScore * stats.totalAssessmentsPassed + score
      const newAverage = totalAssessments > 0 ? totalScore / totalAssessments : score

      const updated = {
        ...stats,
        totalAssessmentsPassed: passedWithHighScore
          ? stats.totalAssessmentsPassed + 1
          : stats.totalAssessmentsPassed,
        averageScore: newAverage,
        lastActivityDate: Date.now(),
      }
      setUserStats(updated)
      await checkAndUnlockAchievements(updated)
    } catch (error) {
      console.error('Error updating assessment completion:', error)
    }
  }

  const updateStreak = async () => {
    if (!currentTenant || !userId) return

    try {
      const stats = await ApiService.getUserStats(userId)
      const now = Date.now()
      const oneDayMs = 24 * 60 * 60 * 1000
      const daysSinceLastActivity = Math.floor((now - stats.lastActivityDate) / oneDayMs)

      let newStreak = stats.currentStreak

      if (daysSinceLastActivity === 0) {
        return // Already updated today
      } else if (daysSinceLastActivity === 1) {
        newStreak = stats.currentStreak + 1
      } else {
        newStreak = 1
      }

      const updated = {
        ...stats,
        currentStreak: newStreak,
        longestStreak: Math.max(stats.longestStreak, newStreak),
        lastActivityDate: now,
      }
      setUserStats(updated)
      await checkAndUnlockAchievements(updated)
    } catch (error) {
      console.error('Error updating streak:', error)
    }
  }

  return {
    userStats,
    loading,
    updateCourseCompletion,
    updateModuleCompletion,
    updateAssessmentCompletion,
    updateStreak,
    checkAndUnlockAchievements,
    refresh: loadStats
  }
}
