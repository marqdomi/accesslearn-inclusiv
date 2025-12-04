import { useState } from 'react'
import { useAccessibilityProfiles } from '@/hooks/use-accessibility-profiles'
import { AccessibilityProfile } from '@/hooks/use-accessibility-profiles'
import { AccessibilityProfileCard } from './AccessibilityProfileCard'
import { AccessibilityProfileEditor } from './AccessibilityProfileEditor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function AccessibilityProfileManagement() {
  const { profiles, loading, error, refreshProfiles } = useAccessibilityProfiles(true)
  const [editingProfile, setEditingProfile] = useState<AccessibilityProfile | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const activeProfiles = profiles.filter(p => p.enabled)
  const inactiveProfiles = profiles.filter(p => !p.enabled)
  const defaultProfiles = profiles.filter(p => p.isDefault)
  const customProfiles = profiles.filter(p => !p.isDefault)

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Cargando perfiles...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (editingProfile || isCreating) {
    return (
      <AccessibilityProfileEditor
        profile={editingProfile || undefined}
        onClose={() => {
          setEditingProfile(null)
          setIsCreating(false)
        }}
        onSave={() => {
          setEditingProfile(null)
          setIsCreating(false)
          refreshProfiles()
        }}
      />
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-semibold">Perfiles de Accesibilidad</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {profiles.length} perfil{profiles.length !== 1 ? 'es' : ''} total{profiles.length !== 1 ? 'es' : ''} • {activeProfiles.length} activo{activeProfiles.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2 w-full sm:w-auto touch-target text-xs sm:text-sm">
          <Plus size={16} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Crear Nuevo Perfil</span>
          <span className="sm:hidden">Crear Perfil</span>
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">¿Cómo funcionan los perfiles?</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            Los perfiles de accesibilidad son configuraciones predefinidas que los usuarios pueden seleccionar
            para adaptar la plataforma a sus necesidades. Solo los perfiles que actives estarán disponibles
            para los usuarios finales.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li>• <strong>Perfiles del Sistema:</strong> Perfiles predefinidos que puedes personalizar pero no eliminar</li>
            <li>• <strong>Perfiles Personalizados:</strong> Perfiles que creas tú y puedes eliminar o modificar libremente</li>
            <li>• <strong>Activar/Desactivar:</strong> Solo los perfiles activos serán visibles para los usuarios finales</li>
          </ul>
        </CardContent>
      </Card>

      {/* Profiles Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto bg-muted/30 p-1.5 rounded-xl border-0 shadow-sm">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold transition-all duration-200 hover:bg-muted/50 data-[state=inactive]:text-muted-foreground touch-target"
          >
            Todos ({profiles.length})
          </TabsTrigger>
          <TabsTrigger 
            value="active" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold transition-all duration-200 hover:bg-muted/50 data-[state=inactive]:text-muted-foreground touch-target"
          >
            Activos ({activeProfiles.length})
          </TabsTrigger>
          <TabsTrigger 
            value="inactive" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold transition-all duration-200 hover:bg-muted/50 data-[state=inactive]:text-muted-foreground touch-target"
          >
            Inactivos ({inactiveProfiles.length})
          </TabsTrigger>
          <TabsTrigger 
            value="custom" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold transition-all duration-200 hover:bg-muted/50 data-[state=inactive]:text-muted-foreground touch-target"
          >
            Personalizados ({customProfiles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          {profiles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 p-4 sm:p-6">
                <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No hay perfiles</h3>
                <p className="text-xs sm:text-sm text-muted-foreground text-center mb-3 sm:mb-4">
                  Crea tu primer perfil de accesibilidad para comenzar
                </p>
                <Button onClick={() => setIsCreating(true)} className="gap-2 touch-target text-xs sm:text-sm">
                  <Plus size={16} className="sm:w-5 sm:h-5" />
                  Crear Perfil
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {profiles.map((profile) => (
                <AccessibilityProfileCard
                  key={profile.id}
                  profile={profile}
                  onEdit={() => setEditingProfile(profile)}
                  onToggle={async (enabled) => {
                    try {
                      await refreshProfiles()
                    } catch (err) {
                      console.error('Error toggling profile:', err)
                    }
                  }}
                  onDelete={async () => {
                    await refreshProfiles()
                  }}
                  onDuplicate={async () => {
                    await refreshProfiles()
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          {activeProfiles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 p-4 sm:p-6">
                <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No hay perfiles activos</h3>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Activa algunos perfiles para que los usuarios puedan seleccionarlos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {activeProfiles.map((profile) => (
                <AccessibilityProfileCard
                  key={profile.id}
                  profile={profile}
                  onEdit={() => setEditingProfile(profile)}
                  onToggle={async (enabled) => {
                    await refreshProfiles()
                  }}
                  onDelete={async () => {
                    await refreshProfiles()
                  }}
                  onDuplicate={async () => {
                    await refreshProfiles()
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          {inactiveProfiles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 p-4 sm:p-6">
                <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Todos los perfiles están activos</h3>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Todos los perfiles están disponibles para los usuarios
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {inactiveProfiles.map((profile) => (
                <AccessibilityProfileCard
                  key={profile.id}
                  profile={profile}
                  onEdit={() => setEditingProfile(profile)}
                  onToggle={async (enabled) => {
                    await refreshProfiles()
                  }}
                  onDelete={async () => {
                    await refreshProfiles()
                  }}
                  onDuplicate={async () => {
                    await refreshProfiles()
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          {customProfiles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 p-4 sm:p-6">
                <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No hay perfiles personalizados</h3>
                <p className="text-xs sm:text-sm text-muted-foreground text-center mb-3 sm:mb-4">
                  Crea perfiles personalizados adaptados a las necesidades específicas de tu organización
                </p>
                <Button onClick={() => setIsCreating(true)} className="gap-2 touch-target text-xs sm:text-sm">
                  <Plus size={16} className="sm:w-5 sm:h-5" />
                  Crear Perfil Personalizado
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {customProfiles.map((profile) => (
                <AccessibilityProfileCard
                  key={profile.id}
                  profile={profile}
                  onEdit={() => setEditingProfile(profile)}
                  onToggle={async (enabled) => {
                    await refreshProfiles()
                  }}
                  onDelete={async () => {
                    await refreshProfiles()
                  }}
                  onDuplicate={async () => {
                    await refreshProfiles()
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

