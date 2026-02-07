/**
 * CommandPalette - Cmd+K global search & navigation.
 *
 * Provides quick access to pages, actions, and recently viewed courses.
 */

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  PencilSimpleLine,
  CheckCircle,
  Moon,
  Sun,
} from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions, type Permission } from '@/hooks/use-permissions'
import { useTheme } from '@/contexts/ThemeContext'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CommandEntry {
  id: string
  label: string
  icon: React.ElementType
  action: () => void
  /** Show only for these roles. undefined = everyone */
  roles?: string[]
  permissions?: Permission[]
  keywords?: string
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hasAnyPermission } = usePermissions()
  const { theme, setTheme } = useTheme()
  const role = user?.role || 'student'

  // Keyboard shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  const go = useCallback(
    (path: string) => {
      onOpenChange(false)
      navigate(path)
    },
    [navigate, onOpenChange],
  )

  const canSee = (entry: CommandEntry) => {
    if (entry.roles && !entry.roles.includes(role)) return false
    if (entry.permissions && !hasAnyPermission(entry.permissions)) return false
    return true
  }

  const navigationEntries: CommandEntry[] = [
    { id: 'dashboard', label: 'Ir al Inicio', icon: House, action: () => go('/dashboard'), keywords: 'dashboard home inicio' },
    { id: 'catalog', label: 'Catálogo de Cursos', icon: MagnifyingGlass, action: () => go('/catalog'), keywords: 'catalog buscar explorar cursos' },
    { id: 'library', label: 'Mi Biblioteca', icon: Books, action: () => go('/library'), keywords: 'library biblioteca mis cursos progreso' },
    { id: 'mentors', label: 'Buscar Mentor', icon: Users, action: () => go('/mentors'), keywords: 'mentor buscar directorio' },
    { id: 'my-mentorships', label: 'Mis Mentorías', icon: Handshake, action: () => go('/my-mentorships'), keywords: 'mentorias sesiones' },
    { id: 'notifications', label: 'Notificaciones', icon: Bell, action: () => go('/notifications'), keywords: 'notificaciones avisos' },
    { id: 'profile', label: 'Mi Perfil', icon: UserCircle, action: () => go('/profile'), keywords: 'perfil cuenta usuario' },
  ]

  const contentEntries: CommandEntry[] = [
    { id: 'my-courses', label: 'Mis Cursos (Creados)', icon: PencilSimpleLine, action: () => go('/my-courses'), roles: ['super-admin', 'tenant-admin', 'content-manager', 'instructor'], keywords: 'mis cursos crear editar' },
    { id: 'content-manager', label: 'Aprobar Contenido', icon: CheckCircle, action: () => go('/content-manager'), roles: ['super-admin', 'tenant-admin', 'content-manager'], keywords: 'aprobar revisar contenido pendiente' },
    { id: 'mentor-dashboard', label: 'Dashboard de Mentor', icon: BookOpen, action: () => go('/mentor/dashboard'), roles: ['super-admin', 'tenant-admin', 'mentor'], keywords: 'mentor panel sesiones' },
  ]

  const adminEntries: CommandEntry[] = [
    { id: 'admin-users', label: 'Gestión de Usuarios', icon: Users, action: () => go('/admin/users'), roles: ['super-admin', 'tenant-admin'], keywords: 'usuarios administrar crear invitar' },
    { id: 'admin-analytics', label: 'Analytics', icon: ChartBar, action: () => go('/admin/analytics'), permissions: ['analytics:view-all'], keywords: 'analytics reportes estadísticas' },
    { id: 'admin-settings', label: 'Configuración', icon: Gear, action: () => go('/admin/settings'), roles: ['super-admin', 'tenant-admin'], keywords: 'configuracion ajustes marca notificaciones seguridad' },
  ]

  const actionEntries: CommandEntry[] = [
    {
      id: 'toggle-theme',
      label: theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
        onOpenChange(false)
      },
      keywords: 'tema theme dark light oscuro claro',
    },
  ]

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Paleta de Comandos"
      description="Busca páginas, acciones y más..."
    >
      <CommandInput placeholder="¿A dónde quieres ir?" />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>

        <CommandGroup heading="Navegación">
          {navigationEntries.filter(canSee).map((entry) => (
            <CommandItem key={entry.id} onSelect={entry.action} keywords={[entry.keywords || '']}>
              <entry.icon className="mr-2 h-4 w-4" />
              <span>{entry.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {contentEntries.filter(canSee).length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Contenido">
              {contentEntries.filter(canSee).map((entry) => (
                <CommandItem key={entry.id} onSelect={entry.action} keywords={[entry.keywords || '']}>
                  <entry.icon className="mr-2 h-4 w-4" />
                  <span>{entry.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {adminEntries.filter(canSee).length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Administración">
              {adminEntries.filter(canSee).map((entry) => (
                <CommandItem key={entry.id} onSelect={entry.action} keywords={[entry.keywords || '']}>
                  <entry.icon className="mr-2 h-4 w-4" />
                  <span>{entry.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Acciones">
          {actionEntries.map((entry) => (
            <CommandItem key={entry.id} onSelect={entry.action} keywords={[entry.keywords || '']}>
              <entry.icon className="mr-2 h-4 w-4" />
              <span>{entry.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
