/**
 * Certificate Template Functions
 * 
 * Manages certificate template configurations in Cosmos DB
 * Each tenant can have their own certificate design settings
 */

import { getContainer } from '../services/cosmosdb.service'

export interface CertificateTemplate {
  id: string
  tenantId: string
  // Colors
  primaryColor: string // Main border and title color
  secondaryColor: string // Secondary border color
  accentColor: string // Accent elements
  textColor: string // Main text color
  secondaryTextColor: string // Secondary text color
  // Typography
  titleFont: string // Font family for certificate title
  nameFont: string // Font family for user name
  bodyFont: string // Font family for body text
  titleFontSize: number // Title font size
  nameFontSize: number // Name font size
  bodyFontSize: number // Body font size
  // Layout
  borderWidth: number // Border thickness
  borderStyle: 'solid' | 'double' | 'gradient' // Border style
  showDecorativeGradient: boolean // Show decorative gradient at bottom
  logoSize: number // Logo size in pixels
  // Text customization
  certificateTitle: string // Custom title text (e.g., "Certificate of Completion")
  awardedToText: string // Custom "awarded to" text
  completionText: string // Custom "completion" text
  signatureText: string // Custom signature label
  // Metadata
  createdAt: string
  updatedAt: string
}

const DEFAULT_TEMPLATE: Omit<CertificateTemplate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'> = {
  primaryColor: '#8B5CF6',
  secondaryColor: '#D8B4FE',
  accentColor: '#8B5CF6',
  textColor: '#1a1a1a',
  secondaryTextColor: '#666666',
  titleFont: 'Poppins',
  nameFont: 'Poppins',
  bodyFont: 'Poppins',
  titleFontSize: 80,
  nameFontSize: 72,
  bodyFontSize: 40,
  borderWidth: 8,
  borderStyle: 'solid',
  showDecorativeGradient: true,
  logoSize: 120,
  certificateTitle: 'Certificado de Completación',
  awardedToText: 'Este certificado se otorga a',
  completionText: 'por la completación exitosa de',
  signatureText: 'Firma Autorizada'
}

/**
 * Get certificate template for a tenant
 */
export async function getCertificateTemplate(tenantId: string): Promise<CertificateTemplate | null> {
  const container = getContainer('certificate-templates')
  
  try {
    // Use tenantId as the id for certificate template (one per tenant)
    const { resource } = await container.item(tenantId, tenantId).read<CertificateTemplate>()
    return resource || null
  } catch (error: any) {
    if (error.code === 404) {
      return null
    }
    throw error
  }
}

/**
 * Get certificate template with defaults
 */
export async function getCertificateTemplateWithDefaults(tenantId: string): Promise<CertificateTemplate> {
  const template = await getCertificateTemplate(tenantId)
  
  if (template) {
    return template
  }
  
  // Return default template
  const now = new Date().toISOString()
  return {
    id: tenantId,
    tenantId,
    ...DEFAULT_TEMPLATE,
    createdAt: now,
    updatedAt: now
  }
}

/**
 * Create or update certificate template
 */
export async function upsertCertificateTemplate(
  tenantId: string,
  template: Partial<Omit<CertificateTemplate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>
): Promise<CertificateTemplate> {
  const container = getContainer('certificate-templates')
  
  const now = new Date().toISOString()
  
  // Get existing template or use defaults
  const existing = await getCertificateTemplate(tenantId)
  
  const updatedTemplate: CertificateTemplate = {
    id: tenantId,
    tenantId,
    ...DEFAULT_TEMPLATE,
    ...existing,
    ...template,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  }
  
  const { resource } = await container.items.upsert<CertificateTemplate>(updatedTemplate)
  return resource!
}

