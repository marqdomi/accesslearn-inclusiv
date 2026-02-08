# Plan Arquitectónico Completo - Frontend AccessLearn
## Fecha: 19 Noviembre 2025
## Branch: frontend-rebuild

---

## 🎯 Visión General

**Objetivo**: Construir un frontend moderno, escalable y accesible que se integre 100% con el backend de Azure Cosmos DB, eliminando toda dependencia de arquitectura legacy (KV/localStorage).

**Filosofía de diseño**:
- **Backend-first**: El backend es la fuente de verdad
- **Multi-tenant nativo**: Todo diseñado para múltiples organizaciones
- **Accesibilidad primero**: WCAG 2.1 AA compliance
- **Internacionalización**: Español por defecto, preparado para más idiomas
- **Mobile-friendly**: Responsive design desde el inicio

---

## 📊 Estado Actual del Backend

### Containers en Cosmos DB
✅ **Tenants** (`/id`)
- Gestión multi-tenant
- Branding personalizado (colores, logo)
- Planes: demo, profesional, enterprise
- Límites por plan (usuarios, cursos)

✅ **Users** (`/tenantId`)
- Roles: student, mentor, admin
- Perfil completo (firstName, lastName, email)
- Enrollments (cursos inscritos)
- CompletedCourses (progreso)

✅ **Courses** (`/tenantId`)
- Estructura de módulos
- Contenido markdown
- Metadata (dificultad, duración)
- Estado (draft, active, archived)

### APIs REST Disponibles
✅ **Authentication**: POST `/api/auth/login`
✅ **Tenants**: GET `/api/tenants`, GET `/api/tenants/slug/:slug`
✅ **Users**: GET `/api/users/:id`, POST `/api/users`, GET `/api/users/tenant/:tenantId`
✅ **Courses**: GET `/api/courses/tenant/:tenantId`
✅ **Enrollments**: POST `/api/users/:id/enroll`, POST `/api/users/:id/complete`
✅ **Stats**: GET `/api/stats/tenant/:tenantId/users`

---

## 🏗️ Arquitectura Frontend Propuesta

### Stack Tecnológico

#### Core
- **React 19** - UI Framework
- **TypeScript 5.7** - Type safety
- **Vite** - Build tool & dev server
- **React Router 6** - Client-side routing

#### Styling
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library (mantener)
- **Framer Motion** - Animations
- **Phosphor Icons** - Icon set

#### State Management
- **React Context API** - Global state
  - `TenantContext` ✅ (ya existe)
  - `AuthContext` ✅ (creado en MVP)
  - `CoursesContext` (por crear)
  - `ProgressContext` (por crear)
- **TanStack Query (React Query)** - Server state & caching
- **Zustand** (opcional) - Client state si se requiere

#### Forms & Validation
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **zod-form-data** - Form data parsing

#### HTTP & API
- **Axios** - HTTP client (ya en uso)
- **API Service Layer** - Abstracción de endpoints

#### i18n
- **react-i18next** - Internacionalización (ya configurado)
- Español por defecto
- Preparado para: inglés, francés, portugués

#### Testing (futuro)
- **Vitest** - Unit tests
- **Testing Library** - Component tests
- **Playwright** - E2E tests

---

## 📁 Estructura de Carpetas Propuesta

