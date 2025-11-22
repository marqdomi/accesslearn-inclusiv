import { useState, useEffect, useCallback } from 'react'
import { UserNotification, NotificationPreferences } from '@/lib/types'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'

export function useNotifications(userId: string) {
  const { currentTenant } = useTenant()
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)

  const loadNotifications = useCallback(async (unreadOnly: boolean = false) => {
    if (!currentTenant || !userId) return

    try {
      setLoading(true)
      const data = await ApiService.getNotifications(unreadOnly)
      setNotifications(data)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [currentTenant, userId])

  const loadUnreadCount = useCallback(async () => {
    if (!currentTenant || !userId) return

    try {
      const { count } = await ApiService.getUnreadNotificationCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }, [currentTenant, userId])

  const loadPreferences = useCallback(async () => {
    if (!currentTenant || !userId) return

    try {
      const prefs = await ApiService.getNotificationPreferences()
      setPreferences(prefs)
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
  }, [currentTenant, userId])

  // Auto-load on mount
  useEffect(() => {
    if (currentTenant && userId) {
      loadNotifications()
      loadUnreadCount()
      loadPreferences()
    }
  }, [currentTenant?.id, userId, loadNotifications, loadUnreadCount, loadPreferences])

  const addNotification = async (notification: Omit<UserNotification, 'id' | 'timestamp' | 'read'>) => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      const created = await ApiService.createNotification({
        userId,
        ...notification
      })
      
      // Add to local state
      setNotifications(prev => [created, ...prev])
      setUnreadCount(prev => prev + 1)
      
      return created
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      await ApiService.markNotificationAsRead(notificationId)
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  const markAllAsRead = async () => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      const { count } = await ApiService.markAllNotificationsAsRead()
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      
      return count
    } catch (error) {
      console.error('Error marking all as read:', error)
      throw error
    }
  }

  const deleteNotification = async (notificationId: string) => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      await ApiService.deleteNotification(notificationId)
      
      // Remove from local state
      const notification = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  }

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      const updated = await ApiService.updateNotificationPreferences(newPreferences)
      setPreferences(updated)
      return updated
    } catch (error) {
      console.error('Error updating preferences:', error)
      throw error
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    preferences,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    refresh: loadNotifications,
    refreshUnreadCount: loadUnreadCount
  }
}
