import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'
import { Eye, TextAa, FrameCorners } from '@phosphor-icons/react'

export function QuickAccessibilitySettings() {
  const { preferences, updatePreference } = useAccessibilityPreferences()

  if (!preferences) return null

  const textSizeOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Large' },
    { value: 'x-large', label: 'X-Large' },
  ] as const

  return (
    <Card className="p-6 border-2 border-muted/50 bg-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-foreground to-foreground/70">
          <Eye size={20} weight="fill" className="text-background" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">Accessibility Settings</h3>
          <p className="text-sm text-muted-foreground">Customize your experience</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="text-size" className="text-sm font-semibold flex items-center gap-2">
            <TextAa size={18} aria-hidden="true" />
            Text Size
          </Label>
          <div className="flex gap-2" role="radiogroup" aria-label="Text size options">
            {textSizeOptions.map((option) => (
              <Button
                key={option.value}
                variant={preferences.textSize === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => updatePreference('textSize', option.value)}
                className="flex-1"
                role="radio"
                aria-checked={preferences.textSize === option.value}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 py-3 border-t">
          <div className="flex-1">
            <Label htmlFor="high-contrast" className="text-sm font-semibold cursor-pointer">
              High Contrast Mode
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Increase visual contrast for better readability
            </p>
          </div>
          <Switch
            id="high-contrast"
            checked={preferences.highContrast}
            onCheckedChange={(checked) => updatePreference('highContrast', checked)}
            aria-label="Toggle high contrast mode"
          />
        </div>

        <div className="flex items-center justify-between gap-3 py-3 border-t">
          <div className="flex-1">
            <Label htmlFor="reduce-motion" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
              <FrameCorners size={18} aria-hidden="true" />
              Reduce Motion
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Minimize animations and visual effects
            </p>
          </div>
          <Switch
            id="reduce-motion"
            checked={preferences.reduceMotion}
            onCheckedChange={(checked) => updatePreference('reduceMotion', checked)}
            aria-label="Toggle reduce motion"
          />
        </div>

        <div className="flex items-center justify-between gap-3 py-3 border-t">
          <div className="flex-1">
            <Label htmlFor="captions-enabled" className="text-sm font-semibold cursor-pointer">
              Enable Captions
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Show captions for all video and audio content
            </p>
          </div>
          <Switch
            id="captions-enabled"
            checked={preferences.captionsEnabled}
            onCheckedChange={(checked) => updatePreference('captionsEnabled', checked)}
            aria-label="Toggle captions"
          />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Settings are saved automatically and apply across all courses
        </p>
      </div>
    </Card>
  )
}
