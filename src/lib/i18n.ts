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

  const t = (key: string, fallback?: string): string => {
    return translations[key] || fallback || key
  }

  return { t, language }
}
