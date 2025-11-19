import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface XPAnimationProps {
  xp: number
  onComplete?: () => void
}

export function XPAnimation({ xp, onComplete }: XPAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1, 0.8],
        y: [20, -60, -80, -100]
      }}
      transition={{ 
        duration: 2,
        times: [0, 0.3, 0.6, 1],
        ease: "easeOut"
      }}
      onAnimationComplete={onComplete}
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
        <Sparkles className="h-6 w-6" />
        <span className="text-2xl font-bold">+{xp} XP</span>
        <Sparkles className="h-6 w-6" />
      </div>
    </motion.div>
  )
}
