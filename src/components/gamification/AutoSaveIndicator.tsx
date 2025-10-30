import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { FloppyDisk, CheckCircle } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface AutoSaveIndicatorProps {
  lastSavedAt: number
  isSaving?: boolean
  className?: string
}

export function AutoSaveIndicator({
  lastSavedAt,
  isSaving = false,
  className = '',
}: AutoSaveIndicatorProps) {
  const [timeSinceLastSave, setTimeSinceLastSave] = useState<string>('')
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    if (lastSavedAt === 0) return

    const updateTimeSince = () => {
      const now = Date.now()
      const diffMs = now - lastSavedAt
      const diffSeconds = Math.floor(diffMs / 1000)

      if (diffSeconds < 5) {
        setTimeSinceLastSave('just now')
        setShowIndicator(true)
        setTimeout(() => setShowIndicator(false), 3000)
      } else if (diffSeconds < 60) {
        setTimeSinceLastSave(`${diffSeconds}s ago`)
      } else {
        const mins = Math.floor(diffSeconds / 60)
        setTimeSinceLastSave(`${mins}m ago`)
      }
    }

    updateTimeSince()
    const interval = setInterval(updateTimeSince, 10000)

    return () => clearInterval(interval)
  }, [lastSavedAt])

  return (
    <AnimatePresence>
      {(showIndicator || isSaving) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={className}
        >
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success-foreground border-success/20"
          >
            {isSaving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <FloppyDisk size={16} weight="fill" />
                </motion.div>
                <span className="text-sm font-medium">Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} weight="fill" />
                <span className="text-sm font-medium">Saved {timeSinceLastSave}</span>
              </>
            )}
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface ProgressCheckpointProps {
  checkpoint: {
    label: string
    savedAt: number
    location: string
  }
  onRestore?: () => void
}

export function ProgressCheckpoint({ checkpoint, onRestore }: ProgressCheckpointProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 1000 / 60)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`

    return date.toLocaleDateString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 border-2 border-primary/20 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FloppyDisk size={20} className="text-primary" weight="fill" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Progress Saved</h4>
            <p className="text-sm text-muted-foreground mt-0.5">
              {checkpoint.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(checkpoint.savedAt)}
            </p>
          </div>
        </div>
        {onRestore && (
          <button
            onClick={onRestore}
            className="text-sm text-primary hover:underline font-medium"
          >
            Resume
          </button>
        )}
      </div>
    </motion.div>
  )
}
