import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Target, 
  Clock, 
  Flame, 
  Lightbulb,
  Heart,
  RotateCcw,
  ChevronRight,
  Star
} from 'lucide-react'
import { QuizResults } from './QuizContainer'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

interface QuizResultsPageProps {
  results: QuizResults
  onRetry?: () => void
  onContinue?: () => void
  allowRetry?: boolean
}

export function QuizResultsPage({
  results,
  onRetry,
  onContinue,
  allowRetry = true,
}: QuizResultsPageProps) {
  const isPerfect = results.isPerfectScore
  const passed = results.accuracy >= 70

  useEffect(() => {
    if (isPerfect) {
      // Perfect score celebration
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.1, 0.9),
            y: Math.random() - 0.2,
          },
          colors: ['#FFD700', '#FFA500', '#FF6347'],
        })
      }, 250)

      return () => clearInterval(interval)
    } else if (passed) {
      // Regular pass celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [isPerfect, passed])

  const getGrade = () => {
    if (results.accuracy >= 90) return { letter: 'A', color: 'text-green-600', emoji: '🎉' }
    if (results.accuracy >= 80) return { letter: 'B', color: 'text-blue-600', emoji: '👍' }
    if (results.accuracy >= 70) return { letter: 'C', color: 'text-yellow-600', emoji: '😊' }
    if (results.accuracy >= 60) return { letter: 'D', color: 'text-orange-600', emoji: '😐' }
    return { letter: 'F', color: 'text-red-600', emoji: '😢' }
  }

  const grade = getGrade()

  const stats = [
    {
      icon: Target,
      label: 'Precisión',
      value: `${Math.round(results.accuracy)}%`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      icon: Trophy,
      label: 'XP Ganado',
      value: results.totalXP.toLocaleString(),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      icon: Clock,
      label: 'Tiempo',
      value: `${Math.floor(results.timeTaken / 60)}:${(results.timeTaken % 60).toString().padStart(2, '0')}`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      icon: Flame,
      label: 'Combo Máximo',
      value: `x${results.combo}`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      {/* Header with Grade */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Card className="p-8 text-center">
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            className="text-8xl mb-4"
          >
            {grade.emoji}
          </motion.div>

          <h1 className="text-4xl font-bold mb-2">
            {isPerfect ? '¡Puntuación Perfecta!' : passed ? '¡Quiz Completado!' : 'Quiz Finalizado'}
          </h1>

          <p className="text-xl text-muted-foreground mb-6">
            {isPerfect
              ? '¡Increíble! Todas las respuestas correctas sin perder vidas'
              : passed
              ? '¡Buen trabajo! Has aprobado el quiz'
              : 'Sigue practicando para mejorar tu puntuación'}
          </p>

          {/* Big Grade Circle */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-muted"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className={grade.color}
                  strokeDasharray={440}
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * results.accuracy) / 100 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${grade.color}`}>
                    {grade.letter}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(results.accuracy)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Perfect Score Badge */}
          {isPerfect && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              <Badge className="px-4 py-2 text-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <Star className="h-5 w-5 mr-2 fill-white" />
                Perfect Score
              </Badge>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
          >
            <Card className={`p-4 ${stat.bgColor}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-background`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Desglose de Resultados</h3>
          
          <div className="space-y-4">
            {/* Correct/Incorrect */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Respuestas Correctas</span>
                <span className="text-sm text-muted-foreground">
                  {results.correctAnswers} de {results.totalQuestions}
                </span>
              </div>
              <Progress
                value={(results.correctAnswers / results.totalQuestions) * 100}
                className="h-2"
              />
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Vidas restantes: {results.livesRemaining}</span>
              </div>
              
              {results.usedHints > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span>Pistas usadas: {results.usedHints}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-4 justify-center"
      >
        {allowRetry && onRetry && !isPerfect && (
          <Button variant="outline" size="lg" onClick={onRetry} className="gap-2">
            <RotateCcw className="h-5 w-5" />
            Reintentar (-20% XP)
          </Button>
        )}
        
        {onContinue && (
          <Button size="lg" onClick={onContinue} className="gap-2">
            Continuar
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </motion.div>
    </div>
  )
}
