import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { TenantLogo } from '@/components/branding/TenantLogo'
import { TenantSwitcher } from '@/components/dashboard/TenantSwitcher'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { useNotifications } from '@/hooks/use-notifications'
import { usePermissions, type Permission } from '@/hooks/use-permissions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  User,
  LogOut,
  Settings,
  Menu,
  Globe,
  Building2,
  Trophy,
  Bell,
  Check,
  ChevronRight,
} from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import type { UserNotification } from '@/lib/types'
import { toast } from 'sonner'

function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    'super-admin': 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    'admin': 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    'instructor': 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20',
    'mentor': 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
    'student': 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20',
  }
  return colors[role] || colors['student']
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    'super-admin': 'Super Admin',
    'admin': 'Administrador',
    'instructor': 'Instructor',
    'mentor': 'Mentor',
    'student': 'Estudiante',
  }
  return labels[role] || role
}

interface AppNavbarProps {
  userXP?: number
}

const breadcrumbNameMap: Record<string, string> = {
  dashboard: 'Dashboard',
  catalog: 'Catálogo de Cursos',
  courses: 'Cursos',
  library: 'Mi Biblioteca',
  mentors: 'Mentores',
  'my-mentorships': 'Mis Mentorías',
  'content-manager': 'Gestor de Contenido',
  analytics: 'Analytics',
  admin: 'Administración',
  settings: 'Configuración',
  profile: 'Perfil',
  notifications: 'Notificaciones',
  accessibility: 'Accesibilidad',
}

const SETTINGS_PERMISSIONS: Permission[] = [
  'settings:branding',
  'settings:notifications',
  'settings:integrations',
  'settings:languages',
  'settings:compliance',
]

export function AppNavbar({ userXP = 0 }: AppNavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { currentTenant } = useTenant()
  const { i18n } = useTranslation()
  const { hasAnyPermission } = usePermissions()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user?.id || '')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    if (
      segments.length === 0 ||
      (segments.length === 1 && (segments[0] === 'dashboard' || segments[0] === ''))
    ) {
      return []
    }

    let pathAccumulator = ''
    return segments.map((segment, index) => {
      pathAccumulator += `/${segment}`
      const label =
        breadcrumbNameMap[segment] ||
        segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase())
      return {
        label,
        href: pathAccumulator,
        isLast: index === segments.length - 1,
      }
    })
  }, [location.pathname])

  const notificationItems = notifications.slice(0, 5)
  const canAccessSettings = hasAnyPermission(SETTINGS_PERMISSIONS as unknown as string[])

  const handleNotificationClick = async (notification: UserNotification) => {
    try {
      if (!notification.read) {
        await markAsRead(notification.id)
      }
      setNotificationsOpen(false)
      if (notification.actionUrl) {
        navigate(notification.actionUrl)
      }
    } catch (error) {
      console.error('Error handling notification click:', error)
    }
  }

  const formatNotificationTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString(i18n.language, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  const handleSettingsAccess = () => {
    if (canAccessSettings) {
      navigate('/admin/settings')
    } else {
      toast.error('No tienes permisos para acceder a Configuración')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-2">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo and Tenant Name */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <TenantLogo size="md" className="flex-shrink-0" />
            <div className="min-w-0 hidden sm:block">
              <h1 className="text-lg font-bold truncate">
                {currentTenant?.name || 'Kaido'}
              </h1>
              <p className="text-xs text-muted-foreground hidden md:block">
                Plataforma de Aprendizaje
              </p>
            </div>
          </div>

          {/* Right: Desktop Actions - Simplified */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {user?.id && (
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    <span className="sr-only">Notificaciones</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="px-4 py-3 border-b flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">Notificaciones</p>
                      <p className="text-xs text-muted-foreground">
                        {unreadCount > 0 ? `${unreadCount} pendientes` : 'Estás al día'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={async () => {
                        try {
                          await markAllAsRead()
                        } catch (error) {
                          console.error('Error marking all as read:', error)
                        }
                      }}
                      disabled={!unreadCount}
                    >
                      <Check className="h-3 w-3" />
                      Marcar todo
                    </Button>
                  </div>
                  <ScrollArea className="max-h-80">
                    {notificationsLoading ? (
                      <div className="p-4 space-y-3">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-3 w-1/2" />
                              <Skeleton className="h-3 w-3/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : notificationItems.length === 0 ? (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        No tienes notificaciones recientes
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notificationItems.map((notification) => (
                          <button
                            key={notification.id}
                            className={`w-full text-left px-4 py-3 transition hover:bg-muted/80 ${
                              notification.read ? 'bg-transparent' : 'bg-primary/5'
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <p className="text-sm font-medium line-clamp-1">
                              {notification.title || 'Actualización'}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.message || 'Revisa los detalles'}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {formatNotificationTime(notification.timestamp)}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  <div className="px-4 py-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center text-xs"
                      onClick={() => {
                        setNotificationsOpen(false)
                        navigate('/notifications')
                      }}
                    >
                      Ver todas las notificaciones
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Menu - Only Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-9 w-9 rounded-full p-0 hover:bg-primary/10"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="sr-only">Menú de usuario</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {/* User Info Header */}
                <DropdownMenuLabel className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRoleColor(user?.role || '')}`}
                        >
                          {getRoleLabel(user?.role || '')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Profile Actions */}
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettingsAccess}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                  {!canAccessSettings && (
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      Sin acceso
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Level/XP Section */}
                <div className="px-2 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Nivel y Progreso
                    </span>
                  </div>
                  <div className="pl-6">
                    <LevelBadge xp={userXP} size="sm" showProgress={true} />
                  </div>
                </div>
                <DropdownMenuSeparator />

                {/* Organization Section */}
                <div className="px-2 py-1.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Organización
                    </span>
                  </div>
                  <div className="pl-6">
                    <TenantSwitcher />
                  </div>
                </div>
                <DropdownMenuSeparator />

                {/* Language Section */}
                <div className="px-2 py-1.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Idioma
                    </span>
                  </div>
                  <div className="pl-6">
                    <LanguageSwitcher variant="ghost" showLabel={true} />
                  </div>
                </div>
                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile: Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <TenantLogo size="md" />
                    <div>
                      <h2 className="text-lg font-bold">
                        {currentTenant?.name || 'Kaido'}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Plataforma de Aprendizaje
                      </p>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRoleColor(user?.role || '')}`}
                        >
                          {getRoleLabel(user?.role || '')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Level Badge */}
                  <div className="flex justify-center">
                    <LevelBadge xp={userXP} size="md" />
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    {/* Tenant Switcher */}
                    <div className="px-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Organización
                      </p>
                      <TenantSwitcher />
                    </div>

                    {/* Language Switcher */}
                    <div className="px-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Idioma
                      </p>
                      <LanguageSwitcher variant="outline" showLabel={true} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-4 space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/notifications')
                        setMobileMenuOpen(false)
                      }}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Notificaciones
                      {unreadCount > 0 && (
                        <Badge className="ml-auto" variant="destructive">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/profile')
                        setMobileMenuOpen(false)
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        handleSettingsAccess()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                      {!canAccessSettings && (
                        <Badge variant="outline" className="ml-auto text-[10px]">
                          Sin acceso
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 dark:text-red-400"
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {breadcrumbs.length > 0 && (
          <nav className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Inicio
            </Link>
            {breadcrumbs.map((crumb) => (
              <div key={crumb.href} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                {crumb.isLast ? (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                ) : (
                  <Link to={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
