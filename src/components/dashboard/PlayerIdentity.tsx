import { useEffect, useState } from 'react'
import { useXP } from '@/hooks/use-xp'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Lightning, Trophy } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function PlayerIdentity({ userId }: { userId?: string }) {
  const { totalXP, currentLevel, getRankName, getProgressToNextLevel } = useXP(userId)
  const [user, setUser] = useState<{ login: string; avatarUrl: string } | null>(null)
  const progress = getProgressToNextLevel()

  useEffect(() => {
    window.spark.user().then(setUser).catch(() => setUser({ login: 'Player', avatarUrl: '' }))
  }, [])

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/30">
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Avatar className="h-20 w-20 border-4 border-primary/30 ring-2 ring-primary/20">
            <AvatarImage src={user?.avatarUrl} alt={`${user?.login || 'Player'}'s avatar`} />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
              {user?.login?.charAt(0).toUpperCase() || 'P'}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold truncate mb-1">{user?.login || 'Player'}</h2>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 rounded-full">
              <Trophy size={16} weight="fill" aria-hidden="true" />
              <span className="text-sm font-bold">Level {currentLevel}</span>
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
                Progress to Level {currentLevel + 1}
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
              {Math.floor(progress.required - progress.current)} XP to next level
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
