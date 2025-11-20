import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Calendar,
  Star,
  Clock,
  TrendingUp,
  Bell,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { MentorshipRequest, MentorshipSession } from '@/lib/types'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function MentorDashboardPage() {
  const { user } = useAuth()
  const { currentTenant } = useTenant()

  const [loading, setLoading] = useState(true)
  const [pendingRequests, setPendingRequests] = useState<MentorshipRequest[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<MentorshipSession[]>([])
  const [completedSessions, setCompletedSessions] = useState<MentorshipSession[]>([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    scheduledSessions: 0,
    totalMentees: 0,
    averageRating: 0,
    pendingRequests: 0
  })

  useEffect(() => {
    loadData()
  }, [user, currentTenant])

  const loadData = async () => {
    if (!user || !currentTenant) return

    try {
      setLoading(true)

      // Cargar solicitudes pendientes
      const requests = await ApiService.getMentorPendingRequests(currentTenant.id, user.id)
      setPendingRequests(requests)

      // Cargar sesiones
      const sessions = await ApiService.getMentorSessions(currentTenant.id, user.id)
      const scheduled = sessions.filter(s => s.status === 'scheduled')
      const completed = sessions.filter(s => s.status === 'completed')
      
      setUpcomingSessions(scheduled)
      setCompletedSessions(completed)

      // Cargar stats
      const statsData = await ApiService.getMentorStats(currentTenant.id, user.id)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading mentor data:', error)
      toast.error('Error al cargar datos de mentoría')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (request: MentorshipRequest) => {
    try {
      // Por ahora, programar para mañana a las 10am
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)

      await ApiService.acceptMentorshipRequest(
        request.id,
        currentTenant!.id,
        tomorrow.getTime(),
        60
      )

      toast.success('¡Solicitud aceptada!', {
        description: 'La sesión se programó exitosamente'
      })

      loadData()
    } catch (error) {
      console.error('Error accepting request:', error)
      toast.error('Error al aceptar la solicitud')
    }
  }

  const handleRejectRequest = async (request: MentorshipRequest) => {
    try {
      await ApiService.rejectMentorshipRequest(request.id, currentTenant!.id)
      
      toast.info('Solicitud rechazada', {
        description: 'Se notificó al estudiante'
      })

      loadData()
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Error al rechazar la solicitud')
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard de Mentor 🎓</h1>
        <p className="text-muted-foreground">
          Gestiona tus mentorados y sesiones programadas
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                  Mentorados Activos
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.totalMentees}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-200 dark:bg-blue-800">
                <Users className="h-6 w-6 text-blue-700 dark:text-blue-300" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                  Sesiones Completadas
                </p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {stats.completedSessions}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-200 dark:bg-green-800">
                <CheckCircle className="h-6 w-6 text-green-700 dark:text-green-300" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">
                  Rating Promedio
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                    {stats.averageRating.toFixed(1)}
                  </p>
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                </div>
              </div>
              <div className="p-3 rounded-full bg-yellow-200 dark:bg-yellow-800">
                <TrendingUp className="h-6 w-6 text-yellow-700 dark:text-yellow-300" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">
                  Próximas Sesiones
                </p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.scheduledSessions}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-200 dark:bg-purple-800">
                <Calendar className="h-6 w-6 text-purple-700 dark:text-purple-300" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-bold">
                Solicitudes Pendientes ({pendingRequests.length})
              </h2>
              <Badge variant="destructive" className="ml-2">Nuevo</Badge>
            </div>

            <div className="space-y-4">
              {pendingRequests.map((request, idx) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <Card className="p-4 border-l-4 border-l-orange-500">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-lg">👤</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{request.menteeName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {request.menteeEmail}
                            </p>
                          </div>
                        </div>

                        <div className="ml-13 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Tema:</span>
                            <span className="text-muted-foreground">{request.topic}</span>
                          </div>

                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm italic">"{request.message}"</p>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Solicitado {formatDistanceToNow(request.createdAt, { 
                              addSuffix: true,
                              locale: es 
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptRequest(request)}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRequest(request)}
                          className="gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Sessions Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming">
            Próximas Sesiones ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({completedSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No hay sesiones programadas
              </h3>
              <p className="text-muted-foreground">
                Las solicitudes aceptadas aparecerán aquí
              </p>
            </Card>
          ) : (
            upcomingSessions.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xl">👨‍🎓</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{session.menteeName}</h3>
                          <p className="text-sm text-muted-foreground">{session.topic}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(session.scheduledDate).toLocaleDateString('es-MX', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{session.duration} minutos</span>
                        </div>
                      </div>
                    </div>

                    <Button size="sm">
                      Iniciar Sesión →
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedSessions.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Aún no hay sesiones completadas
              </h3>
              <p className="text-muted-foreground">
                Tu historial de mentorías aparecerá aquí
              </p>
            </Card>
          ) : (
            completedSessions.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="p-6 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xl">👨‍🎓</span>
                        </div>
                        <div>
                          <h3 className="font-bold">{session.menteeName}</h3>
                          <p className="text-sm text-muted-foreground">{session.topic}</p>
                        </div>
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completada
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {new Date(session.completedAt!).toLocaleDateString('es-MX')}
                        </span>
                        {session.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span>{session.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
