/**
 * Script para poblar los 3 cursos demo con contenido completo.
 * Ejecutar: npx ts-node scripts/populate-demo-courses.ts
 */

const API_BASE = 'http://localhost:3000/api';
const TENANT_ID = 'tenant-kainet';
const LOGIN_EMAIL = 'ana.lopez@kainet.mx';
const LOGIN_PASSWORD = 'Demo123!';

// ─── IDs de los cursos existentes ───
const COURSE_IDS = {
  estudiante: 'course-1763874756585-mvnuozcuu',
  creador: 'course-1763874757513-me6s2vs72',
  admin: 'course-1763874758191-ku23ii5b8',
};

// ─── Helpers ───
let authToken = '';

async function login() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD, tenantId: TENANT_ID }),
  });
  const data = (await res.json()) as any;
  if (!data.token) throw new Error('Login failed: ' + JSON.stringify(data));
  authToken = data.token;
  console.log('✅ Autenticado como', LOGIN_EMAIL);
}

async function updateCourse(courseId: string, updates: any) {
  const res = await fetch(`${API_BASE}/courses/${courseId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PUT /courses/${courseId} failed (${res.status}): ${err}`);
  }
  return res.json();
}

async function publishCourse(courseId: string) {
  // Submit for review
  const r1 = await fetch(`${API_BASE}/courses/${courseId}/submit-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
  });
  if (!r1.ok) console.warn(`  ⚠ submit-review: ${r1.status}`);

  // Approve (super-admin can do both)
  const r2 = await fetch(`${API_BASE}/courses/${courseId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
  });
  if (!r2.ok) console.warn(`  ⚠ approve: ${r2.status}`);

  console.log(`  📢 Curso publicado`);
}

// ─── ID generators ───
let _counter = 0;
const uid = (prefix: string) => `${prefix}-${Date.now()}-${(++_counter).toString(36)}`;

// ─── Helper to build structured data ───
function block(
  type: 'welcome' | 'text' | 'image' | 'video' | 'challenge' | 'code' | 'file',
  content: string,
  order: number,
  extra: Record<string, any> = {}
) {
  return { id: uid('blk'), type, content, order, xpValue: type === 'challenge' ? 20 : 10, ...extra };
}

function question(
  type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'fill-blank' | 'ordering',
  q: string,
  options: string[],
  correctAnswer: number | number[] | string,
  correctFeedback: string,
  incorrectFeedback: string
) {
  return {
    id: uid('q'),
    type,
    question: q,
    options,
    correctAnswer,
    correctFeedback,
    incorrectFeedback,
    xpValue: 15,
  };
}

function quiz(title: string, description: string, questions: any[]) {
  return {
    id: uid('quiz'),
    title,
    description,
    questions,
    passingScore: 70,
    maxAttempts: 3,
    totalXP: questions.length * 15,
  };
}

function lesson(title: string, description: string, blocks: any[], quizData?: any) {
  const l: any = {
    id: uid('lsn'),
    title,
    description,
    blocks,
    totalXP: blocks.reduce((s: number, b: any) => s + (b.xpValue || 0), 0) + (quizData?.totalXP || 0),
    estimatedMinutes: Math.max(5, blocks.length * 3 + (quizData ? 5 : 0)),
  };
  if (quizData) l.quiz = quizData;
  return l;
}

function mod(title: string, description: string, order: number, lessons: any[]) {
  return {
    id: uid('mod'),
    title,
    description,
    type: 'lesson',
    url: '',
    order,
    lessons,
    accessibility: { altText: title },
  };
}

