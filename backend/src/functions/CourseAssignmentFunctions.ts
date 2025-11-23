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
 * Initialize user progress for a course (creates initial progress record)
 */
async function initializeUserProgress(
  userId: string,
  tenantId: string,
  courseId: string
): Promise<void> {
  const { getContainer } = await import('../services/cosmosdb.service');
  const progressContainer = getContainer('user-progress');

  // Check if progress already exists
  const query = {
    query: 'SELECT * FROM c WHERE c.userId = @userId AND c.tenantId = @tenantId AND c.courseId = @courseId',
    parameters: [
      { name: '@userId', value: userId },
      { name: '@tenantId', value: tenantId },
      { name: '@courseId', value: courseId },
    ],
  };

  const { resources } = await progressContainer.items.query(query).fetchAll();

  // If progress already exists, don't create a new one
  if (resources.length > 0) {
    return;
  }

  // Create initial progress record
  const progressData = {
    id: `progress-${userId}-${courseId}`,
    userId,
    tenantId,
    courseId,
    status: 'not-started',
    progress: 0,
    lastAccessedAt: new Date().toISOString(),
    completedLessons: [],
    quizScores: [],
    certificateEarned: false,
    attempts: [],
    bestScore: 0,
    totalXpEarned: 0,
    currentAttempt: 0,
  };

  await progressContainer.items.upsert(progressData);
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
  
  // If assigning to a user (not a group), initialize their progress
  if (assignedToType === 'user') {
    await initializeUserProgress(assignedToId, tenantId, courseId);
  }
  
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

