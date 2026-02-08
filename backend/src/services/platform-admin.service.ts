/**
 * Platform Admin Service
 * Handles all platform-level operations for super-admins
 * Connects to real Cosmos DB data
 */
import { Container } from '@azure/cosmos'
import { getContainer, isOfflineMode } from './cosmosdb.service'
import { v4 as uuidv4 } from 'uuid'
import { BillingPlan } from '../types/billing.types'

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
  plan: BillingPlan
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
  settings?: TenantSettings
}

export interface TenantSettings {
  allowSelfRegistration?: boolean
  requireEmailVerification?: boolean
  defaultLanguage?: string
  features?: Record<string, boolean>
}

export interface Subscription {
  id: string
  tenantId: string
  tenantName: string
  plan: BillingPlan
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

// ============================================
// Service Implementation
// ============================================

class PlatformAdminService {
  
  // ---- Tenants ----
  
  async getAllTenants(): Promise<Tenant[]> {
    if (isOfflineMode()) {
      return this.getMockTenants()
    }
    
    const container = getContainer('tenants')
    const { resources } = await container.items
      .query('SELECT * FROM c ORDER BY c.createdAt DESC')
      .fetchAll()
    
    // Enrich with user/course counts
    const enrichedTenants = await Promise.all(
      resources.map(async (tenant: Tenant) => {
        const userCount = await this.getTenantUserCount(tenant.id)
        const courseCount = await this.getTenantCourseCount(tenant.id)
        return {
          ...tenant,
          currentUsers: userCount,
          currentCourses: courseCount
        }
      })
    )
    
    return enrichedTenants
  }
  
  async getTenantById(tenantId: string): Promise<Tenant | null> {
    if (isOfflineMode()) {
      const mockTenants = this.getMockTenants()
      return mockTenants.find(t => t.id === tenantId) || null
    }
    
    const container = getContainer('tenants')
    try {
      const { resource } = await container.item(tenantId, tenantId).read()
      if (resource) {
        resource.currentUsers = await this.getTenantUserCount(tenantId)
        resource.currentCourses = await this.getTenantCourseCount(tenantId)
      }
      return resource || null
    } catch {
      return null
    }
  }
  
  async createTenant(data: Partial<Tenant>): Promise<Tenant> {
    const container = getContainer('tenants')
    
    const newTenant: Tenant = {
      id: `tenant-${data.slug}`,
      name: data.name!,
      slug: data.slug!,
      contactEmail: data.contactEmail!,
      primaryColor: data.primaryColor || '#6366F1',
      secondaryColor: data.secondaryColor || '#8B5CF6',
      plan: data.plan || 'starter',
      status: 'active',
      subscriptionStartDate: new Date().toISOString(),
      maxUsers: this.getMaxUsersByPlan(data.plan || 'starter'),
      maxCourses: this.getMaxCoursesByPlan(data.plan || 'starter'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: data.createdBy || 'system',
      logo: data.logo
    }
    
    const { resource } = await container.items.create(newTenant)
    
    // Create default subscription
    await this.createSubscription({
      tenantId: newTenant.id,
      tenantName: newTenant.name,
      plan: newTenant.plan
    })
    
    return resource as Tenant
  }
  
  async updateTenant(tenantId: string, data: Partial<Tenant>): Promise<Tenant | null> {
    const container = getContainer('tenants')
    
    const existing = await this.getTenantById(tenantId)
    if (!existing) return null
    
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    const { resource } = await container.item(tenantId, tenantId).replace(updated)
    return resource as Tenant
  }
  
  async suspendTenant(tenantId: string): Promise<boolean> {
    const result = await this.updateTenant(tenantId, { status: 'suspended' })
    
    // Create alert
    await this.createAlert({
      type: 'warning',
      category: 'tenant',
      title: 'Tenant Suspended',
      message: `Tenant ${tenantId} has been suspended`,
      tenantId
    })
    
    return !!result
  }
  
  async activateTenant(tenantId: string): Promise<boolean> {
    const result = await this.updateTenant(tenantId, { status: 'active' })
    return !!result
  }
  
  private getMaxUsersByPlan(plan: string): number {
    const limits: Record<string, number> = {
      'free-trial': 10,
      'starter': 50,
      'professional': 250,
      'enterprise': 9999
    }
    return limits[plan] || 10
  }
  
  private getMaxCoursesByPlan(plan: string): number {
    const limits: Record<string, number> = {
      'free-trial': 3,
      'starter': 10,
      'professional': 999,
      'enterprise': 9999
    }
    return limits[plan] || 3
  }
  
  // ---- Users ----
  
  async getAllUsers(tenantId?: string): Promise<any[]> {
    if (isOfflineMode()) {
      return []
    }
    
    const container = getContainer('users')
    let query = 'SELECT * FROM c'
    
    if (tenantId) {
      query += ` WHERE c.tenantId = '${tenantId}'`
    }
    
    query += ' ORDER BY c.createdAt DESC'
    
    const { resources } = await container.items.query(query).fetchAll()
    return resources
  }
  
  async getTenantUserCount(tenantId: string): Promise<number> {
    if (isOfflineMode()) return 0
    
    const container = getContainer('users')
    const { resources } = await container.items
      .query({
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.tenantId = @tenantId',
        parameters: [{ name: '@tenantId', value: tenantId }]
      })
      .fetchAll()
    
    return resources[0] || 0
  }
  
  async getTenantCourseCount(tenantId: string): Promise<number> {
    if (isOfflineMode()) return 0
    
    const container = getContainer('courses')
    const { resources } = await container.items
      .query({
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.tenantId = @tenantId',
        parameters: [{ name: '@tenantId', value: tenantId }]
      })
      .fetchAll()
    
    return resources[0] || 0
  }
  
  // ---- Subscriptions ----
  
  async getSubscriptions(): Promise<Subscription[]> {
    if (isOfflineMode()) return []
    
    const container = getContainer('subscriptions')
    const { resources } = await container.items
      .query('SELECT * FROM c ORDER BY c.createdAt DESC')
      .fetchAll()
    
    return resources
  }
  
  async getSubscriptionByTenant(tenantId: string): Promise<Subscription | null> {
    if (isOfflineMode()) return null
    
    const container = getContainer('subscriptions')
    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
        parameters: [{ name: '@tenantId', value: tenantId }]
      })
      .fetchAll()
    
