# 🧪 Plan de Testing Funcional - AccessLearn Inclusiv

**Fecha:** 2025-01-28  
**Objetivo:** Verificar que todas las funcionalidades principales estén funcionando correctamente

---

## 📋 Resumen Ejecutivo

Este documento describe el plan completo de testing funcional para verificar que todas las características principales de la aplicación estén funcionando correctamente antes del demo con cliente.

---

## 🎯 Alcance del Testing

### Funcionalidades a Probar

1. ✅ **Autenticación y Autorización**
2. ✅ **Gestión de Tenants**
3. ✅ **Gestión de Cursos**
4. ✅ **Progreso de Usuarios**
5. ✅ **Gamificación (XP, Niveles, Badges)**
6. ✅ **Certificados**
7. ✅ **Analytics**
8. ✅ **Foros Q&A**
9. ✅ **Activity Feed**
10. ✅ **Notificaciones**
11. ✅ **Biblioteca de Cursos**
12. ✅ **Asignaciones de Cursos**

---

## 📝 Checklist de Testing Manual

### 1. Autenticación y Autorización

#### 1.1 Login con Diferentes Roles
- [ ] Login como Super Admin (`ana.lopez@kainet.mx` / `Demo123!`)
- [ ] Login como Content Manager (`carlos.content@kainet.mx` / `Demo123!`)
- [ ] Login como Instructor (`maria.instructor@kainet.mx` / `Demo123!`)
- [ ] Login como Student (`juan.student@kainet.mx` / `Demo123!`)
- [ ] Verificar que cada rol ve el dashboard apropiado
- [ ] Verificar que los permisos se aplican correctamente

#### 1.2 Validación de Tokens
- [ ] Token JWT se recibe correctamente
- [ ] Token puede validarse con `/api/auth/validate`
- [ ] Token expirado es rechazado (probar después de 24h o cambiar JWT_EXPIRY)
- [ ] Token inválido es rechazado

#### 1.3 Logout
- [ ] Logout funciona correctamente
- [ ] Token se invalida después de logout
- [ ] Usuario es redirigido a login

---

### 2. Gestión de Tenants

#### 2.1 Listar Tenants
- [ ] Endpoint `/api/tenants` devuelve lista de tenants
- [ ] Lista se muestra correctamente en frontend

#### 2.2 Obtener Tenant por Slug
- [ ] Endpoint `/api/tenants/slug/kainet` devuelve tenant correcto
- [ ] Tenant se resuelve correctamente en frontend

#### 2.3 Selección de Tenant
- [ ] Usuario puede seleccionar tenant desde lista
- [ ] Tenant se guarda en contexto/sesión
- [ ] Navegación funciona con tenant seleccionado

---

### 3. Gestión de Cursos

#### 3.1 Crear Curso
- [ ] Crear curso desde ModernCourseBuilder
- [ ] Todos los pasos del builder funcionan:
  - [ ] Paso 1: Detalles del curso
  - [ ] Paso 2: Estructura (módulos/lecciones)
  - [ ] Paso 3: Contenido (texto, video, PDF)
  - [ ] Paso 4: Evaluaciones (quiz)
  - [ ] Paso 5: Revisar y publicar
- [ ] Curso se guarda como borrador
- [ ] Curso se puede publicar

#### 3.2 Editar Curso
- [ ] Editar curso existente
- [ ] Cambios se guardan correctamente
- [ ] Auto-save funciona

#### 3.3 Listar Cursos
- [ ] Ver todos los cursos
- [ ] Ver cursos publicados
- [ ] Ver borradores
- [ ] Filtrar por categoría
- [ ] Buscar cursos

#### 3.4 Visualizar Curso
- [ ] Abrir curso desde catálogo
- [ ] Contenido se muestra correctamente
- [ ] Navegación entre lecciones funciona
- [ ] Videos se reproducen
- [ ] PDFs se muestran

