# 🧪 Guía Completa de Testing Manual - AccessLearn

**Versión:** 1.0.0  
**Fecha:** 23 de Noviembre, 2025  
**Propósito:** Guía exhaustiva para realizar testing manual de todas las funcionalidades de AccessLearn

---

## 📋 ÍNDICE

1. [Preparación del Entorno](#preparación-del-entorno)
2. [Credenciales de Prueba](#credenciales-de-prueba)
3. [Testing de Autenticación](#testing-de-autenticación)
4. [Testing de Gestión de Cursos](#testing-de-gestión-de-cursos)
5. [Testing de Progreso y Completado](#testing-de-progreso-y-completado)
6. [Testing de Gamificación](#testing-de-gamificación)
7. [Testing de Certificados](#testing-de-certificados)
8. [Testing de Foros Q&A](#testing-de-foros-qa)
9. [Testing de Mentoría](#testing-de-mentoría)
10. [Testing de Analytics](#testing-de-analytics)
11. [Testing de Configuración Admin](#testing-de-configuración-admin)
12. [Testing de Accesibilidad](#testing-de-accesibilidad)
13. [Testing Multi-Navegador](#testing-multi-navegador)
14. [Reporte de Bugs](#reporte-de-bugs)

---

## 🔧 PREPARACIÓN DEL ENTORNO

### Requisitos Previos

- [ ] Navegador actualizado (Chrome, Firefox, Safari, Edge)
- [ ] Acceso a la aplicación (local o producción)
- [ ] Credenciales de prueba
- [ ] Documento de reporte de bugs (template incluido al final)

### Configuración Inicial

1. **Limpiar caché del navegador:**
   - Chrome: `Ctrl+Shift+Delete` (Windows) o `Cmd+Shift+Delete` (Mac)
   - Seleccionar "Caché" y "Cookies"
   - Tiempo: "Todo el tiempo"

2. **Abrir DevTools:**
   - `F12` o `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Verificar que no haya errores en Console

3. **Verificar conexión:**
   - Backend: `http://localhost:5000/api/health` (o URL de producción)
   - Frontend: `http://localhost:5173` (o URL de producción)

---

## 🔑 CREDENCIALES DE PRUEBA

### Usuarios de Prueba

**Tenant:** Kainet  
**Slug:** `kainet`  
**Password (todos los usuarios):** `Demo123!`

#### Super Admin
```
Email: ana.lopez@kainet.mx
Password: Demo123!
Rol: super-admin
Descripción: Acceso completo a nivel plataforma (multi-tenant)
```

#### Tenant Admin
```
Email: admin.tenant@kainet.mx
Password: Demo123!
Rol: tenant-admin
Descripción: Administrador completo de la organización
```

#### Content Manager
```
Email: carlos.content@kainet.mx
Password: Demo123!
Rol: content-manager
Descripción: Gestión de cursos y contenido
```

#### User Manager
```
Email: laura.users@kainet.mx
Password: Demo123!
Rol: user-manager
Descripción: Gestión de usuarios y equipos
```

#### Analytics Viewer
```
Email: pedro.analytics@kainet.mx
Password: Demo123!
Rol: analytics-viewer
Descripción: Acceso solo lectura a analytics
```

#### Instructor
```
Email: maria.instructor@kainet.mx
Password: Demo123!
Rol: instructor
Descripción: Creación de cursos (con aprobación)
```

#### Mentor
```
Email: carlos.mentor@kainet.mx
Password: Demo123!
Rol: mentor
Descripción: Guía de estudiantes
```

#### Student
```
Email: juan.student@kainet.mx
Password: Demo123!
Rol: student
Descripción: Experiencia de aprendizaje
```

### Crear Usuarios de Prueba

Para crear/actualizar todos los usuarios de prueba, ejecuta:

```bash
cd backend
npm run create-test-users-all-roles
```

Este script:
- ✅ Crea usuarios para TODOS los roles del sistema
- ✅ Actualiza usuarios existentes si ya existen
- ✅ Establece password: `Demo123!` para todos
- ✅ Marca usuarios como activos

---

## 🔐 TESTING DE AUTENTICACIÓN

### TC-AUTH-001: Login Exitoso

**Objetivo:** Verificar que un usuario puede iniciar sesión correctamente

**Pasos:**
1. Ir a la página de login
2. Seleccionar tenant "Kainet" (si aplica)
3. Ingresar email: `student@kainet.test`
4. Ingresar password: `Student2024!`
5. Click en "Iniciar Sesión"

**Resultado Esperado:**
- [ ] Usuario es redirigido al dashboard
- [ ] Token JWT se guarda en localStorage
- [ ] Información del usuario se muestra correctamente
- [ ] No hay errores en la consola

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-AUTH-002: Login con Credenciales Incorrectas

**Objetivo:** Verificar manejo de errores en login

**Pasos:**
1. Ir a la página de login
2. Ingresar email: `student@kainet.test`
3. Ingresar password incorrecta: `WrongPassword123!`
4. Click en "Iniciar Sesión"

**Resultado Esperado:**
- [ ] Mensaje de error se muestra
- [ ] Usuario NO es redirigido
- [ ] Formulario permanece en la página de login

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-AUTH-003: Logout

**Objetivo:** Verificar que el logout funciona correctamente

**Pasos:**
1. Estar logueado como cualquier usuario
2. Click en botón "Salir" o "Logout"
3. Confirmar logout (si aplica)

**Resultado Esperado:**
- [ ] Usuario es redirigido a la página de login
- [ ] Token JWT se elimina de localStorage
- [ ] Sesión se cierra correctamente

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-AUTH-004: Cambio de Contraseña

**Objetivo:** Verificar cambio de contraseña

**Pasos:**
1. Loguearse como cualquier usuario
2. Ir a Perfil
3. Click en "Cambiar Contraseña"
4. Ingresar contraseña actual
5. Ingresar nueva contraseña
6. Confirmar nueva contraseña
7. Guardar cambios

**Resultado Esperado:**
- [ ] Contraseña se actualiza correctamente
- [ ] Mensaje de éxito se muestra
- [ ] Usuario puede loguearse con nueva contraseña

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-AUTH-005: Edición de Perfil

**Objetivo:** Verificar edición de información de perfil

**Pasos:**
1. Loguearse como cualquier usuario
2. Ir a Perfil
3. Editar información (nombre, teléfono, dirección)
4. Subir avatar (opcional)
5. Guardar cambios

**Resultado Esperado:**
- [ ] Cambios se guardan correctamente
- [ ] Información actualizada se muestra
- [ ] Avatar se actualiza (si se subió)

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

## 📚 TESTING DE GESTIÓN DE CURSOS

### TC-COURSE-001: Crear Curso Completo

**Objetivo:** Verificar creación de curso desde cero

**Pasos:**
1. Loguearse como `instructor@kainet.test` o `content-manager@kainet.test`
2. Ir a "Gestión de Cursos" o "Crear Curso"
3. **Paso 1 - Detalles:**
   - Ingresar título: "Curso de Prueba Manual"
   - Ingresar descripción: "Este es un curso de prueba para testing manual"
   - Seleccionar categoría
   - Configurar dificultad
   - Estimar horas
4. Click en "Siguiente"
5. **Paso 2 - Estructura:**
   - Crear módulo: "Módulo 1"
   - Agregar lección: "Lección 1.1"
   - Agregar más lecciones si es necesario
6. Click en "Siguiente"
7. **Paso 3 - Contenido:**
   - Agregar contenido a las lecciones
   - Agregar diferentes tipos de contenido (texto, video, audio)
8. Click en "Siguiente"
9. **Paso 4 - Quizzes:**
   - Crear quiz con diferentes tipos de preguntas
10. Click en "Siguiente"
11. **Paso 5 - Revisar:**
    - Revisar toda la información
    - Click en "Guardar como Borrador" o "Publicar"

**Resultado Esperado:**
- [ ] Curso se crea correctamente
- [ ] Todos los pasos se completan sin errores
- [ ] Curso aparece en la lista de cursos
- [ ] Estado del curso es correcto (draft o published)

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-COURSE-002: Editar Curso Existente

**Objetivo:** Verificar edición de curso

**Pasos:**
1. Loguearse como instructor o content-manager
2. Ir a "Gestión de Cursos"
3. Seleccionar un curso existente
4. Click en "Editar"
5. Modificar título o descripción
6. Guardar cambios

**Resultado Esperado:**
- [ ] Cambios se guardan correctamente
- [ ] Curso actualizado se muestra
- [ ] No se pierden datos existentes

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-COURSE-003: Publicar Curso

**Objetivo:** Verificar publicación de curso

**Pasos:**
1. Loguearse como instructor
2. Crear o seleccionar un curso en estado "draft"
3. Completar todos los pasos requeridos
4. Click en "Publicar" o "Enviar para Revisión"
5. Si es content-manager, aprobar el curso

**Resultado Esperado:**
- [ ] Curso cambia a estado "published" o "pending-review"
- [ ] Curso es visible para estudiantes (si está published)
- [ ] Workflow de aprobación funciona correctamente

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-COURSE-004: Ver Catálogo de Cursos

**Objetivo:** Verificar visualización de catálogo

**Pasos:**
1. Loguearse como student
2. Ir a "Catálogo" o "Biblioteca"
3. Ver lista de cursos disponibles

**Resultado Esperado:**
- [ ] Solo cursos "published" se muestran
- [ ] Información de cursos se muestra correctamente
- [ ] Búsqueda y filtros funcionan
- [ ] Imágenes y descripciones se cargan

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-COURSE-005: Inscribirse en Curso

**Objetivo:** Verificar inscripción en curso

**Pasos:**
1. Loguearse como student
2. Ir a catálogo de cursos
3. Seleccionar un curso
4. Click en "Inscribirse" o "Comenzar Curso"

**Resultado Esperado:**
- [ ] Inscripción se completa exitosamente
- [ ] Curso aparece en "Mis Cursos"
- [ ] Progreso inicial es 0%
- [ ] Mensaje de éxito se muestra

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

## 📈 TESTING DE PROGRESO Y COMPLETADO

### TC-PROGRESS-001: Completar Lección

**Objetivo:** Verificar completado de lección

**Pasos:**
1. Loguearse como student
2. Ir a "Mis Cursos"
3. Abrir un curso inscrito
4. Abrir una lección
5. Leer/completar el contenido
6. Marcar como completada (si hay botón)

**Resultado Esperado:**
- [ ] Lección se marca como completada
- [ ] Progreso del curso se actualiza
- [ ] XP se otorga (verificar en gamificación)
- [ ] Siguiente lección se desbloquea

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-PROGRESS-002: Completar Quiz

**Objetivo:** Verificar completado de quiz

**Pasos:**
1. Loguearse como student
2. Abrir un curso con quiz
3. Completar todas las preguntas
4. Enviar quiz

**Resultado Esperado:**
- [ ] Quiz se envía correctamente
- [ ] Score se calcula y muestra
- [ ] XP adicional se otorga según score
- [ ] Resultados se guardan
- [ ] Feedback se muestra

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-PROGRESS-003: Completar Curso Completo

**Objetivo:** Verificar completado de curso completo

**Pasos:**
1. Loguearse como student
2. Completar todas las lecciones de un curso
3. Completar todos los quizzes
4. Verificar que el curso está 100% completo

**Resultado Esperado:**
- [ ] Curso se marca como completado
- [ ] Certificado se genera automáticamente
- [ ] Badge o achievement se desbloquea
- [ ] XP final se otorga
- [ ] Curso aparece en "Completados"

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-PROGRESS-004: Ver Progreso de Curso

**Objetivo:** Verificar visualización de progreso

**Pasos:**
1. Loguearse como student
2. Ir a "Mis Cursos"
3. Ver progreso de cada curso

**Resultado Esperado:**
- [ ] Porcentaje de progreso se muestra correctamente
- [ ] Barra de progreso se actualiza
- [ ] Lecciones completadas se marcan
- [ ] Estadísticas son precisas

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

## 🎮 TESTING DE GAMIFICACIÓN

### TC-GAMIFY-001: Verificar Sistema de XP

**Objetivo:** Verificar otorgamiento de XP

**Pasos:**
1. Loguearse como student
2. Ver XP actual en dashboard
3. Completar una lección
4. Verificar XP ganado

**Resultado Esperado:**
- [ ] XP se otorga correctamente
- [ ] XP total se actualiza
- [ ] Notificación de XP ganado se muestra (si aplica)
- [ ] XP se refleja en el dashboard

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-GAMIFY-002: Subida de Nivel

**Objetivo:** Verificar subida de nivel

**Pasos:**
1. Loguearse como student
2. Ver nivel actual
3. Completar acciones para ganar XP suficiente
4. Alcanzar el XP necesario para subir de nivel

**Resultado Esperado:**
- [ ] Nivel se actualiza correctamente
- [ ] Animación de subida de nivel (si aplica)
- [ ] Badge de nivel se actualiza
- [ ] Notificación de nivel up se muestra

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-GAMIFY-003: Desbloquear Achievement

**Objetivo:** Verificar desbloqueo de achievements

**Pasos:**
1. Loguearse como student
2. Ver achievements disponibles
3. Completar acción que desbloquea achievement
4. Verificar achievement desbloqueado

**Resultado Esperado:**
- [ ] Achievement se desbloquea
- [ ] Notificación se muestra
- [ ] Achievement aparece en el perfil
- [ ] XP adicional se otorga (si aplica)

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-GAMIFY-004: Ver Leaderboard

**Objetivo:** Verificar leaderboard

**Pasos:**
1. Loguearse como student
2. Ir a "Leaderboard" o "Ranking"
3. Ver lista de usuarios

**Resultado Esperado:**
- [ ] Leaderboard se muestra correctamente
- [ ] Usuarios están ordenados por XP
- [ ] Posición del usuario actual se muestra
- [ ] Información es precisa

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

## 🏆 TESTING DE CERTIFICADOS

### TC-CERT-001: Generación de Certificado

**Objetivo:** Verificar generación automática de certificado

**Pasos:**
1. Loguearse como student
2. Completar un curso completo
3. Verificar que certificado se genera

**Resultado Esperado:**
- [ ] Certificado se genera automáticamente
- [ ] Certificado aparece en "Mis Certificados"
- [ ] Información del certificado es correcta
- [ ] Código de verificación único se genera

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-CERT-002: Descargar Certificado PDF

**Objetivo:** Verificar descarga de certificado

**Pasos:**
1. Loguearse como student
2. Ir a "Mis Certificados"
3. Seleccionar un certificado
4. Click en "Descargar PDF"

**Resultado Esperado:**
- [ ] PDF se descarga correctamente
- [ ] PDF contiene información correcta
- [ ] Branding de la empresa se muestra
- [ ] Código de verificación está incluido

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-CERT-003: Verificar Certificado

**Objetivo:** Verificar código de certificado

**Pasos:**
1. Obtener código de verificación de un certificado
2. Ir a página de verificación (si existe)
3. Ingresar código
4. Verificar información

**Resultado Esperado:**
- [ ] Código se valida correctamente
- [ ] Información del certificado se muestra
- [ ] Certificado se marca como válido

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

## 💬 TESTING DE FOROS Q&A

### TC-FORUM-001: Publicar Pregunta

**Objetivo:** Verificar publicación de pregunta

**Pasos:**
1. Loguearse como student
2. Ir a un curso
3. Ir a sección "Foro" o "Q&A"
4. Click en "Hacer Pregunta"
5. Escribir pregunta
6. Publicar

**Resultado Esperado:**
- [ ] Pregunta se publica correctamente
- [ ] Pregunta aparece en el foro
- [ ] Notificación se envía (si aplica)
- [ ] Pregunta es visible para otros usuarios

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-FORUM-002: Responder Pregunta

**Objetivo:** Verificar respuesta a pregunta

**Pasos:**
1. Loguearse como cualquier usuario
2. Ir a foro de un curso
3. Seleccionar una pregunta
4. Escribir respuesta
5. Publicar respuesta

**Resultado Esperado:**
- [ ] Respuesta se publica correctamente
- [ ] Respuesta aparece debajo de la pregunta
- [ ] Notificación se envía al autor de la pregunta
- [ ] Respuesta es visible para todos

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-FORUM-003: Marcar Mejor Respuesta

**Objetivo:** Verificar marcado de mejor respuesta

**Pasos:**
1. Loguearse como autor de pregunta
2. Ir a su pregunta
3. Ver respuestas
4. Marcar una respuesta como "Mejor Respuesta"

**Resultado Esperado:**
- [ ] Respuesta se marca como mejor
- [ ] Badge o indicador se muestra
- [ ] Respuesta aparece primero
- [ ] XP se otorga al autor de la respuesta (si aplica)

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-FORUM-004: Upvote Pregunta/Respuesta

**Objetivo:** Verificar sistema de upvotes

**Pasos:**
1. Loguearse como cualquier usuario
2. Ir a foro
3. Click en botón de upvote en una pregunta o respuesta

**Resultado Esperado:**
- [ ] Upvote se registra correctamente
- [ ] Contador de upvotes se actualiza
- [ ] Usuario no puede upvotear dos veces
- [ ] Lista de usuarios que upvotearon se muestra (si aplica)

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

## 👥 TESTING DE MENTORÍA

### TC-MENTOR-001: Solicitar Mentoría

**Objetivo:** Verificar solicitud de mentoría

**Pasos:**
1. Loguearse como student (mentee)
2. Ir a "Mentoría" o "Directorio de Mentores"
3. Seleccionar un mentor disponible
4. Click en "Solicitar Mentoría"
5. Completar formulario de solicitud
6. Enviar solicitud

**Resultado Esperado:**
- [ ] Solicitud se envía correctamente
- [ ] Notificación se envía al mentor
- [ ] Solicitud aparece en "Mis Solicitudes"
- [ ] Estado inicial es "pending"

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-MENTOR-002: Aceptar Solicitud de Mentoría

**Objetivo:** Verificar aceptación de solicitud

**Pasos:**
1. Loguearse como mentor
2. Ir a "Solicitudes de Mentoría"
3. Ver solicitudes pendientes
4. Seleccionar una solicitud
5. Click en "Aceptar"

**Resultado Esperado:**
- [ ] Solicitud se acepta correctamente
- [ ] Estado cambia a "accepted"
- [ ] Notificación se envía al mentee
- [ ] Sesión de mentoría se crea

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-MENTOR-003: Completar Sesión de Mentoría

**Objetivo:** Verificar completado de sesión

**Pasos:**
1. Loguearse como mentor o mentee
2. Ir a sesiones de mentoría activas
3. Seleccionar una sesión
4. Completar sesión
5. Calificar sesión (si aplica)

**Resultado Esperado:**
- [ ] Sesión se marca como completada
- [ ] XP se otorga a ambos (si aplica)
- [ ] Rating se guarda
- [ ] Estadísticas se actualizan

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

## 📊 TESTING DE ANALYTICS

### TC-ANALYTICS-001: Ver Dashboard de Analytics

**Objetivo:** Verificar dashboard de analytics

**Pasos:**
1. Loguearse como admin o content-manager
2. Ir a "Analytics" o "Reportes"
3. Ver dashboard principal

**Resultado Esperado:**
- [ ] Dashboard se carga correctamente
- [ ] Métricas principales se muestran
- [ ] Gráficos se renderizan
- [ ] Datos son precisos

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-ANALYTICS-002: Ver Reporte de Usuarios

**Objetivo:** Verificar reporte de usuarios

**Pasos:**
1. Loguearse como admin
2. Ir a Analytics
3. Seleccionar "Reporte de Usuarios"
4. Ver estadísticas de usuarios

**Resultado Esperado:**
- [ ] Lista de usuarios se muestra
- [ ] Estadísticas por usuario son correctas
- [ ] Filtros funcionan
- [ ] Exportación funciona (si aplica)

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-ANALYTICS-003: Ver Reporte de Cursos

**Objetivo:** Verificar reporte de cursos

**Pasos:**
1. Loguearse como admin
2. Ir a Analytics
3. Seleccionar "Reporte de Cursos"
4. Ver estadísticas de cursos

**Resultado Esperado:**
- [ ] Lista de cursos se muestra
- [ ] Métricas por curso son correctas
- [ ] Gráficos se muestran
- [ ] Datos son precisos

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

## ⚙️ TESTING DE CONFIGURACIÓN ADMIN

### TC-ADMIN-001: Configurar Branding

**Objetivo:** Verificar configuración de branding

**Pasos:**
1. Loguearse como tenant-admin
2. Ir a "Configuración" > "Marca y Apariencia"
3. Subir logo
4. Cambiar colores primarios y secundarios
5. Cambiar nombre de la organización
6. Guardar cambios

**Resultado Esperado:**
- [ ] Cambios se guardan correctamente
- [ ] Logo se actualiza en toda la aplicación
- [ ] Colores se aplican correctamente
- [ ] Nombre se actualiza

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-ADMIN-002: Configurar Notificaciones

**Objetivo:** Verificar configuración de notificaciones

**Pasos:**
1. Loguearse como cualquier usuario
2. Ir a "Configuración" > "Notificaciones"
3. Activar/desactivar diferentes tipos de notificaciones
4. Configurar frecuencia de email
5. Guardar cambios

**Resultado Esperado:**
- [ ] Preferencias se guardan correctamente
- [ ] Notificaciones se respetan según configuración
- [ ] Cambios se aplican inmediatamente

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-ADMIN-003: Ver Panel de Seguridad

**Objetivo:** Verificar panel de seguridad

**Pasos:**
1. Loguearse como tenant-admin
2. Ir a "Configuración" > "Seguridad"
3. Ver información de roles y permisos
4. Ver estadísticas de seguridad

**Resultado Esperado:**
- [ ] Panel se carga correctamente
- [ ] Información de roles se muestra
- [ ] Estadísticas son precisas
- [ ] Políticas de seguridad se muestran (si aplica)

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

## ♿ TESTING DE ACCESIBILIDAD

### TC-ACC-001: Navegación por Teclado

**Objetivo:** Verificar navegación 100% por teclado

**Pasos:**
1. Loguearse como cualquier usuario
2. Usar solo teclado (Tab, Enter, Arrow keys)
3. Navegar por toda la aplicación
4. Completar acciones principales

**Resultado Esperado:**
- [ ] Todos los elementos son accesibles por teclado
- [ ] Focus indicators son visibles
- [ ] Orden de tab es lógico
- [ ] Todas las acciones se pueden completar sin mouse

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-ACC-002: Panel de Accesibilidad

**Objetivo:** Verificar panel de accesibilidad

**Pasos:**
1. Loguearse como cualquier usuario
2. Click en botón de accesibilidad (⚙️)
3. Probar diferentes configuraciones:
   - Tamaño de texto
   - Alto contraste
   - Reducir movimiento
   - Filtros de daltonismo

**Resultado Esperado:**
- [ ] Panel se abre correctamente
- [ ] Cambios se aplican inmediatamente
- [ ] Preferencias se guardan
- [ ] Configuraciones funcionan correctamente

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-ACC-003: Screen Reader

**Objetivo:** Verificar compatibilidad con screen reader

**Pasos:**
1. Activar screen reader (NVDA, JAWS, VoiceOver)
2. Navegar por la aplicación
3. Verificar que todos los elementos tienen labels
4. Verificar que información importante se anuncia

**Resultado Esperado:**
- [ ] Todos los elementos tienen labels apropiados
- [ ] Navegación es clara
- [ ] Información importante se anuncia
- [ ] Formularios son accesibles

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

## 🌐 TESTING MULTI-NAVEGADOR

### TC-BROWSER-001: Chrome

**Objetivo:** Verificar funcionamiento en Chrome

**Pasos:**
1. Abrir Chrome (última versión)
2. Realizar flujos principales
3. Verificar que todo funciona

**Resultado Esperado:**
- [ ] Todas las funcionalidades funcionan
- [ ] No hay errores en consola
- [ ] UI se ve correctamente
- [ ] Performance es buena

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-BROWSER-002: Firefox

**Objetivo:** Verificar funcionamiento en Firefox

**Pasos:**
1. Abrir Firefox (última versión)
2. Realizar flujos principales
3. Verificar que todo funciona

**Resultado Esperado:**
- [ ] Todas las funcionalidades funcionan
- [ ] No hay errores en consola
- [ ] UI se ve correctamente
- [ ] Performance es buena

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-BROWSER-003: Safari

**Objetivo:** Verificar funcionamiento en Safari

**Pasos:**
1. Abrir Safari (última versión)
2. Realizar flujos principales
3. Verificar que todo funciona

**Resultado Esperado:**
- [ ] Todas las funcionalidades funcionan
- [ ] No hay errores en consola
- [ ] UI se ve correctamente
- [ ] Performance es buena

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

### TC-BROWSER-004: Mobile (Chrome/Safari)

**Objetivo:** Verificar funcionamiento en mobile

**Pasos:**
1. Abrir aplicación en dispositivo móvil
2. Realizar flujos principales
3. Verificar responsive design

**Resultado Esperado:**
- [ ] UI se adapta correctamente
- [ ] Touch targets son adecuados (44x44px mínimo)
- [ ] Todas las funcionalidades son accesibles
- [ ] Performance es aceptable

**Estado:** ⬜ Pass / ⬜ Fail / ⬜ N/A  
**Notas:** 

---

## 🐛 REPORTE DE BUGS

### Template de Reporte de Bug

**ID del Bug:** [AUTO-GENERADO]  
**Fecha:** [FECHA]  
**Reportado por:** [NOMBRE]  
**Severidad:** ⬜ Crítica / ⬜ Alta / ⬜ Media / ⬜ Baja

**Descripción:**
[Descripción clara del problema]

**Pasos para Reproducir:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Resultado Esperado:**
[Qué debería pasar]

**Resultado Actual:**
[Qué está pasando]

**Screenshots/Videos:**
[Adjuntar si aplica]

**Información Adicional:**
- Navegador: [Chrome/Firefox/Safari/Edge]
- Versión: [VERSIÓN]
- OS: [Windows/Mac/Linux]
- URL: [URL donde ocurre]
- Console Errors: [Errores en consola si aplica]

---

## ✅ CHECKLIST FINAL

### Funcionalidades Core
- [ ] Autenticación completa
- [ ] Gestión de cursos completa
- [ ] Progreso y completado
- [ ] Gamificación
- [ ] Certificados
- [ ] Foros Q&A
- [ ] Mentoría
- [ ] Analytics
- [ ] Configuración Admin

### Calidad
- [ ] Sin errores críticos en consola
- [ ] Performance aceptable (< 3s carga)
- [ ] Responsive design funciona
- [ ] Accesibilidad WCAG 2.1 AA
- [ ] Multi-navegador compatible

### Documentación
- [ ] Todos los bugs reportados
- [ ] Screenshots/videos capturados
- [ ] Reporte completo generado

---

**Última Actualización:** 23 de Noviembre, 2025  
**Versión:** 1.0.0

