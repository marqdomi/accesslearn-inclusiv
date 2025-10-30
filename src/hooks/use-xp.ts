import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

export const XP_REWARDS = {
  MODULE_COMPLETE: 50,
  COURSE_COMPLETE: 200,
  ASSESSMENT_PASS: 100,
  ASSESSMENT_PERFECT: 150,
  DAILY_LOGIN: 10,
  STREAK_BONUS: 25,
  FIRST_TRY_BONUS: 50,
} as const

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1850, 2350, 2900, 3500, 4200, 5000, 5900, 6900, 8000, 9200,
  10500, 12000, 13600, 15400, 17300, 19400, 21700, 24200, 27000, 30000, 33300, 36900, 40800,
]

export const RANK_NAMES = [
  'Novice',
  'Learner',
  'Student',
  'Scholar',
  'Expert',
  'Master',
  'Grandmaster',
  'Legend',
]

export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (currentLevel - LEVEL_THRESHOLDS.length + 1) * 3000
  }
  return LEVEL_THRESHOLDS[currentLevel]
}

export function getXPForCurrentLevel(currentLevel: number): number {
  if (currentLevel <= 1) return 0
  return LEVEL_THRESHOLDS[currentLevel - 2]
}

export function getRankName(level: number): string {
  const rankIndex = Math.min(Math.floor((level - 1) / 4), RANK_NAMES.length - 1)
  return RANK_NAMES[rankIndex]
}

export function useXP() {
  const [totalXP, setTotalXP] = useKV<number>('user-total-xp', 0)
  const [currentLevel, setCurrentLevel] = useKV<number>('user-level', 1)

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
      percentage: (xpInCurrentLevel / xpNeededForNextLevel) * 100,
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
