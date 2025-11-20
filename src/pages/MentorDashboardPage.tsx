import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { 
  Users, 
  Calendar,
  Star,
  Clock,
  TrendingUp,
  Bell,
  CheckCircle,
  XCircle,
  MessageSquare,
  ArrowLeft,
  AlertCircle,
  CalendarClock
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { MentorshipRequest, MentorshipSession } from '@/lib/types'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import confetti from 'canvas-confetti'

export function MentorDashboardPage() {
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  const navigate = useNavigate()

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

  // Estados para manejar la aceptación de solicitudes
  const [acceptingRequestId, setAcceptingRequestId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Estados para rechazo con razón
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // Estados para completar sesión
  const [completingSessionId, setCompletingSessionId] = useState<string | null>(null)
  const [completionNotes, setCompletionNotes] = useState('')

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

      // Calcular stats
      const uniqueMentees = new Set(sessions.map(s => s.menteeId))
      const completedWithRating = completed.filter(s => s.rating)
      const avgRating = completedWithRating.length > 0
        ? completedWithRating.reduce((sum, s) => sum + (s.rating || 0), 0) / completedWithRating.length
        : 0

      setStats({
        totalSessions: sessions.length,
        completedSessions: completed.length,
        scheduledSessions: scheduled.length,
        totalMentees: uniqueMentees.size,
        averageRating: avgRating,
        pendingRequests: requests.length
      })
    } catch (error) {
      console.error('Error loading mentor data:', error)
      toast.error('Error al cargar datos de mentoría')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (request: MentorshipRequest) => {
    if (!selectedDate) {
      toast.error('Por favor selecciona una fecha para la sesión')
      return
    }

    try {
      await ApiService.acceptMentorshipRequest(
        request.id,
        currentTenant!.id,
        selectedDate.getTime(),
        60 // Duración por defecto: 60 minutos
      )

      toast.success('¡Solicitud aceptada!', {
        description: `Sesión programada para ${format(selectedDate, 'PPP', { locale: es })}`
      })

      setAcceptingRequestId(null)
      setSelectedDate(undefined)
      loadData()
    } catch (error) {
      console.error('Error accepting request:', error)
      toast.error('Error al aceptar la solicitud')
    }
  }

  const handleRejectRequest = async (request: MentorshipRequest) => {
    if (!rejectReason.trim()) {
      toast.error('Por favor proporciona una razón para el rechazo')
      return
    }

    try {
      await ApiService.rejectMentorshipRequest(request.id, currentTenant!.id)
      
      toast.info('Solicitud rechazada', {
        description: 'Se notificó al estudiante con tu mensaje'
      })

      setRejectingRequestId(null)
      setRejectReason('')
      loadData()
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Error al rechazar la solicitud')
    }
  }

  const handleCompleteSession = async (session: MentorshipSession) => {
    if (completingSessionId === session.id) {
      // Confirmar completación
      try {
        await ApiService.completeMentorshipSession(
          session.id,
          currentTenant!.id,
          completionNotes.trim() || undefined
        )
        
        toast.success('¡Sesión completada!', {
          description: 'El estudiante ya puede calificar la sesión'
        })

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })

        setCompletingSessionId(null)
        setCompletionNotes('')
        loadData()
      } catch (error) {
        console.error('Error completing session:', error)
        toast.error('Error al completar la sesión')
      }
    } else {
      // Expandir formulario
      setCompletingSessionId(session.id)
      setCompletionNotes('')
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
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">Dashboard de Mentor 🎓</h1>
          <p className="text-muted-foreground">
            Gestiona tus mentorados y sesiones programadas
          </p>
        </div>
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
                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
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
                    <div className="space-y-4">
                      {/* Student Info */}
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

                            {request.preferredDate && (
                              <div className="flex items-center gap-2 text-sm p-2 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                                <CalendarClock className="h-4 w-4 text-blue-600" />
                                <span className="text-blue-700 dark:text-blue-300">
                                  Fecha preferida: {format(new Date(request.preferredDate), 'PPP', { locale: es })}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              Solicitado {formatDistanceToNow(new Date(request.createdAt), { 
                                addSuffix: true,
                                locale: es 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {acceptingRequestId === request.id ? (
                        // Aceptar con selección de fecha
                        <div className="ml-13 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
                            <CheckCircle className="h-4 w-4" />
                            Programar sesión
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">
                              Selecciona fecha y hora para la sesión:
                            </label>
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                  type="button"
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'Selecciona una fecha'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                                <CalendarComponent
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={(date) => {
                                    setSelectedDate(date)
                                    setCalendarOpen(false)
                                  }}
                                  disabled={(date) => {
                                    const today = new Date()
                                    today.setHours(0, 0, 0, 0)
                                    return date < today
                                  }}
                                  locale={es}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptRequest(request)}
                              disabled={!selectedDate}
                              className="flex-1"
                            >
                              Confirmar Sesión
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAcceptingRequestId(null)
                                setSelectedDate(undefined)
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : rejectingRequestId === request.id ? (
                        // Rechazar con razón
                        <div className="ml-13 p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-300">
                            <AlertCircle className="h-4 w-4" />
                            Rechazar solicitud
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">
                              Explica por qué no puedes aceptar esta mentoría:
                            </label>
                            <Textarea
                              placeholder="Ej: No tengo disponibilidad en esta fecha, mi especialidad es diferente, etc."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="min-h-[80px]"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectRequest(request)}
                              disabled={!rejectReason.trim()}
                              className="flex-1"
                            >
                              Confirmar Rechazo
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setRejectingRequestId(null)
                                setRejectReason('')
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Botones iniciales
                        <div className="ml-13 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setAcceptingRequestId(request.id)}
                            className="gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Aceptar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectingRequestId(request.id)}
                            className="gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty State for No Requests */}
      {pendingRequests.length === 0 && (
        <Card className="p-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No hay solicitudes pendientes
          </h3>
          <p className="text-muted-foreground">
            Cuando recibas nuevas solicitudes de mentoría aparecerán aquí
          </p>
        </Card>
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
                            {format(new Date(session.scheduledDate), 'PPP', { locale: es })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{session.duration} minutos</span>
                        </div>
                      </div>

                      {session.notes && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">{session.notes}</p>
                        </div>
                      )}

                      {completingSessionId === session.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 p-4 bg-green-50 dark:bg-green-950 border-2 border-green-500 rounded-lg space-y-3"
                        >
                          <label className="text-sm font-semibold text-green-900 dark:text-green-100">
                            Notas de completación (opcional)
                          </label>
                          <Textarea
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                            placeholder="Ej: Revisamos los conceptos de React Hooks, el estudiante mostró buen entendimiento..."
                            className="resize-none"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleCompleteSession(session)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirmar Completación
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCompletingSessionId(null)
                                setCompletionNotes('')
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm"
                        variant={completingSessionId === session.id ? "outline" : "default"}
                        onClick={() => handleCompleteSession(session)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completar Sesión
                      </Button>
                    </div>
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
                          {format(new Date(session.completedAt!), 'PPP', { locale: es })}
                        </span>
                        {session.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span>{session.rating}/5</span>
                          </div>
                        )}
                      </div>

                      {session.feedback && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm italic">"{session.feedback}"</p>
                        </div>
                      )}
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
