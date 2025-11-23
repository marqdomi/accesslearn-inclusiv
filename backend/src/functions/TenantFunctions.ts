import { getContainer } from "../services/cosmosdb.service"
import { Tenant, CreateTenantRequest } from "../models/Tenant"

// Plan limits
const PLAN_LIMITS = {
  demo: { maxUsers: 50, maxCourses: 10, trialDays: 60 },
  profesional: { maxUsers: 200, maxCourses: 50, trialDays: 0 },
  enterprise: { maxUsers: 1000, maxCourses: 500, trialDays: 0 }
}

export async function createTenant(
  request: CreateTenantRequest
): Promise<Tenant> {
  const container = getContainer("tenants")

  // Validate slug is unique
  const existingSlug = await getTenantBySlug(request.slug)
  if (existingSlug) {
    throw new Error(`Tenant with slug "${request.slug}" already exists`)
  }

  // Get plan limits
  const limits = PLAN_LIMITS[request.plan]

  // Calculate trial end date for demo plan
  let trialEndsAt: string | undefined
  if (request.plan === "demo") {
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + limits.trialDays)
    trialEndsAt = trialEnd.toISOString()
  }

  // Create tenant object
  const tenant: Tenant = {
    id: `tenant-${request.slug}`,
    name: request.name,
    slug: request.slug,
    contactEmail: request.contactEmail,
    contactPhone: request.contactPhone,
    
    // Branding
    logo: request.logo,
    primaryColor: request.primaryColor || "#4F46E5", // Indigo default
    secondaryColor: request.secondaryColor || "#10B981", // Green default
    
    // Subscription
    plan: request.plan,
    status: "active",
    trialEndsAt,
    subscriptionStartDate: new Date().toISOString(),
    
    // Limits
    maxUsers: limits.maxUsers,
    maxCourses: limits.maxCourses,
    
    // Mexican compliance
    rfc: request.rfc,
    businessName: request.businessName,
    address: request.address,
    
    // Metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "system" // TODO: Replace with actual admin user ID
  }

  // Insert into Cosmos DB
  const { resource } = await container.items.create(tenant)

  if (!resource) {
    throw new Error("Failed to create tenant")
  }

  return resource as Tenant
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const container = getContainer("tenants")

  const query = {
    query: "SELECT * FROM c WHERE c.slug = @slug",
    parameters: [
      {
        name: "@slug",
        value: slug
      }
    ]
  }

  const { resources } = await container.items.query<Tenant>(query).fetchAll()

  return resources.length > 0 ? resources[0] : null
}

export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  const container = getContainer("tenants")

  try {
    const { resource } = await container.item(tenantId, tenantId).read<Tenant>()
    return resource || null
  } catch (error: any) {
    if (error.code === 404) {
      return null
    }
    throw error
  }
}

export async function listTenants(): Promise<Tenant[]> {
  const container = getContainer("tenants")

  const query = "SELECT * FROM c ORDER BY c.createdAt DESC"

  const { resources } = await container.items.query<Tenant>(query).fetchAll()

  return resources
}

export async function updateTenantStatus(
  tenantId: string,
  status: "active" | "suspended" | "canceled"
): Promise<Tenant> {
  const container = getContainer("tenants")

  const tenant = await getTenantById(tenantId)
  if (!tenant) {
    throw new Error(`Tenant ${tenantId} not found`)
  }

  tenant.status = status
  tenant.updatedAt = new Date().toISOString()

  const { resource } = await container
    .item(tenantId, tenantId)
    .replace(tenant)

  if (!resource) {
    throw new Error("Failed to update tenant")
  }

  return resource as Tenant
}

export interface UpdateTenantRequest {
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
}

export async function updateTenant(
  tenantId: string,
  updates: UpdateTenantRequest
): Promise<Tenant> {
  const container = getContainer("tenants")

  const tenant = await getTenantById(tenantId)
  if (!tenant) {
    throw new Error(`Tenant ${tenantId} not found`)
  }

  // Update allowed fields
  if (updates.name !== undefined) tenant.name = updates.name
  if (updates.contactEmail !== undefined) tenant.contactEmail = updates.contactEmail
  if (updates.contactPhone !== undefined) tenant.contactPhone = updates.contactPhone
  if (updates.logo !== undefined) tenant.logo = updates.logo
  if (updates.primaryColor !== undefined) tenant.primaryColor = updates.primaryColor
  if (updates.secondaryColor !== undefined) tenant.secondaryColor = updates.secondaryColor
  if (updates.domain !== undefined) tenant.domain = updates.domain
  if (updates.rfc !== undefined) tenant.rfc = updates.rfc
  if (updates.businessName !== undefined) tenant.businessName = updates.businessName
  if (updates.address !== undefined) tenant.address = updates.address

  tenant.updatedAt = new Date().toISOString()

  const { resource } = await container
    .item(tenantId, tenantId)
    .replace(tenant)

  if (!resource) {
    throw new Error("Failed to update tenant")
  }

  return resource as Tenant
}
