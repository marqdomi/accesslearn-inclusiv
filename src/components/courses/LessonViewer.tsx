import { useState } from 'react'
import { Lesson, LessonContentBlock } from '@/lib/lesson-types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Check, Trophy } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'
import { useXP } from '@/hooks/use-xp'
import { toast } from 'sonner'

import { WelcomeBlock } from './lesson-blocks/WelcomeBlock'
import { TextImageBlock } from './lesson-blocks/TextImageBlock'
import { AudioMessageBlock } from './lesson-blocks/AudioMessageBlock'
import { CodeExampleBlock } from './lesson-blocks/CodeExampleBlock'
import { ChallengeBlock } from './lesson-blocks/ChallengeBlock'

interface LessonViewerProps {
  lesson: Lesson
  onComplete: () => void
  onExit: () => void
}

export function LessonViewer({ lesson, onComplete, onExit }: LessonViewerProps) {
  const { preferences } = useAccessibilityPreferences()
  const shouldAnimate = !preferences?.reduceMotion
  const { awardXP } = useXP()
  
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)
  const [completedBlocks, setCompletedBlocks] = useState<Set<number>>(new Set())
  const [lessonCompleted, setLessonCompleted] = useState(false)

  const sortedBlocks = [...lesson.contentBlocks].sort((a, b) => a.order - b.order)
  const currentBlock = sortedBlocks[currentBlockIndex]
  const progress = Math.round(((currentBlockIndex + 1) / sortedBlocks.length) * 100)

  const handleNext = () => {
    if (currentBlockIndex < sortedBlocks.length - 1) {
      setCompletedBlocks(prev => new Set([...prev, currentBlockIndex]))
      setCurrentBlockIndex(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleChallengeComplete = (xpEarned: number) => {
    setCompletedBlocks(prev => new Set([...prev, currentBlockIndex]))
  }

  const handleLessonComplete = () => {
    setLessonCompleted(true)
    awardXP(lesson.xpReward, `Completed lesson: ${lesson.title}`)
    
    toast.success('🎉 Lesson Complete!', {
      description: `You've earned ${lesson.xpReward} XP!`,
      duration: 5000,
    })
  }

  const renderContentBlock = (block: LessonContentBlock) => {
    switch (block.type) {
      case 'welcome':
        return <WelcomeBlock content={block} />
      case 'text-and-image':
        return <TextImageBlock content={block} />
      case 'audio-message':
        return <AudioMessageBlock content={block} />
      case 'code-example':
        return <CodeExampleBlock content={block} />
      case 'challenge':
        return <ChallengeBlock content={block} onComplete={handleChallengeComplete} />
      default:
        return null
    }
  }

  if (lessonCompleted) {
    return (
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : {}}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <Card className="overflow-hidden border-2 border-success bg-gradient-to-br from-success/10 via-primary/10 to-accent/10 p-12 text-center">
            <motion.div
              initial={shouldAnimate ? { scale: 0 } : {}}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2, duration: 0.8 }}
              className="mb-6 flex justify-center"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-success to-accent">
                <Trophy size={48} weight="fill" className="text-white" aria-hidden="true" />
              </div>
            </motion.div>

            <motion.div
              initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <h2 className="text-4xl font-bold text-success">
                  Lesson Complete! 🎉
                </h2>
                <p className="text-2xl font-semibold text-foreground">
                  {lesson.title}
                </p>
              </div>

              <div className="mx-auto max-w-md space-y-4">
                <Card className="bg-card p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">XP Earned:</span>
                    <span className="text-2xl font-bold text-xp">+{lesson.xpReward} XP</span>
                  </div>
                </Card>

                <p className="text-lg text-muted-foreground">
                  Great job! You're making fantastic progress on your learning journey.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
                <Button
                  onClick={onComplete}
                  size="lg"
                  className="gap-2 text-lg"
                >
                  Continue to Next Lesson
                  <ArrowRight size={24} aria-hidden="true" />
                </Button>
                <Button
                  onClick={onExit}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <ArrowLeft size={20} aria-hidden="true" />
                  Back to Course
                </Button>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button onClick={onExit} variant="ghost" className="gap-2">
          <ArrowLeft size={20} aria-hidden="true" />
          Back to Course
        </Button>

        <div className="text-sm text-muted-foreground">
          Chapter {lesson.chapterNumber} • {lesson.estimatedTime} min
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold">{lesson.title}</h1>
              <p className="text-base text-muted-foreground">
                Block {currentBlockIndex + 1} of {sortedBlocks.length}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-2xl font-bold text-primary">{progress}%</div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </div>
          
          <Progress 
            value={progress} 
            className="h-3"
            aria-label={`Lesson progress: ${progress}%`}
          />
        </div>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentBlockIndex}
          initial={shouldAnimate ? { opacity: 0, x: 20 } : {}}
          animate={{ opacity: 1, x: 0 }}
          exit={shouldAnimate ? { opacity: 0, x: -20 } : {}}
          transition={{ duration: 0.3 }}
        >
          {renderContentBlock(currentBlock)}
        </motion.div>
      </AnimatePresence>

      <Card className="p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentBlockIndex === 0}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowLeft size={20} aria-hidden="true" />
            Previous
          </Button>

          <div className="flex gap-3">
            {currentBlockIndex === sortedBlocks.length - 1 ? (
              <Button
                onClick={handleLessonComplete}
                size="lg"
                className="gap-2"
              >
                <Check size={20} aria-hidden="true" />
                Complete Lesson
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                size="lg"
                className="gap-2"
              >
                Next
                <ArrowRight size={20} aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap justify-center gap-2 pb-8">
        {sortedBlocks.map((block, index) => (
          <button
            key={block.id}
            onClick={() => setCurrentBlockIndex(index)}
            className={`h-3 w-3 rounded-full transition-all ${
              index === currentBlockIndex
                ? 'w-8 bg-primary'
                : completedBlocks.has(index)
                  ? 'bg-success'
                  : 'bg-muted-foreground/30'
            }`}
            aria-label={`Go to block ${index + 1}${completedBlocks.has(index) ? ' (completed)' : ''}`}
            aria-current={index === currentBlockIndex ? 'step' : undefined}
          />
        ))}
      </div>
    </div>
  )
}
