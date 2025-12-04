import { useState, useEffect } from 'react'
import { AccessibilityProfile } from '@/hooks/use-accessibility-profiles'
import { ApiService } from '@/services/api.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Save,
  X,
  Info,
  Settings,
  FileText,
  Eye,
  Plus,
  Trash2,
} from 'lucide-react'
import { AdvancedPreferences } from '@/components/accessibility/AdvancedAccessibilityPanel'
import { defaultAdvancedPreferences } from '@/components/accessibility/AdvancedAccessibilityPanel'

interface AccessibilityProfileEditorProps {
  profile?: AccessibilityProfile
  onClose: () => void
  onSave: () => void
}

export function AccessibilityProfileEditor({
  profile,
  onClose,
  onSave,
}: AccessibilityProfileEditorProps) {
  const isEditing = !!profile

  // Basic Info
  const [name, setName] = useState(profile?.name || '')
  const [description, setDescription] = useState(profile?.description || '')
  const [icon, setIcon] = useState(profile?.icon || '')
  const [enabled, setEnabled] = useState(profile?.enabled ?? true)

  // Settings
  const [settings, setSettings] = useState<AdvancedPreferences>(
    profile?.settings || defaultAdvancedPreferences
  )

  // Metadata
  const [useCase, setUseCase] = useState(profile?.metadata.useCase || '')
  const [objective, setObjective] = useState(profile?.metadata.objective || '')
  const [benefits, setBenefits] = useState<string[]>(profile?.metadata.benefits || [''])
  const [recommendedSettings, setRecommendedSettings] = useState(
    profile?.metadata.recommendedSettings || ''
  )
  const [targetAudience, setTargetAudience] = useState(
    profile?.metadata.targetAudience || ''
  )

  const [saving, setSaving] = useState(false)

  const addBenefit = () => {
    setBenefits([...benefits, ''])
  }

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index))
  }

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits]
    newBenefits[index] = value
    setBenefits(newBenefits)
  }

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      toast.error('El nombre del perfil es requerido')
      return
    }

    if (!description.trim()) {
      toast.error('La descripción del perfil es requerida')
      return
    }

    if (!useCase.trim()) {
      toast.error('El caso de uso es requerido')
      return
    }

    if (!objective.trim()) {
      toast.error('El objetivo es requerido')
      return
    }

    if (!targetAudience.trim()) {
      toast.error('La audiencia objetivo es requerida')
      return
    }

    const validBenefits = benefits.filter(b => b.trim())
    if (validBenefits.length === 0) {
      toast.error('Debe agregar al menos un beneficio')
      return
    }

    try {
      setSaving(true)

      const profileData = {
        name: name.trim(),
        description: description.trim(),
        icon: icon.trim() || undefined,
        enabled,
        settings,
        metadata: {
          useCase: useCase.trim(),
          objective: objective.trim(),
          benefits: validBenefits,
          recommendedSettings: recommendedSettings.trim() || undefined,
          targetAudience: targetAudience.trim(),
        },
      }

      if (isEditing) {
        await ApiService.updateAccessibilityProfile(profile.id, profileData)
        toast.success(`Perfil "${name}" actualizado`)
      } else {
        await ApiService.createAccessibilityProfile(profileData)
        toast.success(`Perfil "${name}" creado`)
      }

      onSave()
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast.error(error.message || 'Error al guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            {isEditing ? 'Editar Perfil' : 'Crear Nuevo Perfil'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing
              ? 'Modifica la configuración y metadata del perfil'
              : 'Crea un nuevo perfil de accesibilidad personalizado'}
          </p>
        </div>
        <Button variant="ghost" onClick={onClose} className="gap-2">
          <X size={20} />
          Cancelar
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Información</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Configura el nombre, descripción y estado del perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Perfil *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Discalexia, Baja Visión, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción Corta *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descripción del perfil (aparecerá en la lista)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icono (opcional)</Label>
                <Input
                  id="icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="Nombre del icono de lucide-react (ej: Settings, Eye, etc.)"
                />
                <p className="text-xs text-muted-foreground">
                  Deja vacío para usar el icono por defecto
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled">Perfil Activo</Label>
                  <p className="text-xs text-muted-foreground">
                    Solo los perfiles activos serán visibles para los usuarios finales
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              </div>

              {profile?.isDefault && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Este es un perfil del sistema. Puedes modificarlo pero no eliminarlo.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Técnica</CardTitle>
              <CardDescription>
                Ajusta todas las preferencias de accesibilidad que se aplicarán cuando
                los usuarios seleccionen este perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Esta sección contiene todas las opciones técnicas. Por ahora, puedes
                  usar los valores por defecto o ajustarlos manualmente. En futuras
                  versiones se agregará una interfaz visual completa para cada opción.
                </AlertDescription>
              </Alert>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    La configuración técnica se guardará tal como está configurada en el
                    perfil actual. Para una edición completa, usa el panel de accesibilidad
                    avanzado y luego copia los valores aquí.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metadata */}
        <TabsContent value="metadata" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información para Administradores</CardTitle>
              <CardDescription>
                Esta información ayuda a los administradores a entender el perfil y
                decidir cuándo activarlo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="useCase">Caso de Uso *</Label>
                <Textarea
                  id="useCase"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="Describe cuándo y por qué usar este perfil..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Ej: "Para usuarios con dificultades para leer texto debido a la forma
                  de las letras..."
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objetivo *</Label>
                <Textarea
                  id="objective"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="¿Qué busca lograr este perfil?"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Ej: "Mejorar la legibilidad del texto mediante fuente especializada..."
                </p>
              </div>

              <div className="space-y-2">
                <Label>Beneficios *</Label>
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder={`Beneficio ${index + 1}`}
                    />
                    {benefits.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBenefit(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBenefit}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Agregar Beneficio
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendedSettings">Configuraciones Recomendadas</Label>
                <Textarea
                  id="recommendedSettings"
                  value={recommendedSettings}
                  onChange={(e) => setRecommendedSettings(e.target.value)}
                  placeholder="Notas sobre configuraciones recomendadas o ajustes adicionales..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">Opcional</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Audiencia Objetivo *</Label>
                <Input
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Ej: Usuarios con dislexia, dificultades de lectura..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>
              Cómo se verá este perfil para los usuarios finales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 border rounded-lg bg-card">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{name || 'Nombre del Perfil'}</h3>
                    <p className="text-muted-foreground">{description || 'Descripción del perfil'}</p>
                  </div>
                  {enabled && (
                    <Badge variant="default" className="bg-green-500">
                      Activo
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Audiencia:</p>
                    <p className="text-sm text-muted-foreground">
                      {targetAudience || 'Audiencia objetivo'}
                    </p>
                  </div>

                  {benefits.filter(b => b.trim()).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Beneficios:</p>
                      <ul className="space-y-1">
                        {benefits
                          .filter(b => b.trim())
                          .map((benefit, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span>•</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Perfil'}
        </Button>
      </div>
    </div>
  )
}

