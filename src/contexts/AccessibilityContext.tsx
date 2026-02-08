/**
 * AccessibilityContext — Single source of truth for all accessibility state.
 *
 * Replaces the dual localStorage systems (accessibility-profile +
 * advanced-accessibility-preferences) with one React Context.
 *
 * Applies CSS classes / variables to <html> and <body> so profiles
 * take effect globally.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/* ─── Types ────────────────────────────────────────────────── */

export interface AdvancedPreferences {
  // Visual
  textSize: 'normal' | 'large' | 'x-large' | 'custom'
  customTextSize: number
  lineHeight: 'tight' | 'normal' | 'relaxed' | 'loose'
  letterSpacing: 'tight' | 'normal' | 'wide'
  wordSpacing: 'normal' | 'wide'
  fontFamily: 'default' | 'dyslexia' | 'sans-serif' | 'serif' | 'monospace'
  highContrast: boolean
  contrastScheme: 'default' | 'dark' | 'light' | 'yellow-on-black'
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  invertColors: boolean
  pageZoom: number

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

export type ProfileKey =
  | 'none'
  | 'dyslexia'
  | 'lowVision'
  | 'colorBlind'
  | 'hearing'
  | 'motor'
  | 'cognitive'

export interface ProfileDefinition {
  key: ProfileKey
  name: string
  description: string
  icon: string
  settings: Partial<AdvancedPreferences>
}

/* ─── Defaults & Profiles ──────────────────────────────────── */

export const defaultPreferences: AdvancedPreferences = {
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

export const accessibilityProfiles: ProfileDefinition[] = [
  {
    key: 'dyslexia',
    name: 'Dislexia',
    description: 'Fuente OpenDyslexic, espaciado amplio, sin cursivas ni texto justificado',
    icon: '🔤',
    settings: {
      fontFamily: 'dyslexia',
      lineHeight: 'relaxed',
      letterSpacing: 'wide',
      wordSpacing: 'wide',
      textSize: 'large',
    },
  },
  {
    key: 'lowVision',
    name: 'Baja Visión',
    description: 'Alto contraste amarillo/negro, texto grande, bordes visibles',
    icon: '👁️',
    settings: {
      highContrast: true,
      contrastScheme: 'yellow-on-black',
      textSize: 'large',
    },
  },
  {
    key: 'colorBlind',
    name: 'Daltonismo',
    description: 'Indicadores con íconos y patrones en lugar de solo color, alto contraste',
    icon: '🎨',
    settings: {
      colorBlindness: 'protanopia',
      highContrast: true,
    },
  },
  {
    key: 'hearing',
    name: 'Hipoacusia',
    description: 'Subtítulos grandes, indicadores visuales de audio, transcripciones prominentes',
    icon: '👂',
    settings: {
      captionsEnabled: true,
      captionSize: 'x-large',
      soundEffects: false,
      audioDescription: true,
    },
  },
  {
    key: 'motor',
    name: 'Motricidad',
    description: 'Objetivos de toque 48px+, sin límites de tiempo, sin animaciones',
    icon: '🖐️',
    settings: {
      noTimeLimits: true,
      autoPause: true,
      pauseDuration: 10,
      reduceMotion: true,
    },
  },
  {
    key: 'cognitive',
    name: 'Cognitiva',
    description: 'Lectura simplificada, ayudas contextuales, sin animaciones, sin presión de tiempo',
    icon: '🧠',
    settings: {
      readingMode: 'simplified',
      showTooltips: true,
      noTimeLimits: true,
      autoPause: true,
      reduceMotion: true,
    },
  },
]

/* ─── Context shape ───────────────────────────────────────── */

interface AccessibilityContextValue {
  /** Current preferences (merged defaults + profile + custom) */
  preferences: AdvancedPreferences
  /** Active profile key ('none' if custom) */
  activeProfile: ProfileKey
  /** Open / close the settings sheet */
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  /** Apply a named profile (resets to profile defaults) */
  applyProfile: (key: ProfileKey) => void
  /** Update a single preference */
  updatePreference: <K extends keyof AdvancedPreferences>(
    key: K,
    value: AdvancedPreferences[K]
  ) => void
  /** Reset everything to default */
  resetToDefaults: () => void
  /** Profile definitions */
  profiles: ProfileDefinition[]
}

const AccessibilityCtx = createContext<AccessibilityContextValue | null>(null)

/* ─── Storage key ─────────────────────────────────────────── */

const STORAGE_KEY = 'al-accessibility-v2'

interface StoredState {
  preferences: AdvancedPreferences
  activeProfile: ProfileKey
}

function loadStored(): StoredState {
  try {
    // Try new unified key first
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)

    // Migrate from old key
    const old = localStorage.getItem('advanced-accessibility-preferences')
    if (old) {
      const parsed = JSON.parse(old)
      return { preferences: { ...defaultPreferences, ...parsed }, activeProfile: 'none' }
    }
  } catch {
    /* ignore */
  }
  return { preferences: { ...defaultPreferences }, activeProfile: 'none' }
}

function persist(state: StoredState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

/* ─── DOM side-effects ─────────────────────────────────────── */

function applyToDom(prefs: AdvancedPreferences, profile: ProfileKey) {
  const html = document.documentElement
  const body = document.body

  // ── Text size ──
  switch (prefs.textSize) {
    case 'large':
      html.style.fontSize = '20px'
      break
    case 'x-large':
      html.style.fontSize = '24px'
      break
    case 'custom':
      html.style.fontSize = `${prefs.customTextSize}%`
      break
    default:
      html.style.fontSize = ''
      break
  }

  // ── Font family ──
  const fontMap: Record<string, string> = {
    dyslexia: "'OpenDyslexic', 'Comic Sans MS', system-ui, sans-serif",
    'sans-serif': "'Inter', system-ui, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    monospace: "'JetBrains Mono', 'Fira Code', monospace",
  }
  html.style.fontFamily = fontMap[prefs.fontFamily] || ''

  // ── Line height ──
  const lhMap: Record<string, string> = { tight: '1.3', normal: '', relaxed: '1.75', loose: '2' }
  html.style.lineHeight = lhMap[prefs.lineHeight] || ''

  // ── Letter spacing ──
  const lsMap: Record<string, string> = { tight: '-0.01em', normal: '', wide: '0.05em' }
  html.style.letterSpacing = lsMap[prefs.letterSpacing] || ''

  // ── Word spacing ──
  html.style.wordSpacing = prefs.wordSpacing === 'wide' ? '0.2em' : ''

  // ── High contrast ──
  html.classList.toggle('high-contrast', prefs.highContrast)

  // ── Contrast scheme ──
  html.classList.remove('contrast-dark', 'contrast-light', 'contrast-yellow-black')
  if (prefs.contrastScheme !== 'default') {
    html.classList.add(`contrast-${prefs.contrastScheme}`)
  }

  // ── Color blindness filters ──
  html.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia')
  if (prefs.colorBlindness !== 'none') {
    html.classList.add(`colorblind-${prefs.colorBlindness}`)
  }

  // ── Invert colors ──
  html.classList.toggle('invert-colors', prefs.invertColors)

  // ── Page zoom ──
  html.style.zoom = prefs.pageZoom !== 100 ? `${prefs.pageZoom}%` : ''

  // ── Reduce motion ──
  html.classList.toggle('reduce-motion', prefs.reduceMotion)

  // ── Simplified navigation ──
  html.classList.toggle('simplified-navigation', prefs.simplifiedNavigation)

  // ── Reading mode ──
  html.classList.toggle('reading-mode-simplified', prefs.readingMode === 'simplified')

  // ── Profile class on body for CSS profile rules ──
  const profileClasses = [
    'dyslexia-profile',
    'low-vision-profile',
    'colorblind-profile',
    'hearing-profile',
    'motor-profile',
    'cognitive-profile',
  ]
  profileClasses.forEach((cls) => {
    html.classList.remove(cls)
    body.classList.remove(cls)
  })

  const profileClassMap: Record<ProfileKey, string | null> = {
    none: null,
    dyslexia: 'dyslexia-profile',
    lowVision: 'low-vision-profile',
    colorBlind: 'colorblind-profile',
    hearing: 'hearing-profile',
    motor: 'motor-profile',
    cognitive: 'cognitive-profile',
  }

  const cls = profileClassMap[profile]
  if (cls) {
    html.classList.add(cls)
    body.classList.add(cls)
  }
}

/* ─── Provider ────────────────────────────────────────────── */

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(loadStored)
  const [isOpen, setIsOpen] = useState(false)

  // Persist + apply whenever state changes
  useEffect(() => {
    persist(state)
    applyToDom(state.preferences, state.activeProfile)
  }, [state])

  // Clean up old keys on mount
  useEffect(() => {
    localStorage.removeItem('advanced-accessibility-preferences')
    localStorage.removeItem('accessibility-profile')
  }, [])

  const applyProfile = useCallback((key: ProfileKey) => {
    if (key === 'none') {
      setState({ preferences: { ...defaultPreferences }, activeProfile: 'none' })
      return
    }
    const profile = accessibilityProfiles.find((p) => p.key === key)
    if (!profile) return
    setState({
      preferences: { ...defaultPreferences, ...profile.settings },
      activeProfile: key,
    })
  }, [])

  const updatePreference = useCallback(
    <K extends keyof AdvancedPreferences>(key: K, value: AdvancedPreferences[K]) => {
      setState((prev) => ({
        ...prev,
        activeProfile: 'none', // custom tweak = no profile
        preferences: { ...prev.preferences, [key]: value },
      }))
    },
    []
  )

  const resetToDefaults = useCallback(() => {
    setState({ preferences: { ...defaultPreferences }, activeProfile: 'none' })
  }, [])

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      preferences: state.preferences,
      activeProfile: state.activeProfile,
      isOpen,
      setIsOpen,
      applyProfile,
      updatePreference,
      resetToDefaults,
      profiles: accessibilityProfiles,
    }),
    [state, isOpen, applyProfile, updatePreference, resetToDefaults]
  )

  return <AccessibilityCtx.Provider value={value}>{children}</AccessibilityCtx.Provider>
}

/* ─── Hook ────────────────────────────────────────────────── */

export function useAccessibility() {
  const ctx = useContext(AccessibilityCtx)
  if (!ctx) throw new Error('useAccessibility must be used within <AccessibilityProvider>')
  return ctx
}
