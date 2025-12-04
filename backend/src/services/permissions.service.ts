/**
 * Permissions Service - Sistema de Permisos Granular
 * 
 * Este servicio define y gestiona todos los permisos disponibles
 * en la plataforma Kaido.
 */

import { UserRole } from '../models/User';

/**
 * Todos los permisos disponibles en la plataforma
 * Formato: 'recurso:acción'
 */
export type Permission =
  // Tenant Management
  | 'tenants:create'
  | 'tenants:read'
  | 'tenants:update'
  | 'tenants:delete'
  | 'tenants:list-all'
  
  // User Management
  | 'users:create'
  | 'users:read'
  | 'users:update'
  | 'users:delete'
  | 'users:list'
  | 'users:change-role'
  | 'users:change-status'
  
  // Course Management
  | 'courses:create'
  | 'courses:read'
  | 'courses:update'
  | 'courses:delete'
  | 'courses:publish'
  | 'courses:archive'
  | 'courses:list-all'
  | 'courses:list-own'
  
  // Content Approval
  | 'content:create'
  | 'content:edit'
  | 'content:archive'
  | 'content:delete'
  | 'content:review'
  | 'content:approve'
  | 'content:reject'
  | 'content:request-changes'
  
  // Enrollment & Assignment
  | 'enrollment:assign-individual'
  | 'enrollment:assign-bulk'
  | 'enrollment:remove'
  | 'enrollment:view'
  
  // Groups & Teams
  | 'groups:create'
  | 'groups:read'
  | 'groups:update'
  | 'groups:delete'
  | 'groups:assign-users'
  | 'groups:assign-courses'
  
  // Analytics & Reports
  | 'analytics:view-all'
  | 'analytics:view-own'
  | 'analytics:export'
  | 'analytics:view-user-progress'
  | 'analytics:view-course-stats'
  | 'analytics:view-team-stats'
  
  // Gamification
  | 'gamification:configure-xp'
  | 'gamification:create-badges'
  | 'gamification:manage-leaderboards'
  
  // Mentorship
  | 'mentorship:configure'
  | 'mentorship:view-all-sessions'
  | 'mentorship:view-own-sessions'
  | 'mentorship:accept-requests'
  | 'mentorship:rate-sessions'
  
  // Settings & Configuration
  | 'settings:read'
  | 'settings:write'
  | 'settings:branding'
  | 'settings:notifications'
  | 'settings:integrations'
  | 'settings:languages'
  | 'settings:compliance'
  
  // Audit & Logs
  | 'audit:view-logs'
  | 'audit:export-logs'
  
  // Assets & Library
  | 'assets:upload'
  | 'assets:manage'
  | 'assets:delete';

/**
 * Matriz de permisos por rol
 * Define qué permisos tiene cada rol por defecto
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'super-admin': [
    // Acceso completo a todo
    'tenants:create',
    'tenants:read',
    'tenants:update',
    'tenants:delete',
    'tenants:list-all',
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'users:list',
    'users:change-role',
    'users:change-status',
    'courses:create',
    'courses:read',
    'courses:update',
    'courses:delete',
    'courses:publish',
    'courses:archive',
    'courses:list-all',
    'content:create',
    'content:edit',
    'content:archive',
    'content:delete',
    'content:review',
    'content:approve',
    'content:reject',
    'content:request-changes',
    'enrollment:assign-individual',
    'enrollment:assign-bulk',
    'enrollment:remove',
    'enrollment:view',
    'groups:create',
    'groups:read',
    'groups:update',
    'groups:delete',
    'groups:assign-users',
    'groups:assign-courses',
    'analytics:view-all',
    'analytics:export',
    'analytics:view-user-progress',
    'analytics:view-course-stats',
    'analytics:view-team-stats',
    'gamification:configure-xp',
    'gamification:create-badges',
    'gamification:manage-leaderboards',
    'mentorship:configure',
    'mentorship:view-all-sessions',
    'settings:read',
    'settings:write',
    'settings:branding',
    'settings:notifications',
    'settings:integrations',
    'settings:languages',
    'settings:compliance',
    'audit:view-logs',
    'audit:export-logs',
    'assets:upload',
    'assets:manage',
    'assets:delete',
  ],
  
  'tenant-admin': [
    // Administrador completo de su tenant
    'tenants:read',
    'tenants:update',
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'users:list',
    'users:change-role',
    'users:change-status',
    'courses:create',
    'courses:read',
    'courses:update',
    'courses:delete',
    'courses:publish',
    'courses:archive',
    'courses:list-all',
    'content:create',
    'content:edit',
    'content:archive',
    'content:delete',
    'content:review',
    'content:approve',
    'content:reject',
    'content:request-changes',
    'enrollment:assign-individual',
    'enrollment:assign-bulk',
    'enrollment:remove',
    'enrollment:view',
    'groups:create',
    'groups:read',
    'groups:update',
    'groups:delete',
    'groups:assign-users',
    'groups:assign-courses',
    'analytics:view-all',
    'analytics:export',
    'analytics:view-user-progress',
    'analytics:view-course-stats',
    'analytics:view-team-stats',
    'gamification:configure-xp',
    'gamification:create-badges',
    'gamification:manage-leaderboards',
    'mentorship:configure',
    'mentorship:view-all-sessions',
    'settings:read',
    'settings:write',
    'settings:branding',
    'settings:notifications',
    'settings:languages',
    'settings:compliance',
    'audit:view-logs',
    'assets:upload',
    'assets:manage',
    'assets:delete',
  ],
  
  'content-manager': [
    // Gestión completa de cursos y contenido
    'courses:create',
    'courses:read',
    'courses:update',
    'courses:delete',
    'courses:publish',
    'courses:archive',
    'courses:list-all',
    'content:create',
    'content:edit',
    'content:archive',
    'content:delete',
    'content:review',
    'content:approve',
    'content:reject',
    'content:request-changes',
    'enrollment:assign-individual',
    'enrollment:view',
    'analytics:view-course-stats',
    'gamification:create-badges',
    'assets:upload',
    'assets:manage',
    'assets:delete',
  ],
  
  'user-manager': [
    // Gestión de usuarios y equipos
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'users:list',
    'users:change-role',
    'users:change-status',
    'enrollment:assign-individual',
    'enrollment:assign-bulk',
    'enrollment:remove',
    'enrollment:view',
    'groups:create',
    'groups:read',
    'groups:update',
    'groups:delete',
    'groups:assign-users',
    'groups:assign-courses',
    'analytics:view-user-progress',
    'analytics:view-team-stats',
    'mentorship:configure',
    'mentorship:view-all-sessions',
  ],
  
  'analytics-viewer': [
    // Solo lectura de analytics
    'users:list',
    'courses:list-all',
    'analytics:view-all',
    'analytics:export',
    'analytics:view-user-progress',
    'analytics:view-course-stats',
    'analytics:view-team-stats',
    'mentorship:view-all-sessions',
  ],
  
  'instructor': [
    // Creación de cursos (requiere aprobación)
    'courses:create',
    'courses:read',
    'courses:update',
    'courses:list-own',
    'content:create',
    'content:edit',
    'analytics:view-own',
    'analytics:view-course-stats',
    'gamification:create-badges',
    'mentorship:view-own-sessions',
    'mentorship:accept-requests',
    'assets:upload',
  ],
  
  'mentor': [
    // Guía de estudiantes
    'courses:read',
    'analytics:view-user-progress',
    'mentorship:view-own-sessions',
    'mentorship:accept-requests',
    'mentorship:rate-sessions',
  ],
  
  'student': [
    // Experiencia de aprendizaje
    'courses:read',
    'analytics:view-own',
    'mentorship:view-own-sessions',
    'mentorship:rate-sessions',
  ],
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: UserRole, permission: Permission, customPermissions?: string[]): boolean {
  // Verificar permisos del rol
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  if (rolePermissions.includes(permission)) {
    return true;
  }
  
  // Verificar permisos personalizados
  if (customPermissions && customPermissions.includes(permission)) {
    return true;
  }
  
  return false;
}

/**
 * Obtiene todos los permisos de un rol
 */
