# Reporte de Migración: useKV → Cosmos DB

**Fecha:** $(date)
**Estado:** Análisis completo - Componentes críticos identificados

## 📊 Resumen Ejecutivo

Se encontraron **37 archivos** usando `useKV` con **133 instancias** totales.

### Categorización

- ✅ **Ya Migrados:** Cursos, Categorías, Usuarios (backend), Invitaciones
- 🔴 **Críticos - Deben Migrarse:** 15 tipos de datos
- 🟡 **Legítimos - Pueden Quedarse:** 8 tipos de datos (preferencias de UI)

---

## 🔴 DATOS CRÍTICOS - Deben Migrarse a Cosmos DB

### 1. **Progreso de Usuarios** (CRÍTICO)
**Archivos afectados:**
- `src/components/library/MissionLibrary.tsx` - `course-progress-${userId}`
- `src/components/courses/CourseViewer.tsx` - `course-progress-${userId}`
- `src/components/admin/analytics/*` - `all-user-progress`, `all-user-stats`
- `src/hooks/use-xp.ts` - `user-total-xp-${userKey}`, `user-level-${userKey}`

**Impacto:** 
- Progreso de usuarios se pierde al cambiar de dispositivo
- No hay sincronización entre usuarios
- Analytics no funcionan correctamente

**Estado Backend:** ✅ Ya existe `user-progress` container en Cosmos DB
**Acción:** Migrar hooks y componentes a usar API

---

### 2. **Asignaciones de Cursos** (CRÍTICO)
**Archivos afectados:**
- `src/components/library/MissionLibrary.tsx` - `course-assignments`
- `src/components/admin/CourseAssignmentManager.tsx` - `course-assignments`

**Impacto:**
- Asignaciones no persisten
- No se pueden asignar cursos a grupos/usuarios

**Estado Backend:** ⚠️ No existe endpoint específico
**Acción:** Crear endpoint `/api/course-assignments` y migrar

---

### 3. **Perfiles de Usuario** (CRÍTICO)
**Archivos afectados:**
- `src/hooks/use-auth.ts` - `user-profiles`
- `src/components/courses/QandAForum.tsx` - `user-profile-${userId}`
- `src/components/courses/CourseViewer.tsx` - `user-profile-${userId}`
- `src/components/admin/TeamManagement.tsx` - `user-profiles`
- `src/components/community/*` - `user-profiles`

**Impacto:**
- Perfiles no sincronizados
- Información de usuario inconsistente

**Estado Backend:** ✅ Ya existe modelo `User` en Cosmos DB
**Acción:** Usar datos del modelo `User` en lugar de `user-profiles`

---

### 4. **Credenciales de Empleados** (CRÍTICO - SENSIBLE)
**Archivos afectados:**
- `src/hooks/use-auth.ts` - `employee-credentials`
- `src/components/admin/EmployeeManagement.tsx` - `employee-credentials`
- `src/components/admin/ManualEmployeeEnrollment.tsx` - `employee-credentials`
- `src/components/admin/BulkEmployeeUpload.tsx` - `employee-credentials`
- `src/components/auth/LoginScreen.tsx` - `employee-credentials`

**Impacto:**
- ⚠️ **SEGURIDAD:** Credenciales en localStorage
- No hay sincronización
- Sistema de login antiguo (ya migrado a backend)

**Estado Backend:** ✅ Ya existe sistema de autenticación en backend
**Acción:** **URGENTE** - Eliminar uso de `employee-credentials` y usar backend auth

---

### 5. **Grupos de Usuarios** (CRÍTICO)
**Archivos afectados:**
- `src/components/admin/UserManagement.tsx` - `user-groups`
- `src/components/admin/GroupManagement.tsx` - `user-groups`
- `src/components/admin/GroupSuggestions.tsx` - `user-groups`
- `src/components/admin/analytics/*` - `groups`

**Impacto:**
- Grupos no persisten
- No se pueden crear equipos/grupos

**Estado Backend:** ⚠️ No existe endpoint específico
**Acción:** Crear endpoint `/api/groups` y migrar

---

### 6. **Foros y Preguntas** (CRÍTICO)
**Archivos afectados:**
- `src/components/community/CourseForum.tsx` - `forum-questions`, `forum-answers`
- `src/components/courses/QandAForum.tsx` - Usa `user-profiles`

**Impacto:**
- Preguntas y respuestas no persisten
- No hay comunidad funcional

**Estado Backend:** ⚠️ No existe endpoint
**Acción:** Crear endpoints `/api/forum/questions`, `/api/forum/answers`

---

### 7. **Feed de Actividad** (CRÍTICO)
**Archivos afectados:**
- `src/components/community/ActivityFeed.tsx` - `activity-feed`

**Impacto:**
- Actividades no persisten
- No hay historial de actividad

**Estado Backend:** ✅ Ya existe `audit-logs` container
**Acción:** Usar `/api/audit` para actividades

---

### 8. **Certificados** (CRÍTICO)
**Archivos afectados:**
- `src/hooks/use-certificates.ts` - `certificates`

**Impacto:**
- Certificados no persisten
- No se pueden emitir certificados reales

**Estado Backend:** ⚠️ No existe endpoint
**Acción:** Crear endpoint `/api/certificates`

---

### 9. **Logros y Badges** (CRÍTICO)
**Archivos afectados:**
- `src/components/admin/ProfessionalCourseBuilder.tsx` - `achievements`
- `src/components/admin/GamificationHub.tsx` - `badges`

