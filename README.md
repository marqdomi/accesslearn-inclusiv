# 🎓 AccessLearn - Plataforma Multi-Tenant de Aprendizaje Corporativo

<div align="center">

![Status](https://img.shields.io/badge/status-95%25%20Demo%20Ready-success)
![Status](https://img.shields.io/badge/production-90%25%20Ready-yellow)
![Version](https://img.shields.io/badge/version-1.0.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Plataforma SaaS multi-tenant de aprendizaje corporativo gamificado, accesible y lista para producción en Azure**

[Características](#-características-principales) • [Instalación](#-instalación-rápida) • [Documentación](#-documentación) • [Estado del Proyecto](#-estado-actual-del-proyecto)

</div>

---

## 📋 Descripción

**AccessLearn** es una plataforma SaaS multi-tenant diseñada para transformar el aprendizaje corporativo en una experiencia gamificada, accesible e inclusiva. La plataforma combina elementos de gamificación (XP, logros, niveles) con cumplimiento completo de **WCAG 2.1 Level AA** para garantizar accesibilidad universal.

### 🎯 Características Principales

- 🎮 **Gamificación Completa**: Sistema de XP, logros, niveles, tablas de clasificación y desafíos
- 🏢 **Multi-Tenancy**: Arquitectura SaaS con aislamiento completo de datos por tenant
- ♿ **Accesibilidad Total**: Cumplimiento WCAG 2.1 Level AA desde el diseño
- 🎨 **Dual Persona**: Experiencia gamificada para estudiantes, profesional para administradores
- 📚 **Constructor de Cursos**: Herramienta profesional de autoría con contenido rico
- 📊 **Analíticas Avanzadas**: Dashboards completos con métricas de engagement
- 🏆 **Certificados**: Generación de PDFs con branding de la empresa
- 🌐 **Internacionalización**: Soporte completo ES/EN (2,204 líneas de traducción)
- ☁️ **Azure Cloud**: Desplegado en Azure Container Apps con CI/CD automatizado

---

## 🚀 Estado Actual del Proyecto

### ✅ Completitud General

| Área | Completitud | Estado |
|------|-------------|--------|
| **Frontend Features** | 95% | ✅ Funcional |
| **Backend API** | 90% | ✅ Funcional |
| **Base de Datos** | 100% | ✅ Cosmos DB configurado |
| **Autenticación** | 85% | ✅ JWT implementado |
| **Multi-tenancy** | 80% | ⚠️ Funcional, necesita testing |
| **Infraestructura Azure** | 90% | ✅ Desplegado y funcionando |
| **Testing** | 30% | ❌ Pendiente |
| **Documentación** | 75% | ⚠️ Buena, necesita actualización |

**Estado General:** 🟢 **95% Listo para Demo | 90% Listo para Producción**

### 📊 Métricas del Proyecto

- **Líneas de Código:** ~53,500 LOC (Frontend: ~45,000 | Backend: ~8,500)
- **Componentes React:** 100+ componentes
- **Endpoints API:** 90+ endpoints REST funcionales
- **Containers Cosmos DB:** 8 containers configurados
- **Traducciones:** 2,204 líneas (ES/EN)
- **Documentación:** 119 archivos MD en `/docs`

### 🆕 Cambios Recientes (Diciembre 2024)

- ✅ **Sistema de Progreso**: Cálculo correcto de porcentaje de avance basado en lecciones reales
- ✅ **Sincronización de Estadísticas**: Biblioteca sincronizada con Cosmos DB
- ✅ **Quizzes Mejorados**: Preguntas de ordenamiento implementadas
- ✅ **Publicación Directa**: Endpoint para publicar cursos directamente
- ✅ **Auto-inscripción**: Estudiantes pueden inscribirse en cursos publicados
- ✅ **Indicadores Visuales**: Badge "Inscrito" en catálogo de cursos

---

## 🏗️ Arquitectura

### Stack Tecnológico

**Frontend:**
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS v4 + shadcn/ui
- Framer Motion (animaciones)
- Phosphor Icons

**Backend:**
- Node.js + Express.js
- TypeScript
- JWT Authentication
- Azure Cosmos DB

**Infraestructura:**
- **Frontend:** Azure Static Web Apps (o Container Apps)
- **Backend:** Azure Container Apps
- **Database:** Azure Cosmos DB (Serverless)
- **CI/CD:** GitHub Actions
- **Monitoring:** Application Insights

### Arquitectura Multi-Tenant

```
Azure Cosmos DB
├── Container: tenants (metadata compartida)
├── Container: users (partición por tenantId)
├── Container: courses (partición por tenantId)
├── Container: user-progress (partición por tenantId)
├── Container: categories (partición por tenantId)
├── Container: notifications (partición por tenantId)
├── Container: audit-logs (partición por tenantId)
└── Container: certificates (partición por tenantId)
```

**Estrategia de Aislamiento:**
- Partición por `tenantId` en todos los containers
- Resolución de tenant por subdomain o header HTTP
- Branding personalizado por tenant (logo, colores)
- Datos completamente aislados entre tenants

---

## 🚀 Instalación Rápida

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Azure Cosmos DB (para producción) o configuración local

### Desarrollo Local

```bash
# Clonar el repositorio
git clone https://github.com/marqdomi/accesslearn-inclusiv.git
cd accesslearn-inclusiv

# Instalar dependencias del frontend
cd src  # Si es necesario
npm install

# Instalar dependencias del backend
cd ../backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Cosmos DB

# Iniciar backend (puerto 3000)
npm run dev

# En otra terminal, iniciar frontend (puerto 5173)
cd ..
npm run dev
```

### Acceso a la Aplicación

1. Abre `http://localhost:5173`
2. Selecciona un tenant (ej: `kainet`)
3. Inicia sesión con credenciales de prueba

### Credenciales de Prueba

**Super Admin (Kainet):**
- Email: `ana.lopez@kainet.mx`
- Password: `Demo123!`

Ver [CREDENCIALES_TEST_USUARIOS.md](./docs/CREDENCIALES_TEST_USUARIOS.md) para más usuarios de prueba.

---

## 📚 Documentación

### 📖 Documentos Principales

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| **[PROYECTO_ESTADO_ACTUAL.md](./docs/PROYECTO_ESTADO_ACTUAL.md)** ⭐ | Auditoría completa del proyecto | Todos |
| **[ONBOARDING_DEVELOPER.md](./docs/ONBOARDING_DEVELOPER.md)** ⭐ | Guía para nuevos desarrolladores | Desarrolladores |
| **[DEMO_READINESS_CHECKLIST.md](./docs/DEMO_READINESS_CHECKLIST.md)** ⭐ | Checklist para demo con cliente | PM/Stakeholders |
| **[INDICE_DOCUMENTACION.md](./docs/INDICE_DOCUMENTACION.md)** | Índice completo de documentación | Todos |

### 🧪 Testing Manual

- **[TESTING_MANUAL_GUIA_COMPLETA.md](./docs/TESTING_MANUAL_GUIA_COMPLETA.md)** - Guía completa de testing
- **[TESTING_MANUAL_CHECKLIST_RAPIDO.md](./docs/TESTING_MANUAL_CHECKLIST_RAPIDO.md)** - Checklist rápido

### 🏗️ Arquitectura y Diseño

- **[DUAL_PERSONA_ARCHITECTURE.md](./docs/DUAL_PERSONA_ARCHITECTURE.md)** - Arquitectura dual persona
- **[ACCESSIBILITY_STYLE_GUIDE.md](./docs/ACCESSIBILITY_STYLE_GUIDE.md)** - Guía de accesibilidad WCAG 2.1 AA
- **[ADMIN_EXPERIENCE_ARCHITECTURE.md](./docs/ADMIN_EXPERIENCE_ARCHITECTURE.md)** - Arquitectura de experiencia admin

### 📋 Guías de Usuario

- **[FORMULARIO_REGISTRO_DEMO.md](./docs/FORMULARIO_REGISTRO_DEMO.md)** - Registro público de estudiantes
- **[CREDENCIALES_TEST_USUARIOS.md](./docs/CREDENCIALES_TEST_USUARIOS.md)** - Credenciales de usuarios de prueba

---

## ✨ Características Principales

### 🎮 Gamificación

- **Sistema de XP**: Puntos por cada acción (completar lección, quiz, etc.)
- **Niveles y Rangos**: Progreso a través de 50+ niveles
- **Logros**: Desbloquea trofeos (bronce → platino)
- **Misiones**: Diarias, semanales y de historia
- **Rachas**: Mantén el momentum de aprendizaje
- **Tablas de Clasificación**: Compite con compañeros

### ♿ Accesibilidad

- **WCAG 2.1 Level AA**: Cumplimiento completo
- **Navegación por Teclado**: 100% accesible sin mouse
- **Lectores de Pantalla**: Optimizado para NVDA, JAWS, VoiceOver
- **Alto Contraste**: Modo de visibilidad mejorada
- **Reducir Animación**: Respeta preferencias de movimiento
- **Tamaño de Texto**: Ajustable (Normal, Grande, Extra Grande)
- **Filtros de Color**: Soporte para daltonismo
- **Panel Avanzado**: Configuración completa de accesibilidad

### 📚 Gestión de Cursos

- **Constructor Profesional**: Herramienta de autoría con pasos guiados
- **Tipos de Contenido**: Markdown, video, audio, quizzes, código
- **Quizzes Interactivos**: Múltiple opción, verdadero/falso, ordenamiento
- **Flujo de Aprobación**: Draft → Pending Review → Published
- **Publicación Directa**: Para instructores con permisos
- **Categorías y Etiquetas**: Organización flexible

### 👥 Gestión de Usuarios

- **Roles y Permisos**: Sistema granular de permisos
- **Invitaciones por Email**: Onboarding automatizado
- **Registro Público**: Estudiantes pueden registrarse directamente
- **Gestión Masiva**: Carga masiva de usuarios
- **Grupos y Asignaciones**: Organización por departamentos

### 📊 Analíticas

- **Dashboard de Progreso**: Vista completa del avance del estudiante
- **Biblioteca de Cursos**: Cursos inscritos con progreso detallado
- **Estadísticas de Curso**: Completitud, XP ganado, mejor calificación
- **Reportes Administrativos**: Métricas de engagement por tenant

---

## 🔐 Seguridad y Multi-Tenancy

### Aislamiento de Datos

- **Partición por Tenant**: Todos los containers usan `tenantId` como partition key
- **Validación de Tenant**: Middleware valida que el usuario pertenezca al tenant
- **JWT con Tenant**: Token incluye `tenantId` para validación
- **Sin Cross-Tenant Access**: Imposible acceder a datos de otros tenants

### Autenticación

- **JWT Tokens**: Autenticación basada en tokens
- **Password Hashing**: SHA-256 (mejorable a bcrypt)
- **Sesiones Persistentes**: Tokens almacenados en localStorage
- **Refresh Automático**: Actualización de usuario al cargar páginas

### Permisos

- **Roles Predefinidos**: super-admin, tenant-admin, content-manager, instructor, student, mentor, etc.
- **Permisos Granulares**: Sistema de permisos por acción (ej: `courses:create`, `users:view`)
- **Permisos Personalizados**: Override de permisos por usuario

---

## 🚢 Despliegue en Azure

### Infraestructura Actual

✅ **Desplegado y Funcionando:**
- Azure Container Apps (Backend)
- Azure Cosmos DB (Database)
- Azure Container Registry (ACR)
- GitHub Actions (CI/CD)
- Application Insights (Monitoring)

### CI/CD Pipeline

El proyecto tiene un pipeline automatizado que:
1. Detecta pushes a `main`
2. Construye las imágenes Docker
3. Las sube a Azure Container Registry
4. Despliega automáticamente a Azure Container Apps

**Workflow:** `.github/workflows/azure-container-apps.yml`

### Configuración de Producción

Las variables de entorno se configuran en Azure Portal:
- `COSMOS_DB_ENDPOINT`
- `COSMOS_DB_KEY`
- `JWT_SECRET`
- `NODE_ENV=production`

---

## 🧪 Testing

### Testing Manual

El proyecto incluye guías completas de testing manual:
- **[TESTING_MANUAL_GUIA_COMPLETA.md](./docs/TESTING_MANUAL_GUIA_COMPLETA.md)**
- **[TESTING_MANUAL_CHECKLIST_RAPIDO.md](./docs/TESTING_MANUAL_CHECKLIST_RAPIDO.md)**

### Testing Automatizado

⚠️ **Pendiente de Implementación:**
- Unit tests (Jest/Vitest)
- Integration tests
- E2E tests (Playwright/Cypress)
- Accessibility tests automatizados

---

## 🤝 Contribución

### Para Desarrolladores Nuevos

1. Lee **[ONBOARDING_DEVELOPER.md](./docs/ONBOARDING_DEVELOPER.md)**
2. Configura tu entorno de desarrollo
3. Revisa la estructura del proyecto
4. Sigue las convenciones de código existentes

### Guías de Contribución

- **Accesibilidad**: Todas las nuevas features deben mantener WCAG 2.1 AA
- **Testing**: Agregar tests para nuevas funcionalidades
- **Documentación**: Actualizar documentación relevante
- **Commits**: Usar mensajes descriptivos en español o inglés

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Ver [LICENSE](./LICENSE) para más detalles.

---

## 🆘 Soporte

### Problemas Comunes

- **Error de conexión a Cosmos DB**: Verifica las variables de entorno
- **Error 401/403**: Verifica que el token JWT sea válido
- **Cursos no aparecen**: Verifica que el tenant esté correctamente configurado

### Recursos

- 📚 [Documentación Completa](./docs/INDICE_DOCUMENTACION.md)
- 🐛 [Reportar Issues](https://github.com/marqdomi/accesslearn-inclusiv/issues)
- 💬 [Discusiones](https://github.com/marqdomi/accesslearn-inclusiv/discussions)

---

## 🗺️ Roadmap

### Próximos Pasos (Q1 2025)

- [ ] Testing automatizado completo
- [ ] Mejoras de seguridad (bcrypt, rate limiting)
- [ ] Azure AD B2C integration
- [ ] Azure Blob Storage para media
- [ ] Mejoras de performance
- [ ] Documentación de API (Swagger/OpenAPI)

### Futuro

- [ ] Mobile apps (React Native)
- [ ] Video streaming (Azure Media Services)
- [ ] AI/ML para recomendaciones
- [ ] Integraciones con LMS externos
- [ ] Marketplace de cursos

---

## 📞 Contacto

**Proyecto:** AccessLearn - Multi-Tenant Learning Platform  
**Repositorio:** [github.com/marqdomi/accesslearn-inclusiv](https://github.com/marqdomi/accesslearn-inclusiv)  
**Estado:** 🟢 Activo en Desarrollo

---

<div align="center">

**Construido con ♿ accesibilidad, 🎮 gamificación, y ☁️ Azure cloud**

⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub

</div>
