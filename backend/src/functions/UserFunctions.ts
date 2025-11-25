/**
 * User Functions - Kaido Backend
 * CRUD operations for user management with Mexican compliance
 */

import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { getContainer } from '../services/cosmosdb.service';
import { User, UserRole, CreateUserRequest, UpdateUserRequest, UserProgress } from '../models/User';
import { emailService } from '../services/email.service';
import { getLevelFromXP } from './GamificationFunctions';

/**
 * Hash password using SHA-256
 * In production, consider using bcrypt or Argon2 for better security
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

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
 * Change user password
 */
export async function changePassword(
  userId: string,
  tenantId: string,
  currentPassword: string,
  newPassword: string
): Promise<User> {
  const usersContainer = getContainer('users');
  
  // Get existing user
  const existingUser = await getUserById(userId, tenantId);
  if (!existingUser) {
    throw new Error(`Usuario ${userId} no encontrado.`);
  }
  
  // Validate current password
  const hashedCurrentPassword = hashPassword(currentPassword);
  if (existingUser.password && existingUser.password !== hashedCurrentPassword) {
    throw new Error('Contraseña actual incorrecta.');
  }
  
  // Validate new password (minimum 8 characters)
  if (newPassword.length < 8) {
    throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
  }
  
  // Hash new password
  const hashedNewPassword = hashPassword(newPassword);
  
  // Update password
  const updatedUser: User = {
    ...existingUser,
    password: hashedNewPassword,
    passwordResetRequired: false,
    updatedAt: new Date().toISOString()
  };
  
  const { resource } = await usersContainer.items.upsert(updatedUser);
  return resource as unknown as User;
}

/**
 * Update user profile (avatar, personal info, etc.)
 */
export async function updateProfile(
  userId: string,
  tenantId: string,
  profileUpdates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    avatar?: string; // Base64 string or URL
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  }
): Promise<User> {
  const usersContainer = getContainer('users');
  
  // Get existing user
  const existingUser = await getUserById(userId, tenantId);
  if (!existingUser) {
    throw new Error(`Usuario ${userId} no encontrado.`);
  }
  
  // Validate date format if provided
  if (profileUpdates.dateOfBirth) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(profileUpdates.dateOfBirth)) {
      throw new Error('Fecha de nacimiento debe estar en formato YYYY-MM-DD.');
    }
  }
  
  // Apply profile updates
  const updatedUser: User = {
    ...existingUser,
    ...(profileUpdates.firstName && { firstName: profileUpdates.firstName }),
    ...(profileUpdates.lastName && { lastName: profileUpdates.lastName }),
    ...(profileUpdates.phone && { phone: profileUpdates.phone }),
    ...(profileUpdates.dateOfBirth && { dateOfBirth: profileUpdates.dateOfBirth }),
    ...(profileUpdates.gender && { gender: profileUpdates.gender }),
    ...(profileUpdates.avatar && { avatar: profileUpdates.avatar }),
    ...(profileUpdates.address && {
      address: {
        street: profileUpdates.address.street || existingUser.address?.street || '',
        city: profileUpdates.address.city || existingUser.address?.city || '',
        state: profileUpdates.address.state || existingUser.address?.state || '',
        zipCode: profileUpdates.address.zipCode || existingUser.address?.zipCode || '',
        country: profileUpdates.address.country || existingUser.address?.country || '',
      }
    }),
    updatedAt: new Date().toISOString()
  };
  
  const { resource } = await usersContainer.items.upsert(updatedUser);
  return resource as unknown as User;
}

/**
 * Enroll user in a course
 * Also creates initial progress record so the course appears in the user's library
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

  // Initialize user progress for this course (so it appears in library)
  try {
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

    // Only create if it doesn't exist
    if (resources.length === 0) {
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
  } catch (error: any) {
    console.error(`[enrollUserInCourse] Error initializing progress for course ${courseId}:`, error);
    // Don't fail enrollment if progress initialization fails
  }
  
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
  
  // Update XP and potentially level up (using logarithmic system)
  user.totalXP += xpEarned;
  const newLevel = getLevelFromXP(user.totalXP);
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
    role: request.role as any,
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
 * Get user by invitation token (for validation)
 * Returns user info without sensitive data
 */
export async function getUserByInvitationToken(invitationToken: string): Promise<User | null> {
  const usersContainer = getContainer('users');
  
  const { resources: users } = await usersContainer.items
    .query({
      query: 'SELECT * FROM c WHERE c.invitationToken = @token',
      parameters: [{ name: '@token', value: invitationToken }]
    })
    .fetchAll();
  
  if (users.length === 0) {
    return null;
  }
  
  return users[0] as User;
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
  const user = await getUserByInvitationToken(invitationToken);
  
  if (!user) {
    throw new Error('Token de invitación inválido o expirado.');
  }
  
  // Check if invitation expired
  if (user.invitationExpiresAt && new Date(user.invitationExpiresAt) < new Date()) {
    throw new Error('La invitación ha expirado.');
  }
  
  // Check if already accepted
  if (user.status === 'active') {
    throw new Error('Esta invitación ya ha sido aceptada.');
  }
  
  // Update user - set password (hashed) and activate
  user.password = hashPassword(password); // Hash password for security
  user.status = 'active';
  user.invitationToken = undefined;
  user.invitationAcceptedAt = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  
  const { resource } = await usersContainer.items.upsert(user);
  return resource as unknown as User;
}

/**
 * Register new user (public registration for demos)
 * Creates user directly without invitation
 */
export async function registerUser(request: {
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: string; // Defaults to 'student' if not provided
}): Promise<User> {
  const usersContainer = getContainer('users');
  
  // Check if email already exists in this tenant
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
    throw new Error(`El email ${request.email} ya está registrado en esta organización.`);
  }
  
  // Validate password
  if (!request.password || request.password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres.');
  }
  
  // Generate user ID
  const userId = `user-${uuidv4()}`;
  const now = new Date().toISOString();
  
  // Default role to 'student' if not provided
  const userRole = (request.role || 'student') as UserRole;
  
  // Create user
  const newUser: User = {
    id: userId,
    tenantId: request.tenantId,
    email: request.email,
    firstName: request.firstName,
    lastName: request.lastName,
    role: userRole,
    status: 'active', // Directly active for public registration
    
    // Hash password
    password: hashPassword(request.password),
    passwordResetRequired: false,
    
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
  
  return resource as unknown as User;
}
