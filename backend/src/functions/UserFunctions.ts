/**
 * User Functions - AccessLearn Backend
 * CRUD operations for user management with Mexican compliance
 */

import { v4 as uuidv4 } from 'uuid';
import { getContainer } from '../services/cosmosdb.service';
import { User, CreateUserRequest, UpdateUserRequest, UserProgress } from '../models/User';
import { emailService } from '../services/email.service';

/**
 * Validate Mexican CURP format (basic validation)
 * CURP: 18 characters - 4 letters, 6 digits (date), 1 letter (gender), 2 letters (state), 3 consonants, 2 check digits
 */
function isValidCURP(curp: string): boolean {
  const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}$/;
  return curpRegex.test(curp);
}

/**
 * Validate Mexican RFC format (basic validation)
 * RFC: 13 characters - 4 letters, 6 digits (date), 3 alphanumeric (homoclave)
 */
function isValidRFC(rfc: string): boolean {
  const rfcRegex = /^[A-Z]{4}\d{6}[A-Z0-9]{3}$/;
  return rfcRegex.test(rfc);
}

/**
 * Validate Mexican NSS format
 * NSS: 11 digits
 */
function isValidNSS(nss: string): boolean {
  const nssRegex = /^\d{11}$/;
  return nssRegex.test(nss);
}

/**
 * Create a new user
 */
