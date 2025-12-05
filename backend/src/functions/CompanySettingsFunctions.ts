/**
 * Company Settings Functions
 * 
 * Manages company settings in Cosmos DB
 */

import { getContainer } from '../services/cosmosdb.service'

export interface CompanySettings {
  id: string
  tenantId: string
  companyName: string
  companyLogo?: string
  createdAt: string
  updatedAt: string
}

/**
 * Get company settings for a tenant
 */
export async function getCompanySettings(tenantId: string): Promise<CompanySettings | null> {
  const container = getContainer('company-settings')
  
  try {
    // Use tenantId as the id for company settings (one per tenant)
    const { resource } = await container.item(tenantId, tenantId).read<CompanySettings>()
    return resource || null
  } catch (error: any) {
    if (error.code === 404) {
      return null
    }
    throw error
  }
}

/**
 * Create or update company settings
 */
export async function upsertCompanySettings(
  tenantId: string,
  companyName: string,
  companyLogo?: string
): Promise<CompanySettings> {
  const container = getContainer('company-settings')
  
  const now = new Date().toISOString()
  
  // Check if settings already exist
  const existing = await getCompanySettings(tenantId)
  
  const settings: CompanySettings = {
    id: tenantId,
    tenantId,
    companyName,
    companyLogo,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  }
  
  const { resource } = await container.items.upsert<CompanySettings>(settings)
  return resource!
}

