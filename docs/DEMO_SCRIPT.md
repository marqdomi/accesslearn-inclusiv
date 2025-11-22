# 🎬 Guión de Demostración - AccessLearn Inclusiv

**Duración Total:** ~25 minutos  
**Versión:** 1.0  
**Fecha:** 2025-01-28

---

## 📋 PREPARACIÓN PRE-DEMO (5 minutos antes)

### Checklist Pre-Demo
- [ ] Backend corriendo (`cd backend && npm run server`)
- [ ] Frontend corriendo (`cd frontend && npm run dev`)
- [ ] Datos demo cargados (`cd backend && npm run setup-demo-complete`)
- [ ] Navegador abierto en `http://localhost:5173` (local) o `https://app.kainet.mx` (producción)
- [ ] Credenciales listas (ver `docs/DEMO_GUIDE.md`)
- [ ] Pantalla compartida configurada
- [ ] Audio funcionando

### Materiales Necesarios
- ✅ Credenciales de acceso (ver `docs/DEMO_GUIDE.md`)
- ✅ Guía de demo (`docs/DEMO_GUIDE.md`)
- ✅ Esta guión (`docs/DEMO_SCRIPT.md`)

---

## 🎬 GUION DE DEMOSTRACIÓN

### INTRODUCCIÓN (2 minutos)

**Hola y Bienvenida**
> "Hola [Nombre del Cliente], gracias por estar aquí hoy. Estoy emocionado de mostrarles AccessLearn Inclusiv, nuestra plataforma de aprendizaje en línea diseñada especialmente para empresas e instituciones educativas."

**Presentación de la Plataforma**
> "AccessLearn es un sistema multi-tenant completo que permite crear, gestionar y monitorear programas de capacitación en línea. Incluye características avanzadas como gamificación, analytics, certificados automáticos, y mucho más."

**Agenda del Demo**
> "En los próximos 25 minutos, voy a mostrarles:
> 1. El dashboard y gestión de perfiles (2 minutos)
> 2. Cómo crear un curso completo (5 minutos)
> 3. La experiencia del estudiante (5 minutos)
> 4. Analytics y reportes (3 minutos)
> 5. Foros, notificaciones y engagement (2 minutos)
> 6. Y luego tendremos tiempo para preguntas (5 minutos)"

**Pregunta de Opening**
> "Antes de empezar, ¿hay algo específico que les gustaría ver o alguna funcionalidad que sea particularmente importante para ustedes?"

---

### PARTE 1: DASHBOARD Y PERFIL (3 minutos)

#### 1.1 Login y Dashboard (1 minuto)

**[Acción]** Acceder a `http://localhost:5173` o `https://app.kainet.mx`

**Script:**
> "Vamos a empezar accediendo a la plataforma. Primero selecciono el tenant, en este caso 'kainet', y luego inicio sesión como administrador."

**[Acción]** Login como Super Admin (`ana.lopez@kainet.mx` / `Demo123!`)

**Script:**
> "Aquí tenemos el dashboard principal. Como pueden ver, tenemos una vista completa de las métricas importantes:
> - Usuarios activos
> - Cursos publicados
> - Progreso general
> - Actividad reciente
> 
> Todo esto se actualiza en tiempo real y nos da una visión clara del estado de la plataforma."

**Puntos clave a destacar:**
- ✅ Interfaz moderna e intuitiva
- ✅ Métricas en tiempo real
- ✅ Navegación fácil

---

#### 1.2 Gestión de Perfiles (2 minutos)

**[Acción]** Click en "Perfil" en el header

**Script:**
> "Ahora voy a mostrarles la gestión de perfiles de usuario. Cada usuario puede ver y editar su información personal."

**[Acción]** Mostrar información personal

**Script:**
> "Aquí vemos la información del perfil: nombre, email, nivel actual, XP ganado, y badges obtenidos. También podemos ver un resumen del progreso de aprendizaje."

**[Acción]** Mostrar pestaña "Información Personal"

**Script:**
> "Los usuarios pueden actualizar su información personal: nombre, teléfono, dirección, fecha de nacimiento, género, etc. Todo se guarda automáticamente en la base de datos."

**[Acción]** Mostrar opción de subir avatar

**Script:**
> "También pueden subir una foto de perfil, que se mostrará en el activity feed y en los foros."

**[Acción]** Cambiar a pestaña "Cambiar Contraseña"

