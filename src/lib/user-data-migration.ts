/**
 * User Data Migration Utility
 * 
 * CRITICAL: This handles the migration from the old dual-storage system
 * (users + employee-credentials) to a unified Single Source of Truth.
 * 
 * Context: GitHub Spark uses KV (key-value) storage, not SQL databases.
 * Therefore, this is a KV data consolidation, not a SQL migration.
 */

import { User, EmployeeCredentials } from './types'

export interface MigrationResult {
  totalUsers: number
  fromUsers: number
  fromCredentials: number
  duplicatesRemoved: number
  migratedUsers: User[]
}

/**
 * Consolidates users from both 'users' and 'employee-credentials' KV stores
 * into a single unified user list.
 * 
 * Rules:
 * 1. Email is the unique identifier (dedupe key)
 * 2. If a user exists in both stores, 'users' takes priority (it's authoritative)
 * 3. EmployeeCredentials without a User are converted to User objects
 * 4. All users get a consistent structure
 */
export function consolidateUsers(
  existingUsers: User[],
  employeeCredentials: EmployeeCredentials[]
): MigrationResult {
  const userMap = new Map<string, User>()
  let duplicatesRemoved = 0

  console.log('🔄 Starting User Data Consolidation...')
  console.log(`  - Input: ${existingUsers.length} users from 'users'`)
  console.log(`  - Input: ${employeeCredentials.length} credentials from 'employee-credentials'`)

  // Step 1: Add all existing users (these are authoritative)
  existingUsers.forEach(user => {
    const key = user.email.toLowerCase()
    userMap.set(key, user)
  })

  // Step 2: Add users from employee-credentials (if not already present)
  employeeCredentials.forEach(emp => {
    const key = emp.email.toLowerCase()
    
    if (userMap.has(key)) {
      // Duplicate found - keep the existing User, discard the credential
      duplicatesRemoved++
      console.log(`  ⚠️ Duplicate found: ${emp.email} (keeping existing User)`)
    } else {
      // Convert EmployeeCredential to User
      const newUser: User = {
        id: emp.id, // Keep the same ID for consistency
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        role: 'employee',
        assignedCourses: [],
        department: emp.department,
        // New fields for tracking
        createdAt: emp.createdAt,
        status: emp.status === 'pending' ? 'pending' : 'active'
      }
      userMap.set(key, newUser)
      console.log(`  ✅ Converted credential to User: ${emp.email}`)
    }
  })

  const migratedUsers = Array.from(userMap.values())
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

  const result: MigrationResult = {
    totalUsers: migratedUsers.length,
    fromUsers: existingUsers.length,
    fromCredentials: employeeCredentials.length - duplicatesRemoved,
    duplicatesRemoved,
    migratedUsers
  }

  console.log('✅ User Data Consolidation Complete!')
  console.log(`  - Total unique users: ${result.totalUsers}`)
  console.log(`  - From 'users': ${result.fromUsers}`)
  console.log(`  - From 'employee-credentials': ${result.fromCredentials}`)
  console.log(`  - Duplicates removed: ${result.duplicatesRemoved}`)

  return result
}

/**
 * Validates that a user list has no duplicate emails
 */
export function validateUserUniqueness(users: User[]): {
  isValid: boolean
  duplicates: string[]
} {
  const emailCounts = new Map<string, number>()
  
  users.forEach(user => {
    const email = user.email.toLowerCase()
    emailCounts.set(email, (emailCounts.get(email) || 0) + 1)
  })

  const duplicates = Array.from(emailCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([email]) => email)

  return {
    isValid: duplicates.length === 0,
    duplicates
  }
}

/**
 * Gets all user IDs for validation
 */
export function getAllUserIds(users: User[]): Set<string> {
  return new Set(users.map(u => u.id))
}

/**
 * Checks if all referenced user IDs exist in the user list
 */
export function validateUserReferences(
  userIds: string[],
  validUsers: User[]
): {
  valid: string[]
  invalid: string[]
} {
  const validUserIds = getAllUserIds(validUsers)
  
  const valid = userIds.filter(id => validUserIds.has(id))
  const invalid = userIds.filter(id => !validUserIds.has(id))

  return { valid, invalid }
}
