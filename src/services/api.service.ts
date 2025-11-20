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
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add JWT token for authenticated requests
    if (includeAuth) {
      const token = localStorage.getItem('auth-token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

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

  private async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.fetch<T>(endpoint, options, true)
  }

  private async fetchWithoutAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.fetch<T>(endpoint, options, false)
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
    return this.fetchWithoutAuth<{
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

  // ========================================
  // Mentorship APIs
  // ========================================

  /**
   * Crear una solicitud de mentoría
   */
  async createMentorshipRequest(
    tenantId: string,
    menteeId: string,
    menteeName: string,
    menteeEmail: string,
    mentorId: string,
    mentorName: string,
    mentorEmail: string,
    topic: string,
    message: string,
    preferredDate?: number
  ) {
    return this.fetchWithAuth<any>(`/mentorship/requests`, {
      method: 'POST',
      body: JSON.stringify({
        tenantId,
        menteeId,
        menteeName,
        menteeEmail,
        mentorId,
        mentorName,
        mentorEmail,
        topic,
        message,
        preferredDate
      })
    })
  }

  /**
   * Obtener solicitudes pendientes de un mentor
   */
  async getMentorPendingRequests(tenantId: string, mentorId: string) {
    return this.fetchWithAuth<any[]>(
      `/mentorship/requests?tenantId=${tenantId}&mentorId=${mentorId}&status=pending`
    )
  }

  /**
   * Obtener todas las solicitudes de un mentee (estudiante)
   */
  async getMenteeRequests(tenantId: string, menteeId: string) {
    return this.fetchWithAuth<any[]>(
      `/mentorship/my-requests?tenantId=${tenantId}&menteeId=${menteeId}`
    )
  }

  /**
   * Aceptar una solicitud de mentoría
   */
  async acceptMentorshipRequest(
    requestId: string,
    tenantId: string,
    scheduledDate: number,
    duration: number = 60
  ) {
    return this.fetchWithAuth<any>(`/mentorship/requests/${requestId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ tenantId, scheduledDate, duration })
    })
  }

  /**
   * Rechazar una solicitud de mentoría
   */
  async rejectMentorshipRequest(requestId: string, tenantId: string) {
    return this.fetchWithAuth<any>(`/mentorship/requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ tenantId })
    })
  }

  /**
   * Obtener sesiones de un mentor
   */
  async getMentorSessions(
    tenantId: string,
    mentorId: string,
    status?: string
  ) {
    let url = `/mentorship/sessions?tenantId=${tenantId}&mentorId=${mentorId}`
    if (status) url += `&status=${status}`
    return this.fetchWithAuth<any[]>(url)
  }

  /**
   * Obtener sesiones de un aprendiz
   */
  async getMenteeSessions(
    tenantId: string,
    menteeId: string,
    status?: string
  ) {
    let url = `/mentorship/sessions?tenantId=${tenantId}&menteeId=${menteeId}`
    if (status) url += `&status=${status}`
    return this.fetchWithAuth<any[]>(url)
  }

  /**
   * Completar una sesión
   */
  async completeMentorshipSession(
    sessionId: string,
    tenantId: string,
    notes?: string
  ) {
    return this.fetchWithAuth<any>(`/mentorship/sessions/${sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ tenantId, notes })
    })
  }

  /**
   * Calificar una sesión
   */
  async rateMentorshipSession(
    sessionId: string,
    tenantId: string,
    rating: number,
    feedback?: string
  ) {
    return this.fetchWithAuth<any>(`/mentorship/sessions/${sessionId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ tenantId, rating, feedback })
    })
  }

  /**
   * Obtener mentores disponibles
   */
  async getAvailableMentors(tenantId: string) {
    return this.fetchWithAuth<any[]>(`/mentorship/mentors?tenantId=${tenantId}`)
  }

  /**
   * Obtener estadísticas de un mentor
   */
  async getMentorStats(tenantId: string, mentorId: string) {
    return this.fetchWithAuth<any>(
      `/mentorship/mentors/${mentorId}/stats?tenantId=${tenantId}`
    )
  }

  // ==========================================
  // LIBRARY / COURSE RETAKES
  // ==========================================

  /**
   * Obtener biblioteca de cursos del usuario
   */
  async getUserLibrary(userId: string, tenantId: string) {
    return this.fetchWithAuth<any[]>(`/library/${userId}?tenantId=${tenantId}`)
  }

  /**
   * Obtener historial de intentos de un curso
   */
  async getCourseAttempts(userId: string, courseId: string, tenantId: string) {
    return this.fetchWithAuth<any[]>(
      `/courses/${courseId}/attempts/${userId}?tenantId=${tenantId}`
    )
  }

  /**
   * Iniciar un nuevo intento de curso
   */
  async startCourseRetake(userId: string, courseId: string, tenantId: string) {
    return this.fetchWithAuth<any>(`/courses/${courseId}/retake`, {
      method: 'POST',
      body: JSON.stringify({ userId, tenantId })
    })
  }

  /**
   * Completar un intento de curso
   */
  async completeCourseAttempt(
    userId: string,
    courseId: string,
    tenantId: string,
    finalScore: number,
    completedLessons: string[],
    quizScores: { quizId: string; score: number; completedAt: string }[]
  ) {
    return this.fetchWithAuth<any>(`/courses/${courseId}/complete-attempt`, {
      method: 'POST',
      body: JSON.stringify({
        userId,
        tenantId,
        finalScore,
        completedLessons,
        quizScores
      })
    })
  }
}

export const ApiService = new ApiServiceClass()
