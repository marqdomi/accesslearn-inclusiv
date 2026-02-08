/**
 * Copyright (c) 2025 Marco Domínguez. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * This file contains proprietary and confidential information of Marco Domínguez.
 * Unauthorized copying, modification, distribution, or use of this file,
 * via any medium, is strictly prohibited without prior written permission.
 * 
 * API Service - Backend Communication Layer
 * 
 * Centralized service for all backend API calls to Azure Functions + Cosmos DB.
 * Handles authentication, error handling, and response parsing.
 */

// Get API URL from runtime config (injected by docker-entrypoint.sh) or build-time env vars
const getApiBaseUrl = (): string => {
  // First, try runtime config (from window.__APP_CONFIG__)
  if (typeof window !== 'undefined' && (window as any).__APP_CONFIG__) {
    const runtimeConfig = (window as any).__APP_CONFIG__
    if (runtimeConfig.VITE_API_URL) {
      return runtimeConfig.VITE_API_URL
    }
    if (runtimeConfig.VITE_API_BASE_URL) {
      return runtimeConfig.VITE_API_BASE_URL
    }
  }
  
  // Fallback to build-time environment variables
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`
  }
  
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // Final fallback (development)
  return 'http://localhost:3000/api'
}

const API_BASE_URL = getApiBaseUrl()

interface ApiError {
  message: string
  status: number
  code?: string
}

class ApiServiceClass {
  private isHandling401 = false

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
      } else {
        console.warn('[ApiService] No auth token found for authenticated request to:', endpoint)
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Handle 401 Unauthorized - Token expired or invalid
        if (response.status === 401 && includeAuth) {
          // Only handle 401 once to avoid infinite loops
          if (!this.isHandling401) {
            this.isHandling401 = true
            console.warn('[ApiService] 401 Unauthorized - Token expired or invalid. Logging out...')
            
            // Clear auth data
            localStorage.removeItem('auth-token')
            localStorage.removeItem('current-user')
            localStorage.removeItem('current-tenant-id')
            
            // Redirect to login after a short delay to allow error to propagate
            setTimeout(() => {
              // Only redirect if we're not already on login page
              if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?expired=true'
              }
            }, 100)
            
            this.isHandling401 = false
          }
        }
        
        throw {
          message: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
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
    return this.fetchWithoutAuth<any>(`/tenants/slug/${slug}`)
  }

  async getTenantById(tenantId: string) {
    return this.fetchWithAuth<any>(`/tenants/${tenantId}`)
  }

  async listTenants() {
    return this.fetchWithoutAuth<any[]>(`/tenants`)
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

  async updateTenant(tenantId: string, updates: {
    name?: string
    contactEmail?: string
    contactPhone?: string
    logo?: string
    primaryColor?: string
    secondaryColor?: string
    domain?: string
    rfc?: string
    businessName?: string
    address?: string
  }) {
    return this.fetchWithAuth<any>(`/tenants/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
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

  /**
   * Self-enrollment: allows students to enroll themselves in a course
   * This endpoint doesn't require enrollment:assign-individual permission
   */
  async enrollSelfInCourse(courseId: string, tenantId: string) {
    return this.fetchWithAuth<any>(`/courses/${courseId}/enroll-self`, {
      method: 'POST',
      body: JSON.stringify({ tenantId }),
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

  async updateUserFull(userId: string, tenantId: string, updates: any) {
    return this.fetchWithAuth<any>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ tenantId, ...updates }),
    })
  }

  // ============================================
  // PROFILE MANAGEMENT
  // ============================================

  /**
   * Update user profile (firstName, lastName, phone, avatar, etc.)
   */
  async updateProfile(userId: string, tenantId: string, profileData: {
    firstName?: string
    lastName?: string
    phone?: string
    dateOfBirth?: string
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
    avatar?: string // Base64 string or URL
    address?: {
      street?: string
      city?: string
      state?: string
      zipCode?: string
      country?: string
    }
  }) {
    return this.fetchWithAuth<any>(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify({ tenantId, ...profileData }),
    })
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, tenantId: string, currentPassword: string, newPassword: string) {
    return this.fetchWithAuth<{
      success: boolean
      message: string
      user: {
        id: string
        email: string
        firstName: string
        lastName: string
      }
    }>(`/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ tenantId, currentPassword, newPassword }),
    })
  }

  /**
   * Get current user profile
   */
  async getCurrentUserProfile(userId: string, tenantId: string) {
    return this.fetchWithAuth<any>(`/users/${userId}?tenantId=${tenantId}`)
  }

  async deleteUser(userId: string, tenantId: string) {
    return this.fetchWithAuth<void>(`/users/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ tenantId }),
    })
  }

  async inviteUser(data: {
    tenantId: string
    email: string
    firstName: string
    lastName: string
    role: string
  }) {
    return this.fetchWithAuth<{
      user: any
      invitationUrl: string
    }>(`/users/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async acceptInvitation(invitationToken: string, password: string) {
    return this.fetchWithoutAuth<any>(`/users/accept-invitation`, {
      method: 'POST',
      body: JSON.stringify({ invitationToken, password }),
    })
  }

  async registerUser(data: {
    tenantSlug: string
    email: string
    firstName: string
    lastName: string
    password: string
    role?: string
  }) {
    return this.fetchWithoutAuth<{
      user: any
      message: string
    }>(`/users/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ============================================
  // COURSE APIs
  // ============================================

  async getCourses(tenantId?: string) {
    // If tenantId provided, use legacy endpoint, otherwise use new endpoint that uses user context
    if (tenantId) {
      return this.fetchWithAuth<any[]>(`/courses/tenant/${tenantId}`)
    }
    return this.fetchWithAuth<any[]>(`/courses`)
  }

  async getCourseById(courseId: string) {
    return this.fetchWithAuth<any>(`/courses/${courseId}`)
  }

  async createCourse(data: {
    title: string
    description: string
    category: string
    estimatedTime?: number
    coverImage?: string
    modules?: any[]
  }) {
    return this.fetchWithAuth<any>(`/courses`, {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        category: data.category,
        estimatedTime: data.estimatedTime || 60,
        coverImage: data.coverImage,
      }),
    })
  }

  async updateCourse(courseId: string, updates: {
    title?: string
    description?: string
    category?: string
    estimatedTime?: number
    modules?: any[]
    assessment?: any[]
    coverImage?: string
    status?: 'draft' | 'pending-review' | 'published' | 'archived'
  }) {
    return this.fetchWithAuth<any>(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteCourse(courseId: string, tenantId: string) {
    return this.fetchWithAuth<void>(`/courses/${courseId}?tenantId=${tenantId}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // CATEGORY APIs
  // ============================================

  async getCategories() {
    return this.fetchWithAuth<Array<{ id: string; name: string; tenantId: string }>>(`/categories`)
  }

  async createCategory(name: string) {
    if (!name || !name.trim()) {
      throw { status: 400, message: 'Category name is required' } as ApiError
    }
    
    return this.fetchWithAuth<{ id: string; name: string; tenantId: string }>(`/categories`, {
      method: 'POST',
      body: JSON.stringify({ name: name.trim() }),
    })
  }

  async deleteCategory(categoryId: string) {
    return this.fetchWithAuth<void>(`/categories/${categoryId}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // Accessibility Profiles API
  // ============================================

  /**
   * Get all accessibility profiles for the tenant (admin only)
   */
  async getAccessibilityProfiles() {
    return this.fetchWithAuth<Array<{
      id: string
      tenantId: string
      name: string
      description: string
      icon?: string
      enabled: boolean
      isDefault: boolean
      settings: any
      metadata: {
        useCase: string
        objective: string
        benefits: string[]
        recommendedSettings?: string
        targetAudience: string
      }
      createdBy?: string
      createdAt: string
      updatedAt: string
    }>>(`/accessibility-profiles`)
  }

  /**
   * Get only enabled accessibility profiles (for end users)
   */
  async getEnabledAccessibilityProfiles() {
    return this.fetchWithAuth<Array<{
      id: string
      tenantId: string
      name: string
      description: string
      icon?: string
      enabled: boolean
      isDefault: boolean
      settings: any
      metadata: {
        useCase: string
        objective: string
        benefits: string[]
        recommendedSettings?: string
        targetAudience: string
      }
      createdBy?: string
      createdAt: string
      updatedAt: string
    }>>(`/accessibility-profiles/enabled`)
  }

  /**
   * Get a specific accessibility profile
   */
  async getAccessibilityProfile(profileId: string) {
    return this.fetchWithAuth<{
      id: string
      tenantId: string
      name: string
      description: string
      icon?: string
      enabled: boolean
      isDefault: boolean
      settings: any
      metadata: {
        useCase: string
        objective: string
        benefits: string[]
        recommendedSettings?: string
        targetAudience: string
      }
      createdBy?: string
      createdAt: string
      updatedAt: string
    }>(`/accessibility-profiles/${profileId}`)
  }

  /**
   * Create a new accessibility profile
   */
  async createAccessibilityProfile(profile: {
    name: string
    description: string
    icon?: string
    enabled: boolean
    settings: any
    metadata: {
      useCase: string
      objective: string
      benefits: string[]
      recommendedSettings?: string
      targetAudience: string
    }
  }) {
    if (!profile.name || !profile.name.trim()) {
      throw { status: 400, message: 'Profile name is required' } as ApiError
    }
    
    if (!profile.description || !profile.description.trim()) {
      throw { status: 400, message: 'Profile description is required' } as ApiError
    }

    return this.fetchWithAuth<{
      id: string
      tenantId: string
      name: string
      description: string
      icon?: string
      enabled: boolean
      isDefault: boolean
      settings: any
      metadata: any
      createdBy?: string
      createdAt: string
      updatedAt: string
    }>(`/accessibility-profiles`, {
      method: 'POST',
      body: JSON.stringify(profile),
    })
  }

  /**
   * Update an accessibility profile
   */
  async updateAccessibilityProfile(
    profileId: string,
    updates: Partial<{
      name: string
      description: string
      icon?: string
      enabled: boolean
      settings: any
      metadata: {
        useCase: string
        objective: string
        benefits: string[]
        recommendedSettings?: string
        targetAudience: string
      }
    }>
  ) {
    return this.fetchWithAuth<{
      id: string
      tenantId: string
      name: string
      description: string
      icon?: string
      enabled: boolean
      isDefault: boolean
      settings: any
      metadata: any
      createdBy?: string
      createdAt: string
      updatedAt: string
    }>(`/accessibility-profiles/${profileId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  /**
   * Delete an accessibility profile
   */
  async deleteAccessibilityProfile(profileId: string) {
    return this.fetchWithAuth<void>(`/accessibility-profiles/${profileId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Toggle accessibility profile enabled status
   */
  async toggleAccessibilityProfile(profileId: string, enabled: boolean) {
    return this.fetchWithAuth<{
      id: string
      tenantId: string
      name: string
      description: string
      icon?: string
      enabled: boolean
      isDefault: boolean
      settings: any
      metadata: any
      createdBy?: string
      createdAt: string
      updatedAt: string
    }>(`/accessibility-profiles/${profileId}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    })
  }

  /**
   * Duplicate an accessibility profile
   */
  async duplicateAccessibilityProfile(profileId: string, newName: string) {
    if (!newName || !newName.trim()) {
      throw { status: 400, message: 'newName is required' } as ApiError
    }

    return this.fetchWithAuth<{
      id: string
      tenantId: string
      name: string
      description: string
      icon?: string
      enabled: boolean
      isDefault: boolean
      settings: any
      metadata: any
      createdBy?: string
      createdAt: string
      updatedAt: string
    }>(`/accessibility-profiles/${profileId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ newName: newName.trim() }),
    })
  }

  async submitCourseForReview(courseId: string) {
    return this.fetchWithAuth<any>(`/courses/${courseId}/submit-review`, {
      method: 'POST',
    })
  }

  async publishCourse(courseId: string) {
    return this.fetchWithAuth<any>(`/courses/${courseId}/publish`, {
      method: 'POST',
    })
  }

  async approveCourse(courseId: string, comments?: string) {
    return this.fetchWithAuth<any>(`/courses/${courseId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    })
  }

  async rejectCourse(courseId: string, comments: string) {
    return this.fetchWithAuth<any>(`/courses/${courseId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
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
    // Use validate endpoint to check if token is still valid
    const token = localStorage.getItem('auth-token')
    if (!token) {
      throw { status: 401, message: 'No token found' } as ApiError
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: 'Token validation failed',
      } as ApiError
    }
    
    const result = await response.json()
    if (result.success && result.user) {
      return result.user
    }
    
    throw { status: 401, message: 'Token invalid' } as ApiError
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

  // ============================================
  // USER PROGRESS APIs
  // ============================================

  async getUserProgress(userId: string) {
    return this.fetchWithAuth<any[]>(`/user-progress/${userId}`)
  }

  async getCourseProgress(userId: string, courseId: string) {
    return this.fetchWithAuth<{
      completedLessons: string[]
      lastAccessedAt: string | null
      xpEarned: number
    }>(`/user-progress/${userId}/course/${courseId}`)
  }

  async updateUserProgress(userId: string, courseId: string, progress: number, completedLessons?: string[]) {
    return this.fetchWithAuth<any>(`/user-progress/${userId}/course/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify({ progress, completedLessons }),
    })
  }

  async upsertUserProgress(progressData: any) {
    return this.fetchWithAuth<any>(`/user-progress`, {
      method: 'POST',
      body: JSON.stringify(progressData),
    })
  }

  async getCourseProgressAll(courseId: string) {
    return this.fetchWithAuth<any[]>(`/courses/${courseId}/progress`)
  }

  // ============================================
  // USER GROUPS APIs
  // ============================================

  async getGroups() {
    return this.fetchWithAuth<Array<{ id: string; name: string; description?: string; memberIds: string[] }>>(`/groups`)
  }

  async getGroupById(groupId: string) {
    return this.fetchWithAuth<any>(`/groups/${groupId}`)
  }

  async createGroup(data: { name: string; description?: string; memberIds?: string[] }) {
    return this.fetchWithAuth<any>(`/groups`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateGroup(groupId: string, updates: { name?: string; description?: string; memberIds?: string[] }) {
    return this.fetchWithAuth<any>(`/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteGroup(groupId: string) {
    return this.fetchWithAuth<void>(`/groups/${groupId}`, {
      method: 'DELETE',
    })
  }

  async addMemberToGroup(groupId: string, userId: string) {
    return this.fetchWithAuth<any>(`/groups/${groupId}/members/${userId}`, {
      method: 'POST',
    })
  }

  async removeMemberFromGroup(groupId: string, userId: string) {
    return this.fetchWithAuth<any>(`/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // COURSE ASSIGNMENTS APIs
  // ============================================

  async getCourseAssignments(courseId?: string, userId?: string) {
    if (courseId) {
      return this.fetchWithAuth<any[]>(`/course-assignments/course/${courseId}`)
    }
    if (userId) {
      return this.fetchWithAuth<any[]>(`/course-assignments/user/${userId}`)
    }
    return this.fetchWithAuth<any[]>(`/course-assignments`)
  }

  async createCourseAssignment(data: {
    courseId: string
    assignedToType: 'user' | 'group'
    assignedToId: string
    dueDate?: string
  }) {
    return this.fetchWithAuth<any>(`/course-assignments`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAssignmentStatus(assignmentId: string, status: 'pending' | 'in-progress' | 'completed') {
    return this.fetchWithAuth<any>(`/course-assignments/${assignmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async deleteCourseAssignment(assignmentId: string) {
    return this.fetchWithAuth<void>(`/course-assignments/${assignmentId}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // GAMIFICATION APIs
  // ============================================

  async awardXP(userId: string, xpAmount: number, reason?: string) {
    return this.fetchWithAuth<{
      user: any
      levelUp: boolean
      newLevel?: number
      newlyAwardedBadges?: string[]
    }>(`/gamification/award-xp`, {
      method: 'POST',
      body: JSON.stringify({ userId, xpAmount, reason }),
    })
  }

  async getGamificationStats(userId: string) {
    return this.fetchWithAuth<{
      totalXP: number
      level: number
      badges: string[]
      achievements: string[]
    }>(`/gamification/stats/${userId}`)
  }

  async awardBadge(userId: string, badgeId: string) {
    return this.fetchWithAuth<any>(`/gamification/badges/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ badgeId }),
    })
  }

  async removeBadge(userId: string, badgeId: string) {
    return this.fetchWithAuth<any>(`/gamification/badges/${userId}/${badgeId}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // CERTIFICATES APIs
  // ============================================

  async getUserCertificates(userId: string) {
    return this.fetchWithAuth<any[]>(`/certificates/user/${userId}`)
  }

  async getCertificateById(certificateId: string) {
    return this.fetchWithAuth<any>(`/certificates/${certificateId}`)
  }

  async verifyCertificate(code: string, tenantId: string) {
    return this.fetchWithoutAuth<any>(`/certificates/verify/${code}?tenantId=${tenantId}`)
  }

  async getCourseCertificates(courseId: string) {
    return this.fetchWithAuth<any[]>(`/certificates/course/${courseId}`)
  }

  async getCertificateByCourse(userId: string, courseId: string) {
    try {
      return await this.fetchWithAuth<any>(`/certificates/user/${userId}/course/${courseId}`)
    } catch (error: any) {
      if (error.status === 404) {
        return null
      }
      throw error
    }
  }

  async createCertificate(data: {
    userId: string
    courseId: string
    courseTitle: string
    userFullName: string
  }) {
    return this.fetchWithAuth<any>(`/certificates`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async downloadCertificate(certificateId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/certificates/${certificateId}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to download certificate')
    }
    return response.blob()
  }

  // Company Settings
  async getCompanySettings() {
    return this.fetchWithAuth<{ companyName: string; companyLogo?: string }>('/company-settings')
  }

  async updateCompanySettings(data: { companyName: string; companyLogo?: string }) {
    return this.fetchWithAuth<{ companyName: string; companyLogo?: string }>('/company-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Certificate Templates
  async getCertificateTemplate() {
    return this.fetchWithAuth<any>('/certificate-templates')
  }

  async updateCertificateTemplate(data: any) {
    return this.fetchWithAuth<any>('/certificate-templates', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCertificate(certificateId: string) {
    return this.fetchWithAuth<void>(`/certificates/${certificateId}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // ANALYTICS APIs
  // ============================================

  async getHighLevelStats() {
    return this.fetchWithAuth<{
      totalActiveUsers: number
      totalSeats: number
      platformCompletionRate: number
      totalPublishedCourses: number
      totalXPAwarded: number
      topEngagedUsers: Array<{
        userId: string
        userName: string
        xp: number
        level: number
      }>
      topPopularCourses: Array<{
        courseId: string
        courseTitle: string
        enrollments: number
        completions: number
      }>
      complianceStatus: {
        totalMandatory: number
        completed: number
        inProgress: number
        notStarted: number
      }
    }>(`/analytics/high-level`)
  }

  async getUserProgressReport(filters?: {
    searchQuery?: string
    teamId?: string
    mentorId?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.searchQuery) params.append('searchQuery', filters.searchQuery)
    if (filters?.teamId) params.append('teamId', filters.teamId)
    if (filters?.mentorId) params.append('mentorId', filters.mentorId)
    
    return this.fetchWithAuth<any[]>(`/analytics/user-progress?${params.toString()}`)
  }

  async getCourseReport(courseId: string) {
    return this.fetchWithAuth<{
      courseId: string
      courseTitle: string
      totalEnrolled: number
      totalCompleted: number
      totalInProgress: number
      notStarted: number
      averageScore: number
      users: Array<{
        userId: string
        userName: string
        userEmail: string
        status: 'not-started' | 'in-progress' | 'completed'
        progress: number
        quizScore?: number
        completionDate?: string
        enrollmentDate?: string
      }>
    }>(`/analytics/course/${courseId}`)
  }

  async getTeamReport(teamId?: string) {
    const params = teamId ? `?teamId=${teamId}` : ''
    return this.fetchWithAuth<any[]>(`/analytics/team${params}`)
  }

  async getAssessmentReport(quizId: string) {
    return this.fetchWithAuth<{
      quizId: string
      quizTitle: string
      courseId: string
      courseTitle: string
      totalAttempts: number
      averageScore: number
      passRate: number
      passingScore: number
      questionAnalytics: Array<{
        questionId: string
        questionText: string
        correctAnswerRate: number
        incorrectAnswerRate: number
        totalResponses: number
      }>
    }>(`/analytics/assessment/${quizId}`)
  }

  async getMentorshipReport() {
    return this.fetchWithAuth<Array<{
      mentorId: string
      mentorName: string
      mentorEmail: string
      menteeCount: number
      averageMenteeCompletionRate: number
      totalMenteeXP: number
      mentees: Array<{
        menteeId: string
        menteeName: string
        menteeEmail: string
        completionRate: number
        coursesCompleted: number
        totalXP: number
      }>
    }>>(`/analytics/mentorship`)
  }

  async getHistoricalEngagementData(weeks: number = 8) {
    return this.fetchWithAuth<Array<{
      week: string
      xpGained: number
      activeUsers: number
    }>>(`/analytics/engagement-history?weeks=${weeks}`)
  }

  async getRealProgressDistribution() {
    return this.fetchWithAuth<Array<{
      range: string
      count: number
      percentage: number
    }>>(`/analytics/progress-distribution`)
  }

  async getROIMetrics() {
    return this.fetchWithAuth<{
      totalTrainingHours: number
      averageTimePerCourse: number
      totalCompletedCourses: number
      averageCompletionTime: number
    }>(`/analytics/roi`)
  }

  async getEngagementMetrics() {
    return this.fetchWithAuth<{
      currentMonthActiveUsers: number
      previousMonthActiveUsers: number
      retentionRate: number
      averageActiveDaysPerUser: number
      peakActivityDay?: string
    }>(`/analytics/engagement`)
  }

  async getPerformanceMetrics() {
    return this.fetchWithAuth<{
      averageCourseScore: number
      averageQuizPassRate: number
      topPerformingCourses: Array<{
        courseId: string
        courseTitle: string
        averageScore: number
        completionRate: number
      }>
      underperformingCourses: Array<{
        courseId: string
        courseTitle: string
        averageScore: number
        completionRate: number
      }>
    }>(`/analytics/performance`)
  }

  async getTeamComparisons() {
    return this.fetchWithAuth<Array<{
      teamId: string
      teamName: string
      completionRate: number
      totalXP: number
      averageScore: number
      memberCount: number
    }>>(`/analytics/team-comparisons`)
  }

  async getCourseCompletionRates() {
    return this.fetchWithAuth<Array<{
      courseId: string
      courseTitle: string
      completionRate: number
      enrollments: number
      completions: number
    }>>(`/analytics/course-completion-rates`)
  }

  async getMonthlyCompletionTrends(months: number = 6) {
    return this.fetchWithAuth<Array<{
      month: string
      completions: number
      enrollments: number
      completionRate: number
    }>>(`/analytics/monthly-completions?months=${months}`)
  }

  async getScoreDistribution() {
    return this.fetchWithAuth<Array<{
      range: string
      count: number
      percentage: number
    }>>(`/analytics/score-distribution`)
  }

  // ============================================
  // FORUM/Q&A APIs
  // ============================================

  async getCourseQuestions(courseId: string, moduleId?: string) {
    const params = moduleId ? `?moduleId=${moduleId}` : ''
    return this.fetchWithAuth<any[]>(`/forums/course/${courseId}/questions${params}`)
  }

  async getQuestionAnswers(questionId: string) {
    return this.fetchWithAuth<any[]>(`/forums/question/${questionId}/answers`)
  }

  async createQuestion(courseId: string, data: {
    moduleId: string
    title: string
    content: string
    userName?: string
    userAvatar?: string
  }) {
    return this.fetchWithAuth<any>(`/forums/course/${courseId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createAnswer(questionId: string, data: {
    content: string
    userName?: string
    userAvatar?: string
  }) {
    return this.fetchWithAuth<any>(`/forums/question/${questionId}/answers`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async upvoteQuestion(questionId: string) {
    return this.fetchWithAuth<any>(`/forums/question/${questionId}/upvote`, {
      method: 'POST',
    })
  }

  async upvoteAnswer(answerId: string) {
    return this.fetchWithAuth<any>(`/forums/answer/${answerId}/upvote`, {
      method: 'POST',
    })
  }

  async markBestAnswer(answerId: string) {
    return this.fetchWithAuth<any>(`/forums/answer/${answerId}/best`, {
      method: 'POST',
    })
  }

  async deleteQuestion(questionId: string) {
    return this.fetchWithAuth<void>(`/forums/question/${questionId}`, {
      method: 'DELETE',
    })
  }

  async deleteAnswer(answerId: string) {
    return this.fetchWithAuth<void>(`/forums/answer/${answerId}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // QUIZ ATTEMPTS APIs
  // ============================================

  async createQuizAttempt(data: {
    courseId: string
    quizId: string
    score: number
    answers: Array<{
      questionId: string
      selectedAnswer: number | number[] | string
      correct: boolean
    }>
  }) {
    return this.fetchWithAuth<any>(`/quiz-attempts`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getUserQuizAttempts(userId: string, quizId?: string) {
    const params = quizId ? `?quizId=${quizId}` : ''
    return this.fetchWithAuth<any[]>(`/quiz-attempts/user/${userId}${params}`)
  }

  async getQuizAttemptsByQuiz(quizId: string) {
    return this.fetchWithAuth<any[]>(`/quiz-attempts/quiz/${quizId}`)
  }

  async getCourseQuizAttempts(courseId: string, userId?: string) {
    const params = userId ? `?userId=${userId}` : ''
    return this.fetchWithAuth<any[]>(`/quiz-attempts/course/${courseId}${params}`)
  }

  async getBestQuizScore(quizId: string) {
    return this.fetchWithAuth<{ bestScore: number }>(`/quiz-attempts/best/${quizId}`)
  }

  async getQuizAttemptStats(quizId: string) {
    return this.fetchWithAuth<{
      totalAttempts: number
      averageScore: number
      passRate: number
      uniqueUsers: number
    }>(`/quiz-attempts/stats/${quizId}`)
  }

  // ============================================
  // ACTIVITY FEED APIs
  // ============================================

  async getActivityFeed(limit?: number) {
    const params = limit ? `?limit=${limit}` : ''
    return this.fetchWithAuth<any[]>(`/activity-feed${params}`)
  }

  async getUserActivityFeed(userId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : ''
    return this.fetchWithAuth<any[]>(`/activity-feed/user/${userId}${params}`)
  }

  async createActivityFeedItem(data: {
    type: 'level-up' | 'badge-earned' | 'course-completed' | 'achievement-unlocked'
    data: {
      level?: number
      badgeName?: string
      badgeIcon?: string
      courseName?: string
      achievementName?: string
      achievementIcon?: string
    }
    userName?: string
    userAvatar?: string
  }) {
    return this.fetchWithAuth<any>(`/activity-feed`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async addActivityReaction(activityId: string, reactionType: 'congrats' | 'highfive' | 'fire' | 'star' | 'trophy') {
    return this.fetchWithAuth<any>(`/activity-feed/${activityId}/reaction`, {
      method: 'POST',
      body: JSON.stringify({ reactionType }),
    })
  }

  async addActivityComment(activityId: string, data: {
    content: string
    userName?: string
    userAvatar?: string
  }) {
    return this.fetchWithAuth<any>(`/activity-feed/${activityId}/comment`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ============================================
  // NOTIFICATIONS APIs
  // ============================================

  async getNotifications(unreadOnly?: boolean) {
    const params = unreadOnly ? '?unreadOnly=true' : ''
    return this.fetchWithAuth<any[]>(`/notifications${params}`)
  }

  async getUnreadNotificationCount() {
    return this.fetchWithAuth<{ count: number }>(`/notifications/unread-count`)
  }

  async createNotification(data: {
    userId?: string
    type: 'activity' | 'forum-reply' | 'achievement' | 'team-challenge' | 'course-reminder' | 'mention'
    title?: string
    titleKey?: string
    message?: string
    messageKey?: string
    messageParams?: Record<string, string>
    actionUrl?: string
    relatedId?: string
  }) {
    return this.fetchWithAuth<any>(`/notifications`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async markNotificationAsRead(notificationId: string) {
    return this.fetchWithAuth<any>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    })
  }

  async markAllNotificationsAsRead() {
    return this.fetchWithAuth<{ count: number }>(`/notifications/read-all`, {
      method: 'PUT',
    })
  }

  async deleteNotification(notificationId: string) {
    return this.fetchWithAuth<void>(`/notifications/${notificationId}`, {
      method: 'DELETE',
    })
  }

  async getNotificationPreferences() {
    return this.fetchWithAuth<{
      activityFeed: boolean
      forumReplies: boolean
      achievements: boolean
      teamChallenges: boolean
      courseReminders: boolean
      emailSummary: 'never' | 'daily' | 'weekly'
      soundEffects: boolean
      inAppBadges: boolean
    }>(`/notifications/preferences`)
  }

  async updateNotificationPreferences(preferences: Partial<{
    activityFeed: boolean
    forumReplies: boolean
    achievements: boolean
    teamChallenges: boolean
    courseReminders: boolean
    emailSummary: 'never' | 'daily' | 'weekly'
    soundEffects: boolean
    inAppBadges: boolean
  }>) {
    return this.fetchWithAuth<any>(`/notifications/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    })
  }

  // ============================================
  // ACHIEVEMENTS APIs
  // ============================================

  async getUserAchievements(userId: string) {
    return this.fetchWithAuth<any[]>(`/achievements/user/${userId}`)
  }

  async getUserStats(userId: string) {
    return this.fetchWithAuth<{
      totalCoursesCompleted: number
      totalModulesCompleted: number
      totalAssessmentsPassed: number
      averageScore: number
      currentStreak: number
      longestStreak: number
      lastActivityDate: number
      achievementsUnlocked: Array<{
        id: string
        achievementId: string
        unlockedAt: number
      }>
      totalXP: number
      level: number
    }>(`/achievements/user/${userId}/stats`)
  }

  async unlockAchievement(achievementId: string) {
    return this.fetchWithAuth<any>(`/achievements/unlock`, {
      method: 'POST',
      body: JSON.stringify({ achievementId }),
    })
  }

  async checkAndUnlockAchievements(stats?: Partial<{
    totalCoursesCompleted: number
    totalModulesCompleted: number
    totalAssessmentsPassed: number
    averageScore: number
    currentStreak: number
    longestStreak: number
    lastActivityDate: number
  }>) {
    return this.fetchWithAuth<{
      newlyUnlocked: any[]
      count: number
    }>(`/achievements/check`, {
      method: 'POST',
      body: JSON.stringify({ stats }),
    })
  }

  // ============================================
  // MEDIA / BLOB STORAGE APIs
  // ============================================

  /**
   * Upload file to Azure Blob Storage
   * @param file File to upload
   * @param type Type of upload: 'logo' | 'avatar' | 'course-cover' | 'lesson-image' | 'lesson-file' | 'editor-image'
   * @param options Optional: courseId, lessonId
   * @returns Upload response with URL and metadata
   */
  async uploadFile(
    file: File,
    type: 'logo' | 'avatar' | 'course-cover' | 'lesson-image' | 'lesson-file' | 'editor-image',
    options?: {
      courseId?: string
      lessonId?: string
    }
  ): Promise<{
    success: boolean
    url: string
    blobName: string
    containerName: string
    size: number
    contentType: string
    originalName?: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    if (options?.courseId) {
      formData.append('courseId', options.courseId)
    }
    if (options?.lessonId) {
      formData.append('lessonId', options.lessonId)
    }

    const token = localStorage.getItem('auth-token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    // Usar la misma lógica que el método fetch() interno para consistencia
    // El endpoint debe empezar con / para que se concatene correctamente
    const endpoint = '/media/upload'
    const url = `${API_BASE_URL}${endpoint}`
    console.log('[ApiService] Uploading file to:', url, 'API_BASE_URL:', API_BASE_URL, 'endpoint:', endpoint, 'with token:', token ? 'present' : 'missing')
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // No Content-Type header - let browser set it with boundary for FormData
      },
      body: formData
    })

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const error = await response.json()
        errorMessage = error.error || error.message || errorMessage
      } catch {
        // Si no se puede parsear JSON, usar el texto de respuesta
        const text = await response.text().catch(() => '')
        errorMessage = text || errorMessage
      }
      
      console.error('[ApiService] Upload error:', {
        url,
        status: response.status,
        statusText: response.statusText,
        error: errorMessage
      })
      
      throw {
        message: errorMessage,
        status: response.status,
      } as ApiError
    }

    return await response.json()
  }

  /**
   * Get secure URL with SAS token for a blob
   * @param container Container name
   * @param blobName Blob name (full path)
   * @returns URL with SAS token and expiration
   */
  async getMediaUrl(
    container: string,
    blobName: string
  ): Promise<{
    url: string
    expiresIn: number
  }> {
    // URL encode the blobName to handle special characters
    const encodedBlobName = encodeURIComponent(blobName)
    return this.fetchWithAuth<{
      url: string
      expiresIn: number
    }>(`/media/url/${container}/${encodedBlobName}`)
  }

  /**
   * Delete a file from Blob Storage
   * @param container Container name
   * @param blobName Blob name (full path)
   */
  async deleteMediaFile(
    container: string,
    blobName: string
  ): Promise<{ success: boolean }> {
    // URL encode the blobName to handle special characters
    const encodedBlobName = encodeURIComponent(blobName)
    return this.fetchWithAuth<{ success: boolean }>(`/media/${container}/${encodedBlobName}`, {
      method: 'DELETE',
    })
  }

  // ============================================
  // STPS Compliance
  // ============================================

  async getSTPSStats() {
    return this.fetchWithAuth<import('@/lib/types').STPSStats>('/stps/stats')
  }

  async getSTPSTenantConfig() {
    return this.fetchWithAuth<import('@/lib/types').STPSTenantConfig>('/stps/config')
  }

  async updateSTPSTenantConfig(config: Partial<import('@/lib/types').STPSTenantConfig>) {
    return this.fetchWithAuth<import('@/lib/types').STPSTenantConfig>('/stps/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    })
  }

  async getSTPSEnabledCourses() {
    return this.fetchWithAuth<import('@/lib/types').STPSCourseConfig[]>('/stps/courses')
  }

  async getSTPSCourseConfig(courseId: string) {
    return this.fetchWithAuth<import('@/lib/types').STPSCourseConfig>(`/stps/courses/${courseId}`)
  }

  async updateSTPSCourseConfig(courseId: string, config: Partial<import('@/lib/types').STPSCourseConfig>) {
    return this.fetchWithAuth<import('@/lib/types').STPSCourseConfig>(`/stps/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    })
  }

  async generateConstancia(userId: string, courseId: string) {
    return this.fetchWithAuth<import('@/lib/types').STPSConstancia>('/stps/constancias/generate', {
      method: 'POST',
      body: JSON.stringify({ userId, courseId }),
    })
  }

  async getSTPSConstancias(filters?: { status?: string; startDate?: string; endDate?: string }) {
    const params = new URLSearchParams()
    if (filters?.status) params.set('status', filters.status)
    if (filters?.startDate) params.set('startDate', filters.startDate)
    if (filters?.endDate) params.set('endDate', filters.endDate)
    const qs = params.toString()
    return this.fetchWithAuth<import('@/lib/types').STPSConstancia[]>(`/stps/constancias${qs ? '?' + qs : ''}`)
  }

  async getSTPSConstancia(id: string) {
    return this.fetchWithAuth<import('@/lib/types').STPSConstancia>(`/stps/constancias/${id}`)
  }

  async downloadDC3PDF(id: string): Promise<Blob> {
    const url = `${API_BASE_URL}/stps/constancias/${id}/pdf`
    const token = localStorage.getItem('auth-token')
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Error descargando PDF')
    return response.blob()
  }

  async getSTPSDC4Report(startDate: string, endDate: string) {
    return this.fetchWithAuth<import('@/lib/types').STPSDC4Report>(
      `/stps/dc4-report?startDate=${startDate}&endDate=${endDate}`
    )
  }

  // ============================================
  // Billing
  // ============================================

  async getBillingPlans() {
    return this.fetchWithAuth<import('@/lib/types').PlanDefinition[]>('/billing/plans')
  }

  async getBillingStatus() {
    return this.fetchWithAuth<import('@/lib/types').BillingStatus>('/billing/status')
  }

  async createCheckoutSession(plan: import('@/lib/types').BillingPlan, interval: import('@/lib/types').BillingInterval) {
    return this.fetchWithAuth<{ url: string; sessionId: string }>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan, interval }),
    })
  }

  async createBillingPortalSession() {
    return this.fetchWithAuth<{ url: string }>('/billing/portal', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  }
}

export const ApiService = new ApiServiceClass()
