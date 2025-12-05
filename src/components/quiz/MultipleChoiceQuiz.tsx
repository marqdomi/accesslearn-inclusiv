import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultipleChoiceQuestion {
  question: string
  options: string[]
  correctAnswer: number // índice de la respuesta correcta
  explanation?: string
}

interface MultipleChoiceQuizProps {
  question: MultipleChoiceQuestion
  onAnswer: (isCorrect: boolean, selectedIndex: number) => void
  isAnswered: boolean
  selectedAnswer: number | null
}

export function MultipleChoiceQuiz({
  question,
  onAnswer,
  isAnswered,
  selectedAnswer: initialSelectedAnswer,
}: MultipleChoiceQuizProps) {
  const [hoveredOption, setHoveredOption] = useState<number | null>(null)
  const [pendingAnswer, setPendingAnswer] = useState<number | null>(
    initialSelectedAnswer !== null ? initialSelectedAnswer : null
  )

  const handleOptionClick = (index: number) => {
    if (isAnswered) return
    setPendingAnswer(index)
  }

  const handleConfirm = () => {
    if (isAnswered || pendingAnswer === null) return
    const isCorrect = pendingAnswer === question.correctAnswer
    onAnswer(isCorrect, pendingAnswer)
  }

  const getOptionState = (index: number) => {
    if (!isAnswered) {
      // Antes de confirmar, mostrar qué está seleccionado
      if (pendingAnswer === index) return 'selected'
      return 'default'
    }
    // Después de confirmar, mostrar si es correcto o incorrecto
    if (index === question.correctAnswer) return 'correct'
    if (index === initialSelectedAnswer && index !== question.correctAnswer) return 'incorrect'
    return 'default'
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold leading-relaxed">
          {question.question}
        </h3>
      </Card>

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((option, index) => {
          const state = getOptionState(index)
          const isSelected = pendingAnswer === index || (isAnswered && initialSelectedAnswer === index)
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => handleOptionClick(index)}
                disabled={isAnswered}
                onMouseEnter={() => setHoveredOption(index)}
                onMouseLeave={() => setHoveredOption(null)}
                  className={cn(
                    'w-full p-4 rounded-lg border-2 text-left transition-all duration-300',
                    'hover:shadow-lg transform hover:-translate-y-1',
                    'disabled:cursor-not-allowed disabled:transform-none',
                    state === 'default' && 'border-border bg-card hover:border-primary/50',
                    state === 'selected' && 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/50',
                    state === 'correct' && 'border-green-500 bg-green-50 dark:bg-green-950',
                    state === 'incorrect' && 'border-red-500 bg-red-50 dark:bg-red-950',
                    isAnswered && state === 'default' && 'opacity-50'
                  )}
              >
                <div className="flex items-center gap-4">
                  {/* Letter Badge */}
                  <div
                    className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors',
                      state === 'default' && 'bg-muted text-muted-foreground',
                      state === 'selected' && 'bg-primary text-primary-foreground ring-2 ring-primary/50',
                      state === 'correct' && 'bg-green-500 text-white',
                      state === 'incorrect' && 'bg-red-500 text-white',
                      hoveredOption === index && !isAnswered && state !== 'selected' && 'bg-primary/50 text-primary-foreground'
                    )}
                  >
                    {state === 'selected' && !isAnswered ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </div>

                  {/* Option Text */}
                  <span className="flex-1 text-base">
                    {option}
                  </span>

                  {/* Check/X Icon */}
                  <AnimatePresence>
                    {isAnswered && state !== 'default' && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        {state === 'correct' ? (
                          <Check className="h-6 w-6 text-green-600" />
                        ) : (
                          <X className="h-6 w-6 text-red-600" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Confirm Button */}
      {!isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handleConfirm}
            disabled={pendingAnswer === null}
            size="lg"
            className="w-full"
            variant={pendingAnswer !== null ? 'default' : 'outline'}
          >
            {pendingAnswer === null 
              ? 'Selecciona una opción para continuar'
              : `Confirmar Respuesta: ${String.fromCharCode(65 + pendingAnswer)}`
            }
          </Button>
        </motion.div>
      )}

      {/* Explanation */}
      <AnimatePresence>
        {isAnswered && question.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3 }}
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
