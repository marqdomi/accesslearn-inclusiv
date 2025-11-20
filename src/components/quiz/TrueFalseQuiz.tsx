import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Check, X, ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrueFalseQuestion {
  question: string
  correctAnswer: boolean
  explanation?: string
}

interface TrueFalseQuizProps {
  question: TrueFalseQuestion
  onAnswer: (isCorrect: boolean, selectedAnswer: boolean) => void
  isAnswered: boolean
  selectedAnswer: boolean | null
}

export function TrueFalseQuiz({
  question,
  onAnswer,
  isAnswered,
  selectedAnswer,
}: TrueFalseQuizProps) {
  const [hoveredOption, setHoveredOption] = useState<'true' | 'false' | null>(null)

  const handleAnswer = (answer: boolean) => {
    if (isAnswered) return
    const isCorrect = answer === question.correctAnswer
    onAnswer(isCorrect, answer)
  }

  const getButtonState = (value: boolean) => {
    if (!isAnswered) return 'default'
    if (value === question.correctAnswer) return 'correct'
    if (value === selectedAnswer && value !== question.correctAnswer) return 'incorrect'
    return 'default'
  }

  const trueState = getButtonState(true)
  const falseState = getButtonState(false)

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <Card className="p-8 text-center">
        <h3 className="text-2xl font-semibold leading-relaxed mb-4">
          {question.question}
        </h3>
        <p className="text-muted-foreground text-sm">
          ¿Esta afirmación es verdadera o falsa?
        </p>
      </Card>

      {/* True/False Buttons */}
      <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* TRUE Button */}
        <motion.button
          onClick={() => handleAnswer(true)}
          disabled={isAnswered}
          onMouseEnter={() => setHoveredOption('true')}
          onMouseLeave={() => setHoveredOption(null)}
          whileHover={!isAnswered ? { scale: 1.05 } : {}}
          whileTap={!isAnswered ? { scale: 0.95 } : {}}
          className={cn(
            'relative p-8 rounded-2xl border-4 transition-all duration-300',
            'disabled:cursor-not-allowed flex flex-col items-center gap-4',
            trueState === 'default' && 'border-border bg-card hover:border-green-500/50 hover:shadow-xl',
            trueState === 'correct' && 'border-green-500 bg-green-50 dark:bg-green-950 shadow-2xl',
            trueState === 'incorrect' && 'border-red-500 bg-red-50 dark:bg-red-950 shadow-xl',
            isAnswered && trueState === 'default' && 'opacity-40'
          )}
        >
          {/* Icon */}
          <div
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center transition-all',
              trueState === 'default' && 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
              trueState === 'correct' && 'bg-green-500 text-white',
              trueState === 'incorrect' && 'bg-red-100 text-red-600 dark:bg-red-900',
              hoveredOption === 'true' && !isAnswered && 'scale-110'
            )}
          >
            {trueState === 'correct' ? (
              <Check className="h-10 w-10" strokeWidth={3} />
            ) : trueState === 'incorrect' ? (
              <X className="h-10 w-10" strokeWidth={3} />
            ) : (
              <ThumbsUp className="h-10 w-10" strokeWidth={2.5} />
            )}
          </div>

          {/* Label */}
          <span className="text-2xl font-bold">
            Verdadero
          </span>

          {/* Success Animation */}
          {trueState === 'correct' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              className="absolute inset-0 rounded-2xl bg-green-500/20 pointer-events-none"
            />
          )}
        </motion.button>

        {/* FALSE Button */}
        <motion.button
          onClick={() => handleAnswer(false)}
          disabled={isAnswered}
          onMouseEnter={() => setHoveredOption('false')}
          onMouseLeave={() => setHoveredOption(null)}
          whileHover={!isAnswered ? { scale: 1.05 } : {}}
          whileTap={!isAnswered ? { scale: 0.95 } : {}}
          className={cn(
            'relative p-8 rounded-2xl border-4 transition-all duration-300',
            'disabled:cursor-not-allowed flex flex-col items-center gap-4',
            falseState === 'default' && 'border-border bg-card hover:border-red-500/50 hover:shadow-xl',
            falseState === 'correct' && 'border-green-500 bg-green-50 dark:bg-green-950 shadow-2xl',
            falseState === 'incorrect' && 'border-red-500 bg-red-50 dark:bg-red-950 shadow-xl',
            isAnswered && falseState === 'default' && 'opacity-40'
          )}
        >
          {/* Icon */}
          <div
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center transition-all',
              falseState === 'default' && 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
              falseState === 'correct' && 'bg-green-500 text-white',
              falseState === 'incorrect' && 'bg-red-100 text-red-600 dark:bg-red-900',
              hoveredOption === 'false' && !isAnswered && 'scale-110'
            )}
          >
            {falseState === 'correct' ? (
              <Check className="h-10 w-10" strokeWidth={3} />
            ) : falseState === 'incorrect' ? (
              <X className="h-10 w-10" strokeWidth={3} />
            ) : (
              <ThumbsDown className="h-10 w-10" strokeWidth={2.5} />
            )}
          </div>

          {/* Label */}
          <span className="text-2xl font-bold">
            Falso
          </span>

          {/* Success Animation */}
          {falseState === 'correct' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              className="absolute inset-0 rounded-2xl bg-green-500/20 pointer-events-none"
            />
          )}
        </motion.button>
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {isAnswered && question.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <div className="flex-shrink-0 text-2xl">💡</div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Explicación
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
