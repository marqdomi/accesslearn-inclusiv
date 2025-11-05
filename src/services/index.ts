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
export * from './course-service'
export * from './user-progress-service'
export * from './team-service'
export * from './user-service'

// Re-export service instances for convenient access
export { CourseService } from './course-service'
export { UserProgressService } from './user-progress-service'
export { TeamService, GroupService } from './team-service'
export { UserProfileService, UserStatsService, XPEventService } from './user-service'