```
src/
├── assets/                    # Imágenes, fonts, etc
│   ├── images/
│   ├── fonts/
│   └── animations/
│
├── components/                # Componentes React
│   ├── auth/                  # ✅ Autenticación
│   │   ├── TenantResolver.tsx      # ✅ Detección de tenant
│   │   ├── TenantLoginPage.tsx     # ✅ Login con branding
│   │   ├── ProtectedRoute.tsx      # 🔄 Route guard
│   │   └── RoleGuard.tsx           # 🔄 Role-based access
│   │
│   ├── layout/                # Layout components
│   │   ├── AppHeader.tsx           # 🔄 Header global
│   │   ├── AppSidebar.tsx          # 🔄 Sidebar navegación
│   │   ├── AppFooter.tsx           # 🔄 Footer
│   │   └── MainLayout.tsx          # 🔄 Layout wrapper
│   │
│   ├── dashboard/             # Dashboard components
│   │   ├── StudentDashboard.tsx    # 🔄 Dashboard estudiante
│   │   ├── MentorDashboard.tsx     # 🔄 Dashboard mentor
│   │   ├── AdminDashboard.tsx      # 🔄 Dashboard admin
│   │   ├── CourseCard.tsx          # 🔄 Card de curso
│   │   ├── ProgressWidget.tsx      # 🔄 Widget progreso
│   │   └── StatsOverview.tsx       # 🔄 Estadísticas
│   │
│   ├── courses/               # Componentes de cursos
│   │   ├── CourseList.tsx          # 🔄 Lista de cursos
│   │   ├── CourseDetail.tsx        # 🔄 Detalle del curso
│   │   ├── CourseViewer.tsx        # 🔄 Visualizador contenido
│   │   ├── ModuleNavigation.tsx    # 🔄 Navegación módulos
│   │   ├── MarkdownRenderer.tsx    # 🔄 Render markdown
│   │   └── CourseProgress.tsx      # 🔄 Barra progreso
│   │
│   ├── admin/                 # Panel administrativo
│   │   ├── UserManagement.tsx      # 🔄 Gestión usuarios
│   │   ├── CourseManagement.tsx    # 🔄 Gestión cursos
│   │   ├── TenantSettings.tsx      # 🔄 Config tenant
│   │   ├── Analytics.tsx           # 🔄 Analytics
│   │   └── BulkActions.tsx         # 🔄 Acciones masivas
│   │
│   ├── mentorship/            # Sistema de mentorías (futuro)
│   │   ├── MentorList.tsx
│   │   ├── MentorProfile.tsx
│   │   ├── MentorshipRequest.tsx
│   │   └── MentorChat.tsx
│   │
│   ├── profile/               # Perfil de usuario
│   │   ├── ProfileView.tsx         # 🔄 Ver perfil
│   │   ├── ProfileEdit.tsx         # 🔄 Editar perfil
│   │   ├── AchievementsList.tsx    # 🔄 Logros (futuro)
│   │   └── CertificatesList.tsx    # 🔄 Certificados (futuro)
│   │
│   ├── ui/                    # ✅ shadcn/ui components (mantener)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ... (todos los existentes)
│   │
│   └── shared/                # Componentes compartidos
│       ├── LoadingSpinner.tsx      # 🔄 Loading states
│       ├── ErrorBoundary.tsx       # 🔄 Error handling
│       ├── EmptyState.tsx          # 🔄 Estados vacíos
│       ├── Breadcrumbs.tsx         # 🔄 Breadcrumbs
│       └── SearchBar.tsx           # 🔄 Búsqueda
│
├── contexts/                  # React Context providers
│   ├── TenantContext.tsx           # ✅ Estado del tenant
│   ├── AuthContext.tsx             # ✅ Estado auth
│   ├── CoursesContext.tsx          # 🔄 Estado cursos
│   ├── ProgressContext.tsx         # 🔄 Progreso usuario
│   └── ThemeContext.tsx            # 🔄 Tema/accesibilidad
│
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts                  # ✅ Hook auth (en AuthContext)
│   ├── useTenant.ts                # ✅ Hook tenant (ya existe)
│   ├── useCourses.ts               # 🔄 Hook cursos
│   ├── useProgress.ts              # 🔄 Hook progreso
│   ├── useEnrollment.ts            # 🔄 Hook inscripciones
│   ├── useUsers.ts                 # 🔄 Hook usuarios (admin)
│   └── useDebounce.ts              # 🔄 Debounce utility
│
├── services/                  # API Services
│   ├── api.service.ts              # ✅ Cliente HTTP base
│   ├── auth.service.ts             # 🔄 Servicios auth
│   ├── courses.service.ts          # 🔄 Servicios cursos
│   ├── users.service.ts            # 🔄 Servicios usuarios
│   ├── progress.service.ts         # 🔄 Servicios progreso
│   └── tenants.service.ts          # 🔄 Servicios tenants
│
├── types/                     # TypeScript types
│   ├── index.ts                    # Exports centralizados
│   ├── auth.types.ts               # 🔄 Tipos auth
│   ├── course.types.ts             # 🔄 Tipos cursos
│   ├── user.types.ts               # 🔄 Tipos usuarios
│   ├── tenant.types.ts             # 🔄 Tipos tenants
│   └── api.types.ts                # 🔄 Tipos respuestas API
│
├── pages/                     # Page components (routes)
│   ├── LoginPage.tsx               # ✅ Login (TenantLoginPage)
│   ├── DashboardPage.tsx           # ✅ Dashboard principal
│   ├── CoursesPage.tsx             # 🔄 Lista cursos
│   ├── CourseDetailPage.tsx        # 🔄 Detalle curso
│   ├── CourseViewerPage.tsx        # 🔄 Visualizador curso
│   ├── ProfilePage.tsx             # 🔄 Perfil usuario
│   ├── AdminPage.tsx               # 🔄 Panel admin
│   ├── NotFoundPage.tsx            # 🔄 404
│   └── UnauthorizedPage.tsx        # 🔄 403
│
├── routes/                    # Routing configuration
│   ├── index.tsx                   # 🔄 Routes definition
│   ├── ProtectedRoutes.tsx         # 🔄 Auth-protected routes
│   └── AdminRoutes.tsx             # 🔄 Admin-only routes
│
├── utils/                     # Utility functions
│   ├── date.utils.ts               # 🔄 Date formatting
│   ├── string.utils.ts             # 🔄 String helpers
│   ├── validation.utils.ts         # 🔄 Validaciones
│   ├── storage.utils.ts            # 🔄 localStorage wrapper
│   └── constants.ts                # 🔄 Constantes
│
├── i18n/                      # ✅ Internacionalización (mantener)
│   ├── config.ts
│   └── locales/
│       ├── es/
│       ├── en/
│       └── fr/
│
├── styles/                    # Global styles
│   ├── globals.css                 # ✅ Tailwind base (mantener)
│   ├── themes.css                  # 🔄 Temas custom
│   └── animations.css              # 🔄 Animaciones custom
│
├── App.tsx                    # ✅ App principal
├── main.tsx                   # ✅ Entry point
└── vite-env.d.ts              # ✅ Vite types

Leyenda:
✅ Ya existe y funciona
🔄 Por crear en las siguientes fases
```

