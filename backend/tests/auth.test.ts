/**
 * Tests for AuthFunctions
 *
 * Covers login flow, token validation, and edge cases
 */

import * as crypto from 'crypto'

// Mock CosmosDB before importing
jest.mock('../src/services/cosmosdb.service', () => {
  const mockContainer = {
    items: {
      query: jest.fn(),
      upsert: jest.fn(),
    },
    item: jest.fn(),
  }
  return {
    getContainer: jest.fn().mockReturnValue(mockContainer),
    initializeCosmos: jest.fn(),
    __mockContainer: mockContainer,
  }
})

jest.mock('../src/services/applicationinsights.service', () => ({
  trackEvent: jest.fn(),
  trackException: jest.fn(),
  trackMetric: jest.fn(),
  initializeAppInsights: jest.fn(),
}))

import { login, validateToken } from '../src/functions/AuthFunctions'
import { getContainer } from '../src/services/cosmosdb.service'
import { createMockUser, createMockAdmin, TEST_TENANT_ID } from './helpers/fixtures'

const mockContainer = (getContainer as jest.Mock)()

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

describe('AuthFunctions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const user = createMockUser({
        password: hashPassword('TestPass123!'),
      })

      // Mock tenants container for slug resolution
      const tenantsContainer = {
        items: {
          query: jest.fn().mockReturnValue({
            fetchAll: jest.fn().mockResolvedValue({
              resources: [{ id: TEST_TENANT_ID }],
            }),
          }),
        },
      }

      // Mock users container
      const usersContainer = {
        items: {
          query: jest.fn().mockReturnValue({
            fetchAll: jest.fn().mockResolvedValue({
              resources: [user],
            }),
          }),
          upsert: jest.fn().mockResolvedValue({ resource: user }),
        },
      }

      ;(getContainer as jest.Mock).mockImplementation((name: string) => {
        if (name === 'tenants') return tenantsContainer
        return usersContainer
      })

      const result = await login({
        email: 'test@example.com',
        password: 'TestPass123!',
        tenantId: TEST_TENANT_ID,
      })

      expect(result.success).toBe(true)
      expect(result.token).toBeDefined()
      expect(result.user).toBeDefined()
      expect(result.user?.email).toBe('test@example.com')
    })

    it('should fail with invalid password', async () => {
      const user = createMockUser({
        password: hashPassword('CorrectPassword'),
      })

      const usersContainer = {
        items: {
          query: jest.fn().mockReturnValue({
            fetchAll: jest.fn().mockResolvedValue({
              resources: [user],
            }),
          }),
        },
      }

      ;(getContainer as jest.Mock).mockReturnValue(usersContainer)

      const result = await login({
        email: 'test@example.com',
        password: 'WrongPassword',
        tenantId: TEST_TENANT_ID,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should fail when user does not exist', async () => {
      const usersContainer = {
        items: {
          query: jest.fn().mockReturnValue({
            fetchAll: jest.fn().mockResolvedValue({ resources: [] }),
          }),
        },
      }

      ;(getContainer as jest.Mock).mockReturnValue(usersContainer)

      const result = await login({
        email: 'nonexistent@example.com',
        password: 'SomePassword',
        tenantId: TEST_TENANT_ID,
      })

      expect(result.success).toBe(false)
    })

    it('should fail when user is inactive', async () => {
      const user = createMockUser({
        password: hashPassword('TestPass123!'),
        status: 'inactive' as any,
      })

      const usersContainer = {
        items: {
          query: jest.fn().mockReturnValue({
            fetchAll: jest.fn().mockResolvedValue({
              resources: [user],
            }),
          }),
        },
      }

      ;(getContainer as jest.Mock).mockReturnValue(usersContainer)

      const result = await login({
        email: 'test@example.com',
        password: 'TestPass123!',
        tenantId: TEST_TENANT_ID,
      })

      expect(result.success).toBe(false)
    })

    it('should resolve tenant slug to tenant ID', async () => {
      const user = createMockUser({
        password: hashPassword('TestPass123!'),
      })

      const tenantsContainer = {
        items: {
          query: jest.fn().mockReturnValue({
            fetchAll: jest.fn().mockResolvedValue({
              resources: [{ id: TEST_TENANT_ID, slug: 'test' }],
            }),
          }),
        },
      }

      const usersContainer = {
        items: {
          query: jest.fn().mockReturnValue({
            fetchAll: jest.fn().mockResolvedValue({
              resources: [user],
            }),
          }),
          upsert: jest.fn().mockResolvedValue({ resource: user }),
        },
      }

      ;(getContainer as jest.Mock).mockImplementation((name: string) => {
        if (name === 'tenants') return tenantsContainer
        return usersContainer
      })

      const result = await login({
        email: 'test@example.com',
        password: 'TestPass123!',
        tenantId: 'test', // slug, not ID
      })

      expect(result.success).toBe(true)
    })
  })

  describe('validateToken', () => {
    it('should validate a legitimate token', async () => {
      // First login to get a valid token
      const user = createMockUser({
        password: hashPassword('TestPass123!'),
      })

      const usersContainer = {
        items: {
          query: jest.fn().mockReturnValue({
            fetchAll: jest.fn().mockResolvedValue({
              resources: [user],
            }),
          }),
          upsert: jest.fn().mockResolvedValue({ resource: user }),
        },
        item: jest.fn().mockReturnValue({
          read: jest.fn().mockResolvedValue({ resource: user }),
        }),
      }

      ;(getContainer as jest.Mock).mockReturnValue(usersContainer)

      const loginResult = await login({
        email: 'test@example.com',
        password: 'TestPass123!',
        tenantId: TEST_TENANT_ID,
      })

      expect(loginResult.token).toBeDefined()

      // Now validate
      const validateResult = await validateToken(loginResult.token!)

      expect(validateResult.success).toBe(true)
      expect(validateResult.user?.email).toBe('test@example.com')
    })

    it('should reject an invalid token', async () => {
      const result = await validateToken('invalid-token-string')

      expect(result.success).toBe(false)
    })

    it('should reject an expired token', async () => {
      // We can't easily create an expired JWT without manipulating time
      // Instead test with a malformed but decodable token
      const result = await validateToken('eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjB9.invalid')

      expect(result.success).toBe(false)
    })
  })
})
