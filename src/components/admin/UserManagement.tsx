import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { User, UserGroup, CourseStructure } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Plus, Users as UsersIcon, UserPlus, UsersThree, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface UserManagementProps {
  onBack: () => void
}

export function UserManagement({ onBack }: UserManagementProps) {
  const [users, setUsers] = useKV<User[]>('users', [])
  const [groups, setGroups] = useKV<UserGroup[]>('user-groups', [])
  const [courses] = useKV<CourseStructure[]>('admin-courses', [])
  
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [isAddingGroup, setIsAddingGroup] = useState(false)
  
  const [newUser, setNewUser] = useState<{ name: string; email: string; role: 'employee' | 'admin' }>({ name: '', email: '', role: 'employee' })
  const [newGroup, setNewGroup] = useState({ name: '', description: '' })

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Name and email are required')
      return
    }

    const user: User = {
      id: `user-${Date.now()}`,
      ...newUser,
      assignedCourses: []
    }

    setUsers((current) => [...(current || []), user])
    setNewUser({ name: '', email: '', role: 'employee' })
    setIsAddingUser(false)
    toast.success('User added successfully')
  }

  const handleAddGroup = () => {
    if (!newGroup.name) {
      toast.error('Group name is required')
      return
    }

    const group: UserGroup = {
      id: `group-${Date.now()}`,
      ...newGroup,
      userIds: [],
      courseIds: [],
      createdAt: Date.now()
    }

    setGroups((current) => [...(current || []), group])
    setNewGroup({ name: '', description: '' })
    setIsAddingGroup(false)
    toast.success('Group created successfully')
  }

  const deleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers((current) => (current || []).filter(u => u.id !== userId))
      toast.success('User deleted')
    }
  }

  const deleteGroup = (groupId: string) => {
    if (confirm('Are you sure you want to delete this group?')) {
      setGroups((current) => (current || []).filter(g => g.id !== groupId))
      toast.success('Group deleted')
    }
  }

  const assignCourseToUser = (userId: string, courseId: string) => {
    setUsers((current) =>
      (current || []).map(u =>
        u.id === userId
          ? { ...u, assignedCourses: [...u.assignedCourses, courseId] }
          : u
      )
    )
    toast.success('Course assigned to user')
  }

  const publishedCourses = (courses || []).filter(c => c.published)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="admin-button admin-focus">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-3xl font-semibold admin-heading">User Management</h2>
            <p className="text-sm text-muted-foreground font-medium">
              {users?.length || 0} users · {groups?.length || 0} groups
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="admin-button gap-2">
            <UsersIcon size={16} />
            Users
          </TabsTrigger>
          <TabsTrigger value="groups" className="admin-button gap-2">
            <UsersThree size={16} />
            Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
              <DialogTrigger asChild>
                <Button className="admin-button admin-focus bg-[var(--admin-primary)]">
                  <UserPlus className="mr-2" size={18} />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="admin-card">
                <DialogHeader>
                  <DialogTitle className="text-[var(--admin-primary)]">Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new learner account manually
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Name *</Label>
                    <Input
                      id="user-name"
                      className="admin-input admin-focus"
                      placeholder="John Doe"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email *</Label>
                    <Input
                      id="user-email"
                      className="admin-input admin-focus"
                      type="email"
                      placeholder="john@example.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) =>
                        setNewUser({ ...newUser, role: value as 'employee' | 'admin' })
                      }
                    >
                      <SelectTrigger id="user-role" className="admin-input admin-focus">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser}>Add User</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {(users || []).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <UsersIcon size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No users yet</p>
                <Button onClick={() => setIsAddingUser(true)}>
                  <UserPlus className="mr-2" size={18} />
                  Add Your First User
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(users || []).map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{user.name}</CardTitle>
                        <CardDescription className="text-sm">{user.email}</CardDescription>
                      </div>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        {user.assignedCourses.length} course(s) assigned
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Assign Course</Label>
                      <Select
                        onValueChange={(courseId) => assignCourseToUser(user.id, courseId)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {publishedCourses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full"
                      onClick={() => deleteUser(user.id)}
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

        <TabsContent value="groups" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={isAddingGroup} onOpenChange={setIsAddingGroup}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2" size={18} />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Group users for easier course assignment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Group Name *</Label>
                    <Input
                      id="group-name"
                      placeholder="e.g., New Hires, Sales Team"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group-description">Description</Label>
                    <Input
                      id="group-description"
                      placeholder="Purpose of this group"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingGroup(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddGroup}>Create Group</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {(groups || []).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <UsersThree size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No groups yet</p>
                <Button onClick={() => setIsAddingGroup(true)}>
                  <Plus className="mr-2" size={18} />
                  Create Your First Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(groups || []).map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{group.name}</CardTitle>
                    {group.description && (
                      <CardDescription>{group.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <p>{group.userIds.length} member(s)</p>
                      <p>{group.courseIds.length} course(s) assigned</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full"
                      onClick={() => deleteGroup(group.id)}
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
