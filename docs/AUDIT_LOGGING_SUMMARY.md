# Audit Logging System - Implementation Summary

## ✅ Sistema Completado

El sistema de audit logging está completamente implementado y funcional en AccessLearn.

### 🗄️ Cosmos DB Container

**Container**: `audit-logs`
- **Partition Key**: `/tenantId` (aislamiento por tenant)
- **TTL**: Deshabilitado (sin expiración automática, configurable)
- **Indexing**: Automático en todos los campos
- **Status**: ✅ Creado exitosamente

### 📦 Archivos Implementados

#### 1. Script de Setup
**`backend/scripts/createAuditLogsContainer.js`**
- Crea container en Cosmos DB
- Configurable TTL para auto-delete de logs antiguos
- Documentación del schema integrada

#### 2. Audit Functions
**`backend/src/functions/AuditFunctions.ts`** (450+ líneas)

**Tipos Exportados:**
- `AuditAction`: 25+ acciones auditables
- `AuditSeverity`: 'info' | 'warning' | 'critical'
- `AuditStatus`: 'success' | 'failure'
- `AuditLog`: Schema completo del log
- `AuditLogActor`, `AuditLogResource`, `AuditLogMetadata`

**Funciones Principales:**
```typescript
// Crear log de auditoría genérico
createAuditLog(tenantId, action, actor, resource, options)

// Obtener logs con filtros
getAuditLogs(tenantId, filters)

// Obtener log específico
getAuditLogById(logId, tenantId)

// Estadísticas de auditoría
getAuditStats(tenantId, period)

// Helpers especializados
logRoleChange(tenantId, actor, targetUser, oldRole, newRole)
logCoursePublish(tenantId, actor, course)
logAccessDenied(tenantId, actor, resource, requiredPermission)
```

**Filtros Disponibles:**
- `action`: Filtrar por acción específica o array de acciones
- `actorId`: Filtrar por usuario que realizó la acción
- `resourceType`: Filtrar por tipo de recurso ('user', 'course', etc.)
- `resourceId`: Filtrar por ID de recurso específico
- `severity`: Filtrar por severidad ('info', 'warning', 'critical')
- `status`: Filtrar por resultado ('success', 'failure')
- `startDate`: Fecha inicio del rango
- `endDate`: Fecha fin del rango
- `limit`: Límite de resultados (default: 100)

#### 3. Audit Middleware
**`backend/src/middleware/audit.ts`** (350+ líneas)

**Middlewares Exportados:**
```typescript
// Agregar metadata de auditoría al request
attachAuditMetadata(req, res, next)

// Auditar creación de recursos
auditCreate(resourceType, getResourceInfo?)

// Auditar actualizaciones
auditUpdate(resourceType, getResourceInfo?, captureChanges?)

// Auditar eliminaciones
auditDelete(resourceType, getResourceInfo?)

// Auditar accesos denegados
auditAccessDenied(resourceType)

// Helpers especializados
auditRoleChange()
auditCoursePublish()
```

**Metadata Capturada Automáticamente:**
- IP Address (de req.ip o x-forwarded-for)
- User Agent (navegador/cliente)
- Request ID (para tracking de requests)

#### 4. API Endpoints
**`backend/src/server.ts`**

```typescript
// GET /api/audit/logs - Obtener logs con filtros
// Requiere: requireAuth + audit:view-logs
// Query params: tenantId, action, actorId, resourceType, resourceId, 
//               severity, status, startDate, endDate, limit

// GET /api/audit/logs/:logId - Obtener log específico
// Requiere: requireAuth + audit:view-logs

// GET /api/audit/stats - Obtener estadísticas
// Requiere: requireAuth + audit:view-logs
// Query params: tenantId, period (day|week|month)
```

### 🎯 Acciones Auditables (25+)

#### User Management (7)
- `user:create` - Usuario creado
- `user:update` - Usuario actualizado
- `user:delete` - Usuario eliminado
- `user:role-change` - Cambio de rol ⚠️
- `user:status-change` - Cambio de status
- `user:permission-grant` - Permiso otorgado
- `user:permission-revoke` - Permiso revocado

