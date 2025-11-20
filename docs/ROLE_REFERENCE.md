# Referencia Rápida de Roles y Permisos

## 📊 Tabla de Comparación de Roles

| Capacidad | super-admin | tenant-admin | content-manager | user-manager | analytics-viewer | instructor | mentor | student |
|-----------|:-----------:|:------------:|:---------------:|:------------:|:----------------:|:----------:|:------:|:-------:|
| **Gestión de Tenants** |
| Crear tenants | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ver todos los tenants | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Acceder a otros tenants | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Gestión de Usuarios** |
| Crear usuarios | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver usuarios | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | 🟡 |
| Editar usuarios | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Eliminar usuarios | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cambiar roles | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Gestión de Cursos** |
| Crear cursos | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Ver cursos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editar cursos | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡 | ❌ | ❌ |
| Publicar cursos | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Archivar cursos | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Eliminar cursos | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Aprobación de Contenido** |
| Revisar contenido | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Aprobar contenido | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Rechazar contenido | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Grupos y Equipos** |
| Crear grupos | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Asignar usuarios a grupos | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Asignar cursos a grupos | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Analytics y Reportes** |
| Ver analytics globales | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Ver analytics de equipo | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver analytics propios | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Exportar reportes | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Gamificación** |
| Configurar sistema XP | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Crear badges | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Gestionar leaderboards | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Mentoría** |
| Configurar sistema | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ver todas las sesiones | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ver sesiones propias | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Aceptar solicitudes | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Calificar sesiones | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Configuración** |
| Configurar branding | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Configurar notificaciones | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Configurar integraciones | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Auditoría** |
| Ver audit logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Exportar audit logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Assets y Biblioteca** |
| Subir assets | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Gestionar assets | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡 | ❌ | ❌ |
| Eliminar assets | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Leyenda**:
- ✅ Tiene permiso completo
- 🟡 Tiene permiso limitado (solo propios recursos)
- ❌ No tiene permiso

---

## 🎯 Matriz Completa: Roles × Permisos

### super-admin 🔴
**Descripción**: Administración total de la plataforma. Acceso ilimitado.

**Todos los permisos** (70+):
```typescript
// TENANT MANAGEMENT
'tenants:create', 'tenants:read', 'tenants:update', 'tenants:delete', 'tenants:list-all'

// USER MANAGEMENT  
'users:create', 'users:read', 'users:update', 'users:delete', 'users:list', 
'users:change-role', 'users:change-status'

// COURSE MANAGEMENT
'courses:create', 'courses:read', 'courses:update', 'courses:delete', 
'courses:publish', 'courses:archive', 'courses:list-all', 'courses:list-own'

// CONTENT APPROVAL
'content:review', 'content:approve', 'content:reject', 'content:request-changes'

// ENROLLMENT
'enrollment:assign-individual', 'enrollment:assign-bulk', 
'enrollment:remove', 'enrollment:view'

// GROUPS & TEAMS
'groups:create', 'groups:read', 'groups:update', 'groups:delete',
'groups:assign-users', 'groups:assign-courses'

// ANALYTICS
'analytics:view-all', 'analytics:view-own', 'analytics:export',
'analytics:view-user-progress', 'analytics:view-course-stats', 'analytics:view-team-stats'

// GAMIFICATION
'gamification:configure-xp', 'gamification:create-badges', 'gamification:manage-leaderboards'

// MENTORSHIP
'mentorship:configure', 'mentorship:view-all-sessions', 'mentorship:view-own-sessions',
'mentorship:accept-requests', 'mentorship:rate-sessions'

// SETTINGS
'settings:branding', 'settings:notifications', 'settings:integrations',
'settings:languages', 'settings:compliance'

// AUDIT
'audit:view-logs', 'audit:export-logs'

// ASSETS
'assets:upload', 'assets:manage', 'assets:delete'
```

**Casos de uso**:
- Equipo de plataforma
- Soporte técnico nivel 3
- Operaciones de emergencia

---

