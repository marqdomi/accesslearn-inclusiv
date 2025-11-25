import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { UserGroup } from '@/lib/types'
import { UsersThree, Plus, Trash, PencilSimple, X, Broom } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { GroupSuggestions } from './GroupSuggestions'
import { useTranslation } from 'react-i18next'
import { ApiService } from '@/services/api.service'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'

interface BackendGroup {
  id: string
  tenantId: string
  name: string
  description?: string
  memberIds: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export function GroupManagement() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  const [groups, setGroups] = useState<BackendGroup[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<BackendGroup | null>(null)
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Load groups and users from Cosmos DB
  useEffect(() => {
    if (currentTenant) {
      loadGroups()
      loadUsers()
    }
  }, [currentTenant])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const data = await ApiService.getGroups()
      setGroups(data)
    } catch (error) {
      console.error('Error loading groups:', error)
      toast.error('Error al cargar grupos')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    if (!currentTenant) return
    try {
      const data = await ApiService.getUsersByTenant(currentTenant.id)
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !currentTenant || !user) {
      toast.error(t('groups.nameRequired', 'Group name is required'))
      return
    }

    try {
      const newGroup = await ApiService.createGroup({
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        memberIds: selectedUserIds
      })
      
      setGroups([...groups, newGroup])
      toast.success(`${t('groups.createGroup', 'Create Group')}: "${groupName}" - ${selectedUserIds.length} ${t('groups.members', 'members')}`)

      setGroupName('')
      setGroupDescription('')
      setSelectedUserIds([])
      setIsCreateDialogOpen(false)
    } catch (error: any) {
      console.error('Error creating group:', error)
      toast.error(error.message || 'Error al crear grupo')
    }
  }

  const handleEditGroup = (group: BackendGroup) => {
    setEditingGroup(group)
    setGroupName(group.name)
    setGroupDescription(group.description || '')
    setSelectedUserIds(group.memberIds || [])
    setSearchTerm('')
    setIsEditDialogOpen(true)
  }

