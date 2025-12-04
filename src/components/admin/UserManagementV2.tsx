import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/contexts/TenantContext'
import { useAuth } from '@/contexts/AuthContext'
import { ApiService } from '@/services/api.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { 
  ArrowLeft, 
  Plus, 
  Users as UsersIcon, 
  UserPlus, 
  Trash, 
  Pencil, 
  EnvelopeSimple,
  MagnifyingGlass,
  FunnelSimple,
  Download,
  Upload,
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface User {
  id: string
  tenantId: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  status?: 'active' | 'inactive' | 'pending'
  totalXP?: number
  level?: number
  createdAt: string
  lastLoginAt?: string
  invitedBy?: string
  invitationAcceptedAt?: string
}

interface UserManagementProps {
  onBack?: () => void
}

export function UserManagement({ onBack }: UserManagementProps) {
  const navigate = useNavigate()
  const { currentTenant } = useTenant()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Form states
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'student',
  })
  
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    role: '',
    status: 'active' as 'active' | 'inactive',
  })

  useEffect(() => {
    if (currentTenant) {
      loadUsers()
    }
  }, [currentTenant])

  const loadUsers = async () => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const data = await ApiService.getUsersByTenant(currentTenant.id)
      setUsers(data)
    } catch (error: any) {
      console.error('Error loading users:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteUser = async () => {
    if (!currentTenant) return

    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName) {
      toast.error('Todos los campos son requeridos')
      return
    }

    try {
      const result = await ApiService.inviteUser({
        tenantId: currentTenant.id,
        ...inviteForm,
      })

      toast.success('Invitación enviada exitosamente', {
        description: `Se envió un email a ${inviteForm.email}`,
      })

      // Copy invitation URL to clipboard
      navigator.clipboard.writeText(result.invitationUrl)
      toast.info('URL de invitación copiada al portapapeles')

      setInviteForm({ email: '', firstName: '', lastName: '', role: 'student' })
      setIsInviteModalOpen(false)
      loadUsers()
    } catch (error: any) {
      console.error('Error inviting user:', error)
      toast.error(error.message || 'Error al enviar invitación')
    }
  }

  const handleUpdateUser = async () => {
    if (!currentTenant || !selectedUser) return

    try {
      await ApiService.updateUserFull(selectedUser.id, currentTenant.id, editForm)

      toast.success('Usuario actualizado exitosamente')
      setIsEditModalOpen(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error(error.message || 'Error al actualizar usuario')
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!currentTenant) return

    if (!confirm(`¿Estás seguro de eliminar a ${user.firstName} ${user.lastName}?`)) {
      return
    }

    try {
      await ApiService.deleteUser(user.id, currentTenant.id)
      toast.success('Usuario eliminado exitosamente')
      loadUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(error.message || 'Error al eliminar usuario')
    }
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status === 'active' ? 'active' : 'inactive',
    })
    setIsEditModalOpen(true)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super-admin':
      case 'tenant-admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'content-manager':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'instructor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'mentor':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'student':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'super-admin': 'Super Admin',
      'tenant-admin': 'Administrador',
      'content-manager': 'Gestor de Contenido',
      'instructor': 'Instructor',
      'mentor': 'Mentor',
      'student': 'Estudiante',
    }
    return labels[role] || role
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Activo</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Inactivo</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pendiente</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Filtering
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    students: users.filter(u => u.role === 'student').length,
    instructors: users.filter(u => u.role === 'instructor').length,
    admins: users.filter(u => ['super-admin', 'tenant-admin', 'content-manager'].includes(u.role || '')).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Button variant="ghost" onClick={onBack || (() => navigate('/dashboard'))} className="gap-2 mb-3 sm:mb-4 touch-target">
          <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">Volver al Dashboard</span>
          <span className="sm:hidden">Volver</span>
        </Button>
      </div>

      <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">Gestión de Usuarios</h2>
        <p className="text-xs sm:text-base text-muted-foreground">
          {stats.total} usuarios · {stats.active} activos · {stats.pending} pendientes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Estudiantes</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{stats.students}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Instructores</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{stats.instructors}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{stats.admins}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center flex-shrink-0">
                <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Filters */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-xl">Lista de Usuarios</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Gestiona usuarios, invita nuevos miembros y actualiza permisos
              </CardDescription>
            </div>
            <Button onClick={() => setIsInviteModalOpen(true)} className="w-full sm:w-auto touch-target text-xs sm:text-sm">
              <UserPlus className="mr-1.5 sm:mr-2" size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Invitar Usuario</span>
              <span className="sm:hidden">Invitar</span>
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3 sm:mt-4">
            <div className="flex-1 relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} className="sm:w-4 sm:h-4" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-10 h-11 sm:h-12 text-sm sm:text-base touch-target"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-11 sm:h-12 text-sm sm:text-base touch-target">
                <FunnelSimple className="mr-2" size={14} className="sm:w-4 sm:h-4" />
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="student">Estudiantes</SelectItem>
                <SelectItem value="instructor">Instructores</SelectItem>
                <SelectItem value="mentor">Mentores</SelectItem>
                <SelectItem value="content-manager">Gestores</SelectItem>
                <SelectItem value="tenant-admin">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-11 sm:h-12 text-sm sm:text-base touch-target">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <UsersIcon size={36} className="sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                {users.length === 0 ? 'No hay usuarios aún' : 'No se encontraron usuarios'}
              </p>
              {users.length === 0 && (
                <Button onClick={() => setIsInviteModalOpen(true)} className="touch-target text-xs sm:text-sm">
                  <UserPlus className="mr-1.5 sm:mr-2" size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Invitar Primer Usuario
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                      <h4 className="text-sm sm:text-base font-semibold truncate">
                        {user.firstName || ''} {user.lastName || ''}
                      </h4>
                      <Badge className={`${getRoleBadgeColor(user.role)} text-[10px] sm:text-xs`}>
                        {getRoleLabel(user.role)}
                      </Badge>
                      <div className="text-[10px] sm:text-xs">
                        {getStatusBadge(user.status || 'inactive')}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2">
                      <span>XP: {user.totalXP || 0}</span>
                      <span>Nivel: {user.level || 1}</span>
                      {user.lastLoginAt && (
                        <span className="truncate">Último acceso: {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                      )}
                      {user.status === 'pending' && (
                        <span className="text-yellow-600">⏳ Invitación pendiente</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(user)}
                      className="touch-target"
                    >
                      <Pencil size={14} className="sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                      disabled={user.id === currentUser?.id}
                      className="touch-target"
                    >
                      <Trash size={14} className="sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite User Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <DialogTitle className="text-base sm:text-lg">Invitar Nuevo Usuario</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              El usuario recibirá un email con un enlace para activar su cuenta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4 px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="firstName" className="text-xs sm:text-sm">Nombre *</Label>
                <Input
                  id="firstName"
                  placeholder="Juan"
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                  className="h-11 sm:h-12 text-sm sm:text-base touch-target"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="lastName" className="text-xs sm:text-sm">Apellido *</Label>
                <Input
                  id="lastName"
                  placeholder="Pérez"
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                  className="h-11 sm:h-12 text-sm sm:text-base touch-target"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan.perez@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="h-11 sm:h-12 text-sm sm:text-base touch-target"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="role" className="text-xs sm:text-sm">Rol</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
              >
                <SelectTrigger id="role" className="h-11 sm:h-12 text-sm sm:text-base touch-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Estudiante</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="content-manager">Gestor de Contenido</SelectItem>
                  <SelectItem value="tenant-admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="p-4 sm:p-6 pt-0 flex-col sm:flex-row gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)} className="w-full sm:w-auto touch-target text-xs sm:text-sm">
              Cancelar
            </Button>
            <Button onClick={handleInviteUser} className="w-full sm:w-auto touch-target text-xs sm:text-sm">
              <EnvelopeSimple className="mr-1.5 sm:mr-2" size={14} className="sm:w-4 sm:h-4" />
              Enviar Invitación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
            <DialogTitle className="text-base sm:text-lg">Editar Usuario</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Actualizar información y permisos del usuario
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4 px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="editFirstName" className="text-xs sm:text-sm">Nombre</Label>
                <Input
                  id="editFirstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="h-11 sm:h-12 text-sm sm:text-base touch-target"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="editLastName" className="text-xs sm:text-sm">Apellido</Label>
                <Input
                  id="editLastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="h-11 sm:h-12 text-sm sm:text-base touch-target"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="editRole" className="text-xs sm:text-sm">Rol</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger id="editRole" className="h-11 sm:h-12 text-sm sm:text-base touch-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Estudiante</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="content-manager">Gestor de Contenido</SelectItem>
                  <SelectItem value="tenant-admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="editStatus" className="text-xs sm:text-sm">Estado</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value as 'active' | 'inactive' })}
              >
                <SelectTrigger id="editStatus" className="h-11 sm:h-12 text-sm sm:text-base touch-target">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="p-4 sm:p-6 pt-0 flex-col sm:flex-row gap-2 sm:gap-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto touch-target text-xs sm:text-sm">
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} className="w-full sm:w-auto touch-target text-xs sm:text-sm">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Export also as UserManagementV2 for convenience
export const UserManagementV2 = UserManagement
