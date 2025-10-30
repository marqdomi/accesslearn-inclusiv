import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Quiz, QuizQuestion } from '@/lib/types'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAutoSave } from '@/hooks/use-auto-save'
import { AutoSaveIndicator } from '@/components/gamification/AutoSaveIndicator'
import {
  generateConstructiveFeedback,
  analyzeFailure,
  generateQuestionFeedback,
} from '@/lib/adaptive-feedback'
import { AdaptiveFeedbackDisplay, MultipleRemediationDisplay } from '@/components/gamification/AdaptiveFeedbackDisplay'
import { motion, AnimatePresence } from 'framer-motion'

interface AdaptiveQuizProps {
  quiz: Quiz
  courseId: string
  onComplete: (score: number, passed: boolean) => void
  onRemediation?: (resourceId: string) => void
}

export function AdaptiveQuiz({
  quiz,
  courseId,
  onComplete,
  onRemediation,
}: AdaptiveQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<(number | number[])[]>([])
  const [showResults, setShowResults] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [showQuestionFeedback, setShowQuestionFeedback] = useState(false)

  const autoSave = useAutoSave(`quiz-${quiz.id}`, {
    saveOnEveryAction: true,
    showNotifications: false,
  })

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1
  const hasAnswered = userAnswers[currentQuestionIndex] !== undefined

  const handleAnswerSelect = (answer: number) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answer
    setUserAnswers(newAnswers)
    setShowQuestionFeedback(true)

    autoSave.updateQuestionAnswer(currentQuestion.id, answer)
  }

  const handleNext = () => {
    setShowQuestionFeedback(false)
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      autoSave.updatePosition({ courseId, lessonId: quiz.id, blockId: quiz.questions[currentQuestionIndex + 1].id })
    }
  }

  const handleSubmit = () => {
    const correctCount = userAnswers.filter((answer, idx) => {
      const question = quiz.questions[idx]
      return answer === question.correctAnswer
    }).length

    const score = (correctCount / quiz.questions.length) * 100
    const passed = score >= quiz.passingScore

    setAttemptCount(attemptCount + 1)
    setShowResults(true)

    autoSave.saveNow({
      currentPosition: { courseId, lessonId: quiz.id },
      attemptData: { score, passed, attemptCount: attemptCount + 1 },
    })
  }

  const handleRetry = () => {
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setShowResults(false)
    setShowQuestionFeedback(false)
    autoSave.clearSaveState()
  }

  const handleRemediationSelect = (resourceId: string) => {
    onRemediation?.(resourceId)
  }

  if (showResults) {
    const correctCount = userAnswers.filter((answer, idx) => {
      const question = quiz.questions[idx]
      return answer === question.correctAnswer
    }).length

    const score = (correctCount / quiz.questions.length) * 100
    const passed = score >= quiz.passingScore
    const remainingAttempts = quiz.maxAttempts - attemptCount

    const feedback = generateConstructiveFeedback(
      correctCount,
      quiz.questions.length,
      attemptCount === 1,
      remainingAttempts
    )

    const failedIndices = userAnswers
      .map((answer, idx) => (answer !== quiz.questions[idx].correctAnswer ? idx : -1))
      .filter((idx) => idx !== -1)

    const analysis = analyzeFailure(quiz.questions, userAnswers, failedIndices)

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl font-bold text-primary">
              {Math.round(score)}%
            </div>
            <div className="flex-1">
              <Progress value={score} className="h-3" />
              <p className="text-sm text-muted-foreground mt-1">
                {correctCount} out of {quiz.questions.length} correct
              </p>
            </div>
            <Badge variant={passed ? 'default' : 'destructive'} className="text-lg px-4 py-2">
              {passed ? 'Passed' : 'Not Passed'}
            </Badge>
          </div>

          {passed ? (
            <AdaptiveFeedbackDisplay feedback={feedback} />
          ) : (
            <div className="space-y-6">
              <AdaptiveFeedbackDisplay feedback={feedback} />
              {analysis.suggestedRemediation.length > 0 && (
                <MultipleRemediationDisplay
                  suggestions={analysis.suggestedRemediation}
                  onSelect={(suggestion) => handleRemediationSelect(suggestion.resourceId)}
                  encouragement={analysis.encouragement}
                />
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {remainingAttempts > 0 && !passed && (
              <Button onClick={handleRetry} className="flex-1" size="lg">
                Try Again ({remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} left)
              </Button>
            )}
            <Button
              onClick={() => onComplete(score, passed)}
              variant={passed ? 'default' : 'outline'}
              className="flex-1"
              size="lg"
            >
              {passed ? 'Continue' : 'Review Answers'}
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100
  const isCorrect = userAnswers[currentQuestionIndex] === currentQuestion.correctAnswer
  const questionFeedback = showQuestionFeedback
    ? generateQuestionFeedback(currentQuestion, userAnswers[currentQuestionIndex], isCorrect)
    : null

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">{quiz.title}</h2>
              <AutoSaveIndicator lastSavedAt={autoSave.lastSavedAt} />
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-1">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
        </div>

        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>

          <RadioGroup
            value={userAnswers[currentQuestionIndex]?.toString()}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
          >
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <div
                  key={idx}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                    userAnswers[currentQuestionIndex] === idx
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                  <Label
                    htmlFor={`option-${idx}`}
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <AnimatePresence>
            {questionFeedback && showQuestionFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6"
              >
                <AdaptiveFeedbackDisplay feedback={questionFeedback} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button onClick={handleNext} disabled={!hasAnswered} size="lg">
              {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
            </Button>
          </div>
        </motion.div>
      </Card>
    </div>
  )
}
