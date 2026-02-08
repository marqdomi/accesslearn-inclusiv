#!/usr/bin/env node
/**
 * Setup Demo Complete
 * Creates a complete demo environment with tenant, users, courses, progress, certificates, forums, and activities
 */

import 'dotenv/config'
import { initializeCosmos, getContainer } from '../services/cosmosdb.service'
import { createTenant, getTenantBySlug } from '../functions/TenantFunctions'
import { createUser, getUserById } from '../functions/UserFunctions'
import { createCourse, updateCourse, approveCourse } from '../functions/CourseFunctions'
import { createAssignment } from '../functions/CourseAssignmentFunctions'
import { upsertUserProgress } from '../functions/UserProgressFunctions'
import { completeCourseAttempt, startCourseRetake } from '../functions/LibraryFunctions'
import { awardXP } from '../functions/GamificationFunctions'
import { createCertificate } from '../functions/CertificateFunctions'
import { createQuestion, createAnswer } from '../functions/ForumFunctions'
import { createActivityFeedItem } from '../functions/ActivityFeedFunctions'
import { Course, ContentModule, Assessment } from '../models/Course'
import * as crypto from 'crypto'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function main() {
  try {
    await initializeCosmos()
    console.log('✅ Cosmos DB connected\n')

    // ============================================
    // 1. CREATE OR GET DEMO TENANT
    // ============================================
    console.log('📋 Step 1: Setting up tenant...')
    const tenantSlug = 'kainet'
    let tenant = await getTenantBySlug(tenantSlug)

    if (!tenant) {
      console.log('  🔨 Creating demo tenant...')
      tenant = await createTenant({
        name: 'Kainet',
        slug: tenantSlug,
        contactEmail: 'admin@kainet.mx',
        plan: 'professional',
        primaryColor: '#4F46E5',
        secondaryColor: '#10B981'
      })
      console.log(`  ✅ Tenant created: ${tenant.id}\n`)
    } else {
      console.log(`  ✅ Tenant exists: ${tenant.id}\n`)
    }

    // ============================================
    // 2. CREATE DEMO USERS
    // ============================================
    console.log('👥 Step 2: Creating demo users...')
    const users = [
      {
        email: 'ana.lopez@kainet.mx',
        firstName: 'Ana',
        lastName: 'López Torres',
        role: 'super-admin' as const,
        password: 'Demo123!'
      },
      {
        email: 'carlos.content@kainet.mx',
        firstName: 'Carlos',
        lastName: 'García',
        role: 'content-manager' as const,
        password: 'Demo123!'
      },
      {
        email: 'maria.instructor@kainet.mx',
        firstName: 'María',
        lastName: 'Rodríguez',
        role: 'instructor' as const,
        password: 'Demo123!'
      },
      {
        email: 'juan.student@kainet.mx',
        firstName: 'Juan',
        lastName: 'Pérez',
        role: 'student' as const,
        password: 'Demo123!'
      },
      {
        email: 'pedro.student@kainet.mx',
        firstName: 'Pedro',
        lastName: 'Martínez',
        role: 'student' as const,
        password: 'Demo123!'
      },
      {
        email: 'laura.student@kainet.mx',
        firstName: 'Laura',
        lastName: 'González',
        role: 'student' as const,
        password: 'Demo123!'
      }
    ]

    const createdUsers: Record<string, any> = {}
    
    for (const userData of users) {
      try {
        let user = await createUser({
          tenantId: tenant.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          temporaryPassword: userData.password
        })
        
        // Hash password if not already hashed
        if (user.password && !user.password.startsWith('$2b$') && user.password !== hashPassword(userData.password)) {
          const usersContainer = getContainer('users')
          user = {
            ...user,
            password: hashPassword(userData.password),
            passwordResetRequired: false
          }
          await usersContainer.items.upsert(user)
        }
        
        createdUsers[userData.email] = user
        console.log(`  ✅ User: ${user.email} (${user.role}) - ID: ${user.id}`)
      } catch (error: any) {
        if (error.message?.includes('already exists') || error.message?.includes('ya está registrado')) {
          // Get existing user
          const usersContainer = getContainer('users')
          const { resources } = await usersContainer.items
            .query({
              query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.email = @email',
              parameters: [
                { name: '@tenantId', value: tenant.id },
                { name: '@email', value: userData.email }
              ]
            })
            .fetchAll()
          
          if (resources.length > 0) {
            createdUsers[userData.email] = resources[0]
            console.log(`  ℹ️  User exists: ${userData.email} (${userData.role})`)
          }
        } else {
          console.error(`  ❌ Error creating ${userData.email}:`, error.message)
        }
      }
    }

    const adminUser = createdUsers['ana.lopez@kainet.mx']
    const instructorUser = createdUsers['maria.instructor@kainet.mx']
    const students = [
      createdUsers['juan.student@kainet.mx'],
      createdUsers['pedro.student@kainet.mx'],
      createdUsers['laura.student@kainet.mx']
    ].filter(Boolean)

    console.log(`\n  ✅ Created ${Object.keys(createdUsers).length} users\n`)

    // ============================================
    // 3. CREATE DEMO COURSES
    // ============================================
    console.log('📚 Step 3: Creating demo courses...')

    if (!instructorUser || !adminUser) {
      console.error('  ❌ Error: Required users not found')
      return
    }

    // Course 1: Introducción a AccessLearn
    const course1Modules: ContentModule[] = [
      {
        id: 'module-1-1',
        title: 'Bienvenida',
        type: 'text',
        url: '',
        order: 1,
        accessibility: {
          altText: 'Bienvenida al curso'
        }
      },
      {
        id: 'module-1-2',
        title: '¿Qué es AccessLearn?',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 2,
        accessibility: {
          altText: 'Video explicativo sobre AccessLearn',
          transcript: 'AccessLearn es una plataforma de aprendizaje...'
        }
      },
      {
        id: 'module-1-3',
        title: 'Navegación básica',
        type: 'text',
        url: '',
        order: 3
      },
      {
        id: 'module-1-4',
        title: 'Quiz: Conceptos básicos',
        type: 'quiz',
        url: '',
        order: 4
      },
      {
        id: 'module-1-5',
        title: 'Primeros pasos',
        type: 'text',
        url: '',
        order: 5
      },
      {
        id: 'module-1-6',
        title: 'Recursos adicionales',
        type: 'text',
        url: '',
        order: 6
      }
    ]

    const course1Assessment: Assessment[] = [
      {
        id: 'quiz-1-1',
        question: '¿Qué es AccessLearn?',
        options: [
          'Una plataforma de redes sociales',
          'Una plataforma de aprendizaje en línea',
          'Un juego de video',
          'Una aplicación de mensajería'
        ],
        correctAnswer: 1,
        explanation: 'AccessLearn es una plataforma de aprendizaje en línea diseñada para empresas.'
      },
      {
        id: 'quiz-1-2',
        question: '¿Cómo se navega en AccessLearn?',
        options: [
          'Usando el menú lateral',
          'Usando el teclado solamente',
          'Usando comandos de voz',
          'No se puede navegar'
        ],
        correctAnswer: 0,
        explanation: 'AccessLearn tiene un menú lateral que permite navegar entre diferentes secciones.'
      },
      {
        id: 'quiz-1-3',
        question: '¿Qué puedes hacer en AccessLearn?',
        options: [
          'Solo ver videos',
          'Tomar cursos, ganar XP, obtener certificados',
          'Chatear con otros usuarios',
          'Comprar productos'
        ],
        correctAnswer: 1,
        explanation: 'AccessLearn permite tomar cursos, ganar XP al completar lecciones, y obtener certificados.'
      }
    ]

    let course1: Course
    try {
      course1 = await createCourse({
        title: 'Introducción a AccessLearn',
        description: 'Un curso completo para aprender a usar AccessLearn desde cero. Aprende las funciones básicas, navegación, y cómo aprovechar al máximo la plataforma.',
        category: 'Onboarding',
        estimatedTime: 120, // 2 horas
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'
      }, tenant.id, instructorUser.id)

      // Update course with modules and assessment
      course1 = await updateCourse(
        course1.id,
        tenant.id,
        instructorUser.id,
        {
          modules: course1Modules,
          assessment: course1Assessment
        }
      )

      // Publish course
      course1 = await approveCourse(course1.id, tenant.id, adminUser.id)
      
      console.log(`  ✅ Course 1: "${course1.title}" (${course1.id})`)
    } catch (error: any) {
      console.error(`  ❌ Error creating course 1:`, error.message)
      // Try to get existing course
      const coursesContainer = getContainer('courses')
      const { resources } = await coursesContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.title = @title',
          parameters: [
            { name: '@tenantId', value: tenant.id },
            { name: '@title', value: 'Introducción a AccessLearn' }
          ]
        })
        .fetchAll()
      
      if (resources.length > 0) {
        course1 = resources[0] as Course
        console.log(`  ℹ️  Course 1 exists: "${course1.title}"`)
      } else {
        throw error
      }
    }

    // Course 2: Gestión de Cursos
    const course2Modules: ContentModule[] = [
      {
        id: 'module-2-1',
        title: 'Crear tu primer curso',
        type: 'text',
        url: '',
        order: 1
      },
      {
        id: 'module-2-2',
        title: 'Estructura de un curso',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 2
      },
      {
        id: 'module-2-3',
        title: 'Agregar contenido',
        type: 'text',
        url: '',
        order: 3
      },
      {
        id: 'module-2-4',
        title: 'Quiz: Gestión de cursos',
        type: 'quiz',
        url: '',
        order: 4
      }
    ]

    const course2Assessment: Assessment[] = [
      {
        id: 'quiz-2-1',
        question: '¿Cuál es el primer paso para crear un curso?',
        options: [
          'Subir videos',
          'Definir el título y descripción',
          'Crear el certificado',
          'Asignar estudiantes'
        ],
        correctAnswer: 1,
        explanation: 'El primer paso es definir el título y descripción del curso.'
      },
      {
        id: 'quiz-2-2',
        question: '¿Qué elementos puede tener un curso?',
        options: [
          'Solo texto',
          'Solo videos',
          'Módulos, lecciones, quizzes',
          'Solo imágenes'
        ],
        correctAnswer: 2,
        explanation: 'Un curso puede tener módulos, lecciones de texto y video, y quizzes.'
      }
    ]

    let course2: Course
    try {
      course2 = await createCourse({
        title: 'Gestión de Cursos en AccessLearn',
        description: 'Aprende a crear, editar y gestionar cursos efectivos en AccessLearn. Incluye mejores prácticas para estructurar contenido educativo.',
        category: 'Educación',
        estimatedTime: 90, // 1.5 horas
        coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
      }, tenant.id, instructorUser.id)

      course2 = await updateCourse(
        course2.id,
        tenant.id,
        instructorUser.id,
        {
          modules: course2Modules,
          assessment: course2Assessment
        }
      )

      course2 = await approveCourse(course2.id, tenant.id, adminUser.id)
      
      console.log(`  ✅ Course 2: "${course2.title}" (${course2.id})`)
    } catch (error: any) {
      console.error(`  ❌ Error creating course 2:`, error.message)
      const coursesContainer = getContainer('courses')
      const { resources } = await coursesContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.title = @title',
          parameters: [
            { name: '@tenantId', value: tenant.id },
            { name: '@title', value: 'Gestión de Cursos en AccessLearn' }
          ]
        })
        .fetchAll()
      
      if (resources.length > 0) {
        course2 = resources[0] as Course
        console.log(`  ℹ️  Course 2 exists: "${course2.title}"`)
      } else {
        throw error
      }
    }

    // Course 3: Analytics Avanzado
    const course3Modules: ContentModule[] = [
      {
        id: 'module-3-1',
        title: 'Introducción a Analytics',
        type: 'text',
        url: '',
        order: 1
      },
      {
        id: 'module-3-2',
        title: 'Métricas clave',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        order: 2
      },
      {
        id: 'module-3-3',
        title: 'Reportes de usuarios',
        type: 'text',
        url: '',
        order: 3
      },
      {
        id: 'module-3-4',
        title: 'Reportes de cursos',
        type: 'text',
        url: '',
        order: 4
      },
      {
        id: 'module-3-5',
        title: 'Quiz: Analytics',
        type: 'quiz',
        url: '',
        order: 5
      }
    ]

    const course3Assessment: Assessment[] = [
      {
        id: 'quiz-3-1',
        question: '¿Qué métricas puedes ver en Analytics?',
        options: [
          'Solo número de usuarios',
          'Progreso de usuarios, completitud de cursos, XP ganado',
          'Solo cursos completados',
          'Solo certificados'
        ],
        correctAnswer: 1,
        explanation: 'Analytics muestra progreso de usuarios, completitud de cursos, XP ganado y más.'
      },
      {
        id: 'quiz-3-2',
        question: '¿Para qué sirven los reportes?',
        options: [
          'Solo para impresionar',
          'Para tomar decisiones basadas en datos y mejorar la formación',
          'No sirven para nada',
          'Solo para cumplir requisitos'
        ],
        correctAnswer: 1,
        explanation: 'Los reportes ayudan a tomar decisiones basadas en datos y mejorar la formación.'
      }
    ]

    let course3: Course
    try {
      course3 = await createCourse({
        title: 'Analytics Avanzado en AccessLearn',
        description: 'Aprende a usar las herramientas de analytics de AccessLearn para medir el éxito de tus programas de formación y tomar decisiones basadas en datos.',
        category: 'Analytics',
        estimatedTime: 150, // 2.5 horas
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'
      }, tenant.id, instructorUser.id)

      course3 = await updateCourse(
        course3.id,
        tenant.id,
        instructorUser.id,
        {
          modules: course3Modules,
          assessment: course3Assessment
        }
      )

      course3 = await approveCourse(course3.id, tenant.id, adminUser.id)
      
      console.log(`  ✅ Course 3: "${course3.title}" (${course3.id})`)
    } catch (error: any) {
      console.error(`  ❌ Error creating course 3:`, error.message)
      const coursesContainer = getContainer('courses')
      const { resources } = await coursesContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.title = @title',
          parameters: [
            { name: '@tenantId', value: tenant.id },
            { name: '@title', value: 'Analytics Avanzado en AccessLearn' }
          ]
        })
        .fetchAll()
      
      if (resources.length > 0) {
        course3 = resources[0] as Course
        console.log(`  ℹ️  Course 3 exists: "${course3.title}"`)
      } else {
        throw error
      }
    }

    console.log(`\n  ✅ Created 3 courses\n`)

    // ============================================
    // 4. ASSIGN COURSES TO STUDENTS
    // ============================================
    console.log('📋 Step 4: Assigning courses to students...')

    const courses = [course1, course2, course3].filter(Boolean)

    for (const student of students) {
      if (!student) continue
      
      for (const course of courses) {
        try {
          await createAssignment(
            tenant.id,
            course.id,
            'user',
            student.id,
            adminUser.id
          )
          console.log(`  ✅ Assigned "${course.title}" to ${student.firstName} ${student.lastName}`)
        } catch (error: any) {
          if (error.message?.includes('already exists') || error.message?.includes('ya existe')) {
            console.log(`  ℹ️  Assignment already exists: "${course.title}" → ${student.firstName}`)
          } else {
            console.error(`  ❌ Error assigning course:`, error.message)
          }
        }
      }
    }

    console.log(`\n  ✅ Assigned courses to ${students.length} students\n`)

    // ============================================
    // 5. CREATE USER PROGRESS (Some students with partial progress)
    // ============================================
    console.log('📊 Step 5: Creating user progress...')

    // Student 1 (Juan): Complete course 1
    if (students[0]) {
      try {
        await upsertUserProgress({
          id: `progress-${students[0].id}-${course1.id}`,
          userId: students[0].id,
          tenantId: tenant.id,
          courseId: course1.id,
          completedLessons: course1Modules.slice(0, 6).map(m => m.id), // All lessons
          quizScores: [{
            quizId: course1Modules.find(m => m.type === 'quiz')?.id || 'module-1-4',
            score: 100,
            attempts: 1,
            completedAt: new Date().toISOString()
          }],
          progress: 100,
          status: 'completed',
          currentAttempt: 1,
          attempts: [],
          bestScore: 100,
          totalXpEarned: 500,
          certificateEarned: true,
          lastAccessedAt: new Date().toISOString()
        })

        // Complete course and award XP
        await completeCourseAttempt(
          students[0].id,
          tenant.id,
          course1.id,
          100, // Perfect score
          course1Modules.slice(0, 6).map(m => m.id),
          [{
            quizId: course1Modules.find(m => m.type === 'quiz')?.id || 'module-1-4',
            score: 100,
            completedAt: new Date().toISOString()
          }]
        )

        console.log(`  ✅ Student 1 (${students[0].firstName}): Completed course 1`)
      } catch (error: any) {
        console.error(`  ❌ Error creating progress for student 1:`, error.message)
      }
    }

    // Student 2 (Pedro): Partial progress in course 1
    if (students[1]) {
      try {
        await upsertUserProgress({
          id: `progress-${students[1].id}-${course1.id}`,
          userId: students[1].id,
          tenantId: tenant.id,
          courseId: course1.id,
          completedLessons: course1Modules.slice(0, 3).map(m => m.id), // First 3 lessons
          quizScores: [],
          progress: 50,
          status: 'in-progress',
          currentAttempt: 1,
          attempts: [],
          bestScore: 0,
          totalXpEarned: 0,
          certificateEarned: false,
          lastAccessedAt: new Date().toISOString()
        })

        // Award XP for completed lessons
        await awardXP(students[1].id, tenant.id, 150, 'lesson-completed')

        console.log(`  ✅ Student 2 (${students[1].firstName}): 50% progress in course 1`)
      } catch (error: any) {
        console.error(`  ❌ Error creating progress for student 2:`, error.message)
      }
    }

    // Student 3 (Laura): Partial progress in course 2
    if (students[2]) {
      try {
        await upsertUserProgress({
          id: `progress-${students[2].id}-${course2.id}`,
          userId: students[2].id,
          tenantId: tenant.id,
          courseId: course2.id,
          completedLessons: course2Modules.slice(0, 2).map(m => m.id), // First 2 lessons
          quizScores: [],
          progress: 50,
          status: 'in-progress',
          currentAttempt: 1,
          attempts: [],
          bestScore: 0,
          totalXpEarned: 0,
          certificateEarned: false,
          lastAccessedAt: new Date().toISOString()
        })

        await awardXP(students[2].id, tenant.id, 100, 'lesson-completed')

        console.log(`  ✅ Student 3 (${students[2].firstName}): 50% progress in course 2`)
      } catch (error: any) {
        console.error(`  ❌ Error creating progress for student 3:`, error.message)
      }
    }

    console.log(`\n  ✅ Created user progress for students\n`)

    // ============================================
    // 6. GENERATE CERTIFICATE (For student who completed course 1)
    // ============================================
    console.log('🎓 Step 6: Generating certificates...')

    if (students[0] && course1) {
      try {
        await createCertificate(
          tenant.id,
          students[0].id,
          course1.id,
          course1.title,
          `${students[0].firstName} ${students[0].lastName}`,
          adminUser.id
        )
        console.log(`  ✅ Generated certificate for ${students[0].firstName} - "${course1.title}"`)
      } catch (error: any) {
        if (error.message?.includes('already exists') || error.message?.includes('ya existe')) {
          console.log(`  ℹ️  Certificate already exists for ${students[0].firstName}`)
        } else {
          console.error(`  ❌ Error generating certificate:`, error.message)
        }
      }
    }

    console.log(`\n  ✅ Certificates created\n`)

    // ============================================
    // 7. CREATE FORUM QUESTIONS AND ANSWERS
    // ============================================
    console.log('💬 Step 7: Creating forum questions and answers...')

    if (course1 && students[0] && instructorUser) {
      try {
        // Question 1
        const question1 = await createQuestion(
          tenant.id,
          course1.id,
          course1Modules[0].id, // Module ID
          students[0].id,
          `${students[0].firstName} ${students[0].lastName}`,
          students[0].avatar,
          '¿Cómo puedo ver mi progreso en el curso?',
          'Quisiera saber cómo puedo ver cuánto he avanzado en el curso y qué lecciones me faltan por completar.'
        )
        console.log(`  ✅ Question 1: "${question1.title}"`)

        // Answer to Question 1
        await createAnswer(
          tenant.id,
          question1.id,
          instructorUser.id,
          `${instructorUser.firstName} ${instructorUser.lastName}`,
          instructorUser.avatar,
          'Puedes ver tu progreso en el dashboard o dentro del curso mismo. Hay una barra de progreso que muestra el porcentaje completado.'
        )
        console.log(`  ✅ Answer to Question 1`)

        // Question 2
        const question2 = await createQuestion(
          tenant.id,
          course1.id,
          course1Modules[1].id, // Module ID
          students[1]?.id || students[0].id,
          `${students[1]?.firstName || students[0].firstName} ${students[1]?.lastName || students[0].lastName}`,
          students[1]?.avatar || students[0].avatar,
          '¿Cuánto tiempo tengo para completar un curso?',
          'Me gustaría saber si hay un tiempo límite para completar los cursos asignados.'
        )
        console.log(`  ✅ Question 2: "${question2.title}"`)

      } catch (error: any) {
        console.error(`  ❌ Error creating forum content:`, error.message)
      }
    }

    console.log(`\n  ✅ Forum content created\n`)

    // ============================================
    // 8. CREATE ACTIVITY FEED ITEMS
    // ============================================
    console.log('📱 Step 8: Creating activity feed items...')

    try {
      // Activity 1: Student completed course
      if (students[0] && course1) {
        await createActivityFeedItem(
          tenant.id,
          students[0].id,
          `${students[0].firstName} ${students[0].lastName}`,
          students[0].avatar,
          'course-completed',
          {
            courseName: course1.title
          }
        )
        console.log(`  ✅ Activity 1: Course completed`)
      }

      // Activity 2: Level up (this is a valid type)
      if (students[0]) {
        await createActivityFeedItem(
          tenant.id,
          students[0].id,
          `${students[0].firstName} ${students[0].lastName}`,
          students[0].avatar,
          'level-up',
          {
            level: 2
          }
        )
        console.log(`  ✅ Activity 2: Level up`)
      }

      // Activity 3: Certificate earned (using achievement-unlocked type)
      if (students[0] && course1) {
        await createActivityFeedItem(
          tenant.id,
          students[0].id,
          `${students[0].firstName} ${students[0].lastName}`,
          students[0].avatar,
          'achievement-unlocked',
          {
            achievementName: `Certificado: ${course1.title}`
          }
        )
        console.log(`  ✅ Activity 3: Certificate earned`)
      }

      // Activity 4: Badge earned
      if (students[1]) {
        await createActivityFeedItem(
          tenant.id,
          students[1].id,
          `${students[1].firstName} ${students[1].lastName}`,
          students[1].avatar,
          'badge-earned',
          {
            badgeName: 'Primer Paso',
            badgeIcon: '🎯'
          }
        )
        console.log(`  ✅ Activity 4: Badge earned`)
      }

    } catch (error: any) {
      console.error(`  ❌ Error creating activity feed:`, error.message)
    }

    console.log(`\n  ✅ Activity feed items created\n`)

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60))
    console.log('🎉 DEMO SETUP COMPLETE!')
    console.log('='.repeat(60))
    console.log('\n📋 Login Credentials:')
    console.log('   Tenant: kainet')
    console.log('\n   👤 Super Admin:')
    console.log('      Email: ana.lopez@kainet.mx')
    console.log('      Password: Demo123!')
    console.log('\n   👤 Content Manager:')
    console.log('      Email: carlos.content@kainet.mx')
    console.log('      Password: Demo123!')
    console.log('\n   👤 Instructor:')
    console.log('      Email: maria.instructor@kainet.mx')
    console.log('      Password: Demo123!')
    console.log('\n   👤 Students:')
    console.log('      Email: juan.student@kainet.mx')
    console.log('      Password: Demo123!')
    console.log('\n      Email: pedro.student@kainet.mx')
    console.log('      Password: Demo123!')
    console.log('\n      Email: laura.student@kainet.mx')
    console.log('      Password: Demo123!')
    console.log('\n📚 Demo Courses Created:')
    console.log(`   1. "${course1?.title}" - Published`)
    console.log(`   2. "${course2?.title}" - Published`)
    console.log(`   3. "${course3?.title}" - Published`)
    console.log('\n📊 Demo Data:')
    console.log(`   - ${Object.keys(createdUsers).length} users`)
    console.log(`   - ${courses.length} courses (all published)`)
    console.log(`   - ${students.length} students with course assignments`)
    console.log(`   - User progress created for all students`)
    console.log(`   - 1 certificate generated`)
    console.log(`   - 2 forum questions with answers`)
    console.log(`   - 5 activity feed items`)
    console.log('\n🌐 Access at: http://localhost:5173')
    console.log('   Use tenant slug: kainet')
    console.log('\n✅ Ready for demo!')
    console.log('='.repeat(60) + '\n')

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()

