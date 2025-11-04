import { z } from 'zod'

// User progress schema
export const UserProgressSchema = z.object({
  id: z.string(), // Unique ID for the progress record
  userId: z.string(),
  courseId: z.string(),
  status: z.enum(['not-started', 'in-progress', 'completed']),
  completedModules: z.array(z.string()),
  currentModule: z.string().optional(),
  lastAccessed: z.number(),
  assessmentScore: z.number().optional(),
  assessmentAttempts: z.number(),
})

// User achievement schema
export const UserAchievementSchema = z.object({
  id: z.string(), // Unique ID for the user achievement record
  userId: z.string(),
  achievementId: z.string(),
  unlockedAt: z.number(),
  progress: z.number().optional(),
})

// User stats schema
export const UserStatsSchema = z.object({
  id: z.string(), // User ID (one stats record per user)
  totalCoursesCompleted: z.number(),
  totalModulesCompleted: z.number(),
  totalAssessmentsPassed: z.number(),
  averageScore: z.number(),
  currentStreak: z.number(),
  longestStreak: z.number(),
  lastActivityDate: z.number(),
  totalXP: z.number(),
  level: z.number(),
})

// XP Event schema
export const XPEventSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['module', 'course', 'assessment', 'login', 'streak', 'perfect-score']),
  amount: z.number(),
  timestamp: z.number(),
  label: z.string(),
})

export type UserProgress = z.infer<typeof UserProgressSchema>
export type UserAchievement = z.infer<typeof UserAchievementSchema>
export type UserStats = z.infer<typeof UserStatsSchema>
export type XPEvent = z.infer<typeof XPEventSchema>
