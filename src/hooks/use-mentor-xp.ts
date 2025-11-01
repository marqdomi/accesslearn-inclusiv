import { useKV } from '@github/spark/hooks'
import { MentorshipPairing } from '@/lib/types'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'

export function useMentorXP() {
  const { t } = useTranslation()
  const [pairings] = useKV<MentorshipPairing[]>('mentorship-pairings', [])

  const awardMentorBonus = (menteeId: string, xpEarned: number) => {
    const activePairing = (pairings || []).find(
      p => p.menteeId === menteeId && p.status === 'active'
    )

    if (!activePairing) return

    const mentorBonus = Math.floor(xpEarned * 0.1)
    const mentorKey = `user-total-xp-${activePairing.mentorId}`

    const updateMentorXP = async () => {
      try {
        const currentXP = await window.spark.kv.get<number>(mentorKey) || 0
        await window.spark.kv.set(mentorKey, currentXP + mentorBonus)
        
        toast.success(
          t('mentorship.mentorBonusAwarded') || `Tu mentor recibió ${mentorBonus} XP de bono`,
          {
            description: t('mentorship.bonusDescription') || 'Por tu excelente progreso',
            duration: 4000,
          }
        )
      } catch (error) {
        console.error('Error awarding mentor bonus:', error)
      }
    }

    updateMentorXP()
  }

  return { awardMentorBonus }
}
