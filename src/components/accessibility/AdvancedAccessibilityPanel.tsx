import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Type as TypeIcon, 
  X, 
  Eye, 
  Volume2,
  Keyboard,
  Brain,
  Palette,
  ZoomIn
} from 'lucide-react'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'

interface AdvancedPreferences {
  // Visual
  textSize: 'normal' | 'large' | 'x-large' | 'custom'
  customTextSize: number // 100-400%
  lineHeight: 'tight' | 'normal' | 'relaxed' | 'loose'
  letterSpacing: 'tight' | 'normal' | 'wide'
  wordSpacing: 'normal' | 'wide'
  fontFamily: 'default' | 'dyslexia' | 'sans-serif' | 'serif' | 'monospace'
  highContrast: boolean
  contrastScheme: 'default' | 'dark' | 'light' | 'yellow-on-black'
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  invertColors: boolean
  pageZoom: number // 100-400%
  
  // Audio
  captionsEnabled: boolean
  captionSize: 'small' | 'medium' | 'large' | 'x-large'
  captionBackground: string
  captionTextColor: string
  captionPosition: 'top' | 'bottom' | 'center'
  soundEffects: boolean
  audioDescription: boolean
  
  // Navigation
  playbackSpeed: number
  reduceMotion: boolean
  simplifiedNavigation: boolean
  autoPause: boolean
  pauseDuration: number
  
  // Cognitive
  readingMode: 'normal' | 'simplified'
  showTooltips: boolean
  noTimeLimits: boolean
}

const defaultAdvancedPreferences: AdvancedPreferences = {
  textSize: 'normal',
  customTextSize: 100,
  lineHeight: 'normal',
  letterSpacing: 'normal',
  wordSpacing: 'normal',
  fontFamily: 'default',
  highContrast: false,
  contrastScheme: 'default',
  colorBlindness: 'none',
  invertColors: false,
  pageZoom: 100,
  captionsEnabled: true,
  captionSize: 'medium',
  captionBackground: '#000000',
  captionTextColor: '#ffffff',
  captionPosition: 'bottom',
  soundEffects: false,
  audioDescription: false,
  playbackSpeed: 1,
  reduceMotion: false,
  simplifiedNavigation: false,
  autoPause: false,
  pauseDuration: 5,
  readingMode: 'normal',
  showTooltips: true,
  noTimeLimits: false,
}

const accessibilityProfiles = {
  dyslexia: {
    name: 'Discalexia',
    description: 'Fuente especializada y espaciado mejorado',
    settings: {
      fontFamily: 'dyslexia' as const,
      lineHeight: 'relaxed' as const,
      letterSpacing: 'wide' as const,
      wordSpacing: 'wide' as const,
      textSize: 'large' as const,
    }
  },
  lowVision: {
    name: 'Baja Visión',
    description: 'Alto contraste y texto grande',
    settings: {
      highContrast: true,
      contrastScheme: 'yellow-on-black' as const,
      textSize: 'x-large' as const,
      pageZoom: 150,
    }
  },
  colorBlind: {
    name: 'Daltonismo',
    description: 'Filtros de color y alto contraste',
    settings: {
      colorBlindness: 'protanopia' as const,
      highContrast: true,
    }
  },
  hearing: {
    name: 'Auditiva',
    description: 'Subtítulos grandes y notificaciones visuales',
    settings: {
      captionsEnabled: true,
      captionSize: 'x-large' as const,
      soundEffects: false,
      audioDescription: true,
    }
  },
  motor: {
    name: 'Motora',
    description: 'Navegación simplificada y sin límites de tiempo',
    settings: {
      simplifiedNavigation: true,
      noTimeLimits: true,
      autoPause: true,
      pauseDuration: 10,
    }
  },
  cognitive: {
    name: 'Cognitiva',
    description: 'Lectura simplificada y ayudas contextuales',
    settings: {
      readingMode: 'simplified' as const,
      showTooltips: true,
      noTimeLimits: true,
      autoPause: true,
    }
  }
}