export async function createUser(request: CreateUserRequest): Promise<User> {
  // Validate Mexican compliance fields if provided
  if (request.curp && !isValidCURP(request.curp)) {
    throw new Error('CURP inválido. Debe tener 18 caracteres en formato correcto.');
  }
  
  if (request.rfc && !isValidRFC(request.rfc)) {
    throw new Error('RFC inválido. Debe tener 13 caracteres en formato correcto.');
  }
  
  if (request.nss && !isValidNSS(request.nss)) {
    throw new Error('NSS inválido. Debe tener 11 dígitos.');
  }
  
  // Check if email already exists in this tenant
  const usersContainer = getContainer('users');
  const { resources: existingUsers } = await usersContainer.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.email = @email',
      parameters: [
        { name: '@tenantId', value: request.tenantId },
        { name: '@email', value: request.email }
      ]
    })
    .fetchAll();
  
  if (existingUsers.length > 0) {
    throw new Error(`El email ${request.email} ya está registrado en este tenant.`);
  }
  
  // Create new user
  const now = new Date().toISOString();
  const userId = `user-${uuidv4()}`;
  
  const newUser: User = {
    id: userId,
    tenantId: request.tenantId,
    email: request.email,
    firstName: request.firstName,
    lastName: request.lastName,
    role: request.role,
    status: 'active',
    
    // Authentication (for demo/testing - use temporaryPassword or default)
    password: request.temporaryPassword || 'Welcome123!',
    passwordResetRequired: true,
    
    // Mexican compliance
    curp: request.curp,
    rfc: request.rfc,
    nss: request.nss,
    
    // Optional profile
    phone: request.phone,
    dateOfBirth: request.dateOfBirth,
    gender: request.gender,
    address: request.address,
    
    // Learning progress (initialized empty)
    enrolledCourses: [],
    completedCourses: [],
    totalXP: 0,
    level: 1,
    badges: [],
    
    // Metadata
    createdAt: now,
    updatedAt: now
  };
  
  const { resource } = await usersContainer.items.create(newUser);
  return resource as unknown as User;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string, tenantId: string): Promise<User | null> {
  try {
    const usersContainer = getContainer('users');
    const { resource } = await usersContainer.item(userId, tenantId).read<User>();
    return resource || null;
  } catch (error: any) {
    if (error.code === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Get all users for a tenant
 */
export async function getUsersByTenant(tenantId: string, role?: string): Promise<User[]> {
  const usersContainer = getContainer('users');
  
  let query = 'SELECT * FROM c WHERE c.tenantId = @tenantId';
  const parameters: any[] = [{ name: '@tenantId', value: tenantId }];
  
  if (role) {
    query += ' AND c.role = @role';
    parameters.push({ name: '@role', value: role });
  }
  
  query += ' ORDER BY c.createdAt DESC';
  
  const { resources } = await usersContainer.items
    .query({ query, parameters })
    .fetchAll();
  
  return resources as User[];
}

/**
 * Update user information
 */
export async function updateUser(
  userId: string,
  tenantId: string,
  updates: UpdateUserRequest
): Promise<User> {
  const usersContainer = getContainer('users');
  
  // Get existing user
  const existingUser = await getUserById(userId, tenantId);
  if (!existingUser) {
    throw new Error(`Usuario ${userId} no encontrado.`);
  }
  
  // Validate compliance fields if being updated
  if (updates.curp && !isValidCURP(updates.curp)) {
    throw new Error('CURP inválido.');
  }
  
  if (updates.rfc && !isValidRFC(updates.rfc)) {
    throw new Error('RFC inválido.');
  }
  
  if (updates.nss && !isValidNSS(updates.nss)) {
    throw new Error('NSS inválido.');
  }
  
  // Apply updates
  const updatedUser: User = {
    ...existingUser,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  const { resource } = await usersContainer.items.upsert(updatedUser);
  return resource as unknown as User;
}

/**
 * Enroll user in a course
 */
export async function enrollUserInCourse(
  userId: string,
  tenantId: string,
  courseId: string
): Promise<User> {
  const usersContainer = getContainer('users');
  
  const user = await getUserById(userId, tenantId);
  if (!user) {
    throw new Error(`Usuario ${userId} no encontrado.`);
  }
  
  // Check if already enrolled
  if (user.enrolledCourses.includes(courseId)) {
    throw new Error(`Usuario ya está inscrito en el curso ${courseId}.`);
  }
  
  user.enrolledCourses.push(courseId);
  user.updatedAt = new Date().toISOString();
  
  const { resource } = await usersContainer.items.upsert(user);
  return resource as unknown as User;
}

/**
 * Complete a course for a user
 */
export async function completeCourse(
  userId: string,
  tenantId: string,
  courseId: string,
  xpEarned: number = 100
): Promise<User> {
  const usersContainer = getContainer('users');
  
  const user = await getUserById(userId, tenantId);
  if (!user) {
    throw new Error(`Usuario ${userId} no encontrado.`);
  }
  
  // Check if already completed
  if (user.completedCourses.includes(courseId)) {
    return user; // Already completed, no action needed
  }
  
  // Add to completed courses
  user.completedCourses.push(courseId);
  
  // Update XP and potentially level up
  user.totalXP += xpEarned;
  const newLevel = Math.floor(user.totalXP / 100) + 1; // 100 XP per level
  if (newLevel > user.level) {
    user.level = newLevel;
  }
  
  user.updatedAt = new Date().toISOString();
  
  const { resource } = await usersContainer.items.upsert(user);
  return resource as unknown as User;
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string, tenantId: string): Promise<void> {
  const usersContainer = getContainer('users');
  
  const user = await getUserById(userId, tenantId);
  if (!user) {
    return; // Silently fail if user not found
  }
  
  user.lastLoginAt = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  
  await usersContainer.items.upsert(user);
}

/**
 * Get user statistics for a tenant (for admin dashboard)
 */
export async function getTenantUserStats(tenantId: string) {
  const users = await getUsersByTenant(tenantId);
  
  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    mentors: users.filter(u => u.role === 'mentor').length,
    students: users.filter(u => u.role === 'student').length,
    admins: users.filter(u => ['super-admin', 'tenant-admin'].includes(u.role)).length,
    averageXP: users.reduce((sum, u) => sum + u.totalXP, 0) / users.length || 0,
    totalEnrollments: users.reduce((sum, u) => sum + u.enrolledCourses.length, 0),
    totalCompletions: users.reduce((sum, u) => sum + u.completedCourses.length, 0)
  };
}

/**
 * Delete user (soft delete - marks as inactive)
 */
export async function deleteUser(userId: string, tenantId: string): Promise<void> {
  const usersContainer = getContainer('users');
  
  const user = await getUserById(userId, tenantId);
  if (!user) {
    throw new Error(`Usuario ${userId} no encontrado.`);
  }
  
  // Soft delete - mark as inactive
  user.status = 'inactive';
  user.updatedAt = new Date().toISOString();
  user.deletedAt = new Date().toISOString();
  
  await usersContainer.items.upsert(user);
}

/**
 * Hard delete user (permanent deletion)
 */
export async function hardDeleteUser(userId: string, tenantId: string): Promise<void> {
  const usersContainer = getContainer('users');
  
  const user = await getUserById(userId, tenantId);
  if (!user) {
    throw new Error(`Usuario ${userId} no encontrado.`);
  }
  
  // Permanent deletion
  await usersContainer.item(userId, tenantId).delete();
}

/**
 * Invite user - Creates user with pending status and invitation token
 */
export async function inviteUser(request: {
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  invitedBy: string;
}): Promise<{ user: User; invitationToken: string }> {
  // Check if email already exists
  const usersContainer = getContainer('users');
  const { resources: existingUsers } = await usersContainer.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.email = @email',
      parameters: [
        { name: '@tenantId', value: request.tenantId },
        { name: '@email', value: request.email }
      ]
    })
    .fetchAll();
  
  if (existingUsers.length > 0) {
    throw new Error(`El email ${request.email} ya está registrado.`);
  }
  
  // Generate invitation token
  const invitationToken = `inv-${uuidv4()}`;
  const now = new Date().toISOString();
  const userId = `user-${uuidv4()}`;
  
  // Create user with pending status
  const newUser: User = {
    id: userId,
    tenantId: request.tenantId,
    email: request.email,
    firstName: request.firstName,
    lastName: request.lastName,
    role: request.role,
    status: 'pending', // Pending until they accept invitation
    
    // No password yet - will be set when they accept
    password: '',
    passwordResetRequired: true,
    
    // Invitation metadata
    invitationToken,
    invitedBy: request.invitedBy,
    invitedAt: now,
    invitationExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    
    // Initialize empty
    enrolledCourses: [],
    completedCourses: [],
    totalXP: 0,
    level: 1,
    badges: [],
    
    createdAt: now,
    updatedAt: now
  };
  
  const { resource } = await usersContainer.items.create(newUser);
  
  return {
    user: resource as unknown as User,
    invitationToken
  };
}

/**
 * Accept invitation - User sets password and activates account
 */
export async function acceptInvitation(
  invitationToken: string,
  password: string
): Promise<User> {
  const usersContainer = getContainer('users');
  
  // Find user by invitation token
  const { resources: users } = await usersContainer.items
    .query({
      query: 'SELECT * FROM c WHERE c.invitationToken = @token',
      parameters: [{ name: '@token', value: invitationToken }]
    })
    .fetchAll();
  
  if (users.length === 0) {
    throw new Error('Token de invitación inválido o expirado.');
  }
  
  const user = users[0] as User;
  
  // Check if invitation expired
  if (user.invitationExpiresAt && new Date(user.invitationExpiresAt) < new Date()) {
    throw new Error('La invitación ha expirado.');
  }
  
  // Check if already accepted
  if (user.status === 'active') {
    throw new Error('Esta invitación ya ha sido aceptada.');
  }
  
  // Update user - set password and activate
  user.password = password; // TODO: Hash password in production
  user.status = 'active';
  user.invitationToken = undefined;
  user.invitationAcceptedAt = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  
  const { resource } = await usersContainer.items.upsert(user);
  return resource as unknown as User;
}
