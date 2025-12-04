/**
 * Accessibility Profile Functions
 * 
 * Manages accessibility profiles stored in Cosmos DB
 */

import { getContainer } from '../services/cosmosdb.service'
import { AccessibilityProfile, AdvancedPreferences } from '../models/AccessibilityProfile'

/**
 * Get all accessibility profiles for a tenant
 */
export async function getAccessibilityProfiles(tenantId: string): Promise<AccessibilityProfile[]> {
  const container = getContainer('accessibility-profiles')
  
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId ORDER BY c.isDefault DESC, c.name',
    parameters: [
      { name: '@tenantId', value: tenantId }
    ]
  }
  
  const { resources } = await container.items.query<AccessibilityProfile>(query).fetchAll()
  return resources
}

/**
 * Get only enabled accessibility profiles (for end users)
 */
export async function getEnabledAccessibilityProfiles(tenantId: string): Promise<AccessibilityProfile[]> {
  const container = getContainer('accessibility-profiles')
  
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.enabled = true ORDER BY c.isDefault DESC, c.name',
    parameters: [
      { name: '@tenantId', value: tenantId }
    ]
  }
  
  const { resources } = await container.items.query<AccessibilityProfile>(query).fetchAll()
  return resources
}

/**
 * Get a specific accessibility profile
 */
export async function getAccessibilityProfile(
  profileId: string,
  tenantId: string
): Promise<AccessibilityProfile | null> {
  const container = getContainer('accessibility-profiles')
  
  try {
    const { resource } = await container.item(profileId, tenantId).read<AccessibilityProfile>()
    return resource || null
  } catch (error: any) {
    if (error.code === 404) {
      return null
    }
    throw error
  }
}

/**
 * Create a new accessibility profile
 */
export async function createAccessibilityProfile(
  profile: Omit<AccessibilityProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AccessibilityProfile> {
  const container = getContainer('accessibility-profiles')
  
  // Validate input
  if (!profile.name || !profile.name.trim()) {
    throw new Error('Profile name cannot be empty')
  }
  
  if (!profile.description || !profile.description.trim()) {
    throw new Error('Profile description cannot be empty')
  }
  
  // Check for duplicate names in the same tenant
  const existingProfiles = await getAccessibilityProfiles(profile.tenantId)
  const duplicateName = existingProfiles.find(
    p => p.name.toLowerCase().trim() === profile.name.toLowerCase().trim()
  )
  
  if (duplicateName) {
    throw new Error('A profile with this name already exists')
  }
  
  // Generate ID
  const id = `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()
  
  const newProfile: AccessibilityProfile = {
    ...profile,
    id,
    createdAt: now,
    updatedAt: now,
    isDefault: false, // Custom profiles are never default
  }
  
  const { resource } = await container.items.create(newProfile)
  
  if (!resource) {
    throw new Error('Failed to create accessibility profile')
  }
  
  return resource
}

/**
 * Update an accessibility profile
 */
export async function updateAccessibilityProfile(
  profileId: string,
  tenantId: string,
  updates: Partial<Omit<AccessibilityProfile, 'id' | 'tenantId' | 'createdAt' | 'isDefault'>>
): Promise<AccessibilityProfile> {
  const container = getContainer('accessibility-profiles')
  
  // Get existing profile
  const existing = await getAccessibilityProfile(profileId, tenantId)
  if (!existing) {
    throw new Error('Accessibility profile not found')
  }
  
  // If updating name, check for duplicates
  if (updates.name && updates.name.trim() !== existing.name.trim()) {
    const existingProfiles = await getAccessibilityProfiles(tenantId)
    const duplicateName = existingProfiles.find(
      p => p.id !== profileId && p.name.toLowerCase().trim() === updates.name!.toLowerCase().trim()
    )
    
    if (duplicateName) {
      throw new Error('A profile with this name already exists')
    }
  }
  
  const updatedProfile: AccessibilityProfile = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  const { resource } = await container.item(profileId, tenantId).replace(updatedProfile)
  
  if (!resource) {
    throw new Error('Failed to update accessibility profile')
  }
  
  return resource
}

/**
 * Delete an accessibility profile (only custom profiles can be deleted)
 */
export async function deleteAccessibilityProfile(
  profileId: string,
  tenantId: string
): Promise<void> {
  const container = getContainer('accessibility-profiles')
  
  // Get existing profile
  const existing = await getAccessibilityProfile(profileId, tenantId)
  if (!existing) {
    throw new Error('Accessibility profile not found')
  }
  
  // Cannot delete default profiles
  if (existing.isDefault) {
    throw new Error('Cannot delete default system profiles')
  }
  
  await container.item(profileId, tenantId).delete()
}

/**
 * Toggle profile enabled status
 */
export async function toggleAccessibilityProfileEnabled(
  profileId: string,
  tenantId: string,
  enabled: boolean
): Promise<AccessibilityProfile> {
  return updateAccessibilityProfile(profileId, tenantId, { enabled })
}

/**
 * Duplicate an accessibility profile
 */
export async function duplicateAccessibilityProfile(
  profileId: string,
  tenantId: string,
  newName: string,
  createdBy?: string
): Promise<AccessibilityProfile> {
  const existing = await getAccessibilityProfile(profileId, tenantId)
  if (!existing) {
    throw new Error('Accessibility profile not found')
  }
  
  const duplicatedProfile: Omit<AccessibilityProfile, 'id' | 'createdAt' | 'updatedAt'> = {
    tenantId: existing.tenantId,
    name: newName,
    description: `${existing.description} (Copia)`,
    icon: existing.icon,
    enabled: false, // Start disabled
    isDefault: false,
    settings: { ...existing.settings },
    metadata: {
      ...existing.metadata,
      benefits: [...existing.metadata.benefits],
    },
    createdBy,
  }
  
  return createAccessibilityProfile(duplicatedProfile)
}

