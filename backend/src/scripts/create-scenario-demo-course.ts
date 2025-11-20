import { CosmosClient } from '@azure/cosmos'
import dotenv from 'dotenv'

dotenv.config()

const COSMOS_ENDPOINT = process.env.COSMOS_ENDPOINT!
const COSMOS_KEY = process.env.COSMOS_KEY!
const DATABASE_ID = 'accesslearn-db'
const CONTAINER_ID = 'courses'

async function createScenarioDemoCourse() {
  const client = new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY })
  const database = client.database(DATABASE_ID)
  const container = database.container(CONTAINER_ID)

  const course = {
    id: 'course-servicio-cliente-kainet',
    tenantId: 'tenant-kainet',
    title: 'Servicio al Cliente Excepcional',
    description: 'Aprende a manejar situaciones desafiantes con clientes usando escenarios interactivos y toma de decisiones',
    category: 'customer-service',
    difficulty: 'intermediate',
    duration: 45,
    estimatedMinutes: 45,
    instructor: {
      name: 'María Gutiérrez',
      title: 'Experta en Servicio al Cliente',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria'
    },
    coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
    tags: ['servicio-al-cliente', 'comunicación', 'resolución-conflictos', 'retail'],
    xpTotal: 300,
    enrolledCount: 156,
    rating: 4.8,
    status: 'active',
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    modules: [
      {
        id: 'module-1',
        title: 'Fundamentos del Servicio al Cliente',
        description: 'Principios básicos y habilidades esenciales',
        orderIndex: 0,
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'Introducción al Servicio Excepcional',
            type: 'content',
            duration: 10,
            xpReward: 20,
            orderIndex: 0,
            content: {
              markdown: `# Servicio al Cliente Excepcional

## ¿Qué es el Servicio al Cliente?

El servicio al cliente es mucho más que resolver problemas. Es sobre:

- **Crear experiencias memorables** que generen lealtad
- **Anticipar necesidades** antes de que el cliente las exprese
- **Resolver conflictos** de manera que fortalezcan la relación
- **Representar los valores** de tu empresa en cada interacción

## Los 5 Pilares del Servicio Excepcional

### 1. Empatía
Ponerse en los zapatos del cliente. Entender su frustración, urgencia o preocupación.

### 2. Comunicación Clara
Usar lenguaje simple, positivo y orientado a soluciones.

### 3. Proactividad
No esperar a que el problema escale. Actuar rápido y ofrecer alternativas.

### 4. Conocimiento
Dominar productos, procesos y políticas para dar respuestas confiables.

### 5. Actitud Positiva
Mantener el profesionalismo incluso en situaciones difíciles.

## El Impacto del Buen Servicio

- **86%** de los clientes pagarían más por una mejor experiencia
- **95%** de los clientes comparten experiencias negativas con otros
- **70%** de los clientes que tuvieron un problema bien resuelto vuelven a comprar

> "Un cliente satisfecho es el mejor activo de marketing que puede tener una empresa." - Michael LeBoeuf

En las siguientes lecciones, pondrás estos principios en práctica con escenarios reales.`
            }
          },
          {
            id: 'lesson-1-2',
            title: 'Escenario: Cliente con Pedido Retrasado',
            type: 'quiz',
            duration: 15,
            xpReward: 100,
            orderIndex: 1,
            content: {
              quiz: {
                description: 'Maneja una situación real de un cliente frustrado por un retraso en su pedido',
                maxLives: 1, // Scenarios no usan vidas tradicionales
                showTimer: false,
                passingScore: 70,
                questions: [
                  {
                    id: 'scenario-1',
                    type: 'scenario-solver',
                    xpReward: 100,
                    question: {
                      title: 'Cliente Frustrado por Retraso',
                      description: 'Un escenario interactivo donde tus decisiones impactan el resultado',
                      perfectScore: 70, // Mejor path: opt-1d (35) + opt-2g (35) = 70
                      startStepId: 'step-1',
                      steps: [
                        {
                          id: 'step-1',
                          situation: 'Primera Interacción',
                          context: 'Recibes una llamada de Ana, quien ordenó un regalo de cumpleaños hace 5 días con envío "express 2 días". Hoy es el cumpleaños y el paquete no ha llegado. Su tono es claramente molesto.',
                          options: [
                            {
                              id: 'opt-1a',
                              text: '"Déjame revisar su pedido inmediatamente. Entiendo lo frustrante que debe ser esto."',
                              consequence: 'Ana suspira aliviada. "Gracias, al menos alguien me escucha." Se siente validada y baja un poco la defensiva.',
                              isCorrect: true,
                              score: 30,
                              nextScenarioId: 'step-2-good'
                            },
                            {
                              id: 'opt-1b',
                              text: '"Nuestro sistema dice que está en tránsito. Los retrasos pasan a veces."',
                              consequence: 'Ana responde molesta: "¿En serio? ¡Pagué extra por express! No me digas que pasan cosas." El tono se vuelve más hostil.',
                              isCorrect: false,
                              score: -10,
                              nextScenarioId: 'step-2-bad'
                            },
                            {
                              id: 'opt-1c',
                              text: '"Debe contactar al courier, nosotros solo despachamos. Aquí está su número."',
                              consequence: 'Ana exige hablar con un supervisor. "¡Ustedes me cobraron, ustedes son responsables! No me pasen de oficina en oficina."',
                              isCorrect: false,
                              score: -20,
                              nextScenarioId: 'step-2-escalated'
                            },
                            {
                              id: 'opt-1d',
                              text: '"Lamento mucho esto. ¿Me da su número de pedido? Voy a rastrearlo en tiempo real con usted en línea."',
                              consequence: 'Ana se calma notablemente. "Bueno, eso suena bien. El número es..." Aprecia la atención personalizada.',
                              isCorrect: true,
                              score: 35,
                              nextScenarioId: 'step-2-excellent'
                            }
                          ]
                        },
                        {
                          id: 'step-2-good',
                          situation: 'Investigando el Problema',
                          context: 'Revisas el sistema y ves que el courier marcó "dirección incorrecta" y devolvió el paquete al centro de distribución. Es un error del courier, pero ahora el paquete llegará 2 días tarde.',
                          options: [
                            {
                              id: 'opt-2a',
                              text: '"El courier cometió un error con la dirección. Puedo reenviarlo, pero llegará en 2 días."',
                              consequence: 'Ana explota: "¡2 días! ¡El cumpleaños es HOY! ¿Y qué hago con eso?" Se siente abandonada a su suerte.',
                              isCorrect: false,
                              score: 0
                            },
                            {
                              id: 'opt-2b',
                              text: '"Encontré el problema - el courier lo devolvió por error. Le ofrezco dos opciones: reembolso completo o reenvío urgente sin costo más un vale de $500."',
                              consequence: 'Ana considera las opciones. "El vale... está bien, pero igual ya no llega hoy." Acepta pero no está completamente satisfecha.',
                              isCorrect: true,
                              score: 20
                            },
                            {
                              id: 'opt-2c',
                              text: '"El courier tiene la culpa, pero yo asumo la responsabilidad. Le reembolso el 100%, le envío el pedido nuevamente sin costo, y le doy un vale de $1000. ¿Esto ayuda?"',
                              consequence: 'Ana suspira. "Wow, no esperaba eso. Sí, es justo. Agradezco que reconozcan el error." Su tono cambia completamente a positivo.',
                              isCorrect: true,
                              score: 35
                            }
                          ]
                        },
                        {
                          id: 'step-2-bad',
                          situation: 'Cliente Cada Vez Más Molesto',
                          context: 'Ana está elevando su voz. "¡No quiero excusas! ¡Quiero mi pedido HOY!" Otros clientes en la tienda comienzan a notar.',
                          options: [
                            {
                              id: 'opt-2d',
                              text: '"Señora, por favor baje la voz. Estoy tratando de ayudarla."',
                              consequence: 'Ana responde: "¡No me digas cómo hablar! Habla con tu supervisor. YA." La situación ha escalado al máximo.',
                              isCorrect: false,
                              score: -10
                            },
                            {
                              id: 'opt-2e',
                              text: '"Ana, entiendo completamente su frustración. Tiene razón en estar molesta. Déjeme ver qué opciones inmediatas tenemos."',
                              consequence: 'Ana hace una pausa. "Está bien... gracias por entender al menos." Se abre un poco a escuchar soluciones.',
                              isCorrect: true,
                              score: 15
                            }
                          ]
                        },
                        {
                          id: 'step-2-escalated',
                          situation: 'Daño de Control - Escalamiento',
                          context: 'El supervisor se hace cargo. Ana ya está escribiendo una reseña negativa en su teléfono mientras espera. La primera impresión fue desastrosa.',
                          options: [
                            {
                              id: 'opt-2f',
                              text: '(Observas cómo el supervisor maneja la situación)',
                              consequence: 'El supervisor logra calmarla con un reembolso y descuento, pero Ana menciona: "El primero que me atendió no ayudó nada." Aprendes para la próxima.',
                              isCorrect: false,
                              score: 10
                            }
                          ]
                        },
                        {
                          id: 'step-2-excellent',
                          situation: 'Rastreando en Tiempo Real',
                          context: 'Mientras Ana espera, rastreas el paquete y descubres que está a solo 2 horas de su domicilio en la camioneta del courier. Puedes contactar al conductor directamente.',
                          options: [
                            {
                              id: 'opt-2g',
                              text: '"¡Buenas noticias! Su paquete está a 2 horas. Puedo contactar al conductor para priorizarlo. ¿Estaría en casa en 2 horas?"',
                              consequence: 'Ana casi grita de alegría. "¡¿En serio?! ¡Sí, estaré aquí! ¡Gracias, gracias!" Pasa de frustrada a emocionada.',
                              isCorrect: true,
                              score: 35
                            },
                            {
                              id: 'opt-2h',
                              text: '"Está cerca, debería llegar hoy. Le confirmo en un rato."',
                              consequence: 'Ana pregunta: "¿Pero seguro hoy? No puedo esperar más promesas rotas." Se mantiene escéptica.',
                              isCorrect: false,
                              score: 10
                            }
                          ]
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      {
        id: 'module-2',
        title: 'Situaciones Desafiantes',
        description: 'Manejo de clientes difíciles y conflictos complejos',
        orderIndex: 1,
        lessons: [
          {
            id: 'lesson-2-1',
            title: 'Técnicas de Desescalamiento',
            type: 'content',
            duration: 10,
            xpReward: 20,
            orderIndex: 0,
            content: {
              markdown: `# Técnicas de Desescalamiento

## ¿Qué es el Desescalamiento?

El desescalamiento es el arte de reducir la intensidad emocional de un conflicto. Es tu superpoder en servicio al cliente.

## La Escalera de la Emoción

1. **Molestia** → Fácil de resolver con empatía
2. **Frustración** → Necesita validación + solución
3. **Enojo** → Requiere calma profesional
4. **Furia** → Alerta, necesitas técnicas avanzadas

## Técnicas Probadas

### 1. La Técnica del Eco
Repite lo que el cliente dijo para mostrar que escuchas:
- Cliente: "¡Esto es inaceptable!"
- Tú: "Escucho que esto es inaceptable para usted, y tiene razón..."

### 2. El Poder de "Y" vs "Pero"
- ❌ "Entiendo, **pero** nuestra política..."
- ✅ "Entiendo, **y** déjeme ver qué podemos hacer..."

### 3. Opciones, No Órdenes
- ❌ "Tiene que esperar 3 días"
- ✅ "Puedo ofrecerle un reembolso hoy o un reenvío express mañana"

### 4. El Lenguaje del "Nosotros"
- ❌ "Usted tiene que..."
- ✅ "Trabajemos juntos en esto..."

### 5. Enfoque en Soluciones
- ❌ "No se puede hacer eso"
- ✅ "Lo que sí puedo hacer es..."

## Frases Mágicas 🎯

- "Entiendo perfectamente su frustración"
- "Si yo estuviera en su lugar, sentiría lo mismo"
- "Déjeme ver qué opciones tenemos"
- "Voy a ser su defensor interno"
- "Gracias por su paciencia mientras resolvemos esto"

## Señales de Alerta 🚨

Cuando escuches esto, es momento de traer un supervisor:
- Amenazas legales
- Insultos personales repetidos
- Demandas imposibles de cumplir
- Cliente pregunta específicamente por supervisor

> Recuerda: **No es personal**. El cliente está frustrado con la situación, no contigo. Tu trabajo es ser el puente hacia la solución.`
            }
          },
          {
            id: 'lesson-2-2',
            title: 'Escenario: Cliente Exigiendo Gerente',
            type: 'quiz',
            duration: 15,
            xpReward: 100,
            orderIndex: 1,
            content: {
              quiz: {
                description: 'Un cliente enojado exige hablar con el gerente inmediatamente',
                maxLives: 1,
                showTimer: false,
                passingScore: 70,
                questions: [
                  {
                    id: 'scenario-2',
                    type: 'scenario-solver',
                    xpReward: 100,
                    question: {
                      title: 'Demanda de Escalamiento',
                      description: 'Maneja a un cliente que exige hablar con un gerente',
                      perfectScore: 65, // Mejor path: opt-a1c (30) + opt-a2c (35) = 65
                      startStepId: 'step-a1',
                      steps: [
                        {
                          id: 'step-a1',
                          situation: 'Exigencia Inmediata',
                          context: 'Roberto entra a la tienda y de inmediato dice: "Necesito hablar con el gerente AHORA. No quiero perder tiempo con empleados." Otros clientes voltean a ver.',
                          options: [
                            {
                              id: 'opt-a1a',
                              text: '"El gerente está ocupado. ¿En qué puedo ayudarle yo?"',
                              consequence: 'Roberto responde molesto: "No me escuchaste. Dije que quiero al GERENTE. ¿Está sordo?" El ambiente se tensa más.',
                              isCorrect: false,
                              score: -10,
                              nextScenarioId: 'step-a2-worse'
                            },
                            {
                              id: 'opt-a1b',
                              text: '"Por supuesto, puedo llamar al gerente. ¿Me permite preguntarle de qué se trata para informarle?"',
                              consequence: 'Roberto duda un segundo. "Un empleado me vendió un producto defectuoso y se niega a cambiarlo." Se abre a dar contexto.',
                              isCorrect: true,
                              score: 25,
                              nextScenarioId: 'step-a2-good'
                            },
                            {
                              id: 'opt-a1c',
                              text: '"Entiendo. Lo llamaré ahora mismo. Mientras, ¿gusta tomar asiento? Le ofrezco un café."',
                              consequence: 'Roberto se calma un poco. "Bueno... está bien." La hospitalidad desarma un poco su enojo inicial.',
                              isCorrect: true,
                              score: 30,
                              nextScenarioId: 'step-a2-excellent'
                            }
                          ]
                        },
                        {
                          id: 'step-a2-good',
                          situation: 'Investigando Antes de Escalar',
                          context: 'Roberto explica que compró una licuadora hace 2 semanas, se descompuso, y un colega le dijo que "no hay cambios después de 7 días". Tienes el ticket en mano.',
                          options: [
                            {
                              id: 'opt-a2a',
                              text: '"Veo aquí que tenemos garantía de 30 días. Su colega se equivocó. Puedo cambiarla ahora mismo."',
                              consequence: 'Roberto parpadea sorprendido. "¿Así de fácil? Pensé que iba a ser una batalla." Su actitud cambia completamente. "Bueno, gracias."',
                              isCorrect: true,
                              score: 35
                            },
                            {
                              id: 'opt-a2b',
                              text: '"Déjeme llamar al gerente para confirmar si podemos hacer algo."',
                              consequence: 'Roberto frunce el ceño. "¿No puedes tomar decisiones tú? Ok, llámalo." Resolviste el problema pero perdiste confianza.',
                              isCorrect: false,
                              score: 10
                            }
                          ]
                        },
                        {
                          id: 'step-a2-excellent',
                          situation: 'Contexto Completo',
                          context: 'Mientras Roberto espera con su café, revisas el sistema. Ves su historial: es cliente frecuente con $15,000 en compras. El producto defectuoso costó $800.',
                          options: [
                            {
                              id: 'opt-a2c',
                              text: '"Sr. Roberto, veo que es un cliente muy valioso para nosotros. Le ofrezco cambio inmediato + un 20% de descuento en su próxima compra. ¿Le parece?"',
                              consequence: 'Roberto casi se derrama el café. "Wow, no esperaba eso. Vine preparado para pelear. Claro que acepto. Disculpa si fui grosero."',
                              isCorrect: true,
                              score: 35
                            },
                            {
                              id: 'opt-a2d',
                              text: '"Puedo hacer el cambio ahora mismo, sin necesidad de molestar al gerente."',
                              consequence: 'Roberto asiente. "Bueno, eso es lo que necesitaba." Lo resolviste, pero no capitalizaste la oportunidad de fidelizar.',
                              isCorrect: true,
                              score: 20
                            }
                          ]
                        },
                        {
                          id: 'step-a2-worse',
                          situation: 'Escalamiento Total',
                          context: 'Roberto está levantando la voz. "¡Quiero al gerente AHORA o llamo a atención al cliente!" Otros clientes están grabando con sus teléfonos.',
                          options: [
                            {
                              id: 'opt-a2e',
                              text: '"(Respiras hondo) Tiene razón, lo llamaré inmediatamente. Lamento cómo comenzamos esta conversación."',
                              consequence: 'Roberto ve tu sinceridad. "Bueno... está bien. Gracias." Recuperaste un poco de la situación, pero el daño está hecho.',
                              isCorrect: true,
                              score: 15
                            }
                          ]
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        ]
      }
    ]
  }

  try {
    await container.items.create(course)
    console.log('✅ Curso creado exitosamente:', course.id)
    console.log('📚 Título:', course.title)
    console.log('📊 Módulos:', course.modules.length)
    console.log('📝 Lecciones totales:', course.modules.reduce((acc, m) => acc + m.lessons.length, 0))
    console.log('🎯 XP Total:', course.xpTotal)
  } catch (error: any) {
    if (error.code === 409) {
      console.log('⚠️  El curso ya existe, actualizándolo...')
      await container.item(course.id, course.tenantId).replace(course)
      console.log('✅ Curso actualizado')
    } else {
      console.error('❌ Error al crear curso:', error)
      throw error
    }
  }
}

createScenarioDemoCourse()
  .then(() => {
    console.log('\n🎉 Proceso completado')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Error:', error)
    process.exit(1)
  })