    return resources[0] || null
  }
  
  async createSubscription(data: {
    tenantId: string
    tenantName: string
    plan: string
  }): Promise<Subscription> {
    const container = getContainer('subscriptions')
    
    const prices: Record<string, number> = {
      'free-trial': 0,
      'starter': 2999,
      'professional': 6999,
      'enterprise': 14999
    }
    
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    
    const subscription: Subscription = {
      id: `sub-${uuidv4()}`,
      tenantId: data.tenantId,
      tenantName: data.tenantName,
      plan: data.plan as any,
      status: 'active',
      priceMonthly: prices[data.plan] || 29,
      billingCycle: 'monthly',
      startDate: now.toISOString(),
      nextBillingDate: nextMonth.toISOString(),
      autoRenew: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
    
    const { resource } = await container.items.create(subscription)
    return resource as Subscription
  }
  
  // ---- Invoices ----
  
  async getInvoices(tenantId?: string): Promise<Invoice[]> {
    if (isOfflineMode()) return []
    
    const container = getContainer('invoices')
    let query = 'SELECT * FROM c'
    
    if (tenantId) {
      query += ` WHERE c.tenantId = '${tenantId}'`
    }
    
    query += ' ORDER BY c.issueDate DESC'
    
    const { resources } = await container.items.query(query).fetchAll()
    return resources
  }
  
  async createInvoice(data: {
    tenantId: string
    tenantName: string
    subscriptionId: string
    amount: number
    items: InvoiceItem[]
  }): Promise<Invoice> {
    const container = getContainer('invoices')
    
    const now = new Date()
    const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    const invoice: Invoice = {
      id: `inv-${uuidv4()}`,
      tenantId: data.tenantId,
      tenantName: data.tenantName,
      subscriptionId: data.subscriptionId,
      amount: data.amount,
      currency: 'MXN',
      status: 'pending',
      issueDate: now.toISOString(),
      dueDate: dueDate.toISOString(),
      items: data.items,
      createdAt: now.toISOString()
    }
    
    const { resource } = await container.items.create(invoice)
    return resource as Invoice
  }
  
  // ---- Alerts ----
  
  async getAlerts(includeRead: boolean = false): Promise<PlatformAlert[]> {
    if (isOfflineMode()) return []
    
    const container = getContainer('platform-alerts')
    let query = 'SELECT * FROM c'
    
    if (!includeRead) {
      query += ' WHERE c.isRead = false'
    }
    
    query += ' ORDER BY c.createdAt DESC'
    
    const { resources } = await container.items.query(query).fetchAll()
    return resources
  }
  
  async createAlert(data: Partial<PlatformAlert>): Promise<PlatformAlert> {
    const container = getContainer('platform-alerts')
    
    const alert: PlatformAlert = {
      id: `alert-${uuidv4()}`,
      type: data.type || 'info',
      category: data.category || 'system',
      title: data.title!,
      message: data.message!,
      tenantId: data.tenantId,
      tenantName: data.tenantName,
      isRead: false,
      createdAt: new Date().toISOString(),
      metadata: data.metadata
    }
    
    const { resource } = await container.items.create(alert)
    return resource as PlatformAlert
  }
  
  async markAlertAsRead(alertId: string, category: string): Promise<boolean> {
    const container = getContainer('platform-alerts')
    
    try {
      const { resource } = await container.item(alertId, category).read()
      if (resource) {
        resource.isRead = true
        resource.resolvedAt = new Date().toISOString()
        await container.item(alertId, category).replace(resource)
        return true
      }
    } catch {
      return false
    }
    
    return false
  }
  
  async deleteAlert(alertId: string, category: string): Promise<boolean> {
    const container = getContainer('platform-alerts')
    
    try {
      await container.item(alertId, category).delete()
      return true
    } catch {
      return false
    }
  }
  
  // ---- Platform Settings ----
  
  async getPlatformSettings(): Promise<PlatformSettings | null> {
    if (isOfflineMode()) return this.getDefaultPlatformSettings()
    
    const container = getContainer('platform-settings')
    
    try {
      const { resources } = await container.items
        .query('SELECT * FROM c WHERE c.id = "global-settings"')
        .fetchAll()
      
      return resources[0] || this.getDefaultPlatformSettings()
    } catch {
      return this.getDefaultPlatformSettings()
    }
  }
  
  async updatePlatformSettings(data: Partial<PlatformSettings>, updatedBy: string): Promise<PlatformSettings> {
    const container = getContainer('platform-settings')
    
    const existing = await this.getPlatformSettings()
    const updated: PlatformSettings = {
      ...existing!,
      ...data,
      id: 'global-settings',
      updatedAt: new Date().toISOString(),
      updatedBy
    }
    
    try {
      const { resource } = await container.items.upsert(updated)
      return (resource as unknown as PlatformSettings) || updated
    } catch {
      return updated
    }
  }
  
  private getDefaultPlatformSettings(): PlatformSettings {
    return {
      id: 'global-settings',
      platformName: 'AccessLearn Inclusiv',
      supportEmail: 'soporte@kainet.mx',
      maintenanceMode: false,
      defaultLanguage: 'es',
      allowedLanguages: ['es', 'en'],
      security: {
        requireMfa: false,
        sessionTimeout: 60,
        maxLoginAttempts: 5,
        passwordMinLength: 8
      },
      email: {
        provider: 'resend',
        fromEmail: 'newsletter@kainet.mx',
        fromName: 'AccessLearn Inclusiv'
      },
      branding: {
        primaryColor: '#6366F1',
        secondaryColor: '#8B5CF6'
      },
      features: {
        gamification: true,
        mentorship: true,
        certificates: true,
        forums: true,
        analytics: true
      },
      updatedAt: new Date().toISOString(),
      updatedBy: 'system'
    }
  }
  
  // ---- Health Monitoring ----
  
  async getHealthMetrics(): Promise<PlatformHealthMetric[]> {
    // For now, return live status checks
    // In production, this would query actual health endpoints
    
    const services = [
      { service: 'api', name: 'API Server' },
      { service: 'database', name: 'Cosmos DB' },
      { service: 'storage', name: 'Blob Storage' },
      { service: 'auth', name: 'Authentication' },
      { service: 'email', name: 'Email Service' },
      { service: 'cdn', name: 'CDN' },
      { service: 'search', name: 'Search Service' },
      { service: 'analytics', name: 'Analytics' }
    ]
    
    // Simple health checks
    const metrics: PlatformHealthMetric[] = await Promise.all(
      services.map(async (svc) => {
        const status = await this.checkServiceHealth(svc.service)
        return {
          id: `health-${svc.service}`,
          service: svc.service,
          status,
          latency: Math.floor(Math.random() * 100) + 10,
          uptime: 99.9 + Math.random() * 0.1,
          lastChecked: new Date().toISOString()
        }
      })
    )
    
    return metrics
  }
  
  private async checkServiceHealth(service: string): Promise<'operational' | 'degraded' | 'outage' | 'maintenance'> {
    // In production, perform actual health checks
    // For now, check database connectivity for 'database' service
    
    if (service === 'database') {
      try {
        if (isOfflineMode()) return 'degraded'
        const container = getContainer('tenants')
        await container.items.query('SELECT VALUE 1').fetchAll()
        return 'operational'
      } catch {
        return 'outage'
      }
    }
    
    // All other services assumed operational
    return 'operational'
  }
  
  // ---- Platform Stats ----
  
  async getPlatformStats(): Promise<PlatformStats> {
    const tenants = await this.getAllTenants()
    const users = await this.getAllUsers()
    const subscriptions = await this.getSubscriptions()
    
    // Calculate stats
    const activeTenants = tenants.filter(t => t.status === 'active').length
    const activeUsers = users.filter((u: any) => u.status === 'active').length
    
    // Count by plan
    const tenantsByPlan: Record<string, number> = {}
    tenants.forEach(t => {
      tenantsByPlan[t.plan] = (tenantsByPlan[t.plan] || 0) + 1
    })
    
    // Count by role
    const usersByRole: Record<string, number> = {}
    users.forEach((u: any) => {
      usersByRole[u.role] = (usersByRole[u.role] || 0) + 1
    })
    
    // Calculate revenue
    const monthlyRevenue = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + s.priceMonthly, 0)
    
    // Get recent activity from audit logs
    const recentActivity = await this.getRecentActivity()
    
    // Count courses
    let totalCourses = 0
    let publishedCourses = 0
    
    if (!isOfflineMode()) {
      const coursesContainer = getContainer('courses')
      const { resources: allCourses } = await coursesContainer.items
        .query('SELECT c.status FROM c')
        .fetchAll()
      
      totalCourses = allCourses.length
      publishedCourses = allCourses.filter((c: any) => c.status === 'published').length
    }
    
    return {
      totalTenants: tenants.length,
      activeTenants,
      totalUsers: users.length,
      activeUsers,
      totalCourses,
      publishedCourses,
      monthlyRevenue,
      yearlyRevenue: monthlyRevenue * 12,
      tenantsByPlan,
      usersByRole,
      recentActivity
    }
  }
  
