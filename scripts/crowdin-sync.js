#!/usr/bin/env node

/**
 * Script de sincronización manual con Crowdin
 * 
 * Uso:
 *   npm run crowdin:upload   - Subir archivos fuente a Crowdin
 *   npm run crowdin:download - Descargar traducciones desde Crowdin
 *   npm run crowdin:sync     - Hacer ambas operaciones
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const command = process.argv[2] || 'sync'

function checkCrowdinConfig() {
  const configPath = path.join(__dirname, '..', 'crowdin.yml')
  if (!fs.existsSync(configPath)) {
    console.error('❌ Error: crowdin.yml no encontrado')
    process.exit(1)
  }
  
  const config = fs.readFileSync(configPath, 'utf-8')
  if (config.includes('project_id: ""')) {
    console.error('❌ Error: Debes configurar project_id en crowdin.yml')
    console.error('   Obtén el ID del proyecto en: https://crowdin.com/project/kaido-platform/settings#api')
    process.exit(1)
  }
}

function checkEnvVars() {
  if (!process.env.CROWDIN_PERSONAL_TOKEN) {
    console.error('❌ Error: CROWDIN_PERSONAL_TOKEN no está configurado')
    console.error('   Obtén tu token en: https://crowdin.com/settings#api-key')
    console.error('   Luego ejecuta: export CROWDIN_PERSONAL_TOKEN=tu_token')
    process.exit(1)
  }
}

function runCrowdinCommand(action) {
  try {
    checkCrowdinConfig()
    checkEnvVars()
    
    console.log(`\n🚀 ${action === 'upload' ? 'Subiendo' : action === 'download' ? 'Descargando' : 'Sincronizando'} con Crowdin...\n`)
    
    if (action === 'upload' || action === 'sync') {
      console.log('📤 Subiendo archivos fuente...')
      execSync('npx crowdin upload sources', { 
        stdio: 'inherit',
        env: { ...process.env }
      })
      console.log('✅ Archivos fuente subidos exitosamente\n')
    }
    
    if (action === 'download' || action === 'sync') {
      console.log('📥 Descargando traducciones...')
      execSync('npx crowdin download', { 
        stdio: 'inherit',
        env: { ...process.env }
      })
      console.log('✅ Traducciones descargadas exitosamente\n')
    }
    
    console.log('✨ Sincronización completada!')
    
  } catch (error) {
    console.error('\n❌ Error durante la sincronización:', error.message)
    process.exit(1)
  }
}

// Ejecutar comando
switch (command) {
  case 'upload':
    runCrowdinCommand('upload')
    break
  case 'download':
    runCrowdinCommand('download')
    break
  case 'sync':
    runCrowdinCommand('sync')
    break
  default:
    console.log(`
Uso: node scripts/crowdin-sync.js [comando]

Comandos:
  upload   - Subir archivos fuente a Crowdin
  download - Descargar traducciones desde Crowdin
  sync     - Hacer ambas operaciones (por defecto)

Ejemplos:
  npm run crowdin:upload
  npm run crowdin:download
  npm run crowdin:sync
`)
    process.exit(1)
}

