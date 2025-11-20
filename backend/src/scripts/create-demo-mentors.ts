import { CosmosClient } from '@azure/cosmos'
import dotenv from 'dotenv'

dotenv.config()

const COSMOS_ENDPOINT = process.env.COSMOS_ENDPOINT!
const COSMOS_KEY = process.env.COSMOS_KEY!
const DATABASE_ID = 'accesslearn-db'
const CONTAINER_ID = 'users'

async function createDemoMentors() {
  const client = new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY })
  const database = client.database(DATABASE_ID)
  const container = database.container(CONTAINER_ID)

  const mentors = [
    {
      id: 'user-mentor-react-001',
      tenantId: 'tenant-kainet',
      email: 'maria.santos@kainet.mx',
      firstName: 'María',
      lastName: 'Santos García',
      role: 'mentor',
      curp: 'SAGM850315MDFNRR09',
      rfc: 'SAGM850315ABC',
      phone: '+52 555 1001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      
      // Campos de mentor
      mentorBio: 'Desarrolladora Full Stack con 10+ años de experiencia. Especializada en React, TypeScript y arquitectura frontend. Me apasiona compartir conocimiento y ayudar a otros desarrolladores a crecer.',
      mentorSpecialties: ['React', 'TypeScript', 'Frontend', 'JavaScript', 'Node.js'],
      mentorAvailability: {
        monday: ['10:00-12:00', '15:00-17:00'],
        wednesday: ['10:00-12:00', '15:00-17:00'],
        friday: ['09:00-11:00', '14:00-16:00']
      },
      mentorRating: 4.9,
      totalMentorSessions: 47,
      totalMentees: 12,
      mentorIsAvailable: true,
      
      xpPoints: 3200,
      completedCourses: ['course-react-kainet', 'course-js-fundamentals-kainet'],
      enrolledCourses: [],
      progress: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'user-mentor-python-002',
      tenantId: 'tenant-kainet',
      email: 'carlos.rodriguez@kainet.mx',
      firstName: 'Carlos',
      lastName: 'Rodríguez López',
      role: 'mentor',
      curp: 'ROLC920520HDFRDR08',
      rfc: 'ROLC920520XYZ',
      phone: '+52 555 1002',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
      
      // Campos de mentor
      mentorBio: 'Data Scientist & Python Expert. 8 años trabajando con Python, Machine Learning y análisis de datos. Mentor certificado, me encanta enseñar programación desde cero.',
      mentorSpecialties: ['Python', 'Machine Learning', 'Data Science', 'Pandas', 'SQL'],
      mentorAvailability: {
        tuesday: ['11:00-13:00', '16:00-18:00'],
        thursday: ['11:00-13:00', '16:00-18:00'],
        saturday: ['10:00-14:00']
      },
      mentorRating: 4.8,
      totalMentorSessions: 35,
      totalMentees: 9,
      mentorIsAvailable: true,
      
      xpPoints: 2800,
      completedCourses: ['course-python-kainet'],
      enrolledCourses: [],
      progress: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'user-mentor-devops-003',
      tenantId: 'tenant-kainet',
      email: 'ana.martinez@kainet.mx',
      firstName: 'Ana',
      lastName: 'Martínez Flores',
      role: 'mentor',
      curp: 'MAFA880710MDFRNN05',
      rfc: 'MAFA880710DEF',
      phone: '+52 555 1003',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
      
      // Campos de mentor
      mentorBio: 'DevOps Engineer & Cloud Architect. Experta en Azure, Docker, Kubernetes y CI/CD. Ayudo a equipos a implementar mejores prácticas de deployment y automatización.',
      mentorSpecialties: ['DevOps', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Git'],
      mentorAvailability: {
        monday: ['14:00-16:00'],
        wednesday: ['14:00-16:00'],
        friday: ['10:00-12:00', '15:00-17:00']
      },
      mentorRating: 4.7,
      totalMentorSessions: 28,
      totalMentees: 8,
      mentorIsAvailable: true,
      
      xpPoints: 2500,
      completedCourses: [],
      enrolledCourses: [],
      progress: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'user-mentor-mobile-004',
      tenantId: 'tenant-kainet',
      email: 'luis.gomez@kainet.mx',
      firstName: 'Luis',
      lastName: 'Gómez Sánchez',
      role: 'mentor',
      curp: 'GOSL950825HDFRMS07',
      rfc: 'GOSL950825GHI',
      phone: '+52 555 1004',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luis',
      
      // Campos de mentor
      mentorBio: 'Mobile Developer especializado en React Native y Flutter. 6 años creando apps multiplataforma. Mentor enfocado en ayudar a desarrolladores web a entrar al mundo móvil.',
      mentorSpecialties: ['React Native', 'Flutter', 'Mobile', 'iOS', 'Android'],
      mentorAvailability: {
        tuesday: ['09:00-11:00', '15:00-17:00'],
        thursday: ['09:00-11:00', '15:00-17:00']
      },
      mentorRating: 4.6,
      totalMentorSessions: 22,
      totalMentees: 7,
      mentorIsAvailable: true,
      
      xpPoints: 2200,
      completedCourses: ['course-react-kainet'],
      enrolledCourses: [],
      progress: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'user-mentor-backend-005',
      tenantId: 'tenant-kainet',
      email: 'sofia.hernandez@kainet.mx',
      firstName: 'Sofía',
      lastName: 'Hernández Ruiz',
      role: 'mentor',
      curp: 'HERS900312MDFRRR06',
      rfc: 'HERS900312JKL',
      phone: '+52 555 1005',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia',
      
      // Campos de mentor
      mentorBio: 'Senior Backend Engineer. Experta en Node.js, Express, bases de datos y arquitectura de microservicios. Me gusta enseñar diseño de APIs REST y buenas prácticas de backend.',
      mentorSpecialties: ['Node.js', 'Express', 'API Design', 'MongoDB', 'PostgreSQL', 'Microservices'],
      mentorAvailability: {
        monday: ['11:00-13:00'],
        wednesday: ['11:00-13:00', '16:00-18:00'],
        friday: ['11:00-13:00']
      },
      mentorRating: 4.9,
      totalMentorSessions: 41,
      totalMentees: 11,
      mentorIsAvailable: true,
      
      xpPoints: 3000,
      completedCourses: ['course-js-fundamentals-kainet'],
      enrolledCourses: [],
      progress: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  console.log('🎓 Creando usuarios mentores demo...\n')

  for (const mentor of mentors) {
    try {
      await container.items.create(mentor)
      console.log(`✅ Mentor creado: ${mentor.firstName} ${mentor.lastName}`)
      console.log(`   📧 Email: ${mentor.email}`)
      console.log(`   🎯 Especialidades: ${mentor.mentorSpecialties.join(', ')}`)
      console.log(`   ⭐ Rating: ${mentor.mentorRating}/5`)
      console.log(`   📊 Sesiones: ${mentor.totalMentorSessions}`)
      console.log('')
    } catch (error: any) {
      if (error.code === 409) {
        console.log(`⚠️  ${mentor.firstName} ${mentor.lastName} ya existe, actualizando...`)
        await container.item(mentor.id, mentor.tenantId).replace(mentor)
        console.log(`✅ Actualizado\n`)
      } else {
        console.error(`❌ Error creando ${mentor.firstName} ${mentor.lastName}:`, error.message)
      }
    }
  }

  console.log('🎉 Proceso completado!')
  console.log(`📊 Total mentores creados: ${mentors.length}`)
  console.log('\n💡 Ahora puedes:')
  console.log('   1. Ver el directorio de mentores en /mentors')
  console.log('   2. Solicitar una mentoría como estudiante')
  console.log('   3. Ver el dashboard de mentor con uno de estos emails\n')
}

createDemoMentors()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Error:', error)
    process.exit(1)
  })
