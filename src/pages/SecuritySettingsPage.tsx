import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Shield, Users, Lock, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { ApiService } from '@/services/api.service'

interface RoleInfo {
  role: string
  description: string
  permissions: string[]
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  'super-admin': 'Acceso completo a nivel plataforma (multi-tenant)',
  'tenant-admin': 'Administrador completo de la organización',
  'content-manager': 'Gestión de cursos y contenido',
  'user-manager': 'Gestión de usuarios y equipos',
  'analytics-viewer': 'Acceso solo lectura a analytics',
  'instructor': 'Creación de cursos (con aprobación)',
  'mentor': 'Guía de estudiantes',
  'student': 'Experiencia de aprendizaje',
}

export function SecuritySettingsPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { currentTenant } = useTenant()
  
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Debes iniciar sesión para acceder a esta página')
      navigate('/login')
    }
  }, [authLoading, isAuthenticated, navigate])

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      if (authLoading || !isAuthenticated || !user || !currentTenant?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const tenantId = user.tenantId || currentTenant.id
        const usersData = await ApiService.getUsersByTenant(tenantId)
        setUsers(usersData || [])
      } catch (error: any) {
        console.error('[SecuritySettings] Error loading users:', error)
        if (error.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente')
          navigate('/login')
        } else {
          toast.error('Error al cargar los usuarios')
        }
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [authLoading, isAuthenticated, user, currentTenant?.id, navigate])

  // Count users by role
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando configuración de seguridad...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/settings')}
            className="mb-4 gap-2"
          >
            <ArrowLeft size={20} />
            Volver a Configuración
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Configuración de Seguridad</h1>
            <p className="text-muted-foreground">
              Administra permisos, roles y políticas de seguridad
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Security Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
                <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Usuarios activos en {currentTenant?.name}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Roles Activos</CardTitle>
                <Shield className="h-5 w-5 text-secondary" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.keys(roleCounts).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Diferentes roles asignados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                <Lock className="h-5 w-5 text-success" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(roleCounts['tenant-admin'] || 0) + (roleCounts['super-admin'] || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Usuarios con permisos de administración
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Roles & Permissions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Shield className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-xl">Roles y Permisos</CardTitle>
                  <CardDescription>
                    Información sobre los roles disponibles y sus permisos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
                  <div
                    key={role}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold capitalize">{role.replace('-', ' ')}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {roleCounts[role] || 0} usuarios
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Policies */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-xl">Políticas de Seguridad</CardTitle>
                  <CardDescription>
                    Configuración de seguridad para tu organización
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">Autenticación de Dos Factores (2FA)</h3>
                      <p className="text-sm text-muted-foreground">
                        Requiere autenticación de dos factores para usuarios administrativos
                      </p>
                    </div>
                    <Badge variant="outline">Próximamente</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">Política de Contraseñas</h3>
                      <p className="text-sm text-muted-foreground">
                        Configura requisitos mínimos para contraseñas
                      </p>
                    </div>
                    <Badge variant="outline">Próximamente</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">Sesiones y Timeouts</h3>
                      <p className="text-sm text-muted-foreground">
                        Configura el tiempo de expiración de sesiones
                      </p>
                    </div>
                    <Badge variant="outline">Próximamente</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/settings')}
            >
              Volver a Configuración
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
