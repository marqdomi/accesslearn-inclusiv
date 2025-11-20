/**
 * RequireRole Component - Protección basada en roles
 * 
 * Muestra contenido solo si el usuario tiene uno de los roles especificados
 */

import { ReactNode } from 'react'
import { useHasRole } from '@/hooks/use-permissions'
import { UserRole } from '@/lib/types'

interface RequireRoleProps {
  roles: UserRole | UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

export function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  const { hasRole } = useHasRole()
  
  if (!hasRole(roles)) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}
