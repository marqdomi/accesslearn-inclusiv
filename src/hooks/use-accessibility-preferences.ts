import { useEffect } from 'react'
import { useLocalStorage } from './use-local-storage'
import { UserPreferences } from '@/lib/types'

const defaultPreferences: UserPreferences = {
  textSize: 'normal',
  playbackSpeed: 1,
  highContrast: false,
  captionsEnabled: true,
  reduceMotion: false,
}

export interface AccessibilityProfile {
  preferences: UserPreferences
  needsExtendedTime: boolean
  needsAudioDescription: boolean
  preferredFontFamily?: string
  customTimeMultiplier?: number
}

const defaultProfile: AccessibilityProfile = {
  preferences: defaultPreferences,
  needsExtendedTime: false,
  needsAudioDescription: false,
}

export function useAccessibilityPreferences() {
  const [profile, setProfile] = useLocalStorage<AccessibilityProfile>(
    'accessibility-profile',
    defaultProfile
  )

  useEffect(() => {
    const prefs = profile?.preferences || defaultPreferences
    applyAccessibilityPreferences(prefs, profile)
  }, [profile])

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setProfile((current) => {
      const currentProfile = current || defaultProfile
      return {
        ...currentProfile,
        preferences: {
          ...(currentProfile.preferences || defaultPreferences),
          [key]: value,
        },
      }
    })
  }

  const updateProfile = (updates: Partial<AccessibilityProfile>) => {
    setProfile((current) => ({
      ...(current || defaultProfile),
      ...updates,
    }))
  }

  const getTimeExtension = (baseMinutes: number): number => {
    const multiplier = profile?.customTimeMultiplier || (profile?.needsExtendedTime ? 2 : 1)
    return Math.ceil(baseMinutes * multiplier)
  }

  return {
    preferences: profile?.preferences || defaultPreferences,
    profile: profile || defaultProfile,
    updatePreference,
    updateProfile,
    setProfile,
    getTimeExtension,
  }
}

function applyAccessibilityPreferences(
  preferences: UserPreferences,
  profile?: AccessibilityProfile | null
) {
  const root = document.documentElement

  if (preferences.highContrast) {
    root.classList.add('high-contrast')
  } else {
    root.classList.remove('high-contrast')
  }

  if (preferences.reduceMotion) {
    root.classList.add('reduce-motion')
  } else {
    root.classList.remove('reduce-motion')
  }

  switch (preferences.textSize) {
    case 'large':
      root.style.fontSize = '20px'
      break
    case 'x-large':
      root.style.fontSize = '24px'
      break
    default:
      root.style.fontSize = '18px'
      break
  }

  if (profile?.preferredFontFamily) {
    root.style.fontFamily = `${profile.preferredFontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`
  }
}

export function shouldRequireAccessibilityData(
  contentType: 'video' | 'audio' | 'image',
  profile?: AccessibilityProfile | null
): { captions: boolean; transcript: boolean; audioDescription: boolean; altText: boolean } {
  return {
    captions: contentType === 'video',
    transcript: contentType === 'video' || contentType === 'audio',
    audioDescription: contentType === 'video' && (profile?.needsAudioDescription || false),
    altText: contentType === 'image',
  }
}
