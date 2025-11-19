/**
 * Course Service
 * 
 * Manages all course-related data with referential integrity
 */

import { BaseService } from './base-service'
import { CourseStructure } from '@/lib/types'

class CourseServiceClass extends BaseService<CourseStructure> {
  constructor() {
    super('courses')
  }

  /**
   * Get published courses only
   */
  async getPublished(): Promise<CourseStructure[]> {
    return this.find(course => course.published === true)
  }

  /**
   * Get courses by category
   */
  async getByCategory(category: string): Promise<CourseStructure[]> {
    return this.find(course => course.category === category)
  }

  /**
   * Get courses by creator
   */
  async getByCreator(creatorId: string): Promise<CourseStructure[]> {
    return this.find(course => course.createdBy === creatorId)
  }

  /**
   * Publish a course
   */
  async publish(courseId: string): Promise<CourseStructure | null> {
    return this.update(courseId, {
      published: true,
      publishedAt: Date.now(),
      updatedAt: Date.now()
    } as Partial<CourseStructure>)
  }

  /**
   * Unpublish a course
   */
  async unpublish(courseId: string): Promise<CourseStructure | null> {
    return this.update(courseId, {
      published: false,
      updatedAt: Date.now()
    } as Partial<CourseStructure>)
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    const courses = await this.getAll()
    const categories = new Set(courses.map(c => c.category))
    return Array.from(categories).sort()
  }

  /**
   * Search courses by title or description
   */
  async search(query: string): Promise<CourseStructure[]> {
    const lowerQuery = query.toLowerCase()
    return this.find(course =>
      course.title.toLowerCase().includes(lowerQuery) ||
      course.description.toLowerCase().includes(lowerQuery)
    )
  }
}

// Export singleton instance
export const CourseService = new CourseServiceClass()
