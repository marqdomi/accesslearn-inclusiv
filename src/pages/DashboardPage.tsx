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
  Zap,
  TrendingUp,
  PlayCircle,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { DynamicLearningCard } from '@/components/dashboard/DynamicLearningCard'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecommendedCourses } from '@/components/dashboard/RecommendedCourses'
import { AchievementsProgressCard } from '@/components/dashboard/AchievementsProgressCard'
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
  const [coursesInProgress, setCoursesInProgress] = useState<Array<{
    course: Course
    progress: CourseProgress
    progressPercent: number
    lastAccessed: number
  }>>([])
  const [enrolledCoursesNotStarted, setEnrolledCoursesNotStarted] = useState<Array<{
    course: Course
    progress: CourseProgress
    progressPercent: number
    lastAccessed: number
  }>>([])
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
      
      // Load all courses and user's library in parallel
      const [coursesData, userLibrary] = await Promise.all([
        ApiService.getCourses(currentTenant.id),
        ApiService.getUserLibrary(user.id, currentTenant.id)
      ])
      
      // Filter active courses for display, but include ALL courses for user's library matching
      const activeCourses = coursesData.filter((c: Course) => c.status === 'active')
      setCourses(activeCourses)

      // Separate courses: in progress vs enrolled but not started
      let coursesInProgressList: Array<{
        course: Course
        progress: CourseProgress
        progressPercent: number
        lastAccessed: number
      }> = []
      let enrolledNotStartedList: Array<{
        course: Course
        progress: CourseProgress
        progressPercent: number
        lastAccessed: number
      }> = []
      const enrolledIds: string[] = []

      // Calculate real progress from user's library (source of truth)
      let totalProgress = 0
      let enrolledCount = userLibrary.length
      let totalXPFromLibrary = 0

      // Create a map of ALL courses (not just active) for matching with user's library
      // This ensures we can find courses even if they're not marked as 'active'
      const allCoursesMap = new Map(coursesData.map((c: Course) => [c.id, c]))
      const activeCoursesMap = new Map(activeCourses.map((c: Course) => [c.id, c]))

      // Calculate completed count using EXACT same logic as LibraryPage
      // LibraryPage uses: progress >= 100 where progress = progress || bestScore || 0
      const completedCount = userLibrary.filter(libraryItem => {
        const progress = libraryItem.progress !== undefined 
          ? libraryItem.progress 
          : (libraryItem.bestScore || 0)
        return progress >= 100
      }).length

      // Process each course in user's library
      for (const libraryItem of userLibrary) {
        // Try to find course in all courses first (not just active)
        let course = allCoursesMap.get(libraryItem.courseId)
        if (!course) {
          // Course might have been deleted or not in the list, try to fetch it individually
          try {
            course = await ApiService.getCourseById(libraryItem.courseId)
          } catch (err) {
            // Course doesn't exist or can't be fetched, skip
            continue
          }
        }
        
        if (!course) {
          // Course doesn't exist, skip
          continue
        }

        console.log('[Dashboard] Course found:', course.title)
        enrolledIds.push(libraryItem.courseId)

        // Calculate progress percentage - Use EXACT same logic as LibraryPage
        const totalLessons = course.modules?.reduce((sum: number, m: any) =>
          sum + (m.lessons?.length || 0), 0) || 0
        const completedLessons = libraryItem.completedLessons?.length || 0
        
        // Get effective progress using same logic as LibraryPage
        // Priority: progress -> bestScore -> calculated from lessons
        const effectiveProgress = libraryItem.progress !== undefined 
          ? libraryItem.progress 
          : (libraryItem.bestScore !== undefined 
              ? libraryItem.bestScore 
              : (totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0))
        
        // Ensure progress is between 0-100
        const courseProgress = Math.max(0, Math.min(100, effectiveProgress))
        
        totalProgress += courseProgress

        // Sum XP from library
        totalXPFromLibrary += libraryItem.totalXpEarned || 0

        const lastAccessed = libraryItem.lastAccessedAt 
          ? new Date(libraryItem.lastAccessedAt).getTime()
          : (libraryItem.lastAccessed || Date.now())

        // Convert UserProgress to CourseProgress format for compatibility
        const progressData: CourseProgress = {
          courseId: libraryItem.courseId,
          status: libraryItem.status || 'in-progress',
          completedLessons: libraryItem.completedLessons || [],
          lastAccessedAt: libraryItem.lastAccessedAt || new Date(lastAccessed).toISOString(),
          progress: courseProgress,
        }

        // Determine if course is completed using same logic as LibraryPage
        // Check completion BEFORE adding to lists
        const progressForCompletion = libraryItem.progress !== undefined 
          ? libraryItem.progress 
          : (libraryItem.bestScore !== undefined ? libraryItem.bestScore : 0)
        const isCompleted = progressForCompletion >= 100
        
        // Only add to lists if NOT completed
        if (!isCompleted) {
          if (courseProgress > 0) {
            // Course in progress (has some progress but not completed)
            coursesInProgressList.push({
              course,
              progress: progressData,
              progressPercent: courseProgress,
              lastAccessed,
            })
          } else {
            // Enrolled but not started (0% progress)
            enrolledNotStartedList.push({
              course,
              progress: progressData,
              progressPercent: 0,
              lastAccessed,
            })
          }
        }
      }

      // Sort by last accessed (most recent first)
      coursesInProgressList.sort((a, b) => b.lastAccessed - a.lastAccessed)
      enrolledNotStartedList.sort((a, b) => b.lastAccessed - a.lastAccessed)

      // Set state for dynamic card
      setCoursesInProgress(coursesInProgressList)
      setEnrolledCoursesNotStarted(enrolledNotStartedList)

      const averageProgress = enrolledCount > 0
        ? Math.round(totalProgress / enrolledCount)
        : 0

      // Get user's total XP from backend (use gamification stats as primary source)
      let userTotalXP = 0
      try {
        const stats = await ApiService.getGamificationStats(user.id)
        userTotalXP = stats.totalXP || 0
      } catch (error) {
        // Fallback to library XP sum if gamification stats fail
        console.warn('Failed to load gamification stats, using library XP sum:', error)
        userTotalXP = totalXPFromLibrary
      }

      // If gamification stats returns 0 but we have XP in library, use library sum
      if (userTotalXP === 0 && totalXPFromLibrary > 0) {
        userTotalXP = totalXPFromLibrary
      }

      // Calculate stats
      // Total courses should be the number of enrolled courses (user's library), not all active courses
      setStats({
        totalCourses: enrolledCount, // Changed from activeCourses.length to enrolledCount
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
            {getGreeting()}, {user?.firstName}!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Continúa tu viaje de aprendizaje y alcanza nuevas metas
          </p>
        </div>

        {/* Dynamic Learning Card - PRIMARY ACTION */}
        <div className="mb-6 md:mb-8">
          <DynamicLearningCard 
            coursesInProgress={coursesInProgress}
            enrolledCourses={enrolledCoursesNotStarted}
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

            {/* Achievements and Progress Card */}
            <AchievementsProgressCard />
          </TabsContent>
          
          <TabsContent value="progress" className="mt-6">
            <LevelProgressDashboard userId={user?.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
