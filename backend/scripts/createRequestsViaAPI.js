/**
 * Script para crear solicitudes de mentoría de ejemplo usando el API
 * Ejecutar con: node createRequestsViaAPI.js
 */

const API_BASE_URL = 'http://localhost:3000/api'

// Ana López Torres (mentora) - ID será obtenido dinámicamente
let mentorId = null
const mentorName = 'Ana López Torres'
const mentorEmail = 'ana.lopez@kainet.mx'

const requests = [
  {
    tenantId: 'tenant-kainet',
    menteeId: 'user-student-001',
    menteeName: 'Carlos Ramírez',
    menteeEmail: 'carlos.ramirez@kainet.mx',
    mentorId,
    mentorName,
    mentorEmail,
    topic: 'Angular Avanzado',
    message: 'Hola Ana, estoy trabajando en un proyecto grande de Angular y me gustaría aprender sobre arquitectura de componentes y manejo de estado con NgRx. He visto tu experiencia y creo que podrías ayudarme mucho. ¿Podríamos tener una sesión para revisar mi estructura actual?',
    preferredDate: Date.now() + 2 * 24 * 60 * 60 * 1000 // En 2 días
  },
  {
    tenantId: 'tenant-kainet',
    menteeId: 'user-student-002',
    menteeName: 'Laura Martínez',
    menteeEmail: 'laura.martinez@kainet.mx',
    mentorId,
    mentorName,
    mentorEmail,
    topic: 'TypeScript Patterns',
    message: 'Buenas tardes Ana! Soy nueva en TypeScript y Angular, vengo de React. Me gustaría que me orientaras sobre las mejores prácticas para tipos, interfaces y decoradores en Angular. También tengo dudas sobre Dependency Injection.',
    preferredDate: Date.now() + 5 * 24 * 60 * 60 * 1000 // En 5 días
  },
  {
    tenantId: 'tenant-kainet',
    menteeId: 'user-student-003',
    menteeName: 'Miguel Hernández',
    menteeEmail: 'miguel.hernandez@kainet.mx',
    mentorId,
    mentorName,
    mentorEmail,
    topic: 'Optimización de Performance',
    message: 'Hola! Tengo una aplicación Angular que está teniendo problemas de rendimiento. Uso muchos observables y el change detection se dispara muy seguido. ¿Me podrías ayudar a identificar cuellos de botella y optimizar?',
    preferredDate: Date.now() + 3 * 24 * 60 * 60 * 1000 // En 3 días
  }
]

async function getMentorId() {
  console.log('🔍 Obteniendo ID de Ana López Torres...\n')
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tenantId: 'tenant-kainet',
        email: mentorEmail,
        password: 'demo123'
      })
    })

    if (response.ok) {
      const data = await response.json()
      mentorId = data.user.id
      console.log(`✅ ID encontrado: ${mentorId}\n`)
      return true
    } else {
      console.error('❌ No se pudo obtener el ID del mentor')
      return false
    }
  } catch (error) {
    console.error('❌ Error obteniendo ID:', error.message)
    return false
  }
}

async function createRequests() {
  // Primero obtener el ID correcto del mentor
  if (!await getMentorId()) {
    console.log('\n⚠️  No se pudo obtener el ID del mentor. Verifica que el backend esté corriendo.')
    return
  }

  console.log('🚀 Creando solicitudes de mentoría para Ana López Torres...\n')

  // Actualizar mentorId en todas las solicitudes
  requests.forEach(req => req.mentorId = mentorId)

  for (const request of requests) {
    try {
      const response = await fetch(`${API_BASE_URL}/mentorship/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Solicitud creada de ${request.menteeName}`)
        console.log(`   ID: ${data.id}`)
        console.log(`   Tema: ${request.topic}`)
        console.log(`   Estado: ${data.status}\n`)
      } else {
        const error = await response.text()
        console.error(`❌ Error creando solicitud de ${request.menteeName}:`, error)
      }
    } catch (error) {
      console.error(`❌ Error de red al crear solicitud de ${request.menteeName}:`, error.message)
    }
  }

  console.log('✨ ¡Proceso completado!')
  console.log('\n📋 Resumen:')
  console.log(`   - Total de solicitudes: ${requests.length}`)
  console.log(`   - Mentor: ${mentorName} (${mentorEmail})`)
  console.log(`   - Tenant: tenant-kainet`)
  console.log('\n💡 Ahora Ana puede ver las solicitudes en su dashboard:')
  console.log('   http://localhost:5000/mentor/dashboard')
  console.log('\n🔐 Login con:')
  console.log(`   Email: ${mentorEmail}`)
  console.log('   Password: (cualquier contraseña)')
}

createRequests()
  .then(() => {
    console.log('\n✅ Script completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
