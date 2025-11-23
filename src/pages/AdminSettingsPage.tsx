import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/contexts/TenantContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Palette,
  Bell,
  Shield,
  Database,
  ChevronRight,
  Info
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
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 gap-2"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Configuración</h1>
            <p className="text-muted-foreground">
              Administra la configuración de {currentTenant?.name}
            </p>
          </div>
        </motion.div>

        {/* Settings Grid */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
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
                  className="hover:shadow-md transition-shadow cursor-pointer group h-full"
                  onClick={section.onClick}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base leading-tight mb-1">
                          {section.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {section.description}
                        </CardDescription>
                      </div>
                      <ChevronRight 
                        className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" 
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
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Info className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <CardTitle className="text-xl">Información del Sistema</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Detalles técnicos de tu instancia de {currentTenant?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Tenant ID</p>
                  <p className="font-mono text-sm break-all">
                    {currentTenant?.id || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Slug</p>
                  <p className="font-mono text-sm">
                    {currentTenant?.slug || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Versión</p>
                  <p className="font-mono text-sm">1.0.0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
