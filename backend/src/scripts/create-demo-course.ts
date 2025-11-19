import { CosmosClient } from '@azure/cosmos'
import * as dotenv from 'dotenv'

dotenv.config()

const endpoint = process.env.COSMOS_ENDPOINT!
const key = process.env.COSMOS_KEY!
const databaseId = process.env.COSMOS_DATABASE || 'accesslearn-db'

const client = new CosmosClient({ endpoint, key })
const database = client.database(databaseId)
const container = database.container('courses')

async function createDemoCourse() {
  const demoCourse = {
    id: 'course-intro-react-kainet',
    tenantId: 'tenant-kainet',
    title: 'Introducción a React',
    description: 'Aprende los fundamentos de React desde cero. Este curso te guiará a través de los conceptos básicos de componentes, hooks, y estado.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    difficulty: 'beginner',
    estimatedHours: 8,
    category: ['Desarrollo Web', 'Frontend'],
    tags: ['react', 'javascript', 'frontend', 'web'],
    status: 'active',
    xpReward: 500,
    modules: [
      {
        id: 'module-1',
        title: 'Fundamentos de React',
        description: 'Aprende los conceptos básicos de React',
        order: 1,
        xpReward: 100,
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'Bienvenida al curso',
            type: 'markdown',
            order: 1,
            duration: 5,
            isRequired: true,
            xpReward: 10,
            content: {
              markdown: `# ¡Bienvenido a Introducción a React! 👋

## ¿Qué es React?

React es una **biblioteca de JavaScript** para construir interfaces de usuario. Fue creada por Facebook y es una de las herramientas más populares para desarrollo web moderno.

### ¿Por qué aprender React?

1. **Altamente demandado** - Las empresas buscan desarrolladores React
2. **Componentes reutilizables** - Escribe código una vez, úsalo en todas partes
3. **Gran comunidad** - Miles de recursos y paquetes disponibles
4. **Ecosistema rico** - React Native para móviles, Next.js para SSR, y más

## Lo que aprenderás

En este curso, cubriremos:

- ✅ Conceptos básicos de React
- ✅ Componentes y Props
- ✅ Estado y Hooks
- ✅ Manejo de eventos
- ✅ Ciclo de vida de componentes
- ✅ Proyecto práctico

## Requisitos previos

Para este curso, necesitarás conocimientos básicos de:

- HTML
- CSS
- JavaScript (ES6+)

> **💡 Consejo**: Si eres nuevo en JavaScript, te recomendamos completar primero nuestro curso de JavaScript Moderno.

## ¡Empecemos!

Haz clic en "Siguiente" para continuar con la siguiente lección.`
            }
          },
          {
            id: 'lesson-1-2',
            title: 'Video: ¿Qué es React?',
            type: 'video',
            order: 2,
            duration: 10,
            isRequired: true,
            xpReward: 15,
            content: {
              videoProvider: 'youtube',
              videoId: 'N3AkSS5hXMA',
            }
          },
          {
            id: 'lesson-1-3',
            title: 'Tu primer componente',
            type: 'markdown',
            order: 3,
            duration: 15,
            isRequired: true,
            xpReward: 20,
            content: {
              markdown: `# Tu Primer Componente React

## ¿Qué es un componente?

Un componente es una **pieza reutilizable** de código que representa una parte de la interfaz de usuario.

## Componente de Función

La forma más simple de crear un componente es con una función:

\`\`\`jsx
function Welcome() {
  return <h1>¡Hola, Mundo!</h1>
}
\`\`\`

## JSX - JavaScript + XML

React usa JSX, que te permite escribir HTML dentro de JavaScript:

\`\`\`jsx
function Greeting() {
  const name = "Marco"
  return (
    <div>
      <h1>Hola, {name}!</h1>
      <p>Bienvenido a React</p>
    </div>
  )
}
\`\`\`

## Reglas importantes de JSX

1. **Un solo elemento raíz**: Debes envolver todo en un elemento padre
2. **Cierra todas las etiquetas**: Incluso las auto-cerradas como \`<img />\`
3. **className en lugar de class**: Usa \`className\` para CSS
4. **camelCase para atributos**: \`onClick\` en lugar de \`onclick\`

## Ejemplo completo

\`\`\`jsx
function UserCard() {
  const user = {
    name: "Ana López",
    role: "Desarrolladora React"
  }

  return (
    <div className="card">
      <h2>{user.name}</h2>
      <p>{user.role}</p>
      <button onClick={() => alert('¡Hola!')}>
        Saludar
      </button>
    </div>
  )
}
\`\`\`

> **🎯 Práctica**: Intenta crear tu propio componente con información personal.

¡Excelente trabajo! Ahora entiendes los componentes básicos de React.`
            }
          }
        ]
      },
      {
        id: 'module-2',
        title: 'Props y Estado',
        description: 'Aprende a pasar datos y manejar estado',
        order: 2,
        xpReward: 150,
        lessons: [
          {
            id: 'lesson-2-1',
            title: 'Entendiendo Props',
            type: 'markdown',
            order: 1,
            duration: 12,
            isRequired: true,
            xpReward: 15,
            content: {
              markdown: `# Props en React

## ¿Qué son Props?

Props (propiedades) son la forma en que **pasamos datos** de un componente padre a un componente hijo.

## Ejemplo básico

\`\`\`jsx
// Componente hijo
function Welcome(props) {
  return <h1>Hola, {props.name}!</h1>
}

// Componente padre
function App() {
  return <Welcome name="Marco" />
}
\`\`\`

## Props son Read-Only

**Importante**: Los props son **inmutables** - no puedes modificarlos dentro del componente.

\`\`\`jsx
// ❌ INCORRECTO
function Welcome(props) {
  props.name = "Otro nombre" // Error!
  return <h1>{props.name}</h1>
}

// ✅ CORRECTO
function Welcome(props) {
  const greeting = \`Hola, \${props.name}!\`
  return <h1>{greeting}</h1>
}
\`\`\`

## Destructuring Props

Puedes hacer el código más limpio usando destructuring:

\`\`\`jsx
// Sin destructuring
function UserCard(props) {
  return (
    <div>
      <h2>{props.name}</h2>
      <p>{props.email}</p>
    </div>
  )
}

// Con destructuring ✨
function UserCard({ name, email }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  )
}
\`\`\`

## Props por defecto

Puedes definir valores por defecto:

\`\`\`jsx
function Button({ text = "Click me", color = "blue" }) {
  return (
    <button style={{ backgroundColor: color }}>
      {text}
    </button>
  )
}
\`\`\`

¡Excelente! Ahora sabes cómo usar props para hacer componentes reutilizables.`
            }
          },
          {
            id: 'lesson-2-2',
            title: 'Video: Props en acción',
            type: 'video',
            order: 2,
            duration: 8,
            isRequired: true,
            xpReward: 15,
            content: {
              videoProvider: 'youtube',
              videoId: 'QFaFIcGhPoM',
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
    const { resource } = await container.items.create(demoCourse)
    console.log('✅ Demo course created successfully!')
    console.log('Course ID:', resource?.id)
    console.log('Title:', resource?.title)
    console.log('Modules:', resource?.modules.length)
  } catch (error: any) {
    if (error.code === 409) {
      console.log('⚠️  Course already exists')
    } else {
      console.error('❌ Error creating course:', error.message)
    }
  }
}

createDemoCourse()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
