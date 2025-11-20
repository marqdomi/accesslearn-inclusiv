import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  Check, 
  X, 
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Lightbulb
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScenarioOption {
  id: string
  text: string
  consequence: string
  isCorrect: boolean
  score: number // -20, 0, 10, 20, 30
  nextScenarioId?: string // Para escenarios multi-nivel
}


interface ScenarioStep {
  id: string
  situation: string
  context?: string
  image?: string
  options: ScenarioOption[]
  isEndpoint?: boolean
}

interface ScenarioQuestion {
  title: string
  description: string
  steps: ScenarioStep[]
  startStepId: string
  perfectScore: number
}

interface ScenarioSolverQuizProps {
  question: ScenarioQuestion
  onAnswer: (isCorrect: boolean, totalScore: number, perfectScore: number) => void
  isAnswered: boolean
}

export function ScenarioSolverQuiz({
  question,
  onAnswer,
  isAnswered: initialAnswered,
}: ScenarioSolverQuizProps) {
  const [currentStepId, setCurrentStepId] = useState(question.startStepId)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [path, setPath] = useState<Array<{ stepId: string; optionId: string; score: number }>>([])
  const [isFinished, setIsFinished] = useState(false)
  const [showConsequence, setShowConsequence] = useState(false)

  const currentStep = question.steps.find(s => s.id === currentStepId)
  const selectedOptionData = currentStep?.options.find(o => o.id === selectedOption)

  const handleSelectOption = (optionId: string) => {
    if (showConsequence) return
    setSelectedOption(optionId)
  }

  const handleConfirmChoice = () => {
    if (!selectedOption || !currentStep) return

    const option = currentStep.options.find(o => o.id === selectedOption)
    if (!option) return

    // Mostrar consecuencia
    setShowConsequence(true)

    // Actualizar score
    const newScore = totalScore + option.score
    setTotalScore(newScore)

    // Agregar al path
    setPath(prev => [...prev, { 
      stepId: currentStepId, 
      optionId: selectedOption, 
      score: option.score 
    }])
  }

  const handleContinue = () => {
    if (!selectedOptionData) return

    // Si hay siguiente paso, continuar
    if (selectedOptionData.nextScenarioId) {
      setCurrentStepId(selectedOptionData.nextScenarioId)
      setSelectedOption(null)
      setShowConsequence(false)
    } else {
      // Fin del escenario
      setIsFinished(true)
      const isCorrect = totalScore >= question.perfectScore * 0.7 // 70% del score perfecto
      onAnswer(isCorrect, totalScore, question.perfectScore)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 20) return 'text-green-600 bg-green-50 dark:bg-green-950'
    if (score >= 10) return 'text-blue-600 bg-blue-50 dark:bg-blue-950'
    if (score >= 0) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950'
    return 'text-red-600 bg-red-50 dark:bg-red-950'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 20) return <Check className="h-5 w-5" />
    if (score >= 10) return <ThumbsUp className="h-5 w-5" />
    if (score >= 0) return <AlertCircle className="h-5 w-5" />
    return <ThumbsDown className="h-5 w-5" />
  }

  if (!currentStep) return null

  if (isFinished) {
    const percentage = (totalScore / question.perfectScore) * 100
    const isPerfect = totalScore === question.perfectScore

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <Card className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-6xl mb-4"
          >
            {isPerfect ? '🎯' : percentage >= 70 ? '👍' : '📚'}
          </motion.div>

          <h3 className="text-2xl font-bold mb-2">
            {isPerfect ? '¡Resolución Perfecta!' : percentage >= 70 ? 'Buen Manejo' : 'Necesitas Mejorar'}
          </h3>

          <div className="flex items-center justify-center gap-4 my-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{totalScore}</div>
              <div className="text-sm text-muted-foreground">Puntos Totales</div>
            </div>
            <div className="text-2xl text-muted-foreground">/</div>
            <div className="text-center">
              <div className="text-4xl font-bold text-muted-foreground">{question.perfectScore}</div>
              <div className="text-sm text-muted-foreground">Posibles</div>
            </div>
          </div>

          <Badge className={cn('text-lg px-4 py-2', getScoreColor(percentage))}>
            {Math.round(percentage)}% de efectividad
          </Badge>
        </Card>

        {/* Path Review */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Tu recorrido de decisiones
          </h4>

          <div className="space-y-3">
            {path.map((step, idx) => {
              const stepData = question.steps.find(s => s.id === step.stepId)
              const optionData = stepData?.options.find(o => o.id === step.optionId)

              return (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="shrink-0 mt-1">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center',
                      getScoreColor(step.score)
                    )}>
                      {getScoreIcon(step.score)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium mb-1">
                      Paso {idx + 1}: {optionData?.text}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {optionData?.consequence}
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {step.score > 0 ? '+' : ''}{step.score} pts
                  </Badge>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Continue Button */}
        <div className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Haz clic en "Ver Resultados" para continuar
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Scenario Header */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">🎭</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">{currentStep.situation}</h3>
            {currentStep.context && (
              <p className="text-muted-foreground leading-relaxed">
                {currentStep.context}
              </p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Paso {path.length + 1}
            </Badge>
            <span className="text-muted-foreground">
              {totalScore} puntos acumulados
            </span>
          </div>
        </div>
      </Card>

      {/* Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground mb-3">
          ¿Qué harías en esta situación?
        </h4>

        {currentStep.options.map((option, idx) => (
          <motion.button
            key={option.id}
            onClick={() => handleSelectOption(option.id)}
            disabled={showConsequence}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              'w-full p-4 rounded-lg border-2 text-left transition-all',
              'hover:shadow-lg hover:-translate-y-1',
              'disabled:cursor-not-allowed disabled:transform-none',
              selectedOption === option.id && !showConsequence && 'border-primary bg-primary/5',
              selectedOption !== option.id && !showConsequence && 'border-border',
              showConsequence && selectedOption === option.id && 'border-primary'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                selectedOption === option.id && !showConsequence && 'bg-primary text-primary-foreground',
                selectedOption !== option.id && 'bg-muted text-muted-foreground'
              )}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="flex-1 font-medium">{option.text}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Consequence Card */}
      <AnimatePresence>
        {showConsequence && selectedOptionData && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Card className={cn('p-6', getScoreColor(selectedOptionData.score))}>
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                    {getScoreIcon(selectedOptionData.score)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Consecuencia</h4>
                    <Badge variant="outline">
                      {selectedOptionData.score > 0 ? '+' : ''}{selectedOptionData.score} puntos
                    </Badge>
                  </div>
                  <p className="leading-relaxed">
                    {selectedOptionData.consequence}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {!showConsequence ? (
          <Button
            size="lg"
            onClick={handleConfirmChoice}
            disabled={!selectedOption}
            className="gap-2"
          >
            Confirmar Decisión
            <ArrowRight className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleContinue}
            className="gap-2"
          >
            {selectedOptionData?.nextScenarioId ? 'Continuar' : 'Ver Resultados'}
            <ArrowRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