**Impacto:**
- Sistema de gamificación no funciona
- Logros no persisten

**Estado Backend:** ⚠️ No existe endpoint
**Acción:** Crear endpoints `/api/achievements`, `/api/badges`

---

### 10. **Intentos de Quiz** (CRÍTICO)
**Archivos afectados:**
- `src/components/admin/analytics/HighLevelDashboard.tsx` - `quiz-attempts`
- `src/components/admin/analytics/AssessmentReport.tsx` - `quiz-attempts`

**Impacto:**
- No se puede rastrear intentos de quiz
- Analytics de evaluaciones no funcionan

**Estado Backend:** ⚠️ No existe endpoint
**Acción:** Crear endpoint `/api/quiz-attempts`

---

### 11. **Mentoría** (CRÍTICO)
**Archivos afectados:**
- `src/components/admin/analytics/*` - `mentorship-pairings`
- `src/components/admin/MentorshipManagement.tsx` - Usa `user-profiles`

**Impacto:**
- Sistema de mentoría no persiste datos
- Parejas de mentoría no se guardan

**Estado Backend:** ✅ Ya existe `mentorship-requests`, `mentorship-sessions` containers
**Acción:** Usar endpoints existentes `/api/mentorship/*`

---

### 12. **Configuración de Empresa** (IMPORTANTE)
**Archivos afectados:**
- `src/hooks/use-certificates.ts` - `company-settings`
- `src/components/admin/BrandingManagement.tsx` - `branding-settings`

**Impacto:**
- Configuración no persiste entre sesiones
- Branding no se aplica consistentemente

**Estado Backend:** ⚠️ Podría estar en tenant settings
**Acción:** Agregar a modelo `Tenant` o crear endpoint `/api/company-settings`

---

## 🟡 DATOS LEGÍTIMOS - Pueden Quedarse en localStorage

### 1. **Preferencias de Idioma**
- `src/lib/i18n.ts` - `user-language`
- ✅ **Razón:** Preferencia de UI, no afecta datos de negocio

### 2. **Preferencias de Accesibilidad**
- `src/hooks/use-accessibility-preferences.ts` - `accessibility-profile`
- ✅ **Razón:** Preferencia personal de UI

### 3. **Preferencias de Notificaciones**
- `src/components/community/NotificationSettings.tsx` - `notification-preferences`
- ⚠️ **Nota:** Podría estar en Cosmos DB para sincronización entre dispositivos

### 4. **Auto-guardado Temporal**
- `src/hooks/use-auto-save.ts` - `autosave-${stateKey}`
- ✅ **Razón:** Cache temporal, se sincroniza con backend

### 5. **Sesión de Autenticación**
- `src/hooks/use-auth.ts` - `auth-session`
- ⚠️ **Nota:** Ya se maneja en `AuthContext` con localStorage (legítimo para token)

---

## 📋 Plan de Migración Priorizado

### Fase 1: CRÍTICO - Seguridad y Datos Core (1-2 días)
1. ✅ **Eliminar `employee-credentials`** - Ya migrado a backend auth
2. 🔴 **Migrar `user-progress`** - Usar API existente
3. 🔴 **Migrar `user-profiles`** - Usar modelo `User` del backend

### Fase 2: Funcionalidades Core (2-3 días)
4. 🔴 **Crear endpoints para `course-assignments`**
5. 🔴 **Crear endpoints para `groups`**
6. 🔴 **Migrar `certificates`**

### Fase 3: Features Avanzadas (3-4 días)
7. 🔴 **Crear endpoints para `forum`**
8. 🔴 **Crear endpoints para `achievements/badges`**
9. 🔴 **Crear endpoints para `quiz-attempts`**

### Fase 4: Analytics y Reporting (1-2 días)
10. 🔴 **Migrar todos los componentes de analytics a usar API**

---

## ⚠️ Componentes Obsoletos

Los siguientes componentes parecen ser versiones antiguas y deberían eliminarse o actualizarse:

1. `src/components/admin/CourseBuilder.tsx` - Usa `useKV` para cursos (ya existe `ModernCourseBuilder`)
2. `src/components/admin/CourseManagement.tsx.backup` - Archivo de backup
3. `src/components/admin/UserManagement.tsx` - Versión antigua (existe `UserManagementV2`)

---

## ✅ Estado Actual

### Ya Migrado a Cosmos DB:
- ✅ Cursos (`courses` container)
- ✅ Categorías (`categories` container)
- ✅ Usuarios (`users` container)
- ✅ Invitaciones (en `users` container)
- ✅ Tenants (`tenants` container)
- ✅ Mentoría (`mentorship-requests`, `mentorship-sessions` containers)
- ✅ Audit Logs (`audit-logs` container)

### Pendiente de Migración:
- 🔴 Progreso de usuarios
- 🔴 Asignaciones de cursos
- 🔴 Grupos de usuarios
- 🔴 Foros
- 🔴 Certificados
- 🔴 Logros/Badges
- 🔴 Intentos de quiz
- 🔴 Configuración de empresa

---

## 🎯 Recomendación

**Para producción inmediata:**
1. Los datos críticos ya migrados (cursos, usuarios, categorías) son suficientes para funcionalidad básica
2. Los componentes que usan `useKV` para datos críticos pueden seguir funcionando localmente mientras se migran
3. **URGENTE:** Eliminar cualquier uso de `employee-credentials` en localStorage (riesgo de seguridad)

**Para migración completa:**
- Seguir el plan de migración por fases
- Priorizar seguridad (credenciales) y datos core (progreso, perfiles)

