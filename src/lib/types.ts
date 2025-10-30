export type CourseStatus = 'not-started' | 'in-progress' | 'completed'

export type ContentType = 'video' | 'audio' | 'text' | 'image'

export interface AccessibilityMetadata {
  captions?: string
  transcript?: string
  altText?: string
  audioDescription?: string
}

export interface ContentModule {
  id: string
  title: string
  type: ContentType
  url: string
  duration?: number
  accessibility: AccessibilityMetadata
  order: number
}

export interface Assessment {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface Course {
  id: string
  title: string
  description: string
  category: string
  estimatedTime: number
  modules: ContentModule[]
  assessment?: Assessment[]
  coverImage?: string
}

export interface UserProgress {
  courseId: string
  status: CourseStatus
  completedModules: string[]
  currentModule?: string
  lastAccessed: number
  assessmentScore?: number
  assessmentAttempts: number
}

export interface UserPreferences {
  textSize: 'normal' | 'large' | 'x-large'
  playbackSpeed: number
  highContrast: boolean
  captionsEnabled: boolean
  reduceMotion: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: 'employee' | 'admin'
  assignedCourses: string[]
}
