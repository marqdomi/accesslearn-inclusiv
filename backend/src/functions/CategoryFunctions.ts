/**
 * Category Functions
 * 
 * Manages custom course categories stored in Cosmos DB
 */

import { getContainer } from '../services/cosmosdb.service'

export interface Category {
  id: string
  tenantId: string
  name: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

/**
 * Get all categories for a tenant
 */
export async function getCategories(tenantId: string): Promise<Category[]> {
  const container = getContainer('categories')
  
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId ORDER BY c.name',
    parameters: [
      { name: '@tenantId', value: tenantId }
    ]
  }
  
  const { resources } = await container.items.query<Category>(query).fetchAll()
  return resources
}

/**
 * Create a new category
 */
export async function createCategory(
  tenantId: string,
  name: string,
  userId: string
): Promise<Category> {
  const container = getContainer('categories')
  
  // Check if category already exists
  const existing = await getCategories(tenantId)
  const normalizedName = name.trim()
  
  if (existing.some(c => c.name.toLowerCase() === normalizedName.toLowerCase())) {
    throw new Error('Category already exists')
  }
  
  const now = new Date().toISOString()
  const category: Category = {
    id: `category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tenantId,
    name: normalizedName,
    createdBy: userId,
    createdAt: now,
    updatedAt: now
  }
  
  const { resource } = await container.items.create<Category>(category)
  return resource!
}

/**
 * Delete a category
 */
export async function deleteCategory(
  categoryId: string,
  tenantId: string
): Promise<void> {
  const container = getContainer('categories')
  
  await container.item(categoryId, tenantId).delete()
}

