import { useKV } from '@github/spark/hooks'
import { useEffect, useState } from 'react'

export type Language = 'es' | 'en'

export const SUPPORTED_LANGUAGES = {
  es: 'Español',
  en: 'English'
} as const

export const DEFAULT_LANGUAGE: Language = 'es'

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
  const [translations, setTranslations] = useState<Record<string, string>>({})

  useEffect(() => {
    import(`../locales/${language}.json`)
      .then((module) => {
        setTranslations(module.default)
      })
      .catch((error) => {
        console.error(`Failed to load translations for ${language}:`, error)
      })
  }, [language])

  const t = (key: string, fallback?: string): string => {
    return translations[key] || fallback || key
  }

  return { t, language }
}
