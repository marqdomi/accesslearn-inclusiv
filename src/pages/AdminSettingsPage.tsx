import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/contexts/TenantContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Palette,
  Bell,
  Shield,
  Database
} from 'lucide-react'

interface SettingSection {
  id: string
  title: string
  description: string
  icon: any
  iconColor: string
  bgColor: string
  status: string
  onClick: () => void
}

export function AdminSettingsPage() {
  const navigate = useNavigate()
  const { currentTenant } = useTenant()

  const settingsSections: SettingSection[] = [
    {
      id: 'branding',
      title: 'Marco y Apariencia',
      description: 'Personaliza los colores, logo y nombre de tu organización',
      icon: Palette,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      status: 'Próximamente',
      onClick: () => {
        // TODO: Navigate to /admin/settings/branding
      }
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      description: 'Configura las notificaciones por email y push',
      icon: Bell,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      status: 'Próximamente',
      onClick: () => {
        // TODO: Navigate to /admin/settings/notifications
      }
    },
    {
      id: 'security',
      title: 'Seguridad',
      description: 'Administra permisos, roles y políticas de seguridad',
      icon: Shield,
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      status: 'Próximamente',
      onClick: () => {
        // TODO: Navigate to /admin/settings/security
      }
    },
    {
      id: 'data',
      title: 'Datos',
      description: 'Exporta, importa y administra los datos de tu organización',
      icon: Database,
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      status: 'Próximamente',
      onClick: () => {
        // TODO: Navigate to /admin/settings/data
      }
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4 gap-2"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </Button>

          <div>
            <h1 className="text-4xl font-bold mb-2">Configuración</h1>
            <p className="text-lg text-muted-foreground">
              Administra la configuración de {currentTenant?.name}
            </p>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {settingsSections.map((section) => {
            const Icon = section.icon
            return (
              <Card
                key={section.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={section.onClick}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${section.bgColor}`}>
                        <Icon className={`h-6 w-6 ${section.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-xs">
                    {section.status}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tenant ID</p>
                <p className="font-mono text-sm">{currentTenant?.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Slug</p>
                <p className="font-mono text-sm">{currentTenant?.slug}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Versión</p>
                <p className="font-mono text-sm">1.0.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
