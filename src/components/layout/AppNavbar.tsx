import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { TenantLogo } from '@/components/branding/TenantLogo'
import { TenantSwitcher } from '@/components/dashboard/TenantSwitcher'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  User,
  LogOut,
  Settings,
  Menu,
  Globe,
  Building2,
  Trophy,
  ChevronDown,
} from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

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

export function AppNavbar({ userXP = 0 }: AppNavbarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { currentTenant } = useTenant()
  const { i18n } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Calculate level from XP (simplified - adjust based on your gamification system)
  const calculateLevel = (xp: number): number => {
    // Simple calculation: 100 XP per level
    return Math.floor(xp / 100) + 1
  }

  const currentLevel = calculateLevel(userXP)
  const currentLanguage = i18n.language || 'es'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
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
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
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
                        navigate('/settings')
                        setMobileMenuOpen(false)
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
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
      </div>
    </header>
  )
}
