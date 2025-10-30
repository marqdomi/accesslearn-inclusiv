import { useState } from 'react'
import { ChallengeContent } from '@/lib/lesson-types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Sparkle, LightbulbFilament } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'
import { useXP } from '@/hooks/use-xp'
import { toast } from 'sonner'

interface ChallengeBlockProps {
  content: ChallengeContent
  onComplete?: (xpEarned: number) => void
}

export function ChallengeBlock({ content, onComplete }: ChallengeBlockProps) {
  const { preferences } = useAccessibilityPreferences()
  const shouldAnimate = !preferences?.reduceMotion
  const { awardXP } = useXP()
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleOptionSelect = (optionId: string) => {
    if (completed) return
    
    const option = content.options.find(opt => opt.id === optionId)
    if (!option) return

    setSelectedOption(optionId)
    setAttempts(prev => prev + 1)

    if (option.isCorrect) {
      setFeedback('correct')
      setCompleted(true)
      
      const xpReward = content.feedback.correct.xpReward
      awardXP(xpReward, `Completed challenge: ${content.question.substring(0, 50)}...`)
      
      toast.success(content.feedback.correct.visual, {
        description: content.feedback.correct.captionText,
      })

      if (onComplete) {
        onComplete(xpReward)
      }
    } else {
      setFeedback('incorrect')
      
      if (attempts >= 1 && content.feedback.incorrect.hint) {
        setShowHint(true)
      }
    }
  }

  const handleTryAgain = () => {
    setSelectedOption(null)
    setFeedback(null)
  }

  return (
    <Card className="overflow-hidden border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-8">
      <motion.div
        initial={shouldAnimate ? { opacity: 0, scale: 0.95 } : {}}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-start gap-4">
          <motion.div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-white"
            animate={shouldAnimate ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Sparkle size={24} weight="fill" aria-hidden="true" />
          </motion.div>
          
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-bold text-accent">
              Interactive Challenge {attempts > 0 && `(Attempt ${attempts})`}
            </h3>
            <p className="text-lg font-medium leading-relaxed text-foreground">
              {content.question}
            </p>
            {content.instruction && (
              <p className="text-base text-muted-foreground">
                {content.instruction}
              </p>
            )}
          </div>
        </div>

        <div 
          className="space-y-3"
          role="radiogroup"
          aria-label={content.question}
        >
          {content.options.map((option, index) => {
            const isSelected = selectedOption === option.id
            const showCorrect = isSelected && feedback === 'correct'
            const showIncorrect = isSelected && feedback === 'incorrect'

            return (
              <motion.div
                key={option.id}
                initial={shouldAnimate ? { opacity: 0, x: -20 } : {}}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Button
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={completed && !isSelected}
                  variant={showCorrect ? 'default' : showIncorrect ? 'destructive' : 'outline'}
                  size="lg"
                  className={`h-auto w-full justify-start gap-4 px-6 py-4 text-left ${
                    showCorrect
                      ? 'border-2 border-success bg-success/10 text-success-foreground hover:bg-success/20'
                      : showIncorrect
                        ? 'border-2 border-destructive bg-destructive/10'
                        : isSelected
                          ? 'border-2 border-primary'
                          : ''
                  } ${completed && !isSelected ? 'opacity-50' : ''}`}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Option ${index + 1}: ${option.text}`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background font-bold">
                    {showCorrect ? (
                      <CheckCircle size={24} weight="fill" className="text-success" aria-hidden="true" />
                    ) : showIncorrect ? (
                      <XCircle size={24} weight="fill" className="text-destructive" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="flex-1 text-base">{option.text}</span>
                </Button>
              </motion.div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {feedback === 'correct' && (
            <motion.div
              key="correct-feedback"
              initial={shouldAnimate ? { opacity: 0, y: 20, scale: 0.9 } : {}}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <Card className="border-2 border-success bg-success/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success">
                    <CheckCircle size={28} weight="fill" className="text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="text-xl font-bold text-success-foreground">
                      {content.feedback.correct.visual}
                    </h4>
                    <p className="text-base leading-relaxed text-success-foreground">
                      {content.feedback.correct.captionText}
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <Sparkle size={20} weight="fill" className="text-xp" aria-hidden="true" />
                      <span className="font-bold text-xp">
                        +{content.feedback.correct.xpReward} XP
                      </span>
                    </div>
                    {content.feedback.correct.badge && (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-semibold text-accent-foreground">
                        🏆 Badge Unlocked: Tag Master
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {feedback === 'incorrect' && (
            <motion.div
              key="incorrect-feedback"
              initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Card className="border-2 border-destructive/50 bg-destructive/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/20">
                    <XCircle size={28} weight="fill" className="text-destructive" aria-hidden="true" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="text-xl font-bold text-destructive-foreground">
                      {content.feedback.incorrect.visual}
                    </h4>
                    <p className="text-base leading-relaxed text-foreground">
                      {content.feedback.incorrect.captionText}
                    </p>
                  </div>
                </div>
              </Card>

              {showHint && content.feedback.incorrect.hint && (
                <motion.div
                  initial={shouldAnimate ? { opacity: 0, y: 10 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-2 border-accent/50 bg-accent/10 p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
                        <LightbulbFilament size={24} weight="fill" className="text-white" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h4 className="mb-2 font-bold text-accent-foreground">Hint:</h4>
                        <p className="text-base leading-relaxed">
                          {content.feedback.incorrect.hint}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={handleTryAgain}
                  size="lg"
                  variant="default"
                  className="gap-2"
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Card>
  )
}
