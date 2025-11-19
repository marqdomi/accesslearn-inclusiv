/**
 * Team and Group Services
 * 
 * Manages teams and groups with referential integrity
 */

import { BaseService, DataValidator } from './base-service'
import { Team, UserGroup } from '@/lib/types'

class TeamServiceClass extends BaseService<Team> {
  constructor() {
    super('teams')
  }

  /**
   * Get teams for specific members
   */
  async getTeamsByMemberId(userId: string): Promise<Team[]> {
    return this.find(team => team.memberIds.includes(userId))
  }

  /**
   * Add member to team
   */
  async addMember(teamId: string, userId: string): Promise<Team | null> {
    try {
      const team = await this.getById(teamId)
      if (!team) {
        throw new Error(`Team ${teamId} not found`)
      }

      if (team.memberIds.includes(userId)) {
        return team // Already a member
      }

      return this.update(teamId, {
        memberIds: [...team.memberIds, userId]
      } as Partial<Team>)
    } catch (error) {
      console.error('Error adding member to team:', error)
      return null
    }
  }

  /**
   * Remove member from team
   */
  async removeMember(teamId: string, userId: string): Promise<Team | null> {
    try {
      const team = await this.getById(teamId)
      if (!team) {
        throw new Error(`Team ${teamId} not found`)
      }

      return this.update(teamId, {
        memberIds: team.memberIds.filter(id => id !== userId)
      } as Partial<Team>)
    } catch (error) {
      console.error('Error removing member from team:', error)
      return null
    }
  }

  /**
   * Validate and clean member IDs
   */
  async cleanInvalidMembers(teamId: string, validUserIds: Set<string>): Promise<Team | null> {
    try {
      const team = await this.getById(teamId)
      if (!team) return null

      const validMembers = team.memberIds.filter(id => validUserIds.has(id))
      
      if (validMembers.length !== team.memberIds.length) {
        return this.update(teamId, {
          memberIds: validMembers
        } as Partial<Team>)
      }

      return team
    } catch (error) {
      console.error('Error cleaning team members:', error)
      return null
    }
  }
}

class GroupServiceClass extends BaseService<UserGroup> {
  constructor() {
    super('user-groups')
  }

  /**
   * Get groups for a specific user
   */
  async getGroupsByUserId(userId: string): Promise<UserGroup[]> {
    return this.find(group => group.userIds.includes(userId))
  }

  /**
   * Get groups containing a specific course
   */
  async getGroupsByCourseId(courseId: string): Promise<UserGroup[]> {
    return this.find(group => group.courseIds.includes(courseId))
  }

  /**
   * Add user to group
   */
  async addUser(groupId: string, userId: string): Promise<UserGroup | null> {
    try {
      const group = await this.getById(groupId)
      if (!group) {
        throw new Error(`Group ${groupId} not found`)
      }

      if (group.userIds.includes(userId)) {
        return group // Already in group
      }

      return this.update(groupId, {
        userIds: [...group.userIds, userId]
      } as Partial<UserGroup>)
    } catch (error) {
      console.error('Error adding user to group:', error)
      return null
    }
  }

  /**
   * Remove user from group
   */
  async removeUser(groupId: string, userId: string): Promise<UserGroup | null> {
    try {
      const group = await this.getById(groupId)
      if (!group) {
        throw new Error(`Group ${groupId} not found`)
      }

      return this.update(groupId, {
        userIds: group.userIds.filter(id => id !== userId)
      } as Partial<UserGroup>)
    } catch (error) {
      console.error('Error removing user from group:', error)
      return null
    }
  }

  /**
   * Assign course to group
   */
  async assignCourse(groupId: string, courseId: string): Promise<UserGroup | null> {
    try {
      const group = await this.getById(groupId)
      if (!group) {
        throw new Error(`Group ${groupId} not found`)
      }

      if (group.courseIds.includes(courseId)) {
        return group // Already assigned
      }

      return this.update(groupId, {
        courseIds: [...group.courseIds, courseId]
      } as Partial<UserGroup>)
    } catch (error) {
      console.error('Error assigning course to group:', error)
      return null
    }
  }

  /**
   * Unassign course from group
   */
  async unassignCourse(groupId: string, courseId: string): Promise<UserGroup | null> {
    try {
      const group = await this.getById(groupId)
      if (!group) {
        throw new Error(`Group ${groupId} not found`)
      }

      return this.update(groupId, {
        courseIds: group.courseIds.filter(id => id !== courseId)
      } as Partial<UserGroup>)
    } catch (error) {
      console.error('Error unassigning course from group:', error)
      return null
    }
  }

  /**
   * Validate and clean invalid references
   */
  async cleanInvalidReferences(
    groupId: string,
    validUserIds: Set<string>,
    validCourseIds: Set<string>
  ): Promise<UserGroup | null> {
    try {
      const group = await this.getById(groupId)
      if (!group) return null

      const validUsers = group.userIds.filter(id => validUserIds.has(id))
      const validCourses = group.courseIds.filter(id => validCourseIds.has(id))
      
      if (
        validUsers.length !== group.userIds.length ||
        validCourses.length !== group.courseIds.length
      ) {
        return this.update(groupId, {
          userIds: validUsers,
          courseIds: validCourses
        } as Partial<UserGroup>)
      }

      return group
    } catch (error) {
      console.error('Error cleaning group references:', error)
      return null
    }
  }
}

// Export singleton instances
export const TeamService = new TeamServiceClass()
export const GroupService = new GroupServiceClass()
