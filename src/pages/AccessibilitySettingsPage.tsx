import { AccessibilityProfileManagement } from '@/components/admin/AccessibilityProfileManagement'

export function AccessibilitySettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <div className="mb-4 sm:mb-8">
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

