import { useKV } from '@github/spark/hooks'
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

export function useLanguage() {
  const [language, setLanguage, deleteLanguage] = useKV<Language>('user-language', DEFAULT_LANGUAGE)
  
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
