import { useState, useEffect } from 'react'
import { AchievementService } from '@/services'
import { UserStats, UserAchievement } from '@/lib/types'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { toast } from 'sonner'

export function useAchievements(userId: string = 'current-user') {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const stats = await AchievementService.getOrCreateUserStats(userId)
        setUserStats(stats)
      } catch (error) {
        console.error('Failed to load user stats:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [userId])

  const checkAndUnlockAchievements = async (stats: UserStats) => {
    const userAchievements = await AchievementService.getUserAchievements(userId)
    const newUnlocks: UserAchievement[] = []

    for (const achievement of ACHIEVEMENTS) {
      const alreadyUnlocked = userAchievements.some(
        (ua) => ua.achievementId === achievement.id
      )

      if (alreadyUnlocked) continue

      let shouldUnlock = false

      switch (achievement.category) {
        case 'course':
          shouldUnlock = stats.totalCoursesCompleted >= achievement.requirement
          break
        case 'milestone':
          shouldUnlock = stats.totalModulesCompleted >= achievement.requirement
          break
        case 'assessment':
          if (achievement.id.startsWith('assessment-specialist')) {
            shouldUnlock = stats.totalAssessmentsPassed >= achievement.requirement
          } else if (achievement.id === 'first-try') {
            shouldUnlock = stats.totalAssessmentsPassed >= 1
          } else if (achievement.id === 'perfect-score') {
            shouldUnlock = stats.totalAssessmentsPassed >= 1
          }
          break
        case 'streak':
          shouldUnlock = stats.currentStreak >= achievement.requirement
          break
      }

      if (shouldUnlock) {
        await AchievementService.unlockAchievement(userId, achievement.id)
        
        toast.success('🏆 Achievement Unlocked!', {
          description: `${achievement.title} - ${achievement.description}`,
          duration: 5000,
        })
      }
    }
  }

  const updateCourseCompletion = async () => {
    try {
      const updated = await AchievementService.incrementCoursesCompleted(userId)
      setUserStats(updated)
      await checkAndUnlockAchievements(updated)
    } catch (error) {
      console.error('Failed to update course completion:', error)
    }
  }

  const updateModuleCompletion = async () => {
    try {
      const updated = await AchievementService.incrementModulesCompleted(userId)
      setUserStats(updated)
      await checkAndUnlockAchievements(updated)
    } catch (error) {
      console.error('Failed to update module completion:', error)
    }
  }

  const updateAssessmentCompletion = async (score: number, isFirstAttempt: boolean) => {
    try {
      const stats = userStats
      if (!stats) return

      const passedWithHighScore = score >= 90
      const perfectScore = score === 100

      const totalAssessments = stats.totalAssessmentsPassed + (passedWithHighScore ? 1 : 0)
      const totalScore = stats.averageScore * stats.totalAssessmentsPassed + score
      const newAverage = totalAssessments > 0 ? totalScore / totalAssessments : score

      const updated = await AchievementService.updateUserStats(userId, {
        totalAssessmentsPassed: passedWithHighScore
          ? stats.totalAssessmentsPassed + 1
          : stats.totalAssessmentsPassed,
        averageScore: newAverage,
      })
      setUserStats(updated)

      await checkAndUnlockAchievements(updated)

      // Check for perfect score achievement
      if (perfectScore) {
        const hasAchievement = await AchievementService.hasAchievement(userId, 'perfect-score')
        if (!hasAchievement) {
          await AchievementService.unlockAchievement(userId, 'perfect-score')
          const perfectAchievement = ACHIEVEMENTS.find((a) => a.id === 'perfect-score')
          if (perfectAchievement) {
            toast.success('🏆 Achievement Unlocked!', {
              description: `${perfectAchievement.title} - ${perfectAchievement.description}`,
              duration: 5000,
            })
          }
        }
      }

      // Check for first-try achievement
      if (isFirstAttempt && score >= 70) {
        const hasAchievement = await AchievementService.hasAchievement(userId, 'first-try')
        if (!hasAchievement) {
          await AchievementService.unlockAchievement(userId, 'first-try')
          const firstTryAchievement = ACHIEVEMENTS.find((a) => a.id === 'first-try')
          if (firstTryAchievement) {
            toast.success('🏆 Achievement Unlocked!', {
              description: `${firstTryAchievement.title} - ${firstTryAchievement.description}`,
              duration: 5000,
            })
          }
        }
      }
    } catch (error) {
      console.error('Failed to update assessment completion:', error)
    }
  }

  const updateStreak = async () => {
    try {
      const stats = userStats
      if (!stats) return

      const now = Date.now()
      const oneDayMs = 24 * 60 * 60 * 1000
      const daysSinceLastActivity = Math.floor((now - stats.lastActivityDate) / oneDayMs)

      let newStreak = stats.currentStreak

      if (daysSinceLastActivity === 0) {
        return
      } else if (daysSinceLastActivity === 1) {
        newStreak = stats.currentStreak + 1
      } else {
        newStreak = 1
      }

      const updated = await AchievementService.updateStreak(userId, newStreak)
      setUserStats(updated)
      await checkAndUnlockAchievements(updated)
    } catch (error) {
      console.error('Failed to update streak:', error)
    }
  }

  return {
    userStats,
    loading,
    updateCourseCompletion,
    updateModuleCompletion,
    updateAssessmentCompletion,
    updateStreak,
  }
}
