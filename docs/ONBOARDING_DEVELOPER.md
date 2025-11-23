# 👋 Guía de Onboarding para Nuevos Desarrolladores - AccessLearn

**Bienvenido al equipo de AccessLearn!** Esta guía te ayudará a entender el proyecto, configurar tu entorno de desarrollo y comenzar a contribuir.

---

## 📋 ÍNDICE

1. [Visión General del Proyecto](#visión-general-del-proyecto)
2. [Requisitos Previos](#requisitos-previos)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Flujos de Trabajo Comunes](#flujos-de-trabajo-comunes)
6. [Arquitectura y Patrones](#arquitectura-y-patrones)
7. [Testing y Calidad](#testing-y-calidad)
8. [Recursos y Documentación](#recursos-y-documentación)

---

## 🎯 VISIÓN GENERAL DEL PROYECTO

### ¿Qué es AccessLearn?

AccessLearn es una **plataforma SaaS multi-tenant de aprendizaje corporativo gamificado** que hace que el aprendizaje se sienta como jugar un videojuego, mientras mantiene **compliance WCAG 2.1 Level AA** para accesibilidad total.

### Características Principales

- 🎮 **Gamificación:** XP, niveles, achievements, leaderboards
- 📚 **Gestión de Cursos:** Editor profesional con múltiples tipos de contenido
- 👥 **Multi-Tenancy:** Cada empresa tiene su propia instancia aislada
- ♿ **Accesibilidad:** WCAG 2.1 Level AA compliant
- 📊 **Analytics:** Dashboard completo de métricas
- 🏆 **Certificados:** Generación automática de certificados PDF
- 💬 **Comunidad:** Foros Q&A, mentoría, team challenges

### Estado Actual

- **Completitud:** 85% listo para demo | 70% listo para producción
- **Stack:** React 19 + TypeScript (Frontend) | Node.js + Express + Cosmos DB (Backend)
- **Líneas de Código:** ~53,500 LOC
- **Componentes:** 100+ componentes React
- **Endpoints API:** 90+ endpoints REST

---

## 🔧 REQUISITOS PREVIOS

### Software Necesario

```bash
# Node.js (versión 18 o superior)
node --version  # Debe ser >= 18.0.0

# npm (viene con Node.js)
npm --version

# Git
git --version

# Editor de Código (recomendado: VS Code)
code --version
```

### Extensiones VS Code Recomendadas

- **ESLint** - Linting de código
- **Prettier** - Formateo automático
- **TypeScript** - Soporte TypeScript
- **Tailwind CSS IntelliSense** - Autocompletado de Tailwind
- **GitLens** - Mejor visualización de Git

### Cuentas y Accesos

- **GitHub:** Acceso al repositorio
- **Azure:** Cuenta de desarrollo (opcional, para testing local)
- **Cosmos DB:** Connection string (proporcionado por el equipo)

---

## ⚙️ CONFIGURACIÓN DEL ENTORNO

### 1. Clonar el Repositorio

```bash
git clone https://github.com/[org]/accesslearn-inclusiv.git
cd accesslearn-inclusiv
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

### 3. Configurar Variables de Entorno

**Frontend:** Crear `.env.local` en la raíz del proyecto
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=AccessLearn
```

**Backend:** Crear `.env` en `backend/`
```env
# Cosmos DB
COSMOS_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
COSMOS_KEY=your-cosmos-key
COSMOS_DATABASE=accesslearn-db

# JWT
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Email (Resend)
RESEND_API_KEY=your-resend-api-key

# Application Insights (opcional)
APPLICATIONINSIGHTS_CONNECTION_STRING=your-connection-string
```

### 4. Inicializar Base de Datos

```bash
cd backend

# Crear containers de Cosmos DB (si no existen)
npm run setup-demo

# O resetear a tenant Kainet (para testing)
npm run reset-kainet
```

### 5. Iniciar Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm run server
# Servidor corriendo en http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Aplicación corriendo en http://localhost:5173
```

### 6. Verificar Instalación

1. Abre `http://localhost:5173` en tu navegador
2. Deberías ver la página de login
3. Usa las credenciales de prueba (ver sección de Testing)

---

## 📁 ESTRUCTURA DEL PROYECTO

```
accesslearn-inclusiv/
├── src/                          # Frontend React
│   ├── components/               # Componentes React
│   │   ├── accessibility/        # Panel de accesibilidad
│   │   ├── admin/                # Componentes de administración
│   │   ├── courses/               # Componentes de cursos
│   │   ├── dashboard/            # Componentes del dashboard
│   │   ├── gamification/         # Sistema de gamificación
│   │   └── ui/                    # Componentes UI (shadcn)
│   ├── pages/                     # Páginas principales
│   │   ├── DashboardPage.tsx
│   │   ├── AdminSettingsPage.tsx
│   │   └── ...
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-profile.ts
│   │   ├── use-courses.ts
│   │   └── ...
│   ├── services/                  # Servicios API
│   │   └── api.service.ts         # Cliente API principal
│   ├── contexts/                  # React Contexts
│   │   ├── AuthContext.tsx        # Context de autenticación
│   │   └── TenantContext.tsx       # Context de tenant
│   ├── lib/                        # Utilidades y tipos
│   │   ├── types.ts               # TypeScript types
│   │   └── utils.ts               # Funciones utilitarias
│   └── App.tsx                     # Componente raíz
│
├── backend/                       # Backend Express
│   ├── src/
│   │   ├── server.ts              # Servidor Express principal
│   │   ├── functions/             # Funciones de negocio
│   │   │   ├── UserFunctions.ts
│   │   │   ├── CourseFunctions.ts
│   │   │   └── ...
│   │   ├── middleware/            # Middleware
│   │   │   ├── authentication.ts
│   │   │   └── authorization.ts
│   │   ├── services/              # Servicios
│   │   │   ├── cosmosdb.service.ts
│   │   │   └── email.service.ts
│   │   └── scripts/               # Scripts de utilidad
│   │       ├── reset-to-kainet-only.ts
│   │       └── ...
│   └── package.json
│
└── docs/                          # Documentación
    ├── PROYECTO_ESTADO_ACTUAL.md
    ├── ONBOARDING_DEVELOPER.md    # Este archivo
    └── ...
```

### Puntos de Entrada Principales

- **Frontend:** `src/App.tsx` - Componente raíz de React
- **Backend:** `backend/src/server.ts` - Servidor Express
- **API Client:** `src/services/api.service.ts` - Cliente API centralizado
- **Types:** `src/lib/types.ts` - Definiciones TypeScript

---

## 🔄 FLUJOS DE TRABAJO COMUNES

### Desarrollo de una Nueva Feature

1. **Crear Branch:**
   ```bash
   git checkout -b feature/nombre-de-feature
   ```

2. **Desarrollar Feature:**
   - Crear componentes en `src/components/`
   - Agregar páginas en `src/pages/` si es necesario
   - Implementar endpoints en `backend/src/functions/` si es backend
   - Agregar rutas en `backend/src/server.ts`

3. **Testing Local:**
   ```bash
   # Frontend
   npm run dev
   
   # Backend
   cd backend && npm run server
   ```

4. **Commit y Push:**
   ```bash
   git add .
   git commit -m "feat: descripción de la feature"
   git push origin feature/nombre-de-feature
   ```

5. **Crear Pull Request:**
   - Ir a GitHub y crear PR
   - Solicitar review
   - Esperar aprobación antes de merge

### Debugging

**Frontend:**
- Usa React DevTools
- Console logs en `src/`
- Network tab para ver requests API

**Backend:**
- Console logs en `backend/src/`
- Postman/Insomnia para probar endpoints
- Application Insights (si está configurado)

### Testing de Funcionalidades

**Credenciales de Prueba:**
```
Email: admin@kainet.test
Password: Admin2024!

Email: student@kainet.test
Password: Student2024!
```

**Flujos Comunes:**
1. Login → Dashboard
2. Crear curso → Publicar
3. Inscribirse en curso → Completar
4. Ver analytics

---

## 🏗️ ARQUITECTURA Y PATRONES

### Frontend

**Patrón de Componentes:**
```typescript
// Componente funcional con hooks
export function MyComponent() {
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  
  // Lógica del componente
  
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

**Manejo de Estado:**
- **Context API:** Para estado global (Auth, Tenant)
- **React Query:** Para datos del servidor
- **useState/useReducer:** Para estado local

**Llamadas API:**
```typescript
import { ApiService } from '@/services/api.service'

// Ejemplo: Obtener cursos
const courses = await ApiService.getCourses(tenantId)
```

### Backend

**Estructura de Endpoints:**
```typescript
// backend/src/server.ts
app.get('/api/courses', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user
    const courses = await getCourses(user.tenantId)
    res.json(courses)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

**Funciones de Negocio:**
```typescript
// backend/src/functions/CourseFunctions.ts
export async function getCourses(tenantId: string) {
  const container = await getContainer('courses')
  const query = `SELECT * FROM c WHERE c.tenantId = @tenantId`
  // ... lógica
}
```

**Middleware:**
- `authenticateToken` - Valida JWT
- `requireAuth` - Requiere autenticación
- `requireRole` - Requiere rol específico
- `requirePermission` - Requiere permiso específico

### Base de Datos (Cosmos DB)

**Estructura:**
- **Database:** `accesslearn-db`
- **Containers:** `users`, `courses`, `user-progress`, etc.
- **Partition Key:** `tenantId` (para multi-tenancy)

**Queries:**
```typescript
const query = `SELECT * FROM c WHERE c.tenantId = @tenantId AND c.status = @status`
const { resources } = await container.items.query({
  query,
  parameters: [
    { name: '@tenantId', value: tenantId },
    { name: '@status', value: 'published' }
  ]
}).fetchAll()
```

---

## 🧪 TESTING Y CALIDAD

### Ejecutar Tests

```bash
# Frontend
npm run test

# Backend
cd backend
npm run test
```

### Linting

```bash
# Frontend
npm run lint

# Backend (si está configurado)
cd backend
npm run lint
```

### Estándares de Código

- **TypeScript:** Tipado estricto
- **ESLint:** Reglas de linting
- **Prettier:** Formateo automático
- **Conventional Commits:** Formato de commits

**Ejemplo de Commit:**
```
feat: agregar panel de configuración de branding
fix: corregir error en carga de cursos
docs: actualizar documentación de API
refactor: mejorar estructura de componentes
```

---

## 📚 RECURSOS Y DOCUMENTACIÓN

### Documentación Interna

- **`docs/PROYECTO_ESTADO_ACTUAL.md`** - Estado completo del proyecto
- **`docs/DEMO_READINESS_CHECKLIST.md`** - Checklist para demo
- **`README.md`** - Overview del proyecto
- **`docs/ACCESSIBILITY_STYLE_GUIDE.md`** - Guía de accesibilidad

### Documentación Externa

- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org
- **Tailwind CSS:** https://tailwindcss.com
- **Azure Cosmos DB:** https://learn.microsoft.com/azure/cosmos-db/
- **Express:** https://expressjs.com

### Canales de Comunicación

- **GitHub Issues:** Para bugs y features
- **Pull Requests:** Para code reviews
- **Documentación:** Para preguntas técnicas

---

## 🚀 PRÓXIMOS PASOS

Después de completar esta guía:

1. ✅ Configura tu entorno de desarrollo
2. ✅ Explora el código base
3. ✅ Prueba las funcionalidades principales
4. ✅ Revisa los issues abiertos en GitHub
5. ✅ Elige una tarea pequeña para comenzar
6. ✅ Crea tu primer PR

### Tareas Recomendadas para Empezar

- **Bugs pequeños:** Fix de typos, mejoras de UI
- **Documentación:** Mejorar comentarios, actualizar docs
- **Testing:** Agregar tests para componentes existentes
- **Refactoring:** Mejorar código existente

---

## ❓ PREGUNTAS FRECUENTES

### ¿Cómo agrego un nuevo endpoint?

1. Crea función en `backend/src/functions/`
2. Agrega ruta en `backend/src/server.ts`
3. Agrega método en `src/services/api.service.ts`
4. Usa el método en el frontend

### ¿Cómo agrego un nuevo componente?

1. Crea componente en `src/components/`
2. Exporta desde el componente
3. Importa donde lo necesites
4. Agrega estilos con Tailwind CSS

### ¿Cómo trabajo con Cosmos DB?

1. Usa `getContainer()` de `cosmosdb.service.ts`
2. Escribe queries SQL
3. Usa partition keys correctos (`tenantId`)
4. Maneja errores apropiadamente

### ¿Dónde encuentro los tipos TypeScript?

- Frontend: `src/lib/types.ts`
- Backend: `backend/src/types/`

---

## 🎉 ¡BIENVENIDO AL EQUIPO!

Si tienes preguntas o necesitas ayuda, no dudes en preguntar. El equipo está aquí para ayudarte.

**¡Feliz coding! 🚀**

---

**Última Actualización:** 28 de Enero, 2025

