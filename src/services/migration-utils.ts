/**
 * Data Migration and Cleanup Utilities
 * 
 * Tools to fix data integrity issues and migrate to the new service layer architecture
 */

import {
  CourseService,
  TeamService,
  GroupService,
  UserProfileService,
  UserProgressService,
  MentorshipService
} from './index'

export interface MigrationReport {
  timestamp: number
  totalIssuesFound: number
  issuesFixed: number
  errors: string[]
  details: Record<string, any>
}

/**
 * Validates and cleans all team member references
 */
export async function cleanTeamReferences(): Promise<{
  teamsProcessed: number
  ghostMembersRemoved: number
  teamsUpdated: string[]
}> {
  console.log('🧹 Cleaning team member references...')
  
  try {
    const teams = await TeamService.getAll()
    const profiles = await UserProfileService.getAll()
    const validUserIds = new Set(profiles.map(p => p.id))

    let ghostMembersRemoved = 0
    const teamsUpdated: string[] = []

    for (const team of teams) {
      const validMembers = team.memberIds.filter(id => validUserIds.has(id))
      const removedCount = team.memberIds.length - validMembers.length

      if (removedCount > 0) {
        await TeamService.update(team.id, {
          memberIds: validMembers
        })
        ghostMembersRemoved += removedCount
        teamsUpdated.push(team.id)
        console.log(`  ✓ Team "${team.name}": removed ${removedCount} ghost members`)
      }
    }

    console.log(`✅ Teams cleaned: ${teamsUpdated.length}/${teams.length}`)
    return {
      teamsProcessed: teams.length,
      ghostMembersRemoved,
      teamsUpdated
    }
  } catch (error) {
    console.error('❌ Error cleaning team references:', error)
    throw error
  }
}

/**
 * Validates and cleans all group references (users and courses)
 */
export async function cleanGroupReferences(): Promise<{
  groupsProcessed: number
  ghostUsersRemoved: number
  ghostCoursesRemoved: number
  groupsUpdated: string[]
}> {
  console.log('🧹 Cleaning group references...')
  
  try {
    const groups = await GroupService.getAll()
    const profiles = await UserProfileService.getAll()
    const courses = await CourseService.getAll()
    
    const validUserIds = new Set(profiles.map(p => p.id))
    const validCourseIds = new Set(courses.map(c => c.id))

    let ghostUsersRemoved = 0
    let ghostCoursesRemoved = 0
    const groupsUpdated: string[] = []

    for (const group of groups) {
      const validUsers = group.userIds.filter(id => validUserIds.has(id))
      const validCourses = group.courseIds.filter(id => validCourseIds.has(id))
      
      const removedUsers = group.userIds.length - validUsers.length
      const removedCourses = group.courseIds.length - validCourses.length

      if (removedUsers > 0 || removedCourses > 0) {
        await GroupService.update(group.id, {
          userIds: validUsers,
          courseIds: validCourses
        })
        ghostUsersRemoved += removedUsers
        ghostCoursesRemoved += removedCourses
        groupsUpdated.push(group.id)
        console.log(`  ✓ Group "${group.name}": removed ${removedUsers} ghost users, ${removedCourses} ghost courses`)
      }
    }

    console.log(`✅ Groups cleaned: ${groupsUpdated.length}/${groups.length}`)
    return {
      groupsProcessed: groups.length,
      ghostUsersRemoved,
      ghostCoursesRemoved,
      groupsUpdated
    }
  } catch (error) {
    console.error('❌ Error cleaning group references:', error)
    throw error
  }
}

/**
 * Validates and cleans mentorship pairings
 */
export async function cleanMentorshipReferences(): Promise<{
  pairingsProcessed: number
  invalidPairingsRemoved: number
  pairingsRemoved: string[]
}> {
  console.log('🧹 Cleaning mentorship pairings...')
  
  try {
    const pairings = await MentorshipService.getAll()
    const profiles = await UserProfileService.getAll()
    const validUserIds = new Set(profiles.map(p => p.id))

    let invalidPairingsRemoved = 0
    const pairingsRemoved: string[] = []

    for (const pairing of pairings) {
      const mentorValid = validUserIds.has(pairing.mentorId)
      const menteeValid = validUserIds.has(pairing.menteeId)

      if (!mentorValid || !menteeValid) {
        await MentorshipService.delete(pairing.id)
        invalidPairingsRemoved++
        pairingsRemoved.push(pairing.id)
        console.log(`  ✓ Removed invalid pairing: ${pairing.id}`)
      }
    }

    console.log(`✅ Mentorships cleaned: removed ${invalidPairingsRemoved}/${pairings.length}`)
    return {
      pairingsProcessed: pairings.length,
      invalidPairingsRemoved,
      pairingsRemoved
    }
  } catch (error) {
    console.error('❌ Error cleaning mentorship references:', error)
    throw error
  }
}

/**
 * Validates and cleans user progress references
 */
