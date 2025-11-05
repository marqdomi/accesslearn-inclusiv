import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, MagnifyingGlass, UserPlus, PencilSimple, Trash, PaperPlaneTilt, Download, Funnel } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { UserManagementService, ManagedUser, UserUpdateData } from '@/services/user-management-service'

interface EmployeeManagementProps {
  onBack: () => void
  onAddEmployee: () => void
}

export function EmployeeManagement({ onBack, onAddEmployee }: EmployeeManagementProps) {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<ManagedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null)
  const [resendingUser, setResendingUser] = useState<ManagedUser | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResendDialogOpen, setIsResendDialogOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<UserUpdateData>({})
  
  const itemsPerPage = 10

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, searchQuery, roleFilter, statusFilter])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await UserManagementService.getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...users]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(query) ||
        u.firstName.toLowerCase().includes(query) ||
        u.lastName.toLowerCase().includes(query) ||
        u.fullName.toLowerCase().includes(query) ||
        (u.department && u.department.toLowerCase().includes(query))
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter)
    }

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }

  const handleEditUser = (user: ManagedUser) => {
    setEditingUser(user)
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department,
      role: user.role
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return

    try {
      await UserManagementService.updateUser(editingUser.id, editFormData)
      toast.success('Usuario actualizado correctamente')
      setIsEditDialogOpen(false)
      loadUsers()
    } catch (error) {
      console.error('Failed to update user:', error)
      toast.error('Error al actualizar usuario')
    }
  }

  const handleDeleteUser = (user: ManagedUser) => {
    setDeletingUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingUser) return

    try {
      await UserManagementService.deleteUser(deletingUser.id)
      toast.success('Usuario eliminado correctamente')
      setIsDeleteDialogOpen(false)
      loadUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Error al eliminar usuario')
    }
  }

  const handleResendInvitation = (user: ManagedUser) => {
    setResendingUser(user)
    setIsResendDialogOpen(true)
  }

  const handleConfirmResend = async () => {
    if (!resendingUser) return

    try {
      const updated = await UserManagementService.resendInvitation(resendingUser.id)
      toast.success('Invitación reenviada. Nueva contraseña generada.')
      setIsResendDialogOpen(false)
      
      if (updated.temporaryPassword) {
        toast.info(`Nueva contraseña: ${updated.temporaryPassword}`, {
          duration: 10000
        })
      }
      
      loadUsers()
    } catch (error) {
      console.error('Failed to resend invitation:', error)
      toast.error('Error al reenviar invitación')
    }
  }

  const handleDownloadCSV = () => {
    try {
      const headers = ['Email', 'Nombre', 'Apellido', 'Departamento', 'Rol', 'Estado', 'Fecha Creación']
      const rows = filteredUsers.map(u => [
        u.email,
        u.firstName,
        u.lastName,
        u.department || '',
        u.role,
        u.status,
        new Date(u.createdAt).toLocaleDateString()
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `empleados-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('CSV descargado correctamente')
    } catch (error) {
      console.error('Error downloading CSV:', error)
      toast.error('Error al descargar CSV')
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default'
      case 'mentor': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'pending': return 'secondary'
      default: return 'destructive'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'mentor': return 'Mentor'
      default: return 'Empleado'
    }
  }

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestión de Empleados</h2>
            <p className="text-muted-foreground mt-1">Administra todos los usuarios del sistema</p>
          </div>
        </div>
        <Button onClick={onAddEmployee} className="gap-2">
          <UserPlus size={20} />
          Añadir Empleado
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Funnel size={20} />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, email o departamento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter">Rol</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                  <SelectItem value="mentor">Mentores</SelectItem>
                  <SelectItem value="employee">Empleados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {users.filter(u => u.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {users.filter(u => u.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Empleados</CardTitle>
              <CardDescription>
                {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="gap-2">
              <Download size={16} />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando usuarios...</div>
          ) : currentUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No se encontraron usuarios</div>
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Último Acceso</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.department || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(user.status)}>
                            {user.status === 'active' ? 'Activo' : user.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Nunca'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} title="Editar">
                              <PencilSimple size={16} />
                            </Button>
                            {user.status === 'pending' && (
                              <Button variant="ghost" size="icon" onClick={() => handleResendInvitation(user)} title="Reenviar Invitación">
                                <PaperPlaneTilt size={16} />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user)} title="Eliminar" className="text-destructive hover:text-destructive">
                              <Trash size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuarios
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      Anterior
                    </Button>
                    <div className="text-sm">Página {currentPage} de {totalPages}</div>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifica la información del usuario</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">Nombre</Label>
              <Input id="edit-firstName" value={editFormData.firstName || ''} onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Apellido</Label>
              <Input id="edit-lastName" value={editFormData.lastName || ''} onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Departamento</Label>
              <Input id="edit-department" value={editFormData.department || ''} onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol</Label>
              <Select value={editFormData.role} onValueChange={(value: 'admin' | 'employee' | 'mentor') => setEditFormData({ ...editFormData, role: value })}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Empleado</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a {deletingUser?.fullName}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResendDialogOpen} onOpenChange={setIsResendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reenviar Invitación</DialogTitle>
            <DialogDescription>
              Se generará una nueva contraseña temporal para {resendingUser?.fullName}. La contraseña anterior dejará de funcionar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResendDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmResend}>Reenviar Invitación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
