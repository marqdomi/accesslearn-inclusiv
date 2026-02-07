/**
 * Platform Admin API Service
 * Handles all API calls for the Platform Admin Console
 */

// Get API URL from runtime config or env vars
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).__APP_CONFIG__) {
    const runtimeConfig = (window as any).__APP_CONFIG__
    if (runtimeConfig.VITE_API_URL) {
      return runtimeConfig.VITE_API_URL
    }
    if (runtimeConfig.VITE_API_BASE_URL) {
      return runtimeConfig.VITE_API_BASE_URL
    }
  }
  
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`
  }
  
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  return 'http://localhost:3000/api'
}

const API_BASE_URL = getApiBaseUrl()

// ============================================
// Types
// ============================================

export interface Tenant {
  id: string
  name: string
  slug: string
  contactEmail: string
  primaryColor: string
  secondaryColor: string
  plan: 'starter' | 'profesional' | 'enterprise'
  status: 'active' | 'suspended' | 'pending' | 'trial'
  subscriptionStartDate: string
  subscriptionEndDate?: string
  maxUsers: number
  maxCourses: number
  currentUsers?: number
  currentCourses?: number
  createdAt: string
  updatedAt: string
  createdBy: string
  logo?: string
}

export interface Subscription {
  id: string
  tenantId: string
  tenantName: string
  plan: 'starter' | 'profesional' | 'enterprise'
  status: 'active' | 'canceled' | 'past_due' | 'trial'
  priceMonthly: number
  billingCycle: 'monthly' | 'yearly'
  startDate: string
  endDate?: string
  nextBillingDate: string
  paymentMethod?: string
  autoRenew: boolean
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  tenantId: string
  tenantName: string
  subscriptionId: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'overdue' | 'canceled'
  issueDate: string
  dueDate: string
  paidDate?: string
  items: InvoiceItem[]
  createdAt: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface PlatformAlert {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  category: 'system' | 'billing' | 'security' | 'tenant' | 'user'
  title: string
  message: string
  tenantId?: string
  tenantName?: string
  isRead: boolean
  createdAt: string
  resolvedAt?: string
  metadata?: Record<string, unknown>
}

export interface PlatformSettings {
  id: string
  platformName: string
  supportEmail: string
  maintenanceMode: boolean
  defaultLanguage: string
  allowedLanguages: string[]
  security: {
    requireMfa: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
  }
  email: {
    provider: string
    fromEmail: string
    fromName: string
  }
  branding: {
    primaryColor: string
    secondaryColor: string
    logoUrl?: string
  }
  features: {
    gamification: boolean
    mentorship: boolean
    certificates: boolean
    forums: boolean
    analytics: boolean
  }
  updatedAt: string
  updatedBy: string
}

export interface PlatformHealthMetric {
  id: string
  service: string
  status: 'operational' | 'degraded' | 'outage' | 'maintenance'
  latency?: number
  uptime?: number
  lastChecked: string
  message?: string
}

export interface PlatformStats {
  totalTenants: number
  activeTenants: number
  totalUsers: number
  activeUsers: number
  totalCourses: number
  publishedCourses: number
  monthlyRevenue: number
  yearlyRevenue: number
  tenantsByPlan: Record<string, number>
  usersByRole: Record<string, number>
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: string
  description: string
  tenantId?: string
  tenantName?: string
  userId?: string
  userName?: string
  timestamp: string
}

export interface PlatformUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  role: string
  tenantId: string
  status: string
  createdAt: string
  lastLoginAt?: string
}

// ============================================
// API Service
// ============================================

class PlatformAdminApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('auth-token') || localStorage.getItem('accesslearn_token')
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken()
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  // ---- Stats ----
  
  async getStats(): Promise<PlatformStats> {
    return this.fetch<PlatformStats>('/platform-admin/stats')
  }

  // ---- Tenants ----
  
  async getTenants(): Promise<Tenant[]> {
    return this.fetch<Tenant[]>('/platform-admin/tenants')
  }

  async getTenantById(tenantId: string): Promise<Tenant> {
    return this.fetch<Tenant>(`/platform-admin/tenants/${tenantId}`)
  }

  async createTenant(data: Partial<Tenant>): Promise<Tenant> {
    return this.fetch<Tenant>('/platform-admin/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTenant(tenantId: string, data: Partial<Tenant>): Promise<Tenant> {
    return this.fetch<Tenant>(`/platform-admin/tenants/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async suspendTenant(tenantId: string): Promise<void> {
    return this.fetch<void>(`/platform-admin/tenants/${tenantId}/suspend`, {
      method: 'POST',
    })
  }

  async activateTenant(tenantId: string): Promise<void> {
    return this.fetch<void>(`/platform-admin/tenants/${tenantId}/activate`, {
      method: 'POST',
    })
  }

  // ---- Users ----

  async getUsers(tenantId?: string): Promise<PlatformUser[]> {
    const query = tenantId ? `?tenantId=${tenantId}` : ''
    return this.fetch<PlatformUser[]>(`/platform-admin/users${query}`)
  }

  // ---- Subscriptions ----

  async getSubscriptions(): Promise<Subscription[]> {
    return this.fetch<Subscription[]>('/platform-admin/subscriptions')
  }

  async getSubscriptionByTenant(tenantId: string): Promise<Subscription> {
    return this.fetch<Subscription>(`/platform-admin/subscriptions/${tenantId}`)
  }

  // ---- Invoices ----

  async getInvoices(tenantId?: string): Promise<Invoice[]> {
    const query = tenantId ? `?tenantId=${tenantId}` : ''
    return this.fetch<Invoice[]>(`/platform-admin/invoices${query}`)
  }

  // ---- Alerts ----

  async getAlerts(includeRead: boolean = false): Promise<PlatformAlert[]> {
    const query = includeRead ? '?includeRead=true' : ''
    return this.fetch<PlatformAlert[]>(`/platform-admin/alerts${query}`)
  }

  async createAlert(data: Partial<PlatformAlert>): Promise<PlatformAlert> {
    return this.fetch<PlatformAlert>('/platform-admin/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async markAlertAsRead(alertId: string, category: string): Promise<void> {
    return this.fetch<void>(`/platform-admin/alerts/${alertId}/read`, {
      method: 'PUT',
      body: JSON.stringify({ category }),
    })
  }

  async deleteAlert(alertId: string, category: string): Promise<void> {
    return this.fetch<void>(`/platform-admin/alerts/${alertId}?category=${category}`, {
      method: 'DELETE',
    })
  }

  // ---- Settings ----

  async getSettings(): Promise<PlatformSettings> {
    return this.fetch<PlatformSettings>('/platform-admin/settings')
  }

  async updateSettings(data: Partial<PlatformSettings>): Promise<PlatformSettings> {
    return this.fetch<PlatformSettings>('/platform-admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // ---- Health ----

  async getHealthMetrics(): Promise<PlatformHealthMetric[]> {
    return this.fetch<PlatformHealthMetric[]>('/platform-admin/health')
  }
}

// Export singleton instance
export const platformAdminApi = new PlatformAdminApiService()
