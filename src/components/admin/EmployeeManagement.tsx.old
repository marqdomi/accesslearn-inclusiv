import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { User, EmployeeCredentials } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ArrowLeft, MagnifyingGlass, Users, UserPlus, Download, Trash, PencilSimple, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'

interface EmployeeManagementProps {
  onBack: () => void
}

interface CombinedEmployee {
  id: string
  name: string
  email: string
  role: 'admin' | 'employee'
  status: 'active' | 'pending'
  department?: string
  source: 'user' | 'credential'
  createdAt: number
}

export function EmployeeManagement({ onBack }: EmployeeManagementProps) {
  const { t } = useTranslation()
  const [users, setUsers] = useKV<User[]>('users', [])
  const [employees] = useKV<EmployeeCredentials[]>('employee-credentials', [])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'employee'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Edit/Delete states
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [editName, setEditName] = useState('')
  const [editDepartment, setEditDepartment] = useState('')
  const [editStatus, setEditStatus] = useState<'active' | 'pending'>('active')

  // 🔥 SINGLE SOURCE OF TRUTH: Read from 'users' only
  // employee-credentials is only for temporary password lookup
  const allEmployees = useMemo(() => {
    const result = (users || []).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'active',
      department: user.department,
      source: 'user' as const,
      createdAt: user.createdAt || Date.now()
    }))
    
    console.log(`📊 EmployeeManagement: Single Source of Truth ('users'): ${result.length} employees`)
    console.log(`  - employee-credentials (for temp passwords only): ${(employees || []).length}`)
    return result
  }, [users, employees])

  // Filtrar y buscar
  const filteredEmployees = useMemo(() => {
    return allEmployees.filter(emp => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter
      const matchesRole = roleFilter === 'all' || emp.role === roleFilter

      return matchesSearch && matchesStatus && matchesRole
    })
  }, [allEmployees, searchTerm, statusFilter, roleFilter])

  // Paginación
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Department', 'Created']
    const rows = filteredEmployees.map(emp => [
      emp.name,
      emp.email,
      emp.role,
      emp.status,
      emp.department || '-',
      new Date(emp.createdAt).toLocaleDateString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `employees-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Employee list exported successfully')
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditName(user.name)
    setEditDepartment(user.department || '')
    setEditStatus(user.status || 'active')
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingUser) return
    
    if (!editName.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    setUsers((current) => 
      (current || []).map(u => 
        u.id === editingUser.id 
          ? { ...u, name: editName, department: editDepartment || undefined, status: editStatus }
          : u
      )
    )

    toast.success('Employee updated successfully')
    setIsEditDialogOpen(false)
    setEditingUser(null)
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!userToDelete) return

    setUsers((current) => (current || []).filter(u => u.id !== userToDelete.id))
    toast.success(`Deleted ${userToDelete.name}`)
    setIsDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  const handleBulkFixDepartments = () => {
    const usersWithoutDept = (users || []).filter(u => !u.department)
    
    if (usersWithoutDept.length === 0) {
      toast.info('All employees already have departments assigned')
      return
    }

    // Try to get department from employee-credentials
    setUsers((current) => 
      (current || []).map(user => {
        if (user.department) return user
        
        const credential = (employees || []).find(e => e.email.toLowerCase() === user.email.toLowerCase())
        if (credential?.department) {
          return { ...user, department: credential.department }
        }
        
        return user
      })
    )

    toast.success(`Fixed ${usersWithoutDept.length} employees with missing departments`)
  }

  const handleRestoreDefaultUsers = () => {
    const defaultUsers: User[] = [
      {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@empresa.mx',
        role: 'admin',
        assignedCourses: [],
        department: 'Administration',
        createdAt: Date.now(),
        status: 'active'
      }
    ]

    const existingEmails = new Set((users || []).map(u => u.email.toLowerCase()))
    const newUsers = defaultUsers.filter(u => !existingEmails.has(u.email.toLowerCase()))

    if (newUsers.length === 0) {
      toast.info('Default admin user already exists')
      return
    }

    setUsers((current) => [...(current || []), ...newUsers])
    toast.success(`Restored ${newUsers.length} default user(s)`)
  }

  console.log('📊 Employee Management Debug (Single Source of Truth):')
  console.log(`  - Users from 'users': ${(users || []).length}`)
  console.log(`  - Credentials (temp passwords): ${(employees || []).length}`)
  console.log(`  - Total displayed: ${allEmployees.length}`)
  console.log(`  - After filters: ${filteredEmployees.length}`)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users size={32} className="text-primary" weight="duotone" />
              Employee Management
            </h2>
            <p className="text-muted-foreground mt-1">
              Complete list of all employees in the system ({allEmployees.length} total)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRestoreDefaultUsers} variant="secondary" className="gap-2">
            <UserPlus size={20} />
            Restore Admin
          </Button>
          <Button onClick={handleBulkFixDepartments} variant="secondary" className="gap-2">
            <PencilSimple size={20} />
            Fix Missing Departments
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="gap-2">
            <Download size={20} />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Database</CardTitle>
          <CardDescription>
            🔥 Single Source of Truth - All employees from 'users' storage. employee-credentials only for temp passwords.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{allEmployees.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Employees</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-success/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-success">
                    {allEmployees.filter(e => e.status === 'active').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Active</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-accent/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">
                    {allEmployees.filter(e => e.status === 'pending').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Pending Activation</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-secondary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-secondary">
                    {allEmployees.filter(e => e.role === 'admin').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Admins</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => {
              setStatusFilter(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={(value: any) => {
              setRoleFilter(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      No employees found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.department || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'}>
                          {employee.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={employee.status === 'active' ? 'default' : 'outline'}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {employee.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              const user = (users || []).find(u => u.id === employee.id)
                              if (user) handleEditUser(user)
                            }}
                          >
                            <PencilSimple size={18} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              const user = (users || []).find(u => u.id === employee.id)
                              if (user) handleDeleteUser(user)
                            }}
                          >
                            <Trash size={18} className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">🔥 Source: 'users'</p>
              <p className="font-mono font-bold">{(users || []).length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Temp Passwords Only</p>
              <p className="font-mono font-bold">{(employees || []).length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Displayed</p>
              <p className="font-mono font-bold">{allEmployees.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">After Filters</p>
              <p className="font-mono font-bold">{filteredEmployees.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employee information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
                placeholder="e.g. Sales, Engineering, HR"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editStatus} onValueChange={(val: 'active' | 'pending') => setEditStatus(val)}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Warning size={24} className="text-destructive" weight="fill" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} className="flex-1">
              Delete Employee
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
