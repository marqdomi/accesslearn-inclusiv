/**
 * Tests for UserFunctions
 *
 * Covers user CRUD operations
 */

jest.mock('../src/services/cosmosdb.service', () => {
  const mockContainer = {
    items: {
      query: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
    },
    item: jest.fn(),
  }
  return {
    getContainer: jest.fn().mockReturnValue(mockContainer),
    initializeCosmos: jest.fn(),
  }
})

jest.mock('../src/services/applicationinsights.service', () => ({
  trackEvent: jest.fn(),
  trackException: jest.fn(),
  trackMetric: jest.fn(),
  initializeAppInsights: jest.fn(),
}))

jest.mock('../src/services/email.service', () => ({
  emailService: {
    sendEmail: jest.fn().mockResolvedValue(undefined),
    sendInvitation: jest.fn().mockResolvedValue(undefined),
    sendWelcome: jest.fn().mockResolvedValue(undefined),
  },
}))

import { createUser, getUserById, getUsersByTenant, updateUser, deleteUser } from '../src/functions/UserFunctions'
import { getContainer } from '../src/services/cosmosdb.service'
import { createMockUser, TEST_TENANT_ID } from './helpers/fixtures'

const mockContainer = (getContainer as jest.Mock)()

describe('UserFunctions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default: no duplicate found
    mockContainer.items.query.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [] }),
    })
    mockContainer.items.create.mockImplementation(async (item: any) => ({
      resource: item,
    }))
    mockContainer.items.upsert.mockImplementation(async (item: any) => ({
      resource: item,
    }))
  })

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const result = await createUser({
        tenantId: TEST_TENANT_ID,
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        temporaryPassword: 'SecurePass123!',
        role: 'student',
      })

      expect(result).toBeDefined()
      expect(result.email).toBe('newuser@example.com')
      expect(result.firstName).toBe('New')
      expect(result.role).toBe('student')
      expect(result.status).toBe('active')
      // Password is stored from temporaryPassword field
      expect(result.password).toBe('SecurePass123!')
    })

    it('should reject duplicate email within same tenant', async () => {
      const existingUser = createMockUser()
      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: [existingUser] }),
      })

      await expect(
        createUser({
          tenantId: TEST_TENANT_ID,
          email: 'test@example.com',
          firstName: 'Duplicate',
          lastName: 'User',
          temporaryPassword: 'SecurePass123!',
          role: 'student',
        })
      ).rejects.toThrow()
    })

    it('should validate CURP format when provided', async () => {
      await expect(
        createUser({
          tenantId: TEST_TENANT_ID,
          email: 'curp-user@example.com',
          firstName: 'CURP',
          lastName: 'User',
          temporaryPassword: 'SecurePass123!',
          role: 'student',
          curp: 'INVALID-CURP',
        })
      ).rejects.toThrow()
    })

    it('should create user with valid CURP', async () => {
      const result = await createUser({
        tenantId: TEST_TENANT_ID,
        email: 'curp-valid@example.com',
        firstName: 'Valid',
        lastName: 'CURP',
        temporaryPassword: 'SecurePass123!',
        role: 'student',
        curp: 'GODE561231HDFRRN09',
      })

      expect(result).toBeDefined()
      expect(result.curp).toBe('GODE561231HDFRRN09')
    })

    it('should assign default level and XP', async () => {
      const result = await createUser({
        tenantId: TEST_TENANT_ID,
        email: 'defaults@example.com',
        firstName: 'Default',
        lastName: 'User',
        temporaryPassword: 'SecurePass123!',
        role: 'student',
      })

      expect(result.totalXP).toBe(0)
      expect(result.level).toBe(1)
      expect(result.badges).toEqual([])
    })
  })

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const user = createMockUser()
      mockContainer.item.mockReturnValue({
        read: jest.fn().mockResolvedValue({ resource: user }),
      })

      const result = await getUserById(user.id, TEST_TENANT_ID)

      expect(result).toBeDefined()
      expect(result?.id).toBe(user.id)
    })

    it('should return null for non-existent user', async () => {
      mockContainer.item.mockReturnValue({
        read: jest.fn().mockResolvedValue({ resource: undefined }),
      })

      const result = await getUserById('nonexistent-id', TEST_TENANT_ID)

      expect(result).toBeNull()
    })
  })

  describe('getUsersByTenant', () => {
    it('should return all users for a tenant', async () => {
      const users = [
        createMockUser({ id: 'user-1', email: 'user1@example.com' }),
        createMockUser({ id: 'user-2', email: 'user2@example.com' }),
        createMockUser({ id: 'user-3', email: 'user3@example.com' }),
      ]

      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: users }),
      })

      const result = await getUsersByTenant(TEST_TENANT_ID)

      expect(result).toHaveLength(3)
      expect(result[0].email).toBe('user1@example.com')
    })

    it('should return empty array when no users exist', async () => {
      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: [] }),
      })

      const result = await getUsersByTenant('tenant-empty')

      expect(result).toEqual([])
    })
  })

  describe('updateUser', () => {
    it('should update user fields', async () => {
      const user = createMockUser()
      mockContainer.item.mockReturnValue({
        read: jest.fn().mockResolvedValue({ resource: user }),
      })
      mockContainer.items.upsert.mockImplementation(async (item: any) => ({
        resource: item,
      }))

      const result = await updateUser(user.id, TEST_TENANT_ID, {
        firstName: 'Updated',
        lastName: 'Name',
      })

      expect(result).toBeDefined()
      expect(result.firstName).toBe('Updated')
      expect(result.lastName).toBe('Name')
    })

    it('should throw when user not found', async () => {
      mockContainer.item.mockReturnValue({
        read: jest.fn().mockResolvedValue({ resource: undefined }),
      })

      await expect(
        updateUser('nonexistent', TEST_TENANT_ID, { firstName: 'Nope' })
      ).rejects.toThrow()
    })
  })

  describe('deleteUser', () => {
    it('should soft-delete user by marking inactive', async () => {
      const user = createMockUser()
      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: [user] }),
      })
      mockContainer.item.mockReturnValue({
        read: jest.fn().mockResolvedValue({ resource: user }),
      })
      mockContainer.items.upsert.mockImplementation(async (item: any) => ({
        resource: item,
      }))

      await deleteUser(user.id, TEST_TENANT_ID)

      expect(mockContainer.items.upsert).toHaveBeenCalled()
    })
  })
})
