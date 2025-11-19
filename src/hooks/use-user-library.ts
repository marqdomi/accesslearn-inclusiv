import { useState } from 'react'
import { UserLibrary, EnrollmentRequest } from '@/lib/types'

export function useUserLibrary(userId: string) {
  const [library, setLibrary] = useState<UserLibrary>({ 
    userId, 
    courseIds: [], 
    addedAt: {} 
  })
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>(
    []
  )

  const isInLibrary = (courseId: string) => {
    return library?.courseIds.includes(courseId) || false
  }

  const addToLibrary = (courseId: string) => {
    setLibrary((current) => {
      if (!current) {
        return {
          userId,
          courseIds: [courseId],
          addedAt: { [courseId]: Date.now() }
        }
      }
      
      if (current.courseIds.includes(courseId)) {
        return current
      }

      return {
        ...current,
        courseIds: [...current.courseIds, courseId],
        addedAt: {
          ...current.addedAt,
          [courseId]: Date.now()
        }
      }
    })
  }

  const removeFromLibrary = (courseId: string) => {
    setLibrary((current) => {
      if (!current) {
        return {
          userId,
          courseIds: [],
          addedAt: {}
        }
      }

      const newAddedAt = { ...current.addedAt }
      delete newAddedAt[courseId]

      return {
        ...current,
        courseIds: current.courseIds.filter(id => id !== courseId),
        addedAt: newAddedAt
      }
    })
  }

  const requestAccess = (courseId: string) => {
    setEnrollmentRequests((current) => {
      const newRequest: EnrollmentRequest = {
        id: `req-${userId}-${courseId}-${Date.now()}`,
        userId,
        courseId,
        requestedAt: Date.now(),
        status: 'pending'
      }
      return [...(current || []), newRequest]
    })
  }

  const hasRequestedAccess = (courseId: string) => {
    return enrollmentRequests?.some(
      req => req.userId === userId && req.courseId === courseId && req.status === 'pending'
    ) || false
  }

  const getUserRequests = () => {
    return enrollmentRequests?.filter(req => req.userId === userId) || []
  }

  return {
    library,
    isInLibrary,
    addToLibrary,
    removeFromLibrary,
    requestAccess,
    hasRequestedAccess,
    getUserRequests
  }
}
