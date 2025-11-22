/**
 * Activity Feed Functions
 * 
 * Manages activity feed items stored in Cosmos DB
 */

import { getContainer } from '../services/cosmosdb.service'
import { ulid } from 'ulid'

export interface ActivityFeedItem {
  id: string
  tenantId: string
  userId: string
  userName: string
  userAvatar?: string
  type: 'level-up' | 'badge-earned' | 'course-completed' | 'achievement-unlocked'
  timestamp: number
  data: {
    level?: number
    badgeName?: string
    badgeIcon?: string
    courseName?: string
    achievementName?: string
    achievementIcon?: string
  }
  reactions: Array<{
    id: string
    userId: string
    userName: string
    type: 'congrats' | 'highfive' | 'fire' | 'star' | 'trophy'
    timestamp: number
  }>
  comments: Array<{
    id: string
    userId: string
    userName: string
    userAvatar?: string
    content: string
    timestamp: number
  }>
  createdAt: string
  updatedAt: string
}

/**
 * Get activity feed for a tenant
 */
export async function getActivityFeed(
  tenantId: string,
  limit: number = 50
): Promise<ActivityFeedItem[]> {
  const container = getContainer('activity-feed')

  const { resources } = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId ORDER BY c.timestamp DESC OFFSET 0 LIMIT @limit',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@limit', value: limit }
      ]
    })
    .fetchAll()

  return resources.map((r: any) => ({
    id: r.id,
    tenantId: r.tenantId,
    userId: r.userId,
    userName: r.userName,
    userAvatar: r.userAvatar,
    type: r.type,
    timestamp: r.timestamp,
    data: r.data || {},
    reactions: r.reactions || [],
    comments: r.comments || [],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }))
}

/**
 * Get user's activity feed
 */
export async function getUserActivityFeed(
  tenantId: string,
  userId: string,
  limit: number = 20
): Promise<ActivityFeedItem[]> {
  const container = getContainer('activity-feed')

  const { resources } = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.userId = @userId ORDER BY c.timestamp DESC OFFSET 0 LIMIT @limit',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@userId', value: userId },
        { name: '@limit', value: limit }
      ]
    })
    .fetchAll()

  return resources.map((r: any) => ({
    id: r.id,
    tenantId: r.tenantId,
    userId: r.userId,
    userName: r.userName,
    userAvatar: r.userAvatar,
    type: r.type,
    timestamp: r.timestamp,
    data: r.data || {},
    reactions: r.reactions || [],
    comments: r.comments || [],
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }))
}

/**
 * Create a new activity feed item
 */
export async function createActivityFeedItem(
  tenantId: string,
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  type: ActivityFeedItem['type'],
  data: ActivityFeedItem['data']
): Promise<ActivityFeedItem> {
  const container = getContainer('activity-feed')

  const now = new Date().toISOString()
  const activity: ActivityFeedItem = {
    id: ulid(),
    tenantId,
    userId,
    userName,
    userAvatar,
    type,
    timestamp: Date.now(),
    data,
    reactions: [],
    comments: [],
    createdAt: now,
    updatedAt: now
  }

  await container.items.create(activity)

  return activity
}

/**
 * Add a reaction to an activity
 */
export async function addActivityReaction(
  tenantId: string,
  activityId: string,
  userId: string,
  userName: string,
  reactionType: 'congrats' | 'highfive' | 'fire' | 'star' | 'trophy'
): Promise<ActivityFeedItem> {
  const container = getContainer('activity-feed')

  const { resource: activity } = await container.item(activityId, tenantId).read()
  if (!activity) {
    throw new Error('Activity not found')
  }

  // Check if user already reacted
  const existingReaction = (activity.reactions || []).find((r: any) => r.userId === userId)
  
  if (existingReaction) {
    // Remove existing reaction if same type, or update if different type
    const reactions = (activity.reactions || []).filter((r: any) => r.userId !== userId)
    if (existingReaction.type !== reactionType) {
      reactions.push({
        id: ulid(),
        userId,
        userName,
        type: reactionType,
        timestamp: Date.now()
      })
    }
    
    const updated = {
      ...activity,
      reactions,
      updatedAt: new Date().toISOString()
    }
    await container.item(activityId, tenantId).replace(updated)
    return updated as ActivityFeedItem
  } else {
    // Add new reaction
    const reactions = [
      ...(activity.reactions || []),
      {
        id: ulid(),
        userId,
        userName,
        type: reactionType,
        timestamp: Date.now()
      }
    ]
    
    const updated = {
      ...activity,
      reactions,
      updatedAt: new Date().toISOString()
    }
    await container.item(activityId, tenantId).replace(updated)
    return updated as ActivityFeedItem
  }
}

/**
 * Add a comment to an activity
 */
export async function addActivityComment(
  tenantId: string,
  activityId: string,
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  content: string
): Promise<ActivityFeedItem> {
  const container = getContainer('activity-feed')

  const { resource: activity } = await container.item(activityId, tenantId).read()
  if (!activity) {
    throw new Error('Activity not found')
  }

  const comment = {
    id: ulid(),
    userId,
    userName,
    userAvatar,
    content,
    timestamp: Date.now()
  }

  const comments = [...(activity.comments || []), comment]
  
  const updated = {
    ...activity,
    comments,
    updatedAt: new Date().toISOString()
  }
  await container.item(activityId, tenantId).replace(updated)
  return updated as ActivityFeedItem
}

