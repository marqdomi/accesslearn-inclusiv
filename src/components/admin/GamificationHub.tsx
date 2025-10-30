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

interface GamificationHubProps {
  onBack: () => void
}

export function GamificationHub({ onBack }: GamificationHubProps) {
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
      toast.error('Badge name is required')
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
    toast.success('Badge created successfully')
  }

  const deleteBadge = (badgeId: string) => {
    if (confirm('Are you sure you want to delete this badge?')) {
      setBadges((current) => (current || []).filter(b => b.id !== badgeId))
      toast.success('Badge deleted')
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
            <h2 className="text-2xl font-bold">Gamification Hub</h2>
            <p className="text-sm text-muted-foreground">
              Configure XP values and create badges
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="xp">
        <TabsList>
          <TabsTrigger value="xp" className="gap-2">
            <Lightning size={16} weight="fill" />
            XP Settings
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-2">
            <Trophy size={16} weight="fill" />
            Badges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="xp" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Default XP Values</CardTitle>
              <CardDescription>
                Set standard XP rewards for common learning activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="xp-module">Complete Module</Label>
                  <Input
                    id="xp-module"
                    type="number"
                    min="0"
                    value={xpDefaults?.module || 50}
                    onChange={(e) => updateXPDefault('module', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Awarded when a learner completes a module
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xp-course">Complete Course</Label>
                  <Input
                    id="xp-course"
                    type="number"
                    min="0"
                    value={xpDefaults?.course || 200}
                    onChange={(e) => updateXPDefault('course', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Awarded when a learner completes an entire course
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xp-assessment">Pass Assessment</Label>
                  <Input
                    id="xp-assessment"
                    type="number"
                    min="0"
                    value={xpDefaults?.assessment || 100}
                    onChange={(e) => updateXPDefault('assessment', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Awarded when a learner passes an assessment
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xp-login">Daily Login</Label>
                  <Input
                    id="xp-login"
                    type="number"
                    min="0"
                    value={xpDefaults?.login || 10}
                    onChange={(e) => updateXPDefault('login', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Awarded for daily login streaks
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xp-perfect">Perfect Score</Label>
                  <Input
                    id="xp-perfect"
                    type="number"
                    min="0"
                    value={xpDefaults?.perfectScore || 50}
                    onChange={(e) => updateXPDefault('perfectScore', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Bonus for scoring 100% on an assessment
                  </p>
                </div>
              </div>

              <Button onClick={() => toast.success('XP defaults saved')}>
                Save XP Settings
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
                  Create Badge
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Badge</DialogTitle>
                  <DialogDescription>
                    Design a badge to reward learner achievements
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="badge-name">Badge Name *</Label>
                    <Input
                      id="badge-name"
                      placeholder="e.g., HTML Master"
                      value={newBadge.name}
                      onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge-description">Description</Label>
                    <Textarea
                      id="badge-description"
                      placeholder="What this badge represents"
                      value={newBadge.description}
                      onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge-icon">Icon (emoji or URL)</Label>
                    <Input
                      id="badge-icon"
                      placeholder="🏆 or https://example.com/icon.png"
                      value={newBadge.icon}
                      onChange={(e) => setNewBadge({ ...newBadge, icon: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use an emoji or provide an image URL
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreatingBadge(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateBadge}>Create Badge</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {(badges || []).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Trophy size={48} className="text-muted-foreground mb-4" weight="fill" />
                <p className="text-muted-foreground mb-4">No badges created yet</p>
                <Button onClick={() => setIsCreatingBadge(true)}>
                  <Plus className="mr-2" size={18} />
                  Create Your First Badge
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
                      Delete
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