**Script:**
> "Para la seguridad, incluimos un sistema robusto de cambio de contraseñas. El usuario debe ingresar su contraseña actual antes de cambiarla, y validamos que la nueva contraseña sea diferente y cumpla con los requisitos de seguridad."

**Puntos clave a destacar:**
- ✅ Gestión completa de perfil
- ✅ Seguridad en cambio de contraseñas
- ✅ Integración con gamificación

---

### PARTE 2: CREACIÓN DE CURSO (5 minutos)

**[Acción]** Navegar a "Mis Cursos" → "Crear Curso"

**Script:**
> "Ahora voy a mostrarles cómo crear un curso completo. Este es el proceso que usarían los instructores o administradores de contenido."

#### 2.1 Información Básica (1 minuto)

**[Acción]** Llenar formulario de información básica

**Script:**
> "El primer paso es proporcionar la información básica del curso:
> - Título del curso
> - Descripción detallada
> - Categoría (pueden usar las predefinidas o crear una nueva)
> - Tiempo estimado de completitud
> - Imagen de portada opcional
> 
> Como pueden ver, los campos marcados con asterisco son obligatorios, y tenemos validación en tiempo real."

**[Acción]** Mostrar categorías personalizadas

**Script:**
> "Una característica importante es que pueden crear categorías personalizadas. Estas se guardan y pueden usarse en futuros cursos, lo que facilita la organización del contenido."

---

#### 2.2 Contenido del Curso (3 minutos)

**[Acción]** Agregar módulo de tipo "Texto"

**Script:**
> "Ahora vamos a agregar contenido al curso. Pueden agregar diferentes tipos de módulos:
> - Texto: Para lecciones escritas
> - Video: Para contenido de video embebido
> - Quiz: Para evaluaciones
> - Contenido interactivo (próximamente)
> 
> Empiezo agregando una lección de texto."

**[Acción]** Agregar módulo de tipo "Video"

**Script:**
> "Ahora agrego un módulo de video. Pueden embebir videos de YouTube, Vimeo, o cualquier otra plataforma. El sistema también incluye opciones de accesibilidad como transcripciones y subtítulos."

**[Acción]** Agregar módulo de tipo "Quiz"

**Script:**
> "Finalmente, voy a agregar un quiz de evaluación. Pueden agregar múltiples preguntas, cada una con varias opciones de respuesta, marcar la respuesta correcta, y agregar una explicación que se muestra después de responder."

**[Acción]** Mostrar preguntas del quiz

**Script:**
> "Pueden agregar tantas preguntas como quieran, y cada una puede tener múltiples opciones. El sistema calcula automáticamente la calificación basada en las respuestas correctas."

---

#### 2.3 Publicar Curso (1 minuto)

**[Acción]** Revisar estructura del curso

**Script:**
> "Antes de publicar, pueden revisar toda la estructura del curso y hacer ajustes si es necesario. El sistema guarda automáticamente los cambios mientras trabajan."

**[Acción]** Mostrar opción de guardar como borrador

**Script:**
> "También pueden guardar el curso como borrador y continuar editándolo más tarde. Los borradores se guardan automáticamente."

**[Acción]** Publicar curso

**Script:**
> "Una vez que están satisfechos con el contenido, pueden publicar el curso. Si tienen un workflow de aprobación configurado, el curso irá primero a revisión antes de ser publicado."

**Puntos clave a destacar:**
- ✅ Editor intuitivo y fácil de usar
- ✅ Múltiples tipos de contenido
- ✅ Auto-guardado
- ✅ Workflow de aprobación

---

### PARTE 3: EXPERIENCIA DE ESTUDIANTE (5 minutos)

**[Acción]** Logout y login como estudiante (`juan.student@kainet.mx` / `Demo123!`)

**Script:**
> "Ahora voy a cambiar a la perspectiva del estudiante para mostrarles cómo se ve la experiencia desde su lado."

#### 3.1 Biblioteca y Catálogo (1 minuto)

**[Acción]** Navegar a "Mi Biblioteca" o "Catálogo"

**Script:**
> "Los estudiantes pueden ver todos los cursos que tienen asignados y los cursos disponibles en el catálogo. Pueden filtrar por categoría, buscar por nombre, y ver el progreso de cada curso."

**[Acción]** Mostrar curso completado

**Script:**
> "Aquí vemos que Juan ya completó el curso 'Introducción a AccessLearn' al 100%. Pueden ver el certificado que obtuvo y el XP ganado."

---

#### 3.2 Tomar un Curso (2 minutos)