---

## 🎨 Sistema de Diseño

### Colores Multi-tenant
Cada tenant tiene:
- **Primary Color**: Color principal (botones, headers)
- **Secondary Color**: Color secundario (acentos)
- **Logo**: URL del logo de la organización

El sistema adapta la UI dinámicamente usando estos valores.

### Temas
- **Light Mode** (por defecto)
- **Dark Mode** (futuro)
- **High Contrast** (accesibilidad)

### Componentes Base
Usar **shadcn/ui** como base:
- Button, Card, Input, Label
- Dialog, Dropdown, Select
- Table, Tabs, Toast
- Progress, Badge, Avatar

### Typography
- **Headings**: Inter font
- **Body**: Inter font
- **Monospace**: JetBrains Mono (código)

---

## 🔐 Sistema de Autenticación & Autorización

### Flujo de Autenticación

```
1. Landing → TenantResolver detecta tenant (subdomain/query param)
2. Si no hay tenant → Selector manual de tenants
3. Login → TenantLoginPage con branding del tenant
4. Backend valida → Devuelve token + user data
5. AuthContext guarda en localStorage + actualiza estado
6. Redirect a Dashboard según rol
```

### Roles y Permisos

**Student (estudiante)**
- Ver cursos asignados
- Completar módulos
- Ver progreso propio
- Acceder a contenido