export function AdvancedAccessibilityPanel() {
  const { preferences: basePreferences, updatePreference, updateProfile } = useAccessibilityPreferences()
  const [isOpen, setIsOpen] = useState(false)
  const [preferences, setPreferences] = useState<AdvancedPreferences>(() => {
    const stored = localStorage.getItem('advanced-accessibility-preferences')
    return stored ? { ...defaultAdvancedPreferences, ...JSON.parse(stored) } : defaultAdvancedPreferences
  })

  // Apply preferences to document
  useEffect(() => {
    const root = document.documentElement
    
    // Text size
    if (preferences.textSize === 'custom') {
      root.style.fontSize = `${preferences.customTextSize}%`
    } else {
      const sizes = { normal: '100%', large: '125%', 'x-large': '150%' }
      root.style.fontSize = sizes[preferences.textSize]
    }
    
    // Line height
    const lineHeights = { tight: '1.2', normal: '1.5', relaxed: '1.8', loose: '2.2' }
    root.style.setProperty('--line-height', lineHeights[preferences.lineHeight])
    
    // Letter spacing
    const letterSpacings = { tight: '-0.01em', normal: '0', wide: '0.05em' }
    root.style.setProperty('--letter-spacing', letterSpacings[preferences.letterSpacing])
    
    // Word spacing
    const wordSpacings = { normal: '0', wide: '0.2em' }
    root.style.setProperty('--word-spacing', wordSpacings[preferences.wordSpacing])
    
    // Font family
    const fonts = {
      default: 'Poppins, system-ui, sans-serif',
      dyslexia: 'OpenDyslexic, Comic Sans MS, system-ui, sans-serif',
      'sans-serif': 'system-ui, sans-serif',
      serif: 'Georgia, serif',
      monospace: 'Courier New, monospace'
    }
    root.style.fontFamily = fonts[preferences.fontFamily]
    
    // High contrast
    root.classList.toggle('high-contrast', preferences.highContrast)
    root.classList.toggle('contrast-dark', preferences.contrastScheme === 'dark')
    root.classList.toggle('contrast-light', preferences.contrastScheme === 'light')
    root.classList.toggle('contrast-yellow-black', preferences.contrastScheme === 'yellow-on-black')
    
    // Color blindness
    root.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia')
    if (preferences.colorBlindness !== 'none') {
      root.classList.add(`colorblind-${preferences.colorBlindness}`)
    }
    
    // Invert colors
    root.classList.toggle('invert-colors', preferences.invertColors)
    
    // Page zoom
    root.style.zoom = `${preferences.pageZoom}%`
    
    // Reduce motion
    root.classList.toggle('reduce-motion', preferences.reduceMotion)
    
    // Simplified navigation
    root.classList.toggle('simplified-navigation', preferences.simplifiedNavigation)
    
    // Reading mode
    root.classList.toggle('reading-mode-simplified', preferences.readingMode === 'simplified')
    
    // Save to localStorage
    localStorage.setItem('advanced-accessibility-preferences', JSON.stringify(preferences))
  }, [preferences])

  const updateAdvancedPreference = <K extends keyof AdvancedPreferences>(
    key: K,
    value: AdvancedPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const applyProfile = (profileKey: keyof typeof accessibilityProfiles) => {
    const profile = accessibilityProfiles[profileKey]
    setPreferences(prev => ({ ...prev, ...profile.settings }))
  }

  const resetToDefaults = () => {
    setPreferences(defaultAdvancedPreferences)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        aria-label={isOpen ? "Cerrar configuración de accesibilidad" : "Abrir configuración de accesibilidad"}
        aria-expanded={isOpen}
      >
        <Settings size={24} aria-hidden="true" />
      </Button>

      {isOpen && (
        <Card
          className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-4xl max-h-[80vh] overflow-y-auto shadow-xl border-2"
          role="dialog"
          aria-label="Panel de Accesibilidad Avanzado"
          aria-modal="true"
        >
          <CardHeader className="sticky top-0 bg-card z-10 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Settings size={24} />
                  Accesibilidad e Inclusión
                </CardTitle>
                <CardDescription>
                  Personaliza tu experiencia para que la plataforma sea accesible para ti
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                aria-label="Cerrar"
              >
                <X size={20} aria-hidden="true" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs defaultValue="profiles" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profiles">Perfiles</TabsTrigger>
                <TabsTrigger value="visual">Visual</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="navegacion">Navegación</TabsTrigger>
                <TabsTrigger value="cognitiva">Cognitiva</TabsTrigger>
              </TabsList>

              {/* Perfiles Predefinidos */}
              <TabsContent value="profiles" className="space-y-4 mt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(accessibilityProfiles).map(([key, profile]) => (
                    <Card
                      key={key}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => applyProfile(key as keyof typeof accessibilityProfiles)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <CardDescription>{profile.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button variant="outline" onClick={resetToDefaults}>
                    Restablecer a Valores por Defecto
                  </Button>
                </div>
              </TabsContent>

              {/* Preferencias Visuales */}
              <TabsContent value="visual" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TypeIcon size={20} />
                    <Label className="text-lg font-semibold">Texto y Tipografía</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Tamaño de Texto</Label>
                    <div className="flex gap-2">
                      {(['normal', 'large', 'x-large'] as const).map((size) => (
                        <Button
                          key={size}
                          variant={preferences.textSize === size ? 'default' : 'outline'}
                          onClick={() => updateAdvancedPreference('textSize', size)}
                          className="flex-1"
                        >
                          {size === 'normal' ? 'Normal' : size === 'large' ? 'Grande' : 'Muy Grande'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {preferences.textSize === 'custom' && (
                    <div className="space-y-2">
                      <Label>Tamaño Personalizado: {preferences.customTextSize}%</Label>
                      <Slider
                        min={100}
                        max={400}
                        step={25}
                        value={[preferences.customTextSize]}
                        onValueChange={(value) => updateAdvancedPreference('customTextSize', value[0])}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Fuente</Label>
                    <Select
                      value={preferences.fontFamily}
                      onValueChange={(value: AdvancedPreferences['fontFamily']) =>
                        updateAdvancedPreference('fontFamily', value)
                      }
                    >
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label>Altura de Línea</Label>
                    <Select
                      value={preferences.lineHeight}
                      onValueChange={(value: AdvancedPreferences['lineHeight']) =>
                        updateAdvancedPreference('lineHeight', value)
                      }
                    >
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label>Espaciado entre Letras</Label>
                    <Select
                      value={preferences.letterSpacing}
                      onValueChange={(value: AdvancedPreferences['letterSpacing']) =>
                        updateAdvancedPreference('letterSpacing', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tight">Ajustado</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="wide">Amplio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Palette size={20} />
                    <Label className="text-lg font-semibold">Colores y Contraste</Label>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast">Alto Contraste</Label>
                    <Switch
                      id="high-contrast"
                      checked={preferences.highContrast}
                      onCheckedChange={(checked) => updateAdvancedPreference('highContrast', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Esquema de Contraste</Label>
                    <Select
                      value={preferences.contrastScheme}
                      onValueChange={(value: AdvancedPreferences['contrastScheme']) =>
                        updateAdvancedPreference('contrastScheme', value)
                      }
                    >
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label>Filtro de Daltonismo</Label>
                    <Select
                      value={preferences.colorBlindness}
                      onValueChange={(value: AdvancedPreferences['colorBlindness']) =>
                        updateAdvancedPreference('colorBlindness', value)
                      }
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="invert-colors">Invertir Colores</Label>
                    <Switch
                      id="invert-colors"
                      checked={preferences.invertColors}
                      onCheckedChange={(checked) => updateAdvancedPreference('invertColors', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <ZoomIn size={20} />
                    <Label className="text-lg font-semibold">Zoom</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Zoom de Página: {preferences.pageZoom}%</Label>
                    <Slider
                      min={100}
                      max={400}
                      step={25}
                      value={[preferences.pageZoom]}
                      onValueChange={(value) => updateAdvancedPreference('pageZoom', value[0])}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>100%</span>
                      <span>200%</span>
                      <span>300%</span>
                      <span>400%</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Preferencias Auditivas */}
              <TabsContent value="audio" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Volume2 size={20} />
                    <Label className="text-lg font-semibold">Subtítulos y Audio</Label>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="captions">Activar Subtítulos</Label>
                    <Switch
                      id="captions"
                      checked={preferences.captionsEnabled}
                      onCheckedChange={(checked) => updateAdvancedPreference('captionsEnabled', checked)}
                    />
                  </div>

                  {preferences.captionsEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Tamaño de Subtítulos</Label>
                        <Select
                          value={preferences.captionSize}
                          onValueChange={(value: AdvancedPreferences['captionSize']) =>
                            updateAdvancedPreference('captionSize', value)
                          }
                        >
                          <SelectTrigger>
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

                      <div className="space-y-2">
                        <Label>Posición de Subtítulos</Label>
                        <Select
                          value={preferences.captionPosition}
                          onValueChange={(value: AdvancedPreferences['captionPosition']) =>
                            updateAdvancedPreference('captionPosition', value)
                          }
                        >
                          <SelectTrigger>
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
                    <Label htmlFor="audio-description">Descripción de Audio</Label>
                    <Switch
                      id="audio-description"
                      checked={preferences.audioDescription}
                      onCheckedChange={(checked) => updateAdvancedPreference('audioDescription', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-effects">Efectos de Sonido</Label>
                    <Switch
                      id="sound-effects"
                      checked={preferences.soundEffects}
                      onCheckedChange={(checked) => updateAdvancedPreference('soundEffects', checked)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Navegación */}
              <TabsContent value="navegacion" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Keyboard size={20} />
                    <Label className="text-lg font-semibold">Navegación y Reproducción</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Velocidad de Reproducción: {preferences.playbackSpeed}x</Label>
                    <Slider
                      min={0.5}
                      max={2}
                      step={0.25}
                      value={[preferences.playbackSpeed]}
                      onValueChange={(value) => updateAdvancedPreference('playbackSpeed', value[0])}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>0.5x</span>
                      <span>1.0x</span>
                      <span>1.5x</span>
                      <span>2.0x</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduce-motion">Reducir Animaciones</Label>
                    <Switch
                      id="reduce-motion"
                      checked={preferences.reduceMotion}
                      onCheckedChange={(checked) => updateAdvancedPreference('reduceMotion', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="simplified-nav">Navegación Simplificada</Label>
                    <Switch
                      id="simplified-nav"
                      checked={preferences.simplifiedNavigation}
                      onCheckedChange={(checked) => updateAdvancedPreference('simplifiedNavigation', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-pause">Pausas Automáticas</Label>
                    <Switch
                      id="auto-pause"
                      checked={preferences.autoPause}
                      onCheckedChange={(checked) => updateAdvancedPreference('autoPause', checked)}
                    />
                  </div>

                  {preferences.autoPause && (
                    <div className="space-y-2">
                      <Label>Duración de Pausa: {preferences.pauseDuration} segundos</Label>
                      <Slider
                        min={5}
                        max={30}
                        step={5}
                        value={[preferences.pauseDuration]}
                        onValueChange={(value) => updateAdvancedPreference('pauseDuration', value[0])}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Cognitiva */}
              <TabsContent value="cognitiva" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Brain size={20} />
                    <Label className="text-lg font-semibold">Ayudas Cognitivas</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Modo de Lectura</Label>
                    <Select
                      value={preferences.readingMode}
                      onValueChange={(value: AdvancedPreferences['readingMode']) =>
                        updateAdvancedPreference('readingMode', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="simplified">Simplificada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="tooltips">Mostrar Ayudas Contextuales</Label>
                    <Switch
                      id="tooltips"
                      checked={preferences.showTooltips}
                      onCheckedChange={(checked) => updateAdvancedPreference('showTooltips', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="no-time-limits">Sin Límites de Tiempo</Label>
                    <Switch
                      id="no-time-limits"
                      checked={preferences.noTimeLimits}
                      onCheckedChange={(checked) => updateAdvancedPreference('noTimeLimits', checked)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </>
  )
}

