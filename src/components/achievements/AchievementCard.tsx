import { Achievement, AchievementTier } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TIER_COLORS, getTierLabel } from '@/lib/achievements'
import { 
  GraduationCap, 
  BookOpen, 
  BookBookmark, 
  Trophy, 
  Lightning, 
  Star, 
  Medal, 
  Fire, 
  Flame, 
  FireSimple, 
  CheckCircle, 
  Target, 
  Rocket, 
  Lightbulb,
  Timer,
  LockSimple
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface AchievementCardProps {
  achievement: Achievement
  isUnlocked: boolean
  unlockedAt?: number
  progress?: number
}

const iconMap: Record<string, any> = {
  GraduationCap,
  BookOpen,
  BookBookmark,
  Trophy,
  Lightning,
  Star,
  Medal,
  Fire,
  Flame,
  FireSimple,
  CheckCircle,
  Target,
  Rocket,
  Lightbulb,
  Timer,
}

function getTierGradient(tier: AchievementTier): string {
  const gradients = {
    bronze: 'from-amber-600 to-amber-800',
    silver: 'from-slate-300 to-slate-500',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-cyan-300 to-cyan-500',
  }
  return gradients[tier]
}

export function AchievementCard({ achievement, isUnlocked, unlockedAt, progress }: AchievementCardProps) {
  const IconComponent = iconMap[achievement.icon] || Trophy
  const colors = TIER_COLORS[achievement.tier]
  const tierLabel = getTierLabel(achievement.tier)

  const formattedDate = unlockedAt 
    ? new Date(unlockedAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`group relative overflow-hidden p-6 transition-all hover:shadow-lg ${
          isUnlocked ? '' : 'opacity-60'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${getTierGradient(achievement.tier)} opacity-5 transition-opacity group-hover:opacity-10`} />
        
        <div className="relative space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${
                isUnlocked ? `bg-gradient-to-br ${colors.gradient}` : 'bg-muted'
              } shadow-lg transition-transform group-hover:scale-110`}
            >
              {isUnlocked ? (
                <IconComponent size={32} weight="fill" className="text-white" aria-hidden="true" />
              ) : (
                <LockSimple size={32} weight="bold" className="text-muted-foreground" aria-hidden="true" />
              )}
            </div>

            <Badge variant={isUnlocked ? 'default' : 'secondary'} className={isUnlocked ? colors.bg : ''}>
              {tierLabel}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold">{achievement.title}</h3>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
          </div>

          {isUnlocked && formattedDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle size={16} weight="fill" className="text-success" aria-hidden="true" />
              <span>Unlocked on {formattedDate}</span>
            </div>
          )}

          {!isUnlocked && progress !== undefined && progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.min(progress, achievement.requirement)} / {achievement.requirement}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-500`}
                  style={{ width: `${Math.min((progress / achievement.requirement) * 100, 100)}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={achievement.requirement}
                  aria-label={`${achievement.title} progress`}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
