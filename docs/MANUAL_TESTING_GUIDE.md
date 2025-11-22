# 📋 Guía de Testing Manual - AccessLearn Inclusiv

**Fecha:** 2025-01-28  
**Objetivo:** Testing manual exhaustivo de todas las funcionalidades

---

## 🚀 Inicio Rápido

### 1. Iniciar Servidor Backend

```bash
cd backend
npm run server
```

El servidor debe estar corriendo en `http://localhost:3000`

### 2. Iniciar Frontend

```bash
npm run dev
```

El frontend debe estar corriendo en `http://localhost:5173`

### 3. Credenciales de Prueba

**Tenant:** `kainet`

**Usuarios:**
- **Super Admin:** `ana.lopez@kainet.mx` / `Demo123!`
- **Content Manager:** `carlos.content@kainet.mx` / `Demo123!`
- **Instructor:** `maria.instructor@kainet.mx` / `Demo123!`
- **Student:** `juan.student@kainet.mx` / `Demo123!`

---

## 📝 Checklist de Testing Manual

### ✅ FASE 1: Autenticación y Navegación Básica

#### Test 1.1: Login como Super Admin
- [ ] Abrir `http://localhost:5173`
- [ ] Seleccionar tenant `kainet`
- [ ] Login con `ana.lopez@kainet.mx` / `Demo123!`
- [ ] Verificar que se muestra dashboard de admin
- [ ] Verificar que el token JWT se guarda en localStorage
- [ ] Verificar que el usuario se muestra en la esquina superior

**Resultado Esperado:** ✅ Login exitoso, dashboard de admin visible

#### Test 1.2: Login con Diferentes Roles
- [ ] Logout
- [ ] Login como Content Manager (`carlos.content@kainet.mx`)
- [ ] Verificar dashboard apropiado
- [ ] Logout
- [ ] Login como Instructor (`maria.instructor@kainet.mx`)
- [ ] Verificar dashboard apropiado
- [ ] Logout
- [ ] Login como Student (`juan.student@kainet.mx`)
- [ ] Verificar dashboard apropiado

**Resultado Esperado:** ✅ Cada rol ve su dashboard apropiado

#### Test 1.3: Navegación Principal
- [ ] Verificar que el menú lateral funciona
- [ ] Navegar a "Mis Cursos"
- [ ] Navegar a "Biblioteca"
- [ ] Navegar a "Analytics" (si es admin)
- [ ] Navegar a "Configuración"
- [ ] Verificar que todas las rutas cargan correctamente

**Resultado Esperado:** ✅ Navegación funciona sin errores

---

### ✅ FASE 2: Gestión de Cursos

#### Test 2.1: Crear Curso Completo
- [ ] Login como Content Manager o Super Admin
- [ ] Ir a "Mis Cursos" > "Crear Curso"
- [ ] **Paso 1 - Detalles:**
  - [ ] Ingresar título: "Curso de Prueba - Testing"
  - [ ] Ingresar descripción
  - [ ] Seleccionar categoría
  - [ ] Agregar tiempo estimado
  - [ ] Verificar que el asterisco (*) aparece en campos requeridos
  - [ ] Avanzar al siguiente paso
- [ ] **Paso 2 - Estructura:**
  - [ ] Agregar módulo "Módulo 1"
  - [ ] Agregar lección "Lección 1.1" al módulo
  - [ ] Agregar lección "Lección 1.2" al módulo
  - [ ] Agregar segundo módulo "Módulo 2"
  - [ ] Avanzar al siguiente paso
- [ ] **Paso 3 - Contenido:**
  - [ ] Agregar contenido de texto a "Lección 1.1"
  - [ ] Agregar contenido de video (URL de YouTube)
  - [ ] Agregar PDF (subir archivo)
  - [ ] Verificar que el contenido se guarda
  - [ ] Avanzar al siguiente paso
