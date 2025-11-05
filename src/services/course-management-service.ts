/**
 * Course Management Service
 * Gestión completa de cursos con estados y estructura modular
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export type CourseStatus = 'draft' | 'published' | 'archived'
export type CourseVisibility = 'public' | 'private' | 'restricted'
export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface CourseLesson {
  id: string
  moduleId: string
  title: string
  description?: string
  type: 'video' | 'text' | 'quiz' | 'interactive' | 'exercise'
  content?: any
  duration?: number
  order: number
  xpReward?: number
  isOptional?: boolean
  createdAt: number
  updatedAt: number
}

export interface CourseModule {
  id: string
  courseId: string
  title: string
  description?: string
  order: number
  lessons?: CourseLesson[]
  createdAt: number
  updatedAt: number
}

export interface Course {
  id: string
  title: string
  description: string
  category: string
  difficulty: CourseDifficulty
  estimatedHours: number
  status: CourseStatus
  visibility: CourseVisibility
  thumbnail?: string
  banner?: string
  tags?: string[]
  objectives?: string[]
  prerequisites?: string[]
  targetAudience?: string
  instructor?: string
  createdAt: number
  updatedAt: number
  publishedAt: number | null
  archivedAt?: number | null
  moduleCount?: number
  lessonCount?: number
  totalXP?: number
  lastEditedAt?: number
}

export interface CourseWithStructure extends Course {
  modules: CourseModule[]
}

export interface CreateCoursePayload {
  title: string
  description?: string
  category?: string
  difficulty?: CourseDifficulty
  estimatedHours?: number
  thumbnail?: string
  tags?: string[]
  objectives?: string[]
  prerequisites?: string[]
  targetAudience?: string
  instructor?: string
}

export interface UpdateCoursePayload {
  title?: string
  description?: string
  category?: string
  difficulty?: CourseDifficulty
  estimatedHours?: number
  thumbnail?: string
  banner?: string
  tags?: string[]
  objectives?: string[]
  prerequisites?: string[]
  targetAudience?: string
  instructor?: string
}

export interface CourseStats {
  total: number
  published: number
  draft: number
  archived: number
  byCategory: Record<string, number>
  byDifficulty: Record<CourseDifficulty, number>
}

export class CourseManagementService {
  /**
   * Obtener todos los cursos con información resumida
   */
  static async getAllCourses(): Promise<Course[]> {
    try {
      const response = await fetch(`${API_BASE}/api/courses/all`)
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.statusText}`)
      }
      const { data } = await response.json()
      return data || []
    } catch (error) {
      console.error('CourseManagementService.getAllCourses failed:', error)
      throw error
    }
  }

  /**
   * Obtener un curso específico con toda su estructura
   */
  static async getCourseWithStructure(courseId: string): Promise<CourseWithStructure | null> {
    try {
      const response = await fetch(`${API_BASE}/api/courses/${courseId}/full`)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Failed to fetch course: ${response.statusText}`)
      }
      const { data } = await response.json()
      return data
    } catch (error) {
      console.error('CourseManagementService.getCourseWithStructure failed:', error)
      throw error
    }
  }

  /**
   * Crear un nuevo curso
   */
  static async createCourse(payload: CreateCoursePayload): Promise<Course> {
    try {
      const response = await fetch(`${API_BASE}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to create course: ${response.statusText}`)
      }
      
      const { data } = await response.json()
      return data
    } catch (error) {
      console.error('CourseManagementService.createCourse failed:', error)
      throw error
    }
  }

  /**
   * Actualizar un curso
   */
  static async updateCourse(courseId: string, payload: UpdateCoursePayload): Promise<Course> {
    try {
      const response = await fetch(`${API_BASE}/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to update course: ${response.statusText}`)
      }
      
      const { data } = await response.json()
      return data
    } catch (error) {
      console.error('CourseManagementService.updateCourse failed:', error)
      throw error
    }
  }

  /**
   * Publicar un curso
   */
  static async publishCourse(courseId: string): Promise<Course> {
    try {
      const response = await fetch(`${API_BASE}/api/courses/${courseId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to publish course: ${response.statusText}`)
      }
      
      const { data } = await response.json()
      return data
    } catch (error) {
      console.error('CourseManagementService.publishCourse failed:', error)
      throw error
    }
  }

  /**
   * Despublicar un curso
   */
  static async unpublishCourse(courseId: string): Promise<Course> {
    try {
      const response = await fetch(`${API_BASE}/api/courses/${courseId}/unpublish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to unpublish course: ${response.statusText}`)
      }
      
      const { data } = await response.json()
      return data
    } catch (error) {
      console.error('CourseManagementService.unpublishCourse failed:', error)
      throw error
    }
  }

  /**
   * Archivar un curso
   */
  static async archiveCourse(courseId: string): Promise<Course> {
    try {
      const response = await fetch(`${API_BASE}/api/courses/${courseId}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to archive course: ${response.statusText}`)
      }
      
      const { data } = await response.json()
      return data
    } catch (error) {
      console.error('CourseManagementService.archiveCourse failed:', error)
      throw error
    }
  }

  /**
   * Duplicar un curso
   */
  static async duplicateCourse(courseId: string): Promise<Course> {
    try {
      const response = await fetch(`${API_BASE}/api/courses/${courseId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to duplicate course: ${response.statusText}`)
      }
      
      const { data } = await response.json()
      return data
    } catch (error) {
      console.error('CourseManagementService.duplicateCourse failed:', error)
      throw error
    }
  }

  /**
   * Eliminar un curso
   */
  static async deleteCourse(courseId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/api/courses/${courseId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to delete course: ${response.statusText}`)
      }
    } catch (error) {
      console.error('CourseManagementService.deleteCourse failed:', error)
      throw error
    }
  }

  /**
   * Obtener cursos por estado
   */
  static async getCoursesByStatus(status: CourseStatus): Promise<Course[]> {
    const all = await this.getAllCourses()
    return all.filter(c => c.status === status)
  }

  /**
   * Obtener cursos publicados
   */
  static async getPublishedCourses(): Promise<Course[]> {
    return this.getCoursesByStatus('published')
  }

  /**
   * Obtener borradores
   */
  static async getDraftCourses(): Promise<Course[]> {
    return this.getCoursesByStatus('draft')
  }

  /**
   * Obtener cursos archivados
   */
  static async getArchivedCourses(): Promise<Course[]> {
    return this.getCoursesByStatus('archived')
  }

  /**
   * Buscar cursos por texto
   */
  static async searchCourses(query: string): Promise<Course[]> {
    const all = await this.getAllCourses()
    const lowerQuery = query.toLowerCase()
    
    return all.filter(course =>
      course.title.toLowerCase().includes(lowerQuery) ||
      course.description?.toLowerCase().includes(lowerQuery) ||
      course.category?.toLowerCase().includes(lowerQuery) ||
      course.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Filtrar cursos por categoría
   */
  static async getCoursesByCategory(category: string): Promise<Course[]> {
    const all = await this.getAllCourses()
    return all.filter(c => c.category === category)
  }

  /**
   * Filtrar cursos por dificultad
   */
  static async getCoursesByDifficulty(difficulty: CourseDifficulty): Promise<Course[]> {
    const all = await this.getAllCourses()
    return all.filter(c => c.difficulty === difficulty)
  }

  /**
   * Obtener estadísticas de cursos
   */
  static async getCourseStats(): Promise<CourseStats> {
    const all = await this.getAllCourses()
    
    const stats: CourseStats = {
      total: all.length,
      published: all.filter(c => c.status === 'published').length,
      draft: all.filter(c => c.status === 'draft').length,
      archived: all.filter(c => c.status === 'archived').length,
      byCategory: {},
      byDifficulty: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
        expert: 0
      }
    }
    
    all.forEach(course => {
      // Por categoría
      if (course.category) {
        stats.byCategory[course.category] = (stats.byCategory[course.category] || 0) + 1
      }
      
      // Por dificultad
      if (course.difficulty) {
        stats.byDifficulty[course.difficulty]++
      }
    })
    
    return stats
  }

  /**
   * Obtener categorías únicas
   */
  static async getCategories(): Promise<string[]> {
    const all = await this.getAllCourses()
    const categories = new Set(all.map(c => c.category).filter(Boolean))
    return Array.from(categories).sort()
  }

  /**
   * Validar si un curso puede ser publicado
   */
  static async canPublish(courseId: string): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const course = await this.getCourseWithStructure(courseId)
      if (!course) {
        return { valid: false, errors: ['Course not found'] }
      }
      
      const errors: string[] = []
      
      if (!course.title?.trim()) {
        errors.push('Course title is required')
      }
      
      if (!course.description?.trim()) {
        errors.push('Course description is required')
      }
      
      if (!course.modules || course.modules.length === 0) {
        errors.push('Course must have at least one module')
      } else {
        const hasLessons = course.modules.some(m => m.lessons && m.lessons.length > 0)
        if (!hasLessons) {
          errors.push('Course must have at least one lesson')
        }
      }
      
      if (!course.category) {
        errors.push('Course category is required')
      }
      
      if (!course.difficulty) {
        errors.push('Course difficulty level is required')
      }
      
      return {
        valid: errors.length === 0,
        errors
      }
    } catch (error) {
      return { valid: false, errors: ['Failed to validate course'] }
    }
  }
}
