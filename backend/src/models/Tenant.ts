import { BillingPlan } from '../types/billing.types'

export interface Tenant {
  id: string
  name: string
  slug: string // URL-friendly name (e.g., "kainet", "empresa-demo")
  domain?: string // Custom domain (opcional)
  
  // Branding
  logo?: string // URL del logo
  primaryColor?: string
  secondaryColor?: string
  
  // Contact Info
  contactEmail: string
  contactPhone?: string
  
  // Subscription
  plan: BillingPlan
  status: "active" | "suspended" | "canceled"
  trialEndsAt?: string // ISO date
  subscriptionStartDate: string
  
  // Limits based on plan
  maxUsers: number
  maxCourses: number
  
  // Mexican Compliance (optional)
  rfc?: string
  businessName?: string
  address?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string // Admin user ID who created tenant
}

export interface CreateTenantRequest {
  name: string
  slug: string
  contactEmail: string
  contactPhone?: string
  plan: BillingPlan
  
  // Optional branding
  logo?: string
  primaryColor?: string
  secondaryColor?: string
  
  // Optional Mexican compliance
  rfc?: string
  businessName?: string
  address?: string
}
