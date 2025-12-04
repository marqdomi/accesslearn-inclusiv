/**
 * Copyright (c) 2025 Marco Domínguez. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * This file contains proprietary and confidential information of Marco Domínguez.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without prior written permission.
 * 
 * Analytics Functions
 * 
 * Provides analytics and reporting data from Cosmos DB
 */

import { getContainer } from '../services/cosmosdb.service'
import { User } from '../models/User'
import { Course } from '../models/Course'
import { UserProgress } from '../models/User'
import { UserGroup } from './UserGroupFunctions'
import { getTenantById } from './TenantFunctions'
import { ActivityFeedItem } from './ActivityFeedFunctions'

/**
 * Get high-level platform statistics
 */
export async function getHighLevelStats(tenantId: string): Promise<{
  totalActiveUsers: number
  totalSeats: number
  platformCompletionRate: number
  totalPublishedCourses: number
  totalXPAwarded: number
  topEngagedUsers: Array<{
    userId: string
    userName: string
    xp: number
    level: number
  }>
  topPopularCourses: Array<{
    courseId: string
    courseTitle: string
    enrollments: number
    completions: number
  }>
  complianceStatus: {
    totalMandatory: number
    completed: number
    inProgress: number
    notStarted: number
    certificatesIssued: number
    certificatesRequired: number
  }
}> {
  const usersContainer = getContainer('users')
  const coursesContainer = getContainer('courses')
  const progressContainer = getContainer('user-progress')

  // Get all active users
  const { resources: users } = await usersContainer.items
    .query<User>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.status = @status',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@status', value: 'active' }
      ]
    })
    .fetchAll()

  const activeUsers = users.filter(u => u.role !== 'super-admin' && u.role !== 'tenant-admin')
  const totalActiveUsers = activeUsers.length

  // Get all published courses
  const { resources: courses } = await coursesContainer.items
    .query<Course>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.status = @status',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@status', value: 'active' }
      ]
    })
    .fetchAll()

  const totalPublishedCourses = courses.length

  // Get all user progress
  const { resources: allProgress } = await progressContainer.items
    .query<UserProgress>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Calculate platform completion rate
  let totalAssignedCourses = 0
  let totalCompletedCourses = 0
  const courseEnrollments = new Map<string, number>()
  const courseCompletions = new Map<string, number>()

  allProgress.forEach(progress => {
    totalAssignedCourses++
    courseEnrollments.set(
      progress.courseId,
      (courseEnrollments.get(progress.courseId) || 0) + 1
    )

    if (progress.status === 'completed') {
      totalCompletedCourses++
      courseCompletions.set(
        progress.courseId,
        (courseCompletions.get(progress.courseId) || 0) + 1
      )
    }
  })

  const platformCompletionRate = totalAssignedCourses > 0
    ? Math.round((totalCompletedCourses / totalAssignedCourses) * 100)
    : 0

  // Calculate total XP awarded
  const totalXPAwarded = activeUsers.reduce((sum, user) => sum + (user.totalXP || 0), 0)

  // Top 5 engaged users (by XP)
  const topEngagedUsers = activeUsers
    .map(user => ({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      xp: user.totalXP || 0,
      level: user.level || 1
    }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5)

  // Top 5 popular courses (by enrollments)
  const topPopularCourses = courses
    .map(course => ({
      courseId: course.id,
      courseTitle: course.title,
      enrollments: courseEnrollments.get(course.id) || 0,
      completions: courseCompletions.get(course.id) || 0
    }))
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 5)

  // Compliance status (check for mandatory courses - using isMandatory flag if exists)
  const mandatoryCourses = courses.filter(c => (c as any).isMandatory === true || (c as any).mandatory === true)
  let totalMandatory = 0
  let completed = 0
  let inProgress = 0
  let notStarted = 0

  // Get certificates container for compliance tracking
  const certificatesContainer = getContainer('certificates')
  const { resources: certificates } = await certificatesContainer.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  mandatoryCourses.forEach(course => {
    const enrollments = courseEnrollments.get(course.id) || 0
    totalMandatory += enrollments

    allProgress
      .filter(p => p.courseId === course.id)
      .forEach(progress => {
        if (progress.status === 'completed') {
          completed++
        } else if (progress.status === 'in-progress') {
          inProgress++
        } else {
          notStarted++
        }
      })
  })

  // Calculate certificates issued vs required
  const certificatesIssued = certificates.length
  const certificatesRequired = completed // Assuming one certificate per completed course

  // Get tenant to obtain maxUsers (totalSeats)
  const tenant = await getTenantById(tenantId)
  const totalSeats = tenant?.maxUsers || 200 // Fallback to 200 if tenant not found

  return {
    totalActiveUsers,
    totalSeats,
    platformCompletionRate,
    totalPublishedCourses,
    totalXPAwarded,
    topEngagedUsers,
    topPopularCourses,
    complianceStatus: {
      totalMandatory,
      completed,
      inProgress,
      notStarted,
      certificatesIssued,
      certificatesRequired
    }
  }
}

/**
 * Get user progress report data
 */
