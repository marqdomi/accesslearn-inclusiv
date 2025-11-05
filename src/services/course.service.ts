import { DB } from '@github/spark/db'
import { CourseStructureSchema, type CourseStructure } from '@/schemas/course.schema'

const COLLECTION_NAME = 'courses'

/**
 * Course Service
 * Provides CRUD operations for courses using GitHub Spark's DB API
 */
class CourseServiceClass {
  private db: DB

  constructor() {
    this.db = new DB()
  }

  /**
   * Get all courses
   */
  async getAll(): Promise<CourseStructure[]> {
    return await this.db.getAll<Omit<CourseStructure, 'id'>>(COLLECTION_NAME)
  }

  /**
   * Get a course by ID
   */
  async getById(id: string): Promise<CourseStructure | null> {
    return await this.db.get<Omit<CourseStructure, 'id'>>(COLLECTION_NAME, id)
  }

  /**
   * Get published courses only
   */
  async getPublished(): Promise<CourseStructure[]> {
    const allCourses = await this.getAll()
    return allCourses.filter(course => course.published)
  }

  /**
   * Get courses by category
   */
  async getByCategory(category: string): Promise<CourseStructure[]> {
    const allCourses = await this.getAll()
    return allCourses.filter(course => course.category === category)
  }

  /**
   * Create a new course
   */
  async create(courseData: Omit<CourseStructure, 'id'>): Promise<CourseStructure> {
    const newCourse = await this.db.insert(
      COLLECTION_NAME,
      CourseStructureSchema.omit({ id: true }),
      {
        ...courseData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    )
    return newCourse
  }

  /**
   * Update an existing course
   */
  async update(id: string, courseData: Partial<Omit<CourseStructure, 'id'>>): Promise<CourseStructure | null> {
    const updated = await this.db.update(
      COLLECTION_NAME,
      id,
      CourseStructureSchema.omit({ id: true }),
      {
        ...courseData,
        updatedAt: Date.now(),
      }
    )
    return updated
  }

  /**
   * Delete a course
   */
  async delete(id: string): Promise<boolean> {
    return await this.db.delete(COLLECTION_NAME, id)
  }

  /**
   * Publish a course
   */
  async publish(id: string): Promise<CourseStructure | null> {
    return await this.update(id, { published: true })
  }

  /**
   * Unpublish a course
   */
  async unpublish(id: string): Promise<CourseStructure | null> {
    return await this.update(id, { published: false })
  }

  /**
   * Search courses by title or description
   */
  async search(query: string): Promise<CourseStructure[]> {
    const allCourses = await this.getAll()
    const lowerQuery = query.toLowerCase()
    return allCourses.filter(course =>
      course.title.toLowerCase().includes(lowerQuery) ||
      course.description.toLowerCase().includes(lowerQuery)
    )
  }
}

// Export singleton instance
export const CourseService = new CourseServiceClass()
