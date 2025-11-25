import { useXP } from '@/hooks/use-xp'
import { UserProfile } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Lightning, Trophy } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'

export function PlayerIdentity({ userId }: { userId?: string }) {
  const { t } = useTranslation()
  const { totalXP, currentLevel, getRankName, getProgressToNextLevel } = useXP(userId)
  const profilesList: any[] = []
  const progress = getProgressToNextLevel()

  const userProfile = useMemo(() => {
    if (!userId) return null
    return (profilesList || []).find(p => p.id === userId)
  }, [userId, profilesList])

  const displayName = userProfile?.displayName || userProfile?.firstName || 'Player'
  const avatarUrl = userProfile?.avatar

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/30">
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Avatar className="h-20 w-20 border-4 border-primary/30 ring-2 ring-primary/20">
            <AvatarImage src={avatarUrl} alt={`${displayName}'s avatar`} />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold truncate mb-1">{displayName}</h2>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded-full">
              <Trophy size={16} weight="fill" aria-hidden="true" />
              <span className="text-sm font-bold">{t('playerIdentity.level')} {currentLevel}</span>
            </div>
            <span className="text-sm font-semibold text-primary">{getRankName()}</span>
            <div className="flex items-center gap-1.5">
              <Lightning size={18} weight="fill" className="text-xp" aria-hidden="true" />
              <span className="text-lg font-bold text-xp">{totalXP.toLocaleString()} XP</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <span className="font-medium text-muted-foreground">
                {t('playerIdentity.progressTo')} {currentLevel + 1}
              </span>
              <span className="font-bold text-foreground">
                {Math.floor(progress.percentage)}%
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={progress.percentage} 
                className="h-3 bg-muted"
                aria-label={`Level progress: ${Math.floor(progress.percentage)}% complete. ${Math.floor(progress.current)} of ${Math.floor(progress.required)} XP earned.`}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground text-right">
              {Math.floor(progress.required - progress.current)} {t('playerIdentity.xpToNextLevel')}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