**Mentor**
- Todo de Student +
- Ver lista de mentorados
- Enviar mensajes a mentorados
- Ver progreso de mentorados
- Reportes de mentorados

**Admin**
- Todo de Mentor +
- Gestionar usuarios del tenant
- Crear/editar cursos
- Configurar tenant
- Ver analytics completo
- Exportar datos

### Route Guards

```tsx
<ProtectedRoute requireAuth>
  <DashboardPage />
</ProtectedRoute>

<RoleGuard allowedRoles={['admin']}>
  <AdminPage />
</RoleGuard>
```

---

## 📚 Sistema de Cursos

### Estructura de Datos

```typescript
interface Course {
  id: string
  tenantId: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedHours: number
  status: 'draft' | 'active' | 'archived'
  modules: Module[]
  createdAt: number
  updatedAt: number
}

interface Module {
  id: string
  title: string
  description: string
  order: number
  content: string // Markdown
  duration: number // minutos
  type: 'lesson' | 'quiz' | 'assignment'
}

interface UserProgress {
  userId: string
  courseId: string
  completedModules: string[]
  currentModule: string
  status: 'not-started' | 'in-progress' | 'completed'
  startedAt: number
  completedAt?: number
  lastAccessedAt: number
}
```

### Componentes de Curso

#### CourseCard
- Thumbnail del curso
- Título y descripción corta
- Progreso (barra %)
- Dificultad badge
- Botón "Continuar" / "Iniciar"

#### CourseViewer
- Sidebar con lista de módulos
- Área de contenido (markdown rendering)
- Navegación prev/next
- Botón "Marcar como completado"
- Progress tracker

#### MarkdownRenderer
- Renderiza markdown de módulos
- Syntax highlighting para código
- Imágenes responsive
- Videos embebidos
- Enlaces externos

---

## 👥 Sistema de Usuarios & Perfiles

### Perfil de Usuario

```typescript
interface UserProfile {
  id: string
  tenantId: string
  email: string
  firstName: string
  lastName: string
  role: 'student' | 'mentor' | 'admin'
  avatar?: string
  bio?: string
  enrolledCourses: string[]
  completedCourses: string[]
  createdAt: number
  lastLoginAt: number
}
```

### Gestión de Usuarios (Admin)

Componentes:
- **UserTable**: Lista de usuarios con filtros
- **UserForm**: Crear/editar usuario
- **BulkEnroll**: Inscribir múltiples usuarios
- **UserStats**: Estadísticas de actividad

Acciones:
- Crear usuario
- Editar perfil
- Cambiar rol
- Activar/desactivar
- Inscribir en cursos
- Ver progreso

---

## 📊 Sistema de Analytics (Futuro)

### Métricas para Admin

**Overview**
- Total usuarios activos
- Total cursos completados
- Tasa de finalización
- Promedio de tiempo por curso

**Por Curso**
- Usuarios inscritos
- Usuarios completados
- Módulos más visitados
- Tiempo promedio

**Por Usuario**
- Cursos inscritos/completados
- Tiempo total de estudio
- Última actividad
- Logros obtenidos

### Componentes
- **StatsCard**: Card con métrica individual
- **ChartComponent**: Gráficas (react-chartjs-2)
- **UserActivityTable**: Tabla de actividad
- **ExportButton**: Exportar a CSV/PDF

---

## 🎯 Sistema de Progreso & Gamificación (Futuro)

### Tracking de Progreso

```typescript
interface Progress {
  courseId: string
  userId: string
  completedModules: string[]
  totalModules: number
  percentage: number
  estimatedCompletion: Date
}
```

### Gamificación (Fase 2)

**XP & Niveles**
- XP por módulo completado
- Niveles del 1 al 50
- Badges visuales

