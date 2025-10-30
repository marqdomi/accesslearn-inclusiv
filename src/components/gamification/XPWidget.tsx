import { useXP } from '@/hooks/use-xp'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, Lightning } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface XPWidgetProps {
  compact?: boolean
}

export function XPWidget({ compact = false }: XPWidgetProps) {
  const { totalXP, currentLevel, getRankName, getProgressToNextLevel } = useXP()
  const progress = getProgressToNextLevel()

  if (compact) {
    return (
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
              <Trophy size={24} weight="fill" className="text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Level {currentLevel}</p>
              <p className="text-lg font-bold">{getRankName()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Lightning size={20} weight="fill" className="text-xp" aria-hidden="true" />
            <span className="text-xl font-bold text-xp">{totalXP.toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress to Level {currentLevel + 1}</span>
            <span>
              {Math.floor(progress.current)} / {Math.floor(progress.required)} XP
            </span>
          </div>
          <Progress 
            value={progress.percentage} 
            className="h-3 bg-muted"
            aria-label={`Experience progress: ${Math.floor(progress.percentage)}%`}
          />
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary via-secondary to-accent shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Trophy size={32} weight="fill" className="text-white" aria-hidden="true" />
            </motion.div>
            <div>
              <h3 className="text-3xl font-bold">Level {currentLevel}</h3>
              <p className="text-lg font-semibold text-primary">{getRankName()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <Lightning size={24} weight="fill" className="text-xp" aria-hidden="true" />
              <span className="text-3xl font-bold text-xp">{totalXP.toLocaleString()}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total XP</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Next Level</span>
            <span className="font-bold text-primary">
              {Math.floor(progress.current)} / {Math.floor(progress.required)} XP
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={progress.percentage} 
              className="h-4 bg-muted/50"
              aria-label={`Experience progress: ${Math.floor(progress.percentage)}%`}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {Math.floor(progress.percentage)}%
            </motion.div>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {Math.floor(progress.required - progress.current)} XP to level {currentLevel + 1}
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 px-6 py-3 border-t">
        <div className="flex items-center justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{currentLevel}</p>
            <p className="text-xs text-muted-foreground">Current Level</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-2xl font-bold text-secondary">{currentLevel + 1}</p>
            <p className="text-xs text-muted-foreground">Next Level</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-2xl font-bold text-accent">{Math.floor(progress.percentage)}%</p>
            <p className="text-xs text-muted-foreground">Progress</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
