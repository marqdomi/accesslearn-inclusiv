import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Star, 
  Target, 
  BookOpen,
  Home,
  Share2,
  Download
} from 'lucide-react'
import confetti from 'canvas-confetti'

interface CourseCompletionPageProps {
  courseTitle: string
  totalXP: number
  totalLessons: number
  totalModules: number
}

export function CourseCompletionPage({
  courseTitle,
  totalXP,
  totalLessons,
  totalModules,
}: CourseCompletionPageProps) {
  const navigate = useNavigate()

  useEffect(() => {
    // Epic celebration with multiple bursts
    const duration = 5 * 1000
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

      // Burst from left and right
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00FF00', '#0080FF']
      })

      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00FF00', '#0080FF']
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const stats = [
    {
      icon: Trophy,
      label: 'XP Total Ganado',
      value: totalXP.toLocaleString(),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      icon: BookOpen,
      label: 'Lecciones Completadas',
      value: totalLessons,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      icon: Target,
      label: 'Módulos Finalizados',
      value: totalModules,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Main Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 via-background to-primary/5">
            {/* Trophy Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-50 animate-pulse" />
                <Trophy className="h-32 w-32 text-yellow-500 relative z-10" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                ¡Felicidades! 🎉
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-6">
                Curso Completado
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Has finalizado exitosamente <span className="font-semibold text-foreground">"{courseTitle}"</span>
              </p>
            </motion.div>

            {/* Perfect Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="flex justify-center mb-8"
            >
              <Badge className="px-6 py-3 text-lg bg-linear-to-r from-yellow-400 to-orange-500 text-white">
                <Star className="h-6 w-6 mr-2 fill-white" />
                Curso Completado al 100%
              </Badge>
            </motion.div>

            {/* Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="border-l-4 border-primary pl-6 py-4 text-left max-w-2xl mx-auto mb-8"
            >
              <p className="text-lg italic text-muted-foreground">
                "El aprendizaje es un tesoro que seguirá a su dueño a todas partes."
              </p>
              <p className="text-sm text-muted-foreground mt-2">— Proverbio Chino</p>
            </motion.div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + idx * 0.1 }}
            >
              <Card className={`p-6 ${stat.bgColor}`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-background">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <Home className="h-5 w-5" />
            Volver al Dashboard
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              // TODO: Implement certificate download
              alert('Función de certificado próximamente')
            }}
            className="gap-2"
          >
            <Download className="h-5 w-5" />
            Descargar Certificado
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              // TODO: Implement share functionality
              alert('Función de compartir próximamente')
            }}
            className="gap-2"
          >
            <Share2 className="h-5 w-5" />
            Compartir Logro
          </Button>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <Card className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">¿Qué sigue?</h3>
            <p className="text-muted-foreground mb-4">
              Continúa tu camino de aprendizaje explorando más cursos
            </p>
            <Button
              variant="link"
              onClick={() => navigate('/dashboard')}
              className="text-primary"
            >
              Explorar más cursos →
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