- [ ] **Paso 4 - Evaluaciones:**
  - [ ] Agregar quiz al final del curso
  - [ ] Agregar 3 preguntas de opción múltiple
  - [ ] Marcar respuestas correctas
  - [ ] Avanzar al siguiente paso
- [ ] **Paso 5 - Revisar y Publicar:**
  - [ ] Revisar toda la información
  - [ ] Guardar como borrador
  - [ ] Verificar que aparece en "Borradores"
  - [ ] Editar el borrador
  - [ ] Publicar el curso
  - [ ] Verificar que aparece en "Publicados"

**Resultado Esperado:** ✅ Curso creado, guardado y publicado correctamente

#### Test 2.2: Editar Curso Existente
- [ ] Ir a "Mis Cursos" > "Borradores" o "Publicados"
- [ ] Click en "Editar" en un curso
- [ ] Modificar título
- [ ] Agregar nueva lección
- [ ] Guardar cambios
- [ ] Verificar que los cambios se guardaron

**Resultado Esperado:** ✅ Curso se edita y guarda correctamente

#### Test 2.3: Ver Catálogo de Cursos
- [ ] Login como Student
- [ ] Ir a "Biblioteca" o "Catálogo"
- [ ] Verificar que se muestran cursos publicados
- [ ] Buscar curso por nombre
- [ ] Filtrar por categoría
- [ ] Click en un curso para ver detalles

**Resultado Esperado:** ✅ Catálogo funciona correctamente

---

### ✅ FASE 3: Visualización y Progreso de Cursos

#### Test 3.1: Inscribirse en Curso
- [ ] Login como Student
- [ ] Ir a "Biblioteca"
- [ ] Click en "Inscribirse" en un curso
- [ ] Verificar que el curso aparece en "Mis Cursos"
- [ ] Verificar que se crea progreso inicial

**Resultado Esperado:** ✅ Inscripción funciona, curso aparece en "Mis Cursos"

#### Test 3.2: Completar Lección
- [ ] Abrir curso desde "Mis Cursos"
- [ ] Click en primera lección
- [ ] Leer/ver contenido
- [ ] Marcar como completada
- [ ] Verificar que aparece checkmark
- [ ] Verificar que el progreso se actualiza
- [ ] Verificar que se otorga XP

**Resultado Esperado:** ✅ Lección se marca como completada, XP se otorga

#### Test 3.3: Completar Quiz
- [ ] Navegar al quiz del curso
- [ ] Responder todas las preguntas
- [ ] Enviar quiz
- [ ] Verificar que se muestra resultado
- [ ] Verificar que se otorga XP según el score
- [ ] Verificar que el progreso se actualiza

**Resultado Esperado:** ✅ Quiz funciona, XP se otorga correctamente

#### Test 3.4: Completar Curso Completo
- [ ] Completar todas las lecciones
- [ ] Completar todos los quizzes
- [ ] Verificar que el curso se marca como completado
- [ ] Verificar que aparece mensaje de felicitación
- [ ] Verificar que se genera certificado (si aplica)
- [ ] Verificar que el XP total se calcula correctamente

**Resultado Esperado:** ✅ Curso completado, certificado generado, XP calculado

---

### ✅ FASE 4: Gamificación

#### Test 4.1: Verificar Sistema de XP
- [ ] Login como Student
- [ ] Ir a Dashboard
- [ ] Verificar que se muestra XP total
- [ ] Completar una lección
- [ ] Verificar que el XP aumenta
- [ ] Verificar que el XP se persiste (recargar página)

**Resultado Esperado:** ✅ XP se otorga y persiste correctamente

#### Test 4.2: Verificar Sistema de Niveles
- [ ] Verificar nivel actual en dashboard
- [ ] Verificar progreso al siguiente nivel
- [ ] Ganar suficiente XP para subir de nivel
- [ ] Verificar que el nivel aumenta
- [ ] Verificar que aparece notificación de level-up
- [ ] Verificar que el progreso se recalcula

