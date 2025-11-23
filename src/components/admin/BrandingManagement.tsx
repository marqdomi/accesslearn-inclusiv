import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, Palette, CheckCircle, XCircle, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { checkContrastCompliance, hexToRgb, rgbToOklch } from '@/lib/contrast-checker'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'
import { useAuth } from '@/contexts/AuthContext'

interface BrandingManagementProps {
  onBack: () => void
}

export function BrandingManagement({ onBack }: BrandingManagementProps) {
  const { currentTenant, setCurrentTenant } = useTenant()
  const { user } = useAuth()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(currentTenant?.logo || null)
  const [primaryColor, setPrimaryColor] = useState<string>(currentTenant?.primaryColor || '#4F46E5')
  const [secondaryColor, setSecondaryColor] = useState<string>(currentTenant?.secondaryColor || '#10B981')
  const [companyName, setCompanyName] = useState<string>(currentTenant?.name || '')
  const [isDragging, setIsDragging] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const contrastCheck = checkContrastCompliance(primaryColor)

  // Load tenant data on mount
  useEffect(() => {
    const loadTenant = async () => {
      if (!currentTenant?.id || !user) return
      
      try {
        setLoading(true)
        // Use user's tenantId from auth context, fallback to currentTenant
        const tenantId = user.tenantId || currentTenant.id
        const tenant = await ApiService.getTenantById(tenantId)
        
        if (tenant) {
          setLogoPreview(tenant.logo || null)
          setPrimaryColor(tenant.primaryColor || '#4F46E5')
          setSecondaryColor(tenant.secondaryColor || '#10B981')
          setCompanyName(tenant.name || '')
          
          // Update tenant context
          setCurrentTenant({
            ...currentTenant,
            ...tenant
          })
        }
      } catch (error) {
        console.error('Error loading tenant:', error)
        toast.error('Error al cargar la configuración del tenant')
      } finally {
        setLoading(false)
      }
    }
    
    loadTenant()
  }, [currentTenant?.id, user?.id, user?.tenantId])

  const handleFileChange = (file: File) => {
    if (!file.type.match(/^image\/(png|svg\+xml)$/)) {
      toast.error('Invalid file type. Please upload a PNG or SVG file.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 2MB.')
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setPrimaryColor(color)
  }

  const handleSave = async () => {
    if (!contrastCheck.isAccessible) {
      toast.error('No se puede guardar: El color seleccionado no cumple con los estándares de accesibilidad WCAG.')
      return
    }

    if (!currentTenant?.id || !user) {
      toast.error('No se pudo determinar el tenant')
      return
    }

    setIsSaving(true)

    try {
      const tenantId = user.tenantId || currentTenant.id
      
      // Convert hex to oklch if needed, but keep hex for backend
      const updates: any = {
        name: companyName || currentTenant.name,
        logo: logoPreview || undefined,
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
      }

      const updatedTenant = await ApiService.updateTenant(tenantId, updates)

      // Update tenant context
      setCurrentTenant({
        ...currentTenant,
        ...updatedTenant
      })

      // Apply colors to document
      document.documentElement.style.setProperty('--primary', primaryColor)
      document.documentElement.style.setProperty('--ring', primaryColor)

      toast.success('Configuración de marca guardada exitosamente')
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la configuración de marca')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!currentTenant?.id || !user) return

    setIsSaving(true)
    
    try {
      const tenantId = user.tenantId || currentTenant.id
      const defaultPrimary = '#4F46E5'
      const defaultSecondary = '#10B981'
      
      const updates = {
        logo: undefined,
        primaryColor: defaultPrimary,
        secondaryColor: defaultSecondary,
      }

      const updatedTenant = await ApiService.updateTenant(tenantId, updates)
      
      setLogoPreview(null)
      setLogoFile(null)
      setPrimaryColor(defaultPrimary)
      setSecondaryColor(defaultSecondary)
      
      setCurrentTenant({
        ...currentTenant,
        ...updatedTenant
      })
      
      document.documentElement.style.setProperty('--primary', defaultPrimary)
      document.documentElement.style.setProperty('--ring', defaultPrimary)
      
      toast.success('Marca restablecida a los valores por defecto')
    } catch (error: any) {
      toast.error(error.message || 'Error al restablecer la marca')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={20} className="mr-2" />
            Volver a Configuración
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette size={24} />
              Marca y Apariencia
            </CardTitle>
            <CardDescription>
              Personaliza la plataforma con la marca de tu empresa. Todos los temas personalizados deben cumplir con los estándares de accesibilidad WCAG.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="company-name">Nombre de la Empresa (Opcional)</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ingresa el nombre de tu empresa"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Logo de la Empresa</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Sube un archivo PNG o SVG. Este logo reemplazará el logo en el encabezado y la página de inicio de sesión.
                </p>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {logoPreview ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={logoPreview}
                        alt="Company logo preview"
                        className="max-h-32 max-w-full object-contain"
                      />
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={20} className="mr-2" />
                        Replace Logo
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setLogoPreview(null)
                          setLogoFile(null)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-muted p-4">
                        <Upload size={32} className="text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Drag and drop your logo here, or{' '}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-primary hover:underline"
                        >
                          browse
                        </button>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG or SVG, max 2MB
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.svg"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>

            <div className="border-t pt-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="primary-color">Color Primario de la Marca</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Este color se usará para botones, enlaces y elementos interactivos en toda la plataforma.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label htmlFor="color-input" className="text-xs">
                          Hex Color
                        </Label>
                        <Input
                          id="color-input"
                          type="text"
                          value={primaryColor}
                          onChange={handleColorChange}
                          placeholder="#8B5CF6"
                          className="font-mono mt-1"
                          maxLength={7}
                        />
                      </div>
                      <div className="flex-shrink-0">
                        <Label htmlFor="color-picker" className="text-xs">
                          Picker
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="color-picker"
                            type="color"
                            value={primaryColor}
                            onChange={handleColorChange}
                            className="h-10 w-20 cursor-pointer p-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4 space-y-3">
                      <h4 className="font-medium text-sm">Color Preview</h4>
                      <div className="space-y-2">
                        <div
                          className="h-16 rounded-md border flex items-center justify-center text-sm font-medium"
                          style={{
                            backgroundColor: primaryColor,
                            color: contrastCheck.recommendedForeground === 'white' ? '#ffffff' : '#000000',
                          }}
                        >
                          Primary Button
                        </div>
                        <div className="flex gap-2">
                          <div
                            className="flex-1 h-10 rounded border"
                            style={{ backgroundColor: primaryColor }}
                          />
                          <div
                            className="flex-1 h-10 rounded border"
                            style={{
                              backgroundColor: primaryColor,
                              opacity: 0.1,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Card className={contrastCheck.isAccessible ? 'border-success' : 'border-destructive'}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          {contrastCheck.isAccessible ? (
                            <CheckCircle size={20} weight="fill" className="text-success" />
                          ) : (
                            <XCircle size={20} weight="fill" className="text-destructive" />
                          )}
                          WCAG Contrast Check
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">On White Background:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">
                                {contrastCheck.contrastWithWhite.toFixed(2)}:1
                              </span>
                              {contrastCheck.passesAAWhite ? (
                                <CheckCircle size={16} weight="fill" className="text-success" />
                              ) : (
                                <XCircle size={16} weight="fill" className="text-destructive" />
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">On Black Background:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium">
                                {contrastCheck.contrastWithBlack.toFixed(2)}:1
                              </span>
                              {contrastCheck.passesAABlack ? (
                                <CheckCircle size={16} weight="fill" className="text-success" />
                              ) : (
                                <XCircle size={16} weight="fill" className="text-destructive" />
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">As Button Color:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                Use {contrastCheck.recommendedForeground} text
                              </span>
                              {contrastCheck.isAccessible ? (
                                <CheckCircle size={16} weight="fill" className="text-success" />
                              ) : (
                                <XCircle size={16} weight="fill" className="text-destructive" />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t">
                          {contrastCheck.isAccessible ? (
                            <div className="flex items-start gap-2 text-sm text-success">
                              <CheckCircle size={16} weight="fill" className="mt-0.5 flex-shrink-0" />
                              <p>
                                <strong>PASS:</strong> This color meets WCAG AA standards
                                {contrastCheck.passesAAAWhite || contrastCheck.passesAAABlack
                                  ? ' and AAA standards'
                                  : ''}
                                .
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2 text-sm text-destructive">
                              <XCircle size={16} weight="fill" className="mt-0.5 flex-shrink-0" />
                              <p>
                                <strong>FAIL:</strong> This color does not meet WCAG AA standards. Please choose a darker or lighter color.
                              </p>
                            </div>
                          )}
                        </div>

                        {!contrastCheck.isAccessible && (
                          <div className="pt-2 border-t">
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Warning size={14} className="mt-0.5 flex-shrink-0" />
                              <p>
                                WCAG AA requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text.
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
                      <p className="font-medium flex items-center gap-2">
                        <Warning size={16} />
                        Accessibility Note
                      </p>
                      <p className="text-muted-foreground">
                        Users with "High Contrast Mode" enabled will see the high-contrast theme regardless of your custom branding.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-6">
              <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                Restablecer Valores por Defecto
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onBack} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!contrastCheck.isAccessible || isSaving}
                >
                  {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
