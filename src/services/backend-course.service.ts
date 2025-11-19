/**
 * Backend Course Adapter
 * 
 * Adapts backend API responses to match the frontend CourseStructure interface.
 * This allows gradual migration from localStorage/KV to real backend API.
 */

import { ApiService } from './api.service'
import { CourseStructure } from '@/lib/types'

interface BackendCourse {
  id: string
  tenantId: string
  title: string
  description: string
  instructor: string
  status: 'draft' | 'active' | 'archived'
  startDate?: string
  duration?: number
  level?: 'beginner' | 'intermediate' | 'advanced'
}

class BackendCourseServiceClass {
  private tenantId: string = 'tenant-demo' // Default tenant

  setTenant(tenantId: string) {
    this.tenantId = tenantId
  }

  /**
   * Convert backend course to frontend CourseStructure
   */
  private adaptCourse(backendCourse: BackendCourse): CourseStructure {
    // Map backend level to frontend difficulty
    const difficultyMap: Record<string, 'Novice' | 'Specialist' | 'Master'> = {
      'beginner': 'Novice',
      'intermediate': 'Specialist',
      'advanced': 'Master'
    }
    
    return {
      id: backendCourse.id,
      title: backendCourse.title,
      description: backendCourse.description,
      category: 'General', // TODO: Add category to backend
      difficulty: difficultyMap[backendCourse.level || 'beginner'],
      modules: [], // TODO: Add modules support
      estimatedHours: backendCourse.duration || 4,
      totalXP: (backendCourse.duration || 4) * 100, // 100 XP per hour
      published: backendCourse.status === 'active',
      publishedAt: backendCourse.startDate ? new Date(backendCourse.startDate).getTime() : Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: backendCourse.instructor || 'system'
    }
  }

  async getAll(): Promise<CourseStructure[]> {
    try {
      const backendCourses = await ApiService.getCourses(this.tenantId)
      return backendCourses.map(c => this.adaptCourse(c))
    } catch (error) {
      console.error('❌ Error fetching courses from backend:', error)
      // Fallback to empty array
      return []
    }
  }

  async getById(courseId: string): Promise<CourseStructure | null> {
    try {
      const backendCourse = await ApiService.getCourseById(courseId, this.tenantId)
      return this.adaptCourse(backendCourse)
    } catch (error) {
      console.error(`❌ Error fetching course ${courseId}:`, error)
      return null
    }
  }

  async getPublished(): Promise<CourseStructure[]> {
    const courses = await this.getAll()
    return courses.filter(c => c.published)
  }

  async create(data: {
    title: string
    description: string
    instructor: string
    duration?: number
    level?: 'beginner' | 'intermediate' | 'advanced'
  }): Promise<CourseStructure> {
    const backendCourse = await ApiService.createCourse({
      tenantId: this.tenantId,
      ...data,
      status: 'draft'
    })
    return this.adaptCourse(backendCourse)
  }

  async update(courseId: string, updates: Partial<CourseStructure>): Promise<CourseStructure | null> {
    try {
      // Map frontend difficulty back to backend level
      let backendLevel: 'beginner' | 'intermediate' | 'advanced' | undefined
      if (updates.difficulty) {
        const levelMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
          'Novice': 'beginner',
          'Specialist': 'intermediate',
          'Master': 'advanced'
        }
        backendLevel = levelMap[updates.difficulty]
      }
      
      const backendCourse = await ApiService.updateCourse(courseId, this.tenantId, {
        title: updates.title,
        description: updates.description,
        duration: updates.estimatedHours,
        level: backendLevel,
        status: updates.published ? 'active' : 'draft'
      })
      return this.adaptCourse(backendCourse)
    } catch (error) {
      console.error(`❌ Error updating course ${courseId}:`, error)
      return null
    }
  }

  async delete(courseId: string): Promise<boolean> {
    try {
      await ApiService.deleteCourse(courseId, this.tenantId)
      return true
    } catch (error) {
      console.error(`❌ Error deleting course ${courseId}:`, error)
      return false
    }
  }
}

export const BackendCourseService = new BackendCourseServiceClass()
