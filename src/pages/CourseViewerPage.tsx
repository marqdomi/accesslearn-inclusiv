import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { cn } from '@/lib/utils'
import { ModuleNavigation } from '@/components/course/ModuleNavigation'
import { LessonContent } from '@/components/course/LessonContent'
import { CourseCompletionPage } from '@/components/course/CourseCompletionPage'
import { XPAnimation } from '@/components/gamification/XPAnimation'
import { ConfettiEffect } from '@/components/gamification/ConfettiEffect'
import { GameNotificationQueue, GameNotification } from '@/components/gamification/GameNotificationQueue'
import { CourseMissionPanel } from '@/components/course/CourseMissionPanel'
import { CourseHeatmapNavigator } from '@/components/course/CourseHeatmapNavigator'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Trophy, PanelRightClose, PanelLeftClose, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { ContentBlock } from '@/components/course/BlockRenderer'
import { AIChatAssistant } from '@/components/ai'

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
    html?: string
    blocks?: ContentBlock[]
    videoProvider?: 'youtube' | 'vimeo' | 'tiktok' | 'url'
    videoId?: string
    videoUrl?: string
    quiz?: {
      description?: string
      questions: any[]
      maxLives?: number
      showTimer?: boolean
      timeLimit?: number
      passingScore?: number
      examModeType?: string
      examDuration?: number
      examMinPassingScore?: number
      examQuestionCount?: number
      questionBank?: any[]
      useRandomSelection?: boolean
    }
  }
  quiz?: {
    passingScore?: number
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
  // Completion settings
  completionMode?: string
  quizRequirement?: string
  requireAllQuizzesPassed?: boolean
  minimumScoreForCompletion?: number
  // Certificate settings
  certificateEnabled?: boolean
  certificateRequiresPassingScore?: boolean
  minimumScoreForCertificate?: number
  // Retake settings
  allowRetakes?: boolean
  maxRetakesPerQuiz?: number
}

