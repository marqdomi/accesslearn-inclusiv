import { useState, useEffect } from 'react'
import { useCompanySettings } from '@/hooks/use-certificates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Certificate, Upload, ArrowLeft, Palette } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CompanySettingsProps {
  onBack?: () => void
  onNavigate?: (section: string) => void
}

export function CompanySettings({ onBack, onNavigate }: CompanySettingsProps) {
  const { companySettings, setCompanySettings, loading } = useCompanySettings()
  const [companyName, setCompanyName] = useState(companySettings.companyName || '')
  const [logoPreview, setLogoPreview] = useState(companySettings.companyLogo || '')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Update local state when companySettings changes
  useEffect(() => {
    if (companySettings) {
      setCompanyName(companySettings.companyName || '')
      setLogoPreview(companySettings.companyLogo || '')
    }
  }, [companySettings])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, sube un archivo de imagen')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB')
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setLogoPreview(dataUrl)
      setIsUploading(false)
      toast.success('Logo subido exitosamente')
    }

    reader.onerror = () => {
      setIsUploading(false)
      toast.error('Error al subir el logo')
    }

    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!companyName.trim()) {
      toast.error('El nombre de la empresa es requerido')
      return
    }

    setIsSaving(true)
    try {
      await setCompanySettings({
        companyName: companyName.trim(),
        companyLogo: logoPreview || undefined
      })
      toast.success('Configuración guardada exitosamente')
    } catch (error) {
      console.error('Error saving company settings:', error)
      toast.error('Error al guardar la configuración de la empresa')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Company Name */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-xl">Nombre de la Empresa</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            Este nombre aparecerá en todos los certificados emitidos
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="companyName" className="text-xs sm:text-sm">Nombre *</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ingresa el nombre de tu empresa"
              disabled={isSaving || loading}
              className="h-11 sm:h-12 text-sm sm:text-base touch-target"
            />
            <p className="text-xs text-muted-foreground">
              Este nombre se mostrará en todos los certificados
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Company Logo */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-xl">Logo de la Empresa</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            Sube un logo cuadrado. Este logo aparecerá en todos los certificados emitidos
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          {logoPreview && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg bg-muted/20">
              <img
                src={logoPreview}
                alt="Vista previa del logo"
                className="h-20 w-20 sm:h-24 sm:w-24 object-contain bg-background rounded border flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">Vista Previa del Logo</p>
                <p className="text-xs text-muted-foreground">
                  Este logo aparecerá en todos los certificados
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogoPreview('')}
                className="w-full sm:w-auto touch-target"
              >
                Eliminar
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                id="companyLogo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={isUploading}
                className="flex-1 touch-target cursor-pointer"
              />
              <Button
                variant="outline"
                size="default"
                disabled={isUploading}
                onClick={() => document.getElementById('companyLogo')?.click()}
                className="gap-2 touch-target"
              >
                <Upload size={18} />
                <span className="hidden sm:inline">Seleccionar Archivo</span>
                <span className="sm:hidden">Subir</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Sube un logo cuadrado (PNG, JPG). Tamaño máximo: 2MB. Recomendado: 500x500px
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <Certificate size={16} />
        <AlertDescription className="text-xs sm:text-sm">
          Estas configuraciones se aplican a todos los certificados. Los cambios afectarán a los nuevos certificados inmediatamente.
          Los certificados previamente emitidos permanecerán sin cambios.
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        {onNavigate && (
          <Button
            variant="outline"
            onClick={() => onNavigate('certificate-templates')}
            className="gap-2 touch-target w-full sm:w-auto"
          >
            <Palette size={18} />
            <span className="hidden sm:inline">Configurar Plantilla de Certificados</span>
            <span className="sm:hidden">Plantilla</span>
          </Button>
        )}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {onBack && (
            <Button 
              variant="outline" 
              onClick={onBack}
              className="touch-target w-full sm:w-auto"
            >
              Cancelar
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={isSaving || loading}
            className="touch-target w-full sm:w-auto"
          >
            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </div>
  )
}
