import { useState, useEffect } from 'react'
import { Certificate, UserProfile, CompanySettings } from '@/lib/types'
import { ApiService } from '@/services/api.service'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'

export function useCertificates(userId?: string) {
  const { user: currentUser } = useAuth()
  const { currentTenant } = useTenant()
  const effectiveUserId = userId || currentUser?.id
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  // Load certificates from Cosmos DB
  useEffect(() => {
    if (effectiveUserId && currentTenant) {
      loadCertificates()
    }
  }, [effectiveUserId, currentTenant?.id])

  const loadCertificates = async () => {
    if (!effectiveUserId || !currentTenant) return

    try {
      setLoading(true)
      const data = await ApiService.getUserCertificates(effectiveUserId)
      setCertificates(data)
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const issueCertificate = async (
    courseId: string,
    courseTitle: string,
    userProfile: UserProfile
  ): Promise<Certificate> => {
    if (!effectiveUserId || !currentTenant) {
      throw new Error('User ID and tenant required')
    }

    const fullName = userProfile.fullName || `${userProfile.firstName} ${userProfile.lastName}`
    
    try {
      const certificate = await ApiService.createCertificate({
        userId: effectiveUserId,
        courseId,
        courseTitle,
        userFullName: fullName
      })
      
      // Refresh certificates list
      await loadCertificates()
      
      return {
        id: certificate.id,
        userId: certificate.userId,
        courseId: certificate.courseId,
        courseTitle: certificate.courseTitle,
        completionDate: new Date(certificate.completionDate).getTime(),
        certificateCode: certificate.certificateCode,
        userFullName: certificate.userFullName
      } as Certificate
    } catch (error: any) {
      console.error('Error issuing certificate:', error)
      throw error
    }
  }

  const getUserCertificates = (targetUserId?: string): Certificate[] => {
    const lookupId = targetUserId || effectiveUserId
    if (!lookupId) return []
    
    return certificates.filter(cert => cert.userId === lookupId)
  }

  const getCertificateByCourse = (courseId: string): Certificate | undefined => {
    if (!effectiveUserId) return undefined
    
    return certificates.find(
      cert => cert.userId === effectiveUserId && cert.courseId === courseId
    )
  }

  return {
    issueCertificate,
    getUserCertificates,
    getCertificateByCourse,
    allCertificates: certificates,
    loading,
    refresh: loadCertificates
  }
}

export function useCompanySettings() {
  const { currentTenant } = useTenant()
  const [companySettings, setCompanySettingsState] = useState<CompanySettings>({
    companyName: 'Kaido',
    companyLogo: undefined
  })
  const [loading, setLoading] = useState(true)

  // Load company settings from Tenant (where BrandingSettingsPage stores them)
  useEffect(() => {
    if (currentTenant?.id) {
      loadCompanySettings()
    }
  }, [currentTenant?.id, currentTenant?.name, currentTenant?.logo])

  const loadCompanySettings = async () => {
    try {
      setLoading(true)
      
      // Get company name and logo from tenant
      let logoUrl = currentTenant?.logo || undefined
      
      // If logo is a blobName (format: container/blobName), generate URL with SAS
      if (logoUrl && !logoUrl.startsWith('http') && !logoUrl.startsWith('data:') && logoUrl.includes('/')) {
        try {
          const [containerName, ...blobNameParts] = logoUrl.split('/')
          const blobName = blobNameParts.join('/')
          const { url } = await ApiService.getMediaUrl(containerName, blobName)
          logoUrl = url
        } catch (error) {
          console.error('Error generating logo URL:', error)
          // Keep blobName if URL generation fails
        }
      }
      
      setCompanySettingsState({
        companyName: currentTenant?.name || 'Kaido',
        companyLogo: logoUrl
      })
    } catch (error) {
      console.error('Error loading company settings:', error)
      // Use tenant data or defaults on error
      setCompanySettingsState({
        companyName: currentTenant?.name || 'Kaido',
        companyLogo: currentTenant?.logo || undefined
      })
    } finally {
      setLoading(false)
    }
  }

  // Note: setCompanySettings is kept for backward compatibility but should not be used
  // Company settings should be updated via BrandingSettingsPage which updates the tenant
  const setCompanySettings = async (settings: CompanySettings | ((prev: CompanySettings) => CompanySettings)) => {
    console.warn('useCompanySettings.setCompanySettings is deprecated. Use BrandingSettingsPage to update company settings.')
    const newSettings = typeof settings === 'function' 
      ? settings(companySettings) 
      : settings
    setCompanySettingsState(newSettings)
  }

  return {
    companySettings: companySettings || { companyName: currentTenant?.name || 'Kaido', companyLogo: undefined },
    setCompanySettings,
    loading,
    refresh: loadCompanySettings
  }
}

export function useCertificateTemplate() {
  const { currentTenant } = useTenant()
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentTenant?.id) {
      loadTemplate()
    }
  }, [currentTenant?.id])

  const loadTemplate = async () => {
    try {
      setLoading(true)
      const data = await ApiService.getCertificateTemplate()
      setTemplate(data)
    } catch (error) {
      console.error('Error loading certificate template:', error)
      // Use defaults on error
      setTemplate(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    template,
    loading,
    refresh: loadTemplate
  }
}