**Achievements**
- "Primera Victoria" - Completar primer curso
- "Maratonista" - 5 cursos en un mes
- "Mentor Estrella" - 10 mentorados activos

**Leaderboards**
- Top estudiantes por XP
- Top por cursos completados
- Top mentores

---

## 🔄 Estado Global vs Local

### React Context (Global)
✅ **TenantContext**: Tenant actual (ya existe)
✅ **AuthContext**: Usuario autenticado (ya existe)
🔄 **CoursesContext**: Lista de cursos del tenant
🔄 **ProgressContext**: Progreso del usuario
🔄 **ThemeContext**: Tema y preferencias accesibilidad

### React Query (Server State)
- Cache de responses del backend
- Invalidación automática
- Optimistic updates
- Background refetch

Ejemplo:
```tsx
const { data: courses, isLoading } = useQuery({
  queryKey: ['courses', tenantId],
  queryFn: () => CoursesService.getByTenant(tenantId),
  staleTime: 5 * 60 * 1000, // 5 minutos
})
```

### Component State (Local)
- Form inputs
- UI toggles (modals, dropdowns)
- Pagination
- Filtros locales

---

## 🌐 Rutas de la Aplicación

```typescript
// Public routes
/                                    → Landing (redirect to login)
/login                               → TenantLoginPage

// Protected routes
/dashboard                           → DashboardPage (role-based)
/courses                             → CoursesList
/courses/:courseId                   → CourseDetail
/courses/:courseId/learn             → CourseViewer
/profile                             → ProfilePage
/profile/edit                        → ProfileEdit

// Admin routes
/admin                               → AdminDashboard
/admin/users                         → UserManagement
/admin/courses                       → CourseManagement
/admin/settings                      → TenantSettings
/admin/analytics                     → Analytics

// Future routes
/mentorship                          → MentorshipPage
/certificates                        → CertificatesPage
/achievements                        → AchievementsPage

// Error routes
/404                                 → NotFound
/unauthorized                        → Unauthorized
```

---

## 🚀 Plan de Implementación por Fases

### ✅ Fase 0: MVP (COMPLETADA)
- [x] Estructura base del proyecto
- [x] TenantResolver y detección
- [x] AuthContext y sistema de login
- [x] DashboardPage básico
- [x] Backend API funcionando

### 🔄 Fase 1: Core Funcionalidad (1-2 semanas)

**Prioridad Alta**
1. **Routing System**
   - Configurar React Router
   - ProtectedRoute component
   - RoleGuard component
   - Navegación entre páginas

2. **Layout System**
   - MainLayout component
   - AppHeader con navegación
   - AppSidebar colapsable
   - Breadcrumbs

3. **Course System**
   - CoursesList page
   - CourseDetail page
   - CourseViewer con markdown
   - ModuleNavigation
   - Progress tracking básico

4. **Services Layer**
   - CoursesService
   - UsersService
   - ProgressService
   - Integración completa con backend

5. **Type System**
   - Definir todos los tipos TypeScript
   - Interfaces de API responses
   - Validation schemas con Zod

**Entregables Fase 1**
- ✅ Login funcional
- ✅ Dashboard con lista de cursos
- ✅ Visualización de curso con markdown
- ✅ Progreso básico (% completado)
- ✅ Navegación funcional entre páginas

### 🔄 Fase 2: Gestión de Usuarios (1 semana)

**Funcionalidades**
1. **Profile Management**
   - Ver perfil propio
   - Editar perfil
   - Cambiar contraseña
   - Avatar upload (Azure Blob)

2. **Admin Panel**
   - Lista de usuarios
   - Crear/editar usuarios
   - Asignar cursos
   - Ver progreso de usuarios

3. **Enrollment System**
   - Auto-enrollment en cursos
   - Aprobación de inscripciones
   - Gestión de accesos

**Entregables Fase 2**
- ✅ Perfiles editables
- ✅ Panel admin funcional
- ✅ Gestión de inscripciones

