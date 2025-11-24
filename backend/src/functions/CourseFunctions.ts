/**
 * Course Functions
 * Handles course CRUD operations and approval workflow
 */

import { getContainer } from '../services/cosmosdb.service'
import { Course, CourseStatus, CourseCreateInput, CourseUpdateInput, CourseReviewAction } from '../models/Course'
import { createAuditLog } from './AuditFunctions'
import { User } from '../models/User'

/**
 * Helper to log course-related audit events
 */
async function logCourseAudit(params: {
  tenantId: string
  userId: string
  action: string
  resourceId: string
  metadata?: Record<string, any>
}) {
  await createAuditLog(
    params.tenantId,
    params.action as any,
    {
      userId: params.userId,
      email: 'unknown',
      role: 'unknown',
      name: 'unknown'
    },
    {
      type: 'course',
      id: params.resourceId
    },
    {
      metadata: params.metadata || {},
      severity: 'info',
      status: 'success'
    }
  )
}

/**
 * Get courses with optional status filtering
 */
export async function getCourses(
  tenantId: string,
  options?: {
    status?: CourseStatus
    createdBy?: string
    reviewerId?: string
  }
): Promise<Course[]> {
  const container = getContainer('courses')
  
  let queryString = 'SELECT * FROM c WHERE c.tenantId = @tenantId'
  const parameters: Array<{ name: string; value: any }> = [
    { name: '@tenantId', value: tenantId }
  ]
  
  if (options?.status) {
    queryString += ' AND c.status = @status'
    parameters.push({ name: '@status', value: options.status })
  }
  
  if (options?.createdBy) {
    queryString += ' AND c.createdBy = @createdBy'
    parameters.push({ name: '@createdBy', value: options.createdBy })
  }
  
  if (options?.reviewerId) {
    queryString += ' AND c.reviewerId = @reviewerId'
    parameters.push({ name: '@reviewerId', value: options.reviewerId })
  }
  
  const { resources } = await container.items
    .query<Course>({ query: queryString, parameters })
    .fetchAll()
  
  return resources
}

/**
 * Get a single course by ID
 */
export async function getCourseById(courseId: string, tenantId: string): Promise<Course | null> {
  const container = getContainer('courses')
  
  try {
    const { resource } = await container.item(courseId, tenantId).read<Course>()
    return resource || null
  } catch (error: any) {
    if (error.code === 404) {
      return null
    }
    throw error
  }
}

/**
 * Create a new course (starts in draft status)
 */
export async function createCourse(
  input: CourseCreateInput,
  tenantId: string,
  userId: string
): Promise<Course> {
  const container = getContainer('courses')
  
  const now = new Date().toISOString()
  const course: Course = {
    id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tenantId,
    ...input,
    modules: [],
    status: 'draft',
    createdBy: userId,
    createdAt: now,
    updatedAt: now
  }
  
  const { resource } = await container.items.create<Course>(course)
  
  // Log audit event
  await logCourseAudit({
    tenantId,
    userId,
    action: 'course.created',
    resourceId: course.id,
    metadata: { title: course.title }
  })
  
  return resource!
}

/**
 * Update a course (maintains current status)
 */