### tenant-admin 🟠
**Descripción**: Administrador completo de un tenant. No puede acceder a otros tenants.

**Permisos** (60+):
```typescript
// TENANT (limitado)
'tenants:read', 'tenants:update'
// NO: 'tenants:create', 'tenants:delete', 'tenants:list-all'

// USER MANAGEMENT (completo)
'users:create', 'users:read', 'users:update', 'users:delete', 'users:list',
'users:change-role', 'users:change-status'

// COURSE MANAGEMENT (completo)
'courses:create', 'courses:read', 'courses:update', 'courses:delete',
'courses:publish', 'courses:archive', 'courses:list-all'

// CONTENT APPROVAL (completo)
'content:review', 'content:approve', 'content:reject', 'content:request-changes'

// ENROLLMENT (completo)
'enrollment:assign-individual', 'enrollment:assign-bulk',
'enrollment:remove', 'enrollment:view'

// GROUPS & TEAMS (completo)
'groups:create', 'groups:read', 'groups:update', 'groups:delete',
'groups:assign-users', 'groups:assign-courses'

// ANALYTICS (completo)
'analytics:view-all', 'analytics:view-own', 'analytics:export',
'analytics:view-user-progress', 'analytics:view-course-stats', 'analytics:view-team-stats'

// GAMIFICATION (completo)
'gamification:configure-xp', 'gamification:create-badges', 'gamification:manage-leaderboards'

// MENTORSHIP (completo)
'mentorship:configure', 'mentorship:view-all-sessions', 'mentorship:view-own-sessions',
'mentorship:accept-requests', 'mentorship:rate-sessions'

// SETTINGS (completo)
'settings:branding', 'settings:notifications', 'settings:integrations',
'settings:languages', 'settings:compliance'

// AUDIT (completo)
'audit:view-logs', 'audit:export-logs'

// ASSETS (completo)
'assets:upload', 'assets:manage', 'assets:delete'
```

**Casos de uso**:
- Director de capacitación
- Gerente de RH
- Administrador de organización

**Restricciones**:
- Solo accede a su tenant (`tenantId`)
- No puede crear super-admins
- No puede gestionar otros tenants

---

### content-manager 🟡
**Descripción**: Gestión completa de contenido educativo.

**Permisos** (25+):
```typescript
// COURSES (completo)
'courses:create', 'courses:read', 'courses:update', 'courses:delete',
'courses:publish', 'courses:archive', 'courses:list-all'

// CONTENT APPROVAL (completo)
'content:review', 'content:approve', 'content:reject', 'content:request-changes'

// ENROLLMENT (solo asignación)
'enrollment:assign-individual', 'enrollment:assign-bulk', 'enrollment:view'

// ANALYTICS (limitado a cursos)
'analytics:view-own', 'analytics:view-course-stats'

// MENTORSHIP (puede ser mentor)
'mentorship:view-own-sessions', 'mentorship:accept-requests', 'mentorship:rate-sessions'

// ASSETS (completo)
'assets:upload', 'assets:manage', 'assets:delete'

// GROUPS (solo asignar cursos)
'groups:assign-courses', 'groups:read'
```

**Casos de uso**:
- Coordinador de contenidos
- Diseñador instruccional senior
- Editor de cursos

**Restricciones**:
- No puede crear/gestionar usuarios
- No puede cambiar configuraciones del sistema
- No puede ver audit logs

---

### user-manager 🟢
**Descripción**: Gestión de usuarios y equipos.

**Permisos** (25+):
```typescript
// USER MANAGEMENT (completo excepto crear super-admin)
'users:create', 'users:read', 'users:update', 'users:delete', 'users:list',
'users:change-role', 'users:change-status'

// GROUPS & TEAMS (completo)
'groups:create', 'groups:read', 'groups:update', 'groups:delete',
'groups:assign-users', 'groups:assign-courses'

// ENROLLMENT (completo)
'enrollment:assign-individual', 'enrollment:assign-bulk',
'enrollment:remove', 'enrollment:view'

// ANALYTICS (enfocado en usuarios)
'analytics:view-own', 'analytics:view-user-progress', 'analytics:view-team-stats'

// MENTORSHIP (puede ser mentor)
'mentorship:view-own-sessions', 'mentorship:accept-requests', 'mentorship:rate-sessions'

// COURSES (solo lectura)
'courses:read'
```