#### Course Management (7)
- `course:create` - Curso creado
- `course:update` - Curso actualizado
- `course:delete` - Curso eliminado
- `course:publish` - Curso publicado ℹ️
- `course:archive` - Curso archivado
- `course:approve` - Curso aprobado
- `course:reject` - Curso rechazado

#### Enrollment (3)
- `enrollment:assign` - Asignación individual
- `enrollment:remove` - Remoción de enrollment
- `enrollment:bulk-assign` - Asignación en bulk

#### Tenant Management (3)
- `tenant:create` - Tenant creado
- `tenant:update` - Tenant actualizado
- `tenant:delete` - Tenant eliminado

#### Security (3)
- `security:access-denied` - Acceso denegado ⚠️
- `security:login-failed` - Login fallido
- `security:token-invalid` - Token inválido

#### Settings (2)
- `settings:update` - Configuración actualizada
- `settings:branding-change` - Cambio de branding

### 📊 Schema del Audit Log

```typescript
{
  id: string,              // UUID generado automáticamente
  tenantId: string,        // Partition key (aislamiento)
  timestamp: string,       // ISO 8601 (2024-11-20T15:30:00.000Z)
  action: AuditAction,     // Acción realizada
  actor: {                 // Usuario que realizó la acción
    userId: string,
    email: string,
    role: string,
    name: string
  },
  resource: {              // Recurso afectado
    type: string,          // 'user', 'course', 'tenant', etc.
    id: string,
    name?: string
  },
  changes?: {              // Cambios realizados (opcional)
    before: any,
    after: any
  },
  metadata?: {             // Metadata adicional
    ipAddress?: string,
    userAgent?: string,
    requestId?: string,
    [key: string]: any
  },
  severity: 'info' | 'warning' | 'critical',
  status: 'success' | 'failure',
  description?: string     // Descripción humana del evento
}
```

### 🔧 Uso en el Código

#### Ejemplo 1: Auditar Creación de Usuario

```typescript
// En server.ts
app.post('/api/users', 
  requireAuth, 
  requirePermission('users:create'), 
  auditCreate('user'),  // ← Middleware de auditoría
  async (req, res) => {
    const user = await createUser(req.body);
    res.status(201).json(user);
  }
);
```

El log generado:
```json
{
  "id": "uuid-here",
  "tenantId": "tenant-123",
  "timestamp": "2024-11-20T15:30:00.000Z",
  "action": "user:create",
  "actor": {
    "userId": "admin-user-id",
    "email": "admin@example.com",
    "role": "tenant-admin",
    "name": "Admin User"
  },
  "resource": {
    "type": "user",
    "id": "new-user-id",
    "name": "John Doe"
  },
  "metadata": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "requestId": "req-123456789"
  },
  "severity": "info",
  "status": "success",
  "description": "user created: John Doe"
}
```

#### Ejemplo 2: Auditar Cambio de Rol Manualmente

```typescript
import { logRoleChange } from './functions/AuditFunctions';

// En tu handler de cambio de rol
await logRoleChange(
  tenantId,
  {
    userId: currentUser.id,
    email: currentUser.email,
    role: currentUser.role,
    name: `${currentUser.firstName} ${currentUser.lastName}`
  },
  {
    id: targetUser.id,
    email: targetUser.email,
    name: `${targetUser.firstName} ${targetUser.lastName}`
  },
  oldRole,  // 'student'
  newRole,  // 'instructor'
  {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    requestId: req.headers['x-request-id']
  }
);
```

#### Ejemplo 3: Consultar Logs desde Frontend

```typescript
// Obtener logs de cambios de rol en la última semana
const response = await fetch(
  `/api/audit/logs?tenantId=${tenantId}&action=user:role-change&limit=50`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const logs = await response.json();

// Obtener estadísticas del último mes
const statsResponse = await fetch(
  `/api/audit/stats?tenantId=${tenantId}&period=month`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const stats = await statsResponse.json();
// {
//   totalLogs: 1234,
//   bySeverity: { info: 900, warning: 300, critical: 34 },
//   byAction: { 'user:create': 100, 'course:publish': 50, ... },
//   byStatus: { success: 1200, failure: 34 },
//   criticalEvents: 34,
//   failedActions: 34
// }
```

