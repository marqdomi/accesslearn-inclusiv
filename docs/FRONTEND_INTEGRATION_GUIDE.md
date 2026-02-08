# 🔗 Frontend + Backend Integration Guide

## ✅ Lo que se implementó

### 1. **TenantContext** - Gestión Global de Tenants
- **Archivo**: `src/contexts/TenantContext.tsx`
- **Funcionalidad**: Proporciona el tenant actual a toda la app
- **Uso**: `const { currentTenant, setCurrentTenant } = useTenant()`

### 2. **ApiService** - Capa de Comunicación con Backend
- **Archivo**: `src/services/api.service.ts`
- **Funcionalidad**: Centraliza todas las llamadas HTTP al backend
- **APIs disponibles**:
  - Tenants: getTenantBySlug, listTenants, createTenant
  - Users: createUser, getUsersByTenant, updateUser, enrollUserInCourse
  - Courses: getCourses, getCourseById, createCourse, updateCourse

### 3. **BackendCourseService** - Adaptador de Cursos
- **Archivo**: `src/services/backend-course.service.ts`
- **Funcionalidad**: Adapta respuestas del backend al formato del frontend
- **Mapeo**: BackendCourse → CourseStructure

### 4. **useBackendCourses** - Hook para Consumir Backend
- **Archivo**: `src/hooks/use-backend-courses.ts`
- **Funcionalidad**: Reemplazo drop-in para `use-courses.ts`
- **Hooks disponibles**:
  - `useBackendCourses()` - Todos los cursos
  - `useBackendCourse(id)` - Un curso específico
  - `usePublishedCourses()` - Solo cursos publicados

### 5. **Configuración de Entorno**
- **Archivo**: `.env`
- **Variable**: `VITE_API_BASE_URL=http://localhost:7071/api`

## 🚀 Cómo Usar

### Paso 1: Arrancar Backend (Terminal 1)

```bash
cd backend
npm run dev
```

Esto arranca el backend en `http://localhost:7071`

### Paso 2: Arrancar Frontend (Terminal 2)

```bash
npm run dev
```

Esto arranca el frontend en `http://localhost:5173`

### Paso 3: Cambiar un Componente para Usar Backend

**ANTES** (usando localStorage/KV):
```tsx
import { useCourses } from '@/hooks/use-courses'

function MyCourses() {
  const { courses, loading, error } = useCourses()
  // ...
}
```

**DESPUÉS** (usando backend real):
```tsx
import { useBackendCourses } from '@/hooks/use-backend-courses'

function MyCourses() {
  const { courses, loading, error } = useBackendCourses()
  // ...
}
```

### Paso 4: Acceder al Tenant Actual

```tsx
import { useTenant } from '@/contexts/TenantContext'

function MyComponent() {
  const { currentTenant, setCurrentTenant } = useTenant()
  
  console.log('Current tenant:', currentTenant?.name) // "Empresa Demo"
  console.log('Tenant ID:', currentTenant?.id) // "tenant-demo"
}
```

## 🔄 Migración Gradual

Puedes migrar componente por componente:

1. **Mantén el código existente** funcionando
2. **Crea versiones nuevas** de componentes usando `useBackendCourses`
3. **Prueba lado a lado** (ej: `/courses` usa KV, `/beta/courses` usa backend)
4. **Cambia gradualmente** cuando estés seguro

## 📝 Próximos Pasos

### Paso A: Migrar Dashboard Principal
Actualizar `src/components/dashboard/UserDashboard.tsx` para usar `useBackendCourses()`

### Paso B: Migrar CourseViewer
Actualizar `src/components/courses/CourseViewer.tsx` para consumir backend

### Paso C: Implementar Autenticación Real
Conectar `src/hooks/use-auth.ts` con `ApiService.login()` y `ApiService.createUser()`

### Paso D: Deploy Backend a Azure Functions
Una vez probado localmente, hacer deploy del backend a Azure

## 🧪 Testing

### Test 1: Ver Cursos del Backend

1. Abre DevTools Console
2. Ejecuta:
```js
const tenantId = 'tenant-demo'
fetch(`http://localhost:7071/api/courses?tenantId=${tenantId}`)
  .then(r => r.json())
  .then(console.log)
```

Deberías ver: `[{ id: "course-001", title: "Introducción a AccessLearn", ... }]`

### Test 2: Crear Usuario

```js
fetch('http://localhost:7071/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tenantId: 'tenant-demo',
    email: 'test@demo.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'student'
  })
}).then(r => r.json()).then(console.log)
```

## 🐛 Troubleshooting

### Error: "Failed to fetch"
- ✅ Verifica que el backend esté corriendo en `http://localhost:7071`
- ✅ Revisa CORS (el backend debe permitir `http://localhost:5173`)

### Error: "Cannot read property 'id' of null"
- ✅ Verifica que `TenantProvider` esté en `App.tsx`
- ✅ El tenant se carga desde localStorage al inicio

### Backend no responde
- ✅ Verifica que Cosmos DB esté accesible (revisa `.env` en backend)
- ✅ Revisa los logs del backend en la terminal

## 📚 Documentación Relacionada

- **Backend README**: `backend/README.md`
- **Cosmos DB Strategy**: `docs/AZURE_COSMOS_DB_STRATEGY.md`
- **Roadmap**: `ESTADO_ACTUAL_Y_ROADMAP.md` (Fase 4-5: Multi-tenancy Frontend)

---

**Estado actual**: ✅ Backend funcionando, ✅ Frontend con contextos, 🔄 Listo para migración gradual
