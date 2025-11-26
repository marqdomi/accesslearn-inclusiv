#!/usr/bin/env node

/**
 * Script rápido para verificar usuarios del tenant "labolamx"
 * 
 * Uso: node scripts/check-labolamx-users.js
 * 
 * Requiere:
 * - Variable de entorno VITE_API_URL o la URL del API
 * - Token de autenticación en localStorage o como variable de entorno
 */

const API_BASE_URL = process.env.VITE_API_URL 
  ? `${process.env.VITE_API_URL}/api`
  : process.env.API_URL || 'https://api.kainet.mx/api'

const TENANT_SLUG = 'labolamx'

// Colores para la terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Intentar obtener token de localStorage si estamos en el navegador
  // o de variable de entorno
  if (options.auth && !headers['Authorization']) {
    const token = process.env.AUTH_TOKEN || process.env.TOKEN
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else {
      log('⚠️  No se encontró token de autenticación. Algunas llamadas pueden fallar.', 'yellow')
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (error) {
    throw new Error(`Error en ${endpoint}: ${error.message}`)
  }
}

async function getTenantBySlug(slug) {
  try {
    log(`\n📋 Obteniendo información del tenant "${slug}"...`, 'blue')
    const tenant = await fetchAPI(`/tenants/slug/${slug}`, {
      auth: false, // Este endpoint es público
    })
    return tenant
  } catch (error) {
    log(`❌ Error obteniendo tenant: ${error.message}`, 'red')
    return null
  }
}

async function getUsersByTenant(tenantId) {
  try {
    log(`\n👥 Obteniendo usuarios del tenant...`, 'blue')
    const users = await fetchAPI(`/users?tenantId=${tenantId}`, {
      auth: true,
    })
    return users || []
  } catch (error) {
    log(`❌ Error obteniendo usuarios: ${error.message}`, 'red')
    if (error.message.includes('401') || error.message.includes('403')) {
      log(`\n💡 Tip: Necesitas autenticarte. Puedes:`)
      log(`   1. Obtener un token de autenticación desde la app`)
      log(`   2. Exportar la variable: export AUTH_TOKEN="tu-token"`)
    }
    return []
  }
}

function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    nombre: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
    rol: user.role || 'N/A',
    status: user.status || 'N/A',
    xp: user.totalXP || 0,
    nivel: user.level || 1,
    creado: user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-MX') : 'N/A',
  }
}

function displayResults(tenant, users) {
  log('\n' + '='.repeat(80), 'bright')
  log('📊 RESUMEN DE USUARIOS - LABOLAMX', 'bright')
  log('='.repeat(80), 'bright')

  if (!tenant) {
    log('\n❌ No se pudo obtener información del tenant', 'red')
    return
  }

  log(`\n🏢 Tenant: ${tenant.name || 'N/A'}`, 'green')
  log(`   ID: ${tenant.id}`, 'gray')
  log(`   Slug: ${tenant.slug || 'N/A'}`, 'gray')
  log(`   Email: ${tenant.contactEmail || 'N/A'}`, 'gray')

  if (users.length === 0) {
    log('\n⚠️  No se encontraron usuarios para este tenant', 'yellow')
    log('   Esto puede indicar que:', 'gray')
    log('   - El tenant no tiene usuarios registrados', 'gray')
    log('   - Hay un problema de autenticación', 'gray')
    log('   - El tenantId no es correcto', 'gray')
    return
  }

  log(`\n👥 Total de usuarios: ${users.length}`, 'green')

  // Estadísticas por rol
  const statsByRole = {}
  const statsByStatus = {}
  
  users.forEach(user => {
    const role = user.role || 'unknown'
    const status = user.status || 'unknown'
    statsByRole[role] = (statsByRole[role] || 0) + 1
    statsByStatus[status] = (statsByStatus[status] || 0) + 1
  })

  log('\n📈 Estadísticas por Rol:', 'blue')
  Object.entries(statsByRole).forEach(([role, count]) => {
    log(`   ${role}: ${count}`, 'gray')
  })

  log('\n📈 Estadísticas por Status:', 'blue')
  Object.entries(statsByStatus).forEach(([status, count]) => {
    log(`   ${status}: ${count}`, 'gray')
  })

  // Lista de usuarios
  log('\n📋 Lista de Usuarios:', 'blue')
  log('─'.repeat(80), 'gray')
  
  users.forEach((user, index) => {
    const formatted = formatUser(user)
    log(`\n${index + 1}. ${formatted.nombre} (${formatted.email})`, 'bright')
    log(`   ID: ${formatted.id}`, 'gray')
    log(`   Rol: ${formatted.rol} | Status: ${formatted.status}`, 'gray')
    log(`   XP: ${formatted.xp} | Nivel: ${formatted.nivel}`, 'gray')
    log(`   Creado: ${formatted.creado}`, 'gray')
  })

  // Usuarios sin perfil completo
  const usersWithoutProfile = users.filter(u => !u.firstName || !u.lastName)
  if (usersWithoutProfile.length > 0) {
    log(`\n⚠️  ${usersWithoutProfile.length} usuario(s) sin perfil completo:`, 'yellow')
    usersWithoutProfile.forEach(u => {
      log(`   - ${u.email} (${u.id})`, 'gray')
    })
  }

  log('\n' + '='.repeat(80), 'bright')
}

async function main() {
  log('🔍 Verificando usuarios de LABOLAMX...', 'bright')
  log(`API URL: ${API_BASE_URL}`, 'gray')

  // Obtener tenant
  const tenant = await getTenantBySlug(TENANT_SLUG)
  
  if (!tenant) {
    log(`\n❌ No se encontró el tenant con slug "${TENANT_SLUG}"`, 'red')
    log('   Verifica que el slug sea correcto.', 'gray')
    process.exit(1)
  }

  // Obtener usuarios
  const users = await getUsersByTenant(tenant.id)

  // Mostrar resultados
  displayResults(tenant, users)

  if (users.length === 0) {
    log('\n💡 Si no ves usuarios, verifica:', 'yellow')
    log('   1. Que tengas un token de autenticación válido', 'gray')
    log('   2. Que tengas permisos para ver usuarios del tenant', 'gray')
    log('   3. Que realmente existan usuarios en el tenant', 'gray')
    process.exit(1)
  }
}

// Ejecutar
main().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red')
  console.error(error)
  process.exit(1)
})

