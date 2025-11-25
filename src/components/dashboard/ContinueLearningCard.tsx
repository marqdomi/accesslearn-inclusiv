import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  PlayCircle, 
  Clock, 
  BookOpen, 
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react'
import { motion } from 'framer-motion'

interface Course {
  id: string
  title: string
  description: string
  modules: any[]
  totalXP?: number
  estimatedHours?: number
  difficulty?: string
  coverImage?: string
}

interface CourseProgress {
  courseId: string
  status: string
  completedLessons?: string[]
  lastAccessedAt?: string
  progress?: number
}

interface ContinueLearningCardProps {
  course: Course | null
  progress: CourseProgress | null
  loading?: boolean
}

export function ContinueLearningCard({ course, progress, loading }: ContinueLearningCardProps) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-2/3"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!course) {
    return (
      <Card className="border-2 border-dashed border-muted">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">¡Comienza tu aprendizaje!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explora el catálogo de cursos y encuentra el perfecto para ti
              </p>
              <Button onClick={() => navigate('/catalog')} className="gap-2">
                <BookOpen className="h-4 w-4" />
                Explorar Cursos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate progress percentage
  const totalLessons = course.modules?.reduce((sum: number, m: any) =>
    sum + (m.lessons?.length || 0), 0) || 0
  const completedLessons = progress?.completedLessons?.length || 0
  const progressPercent = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0

  // Calculate remaining lessons
  const remainingLessons = totalLessons - completedLessons
  const estimatedMinutes = remainingLessons * 15 // ~15 min per lesson

  const handleContinue = () => {
    navigate(`/courses/${course.id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 hover:border-primary/50 transition-all shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Course Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <PlayCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <Badge variant="outline" className="text-xs">
                      En Progreso
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progreso del Curso</span>
                  <span className="text-muted-foreground">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>{completedLessons} completadas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>{remainingLessons} restantes</span>
                  </div>
                  {estimatedMinutes > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>~{Math.round(estimatedMinutes / 60)}h restantes</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button 
                  onClick={handleContinue}
                  size="lg"
                  className="gap-2 flex-1 md:flex-initial"
                >
                  <PlayCircle className="h-4 w-4" />
                  Continuar Curso
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="hidden md:flex gap-2"
                >
                  Ver Detalles
                </Button>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="md:w-48 space-y-3 flex-shrink-0">
              {course.totalXP && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">XP Disponible</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{course.totalXP}</p>
                </div>
              )}
              
              {course.estimatedHours && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Duración</span>
                  </div>
                  <p className="text-lg font-semibold">{course.estimatedHours}h</p>
                </div>
              )}

              {course.difficulty && (
                <Badge variant="outline" className="w-full justify-center py-2">
                  {course.difficulty}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

