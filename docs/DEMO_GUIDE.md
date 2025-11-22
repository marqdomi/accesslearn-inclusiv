# 🎯 Guía de Demo - AccessLearn Inclusiv

**Versión:** 1.0  
**Fecha:** 2025-01-28  
**Para:** Demostración con Cliente

---

## 📋 TABLA DE CONTENIDOS

1. [Credenciales de Acceso](#credenciales-de-acceso)
2. [Información General](#información-general)
3. [Flujo de Demostración](#flujo-de-demostración)
4. [Casos de Uso Principales](#casos-de-uso-principales)
5. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🔐 CREDENCIALES DE ACCESO

### URL de Acceso
- **Producción:** `https://app.kainet.mx`
- **Desarrollo Local:** `http://localhost:5173`

### Tenant
- **Slug:** `kainet`

### Usuarios de Demo

#### 👤 Super Admin
- **Email:** `ana.lopez@kainet.mx`
- **Contraseña:** `Demo123!`
- **Rol:** Super Admin
- **Funciones:** Acceso completo a todas las funciones del sistema

#### 👤 Content Manager
- **Email:** `carlos.content@kainet.mx`
- **Contraseña:** `Demo123!`
- **Rol:** Content Manager
- **Funciones:** Gestión de cursos, usuarios, grupos

#### 👤 Instructor
- **Email:** `maria.instructor@kainet.mx`
- **Contraseña:** `Demo123!`
- **Rol:** Instructor
- **Funciones:** Crear cursos, ver analytics, responder preguntas en foros

#### 👤 Estudiantes
1. **Juan Pérez**
   - **Email:** `juan.student@kainet.mx`
   - **Contraseña:** `Demo123!`
   - **Estado:** Ha completado el curso "Introducción a AccessLearn" (100%)
   - **XP:** ~500 XP
   - **Nivel:** 2
   - **Certificado:** Sí

2. **Pedro Martínez**
   - **Email:** `pedro.student@kainet.mx`
   - **Contraseña:** `Demo123!`
   - **Estado:** 50% de progreso en "Introducción a AccessLearn"
   - **XP:** ~150 XP
   - **Nivel:** 1

3. **Laura González**
   - **Email:** `laura.student@kainet.mx`
   - **Contraseña:** `Demo123!`
   - **Estado:** 50% de progreso en "Gestión de Cursos en AccessLearn"
   - **XP:** ~100 XP
   - **Nivel:** 1

---

## 📊 INFORMACIÓN GENERAL

### Datos de Demo Creados

#### Cursos Disponibles
1. **Introducción a AccessLearn**
   - **Categoría:** Onboarding
   - **Duración:** 2 horas
   - **Módulos:** 6 módulos (texto, video, quiz)
   - **Estado:** Publicado
   - **Estudiantes Asignados:** 3

2. **Gestión de Cursos en AccessLearn**
   - **Categoría:** Educación
   - **Duración:** 1.5 horas
   - **Módulos:** 4 módulos (texto, video, quiz)
   - **Estado:** Publicado
   - **Estudiantes Asignados:** 3

3. **Analytics Avanzado en AccessLearn**
   - **Categoría:** Analytics
   - **Duración:** 2.5 horas
   - **Módulos:** 5 módulos (texto, video, quiz)
   - **Estado:** Publicado
   - **Estudiantes Asignados:** 3

#### Progreso de Estudiantes
- **Juan Pérez:** Completó "Introducción a AccessLearn" al 100%
- **Pedro Martínez:** 50% de progreso en "Introducción a AccessLearn"
- **Laura González:** 50% de progreso en "Gestión de Cursos en AccessLearn"

#### Contenido Adicional
- **Certificados:** 1 certificado generado (Juan Pérez)
- **Foros Q&A:** 2 preguntas con respuestas
- **Activity Feed:** 5 actividades creadas

---

## 🎬 FLUJO DE DEMOSTRACIÓN

### Paso 1: Login como Super Admin (2 minutos)

1. **Acceder a la aplicación**
   - URL: `https://app.kainet.mx` (producción) o `http://localhost:5173` (local)
   - Seleccionar tenant: `kainet`

2. **Iniciar sesión**
   - Email: `ana.lopez@kainet.mx`
   - Contraseña: `Demo123!`

3. **Verificar dashboard**
   - Ver estadísticas generales
   - Ver usuarios activos
   - Ver cursos publicados

**Puntos clave a destacar:**
- ✅ Interfaz intuitiva y moderna
- ✅ Dashboard con métricas en tiempo real
- ✅ Sistema multi-tenant funcional

---

### Paso 2: Demo de Gestión de Perfiles (3 minutos)

1. **Acceder al perfil**
   - Click en botón "Perfil" en el header
   - O navegar a `/profile`

2. **Ver información personal**
   - Mostrar datos del usuario
   - Ver nivel y XP
   - Ver badges y achievements

3. **Editar información**
   - Actualizar nombre, teléfono, dirección
   - Subir avatar (opcional)

4. **Cambiar contraseña**
   - Mostrar formulario de cambio de contraseña
   - Explicar validaciones de seguridad

**Puntos clave a destacar:**
- ✅ Gestión completa de perfil de usuario
- ✅ Seguridad en cambio de contraseñas
- ✅ Integración con sistema de gamificación

---

### Paso 3: Demo de Creación de Curso (5 minutos)

1. **Acceder a creación de cursos**
   - Navegar a "Mis Cursos" → "Crear Curso"
   - O usar el botón "Nuevo Curso" en el dashboard

2. **Paso 1: Información Básica**
   - Título: "Curso Demo"
   - Descripción: "Curso de demostración"
   - Categoría: Seleccionar categoría existente o crear nueva
   - Tiempo estimado: 60 minutos
   - Imagen de portada (opcional)

3. **Paso 2: Contenido**
   - Agregar módulos (texto, video, quiz)
   - Módulo 1: "Bienvenida" (tipo: texto)
   - Módulo 2: "Video explicativo" (tipo: video)
   - Módulo 3: "Quiz de evaluación" (tipo: quiz)
     - Agregar preguntas y respuestas
     - Marcar respuesta correcta

4. **Paso 3: Revisar y Publicar**
   - Revisar estructura del curso
   - Guardar como borrador (opcional)
   - Publicar curso

**Puntos clave a destacar:**
- ✅ Editor intuitivo y fácil de usar
- ✅ Múltiples tipos de contenido (texto, video, quiz)
- ✅ Auto-guardado de borradores
- ✅ Workflow de aprobación (opcional)

---

### Paso 4: Demo de Experiencia de Estudiante (5 minutos)

1. **Login como Estudiante**
   - Cambiar a usuario: `juan.student@kainet.mx`
   - Contraseña: `Demo123!`

2. **Ver Biblioteca de Cursos**
   - Navegar a "Mi Biblioteca" o "Catálogo"
   - Ver cursos asignados
   - Ver cursos disponibles

3. **Iniciar Curso**
   - Click en "Introducción a AccessLearn"
   - Ver estructura del curso
   - Ver progreso actual (100% completado)

4. **Completar Lección** (si hay progreso parcial)
   - Cambiar a usuario: `pedro.student@kainet.mx`
   - Ver progreso al 50%
   - Completar una lección
   - Ver XP ganado
   - Ver notificación de progreso

5. **Completar Quiz**
   - Acceder al quiz
   - Responder preguntas
   - Ver resultados
   - Ver XP adicional ganado

6. **Completar Curso**
   - Verificar todas las lecciones completadas
   - Ver certificado generado
   - Ver nivel y XP total

**Puntos clave a destacar:**
- ✅ Experiencia de usuario fluida
- ✅ Sistema de gamificación (XP, niveles, badges)
- ✅ Certificados automáticos
- ✅ Notificaciones en tiempo real

---

### Paso 5: Demo de Analytics (3 minutos)

1. **Login como Admin o Instructor**
   - Cambiar a usuario: `ana.lopez@kainet.mx` o `maria.instructor@kainet.mx`

2. **Acceder a Analytics**
   - Navegar a "Analytics" en el menú
   - Ver dashboard principal

3. **Ver Reportes**
   - **Reporte de Usuarios:**
     - Ver progreso de cada usuario
     - Ver cursos completados
     - Ver XP ganado
   
   - **Reporte de Cursos:**
     - Ver estadísticas de cada curso
     - Ver porcentaje de completitud
     - Ver tiempos promedio
   
   - **Reporte de Equipos** (si aplica):
     - Ver progreso por grupo
     - Ver comparaciones

4. **Exportar Datos** (opcional)
   - Mostrar opción de exportar a CSV
   - Explicar utilidad para reportes externos

**Puntos clave a destacar:**
- ✅ Analytics completos y detallados
- ✅ Múltiples tipos de reportes
- ✅ Exportación de datos
- ✅ Métricas en tiempo real

---

### Paso 6: Demo de Foros Q&A (2 minutos)

1. **Acceder a Foro de Curso**
   - Login como estudiante: `pedro.student@kainet.mx`
   - Abrir curso "Introducción a AccessLearn"
   - Ir a la pestaña "Foro" o "Preguntas"

2. **Ver Preguntas Existentes**
   - Ver preguntas ya publicadas
   - Ver respuestas y upvotes

3. **Publicar Nueva Pregunta**
   - Crear pregunta nueva
   - Agregar título y contenido
   - Publicar

4. **Responder Pregunta**
   - Cambiar a usuario: `maria.instructor@kainet.mx`
   - Ver nueva pregunta
   - Responder pregunta
   - Marcar como mejor respuesta (opcional)

**Puntos clave a destacar:**
- ✅ Foros integrados en cada curso
- ✅ Sistema de upvotes
- ✅ Marcar mejor respuesta
- ✅ Notificaciones de respuestas

---

### Paso 7: Demo de Notificaciones y Activity Feed (2 minutos)

1. **Ver Notificaciones**
   - Login como estudiante: `juan.student@kainet.mx`
   - Click en icono de notificaciones
   - Ver notificaciones de:
     - Curso completado
     - Respuestas en foro
     - Nuevos cursos asignados
     - Logros desbloqueados

2. **Ver Activity Feed**
   - Navegar a "Activity Feed" o "Actividad"
   - Ver actividades de la comunidad:
     - Cursos completados
     - Niveles alcanzados
     - Badges obtenidos
     - Logros desbloqueados

3. **Interactuar con Actividades**
   - Agregar reacción (👍, 🔥, ⭐)
   - Agregar comentario
   - Ver interacciones

**Puntos clave a destacar:**
- ✅ Sistema de notificaciones en tiempo real
- ✅ Activity feed comunitario
- ✅ Interacciones sociales
- ✅ Engagement de usuarios

---

## 💼 CASOS DE USO PRINCIPALES

### Caso de Uso 1: Empresa Capacita a sus Empleados
**Escenario:** Una empresa necesita capacitar a sus empleados en nuevos procesos.

**Flujo:**
1. Admin crea cursos de capacitación
2. Asigna cursos a grupos de empleados
3. Empleados completan cursos
4. Admin monitorea progreso en Analytics
5. Empleados reciben certificados al completar

**Beneficios:**
- ✅ Escalable para múltiples usuarios
- ✅ Tracking completo de progreso
- ✅ Certificados automáticos
- ✅ Analytics detallados

---

### Caso de Uso 2: Institución Educativa
**Escenario:** Una institución educativa ofrece cursos en línea.

**Flujo:**
1. Instructores crean cursos con contenido multimedia
2. Estudiantes se inscriben en cursos
3. Estudiantes completan lecciones y quizzes
4. Sistema de gamificación motiva a los estudiantes
5. Instructores monitorean progreso y responden preguntas en foros

**Beneficios:**
- ✅ Contenido multimedia (texto, video, quiz)
- ✅ Sistema de gamificación
- ✅ Foros Q&A integrados
- ✅ Analytics para instructores

---

### Caso de Uso 3: Consultoría de Capacitación
**Escenario:** Una consultoría ofrece programas de capacitación personalizados.

**Flujo:**
1. Consultor crea cursos personalizados para cada cliente
2. Asigna cursos a grupos específicos
3. Monitorea progreso y engagement
4. Genera reportes para clientes
5. Ajusta contenido basado en analytics

**Beneficios:**
- ✅ Multi-tenant (un cliente por tenant)
- ✅ Branding personalizado
- ✅ Analytics detallados para clientes
- ✅ Escalable para múltiples clientes

---

## ❓ PREGUNTAS FRECUENTES

### ¿Cómo funciona el sistema multi-tenant?
Cada cliente tiene su propio "tenant" con sus propios usuarios, cursos y datos. Los datos están completamente aislados entre tenants.

### ¿Cómo se asignan los cursos a los usuarios?
Los administradores pueden asignar cursos individualmente a usuarios o a grupos completos. También pueden crear grupos y asignar cursos a grupos.

### ¿Qué tipos de contenido se pueden agregar a los cursos?
- Texto (lecciones escritas)
- Video (embebido desde YouTube, Vimeo, etc.)
- Quiz (preguntas de opción múltiple)
- Contenido interactivo (próximamente)

### ¿Cómo funciona el sistema de gamificación?
- Los usuarios ganan XP al completar lecciones y quizzes
- El XP se suma a su total y aumenta su nivel
- Los niveles son infinitos con dificultad creciente (logarítmico)
- Los usuarios pueden obtener badges y achievements

### ¿Se puede exportar datos para reportes externos?
Sí, los analytics incluyen opciones para exportar datos a CSV para análisis externos.

### ¿Cómo funcionan los certificados?
Los certificados se generan automáticamente cuando un usuario completa un curso al 100%. Incluyen código único de verificación.

### ¿Se pueden crear categorías personalizadas?
Sí, los administradores pueden crear categorías personalizadas además de las categorías predefinidas.

### ¿Cómo se gestionan los permisos?
El sistema incluye roles predefinidos:
- Super Admin: Acceso completo
- Content Manager: Gestión de cursos y usuarios
- Instructor: Crear cursos y ver analytics
- Student: Acceso a cursos asignados

### ¿Se puede personalizar el branding?
Sí, cada tenant puede personalizar colores primarios y secundarios, logo, etc.

### ¿Hay límites en el número de usuarios o cursos?
Los límites dependen del plan:
- Demo: 50 usuarios, 10 cursos
- Profesional: 200 usuarios, 50 cursos
- Enterprise: 1000 usuarios, 500 cursos

---

## 📞 SOPORTE

### Documentación Técnica
- `docs/MANUAL_TESTING_GUIDE.md` - Guía de testing manual
- `docs/PROFILE_TESTING_GUIDE.md` - Guía de testing de perfiles
- `docs/ROADMAP_DEMO_PRODUCCION.md` - Roadmap completo

### Contacto
- **Email:** admin@kainet.mx
- **Tenant:** kainet

---

## 📝 NOTAS IMPORTANTES

### Antes del Demo
- ✅ Ejecutar script de datos demo: `npm run setup-demo-complete`
- ✅ Verificar que todos los servicios estén corriendo
- ✅ Verificar conexión a Cosmos DB
- ✅ Tener credenciales listas

### Durante el Demo
- ⏱️ Mantener demo a 20-25 minutos
- 🎯 Enfocarse en casos de uso principales
- 💡 Destacar características únicas
- ❓ Dejar tiempo para preguntas (5 minutos)

### Después del Demo
- 📋 Recopilar feedback
- 📝 Documentar preguntas sin respuesta
- 🎯 Priorizar mejoras basadas en feedback

---

**Última actualización:** 2025-01-28

