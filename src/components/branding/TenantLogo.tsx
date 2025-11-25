/**
 * TenantLogo Component
 * Displays tenant logo with automatic Blob Storage URL generation
 */

import { useState, useEffect } from 'react'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'

interface TenantLogoProps {
  className?: string
  alt?: string
  fallbackIcon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
}

export function TenantLogo({ 
  className = '', 
  alt = 'Company logo',
  fallbackIcon,
  size = 'md'
}: TenantLogoProps) {
  const { currentTenant } = useTenant()
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadLogo = async () => {
      if (!currentTenant?.logo) {
        setIsLoading(false)
        return
      }

      try {
        // Si ya es una URL (con SAS token o externa), usarla directamente
        if (currentTenant.logo.startsWith('http') || currentTenant.logo.startsWith('data:')) {
          setLogoUrl(currentTenant.logo)
          setIsLoading(false)
          return
        }

        // Si es un blobName, el backend ya debería haber generado la URL con SAS token
        // cuando se cargó el tenant desde /api/tenants/slug/:slug
        // Si por alguna razón no es una URL, intentar generar una (requiere auth)
        // Pero esto solo funcionará si el usuario está autenticado
        if (currentTenant.logo.includes('/')) {
          try {
            const [containerName, ...blobNameParts] = currentTenant.logo.split('/')
            const blobName = blobNameParts.join('/')
            const { url } = await ApiService.getMediaUrl(containerName, blobName)
            setLogoUrl(url)
          } catch (authError) {
            // Si falla por autenticación, el logo no se puede cargar sin auth
            // Esto es normal en la página de login
            console.warn('[TenantLogo] Cannot generate logo URL without authentication:', authError)
            setLogoUrl(null)
          }
        } else {
          setLogoUrl(currentTenant.logo)
        }
      } catch (error) {
        console.error('[TenantLogo] Error loading logo:', error)
        setLogoUrl(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadLogo()
  }, [currentTenant?.logo])

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-muted rounded animate-pulse`}>
        <div className="h-1/2 w-1/2 bg-muted-foreground/20 rounded" />
      </div>
    )
  }

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={alt || currentTenant?.name || 'Company logo'}
        className={`${sizeClasses[size]} ${className} object-contain`}
        onError={() => setLogoUrl(null)}
      />
    )
  }

  // Fallback: mostrar icono o iniciales
  if (fallbackIcon) {
    return <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>{fallbackIcon}</div>
  }

  // Fallback por defecto: iniciales del tenant
  const initials = currentTenant?.name
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AL'

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-primary text-primary-foreground rounded font-bold text-sm`}>
      {initials}
    </div>
  )
}

