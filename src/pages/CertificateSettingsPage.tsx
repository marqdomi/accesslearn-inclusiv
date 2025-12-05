import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Palette } from 'lucide-react'
import { CertificateTemplateSettings } from '@/components/admin/CertificateTemplateSettings'

export function CertificateSettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        {/* Header */}
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
              Plantilla de Certificados
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Personaliza el diseño, colores y textos de los certificados de tu organización
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              💡 La información de la empresa (nombre y logo) se configura en{' '}
              <button
                onClick={() => navigate('/admin/settings/branding')}
                className="text-primary hover:underline font-medium"
              >
                Marca y Apariencia
              </button>
            </p>
          </div>
        </div>

        {/* Certificate Template Settings */}
        <CertificateTemplateSettings 
          onBack={() => navigate('/admin/settings')}
        />
      </div>
    </div>
  )
}

