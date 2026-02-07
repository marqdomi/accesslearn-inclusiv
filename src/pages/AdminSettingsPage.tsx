import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/contexts/TenantContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  Palette,
  Bell,
  Shield,
  Database,
  Tag,
  ChevronRight,
  Info,
  Users,
  Accessibility,
  Building2,
  Globe,
  Package,
  Award,
  FileText
} from 'lucide-react'

interface SettingSection {
  id: string
  title: string
  description: string
  icon: any
  onClick: () => void
}

export function AdminSettingsPage() {
  const navigate = useNavigate()
  const { currentTenant } = useTenant()

  const settingsSections: SettingSection[] = [
    {
      id: 'branding',
      title: 'Marca y Apariencia',
      description: 'Personaliza los colores, logo y nombre de tu organización',
      icon: Palette,
      onClick: () => {
        navigate('/admin/settings/branding')
      }
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Configura las notificaciones por email y push',
      icon: Bell,
      onClick: () => {
        navigate('/admin/settings/notifications')
      }
    },
    {
      id: 'security',
      title: 'Seguridad',
      description: 'Administra permisos, roles y políticas de seguridad',
      icon: Shield,
      onClick: () => {
        navigate('/admin/settings/security')
      }
    },
    {
      id: 'data',
      title: 'Datos',
      description: 'Exporta, importa y administra los datos de tu organización',
      icon: Database,
      onClick: () => {
        navigate('/admin/settings/data')
      }
    },
    {
      id: 'categories',
      title: 'Categorías',
      description: 'Gestiona las categorías de cursos disponibles en tu organización',
      icon: Tag,
      onClick: () => {
        navigate('/admin/settings/categories')
      }
    },
    {
      id: 'accessibility',
      title: 'Accesibilidad e Inclusión',
      description: 'Gestiona y personaliza los perfiles de accesibilidad para tu organización',
      icon: Accessibility,
      onClick: () => {
        navigate('/admin/settings/accessibility')
      }
    },
    {
      id: 'users',
      title: 'Usuarios',
      description: 'Administra usuarios, roles, permisos e invitaciones de tu organización',
      icon: Users,
      onClick: () => {
        navigate('/admin/users')
      }
    },
    {
      id: 'certificates',
      title: 'Certificados',
      description: 'Personaliza el diseño, colores y textos de las plantillas de certificados',
      icon: Award,
      onClick: () => {
        navigate('/admin/settings/certificates')
      }
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-4 sm:mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">Configuración</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Administra la configuración de {currentTenant?.name}
            </p>
          </div>
        </motion.div>

        {/* Settings Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 mb-4 sm:mb-8">
          {settingsSections.map((section, index) => {
            const Icon = section.icon
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <Card 
                  className="hover:shadow-md transition-shadow cursor-pointer group h-full touch-target"
                  onClick={section.onClick}
                >
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-base leading-tight mb-1">
                          {section.title}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {section.description}
                        </CardDescription>
                      </div>
                      <ChevronRight 
                        className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5 sm:mt-1" 
                        aria-hidden="true"
                      />
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* System Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.2 }}
        >
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-muted flex-shrink-0">
                  <Info className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-xl">Información del Sistema</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Detalles técnicos de tu instancia de {currentTenant?.name}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tenant Name */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Organización</p>
                  </div>
                  <div className="px-3 py-2.5 bg-muted/50 rounded-lg border">
                    <p className="text-xs sm:text-sm font-semibold">
                      {currentTenant?.name || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Tenant ID */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Tenant ID</p>
                  </div>
                  <div className="px-3 py-2.5 bg-muted/50 rounded-lg border">
                    <p className="text-xs sm:text-sm font-medium break-all">
                      {currentTenant?.id || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Slug</p>
                  </div>
                  <div className="px-3 py-2.5 bg-muted/50 rounded-lg border">
                    <p className="text-xs sm:text-sm font-medium">
                      {currentTenant?.slug || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Version */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Versión</p>
                  </div>
                  <div className="px-3 py-2.5 bg-primary/10 rounded-lg border border-primary/20">
                    <Badge variant="secondary" className="bg-primary/20 text-primary font-semibold text-xs sm:text-sm">
                      1.0.0
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
