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
      setProfile(userData)
    } catch (err: any) {
      console.error('[useProfile] Error loading profile:', err)
      const errorMessage = err.status === 404 
        ? 'Usuario no encontrado. Por favor, contacta al administrador.'
        : err.message || 'Error al cargar el perfil'
      setError(errorMessage)
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

  // Upload avatar (converts to base64)
  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('El archivo debe ser una imagen'))
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('La imagen debe ser menor a 5MB'))
        return
      }

      const reader = new FileReader()
      
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        resolve(base64)
      }

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'))
      }

      reader.readAsDataURL(file)
    })
  }, [])

  // Update avatar
  const updateAvatar = useCallback(async (file: File) => {
    try {
      const base64Avatar = await uploadAvatar(file)
      await updateProfile({ avatar: base64Avatar })
      return base64Avatar
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