---

### 4. Progreso de Usuarios

#### 4.1 Completar Lección
- [ ] Marcar lección como completada
- [ ] Progreso se actualiza en backend
- [ ] Progreso se muestra en frontend
- [ ] XP se otorga correctamente

#### 4.2 Completar Curso
- [ ] Completar todas las lecciones
- [ ] Completar todos los quizzes
- [ ] Curso se marca como completado
- [ ] Certificado se genera (si aplica)
- [ ] XP total se calcula correctamente

#### 4.3 Ver Progreso
- [ ] Dashboard muestra progreso correcto
- [ ] Progreso por curso se muestra
- [ ] Estadísticas de progreso son correctas

---

### 5. Gamificación

#### 5.1 Sistema de XP
- [ ] XP se otorga al completar lecciones
- [ ] XP se otorga al completar quizzes
- [ ] XP se otorga al completar cursos
- [ ] XP total se calcula correctamente
- [ ] XP se persiste en Cosmos DB

#### 5.2 Sistema de Niveles
- [ ] Nivel se calcula correctamente (logarítmico)
- [ ] Nivel se actualiza cuando se gana XP
- [ ] Nivel se muestra en dashboard
- [ ] Progreso al siguiente nivel se calcula correctamente

#### 5.3 Badges y Achievements
- [ ] Badges se otorgan automáticamente
- [ ] Achievements se desbloquean
- [ ] Badges se muestran en perfil
- [ ] Achievements se muestran en dashboard

---

### 6. Certificados

#### 6.1 Generación de Certificados
- [ ] Certificado se genera al completar curso
- [ ] Certificado incluye información correcta
- [ ] Certificado incluye branding del tenant
- [ ] Certificado se guarda en Cosmos DB

#### 6.2 Visualización de Certificados
- [ ] Certificados se listan en perfil
- [ ] Certificado se puede ver/descargar
- [ ] Certificado se muestra correctamente

#### 6.3 Verificación de Certificados
- [ ] Código de verificación funciona
- [ ] Certificado se puede verificar públicamente

---

### 7. Analytics

#### 7.1 High-Level Stats
- [ ] Estadísticas generales se muestran
- [ ] Datos son correctos
- [ ] Gráficos se renderizan

#### 7.2 User Progress Report
- [ ] Reporte de progreso de usuario se genera
- [ ] Datos son correctos
- [ ] Exportación a CSV funciona

#### 7.3 Course Report
- [ ] Reporte de curso se genera
- [ ] Estadísticas de curso son correctas
- [ ] Exportación funciona

#### 7.4 Team Report
- [ ] Reporte de equipo se genera
- [ ] Estadísticas de equipo son correctas

#### 7.5 Assessment Report
- [ ] Reporte de evaluación se genera
- [ ] Estadísticas de quiz son correctas

---

### 8. Foros Q&A

#### 8.1 Publicar Pregunta
- [ ] Usuario puede publicar pregunta en curso
- [ ] Pregunta se guarda en Cosmos DB
- [ ] Pregunta se muestra en foro

#### 8.2 Responder Pregunta
- [ ] Usuario puede responder pregunta
- [ ] Respuesta se guarda en Cosmos DB
- [ ] Respuesta se muestra en foro

#### 8.3 Marcar Respuesta Correcta
- [ ] Instructor puede marcar respuesta como correcta
- [ ] Respuesta marcada se muestra destacada

#### 8.4 Upvote
- [ ] Usuario puede hacer upvote a pregunta
- [ ] Usuario puede hacer upvote a respuesta
- [ ] Contador de upvotes se actualiza

---

### 9. Activity Feed

#### 9.1 Ver Activity Feed
- [ ] Activity feed se muestra
- [ ] Actividades se cargan correctamente
- [ ] Actividades se ordenan por fecha

