import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/contexts/TenantContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Palette, Upload, X, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ApiService } from '@/services/api.service'

export function BrandingSettingsPage() {
  const navigate = useNavigate()
  const { currentTenant, setCurrentTenant } = useTenant()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(currentTenant?.logo || null)
  const [logoBlobName, setLogoBlobName] = useState<string | null>(null) // Guardar blobName para guardar en BD
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [primaryColor, setPrimaryColor] = useState(currentTenant?.primaryColor || '#4F46E5')
  const [secondaryColor, setSecondaryColor] = useState(currentTenant?.secondaryColor || '#10B981')
  const [companyName, setCompanyName] = useState(currentTenant?.name || '')
  const hasLoadedRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Debes iniciar sesión para acceder a esta página')
      navigate('/login')
    }
  }, [authLoading, isAuthenticated, navigate])

  // Load tenant data from API (only once)
  useEffect(() => {
    let isMounted = true
    
    const loadTenant = async () => {
      // Avoid loading multiple times
      if (hasLoadedRef.current) {
        if (isMounted) setLoading(false)
        return
      }
      
      // Wait for auth to load
      if (authLoading) return
      
      // Check authentication
      if (!isAuthenticated || !user) {
        console.warn('[BrandingSettings] User not authenticated')
        if (isMounted) setLoading(false)
        return
      }

      if (!currentTenant?.id) {
        console.warn('[BrandingSettings] No tenant available')
        if (isMounted) setLoading(false)
        return
      }

      try {
        if (isMounted) setLoading(true)
        const tenantId = user.tenantId || currentTenant.id
        console.log('[BrandingSettings] Loading tenant:', tenantId)
        
        // Check if token exists
        const token = localStorage.getItem('auth-token')
        if (!token) {
          console.error('[BrandingSettings] No auth token found')
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente')
          navigate('/login')
          return
        }
        
        const tenant = await ApiService.getTenantById(tenantId)
        
        if (tenant && isMounted) {
          // Si el logo es un blobName (formato: container/blobName), generar URL con SAS
          let logoUrl = tenant.logo || null
          if (logoUrl && !logoUrl.startsWith('http') && !logoUrl.startsWith('data:')) {
            // Es un blobName, generar URL con SAS token
            try {
              const [containerName, ...blobNameParts] = logoUrl.split('/')
              const blobName = blobNameParts.join('/')
              const { url } = await ApiService.getMediaUrl(containerName, blobName)
              logoUrl = url
            } catch (error) {
              console.error('Error generating logo URL:', error)
              // Mantener el blobName si falla la generación de URL
            }
          }
          
          setLogoPreview(logoUrl)
          setPrimaryColor(tenant.primaryColor || '#4F46E5')
          setSecondaryColor(tenant.secondaryColor || '#10B981')
          setCompanyName(tenant.name || '')
          hasLoadedRef.current = true
        }
      } catch (error: any) {
        console.error('[BrandingSettings] Error loading tenant:', error)
        if (error.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente')
          navigate('/login')
        } else {
          toast.error('Error al cargar la configuración del tenant')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    
    loadTenant()
    
    return () => {
      isMounted = false
    }
  }, [authLoading, isAuthenticated, user?.id, user?.tenantId]) // Removed currentTenant to avoid loop

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB')
      return
    }

    try {
      setSaving(true)
      
      // Upload a Blob Storage
      const { url, blobName, containerName } = await ApiService.uploadFile(file, 'logo')
      
      // Guardar URL con SAS token para preview inmediato
      setLogoPreview(url)
      
      // Guardar blobName en formato container/blobName para guardar en BD
      const blobNameForStorage = `${containerName}/${blobName}`
      setLogoBlobName(blobNameForStorage)
      
      setLogoFile(null) // Ya no necesitamos el archivo local
      
      toast.success('Logo subido exitosamente')
    } catch (error: any) {
      console.error('Error uploading logo:', error)
      toast.error(error.message || 'Error al subir el logo')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setLogoBlobName(null)
    setLogoFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    // Check authentication
    if (!isAuthenticated || !user) {
      toast.error('Debes iniciar sesión para guardar cambios')
      navigate('/login')
      return
    }

    if (!currentTenant?.id) {
      toast.error('No se pudo determinar el tenant')
      return
    }

    if (!companyName.trim()) {
      toast.error('El nombre de la empresa es requerido')
      return
    }

    // Check if token exists
    const token = localStorage.getItem('auth-token')
    if (!token) {
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente')
      navigate('/login')
      return
    }

    setSaving(true)

    try {
      const tenantId = user.tenantId || currentTenant.id
      console.log('[BrandingSettings] Saving tenant:', tenantId, 'with token:', token ? 'present' : 'missing')
      
      const updates: any = {
        name: companyName.trim(),
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
      }

      // Only include logo if it was changed
      // Si hay un nuevo logo subido (logoBlobName), usar ese
      // Si no, mantener el logo existente del tenant
      // Si logoPreview es null y había un logo, eliminarlo
      if (logoBlobName) {
        // Nuevo logo subido: guardar blobName
        updates.logo = logoBlobName
      } else if (logoPreview) {
        // Logo existente (puede ser blobName o URL antigua): mantener
        // Si es una URL de blob, intentar extraer blobName
        if (logoPreview.includes('blob.core.windows.net')) {
          // Extraer blobName desde la URL (antes del ?)
          const urlParts = logoPreview.split('?')[0]
          const blobNameMatch = urlParts.match(/\/([^\/]+)\/(.+)$/)
          if (blobNameMatch) {
            const containerName = blobNameMatch[1]
            const blobName = blobNameMatch[2]
            updates.logo = `${containerName}/${blobName}`
          } else {
            updates.logo = logoPreview
          }
        } else if (logoPreview.includes('/') && !logoPreview.startsWith('http') && !logoPreview.startsWith('data:')) {
          // Ya es un blobName (formato: container/blobName)
          updates.logo = logoPreview
        } else {
          // URL externa o Base64 antigua: mantener
          updates.logo = logoPreview
        }
      } else if (logoPreview === null && currentTenant.logo) {
        // Logo fue eliminado: setear a undefined
        updates.logo = undefined
      }

      const updatedTenant = await ApiService.updateTenant(tenantId, updates)

      // Update tenant context
      setCurrentTenant({
        ...currentTenant,
        ...updatedTenant
      })

      // Si se guardó un nuevo logo, limpiar logoBlobName y actualizar preview
      if (logoBlobName) {
        // El logo ya está guardado en BD como blobName, ahora necesitamos regenerar la URL con SAS
        // para el preview, pero ya no necesitamos logoBlobName
        setLogoBlobName(null)
        
        // Actualizar logoPreview con el blobName guardado (para que se recargue correctamente)
        if (updatedTenant.logo && updatedTenant.logo.includes('/') && !updatedTenant.logo.startsWith('http')) {
          // Es un blobName, generar URL con SAS para preview
          try {
            const [containerName, ...blobNameParts] = updatedTenant.logo.split('/')
            const blobName = blobNameParts.join('/')
            const { url } = await ApiService.getMediaUrl(containerName, blobName)
            setLogoPreview(url)
          } catch (error) {
            console.error('Error generating logo preview URL after save:', error)
            // Mantener el blobName si falla
            setLogoPreview(updatedTenant.logo)
          }
        } else {
          setLogoPreview(updatedTenant.logo)
        }
      }

      // Apply colors to document
      document.documentElement.style.setProperty('--primary', primaryColor)
      document.documentElement.style.setProperty('--ring', primaryColor)

      toast.success('Configuración de marca guardada exitosamente')
    } catch (error: any) {
      console.error('[BrandingSettings] Error saving branding:', error)
      if (error.status === 401) {
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente')
        navigate('/login')
      } else {
        toast.error(error.message || 'Error al guardar la configuración de marca')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!currentTenant?.id || !user) return

    setSaving(true)
    
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
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando configuración...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/settings')}
            className="mb-4 gap-2"
          >
            <ArrowLeft size={20} />
            Volver a Configuración
          </Button>

          <div>
            <h1 className="text-4xl font-bold mb-2">Marca y Apariencia</h1>
            <p className="text-lg text-muted-foreground">
              Personaliza los colores, logo y nombre de tu organización
            </p>
          </div>
        </div>

        {/* Branding Form */}
        <div className="space-y-6">
          {/* Company Name */}
          <Card>
            <CardHeader>
              <CardTitle>Nombre de la Empresa</CardTitle>
              <CardDescription>
                Este nombre se mostrará en toda la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="companyName">Nombre *</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ingresa el nombre de tu empresa"
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Logo de la Empresa</CardTitle>
              <CardDescription>
                Sube un archivo PNG o SVG. Este logo aparecerá en el encabezado y la página de inicio de sesión.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logoPreview ? (
                  <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/20">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-24 w-24 object-contain bg-background rounded border"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Vista Previa del Logo</p>
                      <p className="text-xs text-muted-foreground">
                        Este logo aparecerá en toda la plataforma
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving}
                      >
                        <Upload size={16} className="mr-2" />
                        Reemplazar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveLogo}
                        disabled={saving}
                      >
                        <X size={16} className="mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-muted p-4">
                        <Upload size={32} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">
                          Haz clic para subir un logo
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG o SVG, máximo 2MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving}
                      >
                        <Upload size={16} className="mr-2" />
                        Seleccionar Archivo
                      </Button>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/svg+xml"
                  onChange={handleLogoSelect}
                  className="hidden"
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Colores de la Marca</CardTitle>
              <CardDescription>
                Personaliza los colores principales de tu organización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Color */}
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Color Primario</Label>
                <p className="text-sm text-muted-foreground">
                  Este color se usará para botones, enlaces y elementos interactivos
                </p>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input
                      id="primaryColor"
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#4F46E5"
                      className="font-mono"
                      maxLength={7}
                      disabled={saving}
                    />
                  </div>
                  <div className="relative">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-20 cursor-pointer p-1"
                      disabled={saving}
                    />
                  </div>
                  <div
                    className="h-10 w-20 rounded border"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Color Secundario</Label>
                <p className="text-sm text-muted-foreground">
                  Color complementario para acentos y elementos secundarios
                </p>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input
                      id="secondaryColor"
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#10B981"
                      className="font-mono"
                      maxLength={7}
                      disabled={saving}
                    />
                  </div>
                  <div className="relative">
                    <Input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-20 cursor-pointer p-1"
                      disabled={saving}
                    />
                  </div>
                  <div
                    className="h-10 w-20 rounded border"
                    style={{ backgroundColor: secondaryColor }}
                  />
                </div>
              </div>

              {/* Color Preview */}
              <div className="border-t pt-6">
                <Label className="mb-4 block">Vista Previa</Label>
                <div className="space-y-3">
                  <Button
                    style={{ backgroundColor: primaryColor }}
                    className="w-full"
                    disabled
                  >
                    Botón Primario
                  </Button>
                  <div className="flex gap-2">
                    <div
                      className="flex-1 h-12 rounded border flex items-center justify-center text-sm"
                      style={{ backgroundColor: primaryColor, color: 'white' }}
                    >
                      Elemento Primario
                    </div>
                    <div
                      className="flex-1 h-12 rounded border flex items-center justify-center text-sm"
                      style={{ backgroundColor: secondaryColor, color: 'white' }}
                    >
                      Elemento Secundario
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
            >
              Restablecer Valores por Defecto
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/settings')}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !companyName.trim()}
              >
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
