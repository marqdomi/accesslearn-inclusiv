/**
 * RequirePermission Component - Protección basada en permisos
 * 
 * Muestra contenido solo si el usuario tiene el permiso especificado
 */

import { ReactNode } from 'react'
import { usePermissions, Permission } from '@/hooks/use-permissions'

interface RequirePermissionProps {
  permission: Permission | Permission[]
  children: ReactNode
  fallback?: ReactNode
  requireAll?: boolean // Si true, requiere todos los permisos, si false (default), requiere al menos uno
}

export function RequirePermission({ 
  permission, 
  children, 
  fallback = null,
  requireAll = false 
}: RequirePermissionProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions()
  
  const hasAccess = (() => {
    if (Array.isArray(permission)) {
      return requireAll ? hasAllPermissions(permission) : hasAnyPermission(permission)
    }
    return hasPermission(permission)
  })()
  
  if (!hasAccess) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
