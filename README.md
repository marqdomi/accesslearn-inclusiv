# 🎓 Kaido - Plataforma Multi-Tenant de Aprendizaje Corporativo

<div align="center">

![Status](https://img.shields.io/badge/status-Producción%20Activa-success)
![Status](https://img.shields.io/badge/production-100%25%20Deployed-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Last Updated](https://img.shields.io/badge/updated-4%20Diciembre%202025-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Plataforma SaaS multi-tenant de aprendizaje corporativo gamificado, accesible y lista para producción en Azure**

[Características](#-características-principales) • [Instalación](#-instalación-rápida) • [Documentación](#-documentación) • [Estado del Proyecto](#-estado-actual-del-proyecto)

</div>

---

## 📋 Descripción

**Kaido** es una plataforma SaaS multi-tenant diseñada para transformar el aprendizaje corporativo en una experiencia gamificada, accesible e inclusiva. La plataforma combina elementos de gamificación (XP, logros, niveles) con cumplimiento completo de **WCAG 2.1 Level AA** para garantizar accesibilidad universal.

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
| **Frontend Features** | 100% | ✅ Funcional en Producción |
| **Backend API** | 100% | ✅ Funcional en Producción |
| **Base de Datos** | 100% | ✅ Cosmos DB operativa |
| **Storage** | 100% | ✅ Azure Blob Storage configurado |
| **Autenticación** | 100% | ✅ JWT implementado |
| **Multi-tenancy** | 100% | ✅ Funcional y probado |
| **Infraestructura Azure** | 100% | ✅ Desplegado y funcionando |
| **CI/CD** | 100% | ✅ GitHub Actions activo |
| **Testing** | 30% | ⚠️ Manual completo, automatizado pendiente |
| **Documentación** | 90% | ✅ Actualizada y completa |

**Estado General:** 🟢 **100% Desplegado en Producción | Listo para Demo y Producción**

### 📊 Métricas del Proyecto

- **Líneas de Código:** ~45,000 LOC (TypeScript/React)
- **Componentes React:** 150+ componentes
- **Endpoints API:** 50+ endpoints REST funcionales
- **Containers Cosmos DB:** 8+ containers configurados
- **Traducciones:** 2,204 líneas (ES/EN)
- **Documentación:** 120+ archivos MD en `/docs`
- **Commits (Últimos 30 días):** 30+ commits

### 🆕 Cambios Recientes (Diciembre 2025)

- ✅ **Perfiles de Accesibilidad**: Sistema completo de perfiles predefinidos (Discalexia, Baja Visión, Daltonismo, Auditiva, Motora, Cognitiva)
- ✅ **Gestión de Perfiles**: Panel administrativo para crear, editar y gestionar perfiles de accesibilidad personalizados
- ✅ **Selector de Perfiles**: Componente para que usuarios seleccionen y apliquen perfiles de accesibilidad
- ✅ **Migración Automática**: Scripts para crear perfiles por defecto en todos los tenants existentes
- ✅ **Scripts de Utilidad**: Herramienta para obtener credenciales de Azure Cosmos DB automáticamente
- ✅ **Optimización de Queries**: Corrección de consultas Cosmos DB para evitar errores de índices compuestos
- ✅ **Dashboard Mejorado**: Nuevos componentes `ContinueLearningCard`, `StatsCard`, `QuickActions`, `RecommendedCourses`
- ✅ **Navbar Refactorizado**: Simplificación UI/UX, notificaciones, breadcrumbs
- ✅ **Course Viewer Mejorado**: Navegación tipo heatmap, cola de notificaciones gamificadas
- ✅ **Azure Blob Storage**: Integración completa para logos, avatares y media de cursos

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
- **Frontend:** Azure Container Apps (`ca-accesslearn-frontend-prod`)
- **Backend:** Azure Container Apps (`ca-accesslearn-backend-prod`)
- **Database:** Azure Cosmos DB (Serverless)
- **Storage:** Azure Blob Storage (`accesslearnmedia`)
- **CI/CD:** GitHub Actions (auto-deploy en push a `main`)
- **Monitoring:** Application Insights
- **Registry:** Azure Container Registry (ACR)

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
├── Container: certificates (partición por tenantId)
└── Container: accessibility-profiles (partición por tenantId)
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
| **[AUDITORIA_COMPLETA_2025-01-24.md](./docs/AUDITORIA_COMPLETA_2025-01-24.md)** ⭐ | Auditoría completa actualizada (Enero 2025) | Todos |
| **[ONBOARDING_DEVELOPER.md](./docs/ONBOARDING_DEVELOPER.md)** ⭐ | Guía para nuevos desarrolladores | Desarrolladores |
| **[DEMO_READINESS_CHECKLIST.md](./docs/DEMO_READINESS_CHECKLIST.md)** ⭐ | Checklist para demo con cliente | PM/Stakeholders |
| **[INDICE_DOCUMENTACION.md](./docs/INDICE_DOCUMENTACION.md)** | Índice completo de documentación | Todos |
| **[AZURE_DEPLOYMENT_GUIDE.md](./docs/AZURE_DEPLOYMENT_GUIDE.md)** | Guía de despliegue en Azure | DevOps |

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
- **Perfiles de Accesibilidad**: 6 perfiles predefinidos para necesidades específicas
  - **Discalexia**: Fuente especializada, espaciado mejorado, texto grande
  - **Baja Visión**: Alto contraste, texto aumentado, zoom al 150%
  - **Daltonismo**: Filtros de color, indicadores visuales adicionales
  - **Auditiva**: Subtítulos grandes, notificaciones visuales, transcripciones
  - **Motora**: Navegación simplificada, áreas de toque grandes, sin límites de tiempo
  - **Cognitiva**: Lectura simplificada, ayudas contextuales, pausas automáticas
- **Gestión de Perfiles**: Administradores pueden crear y personalizar perfiles
- **Selector de Perfiles**: Interfaz intuitiva para seleccionar y aplicar perfiles
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

✅ **100% Desplegado y Funcionando:**
- **Frontend:** Azure Container Apps (`ca-accesslearn-frontend-prod`)
  - URL: `https://app.kainet.mx`
- **Backend:** Azure Container Apps (`ca-accesslearn-backend-prod`)
  - URL: `https://ca-accesslearn-backend-prod.gentlerock-167c09dc.eastus.azurecontainerapps.io`
- **Database:** Azure Cosmos DB (`accesslearn-cosmos-prod`)
- **Storage:** Azure Blob Storage (`accesslearnmedia`)
- **Registry:** Azure Container Registry (`craccesslearnprodheqnzemqhoxru`)
- **CI/CD:** GitHub Actions (auto-deploy)
- **Monitoring:** Application Insights

### CI/CD Pipeline

El proyecto tiene un pipeline automatizado que:
1. Detecta pushes a `main` (backend o frontend)
2. Construye las imágenes Docker
3. Las sube a Azure Container Registry
4. Despliega automáticamente a Azure Container Apps
5. Ejecuta health checks automáticos

**Workflow:** `.github/workflows/deploy-production.yml`

### Configuración de Producción

Las variables de entorno están configuradas en Azure Container Apps:
- `COSMOS_ENDPOINT` ✅
- `COSMOS_KEY` (secret) ✅
- `COSMOS_DATABASE=accesslearn-db` ✅
- `JWT_SECRET` (secret) ✅
- `AZURE_STORAGE_CONNECTION_STRING` ✅
- `RESEND_API_KEY` (secret) ✅
- `APPLICATIONINSIGHTS_CONNECTION_STRING` ✅
- `NODE_ENV=production` ✅

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

- **Error de conexión a Cosmos DB**: Verifica las variables de entorno en Azure Portal
- **Error 401/403**: Verifica que el token JWT sea válido y no haya expirado
- **Cursos no aparecen**: Verifica que el tenant esté correctamente configurado
- **Error 404 en upload de archivos**: Verifica que `AZURE_STORAGE_CONNECTION_STRING` esté configurada
- **Container crasheando**: Revisa los logs con `az containerapp logs show`

### Scripts de Diagnóstico y Utilidad

El proyecto incluye scripts útiles para diagnóstico y gestión:
- `scripts/get-cosmos-credentials.sh` - Obtiene credenciales de Azure Cosmos DB automáticamente
- `backend/src/scripts/seed-all-tenants-profiles.ts` - Crea perfiles de accesibilidad para todos los tenants
- `backend/src/scripts/seed-accessibility-profiles.ts` - Crea perfiles de accesibilidad para un tenant específico
- `quick-test-upload.sh` - Test rápido del endpoint de upload
- `test-upload-endpoint.sh` - Diagnóstico completo de endpoints
- `redeploy-backend.sh` - Script para redesplegar el backend

### Recursos

- 📚 [Documentación Completa](./docs/INDICE_DOCUMENTACION.md)
- 🐛 [Reportar Issues](https://github.com/marqdomi/accesslearn-inclusiv/issues)
- 💬 [Discusiones](https://github.com/marqdomi/accesslearn-inclusiv/discussions)

---

## 🗺️ Roadmap

### Próximos Pasos (Q1 2026)

#### Prioridad Alta
- [ ] Testing automatizado completo (Jest/Vitest + Playwright)
- [ ] Alertas y monitoreo en Application Insights
- [ ] Backup y disaster recovery (Cosmos DB + Blob Storage)
- [ ] Revisión de seguridad completa
- [ ] Rate limiting en endpoints críticos

#### Prioridad Media
- [ ] Documentación de API (Swagger/OpenAPI)
- [ ] Optimizaciones de performance
- [ ] Mejoras de seguridad (bcrypt, input validation)
- [ ] Azure AD B2C integration (opcional)

### Completado Recientemente ✅

- ✅ Sistema completo de Perfiles de Accesibilidad (6 perfiles predefinidos)
- ✅ Gestión administrativa de perfiles personalizados
- ✅ Scripts de migración para tenants existentes
- ✅ Herramientas de utilidad para gestión de Azure Cosmos DB
- ✅ Azure Blob Storage para media (logos, avatares, course covers)
- ✅ Mejoras UI/UX completas (Dashboard, Navbar, Course Viewer)
- ✅ Integración completa con Azure Container Apps
- ✅ CI/CD automatizado con GitHub Actions
- ✅ Application Insights configurado

### Futuro

- [ ] Mobile apps (React Native)
- [ ] Video streaming (Azure Media Services)
- [ ] AI/ML para recomendaciones personalizadas
- [ ] Integraciones con LMS externos
- [ ] Marketplace de cursos

---

## 📞 Contacto

**Proyecto:** Kaido - Multi-Tenant Learning Platform  
**Repositorio:** [github.com/marqdomi/accesslearn-inclusiv](https://github.com/marqdomi/accesslearn-inclusiv)  
**Estado:** 🟢 **Producción Activa**  
**Última Actualización:** 4 de Diciembre, 2025

---

<div align="center">

**Construido con ♿ accesibilidad, 🎮 gamificación, y ☁️ Azure cloud**

⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub

</div>
