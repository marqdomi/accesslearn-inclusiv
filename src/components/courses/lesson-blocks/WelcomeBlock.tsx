import { WelcomeContent } from '@/lib/lesson-types'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'

interface WelcomeBlockProps {
  content: WelcomeContent
}

export function WelcomeBlock({ content }: WelcomeBlockProps) {
  const { preferences } = useAccessibilityPreferences()
  const shouldAnimate = !preferences?.reduceMotion

  return (
    <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-8">
      <motion.div
        className="flex flex-col items-center gap-6 text-center"
        initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-6xl"
          initial={shouldAnimate ? { scale: 0 } : {}}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: 200, 
            damping: 10,
            delay: 0.2 
          }}
          aria-hidden="true"
        >
          {content.character}
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={shouldAnimate ? { opacity: 0 } : {}}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative rounded-lg bg-card p-6 shadow-lg">
            <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-card" />
            <p className="text-lg leading-relaxed text-foreground">
              {content.message}
            </p>
          </div>

          {content.audioUrl && (
            <div className="flex justify-center">
              <audio 
                controls 
                className="w-full max-w-md"
                aria-label="Audio narration"
              >
                <source src={content.audioUrl} type="audio/mpeg" />
              </audio>
            </div>
          )}

          <details className="rounded-lg bg-muted/50 p-4 text-left">
            <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
              View Captions/Transcript
            </summary>
            <p className="mt-3 text-base leading-relaxed">
              {content.captionText}
            </p>
          </details>
        </motion.div>
      </motion.div>
    </Card>
  )
}
