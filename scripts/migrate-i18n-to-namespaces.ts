import * as fs from 'fs'
import * as path from 'path'

// Definir mapeo de prefijos a namespaces
const namespaceMapping: Record<string, string> = {
  // common
  'app.': 'common',
  'nav.': 'common',
  'common.': 'common',
  'skipLink.': 'common',
  
  // auth
  'login.': 'auth',
  'passwordChange.': 'auth',
  'onboarding.': 'auth',
  
  // dashboard
  'dashboard.': 'dashboard',
  'playerIdentity.': 'dashboard',
  'xp.': 'dashboard',
  'mainMission.': 'dashboard',
  'progressGoals.': 'dashboard',
  'userTitle.': 'dashboard',
  
  // courses
  'course.': 'courses',
  'courses.': 'courses',
  'modules.': 'courses',
  'lessons.': 'courses',
  'courseViewer.': 'courses',
  'assessment.': 'courses',
  'reviews.': 'courses',
  'myLibrary.': 'courses',
  'missionLibrary.': 'courses',
  'courseStatus.': 'courses',
  'courseBuilder.': 'courses',
  
  // admin
  'admin.': 'admin',
  'adminDashboard.': 'admin',
  'analytics.': 'admin',
  'groups.': 'admin',
  'groupSuggestions.': 'admin',
  'bulkUpload.': 'admin',
  'courseAssignment.': 'admin',
  'teams.': 'admin',
  'mentorship.': 'admin',
  'csvExport.': 'admin',
  
  // community
  'community.': 'community',
  'communityDashboard.': 'community',
  'activityFeed.': 'community',
  'reaction.': 'community',
  'achievements.': 'community',
  'achievementsWidget.': 'community',
  'achievementsDashboard.': 'community',
  'achievementCard.': 'community',
  'achievementTitle.': 'community',
  'achievementDesc.': 'community',
  'qanda.': 'community',
  'teamChallenges.': 'community',
  'weeklyChallenge.': 'community',
  
  // accessibility
  'accessibility.': 'accessibility',
  
  // certificates
  'certificate.': 'certificates',
  'certificates.': 'certificates',
  
  // notifications
  'notifications.': 'notifications',
}

function getNamespace(key: string): string {
  for (const [prefix, namespace] of Object.entries(namespaceMapping)) {
    if (key.startsWith(prefix)) {
      return namespace
    }
  }
  // Default to common if no match
  return 'common'
}

function migrateTranslations(locale: 'es' | 'en') {
  const inputPath = path.join(__dirname, `../src/locales/${locale}.json`)
  const outputDir = path.join(__dirname, `../public/locales/${locale}`)
  
  // Leer archivo original
  const originalContent = fs.readFileSync(inputPath, 'utf-8')
  const translations = JSON.parse(originalContent)
  
  // Crear directorio de salida
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  // Organizar traducciones por namespace
  const namespaces: Record<string, Record<string, string>> = {}
  
  for (const [key, value] of Object.entries(translations)) {
    const namespace = getNamespace(key)
    
    if (!namespaces[namespace]) {
      namespaces[namespace] = {}
    }
    
    // Remover el prefijo del namespace de la clave
    const namespacePrefix = Object.entries(namespaceMapping).find(
      ([prefix]) => key.startsWith(prefix)
    )?.[0] || ''
    
    const cleanKey = namespacePrefix ? key.replace(namespacePrefix, '') : key
    namespaces[namespace][cleanKey] = value as string
  }
  
  // Escribir archivos de namespace
  for (const [namespace, translations] of Object.entries(namespaces)) {
    const outputPath = path.join(outputDir, `${namespace}.json`)
    fs.writeFileSync(
      outputPath,
      JSON.stringify(translations, null, 2),
      'utf-8'
    )
    console.log(`✅ Created ${locale}/${namespace}.json (${Object.keys(translations).length} keys)`)
  }
  
  console.log(`\n✅ Migration complete for ${locale.toUpperCase()}`)
}

// Ejecutar migración
console.log('🚀 Starting i18n migration to namespaces...\n')
migrateTranslations('es')
console.log('')
migrateTranslations('en')
console.log('\n✨ All migrations complete!')

