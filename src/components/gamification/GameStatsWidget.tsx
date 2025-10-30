import { useAchievements } from '@/hooks/use-achievements'
import { useXP } from '@/hooks/use-xp'
import { Card } from '@/components/ui/card'
import { Trophy, Fire, Target, Star, Lightning, GraduationCap } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function GameStatsWidget() {
  const { userStats } = useAchievements()
  const { totalXP, currentLevel, getRankName } = useXP()

  const stats = userStats || {
    totalCoursesCompleted: 0,
    totalModulesCompleted: 0,
    totalAssessmentsPassed: 0,
    averageScore: 0,
    currentStreak: 0,
    achievementsUnlocked: [],
  }

  const statCards = [
    {
      icon: Lightning,
      label: 'Total XP',
      value: totalXP.toLocaleString(),
      gradient: 'from-lime-400 to-green-600',
      color: 'text-green-600',
    },
    {
      icon: Trophy,
      label: 'Current Level',
      value: currentLevel.toString(),
      subvalue: getRankName(),
      gradient: 'from-purple-400 to-purple-600',
      color: 'text-purple-600',
    },
    {
      icon: Fire,
      label: 'Day Streak',
      value: stats.currentStreak.toString(),
      subvalue: 'days',
      gradient: 'from-orange-400 to-red-600',
      color: 'text-orange-600',
    },
    {
      icon: GraduationCap,
      label: 'Courses',
      value: stats.totalCoursesCompleted.toString(),
      subvalue: 'completed',
      gradient: 'from-blue-400 to-blue-600',
      color: 'text-blue-600',
    },
    {
      icon: Target,
      label: 'Modules',
      value: stats.totalModulesCompleted.toString(),
      subvalue: 'completed',
      gradient: 'from-cyan-400 to-cyan-600',
      color: 'text-cyan-600',
    },
    {
      icon: Star,
      label: 'Avg Score',
      value: `${Math.round(stats.averageScore)}%`,
      gradient: 'from-yellow-400 to-yellow-600',
      color: 'text-yellow-600',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <motion.div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-md`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <stat.icon size={24} weight="fill" className="text-white" aria-hidden="true" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  {stat.subvalue && (
                    <p className="text-xs text-muted-foreground">{stat.subvalue}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
