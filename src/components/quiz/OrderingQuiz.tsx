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
  const [confirmedOrder, setConfirmedOrder] = useState<number[] | null>(null) // Orden confirmado por el usuario
  const [shuffledOptions, setShuffledOptions] = useState<{ index: number; text: string }[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

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
      setConfirmedOrder(selectedAnswer)
    }
  }, [selectedAnswer])

  // Verificar si hay cambios sin confirmar
  const hasUnconfirmedChanges = confirmedOrder === null || 
    JSON.stringify(userOrder) !== JSON.stringify(confirmedOrder)

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isAnswered) return
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', index.toString())
    // Hacer el elemento semi-transparente mientras se arrastra
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (isAnswered || draggedIndex === null) return

    const newOrder = [...userOrder]
    
    // Encontrar las posiciones actuales en userOrder
    const draggedPosition = userOrder.indexOf(draggedIndex)
    const dropPosition = userOrder.indexOf(dropIndex)

    if (draggedPosition === -1 || dropPosition === -1 || draggedPosition === dropPosition) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    // Mover el elemento arrastrado a la nueva posición
    const [removed] = newOrder.splice(draggedPosition, 1)
    newOrder.splice(dropPosition, 0, removed)

    setUserOrder(newOrder)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Botones de flecha (método alternativo)
  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    if (isAnswered) return

    const newOrder = [...userOrder]
    const draggedPosition = fromIndex
    const targetIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1

    if (targetIndex < 0 || targetIndex >= newOrder.length) return

    // Intercambiar posiciones
    ;[newOrder[draggedPosition], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[draggedPosition]]
    setUserOrder(newOrder)
  }

  const handleConfirm = () => {
    if (isAnswered) return

    // Confirmar el orden actual
    setConfirmedOrder([...userOrder])

    // Convertir el orden del usuario (índices en shuffledOptions) al orden original
    // userOrder contiene los índices de shuffledOptions
    // Necesitamos mapear estos índices a los índices originales de question.options
    const originalIndices = userOrder.map((shuffledIndex) => shuffledOptions[shuffledIndex].index)
    
    // Comparar con el orden correcto
    const isCorrect = JSON.stringify(originalIndices) === JSON.stringify(question.correctAnswer)
    
    onAnswer(isCorrect, originalIndices)
  }

  // Función para verificar si el orden confirmado es correcto
  const getIsCorrect = () => {
    if (!isAnswered || !confirmedOrder) return false
    const originalIndices = confirmedOrder.map((shuffledIndex) => shuffledOptions[shuffledIndex].index)
    return JSON.stringify(originalIndices) === JSON.stringify(question.correctAnswer)
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold leading-relaxed">
          {question.question}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Arrastra los elementos para ordenarlos correctamente. También puedes usar las flechas para moverlos. 
          Cuando estés seguro de tu orden, haz clic en "Confirmar Orden".
        </p>
      </Card>

      {/* Ordering Interface */}
      <div className="space-y-3">
        {userOrder.map((shuffledIndex, position) => {
          const option = shuffledOptions[shuffledIndex]
          if (!option) return null

          const isDragging = draggedIndex === shuffledIndex
          const isDragOver = dragOverIndex === shuffledIndex
          // Solo mostrar feedback si está confirmado y ya respondido
          // Comparar el índice original de la opción en esta posición con el correcto
          let isCorrectPosition: boolean | null = null
          if (isAnswered && confirmedOrder) {
            const originalIndexAtPosition = shuffledOptions[confirmedOrder[position]]?.index
            const correctOriginalIndex = question.correctAnswer[position]
            isCorrectPosition = originalIndexAtPosition === correctOriginalIndex
          }

          return (
            <motion.div
              key={`order-${position}-${shuffledIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isDragging ? 0.5 : 1, 
                y: 0,
                scale: isDragOver ? 1.02 : 1
              }}
              transition={{ delay: position * 0.05 }}
              draggable={!isAnswered}
              onDragStart={(e) => handleDragStart(e as any, shuffledIndex)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e as any, shuffledIndex)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e as any, shuffledIndex)}
              className={cn(
                'cursor-move select-none',
                isAnswered && 'cursor-not-allowed'
              )}
            >
              <Card
                className={cn(
                  'p-4 border-2 transition-all duration-200',
                  !isAnswered && 'hover:shadow-lg hover:border-primary/50',
                  isDragging && 'opacity-50 scale-95',
                  isDragOver && 'border-primary bg-primary/10 scale-105',
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
                    {position + 1}
                  </div>

                  {/* Grip Icon - Visual indicator for drag */}
                  {!isAnswered && (
                    <div className="flex-shrink-0">
                      <GripVertical className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}

                  {/* Option Text */}
                  <span className="flex-1 text-base font-medium">
                    {option.text}
                  </span>

                  {/* Move Controls (Alternative method) */}
                  {!isAnswered && (
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => moveItem(position, 'up')}
                        disabled={position === 0}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => moveItem(position, 'down')}
                        disabled={position === userOrder.length - 1}
                        onMouseDown={(e) => e.stopPropagation()}
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
                        className="flex-shrink-0"
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

      {/* Confirm Button */}
      {!isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <Button 
            size="lg" 
            onClick={handleConfirm}
            disabled={userOrder.length === 0}
            className={cn(
              hasUnconfirmedChanges && 'animate-pulse'
            )}
          >
            {hasUnconfirmedChanges ? 'Confirmar Orden' : 'Verificar Respuesta'}
          </Button>
        </motion.div>
      )}

      {/* Hint: Show that changes are pending */}
      {!isAnswered && hasUnconfirmedChanges && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground text-center"
        >
          <p>Has realizado cambios. Confirma tu orden antes de continuar.</p>
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
