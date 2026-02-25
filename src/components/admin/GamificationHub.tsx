import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Badge as BadgeType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Trophy, Lightning, Plus, Trash } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface GamificationHubProps {
  onBack: () => void
}

export function GamificationHub({ onBack }: GamificationHubProps) {
  const { t } = useTranslation('admin')
  const [badges, setBadges] = useKV<BadgeType[]>('badges', [])
  const [xpDefaults, setXpDefaults] = useKV<{
    module: number
    course: number
    assessment: number
    login: number
    perfectScore: number
  }>('xp-defaults', {
    module: 50,
    course: 200,
    assessment: 100,
    login: 10,
    perfectScore: 50
  })

  const [isCreatingBadge, setIsCreatingBadge] = useState(false)
  const [newBadge, setNewBadge] = useState({ name: '', description: '', icon: '' })

  const handleCreateBadge = () => {
    if (!newBadge.name) {
      toast.error(t('gamification.badgeNameRequired'))
      return
    }

    const badge: BadgeType = {
      id: `badge-${Date.now()}`,
      ...newBadge,
      icon: newBadge.icon || '🏆',
      createdAt: Date.now()
    }

    setBadges((current) => [...(current || []), badge])
    setNewBadge({ name: '', description: '', icon: '' })
    setIsCreatingBadge(false)
    toast.success(t('gamification.badgeCreated'))
  }

  const deleteBadge = (badgeId: string) => {
    if (confirm(t('gamification.confirmDeleteBadge'))) {
      setBadges((current) => (current || []).filter(b => b.id !== badgeId))
      toast.success(t('gamification.badgeDeleted'))
    }
  }

  const updateXPDefault = (key: string, value: number) => {
    setXpDefaults((current) => ({
      module: current?.module || 50,
      course: current?.course || 200,
      assessment: current?.assessment || 100,
      login: current?.login || 10,
      perfectScore: current?.perfectScore || 50,
      [key]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{t('gamification.title')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('gamification.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="xp">
        <TabsList>
          <TabsTrigger value="xp" className="gap-2">
            <Lightning size={16} weight="fill" />
            {t('gamification.xpSettings')}
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-2">
            <Trophy size={16} weight="fill" />
            {t('gamification.badges')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="xp" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('gamification.defaultXPValues')}</CardTitle>
              <CardDescription>
                {t('gamification.defaultXPDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="xp-module">{t('gamification.completeModule')}</Label>
                  <Input
                    id="xp-module"
                    type="number"
                    min="0"
                    value={xpDefaults?.module || 50}
                    onChange={(e) => updateXPDefault('module', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('gamification.completeModuleDesc')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xp-course">{t('gamification.completeCourse')}</Label>
                  <Input
                    id="xp-course"
                    type="number"
                    min="0"
                    value={xpDefaults?.course || 200}
                    onChange={(e) => updateXPDefault('course', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('gamification.completeCourseDesc')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xp-assessment">{t('gamification.passAssessment')}</Label>
                  <Input
                    id="xp-assessment"
                    type="number"
                    min="0"
                    value={xpDefaults?.assessment || 100}
                    onChange={(e) => updateXPDefault('assessment', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('gamification.passAssessmentDesc')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xp-login">{t('gamification.dailyLogin')}</Label>
                  <Input
                    id="xp-login"
                    type="number"
                    min="0"
                    value={xpDefaults?.login || 10}
                    onChange={(e) => updateXPDefault('login', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('gamification.dailyLoginDesc')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xp-perfect">{t('gamification.perfectScore')}</Label>
                  <Input
                    id="xp-perfect"
                    type="number"
                    min="0"
                    value={xpDefaults?.perfectScore || 50}
                    onChange={(e) => updateXPDefault('perfectScore', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('gamification.perfectScoreDesc')}
                  </p>
                </div>
              </div>

              <Button onClick={() => toast.success(t('gamification.xpSaved'))}>
                {t('gamification.saveXPSettings')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={isCreatingBadge} onOpenChange={setIsCreatingBadge}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2" size={18} />
                  {t('gamification.createBadge')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('gamification.createNewBadge')}</DialogTitle>
                  <DialogDescription>
                    {t('gamification.designBadge')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="badge-name">{t('gamification.badgeName')}</Label>
                    <Input
                      id="badge-name"
                      placeholder={t('gamification.badgeNamePlaceholder')}
                      value={newBadge.name}
                      onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge-description">{t('gamification.description')}</Label>
                    <Textarea
                      id="badge-description"
                      placeholder={t('gamification.descriptionPlaceholder')}
                      value={newBadge.description}
                      onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge-icon">{t('gamification.iconLabel')}</Label>
                    <Input
                      id="badge-icon"
                      placeholder={t('gamification.iconPlaceholder')}
                      value={newBadge.icon}
                      onChange={(e) => setNewBadge({ ...newBadge, icon: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('gamification.iconHelp')}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreatingBadge(false)}>
                      {t('gamification.cancel')}
                    </Button>
                    <Button onClick={handleCreateBadge}>{t('gamification.createBadge')}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {(badges || []).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Trophy size={48} className="text-muted-foreground mb-4" weight="fill" />
                <p className="text-muted-foreground mb-4">{t('gamification.noBadges')}</p>
                <Button onClick={() => setIsCreatingBadge(true)}>
                  <Plus className="mr-2" size={18} />
                  {t('gamification.createFirstBadge')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {(badges || []).map((badge) => (
                <Card key={badge.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="text-4xl">{badge.icon}</div>
                      <CardTitle className="text-base">{badge.name}</CardTitle>
                      {badge.description && (
                        <CardDescription className="text-xs">
                          {badge.description}
                        </CardDescription>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full"
                      onClick={() => deleteBadge(badge.id)}
                    >
                      <Trash size={14} className="mr-1 text-destructive" />
                      {t('gamification.delete')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
