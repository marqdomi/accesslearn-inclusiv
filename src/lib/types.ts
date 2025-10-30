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

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface Achievement {
  id: string
  title: string
  description: string
  tier: AchievementTier
  category: 'course' | 'assessment' | 'streak' | 'speed' | 'milestone'
  icon: string
  requirement: number
  hidden?: boolean
}

export interface UserAchievement {
  achievementId: string
  unlockedAt: number
  progress?: number
}

export interface UserStats {
  totalCoursesCompleted: number
  totalModulesCompleted: number
  totalAssessmentsPassed: number
  averageScore: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: number
  achievementsUnlocked: UserAchievement[]
  totalXP: number
  level: number
}

export interface XPEvent {
  type: 'module' | 'course' | 'assessment' | 'login' | 'streak' | 'perfect-score'
  amount: number
  timestamp: number
  label: string
}

export interface Quest {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'story'
  objectives: QuestObjective[]
  rewards: QuestReward
  expiresAt?: number
  completedAt?: number
}

export interface QuestObjective {
  id: string
  description: string
  type: 'complete-modules' | 'complete-courses' | 'pass-assessments' | 'earn-xp' | 'maintain-streak'
  target: number
  current: number
}

export interface QuestReward {
  xp: number
  achievementId?: string
  badge?: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  createdAt: number
}

export interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'matching'
  question: string
  options: string[]
  correctAnswer: number | number[]
  correctFeedback: string
  incorrectFeedback: string
  xpValue: number
}

export interface Quiz {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  passingScore: number
  maxAttempts: number
  totalXP: number
}

export interface LessonBlock {
  id: string
  type: 'welcome' | 'text' | 'image' | 'audio' | 'video' | 'challenge' | 'code'
  content: string
  accessibility?: AccessibilityMetadata
  characterMessage?: string
  xpValue?: number
  order: number
}

export interface Lesson {
  id: string
  title: string
  description: string
  blocks: LessonBlock[]
  quiz?: Quiz
  totalXP: number
  estimatedMinutes: number
}

export interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  order: number
  badge?: string
}

export interface CourseStructure {
  id: string
  title: string
  description: string
  category: string
  coverImage?: string
  modules: Module[]
  estimatedHours: number
  totalXP: number
  published: boolean
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface UserGroup {
  id: string
  name: string
  description: string
  userIds: string[]
  courseIds: string[]
  createdAt: number
}

export interface CourseAssignment {
  id: string
  courseId: string
  userId?: string
  groupId?: string
  assignedAt: number
  assignedBy: string
  dueDate?: number
}

export interface AdminReport {
  type: 'user-progress' | 'course-completion' | 'assessment-results' | 'engagement'
  generatedAt: number
  filters: {
    userIds?: string[]
    groupIds?: string[]
    courseIds?: string[]
    dateRange?: { start: number; end: number }
  }
  data: any
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}
