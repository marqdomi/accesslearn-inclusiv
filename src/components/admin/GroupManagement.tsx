import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { UserGroup, EmployeeCredentials } from '@/lib/types'
import { UsersThree, Plus, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { GroupSuggestions } from './GroupSuggestions'
import { useTranslation } from '@/lib/i18n'

export function GroupManagement() {
  const { t } = useTranslation()
  const [groups, setGroups] = useKV<UserGroup[]>('user-groups', [])
  const [employees] = useKV<EmployeeCredentials[]>('employee-credentials', [])
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast.error(t('groups.nameRequired', 'Group name is required'))
      return
    }

    const newGroup: UserGroup = {
      id: `group_${Date.now()}`,
      name: groupName.trim(),
      description: groupDescription.trim(),
      userIds: selectedUserIds,
      courseIds: [],
      createdAt: Date.now()
    }

    setGroups((current) => [...(current || []), newGroup])
    toast.success(`${t('groups.createGroup', 'Create Group')}: "${groupName}" - ${selectedUserIds.length} ${t('groups.members', 'members')}`)

    setGroupName('')
    setGroupDescription('')
    setSelectedUserIds([])
    setIsCreateDialogOpen(false)
  }

  const handleDeleteGroup = (groupId: string) => {
    const group = groups?.find(g => g.id === groupId)
    if (!group) return

    if (confirm(`${t('groups.confirmDelete', 'Are you sure you want to delete this group?')} "${group.name}"?`)) {
      setGroups((current) => (current || []).filter(g => g.id !== groupId))
      toast.success(t('groups.deleted', 'Group deleted'))
    }
  }

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId]
    )
  }

  const getUserName = (userId: string) => {
    const employee = employees?.find(e => e.id === userId)
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown User'
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
                      {(employees || []).length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          {t('groups.noEmployees', 'No employees available. Upload employees first.')}
                        </div>
                      ) : (
                        <div className="divide-y">
                          {(employees || []).map((employee) => (
                            <div key={employee.id} className="flex items-center gap-3 p-3 hover:bg-muted/50">
                              <Checkbox
                                id={`user-${employee.id}`}
                                checked={selectedUserIds.includes(employee.id)}
                                onCheckedChange={() => handleToggleUser(employee.id)}
                              />
                              <Label
                                htmlFor={`user-${employee.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                <div className="text-sm text-muted-foreground">{employee.email}</div>
                              </Label>
                              {employee.department && (
                                <Badge variant="outline">{employee.department}</Badge>
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
        </CardHeader>
        <CardContent>
          {(groups || []).length === 0 ? (
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
              {(groups || []).map((group) => (
                <Card key={group.id} className="bg-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{group.name}</h3>
                          <Badge variant="secondary">{group.userIds.length} members</Badge>
                        </div>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {group.userIds.slice(0, 5).map((userId) => (
                            <Badge key={userId} variant="outline">
                              {getUserName(userId)}
                            </Badge>
                          ))}
                          {group.userIds.length > 5 && (
                            <Badge variant="outline">+{group.userIds.length - 5} more</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash size={20} aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {(groups || []).length > 0 && (
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
                    <TableHead className="text-right">{t('groups.coursesAssigned', 'Courses Assigned')}</TableHead>
                    <TableHead>{t('common.created', 'Created')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(groups || []).map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {group.description || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{group.userIds.length}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{group.courseIds.length}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
