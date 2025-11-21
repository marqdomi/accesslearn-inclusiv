export type CourseStatus = 'not-started' | 'in-progress' | 'completed'

export type CourseEnrollmentMode = 'open' | 'restricted' | 'admin-only'

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
  // Approval workflow fields
  status?: 'draft' | 'pending-review' | 'published' | 'archived'
  reviewerId?: string
  reviewComments?: string
  requestedChanges?: string
  publishedAt?: string
  archivedAt?: string
  submittedForReviewAt?: string
}

export interface CourseAttempt {
  attemptNumber: number
  startedAt: string
  completedAt?: string
  finalScore: number
  xpEarned: number
  completedLessons: string[]
  quizScores: Array<{
    quizId: string
    score: number
    completedAt: string
  }>
}

export interface UserProgress {
  courseId: string
  status: CourseStatus
  completedModules: string[]
  currentModule?: string
  lastAccessed: number
  assessmentScore?: number
  assessmentAttempts: number
  // Library and retake fields
  attempts?: CourseAttempt[]
  bestScore?: number
  totalXpEarned?: number
  currentAttempt?: number
}

export interface UserPreferences {
  textSize: 'normal' | 'large' | 'x-large'
  playbackSpeed: number
  highContrast: boolean
  captionsEnabled: boolean
  reduceMotion: boolean
}

/**
 * Sistema de Roles Granular v2.0
 */
export type UserRole = 
  | 'super-admin'      // Platform-level admin (multi-tenant)
  | 'tenant-admin'     // Organization admin
  | 'content-manager'  // Course & content management
  | 'user-manager'     // User & team management
  | 'analytics-viewer' // Read-only analytics access
  | 'instructor'       // Course creator (needs approval)
  | 'mentor'           // Student guidance
  | 'student'          // Learning experience
  // Legacy compatibility
  | 'employee'         // Alias for 'student'
  | 'admin';           // Alias for 'tenant-admin'

export interface User {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  tenantId: string
  assignedCourses: string[]
  
  // Custom Permissions (optional overrides)
  customPermissions?: string[]
  
  // Campos específicos para mercado mexicano (compliance laboral)
  curp?: string                    // Clave Única de Registro de Población (18 caracteres)
  rfc?: string                     // Registro Federal de Contribuyentes (13 caracteres)
  nss?: string                     // Número de Seguridad Social (11 dígitos)
  puesto?: string                  // Puesto o cargo laboral del empleado
  area?: string                    // Área o departamento organizacional
  departamento?: string            // Departamento (alternativa a área, según estructura de empresa)
  centroCostos?: string            // Centro de costos para control administrativo
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

export interface ScenarioOption {
  id: string
  text: string
  consequence: string
  isCorrect: boolean
  score: number
  nextScenarioId?: string
}

export interface ScenarioStep {
  id: string
  situation: string
  context?: string
  image?: string
  options: ScenarioOption[]
  isEndpoint?: boolean
}

export interface ScenarioQuestion {
  title: string
  description: string
  steps: ScenarioStep[]
  startStepId: string
  perfectScore: number
}

export interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'short-answer' | 'ordering' | 'scenario-solver'
  question: string | ScenarioQuestion
  options: string[]
  correctAnswer: number | number[] | string
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
  videoUrl?: string
  videoType?: 'upload' | 'youtube' | 'vimeo' | 'wistia'
  imageFile?: string
}

export interface Lesson {
  id: string
  title: string
  description: string
  blocks: LessonBlock[]
  quiz?: Quiz
  totalXP: number
  estimatedMinutes: number
  achievementId?: string
}

export interface Module {
  id: string
  title: string
  description: string
  type: 'lesson' | 'quiz' | 'completion'
  lessons: Lesson[]
  order: number
  badge?: string
  achievementId?: string
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
  publishedAt?: number
  enrollmentMode?: CourseEnrollmentMode
  difficulty?: 'Novice' | 'Specialist' | 'Master'
  createdAt: number
  updatedAt: number
  createdBy: string
  completionAchievementId?: string
  certificateEnabled?: boolean
}

export interface UserLibrary {
  userId: string
  courseIds: string[]
  addedAt: Record<string, number>
}

