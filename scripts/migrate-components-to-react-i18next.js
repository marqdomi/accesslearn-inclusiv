import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Mapeo de prefijos de claves a namespaces
const keyToNamespace = {
  'app.': 'common',
  'nav.': 'common',
  'common.': 'common',
  'skipLink.': 'common',
  'login.': 'auth',
  'passwordChange.': 'auth',
  'onboarding.': 'auth',
  'dashboard.': 'dashboard',
  'playerIdentity.': 'dashboard',
  'xp.': 'dashboard',
  'mainMission.': 'dashboard',
  'progressGoals.': 'dashboard',
  'userTitle.': 'dashboard',
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
  'accessibility.': 'accessibility',
  'certificate.': 'certificates',
  'certificates.': 'certificates',
  'notifications.': 'notifications',
}

function getNamespaceFromKey(key) {
  for (const [prefix, namespace] of Object.entries(keyToNamespace)) {
    if (key.startsWith(prefix)) {
      return namespace
    }
  }
  return 'common'
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  let modified = false
  
  // Reemplazar import
  if (content.includes("from '@/lib/i18n'") || content.includes('from "@/lib/i18n"')) {
    content = content.replace(
      /import\s*{\s*useTranslation\s*}\s*from\s*['"]@\/lib\/i18n['"]/g,
      "import { useTranslation } from 'react-i18next'"
    )
    modified = true
  }
  
  // Reemplazar useLanguage si existe
  if (content.includes("from '@/lib/i18n'") && content.includes('useLanguage')) {
    content = content.replace(
      /import\s*{\s*([^}]*useLanguage[^}]*)\s*}\s*from\s*['"]@\/lib\/i18n['"]/g,
      "import { useTranslation } from 'react-i18next'"
    )
    // También necesitaríamos actualizar el uso, pero eso es más complejo
    modified = true
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`✅ Migrated: ${path.relative(process.cwd(), filePath)}`)
    return true
  }
  
  return false
}

// Encontrar todos los archivos que usan el sistema custom
const files = glob.sync('src/**/*.{ts,tsx}', {
  cwd: path.join(__dirname, '..'),
  absolute: true,
})

console.log(`🔍 Found ${files.length} files to check...\n`)

let migrated = 0
for (const file of files) {
  try {
    if (migrateFile(file)) {
      migrated++
    }
  } catch (error) {
    console.error(`❌ Error migrating ${file}:`, error.message)
  }
}

console.log(`\n✨ Migration complete! ${migrated} files migrated.`)
console.log('\n⚠️  Note: You may need to manually update useTranslation() calls to include namespaces.')
console.log('   Example: useTranslation("common") or useTranslation("dashboard")')

