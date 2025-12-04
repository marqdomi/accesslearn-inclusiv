/**
 * Accessibility Profile Model
 * 
 * Represents a customizable accessibility profile that can be managed by admins
 * and selected by end users.
 */

export interface AdvancedPreferences {
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

export interface AccessibilityProfileMetadata {
  useCase: string // Caso de uso del perfil
  objective: string // Objetivo del perfil
  benefits: string[] // Lista de beneficios
  recommendedSettings?: string // Configuraciones recomendadas
  targetAudience: string // Audiencia objetivo
}

export interface AccessibilityProfile {
  id: string
  tenantId: string
  name: string
  description: string
  icon?: string // Nombre del icono (lucide-react)
  enabled: boolean // Si está activo para usuarios finales
  isDefault: boolean // Si es un perfil del sistema (no se puede eliminar)
  settings: AdvancedPreferences
  metadata: AccessibilityProfileMetadata
  createdBy?: string // ID del usuario que lo creó (si es personalizado)
  createdAt: string
  updatedAt: string
}

