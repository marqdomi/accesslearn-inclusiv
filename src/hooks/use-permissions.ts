/**
 * usePermissions Hook - Sistema de Permisos en Frontend
 * 
 * Hooks para verificar permisos y roles en componentes React
 */

import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/lib/types'

/**
 * Tipos de permisos (sincronizado con backend)
 */
export type Permission =
  // Tenant Management
  | 'tenants:create' | 'tenants:read' | 'tenants:update' | 'tenants:delete' | 'tenants:list-all'
  // User Management
  | 'users:create' | 'users:read' | 'users:update' | 'users:delete' | 'users:list' | 'users:change-role' | 'users:change-status'
  // Course Management
  | 'courses:create' | 'courses:read' | 'courses:update' | 'courses:delete' | 'courses:publish' | 'courses:archive' | 'courses:list-all' | 'courses:list-own'
  // Content Approval
  | 'content:review' | 'content:approve' | 'content:reject' | 'content:request-changes'
  // Enrollment & Assignment
  | 'enrollment:assign-individual' | 'enrollment:assign-bulk' | 'enrollment:remove' | 'enrollment:view'
  // Groups & Teams
  | 'groups:create' | 'groups:read' | 'groups:update' | 'groups:delete' | 'groups:assign-users' | 'groups:assign-courses'
  // Analytics & Reports
  | 'analytics:view-all' | 'analytics:view-own' | 'analytics:export' | 'analytics:view-user-progress' | 'analytics:view-course-stats' | 'analytics:view-team-stats'
  // Gamification
  | 'gamification:configure-xp' | 'gamification:create-badges' | 'gamification:manage-leaderboards'
  // Mentorship
  | 'mentorship:configure' | 'mentorship:view-all-sessions' | 'mentorship:view-own-sessions' | 'mentorship:accept-requests' | 'mentorship:rate-sessions'
  // Settings & Configuration
  | 'settings:branding' | 'settings:notifications' | 'settings:integrations' | 'settings:languages' | 'settings:compliance'
  // Audit & Logs
  | 'audit:view-logs' | 'audit:export-logs'
  // Assets & Library
  | 'assets:upload' | 'assets:manage' | 'assets:delete';

/**
 * Matriz de permisos por rol (debe coincidir con backend)
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'super-admin': [
    'tenants:create', 'tenants:read', 'tenants:update', 'tenants:delete', 'tenants:list-all',
    'users:create', 'users:read', 'users:update', 'users:delete', 'users:list', 'users:change-role', 'users:change-status',
    'courses:create', 'courses:read', 'courses:update', 'courses:delete', 'courses:publish', 'courses:archive', 'courses:list-all',
    'content:review', 'content:approve', 'content:reject', 'content:request-changes',
    'enrollment:assign-individual', 'enrollment:assign-bulk', 'enrollment:remove', 'enrollment:view',
    'groups:create', 'groups:read', 'groups:update', 'groups:delete', 'groups:assign-users', 'groups:assign-courses',
    'analytics:view-all', 'analytics:export', 'analytics:view-user-progress', 'analytics:view-course-stats', 'analytics:view-team-stats',
    'gamification:configure-xp', 'gamification:create-badges', 'gamification:manage-leaderboards',
    'mentorship:configure', 'mentorship:view-all-sessions',
    'settings:branding', 'settings:notifications', 'settings:integrations', 'settings:languages', 'settings:compliance',
    'audit:view-logs', 'audit:export-logs',
    'assets:upload', 'assets:manage', 'assets:delete',
  ],
  'tenant-admin': [
    'tenants:read', 'tenants:update',
    'users:create', 'users:read', 'users:update', 'users:delete', 'users:list', 'users:change-role', 'users:change-status',
    'courses:create', 'courses:read', 'courses:update', 'courses:delete', 'courses:publish', 'courses:archive', 'courses:list-all',
    'content:review', 'content:approve', 'content:reject', 'content:request-changes',
    'enrollment:assign-individual', 'enrollment:assign-bulk', 'enrollment:remove', 'enrollment:view',
    'groups:create', 'groups:read', 'groups:update', 'groups:delete', 'groups:assign-users', 'groups:assign-courses',
    'analytics:view-all', 'analytics:export', 'analytics:view-user-progress', 'analytics:view-course-stats', 'analytics:view-team-stats',
    'gamification:configure-xp', 'gamification:create-badges', 'gamification:manage-leaderboards',
    'mentorship:configure', 'mentorship:view-all-sessions',
    'settings:branding', 'settings:notifications', 'settings:languages', 'settings:compliance',
    'audit:view-logs',
    'assets:upload', 'assets:manage', 'assets:delete',
  ],
  'content-manager': [
    'courses:create', 'courses:read', 'courses:update', 'courses:delete', 'courses:publish', 'courses:archive', 'courses:list-all',
    'content:review', 'content:approve', 'content:reject', 'content:request-changes',
    'enrollment:assign-individual', 'enrollment:view',
    'analytics:view-course-stats',
    'gamification:create-badges',
    'assets:upload', 'assets:manage', 'assets:delete',
  ],
  'user-manager': [
    'users:create', 'users:read', 'users:update', 'users:delete', 'users:list', 'users:change-role', 'users:change-status',
    'enrollment:assign-individual', 'enrollment:assign-bulk', 'enrollment:remove', 'enrollment:view',
    'groups:create', 'groups:read', 'groups:update', 'groups:delete', 'groups:assign-users', 'groups:assign-courses',
    'analytics:view-user-progress', 'analytics:view-team-stats',
    'mentorship:configure', 'mentorship:view-all-sessions',
  ],
  'analytics-viewer': [
    'users:list',
    'courses:list-all',
    'analytics:view-all', 'analytics:export', 'analytics:view-user-progress', 'analytics:view-course-stats', 'analytics:view-team-stats',
    'mentorship:view-all-sessions',
  ],
  'instructor': [
    'courses:create', 'courses:read', 'courses:update', 'courses:list-own',
    'analytics:view-own', 'analytics:view-course-stats',
    'gamification:create-badges',
    'mentorship:view-own-sessions', 'mentorship:accept-requests',
    'assets:upload',
  ],
  'mentor': [
    'courses:read',
    'analytics:view-user-progress',
    'mentorship:view-own-sessions', 'mentorship:accept-requests', 'mentorship:rate-sessions',
  ],
  'student': [
    'courses:read',
    'analytics:view-own',
    'mentorship:view-own-sessions', 'mentorship:rate-sessions',
  ],
  // Legacy aliases
  'admin': [], // Will use tenant-admin permissions
  'employee': [], // Will use student permissions
};

/**
 * Hook principal de permisos
 */
