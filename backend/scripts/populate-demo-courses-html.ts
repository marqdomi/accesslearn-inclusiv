/**
 * Script para re-poblar los 3 cursos demo con contenido en HTML (no Markdown).
 * El visor usa dangerouslySetInnerHTML via HTMLContent, así que necesitamos HTML puro.
 * Ejecutar: npx ts-node scripts/populate-demo-courses-html.ts
 */

const API_BASE = 'http://localhost:3000/api';
const TENANT_ID = 'tenant-kainet';
const LOGIN_EMAIL = 'ana.lopez@kainet.mx';
const LOGIN_PASSWORD = 'Demo123!';

const COURSE_IDS = {
  estudiante: 'course-1763874756585-mvnuozcuu',
  creador: 'course-1763874757513-me6s2vs72',
  admin: 'course-1763874758191-ku23ii5b8',
};

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
  console.log('✅ Autenticado');
}

async function updateCourse(courseId: string, updates: any) {
  const res = await fetch(`${API_BASE}/courses/${courseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`PUT failed (${res.status}): ${await res.text()}`);
  return res.json();
}

let _c = 0;
const uid = (p: string) => `${p}-${Date.now()}-${(++_c).toString(36)}`;

function blk(type: string, content: string, order: number, extra: Record<string, any> = {}) {
  return { id: uid('blk'), type, content, order, xpValue: type === 'challenge' ? 20 : 10, ...extra };
}

function q(
  type: string, question: string, options: string[],
  correctAnswer: number | number[] | string,
  correctFeedback: string, incorrectFeedback: string
) {
  return { id: uid('q'), type, question, options, correctAnswer, correctFeedback, incorrectFeedback, xpValue: 15 };
}

function qz(title: string, desc: string, questions: any[]) {
  return { id: uid('qz'), title, description: desc, questions, passingScore: 70, maxAttempts: 3, totalXP: questions.length * 15 };
}

function lsn(title: string, desc: string, blocks: any[], quiz?: any) {
  const l: any = { id: uid('lsn'), title, description: desc, blocks, totalXP: blocks.reduce((s: number, b: any) => s + (b.xpValue || 0), 0) + (quiz?.totalXP || 0), estimatedMinutes: Math.max(5, blocks.length * 3 + (quiz ? 5 : 0)) };
  if (quiz) l.quiz = quiz;
  return l;
}

function mod(title: string, desc: string, order: number, lessons: any[]) {
  return { id: uid('mod'), title, description: desc, type: 'lesson', url: '', order, lessons, accessibility: { altText: title } };
}

// ═══════════════════════════════════════════════════════════════════
// CURSO 1 — Guía del Estudiante
// ═══════════════════════════════════════════════════════════════════
function buildCurso1() {
  return {
    title: 'Guía del Estudiante — Aprende a Usar AccessLearn',
    description: 'Curso interactivo para nuevos estudiantes. Aprende a inscribirte en cursos, navegar por módulos y lecciones, completar quizzes, ganar XP y configurar tu perfil de accesibilidad.',
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
        lsn('¡Bienvenido! Tu aventura comienza aquí', 'Descubre qué es AccessLearn y por qué cambiará tu forma de aprender.', [
          blk('welcome',
            `<h1>🎉 ¡Bienvenido a AccessLearn!</h1>
<p>Estás a punto de comenzar una experiencia de aprendizaje <strong>diferente</strong>. Aquí no solo lees — <strong>interactúas, juegas y creces</strong>.</p>
<p>Esta guía te enseñará todo lo que necesitas saber para aprovechar al máximo la plataforma.</p>
<blockquote><p>💡 <strong>Tip</strong>: Cada lección completada te acerca a tu certificado.</p></blockquote>`, 0),

          blk('text',
            `<h2>¿Qué es AccessLearn?</h2>
<p>AccessLearn es una plataforma de aprendizaje corporativo diseñada con <strong>tres pilares</strong>:</p>

<h3>1. 🌐 Accesibilidad</h3>
<p>Cada curso está diseñado para ser accesible para personas con discapacidades visuales, auditivas, motoras y cognitivas. Puedes personalizar tu experiencia con perfiles de accesibilidad.</p>

<h3>2. 🎮 Gamificación</h3>
<p>Gana <strong>puntos de experiencia (XP)</strong> al completar lecciones y quizzes. Sube de nivel y desbloquea logros.</p>

<h3>3. 📊 Análisis Inteligente</h3>
<p>Los administradores pueden ver tu progreso y adaptar los cursos a tus necesidades.</p>`, 1),

          blk('text',
            `<h2>Lo que aprenderás en esta guía</h2>
<table>
  <thead><tr><th>Módulo</th><th>Tema</th><th>XP</th></tr></thead>
  <tbody>
    <tr><td>1</td><td>Bienvenida y visión general</td><td>30</td></tr>
    <tr><td>2</td><td>Inscribirse en cursos</td><td>80</td></tr>
    <tr><td>3</td><td>Navegar módulos y lecciones</td><td>80</td></tr>
    <tr><td>4</td><td>Quizzes y evaluaciones</td><td>100</td></tr>
    <tr><td>5</td><td>XP, niveles y gamificación</td><td>80</td></tr>
    <tr><td>6</td><td>Accesibilidad y tu perfil</td><td>80</td></tr>
  </tbody>
</table>
<p><strong>Total: ~500 XP</strong> 🎯</p>
<p>Haz clic en <strong>Siguiente</strong> para continuar.</p>`, 2),
        ]),
      ]),

      // ── Módulo 2: Inscripción ──
      mod('Inscripción y Catálogo de Cursos', 'Aprende a encontrar e inscribirte en cursos', 2, [
        lsn('Explorando el catálogo de cursos', 'Descubre cómo encontrar cursos que te interesen.', [
          blk('text',
            `<h2>📚 El Catálogo de Cursos</h2>
<p>Desde tu <strong>Dashboard</strong> (tablero principal), puedes acceder al catálogo de cursos disponible para tu organización.</p>

<h3>¿Dónde encontrarlo?</h3>
<ol>
  <li>Haz clic en <strong>"Explorar Cursos"</strong> en el menú lateral.</li>
  <li>Verás una lista de cursos organizados por <strong>categoría</strong> y <strong>dificultad</strong>.</li>
</ol>

<h3>Filtros disponibles:</h3>
<ul>
  <li><strong>Categoría</strong>: Tutorial, Tecnología, Cumplimiento, etc.</li>
  <li><strong>Dificultad</strong>: Novato, Especialista, Maestro.</li>
  <li><strong>Estado</strong>: Disponibles, En progreso, Completados.</li>
</ul>`, 0),

          blk('text',
            `<h2>🔍 Detalles de un Curso</h2>
<p>Antes de inscribirte, puedes ver:</p>
<ul>
  <li><strong>Descripción</strong> del curso</li>
  <li><strong>Número de módulos</strong> y lecciones</li>
  <li><strong>XP total</strong> que puedes ganar</li>
  <li><strong>Tiempo estimado</strong> de completación</li>
  <li><strong>Requisitos</strong> previos (si los hay)</li>
</ul>

<h3>Tipos de inscripción:</h3>
<table>
  <thead><tr><th>Tipo</th><th>Descripción</th></tr></thead>
  <tbody>
    <tr><td>🟢 <strong>Abierta</strong></td><td>Cualquiera puede inscribirse</td></tr>
    <tr><td>🟡 <strong>Restringida</strong></td><td>Requiere aprobación del admin</td></tr>
    <tr><td>🔴 <strong>Solo admin</strong></td><td>El administrador te asigna el curso</td></tr>
  </tbody>
</table>`, 1),
        ]),

        lsn('Cómo inscribirte paso a paso', 'Proceso completo de inscripción.', [
          blk('text',
            `<h2>✅ Proceso de Inscripción</h2>

<h3>Paso 1: Encuentra el curso</h3>
<p>Navega al catálogo y selecciona el curso que te interesa.</p>

<h3>Paso 2: Haz clic en "Inscribirme"</h3>
<p>En la página de detalles del curso, verás un botón grande de <strong>"Inscribirme"</strong>.</p>

<h3>Paso 3: Confirmación</h3>
<p>Recibirás una confirmación y el curso aparecerá en <strong>"Mis Cursos"</strong> en tu Dashboard.</p>

<h3>Paso 4: ¡Comienza!</h3>
<p>Haz clic en <strong>"Continuar"</strong> para empezar la primera lección.</p>`, 0),

          blk('challenge',
            `<h2>🏆 Desafío: Tu primera inscripción</h2>
<p>Ve al catálogo de cursos y busca un curso que te llame la atención. Inscríbete y regresa aquí.</p>
<p><strong>Pista</strong>: Este mismo curso cuenta — ¡ya estás inscrito! 🎉</p>
<blockquote><p>Completa este desafío para ganar <strong>20 XP extra</strong>.</p></blockquote>`, 1),
        ],
          qz('Quiz: Inscripción en cursos', 'Veamos qué aprendiste sobre el catálogo de cursos.', [
            q('multiple-choice', '¿Dónde puedes encontrar el catálogo de cursos?',
              ['En Configuración', 'En "Explorar Cursos" del menú lateral', 'En el correo de bienvenida', 'En la sección de Analytics'],
              1, '¡Correcto! El catálogo está en "Explorar Cursos" en el menú lateral.', 'Revisa la lección anterior — el catálogo se encuentra en el menú lateral.'),
            q('true-false', 'Todos los cursos en AccessLearn tienen inscripción abierta.',
              ['Verdadero', 'Falso'],
              1, '¡Correcto! Algunos cursos tienen inscripción restringida o solo por admin.', 'Hay tres tipos de inscripción: abierta, restringida y solo admin.'),
            q('multiple-choice', '¿Qué información puedes ver antes de inscribirte en un curso?',
              ['Solo el título', 'Título y descripción únicamente', 'Descripción, módulos, XP total y tiempo estimado', 'Nada — debes inscribirte primero'],
              2, '¡Exacto! Puedes ver toda la información relevante antes de inscribirte.', 'La página de detalles muestra descripción, módulos, XP y tiempo estimado.'),
          ])
        ),
      ]),

      // ── Módulo 3: Navegación ──
      mod('Navegación de Cursos', 'Aprende a moverte entre módulos y lecciones', 3, [
        lsn('Estructura de un curso', 'Entiende cómo se organiza el contenido.', [
          blk('text',
            `<h2>📖 ¿Cómo se organiza un curso?</h2>
<p>Cada curso en AccessLearn tiene una estructura jerárquica:</p>
<pre><code>📘 Curso
├── 📁 Módulo 1
│   ├── 📄 Lección 1.1
│   │   ├── 📝 Bloque de texto
│   │   ├── 🎬 Bloque de video
│   │   └── 🏆 Desafío
│   ├── 📄 Lección 1.2
│   └── ❓ Quiz del Módulo
├── 📁 Módulo 2
│   └── ...
└── 🎓 Completación</code></pre>

<h3>Términos clave:</h3>
<ul>
  <li><strong>Módulo</strong>: Un grupo temático de lecciones.</li>
  <li><strong>Lección</strong>: Una página con contenido (texto, video, imágenes, etc.).</li>
  <li><strong>Bloque</strong>: Un elemento individual de contenido dentro de una lección.</li>
  <li><strong>Quiz</strong>: Una evaluación al final de un módulo o lección.</li>
</ul>`, 0),

          blk('text',
            `<h2>🧩 Tipos de Bloques de Contenido</h2>
<p>Dentro de cada lección encontrarás diferentes tipos de contenido:</p>
<table>
  <thead><tr><th>Icono</th><th>Tipo</th><th>Descripción</th></tr></thead>
  <tbody>
    <tr><td>📝</td><td><strong>Texto</strong></td><td>Contenido con formato enriquecido</td></tr>
    <tr><td>🎬</td><td><strong>Video</strong></td><td>Videos de YouTube, Vimeo, etc.</td></tr>
    <tr><td>🖼️</td><td><strong>Imagen</strong></td><td>Fotos, diagramas, infografías</td></tr>
    <tr><td>🎧</td><td><strong>Audio</strong></td><td>Podcasts, explicaciones narradas</td></tr>
    <tr><td>💻</td><td><strong>Código</strong></td><td>Fragmentos de código con resaltado</td></tr>
    <tr><td>🏆</td><td><strong>Desafío</strong></td><td>Actividades interactivas con XP extra</td></tr>
    <tr><td>📎</td><td><strong>Archivo</strong></td><td>Documentos descargables</td></tr>
    <tr><td>👋</td><td><strong>Bienvenida</strong></td><td>Mensaje introductorio del módulo</td></tr>
  </tbody>
</table>
<blockquote><p>💡 Cada bloque completado te otorga <strong>XP</strong>.</p></blockquote>`, 1),
        ]),

        lsn('Moviéndote entre lecciones', 'Navega como un pro.', [
          blk('text',
            `<h2>🧭 Navegación Básica</h2>

<h3>Dentro de una lección:</h3>
<ul>
  <li>Usa los botones <strong>"Anterior"</strong> y <strong>"Siguiente"</strong> para moverte entre bloques.</li>
  <li>El <strong>progreso</strong> se guarda automáticamente.</li>
  <li>Una barra de progreso en la parte superior muestra cuánto llevas.</li>
</ul>

<h3>Entre lecciones:</h3>
<ul>
  <li>Al completar la última sección de una lección, se habilita la <strong>siguiente lección</strong>.</li>
  <li>Puedes volver a lecciones anteriores en cualquier momento.</li>
</ul>

<h3>Panel lateral:</h3>
<ul>
  <li>El <strong>índice del curso</strong> siempre está visible en el panel lateral izquierdo.</li>
  <li>Las lecciones completadas se marcan con ✅.</li>
  <li>La lección actual se resalta.</li>
</ul>`, 0),

          blk('text',
            `<h2>📊 Tu Progreso</h2>
<p>AccessLearn rastrea tu avance en tiempo real:</p>
<ul>
  <li><strong>Barra de progreso</strong> en cada módulo (porcentaje completado).</li>
  <li><strong>Estado de lecciones</strong>: No iniciada ⬜ · En progreso 🔄 · Completada ✅</li>
  <li><strong>Panel "Mis Cursos"</strong>: Vista general de todos tus cursos activos.</li>
</ul>

<h3>Reanudar donde te quedaste</h3>
<p>Si cierras la aplicación, al volver verás el botón <strong>"Continuar"</strong> que te lleva exactamente donde lo dejaste.</p>

<blockquote><p>🎮 <strong>Tip gamer</strong>: Completar módulos seguidos activa rachas que multiplican tu XP.</p></blockquote>`, 1),
        ],
          qz('Quiz: Navegación', 'Demuestra que sabes moverte por la plataforma.', [
            q('ordering', 'Ordena la jerarquía de contenido de mayor a menor:',
              ['Curso', 'Módulo', 'Lección', 'Bloque'],
              [0, 1, 2, 3], '¡Perfecto! Curso → Módulo → Lección → Bloque.', 'La jerarquía va de lo más grande (Curso) a lo más pequeño (Bloque).'),
            q('multiple-select', '¿Cuáles son tipos de bloques de contenido? (Selecciona todos los correctos)',
              ['Texto', 'Spreadsheet', 'Video', 'Desafío', 'Presentación PowerPoint'],
              [0, 2, 3], '¡Correcto! Texto, Video y Desafío son tipos de bloques válidos.', 'Los tipos válidos incluyen: texto, video, imagen, audio, código, desafío, archivo y bienvenida.'),
            q('true-false', 'Tu progreso se guarda automáticamente al avanzar entre lecciones.',
              ['Verdadero', 'Falso'],
              0, '¡Correcto! El progreso se guarda automáticamente.', 'Sí, AccessLearn guarda tu progreso de forma automática.'),
            q('fill-blank', '¿Qué botón te permite retomar un curso donde lo dejaste?',
              [], 'Continuar', '¡Exacto! El botón "Continuar" te regresa a donde lo dejaste.', 'Busca el botón "Continuar" en Mis Cursos.'),
          ])
        ),
      ]),

      // ── Módulo 4: Quizzes ──
      mod('Quizzes y Evaluaciones', 'Domina las evaluaciones de la plataforma', 4, [
        lsn('Tipos de preguntas', 'Conoce todas las modalidades de evaluación.', [
          blk('text',
            `<h2>❓ Tipos de Preguntas en AccessLearn</h2>
<p>Los quizzes pueden incluir <strong>6 tipos de preguntas</strong> diferentes:</p>

<h3>1. 🔘 Opción Múltiple (Multiple Choice)</h3>
<p>Selecciona <strong>una</strong> respuesta correcta de varias opciones.</p>

<h3>2. ☑️ Selección Múltiple (Multiple Select)</h3>
<p>Selecciona <strong>todas</strong> las respuestas correctas — puede haber más de una.</p>

<h3>3. ✅❌ Verdadero o Falso</h3>
<p>Indica si una afirmación es verdadera o falsa.</p>

<h3>4. ✏️ Completar Espacio (Fill in the Blank)</h3>
<p>Escribe la respuesta correcta en un campo de texto.</p>

<h3>5. 🔢 Ordenamiento</h3>
<p>Arrastra y ordena elementos en la secuencia correcta.</p>

<h3>6. 🎭 Escenario Interactivo (Scenario Solver)</h3>
<p>Toma decisiones en una historia interactiva con múltiples caminos y consecuencias.</p>`, 0),

          blk('text',
            `<h2>📏 Calificación y Puntuación</h2>

<h3>¿Cómo se califica?</h3>
<ul>
  <li>Cada pregunta vale <strong>XP</strong> (puntos de experiencia).</li>
  <li>Tu <strong>puntuación</strong> es el porcentaje de respuestas correctas.</li>
  <li>Necesitas alcanzar la <strong>puntuación mínima</strong> para aprobar (generalmente 60-70%).</li>
</ul>

<h3>Retroalimentación</h3>
<p>Después de cada respuesta recibes:</p>
<ul>
  <li>✅ <strong>Feedback positivo</strong> si acertaste.</li>
  <li>❌ <strong>Feedback correctivo</strong> si fallaste — con la explicación de la respuesta correcta.</li>
</ul>

<h3>Reintentos</h3>
<ul>
  <li>La mayoría de quizzes permiten <strong>reintentos</strong>.</li>
  <li>Puedes intentarlo varias veces hasta aprobar.</li>
  <li>Se guarda tu <strong>mejor puntuación</strong>.</li>
</ul>

<blockquote><p>🎯 <strong>Tip</strong>: Lee toda la pregunta antes de responder. En "Selección Múltiple" puede haber más de una respuesta correcta.</p></blockquote>`, 1),
        ]),

        lsn('Cómo tomar un quiz paso a paso', 'Proceso completo para completar evaluaciones.', [
          blk('text',
            `<h2>📋 Paso a Paso para Completar un Quiz</h2>

<h3>1. Acceder al quiz</h3>
<p>Los quizzes aparecen al final de los módulos o dentro de las lecciones. Busca el icono ❓.</p>

<h3>2. Leer las instrucciones</h3>
<p>Antes de empezar verás:</p>
<ul>
  <li>Número de preguntas</li>
  <li>Puntuación mínima para aprobar</li>
  <li>Número de intentos disponibles</li>
  <li>Tiempo límite (si aplica)</li>
</ul>

<h3>3. Responder las preguntas</h3>
<ul>
  <li>Lee cada pregunta con calma.</li>
  <li>Selecciona/escribe tu respuesta.</li>
  <li>Haz clic en <strong>"Siguiente"</strong> o <strong>"Enviar"</strong>.</li>
</ul>

<h3>4. Ver resultados</h3>
<p>Al terminar verás:</p>
<ul>
  <li>Tu puntuación total</li>
  <li><strong>XP ganados</strong></li>
  <li>Resumen de respuestas correctas e incorrectas</li>
  <li>Opción de <strong>reintentar</strong> si no aprobaste.</li>
</ul>`, 0),

          blk('challenge',
            `<h2>🏆 Desafío: ¡Aprueba este mismo quiz!</h2>
<p>Ahora que sabes cómo funcionan los quizzes, demuéstralo completando el quiz de este módulo.</p>
<p><strong>Objetivo</strong>: Obtener al menos <strong>70%</strong> de puntuación.</p>
<blockquote><p>Ganarás <strong>20 XP</strong> por completar este desafío + los XP del quiz.</p></blockquote>`, 1),
        ],
          qz('Quiz: Evaluaciones', '¿Entiendes cómo funcionan los quizzes?', [
            q('multiple-choice', '¿Cuántos tipos de preguntas hay en los quizzes de AccessLearn?',
              ['3', '4', '6', '8'],
              2, '¡Correcto! Hay 6 tipos: opción múltiple, selección múltiple, verdadero/falso, completar, ordenamiento y escenario.', 'Revisa la lección — hay 6 tipos diferentes de preguntas.'),
            q('multiple-select', '¿Qué información ves antes de comenzar un quiz? (Selecciona todas)',
              ['Número de preguntas', 'Las respuestas correctas', 'Puntuación mínima', 'Intentos disponibles'],
              [0, 2, 3], '¡Correcto! Ves el número de preguntas, puntuación mínima e intentos.', 'No ves las respuestas correctas. Sí ves: número de preguntas, puntuación mínima e intentos.'),
            q('true-false', 'En un quiz de Selección Múltiple, solo puede haber una respuesta correcta.',
              ['Verdadero', 'Falso'],
              1, '¡Exacto! En "Selección Múltiple" puede haber más de una respuesta correcta.', 'Confundes con "Opción Múltiple". En "Selección Múltiple" puede haber varias correctas.'),
            q('multiple-choice', '¿Qué se guarda cuando reintentas un quiz varias veces?',
              ['El primer intento', 'El último intento', 'La mejor puntuación', 'El promedio de todos los intentos'],
              2, '¡Correcto! Se guarda la mejor puntuación.', 'AccessLearn guarda tu mejor puntuación entre todos los intentos.'),
          ])
        ),
      ]),

      // ── Módulo 5: XP y Gamificación ──
      mod('XP, Niveles y Gamificación', 'El sistema que hace divertido aprender', 5, [
        lsn('Cómo funciona el XP', 'Entiende el sistema de puntos de experiencia.', [
          blk('text',
            `<h2>🎮 El Sistema de Gamificación</h2>
<p>AccessLearn convierte el aprendizaje en una aventura con un sistema completo de gamificación.</p>

<h3>¿Qué es XP?</h3>
<p><strong>XP</strong> (puntos de experiencia) es la moneda del aprendizaje. Ganas XP al:</p>
<table>
  <thead><tr><th>Acción</th><th>XP</th></tr></thead>
  <tbody>
    <tr><td>Completar un bloque de contenido</td><td>10 XP</td></tr>
    <tr><td>Completar un desafío</td><td>20 XP</td></tr>
    <tr><td>Responder correctamente una pregunta</td><td>15 XP</td></tr>
    <tr><td>Completar un módulo</td><td>Bonus XP</td></tr>
    <tr><td>Terminar un curso</td><td>50+ XP</td></tr>
  </tbody>
</table>

<h3>Niveles</h3>
<p>Tu XP acumulado determina tu nivel:</p>
<ul>
  <li><strong>Novato</strong> (0-100 XP) 🌱</li>
  <li><strong>Aprendiz</strong> (101-500 XP) 📗</li>
  <li><strong>Especialista</strong> (501-1500 XP) ⭐</li>
  <li><strong>Experto</strong> (1501-5000 XP) 🏅</li>
  <li><strong>Maestro</strong> (5000+ XP) 👑</li>
</ul>`, 0),

          blk('text',
            `<h2>🏆 Logros y Badges</h2>
<p>Además de XP, puedes desbloquear <strong>logros</strong> (achievements):</p>

<h3>Tipos de logros:</h3>
<ul>
  <li><strong>Primer Curso</strong>: Completa tu primer curso.</li>
  <li><strong>Quiz Master</strong>: Aprueba 10 quizzes seguidos.</li>
  <li><strong>Racha de Fuego</strong>: Estudia 5 días consecutivos.</li>
  <li><strong>Explorador</strong>: Inscríbete en 5 cursos diferentes.</li>
  <li><strong>Perfeccionista</strong>: Obtén 100% en un quiz.</li>
</ul>

<h3>¿Dónde ver tus logros?</h3>
<p>En tu <strong>panel de perfil</strong> verás:</p>
<ul>
  <li>Tus badges desbloqueados.</li>
  <li>Tu progreso hacia el siguiente logro.</li>
  <li>Tu posición en el <strong>leaderboard</strong> (tabla de clasificación).</li>
</ul>

<blockquote><p>💡 Los logros son opcionales — no afectan tu progreso en los cursos.</p></blockquote>`, 1),
        ]),

        lsn('Estrategias para maximizar tu XP', 'Tips para subir de nivel más rápido.', [
          blk('text',
            `<h2>🚀 Tips para Ganar Más XP</h2>

<h3>1. Completa módulos completos</h3>
<p>Terminar un módulo entero da bonus XP además del XP de lecciones individuales.</p>

<h3>2. Acepta los desafíos</h3>
<p>Los bloques de tipo <strong>Desafío</strong> dan el doble de XP que un bloque normal.</p>

<h3>3. Perfecciona tus quizzes</h3>
<p>Obtener 100% en un quiz no solo da más XP — también desbloquea logros especiales.</p>

<h3>4. Mantén rachas</h3>
<p>Estudiar días consecutivos activa multiplicadores de XP.</p>

<h3>5. Explora diferentes cursos</h3>
<p>Inscribirte y avanzar en múltiples cursos desbloquea el logro "Explorador".</p>

<hr />

<h2>📊 Tu Panel de Progreso</h2>
<p>En tu Dashboard verás:</p>
<ul>
  <li><strong>XP total</strong> acumulado.</li>
  <li><strong>Nivel actual</strong> y progreso al siguiente.</li>
  <li><strong>Cursos activos</strong> y su porcentaje de completación.</li>
  <li><strong>Logros recientes</strong> desbloqueados.</li>
</ul>`, 0),

          blk('challenge',
            `<h2>🏆 Desafío Final: Reflexión de XP</h2>
<p>Calcula cuánto XP puedes ganar si completas esta guía al 100%:</p>
<ol>
  <li>Cuenta los módulos de este curso</li>
  <li>Estima el XP por lección</li>
  <li>Suma el XP de los quizzes</li>
</ol>
<p><strong>Respuesta aproximada</strong>: ~500 XP — ¡suficiente para subir varios niveles!</p>
<blockquote><p>Completa este desafío para ganar <strong>20 XP</strong>.</p></blockquote>`, 1),
        ],
          qz('Quiz: Gamificación', '¿Dominas el sistema de XP?', [
            q('multiple-choice', '¿Cuántos XP ganas al completar un bloque de tipo Desafío?',
              ['5 XP', '10 XP', '15 XP', '20 XP'],
              3, '¡Correcto! Los desafíos dan 20 XP.', 'Los desafíos dan el doble de un bloque normal: 20 XP.'),
            q('ordering', 'Ordena los niveles de menor a mayor:',
              ['Novato', 'Aprendiz', 'Especialista', 'Experto', 'Maestro'],
              [0, 1, 2, 3, 4], '¡Perfecto orden!', 'El orden es: Novato → Aprendiz → Especialista → Experto → Maestro.'),
            q('true-false', 'Los logros (achievements) son obligatorios para completar un curso.',
              ['Verdadero', 'Falso'],
              1, '¡Correcto! Los logros son opcionales y no afectan la completación.', 'Los logros son extras opcionales — no bloquean tu progreso.'),
            q('fill-blank', '¿Cómo se llaman los puntos que ganas al completar lecciones y quizzes?',
              [], 'XP', '¡Exacto! XP significa Puntos de Experiencia.', 'La respuesta es XP (puntos de experiencia).'),
          ])
        ),
      ]),

      // ── Módulo 6: Accesibilidad ──
      mod('Accesibilidad y Tu Perfil', 'Personaliza tu experiencia de aprendizaje', 6, [
        lsn('Funciones de accesibilidad', 'Conoce las herramientas que hacen AccessLearn inclusivo.', [
          blk('text',
            `<h2>♿ Accesibilidad en AccessLearn</h2>
<p>AccessLearn está diseñado para que <strong>todas las personas</strong> puedan aprender, independientemente de sus capacidades.</p>

<h3>👁️ Discapacidad Visual</h3>
<ul>
  <li><strong>Alto contraste</strong>: Modo de colores con mayor contraste.</li>
  <li><strong>Tamaño de fuente</strong>: Ajusta el tamaño del texto.</li>
  <li><strong>Lector de pantalla</strong>: Compatible con NVDA, JAWS, VoiceOver.</li>
  <li><strong>Alt text</strong>: Todas las imágenes tienen descripciones alternativas.</li>
</ul>

<h3>👂 Discapacidad Auditiva</h3>
<ul>
  <li><strong>Subtítulos</strong>: Videos con subtítulos disponibles.</li>
  <li><strong>Transcripciones</strong>: Contenido de audio en texto.</li>
  <li><strong>Alertas visuales</strong>: Notificaciones con señales visuales, no solo sonoras.</li>
</ul>

<h3>🖐️ Discapacidad Motora</h3>
<ul>
  <li><strong>Navegación por teclado</strong>: Toda la plataforma es navegable con Tab y Enter.</li>
  <li><strong>Áreas de clic amplias</strong>: Botones grandes y fáciles de alcanzar.</li>
</ul>

<h3>🧠 Discapacidad Cognitiva</h3>
<ul>
  <li><strong>Lenguaje claro</strong>: Instrucciones simples y directas.</li>
  <li><strong>Indicadores de progreso</strong>: Siempre sabes dónde estás.</li>
  <li><strong>Sin límites de tiempo</strong>: Puedes ir a tu propio ritmo.</li>
</ul>`, 0),

          blk('text',
            `<h2>🎨 Personaliza tu Perfil de Accesibilidad</h2>
<p>En <strong>Configuración → Accesibilidad</strong> puedes activar:</p>
<ul>
  <li>✅ Modo de alto contraste</li>
  <li>✅ Tamaño de fuente grande</li>
  <li>✅ Reducción de animaciones</li>
  <li>✅ Navegación simplificada</li>
  <li>✅ Dictado por voz</li>
</ul>

<h3>Temas</h3>
<p>Tu administrador puede personalizar los colores y temas de la plataforma. Si necesitas un ajuste especial, contacta a tu equipo de soporte.</p>

<blockquote><p>💡 <strong>Tip</strong>: Estas configuraciones se guardan en tu perfil y se aplican automáticamente cada vez que inicias sesión.</p></blockquote>`, 1),
        ],
          qz('Quiz Final: Tu Guía Completa', 'Evaluación final de todo lo aprendido.', [
            q('multiple-choice', '¿Qué función de accesibilidad ayuda a personas con discapacidad visual?',
              ['Subtítulos', 'Alto contraste y lector de pantalla', 'Navegación por teclado', 'Límites de tiempo'],
              1, '¡Correcto! Alto contraste y lectores de pantalla son herramientas para discapacidad visual.', 'Las funciones para discapacidad visual incluyen alto contraste, tamaño de fuente y lectores de pantalla.'),
            q('multiple-select', '¿Cuáles puedes personalizar en tu perfil de accesibilidad? (Selecciona todas)',
              ['Alto contraste', 'Tamaño de fuente', 'Idioma del curso', 'Reducción de animaciones'],
              [0, 1, 3], '¡Correcto! Puedes personalizar contraste, fuente y animaciones.', 'El idioma del curso no está en perfil de accesibilidad. Las opciones correctas son contraste, fuente y animaciones.'),
            q('true-false', 'AccessLearn es compatible con lectores de pantalla como NVDA y VoiceOver.',
              ['Verdadero', 'Falso'],
              0, '¡Correcto! La plataforma es totalmente compatible con lectores de pantalla.', 'Sí, AccessLearn es compatible con NVDA, JAWS y VoiceOver.'),
            q('multiple-choice', '¿Qué ocurre con tus configuraciones de accesibilidad cuando cierras sesión?',
              ['Se pierden', 'Se guardan en tu perfil automáticamente', 'Debes exportarlas', 'Se resetean cada semana'],
              1, '¡Correcto! Las configuraciones se guardan en tu perfil.', 'Las configuraciones se guardan automáticamente en tu perfil y persisten entre sesiones.'),
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
    description: 'Aprende a crear, editar y publicar cursos en AccessLearn. Desde la estructura hasta la IA generativa, domina todas las herramientas del editor de cursos.',
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
      // ── Módulo 1 ──
      mod('Introducción al Editor de Cursos', 'Tu herramienta para crear experiencias de aprendizaje', 1, [
        lsn('Bienvenido, Creador de Cursos', 'Visión general del proceso de creación.', [
          blk('welcome',
            `<h1>🛠️ ¡Bienvenido al Estudio de Creación!</h1>
<p>Como creador de cursos, tienes el poder de transformar conocimiento en <strong>experiencias interactivas y accesibles</strong>.</p>
<p>En esta guía aprenderás:</p>
<ul>
  <li>Cómo crear un curso desde cero</li>
  <li>Estructurar módulos y lecciones</li>
  <li>Usar los 8 tipos de bloques de contenido</li>
  <li>Crear quizzes con 6 tipos de preguntas</li>
  <li>Usar la <strong>IA</strong> para generar contenido</li>
  <li>Enviar a revisión y publicar</li>
</ul>
<blockquote><p>🎯 Al final de este curso, serás capaz de crear y publicar tu propio curso en AccessLearn.</p></blockquote>`, 0),

          blk('text',
            `<h2>🔄 El Flujo de Creación</h2>
<p>Crear un curso en AccessLearn sigue <strong>5 pasos</strong> usando el editor moderno:</p>

<h3>Paso 1: 📋 Detalles del Curso</h3>
<p>Título, descripción y categoría. Imagen de portada, dificultad y modo de inscripción.</p>

<h3>Paso 2: 🏗️ Estructura</h3>
<p>Crear módulos. Agregar lecciones dentro de cada módulo. Organizar con drag &amp; drop.</p>

<h3>Paso 3: ✏️ Contenido</h3>
<p>Agregar bloques de contenido a cada lección. Usar la IA para generar contenido. Subir documentos para extraer contenido.</p>

<h3>Paso 4: ❓ Quizzes</h3>
<p>Crear evaluaciones con diferentes tipos de preguntas. Usar IA para generar preguntas automáticamente.</p>

<h3>Paso 5: 🚀 Revisión y Publicación</h3>
<p>Vista previa del curso. Enviar a revisión. Publicar.</p>`, 1),
        ]),
      ]),

      // ── Módulo 2 ──
      mod('Configurar tu Curso', 'Paso 1 y 2: Detalles y Estructura', 2, [
        lsn('Paso 1: Detalles del Curso', 'Configura la información básica de tu curso.', [
          blk('text',
            `<h2>📋 Configurando los Detalles</h2>
<p>Al crear un nuevo curso, lo primero es establecer su identidad:</p>

<h3>Campos obligatorios:</h3>
<ul>
  <li><strong>Título</strong>: Nombre claro y descriptivo (máx. 100 caracteres).</li>
  <li><strong>Descripción</strong>: Resumen de lo que aprenderán los estudiantes.</li>
  <li><strong>Categoría</strong>: Clasifica tu curso (Tutorial, Tecnología, Cumplimiento, etc.).</li>
</ul>

<h3>Campos opcionales (recomendados):</h3>
<ul>
  <li><strong>Imagen de portada</strong>: Una imagen atractiva que represente el curso.</li>
  <li><strong>Dificultad</strong>: Novato, Especialista o Maestro.</li>
  <li><strong>Tiempo estimado</strong>: Horas que tomará completarlo.</li>
  <li><strong>Modo de inscripción</strong>: Abierta, Restringida o Solo Admin.</li>
</ul>

<h3>Configuración de completación:</h3>
<ul>
  <li><strong>Modo de completación</strong>: Solo módulos, Módulos y quizzes, Modo examen, etc.</li>
  <li><strong>Requisito de quizzes</strong>: Si son obligatorios u opcionales.</li>
  <li><strong>Puntuación mínima</strong>: Porcentaje para aprobar.</li>
  <li><strong>Reintentos</strong>: Si se permiten y cuántos.</li>
  <li><strong>Certificado</strong>: Si el curso otorga certificado al completarse.</li>
</ul>`, 0),

          blk('text',
            `<h2>💡 Mejores Prácticas para Detalles</h2>

<h3>Título</h3>
<p>✅ <strong>"Fundamentos de Seguridad Informática"</strong> — Claro y específico.</p>
<p>❌ <strong>"Seguridad"</strong> — Demasiado genérico.</p>

<h3>Descripción</h3>
<p>✅ <em>"En este curso aprenderás los principios básicos de seguridad informática, incluyendo contraseñas seguras, phishing y protección de datos."</em></p>
<p>❌ <em>"Curso de seguridad."</em></p>

<h3>Dificultad</h3>
<table>
  <thead><tr><th>Nivel</th><th>Audiencia</th><th>Contenido</th></tr></thead>
  <tbody>
    <tr><td>🌱 Novato</td><td>Sin experiencia previa</td><td>Conceptos básicos</td></tr>
    <tr><td>⭐ Especialista</td><td>Alguna experiencia</td><td>Temas intermedios</td></tr>
    <tr><td>👑 Maestro</td><td>Experiencia avanzada</td><td>Temas complejos</td></tr>
  </tbody>
</table>

<blockquote><p>🎯 <strong>Tip</strong>: Un buen título y descripción aumentan las inscripciones en un 40%.</p></blockquote>`, 1),
        ]),

        lsn('Paso 2: Estructura del Curso', 'Organiza módulos y lecciones.', [
          blk('text',
            `<h2>🏗️ Construyendo la Estructura</h2>
<p>La pestaña de <strong>Estructura</strong> te permite diseñar el esqueleto de tu curso.</p>

<h3>Crear un Módulo</h3>
<ol>
  <li>Haz clic en <strong>"Agregar Módulo"</strong>.</li>
  <li>Escribe el <strong>título</strong> del módulo.</li>
  <li>Agrega una <strong>descripción</strong> breve.</li>
</ol>

<h3>Crear Lecciones dentro del Módulo</h3>
<ol>
  <li>Dentro del módulo, clic en <strong>"Agregar Lección"</strong>.</li>
  <li>Escribe título y descripción de la lección.</li>
  <li>Define el <strong>XP</strong> y <strong>tiempo estimado</strong>.</li>
</ol>

<h3>Reorganizar con Drag &amp; Drop</h3>
<ul>
  <li><strong>Arrastra módulos</strong> para cambiar su orden.</li>
  <li><strong>Arrastra lecciones</strong> dentro de un módulo o entre módulos.</li>
  <li>El icono ≡ es el handle de arrastre.</li>
</ul>`, 0),

          blk('text',
            `<h2>📐 Estructura Recomendada</h2>

<h3>Regla del 5-3-7</h3>
<ul>
  <li><strong>5 módulos</strong> máximo para mantener el curso manejable.</li>
  <li><strong>3 lecciones</strong> por módulo en promedio.</li>
  <li><strong>7 bloques</strong> máximo por lección para no abrumar.</li>
</ul>

<h3>Estructura tipo:</h3>
<pre><code>📘 Mi Curso
├── 📁 Módulo 1: Introducción (1-2 lecciones)
├── 📁 Módulo 2: Tema Principal A (2-3 lecciones)
├── 📁 Módulo 3: Tema Principal B (2-3 lecciones)
├── 📁 Módulo 4: Aplicación Práctica (2 lecciones)
└── 📁 Módulo 5: Evaluación Final (1 lección + quiz)</code></pre>

<h3>Tips de estructura:</h3>
<ul>
  <li>Empieza siempre con un módulo de <strong>bienvenida/introducción</strong>.</li>
  <li>Termina con un módulo de <strong>repaso y evaluación</strong>.</li>
  <li>Cada módulo debe tener un <strong>objetivo claro</strong>.</li>
  <li>Nombra los módulos de forma <strong>descriptiva</strong>, no genérica.</li>
</ul>`, 1),
        ],
          qz('Quiz: Configuración del Curso', '¿Sabes configurar un curso?', [
            q('multiple-select', '¿Cuáles son campos obligatorios al crear un curso? (Selecciona todos)',
              ['Título', 'Imagen de portada', 'Descripción', 'Categoría', 'Tiempo estimado'],
              [0, 2, 3], '¡Correcto! Título, descripción y categoría son obligatorios.', 'Los campos obligatorios son: título, descripción y categoría.'),
            q('multiple-choice', '¿Cuántos módulos recomienda la "Regla del 5-3-7"?',
              ['3', '5', '7', '10'],
              1, '¡Correcto! La regla sugiere máximo 5 módulos.', 'La Regla del 5-3-7: 5 módulos, 3 lecciones por módulo, 7 bloques por lección.'),
            q('ordering', 'Ordena los 5 pasos del editor de cursos:',
              ['Detalles', 'Estructura', 'Contenido', 'Quizzes', 'Revisión y Publicación'],
              [0, 1, 2, 3, 4], '¡Perfecto orden!', 'El orden es: Detalles → Estructura → Contenido → Quizzes → Revisión y Publicación.'),
          ])
        ),
      ]),

      // ── Módulo 3 ──
      mod('Creando Contenido', 'Paso 3: Los 8 tipos de bloques', 3, [
        lsn('Tipos de bloques de contenido', 'Conoce todas las herramientas para crear lecciones ricas.', [
          blk('text',
            `<h2>✏️ Los 8 Bloques de Contenido</h2>
<p>Cada lección se compone de <strong>bloques</strong>. Aquí está cada tipo:</p>

<h3>👋 Bienvenida</h3>
<p>Mensaje introductorio con un personaje guía. Ideal para el primer bloque de un módulo.</p>

<h3>📝 Texto</h3>
<p>Contenido con formato enriquecido: negritas, listas, tablas, código, citas.</p>

<h3>🖼️ Imagen</h3>
<p>Fotos, diagramas o infografías. <strong>Siempre incluye texto alternativo</strong> para accesibilidad.</p>

<h3>🎬 Video</h3>
<p>Embed de YouTube, Vimeo, TikTok o video subido. Agrega subtítulos cuando sea posible.</p>

<h3>🎧 Audio</h3>
<p>Podcasts, explicaciones narradas o archivos de audio. Acompaña con transcripción.</p>

<h3>💻 Código</h3>
<p>Fragmentos de código con resaltado de sintaxis. Ideal para cursos técnicos.</p>

<h3>🏆 Desafío</h3>
<p>Actividad interactiva que otorga <strong>XP doble</strong> (20 XP). Pide al estudiante realizar una acción.</p>

<h3>📎 Archivo</h3>
<p>Documentos descargables (PDF, Word, Excel, etc.).</p>`, 0),

          blk('text',
            `<h2>🎯 Cuándo Usar Cada Bloque</h2>
<table>
  <thead><tr><th>Situación</th><th>Bloque recomendado</th></tr></thead>
  <tbody>
    <tr><td>Iniciar un módulo</td><td>👋 Bienvenida</td></tr>
    <tr><td>Explicar un concepto</td><td>📝 Texto</td></tr>
    <tr><td>Mostrar un proceso visual</td><td>🖼️ Imagen</td></tr>
    <tr><td>Demostración paso a paso</td><td>🎬 Video</td></tr>
    <tr><td>Complementar con narración</td><td>🎧 Audio</td></tr>
    <tr><td>Ejemplo técnico</td><td>💻 Código</td></tr>
    <tr><td>Actividad práctica</td><td>🏆 Desafío</td></tr>
    <tr><td>Material de referencia</td><td>📎 Archivo</td></tr>
  </tbody>
</table>

<h3>Combinación ideal para una lección:</h3>
<ol>
  <li><strong>Bienvenida</strong> o <strong>Texto</strong> introductorio</li>
  <li><strong>Texto/Video/Imagen</strong> para el contenido principal</li>
  <li><strong>Desafío</strong> para practicar</li>
</ol>

<blockquote><p>💡 <strong>Tip</strong>: Varía los tipos de bloques para mantener el interés del estudiante.</p></blockquote>`, 1),
        ]),

        lsn('El editor de texto enriquecido', 'Domina el editor visual de contenido.', [
          blk('text',
            `<h2>📝 Editor de Texto Enriquecido</h2>
<p>El bloque de <strong>Texto</strong> usa un editor visual (TipTap) que genera HTML. No necesitas saber programar — el editor tiene una barra de herramientas con todas las opciones.</p>

<h3>Barra de herramientas:</h3>
<ul>
  <li><strong>B</strong> — Negrita</li>
  <li><strong><em>I</em></strong> — Itálica</li>
  <li><strong>H1, H2, H3</strong> — Títulos y subtítulos</li>
  <li><strong>Lista</strong> — Con viñetas o numerada</li>
  <li><strong>Tabla</strong> — Para datos estructurados</li>
  <li><strong>Cita</strong> — Para notas destacadas</li>
  <li><strong>Código</strong> — Para fragmentos técnicos</li>
</ul>

<h3>Accesibilidad del texto:</h3>
<ul>
  <li>Usa <strong>títulos jerárquicos</strong> (H1 → H2 → H3).</li>
  <li>Escribe <strong>texto descriptivo</strong> en enlaces (no "clic aquí").</li>
  <li>Mantén párrafos <strong>cortos</strong> (3-5 líneas máximo).</li>
</ul>

<blockquote><p>💡 El editor genera automáticamente HTML limpio y accesible.</p></blockquote>`, 0),
        ]),

        lsn('IA para generar contenido', 'Usa inteligencia artificial para crear lecciones más rápido.', [
          blk('text',
            `<h2>🤖 Generación de Contenido con IA</h2>
<p>AccessLearn incluye herramientas de <strong>IA generativa</strong> integradas en el editor.</p>

<h3>Función 1: Generar desde Tema</h3>
<ol>
  <li>En el paso de <strong>Contenido</strong>, haz clic en el botón <strong>"IA"</strong> (morado).</li>
  <li>Selecciona la pestaña <strong>"Generar desde Tema"</strong>.</li>
  <li>Escribe un <strong>tema o prompt</strong>. Ejemplo: <em>"Introduce los principios de seguridad informática para principiantes"</em>.</li>
  <li>Selecciona el <strong>número de bloques</strong> a generar (3-10).</li>
  <li>Haz clic en <strong>"Generar"</strong> — la IA creará bloques de contenido.</li>
  <li><strong>Previsualiza</strong> el resultado y haz clic en <strong>"Insertar Bloques"</strong>.</li>
</ol>

<h3>Función 2: Subir Documento</h3>
<ol>
  <li>En la pestaña <strong>"Subir Documento"</strong>, carga un archivo (PDF, Word, TXT).</li>
  <li>La IA <strong>extraerá</strong> el contenido del documento.</li>
  <li>Generará un <strong>resumen</strong>, <strong>temas clave</strong> y <strong>bloques de contenido</strong>.</li>
  <li>Previsualiza y selecciona qué insertar.</li>
</ol>

<blockquote><p>⚠️ <strong>Importante</strong>: Siempre revisa y edita el contenido generado por IA.</p></blockquote>`, 0),

          blk('challenge',
            `<h2>🏆 Desafío: Genera contenido con IA</h2>
<p>Practica usando la IA:</p>
<ol>
  <li>Crea un nuevo curso de prueba.</li>
  <li>Agrega un módulo y una lección.</li>
  <li>Usa el botón <strong>IA</strong> para generar contenido sobre un tema que domines.</li>
  <li>Revisa, edita y guarda.</li>
</ol>
<blockquote><p>Ganarás <strong>20 XP</strong> por completar este desafío.</p></blockquote>`, 1),
        ]),
      ]),

      // ── Módulo 4 ──
      mod('Creando Quizzes y Evaluaciones', 'Paso 4: Diseña evaluaciones efectivas', 4, [
        lsn('Los 6 tipos de preguntas', 'Crea evaluaciones variadas y efectivas.', [
          blk('text',
            `<h2>❓ Diseñando Quizzes</h2>
<p>El paso 4 del editor te permite crear <strong>quizzes</strong> con 6 tipos de preguntas:</p>

<h3>1. 🔘 Opción Múltiple</h3>
<p>Una sola respuesta correcta. Ideal para conceptos factuales.</p>
<p><strong>Tip</strong>: Incluye 4 opciones, con distractores plausibles.</p>

<h3>2. ☑️ Selección Múltiple</h3>
<p>Varias respuestas correctas. Ideal para clasificación y categorización.</p>
<p><strong>Tip</strong>: Indica cuántas respuestas seleccionar.</p>

<h3>3. ✅❌ Verdadero o Falso</h3>
<p>Afirmación a validar. Ideal para verificar comprensión rápida.</p>
<p><strong>Tip</strong>: Evita dobles negaciones.</p>

<h3>4. ✏️ Completar Espacio</h3>
<p>El estudiante escribe la respuesta. Ideal para vocabulario y términos clave.</p>
<p><strong>Tip</strong>: Acepta variaciones ortográficas.</p>

<h3>5. 🔢 Ordenamiento</h3>
<p>Arrastrar elementos al orden correcto. Ideal para secuencias y procesos.</p>
<p><strong>Tip</strong>: 4-6 ítems máximo.</p>

<h3>6. 🎭 Escenario Interactivo</h3>
<p>Historia con decisiones y caminos múltiples. Ideal para aplicación práctica y pensamiento crítico.</p>
<p><strong>Tip</strong>: Crea 3-5 pasos con consecuencias claras.</p>`, 0),
        ]),

        lsn('IA para generar quizzes', 'Genera preguntas automáticamente con IA.', [
          blk('text',
            `<h2>🤖 Generación de Quizzes con IA</h2>
<p>No tienes que crear todas las preguntas manualmente.</p>

<h3>Cómo usar la IA:</h3>
<ol>
  <li>En el paso <strong>Quizzes</strong>, selecciona un quiz existente o crea uno nuevo.</li>
  <li>Haz clic en <strong>"Generar con IA"</strong> (botón con icono de estrella ✨).</li>
  <li>La IA analizará el <strong>contenido de tu curso</strong> y generará <strong>5 preguntas</strong> relevantes.</li>
  <li>Las preguntas se insertan automáticamente en tu quiz.</li>
  <li><strong>Revisa y ajusta</strong> cada pregunta según necesites.</li>
</ol>

<h3>La IA genera:</h3>
<ul>
  <li>Mezcla de tipos de preguntas (opción múltiple, verdadero/falso, etc.).</li>
  <li>Retroalimentación positiva y correctiva.</li>
  <li>Opciones de respuesta plausibles.</li>
</ul>

<h3>Mejores prácticas:</h3>
<ul>
  <li>✅ Revisa que las respuestas correctas sean precisas.</li>
  <li>✅ Ajusta la retroalimentación para que sea específica.</li>
  <li>✅ Agrega o quita preguntas según la longitud del quiz.</li>
  <li>❌ No confíes ciegamente en la IA — siempre verifica.</li>
</ul>`, 0),

          blk('text',
            `<h2>⚙️ Configuración del Quiz</h2>
<p>Cada quiz tiene estas opciones:</p>
<table>
  <thead><tr><th>Opción</th><th>Descripción</th><th>Recomendación</th></tr></thead>
  <tbody>
    <tr><td><strong>Puntuación mínima</strong></td><td>% para aprobar</td><td>60-70%</td></tr>
    <tr><td><strong>Intentos máximos</strong></td><td>Cuántas veces puede reintentar</td><td>3-5</td></tr>
    <tr><td><strong>Tiempo límite</strong></td><td>Tiempo para completar el quiz</td><td>Opcional</td></tr>
    <tr><td><strong>Modo examen</strong></td><td>Quiz formal con restricciones</td><td>Para evaluaciones importantes</td></tr>
    <tr><td><strong>XP por pregunta</strong></td><td>Puntos por respuesta correcta</td><td>10-20 XP</td></tr>
  </tbody>
</table>

<blockquote><p>💡 Para cursos de onboarding, mantén los quizzes amigables: puntuación baja, reintentos ilimitados.</p></blockquote>`, 1),
        ],
          qz('Quiz: Creación de Quizzes', '¿Dominas la creación de evaluaciones?', [
            q('multiple-choice', '¿Cuántas preguntas genera automáticamente la IA?',
              ['3', '5', '10', '20'],
              1, '¡Correcto! La IA genera 5 preguntas por defecto.', 'La IA genera 5 preguntas que luego puedes ajustar.'),
            q('multiple-select', '¿Cuáles son tipos de preguntas válidos? (Selecciona todos)',
              ['Opción múltiple', 'Ensayo libre', 'Verdadero/Falso', 'Escenario interactivo', 'Dibujo'],
              [0, 2, 3], '¡Correcto! Opción múltiple, Verdadero/Falso y Escenario interactivo son tipos válidos.', 'No hay ensayo libre ni dibujo. Los 6 tipos son: opción múltiple, selección múltiple, V/F, completar, ordenamiento y escenario.'),
            q('true-false', 'Es recomendable confiar ciegamente en las preguntas generadas por IA sin revisarlas.',
              ['Verdadero', 'Falso'],
              1, '¡Correcto! Siempre debes revisar y ajustar el contenido generado por IA.', 'Nunca confíes ciegamente en la IA — siempre verifica las respuestas y retroalimentación.'),
          ])
        ),
      ]),

      // ── Módulo 5 ──
      mod('Revisión y Publicación', 'Paso 5: Publica tu curso al mundo', 5, [
        lsn('El flujo de publicación', 'Entiende el proceso de revisión y aprobación.', [
          blk('text',
            `<h2>🚀 De Borrador a Publicado</h2>
<p>Los cursos pasan por un <strong>flujo de estados</strong>:</p>
<pre><code>📝 Borrador → 📤 Enviado a Revisión → ✅ Publicado
                      ↓
               🔄 Cambios Solicitados → 📝 Borrador (corregido)</code></pre>

<h3>Los 4 Estados:</h3>

<h4>1. 📝 Borrador (Draft)</h4>
<p>Estado inicial. Solo tú puedes ver el curso. Puedes editar libremente.</p>

<h4>2. 📤 En Revisión (Pending Review)</h4>
<p>Has enviado el curso para ser revisado. Un administrador revisará el contenido, la estructura y los quizzes. No puedes editar mientras está en revisión.</p>

<h4>3. ✅ Publicado (Published)</h4>
<p>El curso está disponible para los estudiantes. Los estudiantes pueden inscribirse y comenzar. Puedes hacer ediciones menores sin despublicar.</p>

<h4>4. 🔄 Cambios Solicitados</h4>
<p>El revisor pidió modificaciones. Recibirás comentarios específicos. Corrige y reenvía.</p>`, 0),

          blk('text',
            `<h2>📋 Checklist antes de Publicar</h2>
<p>Antes de enviar a revisión, verifica:</p>

<h3>Contenido</h3>
<ul>
  <li>☐ Cada módulo tiene al menos 1 lección.</li>
  <li>☐ Cada lección tiene al menos 1 bloque de contenido.</li>
  <li>☐ No hay lecciones vacías.</li>
  <li>☐ El contenido es correcto y actualizado.</li>
</ul>

<h3>Accesibilidad</h3>
<ul>
  <li>☐ Las imágenes tienen texto alternativo.</li>
  <li>☐ Los videos tienen subtítulos o transcripción.</li>
  <li>☐ El texto es claro y legible.</li>
</ul>

<h3>Quizzes</h3>
<ul>
  <li>☐ Al menos 1 quiz por módulo principal.</li>
  <li>☐ Las respuestas correctas están bien configuradas.</li>
  <li>☐ La retroalimentación es útil y específica.</li>
</ul>

<h3>Configuración</h3>
<ul>
  <li>☐ Título y descripción son claros.</li>
  <li>☐ La dificultad está bien asignada.</li>
  <li>☐ Los requisitos de completación son razonables.</li>
</ul>

<h3>Vista Previa</h3>
<ul>
  <li>☐ El <strong>Resumen IA</strong> del curso tiene sentido.</li>
  <li>☐ Has recorrido el curso como estudiante.</li>
</ul>`, 1),
        ],
          qz('Quiz Final: Creador de Cursos', 'Evaluación final sobre creación de cursos.', [
            q('ordering', 'Ordena el flujo de estados de un curso:',
              ['Borrador', 'En Revisión', 'Publicado'],
              [0, 1, 2], '¡Perfecto! Borrador → En Revisión → Publicado.', 'El flujo es: Borrador → En Revisión → Publicado.'),
            q('multiple-choice', '¿Puedes editar un curso mientras está "En Revisión"?',
              ['Sí, siempre', 'No, debes esperar a que sea aprobado o devuelto', 'Solo si eres admin', 'Solo los fines de semana'],
              1, '¡Correcto! No se puede editar durante la revisión.', 'Mientras un curso está En Revisión, debes esperar la respuesta del revisor.'),
            q('multiple-select', '¿Qué elementos debes verificar antes de enviar a revisión? (Selecciona todos)',
              ['Que cada lección tenga contenido', 'Que las imágenes tengan alt text', 'Que los quizzes tengan respuestas correctas', 'Que el curso tenga logo animado'],
              [0, 1, 2], '¡Correcto! Contenido, accesibilidad y quizzes son esenciales.', 'No se requiere logo animado. Verifica: contenido, accesibilidad y quizzes.'),
            q('true-false', 'El resumen IA del curso se genera automáticamente en el paso de Revisión.',
              ['Verdadero', 'Falso'],
              0, '¡Correcto! El componente AICourseSummary genera un resumen automático.', 'Sí, en el paso 5 (Revisión) el resumen IA se genera automáticamente para cursos guardados.'),
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
    description: 'Curso avanzado para administradores de la plataforma. Aprende a gestionar usuarios, aprobar cursos, personalizar temas, analizar métricas y configurar tu organización.',
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
      // ── Módulo 1 ──
      mod('El Panel de Administración', 'Tu centro de mando', 1, [
        lsn('Bienvenido, Administrador', 'Visión general del panel de administración.', [
          blk('welcome',
            `<h1>👑 Bienvenido al Panel de Administración</h1>
<p>Como administrador, tienes acceso completo a las herramientas que controlan toda la plataforma.</p>
<p>Esta guía cubre:</p>
<ul>
  <li>Gestión de usuarios y roles</li>
  <li>Aprobación y revisión de cursos</li>
  <li>Personalización de temas y marca</li>
  <li>Dashboards de analytics</li>
  <li>Configuración organizacional</li>
</ul>
<blockquote><p>⚠️ <strong>Con gran poder viene gran responsabilidad</strong>. Las acciones de admin afectan a todos los usuarios de tu organización.</p></blockquote>`, 0),

          blk('text',
            `<h2>🏠 Vista General del Dashboard Admin</h2>
<p>Al acceder al <strong>Panel de Administración</strong>, verás:</p>

<h3>Tarjetas de Resumen</h3>
<ul>
  <li><strong>Total de usuarios</strong> activos en tu organización.</li>
  <li><strong>Cursos publicados</strong> vs. borradores.</li>
  <li><strong>Cursos pendientes de revisión</strong> que requieren tu atención.</li>
  <li><strong>XP total</strong> generado por la plataforma.</li>
</ul>

<h3>Navegación del Admin</h3>
<p>El menú lateral incluye:</p>
<table>
  <thead><tr><th>Sección</th><th>Descripción</th></tr></thead>
  <tbody>
    <tr><td>📊 Dashboard</td><td>Resumen general</td></tr>
    <tr><td>👥 Usuarios</td><td>Gestionar cuentas y roles</td></tr>
    <tr><td>📚 Cursos</td><td>Revisar, aprobar y gestionar</td></tr>
    <tr><td>🎨 Temas</td><td>Personalizar apariencia</td></tr>
    <tr><td>📈 Analytics</td><td>Métricas y reportes</td></tr>
    <tr><td>⚙️ Configuración</td><td>Ajustes organizacionales</td></tr>
    <tr><td>🔔 Alertas</td><td>Notificaciones del sistema</td></tr>
  </tbody>
</table>`, 1),
        ]),
      ]),

      // ── Módulo 2 ──
      mod('Gestión de Usuarios', 'Administra cuentas, roles y permisos', 2, [
        lsn('Roles y permisos', 'Entiende el sistema de roles de AccessLearn.', [
          blk('text',
            `<h2>👥 Sistema de Roles</h2>
<p>AccessLearn tiene <strong>4 roles</strong> con diferentes niveles de acceso:</p>

<h3>1. 👑 Super Admin</h3>
<p>Acceso total a toda la plataforma. Puede gestionar otros admins, configurar la organización y acceder a analytics completos.</p>

<h3>2. 🛡️ Admin</h3>
<p>Gestionar usuarios (crear, editar, desactivar). Aprobar/rechazar cursos. Ver analytics de su organización. Personalizar temas.</p>

<h3>3. ✏️ Creador de Contenido</h3>
<p>Crear y editar cursos. Enviar cursos a revisión. Ver analytics de sus cursos.</p>

<h3>4. 📖 Estudiante</h3>
<p>Inscribirse en cursos. Completar lecciones y quizzes. Ver su propio progreso y XP.</p>

<h3>Tabla de Permisos</h3>
<table>
  <thead><tr><th>Permiso</th><th>Super Admin</th><th>Admin</th><th>Creador</th><th>Estudiante</th></tr></thead>
  <tbody>
    <tr><td>Crear cursos</td><td>✅</td><td>✅</td><td>✅</td><td>❌</td></tr>
    <tr><td>Aprobar cursos</td><td>✅</td><td>✅</td><td>❌</td><td>❌</td></tr>
    <tr><td>Gestionar usuarios</td><td>✅</td><td>✅</td><td>❌</td><td>❌</td></tr>
    <tr><td>Ver analytics</td><td>✅</td><td>✅</td><td>Limitado</td><td>❌</td></tr>
    <tr><td>Personalizar temas</td><td>✅</td><td>✅</td><td>❌</td><td>❌</td></tr>
  </tbody>
</table>`, 0),
        ]),

        lsn('Crear y gestionar usuarios', 'Aprende a administrar cuentas de usuario.', [
          blk('text',
            `<h2>➕ Crear Nuevos Usuarios</h2>
<p>Desde <strong>Admin → Usuarios</strong>, puedes:</p>

<h3>Crear usuario individual:</h3>
<ol>
  <li>Clic en <strong>"Nuevo Usuario"</strong>.</li>
  <li>Completa: nombre, email, rol.</li>
  <li>La contraseña temporal se envía al email.</li>
  <li>El usuario deberá cambiarla en el primer inicio de sesión.</li>
</ol>

<h3>Campos del usuario:</h3>
<ul>
  <li><strong>Nombre completo</strong>: Nombre y apellido.</li>
  <li><strong>Email</strong>: Dirección de correo (debe ser única).</li>
  <li><strong>Rol</strong>: Estudiante, Creador, Admin o Super Admin.</li>
  <li><strong>Estado</strong>: Activo o Inactivo.</li>
</ul>

<h3>Acciones sobre usuarios existentes:</h3>
<ul>
  <li><strong>Editar</strong>: Cambiar nombre, email o rol.</li>
  <li><strong>Desactivar</strong>: Bloquear acceso temporalmente.</li>
  <li><strong>Reactivar</strong>: Restaurar acceso.</li>
  <li><strong>Resetear contraseña</strong>: Enviar enlace de restablecimiento.</li>
</ul>

<blockquote><p>⚠️ <strong>Cuidado</strong>: Desactivar un usuario no elimina su progreso — puede reactivarse después.</p></blockquote>`, 0),

          blk('text',
            `<h2>🔍 Filtrar y Buscar Usuarios</h2>
<p>La lista de usuarios incluye herramientas de búsqueda:</p>

<h3>Filtros disponibles:</h3>
<ul>
  <li><strong>Por rol</strong>: Mostrar solo admin, creadores o estudiantes.</li>
  <li><strong>Por estado</strong>: Activos, inactivos, todos.</li>
  <li><strong>Búsqueda</strong>: Por nombre o email.</li>
</ul>

<h3>Información visible:</h3>
<table>
  <thead><tr><th>Columna</th><th>Descripción</th></tr></thead>
  <tbody>
    <tr><td>Nombre</td><td>Nombre completo</td></tr>
    <tr><td>Email</td><td>Dirección de correo</td></tr>
    <tr><td>Rol</td><td>Badge con el rol asignado</td></tr>
    <tr><td>Estado</td><td>Activo 🟢 / Inactivo 🔴</td></tr>
    <tr><td>Último acceso</td><td>Fecha y hora</td></tr>
    <tr><td>XP</td><td>Puntos de experiencia acumulados</td></tr>
    <tr><td>Cursos</td><td>Número de cursos activos</td></tr>
  </tbody>
</table>

<blockquote><p>💡 <strong>Tip</strong>: Revisa regularmente los usuarios inactivos por más de 30 días.</p></blockquote>`, 1),
        ],
          qz('Quiz: Gestión de Usuarios', '¿Dominas la administración de usuarios?', [
            q('multiple-choice', '¿Cuántos roles hay en AccessLearn?',
              ['2', '3', '4', '5'],
              2, '¡Correcto! Hay 4 roles: Super Admin, Admin, Creador y Estudiante.', 'Hay 4 roles: Super Admin, Admin, Creador de Contenido y Estudiante.'),
            q('multiple-select', '¿Qué puede hacer un Admin? (Selecciona todos)',
              ['Gestionar usuarios', 'Aprobar cursos', 'Eliminar la organización', 'Personalizar temas'],
              [0, 1, 3], '¡Correcto! Un Admin puede gestionar usuarios, aprobar cursos y personalizar temas.', 'Un Admin NO puede eliminar la organización.'),
            q('true-false', 'Al desactivar un usuario, se elimina permanentemente todo su progreso.',
              ['Verdadero', 'Falso'],
              1, '¡Correcto! Desactivar no elimina el progreso — el usuario puede reactivarse.', 'Desactivar solo bloquea el acceso temporalmente. El progreso se conserva.'),
          ])
        ),
      ]),

      // ── Módulo 3 ──
      mod('Revisión y Aprobación de Cursos', 'Tu rol como revisor de contenido', 3, [
        lsn('El proceso de revisión', 'Cómo revisar y aprobar cursos efectivamente.', [
          blk('text',
            `<h2>📋 Revisión de Cursos</h2>
<p>Cuando un creador envía un curso a revisión, tú decides si se publica.</p>

<h3>¿Dónde ver cursos pendientes?</h3>
<ul>
  <li><strong>Dashboard Admin</strong> → Tarjeta "Pendientes de Revisión".</li>
  <li><strong>Admin → Cursos</strong> → Filtrar por estado "En Revisión".</li>
</ul>

<h3>Qué revisar:</h3>

<h4>1. Contenido</h4>
<ul>
  <li>¿Es preciso y actualizado?</li>
  <li>¿Está bien redactado y sin errores?</li>
  <li>¿Es apropiado para la audiencia?</li>
</ul>

<h4>2. Estructura</h4>
<ul>
  <li>¿La organización es lógica?</li>
  <li>¿Los módulos fluyen naturalmente?</li>
  <li>¿Las lecciones tienen longitud razonable?</li>
</ul>

<h4>3. Accesibilidad</h4>
<ul>
  <li>¿Las imágenes tienen alt text?</li>
  <li>¿Los videos tienen subtítulos?</li>
  <li>¿El texto es claro y legible?</li>
</ul>

<h4>4. Quizzes</h4>
<ul>
  <li>¿Las preguntas evalúan el contenido enseñado?</li>
  <li>¿Las respuestas correctas son precisas?</li>
  <li>¿La retroalimentación es útil?</li>
</ul>`, 0),

          blk('text',
            `<h2>✅ Acciones del Revisor</h2>
<p>Después de revisar un curso, puedes:</p>

<h3>Aprobar ✅</h3>
<p>El curso se publica inmediatamente. Los estudiantes pueden inscribirse. El creador recibe notificación.</p>

<h3>Solicitar Cambios 🔄</h3>
<p>El curso regresa al creador con comentarios. Debes escribir <strong>comentarios específicos</strong> indicando qué mejorar. El creador corregirá y reenviará.</p>

<h3>Rechazar ❌</h3>
<p>El curso se archiva. Usar solo en casos donde el contenido no es viable.</p>

<h3>Mejores prácticas como revisor:</h3>
<ul>
  <li>✅ Sé <strong>específico</strong> en tus comentarios.</li>
  <li>✅ Sugiere <strong>soluciones</strong>, no solo señales problemas.</li>
  <li>✅ Revisa la <strong>vista previa</strong> como estudiante.</li>
  <li>✅ Verifica los quizzes respondiendo las preguntas.</li>
  <li>❌ No rechaces por detalles menores — solicita cambios.</li>
</ul>`, 1),
        ],
          qz('Quiz: Revisión de Cursos', '¿Sabes revisar cursos efectivamente?', [
            q('ordering', '¿En qué orden debes revisar un curso?',
              ['Contenido y precisión', 'Estructura y organización', 'Accesibilidad', 'Quizzes y evaluaciones'],
              [0, 1, 2, 3], '¡Perfecto orden!', 'El orden recomendado: Contenido → Estructura → Accesibilidad → Quizzes.'),
            q('multiple-choice', '¿Qué acción es mejor para un curso con errores menores de redacción?',
              ['Rechazar', 'Solicitar Cambios con comentarios específicos', 'Aprobar sin comentarios', 'Ignorar'],
              1, '¡Correcto! Para errores menores, solicita cambios con comentarios específicos.', 'Los errores menores se corrigen solicitando cambios, no rechazando.'),
            q('true-false', 'Como revisor, debes verificar los quizzes respondiendo las preguntas tú mismo.',
              ['Verdadero', 'Falso'],
              0, '¡Correcto! Las mejores prácticas incluyen responder los quizzes personalmente.', 'Responder los quizzes te permite verificar la precisión.'),
          ])
        ),
      ]),

      // ── Módulo 4 ──
      mod('Personalización y Temas', 'Haz que la plataforma refleje tu marca', 4, [
        lsn('Configuración de temas', 'Personaliza los colores y la apariencia.', [
          blk('text',
            `<h2>🎨 Personalización Visual</h2>
<p>AccessLearn te permite adaptar la apariencia a tu marca corporativa.</p>

<h3>Elementos personalizables:</h3>

<h4>1. Colores</h4>
<ul>
  <li><strong>Color primario</strong>: Botones, enlaces y elementos destacados.</li>
  <li><strong>Color secundario</strong>: Acentos y elementos complementarios.</li>
  <li><strong>Fondo</strong>: Color de fondo general.</li>
  <li><strong>Texto</strong>: Color del texto principal.</li>
</ul>

<h4>2. Identidad</h4>
<ul>
  <li><strong>Logo</strong>: Sube el logo de tu organización.</li>
  <li><strong>Favicon</strong>: Icono que aparece en la pestaña del navegador.</li>
  <li><strong>Nombre de la organización</strong>: Se muestra en header y emails.</li>
</ul>

<h4>3. Modos</h4>
<ul>
  <li><strong>Modo claro</strong>: Fondo blanco, texto oscuro.</li>
  <li><strong>Modo oscuro</strong>: Fondo oscuro, texto claro.</li>
  <li><strong>Auto</strong>: Sigue las preferencias del sistema del usuario.</li>
</ul>

<h3>Cómo personalizar:</h3>
<ol>
  <li>Ve a <strong>Admin → Temas</strong>.</li>
  <li>Selecciona los colores con el selector de color.</li>
  <li>Sube tu logo y favicon.</li>
  <li>Haz clic en <strong>"Guardar"</strong>.</li>
  <li>Los cambios se aplican inmediatamente para todos los usuarios.</li>
</ol>

<blockquote><p>💡 <strong>Tip</strong>: Asegúrate de que tus colores tengan suficiente <strong>contraste</strong> para cumplir con estándares de accesibilidad (WCAG AA mínimo).</p></blockquote>`, 0),
        ]),

        lsn('Configuración organizacional', 'Ajustes generales de tu organización.', [
          blk('text',
            `<h2>⚙️ Configuración de la Organización</h2>
<p>En <strong>Admin → Configuración</strong> puedes ajustar:</p>

<h3>Datos generales</h3>
<ul>
  <li><strong>Nombre de la organización</strong>: Cómo se identifica tu organización.</li>
  <li><strong>Idioma predeterminado</strong>: Español, Inglés, etc.</li>
  <li><strong>Zona horaria</strong>: Para reportes y métricas.</li>
</ul>

<h3>Políticas de cursos</h3>
<ul>
  <li><strong>Auto-aprobación</strong>: Los cursos de ciertos roles se publican sin revisión.</li>
  <li><strong>Modo de inscripción predeterminado</strong>: Para nuevos cursos.</li>
  <li><strong>Requisitos de certificado</strong>: Configuración global.</li>
</ul>

<h3>Notificaciones</h3>
<ul>
  <li><strong>Email de bienvenida</strong>: Personaliza el mensaje para nuevos usuarios.</li>
  <li><strong>Recordatorios</strong>: Frecuencia de recordatorios para cursos incompletos.</li>
  <li><strong>Notificaciones de revisión</strong>: Quién recibe alertas de cursos pendientes.</li>
</ul>

<h3>Integraciones</h3>
<ul>
  <li><strong>Azure AD B2C</strong>: Para autenticación corporativa.</li>
  <li><strong>Application Insights</strong>: Para monitoreo de la plataforma.</li>
  <li><strong>Blob Storage</strong>: Para almacenamiento de archivos.</li>
</ul>`, 0),
        ],
          qz('Quiz: Personalización', '¿Conoces las opciones de configuración?', [
            q('multiple-select', '¿Qué elementos puedes personalizar en los temas? (Selecciona todos)',
              ['Colores primario y secundario', 'Logo de la organización', 'Tipo de base de datos', 'Modo claro/oscuro'],
              [0, 1, 3], '¡Correcto! Puedes personalizar colores, logo y modos.', 'No puedes cambiar el tipo de base de datos desde los temas.'),
            q('multiple-choice', '¿Qué estándar de contraste debe cumplirse al personalizar colores?',
              ['ISO 9001', 'WCAG AA', 'RGB Standard', 'No hay requisito'],
              1, '¡Correcto! WCAG AA es el estándar mínimo de accesibilidad.', 'WCAG AA es el estándar mínimo de contraste para accesibilidad web.'),
          ])
        ),
      ]),

      // ── Módulo 5 ──
      mod('Dashboards de Analytics', 'Toma decisiones basadas en datos', 5, [
        lsn('Métricas clave', 'Las métricas más importantes para monitorear.', [
          blk('text',
            `<h2>📊 Analytics en AccessLearn</h2>
<p>El panel de analytics te da visión completa del aprendizaje en tu organización.</p>

<h3>Métricas Principales</h3>

<h4>📈 Uso General</h4>
<ul>
  <li><strong>Usuarios activos</strong> (diario/semanal/mensual).</li>
  <li><strong>Sesiones promedio</strong>: Tiempo y frecuencia de uso.</li>
  <li><strong>Tasa de retención</strong>: % de usuarios que regresan.</li>
</ul>

<h4>📚 Cursos</h4>
<ul>
  <li><strong>Tasa de completación</strong>: % de inscripciones que terminan el curso.</li>
  <li><strong>Tiempo promedio</strong>: Cuánto tarda un estudiante en completar.</li>
  <li><strong>Cursos más populares</strong>: Por inscripciones y completaciones.</li>
  <li><strong>Cursos con baja completación</strong>: Posibles mejoras necesarias.</li>
</ul>

<h4>❓ Evaluaciones</h4>
<ul>
  <li><strong>Puntuación promedio</strong> por quiz.</li>
  <li><strong>Preguntas más falladas</strong>: Contenido que necesita refuerzo.</li>
  <li><strong>Tasa de reintentos</strong>: Quizzes que causan dificultad.</li>
</ul>

<h4>🎮 Gamificación</h4>
<ul>
  <li><strong>Distribución de niveles</strong>: Cuántos usuarios en cada nivel.</li>
  <li><strong>XP total generado</strong>: Nivel de engagement.</li>
  <li><strong>Logros más desbloqueados</strong>: Qué motiva a los usuarios.</li>
</ul>`, 0),
        ]),

        lsn('Insights con IA', 'Usa la IA para interpretar tus datos.', [
          blk('text',
            `<h2>🤖 AI Analytics Insights</h2>
<p>AccessLearn incluye un componente de <strong>IA</strong> que analiza automáticamente tus métricas.</p>

<h3>¿Qué hace?</h3>
<p>El <strong>AI Analytics Insights</strong> procesa tus datos y genera:</p>
<ul>
  <li><strong>Resumen ejecutivo</strong> de la salud de la plataforma.</li>
  <li><strong>Tendencias</strong> identificadas (positivas y negativas).</li>
  <li><strong>Recomendaciones</strong> específicas de acción.</li>
  <li><strong>Alertas</strong> sobre métricas preocupantes.</li>
</ul>

<h3>Cómo usarlo:</h3>
<ol>
  <li>Ve a <strong>Admin → Analytics</strong>.</li>
  <li>Busca la sección <strong>"Insights IA"</strong>.</li>
  <li>La IA generará observaciones basadas en datos reales.</li>
</ol>

<h3>Ejemplos de insights:</h3>
<ul>
  <li><em>"La tasa de completación bajó un 15% este mes. Se recomienda revisar los cursos con mayor abandono."</em></li>
  <li><em>"El quiz del Módulo 3 del curso X tiene una tasa de fallo del 80%. Considere simplificar las preguntas."</em></li>
  <li><em>"Los usuarios que completan el curso de inducción tienen 3x más probabilidad de continuar con otros cursos."</em></li>
</ul>

<blockquote><p>💡 <strong>Tip</strong>: Revisa los insights semanalmente para mantener la plataforma optimizada.</p></blockquote>`, 0),

          blk('text',
            `<h2>📋 Acciones Basadas en Datos</h2>

<h3>Si la completación es baja:</h3>
<ol>
  <li>Revisa la longitud de los cursos — ¿son demasiado largos?</li>
  <li>Verifica que los quizzes no sean excesivamente difíciles.</li>
  <li>Agrega más contenido interactivo (desafíos, videos).</li>
</ol>

<h3>Si el engagement está bajando:</h3>
<ol>
  <li>Envía recordatorios a usuarios inactivos.</li>
  <li>Introduce nuevos cursos o actualiza los existentes.</li>
  <li>Comunica los logros desbloqueados para motivar.</li>
</ol>

<h3>Si las puntuaciones de quizzes son bajas:</h3>
<ol>
  <li>Revisa si las preguntas son claras.</li>
  <li>Mejora el contenido que precede al quiz.</li>
  <li>Agrega más ejemplos y explicaciones.</li>
</ol>

<h3>Reportes periódicos:</h3>
<ul>
  <li><strong>Semanal</strong>: Usuarios activos, cursos completados.</li>
  <li><strong>Mensual</strong>: Tendencias, comparativa con mes anterior.</li>
  <li><strong>Trimestral</strong>: ROI del aprendizaje, certificaciones emitidas.</li>
</ul>`, 1),
        ],
          qz('Quiz Final: Administrador Certificado', 'Evaluación final para certificarte como administrador.', [
            q('multiple-choice', '¿Qué indica una tasa de completación baja en un curso?',
              ['El curso es muy popular', 'Puede necesitar mejoras en contenido o longitud', 'Los estudiantes son flojos', 'El servidor está lento'],
              1, '¡Correcto! Una baja completación suele indicar que el curso necesita mejoras.', 'Una tasa baja sugiere problemas con longitud, dificultad o calidad del contenido.'),
            q('multiple-select', '¿Qué genera el AI Analytics Insights? (Selecciona todos)',
              ['Resumen ejecutivo', 'Tendencias identificadas', 'Código de programación', 'Recomendaciones de acción'],
              [0, 1, 3], '¡Correcto! Genera resúmenes, tendencias y recomendaciones.', 'La IA genera resúmenes, tendencias y recomendaciones — no genera código.'),
            q('ordering', 'Ordena la frecuencia recomendada de revisión de reportes:',
              ['Semanal: usuarios activos', 'Mensual: tendencias', 'Trimestral: ROI'],
              [0, 1, 2], '¡Perfecto! De más frecuente a menos frecuente.', 'El orden es: Semanal → Mensual → Trimestral.'),
            q('fill-blank', '¿Qué estándar mínimo de contraste de colores se debe cumplir al personalizar temas?',
              [], 'WCAG AA', '¡Correcto! WCAG AA es el estándar mínimo.', 'El estándar es WCAG AA para asegurar accesibilidad.'),
            q('true-false', 'Los Admin Insights de IA deben revisarse al menos semanalmente.',
              ['Verdadero', 'Falso'],
              0, '¡Correcto! Se recomienda revisión semanal.', 'Las mejores prácticas recomiendan revisar los insights semanalmente.'),
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
    await updateCourse(c.id, { ...data, status: 'published', publishedAt: new Date().toISOString() });
    console.log(`  ✅ Contenido HTML actualizado (${data.modules.length} módulos)`);
  }

  console.log('\n🎉 ¡Los 3 cursos han sido actualizados con contenido HTML!');
}

main().catch(console.error);