export interface EnrollmentRequest {
  id: string
  userId: string
  courseId: string
  requestedAt: number
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: number
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

export interface UserProgressReportData {
  userId: string
  userName: string
  userEmail: string
  team?: string
  mentor?: string
  courses: Array<{
    courseId: string
    courseTitle: string
    status: CourseStatus
    progress: number
    score?: number
    completedDate?: number
    enrolledDate: number
  }>
}

export interface CourseReportData {
  courseId: string
  courseTitle: string
  totalEnrolled: number
  totalCompleted: number
  totalInProgress: number
  totalNotStarted: number
  averageScore: number
  users: Array<{
    userId: string
    userName: string
    userEmail: string
    progress: number
    status: CourseStatus
    score?: number
    completedDate?: number
  }>
}

export interface TeamReportData {
  teamId: string
  teamName: string
  memberCount: number
  averageCompletionRate: number
  totalXP: number
  teamChallengeRank?: number
  members: Array<{
    userId: string
    userName: string
    completionRate: number
    totalXP: number
  }>
}

export interface AssessmentReportData {
  quizId: string
  quizTitle: string
  courseTitle: string
  totalAttempts: number
  averageScore: number
  passRate: number
  questions: Array<{
    questionId: string
    questionText: string
    correctAnswerRate: number
    incorrectAnswerRate: number
    totalResponses: number
  }>
}

export interface MentorshipReportData {
  mentorId: string
  mentorName: string
  mentorEmail: string
  menteeCount: number
  averageMenteeCompletionRate: number
  totalMenteeXP: number
  mentees: Array<{
    menteeId: string
    menteeName: string
    completionRate: number
    coursesCompleted: number
  }>
}

export interface AnalyticsDashboardMetrics {
  totalActiveUsers: number
  totalSeats: number
  platformCompletionRate: number
  topEngagedUsers: Array<{
    userId: string
    userName: string
    xp: number
  }>
  topPopularCourses: Array<{
    courseId: string
    courseTitle: string
    enrollmentCount: number
  }>
  complianceMetrics: Array<{
    courseId: string
    courseTitle: string
    completionRate: number
    totalAssigned: number
    totalCompleted: number
  }>
}

export interface QuizAttempt {
  id: string
  userId: string
  courseId: string
  quizId: string
  score: number
  answers: Array<{
    questionId: string
    selectedAnswer: number | number[] | string
    correct: boolean
  }>
  completedAt: number
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
  role?: 'employee' | 'admin' | 'mentor'
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
  role: 'employee' | 'admin' | 'mentor'
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
  fullName?: string
  displayName?: string
  avatar?: string
  department?: string
  role: 'employee' | 'admin' | 'mentor'
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
  comments: ActivityComment[]
}

export interface ActivityComment {
  id: string
  activityId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  mentions: ActivityMention[]
  timestamp: number
}

export interface ActivityMention {
  userId: string
  userName: string
  startIndex: number
  endIndex: number
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
  userRole?: 'employee' | 'admin' | 'expert' | 'mentor'
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
  type: 'activity' | 'forum-reply' | 'achievement' | 'team-challenge' | 'course-reminder' | 'mention'
  title?: string
  titleKey?: string
  message?: string
  messageKey?: string
  messageParams?: Record<string, string>
  timestamp: number
  read: boolean
  actionUrl?: string
  relatedId?: string
}

export interface MentorshipPairing {
  id: string
  mentorId: string
  menteeId: string
  assignedAt: number
  assignedBy: string
  status: 'active' | 'removed'
}

export interface MentorMessage {
  id: string
  pairingId: string
  senderId: string
  senderName: string
  receiverId: string
  content: string
  timestamp: number
  read: boolean
}

// Sistema de Mentorías v2.0
export type MentorshipRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'
export type MentorshipSessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled'

export interface MentorshipRequest {
  id: string
  tenantId: string
  menteeId: string
  menteeName: string
  menteeEmail: string
  mentorId: string
  mentorName: string
  mentorEmail?: string
  topic: string
  message: string
  preferredDate?: number
  status: MentorshipRequestStatus
  createdAt: number
  respondedAt?: number
}

export interface MentorshipSession {
  id: string
  tenantId: string
  requestId?: string
  mentorId: string
  mentorName: string
  menteeId: string
  menteeName: string
  topic: string
  scheduledDate: number
  duration: number // minutos
  status: MentorshipSessionStatus
  notes?: string
  sharedResources?: string[]
  rating?: number
  feedback?: string
  completedAt?: number
  createdAt: number
  xpAwarded?: boolean
}

export interface MentorProfile {
  userId: string
  name: string
  email: string
  avatar?: string
  bio?: string
  specialties: string[]
  availability: {
    monday?: string[]
    tuesday?: string[]
    wednesday?: string[]
    thursday?: string[]
    friday?: string[]
    saturday?: string[]
    sunday?: string[]
  }
  rating: number
  totalSessions: number
  totalMentees: number
  isAvailable: boolean
}

export interface Team {
  id: string
  name: string
  description?: string
  department?: string
  memberIds: string[]
  createdAt: number
  createdBy: string
}

export interface WeeklyChallengeSnapshot {
  weekId: string
  weekStart: number
  weekEnd: number
  teamScores: Array<{
    teamId: string
    teamName: string
    totalXP: number
    memberCount: number
  }>
  winnerId?: string
  winnerName?: string
}

export interface CourseReview {
  id: string
  courseId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  reviewText?: string
  timestamp: number
  helpful: number
  helpfulBy: string[]
  verified: boolean
}

export interface CourseRatingSummary {
  courseId: string
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export interface Certificate {
  id: string
  userId: string
  courseId: string
  courseTitle: string
  completionDate: number
  certificateCode: string
  userFullName: string
}

export interface CompanySettings {
  companyName: string
  companyLogo?: string
}
