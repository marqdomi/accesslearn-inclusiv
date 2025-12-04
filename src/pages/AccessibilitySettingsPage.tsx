import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AccessibilityProfileManagement } from '@/components/admin/AccessibilityProfileManagement'

export function AccessibilitySettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <div className="mb-4 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/settings')}
            className="mb-3 sm:mb-6 gap-2 touch-target"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Volver a Configuración</span>
            <span className="sm:hidden">Volver</span>
          </Button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">
              Accesibilidad e Inclusión
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
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

