import { useState, useEffect } from 'react'
import { GroupService } from '@/services'
import type { UserGroup, CourseAssignment } from '@/lib/types'

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
      const data = await GroupService.getAll()
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
      const newGroup = await GroupService.create({ ...groupData, id: `group-${Date.now()}` } as UserGroup)
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
      const updated = await GroupService.update(id, groupData)
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
      await GroupService.delete(id)
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
      // Add each user individually
      let updated: UserGroup | null = null
      for (const userId of userIds) {
        updated = await GroupService.addUser(groupId, userId)
      }
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
      // Remove each user individually
      let updated: UserGroup | null = null
      for (const userId of userIds) {
        updated = await GroupService.removeUser(groupId, userId)
      }
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
 * Note: Uses localStorage since assignment service is not yet in the team-service layer.
 */
export function useAssignments() {
  const STORAGE_KEY = 'course-assignments'

  const loadAssignments = (): CourseAssignment[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) as CourseAssignment[] : []
    } catch {
      return []
    }
  }

  const saveAssignments = (assignments: CourseAssignment[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments))
    } catch (err) {
      console.warn('[useAssignments] Failed to persist assignments:', err)
    }
  }

  const [assignments, setAssignments] = useState<CourseAssignment[]>(() => loadAssignments())
  const [loading] = useState(false)
  const [error] = useState<Error | null>(null)

  const refresh = () => {
    setAssignments(loadAssignments())
  }

  const createAssignment = (assignmentData: Omit<CourseAssignment, 'id'>): CourseAssignment => {
    const newAssignment: CourseAssignment = { ...assignmentData, id: `assignment-${Date.now()}` }
    const updated = [...loadAssignments(), newAssignment]
    saveAssignments(updated)
    setAssignments(updated)
    return newAssignment
  }

  const deleteAssignment = (id: string): void => {
    const updated = loadAssignments().filter(a => a.id !== id)
    saveAssignments(updated)
    setAssignments(updated)
  }

  const assignCourseToUser = (courseId: string, userId: string, assignedBy: string, dueDate?: number): CourseAssignment => {
    return createAssignment({ courseId, userId, assignedBy, assignedAt: Date.now(), dueDate })
  }

  const assignCourseToGroup = (courseId: string, groupId: string, assignedBy: string, dueDate?: number): CourseAssignment => {
    return createAssignment({ courseId, groupId, assignedBy, assignedAt: Date.now(), dueDate })
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
