import { useKV } from '@github/spark/hooks'
import { ActivityFeedItem, UserProfile } from '@/lib/types'

export function useActivityFeed() {
  const [activities, setActivities] = useKV<ActivityFeedItem[]>('activity-feed', [])
  const [profiles] = useKV<UserProfile[]>('user-profiles', [])

  const postActivity = (
    userId: string,
    type: ActivityFeedItem['type'],
    data: ActivityFeedItem['data']
  ) => {
    const profile = profiles?.find((p) => p.id === userId)
    if (!profile) return

    const newActivity: ActivityFeedItem = {
      id: `activity-${Date.now()}-${Math.random()}`,
      userId,
      userName: profile.displayName || profile.firstName,
      userAvatar: profile.avatar,
      type,
      timestamp: Date.now(),
      data,
      reactions: [],
      comments: [],
    }

    setActivities((current) => [newActivity, ...(current || [])])
  }

  const postLevelUp = (userId: string, level: number) => {
    postActivity(userId, 'level-up', { level })
  }

  const postBadgeEarned = (userId: string, badgeName: string, badgeIcon?: string) => {
    postActivity(userId, 'badge-earned', { badgeName, badgeIcon })
  }

  const postCourseCompleted = (userId: string, courseName: string) => {
    postActivity(userId, 'course-completed', { courseName })
  }

  const postAchievementUnlocked = (userId: string, achievementName: string, achievementIcon?: string) => {
    postActivity(userId, 'achievement-unlocked', { achievementName, achievementIcon })
  }

  return {
    activities,
    postLevelUp,
    postBadgeEarned,
    postCourseCompleted,
    postAchievementUnlocked,
  }
}
