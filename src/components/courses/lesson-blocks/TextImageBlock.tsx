import { TextImageContent } from '@/lib/lesson-types'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'

interface TextImageBlockProps {
  content: TextImageContent
}

export function TextImageBlock({ content }: TextImageBlockProps) {
  const { preferences } = useAccessibilityPreferences()
  const shouldAnimate = !preferences?.reduceMotion

  return (
    <Card className="overflow-hidden p-8">
      <motion.div
        initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <h3 className="text-2xl font-bold text-primary">
          {content.heading}
        </h3>

        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">
              {content.bodyText}
            </p>

            {content.audioUrl && (
              <div>
                <audio 
                  controls 
                  className="w-full"
                  aria-label="Audio narration"
                >
                  <source src={content.audioUrl} type="audio/mpeg" />
                </audio>
              </div>
            )}

            {content.captionText && (
              <details className="rounded-lg bg-muted/50 p-4">
                <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                  View Audio Caption
                </summary>
                <p className="mt-3 text-base leading-relaxed">
                  {content.captionText}
                </p>
              </details>
            )}
          </div>

          {content.imageUrl && (
            <motion.div
              initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : {}}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-lg bg-muted/30 p-6"
            >
              <img
                src={content.imageUrl}
                alt={content.imageAlt}
                className="h-auto w-full rounded-lg"
              />
              <p className="mt-3 text-sm text-muted-foreground">
                {content.imageAlt}
              </p>
            </motion.div>
          )}

          {!content.imageUrl && (
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="text-4xl" aria-hidden="true">📐</div>
                <p className="text-sm font-medium text-muted-foreground">
                  {content.imageAlt}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Card>
  )
}
