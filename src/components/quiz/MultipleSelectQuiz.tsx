import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

interface MultipleSelectQuestion {
  question: string
  options: string[]
  correctAnswer: number[] // array de índices de respuestas correctas
  explanation?: string
}

interface MultipleSelectQuizProps {
  question: MultipleSelectQuestion
  onAnswer: (isCorrect: boolean, selectedIndices: number[]) => void
  isAnswered: boolean
  selectedAnswers: number[] | null
}

export function MultipleSelectQuiz({
  question,
  onAnswer,
  isAnswered,
  selectedAnswers,
}: MultipleSelectQuizProps) {
  const [hoveredOption, setHoveredOption] = useState<number | null>(null)
  const [localSelected, setLocalSelected] = useState<number[]>(selectedAnswers || [])

  const handleOptionToggle = (index: number) => {
    if (isAnswered) return
    
    const newSelected = localSelected.includes(index)
      ? localSelected.filter(i => i !== index)
      : [...localSelected, index]
    
    setLocalSelected(newSelected)
  }

  const handleConfirm = () => {
    if (isAnswered || localSelected.length === 0) return
    
    // Verificar si la respuesta es correcta
    const correctSet = new Set(question.correctAnswer)
    const selectedSet = new Set(localSelected)
    
    // La respuesta es correcta si tienen el mismo tamaño y todos los seleccionados son correctos
    const isCorrect = correctSet.size === selectedSet.size && 
                     localSelected.every(i => correctSet.has(i))
    
    onAnswer(isCorrect, localSelected)
  }

  const getOptionState = (index: number) => {
    if (!isAnswered) {
      return localSelected.includes(index) ? 'selected' : 'default'
    }
    
    const isCorrect = question.correctAnswer.includes(index)
    const isSelected = selectedAnswers?.includes(index) || false
    
    if (isCorrect && isSelected) return 'correct-selected'
    if (isCorrect && !isSelected) return 'correct-not-selected'
    if (!isCorrect && isSelected) return 'incorrect-selected'
    return 'default'
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold leading-relaxed mb-2">
          {question.question}
        </h3>
        <p className="text-sm text-muted-foreground">
          Selecciona todas las opciones correctas
        </p>
      </Card>

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((option, index) => {
          const state = getOptionState(index)
          const isSelected = localSelected.includes(index) || selectedAnswers?.includes(index)
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                onClick={() => !isAnswered && handleOptionToggle(index)}
                onMouseEnter={() => setHoveredOption(index)}
                onMouseLeave={() => setHoveredOption(null)}
                role="button"
                tabIndex={isAnswered ? -1 : 0}
                onKeyDown={(e) => {
                  if (!isAnswered && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    handleOptionToggle(index)
                  }
                }}
                className={cn(
                  'w-full p-4 rounded-lg border-2 text-left transition-all duration-300 cursor-pointer',
                  'hover:shadow-lg transform hover:-translate-y-1',
                  isAnswered && 'cursor-not-allowed transform-none',
                  state === 'default' && 'border-border bg-card hover:border-primary/50',
                  state === 'selected' && 'border-primary bg-primary/5',
                  state === 'correct-selected' && 'border-green-500 bg-green-50 dark:bg-green-950',
                  state === 'correct-not-selected' && 'border-green-300 bg-green-50/50 dark:bg-green-950/50 opacity-60',
                  state === 'incorrect-selected' && 'border-red-500 bg-red-50 dark:bg-red-950',
                  isAnswered && state === 'default' && 'opacity-50'
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <div 
                    className="flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isAnswered}
                      onCheckedChange={() => handleOptionToggle(index)}
                      className={cn(
                        'h-5 w-5',
                        state === 'correct-selected' && 'border-green-500 bg-green-500',
                        state === 'incorrect-selected' && 'border-red-500 bg-red-500'
                      )}
                    />
                  </div>

                  {/* Letter Badge */}
                  <div
                    className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors',
                      state === 'default' && 'bg-muted text-muted-foreground',
                      state === 'selected' && 'bg-primary text-primary-foreground',
                      state === 'correct-selected' && 'bg-green-500 text-white',
                      state === 'correct-not-selected' && 'bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-200',
                      state === 'incorrect-selected' && 'bg-red-500 text-white',
                      hoveredOption === index && !isAnswered && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>

                  {/* Option Text */}
                  <span className="flex-1 text-base">
                    {option}
                  </span>

                  {/* Check/X Icon */}
                  <AnimatePresence>
                    {isAnswered && (state === 'correct-selected' || state === 'incorrect-selected' || state === 'correct-not-selected') && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      >
                        {state === 'correct-selected' || state === 'correct-not-selected' ? (
                          <Check className="h-6 w-6 text-green-600" />
                        ) : (
                          <X className="h-6 w-6 text-red-600" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Submit Button */}
      {!isAnswered && localSelected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <Button 
            size="lg" 
            onClick={handleConfirm}
          >
            Confirmar Respuesta
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

