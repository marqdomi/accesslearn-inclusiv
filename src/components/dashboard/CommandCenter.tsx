import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassPanel } from '@/components/ui/glass-panel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  PlayCircle, 
  Clock, 
  BookOpen, 
  ArrowRight,
  Zap,
  CheckCircle2,
  Target,
  Rocket
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useXP } from '@/hooks/use-xp'
import { cn } from '@/lib/utils'

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

interface CommandCenterProps {
  course: Course | null
  progress: CourseProgress | null
  stats: {
    totalCourses: number
    enrolledCourses: number
    completedCourses: number
    totalXP: number
    averageProgress: number
  }
  loading?: boolean
}

export function CommandCenter({ course, progress, stats, loading }: CommandCenterProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { totalXP, currentLevel, getProgressToNextLevel, getRankName } = useXP(user?.id)

  const progressToNext = getProgressToNextLevel()
  const progressAngle = (progressToNext.percentage / 100) * 360

  // Calculate course progress
  const totalLessons = course?.modules?.reduce((sum: number, m: any) =>
    sum + (m.lessons?.length || 0), 0) || 0
  const completedLessons = progress?.completedLessons?.length || 0
  const courseProgressPercent = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  if (loading) {
    return (
      <div className="tech-bg min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-white/10 rounded-lg"></div>
            <div className="h-64 bg-white/10 rounded-lg"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-white/10 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tech-bg min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
            {getGreeting()}, {user?.firstName}!
          </h1>
          <p className="text-tech-cyan text-sm md:text-base">
            Sistema de Aprendizaje Kaido • Nivel {currentLevel} • {getRankName()}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Main Command Panel - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Level Progress Circle */}
            <GlassCard glow className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <div 
                    className="hud-progress-circle"
                    style={{ '--progress-angle': `${progressAngle}deg` } as React.CSSProperties}
                  >
                    <div className="hud-progress-circle-inner">
                      <div className="text-center">
                        <div className="hud-text-large text-white mb-1">
                          Nivel {currentLevel}
                        </div>
                        <div className="hud-text text-tech-cyan">
                          {getRankName()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="hud-text text-white">Progreso al Siguiente Nivel</span>
                      <span className="hud-counter text-white">{Math.round(progressToNext.percentage)}%</span>
                    </div>
                    <div className="hud-progress-bar">
                      <div 
                        className="hud-progress-bar-fill" 
                        style={{ width: `${progressToNext.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-tech-cyan">
                      <span>{progressToNext.currentXP.toLocaleString()} XP</span>
                      <span>{progressToNext.nextLevelXP.toLocaleString()} XP</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <GlassPanel className="p-4">
                      <div className="text-xs hud-text mb-1">XP Total</div>
                      <div className="hud-counter text-2xl">{totalXP.toLocaleString()}</div>
                    </GlassPanel>
                    <GlassPanel className="p-4">
                      <div className="text-xs hud-text mb-1">XP Acumulado</div>
                      <div className="hud-counter text-2xl">{stats.totalXP.toLocaleString()}</div>
                    </GlassPanel>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Next Mission Card */}
            {course ? (
              <GlassCard textOverlay className="relative overflow-hidden">
                <div className="relative z-10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-tech-cyan" />
                      <Badge className="hud-badge hud-badge-pulse">
                        Misión Actual
                      </Badge>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  {/* Course Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Progreso de Misión</span>
                      <span className="hud-counter text-white">{courseProgressPercent}%</span>
                    </div>
                    <div className="hud-progress-bar">
                      <div 
                        className="hud-progress-bar-fill" 
                        style={{ width: `${courseProgressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-tech-cyan">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{completedLessons} completadas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{totalLessons - completedLessons} restantes</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="w-full bg-gradient-to-r from-tech-cyan to-tech-cyan-dark hover:from-tech-cyan-dark hover:to-tech-cyan text-white border-0 shadow-lg shadow-tech-cyan/50"
                    size="lg"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Continuar Misión
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="space-y-4"
                >
                  <div className="mx-auto w-16 h-16 rounded-full bg-tech-cyan/20 flex items-center justify-center mb-4">
                    <Target className="h-8 w-8 text-tech-cyan" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    No hay misiones activas
                  </h3>
                  <p className="text-sm text-gray-300 mb-6">
                    Explora el catálogo para encontrar tu próxima misión de aprendizaje
                  </p>
                  <Button
                    onClick={() => navigate('/catalog')}
                    className="bg-gradient-to-r from-tech-cyan to-tech-cyan-dark hover:from-tech-cyan-dark hover:to-tech-cyan text-white"
                    size="lg"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explorar Catálogo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              </GlassCard>
            )}
          </div>

          {/* Stats Sidebar - Right Column (1/3) */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <GlassCard className="p-6">
              <h3 className="hud-text text-white mb-4">Estadísticas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-tech-cyan/20">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-tech-cyan" />
                    <span className="text-sm text-gray-300">Total Cursos</span>
                  </div>
                  <span className="hud-counter text-white">{stats.totalCourses}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-tech-cyan/20">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-tech-cyan" />
                    <span className="text-sm text-gray-300">Inscrito</span>
                  </div>
                  <span className="hud-counter text-white">{stats.enrolledCourses}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-tech-cyan/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-300">Completado</span>
                  </div>
                  <span className="hud-counter text-white">{stats.completedCourses}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-tech-cyan/20">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">XP Total</span>
                  </div>
                  <span className="hud-counter text-white">{stats.totalXP}</span>
                </div>
              </div>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard className="p-6">
              <h3 className="hud-text text-white mb-4">Acciones Rápidas</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-tech-cyan/30 text-white hover:bg-tech-cyan/20 hover:border-tech-cyan"
                  onClick={() => navigate('/catalog')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Catálogo de Cursos
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-tech-cyan/30 text-white hover:bg-tech-cyan/20 hover:border-tech-cyan"
                  onClick={() => navigate('/library')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Mi Biblioteca
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}

