/**
 * AppShell - Persistent layout shell for all tenant pages.
 *
 * Provides a collapsible sidebar, top bar with breadcrumbs/notifications/user,
 * and an <Outlet /> for nested route content.
 */

import { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PageTransition } from './PageTransition'
import { useTranslation } from 'react-i18next'
import {
  House,
  Books,
  MagnifyingGlass,
  BookOpen,
  Users,
  Handshake,
  ChartBar,
  Gear,
  Bell,
  UserCircle,
  SignOut,
  Check,
  CaretRight,
  PencilSimpleLine,
  CheckCircle,
  Command,
  Trophy,
  Buildings,
  Globe,
  Wheelchair,
} from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { useNotifications } from '@/hooks/use-notifications'
import { usePermissions, type Permission } from '@/hooks/use-permissions'
import { TenantLogo } from '@/components/branding/TenantLogo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { TenantSwitcher } from '@/components/dashboard/TenantSwitcher'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { useAccessibility } from '@/contexts/AccessibilityContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import type { UserNotification } from '@/lib/types'

/* ─── Breadcrumb name map ──────────────────────────────────── */

const breadcrumbNameMap: Record<string, string> = {
  dashboard: 'Inicio',
  library: 'Mi Biblioteca',
  catalog: 'Catálogo',
  mentors: 'Mentores',
  'my-courses': 'Mis Cursos',
  'my-mentorships': 'Mis Mentorías',
  'content-manager': 'Gestor de Contenido',
  mentor: 'Mentor',
  notifications: 'Notificaciones',
  profile: 'Mi Perfil',
  admin: 'Administración',
  settings: 'Configuración',
  branding: 'Marca',
  security: 'Seguridad',
  accessibility: 'Accesibilidad',
  data: 'Datos',
  categories: 'Categorías',
  certificates: 'Certificados',
  users: 'Usuarios',
  analytics: 'Analytics',
}

/* ─── Role helpers ──────────────────────────────────────────── */

function getRoleColor(role: string) {
  switch (role) {
    case 'super-admin': return 'text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-800 dark:bg-red-950'
    case 'tenant-admin': return 'text-purple-600 border-purple-200 bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:bg-purple-950'
    case 'content-manager': return 'text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:bg-blue-950'
    case 'instructor': return 'text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950'
    case 'mentor': return 'text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:bg-amber-950'
    default: return 'text-gray-600 border-gray-200 bg-gray-50 dark:text-gray-400 dark:border-gray-800 dark:bg-gray-950'
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'super-admin': return 'Super Admin'
    case 'tenant-admin': return 'Admin'
    case 'content-manager': return 'Gestor'
    case 'instructor': return 'Instructor'
    case 'mentor': return 'Mentor'
    case 'student': return 'Estudiante'
    default: return role
  }
}

/* ─── Navigation definition ─────────────────────────────────── */

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
  /** Show only for these roles. undefined = everyone */
  roles?: string[]
  /** Show only if user has any of these permissions */
  permissions?: Permission[]
}

function useNavItems(unreadCount: number) {
  const { user } = useAuth()
  const { hasAnyPermission } = usePermissions()
  const role = user?.role || 'student'

  return useMemo(() => {
    const mainItems: NavItem[] = [
      { label: 'Inicio', href: '/dashboard', icon: House },
      { label: 'Catálogo', href: '/catalog', icon: MagnifyingGlass },
      { label: 'Mi Biblioteca', href: '/library', icon: Books },
      { label: 'Notificaciones', href: '/notifications', icon: Bell, badge: unreadCount || undefined },
    ]

    const contentItems: NavItem[] = [
      {
        label: 'Mis Cursos',
        href: '/my-courses',
        icon: PencilSimpleLine,
        roles: ['super-admin', 'tenant-admin', 'content-manager', 'instructor'],
      },
      {
        label: 'Aprobar Contenido',
        href: '/content-manager',
        icon: CheckCircle,
        roles: ['super-admin', 'tenant-admin', 'content-manager'],
      },
    ]

    const mentorshipItems: NavItem[] = [
      { label: 'Buscar Mentor', href: '/mentors', icon: Users },
      { label: 'Mis Mentorías', href: '/my-mentorships', icon: Handshake },
      {
        label: 'Dashboard Mentor',
        href: '/mentor/dashboard',
        icon: BookOpen,
        roles: ['super-admin', 'tenant-admin', 'mentor'],
      },
    ]

    const adminItems: NavItem[] = [
      {
        label: 'Usuarios',
        href: '/admin/users',
        icon: Users,
        roles: ['super-admin', 'tenant-admin'],
      },
      {
        label: 'Analytics',
        href: '/admin/analytics',
        icon: ChartBar,
        permissions: ['analytics:view-all'],
      },
      {
        label: 'Configuración',
        href: '/admin/settings',
        icon: Gear,
        roles: ['super-admin', 'tenant-admin'],
      },
    ]

    const canSee = (item: NavItem) => {
      if (item.roles && !item.roles.includes(role)) return false
      if (item.permissions && !hasAnyPermission(item.permissions)) return false
      return true
    }

    return {
      main: mainItems.filter(canSee),
      content: contentItems.filter(canSee),
      mentorship: mentorshipItems.filter(canSee),
      admin: adminItems.filter(canSee),
    }
  }, [role, unreadCount, hasAnyPermission])
}

/* ─── AppSidebar ────────────────────────────────────────────── */