export async function getUserProgressReport(
  tenantId: string,
  filters?: {
    searchQuery?: string
    teamId?: string
    mentorId?: string
  }
): Promise<Array<{
  userId: string
  userName: string
  userEmail: string
  teamName?: string
  mentorName?: string
  courses: Array<{
    courseId: string
    courseTitle: string
    status: 'not-started' | 'in-progress' | 'completed'
    progress: number
    quizScore?: number
    completionDate?: string
    enrollmentDate?: string
  }>
}>> {
  const usersContainer = getContainer('users')
  const coursesContainer = getContainer('courses')
  const progressContainer = getContainer('user-progress')
  const groupsContainer = getContainer('user-groups')

  // Get all users with filters
  let usersQuery = 'SELECT * FROM c WHERE c.tenantId = @tenantId'
  const parameters: any[] = [{ name: '@tenantId', value: tenantId }]

  if (filters?.searchQuery) {
    usersQuery += ' AND (CONTAINS(LOWER(c.firstName), LOWER(@search)) OR CONTAINS(LOWER(c.lastName), LOWER(@search)) OR CONTAINS(LOWER(c.email), LOWER(@search)))'
    parameters.push({ name: '@search', value: filters.searchQuery })
  }

  const { resources: users } = await usersContainer.items
    .query<User>({ query: usersQuery, parameters })
    .fetchAll()

  // Get all courses
  const { resources: courses } = await coursesContainer.items
    .query<Course>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Get all progress
  const { resources: allProgress } = await progressContainer.items
    .query<UserProgress>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Get groups if filtering by team
  let groups: UserGroup[] = []
  if (filters?.teamId) {
    const { resources: groupResources } = await groupsContainer.items
      .query<UserGroup>({
        query: 'SELECT * FROM c WHERE c.id = @groupId AND c.tenantId = @tenantId',
        parameters: [
          { name: '@groupId', value: filters.teamId },
          { name: '@tenantId', value: tenantId }
        ]
      })
      .fetchAll()
    groups = groupResources
  } else {
    const { resources: allGroups } = await groupsContainer.items
      .query<UserGroup>({
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
        parameters: [{ name: '@tenantId', value: tenantId }]
      })
      .fetchAll()
    groups = allGroups
  }

  // Build report data
  const reportData = users
    .filter(user => {
      // Filter by team if specified
      if (filters?.teamId) {
        const userInGroup = groups.some(g => g.memberIds?.includes(user.id))
        if (!userInGroup) return false
      }

      // Filter by mentor if specified
      if (filters?.mentorId) {
        // TODO: Implement mentor filtering based on your mentorship model
      }

      return true
    })
    .map(user => {
      const userProgress = allProgress.filter(p => p.userId === user.id)
      const userGroups = groups.filter(g => g.memberIds?.includes(user.id))
      const teamName = userGroups.length > 0 ? userGroups[0].name : undefined

      const coursesData = userProgress.map(progress => {
        const course = courses.find(c => c.id === progress.courseId)
        const bestScore = progress.bestScore || progress.progress || 0

        return {
          courseId: progress.courseId,
          courseTitle: course?.title || 'Unknown Course',
          status: progress.status || 'not-started',
          progress: progress.progress || 0,
          quizScore: bestScore > 0 ? bestScore : undefined,
          completionDate: progress.attempts?.find(a => a.completedAt)?.completedAt,
          enrollmentDate: progress.lastAccessedAt
        }
      })

      return {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        teamName,
        courses: coursesData
      }
    })

  return reportData
}

/**
 * Get course report data
 */
export async function getCourseReport(
  tenantId: string,
  courseId: string
): Promise<{
  courseId: string
  courseTitle: string
  totalEnrolled: number
  totalCompleted: number
  totalInProgress: number
  notStarted: number
  averageScore: number
  users: Array<{
    userId: string
    userName: string
    userEmail: string
    status: 'not-started' | 'in-progress' | 'completed'
    progress: number
    quizScore?: number
    completionDate?: string
    enrollmentDate?: string
  }>
}> {
  const coursesContainer = getContainer('courses')
  const progressContainer = getContainer('user-progress')
  const usersContainer = getContainer('users')

  // Get course
  const { resource: course } = await coursesContainer.item(courseId, tenantId).read<Course>()
  if (!course) {
    throw new Error('Course not found')
  }

  // Get all progress for this course
  const { resources: courseProgress } = await progressContainer.items
    .query<UserProgress>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.courseId = @courseId',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@courseId', value: courseId }
      ]
    })
    .fetchAll()

  const totalEnrolled = courseProgress.length
  const totalCompleted = courseProgress.filter(p => p.status === 'completed').length
  const totalInProgress = courseProgress.filter(p => p.status === 'in-progress').length
  const notStarted = courseProgress.filter(p => !p.status || p.status === 'not-started').length

  // Calculate average score
  const scores = courseProgress
    .map(p => p.bestScore || p.progress || 0)
    .filter(s => s > 0)
  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
    : 0

  // Get user details
  const userIds = [...new Set(courseProgress.map(p => p.userId))]
  const usersData = await Promise.all(
    userIds.map(async userId => {
      const { resource: user } = await usersContainer.item(userId, tenantId).read<User>()
      const progress = courseProgress.find(p => p.userId === userId)!

      return {
        userId: user?.id || userId,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        userEmail: user?.email || '',
        status: progress.status || 'not-started',
        progress: progress.progress || 0,
        quizScore: progress.bestScore || undefined,
        completionDate: progress.attempts?.find(a => a.completedAt)?.completedAt,
        enrollmentDate: progress.lastAccessedAt
      }
    })
  )

  return {
    courseId: course.id,
    courseTitle: course.title,
    totalEnrolled,
    totalCompleted,
    totalInProgress,
    notStarted,
    averageScore,
    users: usersData
  }
}

