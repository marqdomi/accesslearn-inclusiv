import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  BookOpen,
  Library,
  Users,
  CheckCircle2,
  Calendar,
  ClipboardList,
  BarChart3,
  Settings,
} from 'lucide-react'
import { RequireRole } from '@/components/auth/RequireRole'
import { RequirePermission } from '@/components/auth/RequirePermission'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  badge?: number
  role?: string[]
  permission?: string
}

interface QuickActionsProps {
  notificationCounts?: {
    pendingRequests?: number
    acceptedSessions?: number
  }
}

export function QuickActions({ notificationCounts = {} }: QuickActionsProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const studentActions: QuickAction[] = [
    {
      id: 'catalog',
      label: 'Catálogo de Cursos',
      icon: BookOpen,
      onClick: () => navigate('/catalog'),
    },
    {
      id: 'library',
      label: 'Mi Biblioteca',
      icon: Library,
      onClick: () => navigate('/library'),
    },
    {
      id: 'mentors',
      label: 'Buscar Mentor',
      icon: Users,
      onClick: () => navigate('/mentors'),
    },
  ]

  const instructorActions: QuickAction[] = [
    {
      id: 'my-courses',
      label: 'Mis Cursos',
      icon: BookOpen,
      onClick: () => navigate('/my-courses'),
      role: ['super-admin', 'tenant-admin', 'content-manager', 'instructor'],
    },
  ]

  const adminActions: QuickAction[] = [
    {
      id: 'approve',
      label: 'Aprobar Cursos',
      icon: CheckCircle2,
      onClick: () => navigate('/content-manager'),
      role: ['super-admin', 'tenant-admin', 'content-manager'],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      onClick: () => navigate('/admin/analytics'),
      permission: 'analytics:view-all',
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      onClick: () => navigate('/admin/settings'),
      role: ['super-admin', 'tenant-admin'],
    },
  ]

  const mentorActions: QuickAction[] = [
    {
      id: 'mentor-dashboard',
      label: 'Mentorados',
      icon: Calendar,
      onClick: () => navigate('/mentor/dashboard'),
      badge: notificationCounts.pendingRequests,
    },
  ]

  const menteeActions: QuickAction[] = [
    {
      id: 'mentorships',
      label: 'Solicitudes',
      icon: ClipboardList,
      onClick: () => navigate('/my-mentorships'),
      badge: notificationCounts.acceptedSessions,
    },
  ]

  // Filter and organize actions based on user role
  // Group: Student actions first, then instructor, then admin, then mentor/mentee
  const allActions: QuickAction[] = [
    // Student actions (always visible)
    ...studentActions,
    // Instructor actions (if user has instructor role)
    ...instructorActions.filter(a => !a.role || a.role.includes(user?.role || '')),
    // Admin actions (if user has admin role) - Settings should be prominent
    ...adminActions
      .filter(a => {
        if (a.role && !a.role.includes(user?.role || '')) return false
        if (a.permission) return true // Will be handled by RequirePermission
        return true
      })
      .sort((a, b) => {
        // Put Settings first in admin actions
        if (a.id === 'settings') return -1
        if (b.id === 'settings') return 1
        return 0
      }),
    // Mentor/Mentee actions
    ...(user?.role === 'mentor' ? mentorActions : menteeActions),
  ]

  const ActionButton = ({ action }: { action: QuickAction }) => {
    const Icon = action.icon
    
    return (
      <Button
        variant="outline"
        className={cn(
          "h-auto py-4 sm:py-4 px-3 sm:px-4 flex flex-col items-center gap-2 relative min-w-[100px] sm:min-w-[120px]",
          "hover:bg-primary/5 hover:border-primary/50 transition-all touch-target"
        )}
        onClick={action.onClick}
      >
        <Icon className="h-5 w-5" />
        <span className="text-xs text-center leading-tight">{action.label}</span>
        {action.badge !== undefined && action.badge > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {action.badge}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      {/* Desktop: Grid - Improved layout with better spacing */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {allActions.map((action) => {
          // Handle role-based rendering
          if (action.role && !action.role.includes(user?.role || '')) {
            return null
          }
          
          if (action.permission) {
            return (
              <RequirePermission key={action.id} permission={action.permission}>
                <ActionButton action={action} />
              </RequirePermission>
            )
          }

          return <ActionButton key={action.id} action={action} />
        })}
      </div>

      {/* Mobile: Horizontal Scroll */}
      <ScrollArea className="md:hidden w-full">
        <div className="flex gap-3 pb-4">
          {allActions.map((action) => {
            if (action.role && !action.role.includes(user?.role || '')) {
              return null
            }
            
            if (action.permission) {
              return (
                <RequirePermission key={action.id} permission={action.permission}>
                  <ActionButton action={action} />
                </RequirePermission>
              )
            }

            return <ActionButton key={action.id} action={action} />
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