export function CourseViewerPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('courses')
  const { user } = useAuth()
  const { currentTenant } = useTenant()

  const [course, setCourse] = useState<Course | null>(null)
  const [currentModuleId, setCurrentModuleId] = useState<string>('')
  const [currentLessonId, setCurrentLessonId] = useState<string>('')
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [courseCompleted, setCourseCompleted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [gameNotifications, setGameNotifications] = useState<GameNotification[]>([])
  const [navigatorMode, setNavigatorMode] = useState<'heatmap' | 'list'>('heatmap')
  const isMobile = useIsMobile()
  
  // Gamification states
  const [showXPAnimation, setShowXPAnimation] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [totalXP, setTotalXP] = useState(0)
  
  // Library/retake states
  const [quizScores, setQuizScores] = useState<Map<string, number>>(new Map())
  const [attemptStarted, setAttemptStarted] = useState(false)
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set())
  const [quizRetakeCounts, setQuizRetakeCounts] = useState<Map<string, number>>(new Map()) // Track retake counts per quiz

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
        let questionObj: any
        
        if (questionType === 'scenario-solver') {
          // Para scenario-solver, pasar el objeto completo ScenarioQuestion
          // Si q.question ya es un objeto ScenarioQuestion, usarlo directamente
          // Si no, intentar construir uno desde q
          if (q.question && typeof q.question === 'object' && q.question.steps) {
            questionObj = q.question
          } else {
            // Intentar construir desde las propiedades del quiz
            questionObj = {
              title: q.title || q.question || q.text || 'Escenario',
              description: q.description || q.explanation || '',
              steps: q.steps || q.question?.steps || [],
              startStepId: q.startStepId || q.question?.startStepId || '',
              perfectScore: q.perfectScore || q.question?.perfectScore || 100
            }
          }
        } else {
          questionObj = {
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
          } else if (questionType === 'multiple-select') {
            questionObj.options = Array.isArray(q.options) ? q.options : (q.choices || [])
            questionObj.correctAnswer = Array.isArray(q.correctAnswer) 
              ? q.correctAnswer 
              : (Array.isArray(q.correctAnswers) 
                ? q.correctAnswers 
                : (q.correctAnswer !== undefined 
                  ? [q.correctAnswer] 
                  : []))
          } else if (questionType === 'true-false') {
            // En el constructor: 0 = Verdadero (true), 1 = Falso (false)
            // Necesitamos convertir el número a boolean correctamente
            if (q.correctAnswer !== undefined) {
              // Si es 0, significa Verdadero (true), si es 1, significa Falso (false)
              questionObj.correctAnswer = q.correctAnswer === 0
            } else if (q.correctAnswerIndex !== undefined) {
              questionObj.correctAnswer = q.correctAnswerIndex === 0
            } else if (typeof q.correctAnswer === 'boolean') {
              // Si ya es boolean, usarlo directamente
              questionObj.correctAnswer = q.correctAnswer
            } else {
              // Default: Verdadero (true)
              questionObj.correctAnswer = true
            }
          } else if (questionType === 'fill-blank') {
            // Para fill-blank, question puede ser un objeto con text, blanks, options
            // o puede estar en question.question como objeto
            if (q.question && typeof q.question === 'object') {
              questionObj = q.question
            } else {
              // Construir desde las propiedades del quiz
              questionObj = {
                text: q.text || (typeof q.question === 'string' ? q.question : ''),
                blanks: Array.isArray(q.blanks) ? q.blanks : (q.correctAnswer ? [q.correctAnswer] : []),
                options: Array.isArray(q.options) ? q.options : []
              }
            }
          } else if (questionType === 'ordering') {
            questionObj.options = Array.isArray(q.options) ? q.options : []
            questionObj.correctAnswer = Array.isArray(q.correctAnswer) 
              ? q.correctAnswer 
              : (q.options ? q.options.map((_: any, i: number) => i) : [])
          }
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
            showTimer: lesson.quiz.showTimer || lesson.quiz.examMode || false,
            timeLimit: lesson.quiz.timeLimit || 0,
            passingScore: lesson.quiz.passingScore || 70
          }
        }
      }
    }

    // Check if lesson has blocks (from CourseStructure format)
    if (lesson.blocks && Array.isArray(lesson.blocks) && lesson.blocks.length > 0) {
      // Sort all blocks by order to maintain correct sequence
      const sortedBlocks = [...lesson.blocks].sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      
      console.log(`[transformLesson] Processing lesson "${lesson.title}" with ${sortedBlocks.length} blocks:`, 
        sortedBlocks.map(b => ({ type: b.type, order: b.order || 0 }))
      )
      
      // Check if there are any content blocks (text, image, code, challenge, video, file)
      const hasContentBlocks = sortedBlocks.some((b: any) => 
        ['text', 'welcome', 'code', 'challenge', 'image', 'video', 'file'].includes(b.type)
      )
      
      // If there are content blocks, pass them directly to the BlockRenderer
      // This is cleaner than converting to markdown/HTML and parsing back
      if (hasContentBlocks) {
        return {
          id: lesson.id,
          title: lesson.title,
          type: 'markdown',
          order: lesson.order || 0,
          duration: lesson.estimatedMinutes || 0,
          isRequired: true,
          xpReward: lesson.totalXP || 0,
          content: {
            // Pass blocks directly - BlockRenderer will handle rendering each type
            blocks: sortedBlocks.map((block: any) => ({
              id: block.id,
              type: block.type,
              order: block.order || 0,
              content: block.content,
              // File properties
              fileUrl: block.fileUrl,
              fileName: block.fileName,
              fileSize: block.fileSize,
              fileType: block.fileType,
              // Image properties
              imageFile: block.imageFile,
              imageAlt: block.accessibility?.altText,
              // Video properties
              videoUrl: block.videoUrl,
              videoProvider: block.videoProvider
            }))
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

  const pushGameNotification = (notification: Omit<GameNotification, 'id'>) => {
    setGameNotifications((prev) => [
      ...prev,
      {
        ...notification,
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      },
    ])
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

      pushGameNotification({
        title: t('viewer.lessonCompleted'),
        description: t('viewer.earnedXP', { xp: xpReward }),
        type: 'xp',
        meta: { value: xpReward, unit: 'XP' },
      })

      // Check if module is completed
      const currentModule = course?.modules?.find(m => m.id === currentModuleId)
      if (currentModule && currentModule.lessons) {
        const moduleCompletedLessons = new Set([...completedLessons, currentLessonId])
        const allModuleLessonsCompleted = currentModule.lessons.every(l => 
          moduleCompletedLessons.has(l.id)
        )
        
        if (allModuleLessonsCompleted) {
          setShowConfetti(true)
          pushGameNotification({
            title: t('viewer.moduleCompleted'),
            description: t('viewer.completedModule', { title: currentModule.title }),
            type: 'module',
          })

          // Check if ALL course modules are completed
          const allCourseModules = course?.modules || []
          const allCourseLessons = allCourseModules.flatMap(m => m.lessons || [])
          const allCourseLessonsCompleted = allCourseLessons.length > 0 && allCourseLessons.every(l => 
            moduleCompletedLessons.has(l.id)
          )

          if (allCourseLessonsCompleted) {
            // Validate if course can be completed based on configuration
            const validation = canCompleteCourse()
            if (validation.canComplete) {
              // Course is 100% complete!
              await completeCourseAttempt()
              return // Don't auto-advance, show completion page
            } else {
              // Show warning but don't block - user can still navigate
              toast.warning(t('viewer.courseNotCompleted'), {
                description: validation.reason || t('viewer.completionRequirementsNotMet')
              })
            }
          }
        }
      }

      // Move to next lesson after a brief delay
      setTimeout(() => {
        goToNextLesson()
      }, 1500)
    } catch (error) {
      console.error('Error completing lesson:', error)
      toast.error(t('viewer.lessonCompleteError'), {
        description: t('viewer.tryAgain')
      })
    } finally {
      setCompleting(false)
    }
  }
  
  // Helper function to calculate final score
  const calculateFinalScore = (): number => {
    if (!course || !course.modules) return 0
    
    const allQuizzes = course.modules.flatMap(m => 
      (m.lessons || []).filter(l => l.type === 'quiz' && l.quiz)
    )
    
    let totalQuizScore = 0
    let quizCount = 0
    
    allQuizzes.forEach(lesson => {
      const score = quizScores.get(lesson.id)
      if (score !== undefined) {
        totalQuizScore += score
        quizCount++
      }
    })
    
    // Calculate final score (average of quiz scores, or 100 if no quizzes)
    return quizCount > 0 
      ? Math.round(totalQuizScore / quizCount) 
      : 100
  }

  // Helper function to check if all required quizzes passed
  const allRequiredQuizzesPassed = (): boolean => {
    if (!course || !course.modules) return true
    
    const allQuizzes = course.modules.flatMap(m => 
      (m.lessons || []).filter(l => l.type === 'quiz' && l.quiz)
    )
    
    if (allQuizzes.length === 0) return true
    
    // Get passing score from quiz or use default
    const defaultPassingScore = 70
    
    return allQuizzes.every(lesson => {
      const score = quizScores.get(lesson.id)
      if (score === undefined) return false // Quiz not completed
      
      const quizPassingScore = lesson.quiz?.passingScore || defaultPassingScore
      return score >= quizPassingScore
    })
  }

  // Check if course can be completed based on configuration
  const canCompleteCourse = (): { canComplete: boolean; reason?: string } => {
    if (!course || !course.modules) {
      return { canComplete: false, reason: 'Curso no disponible' }
    }
    
    // Verify that all modules are completed
    const allCourseModules = course.modules || []
    const allCourseLessons = allCourseModules.flatMap(m => m.lessons || [])
    const allCourseLessonsCompleted = allCourseLessons.length > 0 && allCourseLessons.every(l => 
      completedLessons.has(l.id)
    )
    
    if (!allCourseLessonsCompleted) {
      return { canComplete: false, reason: t('viewer.notAllModulesCompleted') }
    }
    
    const completionMode = course.completionMode || 'modules-and-quizzes'
    
    // Check based on completion mode
    switch (completionMode) {
      case 'modules-only':
      case 'study-guide':
        // Only modules required
        return { canComplete: true }
      
      case 'modules-and-quizzes':
        // Check quiz requirements
        if (course.quizRequirement === 'none') {
          return { canComplete: true }
        }
        
        if (course.quizRequirement === 'optional') {
          return { canComplete: true }
        }
        
        // Required quizzes
        if (course.requireAllQuizzesPassed) {
          if (!allRequiredQuizzesPassed()) {
            return { 
              canComplete: false, 
              reason: 'Debes pasar todos los quizzes requeridos para completar el curso' 
            }
          }
        }
        
        // Check minimum score for completion
        if (course.minimumScoreForCompletion) {
          const finalScore = calculateFinalScore()
          if (finalScore < course.minimumScoreForCompletion) {
            return { 
              canComplete: false, 
              reason: `Score mínimo requerido: ${course.minimumScoreForCompletion}%. Tu score actual: ${finalScore}%` 
            }
          }
        }
        
        return { canComplete: true }
      
      case 'exam-mode':
        // Check minimum score if configured
        if (course.minimumScoreForCompletion) {
          const finalScore = calculateFinalScore()
          if (finalScore < course.minimumScoreForCompletion) {
            return { 
              canComplete: false, 
              reason: `Score mínimo requerido: ${course.minimumScoreForCompletion}%. Tu score actual: ${finalScore}%` 
            }
          }
        }
        return { canComplete: true }
      
      default:
        return { canComplete: true }
    }
  }

  // Check if certificate can be earned
  const canEarnCertificate = (): boolean => {
    if (!course?.certificateEnabled) return false
    
    const { canComplete } = canCompleteCourse()
    if (!canComplete) return false
    
    // If certificate requires passing score, check it
    if (course.certificateRequiresPassingScore) {
      const finalScore = calculateFinalScore()
      const minScore = course.minimumScoreForCertificate || 70
      return finalScore >= minScore
    }
    
    return canComplete
  }

  // Check if a quiz can be retaken
  const canRetakeQuiz = (quizId: string): boolean => {
    if (!course?.allowRetakes) return false
    
    const retakeCount = quizRetakeCounts.get(quizId) || 0
    const maxRetakes = course.maxRetakesPerQuiz || 0
    
    // If maxRetakes is 0, unlimited retakes
    if (maxRetakes === 0) return true
    
    // Check if under limit
    return retakeCount < maxRetakes
  }

  // Handle quiz retake
  const handleQuizRetake = (quizId: string) => {
    if (!canRetakeQuiz(quizId)) {
      toast.error('Límite de reintentos alcanzado', {
        description: `Has alcanzado el máximo de ${course?.maxRetakesPerQuiz || 0} reintentos para este quiz`
      })
      return
    }
    
    // Increment retake count
    setQuizRetakeCounts(prev => {
      const newMap = new Map(prev)
      newMap.set(quizId, (newMap.get(quizId) || 0) + 1)
      return newMap
    })
    
    // Remove quiz from completed quizzes to allow retaking
    setCompletedQuizzes(prev => {
      const newSet = new Set(prev)
      newSet.delete(quizId)
      return newSet
    })
    
    // Remove score to allow new attempt
    setQuizScores(prev => {
      const newMap = new Map(prev)
      newMap.delete(quizId)
      return newMap
    })
    
    toast.info('Quiz reiniciado', {
      description: 'Puedes volver a tomar este quiz para mejorar tu calificación'
    })
  }

  const completeCourseAttempt = async () => {
    if (!user || !courseId || !currentTenant || !course || !course.modules) return
    
    // Validate if course can be completed
    const validation = canCompleteCourse()
    if (!validation.canComplete) {
      toast.error('No se puede completar el curso', {
        description: validation.reason || 'No cumples con los requisitos de completación'
      })
      return
    }
    
    try {
      const finalScore = calculateFinalScore()
      
      // Convert quiz scores map to array format
      const quizScoresArray = Array.from(quizScores.entries()).map(([quizId, score]) => ({
        quizId,
        score,
        completedAt: new Date().toISOString()
      }))
      
      // Complete the attempt and get XP breakdown
      // Backend will determine certificate issuance based on course configuration
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
        
        pushGameNotification({
          title: breakdown.improvement > 0 ? t('viewer.improvedRecord') : t('viewer.courseCompleted'),
          description:
            breakdown.improvement > 0
              ? t('viewer.improvedBy', { percent: breakdown.improvement })
              : t('viewer.finalScore', { score: finalScore }),
          type: 'course',
          meta: { value: totalXpGained, unit: 'XP' },
        })
        
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
  const currentModule = course?.modules.find(m => m.id === currentModuleId)
  const isCurrentLessonCompleted = currentLessonId
    ? isLessonCompleted(currentLessonId)
    : false
  
  // Verificar si la lección actual es un quiz y si fue completado
  const isCurrentLessonQuiz = currentLesson?.type === 'quiz'
  const isQuizCompleted = currentLessonId ? completedQuizzes.has(currentLessonId) : false
  const canCompleteLesson = !isCurrentLessonQuiz || isQuizCompleted

  const totalLessons = course
    ? course.modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0)
    : 0

  // Show completion page if course is finished
  const moduleNavigatorData = (course?.modules || []).map((module) => ({
    ...module,
    lessons: (module.lessons || []).map((lesson) => ({
      ...lesson,
      isCompleted: isLessonCompleted(lesson.id),
      isCurrent: lesson.id === currentLessonId,
    })),
    isCompleted: (module.lessons || []).every((l) => isLessonCompleted(l.id)),
  }))

  if (courseCompleted && course) {
    const finalScore = calculateFinalScore()
    const certificateEarned = canEarnCertificate()
    
    // Find quizzes that can be retaken
    const quizzesToRetake = course.modules
      ?.flatMap(m => (m.lessons || []).filter(l => l.type === 'quiz' && l.quiz))
      .map(lesson => {
        const score = quizScores.get(lesson.id) || 0
        const passingScore = lesson.quiz?.passingScore || 70
        return {
          id: lesson.id,
          title: lesson.title,
          score,
          passingScore
        }
      })
      .filter(q => q.score < q.passingScore && canRetakeQuiz(q.id)) || []
    
    return (
      <CourseCompletionPage
        courseTitle={course.title}
        courseId={course.id}
        totalXP={totalXP}
        totalLessons={totalLessons}
        totalModules={course.modules?.length || 0}
        finalScore={finalScore}
        certificateEarned={certificateEarned}
        courseConfig={{
          certificateEnabled: course.certificateEnabled,
          certificateRequiresPassingScore: course.certificateRequiresPassingScore,
          minimumScoreForCertificate: course.minimumScoreForCertificate,
          allowRetakes: course.allowRetakes,
          completionMode: course.completionMode,
        }}
        quizzesToRetake={quizzesToRetake}
        onRetakeQuizzes={() => {
          // Navigate to first quiz that can be retaken
          if (quizzesToRetake.length > 0) {
            const firstQuiz = quizzesToRetake[0]
            handleQuizRetake(firstQuiz.id)
            // Find module and lesson for this quiz
            const module = course.modules?.find(m => 
              (m.lessons || []).some(l => l.id === firstQuiz.id)
            )
            if (module) {
              const lesson = module.lessons?.find(l => l.id === firstQuiz.id)
              if (lesson) {
                handleLessonSelect(module.id, lesson.id)
                setCourseCompleted(false) // Exit completion page
              }
            }
          }
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('viewer.loadingCourse')}</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('viewer.courseNotFound')}</h2>
          <Button onClick={() => navigate('/dashboard')}>
            {t('viewer.backToDashboard')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10 shadow-sm safe-top">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                onClick={() => navigate('/library')}
                className="gap-2 flex-shrink-0 touch-target"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">{t('viewer.myLibrary')}</span>
              </Button>
              {/* Mobile: Menu button for sidebar */}
              {isMobile && (
                <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 touch-target flex-shrink-0"
                    >
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">{t('viewer.openNavigation')}</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle className="text-left">{t('viewer.courseNavigation')}</SheetTitle>
                    </SheetHeader>
                    <div className="p-4 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
                      {/* Sidebar content */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center rounded-full border bg-muted/40 p-1 text-xs font-medium flex-1">
                          <button
                            className={cn(
                              'flex-1 rounded-full px-3 py-1.5 transition touch-target',
                              navigatorMode === 'heatmap'
                                ? 'bg-background shadow-sm'
                                : 'text-muted-foreground'
                            )}
                            onClick={() => setNavigatorMode('heatmap')}
                          >
                            {t('viewer.map')}
                          </button>
                          <button
                            className={cn(
                              'flex-1 rounded-full px-3 py-1.5 transition touch-target',
                              navigatorMode === 'list'
                                ? 'bg-background shadow-sm'
                                : 'text-muted-foreground'
                            )}
                            onClick={() => setNavigatorMode('list')}
                          >
                            {t('viewer.list')}
                          </button>
                        </div>
                      </div>

                      {navigatorMode === 'heatmap' ? (
                        <CourseHeatmapNavigator
                          modules={moduleNavigatorData}
                          currentLessonId={currentLessonId}
                          onLessonSelect={(moduleId, lessonId) => {
                            handleLessonSelect(moduleId, lessonId)
                            setMobileSidebarOpen(false)
                          }}
                        />
                      ) : (
                        <div className="rounded-2xl border bg-card p-4 shadow-sm">
                          <ModuleNavigation
                            modules={moduleNavigatorData}
                            currentLessonId={currentLessonId}
                            onLessonSelect={(moduleId, lessonId) => {
                              handleLessonSelect(moduleId, lessonId)
                              setMobileSidebarOpen(false)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              <div className="border-l pl-2 sm:pl-4 min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-bold truncate">{course.title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {completedLessons.size} {t('viewer.of')} {totalLessons || 0} {t('viewer.lessonsCompleted')}
                </p>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0}%</p>
                <p className="text-xs text-muted-foreground">{t('viewer.progress')}</p>
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
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${sidebarCollapsed || isMobile ? '' : 'lg:grid-cols-12'}`}>
          {/* Desktop Sidebar */}
          {!sidebarCollapsed && !isMobile && (
            <aside className="lg:col-span-3 space-y-4 max-w-[260px]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center rounded-full border bg-muted/40 p-1 text-xs font-medium flex-1">
                  <button
                    className={cn(
                      'flex-1 rounded-full px-3 py-1 transition',
                      navigatorMode === 'heatmap'
                        ? 'bg-background shadow-sm'
                        : 'text-muted-foreground'
                    )}
                    onClick={() => setNavigatorMode('heatmap')}
                  >
                    {t('viewer.map')}
                  </button>
                  <button
                    className={cn(
                      'flex-1 rounded-full px-3 py-1 transition',
                      navigatorMode === 'list'
                        ? 'bg-background shadow-sm'
                        : 'text-muted-foreground'
                    )}
                    onClick={() => setNavigatorMode('list')}
                  >
                    {t('viewer.list')}
                  </button>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setSidebarCollapsed(true)}
                        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
                      >
                        <PanelLeftClose className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('viewer.hideNavigation')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {navigatorMode === 'heatmap' ? (
                <CourseHeatmapNavigator
                  modules={moduleNavigatorData}
                  currentLessonId={currentLessonId}
                  onLessonSelect={handleLessonSelect}
                />
              ) : (
                <div className="rounded-2xl border bg-card p-4 shadow-sm max-h-[65vh] overflow-y-auto">
                  <ModuleNavigation
                    modules={moduleNavigatorData}
                    currentLessonId={currentLessonId}
                    onLessonSelect={handleLessonSelect}
                  />
                </div>
              )}
            </aside>
          )}

          {/* Main Content Area */}
          <main className={sidebarCollapsed || isMobile ? 'lg:col-span-12' : 'lg:col-span-9'}>
            {sidebarCollapsed && !isMobile && (
              <div className="mb-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSidebarCollapsed(false)}
                        className="p-2 touch-target"
                      >
                        <PanelRightClose className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('viewer.showNavigation')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            <div className="mb-6">
              <CourseMissionPanel
                courseTitle={course.title}
                currentModuleTitle={currentModule?.title}
                currentLessonTitle={currentLesson?.title}
              />
            </div>
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
                      // Guardar score del quiz (accuracy) para el cálculo final
                      // Incluso si no pasó el quiz, guardamos el score para el cálculo del curso
                      if (currentLessonId && results.accuracy !== undefined) {
                        setQuizScores(prev => new Map(prev).set(currentLessonId, results.accuracy))
                        console.log('Quiz completed:', results, 'Accuracy:', results.accuracy)
                      }
                      // Marcar el quiz como completado para habilitar el botón de completar lección
                      // IMPORTANTE: Permitimos completar el quiz aunque no se haya pasado (score bajo)
                      // Esto permite al usuario avanzar y completar el curso, aunque con menor puntuación
                      if (currentLessonId) {
                        setCompletedQuizzes(prev => new Set([...prev, currentLessonId]))
                      }
                      // NO avanzar automáticamente - dejar que el usuario revise sus resultados
                      // y haga clic en "Marcar como Completado" cuando esté listo
                    }}
                  />
                )}

                {/* Navigation and Complete Button */}
                <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-end border rounded-2xl p-3 sm:p-4 shadow-sm bg-card">
                  <div className="flex flex-wrap items-stretch sm:items-center justify-end gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      onClick={goToPreviousLesson}
                      disabled={isFirstLesson()}
                      className="min-w-[120px] touch-target flex-1 sm:flex-initial"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      {t('viewer.previous')}
                    </Button>
                    {!isCurrentLessonCompleted && (
                      <Button
                        onClick={handleCompleteLesson}
                        disabled={completing || !canCompleteLesson}
                        className="gap-2 min-w-[190px] touch-target flex-1 sm:flex-initial"
                        title={
                          isCurrentLessonQuiz && !isQuizCompleted
                            ? t('viewer.completeQuizFirst')
                            : ''
                        }
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">{completing ? t('viewer.completing') : t('viewer.markAsCompleted')}</span>
                        <span className="sm:hidden">{completing ? t('viewer.completing') : t('viewer.complete')}</span>
                      </Button>
                    )}

                    <Button
                      variant={isCurrentLessonCompleted ? 'default' : 'outline'}
                      onClick={goToNextLesson}
                      disabled={isLastLesson()}
                      className="min-w-[120px] touch-target flex-1 sm:flex-initial"
                    >
                      {t('viewer.next')}
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
      <GameNotificationQueue
        notifications={gameNotifications}
        onRemove={(id) =>
          setGameNotifications((prev) => prev.filter((notification) => notification.id !== id))
        }
      />

      {/* AI Chat Assistant */}
      {course && (
        <AIChatAssistant courseId={course.id} courseTitle={course.title} />
      )}
    </div>
  )
}