**Resultado Esperado:** ✅ Sistema de niveles funciona correctamente

#### Test 4.3: Verificar Badges y Achievements
- [ ] Ir a "Gamificación" o "Logros"
- [ ] Verificar que se muestran badges disponibles
- [ ] Completar requisitos para un badge
- [ ] Verificar que el badge se otorga
- [ ] Verificar que aparece en el perfil

**Resultado Esperado:** ✅ Badges se otorgan correctamente

---

### ✅ FASE 5: Certificados

#### Test 5.1: Generar Certificado
- [ ] Completar un curso completo
- [ ] Verificar que se genera certificado automáticamente
- [ ] Verificar que aparece en "Mis Certificados"
- [ ] Click en certificado para ver/descargar
- [ ] Verificar que el PDF se genera correctamente
- [ ] Verificar que incluye información correcta

**Resultado Esperado:** ✅ Certificado se genera y descarga correctamente

#### Test 5.2: Verificar Certificado
- [ ] Obtener código de verificación del certificado
- [ ] Usar endpoint de verificación pública
- [ ] Verificar que el certificado se valida correctamente

**Resultado Esperado:** ✅ Verificación funciona correctamente

---

### ✅ FASE 6: Analytics

#### Test 6.1: High-Level Dashboard
- [ ] Login como Super Admin
- [ ] Ir a "Analytics" > "Dashboard General"
- [ ] Verificar que se muestran estadísticas:
  - [ ] Total de usuarios
  - [ ] Total de cursos
  - [ ] Cursos completados
  - [ ] XP total otorgado
- [ ] Verificar que los gráficos se renderizan

**Resultado Esperado:** ✅ Analytics se muestra correctamente

#### Test 6.2: User Progress Report
- [ ] Ir a "Analytics" > "Reporte de Progreso"
- [ ] Seleccionar usuario
- [ ] Verificar que se muestra progreso detallado
- [ ] Exportar a CSV
- [ ] Verificar que el archivo se descarga

**Resultado Esperado:** ✅ Reportes funcionan correctamente

#### Test 6.3: Course Report
- [ ] Ir a "Analytics" > "Reporte de Curso"
- [ ] Seleccionar curso
- [ ] Verificar estadísticas del curso:
  - [ ] Usuarios inscritos
  - [ ] Completaciones
  - [ ] Promedio de score
- [ ] Exportar a CSV

**Resultado Esperado:** ✅ Reporte de curso funciona

---

### ✅ FASE 7: Foros Q&A

#### Test 7.1: Publicar Pregunta
- [ ] Abrir un curso
- [ ] Ir a pestaña "Foro" o "Preguntas"
- [ ] Click en "Hacer Pregunta"
- [ ] Escribir pregunta
- [ ] Publicar
- [ ] Verificar que aparece en el foro

**Resultado Esperado:** ✅ Pregunta se publica correctamente

#### Test 7.2: Responder Pregunta
- [ ] Click en una pregunta
- [ ] Escribir respuesta
- [ ] Publicar respuesta
- [ ] Verificar que aparece debajo de la pregunta

**Resultado Esperado:** ✅ Respuesta se publica correctamente

#### Test 7.3: Marcar Respuesta Correcta
- [ ] Login como Instructor o Admin
- [ ] Ver pregunta con respuestas
- [ ] Marcar una respuesta como correcta
- [ ] Verificar que se muestra destacada

**Resultado Esperado:** ✅ Respuesta se marca como correcta

#### Test 7.4: Upvote
- [ ] Click en upvote en una pregunta
- [ ] Verificar que el contador aumenta
- [ ] Click en upvote en una respuesta
- [ ] Verificar que el contador aumenta

**Resultado Esperado:** ✅ Upvote funciona correctamente

---

### ✅ FASE 8: Activity Feed

#### Test 8.1: Ver Activity Feed
- [ ] Ir a "Activity Feed" o "Actividad"
- [ ] Verificar que se muestran actividades recientes
- [ ] Verificar que se ordenan por fecha (más reciente primero)

