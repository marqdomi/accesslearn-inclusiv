import { useEffect, useState, useMemo } from 'react'
import esTranslations from '../locales/es.json'
import enTranslations from '../locales/en.json'

export type Language = 'es' | 'en'

export const SUPPORTED_LANGUAGES = {
  es: 'Español',
  en: 'English'
} as const

export const DEFAULT_LANGUAGE: Language = 'es'

const translationsMap: Record<Language, Record<string, string>> = {
  es: esTranslations,
  en: enTranslations
}

const LANGUAGE_STORAGE_KEY = 'user-language'

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get initial value from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (stored === 'es' || stored === 'en') {
        return stored as Language
      }
    }
    return DEFAULT_LANGUAGE
  })

  // Sync with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    }
  }, [language])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage)
    }
  }
  
  return {
    language: language || DEFAULT_LANGUAGE,
    setLanguage,
    isSpanish: language === 'es',
    isEnglish: language === 'en'
  }
}

export function useTranslation() {
  const { language } = useLanguage()
  
  const translations = useMemo(() => {
    return translationsMap[language] || translationsMap[DEFAULT_LANGUAGE]
  }, [language])

  const t = (key: string, params?: Record<string, string> | string): string => {
    let translated = translations[key] || (typeof params === 'string' ? params : key)
    
    if (typeof params === 'object' && params !== null) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translated = translated.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue)
      })
    }
    
    return translated
  }

  return { t, language }
}
