/**
 * Mentorship, Forum, and Activity Services
 * 
 * Manages social and collaborative features
 */

import { BaseService, UserScopedService } from './base-service'
import { MentorshipPairing, ForumQuestion, ForumAnswer, ActivityFeedItem, UserNotification } from '@/lib/types'

class MentorshipServiceClass extends BaseService<MentorshipPairing> {
  constructor() {
    super('mentorship-pairings')
  }

  /**
   * Get active pairings for a mentor
   */
  async getActiveMentorPairings(mentorId: string): Promise<MentorshipPairing[]> {
    return this.find(p => p.mentorId === mentorId && p.status === 'active')
  }

  /**
   * Get active pairing for a mentee
   */
  async getActiveMenteePairing(menteeId: string): Promise<MentorshipPairing | null> {
    const pairings = await this.find(p => p.menteeId === menteeId && p.status === 'active')
    return pairings.length > 0 ? pairings[0] : null
  }

  /**
   * Create mentorship pairing
   */
  async createPairing(
    mentorId: string,
    menteeId: string,
    assignedBy: string
  ): Promise<MentorshipPairing> {
    // Check if mentee already has an active mentor
    const existing = await this.getActiveMenteePairing(menteeId)
    if (existing) {
      throw new Error(`Mentee ${menteeId} already has an active mentor`)
    }

    const pairing: MentorshipPairing = {
      id: `${mentorId}-${menteeId}-${Date.now()}`,
      mentorId,
      menteeId,
      assignedAt: Date.now(),
      assignedBy,
      status: 'active'
    }

    return this.create(pairing)
  }

  /**
   * Remove mentorship pairing
   */
  async removePairing(pairingId: string): Promise<MentorshipPairing | null> {
    return this.update(pairingId, {
      status: 'removed'
    } as Partial<MentorshipPairing>)
  }

  /**
   * Get all mentees for a mentor
   */
  async getMentees(mentorId: string): Promise<string[]> {
    const pairings = await this.getActiveMentorPairings(mentorId)
    return pairings.map(p => p.menteeId)
  }
}

class ForumServiceClass extends BaseService<ForumQuestion> {
  private answersTableName = 'forum-answers'

