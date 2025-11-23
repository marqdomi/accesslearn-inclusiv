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
            <h1 className="text-4xl font-bold mb-2">Gestión de Datos</h1>
            <p className="text-lg text-muted-foreground">
              Exporta, importa y administra los datos de tu organización
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Export Data */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Download className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Exportar Datos</CardTitle>
                  <CardDescription>
                    Descarga los datos de tu organización en formato JSON
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => handleExport('users')}
                  disabled={exporting}
                >
                  <Users className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Usuarios</div>
                    <div className="text-xs text-muted-foreground">
                      Exporta todos los usuarios
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => handleExport('courses')}
                  disabled={exporting}
                >
                  <FileText className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Cursos</div>
                    <div className="text-xs text-muted-foreground">
                      Exporta todos los cursos
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => handleExport('all')}
                  disabled={exporting}
                >
                  <Database className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Todo</div>
                    <div className="text-xs text-muted-foreground">
                      Exporta todos los datos
                    </div>
                  </div>
                </Button>
              </div>

              {exporting && (
                <div className="text-center text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
                  Exportando datos...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import Data */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Upload className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle>Importar Datos</CardTitle>
                  <CardDescription>
                    Importa datos desde un archivo JSON
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium mb-2">
                  Selecciona un archivo JSON para importar
                </p>
                <p className="text-xs text-muted-foreground mb-4">
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
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Seleccionar Archivo
                </Button>
              </div>

              {importing && (
                <div className="text-center text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2"></div>
                  Importando datos...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-purple-600" />
                <div>
                  <CardTitle>Administración de Datos</CardTitle>
                  <CardDescription>
                    Herramientas adicionales para gestionar los datos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">Backup Automático</h3>
                      <p className="text-sm text-muted-foreground">
                        Configura backups automáticos de tus datos
                      </p>
                    </div>
                    <Badge variant="outline">Próximamente</Badge>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-1">Limpieza de Datos</h3>
                      <p className="text-sm text-muted-foreground">
                        Elimina datos antiguos o no utilizados
                      </p>
                    </div>
                    <Badge variant="outline">Próximamente</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/settings')}
            >
              Volver a Configuración
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
