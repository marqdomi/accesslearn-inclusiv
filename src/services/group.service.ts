import { DB } from '@github/spark/db'
import { UserGroupSchema, CourseAssignmentSchema, type UserGroup, type CourseAssignment } from '@/schemas/group.schema'

const GROUPS_COLLECTION = 'user-groups'
const ASSIGNMENTS_COLLECTION = 'course-assignments'

/**
 * Group Management Service
 * Manages user groups and course assignments
 */
class GroupServiceClass {
  private db: DB

  constructor() {
    this.db = new DB()
  }

  // ========== User Groups ==========

  /**
   * Get all groups
   */
  async getAllGroups(): Promise<UserGroup[]> {
    return await this.db.getAll<Omit<UserGroup, 'id'>>(GROUPS_COLLECTION)
  }

  /**
   * Get a group by ID
   */
  async getGroupById(id: string): Promise<UserGroup | null> {
    return await this.db.get<Omit<UserGroup, 'id'>>(GROUPS_COLLECTION, id)
  }

  /**
   * Create a new group
   */
  async createGroup(groupData: Omit<UserGroup, 'id'>): Promise<UserGroup> {
    const newGroup = await this.db.insert(
      GROUPS_COLLECTION,
      UserGroupSchema.omit({ id: true }),
      {
        ...groupData,
        createdAt: Date.now(),
      }
    )
    return newGroup
  }

  /**
   * Update a group
   */
  async updateGroup(id: string, groupData: Partial<Omit<UserGroup, 'id'>>): Promise<UserGroup | null> {
    return await this.db.update(
      GROUPS_COLLECTION,
      id,
      UserGroupSchema.omit({ id: true }),
      groupData
    )
  }

  /**
   * Delete a group
   */
  async deleteGroup(id: string): Promise<boolean> {
    return await this.db.delete(GROUPS_COLLECTION, id)
  }

  /**
   * Add users to a group
   */
  async addUsersToGroup(groupId: string, userIds: string[]): Promise<UserGroup | null> {
    const group = await this.getGroupById(groupId)
    if (!group) return null

    const updatedUserIds = [...new Set([...group.userIds, ...userIds])]
    return await this.updateGroup(groupId, { userIds: updatedUserIds })
  }

  /**
   * Remove users from a group
   */
  async removeUsersFromGroup(groupId: string, userIds: string[]): Promise<UserGroup | null> {
    const group = await this.getGroupById(groupId)
    if (!group) return null

    const updatedUserIds = group.userIds.filter(id => !userIds.includes(id))
    return await this.updateGroup(groupId, { userIds: updatedUserIds })
  }

  /**
   * Get groups that a user belongs to
   */
  async getGroupsByUserId(userId: string): Promise<UserGroup[]> {
    const allGroups = await this.getAllGroups()
    return allGroups.filter(group => group.userIds.includes(userId))
  }

  // ========== Course Assignments ==========

  /**
   * Get all assignments
   */
  async getAllAssignments(): Promise<CourseAssignment[]> {
    return await this.db.getAll<Omit<CourseAssignment, 'id'>>(ASSIGNMENTS_COLLECTION)
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(id: string): Promise<CourseAssignment | null> {
    return await this.db.get<Omit<CourseAssignment, 'id'>>(ASSIGNMENTS_COLLECTION, id)
  }

  /**
   * Create a new course assignment
   */
  async createAssignment(assignmentData: Omit<CourseAssignment, 'id'>): Promise<CourseAssignment> {
    const newAssignment = await this.db.insert(
      ASSIGNMENTS_COLLECTION,
      CourseAssignmentSchema.omit({ id: true }),
      {
        ...assignmentData,
        assignedAt: Date.now(),
      }
    )
    return newAssignment
  }

  /**
   * Delete an assignment
   */
  async deleteAssignment(id: string): Promise<boolean> {
    return await this.db.delete(ASSIGNMENTS_COLLECTION, id)
  }

  /**
   * Get assignments for a user
   */
  async getAssignmentsByUserId(userId: string): Promise<CourseAssignment[]> {
    const allAssignments = await this.getAllAssignments()
    return allAssignments.filter(a => a.userId === userId)
  }

  /**
   * Get assignments for a group
   */
  async getAssignmentsByGroupId(groupId: string): Promise<CourseAssignment[]> {
    const allAssignments = await this.getAllAssignments()
    return allAssignments.filter(a => a.groupId === groupId)
  }

  /**
   * Get assignments for a course
   */
  async getAssignmentsByCourseId(courseId: string): Promise<CourseAssignment[]> {
    const allAssignments = await this.getAllAssignments()
    return allAssignments.filter(a => a.courseId === courseId)
  }

  /**
   * Assign course to a user
   */
  async assignCourseToUser(courseId: string, userId: string, assignedBy: string, dueDate?: number): Promise<CourseAssignment> {
    return await this.createAssignment({
      courseId,
      userId,
      assignedBy,
      dueDate,
    })
  }

  /**
   * Assign course to a group
   */
  async assignCourseToGroup(courseId: string, groupId: string, assignedBy: string, dueDate?: number): Promise<CourseAssignment> {
    return await this.createAssignment({
      courseId,
      groupId,
      assignedBy,
      dueDate,
    })
  }

  /**
   * Check if a course is assigned to a user (directly or through a group)
   */
  async isCourseAssignedToUser(courseId: string, userId: string): Promise<boolean> {
    // Check direct assignments
    const userAssignments = await this.getAssignmentsByUserId(userId)
    if (userAssignments.some(a => a.courseId === courseId)) {
      return true
    }

    // Check group assignments
    const userGroups = await this.getGroupsByUserId(userId)
    for (const group of userGroups) {
      const groupAssignments = await this.getAssignmentsByGroupId(group.id)
      if (groupAssignments.some(a => a.courseId === courseId)) {
        return true
      }
    }

    return false
  }
}

// Export singleton instance
export const GroupService = new GroupServiceClass()
