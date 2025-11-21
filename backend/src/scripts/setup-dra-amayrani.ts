#!/usr/bin/env ts-node

/**
 * Setup Script - Tenant Dra. Amayrani Gómez
 * 
 * Crea tenant y usuarios iniciales para capacitación médica de residentes.
 * 
 * Uso:
 *   npm run setup-dra-amayrani
 */

import { CosmosClient } from '@azure/cosmos'
import * as dotenv from 'dotenv'
import * as crypto from 'crypto'

dotenv.config()

const COSMOS_ENDPOINT = process.env.COSMOS_ENDPOINT!
const COSMOS_KEY = process.env.COSMOS_KEY!
const COSMOS_DATABASE = process.env.COSMOS_DATABASE || 'accesslearn-db'

// Función para hash de contraseñas (básico - usar bcrypt en producción)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function setupDraAmayrani() {
  console.log('🚀 Iniciando setup para Dra. Amayrani Gómez...\n')

  if (!COSMOS_ENDPOINT || !COSMOS_KEY) {
    throw new Error('❌ Variables de ambiente faltantes: COSMOS_ENDPOINT, COSMOS_KEY')
  }

  const client = new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY })
  const database = client.database(COSMOS_DATABASE)

  try {
    // ============================================
    // 1. CREAR TENANT
    // ============================================
    console.log('📁 Paso 1: Creando tenant...')

    const tenant = {
      id: 'tenant-dra-amayrani',
      name: 'Dra. Amayrani Gómez - Capacitación Médica',
      slug: 'dra-amayrani',
      domain: 'dra-amayrani.accesslearn.com',
      plan: 'professional',
      status: 'active',
      settings: {
        primaryColor: '#2563eb', // Azul médico
        accentColor: '#10b981',  // Verde salud
        logoUrl: null,
        features: {
          gamification: true,
          certificates: true,
          mentorship: true,
          analytics: true,
          community: true,
          customBranding: true,
        },
        limits: {
          maxUsers: 100,
          maxCourses: 50,
          maxStorageGB: 10,
        },
        locale: {
          defaultLanguage: 'es',
          supportedLanguages: ['es', 'en'],
          timezone: 'America/Mexico_City',
        },
      },
      billing: {
        plan: 'professional',
        status: 'active',
        periodStart: new Date().toISOString(),
        periodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      metadata: {
        industry: 'healthcare',
        size: 'small',
        country: 'MX',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const tenantsContainer = database.container('tenants')
    const { resource: createdTenant } = await tenantsContainer.items.create(tenant)
    console.log('   ✅ Tenant creado:', tenant.name)
    console.log('   📌 ID:', tenant.id)
    console.log('   🌐 Slug:', tenant.slug)
    console.log('   🔗 Domain:', tenant.domain)
    console.log()

    // ============================================
    // 2. CREAR USUARIO ADMIN (Dra. Amayrani)
    // ============================================
    console.log('👤 Paso 2: Creando usuario administrador...')

    const adminUser = {
      id: 'user-dra-amayrani-admin',
      tenantId: tenant.id,
      email: 'amayrani.gomez@gmail.com',
      firstName: 'Amayrani',
      lastName: 'Gómez',
      displayName: 'Dra. Amayrani Gómez',
      role: 'tenant-admin',
      permissions: [
        '*:*', // Todos los permisos
      ],
      status: 'active',
      passwordHash: hashPassword('AmayTemp2024!'), // Contraseña temporal
      requirePasswordChange: true,
      profile: {
        title: 'Doctora',
        specialty: 'Medicina General',
        bio: 'Coordinadora de capacitación de residentes',
        avatar: null,
        phone: null,
        timezone: 'America/Mexico_City',
      },
      preferences: {
        language: 'es',
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          courseUpdates: true,
          newEnrollments: true,
        },
      },
      gamification: {
        xp: 0,
        level: 1,
        achievements: [],
        badges: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null,
    }

    const usersContainer = database.container('users')
    await usersContainer.items.create(adminUser)
    console.log('   ✅ Admin creado:', adminUser.email)
    console.log('   👤 Nombre:', adminUser.displayName)
    console.log('   🎓 Rol:', adminUser.role)
    console.log('   🔑 Contraseña temporal: AmayTemp2024!')
    console.log('   ⚠️  Debe cambiar contraseña en primer login')
    console.log()

    // ============================================
    // 3. CREAR USUARIOS ESTUDIANTES (Residentes)
    // ============================================
    console.log('🎓 Paso 3: Creando estudiantes residentes...')

    const students = [
      {
        id: 'user-residente-maria',
        email: 'maria.garcia@hospital.com',
        firstName: 'María',
        lastName: 'García',
        specialty: 'Pediatría',
      },
      {
        id: 'user-residente-juan',
        email: 'juan.martinez@hospital.com',
        firstName: 'Juan',
        lastName: 'Martínez',
        specialty: 'Cirugía',
      },
      {
        id: 'user-residente-ana',
        email: 'ana.lopez@hospital.com',
        firstName: 'Ana',
        lastName: 'López',
        specialty: 'Medicina Interna',
      },
      {
        id: 'user-residente-carlos',
        email: 'carlos.rodriguez@hospital.com',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        specialty: 'Urgencias',
      },
      {
        id: 'user-residente-lucia',
        email: 'lucia.fernandez@hospital.com',
        firstName: 'Lucía',
        lastName: 'Fernández',
        specialty: 'Ginecología',
      },
    ]

    let studentCount = 0
    for (const studentData of students) {
      const student = {
        ...studentData,
        tenantId: tenant.id,
        displayName: `${studentData.firstName} ${studentData.lastName}`,
        role: 'student',
        permissions: [
          'courses:view',
          'courses:enroll',
          'library:view-own',
          'profile:edit-own',
        ],
        status: 'active',
        passwordHash: hashPassword('ResidenteTemp2024!'),
        requirePasswordChange: true,
        profile: {
          title: 'Residente',
          specialty: studentData.specialty,
          bio: `Residente de ${studentData.specialty}`,
          avatar: null,
          phone: null,
          timezone: 'America/Mexico_City',
        },
        preferences: {
          language: 'es',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            courseUpdates: true,
          },
        },
        gamification: {
          xp: 0,
          level: 1,
          achievements: [],
          badges: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null,
      }

      await usersContainer.items.create(student)
      studentCount++
      console.log(`   ✅ Estudiante ${studentCount} creado:`, student.email)
      console.log(`      👤 ${student.displayName} - ${student.profile.specialty}`)
    }

    console.log()
    console.log(`   📊 Total estudiantes: ${studentCount}`)
    console.log('   🔑 Contraseña temporal para todos: ResidenteTemp2024!')
    console.log()

    // ============================================
    // 4. RESUMEN FINAL
    // ============================================
    console.log('=' .repeat(60))
    console.log('🎉 SETUP COMPLETADO EXITOSAMENTE!')
    console.log('=' .repeat(60))
    console.log()
    console.log('📋 RESUMEN:')
    console.log(`   Tenant: ${tenant.name}`)
    console.log(`   Slug: ${tenant.slug}`)
    console.log(`   Domain: ${tenant.domain}`)
    console.log(`   Usuarios creados: ${1 + studentCount} (1 admin + ${studentCount} estudiantes)`)
    console.log()
    console.log('🔐 CREDENCIALES:')
    console.log()
    console.log('   👩‍⚕️ ADMINISTRADOR (Dra. Amayrani):')
    console.log('   Email: amayrani.gomez@gmail.com')
    console.log('   Password: AmayTemp2024!')
    console.log('   URL: https://dra-amayrani.accesslearn.com (o localhost en dev)')
    console.log()
    console.log('   🎓 ESTUDIANTES (Residentes):')
    students.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.email}`)
    })
    console.log('   Password (todos): ResidenteTemp2024!')
    console.log()
    console.log('⚠️  IMPORTANTE:')
    console.log('   - Todos los usuarios deben cambiar su contraseña en el primer login')
    console.log('   - Las credenciales temporales son solo para setup inicial')
    console.log('   - Documentar las credenciales en lugar seguro')
    console.log()
    console.log('📝 PRÓXIMOS PASOS:')
    console.log('   1. Login como admin en la aplicación')
    console.log('   2. Crear primer curso de capacitación')
    console.log('   3. Publicar curso')
    console.log('   4. Compartir URL con estudiantes')
    console.log('   5. Estudiantes se inscriben y empiezan a aprender')
    console.log()
    console.log('🚀 ¡Listo para empezar a capacitar residentes!')
    console.log()

  } catch (error: any) {
    console.error('❌ Error durante el setup:', error.message)
    
    if (error.code === 409) {
      console.error('   ℹ️  El tenant o usuarios ya existen. Usa un ID diferente o elimina los existentes.')
    }
    
    throw error
  }
}

// Ejecutar script
if (require.main === module) {
  setupDraAmayrani()
    .then(() => {
      console.log('✅ Script completado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script falló:', error)
      process.exit(1)
    })
}

export { setupDraAmayrani }
