/**
 * Analytics Functions
 * 
 * Provides analytics and reporting data from Cosmos DB
 */

import { getContainer } from '../services/cosmosdb.service'
import { User } from '../models/User'
import { Course } from '../models/Course'
import { UserProgress } from '../models/User'
import { UserGroup } from './UserGroupFunctions'

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

  // Compliance status (assuming mandatory courses have a flag - adjust based on your model)
  const mandatoryCourses = courses.filter(c => (c as any).isMandatory === true)
  let totalMandatory = 0
  let completed = 0
  let inProgress = 0
  let notStarted = 0

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

  return {
    totalActiveUsers,
    totalSeats: 200, // TODO: Get from tenant settings
    platformCompletionRate,
    totalPublishedCourses,
    totalXPAwarded,
    topEngagedUsers,
    topPopularCourses,
    complianceStatus: {
      totalMandatory,
      completed,
      inProgress,
      notStarted
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
  const groupsContainer = getContainer('groups')

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
  const groupsContainer = getContainer('groups')
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