#### 9.2 Reacciones
- [ ] Usuario puede reaccionar a actividad
- [ ] Reacción se guarda en Cosmos DB
- [ ] Contador de reacciones se actualiza

#### 9.3 Comentarios
- [ ] Usuario puede comentar en actividad
- [ ] Comentario se guarda en Cosmos DB
- [ ] Comentario se muestra en actividad

---

### 10. Notificaciones

#### 10.1 Ver Notificaciones
- [ ] Notificaciones se listan
- [ ] Notificaciones no leídas se marcan
- [ ] Contador de no leídas es correcto

#### 10.2 Marcar como Leída
- [ ] Usuario puede marcar notificación como leída
- [ ] Contador se actualiza
- [ ] Marcar todas como leídas funciona

#### 10.3 Preferencias de Notificaciones
- [ ] Usuario puede ver preferencias
- [ ] Usuario puede actualizar preferencias
- [ ] Preferencias se guardan en Cosmos DB

---

### 11. Biblioteca de Cursos

#### 11.1 Ver Catálogo
- [ ] Catálogo de cursos se muestra
- [ ] Cursos se filtran correctamente
- [ ] Búsqueda funciona

#### 11.2 Inscribirse en Curso
- [ ] Usuario puede inscribirse en curso
- [ ] Curso aparece en "Mis Cursos"
- [ ] Asignación se guarda en Cosmos DB

#### 11.3 Ver Mis Cursos
- [ ] Lista de cursos inscritos se muestra
- [ ] Progreso por curso se muestra
- [ ] Cursos completados se marcan

---

### 12. Asignaciones de Cursos

#### 12.1 Asignar a Usuario
- [ ] Admin puede asignar curso a usuario
- [ ] Asignación se guarda en Cosmos DB
- [ ] Usuario recibe notificación

#### 12.2 Asignar a Grupo
- [ ] Admin puede asignar curso a grupo
- [ ] Todos los miembros del grupo reciben asignación
- [ ] Asignaciones se guardan en Cosmos DB

#### 12.3 Ver Asignaciones
- [ ] Asignaciones se listan correctamente
- [ ] Estado de asignación se muestra
- [ ] Filtros funcionan

---

## 🔧 Testing Automatizado

### Scripts Disponibles

1. **Test de Funcionalidad:**
   ```bash
   cd backend
   npm run test:functionality
   ```

2. **Test de Seguridad:**
   ```bash
   cd backend
   npm run test:all-security
   ```

3. **Test Completo:**
   ```bash
   cd backend
   npm run test:all
   ```

---

## 📊 Criterios de Aceptación

### Para Demo con Cliente

- [ ] ✅ Al menos 80% de los tests pasan
- [ ] ✅ Funcionalidades críticas funcionan:
  - [ ] Login/Autenticación
  - [ ] Creación de curso
  - [ ] Visualización de curso
  - [ ] Progreso de usuario
  - [ ] Gamificación básica
- [ ] ✅ No hay errores críticos en consola
- [ ] ✅ Performance aceptable (< 3s carga de páginas)

### Para Producción

- [ ] ✅ 100% de los tests pasan
- [ ] ✅ Todas las funcionalidades funcionan
- [ ] ✅ Tests automatizados con > 40% coverage
- [ ] ✅ Performance optimizado
- [ ] ✅ Errores manejados correctamente

---

## ⏱️ Tiempo Estimado

- **Testing Manual Completo:** 4-6 horas
- **Testing Automatizado:** 1-2 horas
- **Corrección de Bugs Encontrados:** 2-4 horas
- **Total:** 7-12 horas

---

## 📝 Notas

- El rate limiting puede bloquear algunos tests. Espera 15 minutos entre intentos o usa IPs diferentes.
- Algunos tests requieren datos de prueba. Ejecuta `npm run setup-demo` primero.
- Los tests automatizados verifican endpoints, pero el testing manual verifica la experiencia completa del usuario.

---

**Última actualización:** 2025-01-28