/**
 * Get team report data
 */
export async function getTeamReport(
  tenantId: string,
  teamId?: string
): Promise<Array<{
  teamId: string
  teamName: string
  memberCount: number
  averageCompletionRate: number
  totalXP: number
  members: Array<{
    userId: string
    userName: string
    userEmail: string
    completionRate: number
    totalXP: number
    coursesCompleted: number
  }>
}>> {
  const groupsContainer = getContainer('user-groups')
  const usersContainer = getContainer('users')
  const progressContainer = getContainer('user-progress')

  // Get groups
  let groupsQuery = 'SELECT * FROM c WHERE c.tenantId = @tenantId'
  const parameters: any[] = [{ name: '@tenantId', value: tenantId }]

  if (teamId) {
    groupsQuery += ' AND c.id = @teamId'
    parameters.push({ name: '@teamId', value: teamId })
  }

  const { resources: groups } = await groupsContainer.items
    .query<UserGroup>({ query: groupsQuery, parameters })
    .fetchAll()

  // Get all progress
  const { resources: allProgress } = await progressContainer.items
    .query<UserProgress>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Build team reports
  const teamReports = await Promise.all(
    groups.map(async group => {
      const memberIds = group.memberIds || []
      const members = await Promise.all(
        memberIds.map(async userId => {
          const { resource: user } = await usersContainer.item(userId, tenantId).read<User>()
          const userProgress = allProgress.filter(p => p.userId === userId)
          const completed = userProgress.filter(p => p.status === 'completed').length
          const total = userProgress.length

          return {
            userId: user?.id || userId,
            userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
            userEmail: user?.email || '',
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            totalXP: user?.totalXP || 0,
            coursesCompleted: completed
          }
        })
      )

      const totalMembers = members.length
      const averageCompletionRate = totalMembers > 0
        ? Math.round(members.reduce((sum, m) => sum + m.completionRate, 0) / totalMembers)
        : 0
      const totalXP = members.reduce((sum, m) => sum + m.totalXP, 0)

      return {
        teamId: group.id,
        teamName: group.name,
        memberCount: totalMembers,
        averageCompletionRate,
        totalXP,
        members
      }
    })
  )

  return teamReports
}

/**
 * Get assessment/quiz report data
 */
export async function getAssessmentReport(
  tenantId: string,
  quizId: string
): Promise<{
  quizId: string
  quizTitle: string
  courseId: string
  courseTitle: string
  totalAttempts: number
  averageScore: number
  passRate: number
  passingScore: number
  questionAnalytics: Array<{
    questionId: string
    questionText: string
    correctAnswerRate: number
    incorrectAnswerRate: number
    totalResponses: number
  }>
}> {
  const coursesContainer = getContainer('courses')
  const quizAttemptsContainer = getContainer('quiz-attempts')

  // Get all courses to find the quiz
  const { resources: courses } = await coursesContainer.items
    .query<Course>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Find the quiz in courses
  // Note: The Course model structure may vary. We'll check both assessment array and modules
  let quizData: { quiz: any; courseId: string; courseTitle: string; quizTitle: string } | null = null

  for (const course of courses) {
    // Check assessment array (if quizzes are stored there)
    if (course.assessment) {
      const quiz = course.assessment.find((a: any) => a.id === quizId)
      if (quiz) {
        quizData = {
          quiz: quiz,
          courseId: course.id,
          courseTitle: course.title,
          quizTitle: quiz.question || 'Untitled Quiz'
        }
        break
      }
    }

    // Check modules (if they have nested structure)
    if (course.modules) {
      for (const module of course.modules) {
        // Check if module itself is a quiz
        if (module.type === 'quiz' && module.id === quizId) {
          quizData = {
            quiz: module,
            courseId: course.id,
            courseTitle: course.title,
            quizTitle: module.title || 'Untitled Quiz'
          }
          break
        }
        // Check if module has nested structure (for frontend compatibility)
        const moduleAny = module as any
        if (moduleAny.lessons) {
          for (const lesson of moduleAny.lessons) {
            if (lesson.quiz && lesson.quiz.id === quizId) {
              quizData = {
                quiz: lesson.quiz,
                courseId: course.id,
                courseTitle: course.title,
                quizTitle: lesson.quiz.title || 'Untitled Quiz'
              }
              break
            }
          }
        }
      }
    }
    if (quizData) break
  }

  if (!quizData) {
    throw new Error('Quiz not found')
  }

  // Get all quiz attempts for this quiz
  const { resources: quizAttempts } = await quizAttemptsContainer.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.quizId = @quizId',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@quizId', value: quizId }
      ]
    })
    .fetchAll()

  const totalAttempts = quizAttempts.length
  const scores = quizAttempts.map((a: any) => a.score || 0)
  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length)
    : 0

  const passingScore = quizData.quiz.passingScore || 70
  const passRate = scores.length > 0
    ? Math.round((scores.filter((s: number) => s >= passingScore).length / scores.length) * 100)
    : 0

  // Analyze question-by-question
  // Handle different quiz structures
  const questions = quizData.quiz.questions || quizData.quiz.assessment || []
  const questionAnalytics = questions.map((question: any) => {
    const responses = quizAttempts.flatMap((attempt: any) =>
      (attempt.answers || []).filter((a: any) => a.questionId === question.id)
    )
    const correctCount = responses.filter((r: any) => r.correct).length
    const totalResponses = responses.length

    return {
      questionId: question.id,
      questionText: question.question || '',
      correctAnswerRate: totalResponses > 0
        ? Math.round((correctCount / totalResponses) * 100)
        : 0,
      incorrectAnswerRate: totalResponses > 0
        ? Math.round(((totalResponses - correctCount) / totalResponses) * 100)
        : 0,
      totalResponses
    }
  })

  return {
    quizId: quizData.quiz.id,
    quizTitle: quizData.quizTitle,
    courseId: quizData.courseId,
    courseTitle: quizData.courseTitle,
    totalAttempts,
    averageScore,
    passRate,
    passingScore,
    questionAnalytics
  }
}

