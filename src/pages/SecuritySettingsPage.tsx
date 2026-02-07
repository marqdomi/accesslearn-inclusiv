import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Users, Lock, Eye } from 'lucide-react'
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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Configuración de Seguridad</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Administra permisos, roles y políticas de seguridad
            </p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Security Overview */}
          <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Total de Usuarios</CardTitle>
                <Users className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{users.length}</div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                  Usuarios activos en {currentTenant?.name}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Roles Activos</CardTitle>
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-secondary flex-shrink-0" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  {Object.keys(roleCounts).length}
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                  Diferentes roles asignados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Administradores</CardTitle>
                <Lock className="h-4 w-4 md:h-5 md:w-5 text-success flex-shrink-0" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  {(roleCounts['tenant-admin'] || 0) + (roleCounts['super-admin'] || 0)}
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                  Usuarios con permisos de administración
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Roles & Permissions */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-muted flex-shrink-0">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-xl">Roles y Permisos</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Información sobre los roles disponibles y sus permisos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
                  <div
                    key={role}
                    className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer touch-target"
                    onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                          <h3 className="text-xs sm:text-sm font-semibold capitalize">{role.replace('-', ' ')}</h3>
                          <Badge variant="secondary" className="text-[10px] sm:text-xs">
                            {roleCounts[role] || 0} usuarios
                          </Badge>
                        </div>
                        <p className="text-[10px] sm:text-sm text-muted-foreground">{description}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="flex-shrink-0 touch-target">
                        <Eye size={14} className="sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Policies */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-muted flex-shrink-0">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-xl">Políticas de Seguridad</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Configuración de seguridad para tu organización
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold mb-1">Autenticación de Dos Factores (2FA)</h3>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">
                        Requiere autenticación de dos factores para usuarios administrativos
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">Próximamente</Badge>
                  </div>
                </div>

                <div className="p-3 sm:p-4 border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold mb-1">Política de Contraseñas</h3>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">
                        Configura requisitos mínimos para contraseñas
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">Próximamente</Badge>
                  </div>
                </div>

                <div className="p-3 sm:p-4 border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold mb-1">Sesiones y Timeouts</h3>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">
                        Configura el tiempo de expiración de sesiones
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">Próximamente</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end pt-3 sm:pt-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/settings')}
              className="touch-target text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Volver a Configuración</span>
              <span className="sm:hidden">Volver</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
