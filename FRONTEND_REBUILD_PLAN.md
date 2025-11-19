# Frontend Rebuild Plan

## Fecha: 19 Noviembre 2025
## Branch: frontend-rebuild

## Objetivo
Crear un frontend limpio y moderno que se integre perfectamente con el backend de Cosmos DB, eliminando toda la arquitectura legacy de KV/localStorage.

## Stack Tecnológico (mantener)
- React 19 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router
- Axios para HTTP
- i18n (español por defecto)

## Arquitectura Nueva

### 1. Estructura de Carpetas
```
src/
├── components/
│   ├── auth/           # Login, TenantResolver (ya existentes)
│   ├── layout/         # Header, Sidebar, Footer
│   ├── dashboard/      # Dashboard limpio
│   ├── courses/        # Lista y detalle de cursos
│   └── ui/             # shadcn components (mantener)
├── contexts/
│   ├── TenantContext.tsx    # Ya existe
│   ├── AuthContext.tsx      # Nuevo - manejo de auth global
│   └── CoursesContext.tsx   # Nuevo - estado de cursos
├── services/
│   ├── api.ts          # Cliente HTTP base
│   ├── auth.service.ts # Servicios de autenticación
│   ├── courses.service.ts # Servicios de cursos
│   └── users.service.ts   # Servicios de usuarios
├── hooks/
│   ├── useAuth.ts      # Hook de autenticación
│   └── useCourses.ts   # Hook de cursos
├── types/
│   └── index.ts        # Tipos TypeScript
└── pages/
    ├── LoginPage.tsx
    ├── DashboardPage.tsx
    └── CoursePage.tsx
```

### 2. Componentes Clave a Conservar
- ✅ `TenantResolver` - Detección de tenant (subdomain/query param)
- ✅ `TenantLoginPage` - Login en español con branding
- ✅ `TenantContext` - Estado global del tenant
- ✅ Componentes UI de shadcn/ui

### 3. Componentes a Crear desde Cero

#### AuthContext (Nuevo)
```typescript
interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}
```

#### Dashboard Simple
- Mostrar cursos del tenant actual
- Card por curso con: título, descripción, progreso
- Botón "Iniciar curso" / "Continuar"

#### Course Viewer
- Navegación por módulos
- Contenido de texto/markdown
- Marcar como completado

### 4. Flujo de Usuario MVP

1. **Landing** → TenantResolver detecta tenant
2. **Login** → TenantLoginPage con branding del tenant
3. **Dashboard** → Lista de cursos del tenant
4. **Course** → Visualización del contenido del curso
5. **Logout** → Volver al login

### 5. APIs a Integrar

Backend ya funcional en `http://localhost:3000/api`:
- ✅ POST `/auth/login` - Autenticación
- ✅ GET `/tenants/slug/:slug` - Obtener tenant
- ✅ GET `/courses/tenant/:tenantId` - Cursos del tenant
- ✅ GET `/users/:id` - Datos del usuario
- ⏳ POST `/users/:id/enroll` - Inscribir en curso
- ⏳ POST `/users/:id/complete` - Completar módulo

### 6. Estado Global

**Usar React Context** en lugar de KV:
- `TenantContext` - Tenant actual
- `AuthContext` - Usuario autenticado
- `CoursesContext` - Lista de cursos (opcional, puede ser hook)

### 7. Características para Fase 1 (MVP)

✅ **Esenciales**:
- Multi-tenant con detección automática
- Login con branding personalizado
- Dashboard con lista de cursos
- Visualización de contenido del curso
- Progreso básico (% completado)

❌ **Posponer para Fase 2**:
- Gamificación (XP, niveles, logros)
- Mentorías
- Q&A Forums
- Teams/Grupos
- Certificados
- Analytics avanzado
- Notificaciones

### 8. Plan de Implementación

#### Paso 1: Limpiar src/ (mantener solo lo necesario)
- Conservar: `components/auth/`, `components/ui/`, `contexts/TenantContext`
- Conservar: `services/api.service.ts`, `i18n/`
- Eliminar: Todo lo demás del src viejo

#### Paso 2: Crear AuthContext
- Manejo global de autenticación
- Persistencia en localStorage
- Auto-refresh al recargar

#### Paso 3: Dashboard Simple
- Componente limpio
- Conectado al backend
- Mostrar cursos del tenant

#### Paso 4: Course Viewer
- Navegación de módulos
- Contenido markdown
- Botón completar

#### Paso 5: Testing
- Login flow completo
- Cambiar de tenant
- Ver cursos
- Completar módulo

### 9. Datos de Prueba

Ya existentes en Cosmos DB:
- **Tenant**: Kainet (tenant-kainet)
- **Usuario**: ana.lopez@kainet.mx
- **Curso**: "Capacitación Empresarial Kainet" (course-002)

### 10. Mejoras vs Sistema Viejo

✅ **Ventajas del rebuild**:
1. Código limpio sin legacy
2. Arquitectura correcta (backend-first)
3. Fácil de mantener y extender
4. Performance mejorado (menos componentes)
5. Estado predecible (Context API)
6. TypeScript correctamente tipado
7. Preparado para escalar

### 11. Cronograma Estimado

- **Hoy (19 Nov)**: 
  - ✅ Crear rama frontend-rebuild
  - ✅ Plan documentado
  - ⏳ Limpiar src/
  - ⏳ Crear AuthContext
  - ⏳ Dashboard MVP

- **Mañana (20 Nov)**:
  - Course Viewer
  - Testing completo
  - Ajustes de UI/UX

- **Viernes (21 Nov)**:
  - Deploy a Azure (si todo funciona)
  - DNS para subdominios
  - Testing en producción

## Notas Importantes

1. **NO intentar migrar todo**: Solo lo esencial para MVP
2. **Backend ya está listo**: No tocar backend, solo integrarlo
3. **Tenant system funciona**: Conservar TenantResolver y TenantLoginPage
4. **Español por defecto**: Ya configurado en i18n
5. **shadcn/ui**: Mantener componentes UI existentes

## Siguientes Pasos INMEDIATOS

1. Crear backup de `src/` actual → `src-old/`
2. Limpiar `src/` dejando solo lo esencial
3. Crear `AuthContext.tsx`
4. Crear `DashboardPage.tsx` simple
5. Actualizar `App.tsx` con nuevo routing

---

**¿Listo para empezar el rebuild?** 🚀
