import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { Course, UserProgress } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Trophy, History, RotateCcw, TrendingUp, Award } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface LibraryItem {
  progress: UserProgress
  course: Course
}

export function LibraryPage() {
  const { t } = useTranslation('courses')
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  const navigate = useNavigate()
  const [library, setLibrary] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLibrary()
  }, [user, currentTenant])

  const loadLibrary = async () => {
    if (!user || !currentTenant) {
      console.warn('[LibraryPage] Missing user or tenant:', { user: !!user, tenant: !!currentTenant })
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('[LibraryPage] Loading library for user:', user.id, 'tenant:', currentTenant.id)
      
      const progressRecords = await ApiService.getUserLibrary(user.id, currentTenant.id)
      console.log('[LibraryPage] Progress records received:', progressRecords?.length || 0)
      
      if (!progressRecords || progressRecords.length === 0) {
        console.log('[LibraryPage] No progress records found - user may not be enrolled in any courses')
        setLibrary([])
        setLoading(false)
        return
      }
      
      // Load course details for each progress record
      const libraryItems = await Promise.all(
        progressRecords.map(async (progress) => {
          try {
            console.log('[LibraryPage] Loading course:', progress.courseId)
            const course = await ApiService.getCourseById(progress.courseId)
            return { progress, course }
          } catch (err: any) {
            console.error(`[LibraryPage] Failed to load course ${progress.courseId}:`, err)
            // Don't fail silently - log the error
            if (err.status === 401) {
              throw err // Re-throw 401 to trigger logout
            }
            return null
          }
        })
      )

      const validItems = libraryItems.filter((item): item is LibraryItem => item !== null)
      console.log('[LibraryPage] Valid library items:', validItems.length)
      setLibrary(validItems)
    } catch (err: any) {
      console.error('[LibraryPage] Failed to load library:', err)
      if (err.status === 401) {
        // Let ApiService handle 401 errors (logout)
        setError(t('library.sessionExpired'))
      } else {
        setError(err.message || t('library.loadError'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRetake = async (courseId: string) => {
    if (!user || !currentTenant) return

    try {
      await ApiService.startCourseRetake(user.id, courseId, currentTenant.id)
      navigate(`/courses/${courseId}`)
    } catch (err) {
      console.error('Failed to start retake:', err)
      setError(t('library.retakeError'))
    }
  }

  const inProgressItems = library.filter(item => {
    const progress = item.progress.progress !== undefined 
      ? item.progress.progress 
      : (item.progress.bestScore || 0)
    return progress < 100
  })
  const completedItems = library.filter(item => {
    const progress = item.progress.progress !== undefined 
      ? item.progress.progress 
      : (item.progress.bestScore || 0)
    return progress >= 100
  })

  // Get total XP from gamification stats (consistent with dashboard)
  const [totalXP, setTotalXP] = useState(0)
  const totalAttempts = library.reduce((sum, item) => sum + (item.progress.attempts?.length || 0), 0)
  const averageScore = library.length > 0
    ? library.reduce((sum, item) => {
        const progress = item.progress.progress !== undefined 
          ? item.progress.progress 
          : (item.progress.bestScore || 0)
        return sum + progress
      }, 0) / library.length
    : 0

  // Load total XP from gamification stats
  useEffect(() => {
    if (user && !loading) {
      ApiService.getGamificationStats(user.id)
        .then(stats => {
          setTotalXP(stats.totalXP || 0)
        })
        .catch(error => {
          // Fallback to library sum if gamification stats fail
          console.warn('Failed to load gamification stats, using library XP sum:', error)
          const libraryXP = library.reduce((sum, item) => sum + (item.progress.totalXpEarned || 0), 0)
          setTotalXP(libraryXP)
        })
    }
  }, [user, library, loading])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">{t('library.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error}</p>
            <div className="flex justify-center mt-4">
              <Button onClick={loadLibrary}>{t('library.retry')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('library.title')}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t('library.subtitle')}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
        <Card className="p-3 sm:p-6">
          <CardHeader className="pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              {t('library.totalCourses')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <span className="text-xl sm:text-2xl font-bold">{library.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-6">
          <CardHeader className="pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              {t('library.totalXP')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />
              <span className="text-xl sm:text-2xl font-bold">{totalXP}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-6">
          <CardHeader className="pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              {t('library.averageScore')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
              <span className="text-xl sm:text-2xl font-bold">{averageScore.toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="p-3 sm:p-6">
          <CardHeader className="pb-2 p-0">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              {t('library.totalAttempts')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
              <span className="text-xl sm:text-2xl font-bold">{totalAttempts}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="in-progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="in-progress" className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 touch-target">
            <span className="hidden sm:inline">{t('library.inProgress')}</span>
            <span className="sm:hidden">{t('library.inProgressShort')}</span>
            <span className="ml-1">({inProgressItems.length})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 touch-target">
            <span className="hidden sm:inline">{t('library.completed')}</span>
            <span className="sm:hidden">{t('library.completedShort')}</span>
            <span className="ml-1">({completedItems.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 touch-target">
            {t('library.all')} ({library.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="mt-6">
          {inProgressItems.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t('library.noInProgress')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {inProgressItems.map(({ course, progress }) => (
                <CourseLibraryCard
                  key={course.id}
                  course={course}
                  progress={progress}
                  onRetake={handleRetake}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedItems.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t('library.noCompleted')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {completedItems.map(({ course, progress }) => (
                <CourseLibraryCard
                  key={course.id}
                  course={course}
                  progress={progress}
                  onRetake={handleRetake}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {library.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t('library.emptyLibrary')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {library.map(({ course, progress }) => (
                <CourseLibraryCard
                  key={course.id}
                  course={course}
                  progress={progress}
                  onRetake={handleRetake}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface CourseLibraryCardProps {
  course: Course
  progress: UserProgress
  onRetake: (courseId: string) => void
}

function CourseLibraryCard({ course, progress, onRetake }: CourseLibraryCardProps) {
  const { t } = useTranslation('courses')
  const navigate = useNavigate()
  const bestScore = progress.bestScore || 0
  
  // Calculate progress based on completed lessons vs total lessons
  const completedLessons = progress.completedLessons?.length || 0
  // Handle both Course structure (ContentModule[]) and CourseStructure (Module[] with lessons)
  const totalLessons = (course as any).modules?.reduce((sum: number, module: any) => {
    // If module has lessons array (CourseStructure format)
    if (module.lessons && Array.isArray(module.lessons)) {
      return sum + module.lessons.length
    }
    // Otherwise, count modules as lessons (legacy Course format)
    return sum + 1
  }, 0) || 0
  
  // Use progress percentage from backend, or calculate from lessons
  const progressPercentage = progress.progress !== undefined 
    ? progress.progress 
    : (totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0)
  
  const attemptCount = progress.attempts?.length || 0
  const totalXP = progress.totalXpEarned || 0
  const isCompleted = progressPercentage >= 100 || bestScore >= 100
  const isInProgress = (progress.status === 'in-progress' || progressPercentage > 0) && progressPercentage < 100

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg mb-1 line-clamp-2">{course.title}</CardTitle>
            <CardDescription className="line-clamp-2 text-xs sm:text-sm">
              {course.description}
            </CardDescription>
          </div>
          {isCompleted && (
            <Award className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('library.progress')}</span>
            <span className="font-semibold">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          {totalLessons > 0 && (
            <p className="text-xs text-muted-foreground">
              {completedLessons} {t('library.ofLessons')} {totalLessons} {t('library.lessonsCompleted')}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1">
            <History className="h-3 w-3" />
            {attemptCount} {attemptCount === 1 ? t('library.attempt') : t('library.attempts')}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Trophy className="h-3 w-3" />
            {totalXP} XP
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          {!isCompleted && (
            <Button
              onClick={() => {
                if (isInProgress) {
                  // Si está en progreso, solo navegar (continuar)
                  navigate(`/courses/${course.id}`)
                } else {
                  // Si ya completó pero < 100%, reintentar
                  onRetake(course.id)
                }
              }}
              className="flex-1 gap-2"
              variant="default"
            >
              {isInProgress ? (
                <>
                  <BookOpen className="h-4 w-4" />
                  {t('library.continue')}
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4" />
                  {t('library.retake')}
                </>
              )}
            </Button>
          )}
          {(isCompleted || !isInProgress) && (
            <Button
              onClick={() => {
                if (!isInProgress && attemptCount > 0 && bestScore < 100) {
                  // Si ya tiene intentos y quiere ver de nuevo, reintentar
                  onRetake(course.id)
                } else {
                  // Si está completado o es primer intento, solo ver
                  navigate(`/courses/${course.id}`)
                }
              }}
              variant={isCompleted ? 'default' : 'outline'}
              className="flex-1"
            >
              {attemptCount === 0 ? t('library.start') : t('library.viewCourse')}
            </Button>
          )}
        </div>

        {attemptCount > 0 && (
          <Button
            onClick={() => {
              // TODO: Open attempt history modal
              console.log('View history for:', course.id)
            }}
            variant="ghost"
            className="w-full gap-2"
            size="sm"
          >
            <History className="h-4 w-4" />
            {t('library.viewAttemptHistory')}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
