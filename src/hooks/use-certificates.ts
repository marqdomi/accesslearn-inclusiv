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
  const [companySettings, setCompanySettings] = useKV<CompanySettings>('company-settings', {
    companyName: 'GameLearn',
    companyLogo: undefined
  })

  return {
    companySettings: companySettings || { companyName: 'GameLearn' },
    setCompanySettings
  }
}
