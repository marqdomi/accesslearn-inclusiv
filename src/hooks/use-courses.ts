import { useState, useEffect } from 'react'
import { CourseService, type CourseStructure } from '@/services'

/**
 * Hook to fetch all courses
 */
export function useCourses() {
  const [courses, setCourses] = useState<CourseStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await CourseService.getAll()
      setCourses(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return { courses, loading, error, refresh }
}

/**
 * Hook to fetch a single course by ID
 */
export function useCourse(courseId: string | undefined) {
  const [course, setCourse] = useState<CourseStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = async () => {
    if (!courseId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await CourseService.getById(courseId)
      setCourse(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [courseId])

  return { course, loading, error, refresh }
}

/**
 * Hook to fetch published courses
 */
export function usePublishedCourses() {
  const [courses, setCourses] = useState<CourseStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await CourseService.getPublished()
      setCourses(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return { courses, loading, error, refresh }
}

/**
 * Hook with course mutation operations
 */
export function useCourseActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createCourse = async (courseData: Omit<CourseStructure, 'id'>) => {
    try {
      setLoading(true)
      setError(null)
      const newCourse = await CourseService.create(courseData)
      return newCourse
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateCourse = async (id: string, courseData: Partial<Omit<CourseStructure, 'id'>>) => {
    try {
      setLoading(true)
      setError(null)
      const updated = await CourseService.update(id, courseData)
      return updated
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteCourse = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await CourseService.delete(id)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const publishCourse = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await CourseService.publish(id)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const unpublishCourse = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await CourseService.unpublish(id)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    unpublishCourse,
    loading,
    error,
  }
}