**Casos de uso**:
- Coordinador de RH
- Gestor de equipos
- Administrador de usuarios

**Restricciones**:
- No puede crear cursos
- No puede publicar contenido
- No puede cambiar configuraciones del sistema
- No puede crear super-admins

---

### analytics-viewer 🔵
**Descripción**: Visualización de métricas sin capacidad de edición.

**Permisos** (10+):
```typescript
// ANALYTICS (completo de solo lectura)
'analytics:view-all', 'analytics:view-own', 'analytics:export',
'analytics:view-user-progress', 'analytics:view-course-stats', 'analytics:view-team-stats'

// LECTURA DE DATOS
'users:read', 'courses:read', 'groups:read'

// MENTORSHIP (vista)
'mentorship:view-own-sessions', 'mentorship:rate-sessions'
```

**Casos de uso**:
- Analista de datos
- Gerencia (solo visualización)
- Auditor interno

**Restricciones**:
- **SOLO LECTURA** en todo
- No puede modificar nada
- No puede crear/editar/eliminar recursos

---

### instructor 🟣
**Descripción**: Creador de contenido educativo. Requiere aprobación para publicar.

**Permisos** (15+):
```typescript
// COURSES (limitado a propios)
'courses:create', 'courses:update', 'courses:list-own'
// NO: 'courses:publish', 'courses:delete', 'courses:list-all'

// ASSETS (limitado)
'assets:upload', 'assets:manage'
// NO: 'assets:delete'

// ANALYTICS (solo propios)
'analytics:view-own', 'analytics:view-course-stats'

// MENTORSHIP (completo)
'mentorship:view-own-sessions', 'mentorship:accept-requests', 'mentorship:rate-sessions'

// LECTURA
'courses:read', 'users:read'
```

**Casos de uso**:
- Instructor
- Experto en materia (SME)
- Creador de contenido

**Restricciones**:
- No puede publicar cursos (requiere aprobación)
- No puede ver cursos de otros instructores
- No puede eliminar assets
- No puede gestionar usuarios

**Workflow típico**:
1. Instructor crea curso (status: 'draft')
2. Instructor solicita revisión
3. content-manager o tenant-admin revisa
4. content-manager aprueba y publica
5. Curso visible para estudiantes

---

### mentor 🟤
**Descripción**: Guía y soporte a estudiantes.

**Permisos** (10+):
```typescript
// MENTORSHIP (enfocado)
'mentorship:view-own-sessions', 'mentorship:accept-requests', 'mentorship:rate-sessions'

// ANALYTICS (limitado)
'analytics:view-own', 'analytics:view-user-progress'

// LECTURA
'courses:read', 'users:read'
```

**Casos de uso**:
- Mentor
- Tutor
- Coach

**Restricciones**:
- No puede crear contenido
- No puede gestionar usuarios
- Solo ve sesiones de mentoría propias

---

### student ⚪
**Descripción**: Experiencia de aprendizaje. Permisos mínimos.

**Permisos** (8):
```typescript
// COURSES (lectura)
'courses:read'

// ANALYTICS (solo propios)
'analytics:view-own'

// MENTORSHIP (participación)
'mentorship:view-own-sessions', 'mentorship:rate-sessions'

// BASIC READ
'users:read' // Solo para ver perfiles públicos
```

**Casos de uso**:
- Estudiante
- Empleado en capacitación
- Usuario final

**Restricciones**:
- No puede crear nada
- No puede gestionar recursos
- Solo accede a contenido asignado

---

## 🔄 Comparación de Permisos por Categoría

### Gestión de Tenants

