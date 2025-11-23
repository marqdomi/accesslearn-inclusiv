import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Bell, Mail, Smartphone, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { ApiService } from '@/services/api.service'

interface NotificationPreferences {
  activityFeed: boolean
  forumReplies: boolean
  achievements: boolean
  teamChallenges: boolean
  courseReminders: boolean
  emailSummary: 'never' | 'daily' | 'weekly'
  soundEffects: boolean
  inAppBadges: boolean
}

export function NotificationSettingsPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    activityFeed: true,
    forumReplies: true,
    achievements: true,
    teamChallenges: true,
    courseReminders: true,
    emailSummary: 'weekly',
    soundEffects: false,
    inAppBadges: true,
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Debes iniciar sesión para acceder a esta página')
      navigate('/login')
    }
  }, [authLoading, isAuthenticated, navigate])

  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (authLoading || !isAuthenticated || !user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await ApiService.getNotificationPreferences()
        if (data) {
          setPreferences(data)
        }
      } catch (error: any) {
        console.error('[NotificationSettings] Error loading preferences:', error)
        if (error.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente')
          navigate('/login')
        } else {
          toast.error('Error al cargar las preferencias de notificaciones')
        }
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [authLoading, isAuthenticated, user, navigate])

  const handleSave = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Debes iniciar sesión para guardar cambios')
      navigate('/login')
      return
    }

    setSaving(true)

    try {
      await ApiService.updateNotificationPreferences(preferences)
      toast.success('Preferencias de notificaciones guardadas exitosamente')
    } catch (error: any) {
      console.error('[NotificationSettings] Error saving preferences:', error)
      if (error.status === 401) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente')
        navigate('/login')
      } else {
        toast.error(error.message || 'Error al guardar las preferencias')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setPreferences({
      activityFeed: true,
      forumReplies: true,
      achievements: true,
      teamChallenges: true,
      courseReminders: true,
      emailSummary: 'weekly',
      soundEffects: false,
      inAppBadges: true,
    })
    toast.info('Preferencias restablecidas a los valores por defecto')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando preferencias...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/settings')}
            className="mb-4 gap-2"
          >
            <ArrowLeft size={20} />
            Volver a Configuración
          </Button>

          <div>
            <h1 className="text-4xl font-bold mb-2">Configuración de Notificaciones</h1>
            <p className="text-lg text-muted-foreground">
              Configura las notificaciones por email y push para tu organización
            </p>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-6">
          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-yellow-600" />
                <div>
                  <CardTitle>Notificaciones en la Aplicación</CardTitle>
                  <CardDescription>
                    Controla qué notificaciones recibes dentro de la plataforma
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="activityFeed">Feed de Actividad</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones sobre actividades en tu feed
                  </p>
                </div>
                <Switch
                  id="activityFeed"
                  checked={preferences.activityFeed}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, activityFeed: checked })
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="forumReplies">Respuestas en Foros</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones cuando alguien responde en los foros
                  </p>
                </div>
                <Switch
                  id="forumReplies"
                  checked={preferences.forumReplies}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, forumReplies: checked })
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="achievements">Logros y Reconocimientos</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones cuando obtienes logros o badges
                  </p>
                </div>
                <Switch
                  id="achievements"
                  checked={preferences.achievements}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, achievements: checked })
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="teamChallenges">Desafíos de Equipo</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones sobre desafíos y competencias de equipo
                  </p>
                </div>
                <Switch
                  id="teamChallenges"
                  checked={preferences.teamChallenges}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, teamChallenges: checked })
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="courseReminders">Recordatorios de Cursos</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones sobre cursos pendientes y recordatorios
                  </p>
                </div>
                <Switch
                  id="courseReminders"
                  checked={preferences.courseReminders}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, courseReminders: checked })
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inAppBadges">Badges en la App</Label>
                  <p className="text-sm text-muted-foreground">
                    Muestra badges y notificaciones visuales en la aplicación
                  </p>
                </div>
                <Switch
                  id="inAppBadges"
                  checked={preferences.inAppBadges}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, inAppBadges: checked })
                  }
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Notificaciones por Email</CardTitle>
                  <CardDescription>
                    Configura la frecuencia de los resúmenes por email
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailSummary">Resumen de Email</Label>
                <Select
                  value={preferences.emailSummary}
                  onValueChange={(value: 'never' | 'daily' | 'weekly') =>
                    setPreferences({ ...preferences, emailSummary: value })
                  }
                  disabled={saving}
                >
                  <SelectTrigger id="emailSummary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Nunca</SelectItem>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Recibe un resumen de todas tus notificaciones por email
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sound & Effects */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Volume2 className="h-6 w-6 text-purple-600" />
                <div>
                  <CardTitle>Efectos de Sonido</CardTitle>
                  <CardDescription>
                    Controla los efectos de sonido y audio en la aplicación
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="soundEffects">Efectos de Sonido</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproduce sonidos cuando recibes notificaciones
                  </p>
                </div>
                <Switch
                  id="soundEffects"
                  checked={preferences.soundEffects}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, soundEffects: checked })
                  }
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
            >
              Restablecer Valores por Defecto
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/settings')}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