/**
 * Get mentorship report data
 */
export async function getMentorshipReport(
  tenantId: string
): Promise<Array<{
  mentorId: string
  mentorName: string
  mentorEmail: string
  menteeCount: number
  averageMenteeCompletionRate: number
  totalMenteeXP: number
  mentees: Array<{
    menteeId: string
    menteeName: string
    menteeEmail: string
    completionRate: number
    coursesCompleted: number
    totalXP: number
  }>
}>> {
  const usersContainer = getContainer('users')
  const progressContainer = getContainer('user-progress')
  const mentorshipContainer = getContainer('mentorship')

  // Get all mentorship pairings
  const { resources: pairings } = await mentorshipContainer.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Get all users
  const { resources: users } = await usersContainer.items
    .query<User>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Get all progress
  const { resources: allProgress } = await progressContainer.items
    .query<UserProgress>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Group pairings by mentor
  const mentorMap = new Map<string, any[]>()

  pairings.forEach((pairing: any) => {
    const mentorId = pairing.mentorId
    if (!mentorMap.has(mentorId)) {
      mentorMap.set(mentorId, [])
    }
    mentorMap.get(mentorId)!.push(pairing)
  })

  // Build mentor reports
  const mentorReports = Array.from(mentorMap.entries()).map(([mentorId, menteePairings]) => {
    const mentor = users.find(u => u.id === mentorId)
    const menteeIds = menteePairings.map((p: any) => p.menteeId)

    const mentees = menteeIds.map(menteeId => {
      const mentee = users.find(u => u.id === menteeId)
      const menteeProgress = allProgress.filter(p => p.userId === menteeId)
      const completedCourses = menteeProgress.filter(p => p.status === 'completed').length
      const completionRate = menteeProgress.length > 0
        ? Math.round((completedCourses / menteeProgress.length) * 100)
        : 0

      return {
        menteeId,
        menteeName: mentee ? `${mentee.firstName} ${mentee.lastName}` : 'Unknown',
        menteeEmail: mentee?.email || '',
        completionRate,
        coursesCompleted: completedCourses,
        totalXP: mentee?.totalXP || 0
      }
    })

    const averageCompletionRate = mentees.length > 0
      ? Math.round(mentees.reduce((sum, m) => sum + m.completionRate, 0) / mentees.length)
      : 0

    const totalMenteeXP = mentees.reduce((sum, m) => sum + m.totalXP, 0)

    return {
      mentorId,
      mentorName: mentor ? `${mentor.firstName} ${mentor.lastName}` : 'Unknown',
      mentorEmail: mentor?.email || '',
      menteeCount: mentees.length,
      averageMenteeCompletionRate: averageCompletionRate,
      totalMenteeXP,
      mentees
    }
  })

  return mentorReports
}

/**
 * Get historical engagement data (XP and active users by week)
 */