| Permiso | super-admin | tenant-admin | Otros |
|---------|:-----------:|:------------:|:-----:|
| `tenants:create` | ✅ | ❌ | ❌ |
| `tenants:read` | ✅ | ✅ | ❌ |
| `tenants:update` | ✅ | ✅ | ❌ |
| `tenants:delete` | ✅ | ❌ | ❌ |
| `tenants:list-all` | ✅ | ❌ | ❌ |

---

### Gestión de Usuarios

| Permiso | super-admin | tenant-admin | user-manager | content-manager | analytics-viewer | instructor | mentor | student |
|---------|:-----------:|:------------:|:------------:|:---------------:|:----------------:|:----------:|:------:|:-------:|
| `users:create` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `users:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `users:update` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `users:delete` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `users:list` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `users:change-role` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `users:change-status` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

### Gestión de Cursos

| Permiso | super-admin | tenant-admin | content-manager | user-manager | analytics-viewer | instructor | mentor | student |
|---------|:-----------:|:------------:|:---------------:|:------------:|:----------------:|:----------:|:------:|:-------:|
| `courses:create` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `courses:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `courses:update` | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡 | ❌ | ❌ |
| `courses:delete` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `courses:publish` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `courses:archive` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `courses:list-all` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `courses:list-own` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

🟡 = Solo cursos propios

---

### Analytics

| Permiso | super-admin | tenant-admin | content-manager | user-manager | analytics-viewer | instructor | mentor | student |
|---------|:-----------:|:------------:|:---------------:|:------------:|:----------------:|:----------:|:------:|:-------:|
| `analytics:view-all` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `analytics:view-own` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `analytics:export` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `analytics:view-user-progress` | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `analytics:view-course-stats` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `analytics:view-team-stats` | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🤔 Árbol de Decisión: ¿Qué Rol Usar?

```
┌─ ¿Necesita acceder a TODOS los tenants?
│  ├─ SÍ → super-admin 🔴
│  └─ NO ↓
│
├─ ¿Necesita administrar TODO en su tenant?
│  ├─ SÍ → tenant-admin 🟠
│  └─ NO ↓
│
├─ ¿Responsabilidad principal?
│  │
│  ├─ Gestión de CONTENIDO (cursos) → content-manager 🟡
│  │
│  ├─ Gestión de USUARIOS y equipos → user-manager 🟢
│  │
│  ├─ Solo VISUALIZACIÓN de analytics → analytics-viewer 🔵
│  │
│  ├─ CREAR contenido (requiere aprobación) → instructor 🟣
│  │
│  ├─ GUIAR estudiantes (mentoría) → mentor 🟤
│  │
│  └─ APRENDER (usuario final) → student ⚪
```

---

## 🔀 Combinaciones Comunes con Custom Permissions

### Instructor Senior
**Base**: `instructor`  
**Custom**: `['courses:publish']`

**Resultado**: Puede crear Y publicar sin aprobación

```typescript
{
  role: 'instructor',
  customPermissions: ['courses:publish']
}
```

---

### Team Lead
**Base**: `user-manager`  
**Custom**: `['analytics:view-all', 'analytics:export']`

**Resultado**: Gestión de usuarios + analytics completos

```typescript
{
  role: 'user-manager',
  customPermissions: ['analytics:view-all', 'analytics:export']
}
```

---

### Content Creator con Mentoría
**Base**: `content-manager`  
**Custom**: `['mentorship:accept-requests', 'mentorship:view-own-sessions']`

**Resultado**: Gestión de contenido + puede ser mentor

```typescript
{
  role: 'content-manager',
  customPermissions: [
    'mentorship:accept-requests',
    'mentorship:view-own-sessions',
    'mentorship:rate-sessions'
  ]
}
```

---

### Analista con Gestión de Grupos
**Base**: `analytics-viewer`  
**Custom**: `['groups:create', 'groups:assign-users', 'groups:assign-courses']`

**Resultado**: Analytics + organización de equipos

```typescript
{
  role: 'analytics-viewer',
  customPermissions: [
    'groups:create',
    'groups:assign-users',
    'groups:assign-courses'
  ]
}
```