**Resultado Esperado:** ✅ Activity feed se muestra correctamente

#### Test 8.2: Reaccionar a Actividad
- [ ] Click en reacción (like, etc.) en una actividad
- [ ] Verificar que la reacción se guarda
- [ ] Verificar que el contador se actualiza

**Resultado Esperado:** ✅ Reacciones funcionan

#### Test 8.3: Comentar en Actividad
- [ ] Click en "Comentar" en una actividad
- [ ] Escribir comentario
- [ ] Publicar
- [ ] Verificar que aparece el comentario

**Resultado Esperado:** ✅ Comentarios funcionan

---

### ✅ FASE 9: Notificaciones

#### Test 9.1: Ver Notificaciones
- [ ] Click en icono de notificaciones
- [ ] Verificar que se muestran notificaciones
- [ ] Verificar que las no leídas se marcan
- [ ] Verificar contador de no leídas

**Resultado Esperado:** ✅ Notificaciones se muestran correctamente

#### Test 9.2: Marcar como Leída
- [ ] Click en una notificación
- [ ] Verificar que se marca como leída
- [ ] Verificar que el contador disminuye

**Resultado Esperado:** ✅ Marcar como leída funciona

#### Test 9.3: Preferencias de Notificaciones
- [ ] Ir a "Configuración" > "Notificaciones"
- [ ] Modificar preferencias
- [ ] Guardar
- [ ] Verificar que se guardan

**Resultado Esperado:** ✅ Preferencias se guardan

---

### ✅ FASE 10: Asignaciones y Grupos

#### Test 10.1: Asignar Curso a Usuario
- [ ] Login como Admin
- [ ] Ir a "Asignaciones" o "Gestión de Cursos"
- [ ] Seleccionar curso
- [ ] Asignar a usuario específico
- [ ] Verificar que el usuario recibe notificación
- [ ] Verificar que el curso aparece en "Mis Cursos" del usuario

**Resultado Esperado:** ✅ Asignación funciona correctamente

#### Test 10.2: Asignar Curso a Grupo
- [ ] Crear grupo (si no existe)
- [ ] Asignar curso a grupo
- [ ] Verificar que todos los miembros reciben asignación

**Resultado Esperado:** ✅ Asignación a grupo funciona

---

## 🐛 Problemas Comunes y Soluciones

### Problema: Rate Limiting Bloquea Login
**Solución:** Esperar 15 minutos o usar IP diferente

### Problema: Token Expirado
**Solución:** Hacer logout y login nuevamente

### Problema: Curso No Aparece
**Solución:** Verificar que el curso está publicado, no solo guardado como borrador

### Problema: XP No Se Actualiza
**Solución:** Recargar página o verificar en dashboard

---

## 📊 Formato de Reporte

Para cada test, documentar:

1. **Test:** Nombre del test
2. **Resultado:** ✅ PASÓ / ❌ FALLÓ / ⚠️ PARCIAL
3. **Observaciones:** Notas adicionales
4. **Screenshots:** (opcional) Capturas de pantalla

---

## ✅ Criterios de Éxito

### Para Demo
- [ ] Al menos 80% de los tests críticos pasan
- [ ] Funcionalidades principales funcionan:
  - [ ] Login/Autenticación
  - [ ] Crear curso
  - [ ] Ver curso
  - [ ] Completar curso
  - [ ] Ver progreso
  - [ ] Gamificación básica

### ✅ FASE X: Gestión de Perfiles

#### Test X.1: Acceder a Perfil
- [ ] Login como cualquier usuario
- [ ] Click en botón "Perfil" en el header del Dashboard
- [ ] Verificar que se carga la página de perfil (`/profile`)
- [ ] Verificar que se muestra información actual del usuario:
  - [ ] Nombre completo
  - [ ] Email (solo lectura)
  - [ ] Avatar (si tiene)
  - [ ] XP y nivel
  - [ ] Rol

