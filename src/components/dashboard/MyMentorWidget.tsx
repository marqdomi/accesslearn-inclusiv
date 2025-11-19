import { useState } from 'react'
import { UserProfile } from '@/lib/types'
import { useMentorship } from '@/hooks/use-mentorship'
import { useXP, getRankKey } from '@/hooks/use-xp'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { UserCircle, ChatCircleDots, Lightning, Trophy } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface MyMentorWidgetProps {
  menteeId: string
}

export function MyMentorWidget({ menteeId }: MyMentorWidgetProps) {
  const { t } = useTranslation()
  const { getMenteePairing, getMentorProfile, sendMessage, getMessagesForPairing, markMessagesAsRead } = useMentorship()
  const profiles: any[] = []
  const [messageContent, setMessageContent] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const pairing = getMenteePairing(menteeId)
  
  if (!pairing) {
    return null
  }

  const mentorProfile = getMentorProfile(pairing.mentorId)
  if (!mentorProfile) {
    return null
  }

  const menteeProfile = profiles?.find(p => p.id === menteeId)
  const menteeName = menteeProfile?.displayName || 'Usuario'
  const mentorName = mentorProfile.displayName || `${mentorProfile.firstName} ${mentorProfile.lastName}`

  return (
    <MentorCard
      pairing={pairing}
      mentorProfile={mentorProfile}
      mentorName={mentorName}
      menteeId={menteeId}
      menteeName={menteeName}
      messageContent={messageContent}
      setMessageContent={setMessageContent}
      isDialogOpen={isDialogOpen}
      setIsDialogOpen={setIsDialogOpen}
    />
  )
}

interface MentorCardProps {
  pairing: any
  mentorProfile: UserProfile
  mentorName: string
  menteeId: string
  menteeName: string
  messageContent: string
  setMessageContent: (value: string) => void
  isDialogOpen: boolean
  setIsDialogOpen: (value: boolean) => void
}

function MentorCard({
  pairing,
  mentorProfile,
  mentorName,
  menteeId,
  menteeName,
  messageContent,
  setMessageContent,
  isDialogOpen,
  setIsDialogOpen,
}: MentorCardProps) {
  const { t } = useTranslation()
  const { totalXP, currentLevel } = useXP(mentorProfile.id)
  const { sendMessage, getMessagesForPairing, markMessagesAsRead, getUnreadCount } = useMentorship()
  
  const rankKey = getRankKey(currentLevel)
  const rankName = t(rankKey)
  const messages = getMessagesForPairing(pairing.id)
  const unreadCount = getUnreadCount(menteeId)

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
    markMessagesAsRead(pairing.id, menteeId)
  }

  const handleSendMessage = () => {
    if (!messageContent.trim()) return

    sendMessage(pairing.id, menteeId, menteeName, mentorProfile.id, messageContent)
    setMessageContent('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card via-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCircle size={22} className="text-primary" weight="fill" />
            {t('mentorship.myMentor') || 'Mi Mentor'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-4 border-primary shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground text-xl font-bold">
                {mentorName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h3 className="text-xl font-bold">{mentorName}</h3>
              <div className="flex items-center gap-2 text-sm">
                <Lightning size={16} weight="fill" className="text-primary" />
                <span className="font-semibold">
                  {t('playerIdentity.level')} {currentLevel}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{rankName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Trophy size={14} weight="fill" className="text-accent" />
                <span>{totalXP.toLocaleString()} XP</span>
              </div>
            </div>
          </div>

          <Separator />

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild onClick={handleOpenDialog}>
              <Button className="w-full gap-2 relative" size="lg">
                <ChatCircleDots size={20} weight="fill" />
                {t('mentorship.askMyMentor') || 'Preguntar a mi Mentor'}
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ChatCircleDots size={24} className="text-primary" />
                  {t('mentorship.conversationWith') || 'Conversación con'} {mentorName}
                </DialogTitle>
                <DialogDescription>
                  {t('mentorship.askGuidance') || 'Pregunta cualquier cosa relacionada con tu aprendizaje'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {messages.length > 0 && (
                  <div className="space-y-3 max-h-64 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                    {messages.map((msg) => {
                      const isFromMentor = msg.senderId === mentorProfile.id
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isFromMentor ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              isFromMentor
                                ? 'bg-primary/10 border border-primary/20'
                                : 'bg-secondary text-secondary-foreground'
                            }`}
                          >
                            <p className="text-xs font-semibold mb-1 opacity-70">
                              {msg.senderName}
                            </p>
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs opacity-60 mt-1">
                              {new Date(msg.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="mentee-message">
                    {t('mentorship.yourMessage') || 'Tu mensaje'}
                  </Label>
                  <Textarea
                    id="mentee-message"
                    placeholder={t('mentorship.menteeMessagePlaceholder') || 'Escribe tu pregunta o mensaje...'}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  className="w-full"
                  size="lg"
                  disabled={!messageContent.trim()}
                >
                  <ChatCircleDots size={18} className="mr-2" />
                  {t('mentorship.send') || 'Enviar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <p className="text-xs text-center text-muted-foreground">
            {t('mentorship.mentorSince') || 'Tu mentor desde'} {new Date(pairing.assignedAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
