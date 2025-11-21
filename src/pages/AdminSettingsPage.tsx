import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTenant } from '@/contexts/TenantContext'
import { Settings, Palette, Bell, Shield, Database } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

export function AdminSettingsPage() {
  const { currentTenant } = useTenant()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            ← Volver al Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-2">
            Administra la configuración de {currentTenant?.name}
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Branding */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-600" />
                <CardTitle>Marca y Apariencia</CardTitle>
              </div>
              <CardDescription>
                Personaliza los colores, logo y nombre de tu organización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-600" />
                <CardTitle>Notificaciones</CardTitle>
              </div>
              <CardDescription>
                Configura las notificaciones por email y push
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <CardTitle>Seguridad</CardTitle>
              </div>
              <CardDescription>
                Administra permisos, roles y políticas de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>

          {/* Data */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                <CardTitle>Datos</CardTitle>
              </div>
              <CardDescription>
                Exporta, importa y administra los datos de tu organización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="font-medium text-gray-500">Tenant ID</dt>
                <dd className="mt-1 text-gray-900">{currentTenant?.id}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Slug</dt>
                <dd className="mt-1 text-gray-900">{currentTenant?.slug}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Versión</dt>
                <dd className="mt-1 text-gray-900">1.0.0</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
