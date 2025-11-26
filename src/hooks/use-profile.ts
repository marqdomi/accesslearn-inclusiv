/**
 * use-profile Hook
 * Manages user profile information and updates
 */

import { useState, useEffect, useCallback } from 'react'
import { ApiService } from '@/services/api.service'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { toast } from 'sonner'

interface ProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  avatar?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
}

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  avatar?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  role: string
  status: string
  totalXP?: number
  level?: number
}

export function useProfile() {
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user profile
  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      return
    }

    // Prefer user's tenantId from auth context, fallback to currentTenant
    const tenantId = user.tenantId || currentTenant?.id
    if (!tenantId) {
      console.warn('[useProfile] No tenantId available')
      setError('No se pudo determinar el tenant. Por favor, inicia sesión nuevamente.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log(`[useProfile] Loading profile for user ${user.id} with tenant ${tenantId}`)
      const userData = await ApiService.getCurrentUserProfile(user.id, tenantId)
      
      // Si el avatar es un blobName (formato: container/blobName), generar URL con SAS
      if (userData.avatar && !userData.avatar.startsWith('http') && !userData.avatar.startsWith('data:')) {
        try {
          const [containerName, ...blobNameParts] = userData.avatar.split('/')
          const blobName = blobNameParts.join('/')
          const { url } = await ApiService.getMediaUrl(containerName, blobName)
          userData.avatar = url
        } catch (error) {
          console.error('[useProfile] Error generating avatar URL:', error)
          // Mantener el blobName si falla la generación de URL
        }
      }
      
      setProfile(userData)
      setError(null)
    } catch (err: any) {
      console.error('[useProfile] Error loading profile:', err)
      
      // Si es un 404, significa que el usuario no existe en el backend para este tenant
      // Esto puede pasar si el usuario fue creado en el frontend pero aún no se sincronizó con el backend
      // No bloquear otras funcionalidades, solo mostrar el error en el componente de perfil
      if (err.status === 404) {
        const errorMessage = 'Usuario no encontrado en el sistema. Por favor, contacta al administrador o intenta recargar la página.'
        setError(errorMessage)
        // No establecer profile como null inmediatamente para permitir que el componente muestre un mensaje útil
        // El componente de perfil puede manejar esto mostrando un formulario para crear el perfil
      } else {
        const errorMessage = err.message || 'Error al cargar el perfil'
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?.tenantId, currentTenant?.id])

  // Load profile on mount and when user/tenant changes
  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Update profile
  const updateProfile = useCallback(async (profileData: ProfileData) => {
    if (!user?.id) {
      throw new Error('Usuario no disponible')
    }

    // Prefer user's tenantId from auth context, fallback to currentTenant
    const tenantId = user.tenantId || currentTenant?.id
    if (!tenantId) {
      throw new Error('Tenant no disponible')
    }

    setLoading(true)
    setError(null)

    try {
      const updatedUser = await ApiService.updateProfile(
        user.id,
        tenantId,
        profileData
      )
      setProfile(updatedUser)
      toast.success('Perfil actualizado correctamente')
      return updatedUser
    } catch (err: any) {
      const errorMessage = err.message || 'Error al actualizar el perfil'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?.tenantId, currentTenant?.id])

  // Change password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user?.id) {
      throw new Error('Usuario no disponible')
    }

    // Prefer user's tenantId from auth context, fallback to currentTenant
    const tenantId = user.tenantId || currentTenant?.id
    if (!tenantId) {
      throw new Error('Tenant no disponible')
    }

    setLoading(true)
    setError(null)

    try {
      const result = await ApiService.changePassword(
        user.id,
        tenantId,
        currentPassword,
        newPassword
      )
      toast.success('Contraseña actualizada correctamente')
      return result
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cambiar la contraseña'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?.tenantId, currentTenant?.id])

  // Upload avatar to Blob Storage
  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen')
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La imagen debe ser menor a 5MB')
    }

    try {
      // Upload to Blob Storage
      const { url, blobName, containerName } = await ApiService.uploadFile(file, 'avatar')
      
      // Return blobName in format container/blobName for storage in Cosmos DB
      // The URL includes SAS token for immediate use, but we store the blobName
      return `${containerName}/${blobName}`
    } catch (err: any) {
      throw new Error(err.message || 'Error al subir el avatar')
    }
  }, [])

  // Update avatar
  const updateAvatar = useCallback(async (file: File) => {
    try {
      // Upload to Blob Storage and get blobName
      const blobName = await uploadAvatar(file)
      
      // Update profile with blobName
      await updateProfile({ avatar: blobName })
      
      // Return URL with SAS token for immediate display
      // Extract container and blobName from the format container/blobName
      const [containerName, ...blobNameParts] = blobName.split('/')
      const fullBlobName = blobNameParts.join('/')
      const { url } = await ApiService.getMediaUrl(containerName, fullBlobName)
      
      return url
    } catch (err: any) {
      throw err
    }
  }, [uploadAvatar, updateProfile])

  return {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    updateAvatar,
  }
}

