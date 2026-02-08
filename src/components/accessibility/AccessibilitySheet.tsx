/**
 * AccessibilitySheet — Slide-over panel for accessibility settings.
 *
 * Replaces the old floating-button AdvancedAccessibilityPanel.
 * Opened from the sidebar or via the `useAccessibility().setIsOpen(true)` API.
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useTheme } from '@/hooks/use-theme'
import {
  useAccessibility,
  type AdvancedPreferences,
  type ProfileKey,
} from '@/contexts/AccessibilityContext'
import {
  Eye,
  SpeakerHigh,
  Keyboard,
  Brain,
  Palette,
  MagnifyingGlassPlus,
  ArrowCounterClockwise,
} from '@phosphor-icons/react'

/* ─── Profile Card ─────────────────────────────────────────── */

function ProfileCard({
  icon,
  name,
  description,
  isActive,
  onSelect,
}: {
  icon: string
  name: string
  description: string
  isActive: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
        isActive
          ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{name}</span>
            {isActive && (
              <Badge variant="default" className="text-[10px] py-0 px-1.5">
                Activo
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </button>
  )
}

/* ─── Main component ──────────────────────────────────────── */

export function AccessibilitySheet() {
  const {
    preferences,
    activeProfile,
    isOpen,
    setIsOpen,
    applyProfile,
    updatePreference,
    resetToDefaults,
    profiles,
  } = useAccessibility()
  const { theme } = useTheme()

  const update = <K extends keyof AdvancedPreferences>(
    key: K,
    value: AdvancedPreferences[K]
  ) => updatePreference(key, value)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="w-[380px] sm:w-[420px] sm:max-w-[420px] p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Eye size={22} weight="duotone" className="text-primary" />
            Accesibilidad
          </SheetTitle>
          <SheetDescription>
            Personaliza la experiencia según tus necesidades. Elige un perfil rápido o ajusta cada opción.
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <ScrollArea className="flex-1 px-5">
          <Tabs defaultValue="perfiles" className="mt-4">
            <TabsList className="grid w-full grid-cols-5 h-9">
              <TabsTrigger value="perfiles" className="text-xs px-1">Perfiles</TabsTrigger>
              <TabsTrigger value="visual" className="text-xs px-1">Visual</TabsTrigger>
              <TabsTrigger value="audio" className="text-xs px-1">Audio</TabsTrigger>
              <TabsTrigger value="nav" className="text-xs px-1">Nav</TabsTrigger>
              <TabsTrigger value="cognitiva" className="text-xs px-1">Cognitiva</TabsTrigger>
            </TabsList>

            {/* ── Perfiles ── */}
            <TabsContent value="perfiles" className="space-y-3 mt-4 pb-6">
              <p className="text-xs text-muted-foreground">
                Selecciona un perfil predefinido basado en investigación WCAG 2.2. Puedes personalizarlo
                después en las otras pestañas.
              </p>

              {/* None / Reset */}
              <button
                onClick={() => applyProfile('none')}
                className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
                  activeProfile === 'none'
                    ? 'border-muted-foreground/50 bg-muted/30'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">🚫</span>
                  <div className="min-w-0">
                    <span className="font-semibold text-sm">Sin perfil</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Configuración por defecto, sin adaptaciones
                    </p>
                  </div>
                </div>
              </button>

              {profiles.map((p) => (
                <ProfileCard
                  key={p.key}
                  icon={p.icon}
                  name={p.name}
                  description={p.description}
                  isActive={activeProfile === p.key}
                  onSelect={() => applyProfile(p.key)}
                />
              ))}
            </TabsContent>

            {/* ── Visual ── */}
            <TabsContent value="visual" className="space-y-5 mt-4 pb-6">
              {/* Text size */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tamaño de Texto</Label>
                <div className="flex gap-2">
                  {(['normal', 'large', 'x-large'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={preferences.textSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => update('textSize', size)}
                      className="flex-1 h-9 text-xs"
                    >
                      {size === 'normal' ? 'Normal' : size === 'large' ? 'Grande' : 'Muy Grande'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Font */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fuente</Label>
                <Select
                  value={preferences.fontFamily}
                  onValueChange={(v: AdvancedPreferences['fontFamily']) =>
                    update('fontFamily', v)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Por Defecto (Poppins)</SelectItem>
                    <SelectItem value="dyslexia">Dyslexia-Friendly</SelectItem>
                    <SelectItem value="sans-serif">Sans-Serif</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Line height */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Altura de Línea</Label>
                <Select
                  value={preferences.lineHeight}
                  onValueChange={(v: AdvancedPreferences['lineHeight']) =>
                    update('lineHeight', v)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tight">Ajustada</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="relaxed">Relajada</SelectItem>
                    <SelectItem value="loose">Espaciada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Letter spacing */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Espaciado entre Letras</Label>
                <Select
                  value={preferences.letterSpacing}
                  onValueChange={(v: AdvancedPreferences['letterSpacing']) =>
                    update('letterSpacing', v)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tight">Ajustado</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="wide">Amplio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Contrast */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette size={16} weight="duotone" />
                  <Label className="text-sm font-semibold">Colores y Contraste</Label>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="hc" className="text-sm">Alto Contraste</Label>
                  <Switch
                    id="hc"
                    checked={preferences.highContrast}
                    onCheckedChange={(v) => update('highContrast', v)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Esquema de Contraste</Label>
                  <Select
                    value={preferences.contrastScheme}
                    onValueChange={(v: AdvancedPreferences['contrastScheme']) =>
                      update('contrastScheme', v)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Por Defecto</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="yellow-on-black">Amarillo sobre Negro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Filtro de Daltonismo</Label>
                  <Select
                    value={preferences.colorBlindness}
                    onValueChange={(v: AdvancedPreferences['colorBlindness']) =>
                      update('colorBlindness', v)
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
                      <SelectItem value="protanopia">Protanopia</SelectItem>
                      <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                      <SelectItem value="tritanopia">Tritanopia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="invert" className="text-sm">Invertir Colores</Label>
                  <Switch
                    id="invert"
                    checked={preferences.invertColors}
                    onCheckedChange={(v) => update('invertColors', v)}
                  />
                </div>
              </div>

              <Separator />

              {/* Theme */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Palette size={16} weight="duotone" />
                  <Label className="text-sm font-semibold">Tema</Label>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">
                    {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Sistema'}
                  </span>
                  <ThemeToggle className="h-8 w-8" />
                </div>
              </div>

              <Separator />

              {/* Zoom */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MagnifyingGlassPlus size={16} weight="duotone" />
                  <Label className="text-sm font-semibold">Zoom de Página: {preferences.pageZoom}%</Label>
                </div>
                <Slider
                  min={100}
                  max={400}
                  step={25}
                  value={[preferences.pageZoom]}
                  onValueChange={([v]) => update('pageZoom', v)}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>100%</span>
                  <span>200%</span>
                  <span>300%</span>
                  <span>400%</span>
                </div>
              </div>
            </TabsContent>

            {/* ── Audio ── */}
            <TabsContent value="audio" className="space-y-4 mt-4 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <SpeakerHigh size={16} weight="duotone" />
                <Label className="text-sm font-semibold">Subtítulos y Audio</Label>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="captions" className="text-sm">Activar Subtítulos</Label>
                <Switch
                  id="captions"
                  checked={preferences.captionsEnabled}
                  onCheckedChange={(v) => update('captionsEnabled', v)}
                />
              </div>

              {preferences.captionsEnabled && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Tamaño de Subtítulos</Label>
                    <Select
                      value={preferences.captionSize}
                      onValueChange={(v: AdvancedPreferences['captionSize']) =>
                        update('captionSize', v)
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeño</SelectItem>
                        <SelectItem value="medium">Mediano</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                        <SelectItem value="x-large">Muy Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Posición</Label>
                    <Select
                      value={preferences.captionPosition}
                      onValueChange={(v: AdvancedPreferences['captionPosition']) =>
                        update('captionPosition', v)
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Arriba</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="bottom">Abajo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="audio-desc" className="text-sm">Descripción de Audio</Label>
                <Switch
                  id="audio-desc"
                  checked={preferences.audioDescription}
                  onCheckedChange={(v) => update('audioDescription', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sfx" className="text-sm">Efectos de Sonido</Label>
                <Switch
                  id="sfx"
                  checked={preferences.soundEffects}
                  onCheckedChange={(v) => update('soundEffects', v)}
                />
              </div>
            </TabsContent>

            {/* ── Navegación ── */}
            <TabsContent value="nav" className="space-y-4 mt-4 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <Keyboard size={16} weight="duotone" />
                <Label className="text-sm font-semibold">Navegación y Reproducción</Label>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  Velocidad de Reproducción: {preferences.playbackSpeed}x
                </Label>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.25}
                  value={[preferences.playbackSpeed]}
                  onValueChange={([v]) => update('playbackSpeed', v)}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>1.5x</span>
                  <span>2.0x</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="rm" className="text-sm">Reducir Animaciones</Label>
                <Switch
                  id="rm"
                  checked={preferences.reduceMotion}
                  onCheckedChange={(v) => update('reduceMotion', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sn" className="text-sm">Navegación Simplificada</Label>
                <Switch
                  id="sn"
                  checked={preferences.simplifiedNavigation}
                  onCheckedChange={(v) => update('simplifiedNavigation', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="ap" className="text-sm">Pausas Automáticas</Label>
                <Switch
                  id="ap"
                  checked={preferences.autoPause}
                  onCheckedChange={(v) => update('autoPause', v)}
                />
              </div>

              {preferences.autoPause && (
                <div className="space-y-2">
                  <Label className="text-sm">
                    Duración de Pausa: {preferences.pauseDuration}s
                  </Label>
                  <Slider
                    min={5}
                    max={30}
                    step={5}
                    value={[preferences.pauseDuration]}
                    onValueChange={([v]) => update('pauseDuration', v)}
                  />
                </div>
              )}
            </TabsContent>

            {/* ── Cognitiva ── */}
            <TabsContent value="cognitiva" className="space-y-4 mt-4 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <Brain size={16} weight="duotone" />
                <Label className="text-sm font-semibold">Ayudas Cognitivas</Label>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Modo de Lectura</Label>
                <Select
                  value={preferences.readingMode}
                  onValueChange={(v: AdvancedPreferences['readingMode']) =>
                    update('readingMode', v)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="simplified">Simplificada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="tt" className="text-sm">Mostrar Ayudas Contextuales</Label>
                <Switch
                  id="tt"
                  checked={preferences.showTooltips}
                  onCheckedChange={(v) => update('showTooltips', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="ntl" className="text-sm">Sin Límites de Tiempo</Label>
                <Switch
                  id="ntl"
                  checked={preferences.noTimeLimits}
                  onCheckedChange={(v) => update('noTimeLimits', v)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <Separator />

        <SheetFooter className="px-5 py-3 flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={resetToDefaults}
          >
            <ArrowCounterClockwise size={14} />
            Restablecer
          </Button>
          <Button size="sm" className="flex-1" onClick={() => setIsOpen(false)}>
            Listo
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