**Resultado Esperado:** ✅ Página de perfil carga correctamente con información del usuario

#### Test X.2: Actualizar Información Personal
- [ ] En la pestaña "Información Personal"
- [ ] Modificar nombre
- [ ] Modificar apellido
- [ ] Agregar/modificar teléfono
- [ ] Agregar/modificar fecha de nacimiento
- [ ] Seleccionar género
- [ ] Agregar dirección (calle, ciudad, estado, código postal, país)
- [ ] Click en "Guardar Cambios"
- [ ] Verificar que aparece mensaje de éxito
- [ ] Verificar que los cambios se guardaron (recargar página)
- [ ] Verificar en Cosmos DB que los datos se actualizaron

**Resultado Esperado:** ✅ Información personal se actualiza correctamente y persiste

#### Test X.3: Subir Avatar
- [ ] Click en el ícono de cámara sobre el avatar
- [ ] Seleccionar imagen (JPG, PNG, GIF)
- [ ] Verificar que aparece preview inmediato
- [ ] Verificar que se valida tamaño máximo (5MB)
- [ ] Verificar que se valida formato (solo imágenes)
- [ ] Esperar a que se complete el upload
- [ ] Verificar que el avatar se actualiza
- [ ] Recargar página y verificar que el avatar persiste
- [ ] Verificar en Cosmos DB que el avatar (base64) se guardó

**Resultado Esperado:** ✅ Avatar se sube, muestra preview, y persiste correctamente

#### Test X.4: Cambiar Contraseña
- [ ] Ir a pestaña "Cambiar Contraseña"
- [ ] Ingresar contraseña actual incorrecta
- [ ] Ingresar nueva contraseña
- [ ] Click en "Cambiar Contraseña"
- [ ] Verificar que aparece error de contraseña actual incorrecta
- [ ] Ingresar contraseña actual correcta
- [ ] Ingresar nueva contraseña (< 8 caracteres)
- [ ] Verificar que aparece error de validación
- [ ] Ingresar nueva contraseña válida (>= 8 caracteres)
- [ ] Confirmar nueva contraseña (diferente)
- [ ] Verificar que aparece error de no coincidencia
- [ ] Confirmar nueva contraseña (igual)
- [ ] Click en "Cambiar Contraseña"
- [ ] Verificar que aparece mensaje de éxito
- [ ] Logout
- [ ] Login con nueva contraseña
- [ ] Verificar que el login funciona
- [ ] Cambiar contraseña de vuelta a la original

**Resultado Esperado:** ✅ Cambio de contraseña funciona con todas las validaciones

#### Test X.5: Validaciones de Formulario
- [ ] **Perfil:**
  - [ ] Intentar guardar sin nombre (dejar vacío)
  - [ ] Verificar que aparece error de campo requerido
  - [ ] Intentar guardar sin apellido
  - [ ] Verificar que aparece error
- [ ] **Contraseña:**
  - [ ] Intentar cambiar sin contraseña actual
  - [ ] Verificar que aparece error
  - [ ] Intentar con nueva contraseña igual a la actual
  - [ ] Verificar que aparece error

**Resultado Esperado:** ✅ Todas las validaciones funcionan correctamente

#### Test X.6: Persistencia en Cosmos DB
- [ ] Realizar cambios en el perfil
- [ ] Verificar en Cosmos DB (Azure Portal o Azure Data Explorer):
  - [ ] Container: `users`
  - [ ] Documento del usuario se actualizó
  - [ ] Campos modificados están presentes
  - [ ] `updatedAt` se actualizó
- [ ] Verificar que el avatar (base64) se guardó en campo `avatar`

**Resultado Esperado:** ✅ Todos los cambios persisten en Cosmos DB

---

### Para Producción
- [ ] 100% de los tests pasan
- [ ] No hay errores en consola
- [ ] Performance aceptable

---

**Última actualización:** 2025-01-28

