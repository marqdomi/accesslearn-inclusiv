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
import { useGroups, useGroupActions } from '@/hooks/use-groups'
import { toast } from 'sonner'

export function GroupManagement() {
  const { groups, loading, refresh } = useGroups()
  const { createGroup, deleteGroup } = useGroupActions()
  const [employees] = useKV<EmployeeCredentials[]>('employee-credentials', [])
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Group name is required')
      return
    }

    try {
      await createGroup({
        name: groupName.trim(),
        description: groupDescription.trim(),
        userIds: selectedUserIds,
        courseIds: [],
        createdAt: Date.now()
      })
      
      toast.success(`Group "${groupName}" created with ${selectedUserIds.length} members`)
      
      setGroupName('')
      setGroupDescription('')
      setSelectedUserIds([])
      setIsCreateDialogOpen(false)
      
      refresh()
    } catch (error) {
      toast.error('Failed to create group')
      console.error('Create group error:', error)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    const group = groups.find(g => g.id === groupId)
    if (!group) return

    if (confirm(`Are you sure you want to delete the group "${group.name}"?`)) {
      try {
        await deleteGroup(groupId)
        toast.success('Group deleted')
        refresh()
      } catch (error) {
        toast.error('Failed to delete group')
        console.error('Delete group error:', error)
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

  const getUserName = (userId: string) => {
    const employee = employees?.find(e => e.id === userId)
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown User'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Loading groups...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UsersThree size={24} className="text-primary" aria-hidden="true" />
                Employee Groups
              </CardTitle>
              <CardDescription>Organize employees into groups for easier course assignment</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={20} aria-hidden="true" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>Organize employees into a group for batch course assignments</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name" className="text-base font-medium">
                      Group Name
                    </Label>
                    <Input
                      id="group-name"
                      placeholder="e.g., New Hires, Sales Team, Engineering"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-description" className="text-base font-medium">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="group-description"
                      placeholder="Describe the purpose of this group"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      Select Members ({selectedUserIds.length} selected)
                    </Label>
                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                      {(employees || []).length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No employees available. Upload employees first.
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
                      Cancel
                    </Button>
                    <Button onClick={handleCreateGroup} className="flex-1">
                      Create Group
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
              <h3 className="text-lg font-semibold mb-2">No Groups Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first group to organize employees</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus size={20} aria-hidden="true" />
                Create First Group
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
            <CardTitle>Group Overview</CardTitle>
            <CardDescription>Summary of all employee groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Members</TableHead>
                    <TableHead className="text-right">Courses Assigned</TableHead>
                    <TableHead>Created</TableHead>
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
