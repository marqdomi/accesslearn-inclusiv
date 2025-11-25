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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  User,
  LogOut,
  Settings,
  Menu,
  X,
  Bell,
} from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const userMenuItems = (
    <>
      <DropdownMenuItem onClick={() => navigate('/profile')}>
        <User className="mr-2 h-4 w-4" />
        Mi Perfil
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigate('/settings')}>
        <Settings className="mr-2 h-4 w-4" />
        Configuración
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar Sesión
      </DropdownMenuItem>
    </>
  )

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

          {/* Right: Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {/* Language Switcher */}
            <LanguageSwitcher variant="outline" />
            
            {/* Level Badge */}
            <LevelBadge xp={userXP} size="sm" />
            
            {/* Tenant Switcher */}
            <TenantSwitcher />
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-9 px-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left min-w-0 hidden lg:block">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate max-w-[120px]">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRoleColor(user?.role || '')}`}
                        >
                          {getRoleLabel(user?.role || '')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userMenuItems}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile: Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher variant="ghost" showLabel={false} />
            <LevelBadge xp={userXP} size="sm" />
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

