/**
 * Course Assignment Functions
 * 
 * Manages course assignments to users and groups stored in Cosmos DB
 */

import { getContainer } from '../services/cosmosdb.service'

export interface CourseAssignment {
  id: string
  tenantId: string
  courseId: string
  assignedToType: 'user' | 'group'
  assignedToId: string // userId or groupId
  assignedBy: string
  dueDate?: string // ISO 8601
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  updatedAt: string
}

/**
 * Get all assignments for a tenant
 */
export async function getAssignments(tenantId: string): Promise<CourseAssignment[]> {
  const container = getContainer('course-assignments')
  
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId ORDER BY c.createdAt DESC',
    parameters: [{ name: '@tenantId', value: tenantId }]
  }
  
  const { resources } = await container.items.query<CourseAssignment>(query).fetchAll()
  return resources
}

/**
 * Get assignments for a specific user
 */
export async function getUserAssignments(
  userId: string,
  tenantId: string
): Promise<CourseAssignment[]> {
  const container = getContainer('course-assignments')
  
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.assignedToType = @type AND c.assignedToId = @userId',
    parameters: [
      { name: '@tenantId', value: tenantId },
      { name: '@type', value: 'user' },
      { name: '@userId', value: userId }
    ]
  }
  
  const { resources } = await container.items.query<CourseAssignment>(query).fetchAll()
  return resources
}

/**
 * Get assignments for a specific course
 */
export async function getCourseAssignments(
  courseId: string,
  tenantId: string
): Promise<CourseAssignment[]> {
  const container = getContainer('course-assignments')
  
  const query = {
    query: 'SELECT * FROM c WHERE c.courseId = @courseId AND c.tenantId = @tenantId',
    parameters: [
      { name: '@courseId', value: courseId },
      { name: '@tenantId', value: tenantId }
    ]
  }
  
  const { resources } = await container.items.query<CourseAssignment>(query).fetchAll()
  return resources
}

/**
 * Create a new assignment
 */
export async function createAssignment(
  tenantId: string,
  courseId: string,
  assignedToType: 'user' | 'group',
  assignedToId: string,
  assignedBy: string,
  dueDate?: string
): Promise<CourseAssignment> {
  const container = getContainer('course-assignments')
  
  const now = new Date().toISOString()
  const assignment: CourseAssignment = {
    id: `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tenantId,
    courseId,
    assignedToType,
    assignedToId,
    assignedBy,
    dueDate,
    status: 'pending',
    createdAt: now,
    updatedAt: now
  }
  
  const { resource } = await container.items.create<CourseAssignment>(assignment)
  return resource!
}

/**
 * Update assignment status
 */
export async function updateAssignmentStatus(
  assignmentId: string,
  tenantId: string,
  status: 'pending' | 'in-progress' | 'completed'
): Promise<CourseAssignment> {
  const container = getContainer('course-assignments')
  
  const { resource: assignment } = await container.item(assignmentId, tenantId).read<CourseAssignment>()
  
  if (!assignment) {
    throw new Error('Assignment not found')
  }
  
  assignment.status = status
  assignment.updatedAt = new Date().toISOString()
  
  const { resource } = await container.item(assignmentId, tenantId).replace<CourseAssignment>(assignment)
  
  if (!resource) {
    throw new Error('Failed to update assignment')
  }
  
  return resource as CourseAssignment
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(
  assignmentId: string,
  tenantId: string
): Promise<void> {
  const container = getContainer('course-assignments')
  await container.item(assignmentId, tenantId).delete()
}

