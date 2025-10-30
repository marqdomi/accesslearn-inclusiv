import { useKV } from '@github/spark/hooks'
import { UserPreferences } from '@/lib/types'

const defaultPreferences: UserPreferences = {
  textSize: 'normal',
  playbackSpeed: 1,
  highContrast: false,
  captionsEnabled: true,
  reduceMotion: false,
}

export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useKV<UserPreferences>(
    'accessibility-preferences',
    defaultPreferences
  )

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((current) => ({
      ...(current || defaultPreferences),
      [key]: value,
    }))
  }

  return {
    preferences,
    updatePreference,
    setPreferences,
  }
}
