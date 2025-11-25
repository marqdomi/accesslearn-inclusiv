import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { LevelProgressDashboard } from '@/components/gamification/LevelProgressDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Clock,
  CheckCircle2,
  GraduationCap,
  Zap,
  TrendingUp,
  PlayCircle,
  ChevronRight,
  ArrowRight,
  UserCog,
  Settings,
} from 'lucide-react'
import { RequireRole } from '@/components/auth/RequireRole'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { ContinueLearningCard } from '@/components/dashboard/ContinueLearningCard'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecommendedCourses } from '@/components/dashboard/RecommendedCourses'
import { useDashboardTrends } from '@/hooks/use-dashboard-trends'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

interface Course {
  id: string
  title: string
  description: string
  status: 'draft' | 'active' | 'archived'
  difficulty: string
  estimatedHours: number
  modules: any[]
  totalXP?: number
  coverImage?: string
}

interface CourseProgress {
  courseId: string
  status: string
  completedLessons?: string[]
  lastAccessedAt?: string
  progress?: number
}

interface DashboardStats {
  totalCourses: number
  enrolledCourses: number
  completedCourses: number
  totalXP: number
  averageProgress: number
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  const { t } = useTranslation('dashboard')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null)
  const [currentProgress, setCurrentProgress] = useState<CourseProgress | null>(null)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    enrolledCourses: 0,
    completedCourses: 0,
    totalXP: 0,
    averageProgress: 0,
  })
  const [notificationCounts, setNotificationCounts] = useState({
    pendingRequests: 0,
    acceptedSessions: 0,
    rejectedRequests: 0
  })

  // Calculate trends for stats
  const trends = useDashboardTrends(stats)

  useEffect(() => {
    loadDashboard()
  }, [currentTenant, user])

  const loadDashboard = async () => {
    if (!currentTenant || !user) return

    try {
      setLoading(true)
      const data = await ApiService.getCourses(currentTenant.id)
      const activeCourses = data.filter((c: Course) => c.status === 'active')
      setCourses(activeCourses)

      // Find current course in progress (most recently accessed, not completed)
      let enrolledCoursesWithProgress: Array<{
        course: Course
        progress: CourseProgress
        progressPercent: number
        lastAccessed: number
      }> = []
      const enrolledIds: string[] = []

      // Calculate real progress from user's enrolled courses
      let totalProgress = 0
      let enrolledCount = 0
      let completedCount = 0

      for (const course of activeCourses) {
        try {
          const progress = await ApiService.getCourseProgress(user.id, course.id)
          if (progress && progress.completedLessons) {
            enrolledIds.push(course.id)
            enrolledCount++
            // Calculate progress percentage based on completed lessons
            const totalLessons = course.modules?.reduce((sum: number, m: any) =>
              sum + (m.lessons?.length || 0), 0) || 0
            const completedLessons = progress.completedLessons?.length || 0
            const courseProgress = totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0
            totalProgress += courseProgress

            // Consider completed if 100% or all lessons completed
            if (courseProgress === 100 || completedLessons >= totalLessons) {
              completedCount++
            } else {
              // Course in progress - add to list
              const lastAccessed = progress.lastAccessedAt 
                ? new Date(progress.lastAccessedAt).getTime()
                : Date.now()
              
              enrolledCoursesWithProgress.push({
                course,
                progress,
                progressPercent: courseProgress,
                lastAccessed,
              })
            }
          }
        } catch (err) {
          // Course not enrolled or no progress, skip
          console.debug(`No progress found for course ${course.id}`)
        }
      }

      // Find most recently accessed course in progress
      if (enrolledCoursesWithProgress.length > 0) {
        enrolledCoursesWithProgress.sort((a, b) => b.lastAccessed - a.lastAccessed)
        const mostRecent = enrolledCoursesWithProgress[0]
        setCurrentCourse(mostRecent.course)
        setCurrentProgress(mostRecent.progress)
      } else {
        setCurrentCourse(null)
        setCurrentProgress(null)
      }

      const averageProgress = enrolledCount > 0
        ? Math.round(totalProgress / enrolledCount)
        : 0

      // Get user's total XP from backend (use gamification stats)
      let userTotalXP = 0
      try {
        const stats = await ApiService.getGamificationStats(user.id)
        userTotalXP = stats.totalXP || 0
      } catch (error) {
        // Fallback to user data
        try {
          const userData = await ApiService.getUserById(user.id)
          userTotalXP = userData.totalXP || 0
        } catch (err) {
          console.error('Error loading user XP:', err)
        }
      }

      // Calculate stats
      setStats({
        totalCourses: activeCourses.length,
        enrolledCourses: enrolledCount,
        completedCourses: completedCount,
        totalXP: userTotalXP,
        averageProgress,
      })

      // Store enrolled course IDs for recommendations
      setEnrolledCourseIds(enrolledIds)

      loadNotifications()
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = async () => {
    if (!currentTenant || !user) return

    try {
      if (user.role === 'mentor') {
        const requests = await ApiService.getMentorPendingRequests(currentTenant.id, user.id)
        setNotificationCounts(prev => ({ ...prev, pendingRequests: requests.length }))
      } else {
        const scheduledSessions = await ApiService.getMenteeSessions(currentTenant.id, user.id, 'scheduled')
        setNotificationCounts(prev => ({
          ...prev,
          acceptedSessions: scheduledSessions.length
        }))
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <AppNavbar userXP={stats.totalXP} />

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Welcome Section - More Compact */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            {getGreeting()}, {user?.firstName}! 👋
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Continúa tu viaje de aprendizaje y alcanza nuevas metas
          </p>
        </div>

        {/* Continue Learning Card - PRIMARY ACTION */}
        <div className="mb-6 md:mb-8">
          <ContinueLearningCard 
            course={currentCourse}
            progress={currentProgress}
            loading={loading}
          />
        </div>

        {/* Stats Grid - More Compact */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
          <StatsCard
            title="Total de Cursos"
            value={stats.totalCourses}
            icon={BookOpen}
            color="blue"
            trend={trends.totalCourses || undefined}
            loading={loading}
          />
          <StatsCard
            title="Inscrito"
            value={stats.enrolledCourses}
            icon={PlayCircle}
            color="purple"
            trend={trends.enrolledCourses || undefined}
            loading={loading}
          />
          <StatsCard
            title="Completado"
            value={stats.completedCourses}
            icon={CheckCircle2}
            color="green"
            trend={trends.completedCourses || undefined}
            loading={loading}
          />
          <StatsCard
            title="XP Total"
            value={stats.totalXP}
            icon={Zap}
            color="yellow"
            trend={trends.totalXP || undefined}
            loading={loading}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-6 md:mb-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Accede a las funciones más importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <QuickActions notificationCounts={notificationCounts} />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Inicio
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Progreso de Nivel
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Recommended Courses */}
            <RecommendedCourses
              courses={courses}
              currentEnrolledCourseIds={enrolledCourseIds}
              loading={loading}
            />

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Featured Courses - 2 columns */}
              <div className="lg:col-span-2">
                <Card className="overflow-hidden border-2">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <CardTitle>Cursos Destacados</CardTitle>
                      </div>
                      {courses.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/library')}
                        >
                          Ver todos
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {courses.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                      >
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: 'spring' }}
                          className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mb-6"
                        >
                          <BookOpen className="h-10 w-10 text-muted-foreground" />
                        </motion.div>
                        <h3 className="text-xl font-bold mb-2">No hay cursos disponibles</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                          Explora el catálogo para encontrar cursos interesantes y comienza tu viaje de aprendizaje
                        </p>
                        <Button 
                          onClick={() => navigate('/catalog')} 
                          className="gap-2"
                          size="lg"
                        >
                          <BookOpen className="h-4 w-4" />
                          Explorar Catálogo
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="space-y-3">
                        {courses.slice(0, 3).map((course) => (
                          <div
                            key={course.id}
                            className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
                            onClick={() => navigate(`/courses/${course.id}`)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-1 mb-1">
                                  {course.title}
                                </h4>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {course.description}
                                </p>
                                <div className="flex items-center gap-4 flex-wrap">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {course.estimatedHours}h
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <BookOpen className="h-3 w-3" />
                                    {course.modules?.length || 0} módulos
                                  </div>
                                  {course.totalXP && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Zap className="h-3 w-3" />
                                      {course.totalXP} XP
                                    </div>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {course.difficulty}
                                  </Badge>
                                </div>
                              </div>
                              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors ml-3 shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Admin Section Only */}
              <div className="space-y-6">
                <RequireRole roles={['super-admin', 'tenant-admin', 'user-manager']}>
                  <Card className="overflow-hidden border-2 border-destructive/30">
                    <CardHeader className="bg-destructive/5">
                      <div className="flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-destructive" />
                        <CardTitle className="text-sm">Administración</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => navigate('/admin/users')}
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          Gestionar Usuarios
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => navigate('/admin/settings')}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configuración
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </RequireRole>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="mt-6">
            <LevelProgressDashboard userId={user?.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
