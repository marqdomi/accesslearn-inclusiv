/**
 * API Service - Backend Communication Layer
 * 
 * Centralized service for all backend API calls to Azure Functions + Cosmos DB.
 * Handles authentication, error handling, and response parsing.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

interface ApiError {
  message: string
  status: number
  code?: string
}

class ApiServiceClass {
  private async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // TODO: Add JWT token when authentication is implemented
    // const token = localStorage.getItem('auth-token')
    // if (token) {
    //   headers['Authorization'] = `Bearer ${token}`
    // }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: errorData.code,
        } as ApiError
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T
      }

      return await response.json()
    } catch (error) {
      if ((error as ApiError).status) {
        throw error // Re-throw API errors
      }
      
      // Network or other errors
      throw {
        message: error instanceof Error ? error.message : 'Network error',
        status: 0,
      } as ApiError
    }
  }

  // ============================================
  // TENANT APIs
  // ============================================

  async getTenantBySlug(slug: string) {
    return this.fetchWithAuth<any>(`/tenants/slug/${slug}`)
  }

  async getTenantById(tenantId: string) {
    return this.fetchWithAuth<any>(`/tenants/${tenantId}`)
  }

  async listTenants() {
    return this.fetchWithAuth<any[]>(`/tenants`)
  }

  async createTenant(data: {
    name: string
    slug: string
    contactEmail: string
    contactPhone?: string
    plan: 'demo' | 'profesional' | 'enterprise'
    rfc?: string
    businessName?: string
    address?: string
    primaryColor?: string
    secondaryColor?: string
  }) {
    return this.fetchWithAuth<any>(`/tenants`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ============================================
  // USER APIs
  // ============================================

  async createUser(data: {
    tenantId: string
    email: string
    firstName: string
    lastName: string
    role: 'admin' | 'mentor' | 'student'
    curp?: string
    rfc?: string
    nss?: string
    phone?: string
    dateOfBirth?: string
  }) {
    return this.fetchWithAuth<any>(`/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getUserById(userId: string, tenantId: string) {
    return this.fetchWithAuth<any>(`/users/${userId}?tenantId=${tenantId}`)
  }

  async getUsersByTenant(tenantId: string, role?: string) {
    const roleParam = role ? `&role=${role}` : ''
    return this.fetchWithAuth<any[]>(`/users?tenantId=${tenantId}${roleParam}`)
  }

  async updateUser(userId: string, tenantId: string, updates: {
    firstName?: string
    lastName?: string
    phone?: string
    status?: 'active' | 'inactive' | 'suspended'
  }) {
    return this.fetchWithAuth<any>(`/users/${userId}?tenantId=${tenantId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async enrollUserInCourse(userId: string, tenantId: string, courseId: string) {
    return this.fetchWithAuth<any>(`/users/${userId}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ tenantId, courseId }),
    })
  }

  async completeCourse(userId: string, tenantId: string, courseId: string) {
    return this.fetchWithAuth<any>(`/users/${userId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ tenantId, courseId }),
    })
  }

  async getTenantUserStats(tenantId: string) {
    return this.fetchWithAuth<{
      totalUsers: number
      activeUsers: number
      mentors: number
      students: number
      admins: number
      averageXP: number
      totalEnrollments: number
      totalCompletions: number
    }>(`/users/stats?tenantId=${tenantId}`)
  }

  // ============================================
  // COURSE APIs
  // ============================================

  async getCourses(tenantId: string) {
    return this.fetchWithAuth<any[]>(`/courses/tenant/${tenantId}`)
  }

  async getCourseById(courseId: string) {
    return this.fetchWithAuth<any>(`/courses/${courseId}`)
  }

  async createCourse(data: {
    tenantId: string
    title: string
    description: string
    instructor: string
    duration?: number
    level?: 'beginner' | 'intermediate' | 'advanced'
    status?: 'draft' | 'active' | 'archived'
  }) {
    return this.fetchWithAuth<any>(`/courses`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCourse(courseId: string, tenantId: string, updates: any) {
    return this.fetchWithAuth<any>(`/courses/${courseId}?tenantId=${tenantId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async deleteCourse(courseId: string, tenantId: string) {
    return this.fetchWithAuth<void>(`/courses/${courseId}?tenantId=${tenantId}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // PROGRESS APIs
  // ============================================

  async completeLesson(userId: string, lessonId: string, data: {
    courseId: string
    moduleId: string
    xpEarned: number
  }) {
    return this.fetchWithAuth<{
      success: boolean
      progress: {
        completedLessons: string[]
        lastAccessedAt: string
        xpEarned: number
      }
      totalXp: number
    }>(`/users/${userId}/progress/lessons/${lessonId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getCourseProgress(userId: string, courseId: string) {
    return this.fetchWithAuth<{
      completedLessons: string[]
      lastAccessedAt: string | null
      xpEarned: number
    }>(`/users/${userId}/progress/${courseId}`)
  }

  // ============================================
  // AUTHENTICATION
  // ============================================

  async login(email: string, password: string, tenantId: string) {
    return this.fetchWithAuth<{
      success: boolean
      user?: {
        id: string
        email: string
        firstName: string
        lastName: string
        role: string
        tenantId: string
      }
      token?: string
      error?: string
    }>(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password, tenantId }),
    })
  }

  async logout() {
    // Clear local auth state
    localStorage.removeItem('auth-token')
    localStorage.removeItem('current-user')
  }

  async getCurrentUser() {
    return this.fetchWithAuth<any>(`/auth/me`)
  }
}

export const ApiService = new ApiServiceClass()