**[Acción]** Cambiar a estudiante con progreso parcial (`pedro.student@kainet.mx` / `Demo123!`)

**Script:**
> "Ahora voy a mostrarles cómo se ve un curso en progreso. Cambio a Pedro, que tiene 50% de progreso en el curso."

**[Acción]** Abrir curso "Introducción a AccessLearn"

**Script:**
> "Aquí vemos la estructura del curso. Pueden ver qué lecciones ya completaron (marcadas con check) y cuáles faltan. La barra de progreso muestra visualmente el avance."

**[Acción]** Completar una lección

**Script:**
> "Cuando el estudiante completa una lección, ganan XP automáticamente. El sistema muestra una notificación de cuánto XP ganaron y su progreso hacia el siguiente nivel."

**[Acción]** Completar un quiz

**Script:**
> "Al completar un quiz, el sistema muestra inmediatamente los resultados: cuántas preguntas respondieron correctamente, su calificación, y cuánto XP adicional ganaron. También pueden ver las explicaciones de cada respuesta."

---

#### 3.3 Completar Curso y Certificado (2 minutos)

**[Acción]** Volver a `juan.student@kainet.mx` y mostrar curso completado

**Script:**
> "Cuando un estudiante completa un curso al 100%, el sistema automáticamente:
> - Genera un certificado único
> - Otorga XP adicional
> - Verifica si subió de nivel
> - Desbloquea badges y achievements
> - Crea una actividad en el feed para celebrar el logro"

**[Acción]** Mostrar certificado

**Script:**
> "El certificado incluye un código único de verificación que puede usarse para validar la autenticidad del certificado. Los estudiantes pueden descargarlo o compartirlo."

**[Acción]** Mostrar nivel y XP

**Script:**
> "El sistema de gamificación incluye niveles infinitos. Cada nivel requiere más XP que el anterior, lo que mantiene el desafío. Los estudiantes pueden ver cuánto XP necesitan para el siguiente nivel."

**Puntos clave a destacar:**
- ✅ Experiencia de usuario fluida
- ✅ Sistema de gamificación motivador
- ✅ Certificados automáticos
- ✅ Progreso visual claro

---

### PARTE 4: ANALYTICS Y REPORTES (3 minutos)

**[Acción]** Login como admin o instructor (`ana.lopez@kainet.mx` o `maria.instructor@kainet.mx`)

**Script:**
> "Ahora voy a mostrarles la sección de Analytics, que es una de las características más potentes de la plataforma para administradores e instructores."

**[Acción]** Navegar a "Analytics"

**Script:**
> "Tenemos varios tipos de reportes disponibles:
> - Dashboard de alto nivel con métricas generales
> - Reporte de usuarios con progreso detallado
> - Reporte de cursos con estadísticas específicas
> - Reporte de equipos (si se usan grupos)
> - Reporte de evaluaciones (quizzes)
> - Reporte de mentoría"

---

#### 4.1 Dashboard de Alto Nivel (1 minuto)

**[Acción]** Mostrar dashboard de analytics

**Script:**
> "El dashboard principal muestra métricas agregadas:
> - Total de usuarios activos
> - Total de cursos publicados
> - Cursos completados
> - Promedio de completitud
> - Tiempo promedio de completitud
> - XP total ganado
> 
> Todo esto se actualiza en tiempo real."

---

#### 4.2 Reporte de Usuarios (1 minuto)

**[Acción]** Mostrar reporte de usuarios

**Script:**
> "El reporte de usuarios muestra el progreso detallado de cada usuario:
> - Cursos asignados y completados
> - Porcentaje de completitud por curso
> - XP ganado
> - Nivel actual
> - Tiempo invertido
> 
> Pueden filtrar por grupo, rango de fechas, o buscar usuarios específicos."

---

#### 4.3 Reporte de Cursos (1 minuto)

**[Acción]** Mostrar reporte de un curso específico

**Script:**
> "El reporte de cursos muestra estadísticas detalladas de cada curso:
> - Número de usuarios inscritos
> - Porcentaje de completitud promedio
> - Lecciones más y menos completadas
> - Preguntas de quiz más difíciles
> - Tiempo promedio de completitud
> 
> También pueden exportar estos datos a CSV para análisis externos o reportes para stakeholders."

**Puntos clave a destacar:**
- ✅ Analytics completos y detallados
- ✅ Múltiples tipos de reportes
- ✅ Exportación de datos
- ✅ Filtros y búsqueda avanzada

---

