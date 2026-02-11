import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import all translation resources directly (bundled, no async HTTP fetch)
import esCommon from '../../public/locales/es/common.json'
import esAuth from '../../public/locales/es/auth.json'
import esDashboard from '../../public/locales/es/dashboard.json'
import esCourses from '../../public/locales/es/courses.json'
import esAdmin from '../../public/locales/es/admin.json'
import esCommunity from '../../public/locales/es/community.json'
import esAccessibility from '../../public/locales/es/accessibility.json'
import esCertificates from '../../public/locales/es/certificates.json'
import esNotifications from '../../public/locales/es/notifications.json'

import enCommon from '../../public/locales/en/common.json'
import enAuth from '../../public/locales/en/auth.json'
import enDashboard from '../../public/locales/en/dashboard.json'
import enCourses from '../../public/locales/en/courses.json'
import enAdmin from '../../public/locales/en/admin.json'
import enCommunity from '../../public/locales/en/community.json'
import enAccessibility from '../../public/locales/en/accessibility.json'
import enCertificates from '../../public/locales/en/certificates.json'
import enNotifications from '../../public/locales/en/notifications.json'

const resources = {
  es: {
    common: esCommon,
    auth: esAuth,
    dashboard: esDashboard,
    courses: esCourses,
    admin: esAdmin,
    community: esCommunity,
    accessibility: esAccessibility,
    certificates: esCertificates,
    notifications: esNotifications,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    courses: enCourses,
    admin: enAdmin,
    community: enCommunity,
    accessibility: enAccessibility,
    certificates: enCertificates,
    notifications: enNotifications,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['es', 'en'],
    fallbackLng: 'es',
    load: 'languageOnly', // 'es-MX' → 'es', 'en-US' → 'en'
    debug: process.env.NODE_ENV === 'development',

    ns: ['common', 'auth', 'dashboard', 'courses', 'admin', 'community', 'accessibility', 'certificates', 'notifications'],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
