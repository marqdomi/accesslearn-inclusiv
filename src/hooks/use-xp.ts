import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { useActivityFeed } from './use-activity-feed'

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

export const RANK_NAMES = [
  'Novice',
  'Learner',
  'Student',
  'Scholar',
  'Specialist',
  'Expert',
  'Professional',
  'Master',
  'Grandmaster',
  'Legend',
  'Champion',
  'Hero',
]

export function getRankName(level: number): string {
  const rankIndex = Math.min(Math.floor((level - 1) / 5), RANK_NAMES.length - 1)
  return RANK_NAMES[rankIndex]
}

export function useXP(userId?: string) {
  const userKey = userId || 'default-user'
  const [totalXP, setTotalXP] = useKV<number>(`user-total-xp-${userKey}`, 0)
  const [currentLevel, setCurrentLevel] = useKV<number>(`user-level-${userKey}`, 1)
  const { postLevelUp } = useActivityFeed()

  const awardXP = (amount: number, reason: string, showNotification = true) => {
    setTotalXP((currentXP) => {
      const current = currentXP || 0
      const newXP = current + amount
      const oldLevel = getLevelFromXP(current)
      const newLevel = getLevelFromXP(newXP)

      if (showNotification) {
        toast.success(`+${amount} XP`, {
          description: reason,
          duration: 3000,
          className: 'bg-gradient-to-r from-lime-500 to-green-600 text-white',
        })
      }

      if (newLevel > oldLevel) {
        setCurrentLevel(newLevel)
        if (userId) {
          postLevelUp(userId, newLevel)
        }
        setTimeout(() => {
          toast.success(`🎉 Level Up! Level ${newLevel}`, {
            description: `You've reached ${getRankName(newLevel)} rank!`,
            duration: 5000,
            className: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
          })
        }, 500)
      }

      return newXP
    })
  }

  const getProgressToNextLevel = () => {
    const xp = totalXP || 0
    const level = currentLevel || 1
    const currentLevelXP = getXPForCurrentLevel(level)
    const nextLevelXP = getXPForNextLevel(level)
    const xpInCurrentLevel = xp - currentLevelXP
    const xpNeededForNextLevel = nextLevelXP - currentLevelXP

    return {
      current: xpInCurrentLevel,
      required: xpNeededForNextLevel,
      percentage: Math.min(100, (xpInCurrentLevel / xpNeededForNextLevel) * 100),
    }
  }

  return {
    totalXP: totalXP || 0,
    currentLevel: currentLevel || 1,
    awardXP,
    getProgressToNextLevel,
    getRankName: () => getRankName(currentLevel || 1),
  }
}
