import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'
import { Gear, TextAa, Gauge, X } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function AccessibilityPanel() {
  const { t } = useTranslation('accessibility')
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
    root.classList.toggle('reduce-motion', preferences.reduceMotion)
    
    const fontSize = preferences.textSize === 'large' ? '110%' : preferences.textSize === 'x-large' ? '125%' : '100%'
    root.style.fontSize = fontSize
  }, [preferences.highContrast, preferences.textSize, preferences.reduceMotion])

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-card hover:bg-card/90"
        aria-label={isOpen ? "Close accessibility settings" : "Open accessibility settings"}
        aria-expanded={isOpen}
      >
        <Gear size={24} weight="fill" aria-hidden="true" />
      </Button>

      {isOpen && (
        <Card
          className="fixed bottom-24 right-6 z-50 w-80 p-6 shadow-xl border-2"
          role="dialog"
          aria-label={t('accessibility.settings')}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('accessibility.settings')}</h2>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              aria-label={t('common.close')}
            >
              <X size={20} aria-hidden="true" />
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="mb-3 block text-sm font-medium">
                {t('accessibility.languageLabel')}
              </Label>
              <LanguageSwitcher variant="outline" showLabel />
            </div>

            <div>
              <Label htmlFor="text-size-group" className="mb-3 flex items-center gap-2 text-base font-medium">
                <TextAa size={20} aria-hidden="true" />
                {t('accessibility.textSize')}
              </Label>
              <div className="flex gap-2" role="group" aria-labelledby="text-size-group">
                <Button
                  variant={preferences.textSize === 'normal' ? 'default' : 'outline'}
                  size="default"
                  onClick={() => updatePreference('textSize', 'normal')}
                  aria-pressed={preferences.textSize === 'normal'}
                  className="flex-1 min-h-[44px]"
                >
                  {t('onboarding.step2.textSize.medium')}
                </Button>
                <Button
                  variant={preferences.textSize === 'large' ? 'default' : 'outline'}
                  size="default"
                  onClick={() => updatePreference('textSize', 'large')}
                  aria-pressed={preferences.textSize === 'large'}
                  className="flex-1 min-h-[44px]"
                >
                  {t('onboarding.step2.textSize.large')}
                </Button>
                <Button
                  variant={preferences.textSize === 'x-large' ? 'default' : 'outline'}
                  size="default"
                  onClick={() => updatePreference('textSize', 'x-large')}
                  aria-pressed={preferences.textSize === 'x-large'}
                  className="flex-1 min-h-[44px]"
                >
                  {t('onboarding.step2.textSize.xlarge')}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 min-h-[44px]">
                <Label htmlFor="high-contrast" className="text-base font-medium cursor-pointer">
                  {t('accessibility.highContrast')}
                </Label>
                <Switch
                  id="high-contrast"
                  checked={preferences.highContrast}
                  onCheckedChange={(checked) => updatePreference('highContrast', checked)}
                  aria-label={t('accessibility.highContrast')}
                />
              </div>

              <div className="flex items-center justify-between gap-4 min-h-[44px]">
                <Label htmlFor="captions" className="text-base font-medium cursor-pointer">
                  {t('accessibility.captionsEnabled')}
                </Label>
                <Switch
                  id="captions"
                  checked={preferences.captionsEnabled}
                  onCheckedChange={(checked) => updatePreference('captionsEnabled', checked)}
                  aria-label={t('accessibility.captionsEnabled')}
                />
              </div>

              <div className="flex items-center justify-between gap-4 min-h-[44px]">
                <Label htmlFor="reduce-motion" className="text-base font-medium cursor-pointer">
                  {t('accessibility.reduceMotion')}
                </Label>
                <Switch
                  id="reduce-motion"
                  checked={preferences.reduceMotion}
                  onCheckedChange={(checked) => updatePreference('reduceMotion', checked)}
                  aria-label={t('accessibility.reduceMotion')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="playback-speed" className="mb-3 flex items-center gap-2 text-base font-medium">
                <Gauge size={20} aria-hidden="true" />
                {t('accessibility.playbackSpeed')}: <span className="font-bold">{preferences.playbackSpeed}x</span>
              </Label>
              <Slider
                id="playback-speed"
                min={0.5}
                max={2}
                step={0.25}
                value={[preferences.playbackSpeed]}
                onValueChange={(value) => updatePreference('playbackSpeed', value[0])}
                aria-label={`Playback speed: ${preferences.playbackSpeed} times normal speed`}
                aria-valuemin={0.5}
                aria-valuemax={2}
                aria-valuenow={preferences.playbackSpeed}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0.5x</span>
                <span>1.0x</span>
                <span>1.5x</span>
                <span>2.0x</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
