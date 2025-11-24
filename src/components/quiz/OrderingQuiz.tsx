import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, X, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderingQuestion {
  question: string
  options: string[]
  correctAnswer: number[] // Array de índices en el orden correcto [0, 1, 2, 3]
  explanation?: string
}

interface OrderingQuizProps {
  question: OrderingQuestion
  onAnswer: (isCorrect: boolean, userOrder: number[]) => void
  isAnswered: boolean
  selectedAnswer: number[] | null
}

export function OrderingQuiz({
  question,
  onAnswer,
  isAnswered,
  selectedAnswer,
}: OrderingQuizProps) {
  // Estado para el orden actual del usuario (índices de las opciones)
  const [userOrder, setUserOrder] = useState<number[]>([])
  const [shuffledOptions, setShuffledOptions] = useState<{ index: number; text: string }[]>([])

  // Inicializar: mezclar opciones y crear orden inicial
  useEffect(() => {
    if (question.options.length === 0) return

    // Crear array con índices y textos
    const optionsWithIndex = question.options.map((text, index) => ({
      index,
      text,
    }))

    // Mezclar aleatoriamente
    const shuffled = [...optionsWithIndex].sort(() => Math.random() - 0.5)
    setShuffledOptions(shuffled)
    
    // El orden inicial del usuario es el orden mezclado
    setUserOrder(shuffled.map((_, i) => i))
  }, [question.options])

  // Si ya hay una respuesta seleccionada (al recargar o revisar), restaurarla
  useEffect(() => {
    if (selectedAnswer && selectedAnswer.length > 0 && userOrder.length === 0) {
      setUserOrder(selectedAnswer)
    }
  }, [selectedAnswer])

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    if (isAnswered) return

    const newOrder = [...userOrder]
    const targetIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1

    if (targetIndex < 0 || targetIndex >= newOrder.length) return

    // Intercambiar posiciones
    ;[newOrder[fromIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[fromIndex]]
    setUserOrder(newOrder)
  }

  const handleSubmit = () => {
    if (isAnswered) return

    // Convertir el orden del usuario (índices en shuffledOptions) al orden original
    // userOrder contiene los índices de shuffledOptions
    // Necesitamos mapear estos índices a los índices originales de question.options
    const originalIndices = userOrder.map((shuffledIndex) => shuffledOptions[shuffledIndex].index)
    
    // Comparar con el orden correcto
    const isCorrect = JSON.stringify(originalIndices) === JSON.stringify(question.correctAnswer)
    
    onAnswer(isCorrect, originalIndices)
  }

  const isCorrect = () => {
    if (!isAnswered || !selectedAnswer) return false
    return JSON.stringify(selectedAnswer) === JSON.stringify(question.correctAnswer)
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold leading-relaxed">
          {question.question}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Ordena los elementos arrastrándolos o usando las flechas para colocarlos en el orden correcto.
        </p>
      </Card>

      {/* Ordering Interface */}
      <div className="space-y-3">
        {shuffledOptions.map((option, displayIndex) => {
          const position = userOrder.indexOf(displayIndex) + 1
          const isCorrectPosition = isAnswered && selectedAnswer
            ? selectedAnswer[position - 1] === question.correctAnswer[position - 1]
            : null

          return (
            <motion.div
              key={displayIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: displayIndex * 0.1 }}
            >
              <Card
                className={cn(
                  'p-4 border-2 transition-all',
                  !isAnswered && 'hover:shadow-md cursor-move',
                  isAnswered && isCorrectPosition === true && 'border-green-500 bg-green-50 dark:bg-green-950',
                  isAnswered && isCorrectPosition === false && 'border-red-500 bg-red-50 dark:bg-red-950',
                  isAnswered && isCorrectPosition === null && 'opacity-50'
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Position Number */}
                  <div
                    className={cn(
                      'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors',
                      !isAnswered && 'bg-primary text-primary-foreground',
                      isAnswered && isCorrectPosition === true && 'bg-green-500 text-white',
                      isAnswered && isCorrectPosition === false && 'bg-red-500 text-white',
                      isAnswered && isCorrectPosition === null && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {position}
                  </div>

                  {/* Grip Icon */}
                  {!isAnswered && (
                    <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}

                  {/* Option Text */}
                  <span className="flex-1 text-base font-medium">
                    {option.text}
                  </span>

                  {/* Move Controls */}
                  {!isAnswered && (
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => moveItem(position - 1, 'up')}
                        disabled={position === 1}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => moveItem(position - 1, 'down')}
                        disabled={position === shuffledOptions.length}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Check/X Icon */}
                  <AnimatePresence>
                    {isAnswered && isCorrectPosition !== null && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        {isCorrectPosition ? (
                          <Check className="h-6 w-6 text-green-600" />
                        ) : (
                          <X className="h-6 w-6 text-red-600" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Submit Button */}
      {!isAnswered && (
        <div className="flex justify-end">
          <Button size="lg" onClick={handleSubmit}>
            Verificar Orden
          </Button>
        </div>
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