### PARTE 5: FOROS, NOTIFICACIONES Y ENGAGEMENT (2 minutos)

#### 5.1 Foros Q&A (1 minuto)

**[Acción]** Login como estudiante (`pedro.student@kainet.mx`)

**Script:**
> "Los cursos incluyen foros Q&A integrados donde los estudiantes pueden hacer preguntas y los instructores pueden responder."

**[Acción]** Abrir curso y mostrar foro

**Script:**
> "Aquí vemos las preguntas existentes. Los estudiantes pueden:
> - Hacer preguntas sobre el contenido del curso
> - Responder preguntas de otros estudiantes
> - Hacer upvote a preguntas o respuestas útiles
> - Marcar la mejor respuesta (solo el que hizo la pregunta o admin/instructor)"

**[Acción]** Mostrar notificación de respuesta

**Script:**
> "Cuando alguien responde a una pregunta, el estudiante recibe una notificación automática, lo que mantiene el engagement alto."

---

#### 5.2 Notificaciones y Activity Feed (1 minuto)

**[Acción]** Click en icono de notificaciones

**Script:**
> "El sistema incluye notificaciones en tiempo real para:
> - Cursos completados
> - Respuestas en foros
> - Nuevos cursos asignados
> - Logros desbloqueados
> - Mensajes de mentores (si se usa mentoría)"

**[Acción]** Navegar a Activity Feed

**Script:**
> "El Activity Feed muestra las actividades de la comunidad:
> - Cursos completados
> - Niveles alcanzados
> - Badges obtenidos
> - Logros desbloqueados
> 
> Los usuarios pueden agregar reacciones (👍, 🔥, ⭐) y comentarios, lo que crea un sentido de comunidad y motivación."

**Puntos clave a destacar:**
- ✅ Foros integrados en cada curso
- ✅ Notificaciones en tiempo real
- ✅ Activity feed comunitario
- ✅ Sistema de engagement

---

### CIERRE Y PREGUNTAS (5 minutos)

**Script:**
> "Eso es todo lo que tenía preparado para hoy. Como pueden ver, AccessLearn Inclusiv es una plataforma completa y robusta que incluye:
> 
> ✅ Sistema multi-tenant completo
> ✅ Creación de cursos intuitiva con múltiples tipos de contenido
> ✅ Sistema de gamificación motivador
> ✅ Analytics detallados
> ✅ Foros Q&A integrados
> ✅ Notificaciones y activity feed
> ✅ Certificados automáticos
> ✅ Gestión completa de usuarios y grupos
> 
> La plataforma está lista para producción y puede escalar según sus necesidades."

**Pregunta de Cierre:**
> "¿Tienen alguna pregunta sobre lo que vieron hoy? ¿Hay alguna funcionalidad específica que les gustaría explorar más a fondo?"

**[Esperar preguntas y responder]**

**Script Final:**
> "Perfecto, gracias por su tiempo y atención. Voy a preparar un resumen con las preguntas y puntos clave que discutimos, y estaremos en contacto para los siguientes pasos."

---

## 📝 NOTAS PARA EL DEMONSTRADOR

### Consejos para el Demo
1. **Mantener el ritmo:** Mantener el demo a 20-25 minutos
2. **Pausar para preguntas:** Si hay preguntas durante el demo, pausar y responder
3. **Destacar características únicas:** Enfocarse en lo que diferencia a AccessLearn
4. **Ser honesto:** Si no sabes algo, admítelo y ofrece investigarlo después
5. **Tomar notas:** Anotar preguntas y feedback para seguimiento

### Errores Comunes a Evitar
- ❌ No ejecutar el script de datos demo antes
- ❌ No tener credenciales listas
- ❌ Demorarse demasiado en una sección
- ❌ No dejar tiempo para preguntas
- ❌ Intentar mostrar todo en un solo demo

### Si Algo Sale Mal
- ✅ Tener plan B listo (screenshots, videos de backup)
- ✅ Mantener la calma y explicar el problema
- ✅ Ofrecer mostrar esa funcionalidad después
- ✅ Documentar el problema para seguimiento

---

## 🎯 OBJETIVOS DEL DEMO

1. **Demostrar la facilidad de uso** de la plataforma
2. **Mostrar las características principales** y su valor
3. **Responder preguntas** del cliente
4. **Generar interés** en el producto
5. **Recopilar feedback** para mejoras

---

**Última actualización:** 2025-01-28  
**Próxima revisión:** Después del primer demo

