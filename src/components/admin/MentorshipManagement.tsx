import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { UserProfile, MentorshipPairing } from '@/lib/types'
import { useMentorship } from '@/hooks/use-mentorship'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Users, X, MagnifyingGlass } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function MentorshipManagement() {
  const { t } = useTranslation()
  const [profiles] = useKV<UserProfile[]>('user-profiles', [])
  const { pairings, createPairing, removePairing, getMentorProfile, getMenteeProfile } = useMentorship()
  const [currentAdminId] = useKV<string>('current-user-id', '')
  
  const [selectedMentor, setSelectedMentor] = useState<string>('')
  const [selectedMentee, setSelectedMentee] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState('')

  const employees = (profiles || []).filter(p => p.role === 'employee')

  const activePairings = (pairings || []).filter(p => p.status === 'active')

  const mentorsWithMentees = activePairings.reduce((acc, pairing) => {
    const existing = acc.find(m => m.mentorId === pairing.mentorId)
    if (existing) {
      existing.menteeCount++
    } else {
      acc.push({ mentorId: pairing.mentorId, menteeCount: 1 })
    }
    return acc
  }, [] as Array<{ mentorId: string; menteeCount: number }>)

  const handleCreatePairing = () => {
    if (!selectedMentor || !selectedMentee) {
      toast.error(t('mentorship.admin.selectBoth') || 'Seleccione mentor y aprendiz')
      return
    }

    if (selectedMentor === selectedMentee) {
      toast.error(t('mentorship.admin.cannotBeSame') || 'El mentor y aprendiz no pueden ser la misma persona')
      return
    }

    const success = createPairing(selectedMentor, selectedMentee, currentAdminId || 'admin')
    if (success) {
      setSelectedMentor('')
      setSelectedMentee('')
    }
  }

  const filteredPairings = activePairings.filter(pairing => {
    if (!searchFilter) return true
    const mentor = getMentorProfile(pairing.mentorId)
    const mentee = getMenteeProfile(pairing.menteeId)
    const searchLower = searchFilter.toLowerCase()
    
    return (
      mentor?.displayName?.toLowerCase().includes(searchLower) ||
      mentor?.email.toLowerCase().includes(searchLower) ||
      mentee?.displayName?.toLowerCase().includes(searchLower) ||
      mentee?.email.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus size={24} className="text-primary" />
            {t('mentorship.admin.createPairing') || 'Crear Nueva Asignación de Mentoría'}
          </CardTitle>
          <CardDescription>
            {t('mentorship.admin.createDescription') || 'Asigne un mentor experimentado a un aprendiz'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mentor-select">{t('mentorship.admin.selectMentor') || 'Seleccionar Mentor'}</Label>
              <Select value={selectedMentor} onValueChange={setSelectedMentor}>
                <SelectTrigger id="mentor-select">
                  <SelectValue placeholder={t('mentorship.admin.chooseMentor') || 'Elegir mentor...'} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => {
                    const menteeCount = mentorsWithMentees.find(m => m.mentorId === employee.id)?.menteeCount || 0
                    return (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.displayName || `${employee.firstName} ${employee.lastName}`}
                        {menteeCount > 0 && ` (${menteeCount} aprendices)`}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mentee-select">{t('mentorship.admin.selectMentee') || 'Seleccionar Aprendiz'}</Label>
              <Select value={selectedMentee} onValueChange={setSelectedMentee}>
                <SelectTrigger id="mentee-select">
                  <SelectValue placeholder={t('mentorship.admin.chooseMentee') || 'Elegir aprendiz...'} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => {
                    const hasMentor = activePairings.some(p => p.menteeId === employee.id)
                    return (
                      <SelectItem key={employee.id} value={employee.id} disabled={hasMentor}>
                        {employee.displayName || `${employee.firstName} ${employee.lastName}`}
                        {hasMentor && ' (Ya tiene mentor)'}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCreatePairing} className="w-full" size="lg">
            <UserPlus size={20} className="mr-2" />
            {t('mentorship.admin.assignMentor') || 'Asignar Mentor'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={24} className="text-primary" />
            {t('mentorship.admin.activePairings') || 'Mentorías Activas'}
          </CardTitle>
          <CardDescription>
            {t('mentorship.admin.totalPairings') || 'Total de asignaciones:'} {activePairings.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <MagnifyingGlass size={20} className="text-muted-foreground" />
            <Input
              placeholder={t('mentorship.admin.searchPairings') || 'Buscar mentorías...'}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="flex-1"
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredPairings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-8 text-center text-muted-foreground"
                >
                  {searchFilter
                    ? t('mentorship.admin.noResults') || 'No se encontraron resultados'
                    : t('mentorship.admin.noPairings') || 'No hay mentorías activas'}
                </motion.div>
              ) : (
                filteredPairings.map((pairing) => {
                  const mentor = getMentorProfile(pairing.mentorId)
                  const mentee = getMenteeProfile(pairing.menteeId)

                  if (!mentor || !mentee) return null

                  const mentorName = mentor.displayName || `${mentor.firstName} ${mentor.lastName}`
                  const menteeName = mentee.displayName || `${mentee.firstName} ${mentee.lastName}`

                  return (
                    <motion.div
                      key={pairing.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                              {mentorName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{mentorName}</p>
                            <p className="text-xs text-muted-foreground">
                              {t('mentorship.mentor') || 'Mentor'}
                            </p>
                          </div>
                        </div>

                        <div className="hidden sm:block text-muted-foreground">→</div>

                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-secondary">
                            <AvatarFallback className="bg-gradient-to-br from-secondary to-accent text-secondary-foreground font-semibold">
                              {menteeName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{menteeName}</p>
                            <p className="text-xs text-muted-foreground">
                              {t('mentorship.mentee') || 'Aprendiz'}
                            </p>
                          </div>
                        </div>

                        <Badge variant="secondary" className="ml-4">
                          {new Date(pairing.assignedAt).toLocaleDateString()}
                        </Badge>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePairing(pairing.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X size={18} />
                      </Button>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