---

## 📋 Checklist de Implementación

### Para Crear un Nuevo Usuario

```typescript
// 1. Determinar rol base
const role: UserRole = 'instructor'; // Ver árbol de decisión

// 2. Verificar permisos del rol
const perms = ROLE_PERMISSIONS[role];
console.log('Permisos incluidos:', perms);

// 3. Identificar permisos adicionales necesarios
const customPermissions: string[] = [];

// 4. Validar que custom permissions son necesarios
// ⚠️ No usar custom permissions para crear "super users"
if (needsPublishWithoutApproval) {
  customPermissions.push('courses:publish');
}

// 5. Crear usuario
const newUser = await createUser({
  email: 'usuario@example.com',
  role,
  customPermissions,
  tenantId: 'tenant-123',
  // ... otros campos
});

// 6. Documentar razón de custom permissions
await logPermissionGrant(
  adminUser,
  newUser,
  customPermissions,
  'Instructor senior no requiere aprobación - TICKET-456'
);
```

---

### Para Cambiar Rol de Usuario Existente

```typescript
// 1. Verificar permiso para cambiar rol
if (!hasPermission(adminUser.role, 'users:change-role', adminUser.customPermissions)) {
  throw new Error('Sin permiso para cambiar roles');
}

// 2. Validar que no intenta crear super-admin sin ser super-admin
if (newRole === 'super-admin' && adminUser.role !== 'super-admin') {
  throw new Error('Solo super-admin puede crear otros super-admins');
}

// 3. Cambiar rol
await changeUserRole(userId, newRole, adminUser.id);

// 4. Revisar custom permissions
// ¿Los custom permissions siguen siendo necesarios con el nuevo rol?
if (user.customPermissions?.length) {
  console.log('⚠️ Revisar custom permissions:', user.customPermissions);
}

// 5. Auditar cambio
await logRoleChange(
  adminUser,
  user,
  user.role, // old role
  newRole,   // new role
  'Promoción a content-manager - TICKET-789'
);
```

---

## 🔍 Referencias Rápidas

### Por Caso de Uso

| Caso de Uso | Rol Recomendado |
|-------------|-----------------|
| Administrador de plataforma | super-admin 🔴 |
| Director de capacitación | tenant-admin 🟠 |
| Coordinador de contenidos | content-manager 🟡 |
| Coordinador de RH | user-manager 🟢 |
| Analista de datos | analytics-viewer 🔵 |
| Experto creando cursos | instructor 🟣 |
| Guía de estudiantes | mentor 🟤 |
| Empleado en capacitación | student ⚪ |

---

### Por Necesidad Específica

| Necesidad | Rol o Custom Permission |
|-----------|-------------------------|
| Publicar cursos | tenant-admin, content-manager O instructor + custom |
| Cambiar roles de usuarios | tenant-admin, user-manager |
| Ver analytics de toda la org | tenant-admin, analytics-viewer |
| Crear usuarios | tenant-admin, user-manager |
| Configurar branding | tenant-admin |
| Ver audit logs | tenant-admin |
| Crear grupos | tenant-admin, user-manager |
| Aprobar contenido | tenant-admin, content-manager |
| Ser mentor | instructor, mentor O custom permission |

---

## 📖 Documentación Relacionada

- **Guía de Desarrollo**: `docs/PERMISSIONS_GUIDE.md` - Uso detallado del sistema
- **Testing**: `docs/TESTING_SUMMARY.md` - Suite completa de tests
- **Audit Logging**: `docs/AUDIT_LOGGING_SUMMARY.md` - Sistema de auditoría
- **Architecture**: `docs/ADMIN_ARCHITECTURE.md` - Arquitectura general

---

## 🏷️ Versión

**v1.0.0** (2024-11-20)
- 8 roles definidos
- 70+ permisos implementados
- Custom permissions soportados
- Matriz completa documentada

---

**Preguntas**: Ver `docs/PERMISSIONS_GUIDE.md` para ejemplos de código y troubleshooting.