export async function cleanProgressReferences(): Promise<{
  progressRecordsProcessed: number
  invalidProgressRemoved: number
  recordsRemoved: string[]
}> {
  console.log('🧹 Cleaning user progress references...')
  
  try {
    const allProgress = await UserProgressService.getAll()
    const profiles = await UserProfileService.getAll()
    const courses = await CourseService.getAll()
    
    const validUserIds = new Set(profiles.map(p => p.id))
    const validCourseIds = new Set(courses.map(c => c.id))

    let invalidProgressRemoved = 0
    const recordsRemoved: string[] = []

    for (const progress of allProgress) {
      const userValid = validUserIds.has(progress.userId)
      const courseValid = validCourseIds.has(progress.courseId)

      if (!userValid || !courseValid) {
        await UserProgressService.delete(progress.id)
        invalidProgressRemoved++
        recordsRemoved.push(progress.id)
        console.log(`  ✓ Removed invalid progress: ${progress.id}`)
      }
    }

    console.log(`✅ Progress records cleaned: removed ${invalidProgressRemoved}/${allProgress.length}`)
    return {
      progressRecordsProcessed: allProgress.length,
      invalidProgressRemoved,
      recordsRemoved
    }
  } catch (error) {
    console.error('❌ Error cleaning progress references:', error)
    throw error
  }
}

/**
 * Run all cleanup operations
 */
export async function runFullDataCleanup(): Promise<MigrationReport> {
  console.log('🚀 Starting full data cleanup...')
  console.log('=' .repeat(50))
  
  const report: MigrationReport = {
    timestamp: Date.now(),
    totalIssuesFound: 0,
    issuesFixed: 0,
    errors: [],
    details: {}
  }

  try {
    // Clean teams
    const teamResults = await cleanTeamReferences()
    report.details.teams = teamResults
    report.totalIssuesFound += teamResults.ghostMembersRemoved
    report.issuesFixed += teamResults.ghostMembersRemoved

    // Clean groups
    const groupResults = await cleanGroupReferences()
    report.details.groups = groupResults
    report.totalIssuesFound += groupResults.ghostUsersRemoved + groupResults.ghostCoursesRemoved
    report.issuesFixed += groupResults.ghostUsersRemoved + groupResults.ghostCoursesRemoved

    // Clean mentorships
    const mentorshipResults = await cleanMentorshipReferences()
    report.details.mentorships = mentorshipResults
    report.totalIssuesFound += mentorshipResults.invalidPairingsRemoved
    report.issuesFixed += mentorshipResults.invalidPairingsRemoved

    // Clean progress
    const progressResults = await cleanProgressReferences()
    report.details.progress = progressResults
    report.totalIssuesFound += progressResults.invalidProgressRemoved
    report.issuesFixed += progressResults.invalidProgressRemoved

    console.log('=' .repeat(50))
    console.log('✅ Full data cleanup completed!')
    console.log(`📊 Total issues found: ${report.totalIssuesFound}`)
    console.log(`✔️  Total issues fixed: ${report.issuesFixed}`)
    
    return report
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    report.errors.push(errorMsg)
    console.error('❌ Cleanup failed:', errorMsg)
    throw error
  }
}

/**
 * Validate data integrity without making changes
 */
export async function validateDataIntegrity(): Promise<{
  isValid: boolean
  issues: string[]
  warnings: string[]
}> {
  console.log('🔍 Validating data integrity...')
  
  const issues: string[] = []
  const warnings: string[] = []

  try {
    const profiles = await UserProfileService.getAll()
    const courses = await CourseService.getAll()
    const teams = await TeamService.getAll()
    const groups = await GroupService.getAll()
    const pairings = await MentorshipService.getAll()
    const allProgress = await UserProgressService.getAll()

    const validUserIds = new Set(profiles.map(p => p.id))
    const validCourseIds = new Set(courses.map(c => c.id))

    // Check teams
    teams.forEach(team => {
      const invalidMembers = team.memberIds.filter(id => !validUserIds.has(id))
      if (invalidMembers.length > 0) {
        issues.push(`Team "${team.name}" has ${invalidMembers.length} invalid member references`)
      }
    })

    // Check groups
    groups.forEach(group => {
      const invalidUsers = group.userIds.filter(id => !validUserIds.has(id))
      const invalidCourses = group.courseIds.filter(id => !validCourseIds.has(id))
      
      if (invalidUsers.length > 0) {
        issues.push(`Group "${group.name}" has ${invalidUsers.length} invalid user references`)
      }
      if (invalidCourses.length > 0) {
        issues.push(`Group "${group.name}" has ${invalidCourses.length} invalid course references`)
      }
    })

    // Check mentorships
    pairings.forEach(pairing => {
      if (!validUserIds.has(pairing.mentorId)) {
        issues.push(`Mentorship pairing ${pairing.id} has invalid mentor reference`)
      }
      if (!validUserIds.has(pairing.menteeId)) {
        issues.push(`Mentorship pairing ${pairing.id} has invalid mentee reference`)
      }
    })

    // Check progress
    allProgress.forEach(progress => {
      if (!validUserIds.has(progress.userId)) {
        issues.push(`Progress record ${progress.id} has invalid user reference`)
      }
      if (!validCourseIds.has(progress.courseId)) {
        issues.push(`Progress record ${progress.id} has invalid course reference`)
      }
    })

    const isValid = issues.length === 0
    
    console.log(isValid ? '✅ Data integrity check passed!' : `⚠️  Found ${issues.length} issues`)
    
    return { isValid, issues, warnings }
  } catch (error) {
    console.error('❌ Validation failed:', error)
    throw error
  }
}
