import { useEffect, useState } from 'react'
import { useXP } from '@/hooks/use-xp'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Lightning, Trophy } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function PlayerIdentity() {
  const { totalXP, currentLevel, getRankName, getProgressToNextLevel } = useXP()
  const [user, setUser] = useState<{ login: string; avatarUrl: string } | null>(null)
  const progress = getProgressToNextLevel()

  useEffect(() => {
    window.spark.user().then(setUser).catch(() => setUser({ login: 'Player', avatarUrl: '' }))
  }, [])

  return (
    <Card className="learner-card p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/30 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-2xl" aria-hidden="true" />
      
      <div className="flex items-center gap-4 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Avatar className="h-24 w-24 border-4 border-primary/40 ring-4 ring-primary/20 shadow-xl">
            <AvatarImage src={user?.avatarUrl} alt={`${user?.login || 'Player'}'s avatar`} />
            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
              {user?.login?.charAt(0).toUpperCase() || 'P'}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-bold truncate mb-2 learner-heading">{user?.login || 'Player'}</h2>
          
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <div className="learner-badge flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-1.5">
              <Trophy size={18} weight="fill" aria-hidden="true" />
              <span className="text-sm font-bold">Level {currentLevel}</span>
            </div>
            <span className="text-base font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">{getRankName()}</span>
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full shadow-md">
              <Lightning size={20} weight="fill" aria-hidden="true" />
              <span className="text-base font-bold">{totalXP.toLocaleString()} XP</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-semibold text-foreground">
                <span aria-hidden="true">⚡ </span>
                Progress to Level {currentLevel + 1}
              </span>
              <span className="font-bold text-lg text-primary">
                {Math.floor(progress.percentage)}%
              </span>
            </div>
            <div className="relative">
              <div className="h-4 bg-muted rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="learner-progress-bar h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  aria-label={`Level progress: ${Math.floor(progress.percentage)}% complete. ${Math.floor(progress.current)} of ${Math.floor(progress.required)} XP earned.`}
                  role="progressbar"
                  aria-valuenow={Math.floor(progress.percentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
            <p className="mt-2 text-sm font-semibold text-muted-foreground text-right">
              <span className="text-primary font-bold">{Math.floor(progress.required - progress.current)} XP</span>
              {' '}to next level!
              <span aria-hidden="true"> 🎯</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
