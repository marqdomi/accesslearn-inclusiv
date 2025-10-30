import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'
import { Gear, TextAa, Gauge } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'

export function AccessibilityPanel() {
  const { preferences: rawPreferences, updatePreference } = useAccessibilityPreferences()
  const [isOpen, setIsOpen] = useState(false)
  
  const preferences = rawPreferences || {
    textSize: 'normal' as const,
    playbackSpeed: 1,
    highContrast: false,
    captionsEnabled: true,
    reduceMotion: false,
  }

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('high-contrast', preferences.highContrast)
    
    const fontSize = preferences.textSize === 'large' ? '110%' : preferences.textSize === 'x-large' ? '125%' : '100%'
    root.style.fontSize = fontSize
  }, [preferences.highContrast, preferences.textSize])

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        aria-label="Toggle accessibility settings"
        aria-expanded={isOpen}
      >
        <Gear size={24} aria-hidden="true" />
      </Button>

      {isOpen && (
        <Card
          className="fixed bottom-24 right-6 z-50 w-80 p-6 shadow-xl"
          role="dialog"
          aria-label="Accessibility settings"
        >
          <h2 className="mb-4 text-lg font-semibold">Accessibility Settings</h2>

          <div className="space-y-6">
            <div>
              <Label htmlFor="text-size" className="mb-2 flex items-center gap-2 text-base font-medium">
                <TextAa size={20} aria-hidden="true" />
                Text Size
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={preferences.textSize === 'normal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updatePreference('textSize', 'normal')}
                  aria-pressed={preferences.textSize === 'normal'}
                  className="flex-1"
                >
                  Normal
                </Button>
                <Button
                  variant={preferences.textSize === 'large' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updatePreference('textSize', 'large')}
                  aria-pressed={preferences.textSize === 'large'}
                  className="flex-1"
                >
                  Large
                </Button>
                <Button
                  variant={preferences.textSize === 'x-large' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updatePreference('textSize', 'x-large')}
                  aria-pressed={preferences.textSize === 'x-large'}
                  className="flex-1"
                >
                  X-Large
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="text-base font-medium">
                  High Contrast Mode
                </Label>
                <Switch
                  id="high-contrast"
                  checked={preferences.highContrast}
                  onCheckedChange={(checked) => updatePreference('highContrast', checked)}
                  aria-label="Toggle high contrast mode"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="captions" className="text-base font-medium">
                  Captions Enabled
                </Label>
                <Switch
                  id="captions"
                  checked={preferences.captionsEnabled}
                  onCheckedChange={(checked) => updatePreference('captionsEnabled', checked)}
                  aria-label="Toggle captions"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="reduce-motion" className="text-base font-medium">
                  Reduce Motion
                </Label>
                <Switch
                  id="reduce-motion"
                  checked={preferences.reduceMotion}
                  onCheckedChange={(checked) => updatePreference('reduceMotion', checked)}
                  aria-label="Toggle reduced motion"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="playback-speed" className="mb-3 flex items-center gap-2 text-base font-medium">
                <Gauge size={20} aria-hidden="true" />
                Playback Speed: {preferences.playbackSpeed}x
              </Label>
              <Slider
                id="playback-speed"
                min={0.5}
                max={2}
                step={0.25}
                value={[preferences.playbackSpeed]}
                onValueChange={(value) => updatePreference('playbackSpeed', value[0])}
                aria-label={`Playback speed: ${preferences.playbackSpeed}x`}
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>0.5x</span>
                <span>1.0x</span>
                <span>2.0x</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            className="mt-6 w-full"
          >
            Close
          </Button>
        </Card>
      )}
    </>
  )
}
