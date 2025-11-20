/**
 * ProtectedRoute Component - Protección de rutas
 * 
 * Protege rutas completas basándose en roles o permisos
 */

import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useHasRole, usePermissions, Permission } from '@/hooks/use-permissions'
import { UserRole } from '@/lib/types'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole | UserRole[]
  requiredPermission?: Permission | Permission[]
  requireAll?: boolean // Para permisos múltiples
  redirectTo?: string
  fallback?: ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  requiredPermission,
  requireAll = false,
  redirectTo = '/login',
  fallback 
}: ProtectedRouteProps) {
  const { user } = useAuth()
  const { hasRole } = useHasRole()
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions()
  
  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to={redirectTo} replace />
  }
  
  // Verificar rol si se especificó
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>
    }
    return <Navigate to="/" replace />
  }
  
  // Verificar permiso si se especificó
  if (requiredPermission) {
    const hasAccess = (() => {
      if (Array.isArray(requiredPermission)) {
        return requireAll ? hasAllPermissions(requiredPermission) : hasAnyPermission(requiredPermission)
      }
      return hasPermission(requiredPermission)
    })()
    
    if (!hasAccess) {
      if (fallback) {
        return <>{fallback}</>
      }
      return <Navigate to="/" replace />
    }
  }
  
  return <>{children}</>
}
