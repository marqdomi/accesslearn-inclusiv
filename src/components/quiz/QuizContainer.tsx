import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Lightbulb, 
  Timer, 
  Flame,
  ChevronRight,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'fill-blank'
  question: any
  xpReward: number
  hintsAvailable?: number
}

interface QuizContainerProps {
  questions: QuizQuestion[]
  onComplete: (results: QuizResults) => void
  maxLives?: number
  timeLimit?: number // segundos, opcional
  showTimer?: boolean
  allowHints?: boolean
}

export interface QuizResults {
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  totalXP: number
  accuracy: number
  timeTaken: number
  isPerfectScore: boolean
  usedHints: number
  livesRemaining: number
  combo: number
}

export function QuizContainer({
  questions,
  onComplete,
  maxLives = 3,
  timeLimit,
  showTimer = false,
  allowHints = true,
}: QuizContainerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [lives, setLives] = useState(maxLives)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showNextButton, setShowNextButton] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  // Timer
  useEffect(() => {
    if (!showTimer) return

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [showTimer])

  const handleAnswer = (isCorrect: boolean) => {
    setIsAnswered(true)

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1)
      setCombo((prev) => {
        const newCombo = prev + 1
        setMaxCombo(Math.max(maxCombo, newCombo))
        return newCombo
      })

      // Calcular XP con multiplicador de combo
      const comboMultiplier = 1 + (combo * 0.1)
      const questionXP = Math.floor(currentQuestion.xpReward * comboMultiplier)
      setEarnedXP((prev) => prev + questionXP)
    } else {
      setIncorrectCount((prev) => prev + 1)
      setCombo(0)
      setLives((prev) => Math.max(0, prev - 1))
    }

    setShowNextButton(true)

    // Game over si se acaban las vidas
    if (lives === 1 && !isCorrect) {
      setTimeout(() => {
        finishQuiz()
      }, 2000)
    }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      finishQuiz()
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
      setIsAnswered(false)
      setShowNextButton(false)
    }
  }

  const handleHint = () => {
    if (!allowHints || hintsUsed >= 3) return
    setHintsUsed((prev) => prev + 1)
    // TODO: Implementar lógica de mostrar hint
    // Por ahora solo incrementa el contador
  }

  const finishQuiz = () => {
    const results: QuizResults = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      totalXP: earnedXP,
      accuracy: (correctCount / questions.length) * 100,
      timeTaken: timeElapsed,
      isPerfectScore: correctCount === questions.length && lives === maxLives,
      usedHints: hintsUsed,
      livesRemaining: lives,
      combo: maxCombo,
    }
    onComplete(results)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header: Progress, Lives, Timer, Stats */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Pregunta {currentQuestionIndex + 1} de {questions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Lives */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: maxLives }).map((_, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 1 }}
                    animate={
                      idx >= lives
                        ? { scale: [1, 1.2, 0.8], opacity: 0.3 }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <Heart
                      className={cn(
                        'h-6 w-6',
                        idx < lives
                          ? 'fill-red-500 text-red-500'
                          : 'fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700'
                      )}
                    />
                  </motion.div>
                ))}
              </div>
              <span className="text-sm font-medium">{lives} vidas</span>
            </div>

            {/* Combo */}
            {combo > 1 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950"
              >
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                  Combo x{combo}
                </span>
              </motion.div>
            )}

            {/* Timer */}
            {showTimer && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span className="text-sm font-mono">{formatTime(timeElapsed)}</span>
              </div>
            )}

            {/* Hints */}
            {allowHints && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleHint}
                disabled={hintsUsed >= 3 || isAnswered}
                className="gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Pista ({3 - hintsUsed})
              </Button>
            )}

            {/* Score */}
            <Badge variant="secondary" className="text-sm font-mono">
              {earnedXP} XP
            </Badge>
          </div>
        </div>
      </Card>

      {/* Question Content - Slot para el tipo de quiz específico */}
      <div className="min-h-[400px]">
        {/* Aquí se renderizará el componente de quiz específico desde el padre */}
        <slot />
      </div>

      {/* Next Button */}
      <AnimatePresence>
        {showNextButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-end"
          >
            <Button
              size="lg"
              onClick={handleNext}
              className="gap-2"
            >
              {isLastQuestion ? 'Ver Resultados' : 'Siguiente Pregunta'}
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
        {lives === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <Card className="p-8 max-w-md text-center space-y-4">
              <div className="text-6xl mb-4">💔</div>
              <h2 className="text-2xl font-bold">Se acabaron las vidas</h2>
              <p className="text-muted-foreground">
                Has completado {correctCount} de {questions.length} preguntas correctamente.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={finishQuiz} variant="outline">
                  Ver Resultados
                </Button>
                <Button onClick={() => window.location.reload()}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