export async function updateCourse(
  courseId: string,
  tenantId: string,
  userId: string,
  updates: CourseUpdateInput
): Promise<Course> {
  const container = getContainer('courses')
  
  const course = await getCourseById(courseId, tenantId)
  if (!course) {
    throw new Error('Course not found')
  }
  
  const updatedCourse: Course = {
    ...course,
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  const { resource } = await container
    .item(courseId, tenantId)
    .replace<Course>(updatedCourse)
  
  // Log audit event
  await logCourseAudit({
    tenantId,
    userId,
    action: 'course.updated',
    resourceId: courseId,
    metadata: { changes: Object.keys(updates) }
  })
  
  return resource!
}

/**
 * Submit course for review
 * Transition: draft -> pending-review
 */
export async function submitCourseForReview(
  courseId: string,
  tenantId: string,
  userId: string
): Promise<Course> {
  const container = getContainer('courses')
  
  const course = await getCourseById(courseId, tenantId)
  if (!course) {
    throw new Error('Course not found')
  }
  
  if (course.status !== 'draft') {
    throw new Error(`Cannot submit course with status: ${course.status}`)
  }
  
  if (course.createdBy !== userId) {
    throw new Error('Only the course creator can submit it for review')
  }
  
  const updatedCourse: Course = {
    ...course,
    status: 'pending-review',
    submittedForReviewAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  const { resource } = await container
    .item(courseId, tenantId)
    .replace<Course>(updatedCourse)
  
  // Log audit event
  await logCourseAudit({
    tenantId,
    userId,
    action: 'course.submitted-for-review',
    resourceId: courseId,
    metadata: { title: course.title }
  })
  
  return resource!
}

/**
 * Approve course
 * Transition: pending-review -> published
 */
export async function approveCourse(
  courseId: string,
  tenantId: string,
  reviewerId: string,
  comments?: string
): Promise<Course> {
  const container = getContainer('courses')
  
  const course = await getCourseById(courseId, tenantId)
  if (!course) {
    throw new Error('Course not found')
  }
  
  if (course.status !== 'pending-review') {
    throw new Error(`Cannot approve course with status: ${course.status}`)
  }
  
  const now = new Date().toISOString()
  const updatedCourse: Course = {
    ...course,
    status: 'published',
    reviewerId,
    reviewComments: comments,
    publishedAt: now,
    updatedAt: now
  }
  
  const { resource } = await container
    .item(courseId, tenantId)
    .replace<Course>(updatedCourse)
  
  // Log audit event
  await logCourseAudit({
    tenantId,
    userId: reviewerId,
    action: 'course.approved',
    resourceId: courseId,
    metadata: { 
      title: course.title,
      comments,
      createdBy: course.createdBy
    }
  })
  
  return resource!
}

/**
 * Publish course directly (bypass approval workflow)
 * Transition: draft -> published (for admins/content-managers)
 * This allows super-admin, tenant-admin, and content-manager to publish directly
 */
export async function publishCourse(
  courseId: string,
  tenantId: string,
  userId: string
): Promise<Course> {
  const container = getContainer('courses')
  
  const course = await getCourseById(courseId, tenantId)
  if (!course) {
    throw new Error('Course not found')
  }
  
  // Allow publishing from draft or pending-review
  if (course.status !== 'draft' && course.status !== 'pending-review') {
    throw new Error(`Cannot publish course with status: ${course.status}. Course must be in draft or pending-review status.`)
  }
  
  const now = new Date().toISOString()
  const updatedCourse: Course = {
    ...course,
    status: 'published',
    reviewerId: userId, // Track who published it
    publishedAt: now,
    updatedAt: now
  }
  
  const { resource } = await container
    .item(courseId, tenantId)
    .replace<Course>(updatedCourse)
  
  // Log audit event
  await logCourseAudit({
    tenantId,
    userId,
    action: course.status === 'draft' ? 'course.published-directly' : 'course.published',
    resourceId: courseId,
    metadata: { 
      title: course.title,
      previousStatus: course.status,
      createdBy: course.createdBy
    }
  })
  
  return resource!
}

/**
 * Reject course
 * Transition: pending-review -> draft
 */
export async function rejectCourse(
  courseId: string,
  tenantId: string,
  reviewerId: string,
  comments: string
): Promise<Course> {
  const container = getContainer('courses')
  
  const course = await getCourseById(courseId, tenantId)
  if (!course) {
    throw new Error('Course not found')
  }
  
  if (course.status !== 'pending-review') {
    throw new Error(`Cannot reject course with status: ${course.status}`)
  }
  
  const updatedCourse: Course = {
    ...course,
    status: 'draft',
    reviewerId,
    reviewComments: comments,
    submittedForReviewAt: undefined,
    updatedAt: new Date().toISOString()
  }
  
  const { resource } = await container
    .item(courseId, tenantId)
    .replace<Course>(updatedCourse)
  
  // Log audit event
  await logCourseAudit({
    tenantId,
    userId: reviewerId,
    action: 'course.rejected',
    resourceId: courseId,
    metadata: { 
      title: course.title,
      comments,
      createdBy: course.createdBy
    }
  })
  
  return resource!
}

/**
 * Request changes on course
 * Transition: pending-review -> draft
 */
export async function requestCourseChanges(
  courseId: string,
  tenantId: string,
  reviewerId: string,
  requestedChanges: string
): Promise<Course> {
  const container = getContainer('courses')
  
  const course = await getCourseById(courseId, tenantId)
  if (!course) {
    throw new Error('Course not found')
  }
  
  if (course.status !== 'pending-review') {
    throw new Error(`Cannot request changes for course with status: ${course.status}`)
  }
  
  const updatedCourse: Course = {
    ...course,
    status: 'draft',
    reviewerId,
    requestedChanges,
    submittedForReviewAt: undefined,
    updatedAt: new Date().toISOString()
  }
  
  const { resource } = await container
    .item(courseId, tenantId)
    .replace<Course>(updatedCourse)
  
  // Log audit event
  await logCourseAudit({
    tenantId,
    userId: reviewerId,
    action: 'course.changes-requested',
    resourceId: courseId,
    metadata: { 
      title: course.title,
      requestedChanges,
      createdBy: course.createdBy
    }
  })
  
  return resource!
}

/**
 * Archive course
 * Transition: published -> archived
 */
export async function archiveCourse(
  courseId: string,
  tenantId: string,
  userId: string
): Promise<Course> {
  const container = getContainer('courses')
  
  const course = await getCourseById(courseId, tenantId)
  if (!course) {
    throw new Error('Course not found')
  }
  
  if (course.status !== 'published') {
    throw new Error(`Cannot archive course with status: ${course.status}`)
  }
  
  const updatedCourse: Course = {
    ...course,
    status: 'archived',
    archivedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  const { resource } = await container
    .item(courseId, tenantId)
    .replace<Course>(updatedCourse)
  
  // Log audit event
  await logCourseAudit({
    tenantId,
    userId,
    action: 'course.archived',
    resourceId: courseId,
    metadata: { title: course.title }
  })
  
  return resource!
}

/**
 * Unarchive course
 * Transition: archived -> published
 */
export async function unarchiveCourse(
  courseId: string,
  tenantId: string,
  userId: string
): Promise<Course> {
  const container = getContainer('courses')
  
  const course = await getCourseById(courseId, tenantId)
  if (!course) {
    throw new Error('Course not found')
  }
  
  if (course.status !== 'archived') {
    throw new Error(`Cannot unarchive course with status: ${course.status}`)
  }
  
  const updatedCourse: Course = {
    ...course,
    status: 'published',
    archivedAt: undefined,
    updatedAt: new Date().toISOString()
  }
  
  const { resource } = await container
    .item(courseId, tenantId)
    .replace<Course>(updatedCourse)
  
  // Log audit event
  await logCourseAudit({
    tenantId,
    userId,
    action: 'course.unarchived',
    resourceId: courseId,
    metadata: { title: course.title }
  })
  
  return resource!
}

/**
 * Delete course (soft delete by archiving)
 */
export async function deleteCourse(
  courseId: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const container = getContainer('courses')
  
  const course = await getCourseById(courseId, tenantId)
  if (!course) {
    throw new Error('Course not found')
  }
  
  // Soft delete by archiving
  if (course.status !== 'archived') {
    await archiveCourse(courseId, tenantId, userId)
  }
  
  // Log audit event
  await logCourseAudit({
    tenantId,
    userId,
    action: 'course.deleted',
    resourceId: courseId,
    metadata: { title: course.title }
  })
}
