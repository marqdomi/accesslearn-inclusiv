import { useAccessibilityProfiles } from '@/hooks/use-accessibility-profiles'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ApiService } from '@/services/api.service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ProfileSelectorProps {
  onProfileSelected?: () => void
}

export function ProfileSelector({ onProfileSelected }: ProfileSelectorProps) {
  const { profiles, loading, error } = useAccessibilityProfiles(false) // false = end user mode
  const [applyingProfile, setApplyingProfile] = useState<string | null>(null)

  // Load current user's active profile from localStorage
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('active-accessibility-profile-id')
    }
    return null
  })

  useEffect(() => {
    // Apply active profile on mount if exists
    if (activeProfileId && profiles.length > 0) {
      const profile = profiles.find(p => p.id === activeProfileId)
      if (profile) {
        applyProfile(profile)
      }
    }
  }, [activeProfileId, profiles])

  const applyProfile = async (profile: any) => {
    try {
      setApplyingProfile(profile.id)

      // Save preferences to localStorage (same format as AdvancedAccessibilityPanel)
      localStorage.setItem('advanced-accessibility-preferences', JSON.stringify(profile.settings))
      localStorage.setItem('active-accessibility-profile-id', profile.id)

      // Apply settings by dispatching a custom event that AdvancedAccessibilityPanel listens to
      window.dispatchEvent(new CustomEvent('accessibility-profile-changed', {
        detail: { profile, settings: profile.settings }
      }))

      setActiveProfileId(profile.id)
      toast.success(`Perfil "${profile.name}" activado`)
      onProfileSelected?.()
    } catch (error: any) {
      console.error('Error applying profile:', error)
      toast.error('Error al aplicar el perfil')
    } finally {
      setApplyingProfile(null)
    }
  }

  const resetToDefaults = () => {
    localStorage.removeItem('advanced-accessibility-preferences')
    localStorage.removeItem('active-accessibility-profile-id')
    setActiveProfileId(null)
    
    // Dispatch event to reset
    window.dispatchEvent(new CustomEvent('accessibility-profile-changed', {
      detail: { profile: null, settings: null }
    }))

    toast.success('Configuración restablecida a valores por defecto')
    onProfileSelected?.()
  }

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
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (profiles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay perfiles disponibles</h3>
          <p className="text-muted-foreground text-center">
            Tu administrador aún no ha activado ningún perfil de accesibilidad.
            Contacta con el soporte si necesitas ayuda.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Selecciona un Perfil</h3>
        <p className="text-sm text-muted-foreground">
          Elige el perfil que mejor se adapte a tus necesidades. Los cambios se aplicarán inmediatamente.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {profiles.map((profile) => {
          const isActive = activeProfileId === profile.id
          const isApplying = applyingProfile === profile.id

          return (
            <Card
              key={profile.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                isActive && 'border-primary border-2 bg-primary/5'
              )}
              onClick={() => !isApplying && applyProfile(profile)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={cn(
                      'p-2 rounded-lg flex-shrink-0',
                      isActive ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      <Info className={cn(
                        'h-5 w-5',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg truncate">{profile.name}</CardTitle>
                        {isActive && (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Activo
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm line-clamp-2">
                        {profile.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Use Case */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Cuándo usar:</p>
                    <p className="text-sm line-clamp-2">{profile.metadata.useCase}</p>
                  </div>

                  {/* Benefits Preview */}
                  {profile.metadata.benefits.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Beneficios:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {profile.metadata.benefits.slice(0, 2).map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span>•</span>
                            <span className="line-clamp-1">{benefit}</span>
                          </li>
                        ))}
                        {profile.metadata.benefits.length > 2 && (
                          <li className="text-xs text-muted-foreground/70">
                            +{profile.metadata.benefits.length - 2} más
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    className={cn(
                      'w-full',
                      isActive && 'bg-green-500 hover:bg-green-600'
                    )}
                    disabled={isApplying || isActive}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isActive) {
                        applyProfile(profile)
                      }
                    }}
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Aplicando...
                      </>
                    ) : isActive ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Perfil Activo
                      </>
                    ) : (
                      'Activar Perfil'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Reset Button */}
      {activeProfileId && (
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="w-full"
          >
            Restablecer a Valores por Defecto
          </Button>
        </div>
      )}
    </div>
  )
}

