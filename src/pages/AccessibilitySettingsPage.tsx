import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AccessibilityProfileManagement } from '@/components/admin/AccessibilityProfileManagement'

export function AccessibilitySettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/settings')}
            className="mb-6 gap-2"
          >
            <ArrowLeft size={20} />
            Volver a Configuración
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Accesibilidad e Inclusión
            </h1>
            <p className="text-muted-foreground">
              Gestiona y personaliza los perfiles de accesibilidad disponibles para los usuarios de tu organización.
              Los usuarios finales solo verán los perfiles que actives aquí.
            </p>
          </div>
        </div>

        <AccessibilityProfileManagement />
      </div>
    </div>
  )
}

