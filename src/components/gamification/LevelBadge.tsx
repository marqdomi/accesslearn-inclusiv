import { Trophy } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface LevelBadgeProps {
  xp: number
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// Calculate level based on XP (100 XP per level, exponential growth)
export function calculateLevel(xp: number): { level: number; currentLevelXP: number; nextLevelXP: number; progress: number } {
  let level = 1
  let xpForNextLevel = 100
  let totalXpForCurrentLevel = 0

  while (xp >= totalXpForCurrentLevel + xpForNextLevel) {
    totalXpForCurrentLevel += xpForNextLevel
    level++
    xpForNextLevel = Math.floor(100 * Math.pow(1.5, level - 1))
  }

  const currentLevelXP = xp - totalXpForCurrentLevel
  const nextLevelXP = xpForNextLevel
  const progress = (currentLevelXP / nextLevelXP) * 100

  return { level, currentLevelXP, nextLevelXP, progress }
}

export function LevelBadge({ xp, showProgress = false, size = 'md' }: LevelBadgeProps) {
  const { level, currentLevelXP, nextLevelXP, progress } = calculateLevel(xp)

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg`}>
        <Trophy className={iconSizes[size]} />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Nivel {level}</span>
          <span className="text-xs text-muted-foreground">{xp.toLocaleString()} XP</span>
        </div>
        
        {showProgress && (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {currentLevelXP} / {nextLevelXP} XP al siguiente nivel
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