export function usePermissions() {
  const { user } = useAuth()
  
  /**
   * Normaliza el rol para manejar aliases
   */
  const normalizeRole = (role: UserRole): UserRole => {
    if (role === 'admin') return 'tenant-admin'
    if (role === 'employee') return 'student'
    return role
  }
  
  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      if (!user) return false
      
      const normalizedRole = normalizeRole(user.role)
      const rolePermissions = ROLE_PERMISSIONS[normalizedRole] || []
      
      // Verificar permisos del rol
      if (rolePermissions.includes(permission)) {
        return true
      }
      
      // Verificar permisos personalizados
      if (user.customPermissions && user.customPermissions.includes(permission)) {
        return true
      }
      
      return false
    }
  }, [user])
  
  /**
   * Verifica si el usuario tiene uno de varios permisos
   */
  const hasAnyPermission = useMemo(() => {
    return (permissions: Permission[]): boolean => {
      return permissions.some(permission => hasPermission(permission))
    }
  }, [hasPermission])
  
  /**
   * Verifica si el usuario tiene todos los permisos especificados
   */
  const hasAllPermissions = useMemo(() => {
    return (permissions: Permission[]): boolean => {
      return permissions.every(permission => hasPermission(permission))
    }
  }, [hasPermission])
  
  /**
   * Obtiene todos los permisos del usuario actual
   */
  const userPermissions = useMemo(() => {
    if (!user) return []
    
    const normalizedRole = normalizeRole(user.role)
    const rolePermissions = ROLE_PERMISSIONS[normalizedRole] || []
    
    if (user.customPermissions) {
      return [...new Set([...rolePermissions, ...user.customPermissions as Permission[]])]
    }
    
    return rolePermissions
  }, [user])
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userPermissions,
  }
}

/**
 * Hook para verificar roles
 */
export function useHasRole() {
  const { user } = useAuth()
  
  const hasRole = useMemo(() => {
    return (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false
      
      const rolesArray = Array.isArray(roles) ? roles : [roles]
      
      // Manejar aliases
      const normalizedUserRole = user.role === 'admin' ? 'tenant-admin' : 
                                  user.role === 'employee' ? 'student' : 
                                  user.role
      
      return rolesArray.some(role => {
        const normalizedRole = role === 'admin' ? 'tenant-admin' : 
                               role === 'employee' ? 'student' : 
                               role
        return normalizedUserRole === normalizedRole
      })
    }
  }, [user])
  
  const isAdmin = useMemo(() => {
    return hasRole(['super-admin', 'tenant-admin', 'content-manager', 'user-manager'])
  }, [hasRole])
  
  const canCreateContent = useMemo(() => {
    return hasRole(['super-admin', 'tenant-admin', 'content-manager', 'instructor'])
  }, [hasRole])
  
  const canManageUsers = useMemo(() => {
    return hasRole(['super-admin', 'tenant-admin', 'user-manager'])
  }, [hasRole])
  
  const canViewAnalytics = useMemo(() => {
    return hasRole(['super-admin', 'tenant-admin', 'analytics-viewer', 'user-manager'])
  }, [hasRole])
  
  return {
    hasRole,
    isAdmin,
    canCreateContent,
    canManageUsers,
    canViewAnalytics,
  }
}

/**
 * Hook para verificar acceso a recursos
 */
export function useCanAccess() {
  const { hasPermission } = usePermissions()
  
  const canAccessResource = useMemo(() => {
    return (resource: string, action: string): boolean => {
      const permission = `${resource}:${action}` as Permission
      return hasPermission(permission)
    }
  }, [hasPermission])
  
  return {
    canAccessResource,
  }
}
