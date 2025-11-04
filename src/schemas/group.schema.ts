import { z } from 'zod'

// User group schema
export const UserGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  userIds: z.array(z.string()),
  courseIds: z.array(z.string()),
  createdAt: z.number(),
})

// Course assignment schema
export const CourseAssignmentSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  userId: z.string().optional(),
  groupId: z.string().optional(),
  assignedAt: z.number(),
  assignedBy: z.string(),
  dueDate: z.number().optional(),
})

// Team schema (for corporate structure)
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  managerIds: z.array(z.string()),
  memberIds: z.array(z.string()),
  createdAt: z.number(),
})

// Mentorship schema
export const MentorshipSchema = z.object({
  id: z.string(),
  mentorId: z.string(),
  menteeId: z.string(),
  startedAt: z.number(),
  endedAt: z.number().optional(),
  status: z.enum(['active', 'completed', 'cancelled']),
})

export type UserGroup = z.infer<typeof UserGroupSchema>
export type CourseAssignment = z.infer<typeof CourseAssignmentSchema>
export type Team = z.infer<typeof TeamSchema>
export type Mentorship = z.infer<typeof MentorshipSchema>