// ═══════════════════════════════════════════════════════════════════
// CURSO 1 — Guía del Estudiante
// ═══════════════════════════════════════════════════════════════════
function buildCurso1() {
  return {
    title: 'Guía del Estudiante — Aprende a Usar AccessLearn',
    description:
      'Curso interactivo para nuevos estudiantes. Aprende a inscribirte en cursos, navegar por módulos y lecciones, completar quizzes, ganar XP y configurar tu perfil de accesibilidad.',
    category: 'Tutorial',
    estimatedTime: 45,
    totalXP: 500,
    difficulty: 'Novice',
    enrollmentMode: 'open',
    completionMode: 'modules-and-quizzes',
    quizRequirement: 'required',
    requireAllQuizzesPassed: false,
    minimumScoreForCompletion: 60,
    allowRetakes: true,
    maxRetakesPerQuiz: 5,
    certificateEnabled: true,
    minimumScoreForCertificate: 80,
    modules: [
      // ── Módulo 1: Bienvenida ──
      mod('Bienvenida a AccessLearn', 'Tu primer contacto con la plataforma', 1, [
        lesson(
          '¡Bienvenido! Tu aventura comienza aquí',
          'Descubre qué es AccessLearn y por qué cambiará tu forma de aprender.',
          [
            block('welcome', '# 🎉 ¡Bienvenido a AccessLearn!\n\nEstás a punto de comenzar una experiencia de aprendizaje **diferente**. Aquí no solo lees — **interactúas, juegas y creces**.\n\nEsta guía te enseñará todo lo que necesitas saber para aprovechar al máximo la plataforma.\n\n> 💡 **Tip**: Cada lección completada te acerca a tu certificado.', 0),
            block('text', '## ¿Qué es AccessLearn?\n\nAccessLearn es una plataforma de aprendizaje corporativo diseñada con **tres pilares**:\n\n### 1. 🌐 Accesibilidad\nCada curso está diseñado para ser accesible para personas con discapacidades visuales, auditivas, motoras y cognitivas. Puedes personalizar tu experiencia con perfiles de accesibilidad.\n\n### 2. 🎮 Gamificación\nGana **puntos de experiencia (XP)** al completar lecciones y quizzes. Sube de nivel y desbloquea logros.\n\n### 3. 📊 Análisis Inteligente\nLos administradores pueden ver tu progreso y adaptar los cursos a tus necesidades.', 1),
            block('text', '## Lo que aprenderás en esta guía\n\n| Módulo | Tema | XP |\n|--------|------|----|\n| 1 | Bienvenida y visión general | 30 |\n| 2 | Inscribirse en cursos | 80 |\n| 3 | Navegar módulos y lecciones | 80 |\n| 4 | Quizzes y evaluaciones | 100 |\n| 5 | XP, niveles y gamificación | 80 |\n| 6 | Accesibilidad y tu perfil | 80 |\n\n**Total: ~500 XP** 🎯\n\nHaz clic en **Siguiente** para continuar.', 2),
          ]
        ),
      ]),

      // ── Módulo 2: Inscribirse en Cursos ──
      mod('Inscripción y Catálogo de Cursos', 'Aprende a encontrar e inscribirte en cursos', 2, [
        lesson(
          'Explorando el catálogo de cursos',
          'Descubre cómo encontrar cursos que te interesen.',
          [
            block('text', '## 📚 El Catálogo de Cursos\n\nDesde tu **Dashboard** (tablero principal), puedes acceder al catálogo de cursos disponible para tu organización.\n\n### ¿Dónde encontrarlo?\n1. Haz clic en **"Explorar Cursos"** en el menú lateral.\n2. Verás una lista de cursos organizados por **categoría** y **dificultad**.\n\n### Filtros disponibles:\n- **Categoría**: Tutorial, Tecnología, Cumplimiento, etc.\n- **Dificultad**: Novato, Especialista, Maestro.\n- **Estado**: Disponibles, En progreso, Completados.', 0),
            block('text', '## 🔍 Detalles de un Curso\n\nAntes de inscribirte, puedes ver:\n- **Descripción** del curso\n- **Número de módulos** y lecciones\n- **XP total** que puedes ganar\n- **Tiempo estimado** de completación\n- **Requisitos** previos (si los hay)\n\n### Tipos de inscripción:\n| Tipo | Descripción |\n|------|-------------|\n| 🟢 **Abierta** | Cualquiera puede inscribirse |\n| 🟡 **Restringida** | Requiere aprobación del admin |\n| 🔴 **Solo admin** | El administrador te asigna el curso |', 1),
          ]
        ),
        lesson(
          'Cómo inscribirte paso a paso',
          'Proceso completo de inscripción.',
          [
            block('text', '## ✅ Proceso de Inscripción\n\n### Paso 1: Encuentra el curso\nNavega al catálogo y selecciona el curso que te interesa.\n\n### Paso 2: Haz clic en "Inscribirme"\nEn la página de detalles del curso, verás un botón grande de **"Inscribirme"**.\n\n### Paso 3: Confirmación\nRecibirás una confirmación y el curso aparecerá en **"Mis Cursos"** en tu Dashboard.\n\n### Paso 4: ¡Comienza!\nHaz clic en **"Continuar"** para empezar la primera lección.', 0),
            block('challenge', '## 🏆 Desafío: Tu primera inscripción\n\nVe al catálogo de cursos y busca un curso que te llame la atención. Inscríbete y regresa aquí.\n\n**Pista**: Este mismo curso cuenta — ¡ya estás inscrito! 🎉\n\n> Completa este desafío para ganar **20 XP extra**.', 1),
          ],
          quiz('Quiz: Inscripción en cursos', 'Veamos qué aprendiste sobre el catálogo de cursos.', [
            question(
              'multiple-choice',
              '¿Dónde puedes encontrar el catálogo de cursos?',
              ['En Configuración', 'En "Explorar Cursos" del menú lateral', 'En el correo de bienvenida', 'En la sección de Analytics'],
              1,
              '¡Correcto! El catálogo está en "Explorar Cursos" en el menú lateral.',
              'Revisa la lección anterior — el catálogo se encuentra en el menú lateral.'
            ),
            question(
              'true-false',
              'Todos los cursos en AccessLearn tienen inscripción abierta.',
              ['Verdadero', 'Falso'],
              1,
              '¡Correcto! Algunos cursos tienen inscripción restringida o solo por admin.',
              'Hay tres tipos de inscripción: abierta, restringida y solo admin.'
            ),
            question(
              'multiple-choice',
              '¿Qué información puedes ver antes de inscribirte en un curso?',
              ['Solo el título', 'Título y descripción únicamente', 'Descripción, módulos, XP total y tiempo estimado', 'Nada — debes inscribirte primero'],
              2,
              '¡Exacto! Puedes ver toda la información relevante antes de inscribirte.',
              'La página de detalles muestra descripción, módulos, XP y tiempo estimado.'
            ),
          ])
        ),
      ]),

      // ── Módulo 3: Navegar Módulos y Lecciones ──
      mod('Navegación de Cursos', 'Aprende a moverte entre módulos y lecciones', 3, [
        lesson(
          'Estructura de un curso',
          'Entiende cómo se organiza el contenido.',
          [
            block('text', '## 📖 ¿Cómo se organiza un curso?\n\nCada curso en AccessLearn tiene una estructura jerárquica:\n\n```\n📘 Curso\n├── 📁 Módulo 1\n│   ├── 📄 Lección 1.1\n│   │   ├── 📝 Bloque de texto\n│   │   ├── 🎬 Bloque de video\n│   │   └── 🏆 Desafío\n│   ├── 📄 Lección 1.2\n│   └── ❓ Quiz del Módulo\n├── 📁 Módulo 2\n│   └── ...\n└── 🎓 Completación\n```\n\n### Términos clave:\n- **Módulo**: Un grupo temático de lecciones.\n- **Lección**: Una página con contenido (texto, video, imágenes, etc.).\n- **Bloque**: Un elemento individual de contenido dentro de una lección.\n- **Quiz**: Una evaluación al final de un módulo o lección.', 0),
            block('text', '## 🧩 Tipos de Bloques de Contenido\n\nDentro de cada lección encontrarás diferentes tipos de contenido:\n\n| Icono | Tipo | Descripción |\n|-------|------|-------------|\n| 📝 | **Texto** | Contenido con formato enriquecido |\n| 🎬 | **Video** | Videos de YouTube, Vimeo, etc. |\n| 🖼️ | **Imagen** | Fotos, diagramas, infografías |\n| 🎧 | **Audio** | Podcasts, explicaciones narradas |\n| 💻 | **Código** | Fragmentos de código con resaltado |\n| 🏆 | **Desafío** | Actividades interactivas con XP extra |\n| 📎 | **Archivo** | Documentos descargables |\n| 👋 | **Bienvenida** | Mensaje introductorio del módulo |\n\n> 💡 Cada bloque completado te otorga **XP**.', 1),
          ]
        ),
        lesson(
          'Moviéndote entre lecciones',
          'Navega como un pro.',
          [
            block('text', '## 🧭 Navegación Básica\n\n### Dentro de una lección:\n- Usa los botones **"Anterior"** y **"Siguiente"** para moverte entre bloques.\n- El **progreso** se guarda automáticamente.\n- Una barra de progreso en la parte superior muestra cuánto llevas.\n\n### Entre lecciones:\n- Al completar la última sección de una lección, se habilita la **siguiente lección**.\n- Puedes volver a lecciones anteriores en cualquier momento.\n\n### Panel lateral:\n- El **índice del curso** siempre está visible en el panel lateral izquierdo.\n- Las lecciones completadas se marcan con ✅.\n- La lección actual se resalta.', 0),
            block('text', '## 📊 Tu Progreso\n\nAccessLearn rastrea tu avance en tiempo real:\n\n- **Barra de progreso** en cada módulo (porcentaje completado).\n- **Estado de lecciones**: No iniciada ⬜ · En progreso 🔄 · Completada ✅\n- **Panel "Mis Cursos"**: Vista general de todos tus cursos activos.\n\n### Reanudar donde te quedaste\nSi cierras la aplicación, al volver verás el botón **"Continuar"** que te lleva exactamente donde lo dejaste.\n\n> 🎮 **Tip gamer**: Completar módulos seguidos activa rachas que multiplican tu XP.', 1),
          ],
          quiz('Quiz: Navegación', 'Demuestra que sabes moverte por la plataforma.', [
            question(
              'ordering',
              'Ordena la jerarquía de contenido de mayor a menor:',
              ['Curso', 'Módulo', 'Lección', 'Bloque'],
              [0, 1, 2, 3],
              '¡Perfecto! Curso → Módulo → Lección → Bloque.',
              'La jerarquía va de lo más grande (Curso) a lo más pequeño (Bloque).'
            ),
            question(
              'multiple-select',
              '¿Cuáles son tipos de bloques de contenido? (Selecciona todos los correctos)',
              ['Texto', 'Spreadsheet', 'Video', 'Desafío', 'Presentación PowerPoint'],
              [0, 2, 3],
              '¡Correcto! Texto, Video y Desafío son tipos de bloques válidos.',
              'Los tipos válidos incluyen: texto, video, imagen, audio, código, desafío, archivo y bienvenida.'
            ),
            question(
              'true-false',
              'Tu progreso se guarda automáticamente al avanzar entre lecciones.',
              ['Verdadero', 'Falso'],
              0,
              '¡Correcto! El progreso se guarda automáticamente.',
              'Sí, AccessLearn guarda tu progreso de forma automática.'
            ),
            question(
              'fill-blank',
              '¿Qué botón te permite retomar un curso donde lo dejaste?',
              [],
              'Continuar',
              '¡Exacto! El botón "Continuar" te regresa a donde lo dejaste.',
              'Busca el botón "Continuar" en Mis Cursos.'
            ),
          ])
        ),
      ]),

      // ── Módulo 4: Quizzes y Evaluaciones ──
      mod('Quizzes y Evaluaciones', 'Domina las evaluaciones de la plataforma', 4, [
        lesson(
          'Tipos de preguntas',
          'Conoce todas las modalidades de evaluación.',
          [
            block('text', '## ❓ Tipos de Preguntas en AccessLearn\n\nLos quizzes pueden incluir **6 tipos de preguntas** diferentes:\n\n### 1. 🔘 Opción Múltiple (Multiple Choice)\nSelecciona **una** respuesta correcta de varias opciones.\n\n### 2. ☑️ Selección Múltiple (Multiple Select)\nSelecciona **todas** las respuestas correctas — puede haber más de una.\n\n### 3. ✅❌ Verdadero o Falso\nIndica si una afirmación es verdadera o falsa.\n\n### 4. ✏️ Completar Espacio (Fill in the Blank)\nEscribe la respuesta correcta en un campo de texto.\n\n### 5. 🔢 Ordenamiento\nArrastra y ordena elementos en la secuencia correcta.\n\n### 6. 🎭 Escenario Interactivo (Scenario Solver)\nToma decisiones en una historia interactiva con múltiples caminos y consecuencias.', 0),
            block('text', '## 📏 Calificación y Puntuación\n\n### ¿Cómo se califica?\n- Cada pregunta vale **XP** (puntos de experiencia).\n- Tu **puntuación** es el porcentaje de respuestas correctas.\n- Necesitas alcanzar la **puntuación mínima** para aprobar (generalmente 60-70%).\n\n### Retroalimentación\nDespués de cada respuesta recibes:\n- ✅ **Feedback positivo** si acertaste.\n- ❌ **Feedback correctivo** si fallaste — con la explicación de la respuesta correcta.\n\n### Reintentos\n- La mayoría de quizzes permiten **reintentos**.\n- Puedes intentarlo varias veces hasta aprobar.\n- Se guarda tu **mejor puntuación**.\n\n> 🎯 **Tip**: Lee toda la pregunta antes de responder. En "Selección Múltiple" puede haber más de una respuesta correcta.', 1),
          ]
        ),
        lesson(
          'Cómo tomar un quiz paso a paso',
          'Proceso completo para completar evaluaciones.',
          [
            block('text', '## 📋 Paso a Paso para Completar un Quiz\n\n### 1. Acceder al quiz\nLos quizzes aparecen al final de los módulos o dentro de las lecciones. Busca el icono ❓.\n\n### 2. Leer las instrucciones\nAntes de empezar verás:\n- Número de preguntas\n- Puntuación mínima para aprobar\n- Número de intentos disponibles\n- Tiempo límite (si aplica)\n\n### 3. Responder las preguntas\n- Lee cada pregunta con calma.\n- Selecciona/escribe tu respuesta.\n- Haz clic en **"Siguiente"** o **"Enviar"**.\n\n### 4. Ver resultados\nAl terminar verás:\n- Tu puntuación total\n- **XP ganados**\n- Resumen de respuestas correctas e incorrectas\n- Opción de **reintentar** si no aprobaste.', 0),
            block('challenge', '## 🏆 Desafío: ¡Aprueba este mismo quiz!\n\nAhora que sabes cómo funcionan los quizzes, demuéstralo completando el quiz de este módulo.\n\n**Objetivo**: Obtener al menos **70%** de puntuación.\n\n> Ganarás **20 XP** por completar este desafío + los XP del quiz.', 1),
          ],
          quiz('Quiz: Evaluaciones', '¿Entiendes cómo funcionan los quizzes?', [
            question(
              'multiple-choice',
              '¿Cuántos tipos de preguntas hay en los quizzes de AccessLearn?',
              ['3', '4', '6', '8'],
              2,
              '¡Correcto! Hay 6 tipos: opción múltiple, selección múltiple, verdadero/falso, completar, ordenamiento y escenario.',
              'Revisa la lección — hay 6 tipos diferentes de preguntas.'
            ),
            question(
              'multiple-select',
              '¿Qué información ves antes de comenzar un quiz? (Selecciona todas)',
              ['Número de preguntas', 'Las respuestas correctas', 'Puntuación mínima', 'Intentos disponibles'],
              [0, 2, 3],
              '¡Correcto! Ves el número de preguntas, puntuación mínima e intentos.',
              'No ves las respuestas correctas. Sí ves: número de preguntas, puntuación mínima e intentos.'
            ),
            question(
              'true-false',
              'En un quiz de Selección Múltiple, solo puede haber una respuesta correcta.',
              ['Verdadero', 'Falso'],
              1,
              '¡Exacto! En "Selección Múltiple" puede haber más de una respuesta correcta.',
              'Confundes con "Opción Múltiple". En "Selección Múltiple" puede haber varias correctas.'
            ),
            question(
              'multiple-choice',
              '¿Qué se guarda cuando reintentas un quiz varias veces?',
              ['El primer intento', 'El último intento', 'La mejor puntuación', 'El promedio de todos los intentos'],
              2,
              '¡Correcto! Se guarda la mejor puntuación.',
              'AccessLearn guarda tu mejor puntuación entre todos los intentos.'
            ),
          ])
        ),
      ]),

      // ── Módulo 5: XP y Gamificación ──
      mod('XP, Niveles y Gamificación', 'El sistema que hace divertido aprender', 5, [
        lesson(
          'Cómo funciona el XP',
          'Entiende el sistema de puntos de experiencia.',
          [
            block('text', '## 🎮 El Sistema de Gamificación\n\nAccessLearn convierte el aprendizaje en una aventura con un sistema completo de gamificación.\n\n### ¿Qué es XP?\n**XP** (puntos de experiencia) es la moneda del aprendizaje. Ganas XP al:\n\n| Acción | XP |\n|--------|----|\n| Completar un bloque de contenido | 10 XP |\n| Completar un desafío | 20 XP |\n| Responder correctamente una pregunta | 15 XP |\n| Completar un módulo | Bonus XP |\n| Terminar un curso | 50+ XP |\n\n### Niveles\nTu XP acumulado determina tu nivel:\n- **Novato** (0-100 XP) 🌱\n- **Aprendiz** (101-500 XP) 📗\n- **Especialista** (501-1500 XP) ⭐\n- **Experto** (1501-5000 XP) 🏅\n- **Maestro** (5000+ XP) 👑', 0),
            block('text', '## 🏆 Logros y Badges\n\nAdemás de XP, puedes desbloquear **logros** (achievements):\n\n### Tipos de logros:\n- **Primer Curso**: Completa tu primer curso.\n- **Quiz Master**: Aprueba 10 quizzes seguidos.\n- **Racha de Fuego**: Estudia 5 días consecutivos.\n- **Explorador**: Inscríbete en 5 cursos diferentes.\n- **Perfeccionista**: Obtén 100% en un quiz.\n\n### ¿Dónde ver tus logros?\nEn tu **panel de perfil** verás:\n- Tus badges desbloqueados.\n- Tu progreso hacia el siguiente logro.\n- Tu posición en el **leaderboard** (tabla de clasificación).\n\n> 💡 Los logros son opcionales — no afectan tu progreso en los cursos.', 1),
          ]
        ),
        lesson(
          'Estrategias para maximizar tu XP',
          'Tips para subir de nivel más rápido.',
          [
            block('text', '## 🚀 Tips para Ganar Más XP\n\n### 1. Completa módulos completos\nTerminar un módulo entero da bonus XP además del XP de lecciones individuales.\n\n### 2. Acepta los desafíos\nLos bloques de tipo **Desafío** dan el doble de XP que un bloque normal.\n\n### 3. Perfecciona tus quizzes\nObtener 100% en un quiz no solo da más XP — también desbloquea logros especiales.\n\n### 4. Mantén rachas\nEstudiar días consecutivos activa multiplicadores de XP.\n\n### 5. Explora diferentes cursos\nInscribirte y avanzar en múltiples cursos desbloquea el logro "Explorador".\n\n---\n\n## 📊 Tu Panel de Progreso\n\nEn tu Dashboard verás:\n- **XP total** acumulado.\n- **Nivel actual** y progreso al siguiente.\n- **Cursos activos** y su porcentaje de completación.\n- **Logros recientes** desbloqueados.', 0),
            block('challenge', '## 🏆 Desafío Final: Reflexión de XP\n\nCalcula cuánto XP puedes ganar si completas esta guía al 100%:\n\n1. Cuenta los módulos de este curso\n2. Estima el XP por lección\n3. Suma el XP de los quizzes\n\n**Respuesta aproximada**: ~500 XP — ¡suficiente para subir varios niveles!\n\n> Completa este desafío para ganar **20 XP**.', 1),
          ],
          quiz('Quiz: Gamificación', '¿Dominas el sistema de XP?', [
            question(
              'multiple-choice',
              '¿Cuántos XP ganas al completar un bloque de tipo Desafío?',
              ['5 XP', '10 XP', '15 XP', '20 XP'],
              3,
              '¡Correcto! Los desafíos dan 20 XP.',
              'Los desafíos dan el doble de un bloque normal: 20 XP.'
            ),
            question(
              'ordering',
              'Ordena los niveles de menor a mayor:',
              ['Novato', 'Aprendiz', 'Especialista', 'Experto', 'Maestro'],
              [0, 1, 2, 3, 4],
              '¡Perfecto orden!',
              'El orden es: Novato → Aprendiz → Especialista → Experto → Maestro.'
            ),
            question(
              'true-false',
              'Los logros (achievements) son obligatorios para completar un curso.',
              ['Verdadero', 'Falso'],
              1,
              '¡Correcto! Los logros son opcionales y no afectan la completación.',
              'Los logros son extras opcionales — no bloquean tu progreso.'
            ),
            question(
              'fill-blank',
              '¿Cómo se llaman los puntos que ganas al completar lecciones y quizzes?',
              [],
              'XP',
              '¡Exacto! XP significa Puntos de Experiencia.',
              'La respuesta es XP (puntos de experiencia).'
            ),
          ])
        ),
      ]),

      // ── Módulo 6: Accesibilidad ──
      mod('Accesibilidad y Tu Perfil', 'Personaliza tu experiencia de aprendizaje', 6, [
        lesson(
          'Funciones de accesibilidad',
          'Conoce las herramientas que hacen AccessLearn inclusivo.',
          [
            block('text', '## ♿ Accesibilidad en AccessLearn\n\nAccessLearn está diseñado para que **todas las personas** puedan aprender, independientemente de sus capacidades.\n\n### Funciones de Accesibilidad\n\n#### 👁️ Discapacidad Visual\n- **Alto contraste**: Modo de colores con mayor contraste.\n- **Tamaño de fuente**: Ajusta el tamaño del texto.\n- **Lector de pantalla**: Compatible con NVDA, JAWS, VoiceOver.\n- **Alt text**: Todas las imágenes tienen descripciones alternativas.\n\n#### 👂 Discapacidad Auditiva\n- **Subtítulos**: Videos con subtítulos disponibles.\n- **Transcripciones**: Contenido de audio en texto.\n- **Alertas visuales**: Notificaciones con señales visuales, no solo sonoras.\n\n#### 🖐️ Discapacidad Motora\n- **Navegación por teclado**: Toda la plataforma es navegable con Tab y Enter.\n- **Áreas de clic amplias**: Botones grandes y fáciles de alcanzar.\n\n#### 🧠 Discapacidad Cognitiva\n- **Lenguaje claro**: Instrucciones simples y directas.\n- **Indicadores de progreso**: Siempre sabes dónde estás.\n- **Sin límites de tiempo**: Puedes ir a tu propio ritmo.', 0),
            block('text', '## 🎨 Personaliza tu Perfil de Accesibilidad\n\nEn **Configuración → Accesibilidad** puedes activar:\n\n- ✅ Modo de alto contraste\n- ✅ Tamaño de fuente grande\n- ✅ Reducción de animaciones\n- ✅ Navegación simplificada\n- ✅ Dictado por voz\n\n### Temas\nTu administrador puede personalizar los colores y temas de la plataforma. Si necesitas un ajuste especial, contacta a tu equipo de soporte.\n\n> 💡 **Tip**: Estas configuraciones se guardan en tu perfil y se aplican automáticamente cada vez que inicias sesión.', 1),
          ],
          quiz('Quiz Final: Tu Guía Completa', 'Evaluación final de todo lo aprendido.', [
            question(
              'multiple-choice',
              '¿Qué función de accesibilidad ayuda a personas con discapacidad visual?',
              ['Subtítulos', 'Alto contraste y lector de pantalla', 'Navegación por teclado', 'Límites de tiempo'],
              1,
              '¡Correcto! Alto contraste y lectores de pantalla son herramientas para discapacidad visual.',
              'Las funciones para discapacidad visual incluyen alto contraste, tamaño de fuente y lectores de pantalla.'
            ),
            question(
              'multiple-select',
              '¿Cuáles puedes personalizar en tu perfil de accesibilidad? (Selecciona todas)',
              ['Alto contraste', 'Tamaño de fuente', 'Idioma del curso', 'Reducción de animaciones'],
              [0, 1, 3],
              '¡Correcto! Puedes personalizar contraste, fuente y animaciones.',
              'El idioma del curso no está en perfil de accesibilidad. Las opciones correctas son contraste, fuente y animaciones.'
            ),
            question(
              'true-false',
              'AccessLearn es compatible con lectores de pantalla como NVDA y VoiceOver.',
              ['Verdadero', 'Falso'],
              0,
              '¡Correcto! La plataforma es totalmente compatible con lectores de pantalla.',
              'Sí, AccessLearn es compatible con NVDA, JAWS y VoiceOver.'
            ),
            question(
              'multiple-choice',
              '¿Qué ocurre con tus configuraciones de accesibilidad cuando cierras sesión?',
              ['Se pierden', 'Se guardan en tu perfil automáticamente', 'Debes exportarlas', 'Se resetean cada semana'],
              1,
              '¡Correcto! Las configuraciones se guardan en tu perfil.',
              'Las configuraciones se guardan automáticamente en tu perfil y persisten entre sesiones.'
            ),
          ])
        ),
      ]),
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════
// CURSO 2 — Guía del Creador de Cursos
// ═══════════════════════════════════════════════════════════════════
function buildCurso2() {
  return {
    title: 'Guía del Creador de Cursos',
    description:
      'Aprende a crear, editar y publicar cursos en AccessLearn. Desde la estructura hasta la IA generativa, domina todas las herramientas del editor de cursos.',
    category: 'Tutorial',
    estimatedTime: 60,
    totalXP: 600,
    difficulty: 'Specialist',
    enrollmentMode: 'open',
    completionMode: 'modules-and-quizzes',
    quizRequirement: 'required',
    requireAllQuizzesPassed: false,
    minimumScoreForCompletion: 60,
    allowRetakes: true,
    maxRetakesPerQuiz: 5,
    certificateEnabled: true,
    minimumScoreForCertificate: 80,
    modules: [
      // ── Módulo 1: Introducción al Editor ──
      mod('Introducción al Editor de Cursos', 'Tu herramienta para crear experiencias de aprendizaje', 1, [
        lesson(
          'Bienvenido, Creador de Cursos',
          'Visión general del proceso de creación.',
          [
            block('welcome', '# 🛠️ ¡Bienvenido al Estudio de Creación!\n\nComo creador de cursos, tienes el poder de transformar conocimiento en **experiencias interactivas y accesibles**.\n\nEn esta guía aprenderás:\n- Cómo crear un curso desde cero\n- Estructurar módulos y lecciones\n- Usar los 8 tipos de bloques de contenido\n- Crear quizzes con 6 tipos de preguntas\n- Usar la **IA** para generar contenido\n- Enviar a revisión y publicar\n\n> 🎯 Al final de este curso, serás capaz de crear y publicar tu propio curso en AccessLearn.', 0),
            block('text', '## 🔄 El Flujo de Creación\n\nCrear un curso en AccessLearn sigue **5 pasos** usando el editor moderno:\n\n### Paso 1: 📋 Detalles del Curso\n- Título, descripción y categoría.\n- Imagen de portada, dificultad y modo de inscripción.\n\n### Paso 2: 🏗️ Estructura\n- Crear módulos.\n- Agregar lecciones dentro de cada módulo.\n- Organizar con drag & drop.\n\n### Paso 3: ✏️ Contenido\n- Agregar bloques de contenido a cada lección.\n- Usar la IA para generar contenido.\n- Subir documentos para extraer contenido.\n\n### Paso 4: ❓ Quizzes\n- Crear evaluaciones con diferentes tipos de preguntas.\n- Usar IA para generar preguntas automáticamente.\n\n### Paso 5: 🚀 Revisión y Publicación\n- Vista previa del curso.\n- Enviar a revisión.\n- Publicar.', 1),
          ]
        ),
      ]),

      // ── Módulo 2: Detalles y Estructura ──
      mod('Configurar tu Curso', 'Paso 1 y 2: Detalles y Estructura', 2, [
        lesson(
          'Paso 1: Detalles del Curso',
          'Configura la información básica de tu curso.',
          [
            block('text', '## 📋 Configurando los Detalles\n\nAl crear un nuevo curso, lo primero es establecer su identidad:\n\n### Campos obligatorios:\n- **Título**: Nombre claro y descriptivo (máx. 100 caracteres).\n- **Descripción**: Resumen de lo que aprenderán los estudiantes.\n- **Categoría**: Clasifica tu curso (Tutorial, Tecnología, Cumplimiento, etc.).\n\n### Campos opcionales (recomendados):\n- **Imagen de portada**: Una imagen atractiva que represente el curso.\n- **Dificultad**: Novato, Especialista o Maestro.\n- **Tiempo estimado**: Horas que tomará completarlo.\n- **Modo de inscripción**: Abierta, Restringida o Solo Admin.\n\n### Configuración de completación:\n- **Modo de completación**: Solo módulos, Módulos y quizzes, Modo examen, etc.\n- **Requisito de quizzes**: Si son obligatorios u opcionales.\n- **Puntuación mínima**: Porcentaje para aprobar.\n- **Reintentos**: Si se permiten y cuántos.\n- **Certificado**: Si el curso otorga certificado al completarse.', 0),
            block('text', '## 💡 Mejores Prácticas para Detalles\n\n### Título\n✅ **"Fundamentos de Seguridad Informática"** — Claro y específico.\n❌ **"Seguridad"** — Demasiado genérico.\n\n### Descripción\n✅ *"En este curso aprenderás los principios básicos de seguridad informática, incluyendo contraseñas seguras, phishing y protección de datos."*\n❌ *"Curso de seguridad."*\n\n### Dificultad\n| Nivel | Audiencia | Contenido |\n|-------|-----------|----------|\n| 🌱 Novato | Sin experiencia previa | Conceptos básicos |\n| ⭐ Especialista | Alguna experiencia | Temas intermedios |\n| 👑 Maestro | Experiencia avanzada | Temas complejos |\n\n> 🎯 **Tip**: Un buen título y descripción aumentan las inscripciones en un 40%.', 1),
          ]
        ),
        lesson(
          'Paso 2: Estructura del Curso',
          'Organiza módulos y lecciones.',
          [
            block('text', '## 🏗️ Construyendo la Estructura\n\nLa pestaña de **Estructura** te permite diseñar el esqueleto de tu curso.\n\n### Crear un Módulo\n1. Haz clic en **"Agregar Módulo"**.\n2. Escribe el **título** del módulo.\n3. Agrega una **descripción** breve.\n\n### Crear Lecciones dentro del Módulo\n1. Dentro del módulo, clic en **"Agregar Lección"**.\n2. Escribe título y descripción de la lección.\n3. Define el **XP** y **tiempo estimado**.\n\n### Reorganizar con Drag & Drop\n- **Arrastra módulos** para cambiar su orden.\n- **Arrastra lecciones** dentro de un módulo o entre módulos.\n- El icono ≡ es el handle de arrastre.', 0),
            block('text', '## 📐 Estructura Recomendada\n\n### Regla del 5-3-7\n- **5 módulos** máximo para mantener el curso manejable.\n- **3 lecciones** por módulo en promedio.\n- **7 bloques** máximo por lección para no abrumar.\n\n### Estructura tipo:\n```\n📘 Mi Curso\n├── 📁 Módulo 1: Introducción (1-2 lecciones)\n├── 📁 Módulo 2: Tema Principal A (2-3 lecciones)\n├── 📁 Módulo 3: Tema Principal B (2-3 lecciones)\n├── 📁 Módulo 4: Aplicación Práctica (2 lecciones)\n└── 📁 Módulo 5: Evaluación Final (1 lección + quiz)\n```\n\n### Tips de estructura:\n- Empieza siempre con un módulo de **bienvenida/introducción**.\n- Termina con un módulo de **repaso y evaluación**.\n- Cada módulo debe tener un **objetivo claro**.\n- Nombra los módulos de forma **descriptiva**, no genérica.', 1),
          ],
          quiz('Quiz: Configuración del Curso', '¿Sabes configurar un curso?', [
            question(
              'multiple-select',
              '¿Cuáles son campos obligatorios al crear un curso? (Selecciona todos)',
              ['Título', 'Imagen de portada', 'Descripción', 'Categoría', 'Tiempo estimado'],
              [0, 2, 3],
              '¡Correcto! Título, descripción y categoría son obligatorios.',
              'Los campos obligatorios son: título, descripción y categoría.'
            ),
            question(
              'multiple-choice',
              '¿Cuántos módulos recomienda la "Regla del 5-3-7"?',
              ['3', '5', '7', '10'],
              1,
              '¡Correcto! La regla sugiere máximo 5 módulos.',
              'La Regla del 5-3-7: 5 módulos, 3 lecciones por módulo, 7 bloques por lección.'
            ),
            question(
              'ordering',
              'Ordena los 5 pasos del editor de cursos:',
              ['Detalles', 'Estructura', 'Contenido', 'Quizzes', 'Revisión y Publicación'],
              [0, 1, 2, 3, 4],
              '¡Perfecto orden!',
              'El orden es: Detalles → Estructura → Contenido → Quizzes → Revisión y Publicación.'
            ),
          ])
        ),
      ]),

      // ── Módulo 3: Contenido y Bloques ──
      mod('Creando Contenido', 'Paso 3: Los 8 tipos de bloques', 3, [
        lesson(
          'Tipos de bloques de contenido',
          'Conoce todas las herramientas para crear lecciones ricas.',
          [
            block('text', '## ✏️ Los 8 Bloques de Contenido\n\nCada lección se compone de **bloques**. Aquí está cada tipo:\n\n### 👋 Bienvenida\nMensaje introductorio con un personaje guía. Ideal para el primer bloque de un módulo.\n\n### 📝 Texto\nContenido con formato enriquecido (Markdown): negritas, listas, tablas, código, citas.\n\n### 🖼️ Imagen\nFotos, diagramas o infografías. **Siempre incluye texto alternativo** para accesibilidad.\n\n### 🎬 Video\nEmbed de YouTube, Vimeo, TikTok o video subido. Agrega subtítulos cuando sea posible.\n\n### 🎧 Audio\nPodcasts, explicaciones narradas o archivos de audio. Acompaña con transcripción.\n\n### 💻 Código\nFragmentos de código con resaltado de sintaxis. Ideal para cursos técnicos.\n\n### 🏆 Desafío\nActividad interactiva que otorga **XP doble** (20 XP). Pide al estudiante realizar una acción.\n\n### 📎 Archivo\nDocumentos descargables (PDF, Word, Excel, etc.).', 0),
            block('text', '## 🎯 Cuándo Usar Cada Bloque\n\n| Situación | Bloque recomendado |\n|-----------|-------------------|\n| Iniciar un módulo | 👋 Bienvenida |\n| Explicar un concepto | 📝 Texto |\n| Mostrar un proceso visual | 🖼️ Imagen |\n| Demostración paso a paso | 🎬 Video |\n| Complementar con narración | 🎧 Audio |\n| Ejemplo técnico | 💻 Código |\n| Actividad práctica | 🏆 Desafío |\n| Material de referencia | 📎 Archivo |\n\n### Combinación ideal para una lección:\n1. **Bienvenida** o **Texto** introductorio\n2. **Texto/Video/Imagen** para el contenido principal\n3. **Desafío** para practicar\n\n> 💡 **Tip**: Varía los tipos de bloques para mantener el interés del estudiante.', 1),
          ]
        ),
        lesson(
          'El editor de texto enriquecido',
          'Domina Markdown y el editor visual.',
          [
            block('text', '## 📝 Editor de Texto Enriquecido\n\nEl bloque de **Texto** usa Markdown con un editor visual intuitivo.\n\n### Formato básico:\n```markdown\n# Título Principal\n## Subtítulo\n### Sub-subtítulo\n\n**Negrita** y *Itálica*\n\n- Lista con viñetas\n1. Lista numerada\n\n> Cita o nota importante\n\n| Columna 1 | Columna 2 |\n|-----------|----------|\n| Dato A | Dato B |\n```\n\n### Elementos especiales:\n- **Tablas**: Perfectas para comparaciones y datos estructurados.\n- **Bloques de código**: Usa \\`\\`\\` triple backtick para código.\n- **Citas**: Usa `>` para notas destacadas.\n- **Emojis**: Agrega personalidad con emojis 🎉.\n\n### Accesibilidad del texto:\n- Usa **headings jerárquicos** (H1 → H2 → H3).\n- Escribe **texto descriptivo** en enlaces (no "clic aquí").\n- Mantén párrafos **cortos** (3-5 líneas máximo).', 0),
          ]
        ),
        lesson(
          'IA para generar contenido',
          'Usa inteligencia artificial para crear lecciones más rápido.',
          [
            block('text', '## 🤖 Generación de Contenido con IA\n\nAccessLearn incluye herramientas de **IA generativa** integradas en el editor.\n\n### Función 1: Generar desde Tema\n1. En el paso de **Contenido**, haz clic en el botón **"IA"** (morado).\n2. Selecciona la pestaña **"Generar desde Tema"**.\n3. Escribe un **tema o prompt**. Ejemplo: *"Introduce los principios de seguridad informática para principiantes"*.\n4. Selecciona el **número de bloques** a generar (3-10).\n5. Haz clic en **"Generar"** — la IA creará bloques de contenido.\n6. **Previsualiza** el resultado y haz clic en **"Insertar Bloques"**.\n\n### Función 2: Subir Documento\n1. En la pestaña **"Subir Documento"**, carga un archivo (PDF, Word, TXT).\n2. La IA **extraerá** el contenido del documento.\n3. Generará un **resumen**, **temas clave** y **bloques de contenido**.\n4. Previsualiza y selecciona qué insertar.\n\n> ⚠️ **Importante**: Siempre revisa y edita el contenido generado por IA.', 0),
            block('challenge', '## 🏆 Desafío: Genera contenido con IA\n\nPractica usando la IA:\n\n1. Crea un nuevo curso de prueba.\n2. Agrega un módulo y una lección.\n3. Usa el botón **IA** para generar contenido sobre un tema que domines.\n4. Revisa, edita y guarda.\n\n> Ganarás **20 XP** por completar este desafío.', 1),
          ]
        ),
      ]),

      // ── Módulo 4: Quizzes ──
      mod('Creando Quizzes y Evaluaciones', 'Paso 4: Diseña evaluaciones efectivas', 4, [
        lesson(
          'Los 6 tipos de preguntas',
          'Crea evaluaciones variadas y efectivas.',
          [
            block('text', '## ❓ Diseñando Quizzes\n\nEl paso 4 del editor te permite crear **quizzes** con 6 tipos de preguntas:\n\n### 1. 🔘 Opción Múltiple\n- Una sola respuesta correcta.\n- Ideal para: conceptos factuales.\n- **Tip**: Incluye 4 opciones, con distractores plausibles.\n\n### 2. ☑️ Selección Múltiple\n- Varias respuestas correctas.\n- Ideal para: clasificación y categorización.\n- **Tip**: Indica cuántas respuestas seleccionar.\n\n### 3. ✅❌ Verdadero o Falso\n- Afirmación a validar.\n- Ideal para: verificar comprensión rápida.\n- **Tip**: Evita dobles negaciones.\n\n### 4. ✏️ Completar Espacio\n- El estudiante escribe la respuesta.\n- Ideal para: vocabulario y términos clave.\n- **Tip**: Acepta variaciones ortográficas.\n\n### 5. 🔢 Ordenamiento\n- Arrastrar elementos al orden correcto.\n- Ideal para: secuencias y procesos.\n- **Tip**: 4-6 items máximo.\n\n### 6. 🎭 Escenario Interactivo\n- Historia con decisiones y caminos múltiples.\n- Ideal para: aplicación práctica y pensamiento crítico.\n- **Tip**: Crea 3-5 pasos con consecuencias claras.', 0),
          ]
        ),
        lesson(
          'IA para generar quizzes',
          'Genera preguntas automáticamente con IA.',
          [
            block('text', '## 🤖 Generación de Quizzes con IA\n\nNo tienes que crear todas las preguntas manualmente.\n\n### Cómo usar la IA:\n1. En el paso **Quizzes**, selecciona un quiz existente o crea uno nuevo.\n2. Haz clic en **"Generar con IA"** (botón con icono de estrella ✨).\n3. La IA analizará el **contenido de tu curso** y generará **5 preguntas** relevantes.\n4. Las preguntas se insertan automáticamente en tu quiz.\n5. **Revisa y ajusta** cada pregunta según necesites.\n\n### La IA genera:\n- Mezcla de tipos de preguntas (opción múltiple, verdadero/falso, etc.).\n- Retroalimentación positiva y correctiva.\n- Opciones de respuesta plausibles.\n\n### Mejores prácticas:\n- ✅ Revisa que las respuestas correctas sean precisas.\n- ✅ Ajusta la retroalimentación para que sea específica.\n- ✅ Agrega o quita preguntas según la longitud del quiz.\n- ❌ No confíes ciegamente en la IA — siempre verifica.', 0),
            block('text', '## ⚙️ Configuración del Quiz\n\nCada quiz tiene estas opciones:\n\n| Opción | Descripción | Recomendación |\n|--------|-------------|---------------|\n| **Puntuación mínima** | % para aprobar | 60-70% |\n| **Intentos máximos** | Cuántas veces puede reintentar | 3-5 |\n| **Tiempo límite** | Tiempo para completar el quiz | Opcional |\n| **Modo examen** | Quiz formal con restricciones | Para evaluaciones importantes |\n| **XP por pregunta** | Puntos por respuesta correcta | 10-20 XP |\n\n> 💡 Para cursos de onboarding, mantén los quizzes amigables: puntuación baja, reintentos ilimitados.', 1),
          ],
          quiz('Quiz: Creación de Quizzes', '¿Dominas la creación de evaluaciones?', [
            question(
              'multiple-choice',
              '¿Cuántas preguntas genera automáticamente la IA?',
              ['3', '5', '10', '20'],
              1,
              '¡Correcto! La IA genera 5 preguntas por defecto.',
              'La IA genera 5 preguntas que luego puedes ajustar.'
            ),
            question(
              'multiple-select',
              '¿Cuáles son tipos de preguntas válidos? (Selecciona todos)',
              ['Opción múltiple', 'Ensayo libre', 'Verdadero/Falso', 'Escenario interactivo', 'Dibujo'],
              [0, 2, 3],
              '¡Correcto! Opción múltiple, Verdadero/Falso y Escenario interactivo son tipos válidos.',
              'No hay ensayo libre ni dibujo. Los 6 tipos son: opción múltiple, selección múltiple, V/F, completar, ordenamiento y escenario.'
            ),
            question(
              'true-false',
              'Es recomendable confiar ciegamente en las preguntas generadas por IA sin revisarlas.',
              ['Verdadero', 'Falso'],
              1,
              '¡Correcto! Siempre debes revisar y ajustar el contenido generado por IA.',
              'Nunca confíes ciegamente en la IA — siempre verifica las respuestas y retroalimentación.'
            ),
          ])
        ),
      ]),

      // ── Módulo 5: Revisión y Publicación ──
      mod('Revisión y Publicación', 'Paso 5: Publica tu curso al mundo', 5, [
        lesson(
          'El flujo de publicación',
          'Entiende el proceso de revisión y aprobación.',
          [
            block('text', '## 🚀 De Borrador a Publicado\n\nLos cursos pasan por un **flujo de estados**:\n\n```\n📝 Borrador → 📤 Enviado a Revisión → ✅ Publicado\n                      ↓\n               🔄 Cambios Solicitados → 📝 Borrador (corregido)\n```\n\n### Los 4 Estados:\n\n#### 1. 📝 Borrador (Draft)\n- Estado inicial. Solo tú puedes ver el curso.\n- Puedes editar libremente.\n\n#### 2. 📤 En Revisión (Pending Review)\n- Has enviado el curso para ser revisado.\n- Un administrador revisará el contenido, la estructura y los quizzes.\n- No puedes editar mientras está en revisión.\n\n#### 3. ✅ Publicado (Published)\n- El curso está disponible para los estudiantes.\n- Los estudiantes pueden inscribirse y comenzar.\n- Puedes hacer ediciones menores sin despublicar.\n\n#### 4. 🔄 Cambios Solicitados\n- El revisor pidió modificaciones.\n- Recibirás comentarios específicos.\n- Corrige y reenvía.', 0),
            block('text', '## 📋 Checklist antes de Publicar\n\nAntes de enviar a revisión, verifica:\n\n### Contenido\n- [ ] Cada módulo tiene al menos 1 lección.\n- [ ] Cada lección tiene al menos 1 bloque de contenido.\n- [ ] No hay lecciones vacías.\n- [ ] El contenido es correcto y actualizado.\n\n### Accesibilidad\n- [ ] Las imágenes tienen texto alternativo.\n- [ ] Los videos tienen subtítulos o transcripción.\n- [ ] El texto es claro y legible.\n\n### Quizzes\n- [ ] Al menos 1 quiz por módulo principal.\n- [ ] Las respuestas correctas están bien configuradas.\n- [ ] La retroalimentación es útil y específica.\n\n### Configuración\n- [ ] Título y descripción son claros.\n- [ ] La dificultad está bien asignada.\n- [ ] Los requisitos de completación son razonables.\n\n### Vista Previa\n- [ ] El **Resumen IA** del curso tiene sentido.\n- [ ] Has recorrido el curso como estudiante.', 1),
          ],
          quiz('Quiz Final: Creador de Cursos', 'Evaluación final sobre creación de cursos.', [
            question(
              'ordering',
              'Ordena el flujo de estados de un curso:',
              ['Borrador', 'En Revisión', 'Publicado'],
              [0, 1, 2],
              '¡Perfecto! Borrador → En Revisión → Publicado.',
              'El flujo es: Borrador → En Revisión → Publicado.'
            ),
            question(
              'multiple-choice',
              '¿Puedes editar un curso mientras está "En Revisión"?',
              ['Sí, siempre', 'No, debes esperar a que sea aprobado o devuelto', 'Solo si eres admin', 'Solo los fines de semana'],
              1,
              '¡Correcto! No se puede editar durante la revisión.',
              'Mientras un curso está En Revisión, debes esperar la respuesta del revisor.'
            ),
            question(
              'multiple-select',
              '¿Qué elementos debes verificar antes de enviar a revisión? (Selecciona todos)',
              ['Que cada lección tenga contenido', 'Que las imágenes tengan alt text', 'Que los quizzes tengan respuestas correctas', 'Que el curso tenga logo animado'],
              [0, 1, 2],
              '¡Correcto! Contenido, accesibilidad y quizzes son esenciales.',
              'No se requiere logo animado. Verifica: contenido, accesibilidad e imágenes y quizzes.'
            ),
            question(
              'true-false',
              'El resumen IA del curso se genera automáticamente en el paso de Revisión.',
              ['Verdadero', 'Falso'],
              0,
              '¡Correcto! El componente AICourseSummary genera un resumen automático.',
              'Sí, en el paso 5 (Revisión) el resumen IA se genera automáticamente para cursos guardados.'
            ),
          ])
        ),
      ]),
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════
// CURSO 3 — Guía del Administrador
// ═══════════════════════════════════════════════════════════════════
function buildCurso3() {
  return {
    title: 'Guía del Administrador de AccessLearn',
    description:
      'Curso avanzado para administradores de la plataforma. Aprende a gestionar usuarios, aprobar cursos, personalizar temas, analizar métricas y configurar tu organización.',
    category: 'Tutorial',
    estimatedTime: 75,
    totalXP: 700,
    difficulty: 'Master',
    enrollmentMode: 'restricted',
    completionMode: 'modules-and-quizzes',
    quizRequirement: 'required',
    requireAllQuizzesPassed: true,
    minimumScoreForCompletion: 70,
    allowRetakes: true,
    maxRetakesPerQuiz: 3,
    certificateEnabled: true,
    minimumScoreForCertificate: 85,
    modules: [
      // ── Módulo 1: Panel de Admin ──
      mod('El Panel de Administración', 'Tu centro de mando', 1, [
        lesson(
          'Bienvenido, Administrador',
          'Visión general del panel de administración.',
          [
            block('welcome', '# 👑 Bienvenido al Panel de Administración\n\nComo administrador, tienes acceso completo a las herramientas que controlan toda la plataforma.\n\nEsta guía cubre:\n- Gestión de usuarios y roles\n- Aprobación y revisión de cursos\n- Personalización de temas y marca\n- Dashboards de analytics\n- Configuración organizacional\n\n> ⚠️ **Con gran poder viene gran responsabilidad**. Las acciones de admin afectan a todos los usuarios de tu organización.', 0),
            block('text', '## 🏠 Vista General del Dashboard Admin\n\nAl acceder al **Panel de Administración**, verás:\n\n### Tarjetas de Resumen\n- **Total de usuarios** activos en tu organización.\n- **Cursos publicados** vs. borradores.\n- **Cursos pendientes de revisión** que requieren tu atención.\n- **XP total** generado por la plataforma.\n\n### Navegación del Admin\nEl menú lateral incluye:\n| Sección | Descripción |\n|---------|-------------|\n| 📊 Dashboard | Resumen general |\n| 👥 Usuarios | Gestionar cuentas y roles |\n| 📚 Cursos | Revisar, aprobar y gestionar |\n| 🎨 Temas | Personalizar apariencia |\n| 📈 Analytics | Métricas y reportes |\n| ⚙️ Configuración | Ajustes organizacionales |\n| 🔔 Alertas | Notificaciones del sistema |', 1),
          ]
        ),
      ]),

      // ── Módulo 2: Gestión de Usuarios ──
      mod('Gestión de Usuarios', 'Administra cuentas, roles y permisos', 2, [
        lesson(
          'Roles y permisos',
          'Entiende el sistema de roles de AccessLearn.',
          [
            block('text', '## 👥 Sistema de Roles\n\nAccessLearn tiene **4 roles** con diferentes niveles de acceso:\n\n### 1. 👑 Super Admin\n- Acceso total a toda la plataforma.\n- Puede gestionar otros admins.\n- Puede configurar la organización.\n- Acceso a analytics completos.\n\n### 2. 🛡️ Admin\n- Gestionar usuarios (crear, editar, desactivar).\n- Aprobar/rechazar cursos.\n- Ver analytics de su organización.\n- Personalizar temas.\n\n### 3. ✏️ Creador de Contenido\n- Crear y editar cursos.\n- Enviar cursos a revisión.\n- Ver analytics de sus cursos.\n\n### 4. 📖 Estudiante\n- Inscribirse en cursos.\n- Completar lecciones y quizzes.\n- Ver su propio progreso y XP.\n\n### Permisos específicos:\n| Permiso | Super Admin | Admin | Creador | Estudiante |\n|---------|:-----------:|:-----:|:-------:|:----------:|\n| Crear cursos | ✅ | ✅ | ✅ | ❌ |\n| Aprobar cursos | ✅ | ✅ | ❌ | ❌ |\n| Gestionar usuarios | ✅ | ✅ | ❌ | ❌ |\n| Ver analytics | ✅ | ✅ | Limitado | ❌ |\n| Personalizar temas | ✅ | ✅ | ❌ | ❌ |', 0),
          ]
        ),
        lesson(
          'Crear y gestionar usuarios',
          'Aprende a administrar cuentas de usuario.',
          [
            block('text', '## ➕ Crear Nuevos Usuarios\n\nDesde **Admin → Usuarios**, puedes:\n\n### Crear usuario individual:\n1. Clic en **"Nuevo Usuario"**.\n2. Completa: nombre, email, rol.\n3. La contraseña temporal se envía al email.\n4. El usuario deberá cambiarla en el primer inicio de sesión.\n\n### Campos del usuario:\n- **Nombre completo**: Nombre y apellido.\n- **Email**: Dirección de correo (debe ser única).\n- **Rol**: Estudiante, Creador, Admin o Super Admin.\n- **Estado**: Activo o Inactivo.\n\n### Acciones sobre usuarios existentes:\n- **Editar**: Cambiar nombre, email o rol.\n- **Desactivar**: Bloquear acceso temporalmente.\n- **Reactivar**: Restaurar acceso.\n- **Resetear contraseña**: Enviar enlace de restablecimiento.\n\n> ⚠️ **Cuidado**: Desactivar un usuario no elimina su progreso — puede reactivarse después.', 0),
            block('text', '## 🔍 Filtrar y Buscar Usuarios\n\nLa lista de usuarios incluye herramientas de búsqueda:\n\n### Filtros disponibles:\n- **Por rol**: Mostrar solo admin, creadores o estudiantes.\n- **Por estado**: Activos, inactivos, todos.\n- **Búsqueda**: Por nombre o email.\n\n### Información visible:\n| Columna | Descripción |\n|---------|-------------|\n| Nombre | Nombre completo |\n| Email | Dirección de correo |\n| Rol | Badge con el rol asignado |\n| Estado | Activo 🟢 / Inactivo 🔴 |\n| Último acceso | Fecha y hora |\n| XP | Puntos de experiencia acumulados |\n| Cursos | Número de cursos activos |\n\n> 💡 **Tip**: Revisa regularmente los usuarios inactivos por más de 30 días.', 1),
          ],
          quiz('Quiz: Gestión de Usuarios', '¿Dominas la administración de usuarios?', [
            question(
              'multiple-choice',
              '¿Cuántos roles hay en AccessLearn?',
              ['2', '3', '4', '5'],
              2,
              '¡Correcto! Hay 4 roles: Super Admin, Admin, Creador y Estudiante.',
              'Hay 4 roles: Super Admin, Admin, Creador de Contenido y Estudiante.'
            ),
            question(
              'multiple-select',
              '¿Qué puede hacer un Admin? (Selecciona todos)',
              ['Gestionar usuarios', 'Aprobar cursos', 'Eliminar la organización', 'Personalizar temas'],
              [0, 1, 3],
              '¡Correcto! Un Admin puede gestionar usuarios, aprobar cursos y personalizar temas.',
              'Un Admin NO puede eliminar la organización. Sí puede gestionar usuarios, aprobar cursos y personalizar temas.'
            ),
            question(
              'true-false',
              'Al desactivar un usuario, se elimina permanentemente todo su progreso.',
              ['Verdadero', 'Falso'],
              1,
              '¡Correcto! Desactivar no elimina el progreso — el usuario puede reactivarse.',
              'Desactivar solo bloquea el acceso temporalmente. El progreso se conserva.'
            ),
          ])
        ),
      ]),

      // ── Módulo 3: Revisión de Cursos ──
      mod('Revisión y Aprobación de Cursos', 'Tu rol como revisor de contenido', 3, [
        lesson(
          'El proceso de revisión',
          'Cómo revisar y aprobar cursos efectivamente.',
          [
            block('text', '## 📋 Revisión de Cursos\n\nCuando un creador envía un curso a revisión, tú decides si se publica.\n\n### ¿Dónde ver cursos pendientes?\n- **Dashboard Admin** → Tarjeta "Pendientes de Revisión".\n- **Admin → Cursos** → Filtrar por estado "En Revisión".\n\n### Qué revisar:\n\n#### 1. Contenido\n- ¿Es preciso y actualizado?\n- ¿Está bien redactado y sin errores?\n- ¿Es apropiado para la audiencia?\n\n#### 2. Estructura\n- ¿La organización es lógica?\n- ¿Los módulos fluyen naturalmente?\n- ¿Las lecciones tienen longitud razonable?\n\n#### 3. Accesibilidad\n- ¿Las imágenes tienen alt text?\n- ¿Los videos tienen subtítulos?\n- ¿El texto es claro y legible?\n\n#### 4. Quizzes\n- ¿Las preguntas evalúan el contenido enseñado?\n- ¿Las respuestas correctas son precisas?\n- ¿La retroalimentación es útil?', 0),
            block('text', '## ✅ Acciones del Revisor\n\nDespués de revisar un curso, puedes:\n\n### Aprobar ✅\n- El curso se publica inmediatamente.\n- Los estudiantes pueden inscribirse.\n- El creador recibe notificación.\n\n### Solicitar Cambios 🔄\n- El curso regresa al creador con comentarios.\n- Debes escribir **comentarios específicos** indicando qué mejorar.\n- El creador corregirá y reenviará.\n\n### Rechazar ❌\n- El curso se archiva.\n- Usar solo en casos donde el contenido no es viable.\n\n### Mejores prácticas como revisor:\n- ✅ Sé **específico** en tus comentarios.\n- ✅ Sugiere **soluciones**, no solo señales problemas.\n- ✅ Revisa la **vista previa** como estudiante.\n- ✅ Verifica los quizzes respondiendo las preguntas.\n- ❌ No rechaces por detalles menores — solicita cambios.', 1),
          ],
          quiz('Quiz: Revisión de Cursos', '¿Sabes revisar cursos efectivamente?', [
            question(
              'ordering',
              '¿En qué orden debes revisar un curso?',
              ['Contenido y precisión', 'Estructura y organización', 'Accesibilidad', 'Quizzes y evaluaciones'],
              [0, 1, 2, 3],
              '¡Perfecto orden!',
              'El orden recomendado: Contenido → Estructura → Accesibilidad → Quizzes.'
            ),
            question(
              'multiple-choice',
              '¿Qué acción es mejor para un curso con errores menores de redacción?',
              ['Rechazar', 'Solicitar Cambios con comentarios específicos', 'Aprobar sin comentarios', 'Ignorar'],
              1,
              '¡Correcto! Para errores menores, solicita cambios con comentarios específicos.',
              'Los errores menores se corrigen solicitando cambios, no rechazando el curso completo.'
            ),
            question(
              'true-false',
              'Como revisor, debes verificar los quizzes respondiendo las preguntas tú mismo.',
              ['Verdadero', 'Falso'],
              0,
              '¡Correcto! Las mejores prácticas incluyen responder los quizzes personalmente.',
              'Sí, responder los quizzes te permite verificar la precisión de las respuestas y la calidad de la retroalimentación.'
            ),
          ])
        ),
      ]),

      // ── Módulo 4: Personalización ──
      mod('Personalización y Temas', 'Haz que la plataforma refleje tu marca', 4, [
        lesson(
          'Configuración de temas',
          'Personaliza los colores y la apariencia.',
          [
            block('text', '## 🎨 Personalización Visual\n\nAccessLearn te permite adaptar la apariencia a tu marca corporativa.\n\n### Elementos personalizables:\n\n#### 1. Colores\n- **Color primario**: Botones, enlaces y elementos destacados.\n- **Color secundario**: Acentos y elementos complementarios.\n- **Fondo**: Color de fondo general.\n- **Texto**: Color del texto principal.\n\n#### 2. Identidad\n- **Logo**: Sube el logo de tu organización.\n- **Favicon**: Icono que aparece en la pestaña del navegador.\n- **Nombre de la organización**: Se muestra en header y emails.\n\n#### 3. Modos\n- **Modo claro**: Fondo blanco, texto oscuro.\n- **Modo oscuro**: Fondo oscuro, texto claro.\n- **Auto**: Sigue las preferencias del sistema del usuario.\n\n### Cómo personalizar:\n1. Ve a **Admin → Temas**.\n2. Selecciona los colores con el selector de color.\n3. Sube tu logo y favicon.\n4. Haz clic en **"Guardar"**.\n5. Los cambios se aplican inmediatamente para todos los usuarios.\n\n> 💡 **Tip**: Asegúrate de que tus colores tengan suficiente **contraste** para cumplir con estándares de accesibilidad (WCAG AA mínimo).', 0),
          ]
        ),
        lesson(
          'Configuración organizacional',
          'Ajustes generales de tu organización.',
          [
            block('text', '## ⚙️ Configuración de la Organización\n\nEn **Admin → Configuración** puedes ajustar:\n\n### Datos generales\n- **Nombre de la organización**: Cómo se identifica tu organización.\n- **Idioma predeterminado**: Español, Inglés, etc.\n- **Zona horaria**: Para reportes y métricas.\n\n### Políticas de cursos\n- **Auto-aprobación**: Los cursos de ciertos roles se publican sin revisión.\n- **Modo de inscripción predeterminado**: Para nuevos cursos.\n- **Requisitos de certificado**: Configuración global.\n\n### Notificaciones\n- **Email de bienvenida**: Personaliza el mensaje para nuevos usuarios.\n- **Recordatorios**: Frecuencia de recordatorios para cursos incompletos.\n- **Notificaciones de revisión**: Quién recibe alertas de cursos pendientes.\n\n### Integraciones\n- **Azure AD B2C**: Para autenticación corporativa.\n- **Application Insights**: Para monitoreo de la plataforma.\n- **Blob Storage**: Para almacenamiento de archivos.', 0),
          ],
          quiz('Quiz: Personalización', '¿Conoces las opciones de configuración?', [
            question(
              'multiple-select',
              '¿Qué elementos puedes personalizar en los temas? (Selecciona todos)',
              ['Colores primario y secundario', 'Logo de la organización', 'Tipo de base de datos', 'Modo claro/oscuro'],
              [0, 1, 3],
              '¡Correcto! Puedes personalizar colores, logo y modos de visualización.',
              'No puedes cambiar el tipo de base de datos desde los temas. Sí: colores, logo y modo de visualización.'
            ),
            question(
              'multiple-choice',
              '¿Qué estándar de contraste debe cumplirse al personalizar colores?',
              ['ISO 9001', 'WCAG AA', 'RGB Standard', 'No hay requisito'],
              1,
              '¡Correcto! WCAG AA es el estándar mínimo de accesibilidad.',
              'WCAG AA es el estándar mínimo de contraste para accesibilidad web.'
            ),
          ])
        ),
      ]),

      // ── Módulo 5: Analytics ──
      mod('Dashboards de Analytics', 'Toma decisiones basadas en datos', 5, [
        lesson(
          'Métricas clave',
          'Las métricas más importantes para monitorear.',
          [
            block('text', '## 📊 Analytics en AccessLearn\n\nEl panel de analytics te da visión completa del aprendizaje en tu organización.\n\n### Métricas Principales\n\n#### 📈 Uso General\n- **Usuarios activos** (diario/semanal/mensual).\n- **Sesiones promedio**: Tiempo y frecuencia de uso.\n- **Tasa de retención**: % de usuarios que regresan.\n\n#### 📚 Cursos\n- **Tasa de completación**: % de inscripciones que terminan el curso.\n- **Tiempo promedio**: Cuánto tarda un estudiante en completar.\n- **Cursos más populares**: Por inscripciones y completaciones.\n- **Cursos con baja completación**: Posibles mejoras necesarias.\n\n#### ❓ Evaluaciones\n- **Puntuación promedio** por quiz.\n- **Preguntas más falladas**: Contenido que necesita refuerzo.\n- **Tasa de reintentos**: Quizzes que causan dificultad.\n\n#### 🎮 Gamificación\n- **Distribución de niveles**: Cuántos usuarios en cada nivel.\n- **XP total generado**: Nivel de engagement.\n- **Logros más desbloqueados**: Qué motiva a los usuarios.', 0),
          ]
        ),
        lesson(
          'Insights con IA',
          'Usa la IA para interpretar tus datos.',
          [
            block('text', '## 🤖 AI Analytics Insights\n\nAccessLearn incluye un componente de **IA** que analiza automáticamente tus métricas.\n\n### ¿Qué hace?\nEl **AI Analytics Insights** procesa tus datos y genera:\n- **Resumen ejecutivo** de la salud de la plataforma.\n- **Tendencias** identificadas (positivas y negativas).\n- **Recomendaciones** específicas de acción.\n- **Alertas** sobre métricas preocupantes.\n\n### Cómo usarlo:\n1. Ve a **Admin → Analytics**.\n2. Busca la sección **"Insights IA"**.\n3. La IA generará observaciones basadas en datos reales.\n\n### Ejemplos de insights:\n- *"La tasa de completación bajó un 15% este mes. Se recomienda revisar los cursos con mayor abandono."*\n- *"El quiz del Módulo 3 del curso X tiene una tasa de fallo del 80%. Considere simplificar las preguntas."*\n- *"Los usuarios que completan el curso de inducción tienen 3x más probabilidad de continuar con otros cursos."*\n\n> 💡 **Tip**: Revisa los insights semanalmente para mantener la plataforma optimizada.', 0),
            block('text', '## 📋 Acciones Basadas en Datos\n\n### Si la completación es baja:\n1. Revisa la longitud de los cursos — ¿son demasiado largos?\n2. Verifica que los quizzes no sean excesivamente difíciles.\n3. Agrega más contenido interactivo (desafíos, videos).\n\n### Si el engagement está bajando:\n1. Envía recordatorios a usuarios inactivos.\n2. Introduce nuevos cursos o actualiza los existentes.\n3. Comunica los logros desbloqueados para motivar.\n\n### Si las puntuaciones de quizzes son bajas:\n1. Revisa si las preguntas son claras.\n2. Mejora el contenido que precede al quiz.\n3. Agrega más ejemplos y explicaciones.\n\n### Reportes periódicos:\n- **Semanal**: Usuarios activos, cursos completados.\n- **Mensual**: Tendencias, comparativa con mes anterior.\n- **Trimestral**: ROI del aprendizaje, certificaciones emitidas.', 1),
          ],
          quiz('Quiz Final: Administrador Certificado', 'Evaluación final para certificarte como administrador.', [
            question(
              'multiple-choice',
              '¿Qué indica una tasa de completación baja en un curso?',
              ['El curso es muy popular', 'Puede necesitar mejoras en contenido o longitud', 'Los estudiantes son flojos', 'El servidor está lento'],
              1,
              '¡Correcto! Una baja completación suele indicar que el curso necesita mejoras.',
              'Una tasa baja sugiere problemas con la longitud, dificultad o calidad del contenido.'
            ),
            question(
              'multiple-select',
              '¿Qué genera el AI Analytics Insights? (Selecciona todos)',
              ['Resumen ejecutivo', 'Tendencias identificadas', 'Código de programación', 'Recomendaciones de acción'],
              [0, 1, 3],
              '¡Correcto! Genera resúmenes, tendencias y recomendaciones.',
              'La IA genera resúmenes, tendencias y recomendaciones — no genera código.'
            ),
            question(
              'ordering',
              'Ordena la frecuencia recomendada de revisión de reportes:',
              ['Semanal: usuarios activos', 'Mensual: tendencias', 'Trimestral: ROI'],
              [0, 1, 2],
              '¡Perfecto! De más frecuente a menos frecuente.',
              'El orden es: Semanal → Mensual → Trimestral.'
            ),
            question(
              'fill-blank',
              '¿Qué estándar mínimo de contraste de colores se debe cumplir al personalizar temas?',
              [],
              'WCAG AA',
              '¡Correcto! WCAG AA es el estándar mínimo.',
              'El estándar es WCAG AA para asegurar accesibilidad.'
            ),
            question(
              'true-false',
              'Los Admin Insights de IA deben revisarse al menos semanalmente.',
              ['Verdadero', 'Falso'],
              0,
              '¡Correcto! Se recomienda revisión semanal para mantener la plataforma optimizada.',
              'Las mejores prácticas recomiendan revisar los insights semanalmente.'
            ),
          ])
        ),
      ]),
    ],
  };
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
async function main() {
  await login();

  const courses = [
    { id: COURSE_IDS.estudiante, name: 'Guía del Estudiante', builder: buildCurso1 },
    { id: COURSE_IDS.creador, name: 'Guía del Creador de Cursos', builder: buildCurso2 },
    { id: COURSE_IDS.admin, name: 'Guía del Administrador', builder: buildCurso3 },
  ];

  for (const c of courses) {
    console.log(`\n📘 Actualizando: ${c.name}...`);
    const data = c.builder();
    await updateCourse(c.id, data);
    console.log(`  ✅ Contenido actualizado (${data.modules.length} módulos)`);

    await publishCourse(c.id);
  }

  console.log('\n🎉 ¡Los 3 cursos han sido poblados y publicados!');
}

main().catch(console.error);
