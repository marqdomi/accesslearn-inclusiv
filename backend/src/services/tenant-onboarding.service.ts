/**
 * Tenant Onboarding Service
 * Handles public self-service tenant registration with Stripe checkout
 */

import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import { getContainer } from './cosmosdb.service'
import { BillingPlan, PLAN_CATALOG } from '../types/billing.types'
import { emailService } from './email.service'

const BCRYPT_ROUNDS = 12

export interface TenantSignupRequest {
  // Organization
  organizationName: string
  slug: string
  contactEmail: string
  contactPhone?: string

  // Admin user
  adminFirstName: string
  adminLastName: string
  adminEmail: string
  adminPassword: string

  // Plan selection
  plan: BillingPlan

  // Optional Mexican compliance
  rfc?: string
  businessName?: string
}

export interface TenantSignupResult {
  success: boolean
  tenant?: {
    id: string
    name: string
    slug: string
    plan: BillingPlan
  }
  adminUser?: {
    id: string
    email: string
  }
  checkoutUrl?: string  // If paid plan, redirect to Stripe
  error?: string
}

/**
 * Register a new tenant with admin user (self-service)
 */
export async function selfServiceTenantSignup(
  request: TenantSignupRequest
): Promise<TenantSignupResult> {
  // Validate inputs
  if (!request.organizationName || !request.slug || !request.adminEmail || !request.adminPassword) {
    return { success: false, error: 'Todos los campos obligatorios deben ser completados.' }
  }

  if (request.adminPassword.length < 8) {
    return { success: false, error: 'La contraseña debe tener al menos 8 caracteres.' }
  }

  // Validate slug format
  const slugRegex = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
  if (!slugRegex.test(request.slug)) {
    return { success: false, error: 'El slug solo puede contener letras minúsculas, números y guiones.' }
  }

  const tenantsContainer = getContainer('tenants')
  const usersContainer = getContainer('users')

  try {
    // Check slug uniqueness
    const { resources: existingSlugs } = await tenantsContainer.items
      .query({
        query: 'SELECT c.id FROM c WHERE c.slug = @slug',
        parameters: [{ name: '@slug', value: request.slug }],
      })
      .fetchAll()

    if (existingSlugs.length > 0) {
      return { success: false, error: 'Este slug ya está en uso. Elige otro nombre para tu organización.' }
    }

    // Check admin email uniqueness across all tenants
    const { resources: existingEmails } = await usersContainer.items
      .query({
        query: 'SELECT c.id FROM c WHERE c.email = @email',
        parameters: [{ name: '@email', value: request.adminEmail }],
      })
      .fetchAll()

    if (existingEmails.length > 0) {
      return { success: false, error: 'Este email ya está registrado en la plataforma.' }
    }

    // Get plan limits
    const planDef = PLAN_CATALOG.find(p => p.id === request.plan)
    if (!planDef) {
      return { success: false, error: 'Plan no válido.' }
    }

    const now = new Date().toISOString()
    const tenantId = `tenant-${request.slug}`

    // Calculate trial end for free-trial
    let trialEndsAt: string | undefined
    if (request.plan === 'free-trial') {
      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 14)
      trialEndsAt = trialEnd.toISOString()
    }

    // Create tenant
    const tenant = {
      id: tenantId,
      name: request.organizationName,
      slug: request.slug,
      contactEmail: request.contactEmail || request.adminEmail,
      contactPhone: request.contactPhone,
      primaryColor: '#4F46E5',
      secondaryColor: '#10B981',
      plan: request.plan,
      status: 'active',
      trialEndsAt,
      subscriptionStartDate: now,
      maxUsers: planDef.limits.maxUsers,
      maxCourses: planDef.limits.maxCourses,
      rfc: request.rfc,
      businessName: request.businessName,
      createdAt: now,
      updatedAt: now,
      createdBy: 'self-service',
    }

    await tenantsContainer.items.create(tenant)

    // Create admin user with hashed password
    const userId = `user-${uuidv4()}`
    const hashedPassword = await bcrypt.hash(request.adminPassword, BCRYPT_ROUNDS)

    const adminUser = {
      id: userId,
      tenantId,
      email: request.adminEmail,
      firstName: request.adminFirstName,
      lastName: request.adminLastName,
      role: 'tenant-admin',
      status: 'active',
      password: hashedPassword,
      passwordResetRequired: false,
      enrolledCourses: [],
      completedCourses: [],
      totalXP: 0,
      level: 1,
      badges: [],
      createdAt: now,
      updatedAt: now,
    }

    await usersContainer.items.create(adminUser)

    // Send welcome email
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
      await emailService.sendWelcomeEmail({
        recipientEmail: request.adminEmail,
        recipientName: `${request.adminFirstName} ${request.adminLastName}`,
        tenantName: request.organizationName,
        loginUrl: `${frontendUrl}/${request.slug}/login`,
      })
    } catch (emailErr) {
      console.warn('[Onboarding] Welcome email failed but signup completed:', emailErr)
    }

    return {
      success: true,
      tenant: {
        id: tenantId,
        name: request.organizationName,
        slug: request.slug,
        plan: request.plan,
      },
      adminUser: {
        id: userId,
        email: request.adminEmail,
      },
    }
  } catch (error: any) {
    console.error('[Onboarding] Tenant signup error:', error)
    return { success: false, error: 'Error al crear la organización. Intenta de nuevo.' }
  }
}

/**
 * Check if a slug is available
 */
export async function checkSlugAvailability(slug: string): Promise<boolean> {
  const tenantsContainer = getContainer('tenants')
  const { resources } = await tenantsContainer.items
    .query({
      query: 'SELECT c.id FROM c WHERE c.slug = @slug',
      parameters: [{ name: '@slug', value: slug }],
    })
    .fetchAll()
  return resources.length === 0
}
