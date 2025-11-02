import { useKV } from '@github/spark/hooks'
import { Certificate, UserProfile, CompanySettings } from '@/lib/types'
import { generateCertificateCode } from '@/lib/certificate-generator'

export function useCertificates(userId?: string) {
  const [certificates, setCertificates] = useKV<Certificate[]>('certificates', [])

  const issueCertificate = async (
    courseId: string,
    courseTitle: string,
    userProfile: UserProfile
  ): Promise<Certificate> => {
    const fullName = userProfile.fullName || `${userProfile.firstName} ${userProfile.lastName}`
    
    const certificate: Certificate = {
      id: `cert-${Date.now()}-${userId}`,
      userId: userId || 'default-user',
      courseId,
      courseTitle,
      completionDate: Date.now(),
      certificateCode: generateCertificateCode(),
      userFullName: fullName
    }

    setCertificates((current) => [...(current || []), certificate])
    
    return certificate
  }

  const getUserCertificates = (targetUserId?: string): Certificate[] => {
    const lookupId = targetUserId || userId
    if (!lookupId) return []
    
    return (certificates || []).filter(cert => cert.userId === lookupId)
  }

  const getCertificateByCourse = (courseId: string): Certificate | undefined => {
    if (!userId) return undefined
    
    return (certificates || []).find(
      cert => cert.userId === userId && cert.courseId === courseId
    )
  }

  return {
    issueCertificate,
    getUserCertificates,
    getCertificateByCourse,
    allCertificates: certificates || []
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
