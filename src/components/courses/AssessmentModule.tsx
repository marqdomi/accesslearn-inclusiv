import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Assessment } from '@/lib/types'
import { Check, X, House, ArrowRight } from '@phosphor-icons/react'

interface AssessmentModuleProps {
  assessments: Assessment[]
  onComplete: (score: number) => void
  onReturnToDashboard?: () => void
  onNextCourse?: () => void
  isAlreadyCompleted?: boolean
}

export function AssessmentModule({ assessments, onComplete, onReturnToDashboard, onNextCourse, isAlreadyCompleted = false }: AssessmentModuleProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const assessment = assessments[currentQuestion]

  const handleSubmit = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === assessment.correctAnswer
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1)
    }
    setShowFeedback(true)
  }

  const handleNext = () => {
    if (currentQuestion < assessments.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      const score = Math.round((correctAnswers / assessments.length) * 100)
      setIsComplete(true)
      onComplete(score)
    }
  }

  if (isComplete) {
    const score = Math.round((correctAnswers / assessments.length) * 100)
    const passed = score >= 70
    
    return (
      <Card className="p-8">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Assessment Complete!</h2>
          <p className="mb-6 text-4xl font-bold text-primary">{score}%</p>
          <p className="mb-4 text-lg">
            You answered {correctAnswers} out of {assessments.length} questions correctly.
          </p>
          {passed ? (
            <Alert className="mb-6 border-success bg-success/10">
              <Check size={20} className="text-success" />
              <AlertDescription className="text-base">
                Congratulations! You passed the assessment.
                {isAlreadyCompleted && (
                  <span className="block mt-2 text-sm text-muted-foreground">
                    Note: XP is only awarded on your first successful completion.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-6 border-destructive bg-destructive/10">
              <X size={20} className="text-destructive" />
              <AlertDescription className="text-base">
                You need 70% to pass. Please review the material and try again.
              </AlertDescription>
            </Alert>
          )}

          {passed && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              {onReturnToDashboard && (
                <Button 
                  onClick={onReturnToDashboard}
                  size="lg"
                  variant="outline"
                  className="gap-2"
                >
                  <House size={20} aria-hidden="true" />
                  Return to Dashboard
                </Button>
              )}
              {onNextCourse && (
                <Button 
                  onClick={onNextCourse}
                  size="lg"
                  className="gap-2"
                >
                  Start Next Mission
                  <ArrowRight size={20} aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {assessments.length}
        </p>
        <h2 className="mt-2 text-2xl font-semibold">{assessment.question}</h2>
      </div>

      <div className="space-y-3">
        {assessment.options.map((option, index) => (
          <button
            key={index}
            onClick={() => !showFeedback && setSelectedAnswer(index)}
            disabled={showFeedback}
            className={`w-full rounded-lg border-2 p-6 text-left text-lg transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              selectedAnswer === index
                ? showFeedback
                  ? index === assessment.correctAnswer
                    ? 'border-success bg-success/10'
                    : 'border-destructive bg-destructive/10'
                  : 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            aria-pressed={selectedAnswer === index}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                  selectedAnswer === index
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border'
                }`}
              >
                {String.fromCharCode(65 + index)}
              </div>
              <span className="flex-1">{option}</span>
              {showFeedback && index === assessment.correctAnswer && (
                <Check size={24} weight="bold" className="shrink-0 text-success" aria-label="Correct answer" />
              )}
              {showFeedback && selectedAnswer === index && index !== assessment.correctAnswer && (
                <X size={24} weight="bold" className="shrink-0 text-destructive" aria-label="Incorrect answer" />
              )}
            </div>
          </button>
        ))}
      </div>

      {showFeedback && (
        <Alert className={selectedAnswer === assessment.correctAnswer ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'}>
          <AlertDescription className="text-base leading-relaxed">
            {assessment.explanation}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        {!showFeedback ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            size="lg"
            className="w-full"
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext} size="lg" className="w-full">
            {currentQuestion < assessments.length - 1 ? 'Next Question' : 'Finish Assessment'}
          </Button>
        )}
      </div>
    </div>
  )
}