export async function getHistoricalEngagementData(
  tenantId: string,
  weeks: number = 8
): Promise<Array<{
  week: string
  xpGained: number
  activeUsers: number
}>> {
  const activityFeedContainer = getContainer('activity-feed')
  const progressContainer = getContainer('user-progress')

  const now = new Date()
  const weeksData: Array<{
    week: string
    xpGained: number
    activeUsers: number
  }> = []

  // Get all activity feed items for the tenant
  const { resources: activities } = await activityFeedContainer.items
    .query<ActivityFeedItem>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Get all user progress for activity tracking
  const { resources: allProgress } = await progressContainer.items
    .query<UserProgress>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Calculate data for each week
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - (i * 7))
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    weekEnd.setHours(23, 59, 59, 999)

    const weekLabel = `Sem ${weeks - i}`

    // Calculate XP gained in this week from activity feed
    // Note: Activity feed doesn't directly track XP, so we'll use level-up activities as proxy
    // For more accurate XP tracking, we'd need to track XP changes in activity feed
    const weekActivities = activities.filter(a => {
      const activityDate = new Date(a.timestamp)
      return activityDate >= weekStart && activityDate < weekEnd
    })
    
    // Estimate XP from level-up activities (assuming ~100 XP per level)
    const xpGained = weekActivities
      .filter(a => a.type === 'level-up')
      .length * 100 // Rough estimate

    // Calculate active users in this week (users who accessed progress)
    const weekProgress = allProgress.filter(p => {
      if (!p.lastAccessedAt) return false
      const accessDate = new Date(p.lastAccessedAt)
      return accessDate >= weekStart && accessDate < weekEnd
    })
    
    const activeUserIds = new Set(weekProgress.map(p => p.userId))
    const activeUsers = activeUserIds.size

    weeksData.push({
      week: weekLabel,
      xpGained,
      activeUsers
    })
  }

  return weeksData
}

/**
 * Get real progress distribution based on actual user progress
 */
export async function getRealProgressDistribution(
  tenantId: string
): Promise<Array<{
  range: string
  count: number
  percentage: number
}>> {
  const progressContainer = getContainer('user-progress')

  // Get all user progress
  const { resources: allProgress } = await progressContainer.items
    .query<UserProgress>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Group by progress ranges
  const ranges = {
    '0-25%': 0,
    '26-50%': 0,
    '51-75%': 0,
    '76-100%': 0
  }

  allProgress.forEach(progress => {
    const progressPercent = progress.progress || 0
    
    if (progressPercent <= 25) {
      ranges['0-25%']++
    } else if (progressPercent <= 50) {
      ranges['26-50%']++
    } else if (progressPercent <= 75) {
      ranges['51-75%']++
    } else {
      ranges['76-100%']++
    }
  })

  const total = allProgress.length

  return [
    {
      range: '0-25%',
      count: ranges['0-25%'],
      percentage: total > 0 ? Math.round((ranges['0-25%'] / total) * 100) : 0
    },
    {
      range: '26-50%',
      count: ranges['26-50%'],
      percentage: total > 0 ? Math.round((ranges['26-50%'] / total) * 100) : 0
    },
    {
      range: '51-75%',
      count: ranges['51-75%'],
      percentage: total > 0 ? Math.round((ranges['51-75%'] / total) * 100) : 0
    },
    {
      range: '76-100%',
      count: ranges['76-100%'],
      percentage: total > 0 ? Math.round((ranges['76-100%'] / total) * 100) : 0
    }
  ]
}

/**
 * Get ROI metrics (training hours, average time per course, etc.)
 */
export async function getROIMetrics(tenantId: string): Promise<{
  totalTrainingHours: number
  averageTimePerCourse: number
  totalCompletedCourses: number
  averageCompletionTime: number
}> {
  const coursesContainer = getContainer('courses')
  const progressContainer = getContainer('user-progress')

  // Get all courses
  const { resources: courses } = await coursesContainer.items
    .query<Course>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Get all completed progress
  const { resources: allProgress } = await progressContainer.items
    .query<UserProgress>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.status = @status',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@status', value: 'completed' }
      ]
    })
    .fetchAll()

  // Calculate total training hours from completed courses
  let totalTrainingHours = 0
  const completionTimes: number[] = []

  allProgress.forEach(progress => {
    const course = courses.find(c => c.id === progress.courseId)
    if (course && course.estimatedTime) {
      totalTrainingHours += course.estimatedTime
      
      // Calculate completion time if we have dates
      if (progress.attempts && progress.attempts.length > 0) {
        const firstAttempt = progress.attempts[0]
        const completedAttempt = progress.attempts.find(a => a.completedAt)
        if (firstAttempt?.startedAt && completedAttempt?.completedAt) {
          const startDate = new Date(firstAttempt.startedAt)
          const endDate = new Date(completedAttempt.completedAt)
          const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) // days
          completionTimes.push(daysDiff)
        }
      }
    }
  })

  const totalCompletedCourses = allProgress.length
  const averageTimePerCourse = totalCompletedCourses > 0
    ? Math.round(totalTrainingHours / totalCompletedCourses * 10) / 10
    : 0
  
  const averageCompletionTime = completionTimes.length > 0
    ? Math.round((completionTimes.reduce((sum, t) => sum + t, 0) / completionTimes.length) * 10) / 10
    : 0

  return {
    totalTrainingHours: Math.round(totalTrainingHours * 10) / 10,
    averageTimePerCourse,
    totalCompletedCourses,
    averageCompletionTime
  }
}

/**
 * Get engagement metrics (retention, active users, etc.)
 */
