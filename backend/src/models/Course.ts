/**
 * Course Model
 * Represents a course in the learning management system with approval workflow support
 */

export type CourseStatus = 'draft' | 'pending-review' | 'published' | 'archived'

export interface ContentModule {
  id: string
  title: string
  type: 'text' | 'video' | 'quiz' | 'interactive'
  url: string
  order: number
  accessibility?: {
    altText?: string
    transcript?: string
    captionsUrl?: string
  }
}

export interface Assessment {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export interface Course {
  id: string
  tenantId: string
  title: string
  description: string
  category: string
  estimatedTime: number
  modules: ContentModule[]
  assessment?: Assessment[]
  coverImage?: string
  
  // Metadata
  createdBy: string
  createdAt: string
  updatedAt: string
  
  // Approval workflow fields
  status: CourseStatus
  reviewerId?: string
  reviewComments?: string
  requestedChanges?: string
  publishedAt?: string
  archivedAt?: string
  submittedForReviewAt?: string
}

export interface CourseCreateInput {
  title: string
  description: string
  category: string
  estimatedTime: number
  coverImage?: string
}

export interface CourseUpdateInput {
  title?: string
  description?: string
  category?: string
  estimatedTime?: number
  modules?: ContentModule[]
  assessment?: Assessment[]
  coverImage?: string
}

export interface CourseReviewAction {
  action: 'approve' | 'reject' | 'request-changes'
  comments?: string
  requestedChanges?: string
}