  /**
   * Get questions for a course
   */
  async getCourseQuestions(courseId: string): Promise<ForumQuestion[]> {
    const questions = await this.find(q => q.courseId === courseId)
    return questions.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Get questions for a module
   */
  async getModuleQuestions(courseId: string, moduleId: string): Promise<ForumQuestion[]> {
    const questions = await this.find(
      q => q.courseId === courseId && q.moduleId === moduleId
    )
    return questions.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Get user's questions
   */
  async getUserQuestions(userId: string): Promise<ForumQuestion[]> {
    const questions = await this.find(q => q.userId === userId)
    return questions.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Post a question
   */
  async postQuestion(question: ForumQuestion): Promise<ForumQuestion> {
    return this.create(question)
  }

  /**
   * Upvote question
   */
  async upvoteQuestion(questionId: string, userId: string): Promise<ForumQuestion | null> {
    const question = await this.getById(questionId)
    if (!question) return null

    const upvotedBy = question.upvotedBy.includes(userId)
      ? question.upvotedBy.filter(id => id !== userId) // Remove upvote
      : [...question.upvotedBy, userId] // Add upvote

    return this.update(questionId, {
      upvotedBy,
      upvotes: upvotedBy.length
    } as Partial<ForumQuestion>)
  }

  /**
   * Mark question as answered
   */
  async markAsAnswered(questionId: string, bestAnswerId: string): Promise<ForumQuestion | null> {
    return this.update(questionId, {
      answered: true,
      bestAnswerId
    } as Partial<ForumQuestion>)
  }

  /**
   * Get answers for a question
   */
  async getAnswers(questionId: string): Promise<ForumAnswer[]> {
    const kv = window.spark?.kv
    if (!kv) return []

    try {
      const allAnswers = await kv.get<ForumAnswer[]>(this.answersTableName) || []
      const filtered = allAnswers.filter(a => a.questionId === questionId)
      return filtered.sort((a, b) => {
        // Best answer first
        if (a.isBestAnswer && !b.isBestAnswer) return -1
        if (!a.isBestAnswer && b.isBestAnswer) return 1
        // Then by upvotes
        if (a.upvotes !== b.upvotes) return b.upvotes - a.upvotes
        // Then by timestamp
        return a.timestamp - b.timestamp
      })
    } catch (error) {
      console.error('Error getting answers:', error)
      return []
    }
  }

  /**
   * Post an answer
   */
  async postAnswer(answer: ForumAnswer): Promise<ForumAnswer> {
    const kv = window.spark?.kv
    if (!kv) throw new Error('KV storage not available')

    try {
      const allAnswers = await kv.get<ForumAnswer[]>(this.answersTableName) || []
      allAnswers.push(answer)
      await kv.set(this.answersTableName, allAnswers)
      return answer
    } catch (error) {
      console.error('Error posting answer:', error)
      throw error
    }
  }

  /**
   * Upvote answer
   */
  async upvoteAnswer(answerId: string, userId: string): Promise<ForumAnswer | null> {
    const kv = window.spark?.kv
    if (!kv) return null

    try {
      const allAnswers = await kv.get<ForumAnswer[]>(this.answersTableName) || []
      const index = allAnswers.findIndex(a => a.id === answerId)
      
      if (index === -1) return null

      const answer = allAnswers[index]
      const upvotedBy = answer.upvotedBy.includes(userId)
        ? answer.upvotedBy.filter(id => id !== userId)
        : [...answer.upvotedBy, userId]

      const updated: ForumAnswer = {
        ...answer,
        upvotedBy,
        upvotes: upvotedBy.length
      }

      allAnswers[index] = updated
      await kv.set(this.answersTableName, allAnswers)
      return updated
    } catch (error) {
      console.error('Error upvoting answer:', error)
      return null
    }
  }
}

class ActivityFeedServiceClass extends BaseService<ActivityFeedItem> {
  constructor() {
    super('activity-feed')
  }

  /**
   * Get recent activity
   */
  async getRecent(limit: number = 50): Promise<ActivityFeedItem[]> {
    const all = await this.getAll()
    return all
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  /**
   * Get activity for a user
   */
  async getUserActivity(userId: string, limit: number = 20): Promise<ActivityFeedItem[]> {
    const all = await this.find(item => item.userId === userId)
    return all
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  /**
   * Post activity
   */
  async postActivity(activity: ActivityFeedItem): Promise<ActivityFeedItem> {
    return this.create(activity)
  }

  /**
   * Add reaction
   */
  async addReaction(activityId: string, reaction: any): Promise<ActivityFeedItem | null> {
    const activity = await this.getById(activityId)
    if (!activity) return null

    const reactions = [...activity.reactions, reaction]
    return this.update(activityId, { reactions } as Partial<ActivityFeedItem>)
  }

  /**
   * Add comment
   */
  async addComment(activityId: string, comment: any): Promise<ActivityFeedItem | null> {
    const activity = await this.getById(activityId)
    if (!activity) return null

    const comments = [...activity.comments, comment]
    return this.update(activityId, { comments } as Partial<ActivityFeedItem>)
  }
}

interface UserNotificationRecord extends UserNotification {
  userId: string
}

class NotificationServiceClass extends UserScopedService<UserNotificationRecord> {
  constructor() {
    super('user-notifications')
  }

  /**
   * Get unread notifications for user
   */
  async getUnread(userId: string): Promise<UserNotification[]> {
    const records = await this.find(n => n.userId === userId && !n.read)
    return records.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<UserNotificationRecord | null> {
    return this.update(notificationId, { read: true } as Partial<UserNotificationRecord>)
  }

  /**
   * Mark all as read for user
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const unread = await this.getUnread(userId)
      let count = 0

      for (const notification of unread) {
        await this.markAsRead(notification.id)
        count++
      }

      return count
    } catch (error) {
      console.error('Error marking all as read:', error)
      return 0
    }
  }

  /**
   * Create notification
   */
  async createNotification(userId: string, notification: Omit<UserNotification, 'id' | 'userId'>): Promise<UserNotificationRecord> {
    const record: UserNotificationRecord = {
      ...notification,
      id: `${userId}-${Date.now()}`,
      userId,
      timestamp: Date.now(),
      read: false
    }

    return this.create(record)
  }
}

// Export singleton instances
export const MentorshipService = new MentorshipServiceClass()
export const ForumService = new ForumServiceClass()
export const ActivityFeedService = new ActivityFeedServiceClass()
export const NotificationService = new NotificationServiceClass()
