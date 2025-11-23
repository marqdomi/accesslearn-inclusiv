# 🔑 Credenciales de Usuarios de Prueba - AccessLearn

**Tenant:** Kainet  
**Slug:** `kainet`  
**Última Actualización:** 23 de Noviembre, 2025

---

## 📋 RESUMEN RÁPIDO

**Password para TODOS los usuarios:** `Demo123!`

| Rol | Email | Nombre | Estado |
|-----|-------|--------|--------|
| Super Admin | `ana.lopez@kainet.mx` | Ana López Torres | ✅ Activo |
| Tenant Admin | `admin.tenant@kainet.mx` | Roberto Martínez | ✅ Activo |
| Content Manager | `carlos.content@kainet.mx` | Carlos García | ✅ Activo |
| User Manager | `laura.users@kainet.mx` | Laura Sánchez | ✅ Activo |
| Analytics Viewer | `pedro.analytics@kainet.mx` | Pedro González | ✅ Activo |
| Instructor | `maria.instructor@kainet.mx` | María Rodríguez | ✅ Activo |
| Mentor | `carlos.mentor@kainet.mx` | Carlos Hernández | ✅ Activo |
| Student | `juan.student@kainet.mx` | Juan Pérez | ✅ Activo |

---

## 👤 DETALLE POR ROL

### 1. Super Admin
```
Email:    ana.lopez@kainet.mx
Password: Demo123!
Nombre:   Ana López Torres
Rol:      super-admin
```
**Permisos:** Acceso completo a nivel plataforma (multi-tenant)
- ✅ Crear/editar/eliminar tenants
- ✅ Acceso a todos los recursos
- ✅ Gestión de usuarios en cualquier tenant
- ✅ Configuración de plataforma

**Uso para Testing:**
- Testing de multi-tenancy
- Testing de permisos de super-admin
- Testing de gestión de tenants

---

### 2. Tenant Admin
```
Email:    admin.tenant@kainet.mx
Password: Demo123!
Nombre:   Roberto Martínez
Rol:      tenant-admin
```
**Permisos:** Administrador completo de la organización
- ✅ Gestión completa de usuarios del tenant
- ✅ Configuración de branding
- ✅ Acceso a analytics completos
- ✅ Gestión de cursos y contenido
- ✅ Configuración de seguridad

**Uso para Testing:**
- Testing de configuración de tenant
- Testing de gestión de usuarios
- Testing de panel de administración

---

### 3. Content Manager
```
Email:    carlos.content@kainet.mx
Password: Demo123!
Nombre:   Carlos García
Rol:      content-manager
```
**Permisos:** Gestión de cursos y contenido
- ✅ Crear, editar, eliminar cursos
- ✅ Aprobar/rechazar cursos de instructores
- ✅ Gestionar categorías
- ✅ Ver analytics de contenido

**Uso para Testing:**
- Testing de workflow de aprobación de cursos
- Testing de gestión de contenido
- Testing de Content Manager Dashboard

---

### 4. User Manager
```
Email:    laura.users@kainet.mx
Password: Demo123!
Nombre:   Laura Sánchez
Rol:      user-manager
```
**Permisos:** Gestión de usuarios y equipos
- ✅ Crear, editar, eliminar usuarios
- ✅ Cambiar roles de usuarios
- ✅ Gestionar grupos
- ✅ Asignar cursos a usuarios/grupos
- ✅ Ver progreso de usuarios

**Uso para Testing:**
- Testing de gestión de usuarios
- Testing de grupos
- Testing de asignaciones de cursos

---

### 5. Analytics Viewer
```
Email:    pedro.analytics@kainet.mx
Password: Demo123!
Nombre:   Pedro González
Rol:      analytics-viewer
```
**Permisos:** Acceso solo lectura a analytics
- ✅ Ver todos los reportes
- ✅ Exportar datos
- ✅ Ver progreso de usuarios
- ✅ Ver estadísticas de cursos
- ❌ No puede modificar datos

**Uso para Testing:**
- Testing de visualización de analytics
- Testing de permisos de solo lectura
- Testing de exportación de reportes

