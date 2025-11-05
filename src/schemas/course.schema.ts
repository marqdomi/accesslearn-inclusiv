import { z } from 'zod'

// Accessibility metadata schema
export const AccessibilityMetadataSchema = z.object({
  captions: z.string().optional(),
  transcript: z.string().optional(),
  altText: z.string().optional(),
  audioDescription: z.string().optional(),
})

// Lesson block schema
export const LessonBlockSchema = z.object({
  id: z.string(),
  type: z.enum(['welcome', 'text', 'image', 'audio', 'video', 'challenge', 'code']),
  content: z.string(),
  accessibility: AccessibilityMetadataSchema.optional(),
  characterMessage: z.string().optional(),
  xpValue: z.number().optional(),
  order: z.number(),
})

// Quiz question schema
export const QuizQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['multiple-choice', 'true-false', 'matching']),
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.union([z.number(), z.array(z.number())]),
  correctFeedback: z.string(),
  incorrectFeedback: z.string(),
  xpValue: z.number(),
})

// Quiz schema
export const QuizSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  questions: z.array(QuizQuestionSchema),
  passingScore: z.number(),
  maxAttempts: z.number(),
  totalXP: z.number(),
})

// Lesson schema
export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  blocks: z.array(LessonBlockSchema),
  quiz: QuizSchema.optional(),
  totalXP: z.number(),
  estimatedMinutes: z.number(),
})

// Module schema
export const ModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  lessons: z.array(LessonSchema),
  order: z.number(),
  badge: z.string().optional(),
})

// Course structure schema
export const CourseStructureSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  coverImage: z.string().optional(),
  modules: z.array(ModuleSchema),
  estimatedHours: z.number(),
  totalXP: z.number(),
  published: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
  createdBy: z.string(),
})

export type CourseStructure = z.infer<typeof CourseStructureSchema>
export type Module = z.infer<typeof ModuleSchema>
export type Lesson = z.infer<typeof LessonSchema>
export type Quiz = z.infer<typeof QuizSchema>
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>
export type LessonBlock = z.infer<typeof LessonBlockSchema>
export type AccessibilityMetadata = z.infer<typeof AccessibilityMetadataSchema>
