# Guía de Desarrollo - Sistema de Permisos

## 📋 Índice

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Los 8 Roles del Sistema](#los-8-roles-del-sistema)
4. [Los 70+ Permisos Disponibles](#los-70-permisos-disponibles)
5. [Uso en Backend](#uso-en-backend)
6. [Uso en Frontend](#uso-en-frontend)
7. [Custom Permissions](#custom-permissions)
8. [Ejemplos Prácticos](#ejemplos-prácticos)
9. [Testing](#testing)
10. [Audit Logging](#audit-logging)
11. [Mejores Prácticas](#mejores-prácticas)
12. [Troubleshooting](#troubleshooting)

---

## Introducción

AccessLearn implementa un sistema de permisos granular basado en **RBAC (Role-Based Access Control)** con soporte para **permisos personalizados**. Este sistema permite:

- ✅ Control fino de acceso a recursos
- ✅ 8 roles predefinidos con responsabilidades claras
- ✅ 70+ permisos específicos organizados por dominio
- ✅ Permisos personalizados por usuario
- ✅ Multi-tenancy con aislamiento de datos
- ✅ Audit logging completo de cambios críticos

### ¿Por Qué Este Sistema?

**Problema anterior**: Sistema simple con roles "admin" y "employee" que no permitía delegación de responsabilidades ni control fino.

**Solución actual**: Sistema granular que permite:
- Delegar gestión de usuarios sin dar acceso a configuración
- Crear contenido sin poder publicarlo
- Ver analytics sin poder modificar datos
- Otorgar permisos específicos sin cambiar roles

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
├─────────────────────────────────────────────────────────┤
│  • usePermissions()        → Verifica permisos          │
│  • useHasRole()            → Verifica roles             │
│  • <RequirePermission>     → Renderizado condicional    │
│  • <RequireRole>           → Protección de componentes  │
└─────────────────────────────────────────────────────────┘
                            ↓ API Calls
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Express)                      │
├─────────────────────────────────────────────────────────┤
│  • requireAuth             → Autenticación JWT          │
│  • requireRole             → Validación de rol          │
│  • requirePermission       → Validación de permiso      │
│  • auditCreate/Update      → Logging automático         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              PERMISSION SERVICE (Core Logic)             │
├─────────────────────────────────────────────────────────┤
│  • ROLE_PERMISSIONS        → Matriz de permisos         │
│  • hasPermission()         → Lógica de verificación     │
│  • canAccessResource()     → Control de recursos        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 COSMOS DB (Persistence)                  │
├─────────────────────────────────────────────────────────┤
│  • users (con customPermissions)                         │
│  • audit-logs (tracking de cambios)                     │
└─────────────────────────────────────────────────────────┘
```

---

## Los 8 Roles del Sistema

### 1. **super-admin** 🔴
**Propósito**: Administración total de la plataforma

**Capacidades**:
- Gestión de todos los tenants
- Acceso a cualquier tenant
- Todos los permisos disponibles (70+)
- Configuración global del sistema

**Casos de uso**:
- Equipo de plataforma
- Soporte técnico de nivel 3
- Operaciones de emergencia

**⚠️ Importante**: Solo crear super-admins para personal de confianza.

---

### 2. **tenant-admin** 🟠
**Propósito**: Administración completa de un tenant

**Capacidades**:
- Gestión de usuarios de su tenant
- Publicación de cursos
- Configuración de branding y settings
- Analytics completos
- Audit logs
- **NO** puede acceder a otros tenants
- **NO** puede crear/eliminar tenants

**Casos de uso**:
- Director de capacitación
- Gerente de RH
- Administrador de la organización

**Permisos clave**:
```typescript
'users:create', 'users:change-role', 'courses:publish',
'settings:branding', 'audit:view-logs'
```

---

### 3. **content-manager** 🟡
**Propósito**: Gestión completa de contenido educativo

**Capacidades**:
- Crear, editar, eliminar cursos
- Publicar cursos (sin necesitar aprobación)
- Aprobar/rechazar contenido de otros
- Gestión de assets
- Analytics de cursos

**Casos de uso**:
- Coordinador de contenidos
- Diseñador instruccional senior
- Editor de cursos

**Permisos clave**:
```typescript
'courses:create', 'courses:publish', 'content:approve',
'content:reject', 'assets:manage'
```

---

### 4. **user-manager** 🟢
**Propósito**: Gestión de usuarios y equipos

**Capacidades**:
- CRUD de usuarios
- Cambiar roles (excepto super-admin)
- Gestionar grupos y equipos
- Asignar cursos a usuarios
- Analytics de usuarios

**Casos de uso**:
- Coordinador de RH
- Gestor de equipos
- Administrador de usuarios

**Permisos clave**:
```typescript
'users:create', 'users:change-role', 'groups:create',
'enrollment:assign-bulk', 'analytics:view-user-progress'
```

---

### 5. **analytics-viewer** 🔵
**Propósito**: Visualización de métricas y reportes

**Capacidades**:
- Ver todos los analytics
- Exportar reportes
- Acceso de solo lectura

**Casos de uso**:
- Analista de datos
- Gerencia (solo visualización)
- Auditor interno

**Permisos clave**:
```typescript
'analytics:view-all', 'analytics:export',
'analytics:view-user-progress', 'analytics:view-course-stats'
```

---

### 6. **instructor** 🟣
**Propósito**: Creación de contenido educativo

**Capacidades**:
- Crear y editar sus propios cursos
- **NO** puede publicar (requiere aprobación)
- Ver analytics de sus cursos
- Mentoría de estudiantes

**Casos de uso**:
- Instructor
- Experto en materia (SME)
- Creador de contenido

**Permisos clave**:
```typescript
'courses:create', 'courses:update', 'courses:list-own',
'analytics:view-own', 'mentorship:accept-requests'
```

---

### 7. **mentor** 🟤
**Propósito**: Guía y soporte a estudiantes

**Capacidades**:
- Ver sesiones de mentoría
- Aceptar solicitudes de mentoría
- Calificar sesiones
- Ver progreso de estudiantes

**Casos de uso**:
- Mentor
- Tutor
- Coach

**Permisos clave**:
```typescript
'mentorship:view-own-sessions', 'mentorship:accept-requests',
'mentorship:rate-sessions', 'analytics:view-user-progress'
```

---

### 8. **student** ⚪
**Propósito**: Experiencia de aprendizaje

**Capacidades**:
- Ver cursos disponibles
- Acceder a contenido asignado
- Ver su propio progreso
- Participar en mentoría

**Casos de uso**:
- Estudiante
- Empleado en capacitación
- Usuario final

**Permisos clave**:
```typescript
'courses:read', 'analytics:view-own',
'mentorship:view-own-sessions', 'mentorship:rate-sessions'
```

---

## Los 70+ Permisos Disponibles

Los permisos siguen el formato: `recurso:acción`

### Tenant Management (5 permisos)
```typescript
'tenants:create'      // Crear nuevos tenants (solo super-admin)
'tenants:read'        // Ver información del tenant
'tenants:update'      // Actualizar configuración del tenant
'tenants:delete'      // Eliminar tenant (solo super-admin)
'tenants:list-all'    // Listar todos los tenants (solo super-admin)
```

### User Management (7 permisos)
```typescript
'users:create'        // Crear usuarios
'users:read'          // Ver usuarios
'users:update'        // Actualizar usuarios
'users:delete'        // Eliminar usuarios
'users:list'          // Listar usuarios
'users:change-role'   // Cambiar roles de usuarios
'users:change-status' // Activar/desactivar usuarios
```

### Course Management (8 permisos)
```typescript
'courses:create'      // Crear cursos
'courses:read'        // Ver cursos
'courses:update'      // Editar cursos
'courses:delete'      // Eliminar cursos
'courses:publish'     // Publicar cursos (hacer visibles)
'courses:archive'     // Archivar cursos
'courses:list-all'    // Ver todos los cursos
'courses:list-own'    // Ver solo cursos propios
```

### Content Approval (4 permisos)
```typescript
'content:review'           // Revisar contenido pendiente
'content:approve'          // Aprobar contenido
'content:reject'           // Rechazar contenido
'content:request-changes'  // Solicitar cambios
```

### Enrollment & Assignment (4 permisos)
```typescript
'enrollment:assign-individual'  // Asignar curso a 1 usuario
'enrollment:assign-bulk'        // Asignar curso a múltiples usuarios
'enrollment:remove'             // Remover asignación
'enrollment:view'               // Ver asignaciones
```

### Groups & Teams (6 permisos)
```typescript
'groups:create'        // Crear grupos
'groups:read'          // Ver grupos
'groups:update'        // Editar grupos
'groups:delete'        // Eliminar grupos
'groups:assign-users'  // Asignar usuarios a grupos
'groups:assign-courses'// Asignar cursos a grupos
```

### Analytics & Reports (6 permisos)
```typescript
'analytics:view-all'            // Ver todos los analytics
'analytics:view-own'            // Ver solo propios analytics
'analytics:export'              // Exportar reportes
'analytics:view-user-progress'  // Ver progreso de usuarios
'analytics:view-course-stats'   // Ver estadísticas de cursos
'analytics:view-team-stats'     // Ver estadísticas de equipos
```

### Gamification (3 permisos)
```typescript
'gamification:configure-xp'        // Configurar sistema XP
'gamification:create-badges'       // Crear badges
'gamification:manage-leaderboards' // Gestionar leaderboards
```

### Mentorship (5 permisos)
```typescript
'mentorship:configure'          // Configurar sistema de mentoría
'mentorship:view-all-sessions'  // Ver todas las sesiones
'mentorship:view-own-sessions'  // Ver sesiones propias
'mentorship:accept-requests'    // Aceptar solicitudes
'mentorship:rate-sessions'      // Calificar sesiones
```

### Settings & Configuration (5 permisos)
```typescript
'settings:branding'       // Configurar branding
'settings:notifications'  // Configurar notificaciones
'settings:integrations'   // Configurar integraciones
'settings:languages'      // Configurar idiomas
'settings:compliance'     // Configurar compliance
```

### Audit & Logs (2 permisos)
```typescript
'audit:view-logs'    // Ver logs de auditoría
'audit:export-logs'  // Exportar logs
```

### Assets & Library (3 permisos)
```typescript
'assets:upload'   // Subir assets
'assets:manage'   // Gestionar assets
'assets:delete'   // Eliminar assets
```

---

## Uso en Backend

### 1. Proteger Endpoints con Roles

```typescript
import { requireAuth, requireRole } from './middleware/authorization';

// Solo super-admin y tenant-admin
app.get('/api/users', 
  requireAuth, 
  requireRole('super-admin', 'tenant-admin'),
  async (req, res) => {
    // Handler
  }
);
```

### 2. Proteger Endpoints con Permisos

```typescript
import { requireAuth, requirePermission } from './middleware/authorization';

// Cualquier usuario con el permiso
app.post('/api/courses', 
  requireAuth, 
  requirePermission('courses:create'),
  async (req, res) => {
    // Handler
  }
);
```

### 3. Verificar Permisos en Lógica de Negocio

```typescript
import { hasPermission } from './services/permissions.service';

async function publishCourse(userId: string, courseId: string) {
  const user = await getUser(userId);
  
  if (!hasPermission(user.role, 'courses:publish', user.customPermissions)) {
    throw new Error('No tienes permiso para publicar cursos');
  }
  
  // Publicar curso...
}
```

### 4. Proteger Acceso a Tenant

```typescript
import { requireAuth, requireTenantAccess } from './middleware/authorization';

// Verifica que user.tenantId === req.params.tenantId
// O que sea super-admin
app.get('/api/tenants/:tenantId/courses',
  requireAuth,
  requireTenantAccess,
  async (req, res) => {
    // Handler
  }
);
```

### 5. Cadena de Middlewares

```typescript
app.post('/api/users/:userId/role',
  requireAuth,                           // 1. Usuario autenticado
  requirePermission('users:change-role'),// 2. Tiene permiso
  requireTenantAccess,                   // 3. Mismo tenant
  auditRoleChange(),                     // 4. Registra cambio
  async (req, res) => {
    // Handler
  }
);
```

---

## Uso en Frontend

### 1. Hooks de Permisos

```tsx
import { usePermissions } from '@/hooks/use-permissions';

function CreateCourseButton() {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission('courses:create')) {
    return null; // No renderizar si no tiene permiso
  }
  
  return <button>Crear Curso</button>;
}
```

### 2. Hook de Roles

```tsx
import { useHasRole } from '@/hooks/use-permissions';

function AdminPanel() {
  const hasRole = useHasRole('super-admin', 'tenant-admin');
  
  if (!hasRole) {
    return <div>Acceso Denegado</div>;
  }
  
  return <div>Panel de Administración</div>;
}
```

### 3. Componente RequirePermission

```tsx
import { RequirePermission } from '@/components/auth/RequirePermission';

function CoursePage() {
  return (
    <div>
      <h1>Curso de React</h1>
      
      <RequirePermission permission="courses:update">
        <button>Editar Curso</button>
      </RequirePermission>
      
      <RequirePermission 
        permission="courses:delete"
        fallback={<div>No puedes eliminar este curso</div>}
      >
        <button>Eliminar Curso</button>
      </RequirePermission>
    </div>
  );
}
```

### 4. Componente RequireRole

```tsx
import { RequireRole } from '@/components/auth/RequireRole';

function Dashboard() {
  return (
    <div>
      <RequireRole roles={['tenant-admin', 'super-admin']}>
        <AdminSection />
      </RequireRole>
      
      <RequireRole roles="instructor">
        <InstructorSection />
      </RequireRole>
      
      <RequireRole roles="student">
        <StudentSection />
      </RequireRole>
    </div>
  );
}
```

### 5. Múltiples Permisos

```tsx
import { RequirePermission } from '@/components/auth/RequirePermission';

// ANY logic (default): Si tiene alguno de los permisos
<RequirePermission permission={['courses:create', 'courses:publish']}>
  <CourseActions />
</RequirePermission>

// ALL logic: Debe tener todos los permisos
<RequirePermission 
  permission={['users:create', 'users:change-role']}
  requireAll={true}
>
  <FullUserManagement />
</RequirePermission>
```

### 6. Rutas Protegidas

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute roles={['super-admin', 'tenant-admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/courses/create" 
        element={
          <ProtectedRoute permission="courses:create">
            <CreateCourse />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

---

## Custom Permissions

### ¿Cuándo Usar Custom Permissions?

**Casos de uso válidos**:
- ✅ Instructor senior que puede publicar sin aprobación
- ✅ Team lead con acceso a analytics globales
- ✅ Content creator con capacidades de mentor
- ✅ Usuario temporal con permisos específicos

**Evitar**:
- ❌ Crear "super users" con todos los permisos
- ❌ Usar en lugar de crear un nuevo rol
- ❌ Otorgar permisos sin justificación

### Backend: Otorgar Custom Permission

```typescript
import { updateUser } from './functions/UserFunctions';

async function grantCustomPermission(
  userId: string, 
  permission: string
) {
  const user = await getUser(userId);
  
  const customPermissions = user.customPermissions || [];
  
  if (!customPermissions.includes(permission)) {
    customPermissions.push(permission);
    
    await updateUser(userId, {
      customPermissions
    });
    
    // Log para auditoría
    await logPermissionGrant(
      adminUser,
      user,
      permission
    );
  }
}
```

### Frontend: Verificar Custom Permission

```tsx
function AdvancedFeature() {
  const { user, hasPermission } = usePermissions();
  
  // El usuario es student pero tiene custom permission
  const canPublish = hasPermission('courses:publish');
  
  return (
    <div>
      <p>Role: {user?.role}</p>
      <p>Can Publish: {canPublish ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### UI para Gestionar Custom Permissions

```tsx
function UserPermissionsEditor({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [selectedPermission, setSelectedPermission] = useState('');
  
  const grantPermission = async () => {
    await fetch(`/api/users/${userId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ permission: selectedPermission }),
    });
    
    // Refresh user
  };
  
  const revokePermission = async (permission: string) => {
    await fetch(`/api/users/${userId}/permissions/${permission}`, {
      method: 'DELETE',
    });
    
    // Refresh user
  };
  
  return (
    <div>
      <h3>Custom Permissions</h3>
      
      <div>
        <h4>Permisos Actuales:</h4>
        {user?.customPermissions?.map(perm => (
          <div key={perm}>
            {perm}
            <button onClick={() => revokePermission(perm)}>
              Revocar
            </button>
          </div>
        ))}
      </div>
      
      <div>
        <h4>Otorgar Nuevo Permiso:</h4>
        <select 
          value={selectedPermission}
          onChange={e => setSelectedPermission(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          <option value="courses:publish">Publicar Cursos</option>
          <option value="analytics:view-all">Ver Todos los Analytics</option>
          {/* ... más opciones */}
        </select>
        <button onClick={grantPermission}>Otorgar</button>
      </div>
    </div>
  );
}
```

---

## Ejemplos Prácticos

### Ejemplo 1: Sistema de Aprobación de Cursos

```typescript
// Backend endpoint
app.post('/api/courses/:courseId/publish',
  requireAuth,
  requirePermission('courses:publish'),
  auditCoursePublish(),
  async (req, res) => {
    const { courseId } = req.params;
    const user = req.user!;
    
    // Publicar curso
    await publishCourse(courseId, user.id);
    
    res.json({ success: true });
  }
);

// Frontend
function CourseActions({ course }: { course: Course }) {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      {/* Instructor puede editar */}
      <RequirePermission permission="courses:update">
        <button onClick={() => editCourse(course.id)}>
          Editar
        </button>
      </RequirePermission>
      
      {/* Solo quien puede publicar ve este botón */}
      <RequirePermission permission="courses:publish">
        <button onClick={() => publishCourse(course.id)}>
          Publicar
        </button>
      </RequirePermission>
    </div>
  );
}
```

### Ejemplo 2: Delegación de Gestión de Usuarios

```typescript
// user-manager puede crear usuarios pero NO cambiar a super-admin
app.post('/api/users/:userId/role',
  requireAuth,
  requirePermission('users:change-role'),
  requireRoleChangePermission(), // Valida que no intente crear super-admin
  auditRoleChange(),
  async (req, res) => {
    const { userId } = req.params;
    const { newRole } = req.body;
    const actor = req.user!;
    
    // Cambiar rol
    await changeUserRole(userId, newRole, actor.id);
    
    res.json({ success: true });
  }
);
```

### Ejemplo 3: Analytics con Visibilidad Limitada

```typescript
// Frontend: Diferentes vistas según permisos
function AnalyticsDashboard() {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      <h1>Analytics</h1>
      
      {/* Todos pueden ver sus propios analytics */}
      {hasPermission('analytics:view-own') && (
        <MyProgress />
      )}
      
      {/* Team leads ven estadísticas de su equipo */}
      {hasPermission('analytics:view-team-stats') && (
        <TeamStats />
      )}
      
      {/* Admins ven todo */}
      {hasPermission('analytics:view-all') && (
        <GlobalAnalytics />
      )}
      
      {/* Solo algunos pueden exportar */}
      {hasPermission('analytics:export') && (
        <ExportButton />
      )}
    </div>
  );
}
```

---

## Testing

### Backend: Test de Permisos

```typescript
import { hasPermission } from './services/permissions.service';

describe('Permission System', () => {
  it('should allow tenant-admin to create users', () => {
    expect(hasPermission('tenant-admin', 'users:create')).toBe(true);
  });
  
  it('should deny student from creating users', () => {
    expect(hasPermission('student', 'users:create')).toBe(false);
  });
  
  it('should allow custom permissions', () => {
    expect(
      hasPermission('student', 'courses:publish', ['courses:publish'])
    ).toBe(true);
  });
});
```

### Frontend: Test de Componentes

```tsx
import { render, screen } from '@testing-library/react';
import { RequirePermission } from './RequirePermission';

describe('RequirePermission', () => {
  it('should render when user has permission', () => {
    mockUser({ role: 'instructor' });
    
    render(
      <RequirePermission permission="courses:create">
        <div>Create Course</div>
      </RequirePermission>
    );
    
    expect(screen.getByText('Create Course')).toBeInTheDocument();
  });
  
  it('should not render when user lacks permission', () => {
    mockUser({ role: 'student' });
    
    render(
      <RequirePermission permission="courses:create">
        <div>Create Course</div>
      </RequirePermission>
    );
    
    expect(screen.queryByText('Create Course')).not.toBeInTheDocument();
  });
});
```

Ver `docs/TESTING_SUMMARY.md` para suite completa de tests.

---

## Audit Logging

El sistema registra automáticamente cambios críticos relacionados con permisos.

### Eventos Auditados

```typescript
// Cambios de rol (siempre auditados)
'user:role-change'

// Otorgamiento/revocación de permisos
'user:permission-grant'
'user:permission-revoke'

// Accesos denegados (seguridad)
'security:access-denied'

// Publicaciones (compliance)
'course:publish'
```

### Consultar Audit Logs

```typescript
// Backend
import { getAuditLogs } from './functions/AuditFunctions';

const roleChanges = await getAuditLogs('tenant-123', {
  action: 'user:role-change',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});

// Frontend
const response = await fetch(
  `/api/audit/logs?tenantId=${tenantId}&action=user:role-change`
);
const logs = await response.json();
```

Ver `docs/AUDIT_LOGGING_SUMMARY.md` para documentación completa.

---

## Mejores Prácticas

### ✅ DO

1. **Usar el rol más específico**
   ```typescript
   // ✅ Bueno
   requireRole('content-manager')
   
   // ❌ Evitar
   requireRole('tenant-admin') // Demasiado permisivo
   ```

2. **Verificar permisos específicos**
   ```typescript
   // ✅ Bueno
   requirePermission('courses:publish')
   
   // ❌ Evitar
   requireRole('tenant-admin') // Rol en lugar de permiso
   ```

3. **Combinar múltiples checks**
   ```typescript
   // ✅ Bueno: Auth + Permission + Tenant + Audit
   app.post('/api/courses/:id/publish',
     requireAuth,
     requirePermission('courses:publish'),
     requireTenantAccess,
     auditCoursePublish(),
     handler
   );
   ```

4. **Usar custom permissions con moderación**
   ```typescript
   // ✅ Bueno: Caso excepcional documentado
   // Instructor senior que no requiere aprobación
   customPermissions: ['courses:publish']
   
   // ❌ Evitar: Usuario con permisos de admin
   customPermissions: [
     'users:create', 'users:delete', 'courses:delete', ...
   ]
   ```

5. **Documentar decisiones de permisos**
   ```typescript
   // ✅ Bueno
   /**
    * Permite a instructors crear cursos.
    * Los cursos requieren aprobación antes de publicarse.
    * Requerimiento: TICKET-123
    */
   requirePermission('courses:create')
   ```

### ❌ DON'T

1. **No hardcodear roles en múltiples lugares**
   ```typescript
   // ❌ Mal
   if (user.role === 'tenant-admin' || user.role === 'super-admin') {
     // ...
   }
   
   // ✅ Bueno
   if (hasPermission(user.role, 'users:create', user.customPermissions)) {
     // ...
   }
   ```

2. **No confiar solo en el frontend**
   ```typescript
   // ❌ Mal: Solo protección en frontend
   <RequirePermission permission="users:delete">
     <DeleteButton onClick={() => api.deleteUser(id)} />
   </RequirePermission>
   
   // ✅ Bueno: Backend también protegido
   app.delete('/api/users/:id',
     requireAuth,
     requirePermission('users:delete'),
     handler
   );
   ```

3. **No crear "god users"**
   ```typescript
   // ❌ Mal
   customPermissions: getAllPermissions()
   
   // ✅ Bueno: Usar super-admin role
   role: 'super-admin'
   ```

4. **No ignorar tenant isolation**
   ```typescript
   // ❌ Mal
   const users = await getAllUsers(); // Todos los tenants
   
   // ✅ Bueno
   const users = await getUsersByTenant(req.user.tenantId);
   ```

---

## Troubleshooting

### Problema: Usuario no puede acceder a recurso

**Síntoma**: 403 Forbidden

**Diagnóstico**:
```typescript
// 1. Verificar rol del usuario
console.log('User role:', user.role);

// 2. Verificar permisos del rol
const perms = ROLE_PERMISSIONS[user.role];
console.log('Role permissions:', perms);

// 3. Verificar permiso específico
const hasIt = hasPermission(user.role, 'courses:create', user.customPermissions);
console.log('Has permission:', hasIt);

// 4. Verificar custom permissions
console.log('Custom permissions:', user.customPermissions);
```

**Soluciones**:
1. Cambiar rol del usuario
2. Otorgar custom permission
3. Ajustar endpoint para requerir permiso diferente

---

### Problema: Tests failing con permission errors

**Síntoma**: Tests de permisos fallan

**Solución**:
```typescript
// Asegurarse de usar formato correcto de User
const mockUser: User = {
  id: '1',
  tenantId: 'tenant-1',
  email: 'test@example.com',
  role: 'instructor',
  firstName: 'Test',
  lastName: 'User',
  passwordHash: 'hash',
  isActive: true,
  createdAt: new Date().toISOString(), // ✅ String, no Date
  lastLoginAt: new Date().toISOString(), // ✅ String, no Date
};

// Llamar hasPermission correctamente
hasPermission(
  mockUser.role,                    // ✅ UserRole
  'courses:create',                 // ✅ Permission
  mockUser.customPermissions        // ✅ string[] | undefined
);
```

---

### Problema: Audit logs no se generan

**Síntoma**: No aparecen logs de cambios críticos

**Diagnóstico**:
1. Verificar que middleware de audit está aplicado
2. Verificar container de Cosmos DB existe
3. Revisar logs del servidor

**Solución**:
```typescript
// Asegurarse que middleware está en la cadena
app.post('/api/users/:id/role',
  requireAuth,
  requirePermission('users:change-role'),
  auditRoleChange(), // ✅ Debe estar presente
  handler
);
```

---

## Recursos Adicionales

- **Matriz Completa de Roles**: `docs/ROLE_REFERENCE.md`
- **Testing Guide**: `docs/TESTING_SUMMARY.md`
- **Audit Logging**: `docs/AUDIT_LOGGING_SUMMARY.md`
- **Architecture Doc**: `docs/ADMIN_ARCHITECTURE.md`

---

## Changelog

**v1.0.0** (2024-11-20)
- Sistema completo de 8 roles
- 70+ permisos granulares
- Custom permissions support
- Audit logging integrado
- Frontend + Backend protection
- Suite completa de tests

---

**Preguntas o Problemas**: Revisar `docs/ROLE_REFERENCE.md` o contactar al equipo de desarrollo.
