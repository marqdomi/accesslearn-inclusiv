import { CodeExampleContent } from '@/lib/lesson-types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'
import { useState } from 'react'
import { toast } from 'sonner'

interface CodeExampleBlockProps {
  content: CodeExampleContent
}

export function CodeExampleBlock({ content }: CodeExampleBlockProps) {
  const { preferences } = useAccessibilityPreferences()
  const shouldAnimate = !preferences?.reduceMotion
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.code)
      setCopied(true)
      toast.success('Code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

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

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute right-3 top-3 z-10">
              <Button
                onClick={handleCopy}
                size="sm"
                variant="secondary"
                className="gap-2"
                aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
              >
                {copied ? (
                  <>
                    <Check size={16} weight="bold" aria-hidden="true" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} aria-hidden="true" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            
            <pre className="overflow-x-auto rounded-lg bg-foreground/5 p-6 pr-24 font-mono text-base">
              <code className="text-foreground">{content.code}</code>
            </pre>
          </div>

          <Card className="bg-accent/5 p-6">
            <h4 className="mb-3 font-semibold text-accent">Explanation:</h4>
            <p className="text-base leading-relaxed">
              {content.explanation}
            </p>
          </Card>

          {content.imageUrl && (
            <motion.div
              initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : {}}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-lg bg-muted/30 p-6"
            >
              <img
                src={content.imageUrl}
                alt={content.imageAlt || 'Code diagram'}
                className="h-auto w-full rounded-lg"
              />
              {content.imageAlt && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {content.imageAlt}
                </p>
              )}
            </motion.div>
          )}

          {!content.imageUrl && content.imageAlt && (
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="text-4xl" aria-hidden="true">🔍</div>
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