export async function getEngagementMetrics(tenantId: string): Promise<{
  currentMonthActiveUsers: number
  previousMonthActiveUsers: number
  retentionRate: number
  averageActiveDaysPerUser: number
  peakActivityDay?: string
}> {
  const progressContainer = getContainer('user-progress')
  const activityFeedContainer = getContainer('activity-feed')

  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

  // Get all progress
  const { resources: allProgress } = await progressContainer.items
    .query<UserProgress>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Get activity feed
  const { resources: activities } = await activityFeedContainer.items
    .query<ActivityFeedItem>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Calculate current month active users
  const currentMonthProgress = allProgress.filter(p => {
    if (!p.lastAccessedAt) return false
    const accessDate = new Date(p.lastAccessedAt)
    return accessDate >= currentMonthStart
  })
  const currentMonthActiveUsers = new Set(currentMonthProgress.map(p => p.userId)).size

  // Calculate previous month active users
  const previousMonthProgress = allProgress.filter(p => {
    if (!p.lastAccessedAt) return false
    const accessDate = new Date(p.lastAccessedAt)
    return accessDate >= previousMonthStart && accessDate <= previousMonthEnd
  })
  const previousMonthActiveUsers = new Set(previousMonthProgress.map(p => p.userId)).size

  // Calculate retention rate (users active in both months)
  const currentMonthUserIds = new Set(currentMonthProgress.map(p => p.userId))
  const previousMonthUserIds = new Set(previousMonthProgress.map(p => p.userId))
  const retainedUsers = Array.from(currentMonthUserIds).filter(id => previousMonthUserIds.has(id)).length
  const retentionRate = previousMonthActiveUsers > 0
    ? Math.round((retainedUsers / previousMonthActiveUsers) * 100)
    : 0

  // Calculate average active days per user
  const userActiveDays = new Map<string, Set<string>>()
  allProgress.forEach(p => {
    if (p.lastAccessedAt) {
      const accessDate = new Date(p.lastAccessedAt)
      const dateKey = accessDate.toISOString().split('T')[0] // YYYY-MM-DD
      if (!userActiveDays.has(p.userId)) {
        userActiveDays.set(p.userId, new Set())
      }
      userActiveDays.get(p.userId)!.add(dateKey)
    }
  })
  
  const activeDaysArray = Array.from(userActiveDays.values()).map(days => days.size)
  const averageActiveDaysPerUser = activeDaysArray.length > 0
    ? Math.round((activeDaysArray.reduce((sum, d) => sum + d, 0) / activeDaysArray.length) * 10) / 10
    : 0

  // Find peak activity day
  const dayActivityCount = new Map<string, number>()
  activities.forEach(a => {
    const activityDate = new Date(a.timestamp)
    const dateKey = activityDate.toISOString().split('T')[0]
    dayActivityCount.set(dateKey, (dayActivityCount.get(dateKey) || 0) + 1)
  })
  
  let peakActivityDay: string | undefined
  let maxActivity = 0
  dayActivityCount.forEach((count, date) => {
    if (count > maxActivity) {
      maxActivity = count
      peakActivityDay = date
    }
  })

  return {
    currentMonthActiveUsers,
    previousMonthActiveUsers,
    retentionRate,
    averageActiveDaysPerUser,
    peakActivityDay
  }
}

/**
 * Get performance metrics (average scores, pass rates, etc.)
 */
export async function getPerformanceMetrics(tenantId: string): Promise<{
  averageCourseScore: number
  averageQuizPassRate: number
  topPerformingCourses: Array<{
    courseId: string
    courseTitle: string
    averageScore: number
    completionRate: number
  }>
  underperformingCourses: Array<{
    courseId: string
    courseTitle: string
    averageScore: number
    completionRate: number
  }>
}> {
  const coursesContainer = getContainer('courses')
  const progressContainer = getContainer('user-progress')
  const quizAttemptsContainer = getContainer('quiz-attempts')

  // Get all courses
  const { resources: courses } = await coursesContainer.items
    .query<Course>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Get all progress
  const { resources: allProgress } = await progressContainer.items
    .query<UserProgress>({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Get all quiz attempts
  const { resources: quizAttempts } = await quizAttemptsContainer.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    })
    .fetchAll()

  // Calculate average course score
  const scores = allProgress
    .map(p => p.bestScore || p.progress || 0)
    .filter(s => s > 0)
  const averageCourseScore = scores.length > 0
    ? Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10) / 10
    : 0

  // Calculate quiz pass rate (assuming passing score is 70)
  const passingScore = 70
  const quizScores = quizAttempts.map((a: any) => a.score || 0)
  const passedQuizzes = quizScores.filter((s: number) => s >= passingScore).length
  const averageQuizPassRate = quizScores.length > 0
    ? Math.round((passedQuizzes / quizScores.length) * 100)
    : 0

  // Calculate course performance
  const coursePerformance = courses.map(course => {
    const courseProgress = allProgress.filter(p => p.courseId === course.id)
    const completed = courseProgress.filter(p => p.status === 'completed').length
    const completionRate = courseProgress.length > 0
      ? Math.round((completed / courseProgress.length) * 100)
      : 0
    
    const courseScores = courseProgress
      .map(p => p.bestScore || p.progress || 0)
      .filter(s => s > 0)
    const averageScore = courseScores.length > 0
      ? Math.round((courseScores.reduce((sum, s) => sum + s, 0) / courseScores.length) * 10) / 10
      : 0

    return {
      courseId: course.id,
      courseTitle: course.title,
      averageScore,
      completionRate
    }
  })

  // Top performing courses (high completion rate and high scores)
  const topPerformingCourses = coursePerformance
    .filter(c => c.completionRate > 0)
    .sort((a, b) => {
      const scoreA = (a.averageScore + a.completionRate) / 2
      const scoreB = (b.averageScore + b.completionRate) / 2
      return scoreB - scoreA
    })
    .slice(0, 5)

  // Underperforming courses (low completion rate or low scores)
  const underperformingCourses = coursePerformance
    .filter(c => c.completionRate > 0 && (c.completionRate < 50 || c.averageScore < 60))
    .sort((a, b) => {
      const scoreA = (a.averageScore + a.completionRate) / 2
      const scoreB = (b.averageScore + b.completionRate) / 2
      return scoreA - scoreB
    })
    .slice(0, 5)

  return {
    averageCourseScore,
    averageQuizPassRate,
    topPerformingCourses,
    underperformingCourses
  }
}

