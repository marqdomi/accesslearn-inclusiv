/**
 * Tests for STPSFunctions
 *
 * Covers STPS compliance: tenant config, course config, constancia generation
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

jest.mock('../src/functions/UserFunctions', () => ({
  getUserById: jest.fn(),
}))

jest.mock('../src/functions/CourseFunctions', () => ({
  getCourseById: jest.fn(),
}))

import {
  getSTPSTenantConfig,
  upsertSTPSTenantConfig,
  getSTPSCourseConfig,
  upsertSTPSCourseConfig,
  getSTPSEnabledCourses,
  generateConstancia,
  getSTPSStats,
} from '../src/functions/STPSFunctions'
import { getContainer } from '../src/services/cosmosdb.service'
import { getUserById } from '../src/functions/UserFunctions'
import { getCourseById } from '../src/functions/CourseFunctions'
import { TEST_TENANT_ID, createMockUser, createMockCourse } from './helpers/fixtures'

const mockContainer = (getContainer as jest.Mock)()

describe('STPSFunctions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockContainer.items.query.mockReturnValue({
      fetchAll: jest.fn().mockResolvedValue({ resources: [] }),
    })
  })

  describe('getSTPSTenantConfig', () => {
    it('should return null when no config exists', async () => {
      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: [] }),
      })

      const result = await getSTPSTenantConfig(TEST_TENANT_ID)

      expect(result).toBeNull()
    })

    it('should return config when it exists', async () => {
      const config = {
        id: `stps-config-${TEST_TENANT_ID}`,
        tenantId: TEST_TENANT_ID,
        type: 'tenant-config',
        registroPatronalIMSS: '12345678901',
        representanteLegal: 'John Doe',
        domicilioRegistrado: '123 Main St',
      }

      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: [config] }),
      })

      const result = await getSTPSTenantConfig(TEST_TENANT_ID)

      expect(result).toBeDefined()
      expect(result?.registroPatronalIMSS).toBe('12345678901')
    })
  })

  describe('upsertSTPSTenantConfig', () => {
    it('should create new config when none exists', async () => {
      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: [] }),
      })
      mockContainer.items.upsert.mockImplementation(async (item: any) => ({
        resource: item,
      }))

      const result = await upsertSTPSTenantConfig(TEST_TENANT_ID, {
        tenantId: TEST_TENANT_ID,
        registroPatronalIMSS: '12345678901',
        representanteLegal: 'Jane Admin',
      })

      expect(result).toBeDefined()
      expect(result.registroPatronalIMSS).toBe('12345678901')
      expect(mockContainer.items.upsert).toHaveBeenCalled()
    })

    it('should update existing config', async () => {
      const existingConfig = {
        id: `stps-config-${TEST_TENANT_ID}`,
        tenantId: TEST_TENANT_ID,
        type: 'tenant-config',
        registroPatronalIMSS: '00000000000',
      }

      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: [existingConfig] }),
      })
      mockContainer.items.upsert.mockImplementation(async (item: any) => ({
        resource: item,
      }))

      const result = await upsertSTPSTenantConfig(TEST_TENANT_ID, {
        tenantId: TEST_TENANT_ID,
        registroPatronalIMSS: '99999999999',
      })

      expect(result.registroPatronalIMSS).toBe('99999999999')
    })
  })

  describe('getSTPSCourseConfig', () => {
    it('should return null when no course config exists', async () => {
      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: [] }),
      })

      const result = await getSTPSCourseConfig(TEST_TENANT_ID, 'course-001')

      expect(result).toBeNull()
    })
  })

  describe('getEnabledSTPSCourses', () => {
    it('should return enabled courses for tenant', async () => {
      const configs = [
        { id: 'stps-course-1', tenantId: TEST_TENANT_ID, courseId: 'course-1', enabled: true },
        { id: 'stps-course-2', tenantId: TEST_TENANT_ID, courseId: 'course-2', enabled: true },
      ]

      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: configs }),
      })

      const result = await getSTPSEnabledCourses(TEST_TENANT_ID)

      expect(result).toHaveLength(2)
    })

    it('should return empty array when no courses are enabled', async () => {
      const result = await getSTPSEnabledCourses(TEST_TENANT_ID)

      expect(result).toEqual([])
    })
  })

  describe('generateConstancia', () => {
    it('should generate a constancia for a valid user and course', async () => {
      const user = createMockUser({ curp: 'GODE561231HDFRRN09' })
      const course = createMockCourse()

      ;(getUserById as jest.Mock).mockResolvedValue(user)
      ;(getCourseById as jest.Mock).mockResolvedValue(course)

      const stpsConfig = {
        id: `stps-config-${TEST_TENANT_ID}`,
        tenantId: TEST_TENANT_ID,
        type: 'stps-tenant-config',
        registroPatronalIMSS: '12345678901',
        representanteLegal: 'Boss',
        lastFolioNumber: 0,
      }

      const courseConfig = {
        id: `stps-course-${course.id}`,
        tenantId: TEST_TENANT_ID,
        courseId: course.id,
        type: 'stps-course-config',
        habilitadoSTPS: true,
        areaTematica: '01',
        duracionHoras: 20,
        modalidad: 'en-linea',
        tipoAgente: 'interno',
        nombreInstructor: 'Instructor Name',
        calificacionMinima: 70,
      }

      const tenantMock = {
        id: TEST_TENANT_ID,
        name: 'Test Tenant',
        rfc: 'XAXX010101000',
      }

      const progressMock = {
        userId: user.id,
        courseId: course.id,
        tenantId: TEST_TENANT_ID,
        status: 'completed',
        bestScore: 90,
        progress: 100,
      }

      // Query-text-based mock to handle Promise.all parallel calls
      mockContainer.items.query.mockImplementation((queryObj: any) => {
        const q = typeof queryObj === 'string' ? queryObj : queryObj.query || ''
        if (q.includes('c.courseId') && q.includes('c.type')) {
          // getSTPSCourseConfig
          return { fetchAll: jest.fn().mockResolvedValue({ resources: [courseConfig] }) }
        }
        if (q.includes('c.type') && !q.includes('c.courseId') && !q.includes('c.id')) {
          // getSTPSTenantConfig
          return { fetchAll: jest.fn().mockResolvedValue({ resources: [stpsConfig] }) }
        }
        if (q.includes('c.id = @id') && !q.includes('c.type')) {
          // getTenantById
          return { fetchAll: jest.fn().mockResolvedValue({ resources: [tenantMock] }) }
        }
        if (q.includes('c.userId') && q.includes('c.courseId')) {
          // user-progress query
          return { fetchAll: jest.fn().mockResolvedValue({ resources: [progressMock] }) }
        }
        return { fetchAll: jest.fn().mockResolvedValue({ resources: [] }) }
      })

      mockContainer.items.create.mockImplementation(async (item: any) => ({
        resource: item,
      }))
      mockContainer.items.upsert.mockImplementation(async (item: any) => ({
        resource: item,
      }))

      const result = await generateConstancia({
        tenantId: TEST_TENANT_ID,
        userId: user.id,
        courseId: course.id,
      })

      expect(result).toBeDefined()
      expect(result.tenantId).toBe(TEST_TENANT_ID)
    })

    it('should throw when user is not found', async () => {
      ;(getUserById as jest.Mock).mockResolvedValue(null)

      await expect(
        generateConstancia({
          tenantId: TEST_TENANT_ID,
          userId: 'nonexistent',
          courseId: 'course-001',
        })
      ).rejects.toThrow()
    })

    it('should throw when course is not found', async () => {
      const user = createMockUser()
      ;(getUserById as jest.Mock).mockResolvedValue(user)
      ;(getCourseById as jest.Mock).mockResolvedValue(null)

      await expect(
        generateConstancia({
          tenantId: TEST_TENANT_ID,
          userId: user.id,
          courseId: 'nonexistent',
        })
      ).rejects.toThrow()
    })
  })

  describe('getSTPSStats', () => {
    it('should return stats with zero counts when no constancias exist', async () => {
      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: [] }),
      })

      const result = await getSTPSStats(TEST_TENANT_ID)

      expect(result).toBeDefined()
      expect(result.totalConstancias).toBe(0)
    })
  })
})
