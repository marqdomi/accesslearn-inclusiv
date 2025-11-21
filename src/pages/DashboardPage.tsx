import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Clock, CheckCircle2, LogOut, Users, Calendar, ClipboardList, Library, Settings, BarChart3, UserCog } from 'lucide-react'
import { RequireRole } from '@/components/auth/RequireRole'
import { RequirePermission } from '@/components/auth/RequirePermission'

interface Course {
  id: string
  title: string
  description: string
  status: 'draft' | 'active' | 'archived'
  difficulty: string
  estimatedHours: number
  modules: any[]
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { currentTenant } = useTenant()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [notificationCounts, setNotificationCounts] = useState({
    pendingRequests: 0,
    acceptedSessions: 0,
    rejectedRequests: 0
  })

  useEffect(() => {
    loadCourses()
    loadNotifications()
  }, [currentTenant, user])

  const loadCourses = async () => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const data = await ApiService.getCourses(currentTenant.id)
      setCourses(data.filter((c: Course) => c.status === 'active'))
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = async () => {
    if (!currentTenant || !user) return

    try {
      if (user.role === 'mentor') {
        // Load pending requests for mentors
        const requests = await ApiService.getMentorPendingRequests(currentTenant.id, user.id)
        setNotificationCounts(prev => ({ ...prev, pendingRequests: requests.length }))
      } else {
        // Load session updates for students - check for new scheduled sessions
        const scheduledSessions = await ApiService.getMenteeSessions(currentTenant.id, user.id, 'scheduled')
        // For simplicity, show count of all scheduled sessions as "new"
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {currentTenant?.logoUrl && (
                <img 
                  src={currentTenant.logoUrl} 
                  alt={currentTenant.name}
                  className="h-10 w-auto"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{currentTenant?.name}</h1>
                <p className="text-sm text-muted-foreground">Sistema de Aprendizaje</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Navigation Links */}
              <Button variant="ghost" size="sm" onClick={() => navigate('/library')}>
                <Library className="h-4 w-4 mr-2" />
                Mi Biblioteca
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => navigate('/mentors')}>
                <Users className="h-4 w-4 mr-2" />
                Buscar Mentor
              </Button>
              
              {/* Course Creation - For Instructors */}
              <RequireRole roles={['super-admin', 'tenant-admin', 'content-manager', 'instructor']}>
                <Button variant="ghost" size="sm" onClick={() => navigate('/my-courses')}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Mis Cursos
                </Button>
              </RequireRole>
              
              {/* Content Manager Dashboard */}
              <RequireRole roles={['super-admin', 'tenant-admin', 'content-manager']}>
                <Button variant="ghost" size="sm" onClick={() => navigate('/content-manager')}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aprobar Cursos
                </Button>
              </RequireRole>
              
              {/* Admin Controls - Protected by Permissions */}
              <RequirePermission permission="analytics:view-all">
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/analytics')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </RequirePermission>
              
              <RequireRole roles={['super-admin', 'tenant-admin', 'user-manager']}>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
                  <UserCog className="h-4 w-4 mr-2" />
                  Usuarios
                </Button>
              </RequireRole>
              
              <RequireRole roles={['super-admin', 'tenant-admin']}>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
              </RequireRole>
              
              {user?.role === 'mentor' ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/mentor/dashboard')}
                  className="relative"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Mis Mentorados
                  {notificationCounts.pendingRequests > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notificationCounts.pendingRequests}
                    </Badge>
                  )}
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/my-mentorships')}
                  className="relative"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Mis Solicitudes
                  {notificationCounts.acceptedSessions > 0 && (
                    <Badge 
                      variant="default" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notificationCounts.acceptedSessions}
                    </Badge>
                  )}
                </Button>
              )}
              
              <LevelBadge xp={0} size="md" />
              
              <div className="text-right">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Mis Cursos</h2>
          <p className="text-muted-foreground">
            Explora y continúa tu aprendizaje
          </p>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No hay cursos disponibles</h3>
            <p className="text-muted-foreground">
              Contacta al administrador para obtener acceso a cursos.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card 
                key={course.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {course.difficulty}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{course.estimatedHours} horas</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{course.modules?.length || 0} módulos</span>
                    </div>

                    <Button 
                      className="w-full mt-4"
                      onClick={() => navigate(`/courses/${course.id}`)}
                      style={{
                        backgroundColor: currentTenant?.primaryColor,
                      }}
                    >
                      Iniciar Curso
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Data Source Indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Conectado al Backend API</span>
          </div>
        </div>
      </main>
    </div>
  )
}
