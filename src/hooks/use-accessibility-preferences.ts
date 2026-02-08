/**
 * Legacy compatibility shim — delegates to AccessibilityContext.
 *
 * This hook is consumed by many course/lesson viewer components.
 * It now reads from the unified context instead of a separate localStorage key.
 */

import { useAccessibility } from '@/contexts/AccessibilityContext'
import type { UserPreferences } from '@/lib/types'

export interface AccessibilityProfile {
  preferences: UserPreferences
  needsExtendedTime: boolean
  needsAudioDescription: boolean
  preferredFontFamily?: string
  customTimeMultiplier?: number
}

export function useAccessibilityPreferences() {
  const ctx = useAccessibility()

  // Map the advanced preferences to the simpler UserPreferences shape
  const preferences: UserPreferences = {
    textSize: ctx.preferences.textSize === 'custom' ? 'normal' : ctx.preferences.textSize,
    playbackSpeed: ctx.preferences.playbackSpeed,
    highContrast: ctx.preferences.highContrast,
    captionsEnabled: ctx.preferences.captionsEnabled,
    reduceMotion: ctx.preferences.reduceMotion,
  }

  const profile: AccessibilityProfile = {
    preferences,
    needsExtendedTime: ctx.preferences.noTimeLimits,
    needsAudioDescription: ctx.preferences.audioDescription,
    preferredFontFamily:
      ctx.preferences.fontFamily !== 'default' ? ctx.preferences.fontFamily : undefined,
    customTimeMultiplier: ctx.preferences.noTimeLimits ? 999 : 1,
  }

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    ctx.updatePreference(key as any, value as any)
  }

  const updateProfile = (_updates: Partial<AccessibilityProfile>) => {
    // no-op for legacy compat — use context directly
  }

  const setProfile = (_v: any) => {
    // no-op — use context applyProfile instead
  }

  const getTimeExtension = (baseMinutes: number): number => {
    return ctx.preferences.noTimeLimits ? baseMinutes * 999 : baseMinutes
  }

  return {
    preferences,
    profile,
    updatePreference,
    updateProfile,
    setProfile,
    getTimeExtension,
  }
}

export function shouldRequireAccessibilityData(
  contentType: 'video' | 'audio' | 'image',
  _profile?: AccessibilityProfile | null
): { captions: boolean; transcript: boolean; audioDescription: boolean; altText: boolean } {
  return {
    captions: contentType === 'video',
    transcript: contentType === 'video' || contentType === 'audio',
    audioDescription: contentType === 'video' && (_profile?.needsAudioDescription || false),
    altText: contentType === 'image',
  }
}
