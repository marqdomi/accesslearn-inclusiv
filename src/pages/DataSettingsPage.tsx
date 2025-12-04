import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Database, Download, Upload, FileText, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export function DataSettingsPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { currentTenant } = useTenant()
  
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  const handleExport = async (type: 'users' | 'courses' | 'all') => {
    if (!isAuthenticated || !user || !currentTenant?.id) {
      toast.error('Debes iniciar sesión para exportar datos')
      return
    }

    setExporting(true)

    try {
      // Simular exportación (en producción, esto llamaría al backend)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Crear un blob con datos de ejemplo
      const data = {
        tenant: currentTenant.name,
        exportDate: new Date().toISOString(),
        type,
        message: 'Esta es una exportación de ejemplo. En producción, esto contendría los datos reales.'
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export-${currentTenant.slug}-${type}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Datos de ${type === 'all' ? 'todos los tipos' : type} exportados exitosamente`)
    } catch (error: any) {
      console.error('[DataSettings] Error exporting:', error)
      toast.error('Error al exportar los datos')
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!isAuthenticated || !user || !currentTenant?.id) {
      toast.error('Debes iniciar sesión para importar datos')
      return
    }

    setImporting(true)

    try {
      // Simular importación (en producción, esto llamaría al backend)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Datos importados exitosamente')
    } catch (error: any) {
      console.error('[DataSettings] Error importing:', error)
      toast.error('Error al importar los datos')
    } finally {
      setImporting(false)
      // Reset file input
      event.target.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/settings')}
            className="mb-3 sm:mb-4 gap-2 touch-target"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Volver a Configuración</span>
            <span className="sm:hidden">Volver</span>
          </Button>

          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">Gestión de Datos</h1>
            <p className="text-sm sm:text-lg text-muted-foreground">
              Exporta, importa y administra los datos de tu organización
            </p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Export Data */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <Download className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-xl">Exportar Datos</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Descarga los datos de tu organización en formato JSON
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-3">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-3 sm:py-4 touch-target"
                  onClick={() => handleExport('users')}
                  disabled={exporting}
                >
                  <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-semibold">Usuarios</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                      Exporta todos los usuarios
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-3 sm:py-4 touch-target"
                  onClick={() => handleExport('courses')}
                  disabled={exporting}
                >
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-semibold">Cursos</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                      Exporta todos los cursos
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-3 sm:py-4 touch-target"
                  onClick={() => handleExport('all')}
                  disabled={exporting}
                >
                  <Database className="h-5 w-5 sm:h-6 sm:w-6" />
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-semibold">Todo</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                      Exporta todos los datos
                    </div>
                  </div>
                </Button>
              </div>

              {exporting && (
                <div className="text-center text-xs sm:text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
                  Exportando datos...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import Data */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-xl">Importar Datos</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Importa datos desde un archivo JSON
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
              <div className="border-2 border-dashed rounded-lg p-4 sm:p-8 text-center">
                <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  Selecciona un archivo JSON para importar
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
                  El archivo debe estar en formato JSON válido
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                  disabled={importing}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('import-file')?.click()}
                  disabled={importing}
                  className="touch-target text-xs sm:text-sm"
                >
                  <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Seleccionar Archivo
                </Button>
              </div>

              {importing && (
                <div className="text-center text-xs sm:text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
                  Importando datos...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <Database className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-xl">Administración de Datos</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">
                    Herramientas adicionales para gestionar los datos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold mb-1">Backup Automático</h3>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">
                        Configura backups automáticos de tus datos
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">Próximamente</Badge>
                  </div>
                </div>

                <div className="p-3 sm:p-4 border rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold mb-1">Limpieza de Datos</h3>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">
                        Elimina datos antiguos o no utilizados
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">Próximamente</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end pt-3 sm:pt-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/settings')}
              className="touch-target text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Volver a Configuración</span>
              <span className="sm:hidden">Volver</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
