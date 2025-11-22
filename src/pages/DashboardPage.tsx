import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { LevelProgressDashboard } from '@/components/gamification/LevelProgressDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  LogOut, 
  Users, 
  Calendar, 
  ClipboardList, 
  Library, 
  Settings, 
  BarChart3, 
  UserCog,
  Sparkles,
  GraduationCap,
  Zap,
  Target,
  TrendingUp,
  Medal,
  PlayCircle,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { RequireRole } from '@/components/auth/RequireRole'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Course {
  id: string
  title: string
  description: string
  status: 'draft' | 'active' | 'archived'
  difficulty: string
  estimatedHours: number
  modules: any[]
  totalXP?: number
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
  const { user, logout } = useAuth()
  const { currentTenant } = useTenant()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
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

      // Calculate real progress from user's enrolled courses
      let totalProgress = 0
      let enrolledCount = 0
      let completedCount = 0
      
      for (const course of activeCourses) {
        try {
          const progress = await ApiService.getCourseProgress(user.id, course.id)
          if (progress && progress.completedLessons) {
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
            }
          }
        } catch (err) {
          // Course not enrolled or no progress, skip
          console.debug(`No progress found for course ${course.id}`)
        }
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
        totalXP: userTotalXP, // Use actual user XP from backend
        averageProgress,
      })

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

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'student': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'instructor': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      'mentor': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      'content-manager': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      'tenant-admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      'super-admin': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      'student': 'Estudiante',
      'instructor': 'Instructor',
      'mentor': 'Mentor',
      'content-manager': 'Content Manager',
      'tenant-admin': 'Admin del Tenant',
      'super-admin': 'Super Admin',
    }
    return labels[role] || role
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

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">{currentTenant?.name}</h1>
                <p className="text-sm text-muted-foreground">Plataforma de Aprendizaje</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right pr-4">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <Badge className={getRoleColor(user?.role || '')}>
                    {getRoleLabel(user?.role || '')}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <LevelBadge xp={stats.totalXP} size="md" />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-2">¡Bienvenido de vuelta, {user?.firstName}! 👋</h2>
              <p className="text-lg text-muted-foreground">
                Continúa tu viaje de aprendizaje y alcanza nuevas metas
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Responsive */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Cursos</p>
                  <p className="text-3xl font-bold">{stats.totalCourses}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-0">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Inscrito</p>
                  <p className="text-3xl font-bold">{stats.enrolledCourses}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <PlayCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-0">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completado</p>
                  <p className="text-3xl font-bold">{stats.completedCourses}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-0">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">XP Total</p>
                  <p className="text-3xl font-bold">{stats.totalXP}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-0">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Progreso</p>
                  <p className="text-3xl font-bold">{stats.averageProgress}%</p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress Dashboard */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="progress">Progreso de Nivel</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3 mb-8">
              {/* Featured Section - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="overflow-hidden border-2">
              <CardHeader className="bg-linear-to-r from-primary/5 to-primary/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>Acciones Rápidas</CardTitle>
                </div>
                <CardDescription>Accede a las funciones más importantes</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => navigate('/catalog')}
                  >
                    <BookOpen className="h-5 w-5" />
                    <span className="text-xs">Catálogo de Cursos</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => navigate('/library')}
                  >
                    <Library className="h-5 w-5" />
                    <span className="text-xs">Mi Biblioteca</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => navigate('/mentors')}
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-xs">Buscar Mentor</span>
                  </Button>

                  <RequireRole roles={['super-admin', 'tenant-admin', 'content-manager', 'instructor']}>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => navigate('/my-courses')}
                    >
                      <BookOpen className="h-5 w-5" />
                      <span className="text-xs">Mis Cursos</span>
                    </Button>
                  </RequireRole>

                  <RequireRole roles={['super-admin', 'tenant-admin', 'content-manager']}>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => navigate('/content-manager')}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-xs">Aprobar Cursos</span>
                    </Button>
                  </RequireRole>

                  {user?.role === 'mentor' ? (
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col items-center gap-2 relative"
                      onClick={() => navigate('/mentor/dashboard')}
                    >
                      <Calendar className="h-5 w-5" />
                      <span className="text-xs">Mentorados</span>
                      {notificationCounts.pendingRequests > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {notificationCounts.pendingRequests}
                        </Badge>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col items-center gap-2 relative"
                      onClick={() => navigate('/my-mentorships')}
                    >
                      <ClipboardList className="h-5 w-5" />
                      <span className="text-xs">Solicitudes</span>
                      {notificationCounts.acceptedSessions > 0 && (
                        <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {notificationCounts.acceptedSessions}
                        </Badge>
                      )}
                    </Button>
                  )}

                  <RequirePermission permission="analytics:view-all">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => navigate('/admin/analytics')}
                    >
                      <BarChart3 className="h-5 w-5" />
                      <span className="text-xs">Analytics</span>
                    </Button>
                  </RequirePermission>
                </div>
              </CardContent>
            </Card>

            {/* Featured Courses */}
            <Card className="overflow-hidden border-2">
              <CardHeader className="bg-linear-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
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
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No hay cursos disponibles</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courses.slice(0, 3).map((course) => (
                      <div 
                        key={course.id}
                        className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer group"
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">{course.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">{course.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {course.estimatedHours}h
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <BookOpen className="h-3 w-3" />
                                {course.modules?.length || 0} módulos
                              </div>
                              <Badge variant="outline" className="text-xs">{course.difficulty}</Badge>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors ml-2 shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Features Widget */}
            <Card className="overflow-hidden border-2">
              <CardHeader className="bg-linear-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <div className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <CardTitle className="text-sm">Características</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mt-1 shrink-0">
                      <Target className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Cursos Interactivos</p>
                      <p className="text-xs text-muted-foreground">Aprende con contenido multimedia</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mt-1 shrink-0">
                      <Zap className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Sistema XP</p>
                      <p className="text-xs text-muted-foreground">Gana puntos y sube de nivel</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mt-1 shrink-0">
                      <Users className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Mentoría Personalizada</p>
                      <p className="text-xs text-muted-foreground">Conéctate con expertos</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mt-1 shrink-0">
                      <TrendingUp className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Progreso Detallado</p>
                      <p className="text-xs text-muted-foreground">Monitorea tu desarrollo</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Section - Conditional */}
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