### 🔄 Fase 3: Analytics & Reports (1 semana)

**Funcionalidades**
1. **Dashboard Analytics**
   - Métricas generales
   - Gráficas de progreso
   - Estadísticas de cursos

2. **Reports**
   - Reporte de actividad
   - Reporte de completados
   - Exportar a CSV/PDF

3. **User Activity**
   - Timeline de actividades
   - Últimos accesos
   - Cursos más populares

**Entregables Fase 3**
- ✅ Dashboard con métricas
- ✅ Sistema de reportes
- ✅ Exportación de datos

### 🔄 Fase 4: Features Avanzados (2-3 semanas)

**Funcionalidades**
1. **Mentorship System**
   - Asignación mentor-estudiante
   - Chat entre mentor-estudiante
   - Seguimiento de mentorados

2. **Gamification**
   - Sistema de XP y niveles
   - Achievements/Badges
   - Leaderboards

3. **Certificates**
   - Generación automática
   - PDF descargable
   - Verificación online

4. **Q&A Forum** (opcional)
   - Preguntas por curso
   - Respuestas y votación
   - Marcar como resuelta

**Entregables Fase 4**
- ✅ Sistema de mentorías
- ✅ Gamificación completa
- ✅ Certificados automáticos
- ⚠️ Forum (si tiempo permite)

### 🔄 Fase 5: Polish & Deploy (1 semana)

**Tareas**
1. **Testing**
   - Unit tests componentes
   - Integration tests
   - E2E tests críticos

2. **Performance**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Caching estratégico

3. **Accessibility**
   - WCAG 2.1 AA compliance
   - Screen reader testing
   - Keyboard navigation
   - High contrast mode

4. **Deploy**
   - Azure Static Web Apps
   - CI/CD con GitHub Actions
   - DNS para subdominios
   - SSL certificates

**Entregables Fase 5**
- ✅ Tests automatizados
- ✅ App optimizada
- ✅ Deploy en producción
- ✅ Documentación completa

---

## 🎨 Guías de Desarrollo

### Naming Conventions

**Files**
- Components: `PascalCase.tsx` (CourseCard.tsx)
- Hooks: `camelCase.ts` (useCourses.ts)
- Services: `camelCase.service.ts` (courses.service.ts)
- Types: `camelCase.types.ts` (course.types.ts)
- Utils: `camelCase.utils.ts` (date.utils.ts)

**Variables & Functions**
- Variables: `camelCase` (courseList)
- Functions: `camelCase` (getCourses)
- Components: `PascalCase` (CourseCard)
- Constants: `UPPER_SNAKE_CASE` (API_BASE_URL)

**Types & Interfaces**
- Interfaces: `PascalCase` (Course, UserProfile)
- Types: `PascalCase` (CourseStatus, UserRole)
- Enums: `PascalCase` (DifficultyLevel)

### Component Structure

```tsx
// 1. Imports
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

// 2. Types/Interfaces
interface CourseCardProps {
  course: Course
  onSelect: (id: string) => void
}

// 3. Component
export function CourseCard({ course, onSelect }: CourseCardProps) {
  // 3.1 Hooks
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // 3.2 Effects
  useEffect(() => {
    // ...
  }, [])

  // 3.3 Handlers
  const handleClick = () => {
    onSelect(course.id)
  }

  // 3.4 Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### API Service Pattern

```typescript
// courses.service.ts
import { api } from './api.service'
import { Course } from '@/types/course.types'

