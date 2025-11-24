import { useState } from 'react'
import { MultipleChoiceQuiz } from './MultipleChoiceQuiz'
import { TrueFalseQuiz } from './TrueFalseQuiz'
import { FillInTheBlankQuiz } from './FillInTheBlankQuiz'
import { OrderingQuiz } from './OrderingQuiz'
import { ScenarioSolverQuiz } from './ScenarioSolverQuiz'
import { QuizResults } from './QuizContainer'
import { QuizResultsPage } from './QuizResultsPage'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Trophy,
  Flame,
  Timer,
  Target
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'ordering' | 'scenario-solver'
  question: any
  xpReward: number
}

interface QuizLessonProps {
  title: string
  description?: string
  questions: QuizQuestion[]
  maxLives?: number
  showTimer?: boolean
  passingScore?: number
  onComplete?: (results: QuizResults) => void
}

export function QuizLesson({
  title,
  description,
  questions,
  maxLives = 3,
  showTimer = false,
  passingScore = 70,
  onComplete,
}: QuizLessonProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [lives, setLives] = useState(maxLives)
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [earnedXP, setEarnedXP] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null)
  const [scenarioPerfectScore, setScenarioPerfectScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const isScenario = currentQuestion.type === 'scenario-solver'

  // Timer effect - NO iniciar para scenarios (sin presión de tiempo)
  useState(() => {
    if (!showTimer || isScenario) return

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  })

  const handleAnswer = (isCorrect: boolean, answerOrScore: any, perfectScore?: number) => {
    setIsAnswered(true)
    setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex]))
    
    // Para scenario-solver, answerOrScore es el score total y perfectScore viene como 3er parámetro
    // Para otros tipos, answerOrScore es la respuesta del usuario
    
    if (isScenario) {
      // El scenario solver ya terminó, usar su score directamente
      const scenarioScore = answerOrScore
      setEarnedXP(scenarioScore)
      setScenarioPerfectScore(perfectScore || 100)
      
      // Considerar correcto si pasó el 70% del perfect score
      if (isCorrect) {
        setCorrectCount(1)
      } else {
        setIncorrectCount(1)
      }
      
      // No descontar vidas en scenarios
    } else {
      // Lógica tradicional para otros tipos de quiz
      setSelectedAnswer(answerOrScore)

      if (isCorrect) {
        setCorrectCount((prev) => prev + 1)
        
        // Update combo
        const newCombo = combo + 1
        setCombo(newCombo)
        setMaxCombo(Math.max(maxCombo, newCombo))

        // Calculate XP with combo multiplier
        const comboMultiplier = 1 + (combo * 0.1)
        const questionXP = Math.floor(currentQuestion.xpReward * comboMultiplier)
        setEarnedXP((prev) => prev + questionXP)
      } else {
        setIncorrectCount((prev) => prev + 1)
        setCombo(0)
        setLives((prev) => Math.max(0, prev - 1))

        // Check game over
        if (lives === 1) {
          setTimeout(() => {
            finishQuiz()
          }, 2000)
        }
      }
    }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      finishQuiz()
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
      setIsAnswered(false)
      setSelectedAnswer(null)
      // No resetear answeredQuestions aquí, queremos mantener el registro
    }
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
      usedHints: 0,
      livesRemaining: lives,
      combo: maxCombo,
    }
    
    setShowResults(true)
    
    if (onComplete) {
      onComplete(results)
    }
  }

  const handleRetry = () => {
    // Reset everything
    setCurrentQuestionIndex(0)
    setLives(maxLives)
    setCorrectCount(0)
    setIncorrectCount(0)
    setCombo(0)
    setMaxCombo(0)
    setTimeElapsed(0)
    setEarnedXP(0)
    setShowResults(false)
    setIsAnswered(false)
    setSelectedAnswer(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (showResults) {
    return (
      <QuizResultsPage
        results={{
          totalQuestions: questions.length,
          correctAnswers: correctCount,
          incorrectAnswers: incorrectCount,
          totalXP: isScenario ? earnedXP : Math.floor(earnedXP * 0.8), // Scenarios no tienen retry penalty
          accuracy: isScenario 
            ? (earnedXP / scenarioPerfectScore) * 100 // Calcular accuracy basado en score
            : (correctCount / questions.length) * 100,
          timeTaken: isScenario ? 0 : timeElapsed, // No mostrar tiempo en scenarios
          isPerfectScore: isScenario 
            ? earnedXP === scenarioPerfectScore // Perfect solo si obtuvo el 100% del score
            : correctCount === questions.length && lives === maxLives,
          usedHints: 0,
          livesRemaining: isScenario ? maxLives : lives, // Scenarios no pierden vidas
          combo: isScenario ? 0 : maxCombo, // Scenarios no tienen combo
        }}
        onRetry={handleRetry}
        allowRetry={!isScenario} // No permitir retry en scenarios (ya tienen su propio review interno)
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Target className="h-5 w-5 text-primary" />
          <Badge variant="secondary">Quiz</Badge>
        </div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </Card>

      {/* Progress Header - Hide for scenario-solver */}
      {currentQuestion.type !== 'scenario-solver' && (
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
                            : 'fill-gray-300 text-gray-300'
                        )}
                      />
                    </motion.div>
                  ))}
                </div>
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

              {/* Score */}
              <Badge variant="secondary" className="text-sm font-mono gap-1">
                <Trophy className="h-4 w-4" />
                {earnedXP} XP
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {currentQuestion.type === 'multiple-choice' && (
            <MultipleChoiceQuiz
              question={currentQuestion.question as any}
              onAnswer={handleAnswer}
              isAnswered={isAnswered}
              selectedAnswer={selectedAnswer}
            />
          )}

          {currentQuestion.type === 'true-false' && (
            <TrueFalseQuiz
              question={currentQuestion.question as any}
              onAnswer={handleAnswer}
              isAnswered={isAnswered}
              selectedAnswer={selectedAnswer as boolean | null}
            />
          )}

          {currentQuestion.type === 'fill-blank' && (
            <FillInTheBlankQuiz
              question={currentQuestion.question}
              onAnswer={handleAnswer}
              isAnswered={isAnswered}
              selectedAnswers={selectedAnswer || []}
            />
          )}

          {currentQuestion.type === 'ordering' && (
            <OrderingQuiz
              question={currentQuestion.question as any}
              onAnswer={handleAnswer}
              isAnswered={isAnswered}
              selectedAnswer={selectedAnswer as number[] | null}
            />
          )}

          {currentQuestion.type === 'scenario-solver' && (
            <ScenarioSolverQuiz
              question={currentQuestion.question}
              onAnswer={(isCorrect, score, perfectScore) => {
                // El scenario solver maneja su propio scoring
                // score = puntos obtenidos, perfectScore = máximo posible
                handleAnswer(isCorrect, score, perfectScore)
              }}
              isAnswered={isAnswered}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next/Finish Button */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-end"
          >
            <Button size="lg" onClick={handleNext}>
              {isLastQuestion ? 'Ver Resultados' : 'Siguiente Pregunta'} →
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {lives === 0 && !showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <Card className="p-8 max-w-md text-center space-y-4">
                <div className="text-6xl">💔</div>
                <h2 className="text-2xl font-bold">Se acabaron las vidas</h2>
                <p className="text-muted-foreground">
                  Completaste {correctCount} de {questions.length} preguntas correctamente.
                </p>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