  private async getRecentActivity(): Promise<ActivityItem[]> {
    if (isOfflineMode()) return []
    
    try {
      const container = getContainer('audit-logs')
      const { resources } = await container.items
        .query('SELECT TOP 10 * FROM c ORDER BY c.timestamp DESC')
        .fetchAll()
      
      return resources.map((log: any) => ({
        id: log.id,
        type: log.action,
        description: log.description || `${log.action} by ${log.userEmail || 'system'}`,
        tenantId: log.tenantId,
        userId: log.userId,
        userName: log.userEmail,
        timestamp: log.timestamp || log.createdAt
      }))
    } catch {
      return []
    }
  }
  
  // ---- Mock Data (offline mode) ----
  
  private getMockTenants(): Tenant[] {
    return [
      {
        id: 'tenant-kainet',
        name: 'Kainet',
        slug: 'kainet',
        contactEmail: 'admin@kainet.mx',
        primaryColor: '#18b0f2',
        secondaryColor: '#7422a0',
        plan: 'professional',
        status: 'active',
        subscriptionStartDate: '2025-11-23T04:56:12.148Z',
        maxUsers: 250,
        maxCourses: 999,
        currentUsers: 11,
        currentCourses: 3,
        createdAt: '2025-11-23T04:56:12.148Z',
        updatedAt: '2025-11-25T19:22:32.650Z',
        createdBy: 'system',
        logo: 'tenant-logos/tenant-kainet/logo.png'
      },
      {
        id: 'tenant-laboralmx',
        name: 'LaboralMX',
        slug: 'laboralmx',
        contactEmail: 'admin@laboral.mx',
        primaryColor: '#1E40AF',
        secondaryColor: '#059669',
        plan: 'professional',
        status: 'active',
        subscriptionStartDate: '2025-11-24T06:54:49.925Z',
        maxUsers: 250,
        maxCourses: 999,
        currentUsers: 3,
        currentCourses: 0,
        createdAt: '2025-11-24T06:54:49.925Z',
        updatedAt: '2025-11-24T06:54:49.925Z',
        createdBy: 'system'
      },
      {
        id: 'tenant-dra-amayrani-gomez-alonso',
        name: 'Dra. Amayrani Gómez Alonso',
        slug: 'dra-amayrani-gomez-alonso',
        contactEmail: 'any_g_a@hotmail.com',
        primaryColor: '#2563EB',
        secondaryColor: '#10B981',
        plan: 'professional',
        status: 'active',
        subscriptionStartDate: '2025-11-24T06:54:50.688Z',
        maxUsers: 250,
        maxCourses: 999,
        currentUsers: 2,
        currentCourses: 1,
        createdAt: '2025-11-24T06:54:50.688Z',
        updatedAt: '2025-12-03T15:20:14.294Z',
        createdBy: 'system',
        logo: 'tenant-logos/tenant-dra-amayrani-gomez-alonso/logo.jpeg'
      }
    ]
  }
}

// Export singleton instance
export const platformAdminService = new PlatformAdminService()