export function getPermissionsForRole(role: UserRole, customPermissions?: string[]): Permission[] {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  
  if (customPermissions && customPermissions.length > 0) {
    // Combinar permisos del rol con permisos personalizados
    return [...new Set([...rolePermissions, ...customPermissions as Permission[]])];
  }
  
  return rolePermissions;
}

/**
 * Verifica si un rol puede acceder a un recurso
 */
export function canAccessResource(
  role: UserRole, 
  resource: string, 
  action: string,
  customPermissions?: string[]
): boolean {
  const permission = `${resource}:${action}` as Permission;
  return hasPermission(role, permission, customPermissions);
}

/**
 * Verifica si un usuario puede editar un recurso que le pertenece
 */
export function canEditOwnResource(
  role: UserRole,
  resourceOwnerId: string,
  userId: string,
  customPermissions?: string[]
): boolean {
  // Super Admin y Tenant Admin pueden editar cualquier cosa
  if (role === 'super-admin' || role === 'tenant-admin') {
    return true;
  }
  
  // Content Manager puede editar cualquier curso
  if (role === 'content-manager') {
    return true;
  }
  
  // Instructor solo puede editar sus propios cursos
  if (role === 'instructor') {
    return resourceOwnerId === userId;
  }
  
  return false;
}

/**
 * Verifica si un rol es administrador (cualquier tipo)
 */
export function isAdmin(role: UserRole): boolean {
  return ['super-admin', 'tenant-admin', 'content-manager', 'user-manager'].includes(role);
}

/**
 * Verifica si un rol puede crear contenido
 */
export function canCreateContent(role: UserRole, customPermissions?: string[]): boolean {
  return hasPermission(role, 'courses:create', customPermissions);
}

/**
 * Verifica si un rol puede ver analytics
 */
export function canViewAnalytics(role: UserRole, customPermissions?: string[]): boolean {
  return hasPermission(role, 'analytics:view-all', customPermissions) ||
         hasPermission(role, 'analytics:view-own', customPermissions);
}

/**
 * Obtiene la jerarquía de roles (para validar cambios de rol)
 */
export function getRoleHierarchy(): Record<UserRole, number> {
  return {
    'super-admin': 8,
    'tenant-admin': 7,
    'content-manager': 6,
    'user-manager': 6,
    'analytics-viewer': 5,
    'instructor': 4,
    'mentor': 3,
    'student': 1,
  };
}

/**
 * Verifica si un rol puede cambiar el rol de otro usuario
 */
export function canChangeRole(
  currentUserRole: UserRole,
  targetUserRole: UserRole,
  newRole: UserRole
): boolean {
  const hierarchy = getRoleHierarchy();
  const currentLevel = hierarchy[currentUserRole];
  const targetLevel = hierarchy[targetUserRole];
  const newLevel = hierarchy[newRole];
  
  // Solo puedes cambiar el rol de usuarios con nivel inferior al tuyo
  // Y no puedes asignar un rol superior al tuyo
  return currentLevel > targetLevel && currentLevel >= newLevel;
}

/**
 * Exportar matriz de permisos (para debugging/documentación)
 */
export function getPermissionMatrix(): Record<UserRole, Permission[]> {
  return ROLE_PERMISSIONS;
}
