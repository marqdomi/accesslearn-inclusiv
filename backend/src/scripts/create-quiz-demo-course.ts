import { CosmosClient } from '@azure/cosmos'
import * as dotenv from 'dotenv'

dotenv.config()

const endpoint = process.env.COSMOS_ENDPOINT!
const key = process.env.COSMOS_KEY!
const databaseId = process.env.COSMOS_DATABASE || 'accesslearn-db'

const client = new CosmosClient({ endpoint, key })
const database = client.database(databaseId)
const container = database.container('courses')

async function createQuizDemoCourse() {
  const quizCourse = {
    id: 'course-intro-rh-kainet',
    tenantId: 'tenant-kainet',
    title: 'Introducción a Recursos Humanos',
    description: 'Aprende los conceptos fundamentales de Recursos Humanos, políticas laborales y gestión de talento.',
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    difficulty: 'beginner',
    estimatedHours: 4,
    category: ['Recursos Humanos', 'Gestión'],
    tags: ['rh', 'recursos humanos', 'gestion', 'talento'],
    status: 'active',
    xpReward: 400,
    modules: [
      {
        id: 'module-1',
        title: 'Fundamentos de RH',
        description: 'Conceptos básicos de Recursos Humanos',
        order: 1,
        xpReward: 150,
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'Introducción a Recursos Humanos',
            type: 'markdown',
            order: 1,
            duration: 10,
            isRequired: true,
            xpReward: 15,
            content: {
              markdown: `# Introducción a Recursos Humanos

## ¿Qué es Recursos Humanos?

Recursos Humanos (RH) es el departamento encargado de **gestionar el talento humano** de una organización. Su función principal es maximizar el rendimiento de los empleados mientras asegura el cumplimiento de las políticas y normativas laborales.

### Funciones Principales de RH

1. **Reclutamiento y Selección**
   - Búsqueda de candidatos
   - Evaluación de perfiles
   - Proceso de entrevistas
   - Onboarding

2. **Capacitación y Desarrollo**
   - Programas de formación
   - Planes de carrera
   - Evaluación de desempeño

3. **Compensación y Beneficios**
   - Administración de nómina
   - Diseño de paquetes de compensación
   - Beneficios adicionales

4. **Relaciones Laborales**
   - Mediación de conflictos
   - Cumplimiento normativo
   - Comunicación interna

5. **Cultura Organizacional**
   - Valores corporativos
   - Clima laboral
   - Engagement

## Importancia de RH en las Organizaciones

> **💡 Dato importante**: Las empresas con departamentos de RH efectivos tienen un 30% menos de rotación de personal y 25% más de productividad.

El área de Recursos Humanos es fundamental porque:

- **Atrae y retiene talento** calificado
- **Mejora el clima laboral** y la satisfacción
- **Reduce costos** de contratación y capacitación
- **Asegura cumplimiento** legal y normativo
- **Impulsa la cultura** organizacional

## Evolución de RH

### RH Tradicional
- Enfoque administrativo
- Gestión de papeleos
- Control de asistencia

### RH Moderno (Gestión del Talento)
- **Enfoque estratégico**
- **Análisis de datos** (People Analytics)
- **Employee Experience**
- **Diversidad e Inclusión**

---

¡Ahora estás listo para aprender más sobre las funciones específicas de RH!`
            }
          },
          {
            id: 'lesson-1-2',
            title: 'Quiz: Fundamentos de RH',
            type: 'quiz',
            order: 2,
            duration: 15,
            isRequired: true,
            xpReward: 50,
            content: {
              quiz: {
                description: 'Evalúa tus conocimientos sobre los conceptos básicos de Recursos Humanos',
                maxLives: 3,
                showTimer: true,
                passingScore: 70,
                questions: [
                  {
                    id: 'q1',
                    type: 'multiple-choice',
                    xpReward: 15,
                    question: {
                      question: '¿Cuál es la función principal del departamento de Recursos Humanos?',
                      options: [
                        'Gestionar únicamente la nómina de los empleados',
                        'Maximizar el rendimiento de los empleados y asegurar cumplimiento normativo',
                        'Controlar el horario de entrada y salida',
                        'Organizar eventos sociales de la empresa'
                      ],
                      correctAnswer: 1,
                      explanation: 'La función principal de RH es gestionar el talento humano de forma integral, maximizando el rendimiento mientras se asegura el cumplimiento de políticas y normativas laborales.'
                    }
                  },
                  {
                    id: 'q2',
                    type: 'true-false',
                    xpReward: 10,
                    question: {
                      question: 'El RH moderno se enfoca únicamente en tareas administrativas como control de asistencia y nómina.',
                      correctAnswer: false,
                      explanation: 'Falso. El RH moderno (Gestión del Talento) tiene un enfoque estratégico, usando análisis de datos, mejorando la experiencia del empleado y promoviendo diversidad e inclusión.'
                    }
                  },
                  {
                    id: 'q3',
                    type: 'multiple-choice',
                    xpReward: 15,
                    question: {
                      question: '¿Cuál de estas NO es una función principal de Recursos Humanos?',
                      options: [
                        'Reclutamiento y Selección',
                        'Capacitación y Desarrollo',
                        'Diseño de productos',
                        'Relaciones Laborales'
                      ],
                      correctAnswer: 2,
                      explanation: 'El diseño de productos es función del área de Desarrollo de Producto o Ingeniería, no de Recursos Humanos. RH se enfoca en gestionar el talento humano.'
                    }
                  },
                  {
                    id: 'q4',
                    type: 'fill-blank',
                    xpReward: 20,
                    question: {
                      text: 'Las empresas con departamentos de RH efectivos tienen un {blank} menos de rotación de personal y {blank} más de productividad.',
                      blanks: ['30%', '25%'],
                      options: ['30%', '25%', '50%', '10%', '15%', '40%'],
                      explanation: 'Según estudios, las empresas con RH efectivos tienen 30% menos rotación y 25% más productividad.'
                    }
                  }
                ]
              }
            }
          },
          {
            id: 'lesson-1-3',
            title: 'Reclutamiento y Selección',
            type: 'markdown',
            order: 3,
            duration: 12,
            isRequired: true,
            xpReward: 20,
            content: {
              markdown: `# Reclutamiento y Selección de Personal

## Proceso de Reclutamiento

El reclutamiento es el proceso de **atraer candidatos calificados** para cubrir vacantes en la organización.

### Pasos del Proceso

1. **Análisis de la Vacante**
   - Definir perfil del puesto
   - Identificar competencias requeridas
   - Establecer requisitos (educación, experiencia, habilidades)

2. **Publicación de la Oferta**
   - Portales de empleo (LinkedIn, Indeed, Glassdoor)
   - Redes sociales
   - Sitio web corporativo
   - Referencias internas

3. **Revisión de Candidaturas**
   - Filtrado de CVs
   - Evaluación de perfiles
   - Preselección de candidatos

4. **Entrevistas**
   - Primera entrevista (RH)
   - Entrevistas técnicas
   - Evaluaciones psicométricas
   - Assessment center

5. **Selección Final**
   - Verificación de referencias
   - Exámenes médicos
   - Oferta laboral
   - Negociación de condiciones

## Tipos de Reclutamiento

### Reclutamiento Interno
- Promoción de empleados actuales
- **Ventajas**: Menor costo, conocen la cultura
- **Desventajas**: Limita la diversidad de ideas

### Reclutamiento Externo
- Búsqueda fuera de la organización
- **Ventajas**: Nuevas perspectivas, amplía el pool de talento
- **Desventajas**: Mayor costo y tiempo

### Reclutamiento Mixto
- Combinación de ambos enfoques
- Mejor práctica recomendada

## Onboarding Efectivo

El onboarding es crucial para la retención:

- **Primera semana**: Introducción a la empresa, cultura y herramientas
- **Primer mes**: Integración al equipo y primeros proyectos
- **Primeros 90 días**: Evaluación de adaptación y feedback

> **💡 Tip**: Un buen proceso de onboarding reduce la rotación en un 25% durante el primer año.`
            }
          }
        ]
      },
      {
        id: 'module-2',
        title: 'Normatividad Laboral',
        description: 'Leyes y regulaciones laborales en México',
        order: 2,
        xpReward: 120,
        lessons: [
          {
            id: 'lesson-2-1',
            title: 'Ley Federal del Trabajo',
            type: 'markdown',
            order: 1,
            duration: 15,
            isRequired: true,
            xpReward: 20,
            content: {
              markdown: `# Ley Federal del Trabajo (LFT)

## ¿Qué es la LFT?

La **Ley Federal del Trabajo** es el conjunto de normas que regulan las relaciones laborales en México, protegiendo los derechos de trabajadores y empleadores.

### Aspectos Clave

#### 1. Jornada Laboral
- **Jornada Diurna**: 8 horas máximo (6:00 - 20:00)
- **Jornada Nocturna**: 7 horas máximo (20:00 - 6:00)
- **Jornada Mixta**: 7.5 horas máximo

#### 2. Días de Descanso
- Mínimo 1 día de descanso por cada 6 días trabajados
- Preferentemente en domingo (con prima dominical del 25%)

#### 3. Vacaciones
| Años de servicio | Días de vacaciones |
|-----------------|-------------------|
| 1 año | 6 días |
| 2 años | 8 días |
| 3 años | 10 días |
| 4 años | 12 días |
| 5-9 años | 14 días |
| 10-14 años | 16 días |

Prima vacacional: **25% sobre el salario** de los días de vacaciones

#### 4. Aguinaldo
- Mínimo 15 días de salario
- Se paga antes del 20 de diciembre
- Proporcional si no completó el año

#### 5. Días de Asueto Obligatorios
1. 1 de enero (Año Nuevo)
2. Primer lunes de febrero (Día de la Constitución)
3. Tercer lunes de marzo (Natalicio de Benito Juárez)
4. 1 de mayo (Día del Trabajo)
5. 16 de septiembre (Independencia)
6. Tercer lunes de noviembre (Revolución Mexicana)
7. 1 de diciembre cada 6 años (Transmisión del Poder Ejecutivo)
8. 25 de diciembre (Navidad)

## Derechos del Trabajador

✅ Salario justo
✅ Seguridad Social (IMSS)
✅ Capacitación
✅ Ambiente laboral seguro
✅ No discriminación
✅ Libertad sindical

## Obligaciones del Empleador

📋 Registro ante el IMSS
📋 Pago de salarios en tiempo y forma
📋 Proporcionar herramientas de trabajo
📋 Cumplir con normas de seguridad e higiene
📋 Permitir inspecciones de trabajo
📋 Respetar derechos laborales`
            }
          },
          {
            id: 'lesson-2-2',
            title: 'Quiz: Normatividad Laboral',
            type: 'quiz',
            order: 2,
            duration: 15,
            isRequired: true,
            xpReward: 50,
            content: {
              quiz: {
                description: 'Evalúa tu conocimiento sobre la Ley Federal del Trabajo',
                maxLives: 3,
                showTimer: false,
                passingScore: 70,
                questions: [
                  {
                    id: 'q1',
                    type: 'multiple-choice',
                    xpReward: 15,
                    question: {
                      question: '¿Cuál es la duración máxima de la jornada laboral diurna según la LFT?',
                      options: [
                        '7 horas',
                        '8 horas',
                        '9 horas',
                        '10 horas'
                      ],
                      correctAnswer: 1,
                      explanation: 'La jornada laboral diurna tiene una duración máxima de 8 horas, según lo establece la Ley Federal del Trabajo.'
                    }
                  },
                  {
                    id: 'q2',
                    type: 'fill-blank',
                    xpReward: 20,
                    question: {
                      text: 'El aguinaldo mínimo en México es de {blank} días de salario y debe pagarse antes del {blank}.',
                      blanks: ['15', '20 de diciembre'],
                      options: ['15', '20 de diciembre', '10', '31 de diciembre', '20', '15 de diciembre'],
                      explanation: 'El aguinaldo mínimo es de 15 días de salario y debe pagarse antes del 20 de diciembre.'
                    }
                  },
                  {
                    id: 'q3',
                    type: 'true-false',
                    xpReward: 10,
                    question: {
                      question: 'La prima dominical debe ser del 25% adicional al salario cuando un trabajador labora en domingo.',
                      correctAnswer: true,
                      explanation: 'Verdadero. Cuando un trabajador labora en su día de descanso (generalmente domingo), tiene derecho a una prima adicional del 25% sobre su salario diario.'
                    }
                  },
                  {
                    id: 'q4',
                    type: 'multiple-choice',
                    xpReward: 15,
                    question: {
                      question: '¿Cuántos días de vacaciones le corresponden a un trabajador que ha cumplido 2 años de servicio?',
                      options: [
                        '6 días',
                        '8 días',
                        '10 días',
                        '12 días'
                      ],
                      correctAnswer: 1,
                      explanation: 'Según la LFT, un trabajador con 2 años de servicio tiene derecho a 8 días de vacaciones.'
                    }
                  }
                ]
              }
            }
          }
        ]
      }
    ],
    createdBy: 'admin-kainet',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  try {
    const { resource } = await container.items.create(quizCourse)
    console.log('✅ Curso con quizzes creado exitosamente!')
    console.log('Course ID:', resource?.id)
    console.log('Title:', resource?.title)
    console.log('Modules:', resource?.modules.length)
    console.log('\n📝 Quizzes incluidos:')
    resource?.modules.forEach((module: any) => {
      const quizLessons = module.lessons.filter((l: any) => l.type === 'quiz')
      if (quizLessons.length > 0) {
        console.log(`   - ${module.title}: ${quizLessons.length} quiz(zes)`)
      }
    })
  } catch (error: any) {
    if (error.code === 409) {
      console.log('⚠️  El curso ya existe')
    } else {
      console.error('❌ Error al crear el curso:', error.message)
    }
  }
}

createQuizDemoCourse()
  .then(() => {
    console.log('\n✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
