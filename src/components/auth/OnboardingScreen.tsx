import { useState } from 'react'
import { useBranding } from '@/hooks/use-branding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import { User, TextAa, Palette, SpeakerSlash, Sparkle } from '@phosphor-icons/react'
import { OnboardingPreferences } from '@/lib/types'

interface OnboardingScreenProps {
  userEmail: string
  onComplete: (preferences: OnboardingPreferences) => void
}

const AVATAR_OPTIONS = [
  { emoji: '🦁', label: 'Lion' },
  { emoji: '🦅', label: 'Eagle' },
  { emoji: '🐉', label: 'Dragon' },
  { emoji: '🦊', label: 'Fox' },
  { emoji: '🐻', label: 'Bear' },
  { emoji: '🦉', label: 'Owl' },
  { emoji: '🐺', label: 'Wolf' },
  { emoji: '🦈', label: 'Shark' }
]

const TEXT_SIZE_OPTIONS: Array<{ value: 'normal' | 'large' | 'x-large'; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Large' },
  { value: 'x-large', label: 'Extra Large' }
]

export function OnboardingScreen({ userEmail, onComplete }: OnboardingScreenProps) {
  const { branding } = useBranding()
  const [displayName, setDisplayName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].emoji)
  const [highContrast, setHighContrast] = useState(false)
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'x-large'>('normal')
  const [reduceMotion, setReduceMotion] = useState(false)
  const [disableSoundEffects, setDisableSoundEffects] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: 'Create Your Identity',
      description: 'Choose how you want to appear in GameLearn',
      content: (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="display-name" className="text-base font-medium">
              Display Name
            </Label>
            <Input
              id="display-name"
              type="text"
              placeholder="Enter your preferred name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-12 text-base"
              maxLength={30}
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              This is how you'll appear on leaderboards and in your profile
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Choose Your Avatar</Label>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option.emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(option.emoji)}
                  className={`h-16 w-16 rounded-xl border-2 flex items-center justify-center text-3xl transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    selectedAvatar === option.emoji
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                  aria-label={`Select ${option.label} avatar`}
                >
                  {option.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Avatar className="h-14 w-14 text-2xl">
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                {selectedAvatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-lg">{displayName || 'Your Name'}</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Accessibility Preferences',
      description: 'Customize your learning experience for optimal comfort',
      content: (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card">
            <div className="flex items-start gap-3 flex-1">
              <div className="rounded-lg bg-primary/10 p-2 mt-1">
                <Palette size={20} className="text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <Label htmlFor="high-contrast" className="text-base font-medium cursor-pointer">
                  High Contrast Mode
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Increases color contrast for better visibility
                </p>
              </div>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={setHighContrast}
              aria-label="Toggle high contrast mode"
            />
          </div>

          <div className="p-4 rounded-lg border bg-card space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-secondary/10 p-2 mt-1">
                <TextAa size={20} className="text-secondary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <Label className="text-base font-medium">Text Size</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Adjust text size for comfortable reading
                </p>
                <div className="flex gap-2">
                  {TEXT_SIZE_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={textSize === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTextSize(option.value)}
                      className="flex-1"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card">
            <div className="flex items-start gap-3 flex-1">
              <div className="rounded-lg bg-accent/10 p-2 mt-1">
                <Sparkle size={20} className="text-accent" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <Label htmlFor="reduce-motion" className="text-base font-medium cursor-pointer">
                  Reduce Motion
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Minimizes animations and visual effects
                </p>
              </div>
            </div>
            <Switch
              id="reduce-motion"
              checked={reduceMotion}
              onCheckedChange={setReduceMotion}
              aria-label="Toggle reduce motion"
            />
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card">
            <div className="flex items-start gap-3 flex-1">
              <div className="rounded-lg bg-muted p-2 mt-1">
                <SpeakerSlash size={20} className="text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <Label htmlFor="disable-sound" className="text-base font-medium cursor-pointer">
                  Disable Sound Effects
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Turn off audio feedback for achievements and actions
                </p>
              </div>
            </div>
            <Switch
              id="disable-sound"
              checked={disableSoundEffects}
              onCheckedChange={setDisableSoundEffects}
              aria-label="Toggle sound effects"
            />
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-foreground">
              <strong>Note:</strong> You can change these preferences anytime from the accessibility panel.
            </p>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    const preferences: OnboardingPreferences = {
      highContrast,
      textSize,
      reduceMotion,
      disableSoundEffects,
      avatar: selectedAvatar,
      displayName: displayName || undefined
    }
    onComplete(preferences)
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/10 to-secondary/10 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          {branding?.logoUrl ? (
            <motion.div
              className="flex justify-center mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <img
                src={branding.logoUrl}
                alt="Company logo"
                className="max-h-24 max-w-full object-contain"
              />
            </motion.div>
          ) : (
            <motion.div
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <User size={32} weight="fill" className="text-white" aria-hidden="true" />
            </motion.div>
          )}
          <h1 className="text-3xl font-bold">Welcome to {branding?.companyName || 'GameLearn'}!</h1>
          <p className="text-muted-foreground mt-2">Let's set up your learning experience</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <Card className="shadow-2xl border-2">
          <CardHeader>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-base">{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStepData.content}
            </motion.div>

            <div className="flex gap-3 mt-8">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1 h-12 text-base">
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={handleNext} className="flex-1 h-12 text-base font-semibold">
                  Continue
                </Button>
              ) : (
                <Button type="button" onClick={handleComplete} className="flex-1 h-12 text-base font-semibold">
                  Complete Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
