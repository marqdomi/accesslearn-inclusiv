import { useCallback } from 'react'
import { ApiService } from '@/services/api.service'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'

/**
 * Hook to award XP bonus to mentors when their mentees earn XP
 * Migrated from window.spark.kv to use ApiService (Cosmos DB)
 */
export function useMentorXP() {
  const { user: currentUser } = useAuth()
  const { currentTenant } = useTenant()
  const { t } = useTranslation()

  const awardMentorBonus = useCallback(async (menteeId: string, xpEarned: number) => {
    if (!currentTenant || !currentUser || !menteeId) {
      return
    }

    try {
      // Get mentorship report which includes pairing information
      // This will give us mentor information for the mentee
      const mentorshipReport = await ApiService.getMentorshipReport()
      
      // Find the mentor for this mentee from the report
      const mentorData = mentorshipReport.find((mentor: any) => 
        mentor.mentees?.some((mentee: any) => mentee.menteeId === menteeId)
      )

      if (!mentorData) {
        // No active mentorship pairing found - silently return
        return
      }

      const mentorId = mentorData.mentorId
      const mentorBonus = Math.floor(xpEarned * 0.1)
      
      if (mentorBonus <= 0) {
        return
      }

      // Award XP to the mentor using ApiService
      await ApiService.awardXP(
        mentorId,
        mentorBonus,
        `Bono de mentoría por progreso de ${currentUser.firstName || currentUser.name || 'tu aprendiz'}`
      )

      toast.success(
        t('mentorship.mentorBonusAwarded') || `Tu mentor recibió ${mentorBonus} XP de bono`,
        {
          description: t('mentorship.bonusDescription') || 'Por tu excelente progreso',
          duration: 4000,
        }
      )
    } catch (error) {
      console.error('Error awarding mentor bonus:', error)
      // Silently fail - mentor bonus is not critical for core functionality
    }
  }, [currentTenant, currentUser, t])

  return { awardMentorBonus }
}
