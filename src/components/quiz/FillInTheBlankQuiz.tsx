import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FillBlankQuestion {
  text: string // Texto con {blank} donde van los espacios
  blanks: string[] // Respuestas correctas para cada blank
  options: string[] // Todas las opciones disponibles (correctas + distractores)
  explanation?: string
}

interface FillInTheBlankQuizProps {
  question: FillBlankQuestion
  onAnswer: (isCorrect: boolean, selectedAnswers: string[]) => void
  isAnswered: boolean
  selectedAnswers: string[]
}

export function FillInTheBlankQuiz({
  question,
  onAnswer,
  isAnswered,
  selectedAnswers: initialAnswers,
}: FillInTheBlankQuizProps) {
  const [draggedOption, setDraggedOption] = useState<string | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(initialAnswers)
  const [usedOptions, setUsedOptions] = useState<Set<string>>(new Set(initialAnswers))

  // Parsear el texto y encontrar los blanks
  const parts = question.text.split(/(\{blank\})/g)
  let blankIndex = 0
  const blanksCount = question.blanks.length

  const handleDragStart = (option: string) => {
    if (isAnswered) return
    setDraggedOption(option)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (!draggedOption || isAnswered) return

    // Actualizar respuestas
    const newAnswers = [...selectedAnswers]
    const oldAnswer = newAnswers[index]
    newAnswers[index] = draggedOption

    // Actualizar opciones usadas
    const newUsedOptions = new Set(usedOptions)
    if (oldAnswer) {
      newUsedOptions.delete(oldAnswer)
    }
    newUsedOptions.add(draggedOption)

    setSelectedAnswers(newAnswers)
    setUsedOptions(newUsedOptions)
    setDraggedOption(null)

    // Verificar si todas las respuestas están completadas
    if (newAnswers.filter(Boolean).length === blanksCount) {
      setTimeout(() => {
        checkAnswers(newAnswers)
      }, 300)
    }
  }

  const handleRemoveAnswer = (index: number) => {
    if (isAnswered) return
    
    const answer = selectedAnswers[index]
    if (!answer) return

    const newAnswers = [...selectedAnswers]
    newAnswers[index] = ''

    const newUsedOptions = new Set(usedOptions)
    newUsedOptions.delete(answer)

    setSelectedAnswers(newAnswers)
    setUsedOptions(newUsedOptions)
  }

  const checkAnswers = (answers: string[]) => {
    const isCorrect = answers.every((answer, idx) => 
      answer.toLowerCase().trim() === question.blanks[idx].toLowerCase().trim()
    )
    onAnswer(isCorrect, answers)
  }

  const getBlankState = (index: number) => {
    if (!isAnswered) return 'default'
    const answer = selectedAnswers[index]
    const correct = question.blanks[index]
    return answer.toLowerCase().trim() === correct.toLowerCase().trim() ? 'correct' : 'incorrect'
  }

  return (
    <div className="space-y-6">
      {/* Question with Blanks */}
      <Card className="p-8">
        <div className="text-xl leading-relaxed flex flex-wrap items-center gap-2">
          {parts.map((part, idx) => {
            if (part === '{blank}') {
              const currentBlankIndex = blankIndex++
              const state = getBlankState(currentBlankIndex)
              const answer = selectedAnswers[currentBlankIndex]

              return (
                <motion.div
                  key={`blank-${currentBlankIndex}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, currentBlankIndex)}
                  className={cn(
                    'inline-flex items-center min-w-[120px] px-4 py-2 rounded-lg border-2 border-dashed',
                    'transition-all duration-300 relative',
                    !answer && 'border-muted-foreground/30 bg-muted/50',
                    answer && state === 'default' && 'border-primary bg-primary/10',
                    state === 'correct' && 'border-green-500 bg-green-50 dark:bg-green-950',
                    state === 'incorrect' && 'border-red-500 bg-red-50 dark:bg-red-950'
                  )}
                  whileHover={{ scale: answer && !isAnswered ? 1.05 : 1 }}
                >
                  {answer ? (
                    <div className="flex items-center gap-2 w-full justify-between">
                      <span className="font-medium">{answer}</span>
                      {!isAnswered && (
                        <button
                          onClick={() => handleRemoveAnswer(currentBlankIndex)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      {isAnswered && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        >
                          {state === 'correct' ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-600" />
                          )}
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      Arrastra aquí
                    </span>
                  )}
                </motion.div>
              )
            }
            return <span key={idx}>{part}</span>
          })}
        </div>
      </Card>

      {/* Options Bank */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <GripVertical className="h-4 w-4" />
          Arrastra las palabras a los espacios correspondientes
        </h4>
        
        <div className="flex flex-wrap gap-3">
          {question.options.map((option, idx) => {
            const isUsed = usedOptions.has(option)
            
            return (
              <motion.div
                key={idx}
                draggable={!isUsed && !isAnswered}
                onDragStart={() => handleDragStart(option)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: isUsed ? 0.3 : 1, 
                  scale: isUsed ? 0.9 : 1 
                }}
                transition={{ delay: idx * 0.05 }}
                whileHover={!isUsed && !isAnswered ? { scale: 1.1 } : {}}
                className={cn(
                  'cursor-move select-none',
                  isUsed && 'cursor-not-allowed'
                )}
              >
                <Badge
                  variant="secondary"
                  className={cn(
                    'px-4 py-2 text-base font-medium',
                    !isUsed && !isAnswered && 'hover:bg-primary hover:text-primary-foreground',
                    isUsed && 'opacity-50'
                  )}
                >
                  {option}
                </Badge>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Show correct answers if wrong */}
      <AnimatePresence>
        {isAnswered && selectedAnswers.some((answer, idx) => 
          answer.toLowerCase().trim() !== question.blanks[idx].toLowerCase().trim()
        ) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
              <div className="flex gap-3">
                <div className="flex-shrink-0 text-2xl">✏️</div>
                <div>
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    Respuestas correctas:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {question.blanks.map((blank, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {idx + 1}. {blank}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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