/**
 * Get team comparison metrics
 */
export async function getTeamComparisons(tenantId: string): Promise<Array<{
  teamId: string
  teamName: string
  completionRate: number
  totalXP: number
  averageScore: number
  memberCount: number
}>> {
  try {
    const groupsContainer = getContainer('user-groups')
    const usersContainer = getContainer('users')
    const progressContainer = getContainer('user-progress')

    // Get all groups - return empty array if no groups exist
    let groups: UserGroup[] = []
    try {
      const { resources } = await groupsContainer.items
        .query<UserGroup>({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      groups = resources
    } catch (error: any) {
      // If container doesn't exist or query fails, return empty array
      console.warn('[Analytics] No groups found or groups container not accessible:', error.message)
      return []
    }

    // If no groups, return empty array
    if (groups.length === 0) {
      return []
    }

    // Get all users
    const { resources: users } = await usersContainer.items
      .query<User>({
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
        parameters: [{ name: '@tenantId', value: tenantId }]
      })
      .fetchAll()

    // Get all progress
    const { resources: allProgress } = await progressContainer.items
      .query<UserProgress>({
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
        parameters: [{ name: '@tenantId', value: tenantId }]
      })
      .fetchAll()

    // Calculate metrics per team
    const teamMetrics = groups.map(group => {
      const memberIds = group.memberIds || []
      const teamMembers = users.filter(u => memberIds.includes(u.id))
      const teamProgress = allProgress.filter(p => memberIds.includes(p.userId))
      
      const completed = teamProgress.filter(p => p.status === 'completed').length
      const completionRate = teamProgress.length > 0
        ? Math.round((completed / teamProgress.length) * 100)
        : 0

      const totalXP = teamMembers.reduce((sum, u) => sum + (u.totalXP || 0), 0)
      
      const scores = teamProgress
        .map(p => p.bestScore || p.progress || 0)
        .filter(s => s > 0)
      const averageScore = scores.length > 0
        ? Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 10) / 10
        : 0

      return {
        teamId: group.id,
        teamName: group.name,
        completionRate,
        totalXP,
        averageScore,
        memberCount: teamMembers.length
      }
    })

    return teamMetrics.sort((a, b) => b.completionRate - a.completionRate)
  } catch (error: any) {
    console.error('[Analytics] Error getting team comparisons:', error)
    // Return empty array instead of throwing to prevent breaking the dashboard
    return []
  }
}

/**
 * Get course completion rates for chart
 */
export async function getCourseCompletionRates(tenantId: string): Promise<Array<{
  courseId: string
  courseTitle: string
  completionRate: number
  enrollments: number
  completions: number
}>> {
  try {
    const coursesContainer = getContainer('courses')
    const progressContainer = getContainer('user-progress')

    // Get all courses
    const { resources: courses } = await coursesContainer.items
      .query<Course>({
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.status = @status',
        parameters: [
          { name: '@tenantId', value: tenantId },
          { name: '@status', value: 'active' }
        ]
      })
      .fetchAll()

    // Get all progress
    const { resources: allProgress } = await progressContainer.items
      .query<UserProgress>({
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
        parameters: [{ name: '@tenantId', value: tenantId }]
      })
      .fetchAll()

    // Calculate completion rates per course
    const courseMetrics = courses.map(course => {
      const courseProgress = allProgress.filter(p => p.courseId === course.id)
      const enrollments = courseProgress.length
      const completions = courseProgress.filter(p => p.status === 'completed').length
      const completionRate = enrollments > 0
        ? Math.round((completions / enrollments) * 100)
        : 0

      return {
        courseId: course.id,
        courseTitle: course.title || 'Curso sin título',
        completionRate,
        enrollments,
        completions
      }
    })

    return courseMetrics
      .filter(c => c.enrollments > 0) // Only courses with enrollments
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 10) // Top 10 courses
  } catch (error: any) {
    console.error('[Analytics] Error getting course completion rates:', error)
    // Return empty array instead of throwing
    return []
  }
}

/**
 * Get monthly completion trends
 */