  const handleUpdateGroup = async () => {
    if (!editingGroup || !currentTenant) return
    
    if (!groupName.trim()) {
      toast.error(t('groups.nameRequired', 'Group name is required'))
      return
    }

    try {
      const updatedGroup = await ApiService.updateGroup(editingGroup.id, {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        memberIds: selectedUserIds
      })
      
      setGroups(groups.map(g => g.id === editingGroup.id ? updatedGroup : g))
      toast.success(t('groups.updated', 'Group updated successfully'))
      
      setEditingGroup(null)
      setGroupName('')
      setGroupDescription('')
      setSelectedUserIds([])
      setSearchTerm('')
      setIsEditDialogOpen(false)
    } catch (error: any) {
      console.error('Error updating group:', error)
      toast.error(error.message || 'Error al actualizar grupo')
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    const group = groups.find(g => g.id === groupId)
    if (!group || !currentTenant) return

    if (confirm(`${t('groups.confirmDelete', 'Are you sure you want to delete this group?')} "${group.name}"?`)) {
      try {
        await ApiService.deleteGroup(groupId)
        setGroups(groups.filter(g => g.id !== groupId))
        toast.success(t('groups.deleted', 'Group deleted'))
      } catch (error: any) {
        console.error('Error deleting group:', error)
        toast.error(error.message || 'Error al eliminar grupo')
      }
    }
  }

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId]
    )
  }

  const handleRemoveMember = (userId: string) => {
    setSelectedUserIds((current) => current.filter(id => id !== userId))
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user ? `${user.firstName} ${user.lastName}` : null
  }

  const getValidUserIds = (userIds: string[]): string[] => {
    const validUserIds = new Set(users.map(u => u.id))
    return userIds.filter(id => validUserIds.has(id))
  }

  const cleanupGhostUsers = async () => {
    const validUserIds = new Set(users.map(u => u.id))
    let ghostCount = 0
    let affectedGroups = 0

    const cleanupPromises = groups.map(async (group) => {
      const validMemberIds = group.memberIds.filter(id => validUserIds.has(id))
      const removedCount = group.memberIds.length - validMemberIds.length
      
      if (removedCount > 0) {
        ghostCount += removedCount
        affectedGroups++
        
        // Update group in backend
        try {
          await ApiService.updateGroup(group.id, {
            memberIds: validMemberIds
          })
        } catch (error) {
          console.error('Error cleaning up group:', error)
        }
      }

      return {
        ...group,
        memberIds: validMemberIds
      }
    })

    await Promise.all(cleanupPromises)
    
    if (ghostCount > 0) {
      await loadGroups() // Reload groups
      toast.success(
        `${t('groups.cleanupComplete', 'Cleanup complete')}: ${ghostCount} ${t('groups.ghostUsersRemoved', 'ghost users removed from')} ${affectedGroups} ${affectedGroups === 1 ? t('groups.groupName', 'group') : t('groups.members', 'groups')}`
      )
    } else {
      toast.info(t('groups.noGhostUsers', 'No ghost users found. All groups are clean!'))
    }
  }

  useEffect(() => {
    const validUserIds = new Set(users.map(u => u.id))
    let hasGhosts = false

    for (const group of groups) {
      if (group.memberIds.some(id => !validUserIds.has(id))) {
        hasGhosts = true
        break
      }
    }

    if (hasGhosts && groups.length > 0) {
      console.warn('Ghost users detected in groups. Use the cleanup button to remove them.')
    }
  }, [groups, users])

  const getAvailableEmployees = () => {
    const search = searchTerm.toLowerCase()
    return users.filter(user => {
      if (selectedUserIds.includes(user.id)) return false
      if (!search) return true
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
      return fullName.includes(search) || user.email.toLowerCase().includes(search)
    })
  }

  return (
    <div className="space-y-6">
      <GroupSuggestions />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UsersThree size={24} className="text-primary" aria-hidden="true" />
                {t('groups.title', 'Employee Groups')}
              </CardTitle>
              <CardDescription>{t('groups.description', 'Organize employees into groups for easier course assignment')}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={cleanupGhostUsers}
                className="gap-2"
                title={t('groups.cleanupGhostUsers', 'Remove invalid user references from all groups')}
              >
                <Broom size={20} aria-hidden="true" />
                <span className="hidden sm:inline">{t('groups.cleanup', 'Cleanup')}</span>
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus size={20} aria-hidden="true" />
                    {t('groups.createGroup', 'Create Group')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('groups.createNewGroup', 'Create New Group')}</DialogTitle>
                  <DialogDescription>{t('groups.createDescription', 'Organize employees into a group for batch course assignments')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name" className="text-base font-medium">
                      {t('groups.groupName', 'Group Name')}
                    </Label>
                    <Input
                      id="group-name"
                      placeholder={t('groups.groupNamePlaceholder', 'e.g., New Hires, Sales Team, Engineering')}
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-description" className="text-base font-medium">
                      {t('groups.description', 'Description')} ({t('common.optional', 'Optional')})
                    </Label>
                    <Textarea
                      id="group-description"
                      placeholder={t('groups.descriptionPlaceholder', 'Describe the purpose of this group')}
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      {t('groups.selectMembers', 'Select Members')} ({selectedUserIds.length} {t('groups.selected', 'selected')})
                    </Label>
                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                      {users.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          {t('groups.noEmployees', 'No employees available. Invite users first.')}
                        </div>
                      ) : (
                        <div className="divide-y">
                          {users.map((user) => (
                            <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-muted/50">
                              <Checkbox
                                id={`user-${user.id}`}
                                checked={selectedUserIds.includes(user.id)}
                                onCheckedChange={() => handleToggleUser(user.id)}
                              />
                              <Label
                                htmlFor={`user-${user.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </Label>
                              {user.departamento && (
                                <Badge variant="outline">{user.departamento}</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button onClick={handleCreateGroup} className="flex-1">
                      {t('groups.createGroup', 'Create Group')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando grupos...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12">
              <UsersThree size={64} className="mx-auto text-muted-foreground mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold mb-2">{t('groups.noGroups', 'No Groups Yet')}</h3>
              <p className="text-muted-foreground mb-4">{t('groups.noGroupsDesc', 'Create your first group to organize employees')}</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus size={20} aria-hidden="true" />
                {t('groups.createFirstGroup', 'Create First Group')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => {
                const validUserIds = getValidUserIds(group.memberIds || [])
                const validCount = validUserIds.length
                return (
                  <Card key={group.id} className="bg-card">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{group.name}</h3>
                            <Badge variant="secondary">{validCount} {t('groups.members', 'members')}</Badge>
                            {validCount !== (group.memberIds?.length || 0) && (
                              <Badge variant="destructive" className="text-xs">
                                {(group.memberIds?.length || 0) - validCount} {t('groups.invalid', 'invalid')}
                              </Badge>
                            )}
                          </div>
                          {group.description && (
                            <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {validUserIds.slice(0, 5).map((userId) => {
                              const userName = getUserName(userId)
                              return userName ? (
                                <Badge key={userId} variant="outline">
                                  {userName}
                                </Badge>
                              ) : null
                            })}
                            {validCount > 5 && (
                              <Badge variant="outline">+{validCount - 5} {t('groups.more', 'more')}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGroup(group)}
                            className="text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <PencilSimple size={20} aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGroup(group.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash size={20} aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('groups.editGroup', 'Edit Group')}</DialogTitle>
            <DialogDescription>{t('groups.editDescription', 'Update group details and members')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-group-name" className="text-base font-medium">
                {t('groups.groupName', 'Group Name')}
              </Label>
              <Input
                id="edit-group-name"
                placeholder={t('groups.groupNamePlaceholder', 'e.g., New Hires, Sales Team, Engineering')}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-group-description" className="text-base font-medium">
                {t('groups.description', 'Description')} ({t('common.optional', 'Optional')})
              </Label>
              <Textarea
                id="edit-group-description"
                placeholder={t('groups.descriptionPlaceholder', 'Describe the purpose of this group')}
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">
                {t('groups.currentMembers', 'Current Members')} ({selectedUserIds.length})
              </Label>
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {selectedUserIds.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    {t('groups.noCurrentMembers', 'This group has no members')}
                  </div>
                ) : (
                  <div className="divide-y">
                    {selectedUserIds.map((userId) => {
                      const user = users.find(u => u.id === userId)
                      if (!user) return null
                      return (
                        <div key={userId} className="flex items-center justify-between gap-3 p-3 hover:bg-muted/50">
                          <div className="flex-1">
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                          {user.departamento && (
                            <Badge variant="outline">{user.departamento}</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(userId)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X size={18} aria-hidden="true" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">
                {t('groups.availableMembers', 'Available Members')}
              </Label>
              <Input
                placeholder={t('groups.searchMembers', 'Search members...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10"
              />
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {getAvailableEmployees().length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    {t('groups.noAvailableMembers', 'No members available to add')}
                  </div>
                ) : (
                  <div className="divide-y">
                    {getAvailableEmployees().map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer" onClick={() => handleToggleUser(user.id)}>
                        <div className="flex-1">
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                        {user.departamento && (
                          <Badge variant="outline">{user.departamento}</Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleUser(user.id)
                          }}
                          className="gap-2"
                        >
                          <Plus size={16} aria-hidden="true" />
                          {t('groups.addMember', 'Add')}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingGroup(null)
                  setGroupName('')
                  setGroupDescription('')
                  setSelectedUserIds([])
                  setSearchTerm('')
                }} 
                className="flex-1"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button onClick={handleUpdateGroup} className="flex-1">
                {t('groups.updateGroup', 'Update Group')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {groups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('groups.overview', 'Group Overview')}</CardTitle>
            <CardDescription>{t('groups.overviewDesc', 'Summary of all employee groups')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('groups.groupName', 'Group Name')}</TableHead>
                    <TableHead>{t('groups.description', 'Description')}</TableHead>
                    <TableHead className="text-right">{t('groups.members', 'Members')}</TableHead>
                    <TableHead>{t('common.created', 'Created')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => {
                    const validCount = getValidUserIds(group.memberIds || []).length
                    return (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {group.description || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{validCount}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
