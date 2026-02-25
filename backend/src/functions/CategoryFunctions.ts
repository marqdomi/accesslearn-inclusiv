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
  try {
  const container = getContainer('categories')
    
    // Validate input
    const normalizedName = name.trim()
    if (!normalizedName) {
      throw new Error('Category name cannot be empty')
    }
  
  // Check if category already exists
  const existing = await getCategories(tenantId)
  
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
    
    if (!resource) {
      throw new Error('Failed to create category in database')
    }
    
    return resource
  } catch (error: any) {
    // Re-throw known errors
    if (error.message === 'Category already exists' || error.message === 'Category name cannot be empty') {
      throw error
    }
    
    // Log unexpected errors for debugging
    console.error('[CategoryFunctions] Error creating category:', {
      tenantId,
      name,
      userId,
      error: error.message,
      stack: error.stack
    })
    
    // Wrap unknown errors
    throw new Error(`Failed to create category: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Update a category name
 */
export async function updateCategory(
  categoryId: string,
  tenantId: string,
  newName: string
): Promise<Category> {
  const container = getContainer('categories')

  const { resource: existing } = await container.item(categoryId, tenantId).read<Category>()
  if (!existing) {
    throw new Error('Category not found')
  }

  const normalizedName = newName.trim()
  if (!normalizedName) {
    throw new Error('Category name cannot be empty')
  }

  // Check for duplicate names (excluding this category)
  const allCategories = await getCategories(tenantId)
  if (allCategories.some(c => c.id !== categoryId && c.name.toLowerCase() === normalizedName.toLowerCase())) {
    throw new Error('Category already exists')
  }

  const updated: Category = {
    ...existing,
    name: normalizedName,
    updatedAt: new Date().toISOString()
  }

  const { resource } = await container.item(categoryId, tenantId).replace<Category>(updated)
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

