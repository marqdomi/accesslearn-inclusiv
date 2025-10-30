import { AudioMessageContent } from '@/lib/lesson-types'
import { Card } from '@/components/ui/card'
import { SpeakerHigh } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'

interface AudioMessageBlockProps {
  content: AudioMessageContent
}

export function AudioMessageBlock({ content }: AudioMessageBlockProps) {
  const { preferences } = useAccessibilityPreferences()
  const shouldAnimate = !preferences?.reduceMotion

  return (
    <Card className="overflow-hidden border-l-4 border-secondary p-8">
      <motion.div
        initial={shouldAnimate ? { opacity: 0, x: -20 } : {}}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
            <SpeakerHigh size={24} className="text-secondary" weight="fill" aria-hidden="true" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            {content.heading}
          </h3>
        </div>

        <p className="text-lg leading-relaxed">
          {content.bodyText}
        </p>

        {content.audioUrl && (
          <div className="rounded-lg bg-muted/50 p-4">
            <audio 
              controls 
              className="w-full"
              aria-label="Audio message"
            >
              <source src={content.audioUrl} type="audio/mpeg" />
            </audio>
          </div>
        )}

        <details className="rounded-lg bg-card p-4 shadow-sm">
          <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
            View Full Transcript
          </summary>
          <p className="mt-3 text-base leading-relaxed">
            {content.captionText}
          </p>
        </details>
      </motion.div>
    </Card>
  )
}