### 🛡️ Seguridad

**Acceso Restringido:**
- Todos los endpoints de audit requieren permiso `audit:view-logs`
- Solo roles admin-level pueden ver logs:
  - super-admin ✅
  - tenant-admin ✅
  - Otros roles ❌

**Aislamiento de Datos:**
- Partition key por tenantId
- Cada tenant solo ve sus propios logs
- super-admin puede ver logs de todos los tenants

**Integridad:**
- Logs son append-only (no se modifican)
- Timestamp ISO 8601 para trazabilidad
- Request ID para correlación de eventos

### 📈 Estadísticas Disponibles

**getAuditStats()** retorna:
```typescript
{
  totalLogs: number,           // Total de logs en el período
  bySeverity: {                // Logs por severidad
    info: number,
    warning: number,
    critical: number
  },
  byAction: {                  // Logs por acción
    'user:create': number,
    'course:publish': number,
    // ... todas las acciones
  },
  byStatus: {                  // Logs por resultado
    success: number,
    failure: number
  },
  criticalEvents: number,      // Eventos críticos
  failedActions: number        // Acciones fallidas
}
```

Períodos soportados:
- `day`: Últimas 24 horas
- `week`: Últimos 7 días (default)
- `month`: Últimos 30 días

### ⚙️ Configuración

**TTL (Time-To-Live):**
```javascript
// En createAuditLogsContainer.js
defaultTtl: -1  // Sin expiración

// Para auto-delete después de 90 días:
defaultTtl: 7776000  // 90 días en segundos
```

**Límite de Resultados:**
```typescript
// Default: 100 logs
const logs = await getAuditLogs(tenantId);

// Custom limit
const logs = await getAuditLogs(tenantId, { limit: 500 });
```

### 🚀 Próximos Pasos (Futuro)

1. **UI de Admin Panel**
   - Página de audit logs con tabla filtrable
   - Gráficas de estadísticas
   - Exportación a CSV/Excel
   - Búsqueda avanzada

2. **Alertas Automáticas**
   - Email cuando hay eventos críticos
   - Webhook para integración con SIEM
   - Notificaciones en tiempo real

3. **Compliance Reports**
   - Reporte mensual de actividad
   - Exportación para auditorías externas
   - Cumplimiento de GDPR/SOC2

4. **Machine Learning**
   - Detección de anomalías
   - Patrones de comportamiento sospechoso
   - Predicción de riesgos

### 📊 Estadísticas de Implementación

**Líneas de Código:**
- AuditFunctions.ts: 450+ líneas
- audit.ts middleware: 350+ líneas
- createAuditLogsContainer.js: 100 líneas
- API endpoints: 80 líneas
- **Total**: ~980 líneas

**Funcionalidad:**
- 25+ acciones auditables
- 8 middlewares de auditoría
- 3 API endpoints
- 11+ filtros de búsqueda
- 3 períodos de estadísticas

**Performance:**
- Logs en background (no bloquean response)
- Partition key para queries eficientes
- Indexing automático en todos los campos
- TTL configurable para gestión de storage

### ✅ Checklist de Completitud

- ✅ Container de Cosmos DB creado
- ✅ Schema de audit log definido
- ✅ Funciones CRUD para logs
- ✅ Middlewares de auditoría automática
- ✅ API endpoints protegidos
- ✅ Filtros y búsqueda avanzada
- ✅ Estadísticas y agregaciones
- ✅ Helpers especializados (role change, course publish, access denied)
- ✅ Metadata automática (IP, user agent, request ID)
- ✅ Manejo de errores (no interrumpe flujo principal)
- ✅ Tipos TypeScript completos
- ✅ Documentación inline

---

**Status**: ✅ Audit Logging System COMPLETE
**Phase 1 Progress**: 80% (8/10 tareas)
**Next**: Tests + Documentation
**ETA**: 3-4 hours
