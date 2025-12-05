import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Certificate, ArrowLeft, Palette, TextT, SquaresFour, Eye } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'

interface CertificateTemplateSettingsProps {
  onBack: () => void
}

interface CertificateTemplate {
  id: string
  tenantId: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  secondaryTextColor: string
  titleFont: string
  nameFont: string
  bodyFont: string
  titleFontSize: number
  nameFontSize: number
  bodyFontSize: number
  borderWidth: number
  borderStyle: 'solid' | 'double' | 'gradient'
  showDecorativeGradient: boolean
  logoSize: number
  certificateTitle: string
  awardedToText: string
  completionText: string
  signatureText: string
}

export function CertificateTemplateSettings({ onBack }: CertificateTemplateSettingsProps) {
  const { currentTenant } = useTenant()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [template, setTemplate] = useState<CertificateTemplate | null>(null)

  useEffect(() => {
    loadTemplate()
  }, [])

  const loadTemplate = async () => {
    try {
      setLoading(true)
      const data = await ApiService.getCertificateTemplate()
      
      // If no template exists or template has English defaults, apply Spanish defaults
      if (!data || !data.certificateTitle || data.certificateTitle === 'Certificate of Completion') {
        const defaultTemplate: CertificateTemplate = {
          id: currentTenant?.id || '',
          tenantId: currentTenant?.id || '',
          primaryColor: data?.primaryColor || '#8B5CF6',
          secondaryColor: data?.secondaryColor || '#D8B4FE',
          accentColor: data?.accentColor || '#8B5CF6',
          textColor: data?.textColor || '#1a1a1a',
          secondaryTextColor: data?.secondaryTextColor || '#666666',
          titleFont: data?.titleFont || 'Poppins',
          nameFont: data?.nameFont || 'Poppins',
          bodyFont: data?.bodyFont || 'Poppins',
          titleFontSize: data?.titleFontSize || 80,
          nameFontSize: data?.nameFontSize || 72,
          bodyFontSize: data?.bodyFontSize || 40,
          borderWidth: data?.borderWidth || 8,
          borderStyle: data?.borderStyle || 'solid',
          showDecorativeGradient: data?.showDecorativeGradient !== undefined ? data.showDecorativeGradient : true,
          logoSize: data?.logoSize || 120,
          certificateTitle: data?.certificateTitle || 'Certificado de Completación',
          awardedToText: data?.awardedToText || 'Este certificado se otorga a',
          completionText: data?.completionText || 'por la completación exitosa de',
          signatureText: data?.signatureText || 'Firma Autorizada',
          createdAt: data?.createdAt || new Date().toISOString(),
          updatedAt: data?.updatedAt || new Date().toISOString(),
        }
        setTemplate(defaultTemplate)
      } else {
        setTemplate(data)
      }
    } catch (error) {
      console.error('Error loading certificate template:', error)
      // Set default Spanish template on error
      const defaultTemplate: CertificateTemplate = {
        id: currentTenant?.id || '',
        tenantId: currentTenant?.id || '',
        primaryColor: '#8B5CF6',
        secondaryColor: '#D8B4FE',
        accentColor: '#8B5CF6',
        textColor: '#1a1a1a',
        secondaryTextColor: '#666666',
        titleFont: 'Poppins',
        nameFont: 'Poppins',
        bodyFont: 'Poppins',
        titleFontSize: 80,
        nameFontSize: 72,
        bodyFontSize: 40,
        borderWidth: 8,
        borderStyle: 'solid',
        showDecorativeGradient: true,
        logoSize: 120,
        certificateTitle: 'Certificado de Completación',
        awardedToText: 'Este certificado se otorga a',
        completionText: 'por la completación exitosa de',
        signatureText: 'Firma Autorizada',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setTemplate(defaultTemplate)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!template) return

    setSaving(true)
    try {
      await ApiService.updateCertificateTemplate(template)
      toast.success('Plantilla de certificados guardada exitosamente')
    } catch (error) {
      console.error('Error saving certificate template:', error)
      toast.error('Error al guardar la plantilla')
    } finally {
      setSaving(false)
    }
  }

  const updateTemplate = (updates: Partial<CertificateTemplate>) => {
    if (template) {
      setTemplate({ ...template, ...updates })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground">Cargando configuración de certificados...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            No se pudo cargar la plantilla. Por favor intenta recargar la página.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
        {onBack && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="gap-2 touch-target w-full sm:w-auto"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Volver</span>
            <span className="sm:hidden">Volver</span>
          </Button>
        )}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="touch-target w-full sm:w-auto"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Colors Section */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-xl flex items-center gap-2">
                <Palette size={18} className="sm:w-5 sm:h-5" />
                Colores
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Personaliza los colores del certificado
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-xs sm:text-sm">Color Principal</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={template.primaryColor}
                      onChange={(e) => updateTemplate({ primaryColor: e.target.value })}
                      className="w-16 h-10 sm:w-20 touch-target"
                    />
                    <Input
                      type="text"
                      value={template.primaryColor}
                      onChange={(e) => updateTemplate({ primaryColor: e.target.value })}
                      placeholder="#8B5CF6"
                      className="flex-1 touch-target text-sm sm:text-base"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Bordes y título</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" className="text-xs sm:text-sm">Color Secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={template.secondaryColor}
                      onChange={(e) => updateTemplate({ secondaryColor: e.target.value })}
                      className="w-16 h-10 sm:w-20 touch-target"
                    />
                    <Input
                      type="text"
                      value={template.secondaryColor}
                      onChange={(e) => updateTemplate({ secondaryColor: e.target.value })}
                      placeholder="#D8B4FE"
                      className="flex-1 touch-target text-sm sm:text-base"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Bordes secundarios</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor" className="text-xs sm:text-sm">Color de Acento</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={template.accentColor}
                      onChange={(e) => updateTemplate({ accentColor: e.target.value })}
                      className="w-16 h-10 sm:w-20 touch-target"
                    />
                    <Input
                      type="text"
                      value={template.accentColor}
                      onChange={(e) => updateTemplate({ accentColor: e.target.value })}
                      placeholder="#8B5CF6"
                      className="flex-1 touch-target text-sm sm:text-base"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Elementos destacados</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textColor" className="text-xs sm:text-sm">Color de Texto Principal</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      value={template.textColor}
                      onChange={(e) => updateTemplate({ textColor: e.target.value })}
                      className="w-16 h-10 sm:w-20 touch-target"
                    />
                    <Input
                      type="text"
                      value={template.textColor}
                      onChange={(e) => updateTemplate({ textColor: e.target.value })}
                      placeholder="#1a1a1a"
                      className="flex-1 touch-target text-sm sm:text-base"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Nombre del usuario</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryTextColor" className="text-xs sm:text-sm">Color de Texto Secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryTextColor"
                      type="color"
                      value={template.secondaryTextColor}
                      onChange={(e) => updateTemplate({ secondaryTextColor: e.target.value })}
                      className="w-16 h-10 sm:w-20 touch-target"
                    />
                    <Input
                      type="text"
                      value={template.secondaryTextColor}
                      onChange={(e) => updateTemplate({ secondaryTextColor: e.target.value })}
                      placeholder="#666666"
                      className="flex-1 touch-target text-sm sm:text-base"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Texto descriptivo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography Section */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-xl flex items-center gap-2">
                <TextT size={18} className="sm:w-5 sm:h-5" />
                Tipografía
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Configura las fuentes y tamaños del texto
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titleFont" className="text-xs sm:text-sm">Fuente del Título</Label>
                  <Select
                    value={template.titleFont}
                    onValueChange={(value) => updateTemplate({ titleFont: value })}
                  >
                    <SelectTrigger id="titleFont" className="touch-target h-11 sm:h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titleFontSize" className="text-xs sm:text-sm">Tamaño del Título</Label>
                  <Input
                    id="titleFontSize"
                    type="number"
                    min={40}
                    max={120}
                    value={template.titleFontSize}
                    onChange={(e) => updateTemplate({ titleFontSize: parseInt(e.target.value) || 80 })}
                    className="touch-target h-11 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameFont" className="text-xs sm:text-sm">Fuente del Nombre</Label>
                  <Select
                    value={template.nameFont}
                    onValueChange={(value) => updateTemplate({ nameFont: value })}
                  >
                    <SelectTrigger id="nameFont" className="touch-target h-11 sm:h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameFontSize" className="text-xs sm:text-sm">Tamaño del Nombre</Label>
                  <Input
                    id="nameFontSize"
                    type="number"
                    min={40}
                    max={120}
                    value={template.nameFontSize}
                    onChange={(e) => updateTemplate({ nameFontSize: parseInt(e.target.value) || 72 })}
                    className="touch-target h-11 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bodyFont" className="text-xs sm:text-sm">Fuente del Cuerpo</Label>
                  <Select
                    value={template.bodyFont}
                    onValueChange={(value) => updateTemplate({ bodyFont: value })}
                  >
                    <SelectTrigger id="bodyFont" className="touch-target h-11 sm:h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bodyFontSize" className="text-xs sm:text-sm">Tamaño del Cuerpo</Label>
                  <Input
                    id="bodyFontSize"
                    type="number"
                    min={20}
                    max={60}
                    value={template.bodyFontSize}
                    onChange={(e) => updateTemplate({ bodyFontSize: parseInt(e.target.value) || 40 })}
                    className="touch-target h-11 sm:h-12 text-sm sm:text-base"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layout Section */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-xl flex items-center gap-2">
                <SquaresFour size={18} className="sm:w-5 sm:h-5" />
                Diseño
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Configura el diseño y bordes del certificado
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="borderWidth" className="text-xs sm:text-sm">Ancho del Borde</Label>
                  <Input
                    id="borderWidth"
                    type="number"
                    min={2}
                    max={20}
                    value={template.borderWidth}
                    onChange={(e) => updateTemplate({ borderWidth: parseInt(e.target.value) || 8 })}
                    className="touch-target h-11 sm:h-12 text-sm sm:text-base"
                  />
                  <p className="text-xs text-muted-foreground">En píxeles</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderStyle" className="text-xs sm:text-sm">Estilo del Borde</Label>
                  <Select
                    value={template.borderStyle}
                    onValueChange={(value: 'solid' | 'double' | 'gradient') => updateTemplate({ borderStyle: value })}
                  >
                    <SelectTrigger id="borderStyle" className="touch-target h-11 sm:h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Sólido</SelectItem>
                      <SelectItem value="double">Doble</SelectItem>
                      <SelectItem value="gradient">Gradiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoSize" className="text-xs sm:text-sm">Tamaño del Logo</Label>
                  <Input
                    id="logoSize"
                    type="number"
                    min={60}
                    max={200}
                    value={template.logoSize}
                    onChange={(e) => updateTemplate({ logoSize: parseInt(e.target.value) || 120 })}
                    className="touch-target h-11 sm:h-12 text-sm sm:text-base"
                  />
                  <p className="text-xs text-muted-foreground">En píxeles</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showGradient" className="text-xs sm:text-sm">Mostrar Gradiente Decorativo</Label>
                    <Switch
                      id="showGradient"
                      checked={template.showDecorativeGradient}
                      onCheckedChange={(checked) => updateTemplate({ showDecorativeGradient: checked })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Gradiente en la parte inferior</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Text Customization */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-xl">Textos Personalizados</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Personaliza los textos que aparecen en el certificado
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certificateTitle" className="text-xs sm:text-sm">Título del Certificado</Label>
                <Input
                  id="certificateTitle"
                  value={template.certificateTitle}
                  onChange={(e) => updateTemplate({ certificateTitle: e.target.value })}
                  placeholder="Certificado de Completación"
                  className="touch-target h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="awardedToText" className="text-xs sm:text-sm">Texto "Otorgado a"</Label>
                <Input
                  id="awardedToText"
                  value={template.awardedToText}
                  onChange={(e) => updateTemplate({ awardedToText: e.target.value })}
                  placeholder="Este certificado se otorga a"
                  className="touch-target h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="completionText" className="text-xs sm:text-sm">Texto de Completación</Label>
                <Input
                  id="completionText"
                  value={template.completionText}
                  onChange={(e) => updateTemplate({ completionText: e.target.value })}
                  placeholder="por la completación exitosa de"
                  className="touch-target h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signatureText" className="text-xs sm:text-sm">Texto de Firma</Label>
                <Input
                  id="signatureText"
                  value={template.signatureText}
                  onChange={(e) => updateTemplate({ signatureText: e.target.value })}
                  placeholder="Firma Autorizada"
                  className="touch-target h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-xl flex items-center gap-2">
                <Eye size={18} className="sm:w-5 sm:h-5" />
                Vista Previa
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Vista previa del certificado con la configuración actual
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="aspect-[2480/1754] bg-white border-2 border-gray-300 rounded-lg p-2 sm:p-4 overflow-hidden relative shadow-lg">
                <div className="w-full h-full flex flex-col items-center justify-center text-center relative" style={{ fontFamily: template.bodyFont }}>
                  {/* Border Preview */}
                  <div
                    className="absolute inset-1 sm:inset-2 rounded"
                    style={{
                      borderWidth: `${Math.max(2, template.borderWidth * 0.15)}px`,
                      borderStyle: template.borderStyle === 'gradient' ? 'solid' : template.borderStyle,
                      borderColor: template.primaryColor,
                    }}
                  />
                  
                  {/* Logo Preview */}
                  <div
                    className="absolute"
                    style={{
                      top: '8%',
                      width: `${Math.min(60, template.logoSize * 0.12)}px`,
                      height: `${Math.min(60, template.logoSize * 0.12)}px`,
                      backgroundColor: template.secondaryColor,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${template.primaryColor}`,
                    }}
                  >
                    <div className="text-xs font-bold" style={{ color: template.primaryColor }}>LOGO</div>
                  </div>

                  {/* Title */}
                  <div
                    className="absolute"
                    style={{
                      top: '22%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '90%',
                      color: template.primaryColor,
                      fontFamily: template.titleFont,
                      fontSize: `${Math.min(24, template.titleFontSize * 0.12)}px`,
                      fontWeight: 'bold',
                      lineHeight: '1.2',
                    }}
                  >
                    {template.certificateTitle || 'Certificado de Completación'}
                  </div>

                  {/* Awarded To */}
                  <div
                    className="absolute"
                    style={{
                      top: '38%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '85%',
                      color: template.secondaryTextColor,
                      fontFamily: template.bodyFont,
                      fontSize: `${Math.min(12, template.bodyFontSize * 0.12)}px`,
                      lineHeight: '1.4',
                    }}
                  >
                    {template.awardedToText || 'Este certificado se otorga a'}
                  </div>

                  {/* Name */}
                  <div
                    className="absolute"
                    style={{
                      top: '48%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '90%',
                      color: template.textColor,
                      fontFamily: template.nameFont,
                      fontSize: `${Math.min(20, template.nameFontSize * 0.12)}px`,
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                    }}
                  >
                    Juan Pérez García
                  </div>

                  {/* Completion */}
                  <div
                    className="absolute"
                    style={{
                      top: '62%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '85%',
                      color: template.secondaryTextColor,
                      fontFamily: template.bodyFont,
                      fontSize: `${Math.min(12, template.bodyFontSize * 0.12)}px`,
                      lineHeight: '1.4',
                    }}
                  >
                    {template.completionText || 'por la completación exitosa de'}
                  </div>

                  {/* Course Title */}
                  <div
                    className="absolute"
                    style={{
                      top: '72%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '85%',
                      color: template.accentColor,
                      fontFamily: template.bodyFont,
                      fontSize: `${Math.min(14, template.bodyFontSize * 0.12)}px`,
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                    }}
                  >
                    Curso de Ejemplo de Capacitación
                  </div>

                  {/* Date */}
                  <div
                    className="absolute"
                    style={{
                      top: '82%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '85%',
                      color: template.secondaryTextColor,
                      fontFamily: template.bodyFont,
                      fontSize: `${Math.min(10, template.bodyFontSize * 0.1)}px`,
                      lineHeight: '1.4',
                    }}
                  >
                    Fecha de Completación: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>

                  {/* Signature Line */}
                  <div
                    className="absolute"
                    style={{
                      bottom: '12%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '40%',
                      borderTop: `2px solid ${template.secondaryColor}`,
                      paddingTop: '4px',
                    }}
                  >
                    <div
                      style={{
                        color: template.secondaryTextColor,
                        fontFamily: template.bodyFont,
                        fontSize: `${Math.min(9, template.bodyFontSize * 0.1)}px`,
                      }}
                    >
                      {template.signatureText || 'Firma Autorizada'}
                    </div>
                  </div>

                  {/* Gradient Preview */}
                  {template.showDecorativeGradient && (
                    <div
                      className="absolute"
                      style={{
                        bottom: '6%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '70%',
                        height: '3px',
                        background: `linear-gradient(to right, ${template.primaryColor}, ${template.secondaryColor}, ${template.primaryColor})`,
                        borderRadius: '2px',
                      }}
                    />
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Esta es una vista previa aproximada. El certificado final puede verse ligeramente diferente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

