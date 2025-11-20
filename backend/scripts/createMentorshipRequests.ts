import { CosmosClient } from '@azure/cosmos'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') })

// Usar emulador local de Cosmos DB
const endpoint = process.env.COSMOS_ENDPOINT || 'https://localhost:8081'
const key = process.env.COSMOS_KEY || 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=='
const databaseId = process.env.COSMOS_DATABASE_ID || 'AccessLearnDB'

const client = new CosmosClient({ 
  endpoint, 
  key,
  connectionPolicy: {
    enableEndpointDiscovery: false
  }
})
const database = client.database(databaseId)

/**
 * Script para crear solicitudes de mentoría de ejemplo para Ana López Torres
 */
async function createMentorshipRequests() {
  const requestsContainer = database.container('mentorship-requests')
  const tenantId = 'tenant-kainet'
  
  // Ana López Torres (mentora)
  const mentorId = 'user-mentor-angular-001'
  const mentorName = 'Ana López Torres'
  const mentorEmail = 'ana.lopez@kainet.mx'

  // Solicitudes de ejemplo de diferentes estudiantes
  const requests = [
    {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      menteeId: 'user-student-001',
      menteeName: 'Carlos Ramírez',
      menteeEmail: 'carlos.ramirez@kainet.mx',
      mentorId,
      mentorName,
      mentorEmail,
      topic: 'Angular Avanzado',
      message: 'Hola Ana, estoy trabajando en un proyecto grande de Angular y me gustaría aprender sobre arquitectura de componentes y manejo de estado con NgRx. He visto tu experiencia y creo que podrías ayudarme mucho. ¿Podríamos tener una sesión para revisar mi estructura actual?',
      preferredDate: Date.now() + 2 * 24 * 60 * 60 * 1000, // En 2 días
      status: 'pending',
      createdAt: Date.now() - 3 * 60 * 60 * 1000 // Hace 3 horas
    },
    {
      id: `req-${Date.now() + 1}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      menteeId: 'user-student-002',
      menteeName: 'Laura Martínez',
      menteeEmail: 'laura.martinez@kainet.mx',
      mentorId,
      mentorName,
      mentorEmail,
      topic: 'TypeScript Patterns',
      message: 'Buenas tardes Ana! Soy nueva en TypeScript y Angular, vengo de React. Me gustaría que me orientaras sobre las mejores prácticas para tipos, interfaces y decoradores en Angular. También tengo dudas sobre Dependency Injection.',
      preferredDate: Date.now() + 5 * 24 * 60 * 60 * 1000, // En 5 días
      status: 'pending',
      createdAt: Date.now() - 5 * 60 * 60 * 1000 // Hace 5 horas
    },
    {
      id: `req-${Date.now() + 2}-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      menteeId: 'user-student-003',
      menteeName: 'Miguel Hernández',
      menteeEmail: 'miguel.hernandez@kainet.mx',
      mentorId,
      mentorName,
      mentorEmail,
      topic: 'Optimización de Performance',
      message: 'Hola! Tengo una aplicación Angular que está teniendo problemas de rendimiento. Uso muchos observables y el change detection se dispara muy seguido. ¿Me podrías ayudar a identificar cuellos de botella y optimizar?',
      status: 'pending',
      createdAt: Date.now() - 1 * 60 * 60 * 1000 // Hace 1 hora
    }
  ]

  console.log('🚀 Creando solicitudes de mentoría para Ana López Torres...\n')

  for (const request of requests) {
    try {
      await requestsContainer.items.create(request)
      console.log(`✅ Solicitud creada de ${request.menteeName}`)
      console.log(`   Tema: ${request.topic}`)
      console.log(`   Mensaje: ${request.message.substring(0, 60)}...`)
      console.log(`   Estado: ${request.status}\n`)
    } catch (error) {
      console.error(`❌ Error creando solicitud de ${request.menteeName}:`, error)
    }
  }

  console.log('✨ ¡Proceso completado!')
  console.log('\n📋 Resumen:')
  console.log(`   - Total de solicitudes: ${requests.length}`)
  console.log(`   - Mentor: ${mentorName} (${mentorEmail})`)
  console.log(`   - Tenant: ${tenantId}`)
  console.log('\n💡 Ahora puedes ver las solicitudes en el dashboard de Ana López Torres')
  console.log('   http://localhost:5000/mentor/dashboard')
}

// Ejecutar el script
createMentorshipRequests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
