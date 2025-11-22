import { useState, useEffect, useCallback } from 'react'
import { ActivityFeedItem } from '@/lib/types'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'

export function useActivityFeed(userId?: string) {
  const { currentTenant } = useTenant()
  const [activities, setActivities] = useState<ActivityFeedItem[]>([])
  const [loading, setLoading] = useState(false)

  const loadActivities = useCallback(async (limit: number = 50) => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const data = await ApiService.getActivityFeed(limit)
      setActivities(data)
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }, [currentTenant])

  const loadUserActivities = useCallback(async (targetUserId: string, limit: number = 20) => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const data = await ApiService.getUserActivityFeed(targetUserId, limit)
      setActivities(data)
    } catch (error) {
      console.error('Error loading user activities:', error)
    } finally {
      setLoading(false)
    }
  }, [currentTenant])

  // Auto-load if no userId specified (load all activities)
  useEffect(() => {
    if (!userId && currentTenant) {
      loadActivities()
    } else if (userId && currentTenant) {
      loadUserActivities(userId)
    }
  }, [userId, currentTenant?.id, loadActivities, loadUserActivities])

  const postActivity = async (
    type: ActivityFeedItem['type'],
    data: ActivityFeedItem['data'],
    userName?: string,
    userAvatar?: string
  ): Promise<string> => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      const activity = await ApiService.createActivityFeedItem({
        type,
        data,
        userName,
        userAvatar
      })
      
      // Reload activities
      await loadActivities()
      
      return activity.id
    } catch (error) {
      console.error('Error posting activity:', error)
      throw error
    }
  }

  const postLevelUp = async (level: number, userName?: string, userAvatar?: string) => {
    return postActivity('level-up', { level }, userName, userAvatar)
  }

  const postBadgeEarned = async (badgeName: string, badgeIcon?: string, userName?: string, userAvatar?: string) => {
    return postActivity('badge-earned', { badgeName, badgeIcon }, userName, userAvatar)
  }

  const postCourseCompleted = async (courseName: string, userName?: string, userAvatar?: string) => {
    return postActivity('course-completed', { courseName }, userName, userAvatar)
  }

  const postAchievementUnlocked = async (achievementName: string, achievementIcon?: string, userName?: string, userAvatar?: string) => {
    return postActivity('achievement-unlocked', { achievementName, achievementIcon }, userName, userAvatar)
  }

  const addReaction = async (activityId: string, reactionType: 'congrats' | 'highfive' | 'fire' | 'star' | 'trophy') => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      const updated = await ApiService.addActivityReaction(activityId, reactionType)
      
      // Update local state
      setActivities(prev => prev.map(a => 
        a.id === activityId ? { ...a, reactions: updated.reactions } : a
      ))
    } catch (error) {
      console.error('Error adding reaction:', error)
      throw error
    }
  }

  const addComment = async (activityId: string, content: string, userName?: string, userAvatar?: string) => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      const updated = await ApiService.addActivityComment(activityId, {
        content,
        userName,
        userAvatar
      })
      
      // Update local state
      setActivities(prev => prev.map(a => 
        a.id === activityId ? { ...a, comments: updated.comments } : a
      ))
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }

  return {
    activities,
    loading,
    postLevelUp,
    postBadgeEarned,
    postCourseCompleted,
    postAchievementUnlocked,
    addReaction,
    addComment,
    refresh: loadActivities
  }
}
