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
      const backendCourse = await ApiService.getCourseById(courseId)
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

  async getByCategory(category: string): Promise<CourseStructure[]> {
    const courses = await this.getAll()
    return courses.filter(c => c.category === category)
  }

  async search(query: string): Promise<CourseStructure[]> {
    const courses = await this.getAll()
    const q = query.toLowerCase()
    return courses.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    )
  }

  async publish(courseId: string): Promise<CourseStructure | null> {
    return this.update(courseId, { published: true })
  }

  async unpublish(courseId: string): Promise<CourseStructure | null> {
    return this.update(courseId, { published: false })
  }

  async create(data: {
    title: string
    description: string
    instructor?: string
    duration?: number
    level?: 'beginner' | 'intermediate' | 'advanced'
  }): Promise<CourseStructure> {
    const backendCourse = await ApiService.createCourse({
      title: data.title,
      description: data.description,
      category: 'General',
      estimatedTime: data.duration ? data.duration * 60 : 60,
    })
    return this.adaptCourse(backendCourse)
  }

  async update(courseId: string, updates: Partial<CourseStructure>): Promise<CourseStructure | null> {
    try {
      const backendCourse = await ApiService.updateCourse(courseId, {
        title: updates.title,
        description: updates.description,
        estimatedTime: updates.estimatedHours ? updates.estimatedHours * 60 : undefined,
        status: updates.published !== undefined
          ? (updates.published ? 'published' : 'draft')
          : undefined,
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