function AppSidebar() {
  const { user, logout } = useAuth()
  const { currentTenant } = useTenant()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user?.id || '')

  const navGroups = useNavItems(unreadCount)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(href)
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      {/* ─ Header ─ */}
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <TenantLogo size="md" className="flex-shrink-0" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <h1 className="text-sm font-bold truncate">
              {currentTenant?.name || 'AccessLearn'}
            </h1>
            <p className="text-[11px] text-muted-foreground truncate">
              Plataforma de Aprendizaje
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <Separator />

      {/* ─ Content ─ */}
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navGroups.main.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link to={item.href}>
                      <item.icon weight={isActive(item.href) ? 'fill' : 'regular'} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge ? (
                    <SidebarMenuBadge>{item.badge > 9 ? '9+' : item.badge}</SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Management */}
        {navGroups.content.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Contenido</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navGroups.content.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                    >
                      <Link to={item.href}>
                        <item.icon weight={isActive(item.href) ? 'fill' : 'regular'} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Mentorship */}
        <SidebarGroup>
          <SidebarGroupLabel>Mentoría</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navGroups.mentorship.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link to={item.href}>
                      <item.icon weight={isActive(item.href) ? 'fill' : 'regular'} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin */}
        {navGroups.admin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navGroups.admin.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                    >
                      <Link to={item.href}>
                        <item.icon weight={isActive(item.href) ? 'fill' : 'regular'} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* ─ Footer: User ─ */}
      <SidebarFooter className="p-2">
        <SidebarMenu>
          {/* Accessibility button */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Accesibilidad"
              onClick={() => {
                const event = new CustomEvent('open-accessibility-sheet')
                window.dispatchEvent(event)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Wheelchair weight="regular" />
              <span>Accesibilidad</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* User dropdown */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="h-5 w-5 text-primary" weight="fill" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-64"
                side="top"
                align="start"
                sideOffset={8}
              >
                {/* User Header */}
                <DropdownMenuLabel className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UserCircle className="h-6 w-6 text-primary" weight="fill" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0 ${getRoleColor(user?.role || '')}`}
                        >
                          {getRoleLabel(user?.role || '')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Profile */}
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>

                {/* Theme */}
                <div className="px-2 py-1">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm text-muted-foreground">Tema</span>
                    <ThemeToggle className="h-8 w-8" />
                  </div>
                </div>

                <DropdownMenuSeparator />

                {/* XP */}
                <div className="px-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" weight="fill" />
                    <span className="text-xs font-medium text-muted-foreground">Progreso</span>
                  </div>
                  <LevelBadge xp={0} size="sm" showProgress />
                </div>

                <DropdownMenuSeparator />

                {/* Org */}
                <div className="px-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Buildings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Organización</span>
                  </div>
                  <TenantSwitcher />
                </div>

                <DropdownMenuSeparator />

                {/* Language */}
                <div className="px-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Idioma</span>
                  </div>
                  <LanguageSwitcher variant="ghost" showLabel />
                </div>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <SignOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

/* ─── TopBar ────────────────────────────────────────────────── */

function TopBar({ onOpenCommandPalette }: { onOpenCommandPalette: () => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user?.id || '')

  const [notificationsOpen, setNotificationsOpen] = useState(false)

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
        segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      return { label, href: pathAccumulator, isLast: index === segments.length - 1 }
    })
  }, [location.pathname])

  const notificationItems = notifications.slice(0, 5)

  const handleNotificationClick = async (notification: UserNotification) => {
    try {
      if (!notification.read) await markAsRead(notification.id)
      setNotificationsOpen(false)
      if (notification.actionUrl) navigate(notification.actionUrl)
    } catch (error) {
      console.error('Error handling notification click:', error)
    }
  }

  const formatNotificationTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString(i18n.language, { dateStyle: 'short', timeStyle: 'short' })
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <SidebarTrigger className="-ml-1" />

      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Breadcrumbs */}
      <Breadcrumb className="hidden sm:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((crumb) => (
            <BreadcrumbItem key={crumb.href}>
              <BreadcrumbSeparator />
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Command Palette Trigger */}
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex items-center gap-2 text-muted-foreground text-xs h-8 px-3"
        onClick={onOpenCommandPalette}
      >
        <Command className="h-3.5 w-3.5" />
        <span>Buscar...</span>
        <kbd className="pointer-events-none ml-1 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Notifications */}
      {user?.id && (
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" weight={unreadCount > 0 ? 'fill' : 'regular'} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[1rem] px-1 rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground flex items-center justify-center">
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
                  try { await markAllAsRead() } catch (e) { console.error(e) }
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
                        {notification.titleKey
                          ? t(notification.titleKey, notification.messageParams)
                          : notification.title || 'Actualización'}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.messageKey
                          ? t(notification.messageKey, notification.messageParams)
                          : notification.message || 'Revisa los detalles'}
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

      {/* Theme Toggle */}
      <ThemeToggle className="h-8 w-8" />
    </header>
  )
}

/* ─── AppShell (default export) ─────────────────────────────── */

export function AppShell() {
  const [commandOpen, setCommandOpen] = useState(false)
  const location = useLocation()
  const { setIsOpen: setAccessibilityOpen } = useAccessibility()

  // Listen for sidebar accessibility button clicks
  useEffect(() => {
    const handler = () => setAccessibilityOpen(true)
    window.addEventListener('open-accessibility-sheet', handler)
    return () => window.removeEventListener('open-accessibility-sheet', handler)
  }, [setAccessibilityOpen])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar onOpenCommandPalette={() => setCommandOpen(true)} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </SidebarInset>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  )
}
