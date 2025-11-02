import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { UserProfile, UserProgress, Course, UserStats } from '@/lib/types'
import { useMentorship } from '@/hooks/use-mentorship'
import { useXP } from '@/hooks/use-xp'
import { useTranslation } from '@/lib/i18n'
import { getAchievementById } from '@/lib/achievements'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Users, Trophy, Lightning, ChatCircleDots, GraduationCap } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface MentorDashboardProps {
  mentorId: string
}

export function MentorDashboard({ mentorId }: MentorDashboardProps) {
  const { t } = useTranslation()
  const { getMentorPairings, getMenteeProfile, sendMessage, getMessagesForPairing } = useMentorship()
  const [courses] = useKV<Course[]>('courses', [])
  const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null)
  const [messageContent, setMessageContent] = useState('')
  const [profiles] = useKV<UserProfile[]>('user-profiles', [])

  const pairings = getMentorPairings(mentorId)
  const mentorProfile = profiles?.find(p => p.id === mentorId)

  if (pairings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Users size={64} className="mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-xl font-semibold">
                {t('mentorship.mentor.noMentees') || 'No tienes aprendices asignados'}
              </h3>
              <p className="text-muted-foreground">
                {t('mentorship.mentor.noMenteesDescription') || 'Un administrador puede asignarte aprendices para guiar'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={24} className="text-primary" />
            {t('mentorship.mentor.myMentees') || 'Mis Aprendices'}
          </CardTitle>
          <CardDescription>
            {t('mentorship.mentor.menteesDescription') || 'Supervisa el progreso de tus aprendices y ofrece orientación'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pairings.map((pairing) => {
            const menteeProfile = getMenteeProfile(pairing.menteeId)
            if (!menteeProfile) return null

            return (
              <MenteeProgressCard
                key={pairing.id}
                pairingId={pairing.id}
                menteeProfile={menteeProfile}
                mentorId={mentorId}
                mentorProfile={mentorProfile}
                courses={courses || []}
                onSelectMentee={setSelectedMenteeId}
              />
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

interface MenteeProgressCardProps {
  pairingId: string
  menteeProfile: UserProfile
  mentorId: string
  mentorProfile?: UserProfile
  courses: Course[]
  onSelectMentee: (id: string) => void
}

function MenteeProgressCard({
  pairingId,
  menteeProfile,
  mentorId,
  mentorProfile,
  courses,
}: MenteeProgressCardProps) {
  const { t } = useTranslation()
  const { totalXP, currentLevel, getProgressToNextLevel } = useXP(menteeProfile.id)
  const [userStats] = useKV<UserStats>(`user-stats-${menteeProfile.id}`, {
    totalCoursesCompleted: 0,
    totalModulesCompleted: 0,
    totalAssessmentsPassed: 0,
    averageScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: 0,
    achievementsUnlocked: [],
    totalXP: 0,
    level: 1,
  })
  const [progressList] = useKV<UserProgress[]>(`user-progress-${menteeProfile.id}`, [])
  const { sendMessage, getMessagesForPairing } = useMentorship()
  const [messageContent, setMessageContent] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const menteeName = menteeProfile.displayName || `${menteeProfile.firstName} ${menteeProfile.lastName}`
  const progress = getProgressToNextLevel()
  const recentAchievements = (userStats?.achievementsUnlocked || []).slice(-3).reverse()

  const currentMission = (progressList || []).find(p => p.status === 'in-progress')
  const currentCourse = currentMission ? courses.find(c => c.id === currentMission.courseId) : null

  const handleSendMessage = () => {
    if (!messageContent.trim()) return

    const mentorName = mentorProfile?.displayName || 'Mentor'
    sendMessage(pairingId, mentorId, mentorName, menteeProfile.id, messageContent)
    setMessageContent('')
    setIsDialogOpen(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-gradient-to-br from-card to-muted/20 p-6 space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary">
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
              {menteeName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{menteeName}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lightning size={16} weight="fill" className="text-primary" />
              <span>
                {t('playerIdentity.level')} {currentLevel}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span>{totalXP.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <ChatCircleDots size={18} />
              {t('mentorship.sendMessage') || 'Enviar Mensaje'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('mentorship.sendMessageTo') || 'Enviar mensaje a'} {menteeName}
              </DialogTitle>
              <DialogDescription>
                {t('mentorship.messageDescription') || 'Envía orientación o palabras de ánimo a tu aprendiz'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="message">{t('mentorship.message') || 'Mensaje'}</Label>
                <Textarea
                  id="message"
                  placeholder={t('mentorship.messagePlaceholder') || 'Escribe tu mensaje aquí...'}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>
              <Button onClick={handleSendMessage} className="w-full" disabled={!messageContent.trim()}>
                <ChatCircleDots size={18} className="mr-2" />
                {t('mentorship.send') || 'Enviar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t('mentorship.progressToNextLevel') || 'Progreso al siguiente nivel'}
            </span>
            <span className="font-semibold">{Math.round(progress.percentage)}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>

        {currentCourse && currentMission && (
          <div className="rounded-md bg-muted/50 p-3 space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <GraduationCap size={16} className="text-primary" />
              <span>{t('mentorship.currentMission') || 'Misión Actual'}</span>
            </div>
            <p className="text-sm text-muted-foreground">{currentCourse.title}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {currentMission.completedModules.length} / {currentCourse.modules.length} {t('mentorship.modulesCompleted') || 'módulos completados'}
              </span>
            </div>
          </div>
        )}

        {recentAchievements.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Trophy size={16} />
              <span>{t('mentorship.recentAchievements') || 'Logros Recientes'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentAchievements.map((ua) => {
                const achievement = getAchievementById(ua.achievementId)
                const achievementTitle = achievement?.titleKey 
                  ? t(achievement.titleKey) 
                  : achievement?.title || ua.achievementId
                
                return (
                  <Badge key={ua.achievementId} variant="secondary" className="gap-1">
                    <Trophy size={12} weight="fill" />
                    {achievementTitle}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
