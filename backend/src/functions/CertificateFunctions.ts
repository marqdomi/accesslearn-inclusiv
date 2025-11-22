/**
 * Certificate Functions
 * 
 * Manages certificates in Cosmos DB
 */

import { getContainer } from '../services/cosmosdb.service'
import { v4 as uuidv4 } from 'uuid'

export interface Certificate {
  id: string
  tenantId: string
  userId: string
  courseId: string
  courseTitle: string
  completionDate: string // ISO 8601
  certificateCode: string
  userFullName: string
  issuedBy?: string
  createdAt: string
  updatedAt: string
}

/**
 * Generate a unique certificate code
 */
function generateCertificateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Get all certificates for a user
 */
export async function getUserCertificates(
  userId: string,
  tenantId: string
): Promise<Certificate[]> {
  const container = getContainer('certificates')
  
  const query = {
    query: 'SELECT * FROM c WHERE c.userId = @userId AND c.tenantId = @tenantId ORDER BY c.completionDate DESC',
    parameters: [
      { name: '@userId', value: userId },
      { name: '@tenantId', value: tenantId }
    ]
  }
  
  const { resources } = await container.items.query<Certificate>(query).fetchAll()
  return resources
}

/**
 * Get certificate by ID
 */
export async function getCertificateById(
  certificateId: string,
  tenantId: string
): Promise<Certificate | null> {
  const container = getContainer('certificates')
  
  try {
    const { resource } = await container.item(certificateId, tenantId).read<Certificate>()
    return resource || null
  } catch (error: any) {
    if (error.code === 404) {
      return null
    }
    throw error
  }
}

/**
 * Get certificate by code (for verification)
 */
export async function getCertificateByCode(
  certificateCode: string,
  tenantId: string
): Promise<Certificate | null> {
  const container = getContainer('certificates')
  
  const query = {
    query: 'SELECT * FROM c WHERE c.certificateCode = @code AND c.tenantId = @tenantId',
    parameters: [
      { name: '@code', value: certificateCode },
      { name: '@tenantId', value: tenantId }
    ]
  }
  
  const { resources } = await container.items.query<Certificate>(query).fetchAll()
  return resources.length > 0 ? resources[0] : null
}

/**
 * Get certificate for a user and course
 */
export async function getCertificateByUserAndCourse(
  userId: string,
  courseId: string,
  tenantId: string
): Promise<Certificate | null> {
  const container = getContainer('certificates')
  
  const query = {
    query: 'SELECT * FROM c WHERE c.userId = @userId AND c.courseId = @courseId AND c.tenantId = @tenantId',
    parameters: [
      { name: '@userId', value: userId },
      { name: '@courseId', value: courseId },
      { name: '@tenantId', value: tenantId }
    ]
  }
  
  const { resources } = await container.items.query<Certificate>(query).fetchAll()
  return resources.length > 0 ? resources[0] : null
}

/**
 * Create a new certificate
 */
export async function createCertificate(
  tenantId: string,
  userId: string,
  courseId: string,
  courseTitle: string,
  userFullName: string,
  issuedBy?: string
): Promise<Certificate> {
  const container = getContainer('certificates')
  
  const now = new Date().toISOString()
  const certificate: Certificate = {
    id: `cert-${uuidv4()}`,
    tenantId,
    userId,
    courseId,
    courseTitle,
    completionDate: now,
    certificateCode: generateCertificateCode(),
    userFullName,
    issuedBy,
    createdAt: now,
    updatedAt: now
  }
  
  const { resource } = await container.items.create<Certificate>(certificate)
  return resource!
}

/**
 * Delete a certificate
 */
export async function deleteCertificate(
  certificateId: string,
  tenantId: string
): Promise<void> {
  const container = getContainer('certificates')
  await container.item(certificateId, tenantId).delete()
}

/**
 * Get all certificates for a course
 */
export async function getCourseCertificates(
  courseId: string,
  tenantId: string
): Promise<Certificate[]> {
  const container = getContainer('certificates')
  
  const query = {
    query: 'SELECT * FROM c WHERE c.courseId = @courseId AND c.tenantId = @tenantId ORDER BY c.completionDate DESC',
    parameters: [
      { name: '@courseId', value: courseId },
      { name: '@tenantId', value: tenantId }
    ]
  }
  
  const { resources } = await container.items.query<Certificate>(query).fetchAll()
  return resources
}

