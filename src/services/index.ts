// Export all services
export { CourseService } from './course.service'
export { UserProgressService } from './user-progress.service'
export { AchievementService } from './achievement.service'
export { GroupService } from './group.service'

// Export types from schemas
export type { CourseStructure, Module, Lesson, Quiz, QuizQuestion } from '@/schemas/course.schema'
export type { UserProgress, UserAchievement, UserStats, XPEvent } from '@/schemas/progress.schema'
export type { UserGroup, CourseAssignment, Team, Mentorship } from '@/schemas/group.schema'
