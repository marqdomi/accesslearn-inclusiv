/**
 * Achievement and Certificate Services
 * 
 * Manages gamification features
 */

import { BaseService, UserScopedService } from './base-service'
import { Achievement, Certificate, QuizAttempt, CourseReview, CourseRatingSummary } from '@/lib/types'

// Constants
export const QUIZ_PASSING_SCORE = 70

class AchievementServiceClass extends BaseService<Achievement> {
  constructor() {
    super('achievements-catalog')
  }

  /**
   * Get achievements by category
   */
  async getByCategory(category: Achievement['category']): Promise<Achievement[]> {
    return this.find(a => a.category === category)
  }

  /**
   * Get achievements by tier
   */
  async getByTier(tier: Achievement['tier']): Promise<Achievement[]> {
    return this.find(a => a.tier === tier)
  }

  /**
   * Get visible achievements only
   */
  async getVisible(): Promise<Achievement[]> {
    return this.find(a => !a.hidden)
  }
}

interface CertificateRecord extends Certificate {
  userId: string
}

class CertificateServiceClass extends UserScopedService<CertificateRecord> {
  constructor() {
    super('certificates')
  }

  /**
   * Get certificates for a user
   */
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    const records = await this.getByUserId(userId)
    return records.sort((a, b) => b.completionDate - a.completionDate)
  }

  /**
   * Get certificate by code
   */
  async getByCertificateCode(code: string): Promise<Certificate | null> {
    const records = await this.find(c => c.certificateCode === code)
    return records.length > 0 ? records[0] : null
  }

  /**
   * Issue certificate
   */
  async issueCertificate(
    userId: string,
    courseId: string,
    courseTitle: string,
    userFullName: string
  ): Promise<Certificate> {
    // Check if certificate already exists
    const existing = await this.find(
      c => c.userId === userId && c.courseId === courseId
    )

    if (existing.length > 0) {
      return existing[0]
    }

    // Generate unique certificate code
    const code = `CERT-${Date.now()}-${userId.substring(0, 8)}`.toUpperCase()

    const certificate: CertificateRecord = {
      id: `${userId}-${courseId}`,
      userId,
      courseId,
      courseTitle,
      completionDate: Date.now(),
      certificateCode: code,
      userFullName
    }

    return this.create(certificate)
  }

  /**
   * Verify certificate
   */
  async verifyCertificate(code: string): Promise<boolean> {
    const cert = await this.getByCertificateCode(code)
    return cert !== null
  }
}

interface QuizAttemptRecord extends QuizAttempt {
  userId: string
}

class QuizAttemptServiceClass extends UserScopedService<QuizAttemptRecord> {
  constructor() {
    super('quiz-attempts')
  }

  /**
   * Get attempts for a quiz by user
   */
  async getUserQuizAttempts(userId: string, quizId: string): Promise<QuizAttempt[]> {
    const records = await this.find(
      a => a.userId === userId && a.quizId === quizId
    )
    return records.sort((a, b) => b.completedAt - a.completedAt)
  }

  /**
   * Get all attempts for a course by user
   */
  async getUserCourseAttempts(userId: string, courseId: string): Promise<QuizAttempt[]> {
    const records = await this.find(
      a => a.userId === userId && a.courseId === courseId
    )
    return records.sort((a, b) => b.completedAt - a.completedAt)
  }

  /**
   * Get best score for a quiz
   */
  async getBestScore(userId: string, quizId: string): Promise<number> {
    const attempts = await this.getUserQuizAttempts(userId, quizId)
    if (attempts.length === 0) return 0
    return Math.max(...attempts.map(a => a.score))
  }

  /**
   * Record quiz attempt
   */
  async recordAttempt(attempt: QuizAttempt): Promise<QuizAttemptRecord> {
    const record: QuizAttemptRecord = {
      ...attempt,
      userId: attempt.userId
    }
    return this.create(record)
  }

  /**
   * Get quiz statistics
   */
  async getQuizStats(quizId: string): Promise<{
    totalAttempts: number
    averageScore: number
    passRate: number
    uniqueUsers: number
  }> {
    const attempts = await this.find(a => a.quizId === quizId)
    
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        uniqueUsers: 0
      }
    }

    const uniqueUsers = new Set(attempts.map(a => a.userId)).size
    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0)
    const averageScore = totalScore / attempts.length
    const passed = attempts.filter(a => a.score >= QUIZ_PASSING_SCORE).length
    const passRate = (passed / attempts.length) * 100

    return {
      totalAttempts: attempts.length,
      averageScore,
      passRate,
      uniqueUsers
    }
  }
}

class CourseReviewServiceClass extends BaseService<CourseReview> {
  constructor() {
    super('course-reviews')
  }

  /**
   * Get reviews for a course
   */
  async getCourseReviews(courseId: string): Promise<CourseReview[]> {
    const reviews = await this.find(r => r.courseId === courseId)
    return reviews.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Get user's review for a course
   */
  async getUserReview(courseId: string, userId: string): Promise<CourseReview | null> {
    const reviews = await this.find(
      r => r.courseId === courseId && r.userId === userId
    )
    return reviews.length > 0 ? reviews[0] : null
  }

  /**
   * Submit review
   */
  async submitReview(review: CourseReview): Promise<CourseReview> {
    // Check if user already reviewed this course
    const existing = await this.getUserReview(review.courseId, review.userId)
    
    if (existing) {
      // Update existing review
      return (await this.update(existing.id, review))!
    }

    return this.create(review)
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string, userId: string): Promise<CourseReview | null> {
    const review = await this.getById(reviewId)
    if (!review) return null

    const helpfulBy = review.helpfulBy.includes(userId)
      ? review.helpfulBy.filter(id => id !== userId)
      : [...review.helpfulBy, userId]

    return this.update(reviewId, {
      helpfulBy,
      helpful: helpfulBy.length
    } as Partial<CourseReview>)
  }

  /**
   * Get rating summary for a course
   */
  async getRatingSummary(courseId: string): Promise<CourseRatingSummary> {
    const reviews = await this.getCourseReviews(courseId)
    
    if (reviews.length === 0) {
      return {
        courseId,
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalRating = 0

    reviews.forEach(review => {
      totalRating += review.rating
      distribution[review.rating as keyof typeof distribution]++
    })

    return {
      courseId,
      averageRating: totalRating / reviews.length,
      totalReviews: reviews.length,
      ratingDistribution: distribution
    }
  }
}

// Export singleton instances
export const AchievementService = new AchievementServiceClass()
export const CertificateService = new CertificateServiceClass()
export const QuizAttemptService = new QuizAttemptServiceClass()
export const CourseReviewService = new CourseReviewServiceClass()
