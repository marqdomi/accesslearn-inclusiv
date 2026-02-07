import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Clock,
  User,
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { MentorshipRequest, MentorshipSession } from '@/lib/types'
import { RateMentorshipModal } from '@/components/mentorship/RateMentorshipModal'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function MenteeMentorshipsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentTenant } = useTenant()

  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<MentorshipRequest[]>([])
  const [sessions, setSessions] = useState<MentorshipSession[]>([])
  
  // Rating modal state
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [sessionToRate, setSessionToRate] = useState<MentorshipSession | null>(null)

  useEffect(() => {
    loadData()
  }, [currentTenant, user])

  const loadData = async () => {
    if (!currentTenant || !user) return

    try {
      setLoading(true)
      // Cargar solicitudes y sesiones
      const [requestsData, sessionsData] = await Promise.all([
        ApiService.getMenteeRequests(currentTenant.id, user.id),
        ApiService.getMenteeSessions(currentTenant.id, user.id)
      ])
      setRequests(requestsData)
      setSessions(sessionsData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar tus mentorías')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: {
        variant: 'secondary',
        icon: <AlertCircle className="h-3 w-3" />,
        label: 'Pendiente'
      },
      accepted: {
        variant: 'default',
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: 'Aceptada'
      },
      rejected: {
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3" />,
        label: 'Rechazada'
      },
      scheduled: {
        variant: 'default',
        icon: <Calendar className="h-3 w-3" />,
        label: 'Programada'
      },
      completed: {
        variant: 'secondary',
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: 'Completada'
      },
      cancelled: {
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3" />,
        label: 'Cancelada'
      }
    }

    const config = variants[status] || variants.pending

    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando tus mentorías...</p>
        </div>
      </div>
    )
  }

  const scheduledSessions = sessions.filter(s => s.status === 'scheduled')
  const completedSessions = sessions.filter(s => s.status === 'completed')
  const pendingRequests = requests.filter(r => r.status === 'pending')
  const acceptedRequests = requests.filter(r => r.status === 'accepted')
  const rejectedRequests = requests.filter(r => r.status === 'rejected')

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
      <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Mis Mentorías</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gestiona tus solicitudes y sesiones de mentoría
        </p>
      </div>

      {/* Stats Cards - Compact design similar to StatsCard */}
      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 md:grid-cols-3">
        {/* Mobile: Compact horizontal layout */}
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
          <div className="p-2 sm:p-4 sm:p-6">
            <div className="flex sm:hidden items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground truncate leading-tight">
                  Sesiones Programadas
                </p>
                <p className="text-lg font-bold leading-none mt-0.5">{scheduledSessions.length}</p>
              </div>
            </div>
            {/* Desktop: Original vertical layout */}
            <div className="hidden sm:flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sesiones Programadas</p>
                <p className="text-2xl font-bold mt-1">{scheduledSessions.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900">
          <div className="p-2 sm:p-4 sm:p-6">
            <div className="flex sm:hidden items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/50 flex-shrink-0">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground truncate leading-tight">
                  Sesiones Completadas
                </p>
                <p className="text-lg font-bold leading-none mt-0.5">{completedSessions.length}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sesiones Completadas</p>
                <p className="text-2xl font-bold mt-1">{completedSessions.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900 col-span-2 md:col-span-1">
          <div className="p-2 sm:p-4 sm:p-6">
            <div className="flex sm:hidden items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/50 flex-shrink-0">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground truncate leading-tight">
                  Total de Sesiones
                </p>
                <p className="text-lg font-bold leading-none mt-0.5">{sessions.length}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Sesiones</p>
                <p className="text-2xl font-bold mt-1">{sessions.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <div className="p-4 sm:p-6">
          <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 h-auto">
            <TabsTrigger value="requests" className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 touch-target">
              <span className="hidden sm:inline">Solicitudes</span>
              <span className="sm:hidden">Solic.</span>
              <span className="ml-1">({pendingRequests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 touch-target">
              <span className="hidden sm:inline">Próximas</span>
              <span className="sm:hidden">Próx.</span>
              <span className="ml-1">({scheduledSessions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm py-2 sm:py-3 px-2 sm:px-4 touch-target">
              <span className="hidden sm:inline">Completadas</span>
              <span className="sm:hidden">Compl.</span>
              <span className="ml-1">({completedSessions.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  No has enviado solicitudes
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Busca un mentor y solicita una mentoría
                </p>
                <Button onClick={() => navigate('/mentors')} className="touch-target h-12">
                  Buscar Mentores
                </Button>
              </div>
            ) : (
              requests.map((request, idx) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-primary/10 rounded-full flex-shrink-0">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg line-clamp-1">
                              {request.mentorName}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                              {request.topic}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(request.status)}
                          </div>
                        </div>

                        <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs sm:text-sm line-clamp-3">{request.message}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="line-clamp-1">Enviada {format(new Date(request.createdAt), 'PPP', { locale: es })}</span>
                          </div>
                          {request.preferredDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="line-clamp-1">Preferencia: {format(new Date(request.preferredDate), 'PPP', { locale: es })}</span>
                            </div>
                          )}
                        </div>

                        {request.status === 'accepted' && request.respondedAt && (
                          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                              ✓ Aceptada el {format(new Date(request.respondedAt), 'PPP', { locale: es })}
                            </p>
                          </div>
                        )}

                        {request.status === 'rejected' && request.respondedAt && (
                          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                              ✗ Rechazada el {format(new Date(request.respondedAt), 'PPP', { locale: es })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Scheduled Sessions */}
          <TabsContent value="scheduled" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            {scheduledSessions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  No tienes sesiones programadas
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Solicita una mentoría para comenzar tu aprendizaje
                </p>
                <Button onClick={() => navigate('/mentors')} className="touch-target h-12">
                  Buscar Mentores
                </Button>
              </div>
            ) : (
              scheduledSessions.map((session, idx) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-primary/10 rounded-full flex-shrink-0">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg line-clamp-1">
                              {session.mentorName}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                              {session.topic}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(session.status)}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="line-clamp-1">{format(new Date(session.scheduledDate), 'PPP', { locale: es })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            {session.duration} minutos
                          </div>
                        </div>

                        {session.notes && (
                          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs sm:text-sm line-clamp-3">{session.notes}</p>
                          </div>
                        )}

                        <div className="flex gap-2 mt-3 sm:mt-4">
                          <Button size="sm" className="gap-2 touch-target flex-1 sm:flex-initial">
                            <MessageSquare className="h-4 w-4" />
                            <span className="hidden sm:inline">Iniciar Sesión</span>
                            <span className="sm:hidden">Iniciar</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Completed Sessions */}
          <TabsContent value="completed" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
            {completedSessions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Aún no has completado sesiones
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Tus sesiones completadas aparecerán aquí
                </p>
              </div>
            ) : (
              completedSessions.map((session, idx) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-4 sm:p-6 opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-muted rounded-full flex-shrink-0">
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg line-clamp-1">
                              {session.mentorName}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                              {session.topic}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {getStatusBadge(session.status)}
                            {session.rating && (
                              <Badge variant="secondary" className="gap-1 text-xs">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                {session.rating}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="line-clamp-1">{format(new Date(session.scheduledDate), 'PPP', { locale: es })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            {session.duration} minutos
                          </div>
                        </div>

                        {session.notes && (
                          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                            <p className="text-xs sm:text-sm line-clamp-3">{session.notes}</p>
                          </div>
                        )}

                        {session.feedback && (
                          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <p className="text-[10px] sm:text-xs font-medium text-primary mb-1">
                              Tu comentario:
                            </p>
                            <p className="text-xs sm:text-sm line-clamp-3">{session.feedback}</p>
                          </div>
                        )}

                        {!session.rating && (
                          <div className="mt-3 sm:mt-4">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-2 touch-target w-full sm:w-auto"
                              onClick={() => {
                                setSessionToRate(session)
                                setRatingModalOpen(true)
                              }}
                            >
                              <Star className="h-4 w-4" />
                              <span className="hidden sm:inline">Calificar Sesión</span>
                              <span className="sm:hidden">Calificar</span>
                            </Button>
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
      </Card>

      {/* Help Card */}
      <Card className="p-4 sm:p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-full bg-primary/10 flex-shrink-0">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">¿Cómo funcionan las sesiones?</h3>
            <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground">
              <li>✓ Recibirás una notificación cuando tu mentor acepte la solicitud</li>
              <li>✓ La sesión se programará en la fecha acordada</li>
              <li>✓ Podrás unirte 5 minutos antes de la hora programada</li>
              <li>✓ Al finalizar, podrás calificar la experiencia</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Rating Modal */}
      {currentTenant && (
        <RateMentorshipModal
          session={sessionToRate}
          open={ratingModalOpen}
          onOpenChange={setRatingModalOpen}
          onSuccess={loadData}
          tenantId={currentTenant.id}
        />
      )}
    </div>
  )
}
