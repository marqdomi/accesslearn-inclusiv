/**
 * Data Services Layer
 * 
 * Centralized access to all data services.
 * Provides SQL-like operations over KV storage with:
 * - Referential integrity
 * - Data validation
 * - Single Source of Truth
 */

export * from './base-service'
export * from './user-progress-service'
export * from './team-service'
export * from './user-service'
export * from './social-service'
export * from './gamification-service'

// Re-export service instances for convenient access
export { UserProgressService } from './user-progress-service'
export { TeamService, GroupService } from './team-service'
export { UserProfileService, UserStatsService, XPEventService, DEFAULT_USER_STATS, XP_PER_LEVEL } from './user-service'
export { MentorshipService, ForumService, ActivityFeedService, NotificationService } from './social-service'
export { AchievementService, CertificateService, QuizAttemptService, CourseReviewService, QUIZ_PASSING_SCORE } from './gamification-service'