---

### 6. Instructor
```
Email:    maria.instructor@kainet.mx
Password: Demo123!
Nombre:   María Rodríguez
Rol:      instructor
```
**Permisos:** Creación de cursos (con aprobación)
- ✅ Crear y editar cursos propios
- ✅ Ver cursos propios (todos los estados)
- ✅ Ver cursos publicados
- ✅ Enviar cursos para revisión
- ❌ No puede publicar directamente (requiere aprobación)

**Uso para Testing:**
- Testing de creación de cursos
- Testing de workflow de aprobación
- Testing de Modern Course Builder

---

### 7. Mentor
```
Email:    carlos.mentor@kainet.mx
Password: Demo123!
Nombre:   Carlos Hernández
Rol:      mentor
```
**Permisos:** Guía de estudiantes
- ✅ Ver solicitudes de mentoría
- ✅ Aceptar/rechazar solicitudes
- ✅ Ver sesiones de mentoría
- ✅ Calificar sesiones
- ✅ Ver progreso de estudiantes asignados

**Uso para Testing:**
- Testing de sistema de mentoría
- Testing de solicitudes de mentoría
- Testing de sesiones de mentoría

---

### 8. Student
```
Email:    juan.student@kainet.mx
Password: Demo123!
Nombre:   Juan Pérez
Rol:      student
```
**Permisos:** Experiencia de aprendizaje
- ✅ Ver cursos publicados
- ✅ Inscribirse en cursos
- ✅ Completar lecciones y quizzes
- ✅ Ver progreso propio
- ✅ Ver certificados propios
- ✅ Participar en foros
- ✅ Solicitar mentoría

**Uso para Testing:**
- Testing de experiencia de usuario
- Testing de inscripción y progreso
- Testing de gamificación
- Testing de certificados
- Testing de foros Q&A

---

## 🚀 CREAR/ACTUALIZAR USUARIOS DE PRUEBA

Para crear o actualizar todos los usuarios de prueba:

```bash
cd backend
npm run create-test-users-all-roles
```

Este script:
- ✅ Crea usuarios para TODOS los roles del sistema
- ✅ Actualiza usuarios existentes si ya existen
- ✅ Establece password: `Demo123!` para todos
- ✅ Marca usuarios como activos
- ✅ Asegura que todos los roles estén disponibles

---

## 📝 NOTAS IMPORTANTES

1. **Password Unificado:** Todos los usuarios tienen la misma contraseña (`Demo123!`) para facilitar el testing.

2. **Tenant:** Todos los usuarios pertenecen al tenant "Kainet" (slug: `kainet`).

3. **Estado:** Todos los usuarios están marcados como `active`.

4. **Password Reset:** Los usuarios NO requieren cambio de contraseña al primer login (para facilitar testing).

5. **Recrear Usuarios:** Si necesitas recrear los usuarios, simplemente ejecuta el script nuevamente. Actualizará usuarios existentes o creará nuevos según sea necesario.

---

## 🧪 CASOS DE USO PARA TESTING

### Testing de Roles y Permisos
- Usar cada usuario para verificar que solo puede acceder a funcionalidades permitidas
- Verificar que los permisos se aplican correctamente

### Testing de Workflows
- **Aprobación de Cursos:** Instructor crea → Content Manager aprueba
- **Mentoría:** Student solicita → Mentor acepta
- **Asignaciones:** User Manager asigna → Student ve curso

### Testing de Multi-Rol
- Probar funcionalidades que requieren interacción entre roles
- Verificar que cada rol ve la información correcta

---

## 🔗 REFERENCIAS

- **Guía de Testing Manual:** [TESTING_MANUAL_GUIA_COMPLETA.md](./TESTING_MANUAL_GUIA_COMPLETA.md)
- **Checklist Rápido:** [TESTING_MANUAL_CHECKLIST_RAPIDO.md](./TESTING_MANUAL_CHECKLIST_RAPIDO.md)
- **Script de Creación:** `backend/src/scripts/create-test-users-all-roles.ts`

---

**Última Actualización:** 23 de Noviembre, 2025

