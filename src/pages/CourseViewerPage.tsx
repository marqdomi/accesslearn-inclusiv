import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { ModuleNavigation } from '@/components/course/ModuleNavigation'
import { LessonContent } from '@/components/course/LessonContent'
import { XPAnimation } from '@/components/gamification/XPAnimation'
import { ConfettiEffect } from '@/components/gamification/ConfettiEffect'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Lesson {
  id: string
  title: string
  type: 'markdown' | 'video' | 'quiz'
  order: number
  duration?: number
  isRequired: boolean
  xpReward: number
  content: {
    markdown?: string
    videoProvider?: 'youtube' | 'vimeo' | 'url'
    videoId?: string
    videoUrl?: string
  }
}

interface Module {
  id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
  xpReward: number
}

interface Course {
  id: string
  title: string
  description: string
  difficulty: string
  estimatedHours: number
  modules: Module[]
}

export function CourseViewerPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentTenant } = useTenant()

  const [course, setCourse] = useState<Course | null>(null)
  const [currentModuleId, setCurrentModuleId] = useState<string>('')
  const [currentLessonId, setCurrentLessonId] = useState<string>('')
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  
  // Gamification states
  const [showXPAnimation, setShowXPAnimation] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [totalXP, setTotalXP] = useState(0)

  useEffect(() => {
    loadCourse()
  }, [courseId])

  const loadCourse = async () => {
    if (!courseId || !currentTenant) return

    try {
      setLoading(true)
      const data = await ApiService.getCourseById(courseId)
      setCourse(data)

      // Set first lesson as current if not set
      if (data.modules.length > 0 && data.modules[0].lessons.length > 0) {
        setCurrentModuleId(data.modules[0].id)
        setCurrentLessonId(data.modules[0].lessons[0].id)
      }

      // Load user progress
      if (user) {
        await loadProgress()
      }
    } catch (error) {
      console.error('Error loading course:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProgress = async () => {
    if (!user || !courseId) return

    try {
      const progress = await ApiService.getCourseProgress(user.id, courseId)
      setCompletedLessons(new Set(progress.completedLessons))
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const handleLessonSelect = (moduleId: string, lessonId: string) => {
    setCurrentModuleId(moduleId)
    setCurrentLessonId(lessonId)
  }

  const handleCompleteLesson = async () => {
    if (!user || !currentLessonId || !courseId) return

    try {
      setCompleting(true)
      
      // Get current lesson to get XP reward
      const currentLesson = getCurrentLesson()
      if (!currentLesson) return

      const xpReward = currentLesson.xpReward || 0

      // Save to backend
      const response = await ApiService.completeLesson(user.id, currentLessonId, {
        courseId,
        moduleId: currentModuleId,
        xpEarned: xpReward
      })

      // Update local state
      setCompletedLessons(prev => new Set([...prev, currentLessonId]))
      
      // Update total XP
      setTotalXP(response.totalXp)

      // Show XP animation
      setEarnedXP(xpReward)
      setShowXPAnimation(true)

      // Show success toast
      toast.success('¡Lección completada!', {
        description: `Has ganado ${xpReward} XP`,
        icon: <Trophy className="h-5 w-5 text-yellow-500" />
      })

      // Check if module is completed
      const currentModule = course?.modules.find(m => m.id === currentModuleId)
      if (currentModule) {
        const moduleCompletedLessons = new Set([...completedLessons, currentLessonId])
        const allModuleLessonsCompleted = currentModule.lessons.every(l => 
          moduleCompletedLessons.has(l.id)
        )
        
        if (allModuleLessonsCompleted) {
          // Celebrate module completion with confetti
          setShowConfetti(true)
          toast.success('¡Módulo completado!', {
            description: `Has completado "${currentModule.title}"`,
            duration: 5000
          })
        }
      }

      // Move to next lesson after a brief delay
      setTimeout(() => {
        goToNextLesson()
      }, 1500)
    } catch (error) {
      console.error('Error completing lesson:', error)
      toast.error('Error al completar la lección', {
        description: 'Por favor intenta de nuevo'
      })
    } finally {
      setCompleting(false)
    }
  }

  const goToNextLesson = () => {
    if (!course) return

    const currentModule = course.modules.find(m => m.id === currentModuleId)
    if (!currentModule) return

    const currentLessonIndex = currentModule.lessons.findIndex(
      l => l.id === currentLessonId
    )

    // Try next lesson in current module
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonId(currentModule.lessons[currentLessonIndex + 1].id)
      return
    }

    // Try first lesson of next module
    const currentModuleIndex = course.modules.findIndex(m => m.id === currentModuleId)
    if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1]
      setCurrentModuleId(nextModule.id)
      setCurrentLessonId(nextModule.lessons[0].id)
    }
  }

  const goToPreviousLesson = () => {
    if (!course) return

    const currentModule = course.modules.find(m => m.id === currentModuleId)
    if (!currentModule) return

    const currentLessonIndex = currentModule.lessons.findIndex(
      l => l.id === currentLessonId
    )

    // Try previous lesson in current module
    if (currentLessonIndex > 0) {
      setCurrentLessonId(currentModule.lessons[currentLessonIndex - 1].id)
      return
    }

    // Try last lesson of previous module
    const currentModuleIndex = course.modules.findIndex(m => m.id === currentModuleId)
    if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1]
      setCurrentModuleId(prevModule.id)
      setCurrentLessonId(prevModule.lessons[prevModule.lessons.length - 1].id)
    }
  }

  const getCurrentLesson = () => {
    if (!course) return null
    const module = course.modules.find(m => m.id === currentModuleId)
    if (!module) return null
    return module.lessons.find(l => l.id === currentLessonId) || null
  }

  const isFirstLesson = () => {
    if (!course) return true
    return (
      course.modules[0].id === currentModuleId &&
      course.modules[0].lessons[0].id === currentLessonId
    )
  }

  const isLastLesson = () => {
    if (!course) return true
    const lastModule = course.modules[course.modules.length - 1]
    return (
      lastModule.id === currentModuleId &&
      lastModule.lessons[lastModule.lessons.length - 1].id === currentLessonId
    )
  }

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.has(lessonId)
  }

  const currentLesson = getCurrentLesson()
  const isCurrentLessonCompleted = currentLessonId
    ? isLessonCompleted(currentLessonId)
    : false

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando curso...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Curso no encontrado</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-bold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {course.modules.length} módulos • {course.estimatedHours} horas
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <ModuleNavigation
              modules={course.modules.map(module => ({
                ...module,
                lessons: module.lessons.map(lesson => ({
                  ...lesson,
                  isCompleted: isLessonCompleted(lesson.id),
                })),
                isCompleted: module.lessons.every(l => isLessonCompleted(l.id)),
              }))}
              currentLessonId={currentLessonId}
              onLessonSelect={handleLessonSelect}
            />
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLessonId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {currentLesson && <LessonContent lesson={currentLesson} />}

                {/* Navigation and Complete Button */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={goToPreviousLesson}
                    disabled={isFirstLesson()}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>

                  <div className="flex items-center gap-3">
                    {!isCurrentLessonCompleted && (
                      <Button
                        onClick={handleCompleteLesson}
                        disabled={completing}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {completing ? 'Completando...' : 'Marcar como Completado'}
                      </Button>
                    )}

                    <Button
                      variant={isCurrentLessonCompleted ? 'default' : 'outline'}
                      onClick={goToNextLesson}
                      disabled={isLastLesson()}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Gamification Effects */}
      {showXPAnimation && (
        <XPAnimation 
          xp={earnedXP} 
          onComplete={() => setShowXPAnimation(false)} 
        />
      )}
      <ConfettiEffect trigger={showConfetti} type="realistic" />
    </div>
  )
}
