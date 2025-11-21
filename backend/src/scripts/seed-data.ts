import { initializeCosmos, getContainer } from '../services/cosmosdb.service';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Hash password using SHA-256
 * In production, consider using bcrypt or Argon2
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Script to initialize sample data in Cosmos DB for production environment
 * This creates:
 * - Initial tenant (hospital-ejemplo)
 * - Admin user (dra.amayrani@hospital-ejemplo.com)
 * - Sample courses
 */
async function seedData() {
  console.log('🌱 Starting database seed...');

  try {
    // Initialize Cosmos DB connection
    await initializeCosmos();
    console.log('✅ Connected to Cosmos DB');

    // Get containers (we'll use tenants container for tenant, users for user, courses for courses)
    const tenantsContainer = getContainer('tenants');
    const usersContainer = getContainer('users');
    const coursesContainer = getContainer('courses');

    // 1. Create tenant
    const tenantId = 'dra-amayrani-gomez';
    const tenant = {
      id: tenantId,
      type: 'tenant',
      tenantId: tenantId,
      name: 'Dra. Amayrani Gomez',
      slug: 'dra-amayrani-gomez',
      domain: 'dra-amayrani-gomez.com',
      settings: {
        branding: {
          primaryColor: '#2563eb',
          logo: '👩‍⚕️',
          name: 'Dra. Amayrani Gomez',
        },
        features: {
          mentorship: true,
          gamification: true,
          certificates: true,
          forums: true,
        },
        emailNotifications: {
          enabled: true,
          fromName: 'AccessLearn - Dra. Amayrani Gomez',
          fromEmail: 'noreply@kainet.mx',
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Creating tenant:', tenant.slug);
    await tenantsContainer.items.upsert(tenant);
    console.log('✅ Tenant created');

    // 2. Create admin user
    const hashedPassword = hashPassword('Demo2024!');
    const adminUser = {
      id: 'any_g_a@hotmail.com',
      type: 'user',
      tenantId: tenantId,
      email: 'any_g_a@hotmail.com',
      password: hashedPassword,
      name: 'Dra. Amayrani Gomez',
      role: 'admin' as const,
      status: 'active' as const,
      permissions: [
        'users:view',
        'users:create',
        'users:edit',
        'users:delete',
        'users:invite',
        'content:view',
        'content:create',
        'content:edit',
        'content:delete',
        'content:archive',
        'analytics:view',
        'settings:manage',
        'mentorship:manage',
      ],
      enrolledCourses: [],
      completedCourses: [],
      achievements: [],
      preferences: {
        language: 'es',
        theme: 'light' as const,
        notifications: {
          email: true,
          push: false,
          sms: false,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Creating admin user:', adminUser.email);
    await usersContainer.items.upsert(adminUser);
    console.log('✅ Admin user created');

    // 3. Create sample courses
    const courses = [
      {
        id: `${tenantId}-intro-web-dev`,
        type: 'course',
        tenantId: tenantId,
        title: 'Introducción al Desarrollo Web',
        description: 'Aprende los fundamentos de HTML, CSS y JavaScript',
        category: 'Development',
        status: 'published' as const,
        language: 'es',
        level: 'beginner' as const,
        estimatedTime: 120,
        coverImage: '🌐',
        instructorId: adminUser.id,
        instructorName: adminUser.name,
        tags: ['web', 'html', 'css', 'javascript', 'frontend'],
        modules: [
          {
            id: 'html-basics',
            title: 'Fundamentos de HTML',
            type: 'text' as const,
            content: `
# Fundamentos de HTML

## ¿Qué es HTML?

HTML (HyperText Markup Language) es el lenguaje estándar para crear páginas web. Define la estructura y el contenido de una página web mediante etiquetas.

## Estructura básica

\`\`\`html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mi primera página</title>
</head>
<body>
    <h1>Hola Mundo</h1>
    <p>Esta es mi primera página web.</p>
</body>
</html>
\`\`\`

## Etiquetas principales

- **&lt;h1&gt; a &lt;h6&gt;**: Encabezados
- **&lt;p&gt;**: Párrafos
- **&lt;a&gt;**: Enlaces
- **&lt;img&gt;**: Imágenes
- **&lt;div&gt;**: Contenedor genérico
- **&lt;span&gt;**: Contenedor en línea
            `,
            order: 1,
            duration: 30,
            accessibility: {
              altText: 'Módulo de fundamentos de HTML',
            },
          },
          {
            id: 'css-styling',
            title: 'Estilos con CSS',
            type: 'text' as const,
            content: `
# Estilos con CSS

## ¿Qué es CSS?

CSS (Cascading Style Sheets) es el lenguaje para dar estilo a páginas HTML. Controla colores, fuentes, espaciado y diseño.

## Sintaxis básica

\`\`\`css
selector {
    propiedad: valor;
}
\`\`\`

## Ejemplo

\`\`\`css
body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    margin: 0;
    padding: 20px;
}

h1 {
    color: #2563eb;
    text-align: center;
}

.button {
    background-color: #2563eb;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
\`\`\`
            `,
            order: 2,
            duration: 40,
            accessibility: {
              altText: 'Módulo de estilos con CSS',
            },
          },
          {
            id: 'js-intro',
            title: 'Introducción a JavaScript',
            type: 'text' as const,
            content: `
# Introducción a JavaScript

## ¿Qué es JavaScript?

JavaScript es el lenguaje de programación que hace las páginas web interactivas. Permite responder a acciones del usuario y manipular el contenido dinámicamente.

## Variables y tipos de datos

\`\`\`javascript
// Variables
let nombre = "María";
const edad = 25;
var ciudad = "Madrid";

// Tipos de datos
let numero = 42;           // Number
let texto = "Hola";        // String
let esVerdadero = true;    // Boolean
let lista = [1, 2, 3];     // Array
let objeto = { key: "value" }; // Object
\`\`\`

## Funciones

\`\`\`javascript
function saludar(nombre) {
    return "Hola, " + nombre + "!";
}

console.log(saludar("Juan")); // "Hola, Juan!"

// Arrow function
const sumar = (a, b) => a + b;
console.log(sumar(5, 3)); // 8
\`\`\`
            `,
            order: 3,
            duration: 50,
            accessibility: {
              altText: 'Módulo de introducción a JavaScript',
            },
          },
        ],
        assessment: [
          {
            id: 'q1',
            question: '¿Qué significa HTML?',
            options: [
              'Hyper Text Markup Language',
              'High Tech Modern Language',
              'Home Tool Markup Language',
              'Hyperlinks and Text Markup Language',
            ],
            correctAnswer: 0,
            explanation: 'HTML significa Hyper Text Markup Language, el lenguaje estándar para crear páginas web.',
          },
          {
            id: 'q2',
            question: '¿Qué propiedad CSS se usa para cambiar el color de fondo?',
            options: ['color', 'bg-color', 'background-color', 'bgcolor'],
            correctAnswer: 2,
            explanation: 'La propiedad background-color se usa para establecer el color de fondo de un elemento.',
          },
          {
            id: 'q3',
            question: '¿Cuál es la forma correcta de declarar una variable en JavaScript moderno?',
            options: ['var x = 5;', 'let x = 5;', 'variable x = 5;', 'x := 5;'],
            correctAnswer: 1,
            explanation: 'En JavaScript moderno, se recomienda usar "let" o "const" para declarar variables.',
          },
        ],
        passingScore: 70,
        maxAttempts: 3,
        enrolledCount: 0,
        completionCount: 0,
        averageRating: 0,
        totalReviews: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `${tenantId}-patient-safety`,
        type: 'course',
        tenantId: tenantId,
        title: 'Seguridad del Paciente',
        description: 'Protocolos y mejores prácticas para garantizar la seguridad del paciente',
        category: 'Healthcare',
        status: 'published' as const,
        language: 'es',
        level: 'intermediate' as const,
        estimatedTime: 90,
        coverImage: '🏥',
        instructorId: adminUser.id,
        instructorName: adminUser.name,
        tags: ['salud', 'seguridad', 'protocolos', 'hospital'],
        modules: [
          {
            id: 'patient-identification',
            title: 'Identificación Correcta del Paciente',
            type: 'text' as const,
            content: `
# Identificación Correcta del Paciente

## Importancia

La identificación correcta del paciente es fundamental para prevenir errores médicos y garantizar que cada paciente reciba el tratamiento adecuado.

## Protocolo de Dos Identificadores

Siempre usar **al menos dos identificadores**:

1. ✅ Nombre completo
2. ✅ Fecha de nacimiento
3. ✅ Número de expediente

❌ **NUNCA** usar solo el número de habitación

## Procedimiento

1. Preguntar al paciente su nombre y fecha de nacimiento
2. Verificar con la pulsera de identificación
3. Confirmar con el expediente médico
4. Documentar la verificación

## Situaciones especiales

- **Pacientes inconscientes**: Verificar con familiar o documentos
- **Neonatos**: Usar pulsera de madre e hijo
- **Pacientes con deterioro cognitivo**: Verificación múltiple
            `,
            order: 1,
            duration: 30,
            accessibility: {
              altText: 'Módulo de identificación correcta del paciente',
            },
          },
          {
            id: 'medication-safety',
            title: 'Seguridad en Medicación',
            type: 'text' as const,
            content: `
# Seguridad en Medicación

## Los 5 Correctos

Antes de administrar cualquier medicamento, verificar:

1. ✅ **Paciente correcto**
2. ✅ **Medicamento correcto**
3. ✅ **Dosis correcta**
4. ✅ **Vía correcta**
5. ✅ **Hora correcta**

## Procedimiento de Verificación

1. Leer la orden médica
2. Verificar el medicamento (nombre, presentación, caducidad)
3. Calcular la dosis si es necesario
4. Confirmar la vía de administración
5. Verificar horario y última dosis
6. Identificar al paciente
7. Administrar y registrar

## Prevención de Errores

- ❌ No abreviar nombres de medicamentos
- ❌ No usar medicamentos sin etiqueta
- ❌ No interrumpir durante preparación
- ✅ Documentar inmediatamente después de administrar
- ✅ Reportar errores o casi errores
            `,
            order: 2,
            duration: 35,
            accessibility: {
              altText: 'Módulo de seguridad en medicación',
            },
          },
          {
            id: 'infection-control',
            title: 'Control de Infecciones',
            type: 'text' as const,
            content: `
# Control de Infecciones

## Higiene de Manos

La medida más efectiva para prevenir infecciones.

### Cuándo lavarse las manos (5 momentos):

1. Antes de tocar al paciente
2. Antes de realizar una tarea aséptica
3. Después del riesgo de exposición a fluidos corporales
4. Después de tocar al paciente
5. Después de tocar el entorno del paciente

### Técnica de lavado

- Duración: 40-60 segundos con agua y jabón
- O 20-30 segundos con gel alcoholado
- Cubrir todas las superficies de las manos

## Equipo de Protección Personal (EPP)

Seleccionar según el riesgo:

- **Guantes**: Contacto con fluidos o mucosas
- **Mascarilla**: Protección respiratoria
- **Bata**: Protección de ropa y piel
- **Gafas/Careta**: Protección ocular

## Orden de colocación: Bata → Mascarilla → Gafas → Guantes
## Orden de retiro: Guantes → Gafas → Bata → Mascarilla
            `,
            order: 3,
            duration: 25,
            accessibility: {
              altText: 'Módulo de control de infecciones',
            },
          },
        ],
        assessment: [
          {
            id: 'q1',
            question: '¿Cuántos identificadores mínimos se deben usar para verificar la identidad del paciente?',
            options: ['Uno', 'Dos', 'Tres', 'Depende de la situación'],
            correctAnswer: 1,
            explanation: 'Siempre se deben usar al menos dos identificadores para verificar correctamente la identidad del paciente.',
          },
          {
            id: 'q2',
            question: '¿Cuál NO es uno de los 5 correctos en administración de medicamentos?',
            options: [
              'Paciente correcto',
              'Médico correcto',
              'Medicamento correcto',
              'Dosis correcta',
            ],
            correctAnswer: 1,
            explanation: 'Los 5 correctos son: Paciente, Medicamento, Dosis, Vía y Hora. "Médico correcto" no es parte de esta regla.',
          },
          {
            id: 'q3',
            question: '¿Cuál es la medida más efectiva para prevenir infecciones?',
            options: [
              'Uso de antibióticos',
              'Higiene de manos',
              'Uso de guantes',
              'Limpieza del ambiente',
            ],
            correctAnswer: 1,
            explanation: 'La higiene de manos es la medida más efectiva para prevenir infecciones nosocomiales.',
          },
        ],
        passingScore: 80,
        maxAttempts: 3,
        enrolledCount: 0,
        completionCount: 0,
        averageRating: 0,
        totalReviews: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const course of courses) {
      console.log('Creating course:', course.title);
      await coursesContainer.items.upsert(course);
    }
    console.log(`✅ Created ${courses.length} courses`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Tenant: ${tenant.name} (${tenant.slug})`);
    console.log(`   Admin: ${adminUser.email} / Demo2024!`);
    console.log(`   Courses: ${courses.length}`);
    console.log(`\n🌐 Local: http://localhost:5173/?tenant=${tenant.slug}`);
    console.log(`🌐 Production: https://ca-accesslearn-frontend-prod.gentlerock-167c09dc.eastus.azurecontainerapps.io/?tenant=${tenant.slug}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed
seedData()
  .then(() => {
    console.log('Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
