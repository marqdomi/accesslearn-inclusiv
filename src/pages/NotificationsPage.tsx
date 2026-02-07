import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Bell, Check, X, At, Trophy, ChatCircle, GraduationCap } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { UserNotification } from '@/lib/types'

const NOTIFICATION_ICONS = {
  mention: At,
  'forum-reply': ChatCircle,
  achievement: Trophy,
  'team-challenge': Trophy,
  'course-reminder': GraduationCap,
  activity: Bell,
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t, language } = useTranslation()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } =
    useNotifications(user?.id || '')

  const handleNotificationClick = async (notification: UserNotification) => {
    try {
      if (!notification.read) {
        await markAsRead(notification.id)
      }
      if (notification.actionUrl) {
        navigate(notification.actionUrl)
      }
    } catch (error) {
      console.error('Error handling notification click:', error)
      toast.error('Error al procesar la notificación')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success('Todas las notificaciones marcadas como leídas')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Error al marcar todas como leídas')
    }
  }

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteNotification(notificationId)
      toast.success('Notificación eliminada')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Error al eliminar la notificación')
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold text-foreground">Notificaciones</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount > 0
                ? unreadCount === 1
                  ? '1 notificación sin leer'
                  : `${unreadCount} notificaciones sin leer`
                : 'Estás al día'}
            </p>
          </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="gap-2"
          >
            <Check size={16} />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} />
            Todas las notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Cargando notificaciones...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell size={64} className="text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium text-foreground mb-2">
                No tienes notificaciones
              </p>
              <p className="text-sm text-muted-foreground">
                Cuando recibas notificaciones, aparecerán aquí
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="divide-y">
                <AnimatePresence mode="popLayout">
                  {notifications.map((notification) => {
                    const Icon = NOTIFICATION_ICONS[notification.type] || Bell
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className={`relative p-4 transition-colors cursor-pointer hover:bg-muted/50 ${
                            notification.read ? 'bg-background' : 'bg-primary/5'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <button
                            onClick={(e) => handleDelete(notification.id, e)}
                            className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-muted transition-colors"
                            aria-label="Eliminar notificación"
                          >
                            <X size={16} className="text-muted-foreground" />
                          </button>

                          <div className="flex gap-4 pr-8">
                            <div className="flex-shrink-0">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  notification.read
                                    ? 'bg-muted'
                                    : 'bg-primary text-primary-foreground'
                                }`}
                              >
                                <Icon size={24} weight={notification.read ? 'regular' : 'fill'} />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p
                                  className={`text-base ${
                                    notification.read ? 'font-normal' : 'font-semibold'
                                  }`}
                                >
                                  {notification.titleKey
                                    ? t(notification.titleKey, notification.messageParams)
                                    : notification.title || 'Actualización'}
                                </p>
                                {!notification.read && (
                                  <Badge variant="default" className="shrink-0">
                                    Nuevo
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {notification.messageKey
                                  ? t(notification.messageKey, notification.messageParams)
                                  : notification.message || 'Revisa los detalles'}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                  {formatDistanceToNow(notification.timestamp, {
                                    addSuffix: true,
                                    locale: language === 'es' ? es : undefined,
                                  })}
                                </span>
                                {notification.type && (
                                  <>
                                    <span>•</span>
                                    <span className="capitalize">
                                      {notification.type.replace('-', ' ')}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {!notification.read && (
                            <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

