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
