import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy, Sparkles, Star } from 'lucide-react'

export interface GameNotification {
  id: string
  title: string
  description: string
  type?: 'xp' | 'module' | 'course'
  meta?: {
    value?: number
    unit?: string
  }
}

interface GameNotificationQueueProps {
  notifications: GameNotification[]
  onRemove: (id: string) => void
}

const typeStyles: Record<
  NonNullable<GameNotification['type']>,
  { bg: string; icon: JSX.Element }
> = {
  xp: {
    bg: 'from-purple-600/90 via-purple-500/90 to-indigo-500/90',
    icon: <Sparkles className="h-4 w-4 text-white" />,
  },
  module: {
    bg: 'from-emerald-600/90 via-emerald-500/90 to-teal-500/90',
    icon: <Star className="h-4 w-4 text-white" />,
  },
  course: {
    bg: 'from-amber-600/90 via-amber-500/90 to-orange-500/90',
    icon: <Trophy className="h-4 w-4 text-white" />,
  },
}

export function GameNotificationQueue({
  notifications,
  onRemove,
}: GameNotificationQueueProps) {
  useEffect(() => {
    if (notifications.length === 0) return

    const timer = setTimeout(() => {
      onRemove(notifications[0].id)
    }, 3500)

    return () => clearTimeout(timer)
  }, [notifications, onRemove])

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-24 right-4 z-50 space-y-2 w-72 pointer-events-none">
      <AnimatePresence>
        {notifications.slice(0, 3).map((notification, index) => {
          const styles = typeStyles[notification.type || 'xp'] || typeStyles.xp

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto rounded-xl p-4 shadow-xl text-white bg-gradient-to-r ${styles.bg} backdrop-blur border border-white/10`}
              style={{
                opacity: 1 - index * 0.15,
                transform: `scale(${1 - index * 0.05})`,
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{styles.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold leading-tight">
                    {notification.title}
                  </p>
                  <p className="text-xs text-white/80">{notification.description}</p>
                  {notification.meta?.value !== undefined && (
                    <div className="mt-2 text-sm font-semibold">
                      +{notification.meta.value}{' '}
                      {notification.meta.unit || 'XP'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

