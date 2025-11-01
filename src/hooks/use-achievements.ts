import { useKV } from '@github/spark/hooks'
import { UserStats, UserAchievement } from '@/lib/types'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { toast } from 'sonner'

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
  const userKey = userId || 'default-user'
  const [userStats, setUserStats] = useKV<UserStats>(`user-stats-${userKey}`, DEFAULT_USER_STATS)

  const checkAndUnlockAchievements = (stats: UserStats, setStats: (updater: (current?: UserStats) => UserStats) => void) => {
    const newUnlocks: UserAchievement[] = []

    ACHIEVEMENTS.forEach((achievement) => {
      const alreadyUnlocked = stats.achievementsUnlocked.some(
        (ua) => ua.achievementId === achievement.id
      )

      if (alreadyUnlocked) return

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
        newUnlocks.push({
          achievementId: achievement.id,
          unlockedAt: Date.now(),
        })

        toast.success('🏆 Achievement Unlocked!', {
          description: `${achievement.title} - ${achievement.description}`,
          duration: 5000,
        })
      }
    })

    if (newUnlocks.length > 0) {
      setStats((current) => {
        const currentStats = current || DEFAULT_USER_STATS
        return {
          ...currentStats,
          achievementsUnlocked: [...currentStats.achievementsUnlocked, ...newUnlocks],
        }
      })
    }
  }

  const updateCourseCompletion = () => {
    setUserStats((current) => {
      const stats = current || DEFAULT_USER_STATS
      const updated: UserStats = {
        ...stats,
        totalCoursesCompleted: stats.totalCoursesCompleted + 1,
        lastActivityDate: Date.now(),
      }
      setTimeout(() => checkAndUnlockAchievements(updated, setUserStats), 0)
      return updated
    })
  }

  const updateModuleCompletion = () => {
    setUserStats((current) => {
      const stats = current || DEFAULT_USER_STATS
      const updated: UserStats = {
        ...stats,
        totalModulesCompleted: stats.totalModulesCompleted + 1,
        lastActivityDate: Date.now(),
      }
      setTimeout(() => checkAndUnlockAchievements(updated, setUserStats), 0)
      return updated
    })
  }

  const updateAssessmentCompletion = (score: number, isFirstAttempt: boolean) => {
    setUserStats((current) => {
      const stats = current || DEFAULT_USER_STATS
      const passedWithHighScore = score >= 90
      const perfectScore = score === 100

      const totalAssessments = stats.totalAssessmentsPassed + (passedWithHighScore ? 1 : 0)
      const totalScore = stats.averageScore * stats.totalAssessmentsPassed + score
      const newAverage = totalAssessments > 0 ? totalScore / totalAssessments : score

      const updated: UserStats = {
        ...stats,
        totalAssessmentsPassed: passedWithHighScore
          ? stats.totalAssessmentsPassed + 1
          : stats.totalAssessmentsPassed,
        averageScore: newAverage,
        lastActivityDate: Date.now(),
      }

      setTimeout(() => checkAndUnlockAchievements(updated, setUserStats), 0)

      if (perfectScore && !stats.achievementsUnlocked.some((a) => a.achievementId === 'perfect-score')) {
        const perfectAchievement = ACHIEVEMENTS.find((a) => a.id === 'perfect-score')
        if (perfectAchievement) {
          updated.achievementsUnlocked = [
            ...updated.achievementsUnlocked,
            {
              achievementId: 'perfect-score',
              unlockedAt: Date.now(),
            },
          ]
          toast.success('🏆 Achievement Unlocked!', {
            description: `${perfectAchievement.title} - ${perfectAchievement.description}`,
            duration: 5000,
          })
        }
      }

      if (isFirstAttempt && score >= 70 && !stats.achievementsUnlocked.some((a) => a.achievementId === 'first-try')) {
        const firstTryAchievement = ACHIEVEMENTS.find((a) => a.id === 'first-try')
        if (firstTryAchievement) {
          updated.achievementsUnlocked = [
            ...updated.achievementsUnlocked,
            {
              achievementId: 'first-try',
              unlockedAt: Date.now(),
            },
          ]
          toast.success('🏆 Achievement Unlocked!', {
            description: `${firstTryAchievement.title} - ${firstTryAchievement.description}`,
            duration: 5000,
          })
        }
      }

      return updated
    })
  }

  const updateStreak = () => {
    setUserStats((current) => {
      const stats = current || DEFAULT_USER_STATS
      const now = Date.now()
      const oneDayMs = 24 * 60 * 60 * 1000
      const daysSinceLastActivity = Math.floor((now - stats.lastActivityDate) / oneDayMs)

      let newStreak = stats.currentStreak

      if (daysSinceLastActivity === 0) {
        return stats
      } else if (daysSinceLastActivity === 1) {
        newStreak = stats.currentStreak + 1
      } else {
        newStreak = 1
      }

      const updated: UserStats = {
        ...stats,
        currentStreak: newStreak,
        longestStreak: Math.max(stats.longestStreak, newStreak),
        lastActivityDate: now,
      }

      setTimeout(() => checkAndUnlockAchievements(updated, setUserStats), 0)
      return updated
    })
  }

  return {
    userStats,
    updateCourseCompletion,
    updateModuleCompletion,
    updateAssessmentCompletion,
    updateStreak,
  }
}
