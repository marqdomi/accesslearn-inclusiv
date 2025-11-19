/**
 * Backend Courses Hook
 * 
 * Uses real backend API instead of localStorage/KV.
 * Drop-in replacement for use-courses hook.
 */

import { useState, useEffect } from 'react'
import { BackendCourseService } from '@/services/backend-course.service'
import { useTenant } from '@/contexts/TenantContext'
import type { CourseStructure } from '@/lib/types'

/**
 * Hook to fetch all courses from backend
 */
export function useBackendCourses() {
  const { currentTenant } = useTenant()
  const [courses, setCourses] = useState<CourseStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = async () => {
    if (!currentTenant) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Set tenant context for API calls
      BackendCourseService.setTenant(currentTenant.id)
      
      const data = await BackendCourseService.getAll()
      setCourses(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [currentTenant?.id])

  return { courses, loading, error, refresh }
}

/**
 * Hook to fetch a single course by ID from backend
 */
export function useBackendCourse(courseId: string | undefined) {
  const { currentTenant } = useTenant()
  const [course, setCourse] = useState<CourseStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = async () => {
    if (!courseId || !currentTenant) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      BackendCourseService.setTenant(currentTenant.id)
      
      const data = await BackendCourseService.getById(courseId)
      setCourse(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [courseId, currentTenant?.id])

  return { course, loading, error, refresh }
}

/**
 * Hook to fetch published courses only
 */
export function usePublishedCourses() {
  const { currentTenant } = useTenant()
  const [courses, setCourses] = useState<CourseStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = async () => {
    if (!currentTenant) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      BackendCourseService.setTenant(currentTenant.id)
      
      const data = await BackendCourseService.getPublished()
      setCourses(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [currentTenant?.id])

  return { courses, loading, error, refresh }
}
