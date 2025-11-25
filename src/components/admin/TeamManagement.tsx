import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { UserProfile } from '@/lib/types'
import { useTeams } from '@/hooks/use-teams'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users, Plus, Trash, Pencil, UserPlus, X, MagnifyingGlass } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function TeamManagement() {
  const { t } = useTranslation()
  const [profiles] = useKV<UserProfile[]>('user-profiles', [])
  const [currentAdminId] = useKV<string>('current-user-id', '')
  const { teams, createTeam, updateTeam, deleteTeam, getTeamMembers, getUnassignedMembers, removeMemberFromTeam } = useTeams()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [teamName, setTeamName] = useState('')
  const [teamDescription, setTeamDescription] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [searchFilter, setSearchFilter] = useState('')

  const employees = (profiles || []).filter(p => p.role === 'employee')

  const handleCreateTeam = () => {
    if (createTeam(teamName, teamDescription, selectedMembers, currentAdminId || 'admin')) {
      setIsCreateDialogOpen(false)
      setTeamName('')
      setTeamDescription('')
      setSelectedMembers([])
    }
  }

  const handleEditTeam = () => {
    if (!editingTeamId) return
    updateTeam(editingTeamId, {
      name: teamName,
      description: teamDescription,
      memberIds: selectedMembers,
    })
    setIsEditDialogOpen(false)
    setEditingTeamId(null)
    setTeamName('')
    setTeamDescription('')
    setSelectedMembers([])
  }

  const handleDeleteTeam = (teamId: string) => {
    if (confirm(t('teams.admin.confirmDelete') || 'Are you sure you want to delete this team?')) {
      deleteTeam(teamId)
    }
  }

  const openEditDialog = (teamId: string) => {
    const team = teams.find(t => t.id === teamId)
    if (!team) return

    setEditingTeamId(teamId)
    setTeamName(team.name)
    setTeamDescription(team.description || '')
    setSelectedMembers(team.memberIds)
    setIsEditDialogOpen(true)
  }

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const filteredTeams = teams.filter(team => {
    if (!searchFilter) return true
    const searchLower = searchFilter.toLowerCase()
    return (
      team.name.toLowerCase().includes(searchLower) ||
      team.description?.toLowerCase().includes(searchLower)
    )
  })

  const unassignedMembers = getUnassignedMembers()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users size={24} className="text-primary" />
                {t('teams.admin.title') || 'Team Management'}
              </CardTitle>
              <CardDescription>
                {t('teams.admin.description') || 'Create and manage teams for challenges and collaboration'}
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={20} />
                  {t('teams.admin.createTeam') || 'Create Team'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('teams.admin.createNewTeam') || 'Create New Team'}</DialogTitle>
                  <DialogDescription>
                    {t('teams.admin.createDescription') || 'Set up a new team and assign members'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-name">{t('teams.admin.teamName') || 'Team Name'} *</Label>
                    <Input
                      id="team-name"
                      placeholder={t('teams.admin.teamNamePlaceholder') || 'Sales Department, Marketing, etc.'}
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-description">{t('teams.admin.teamDescription') || 'Description'}</Label>
                    <Textarea
                      id="team-description"
                      placeholder={t('teams.admin.descriptionPlaceholder') || 'Optional description...'}
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('teams.admin.selectMembers') || 'Select Members'} *</Label>
                    <ScrollArea className="h-64 border rounded-md p-4">
                      <div className="space-y-2">
                        {employees.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            {t('teams.admin.noEmployees') || 'No employees available'}
                          </p>
                        ) : (
                          employees.map((employee) => {
                            const isSelected = selectedMembers.includes(employee.id)
                            return (
                              <div
                                key={employee.id}
                                className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                                onClick={() => toggleMemberSelection(employee.id)}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleMemberSelection(employee.id)}
                                />
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {(employee.displayName || employee.firstName)?.[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {employee.displayName || `${employee.firstName} ${employee.lastName}`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{employee.email}</p>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </ScrollArea>
                    <p className="text-xs text-muted-foreground">
                      {selectedMembers.length} {t('teams.admin.membersSelected') || 'members selected'}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {t('common.cancel') || 'Cancel'}
                  </Button>
                  <Button onClick={handleCreateTeam} disabled={!teamName.trim() || selectedMembers.length === 0}>
                    <Plus size={20} className="mr-2" />
                    {t('teams.admin.createTeamButton') || 'Create Team'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <MagnifyingGlass size={20} className="text-muted-foreground" />
            <Input
              placeholder={t('teams.admin.searchTeams') || 'Search teams...'}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="flex-1"
            />
          </div>

          <Separator />

          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredTeams.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center text-muted-foreground"
                >
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    {searchFilter
                      ? t('teams.admin.noResults') || 'No teams found'
                      : t('teams.admin.noTeams') || 'No teams created yet'}
                  </p>
                  {!searchFilter && (
                    <p className="text-sm mt-2">
                      {t('teams.admin.createFirst') || 'Create your first team to get started'}
                    </p>
                  )}
                </motion.div>
              ) : (
                filteredTeams.map((team) => {
                  const members = getTeamMembers(team.id)
                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl">{team.name}</CardTitle>
                              {team.description && (
                                <CardDescription className="mt-1">{team.description}</CardDescription>
                              )}
                              <div className="flex items-center gap-2 mt-3">
                                <Badge variant="secondary" className="gap-1">
                                  <Users size={14} />
                                  {team.memberIds.length} {t('teams.admin.members') || 'members'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {t('teams.admin.createdOn') || 'Created'} {new Date(team.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(team.id)}>
                                <Pencil size={16} />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteTeam(team.id)} className="text-destructive hover:text-destructive">
                                <Trash size={16} />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('teams.admin.teamMembers') || 'Team Members'}</Label>
                            {members.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                {t('teams.admin.noMembers') || 'No members assigned'}
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {members.map((member) => (
                                  <Badge key={member.id} variant="outline" className="gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback className="text-xs">
                                        {(member.displayName || member.firstName)?.[0]?.toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    {member.displayName || `${member.firstName} ${member.lastName}`}
                                    <button
                                      onClick={() => removeMemberFromTeam(team.id, member.id)}
                                      className="ml-1 hover:text-destructive"
                                    >
                                      <X size={12} />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>

          {unassignedMembers.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <UserPlus size={16} />
                  {t('teams.admin.unassigned') || 'Unassigned Members'} ({unassignedMembers.length})
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('teams.admin.unassignedNote') || 'These employees are not assigned to any team yet'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {unassignedMembers.map((member) => (
                    <Badge key={member.id} variant="secondary" className="gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {(member.displayName || member.firstName)?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {member.displayName || `${member.firstName} ${member.lastName}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('teams.admin.editTeam') || 'Edit Team'}</DialogTitle>
            <DialogDescription>
              {t('teams.admin.editDescription') || 'Update team details and members'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-team-name">{t('teams.admin.teamName') || 'Team Name'} *</Label>
              <Input
                id="edit-team-name"
                placeholder={t('teams.admin.teamNamePlaceholder') || 'Sales Department, Marketing, etc.'}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-team-description">{t('teams.admin.teamDescription') || 'Description'}</Label>
              <Textarea
                id="edit-team-description"
                placeholder={t('teams.admin.descriptionPlaceholder') || 'Optional description...'}
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('teams.admin.selectMembers') || 'Select Members'} *</Label>
              <ScrollArea className="h-64 border rounded-md p-4">
                <div className="space-y-2">
                  {employees.map((employee) => {
                    const isSelected = selectedMembers.includes(employee.id)
                    return (
                      <div
                        key={employee.id}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                        onClick={() => toggleMemberSelection(employee.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleMemberSelection(employee.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {(employee.displayName || employee.firstName)?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {employee.displayName || `${employee.firstName} ${employee.lastName}`}
                          </p>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground">
                {selectedMembers.length} {t('teams.admin.membersSelected') || 'members selected'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button onClick={handleEditTeam} disabled={!teamName.trim() || selectedMembers.length === 0}>
              <Pencil size={20} className="mr-2" />
              {t('teams.admin.updateTeam') || 'Update Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
