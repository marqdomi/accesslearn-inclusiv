import { useState } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Bell, Check, X, At, Trophy, ChatCircle, GraduationCap } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTranslation } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'

interface NotificationsViewerProps {
  userId: string
}

const NOTIFICATION_ICONS = {
  mention: At,
  'forum-reply': ChatCircle,
  achievement: Trophy,
  'team-challenge': Trophy,
  'course-reminder': GraduationCap,
  activity: Bell,
}

export function NotificationsViewer({ userId }: NotificationsViewerProps) {
  const { t, language } = useTranslation()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications(userId)
  const [isOpen, setIsOpen] = useState(false)

  const handleNotificationClick = async (notificationId: string, actionUrl?: string) => {
    try {
      await markAsRead(notificationId)
      if (actionUrl) {
        const element = document.querySelector(actionUrl)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative gap-2">
          <Bell size={20} aria-hidden="true" />
          <span className="hidden sm:inline">{t('notifications.title')}</span>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>{t('notifications.title')}</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  try {
                    await markAllAsRead()
                  } catch (error) {
                    console.error('Error marking all as read:', error)
                  }
                }}
                className="text-xs gap-1"
              >
                <Check size={14} />
                {t('notifications.markAllRead')}
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            {unreadCount > 0
              ? (unreadCount === 1 
                  ? t('notifications.unreadCount', { count: String(unreadCount) })
                  : t('notifications.unreadCountPlural', { count: String(unreadCount) }))
              : t('notifications.allCaughtUp')}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('notifications.noNotifications')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification) => {
                  const Icon = NOTIFICATION_ICONS[notification.type]
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        className={`relative p-4 rounded-lg border cursor-pointer transition-colors ${
                          notification.read
                            ? 'bg-background hover:bg-muted/50'
                            : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                        }`}
                        onClick={() =>
                          handleNotificationClick(notification.id, notification.actionUrl)
                        }
                      >
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            try {
                              await deleteNotification(notification.id)
                            } catch (error) {
                              console.error('Error deleting notification:', error)
                            }
                          }}
                          className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted"
                          aria-label={t('notifications.deleteNotification')}
                        >
                          <X size={14} />
                        </button>

                        <div className="flex gap-3 pr-6">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                notification.read
                                  ? 'bg-muted'
                                  : 'bg-primary text-primary-foreground'
                              }`}
                            >
                              <Icon size={20} weight={notification.read ? 'regular' : 'fill'} />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm mb-1 ${
                                notification.read ? 'font-normal' : 'font-semibold'
                              }`}
                            >
                              {notification.titleKey 
                                ? t(notification.titleKey, notification.messageParams) 
                                : notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {notification.messageKey 
                                ? t(notification.messageKey, notification.messageParams) 
                                : notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(notification.timestamp, {
                                addSuffix: true,
                                locale: language === 'es' ? es : undefined,
                              })}
                            </p>
                          </div>
                        </div>

                        {!notification.read && (
                          <div className="absolute top-4 left-2 w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
