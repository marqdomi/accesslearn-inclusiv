/**
 * Setup Tutorial Courses for Production Demo
 * 
 * Creates comprehensive tutorial courses that demonstrate all features of the platform
 * These courses will be used for the demo with Dra. Amayrani
 */

import 'dotenv/config';
import { initializeCosmos, getContainer } from '../services/cosmosdb.service';
import { createTenant, getTenantBySlug } from '../functions/TenantFunctions';
import { createCourse, updateCourse, submitCourseForReview, approveCourse } from '../functions/CourseFunctions';
import { createAssignment } from '../functions/CourseAssignmentFunctions';
import { ContentModule, Assessment } from '../models/Course';

// Import course structure type
interface CourseModule {
  id: string;
  title: string;
  type: 'text' | 'video' | 'quiz' | 'interactive';
  content?: string;
  videoUrl?: string;
  duration?: number;
  quiz?: {
    questions: Array<{
      id: string;
      question: string;
      type: 'multiple-choice' | 'true-false' | 'short-answer';
      options?: string[];
      correctAnswer: string | number;
      points: number;
    }>;
  };
}

interface CourseStructure {
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  modules: CourseModule[];
  estimatedDuration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Tutorial courses that demonstrate all platform features
const TUTORIAL_COURSES: CourseStructure[] = [
  {
    title: '🎓 Bienvenida a AccessLearn - Guía de Inicio',
    description: 'Aprende a usar la plataforma AccessLearn paso a paso. Este curso te enseñará todo lo que necesitas saber para empezar.',
    category: 'Tutorial',
    estimatedDuration: 15,
    difficulty: 'beginner',
    modules: [
      {
        id: 'module-1',
        title: 'Introducción a AccessLearn',
        type: 'text',
        content: `
# Bienvenido a AccessLearn

AccessLearn es una plataforma de aprendizaje en línea diseñada para empresas y organizaciones que desean capacitar a su personal de manera efectiva.

## ¿Qué aprenderás en esta plataforma?

- Gestión de cursos personalizados
- Seguimiento de progreso de empleados
- Sistema de gamificación (puntos, niveles, insignias)
- Certificados de finalización
- Foros de preguntas y respuestas
- Analytics y reportes detallados

## Características principales

1. **Multi-tenant**: Cada empresa tiene su propio espacio independiente
2. **Gamificación**: Motiva a los usuarios con XP, niveles e insignias
3. **Analytics**: Obtén insights sobre el progreso de tu equipo
4. **Certificados**: Genera certificados automáticamente al completar cursos
5. **Foros**: Comunidad de aprendizaje con preguntas y respuestas

¡Comencemos tu viaje de aprendizaje!
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-2',
        title: 'Tu Primera Lección - Navegación en la Plataforma',
        type: 'text',
        content: `
# Navegación en la Plataforma

## Dashboard Principal

Tu dashboard es el centro de control de tu experiencia de aprendizaje:

- **Mi Biblioteca**: Todos los cursos asignados
- **Progreso**: Tu progreso actual en todos los cursos
- **Certificados**: Tus certificados obtenidos
- **Nivel y XP**: Tu nivel actual y puntos de experiencia

## Menú Principal

1. **Biblioteca**: Explora y accede a tus cursos
2. **Dashboard**: Ve tu progreso general
3. **Foros**: Participa en discusiones
4. **Notificaciones**: Mantente al día con actualizaciones
5. **Perfil**: Gestiona tu información personal

## Tu Perfil

Desde tu perfil puedes:
- Ver tu información personal
- Actualizar tu foto de perfil
- Cambiar tu contraseña
- Ver tus logros y niveles
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-3',
        title: 'Quiz: Verificación de Comprensión',
        type: 'quiz',
        duration: 5,
        quiz: {
          questions: [
            {
              id: 'q1',
              question: '¿Qué es AccessLearn?',
              type: 'multiple-choice',
              options: [
                'Una plataforma de e-commerce',
                'Una plataforma de aprendizaje en línea',
                'Una red social',
                'Un sistema de gestión de inventarios',
              ],
              correctAnswer: 1,
              points: 10,
            },
            {
              id: 'q2',
              question: '¿Dónde puedes ver tu progreso en los cursos?',
              type: 'multiple-choice',
              options: [
                'En el Dashboard',
                'En Mi Biblioteca',
                'En el Perfil',
                'Todas las anteriores',
              ],
              correctAnswer: 3,
              points: 10,
            },
            {
              id: 'q3',
              question: '¿AccessLearn incluye sistema de gamificación?',
              type: 'true-false',
              correctAnswer: 1, // true
              points: 5,
            },
          ],
        },
      },
    ],
  },
  {
    title: '📚 Cómo Completar un Curso - Guía Completa',
    description: 'Aprende paso a paso cómo tomar y completar un curso en AccessLearn, desde la inscripción hasta recibir tu certificado.',
    category: 'Tutorial',
    estimatedDuration: 20,
    difficulty: 'beginner',
    modules: [
      {
        id: 'module-1',
        title: 'Encontrar y Acceder a un Curso',
        type: 'text',
        content: `
# Cómo Acceder a un Curso

## Paso 1: Ir a Mi Biblioteca

1. Desde el menú principal, haz clic en **"Biblioteca"**
2. Verás todos los cursos que tienes asignados

## Paso 2: Seleccionar un Curso

- Los cursos están organizados por estado:
  - **En Progreso**: Cursos que ya empezaste
  - **Disponibles**: Cursos nuevos que puedes empezar
  - **Completados**: Cursos que ya terminaste

## Paso 3: Abrir el Curso

Haz clic en el curso que deseas tomar. Verás:
- Descripción del curso
- Duración estimada
- Tu progreso actual (si ya lo empezaste)
- Módulos y lecciones disponibles
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-2',
        title: 'Completar Lecciones',
        type: 'text',
        content: `
# Completar Lecciones

## Tipos de Contenido

Los cursos pueden incluir diferentes tipos de contenido:

### 1. Lecciones de Texto
- Lee el contenido
- Haz clic en "Marcar como Completada" al finalizar
- Ganarás XP por completar lecciones

### 2. Videos
- Reproduce el video
- Asegúrate de verlo completo
- Marca como completada al terminar

### 3. Quizzes
- Responde las preguntas
- Verifica tus respuestas
- Obtén puntos según tu desempeño

## Progreso

Tu progreso se guarda automáticamente:
- Puedes salir y volver más tarde
- Tu progreso se conserva
- Cada lección completada aumenta tu progreso
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-3',
        title: 'Tomar Quizzes y Evaluaciones',
        type: 'text',
        content: `
# Quizzes y Evaluaciones

## Tipos de Preguntas

### Opción Múltiple
- Selecciona la mejor respuesta
- Solo una respuesta es correcta
- Puedes cambiar tu respuesta antes de enviar

### Verdadero/Falso
- Selecciona verdadero o falso
- Respuestas rápidas y directas

### Respuesta Corta
- Escribe tu respuesta
- Revisa la ortografía antes de enviar

## Puntuación

- **100%**: Respuestas perfectas
- **80-99%**: Buen desempeño
- **60-79%**: Aprobado
- **< 60%**: Puedes reintentar el quiz

## Intentos

- Puedes reintentar quizzes si no estás satisfecho
- El mejor resultado se guarda
- Ganarás XP por mejorar tu puntuación
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-4',
        title: 'Quiz: Prueba tus Conocimientos',
        type: 'quiz',
        duration: 5,
        quiz: {
          questions: [
            {
              id: 'q1',
              question: '¿Puedes salir de un curso y volver más tarde?',
              type: 'multiple-choice',
              options: [
                'Sí, tu progreso se guarda automáticamente',
                'No, debes completarlo de una vez',
                'Solo si pagas una suscripción premium',
              ],
              correctAnswer: 0,
              points: 10,
            },
            {
              id: 'q2',
              question: '¿Qué porcentaje necesitas para aprobar un quiz?',
              type: 'multiple-choice',
              options: [
                '100%',
                '80%',
                '60%',
                '50%',
              ],
              correctAnswer: 2,
              points: 10,
            },
          ],
        },
      },
    ],
  },
  {
    title: '🏆 Sistema de Gamificación - XP, Niveles e Insignias',
    description: 'Descubre cómo funciona el sistema de gamificación de AccessLearn: ganar XP, subir de nivel y desbloquear insignias.',
    category: 'Tutorial',
    estimatedDuration: 25,
    difficulty: 'beginner',
    modules: [
      {
        id: 'module-1',
        title: '¿Qué es la Gamificación?',
        type: 'text',
        content: `
# Sistema de Gamificación en AccessLearn

## ¿Qué es la Gamificación?

La gamificación es el uso de elementos de juego (puntos, niveles, insignias) para hacer el aprendizaje más motivador y divertido.

## Elementos del Sistema

### 1. XP (Puntos de Experiencia)
- **Ganas XP** completando lecciones, quizzes y cursos
- **Más XP** = más niveles desbloqueados
- **Mejores resultados** = más XP ganado

### 2. Niveles
- Empiezas en **Nivel 1**
- Subes de nivel al acumular XP
- Cada nivel requiere más XP que el anterior
- Los niveles son **infinitos** (puedes seguir subiendo)

### 3. Insignias (Badges)
- **Desbloqueas insignias** por logros específicos
- Ejemplos:
  - "Primer Curso Completado"
  - "Nivel 10 Alcanzado"
  - "10 Quizzes Perfectos"
  - "Mentor del Mes"

## Beneficios

- **Motivación**: El progreso visible te mantiene motivado
- **Competencia saludable**: Compite con tus compañeros
- **Reconocimiento**: Las insignias muestran tus logros
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-2',
        title: 'Cómo Ganar XP',
        type: 'text',
        content: `
# Cómo Ganar XP

## Actividades que Otorgan XP

### Completar Lecciones
- **Lección de texto**: 10-20 XP
- **Video**: 15-25 XP
- **Contenido interactivo**: 20-30 XP

### Quizzes
- **Primera vez (100%)**: 50 XP
- **Mejora de puntuación**: XP adicional
- **Retomar y mejorar**: XP diferencial (solo por mejoras)

### Completar Cursos
- **Completar un curso**: 100-200 XP
- **Primera vez**: XP completo
- **Retomar curso**: Solo XP por mejoras (no XP repetitivo)

## Consejos para Maximizar XP

1. **Completa todas las lecciones**: No te saltes contenido
2. **Hazlo bien la primera vez**: Obtendrás máximo XP
3. **Mejora tus resultados**: Reintenta quizzes para mejor puntuación
4. **Completa cursos completos**: Recibe bonificación de finalización

## Sistema de XP Diferencial

Para evitar "farming" de XP:
- Si retomas un curso completado, solo ganas XP si mejoras tu puntuación
- El sistema reconoce mejoras y recompensa el esfuerzo
- Motiva a mejorar en lugar de repetir sin propósito
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-3',
        title: 'Niveles y Progreso',
        type: 'text',
        content: `
# Sistema de Niveles

## Cómo Funcionan los Niveles

### Progreso Logarítmico

Los niveles usan un sistema logarítmico, lo que significa:
- **Niveles bajos** (1-10): Fáciles de alcanzar, motivación inicial
- **Niveles medios** (11-50): Requieren más esfuerzo
- **Niveles altos** (51+): Muy difíciles de alcanzar, logro significativo

### XP Requerido

- **Nivel 1**: 0 XP (comienzo)
- **Nivel 2**: 100 XP
- **Nivel 10**: ~2,500 XP
- **Nivel 25**: ~10,000 XP
- **Nivel 50**: ~50,000 XP
- **Nivel 100**: ~500,000 XP

### Barra de Progreso

En tu dashboard verás:
- **XP Total**: Cantidad acumulada
- **XP al Siguiente Nivel**: Cuánto falta para subir
- **Porcentaje**: Progreso hacia el siguiente nivel
- **Historial**: Visualización de tu progreso

## Logros Especiales

Al alcanzar ciertos niveles:
- **Nivel 10**: Insignia "Aprendiz Dedicado"
- **Nivel 25**: Insignia "Estudiante Avanzado"
- **Nivel 50**: Insignia "Experto en Aprendizaje"
- **Nivel 100**: Insignia "Maestro del Conocimiento"
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-4',
        title: 'Insignias y Logros',
        type: 'text',
        content: `
# Insignias y Logros

## Tipos de Insignias

### 1. Insignias de Progreso
- **Primer Curso**: Completa tu primer curso
- **5 Cursos Completados**: Completa 5 cursos
- **10 Cursos Completados**: Completa 10 cursos
- **Maratón de Aprendizaje**: 50 cursos completados

### 2. Insignias de Nivel
- **Nivel 10**: Alcanza el nivel 10
- **Nivel 25**: Alcanza el nivel 25
- **Nivel 50**: Alcanza el nivel 50
- **Nivel 100**: Alcanza el nivel 100

### 3. Insignias de Desempeño
- **Perfecto en Quiz**: Obtén 100% en un quiz
- **10 Perfectos**: 10 quizzes con 100%
- **Mejora Constante**: Mejora tu puntuación en 5 quizzes
- **Consistencia**: Completa lecciones 7 días seguidos

### 4. Insignias Especiales
- **Mentor**: Ayuda a otros en foros
- **Contribuidor**: Publica contenido útil en foros
- **Complecionista**: Completa todos los cursos disponibles

## Cómo Ver tus Insignias

1. Ve a tu **Dashboard**
2. Haz clic en la pestaña **"Progreso de Nivel"**
3. Verás todas tus insignias desbloqueadas
4. Las insignias bloqueadas aparecen con un candado 🔒
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-5',
        title: 'Quiz: Sistema de Gamificación',
        type: 'quiz',
        duration: 5,
        quiz: {
          questions: [
            {
              id: 'q1',
              question: '¿Qué elemento NO es parte del sistema de gamificación?',
              type: 'multiple-choice',
              options: [
                'XP (Puntos de Experiencia)',
                'Niveles',
                'Insignias',
                'Monedas virtuales',
              ],
              correctAnswer: 3,
              points: 10,
            },
            {
              id: 'q2',
              question: '¿Puedes ganar XP infinitamente rehaciendo el mismo curso?',
              type: 'true-false',
              correctAnswer: 0, // false
              points: 10,
            },
            {
              id: 'q3',
              question: '¿Los niveles son infinitos?',
              type: 'true-false',
              correctAnswer: 1, // true
              points: 5,
            },
          ],
        },
      },
    ],
  },
  {
    title: '📜 Certificados y Logros - Reconoce tu Aprendizaje',
    description: 'Aprende sobre los certificados que obtienes al completar cursos y cómo se generan automáticamente.',
    category: 'Tutorial',
    estimatedDuration: 15,
    difficulty: 'beginner',
    modules: [
      {
        id: 'module-1',
        title: '¿Qué son los Certificados?',
        type: 'text',
        content: `
# Certificados de Finalización

## ¿Qué es un Certificado?

Un certificado es un documento digital que confirma que has completado exitosamente un curso en AccessLearn.

## Características de los Certificados

- **Generación Automática**: Se crean automáticamente al completar un curso
- **PDF Descargable**: Puedes descargar tu certificado en formato PDF
- **Verificación Online**: Cada certificado tiene un código único para verificación
- **Personalizado**: Incluye tu nombre, fecha de finalización y nombre del curso
- **Logotipo de la Empresa**: Incluye el branding de tu organización

## Cuándo Obtienes un Certificado

Recibirás un certificado cuando:
- **Completas un curso al 100%**: Todas las lecciones y quizzes completados
- **Aprobas todos los quizzes**: Mínimo 60% en cada evaluación
- **Finalizas el curso**: Haces clic en "Completar Curso"

## Validez

- Los certificados son válidos permanentemente
- Pueden verificarse en línea usando el código único
- Se almacenan en tu perfil para acceso futuro
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-2',
        title: 'Cómo Descargar y Compartir Certificados',
        type: 'text',
        content: `
# Gestionar tus Certificados

## Ver tus Certificados

1. Ve a tu **Dashboard**
2. Haz clic en la pestaña **"Certificados"**
3. Verás todos los certificados que has obtenido

## Descargar un Certificado

1. En la lista de certificados, encuentra el que deseas
2. Haz clic en **"Descargar PDF"**
3. El certificado se descargará a tu dispositivo

## Compartir Certificados

### Opción 1: Compartir PDF
- Descarga el certificado
- Compártelo por email, redes sociales o LinkedIn

### Opción 2: Código de Verificación
- Cada certificado tiene un código único
- Comparte este código para verificación
- Otros pueden verificar el certificado en la plataforma

### Opción 3: Enlace de Verificación
- Comparte el enlace de verificación del certificado
- Cualquiera puede verificar la autenticidad del certificado

## Agregar a LinkedIn

1. Descarga tu certificado PDF
2. Ve a tu perfil de LinkedIn
3. Sección "Licencias y certificados"
4. Agrega el certificado con el código de verificación
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-3',
        title: 'Verificar un Certificado',
        type: 'text',
        content: `
# Verificar Certificados

## ¿Por qué Verificar?

La verificación permite a otros confirmar que un certificado es auténtico y válido.

## Cómo Verificar

### Opción 1: Código de Verificación
1. Ingresa a la página de verificación de certificados
2. Ingresa el código único del certificado
3. Verás los detalles del certificado verificado

### Opción 2: Enlace de Verificación
1. Usa el enlace único del certificado
2. Se mostrarán automáticamente los detalles
3. Confirmarás que el certificado es válido

## Información Mostrada

Al verificar un certificado verás:
- **Nombre del estudiante**
- **Nombre del curso**
- **Fecha de finalización**
- **Organización que emitió el certificado**
- **Estado**: Válido o Inválido

## Seguridad

- Los certificados tienen códigos únicos imposibles de falsificar
- La verificación confirma la autenticidad
- Los certificados inválidos se marcan claramente
        `.trim(),
        duration: 5,
      },
    ],
  },
  {
    title: '💬 Foros Q&A - Aprende en Comunidad',
    description: 'Descubre cómo usar los foros de preguntas y respuestas para resolver dudas y ayudar a otros estudiantes.',
    category: 'Tutorial',
    estimatedDuration: 20,
    difficulty: 'beginner',
    modules: [
      {
        id: 'module-1',
        title: '¿Qué son los Foros Q&A?',
        type: 'text',
        content: `
# Foros de Preguntas y Respuestas

## ¿Qué son los Foros?

Los foros son espacios de discusión donde puedes:
- **Hacer preguntas** sobre el contenido del curso
- **Responder preguntas** de otros estudiantes
- **Votar por respuestas útiles** (upvote)
- **Marcar respuestas correctas** (si eres instructor/admin)

## Beneficios

- **Aprendizaje colaborativo**: Aprende de tus compañeros
- **Resolución de dudas**: Obtén ayuda cuando la necesites
- **Contribuir**: Comparte tu conocimiento y ayuda a otros
- **Reconocimiento**: Las buenas respuestas son votadas y destacadas

## Características

- **Por curso**: Cada curso tiene su propio foro
- **Búsqueda**: Busca preguntas por palabras clave
- **Notificaciones**: Recibe notificaciones cuando alguien responde tu pregunta
- **Marcado como correcto**: Los instructores pueden marcar respuestas como correctas
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-2',
        title: 'Hacer una Pregunta',
        type: 'text',
        content: `
# Cómo Hacer una Pregunta

## Pasos para Publicar una Pregunta

1. **Ir al Foro del Curso**
   - Desde cualquier lección del curso, haz clic en "Foro Q&A"
   - O ve directamente a la sección de Foros

2. **Crear Nueva Pregunta**
   - Haz clic en **"Hacer una Pregunta"** o **"+ Nueva Pregunta"**
   - Escribe un título claro y descriptivo
   - Agrega tu pregunta con detalles suficientes

3. **Formato de Preguntas**
   - **Título claro**: Ejemplo: "¿Cómo calculo el XP de un quiz?"
   - **Contexto**: Explica el problema o duda
   - **Ejemplos**: Si es posible, proporciona ejemplos
   - **Etiquetas**: Agrega etiquetas relevantes (opcional)

## Buenas Prácticas

✅ **Haz**: Preguntas específicas y claras
✅ **Haz**: Revisa si tu pregunta ya existe antes de publicar
✅ **Haz**: Proporciona contexto suficiente
❌ **No hagas**: Preguntas duplicadas
❌ **No hagas**: Preguntas ofensivas o inapropiadas

## Después de Publicar

- Tu pregunta aparecerá en el foro
- Otros estudiantes e instructores podrán responder
- Recibirás notificaciones cuando haya respuestas
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-3',
        title: 'Responder Preguntas',
        type: 'text',
        content: `
# Responder Preguntas

## Cómo Responder

1. **Encuentra una Pregunta**
   - Navega por el foro del curso
   - Busca preguntas sin respuesta o donde puedas ayudar

2. **Escribir una Respuesta**
   - Haz clic en **"Responder"** bajo la pregunta
   - Escribe una respuesta clara y útil
   - Si es posible, incluye ejemplos o recursos adicionales

3. **Formato de Respuestas**
   - **Directa**: Responde directamente a la pregunta
   - **Clara**: Usa lenguaje simple y claro
   - **Útil**: Proporciona información valiosa
   - **Respetuosa**: Mantén un tono profesional y amigable

## Buenas Respuestas

✅ **Incluyen**: Explicaciones paso a paso
✅ **Incluyen**: Ejemplos concretos
✅ **Incluyen**: Referencias a lecciones relevantes
✅ **Son**: Útiles y completas

## Reconocimiento

- **Upvotes**: Otros pueden votar por tu respuesta si les fue útil
- **Marcado como correcto**: Los instructores pueden marcar respuestas como correctas
- **Insignias**: Las respuestas útiles pueden desbloquear insignias especiales
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-4',
        title: 'Votar y Marcar Respuestas',
        type: 'text',
        content: `
# Interactuar con Respuestas

## Votar por Respuestas (Upvote)

### ¿Qué es un Upvote?

Un "upvote" es un voto positivo que das a una respuesta que te fue útil.

### Cómo Votar

1. Encuentra una respuesta útil
2. Haz clic en el ícono de **↑** (flecha hacia arriba)
3. El número de votos aumentará

### Beneficios

- **Ayuda a otros**: Las respuestas votadas aparecen primero
- **Reconoce el esfuerzo**: Valora el trabajo de quienes responden
- **Mejora el foro**: Destaca contenido de calidad

## Marcar como Correcta

### ¿Quién puede marcar?

- **Instructores**: Pueden marcar cualquier respuesta como correcta
- **Administradores**: Pueden marcar respuestas como correctas
- **Estudiantes**: Solo pueden votar, no marcar como correcta

### Cómo Marcar

1. Si eres instructor, verás un botón **"Marcar como Correcta"**
2. Haz clic en el botón
3. La respuesta se marcará con un check ✓ verde

### Efecto

- Las respuestas marcadas como correctas aparecen destacadas
- Aparecen al inicio de la lista de respuestas
- Ayudan a otros estudiantes a encontrar la mejor respuesta rápidamente
        `.trim(),
        duration: 5,
      },
    ],
  },
  {
    title: '📊 Analytics y Reportes - Mide tu Progreso',
    description: 'Aprende cómo usar los analytics y reportes para ver tu progreso, estadísticas y desempeño en la plataforma (vista de administrador).',
    category: 'Tutorial',
    estimatedDuration: 25,
    difficulty: 'intermediate',
    modules: [
      {
        id: 'module-1',
        title: 'Dashboard de Analytics',
        type: 'text',
        content: `
# Dashboard de Analytics

## ¿Qué son los Analytics?

Los analytics proporcionan información detallada sobre:
- Progreso de estudiantes
- Desempeño de cursos
- Estadísticas de equipos
- Métricas de engagement

## Vista de Administrador

Como administrador o instructor, puedes ver:

### 1. Estadísticas Generales
- **Total de usuarios**: Número de usuarios activos
- **Cursos totales**: Cantidad de cursos disponibles
- **Completaciones**: Cursos completados este mes
- **Engagement**: Actividad promedio diaria

### 2. Progreso de Usuarios
- **Usuarios activos**: Quién está estudiando
- **Progreso por usuario**: Porcentaje completado
- **XP acumulado**: Puntos ganados por usuario
- **Tiempo invertido**: Horas de estudio

### 3. Estadísticas de Cursos
- **Cursos más populares**: Más tomados
- **Tasa de completación**: % de usuarios que terminan
- **Tiempo promedio**: Tiempo para completar
- **Puntuaciones**: Promedio de quizzes

## Acceso a Analytics

1. Ve al menú principal
2. Haz clic en **"Analytics"** o **"Reportes"**
3. Selecciona el tipo de reporte que deseas ver
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-2',
        title: 'Reportes de Usuarios',
        type: 'text',
        content: `
# Reportes de Usuarios

## Información Disponible

### Progreso Individual
- **Cursos asignados**: Lista de cursos del usuario
- **Progreso por curso**: Porcentaje completado
- **Lecciones completadas**: Número y lista
- **Quizzes tomados**: Intentos y resultados
- **XP ganado**: Puntos acumulados por actividad
- **Nivel actual**: Nivel alcanzado
- **Certificados**: Certificados obtenidos

### Desempeño
- **Tiempo invertido**: Horas totales de estudio
- **Días activos**: Días con actividad
- **Mejora**: Progreso en el tiempo
- **Fortalezas**: Áreas donde destaca
- **Áreas de mejora**: Temas que necesita reforzar

## Filtros Disponibles

- **Por equipo/grupo**: Ver estadísticas de un equipo específico
- **Por mentor**: Ver progreso de mentees
- **Por fecha**: Rango de tiempo
- **Por curso**: Solo un curso específico

## Exportar Reportes

- **CSV**: Descarga datos en formato Excel
- **PDF**: Genera reporte visual en PDF
- **Compartir**: Envía reportes por email
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-3',
        title: 'Reportes de Cursos',
        type: 'text',
        content: `
# Reportes de Cursos

## Métricas Disponibles

### Participación
- **Usuarios inscritos**: Cuántos están tomando el curso
- **Usuarios activos**: Quiénes están estudiando actualmente
- **Tasa de completación**: % que completa el curso
- **Tasa de abandono**: % que deja el curso

### Desempeño
- **Puntuación promedio**: Promedio de quizzes
- **Tiempo promedio**: Tiempo para completar
- **Módulos más difíciles**: Dónde hay más problemas
- **Módulos más fáciles**: Contenido bien comprendido

### Engagement
- **Interacciones en foros**: Preguntas y respuestas
- **Reintentos de quizzes**: Intentos adicionales
- **Tiempo por lección**: Análisis detallado
- **Puntos de abandono**: Dónde los usuarios se van

## Análisis por Módulo

Para cada módulo del curso:
- **Completación**: % de usuarios que lo completan
- **Tiempo promedio**: Cuánto tardan
- **Puntuaciones**: Resultados de quizzes
- **Feedback**: Comentarios y preguntas

## Usos Prácticos

- **Mejorar contenido**: Identifica módulos problemáticos
- **Ajustar dificultad**: Balancea el nivel del curso
- **Reconocer éxito**: Identifica contenido efectivo
- **Planificar**: Usa datos para futuros cursos
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-4',
        title: 'Reportes de Equipos',
        type: 'text',
        content: `
# Reportes de Equipos

## Vista de Equipo

Los reportes de equipo permiten ver:
- **Progreso grupal**: Estadísticas del equipo completo
- **Comparaciones**: Entre equipos o miembros
- **Leaderboards**: Rankings internos
- **Metas**: Progreso hacia objetivos del equipo

## Métricas de Equipo

### Progreso Colectivo
- **Promedio de completación**: % promedio del equipo
- **Cursos completados**: Total del equipo
- **XP acumulado**: Puntos totales del equipo
- **Certificados**: Certificados obtenidos por el equipo

### Desempeño
- **Puntuaciones promedio**: Promedio de quizzes
- **Tiempo invertido**: Horas totales del equipo
- **Engagement**: Actividad promedio del equipo
- **Consistencia**: Regularidad de estudio

## Comparaciones

- **Entre equipos**: Compara rendimiento de diferentes equipos
- **Entre miembros**: Ranking interno del equipo
- **Temporal**: Compara progreso en diferentes períodos

## Usos para Gerentes

- **Identificar líderes**: Quiénes están destacando
- **Apoyar rezagados**: Quién necesita ayuda adicional
- **Establecer metas**: Objetivos basados en datos
- **Reconocer logros**: Celebra éxitos del equipo
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-5',
        title: 'Exportar y Compartir Reportes',
        type: 'text',
        content: `
# Exportar Reportes

## Formatos Disponibles

### CSV (Excel)
- **Formato**: Datos en columnas separadas por comas
- **Uso**: Análisis en Excel, Google Sheets
- **Contenido**: Datos numéricos y estadísticas
- **Personalización**: Filtra columnas antes de exportar

### PDF
- **Formato**: Documento visual formateado
- **Uso**: Presentaciones, reportes formales
- **Contenido**: Gráficos y visualizaciones
- **Estilo**: Incluye branding de la organización

## Compartir Reportes

### Por Email
1. Genera el reporte
2. Haz clic en "Compartir"
3. Ingresa el email del destinatario
4. El reporte se enviará como adjunto

### Enlace de Compartir
1. Genera un enlace único del reporte
2. Comparte el enlace con otros
3. El reporte se actualiza automáticamente
4. Controla quién tiene acceso

## Programar Reportes

- **Reportes automáticos**: Configura envíos periódicos
- **Frecuencia**: Diario, semanal, mensual
- **Destinatarios**: Lista de emails
- **Formato**: Elige PDF o CSV

## Privacidad

- Solo usuarios autorizados pueden ver reportes
- Los datos personales están protegidos
- Cumple con regulaciones de privacidad
        `.trim(),
        duration: 5,
      },
    ],
  },
  {
    title: '🔔 Notificaciones y Activity Feed - Mantente Actualizado',
    description: 'Aprende a gestionar tus notificaciones y usar el activity feed para estar al día con todo lo que pasa en la plataforma.',
    category: 'Tutorial',
    estimatedDuration: 20,
    difficulty: 'beginner',
    modules: [
      {
        id: 'module-1',
        title: 'Sistema de Notificaciones',
        type: 'text',
        content: `
# Sistema de Notificaciones

## ¿Qué son las Notificaciones?

Las notificaciones te mantienen informado sobre:
- **Nuevos cursos asignados**: Cuando te asignan un curso
- **Respuestas a tus preguntas**: En los foros Q&A
- **Logros desbloqueados**: Insignias y niveles nuevos
- **Recordatorios**: Para continuar cursos en progreso
- **Actualizaciones**: Cambios en cursos que estás tomando

## Tipos de Notificaciones

### 1. Notificaciones de Curso
- Nuevo curso asignado
- Recordatorio de completar curso
- Curso completado exitosamente
- Certificado disponible

### 2. Notificaciones de Foros
- Nueva respuesta a tu pregunta
- Tu respuesta fue marcada como correcta
- Nueva pregunta en curso que estás tomando
- Menciones en comentarios

### 3. Notificaciones de Gamificación
- Nivel alcanzado
- Nueva insignia desbloqueada
- XP ganado (resumen diario)
- Logros especiales

### 4. Notificaciones de Equipo
- Nuevo miembro del equipo
- Metas del equipo alcanzadas
- Actividad del equipo destacada

## Formato

- **In-app**: Notificaciones dentro de la plataforma
- **Email**: Notificaciones por correo electrónico
- **Ambas**: Puedes elegir cómo recibirlas
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-2',
        title: 'Gestionar Notificaciones',
        type: 'text',
        content: `
# Gestionar tus Notificaciones

## Ver Notificaciones

### Centro de Notificaciones
1. Haz clic en el ícono de **campana 🔔** en la parte superior
2. Verás todas tus notificaciones recientes
3. Las no leídas aparecen en **negrita**

### Página de Notificaciones
1. Ve al menú principal
2. Haz clic en **"Notificaciones"**
3. Verás todas las notificaciones con filtros

## Marcar como Leídas

### Individual
- Haz clic en una notificación para marcarla como leída
- Se quitará el estilo de no leída

### Todas
- Haz clic en **"Marcar todas como leídas"**
- Todas las notificaciones se marcarán como leídas

## Eliminar Notificaciones

- **Individual**: Haz clic en el ícono de eliminar (🗑️) de cada notificación
- **Masivo**: Selecciona varias y elimina en grupo
- **Automático**: Las notificaciones antiguas se eliminan automáticamente

## Configurar Preferencias

1. Ve a **"Configuración de Notificaciones"**
2. Elige qué tipo de notificaciones recibir:
   - ✅ Notificaciones de cursos
   - ✅ Notificaciones de foros
   - ✅ Notificaciones de gamificación
   - ✅ Notificaciones de equipo
3. Elige el formato:
   - Solo in-app
   - Solo email
   - Ambos
4. Guarda tus preferencias
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-3',
        title: 'Activity Feed',
        type: 'text',
        content: `
# Activity Feed (Feed de Actividad)

## ¿Qué es el Activity Feed?

El Activity Feed es una línea de tiempo que muestra:
- **Actividad de tu equipo**: Lo que están haciendo tus compañeros
- **Logros**: Niveles alcanzados, insignias obtenidas
- **Completaciones**: Cursos completados por otros
- **Foros**: Actividad reciente en los foros

## Ubicación

- **Dashboard**: Aparece en la página principal
- **Pestaña dedicada**: Puedes ver el feed completo
- **Filtros**: Filtra por tipo de actividad

## Tipos de Actividad

### Logros
- "Juan alcanzó el Nivel 10"
- "María desbloqueó la insignia 'Primer Curso'"
- "Pedro completó el curso de Excel"

### Foros
- "Nueva pregunta en el curso de Matemáticas"
- "Ana respondió una pregunta sobre React"
- "Tu pregunta recibió 5 upvotes"

### Equipo
- "Nuevo miembro se unió al equipo"
- "El equipo alcanzó 1000 XP total"
- "Maratón de aprendizaje: 10 cursos completados hoy"

## Interactuar con el Feed

- **Reaccionar**: Dale "me gusta" o reacciona a actividades
- **Comentar**: Deja comentarios en actividades
- **Compartir**: Comparte logros importantes
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-4',
        title: 'Configurar Preferencias de Notificaciones',
        type: 'text',
        content: `
# Configuración de Notificaciones

## Acceder a la Configuración

1. Ve a tu **Dashboard**
2. Haz clic en **"Configuración"** o **"Preferencias"**
3. Selecciona **"Notificaciones"**

## Opciones Disponibles

### Tipos de Notificaciones

#### Cursos
- ✅ Nuevos cursos asignados
- ✅ Recordatorios de completar curso
- ✅ Curso completado
- ✅ Certificado disponible

#### Foros
- ✅ Respuestas a tus preguntas
- ✅ Respuesta marcada como correcta
- ✅ Nuevas preguntas en tus cursos
- ✅ Menciones

#### Gamificación
- ✅ Nuevo nivel alcanzado
- ✅ Nueva insignia desbloqueada
- ✅ Resumen diario de XP
- ✅ Logros especiales

#### Equipo
- ✅ Actividad del equipo
- ✅ Metas alcanzadas
- ✅ Reconocimientos

### Formato de Notificación

Para cada tipo, puedes elegir:
- **Solo in-app**: Solo dentro de la plataforma
- **Solo email**: Solo por correo electrónico
- **Ambos**: In-app y email
- **Ninguno**: No recibir este tipo

## Guardar Configuración

- Haz clic en **"Guardar"** o **"Aplicar"**
- Tus preferencias se guardarán inmediatamente
- Los cambios surtirán efecto en nuevas notificaciones
        `.trim(),
        duration: 5,
      },
    ],
  },
  {
    title: '👥 Gestión de Perfiles - Personaliza tu Experiencia',
    description: 'Aprende a gestionar tu perfil de usuario: actualizar información, cambiar contraseña y subir foto de perfil.',
    category: 'Tutorial',
    estimatedDuration: 15,
    difficulty: 'beginner',
    modules: [
      {
        id: 'module-1',
        title: 'Acceder a tu Perfil',
        type: 'text',
        content: `
# Gestionar tu Perfil

## Acceso al Perfil

### Opción 1: Desde el Dashboard
1. Ve a tu **Dashboard**
2. Haz clic en el botón **"Perfil"** en la parte superior
3. O haz clic en tu foto de perfil

### Opción 2: Desde el Menú
1. Haz clic en tu foto de perfil (esquina superior derecha)
2. Selecciona **"Mi Perfil"** del menú desplegable

## Información del Perfil

En tu perfil verás:
- **Foto de perfil**: Tu avatar actual
- **Nombre completo**: Nombre y apellido
- **Email**: Tu dirección de correo (no editable)
- **Rol**: Tu rol en la plataforma (estudiante, instructor, admin)
- **XP y Nivel**: Tu progreso actual
- **Información personal**: Teléfono, fecha de nacimiento, etc.
- **Dirección**: Información de ubicación (opcional)
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-2',
        title: 'Actualizar Información Personal',
        type: 'text',
        content: `
# Actualizar Información Personal

## Datos que Puedes Cambiar

### Información Básica
- **Nombre**: Nombre(s)
- **Apellido**: Apellido(s)
- **Teléfono**: Número de contacto
- **Fecha de nacimiento**: Tu fecha de nacimiento
- **Género**: Masculino, Femenino, Otro, Prefiero no decir

### Dirección (Opcional)
- **Calle**: Dirección de calle
- **Ciudad**: Ciudad donde vives
- **Estado**: Estado o provincia
- **Código postal**: Código postal
- **País**: País de residencia

## Cómo Actualizar

1. Ve a tu **Perfil**
2. Haz clic en la pestaña **"Información Personal"**
3. Edita los campos que deseas cambiar
4. Haz clic en **"Guardar Cambios"**
5. Verás un mensaje de confirmación

## Notas Importantes

- **Email**: No se puede cambiar desde el perfil (contacta a un administrador)
- **Rol**: Tu rol es asignado por administradores
- **Validación**: Algunos campos pueden tener validación (ej: formato de teléfono)
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-3',
        title: 'Cambiar Foto de Perfil',
        type: 'text',
        content: `
# Cambiar Foto de Perfil

## Subir una Foto

1. Ve a tu **Perfil**
2. En la sección de foto de perfil, haz clic en el ícono de **cámara 📷**
3. Selecciona una imagen de tu dispositivo
4. La imagen se cargará automáticamente

## Requisitos de la Imagen

- **Formato**: JPG, PNG, GIF
- **Tamaño máximo**: 2MB
- **Recomendado**: Imagen cuadrada (ej: 500x500 px)

## Vista Previa

- Verás una vista previa antes de guardar
- Puedes cancelar si no te gusta
- Una vez guardada, aparecerá en toda la plataforma

## Usos de tu Foto

Tu foto de perfil aparece en:
- Tu perfil de usuario
- Tus comentarios en foros
- Tu actividad en el feed
- Reportes y analytics (si eres admin)

## Eliminar Foto

- Puedes eliminar tu foto de perfil en cualquier momento
- Se mostrará un ícono con tus iniciales en su lugar
        `.trim(),
        duration: 5,
      },
      {
        id: 'module-4',
        title: 'Cambiar Contraseña',
        type: 'text',
        content: `
# Cambiar Contraseña

## Acceso

1. Ve a tu **Perfil**
2. Haz clic en la pestaña **"Cambiar Contraseña"**

## Proceso de Cambio

### Paso 1: Verificar Contraseña Actual
- Ingresa tu contraseña actual
- Esto confirma que eres el dueño de la cuenta

### Paso 2: Nueva Contraseña
- Ingresa tu nueva contraseña
- Debe cumplir con los requisitos de seguridad

### Paso 3: Confirmar
- Ingresa nuevamente tu nueva contraseña
- Asegúrate de que coincida

### Paso 4: Guardar
- Haz clic en **"Cambiar Contraseña"**
- Tu contraseña se actualizará inmediatamente

## Requisitos de Seguridad

Tu contraseña debe tener:
- **Mínimo 8 caracteres**: Recomendado 12+ caracteres
- **Al menos una mayúscula**: Letra mayúscula
- **Al menos una minúscula**: Letra minúscula
- **Al menos un número**: Dígito del 0-9
- **Al menos un carácter especial**: !@#$%^&*()_+-=

## Seguridad

- **No compartas**: Nunca compartas tu contraseña
- **Única**: Usa una contraseña diferente para cada plataforma
- **Actualiza regularmente**: Cambia tu contraseña cada 3-6 meses
- **Cierra sesión**: Cierra sesión en dispositivos compartidos

## Si Olvidaste tu Contraseña

Si olvidaste tu contraseña actual:
1. Haz clic en **"¿Olvidaste tu contraseña?"** en la página de login
2. Ingresa tu email
3. Recibirás un enlace para restablecer tu contraseña
4. Sigue las instrucciones en el email
        `.trim(),
        duration: 5,
      },
    ],
  },
];

/**
 * Convert CourseStructure to modules format for Course
 */
function convertCourseStructureToModules(courseStructure: CourseStructure): ContentModule[] {
  return courseStructure.modules.map((module, index) => {
    const moduleData: ContentModule = {
      id: module.id,
      title: module.title,
      type: module.type,
      order: index + 1,
      url: module.videoUrl || '', // Required field
      accessibility: {
        altText: module.title,
      },
    };

    // For text modules, store content (if supported by frontend)
    if (module.type === 'text' && module.content) {
      (moduleData as any).content = module.content;
    }

    return moduleData;
  });
}

/**
 * Convert CourseStructure to assessments format for Course
 */
function convertCourseStructureToAssessments(courseStructure: CourseStructure): Assessment[] {
  const assessments: Assessment[] = [];

  courseStructure.modules.forEach((module) => {
    if (module.type === 'quiz' && module.quiz) {
      module.quiz.questions.forEach((q) => {
        // Assessment interface requires: id, question, options, correctAnswer (number)
        let correctAnswer: number;
        if (typeof q.correctAnswer === 'number') {
          correctAnswer = q.correctAnswer;
        } else {
          // For true-false: 1 = true (Verdadero = 0), 0 = false (Falso = 1)
          // But we need to check the value correctly
          correctAnswer = 0; // Default to first option
        }
        
        let options = q.options || [];
        if (q.type === 'true-false' && options.length === 0) {
          options = ['Verdadero', 'Falso'];
          // If correctAnswer was 1 (true), then answer is 0 (Verdadero)
          // If correctAnswer was 0 (false), then answer is 1 (Falso)
          if (typeof q.correctAnswer === 'number') {
            correctAnswer = q.correctAnswer === 1 ? 0 : 1;
          }
        }
        
        assessments.push({
          id: q.id,
          question: q.question,
          options: options,
          correctAnswer: correctAnswer,
          explanation: `Respuesta correcta para: ${q.question}`,
        });
      });
    }
  });

  return assessments;
}

/**
 * Main function to setup tutorial courses
 */
async function main() {
  try {
    console.log('\n📚 Setup Tutorial Courses for Production Demo\n');
    console.log('='.repeat(60));

    // Initialize Cosmos DB
    console.log('📦 Conectando a Cosmos DB...');
    await initializeCosmos();
    console.log('✅ Cosmos DB conectado\n');

    // Get or create tenant (kainet)
    console.log('📋 Step 1: Setting up tenant...');
    let tenant = await getTenantBySlug('kainet');
    
    if (!tenant) {
      console.log('  ⚠️  Tenant "kainet" no encontrado. Creando...');
      tenant = await createTenant({
        name: 'Kainet',
        slug: 'kainet',
        contactEmail: 'contacto@kainet.mx',
        plan: 'profesional',
      });
      console.log(`  ✅ Tenant creado: ${tenant.name}`);
    } else {
      console.log(`  ✅ Tenant existe: ${tenant.name}`);
    }

    // Get admin user (ana.lopez@kainet.mx)
    console.log('\n👤 Step 2: Finding admin user...');
    const usersContainer = getContainer('users');
    const { resources: users } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.email = @email',
        parameters: [
          { name: '@tenantId', value: tenant.id },
          { name: '@email', value: 'ana.lopez@kainet.mx' },
        ],
      })
      .fetchAll();

    if (users.length === 0) {
      console.error('  ❌ Error: Usuario admin (ana.lopez@kainet.mx) no encontrado');
      console.error('  💡 Ejecuta primero: npm run setup-demo-complete');
      process.exit(1);
    }

    const adminUser = users[0];
    console.log(`  ✅ Admin user encontrado: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`  🆔 User ID: ${adminUser.id}`);

    // Create tutorial courses
    console.log('\n📚 Step 3: Creating tutorial courses...');
    const createdCourses: any[] = [];

    for (const courseStructure of TUTORIAL_COURSES) {
      try {
        console.log(`\n  📖 Creando: ${courseStructure.title}`);
        
        // Check if course already exists
        const coursesContainer = getContainer('courses');
        const { resources: existingCourses } = await coursesContainer.items
          .query({
            query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.title = @title',
            parameters: [
              { name: '@tenantId', value: tenant.id },
              { name: '@title', value: courseStructure.title },
            ],
          })
          .fetchAll();

        if (existingCourses.length > 0) {
          console.log(`    ℹ️  Curso ya existe: ${courseStructure.title}`);
          createdCourses.push(existingCourses[0]);
          continue;
        }

        // Convert modules and assessments
        const modules = convertCourseStructureToModules(courseStructure);
        const assessments = convertCourseStructureToAssessments(courseStructure);

        // Create course with initial data
        let course = await createCourse({
          title: courseStructure.title,
          description: courseStructure.description,
          category: courseStructure.category,
          coverImage: courseStructure.thumbnail || '',
          estimatedTime: courseStructure.estimatedDuration,
        }, tenant.id, adminUser.id);

        // Update course with modules and assessments
        course = await updateCourse(
          course.id,
          tenant.id,
          adminUser.id,
          {
            modules: modules,
            assessment: assessments.length > 0 ? assessments : undefined,
          }
        );

        // Submit for review first (required workflow)
        if (course.status === 'draft') {
          course = await submitCourseForReview(course.id, tenant.id, adminUser.id);
        }

        // Approve course (since it's a tutorial, approve immediately)
        if (course.status === 'pending-review') {
          course = await approveCourse(course.id, tenant.id, adminUser.id, 'Tutorial course approved automatically');
        } else if (course.status === 'draft') {
          // If still draft, submit and approve
          course = await submitCourseForReview(course.id, tenant.id, adminUser.id);
          course = await approveCourse(course.id, tenant.id, adminUser.id, 'Tutorial course approved automatically');
        }

        createdCourses.push(course);
        console.log(`    ✅ Curso creado: ${course.title}`);
        console.log(`       Módulos: ${course.modules.length}`);
        console.log(`       Duración: ${course.estimatedTime} min`);
        console.log(`       Estado: ${course.status}`);
      } catch (error: any) {
        console.error(`    ❌ Error creando curso "${courseStructure.title}":`, error.message);
      }
    }

    console.log(`\n  ✅ Creados ${createdCourses.length} cursos tutoriales`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RESUMEN DE CURSOS TUTORIALES CREADOS:\n');

    createdCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   📝 Categoría: ${course.category}`);
      console.log(`   ⏱️  Duración: ${course.estimatedDuration} minutos`);
      console.log(`   📚 Módulos: ${course.modules.length}`);
      console.log(`   🎯 Dificultad: ${course.difficulty}`);
      console.log(`   ✅ Estado: ${course.status}`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('\n✅ Setup de cursos tutoriales completado!\n');
    console.log('🎯 Próximos pasos:');
    console.log('   1. Los cursos están listos para asignar a usuarios');
    console.log('   2. Puedes verlos en la plataforma web');
    console.log('   3. Asigna estos cursos a la Dra. Amayrani para el demo');
    console.log('');
    console.log('📖 Para asignar cursos:');
    console.log('   - Ve a la plataforma web (https://app.kainet.mx)');
    console.log('   - Inicia sesión como admin');
    console.log('   - Ve a Administración → Asignar Cursos');
    console.log('   - Selecciona usuario y asigna los cursos tutoriales\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main as setupTutorialCourses };

