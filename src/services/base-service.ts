/**
 * Base Service Layer for KV Storage
 * 
 * Implements SQL-like CRUD operations with:
 * - Referential integrity
 * - Data validation
 * - Single Source of Truth (SSOT)
 * - Normalized data structures
 */

// KV Storage Access via Spark
const kv = window.spark?.kv

if (!kv) {
  console.warn('Spark KV storage not available')
}

/**
 * Base CRUD service for any entity type
 */
export class BaseService<T extends { id: string }> {
  constructor(protected readonly tableName: string) {}

  /**
   * Get all records from the table
   */
  async getAll(): Promise<T[]> {
    try {
      const data = await kv.get<T[]>(this.tableName)
      return data || []
    } catch (error) {
      console.error(`Error getting all from ${this.tableName}:`, error)
      return []
    }
  }

  /**
   * Get a single record by ID
   */
  async getById(id: string): Promise<T | null> {
    try {
      const all = await this.getAll()
      return all.find(item => item.id === id) || null
    } catch (error) {
      console.error(`Error getting ${this.tableName} by id ${id}:`, error)
      return null
    }
  }

  /**
   * Get multiple records by IDs
   */
  async getByIds(ids: string[]): Promise<T[]> {
    try {
      const all = await this.getAll()
      const idSet = new Set(ids)
      return all.filter(item => idSet.has(item.id))
    } catch (error) {
      console.error(`Error getting ${this.tableName} by ids:`, error)
      return []
    }
  }

  /**
   * Create a new record
   */
  async create(data: T): Promise<T> {
    try {
      const all = await this.getAll()
      
      // Check for duplicate ID
      if (all.some(item => item.id === data.id)) {
        throw new Error(`${this.tableName}: Record with id ${data.id} already exists`)
      }

      all.push(data)
      await kv.set(this.tableName, all)
      return data
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error)
      throw error
    }
  }

  /**
   * Update an existing record
   */
  async update(id: string, updates: Partial<T>): Promise<T | null> {
    try {
      const all = await this.getAll()
      const index = all.findIndex(item => item.id === id)
      
      if (index === -1) {
        throw new Error(`${this.tableName}: Record with id ${id} not found`)
      }

      const updated = { ...all[index], ...updates, id } as T
      all[index] = updated
      await kv.set(this.tableName, all)
      return updated
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error)
      return null
    }
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<boolean> {
    try {
      const all = await this.getAll()
      const filtered = all.filter(item => item.id !== id)
      
      if (filtered.length === all.length) {
        return false // Nothing was deleted
      }

      await kv.set(this.tableName, filtered)
      return true
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error)
      return false
    }
  }

  /**
   * Find records matching a condition
   */
  async find(predicate: (item: T) => boolean): Promise<T[]> {
    try {
      const all = await this.getAll()
      return all.filter(predicate)
    } catch (error) {
      console.error(`Error finding in ${this.tableName}:`, error)
      return []
    }
  }

  /**
   * Count total records
   */
  async count(): Promise<number> {
    try {
      const all = await this.getAll()
      return all.length
    } catch (error) {
      console.error(`Error counting ${this.tableName}:`, error)
      return 0
    }
  }

  /**
   * Check if a record exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const all = await this.getAll()
      return all.some(item => item.id === id)
    } catch (error) {
      console.error(`Error checking existence in ${this.tableName}:`, error)
      return false
    }
  }
}

/**
 * User-scoped service for data that belongs to specific users
 */
export class UserScopedService<T extends { id: string; userId: string }> extends BaseService<T> {
  /**
   * Get all records for a specific user
   */
  async getByUserId(userId: string): Promise<T[]> {
    return this.find(item => item.userId === userId)
  }

  /**
   * Delete all records for a specific user
   */
  async deleteByUserId(userId: string): Promise<number> {
    try {
      const all = await this.getAll()
      const filtered = all.filter(item => item.userId !== userId)
      const deletedCount = all.length - filtered.length
      
      if (deletedCount > 0) {
        await kv.set(this.tableName, filtered)
      }
      
      return deletedCount
    } catch (error) {
      console.error(`Error deleting by userId in ${this.tableName}:`, error)
      return 0
    }
  }
}

/**
 * Validation utilities
 */
export class DataValidator {
  /**
   * Validate that all referenced IDs exist
   */
  static async validateReferences<T extends { id: string }>(
    ids: string[],
    service: BaseService<T>
  ): Promise<{ valid: string[]; invalid: string[] }> {
    const all = await service.getAll()
    const validIds = new Set(all.map(item => item.id))
    
    const valid = ids.filter(id => validIds.has(id))
    const invalid = ids.filter(id => !validIds.has(id))
    
    return { valid, invalid }
  }

  /**
   * Remove invalid references from a list
   */
  static async cleanReferences<T extends { id: string }>(
    ids: string[],
    service: BaseService<T>
  ): Promise<string[]> {
    const { valid } = await this.validateReferences(ids, service)
    return valid
  }
}