export async function getMonthlyCompletionTrends(tenantId: string, months: number = 6): Promise<Array<{
  month: string
  completions: number
  enrollments: number
  completionRate: number
}>> {
  try {
    const progressContainer = getContainer('user-progress')

    // Get all progress
    const { resources: allProgress } = await progressContainer.items
      .query<UserProgress>({
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
        parameters: [{ name: '@tenantId', value: tenantId }]
      })
      .fetchAll()

    const now = new Date()
    const monthlyData: Array<{
      month: string
      completions: number
      enrollments: number
      completionRate: number
    }> = []

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
      
      const monthLabel = monthStart.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })

      // Get enrollments in this month (use first attempt date or lastAccessedAt as fallback)
      const monthEnrollments = allProgress.filter(p => {
        try {
          let enrollDate: Date | null = null
          
          // Try to get date from first attempt
          if (p.attempts && p.attempts.length > 0 && p.attempts[0].startedAt) {
            enrollDate = new Date(p.attempts[0].startedAt)
          } else if (p.lastAccessedAt) {
            enrollDate = new Date(p.lastAccessedAt)
          }
          
          if (!enrollDate) return false
          return enrollDate >= monthStart && enrollDate <= monthEnd
        } catch {
          return false
        }
      })

      // Get completions in this month
      const monthCompletions = allProgress.filter(p => {
        try {
          if (p.status !== 'completed') return false
          
          // Try to get completion date from attempts
          if (p.attempts && Array.isArray(p.attempts) && p.attempts.length > 0) {
            const completedAttempt = p.attempts.find((a: any) => a.completedAt)
            if (completedAttempt && completedAttempt.completedAt) {
              const completionDate = new Date(completedAttempt.completedAt)
              return completionDate >= monthStart && completionDate <= monthEnd
            }
          }
          
          // Fallback: use lastAccessedAt if status is completed
          if (p.lastAccessedAt) {
            const completionDate = new Date(p.lastAccessedAt)
            return completionDate >= monthStart && completionDate <= monthEnd
          }
          
          return false
        } catch {
          return false
        }
      })

      const completions = monthCompletions.length
      const enrollments = monthEnrollments.length
      const completionRate = enrollments > 0
        ? Math.round((completions / enrollments) * 100)
        : 0

      monthlyData.push({
        month: monthLabel,
        completions,
        enrollments,
        completionRate
      })
    }

    return monthlyData
  } catch (error: any) {
    console.error('[Analytics] Error getting monthly completion trends:', error)
    // Return empty array instead of throwing
    return []
  }
}

/**
 * Get score distribution for quizzes/assessments
 */
export async function getScoreDistribution(tenantId: string): Promise<Array<{
  range: string
  count: number
  percentage: number
}>> {
  try {
    const progressContainer = getContainer('user-progress')
    const quizAttemptsContainer = getContainer('quiz-attempts')

    // Get all quiz attempts
    let scores: number[] = []
    try {
      const { resources: quizAttempts } = await quizAttemptsContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      scores = quizAttempts.map((a: any) => {
        const score = a.score || 0
        return typeof score === 'number' && score >= 0 && score <= 100 ? score : 0
      }).filter((s: number) => s > 0)
    } catch (error) {
      // If no quiz attempts, use progress scores
      const { resources: allProgress } = await progressContainer.items
        .query<UserProgress>({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      scores = allProgress
        .map(p => {
          const score = p.bestScore || p.progress || 0
          return typeof score === 'number' && score >= 0 && score <= 100 ? score : 0
        })
        .filter(s => s > 0)
    }

    // Group scores into ranges
    const ranges = {
      '0-50': 0,
      '51-60': 0,
      '61-70': 0,
      '71-80': 0,
      '81-90': 0,
      '91-100': 0
    }

    scores.forEach(score => {
      if (score <= 50) ranges['0-50']++
      else if (score <= 60) ranges['51-60']++
      else if (score <= 70) ranges['61-70']++
      else if (score <= 80) ranges['71-80']++
      else if (score <= 90) ranges['81-90']++
      else ranges['91-100']++
    })

    const total = scores.length

    return [
      { range: '0-50%', count: ranges['0-50'], percentage: total > 0 ? Math.round((ranges['0-50'] / total) * 100) : 0 },
      { range: '51-60%', count: ranges['51-60'], percentage: total > 0 ? Math.round((ranges['51-60'] / total) * 100) : 0 },
      { range: '61-70%', count: ranges['61-70'], percentage: total > 0 ? Math.round((ranges['61-70'] / total) * 100) : 0 },
      { range: '71-80%', count: ranges['71-80'], percentage: total > 0 ? Math.round((ranges['71-80'] / total) * 100) : 0 },
      { range: '81-90%', count: ranges['81-90'], percentage: total > 0 ? Math.round((ranges['81-90'] / total) * 100) : 0 },
      { range: '91-100%', count: ranges['91-100'], percentage: total > 0 ? Math.round((ranges['91-100'] / total) * 100) : 0 }
    ]
  } catch (error: any) {
    console.error('[Analytics] Error getting score distribution:', error)
    // Return empty array instead of throwing to prevent breaking the dashboard
    return []
  }
}

