/**
 * Modern React Hook for Course Management
 * 
 * Uses the CourseService layer instead of direct KV access.
 * Provides proper data validation, referential integrity, and error handling.
 */

import { useState, useEffect, useCallback } from 'react'
import { CourseService } from '@/services'
import { CourseStructure } from '@/lib/types'

export interface UseCourseManagementResult {
  courses: CourseStructure[]
  loading: boolean
  error: Error | null
  
  // CRUD operations
  getCourse: (courseId: string) => Promise<CourseStructure | null>
  createCourse: (course: CourseStructure) => Promise<CourseStructure>
  updateCourse: (courseId: string, updates: Partial<CourseStructure>) => Promise<CourseStructure | null>
  deleteCourse: (courseId: string) => Promise<boolean>
  
  // Publishing operations
  publishCourse: (courseId: string) => Promise<CourseStructure | null>
  unpublishCourse: (courseId: string) => Promise<CourseStructure | null>
  
  // Query operations
  getPublishedCourses: () => Promise<CourseStructure[]>
  getCoursesByCategory: (category: string) => Promise<CourseStructure[]>
  searchCourses: (query: string) => Promise<CourseStructure[]>
  
  // Refresh data
  refresh: () => Promise<void>
}

export function useCourseManagement(): UseCourseManagementResult {
  const [courses, setCourses] = useState<CourseStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load courses on mount
  const loadCourses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await CourseService.getAll()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load courses'))
      console.error('Error loading courses:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  // Get a single course
  const getCourse = useCallback(async (courseId: string): Promise<CourseStructure | null> => {
    try {
      return await CourseService.getById(courseId)
    } catch (err) {
      console.error('Error getting course:', err)
      return null
    }
  }, [])

  // Create a new course
  const createCourse = useCallback(async (course: CourseStructure): Promise<CourseStructure> => {
    try {
      const created = await CourseService.create(course)
      setCourses(prev => [...prev, created])
      return created
    } catch (err) {
      console.error('Error creating course:', err)
      throw err
    }
  }, [])

  // Update a course
  const updateCourse = useCallback(async (
    courseId: string,
    updates: Partial<CourseStructure>
  ): Promise<CourseStructure | null> => {
    try {
      const updated = await CourseService.update(courseId, {
        ...updates,
        updatedAt: Date.now()
      })
      
      if (updated) {
        setCourses(prev => prev.map(c => c.id === courseId ? updated : c))
      }
      
      return updated
    } catch (err) {
      console.error('Error updating course:', err)
      throw err
    }
  }, [])

  // Delete a course
  const deleteCourse = useCallback(async (courseId: string): Promise<boolean> => {
    try {
      const deleted = await CourseService.delete(courseId)
      
      if (deleted) {
        setCourses(prev => prev.filter(c => c.id !== courseId))
      }
      
      return deleted
    } catch (err) {
      console.error('Error deleting course:', err)
      return false
    }
  }, [])

  // Publish a course
  const publishCourse = useCallback(async (courseId: string): Promise<CourseStructure | null> => {
    try {
      const published = await CourseService.publish(courseId)
      
      if (published) {
        setCourses(prev => prev.map(c => c.id === courseId ? published : c))
      }
      
      return published
    } catch (err) {
      console.error('Error publishing course:', err)
      throw err
    }
  }, [])

  // Unpublish a course
  const unpublishCourse = useCallback(async (courseId: string): Promise<CourseStructure | null> => {
    try {
      const unpublished = await CourseService.unpublish(courseId)
      
      if (unpublished) {
        setCourses(prev => prev.map(c => c.id === courseId ? unpublished : c))
      }
      
      return unpublished
    } catch (err) {
      console.error('Error unpublishing course:', err)
      throw err
    }
  }, [])

  // Get published courses
  const getPublishedCourses = useCallback(async (): Promise<CourseStructure[]> => {
    try {
      return await CourseService.getPublished()
    } catch (err) {
      console.error('Error getting published courses:', err)
      return []
    }
  }, [])

  // Get courses by category
  const getCoursesByCategory = useCallback(async (category: string): Promise<CourseStructure[]> => {
    try {
      return await CourseService.getByCategory(category)
    } catch (err) {
      console.error('Error getting courses by category:', err)
      return []
    }
  }, [])

  // Search courses
  const searchCourses = useCallback(async (query: string): Promise<CourseStructure[]> => {
    try {
      return await CourseService.search(query)
    } catch (err) {
      console.error('Error searching courses:', err)
      return []
    }
  }, [])

  // Refresh courses
  const refresh = useCallback(async () => {
    await loadCourses()
  }, [loadCourses])

  return {
    courses,
    loading,
    error,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
    unpublishCourse,
    getPublishedCourses,
    getCoursesByCategory,
    searchCourses,
    refresh
  }
}
