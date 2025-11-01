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
  titleKey?: string
  description: string
  descriptionKey?: string
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

export interface EmployeeCredentials {
  id: string
  email: string
  temporaryPassword: string
  firstName: string
  lastName: string
  department?: string
  role?: 'employee' | 'admin'
  status: 'pending' | 'activated' | 'disabled'
  createdAt: number
  expiresAt?: number
}

export interface BulkUploadResult {
  successful: EmployeeCredentials[]
  failed: Array<{
    row: number
    email: string
    errors: string[]
  }>
  totalProcessed: number
}

export interface AuthSession {
  userId: string
  email: string
  role: 'employee' | 'admin'
  isFirstLogin: boolean
  requiresPasswordChange: boolean
  requiresOnboarding: boolean
  createdAt: number
  lastActivity: number
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface OnboardingPreferences {
  highContrast: boolean
  textSize: 'normal' | 'large' | 'x-large'
  reduceMotion: boolean
  disableSoundEffects: boolean
  avatar?: string
  displayName?: string
}

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName?: string
  avatar?: string
  department?: string
  role: 'employee' | 'admin'
  createdAt: number
  lastLoginAt?: number
  preferences: OnboardingPreferences
}

export interface EngagementMetrics {
  userId: string
  userName: string
  averageDailyXP: number
  totalTimeSpent: number
  lastActiveDate: number
  coursesInProgress: number
  coursesCompleted: number
  currentStreak: number
}

export interface CompletionReport {
  courseId: string
  courseName: string
  totalAssigned: number
  completed: number
  inProgress: number
  notStarted: number
  completionRate: number
  averageScore?: number
}

export interface GroupReport {
  groupId: string
  groupName: string
  totalUsers: number
  courses: CompletionReport[]
  overallCompletion: number
  topPerformers: Array<{
    userId: string
    userName: string
    completionRate: number
  }>
}

export interface ActivityFeedItem {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  type: 'level-up' | 'badge-earned' | 'course-completed' | 'achievement-unlocked'
  timestamp: number
  data: {
    level?: number
    badgeName?: string
    badgeIcon?: string
    courseName?: string
    achievementName?: string
    achievementIcon?: string
  }
  reactions: ActivityReaction[]
}

export interface ActivityReaction {
  id: string
  userId: string
  userName: string
  type: 'congrats' | 'highfive' | 'fire' | 'star' | 'trophy'
  timestamp: number
}

export interface ForumQuestion {
  id: string
  courseId: string
  moduleId: string
  userId: string
  userName: string
  userAvatar?: string
  title: string
  content: string
  timestamp: number
  upvotes: number
  upvotedBy: string[]
  answered: boolean
  bestAnswerId?: string
  tags?: string[]
}

export interface ForumAnswer {
  id: string
  questionId: string
  userId: string
  userName: string
  userAvatar?: string
  userRole?: 'employee' | 'admin' | 'expert'
  content: string
  timestamp: number
  upvotes: number
  upvotedBy: string[]
  isBestAnswer: boolean
}

export interface TeamChallenge {
  id: string
  title: string
  description: string
  type: 'xp' | 'courses' | 'modules'
  startDate: number
  endDate: number
  teams: TeamChallengeTeam[]
  status: 'upcoming' | 'active' | 'completed'
  rewards?: string
}

export interface TeamChallengeTeam {
  id: string
  name: string
  department?: string
  memberCount: number
  totalXP?: number
  totalCoursesCompleted?: number
  totalModulesCompleted?: number
  rank?: number
}

export interface NotificationPreferences {
  activityFeed: boolean
  forumReplies: boolean
  achievements: boolean
  teamChallenges: boolean
  courseReminders: boolean
  emailSummary: 'never' | 'daily' | 'weekly'
  soundEffects: boolean
  inAppBadges: boolean
}

export interface UserNotification {
  id: string
  userId: string
  type: 'activity' | 'forum-reply' | 'achievement' | 'team-challenge' | 'course-reminder'
  title: string
  message: string
  timestamp: number
  read: boolean
  actionUrl?: string
  relatedId?: string
}
