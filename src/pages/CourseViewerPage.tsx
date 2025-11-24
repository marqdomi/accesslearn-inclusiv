import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { ModuleNavigation } from '@/components/course/ModuleNavigation'
import { LessonContent } from '@/components/course/LessonContent'
import { CourseCompletionPage } from '@/components/course/CourseCompletionPage'
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
  const [courseCompleted, setCourseCompleted] = useState(false)
  
  // Gamification states
  const [showXPAnimation, setShowXPAnimation] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [totalXP, setTotalXP] = useState(0)
  
  // Library/retake states
  const [quizScores, setQuizScores] = useState<Map<string, number>>(new Map())
  const [attemptStarted, setAttemptStarted] = useState(false)

  useEffect(() => {
    loadCourse()
  }, [courseId])

  // Transform lesson from CourseStructure format (with blocks) to CourseViewerPage format
  const transformLesson = (lesson: any): Lesson => {
    // If lesson already has the viewer format (type and content), return as is
    if (lesson.type && lesson.content) {
      return {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        order: lesson.order || 0,
        duration: lesson.duration || lesson.estimatedMinutes,
        isRequired: lesson.isRequired !== false,
        xpReward: lesson.xpReward || lesson.totalXP || 0,
        content: lesson.content
      }
    }

    // Check if lesson has a quiz (prioritize quiz over blocks)
    if (lesson.quiz && lesson.quiz.questions && Array.isArray(lesson.quiz.questions) && lesson.quiz.questions.length > 0) {
      // Transform questions to QuizLesson format
      const transformedQuestions = lesson.quiz.questions.map((q: any, index: number) => {
        const questionType = q.type || 'multiple-choice'
        const questionId = q.id || `q-${lesson.id}-${index}`
        
        // Build question object based on type
        let questionObj: any = {
          question: q.question || q.text || '',
          explanation: q.explanation || ''
        }
        
        if (questionType === 'multiple-choice') {
          questionObj.options = Array.isArray(q.options) ? q.options : (q.choices || [])
          questionObj.correctAnswer = q.correctAnswer !== undefined 
            ? q.correctAnswer 
            : (q.correctAnswerIndex !== undefined 
              ? q.correctAnswerIndex 
              : 0)
        } else if (questionType === 'true-false') {
          questionObj.correctAnswer = q.correctAnswer !== undefined 
            ? Boolean(q.correctAnswer)
            : (q.correctAnswerIndex !== undefined 
              ? Boolean(q.correctAnswerIndex)
              : true)
        } else if (questionType === 'fill-blank') {
          questionObj.blanks = q.blanks || []
          questionObj.correctAnswers = q.correctAnswers || []
        }
        
        return {
          id: questionId,
          type: questionType,
          question: questionObj,
          xpReward: q.points || q.xpReward || 10
        }
      })
      
      return {
        id: lesson.id,
        title: lesson.title,
        type: 'quiz',
        order: lesson.order || 0,
        duration: lesson.estimatedMinutes || 0,
        isRequired: true,
        xpReward: lesson.totalXP || lesson.quiz.totalXP || 0,
        content: {
          quiz: {
            description: lesson.description || lesson.quiz.description || '',
            questions: transformedQuestions,
            maxLives: lesson.quiz.maxAttempts || lesson.quiz.maxLives || 3,
            showTimer: lesson.quiz.showTimer || false,
            passingScore: lesson.quiz.passingScore || 70
          }
        }
      }
    }

    // Check if lesson has blocks (from CourseStructure format)
    if (lesson.blocks && Array.isArray(lesson.blocks) && lesson.blocks.length > 0) {
      // Find video block
      const videoBlock = lesson.blocks.find((b: any) => b.type === 'video')
      if (videoBlock && videoBlock.videoUrl) {
        // Determine video provider
        let videoProvider: 'youtube' | 'vimeo' | 'url' = 'url'
        let videoId: string | undefined = undefined
        
        if (videoBlock.videoUrl.includes('youtube.com') || videoBlock.videoUrl.includes('youtu.be')) {
          videoProvider = 'youtube'
          // Extract YouTube video ID
          const match = videoBlock.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
          videoId = match ? match[1] : undefined
        } else if (videoBlock.videoUrl.includes('vimeo.com')) {
          videoProvider = 'vimeo'
          const match = videoBlock.videoUrl.match(/vimeo\.com\/(\d+)/)
          videoId = match ? match[1] : undefined
        }
        
        return {
          id: lesson.id,
          title: lesson.title,
          type: 'video',
          order: lesson.order || 0,
          duration: lesson.estimatedMinutes || 0,
          isRequired: true,
          xpReward: lesson.totalXP || 0,
          content: {
            videoProvider,
            videoId,
            videoUrl: videoBlock.videoUrl
          }
        }
      }

      // Combine all text blocks into markdown
      const textBlocks = lesson.blocks
        .filter((b: any) => ['text', 'welcome', 'code', 'challenge'].includes(b.type))
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      
      if (textBlocks.length > 0) {
        // Build markdown from blocks
        let markdown = ''
        textBlocks.forEach((block: any) => {
          if (block.type === 'welcome') {
            markdown += `# ${lesson.title}\n\n${block.content}\n\n`
          } else if (block.type === 'code') {
            markdown += `\`\`\`\n${block.content}\n\`\`\`\n\n`
          } else if (block.type === 'challenge') {
            markdown += `## 🎯 Desafío\n\n${block.content}\n\n`
          } else {
            markdown += `${block.content}\n\n`
          }
        })
        
        return {
          id: lesson.id,
          title: lesson.title,
          type: 'markdown',
          order: lesson.order || 0,
          duration: lesson.estimatedMinutes || 0,
          isRequired: true,
          xpReward: lesson.totalXP || 0,
          content: {
            markdown: markdown.trim()
          }
        }
      }
    }

    // Fallback: create a markdown lesson with description
    return {
      id: lesson.id,
      title: lesson.title,
      type: 'markdown',
      order: lesson.order || 0,
      duration: lesson.estimatedMinutes || 0,
      isRequired: true,
      xpReward: lesson.totalXP || 0,
      content: {
        markdown: lesson.description || `# ${lesson.title}\n\nContenido de la lección.`
      }
    }
  }

  const loadCourse = async () => {
    if (!courseId || !currentTenant) return

    try {
      setLoading(true)
      const data = await ApiService.getCourseById(courseId)
      
      // Transform modules and lessons to CourseViewerPage format
      const courseData: Course = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        difficulty: data.difficulty || 'Novice',
        estimatedHours: data.estimatedTime ? Math.round(data.estimatedTime / 60) : 0,
        modules: Array.isArray(data.modules) 
          ? data.modules.map((module: any, moduleIndex: number) => ({
              id: module.id || `module-${moduleIndex}`,
              title: module.title,
              description: module.description || '',
              order: module.order || moduleIndex,
              xpReward: module.xpReward || 0,
              lessons: Array.isArray(module.lessons) 
                ? module.lessons.map((lesson: any, lessonIndex: number) => transformLesson({
                    ...lesson,
                    order: lesson.order !== undefined ? lesson.order : lessonIndex
                  }))
                : []
            }))
          : []
      }
      
      setCourse(courseData)

      // Set first lesson as current if not set
      if (courseData.modules.length > 0 && courseData.modules[0].lessons && courseData.modules[0].lessons.length > 0) {
        setCurrentModuleId(courseData.modules[0].id)
        setCurrentLessonId(courseData.modules[0].lessons[0].id)
      }

      // Load user progress
      if (user) {
        await loadProgress()
      }
      
      // Start course attempt (for library system)
      if (user && currentTenant && !attemptStarted) {
        await startCourseAttempt()
      }
    } catch (error) {
      console.error('Error loading course:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const startCourseAttempt = async () => {
    if (!user || !courseId || !currentTenant || attemptStarted) return
    
    try {
      // Verificar si ya hay un intento en progreso
      const library = await ApiService.getUserLibrary(user.id, currentTenant.id)
      const existingProgress = library.find(p => p.courseId === courseId)
      
      // Solo iniciar nuevo intento si:
      // 1. No existe progreso previo, O
      // 2. El último intento está completado (tiene completedAt)
      const lastAttempt = existingProgress?.attempts?.[existingProgress.attempts.length - 1]
      const needsNewAttempt = !existingProgress || (lastAttempt && lastAttempt.completedAt)
      
      if (needsNewAttempt) {
        await ApiService.startCourseRetake(user.id, courseId, currentTenant.id)
        console.log('New course attempt started for library system')
      } else {
        console.log('Continuing existing course attempt')
      }
      
      setAttemptStarted(true)
    } catch (error) {
      console.error('Error starting course attempt:', error)
      // Non-critical error, continue anyway
      setAttemptStarted(true)
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
      const currentModule = course?.modules?.find(m => m.id === currentModuleId)
      if (currentModule && currentModule.lessons) {
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

          // Check if ALL course modules are completed
          const allCourseModules = course?.modules || []
          const allCourseLessons = allCourseModules.flatMap(m => m.lessons || [])
          const allCourseLessonsCompleted = allCourseLessons.length > 0 && allCourseLessons.every(l => 
            moduleCompletedLessons.has(l.id)
          )

          if (allCourseLessonsCompleted) {
            // Course is 100% complete!
            await completeCourseAttempt()
            return // Don't auto-advance, show completion page
          }
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
  
  const completeCourseAttempt = async () => {
    if (!user || !courseId || !currentTenant || !course || !course.modules) return
    
    try {
      // Calculate final score based on quiz scores
      const allQuizzes = course.modules.flatMap(m => 
        (m.lessons || []).filter(l => l.type === 'quiz')
      )
      
      let totalQuizScore = 0
      let quizCount = 0
      
      allQuizzes.forEach(quiz => {
        const score = quizScores.get(quiz.id)
        if (score !== undefined) {
          totalQuizScore += score
          quizCount++
        }
      })
      
      // Calculate final score (average of quiz scores, or 100 if no quizzes)
      const finalScore = quizCount > 0 
        ? Math.round(totalQuizScore / quizCount) 
        : 100
      
      // Convert quiz scores map to array format
      const quizScoresArray = Array.from(quizScores.entries()).map(([quizId, score]) => ({
        quizId,
        score,
        completedAt: new Date().toISOString()
      }))
      
      // Complete the attempt and get XP breakdown
      const result = await ApiService.completeCourseAttempt(
        user.id,
        courseId,
        currentTenant.id,
        finalScore,
        Array.from(completedLessons),
        quizScoresArray
      )
      
      // Show XP breakdown
      if (result.xpAwarded) {
        const breakdown = result.xpAwarded.breakdown
        const totalXpGained = result.xpAwarded.xpEarned
        
        if (breakdown.improvement > 0) {
          toast.success('¡Curso completado con mejora!', {
            description: `Mejoraste ${breakdown.improvement}% y ganaste ${totalXpGained} XP (${breakdown.improvementXP} XP por mejora + ${breakdown.persistenceBonus} XP bonus)`,
            duration: 8000,
            icon: <Trophy className="h-5 w-5 text-yellow-500" />
          })
        } else {
          toast.success('¡Curso completado!', {
            description: `Ganaste ${totalXpGained} XP. Calificación: ${finalScore}%`,
            duration: 6000,
            icon: <Trophy className="h-5 w-5 text-yellow-500" />
          })
        }
        
        setEarnedXP(totalXpGained)
        setShowXPAnimation(true)
      }
      
      setShowConfetti(true)
      setCourseCompleted(true)
      
    } catch (error) {
      console.error('Error completing course attempt:', error)
      // Still mark as completed locally
      setCourseCompleted(true)
      toast.error('Error al registrar el intento', {
        description: 'El curso se completó pero hubo un problema al guardar el progreso'
      })
    }
  }

  const goToNextLesson = () => {
    if (!course || !course.modules) return

    const currentModule = course.modules.find(m => m.id === currentModuleId)
    if (!currentModule || !currentModule.lessons) return

    const currentLessonIndex = currentModule.lessons.findIndex(
      l => l.id === currentLessonId
    )

    // Try next lesson in current module
    if (currentLessonIndex >= 0 && currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonId(currentModule.lessons[currentLessonIndex + 1].id)
      return
    }

    // Try first lesson of next module
    const currentModuleIndex = course.modules.findIndex(m => m.id === currentModuleId)
    if (currentModuleIndex >= 0 && currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1]
      if (nextModule.lessons && nextModule.lessons.length > 0) {
        setCurrentModuleId(nextModule.id)
        setCurrentLessonId(nextModule.lessons[0].id)
      }
    }
  }

  const goToPreviousLesson = () => {
    if (!course || !course.modules) return

    const currentModule = course.modules.find(m => m.id === currentModuleId)
    if (!currentModule || !currentModule.lessons) return

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
      if (prevModule.lessons && prevModule.lessons.length > 0) {
        setCurrentModuleId(prevModule.id)
        setCurrentLessonId(prevModule.lessons[prevModule.lessons.length - 1].id)
      }
    }
  }

  const getCurrentLesson = () => {
    if (!course) return null
    const module = course.modules.find(m => m.id === currentModuleId)
    if (!module) return null
    return module.lessons.find(l => l.id === currentLessonId) || null
  }

  const isFirstLesson = () => {
    if (!course || !course.modules || course.modules.length === 0) return true
    const firstModule = course.modules[0]
    if (!firstModule.lessons || firstModule.lessons.length === 0) return true
    return (
      firstModule.id === currentModuleId &&
      firstModule.lessons[0].id === currentLessonId
    )
  }

  const isLastLesson = () => {
    if (!course || !course.modules || course.modules.length === 0) return true
    const lastModule = course.modules[course.modules.length - 1]
    if (!lastModule.lessons || lastModule.lessons.length === 0) return true
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

  // Calculate total lessons (used in multiple places)
  const totalLessons = course ? course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) : 0

  // Show completion page if course is finished
  if (courseCompleted && course) {
    return (
      <CourseCompletionPage
        courseTitle={course.title}
        totalXP={totalXP}
        totalLessons={totalLessons}
        totalModules={course.modules?.length || 0}
      />
    )
  }

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
      <header className="border-b bg-background sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/library')}
                className="gap-2"
              >
                <ArrowLeft size={18} />
                Mi Biblioteca
              </Button>
              <div className="border-l pl-4">
                <h1 className="text-lg font-bold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {completedLessons.size} de {totalLessons || 0} lecciones completadas
                </p>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0}%</p>
                <p className="text-xs text-muted-foreground">Progreso</p>
              </div>
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0}%` }}
                />
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
              modules={(course.modules || []).map(module => ({
                ...module,
                lessons: (module.lessons || []).map(lesson => ({
                  ...lesson,
                  isCompleted: isLessonCompleted(lesson.id),
                })),
                isCompleted: (module.lessons || []).every(l => isLessonCompleted(l.id)),
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
                {currentLesson && (
                  <LessonContent 
                    lesson={currentLesson}
                    onQuizComplete={(results) => {
                      // Guardar score del quiz para el cálculo final
                      if (currentLessonId && results.score !== undefined) {
                        setQuizScores(prev => new Map(prev).set(currentLessonId, results.score))
                        console.log('Quiz completed:', results, 'Score:', results.score)
                      }
                      // NO avanzar automáticamente - dejar que el usuario revise sus resultados
                      // y haga clic en "Marcar como Completado" cuando esté listo
                    }}
                  />
                )}

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
