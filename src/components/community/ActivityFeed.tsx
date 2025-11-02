import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { ActivityFeedItem, ActivityReaction, UserProfile, ActivityComment, ActivityMention } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Trophy, Star, Fire, HandsClapping, Sparkle, Lightbulb, ChatCircle } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useTranslation } from '@/lib/i18n'
import { UserMentionInput } from './UserMentionInput'
import { useNotifications } from '@/hooks/use-notifications'

interface ActivityFeedProps {
  currentUserId: string
  maxItems?: number
}

const REACTION_ICONS = {
  congrats: { icon: HandsClapping, key: 'reaction.congrats' },
  highfive: { icon: Sparkle, key: 'reaction.highfive' },
  fire: { icon: Fire, key: 'reaction.fire' },
  star: { icon: Star, key: 'reaction.star' },
  trophy: { icon: Trophy, key: 'reaction.trophy' },
}

const ACTIVITY_ICONS = {
  'level-up': Lightbulb,
  'badge-earned': Trophy,
  'course-completed': Star,
  'achievement-unlocked': Sparkle,
}

export function ActivityFeed({ currentUserId, maxItems = 20 }: ActivityFeedProps) {
  const { t, language } = useTranslation()
  const [activities, setActivities] = useKV<ActivityFeedItem[]>('activity-feed', [])
  const [profiles] = useKV<UserProfile[]>('user-profiles', [])
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)
  const [expandedComments, setExpandedComments] = useState<string | null>(null)
  const { addNotification } = useNotifications(currentUserId)

  const sortedActivities = (activities || [])
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, maxItems)

  const handleReaction = (activityId: string, reactionType: keyof typeof REACTION_ICONS) => {
    setActivities((current) => {
      const updated = [...(current || [])]
      const activityIndex = updated.findIndex((a) => a.id === activityId)
      
      if (activityIndex === -1) return current || []

      const activity = updated[activityIndex]
      const existingReaction = activity.reactions.findIndex(
        (r) => r.userId === currentUserId && r.type === reactionType
      )

      if (existingReaction >= 0) {
        activity.reactions = activity.reactions.filter((_, i) => i !== existingReaction)
      } else {
        const currentProfile = profiles?.find((p) => p.id === currentUserId)
        const newReaction: ActivityReaction = {
          id: `${activityId}-${currentUserId}-${reactionType}-${Date.now()}`,
          userId: currentUserId,
          userName: currentProfile?.displayName || currentProfile?.firstName || 'Anonymous',
          type: reactionType,
          timestamp: Date.now(),
        }
        activity.reactions = [...activity.reactions, newReaction]
      }

      updated[activityIndex] = { ...activity }
      return updated
    })
  }

  const handleAddComment = (activityId: string, content: string, mentions: ActivityMention[]) => {
    const currentProfile = profiles?.find((p) => p.id === currentUserId)
    if (!currentProfile) return

    const newComment: ActivityComment = {
      id: `comment-${Date.now()}-${Math.random()}`,
      activityId,
      userId: currentUserId,
      userName: currentProfile.displayName || currentProfile.firstName,
      userAvatar: currentProfile.avatar,
      content,
      mentions,
      timestamp: Date.now(),
    }

    setActivities((current) => {
      const updated = [...(current || [])]
      const activityIndex = updated.findIndex((a) => a.id === activityId)
      
      if (activityIndex === -1) return current || []

      const activity = updated[activityIndex]
      activity.comments = [...activity.comments, newComment]
      updated[activityIndex] = { ...activity }
      return updated
    })

    mentions.forEach((mention) => {
      if (mention.userId !== currentUserId) {
        addNotification({
          userId: mention.userId,
          type: 'mention',
          title: t('activityFeed.mentionedYou', { userName: newComment.userName }),
          message: content,
          actionUrl: `#activity-${activityId}`,
          relatedId: activityId,
        })
      }
    })
  }

  const renderCommentContent = (comment: ActivityComment) => {
    if (comment.mentions.length === 0) {
      return <span>{comment.content}</span>
    }

    const parts: React.ReactNode[] = []
    let lastIndex = 0

    const sortedMentions = [...comment.mentions].sort((a, b) => a.startIndex - b.startIndex)

    sortedMentions.forEach((mention, idx) => {
      if (mention.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {comment.content.slice(lastIndex, mention.startIndex)}
          </span>
        )
      }

      parts.push(
        <span
          key={`mention-${idx}`}
          className="font-semibold text-primary bg-primary/10 px-1 rounded"
        >
          {comment.content.slice(mention.startIndex, mention.endIndex)}
        </span>
      )

      lastIndex = mention.endIndex
    })

    if (lastIndex < comment.content.length) {
      parts.push(
        <span key="text-end">
          {comment.content.slice(lastIndex)}
        </span>
      )
    }

    return <>{parts}</>
  }

  const getActivityMessage = (activity: ActivityFeedItem): string => {
    switch (activity.type) {
      case 'level-up':
        return t('activityFeed.reachedLevel', { level: String(activity.data.level || '') })
      case 'badge-earned':
        return t('activityFeed.earnedBadge', { badgeName: activity.data.badgeName || '' })
      case 'course-completed':
        return t('activityFeed.completedCourse', { courseName: activity.data.courseName || '' })
      case 'achievement-unlocked':
        return t('activityFeed.unlockedAchievement', { achievementName: activity.data.achievementName || '' })
      default:
        return t('activityFeed.achievedSomething')
    }
  }

  const getReactionCounts = (reactions: ActivityReaction[]) => {
    const counts: Partial<Record<keyof typeof REACTION_ICONS, number>> = {}
    reactions.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1
    })
    return counts
  }

  const hasUserReacted = (activity: ActivityFeedItem, reactionType: keyof typeof REACTION_ICONS) => {
    return activity.reactions.some((r) => r.userId === currentUserId && r.type === reactionType)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkle size={24} weight="fill" className="text-primary" aria-hidden="true" />
          {t('activityFeed.title')}
        </CardTitle>
        <CardDescription>
          {t('activityFeed.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {sortedActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkle size={48} className="text-muted-foreground mb-4" aria-hidden="true" />
              <p className="text-muted-foreground">
                {t('activityFeed.noActivity')}
              </p>
            </div>
          ) : (
            <div className="space-y-4" role="feed" aria-label="Team activity feed">
              <AnimatePresence mode="popLayout">
                {sortedActivities.map((activity) => {
                  const Icon = ACTIVITY_ICONS[activity.type]
                  const reactionCounts = getReactionCounts(activity.reactions)
                  const isExpanded = expandedActivity === activity.id

                  return (
                    <motion.div
                      key={activity.id}
                      id={`activity-${activity.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                                {activity.userAvatar || activity.userName.charAt(0).toUpperCase()}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-sm">
                                  <span className="font-semibold">{activity.userName}</span>{' '}
                                  <span className="text-muted-foreground">
                                    {getActivityMessage(activity)}
                                  </span>
                                </p>
                                <Icon
                                  size={20}
                                  weight="fill"
                                  className="text-accent flex-shrink-0"
                                  aria-hidden="true"
                                />
                              </div>

                              <p className="text-xs text-muted-foreground mb-3">
                                {formatDistanceToNow(activity.timestamp, { 
                                  addSuffix: true,
                                  locale: language === 'es' ? es : undefined
                                })}
                              </p>

                              <div className="flex flex-wrap gap-2 mb-2">
                                {(Object.keys(REACTION_ICONS) as Array<keyof typeof REACTION_ICONS>).map(
                                  (reactionType) => {
                                    const { icon: ReactionIcon, key } = REACTION_ICONS[reactionType]
                                    const count = reactionCounts[reactionType] || 0
                                    const userReacted = hasUserReacted(activity, reactionType)
                                    const label = t(key)

                                    return (
                                      <Button
                                        key={reactionType}
                                        variant={userReacted ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-8 gap-1.5"
                                        onClick={() => handleReaction(activity.id, reactionType)}
                                        aria-label={`${label} ${count > 0 ? `(${count})` : ''}`}
                                        aria-pressed={userReacted}
                                      >
                                        <ReactionIcon
                                          size={16}
                                          weight={userReacted ? 'fill' : 'regular'}
                                          aria-hidden="true"
                                        />
                                        {count > 0 && (
                                          <span className="text-xs font-medium">{count}</span>
                                        )}
                                      </Button>
                                    )
                                  }
                                )}
                              </div>

                              {activity.reactions.length > 0 && (
                                <>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs"
                                    onClick={() =>
                                      setExpandedActivity(isExpanded ? null : activity.id)
                                    }
                                    aria-expanded={isExpanded}
                                    aria-controls={`reactions-${activity.id}`}
                                  >
                                    {isExpanded 
                                      ? t('activityFeed.hideReactions') 
                                      : t('activityFeed.showReactions', { count: String(activity.reactions.length) })}
                                  </Button>

                                  {isExpanded && (
                                    <motion.div
                                      id={`reactions-${activity.id}`}
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="mt-2 pt-2 border-t"
                                    >
                                      <p className="text-xs font-medium mb-2 text-muted-foreground">
                                        {t('activityFeed.reactionsLabel')}
                                      </p>
                                      <div className="space-y-1">
                                        {activity.reactions.map((reaction) => {
                                          const { icon: ReactionIcon, key } =
                                            REACTION_ICONS[reaction.type]
                                          const label = t(key)
                                          return (
                                            <div
                                              key={reaction.id}
                                              className="flex items-center gap-2 text-xs"
                                            >
                                              <ReactionIcon size={14} weight="fill" aria-hidden="true" />
                                              <span className="font-medium">
                                                {reaction.userName}
                                              </span>
                                              <span className="text-muted-foreground">
                                                {label}
                                              </span>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </motion.div>
                                  )}
                                </>
                              )}

                              <Separator className="my-3" />

                              <div className="space-y-3">
                                {activity.comments.length > 0 && (
                                  <>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="h-auto p-0 text-xs gap-1.5"
                                      onClick={() =>
                                        setExpandedComments(expandedComments === activity.id ? null : activity.id)
                                      }
                                      aria-expanded={expandedComments === activity.id}
                                      aria-controls={`comments-${activity.id}`}
                                    >
                                      <ChatCircle size={16} aria-hidden="true" />
                                      {expandedComments === activity.id
                                        ? t('activityFeed.hideComments')
                                        : t('activityFeed.showComments', { count: String(activity.comments.length) })}
                                    </Button>

                                    {expandedComments === activity.id && (
                                      <motion.div
                                        id={`comments-${activity.id}`}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="space-y-3 pl-2 border-l-2 border-muted"
                                      >
                                        {activity.comments.map((comment) => (
                                          <div key={comment.id} className="flex gap-2">
                                            <div className="flex-shrink-0">
                                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white font-bold text-xs">
                                                {comment.userAvatar || comment.userName.charAt(0).toUpperCase()}
                                              </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="bg-muted/50 rounded-lg px-3 py-2">
                                                <p className="text-xs font-semibold mb-1">
                                                  {comment.userName}
                                                </p>
                                                <p className="text-sm">
                                                  {renderCommentContent(comment)}
                                                </p>
                                              </div>
                                              <p className="text-xs text-muted-foreground mt-1 ml-3">
                                                {formatDistanceToNow(comment.timestamp, {
                                                  addSuffix: true,
                                                  locale: language === 'es' ? es : undefined
                                                })}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </motion.div>
                                    )}
                                  </>
                                )}

                                <UserMentionInput
                                  users={profiles || []}
                                  currentUserId={currentUserId}
                                  onSubmit={(content, mentions) => handleAddComment(activity.id, content, mentions)}
                                  placeholder={t('activityFeed.addComment')}
                                  buttonText={t('activityFeed.postComment')}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
