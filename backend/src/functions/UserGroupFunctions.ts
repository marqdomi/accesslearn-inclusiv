/**
 * User Group Functions
 * 
 * Manages user groups/teams stored in Cosmos DB
 */

import { getContainer } from '../services/cosmosdb.service'

export interface UserGroup {
  id: string
  tenantId: string
  name: string
  description?: string
  memberIds: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

/**
 * Get all groups for a tenant
 */
export async function getGroups(tenantId: string): Promise<UserGroup[]> {
  const container = getContainer('user-groups')
  
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId ORDER BY c.name',
    parameters: [{ name: '@tenantId', value: tenantId }]
  }
  
  const { resources } = await container.items.query<UserGroup>(query).fetchAll()
  return resources
}

/**
 * Get group by ID
 */
export async function getGroupById(
  groupId: string,
  tenantId: string
): Promise<UserGroup | null> {
  const container = getContainer('user-groups')
  
  try {
    const { resource } = await container.item(groupId, tenantId).read<UserGroup>()
    return resource || null
  } catch (error: any) {
    if (error.code === 404) {
      return null
    }
    throw error
  }
}

/**
 * Create a new group
 */
export async function createGroup(
  tenantId: string,
  name: string,
  description: string | undefined,
  createdBy: string,
  memberIds: string[] = []
): Promise<UserGroup> {
  const container = getContainer('user-groups')
  
  const now = new Date().toISOString()
  const group: UserGroup = {
    id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tenantId,
    name: name.trim(),
    description: description?.trim(),
    memberIds,
    createdBy,
    createdAt: now,
    updatedAt: now
  }
  
  const { resource } = await container.items.create<UserGroup>(group)
  return resource!
}

/**
 * Update a group
 */
export async function updateGroup(
  groupId: string,
  tenantId: string,
  updates: {
    name?: string
    description?: string
    memberIds?: string[]
  }
): Promise<UserGroup> {
  const container = getContainer('user-groups')
  
  const group = await getGroupById(groupId, tenantId)
  if (!group) {
    throw new Error('Group not found')
  }
  
  const updated: UserGroup = {
    ...group,
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  const { resource } = await container.item(groupId, tenantId).replace<UserGroup>(updated)
  return resource!
}

/**
 * Delete a group
 */
export async function deleteGroup(
  groupId: string,
  tenantId: string
): Promise<void> {
  const container = getContainer('user-groups')
  await container.item(groupId, tenantId).delete()
}

/**
 * Add member to group
 */
export async function addMemberToGroup(
  groupId: string,
  tenantId: string,
  userId: string
): Promise<UserGroup> {
  const group = await getGroupById(groupId, tenantId)
  if (!group) {
    throw new Error('Group not found')
  }
  
  if (!group.memberIds.includes(userId)) {
    group.memberIds.push(userId)
    return await updateGroup(groupId, tenantId, { memberIds: group.memberIds })
  }
  
  return group
}

/**
 * Remove member from group
 */
export async function removeMemberFromGroup(
  groupId: string,
  tenantId: string,
  userId: string
): Promise<UserGroup> {
  const group = await getGroupById(groupId, tenantId)
  if (!group) {
    throw new Error('Group not found')
  }
  
  group.memberIds = group.memberIds.filter(id => id !== userId)
  return await updateGroup(groupId, tenantId, { memberIds: group.memberIds })
}

