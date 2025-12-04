/**
 * Hook for managing accessibility profiles
 */

import { useState, useEffect } from 'react'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'

export interface AccessibilityProfile {
  id: string
  tenantId: string
  name: string
  description: string
  icon?: string
  enabled: boolean
  isDefault: boolean
  settings: any
  metadata: {
    useCase: string
    objective: string
    benefits: string[]
    recommendedSettings?: string
    targetAudience: string
  }
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export function useAccessibilityProfiles(adminMode: boolean = false) {
  const { currentTenant } = useTenant()
  const [profiles, setProfiles] = useState<AccessibilityProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentTenant?.id) {
      setLoading(false)
      return
    }

    const loadProfiles = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = adminMode
          ? await ApiService.getAccessibilityProfiles()
          : await ApiService.getEnabledAccessibilityProfiles()
        
        setProfiles(data)
      } catch (err: any) {
        console.error('[useAccessibilityProfiles] Error loading profiles:', err)
        setError(err.message || 'Failed to load accessibility profiles')
      } finally {
        setLoading(false)
      }
    }

    loadProfiles()
  }, [currentTenant?.id, adminMode])

  const refreshProfiles = async () => {
    if (!currentTenant?.id) return
    
    try {
      setError(null)
      const data = adminMode
        ? await ApiService.getAccessibilityProfiles()
        : await ApiService.getEnabledAccessibilityProfiles()
      setProfiles(data)
    } catch (err: any) {
      console.error('[useAccessibilityProfiles] Error refreshing profiles:', err)
      setError(err.message || 'Failed to refresh accessibility profiles')
    }
  }

  return {
    profiles,
    loading,
    error,
    refreshProfiles,
  }
}

