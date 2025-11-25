import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'

// Get saved language from localStorage or default to Spanish
const savedLanguage = localStorage.getItem('i18nextLng') || 'es'

i18n
  .use(Backend) // Carga traducciones desde /public/locales
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es', // Spanish is the default fallback language
    debug: process.env.NODE_ENV === 'development',
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Namespaces para organizar traducciones
    ns: ['common', 'auth', 'dashboard', 'courses', 'admin', 'community', 'accessibility', 'certificates', 'notifications'],
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