export const CoursesService = {
  async getByTenant(tenantId: string): Promise<Course[]> {
    const response = await api.get(`/courses/tenant/${tenantId}`)
    return response.data
  },

  async getById(id: string): Promise<Course> {
    const response = await api.get(`/courses/${id}`)
    return response.data
  },

  async create(course: Partial<Course>): Promise<Course> {
    const response = await api.post('/courses', course)
    return response.data
  },

  async update(id: string, course: Partial<Course>): Promise<Course> {
    const response = await api.put(`/courses/${id}`, course)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/courses/${id}`)
  },
}
```

### Custom Hook Pattern

```typescript
// useCourses.ts
import { useState, useEffect } from 'react'
import { useTenant } from '@/contexts/TenantContext'
import { CoursesService } from '@/services/courses.service'
import { Course } from '@/types/course.types'

export function useCourses() {
  const { currentTenant } = useTenant()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentTenant) return

    loadCourses()
  }, [currentTenant])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const data = await CoursesService.getByTenant(currentTenant!.id)
      setCourses(data)
    } catch (err) {
      setError('Error loading courses')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return {
    courses,
    loading,
    error,
    refresh: loadCourses,
  }
}
```

---

## 📝 Estándares de Código

### ESLint Rules
- No `any` sin justificación
- Prefer `const` over `let`
- Use arrow functions
- No unused variables
- Prefer template literals
- Trailing commas

### TypeScript
- Strict mode enabled
- No implicit any
- Interfaces over types (cuando sea posible)
- Type everything (no implicit any)

### React Best Practices
- Functional components only
- Hooks over classes
- Props destructuring
- Memoization when needed (useMemo, useCallback)
- Key props in lists
- Loading & error states

### CSS/Tailwind
- Use Tailwind utilities first
- Custom CSS only when necessary
- Mobile-first responsive
- Dark mode compatible
- No inline styles (usar Tailwind)

---

## 🔧 Configuración de Desarrollo

### Environment Variables

```bash
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=AccessLearn
VITE_DEFAULT_LANGUAGE=es

# Production
VITE_API_BASE_URL=https://api.accesslearn.com
```

### Scripts útiles

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint src --ext ts,tsx",
  "lint:fix": "eslint src --ext ts,tsx --fix",
  "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
  "type-check": "tsc --noEmit"
}
```

---

## 🎯 Métricas de Éxito

### Performance
- ⚡ First Contentful Paint < 1.5s
- ⚡ Largest Contentful Paint < 2.5s
- ⚡ Time to Interactive < 3.5s
- ⚡ Bundle size < 300KB (gzipped)

### Accesibilidad
- ✅ Lighthouse Score > 90
- ✅ WCAG 2.1 AA compliant
- ✅ Screen reader compatible
- ✅ Keyboard navigable

### Code Quality
- ✅ TypeScript strict mode
- ✅ 0 ESLint errors
- ✅ Test coverage > 80% (futuro)

---

## 📚 Recursos & Referencias

### Documentación
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [React Router](https://reactrouter.com)

### Design System
- [Radix UI](https://www.radix-ui.com)
- [Phosphor Icons](https://phosphoricons.com)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref)

### Backend Integration
- [Azure Cosmos DB](https://learn.microsoft.com/azure/cosmos-db)
- [REST API Best Practices](https://learn.microsoft.com/azure/architecture/best-practices/api-design)

---

## 🎉 Conclusión

Este plan arquitectónico proporciona una **base sólida y escalable** para construir el frontend completo de AccessLearn. 

**Ventajas de esta arquitectura**:
1. ✅ **Modular**: Fácil agregar nuevas features
2. ✅ **Type-safe**: TypeScript previene bugs
3. ✅ **Testeable**: Componentes desacoplados
4. ✅ **Escalable**: Preparado para crecer
5. ✅ **Mantenible**: Código limpio y organizado
6. ✅ **Accesible**: WCAG compliant desde el inicio
7. ✅ **Multi-tenant**: Diseñado para múltiples organizaciones

**Próximos pasos inmediatos**:
1. 📋 Revisar y aprobar este plan
2. 🏗️ Crear estructura de carpetas completa
3. 🎨 Definir componentes de layout
4. 🔄 Implementar React Router
5. 📚 Crear CourseViewer component

---

**¿Listo para empezar la Fase 1?** 🚀
