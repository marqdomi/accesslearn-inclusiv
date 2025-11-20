require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');

async function createTestCourse() {
  try {
    console.log('🎓 Creando curso de prueba completo...\n');

    const client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY
    });

    const database = client.database(process.env.COSMOS_DATABASE);
    const coursesContainer = database.container('courses');

    const testCourse = {
      id: 'course-test-complete-2024',
      tenantId: 'tenant-kainet',
      title: 'Curso de Prueba Completo - Sistema de Biblioteca',
      description: 'Curso diseñado para probar todas las funcionalidades: progreso, XP, reintentos, certificados y sistema de biblioteca.',
      category: 'Testing',
      difficulty: 'beginner',
      estimatedHours: 2,
      totalXP: 500, // XP total del curso
      status: 'active',
      modules: [
        {
          id: 'module-1',
          title: 'Módulo 1: Fundamentos',
          description: 'Aprende los conceptos básicos',
          order: 1,
          estimatedMinutes: 30,
          lessons: [
            {
              id: 'lesson-1-1',
              title: 'Lección 1: Introducción',
              type: 'markdown',
              order: 1,
              duration: 10,
              isRequired: true,
              xpReward: 50,
              content: {
                markdown: `# Lección 1: Introducción

¡Bienvenido al curso de prueba completo! 🎓

## Objetivos de esta lección

En esta lección aprenderás los fundamentos básicos que necesitas para avanzar en el curso.

### Conceptos clave:

1. **Concepto 1: Fundamentos básicos**
   - Comprende los principios esenciales
   - Establece una base sólida

2. **Concepto 2: Principios importantes**
   - Aprende las mejores prácticas
   - Evita errores comunes

3. **Concepto 3: Aplicación práctica**
   - Pon en práctica lo aprendido
   - Desarrolla habilidades reales

## ¡Comencemos!

Una vez que termines de leer, haz clic en "Marcar como Completado" para ganar **50 XP** y continuar.`
              }
            },
            {
              id: 'lesson-1-2',
              title: 'Lección 2: Práctica Inicial',
              type: 'markdown',
              order: 2,
              duration: 15,
              isRequired: true,
              xpReward: 75,
              content: {
                markdown: `# Lección 2: Práctica Inicial

Ahora vamos a poner en práctica lo aprendido. 💪

## Ejercicio Práctico

**Pregunta**: ¿Cuál es el primer paso para dominar cualquier tema?

**Respuesta**: Entender los fundamentos básicos.

## Tips importantes:

- 📚 Estudia con regularidad
- 🎯 Enfócate en la práctica
- 💡 No tengas miedo de cometer errores
- 🚀 La persistencia es clave

Completa esta lección para ganar **75 XP**.`
              }
            },
            {
              id: 'quiz-1',
              title: 'Quiz del Módulo 1',
              type: 'quiz',
              order: 3,
              duration: 5,
              xpValue: 100,
              content: {
                quiz: {
                  description: 'Responde las siguientes preguntas sobre los fundamentos del módulo 1',
                  passingScore: 70,
                  maxLives: 3,
                  showTimer: false,
                  questions: [
                    {
                      id: 'q1-1',
                      question: '¿Qué es lo más importante en los fundamentos?',
                      type: 'multiple-choice',
                      options: [
                        'La teoría',
                        'La práctica',
                        'Ambas',
                        'Ninguna'
                      ],
                      correctAnswer: 2,
                      points: 25
                    },
                    {
                      id: 'q1-2',
                      question: '¿Cuántos conceptos clave hay en la lección 1?',
                      type: 'multiple-choice',
                      options: [
                        '1',
                        '2',
                        '3',
                        '4'
                      ],
                      correctAnswer: 2,
                      points: 25
                    },
                    {
                      id: 'q1-3',
                      question: '¿La práctica es importante?',
                      type: 'true-false',
                      correctAnswer: true,
                      points: 25
                    },
                    {
                      id: 'q1-4',
                      question: '¿Qué aprendiste en este módulo?',
                      type: 'multiple-choice',
                      options: [
                        'Fundamentos',
                        'Práctica',
                        'Teoría',
                        'Todo lo anterior'
                      ],
                      correctAnswer: 3,
                      points: 25
                    }
                  ]
                }
              }
            }
          ]
        },
        {
          id: 'module-2',
          title: 'Módulo 2: Conceptos Avanzados',
          description: 'Profundiza en temas más complejos',
          order: 2,
          estimatedMinutes: 40,
          lessons: [
            {
              id: 'lesson-2-1',
              title: 'Lección 3: Conceptos Intermedios',
              type: 'markdown',
              order: 1,
              duration: 15,
              isRequired: true,
              xpReward: 75,
              content: {
                markdown: `# Lección 3: Conceptos Intermedios

¡Excelente progreso! Ahora vamos a profundizar. 🚀

## Conceptos Avanzados

### 1. Concepto Avanzado 1
Comprende las implicaciones más profundas del tema.

### 2. Concepto Avanzado 2  
Aprende a aplicar estos conocimientos en contextos complejos.

### 3. Aplicaciones Prácticas
Casos de uso reales donde puedes aplicar lo aprendido.

## Lo que has logrado hasta ahora:

✅ Fundamentos básicos  
✅ Práctica inicial  
✅ Conceptos intermedios

Completa esta lección para ganar **75 XP** y continuar al proyecto final.`
              }
            },
            {
              id: 'lesson-2-2',
              title: 'Lección 4: Proyecto Práctico',
              type: 'markdown',
              order: 2,
              duration: 20,
              isRequired: true,
              xpReward: 100,
              content: {
                markdown: `# Lección 4: Proyecto Práctico

¡Es hora de poner todo en práctica! 🎯

## Tu Proyecto

Crea una solución completa usando todos los conceptos aprendidos.

### Pasos del proyecto:

1. **Planificación** 📋
   - Define el alcance
   - Establece objetivos claros
   
2. **Desarrollo** 💻
   - Implementa la solución
   - Aplica buenas prácticas
   
3. **Pruebas** 🧪
   - Verifica que todo funcione
   - Corrige errores
   
4. **Entrega** 🚀
   - Presenta tu trabajo
   - Celebra tu logro

Completa esta lección para ganar **100 XP**. ¡Luego viene el quiz final!`
              }
            },
            {
              id: 'quiz-2',
              title: 'Quiz Final',
              type: 'quiz',
              order: 3,
              duration: 5,
              xpValue: 100,
              content: {
                quiz: {
                  description: 'Evaluación final del curso - demuestra todo lo que aprendiste',
                  passingScore: 70,
                  maxLives: 3,
                  showTimer: false,
                  questions: [
                    {
                      id: 'q2-1',
                      question: '¿Cuál es el primer paso en un proyecto?',
                      type: 'multiple-choice',
                      options: [
                        'Desarrollo',
                        'Planificación',
                        'Pruebas',
                        'Entrega'
                      ],
                      correctAnswer: 1,
                      points: 25
                    },
                    {
                      id: 'q2-2',
                      question: '¿Cuántos pasos tiene el proyecto?',
                      type: 'multiple-choice',
                      options: [
                        '2',
                        '3',
                        '4',
                        '5'
                      ],
                      correctAnswer: 2,
                      points: 25
                    },
                    {
                      id: 'q2-3',
                      question: '¿Es importante la planificación?',
                      type: 'true-false',
                      correctAnswer: true,
                      points: 25
                    },
                    {
                      id: 'q2-4',
                      question: '¿Qué has aprendido en todo el curso?',
                      type: 'multiple-choice',
                      options: [
                        'Solo teoría',
                        'Solo práctica',
                        'Teoría y práctica',
                        'Nada'
                      ],
                      correctAnswer: 2,
                      points: 25
                    }
                  ]
                }
              }
            }
          ]
        }
      ],
      prerequisites: [],
      learningObjectives: [
        'Dominar los fundamentos del tema',
        'Aplicar conceptos en proyectos reales',
        'Desarrollar habilidades prácticas',
        'Obtener certificación al completar al 100%'
      ],
      tags: ['testing', 'complete', 'biblioteca', 'xp-system'],
      coverImage: 'https://via.placeholder.com/400x200?text=Curso+de+Prueba',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      // Configuración del sistema de XP
      xpDistribution: {
        lessons: 300,  // 60% para lecciones
        quizzes: 200   // 40% para quizzes
      },
      // Criterios para certificado
      certificateCriteria: {
        minScore: 100,
        requiredLessons: ['lesson-1-1', 'lesson-1-2', 'lesson-2-1', 'lesson-2-2'],
        requiredQuizzes: ['quiz-1', 'quiz-2']
      }
    };

    // Usar upsert para crear o actualizar
    console.log('💾 Guardando curso en la base de datos...');
    const { resource: savedCourse } = await coursesContainer.items.upsert(testCourse);
    console.log('✅ Curso guardado exitosamente!');
    console.log('   ID:', savedCourse.id);
    console.log('   Tenant:', savedCourse.tenantId);
    console.log('   Status:', savedCourse.status, '\n');

    console.log('📚 Detalles del curso:');
    console.log(`   ID: ${testCourse.id}`);
    console.log(`   Título: ${testCourse.title}`);
    console.log(`   Módulos: ${testCourse.modules.length}`);
    console.log(`   Lecciones totales: ${testCourse.modules.reduce((sum, m) => sum + m.lessons.length, 0)}`);
    console.log(`   XP Total: ${testCourse.totalXP}`);
    console.log(`   Duración estimada: ${testCourse.estimatedHours} horas`);
    console.log(`   Tenant: ${testCourse.tenantId}\n`);

    console.log('🎯 Características incluidas:');
    console.log('   ✅ Sistema de módulos estructurado');
    console.log('   ✅ Lecciones con XP individual');
    console.log('   ✅ Quizzes con preguntas y respuestas');
    console.log('   ✅ Sistema de XP total (500 puntos)');
    console.log('   ✅ Compatible con sistema de reintentos');
    console.log('   ✅ Criterios para certificado');
    console.log('   ✅ Progreso rastreable por lección\n');

  } catch (error) {
    console.error('❌ Error creando curso:', error);
    throw error;
  }
}

createTestCourse()
  .then(() => {
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });
