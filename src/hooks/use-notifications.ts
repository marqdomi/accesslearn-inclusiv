import { useState } from 'react'
import { UserNotification } from '@/lib/types'

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<UserNotification[]>([])

  const userNotifications = (notifications || []).filter((n) => n.userId === userId)

  const unreadCount = userNotifications.filter((n) => !n.read).length

  const addNotification = (notification: Omit<UserNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: UserNotification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      read: false,
    }

    setNotifications((current) => [newNotification, ...(current || [])])
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((current) =>
      (current || []).map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications((current) =>
      (current || []).map((n) =>
        n.userId === userId ? { ...n, read: true } : n
      )
    )
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((current) => (current || []).filter((n) => n.id !== notificationId))
  }

  return {
    notifications: userNotifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}
