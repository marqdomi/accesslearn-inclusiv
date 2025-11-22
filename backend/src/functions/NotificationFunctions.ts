/**
 * Notification Functions
 * 
 * Manages user notifications stored in Cosmos DB
 */

import { getContainer } from '../services/cosmosdb.service'
import { ulid } from 'ulid'

export interface UserNotification {
  id: string
  tenantId: string
  userId: string
  type: 'activity' | 'forum-reply' | 'achievement' | 'team-challenge' | 'course-reminder' | 'mention'
  title?: string
  titleKey?: string
  message?: string
  messageKey?: string
  messageParams?: Record<string, string>
  timestamp: number
  read: boolean
  actionUrl?: string
  relatedId?: string
  createdAt: string
  updatedAt: string
}

export interface NotificationPreferences {
  activityFeed: boolean
  forumReplies: boolean
  achievements: boolean
  teamChallenges: boolean
  courseReminders: boolean
  emailSummary: 'never' | 'daily' | 'weekly'
  soundEffects: boolean
  inAppBadges: boolean
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  tenantId: string,
  userId: string,
  unreadOnly: boolean = false
): Promise<UserNotification[]> {
  const container = getContainer('notifications')

  let query = 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.userId = @userId'
  const parameters: any[] = [
    { name: '@tenantId', value: tenantId },
    { name: '@userId', value: userId }
  ]

  if (unreadOnly) {
    query += ' AND c.read = false'
  }

  query += ' ORDER BY c.timestamp DESC'

  const { resources } = await container.items
    .query({ query, parameters })
    .fetchAll()

  return resources.map((r: any) => ({
    id: r.id,
    tenantId: r.tenantId,
    userId: r.userId,
    type: r.type,
    title: r.title,
    titleKey: r.titleKey,
    message: r.message,
    messageKey: r.messageKey,
    messageParams: r.messageParams,
    timestamp: r.timestamp,
    read: r.read || false,
    actionUrl: r.actionUrl,
    relatedId: r.relatedId,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }))
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(
  tenantId: string,
  userId: string
): Promise<number> {
  const container = getContainer('notifications')

  const { resources } = await container.items
    .query({
      query: 'SELECT VALUE COUNT(1) FROM c WHERE c.tenantId = @tenantId AND c.userId = @userId AND c.read = false',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@userId', value: userId }
      ]
    })
    .fetchAll()

  return resources[0] || 0
}

/**
 * Create a notification
 */
export async function createNotification(
  tenantId: string,
  userId: string,
  notification: Omit<UserNotification, 'id' | 'tenantId' | 'userId' | 'timestamp' | 'read' | 'createdAt' | 'updatedAt'>
): Promise<UserNotification> {
  const container = getContainer('notifications')

  const now = new Date().toISOString()
  const newNotification: UserNotification = {
    id: ulid(),
    tenantId,
    userId,
    ...notification,
    timestamp: Date.now(),
    read: false,
    createdAt: now,
    updatedAt: now
  }

  await container.items.create(newNotification)

  return newNotification
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  tenantId: string,
  notificationId: string
): Promise<UserNotification> {
  const container = getContainer('notifications')

  const { resource: notification } = await container.item(notificationId, tenantId).read()
  if (!notification) {
    throw new Error('Notification not found')
  }

  const updated = {
    ...notification,
    read: true,
    updatedAt: new Date().toISOString()
  }
  await container.item(notificationId, tenantId).replace(updated)
  return updated as UserNotification
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(
  tenantId: string,
  userId: string
): Promise<number> {
  const container = getContainer('notifications')

  const { resources: unreadNotifications } = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.userId = @userId AND c.read = false',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@userId', value: userId }
      ]
    })
    .fetchAll()

  let count = 0
  for (const notification of unreadNotifications) {
    await container.item(notification.id, tenantId).replace({
      ...notification,
      read: true,
      updatedAt: new Date().toISOString()
    })
    count++
  }

  return count
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  tenantId: string,
  notificationId: string
): Promise<void> {
  const container = getContainer('notifications')
  await container.item(notificationId, tenantId).delete()
}

/**
 * Get user notification preferences
 */
export async function getNotificationPreferences(
  tenantId: string,
  userId: string
): Promise<NotificationPreferences> {
  const container = getContainer('notification-preferences')

  try {
    const { resource } = await container.item(userId, tenantId).read()
    if (resource) {
      return resource.preferences as NotificationPreferences
    }
  } catch (error) {
    // Not found, return defaults
  }

  // Default preferences
  return {
    activityFeed: true,
    forumReplies: true,
    achievements: true,
    teamChallenges: true,
    courseReminders: true,
    emailSummary: 'weekly',
    soundEffects: false,
    inAppBadges: true
  }
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(
  tenantId: string,
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const container = getContainer('notification-preferences')

  const current = await getNotificationPreferences(tenantId, userId)
  const updated = { ...current, ...preferences }

  await container.items.upsert({
    id: userId,
    tenantId,
    preferences: updated,
    updatedAt: new Date().toISOString()
  })

  return updated
}

