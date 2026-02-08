/**
 * Shared test fixtures and helpers
 */

import type { User } from '../../src/models/User'

export const TEST_TENANT_ID = 'tenant-test'

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-test-001',
    tenantId: TEST_TENANT_ID,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // SHA256 of 'admin'
    role: 'student',
    status: 'active' as const,
    enrolledCourses: [],
    completedCourses: [],
    totalXP: 0,
    level: 1,
    badges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockAdmin(overrides: Partial<User> = {}): User {
  return createMockUser({
    id: 'user-admin-001',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'super-admin',
    ...overrides,
  })
}

export function createMockInstructor(overrides: Partial<User> = {}): User {
  return createMockUser({
    id: 'user-instructor-001',
    email: 'instructor@example.com',
    firstName: 'Instructor',
    lastName: 'User',
    role: 'instructor',
    ...overrides,
  })
}

export function createMockTenantAdmin(overrides: Partial<User> = {}): User {
  return createMockUser({
    id: 'user-tenant-admin-001',
    email: 'tenant-admin@example.com',
    firstName: 'Tenant',
    lastName: 'Admin',
    role: 'tenant-admin',
    ...overrides,
  })
}

export function createMockCourse(overrides: Record<string, any> = {}) {
  return {
    id: 'course-test-001',
    tenantId: TEST_TENANT_ID,
    title: 'Test Course',
    description: 'A test course for unit tests',
    shortDescription: 'Test course',
    status: 'published',
    type: 'self-paced',
    category: 'technology',
    modules: [],
    enrolledCount: 0,
    completionRate: 0,
    averageRating: 0,
    createdBy: 'user-instructor-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createMockTenant(overrides: Record<string, any> = {}) {
  return {
    id: TEST_TENANT_ID,
    name: 'Test Tenant',
    slug: 'test',
    status: 'active',
    plan: 'starter',
    settings: {},
    branding: {},
    limits: { maxUsers: 50, maxCourses: 10, maxStorageGB: 5 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}
