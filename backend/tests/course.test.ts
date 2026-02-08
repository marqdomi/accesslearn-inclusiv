/**
 * Tests for CourseFunctions
 *
 * Covers course CRUD and workflow operations
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

import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  publishCourse,
  archiveCourse,
  deleteCourse,
} from '../src/functions/CourseFunctions'
import { getContainer } from '../src/services/cosmosdb.service'
import { createMockCourse, TEST_TENANT_ID } from './helpers/fixtures'

const mockContainer = (getContainer as jest.Mock)()

describe('CourseFunctions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

  describe('getCourses', () => {
    it('should return courses for a tenant', async () => {
      const courses = [
        createMockCourse({ id: 'course-1', title: 'Course 1' }),
        createMockCourse({ id: 'course-2', title: 'Course 2' }),
      ]

      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: courses }),
      })

      const result = await getCourses(TEST_TENANT_ID)

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Course 1')
    })

    it('should return empty array when no courses exist', async () => {
      const result = await getCourses('tenant-empty')

      expect(result).toEqual([])
    })

    it('should filter by status when provided', async () => {
      const publishedOnly = [
        createMockCourse({ id: 'course-1', status: 'published' }),
      ]

      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: publishedOnly }),
      })

      const result = await getCourses(TEST_TENANT_ID, { status: 'published' })

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('published')
    })
  })

  describe('getCourseById', () => {
    it('should return a course by ID', async () => {
      const course = createMockCourse()
      mockContainer.item.mockReturnValue({
        read: jest.fn().mockResolvedValue({ resource: course }),
      })

      const result = await getCourseById('course-test-001', TEST_TENANT_ID)

      expect(result).toBeDefined()
      expect(result?.id).toBe('course-test-001')
    })

    it('should return null for non-existent course', async () => {
      mockContainer.item.mockReturnValue({
        read: jest.fn().mockResolvedValue({ resource: undefined }),
      })

      const result = await getCourseById('nonexistent', TEST_TENANT_ID)

      expect(result).toBeNull()
    })
  })

  describe('createCourse', () => {
    it('should create a new course', async () => {
      const result = await createCourse({
        title: 'New Course',
        description: 'A brand new course',
        category: 'technology',
        estimatedTime: 10,
      }, TEST_TENANT_ID, 'user-instructor-001')

      expect(result).toBeDefined()
      expect(result.title).toBe('New Course')
      expect(result.status).toBe('draft')
      expect(result.tenantId).toBe(TEST_TENANT_ID)
    })

    it('should default to draft status', async () => {
      const result = await createCourse({
        title: 'Draft Course',
        description: 'Should be draft',
        category: 'compliance',
        estimatedTime: 5,
      }, TEST_TENANT_ID, 'user-instructor-001')

      expect(result.status).toBe('draft')
    })
  })

  describe('updateCourse', () => {
    it('should update course fields', async () => {
      const course = createMockCourse({ status: 'draft' })
      mockContainer.item.mockReturnValue({
        read: jest.fn().mockResolvedValue({ resource: course }),
        replace: jest.fn().mockImplementation(async (item: any) => ({ resource: item })),
      })

      const result = await updateCourse('course-test-001', TEST_TENANT_ID, 'user-admin-001', {
        title: 'Updated Title',
        description: 'Updated description',
      })

      expect(result.title).toBe('Updated Title')
    })
  })

  describe('publishCourse', () => {
    it('should publish a course that is in draft status', async () => {
      const course = createMockCourse({ status: 'draft' })
      mockContainer.item.mockReturnValue({
        read: jest.fn().mockResolvedValue({ resource: course }),
        replace: jest.fn().mockImplementation(async (item: any) => ({ resource: item })),
      })

      const result = await publishCourse('course-test-001', TEST_TENANT_ID, 'user-admin-001')

      expect(result.status).toBe('published')
    })
  })

  describe('archiveCourse', () => {
    it('should archive a published course', async () => {
      const course = createMockCourse({ status: 'published' })
      mockContainer.item.mockReturnValue({
        read: jest.fn().mockResolvedValue({ resource: course }),
        replace: jest.fn().mockImplementation(async (item: any) => ({ resource: item })),
      })

      const result = await archiveCourse('course-test-001', TEST_TENANT_ID, 'user-admin-001')

      expect(result.status).toBe('archived')
    })
  })

  describe('deleteCourse', () => {
    it('should soft-delete a published course by archiving', async () => {
      const course = createMockCourse({ status: 'published' })
      mockContainer.item.mockReturnValue({
        read: jest.fn().mockResolvedValue({ resource: course }),
        replace: jest.fn().mockImplementation(async (item: any) => ({ resource: item })),
      })

      await deleteCourse('course-test-001', TEST_TENANT_ID, 'user-admin-001')

      // deleteCourse archives then logs audit
      expect(mockContainer.item).toHaveBeenCalled()
    })
  })
})
