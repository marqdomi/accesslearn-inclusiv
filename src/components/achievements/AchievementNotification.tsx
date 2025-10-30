import { motion } from 'framer-motion'
import { Trophy } from '@phosphor-icons/react'
import { Achievement } from '@/lib/types'
import { TIER_COLORS, getTierLabel } from '@/lib/achievements'

interface AchievementNotificationProps {
  achievement: Achievement
}

export function AchievementNotification({ achievement }: AchievementNotificationProps) {
  const colors = TIER_COLORS[achievement.tier]

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 10 }}
      transition={{ type: 'spring', duration: 0.5 }}
      className="flex items-center gap-4 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 p-4 text-white shadow-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
        <Trophy size={24} weight="fill" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold uppercase tracking-wide">Achievement Unlocked!</p>
        <p className="text-lg font-bold">{achievement.title}</p>
        <p className="text-sm opacity-90">{achievement.description}</p>
      </div>
      <div className={`rounded-lg px-3 py-1 text-xs font-bold ${colors.bg}`}>
        {getTierLabel(achievement.tier)}
      </div>
    </motion.div>
  )
}
