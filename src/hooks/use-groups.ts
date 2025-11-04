import { useState, useEffect } from 'react'
import { GroupService, type UserGroup, type CourseAssignment } from '@/services'

/**
 * Hook to fetch all user groups
 */
export function useGroups() {
  const [groups, setGroups] = useState<UserGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await GroupService.getAllGroups()
      setGroups(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return { groups, loading, error, refresh }
}

/**
 * Hook with group mutation operations
 */
export function useGroupActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createGroup = async (groupData: Omit<UserGroup, 'id'>) => {
    try {
      setLoading(true)
      setError(null)
      const newGroup = await GroupService.createGroup(groupData)
      return newGroup
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateGroup = async (id: string, groupData: Partial<Omit<UserGroup, 'id'>>) => {
    try {
      setLoading(true)
      setError(null)
      const updated = await GroupService.updateGroup(id, groupData)
      return updated
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteGroup = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await GroupService.deleteGroup(id)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const addUsersToGroup = async (groupId: string, userIds: string[]) => {
    try {
      setLoading(true)
      setError(null)
      const updated = await GroupService.addUsersToGroup(groupId, userIds)
      return updated
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const removeUsersFromGroup = async (groupId: string, userIds: string[]) => {
    try {
      setLoading(true)
      setError(null)
      const updated = await GroupService.removeUsersFromGroup(groupId, userIds)
      return updated
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createGroup,
    updateGroup,
    deleteGroup,
    addUsersToGroup,
    removeUsersFromGroup,
    loading,
    error,
  }
}

/**
 * Hook for course assignments
 */
export function useAssignments() {
  const [assignments, setAssignments] = useState<CourseAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await GroupService.getAllAssignments()
      setAssignments(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const createAssignment = async (assignmentData: Omit<CourseAssignment, 'id'>) => {
    try {
      const newAssignment = await GroupService.createAssignment(assignmentData)
      await refresh()
      return newAssignment
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const deleteAssignment = async (id: string) => {
    try {
      await GroupService.deleteAssignment(id)
      await refresh()
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const assignCourseToUser = async (courseId: string, userId: string, assignedBy: string, dueDate?: number) => {
    try {
      const assignment = await GroupService.assignCourseToUser(courseId, userId, assignedBy, dueDate)
      await refresh()
      return assignment
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const assignCourseToGroup = async (courseId: string, groupId: string, assignedBy: string, dueDate?: number) => {
    try {
      const assignment = await GroupService.assignCourseToGroup(courseId, groupId, assignedBy, dueDate)
      await refresh()
      return assignment
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  return {
    assignments,
    loading,
    error,
    refresh,
    createAssignment,
    deleteAssignment,
    assignCourseToUser,
    assignCourseToGroup,
  }
}
