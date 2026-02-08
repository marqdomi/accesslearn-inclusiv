# 📊 Estado Actual del Proyecto y Roadmap hacia Multi-Tenancy SaaS

**Fecha de Análisis:** 18 de Noviembre, 2025  
**Proyecto:** AccessLearn / GameLearn  
**Objetivo:** Plataforma LMS Multi-tenant lista para deployment en Azure

---

## 🎯 Visión del Proyecto

**Plataforma SaaS Multi-tenant de Aprendizaje Corporativo Gamificado**

Permitir que múltiples empresas (tenants) tengan sus propias instancias aisladas con:
- ✅ Branding personalizado (logo, colores)
- ✅ Usuarios y datos completamente aislados
- ✅ Cursos propios o compartidos (marketplace de partners)
- ✅ Estadísticas y analytics por empresa
- ✅ Facturación por empresa/número de usuarios
- ✅ Sistema de trials gratuitos para validación
- ✅ Compliance con regulación mexicana (CURP, RFC, NSS)
- ✅ Integración futura con STPS para constancias oficiales

---

## 📈 Estado Actual del Proyecto

### ✅ **FORTALEZAS: Features Implementadas y Funcionando**

#### 1. **Sistema de Autenticación Completo** ✅
- Login con credenciales temporales
- Cambio de contraseña obligatorio en primer login
- Onboarding de nuevos usuarios
- Gestión de sesiones
- Roles (Admin/Employee)

#### 2. **Sistema de Gamificación** ✅
- Sistema de XP y niveles
- 50+ Achievements (Bronze, Silver, Gold, Platinum)
- Leaderboards
- Weekly Challenges
- Badges y recompensas
- Streaks (racha de días)

#### 3. **Gestión de Cursos Profesional** ✅
- Course Builder con editor rico
- Múltiples tipos de contenido (texto, video, audio, challenges)
- Sistema modular (Course → Modules → Lessons)
- Preview en tiempo real
- Drag & drop para reordenar

#### 4. **Sistema de Certificados** ✅
- Generación automática de certificados PDF
- Branding de empresa en certificados
- Descarga y compartir
- Verificación con código único

#### 5. **Analytics Dashboard (Admin)** ✅
- Métricas de engagement
- Reportes de progreso por empleado
- ROI de capacitación
- Estadísticas de cursos completados
- Exportación CSV

#### 6. **Gestión Avanzada de Empleados** ✅
- Creación manual de usuarios
- Inscripción masiva (CSV)
- Gestión de grupos con IA
- Asignación de cursos a grupos/individuos

#### 7. **Sistema de Mentoría** ✅
- Emparejamiento mentor-aprendiz
- Sistema de mensajes
- Seguimiento de progreso
- XP para mentores

#### 8. **Community Features** ✅
- Foros Q&A por curso
- Sistema de menciones (@usuario)
- Feed de actividad
- Team Challenges
- Notificaciones

#### 9. **Internacionalización (i18n)** ✅
- Soporte completo ES/EN
- 2,204 líneas de traducciones
- Cambio de idioma en tiempo real
- **Prioridad:** Mercado mexicano (español prioritario, inglés secundario)

#### 10. **Accesibilidad WCAG 2.1 Level AA** ✅
- Soporte para lectores de pantalla
- Alto contraste
- Navegación por teclado 100%
- Reduce motion
- Focus indicators

#### 11. **Dual Persona Architecture** ✅
- **Learner Persona**: Experiencia gamificada tipo videojuego
- **Admin Persona**: Interface profesional tipo SaaS
- Sistema de diseño completo con CSS variables

#### 12. **Branding Básico** ✅ ⚠️
- Upload de logo de empresa
- Color primario personalizado
- Verificación de contraste WCAG
- **NOTA:** Actualmente single-tenant, requiere migración a multi-tenant

#### 13. **Campos Compliance Mexicano** ✅ (Nuevo)
- Modelo User actualizado con campos mexicanos:
  - CURP (Clave Única de Registro de Población)
  - RFC (Registro Federal de Contribuyentes)
  - NSS (Número de Seguridad Social)
  - Puesto/cargo laboral
  - Área/departamento
  - Centro de costos
- **Objetivo:** Cumplimiento regulatorio y control administrativo para empresas mexicanas
- Aplicación en toda la plataforma

---

### ⚠️ **DEBILIDADES CRÍTICAS: Lo que NO está listo**

#### 🔴 **1. MULTI-TENANCY: NO EXISTE** (Crítico)
**Problema:** Actualmente es una aplicación de un solo tenant
- ❌ No hay concepto de "Organization" o "Tenant"
- ❌ Todos los datos están en un solo espacio compartido
- ❌ No hay aislamiento de datos entre empresas
- ❌ Imposible tener múltiples empresas usando la misma instancia

**Impacto:** **BLOQUEADOR TOTAL** para el modelo SaaS multi-empresa

#### 🔴 **2. BACKEND: NO EXISTE** (Crítico)
**Problema:** Toda la data está en GitHub Spark KV (localStorage mejorado)
- ❌ No hay base de datos real (SQL/NoSQL)
- ❌ No hay APIs backend
- ❌ No hay servidor
- ❌ Datos solo existen en el navegador del cliente
- ❌ No hay persistencia real entre dispositivos

**Impacto:** **BLOQUEADOR TOTAL** para producción

#### 🔴 **3. ARQUITECTURA AZURE: NO DISEÑADA** (Crítico)
- ❌ No hay infraestructura definida
- ❌ No hay estrategia de deployment
- ❌ No hay plan de escalabilidad
- ❌ No hay configuración de CI/CD

#### 🟡 **4. AUTENTICACIÓN REAL: BÁSICA**
- ⚠️ Autenticación básica sin OAuth/SAML/SSO
- ⚠️ No hay integración con Azure AD / Entra ID
- ⚠️ Passwords en "memoria" (no encriptados en DB)

#### 🟡 **5. MULTI-TENANCY FEATURES FALTANTES**
- ❌ No hay onboarding de nuevas empresas
- ❌ No hay gestión de subscripciones
- ❌ No hay facturación
- ❌ No hay límites por plan (usuarios, cursos, storage)
- ❌ No hay panel de super-admin para gestionar tenants

#### 🟡 **6. TESTING: LIMITADO**
- ⚠️ No hay tests unitarios
- ⚠️ No hay tests de integración
- ⚠️ Playwright configurado pero sin tests implementados

#### 🟡 **7. SECURITY & COMPLIANCE**
- ⚠️ No hay encriptación de datos sensibles
- ⚠️ No hay audit logs
- ⚠️ No hay rate limiting
- ⚠️ No hay protección CSRF/XSS implementada

---

## 🏗️ ARQUITECTURA PROPUESTA: Azure Multi-Tenant SaaS

### **Modelo de Multi-Tenancy Recomendado**

#### **Opción 1: Database-per-Tenant (RECOMENDADO para tu caso)**
```
┌─────────────────────────────────────────────────────┐
│              Azure App Service (Frontend)            │
│                   React + TypeScript                 │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              Azure Functions (Backend)               │
│           Node.js/TypeScript REST APIs               │
│                                                       │
│  ┌────────────────────────────────────────────┐    │
│  │      Tenant Resolution Middleware          │    │
│  │  (Extrae tenantId de subdomain/header)     │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼─────┐ ┌────▼─────┐ ┌────▼─────┐
│   Cosmos DB │ │ Cosmos DB │ │ Cosmos DB │
│  Tenant A   │ │ Tenant B  │ │ Tenant C  │
│  (Database) │ │ (Database)│ │ (Database)│
└─────────────┘ └───────────┘ └───────────┘
```

**Ventajas:**
- ✅ Aislamiento total de datos (seguridad máxima)
- ✅ Fácil de cumplir con GDPR/compliance por cliente
- ✅ Backups independientes por tenant
- ✅ Escalabilidad por cliente individual
- ✅ Migraciones de datos más simples

**Desventajas:**
- ⚠️ Costo: Una base de datos por tenant (mitigable con Cosmos DB Serverless)
- ⚠️ Gestión de múltiples DBs

#### **Opción 2: Shared Database with Tenant Isolation**
```
Todos los tenants comparten la misma DB, pero cada tabla tiene
tenantId como partition key.
```
**Ventajas:**
- ✅ Costo menor (una sola DB)
- ✅ Más simple de mantener

**Desventajas:**
- ❌ Riesgo de data leakage si hay bugs
- ❌ Backups no aislados
- ❌ Más complejo para compliance

### **Stack Tecnológico Azure Recomendado**

```yaml
Frontend:
  - Azure Static Web Apps (React)
  - CDN Global
  - Custom Domains (tenant1.accesslearn.com)

Backend:
  - Azure Functions (Serverless APIs)
  - Node.js + TypeScript
  - Express.js o Fastify

Database:
  - Azure Cosmos DB (NoSQL) - RECOMENDADO
    ó
  - Azure SQL Database (Relacional)
  
Autenticación:
  - Azure AD B2C (para empleados)
  - Azure AD (para SSO empresarial)

Storage:
  - Azure Blob Storage (videos, imágenes, certificados)

Monitoring:
  - Azure Application Insights
  - Azure Monitor

CI/CD:
  - GitHub Actions
  - Azure DevOps
```

---

## 🗺️ ROADMAP COMPLETO: Del Estado Actual a SaaS Multi-Tenant

### **FASE 0: Preparación y Decisiones Arquitectónicas** (1 semana)
**Objetivo:** Definir arquitectura y configurar Azure

#### Tareas:
- [ ] Crear Azure Subscription para el proyecto
- [ ] Decidir: Cosmos DB vs Azure SQL
- [ ] Decidir: Database-per-Tenant vs Shared Database
- [ ] Crear Resource Group en Azure
- [ ] Configurar Azure AD B2C tenant
- [ ] Diseñar el modelo de datos multi-tenant
- [ ] Crear diagrama de arquitectura final
- [ ] Documentar decisiones técnicas

**Entregable:** Documento de arquitectura aprobado

---

### **FASE 1: Backend Foundation** (3-4 semanas)
**Objetivo:** Crear el backend con APIs y base de datos real

#### 1.1 Setup Azure Functions (Semana 1)
- [ ] Crear Azure Functions App
- [ ] Configurar TypeScript + ESLint
- [ ] Implementar estructura de carpetas
- [ ] Configurar CORS
- [ ] Setup logging con Application Insights
- [ ] Crear funciones de health check

#### 1.2 Database Setup (Semana 1)
**Opción A: Cosmos DB**
- [ ] Crear Cosmos DB Account (Serverless)
- [ ] Diseñar containers y partition keys
- [ ] Implementar tenant isolation strategy
- [ ] Crear scripts de migración

**Opción B: Azure SQL**
- [ ] Crear Azure SQL Server
- [ ] Diseñar schema multi-tenant
- [ ] Crear stored procedures
- [ ] Configurar elastic pools

#### 1.3 Core API Implementation (Semana 2-3)
- [ ] **Tenant Management APIs**
  - `POST /api/tenants` - Crear nuevo tenant
  - `GET /api/tenants/:id` - Obtener tenant
  - `PUT /api/tenants/:id` - Actualizar tenant
  - `DELETE /api/tenants/:id` - Eliminar tenant

- [ ] **User Management APIs**
  - `POST /api/users` - Crear usuario
  - `GET /api/users` - Listar usuarios (filtrado por tenant)
  - `PUT /api/users/:id` - Actualizar usuario
  - `DELETE /api/users/:id` - Eliminar usuario

- [ ] **Course APIs**
  - `POST /api/courses` - Crear curso
  - `GET /api/courses` - Listar cursos (por tenant)
  - `GET /api/courses/:id` - Obtener curso
  - `PUT /api/courses/:id` - Actualizar curso
  - `DELETE /api/courses/:id` - Eliminar curso

- [ ] **Progress APIs**
  - `POST /api/progress` - Registrar progreso
  - `GET /api/progress/user/:userId` - Progreso del usuario
  - `GET /api/progress/course/:courseId` - Progreso del curso

#### 1.4 Middleware & Security (Semana 3-4)
- [ ] Implementar Tenant Resolution Middleware
- [ ] Implementar autenticación JWT
- [ ] Implementar autorización RBAC
- [ ] Implementar rate limiting
- [ ] Implementar input validation (Zod)
- [ ] Implementar error handling global
- [ ] Implementar audit logging

**Entregable:** Backend funcional con APIs documentadas (Swagger/OpenAPI)

---

### **FASE 2: Multi-Tenancy en Frontend** (2-3 semanas)
**Objetivo:** Adaptar el frontend para multi-tenancy

#### 2.1 Tenant Context (Semana 1)
- [ ] Crear `TenantContext` en React
- [ ] Implementar tenant detection (subdomain/route)
- [ ] Crear `useTenant()` hook
- [ ] Implementar tenant switcher (super admin)

#### 2.2 Migrar de Spark KV a APIs Backend (Semana 1-2)
- [ ] Crear servicio HTTP client (axios/fetch)
- [ ] Migrar `use-auth.ts` a APIs backend
- [ ] Migrar `use-courses.ts` a APIs backend
- [ ] Migrar `use-user-progress.ts` a APIs backend
- [ ] Migrar `use-achievements.ts` a APIs backend
- [ ] Migrar todos los hooks restantes

#### 2.3 Tenant-Aware Components (Semana 2-3)
- [ ] Actualizar todos los componentes para incluir `tenantId`
- [ ] Implementar tenant isolation en queries
- [ ] Actualizar branding para cargar desde tenant settings
- [ ] Implementar tenant-specific routing

**Entregable:** Frontend conectado al backend con multi-tenancy

---

### **FASE 3: Autenticación Empresarial** (2 semanas)
**Objetivo:** Implementar autenticación robusta con Azure AD B2C

#### 3.1 Azure AD B2C Setup (Semana 1)
- [ ] Configurar Azure AD B2C tenant
- [ ] Crear user flows (sign-up, sign-in, password reset)
- [ ] Configurar custom branding por tenant
- [ ] Configurar SSO con SAML/OAuth (para empresas)

#### 3.2 Frontend Integration (Semana 1-2)
- [ ] Instalar MSAL library
- [ ] Implementar login con Azure AD B2C
- [ ] Implementar protected routes
- [ ] Implementar token refresh
- [ ] Migrar usuarios existentes

#### 3.3 Backend Integration (Semana 2)
- [ ] Validar JWT tokens de Azure AD B2C
- [ ] Implementar user provisioning automático
- [ ] Sincronizar roles y permisos

**Entregable:** Autenticación empresarial funcionando

---

### **FASE 4: Tenant Onboarding & Management** (2 semanas)
**Objetivo:** Crear sistema para registrar nuevas empresas

#### 4.1 Tenant Registration Flow (Semana 1)
- [ ] Crear landing page pública
- [ ] Crear formulario de registro de empresa
- [ ] Implementar validación de subdominio disponible
- [ ] Crear wizard de onboarding
  - Paso 1: Datos de empresa
  - Paso 2: Logo y branding
  - Paso 3: Crear admin inicial
  - Paso 4: Configuración básica

#### 4.2 Super Admin Dashboard (Semana 1-2)
- [ ] Crear panel de super admin
- [ ] Listar todos los tenants
- [ ] Ver estadísticas por tenant
- [ ] Activar/desactivar tenants
- [ ] Ver uso de recursos

#### 4.3 Tenant Settings (Semana 2)
- [ ] Gestión de branding avanzado
- [ ] Configuración de features habilitadas
- [ ] Configuración de límites (usuarios, storage)
- [ ] Configuración de SMTP (emails)

**Entregable:** Sistema completo de gestión de tenants

---

### **FASE 5: Storage & Media Management** (1-2 semanas)
**Objetivo:** Implementar almacenamiento de archivos en Azure Blob Storage

#### 5.1 Azure Blob Storage Setup (Semana 1)
- [ ] Crear Storage Account
- [ ] Configurar containers por tenant
- [ ] Implementar SAS tokens para acceso seguro
- [ ] Configurar CDN para delivery rápido

#### 5.2 Upload Implementation (Semana 1-2)
- [ ] Implementar upload de logos
- [ ] Implementar upload de videos de cursos
- [ ] Implementar upload de imágenes
- [ ] Implementar upload de archivos de cursos
- [ ] Implementar generación de thumbnails
- [ ] Implementar limits de storage por tenant

**Entregable:** Sistema de storage funcionando

---

### **FASE 6: Mobile-First & PWA** (2 semanas) 🎯 INNOVACIÓN
**Objetivo:** Optimización mobile y Progressive Web App

#### 6.1 PWA Setup (Semana 1)
- [ ] Crear manifest.json con branding dinámico por tenant
- [ ] Implementar Service Worker para caching
- [ ] Implementar estrategia cache-first para cursos
- [ ] Configurar instalabilidad (beforeinstallprompt)
- [ ] Testing en iOS y Android

#### 6.2 Mobile Optimization (Semana 1-2)
- [ ] Optimizar UI para una mano (thumb zone)
- [ ] Implementar swipe gestures para navegación
- [ ] Optimizar quizzes para tap rápido
- [ ] Responsive design perfecto (320px - 1920px)
- [ ] Testing de rendimiento mobile

#### 6.3 Hidden Achievements (Semana 2)
- [ ] Implementar sistema de logros ocultos
- [ ] 10 hidden achievements: Madrugador, Búho Nocturno, Speedrunner, etc.
- [ ] Sistema de descubrimiento sorpresa
- [ ] Animaciones de desbloqueo especiales

**Entregable:** PWA instalable + Hidden achievements funcionando

**Ver:** `FEATURES_INNOVADORAS.md` sección 1

---

### **FASE 7: Analytics & Reporting Multi-Tenant** (1-2 semanas)
**Objetivo:** Adaptar analytics para multi-tenancy

#### 7.1 Backend Analytics (Semana 1)
- [ ] Crear tablas de eventos por tenant
- [ ] Implementar event tracking
- [ ] Crear APIs de analytics por tenant
- [ ] Implementar aggregations eficientes

#### 7.2 Frontend Analytics (Semana 1-2)
- [ ] Adaptar dashboard de analytics
- [ ] Implementar filtros por tenant
- [ ] Crear reportes exportables
- [ ] Implementar visualizaciones (charts)

**Entregable:** Analytics multi-tenant funcionando

---

### **FASE 8: Subscriptions & Billing** (2-3 semanas)
**Objetivo:** Implementar modelo de negocio y facturación

#### 8.1 Plan Definition (Semana 1)
- [ ] Definir planes (Demo gratuito 2 meses, Profesional, Enterprise)
- [ ] Definir límites por plan
  - Usuarios activos
  - Cursos
  - Storage
  - Features premium
- [ ] Crear modelo de datos de subscripciones

#### 8.2 Stripe/Payment Integration (Semana 2)
- [ ] Integrar Stripe (o Azure Marketplace)
- [ ] Implementar checkout flow
- [ ] Implementar webhooks de pago
- [ ] Implementar actualización de plan
- [ ] Implementar cancelación

#### 8.3 Usage Tracking & Limits (Semana 2-3)
- [ ] Implementar contador de usuarios activos
- [ ] Implementar límite de storage
- [ ] Implementar límite de cursos
- [ ] Implementar soft/hard limits
- [ ] Notificaciones de límites alcanzados

**Entregable:** Sistema de subscripciones funcionando

**Ver:** `MODELO_NEGOCIO_B2B2C.md` para estructura de planes

---

### **FASE 9: Security Hardening** (1-2 semanas)
**Objetivo:** Asegurar la aplicación para producción

#### 9.1 Security Audit (Semana 1)
- [ ] Implementar HTTPS en todo
- [ ] Configurar Azure Key Vault para secrets
- [ ] Implementar CORS policy estricta
- [ ] Implementar CSP headers
- [ ] Implementar rate limiting por tenant
- [ ] Implementar DDoS protection (Azure Front Door)

#### 8.2 Compliance (Semana 1-2)
- [ ] Implementar data encryption at rest
- [ ] Implementar data encryption in transit
- [ ] Implementar audit logs
- [ ] Crear privacy policy
- [ ] Crear terms of service
- [ ] GDPR compliance checks
- [ ] Implementar data export/deletion APIs

**Entregable:** Aplicación segura y compliant

---

### **FASE 10: Testing & Quality Assurance** (2 semanas)
**Objetivo:** Asegurar calidad del software

#### 10.1 Testing Backend (Semana 1)
- [ ] Implementar tests unitarios (Jest)
- [ ] Implementar tests de integración
- [ ] Implementar tests de APIs (Supertest)
- [ ] Alcanzar 80% code coverage

#### 10.2 Testing Frontend (Semana 1-2)
- [ ] Implementar tests unitarios (Vitest)
- [ ] Implementar tests de componentes (Testing Library)
- [ ] Implementar tests E2E (Playwright)
- [ ] Tests de accesibilidad automatizados

#### 10.3 Load Testing (Semana 2)
- [ ] Configurar Azure Load Testing
- [ ] Crear escenarios de carga
- [ ] Ejecutar tests de performance
- [ ] Optimizar bottlenecks

**Entregable:** Suite completa de tests

---

### **FASE 11: WhatsApp Integration & Engagement** (2 semanas) 🎯 INNOVACIÓN
**Objetivo:** Notificaciones y engagement vía WhatsApp

#### 11.1 WhatsApp Business API Setup (Semana 1)
- [ ] Configurar WhatsApp Business API
- [ ] Crear templates de mensajes aprobados
- [ ] Implementar WhatsApp service en backend
- [ ] Configurar webhook para respuestas

#### 11.2 Automated Notifications (Semana 1-2)
- [ ] Recordatorios de cursos pendientes
- [ ] Notificaciones de achievements
- [ ] Alertas de team challenges
- [ ] Resumen semanal de progreso

#### 11.3 Power-Ups & Gamification Boosts (Semana 2)
- [ ] Sistema de power-ups aleatorios (2x XP, Skip Token, etc.)
- [ ] Animaciones de activación (confetti, effects)
- [ ] Cofres de recompensas al completar curso
- [ ] Sistema de probabilidades configurables

**Entregable:** WhatsApp notifications + Power-ups funcionando

**Costo estimado:** $15-20 USD/mes por tenant

**Ver:** `FEATURES_INNOVADORAS.md` secciones 2 y 3

---

### **FASE 12: DevOps & CI/CD** (1 semana)
**Objetivo:** Automatizar deployment

#### 10.1 CI/CD Pipeline (Semana 1)
- [ ] Configurar GitHub Actions
- [ ] Pipeline de build frontend
- [ ] Pipeline de build backend
- [ ] Pipeline de tests automáticos
- [ ] Pipeline de deployment a staging
- [ ] Pipeline de deployment a production

#### 10.2 Infrastructure as Code (Semana 1)
- [ ] Crear Bicep/Terraform templates
- [ ] Automatizar creación de recursos Azure
- [ ] Configurar environments (dev/staging/prod)

#### 10.3 Monitoring & Alerts (Semana 1)
- [ ] Configurar Application Insights
- [ ] Crear dashboards de monitoring
- [ ] Configurar alerts (errores, performance, uptime)
- [ ] Implementar logging centralizado

**Entregable:** Pipeline de CI/CD funcionando

---

### **FASE 13: Mobile Offline & Push Notifications** (2 semanas) 🎯 INNOVACIÓN
**Objetivo:** Completar experiencia mobile-first

#### 13.1 Offline Mode (Semana 1)
- [ ] Implementar cache de cursos completos
- [ ] Sincronización automática al reconectar
- [ ] Indicadores de contenido disponible offline
- [ ] Gestión de espacio local

#### 13.2 Push Notifications (Semana 2)
- [ ] Configurar Azure Notification Hubs
- [ ] Implementar service worker push
- [ ] Notificaciones de racha, achievements, team challenges
- [ ] Personalización de frecuencia por usuario

#### 13.3 Eventos Temporales (Semana 2)
- [ ] Sistema de eventos mensuales ("Semana del Aprendizaje")
- [ ] Bonificaciones temporales (+50% XP)
- [ ] Badges exclusivos por evento
- [ ] Leaderboard global entre tenants (opcional)

**Entregable:** Modo offline completo + Push notifications + Eventos

**Ver:** `FEATURES_INNOVADORAS.md` sección 3.2

---

### **FASE 14: Demo Environment & Documentation** (1 semana)
**Objetivo:** Preparar para clientes demo

#### 14.1 Demo Tenants (Semana 1)
- [ ] Crear 2-3 tenants demo
- [ ] Configurar branding distinto por tenant
- [ ] Cargar cursos de ejemplo
- [ ] Crear usuarios de prueba
- [ ] Preparar scripts de demo
- [ ] Instalar PWA en dispositivos demo

#### 14.2 Documentation (Semana 1)
- [ ] Documentación técnica (arquitectura)
- [ ] Documentación de APIs (OpenAPI)
- [ ] Manual de administrador
- [ ] Manual de usuario
- [ ] Guías de onboarding
- [ ] FAQs
- [ ] Video demos

**Entregable:** Ambiente demo listo para mostrar a clientes

---

### **FASE 15: Launch Preparation** (1 semana)
**Objetivo:** Preparar para lanzamiento

#### 12.1 Go-Live Checklist
- [ ] Configurar dominio principal
- [ ] Configurar SSL/TLS
- [ ] Configurar backup automático
- [ ] Configurar disaster recovery
- [ ] Crear runbooks de operación
- [ ] Capacitar al equipo de soporte
- [ ] Preparar materiales de marketing
- [ ] Definir SLA y términos de servicio

#### 12.2 Soft Launch
- [ ] Lanzar con 2 clientes beta
- [ ] Recolectar feedback
- [ ] Iterar rápidamente
- [ ] Estabilizar

**Entregable:** Plataforma en producción con clientes beta

---

## 🚀 POST-MVP: Features Innovadoras (Semanas 16-30)

### **FASE 16: Marketplace de Cursos con Partners** (2-3 semanas) 🆕
**Objetivo:** Sistema para partners de contenido (modelo B2B2C)

#### 13.1 Partner Management (Semana 1)
- [ ] Crear modelo de datos Partner
- [ ] API para registrar partners
- [ ] Dashboard de partners
- [ ] Sistema de aprobación de partners

#### 13.2 Course Marketplace (Semana 2)
- [ ] Catálogo de cursos por partner
- [ ] Sistema de revenue sharing (70/30)
- [ ] Tracking de uso de cursos por tenant
- [ ] Reportes financieros para partners
- [ ] UI: Marketplace de cursos para admins

#### 13.3 Partner Portal (Semana 3)
- [ ] Portal para que partners suban cursos
- [ ] Analytics de uso de sus cursos
- [ ] Revenue reports automatizados
- [ ] Sistema de notificaciones

**Entregable:** Marketplace funcional con socia como primer partner

---

### **FASE 17: Sistema de Suscripciones y Trials** (2 semanas) 🆕
**Objetivo:** Manejo de planes, pricing, y trials gratuitos

#### 14.1 Subscription Management (Semana 1)
- [ ] Modelo de datos: Subscription, Plan
- [ ] Planes: Demo (gratis 2 meses), Profesional, Enterprise
- [ ] API para crear/actualizar/cancelar suscripciones
- [ ] Lógica de límites por plan (usuarios, cursos)
- [ ] Sistema de expiración de trials

#### 14.2 Billing Integration (Semana 2)
- [ ] Integración con Stripe o similar
- [ ] Facturación automática mensual/anual
- [ ] Dashboard de facturación para admins
- [ ] Emails automatizados (expiración, renovación)
- [ ] Manejo de pagos fallidos

#### 14.3 Trial Management (Semana 2)
- [ ] Flujo de registro de trial (2 meses gratis)
- [ ] Banners de "X días restantes de trial"
- [ ] Flujo de conversión a plan de pago
- [ ] Analytics de conversión de trials

**Entregable:** Sistema de suscripciones funcionando con trials para clientes demo

---

### **FASE 18: AI-Powered Features** (3-4 semanas) 🎯 INNOVACIÓN
**Objetivo:** Personalización con inteligencia artificial

#### 18.1 Azure OpenAI Integration (Semana 1)
- [ ] Configurar Azure OpenAI Service
- [ ] Implementar AI service layer
- [ ] Configurar rate limiting y caching
- [ ] Testing de prompts

#### 18.2 AI Mentor 24/7 (Semana 2)
- [ ] Chatbot embebido en cada lección
- [ ] Contexto de curso/lección en prompts
- [ ] Respuestas en español mexicano natural
- [ ] Logging de interacciones para mejora

#### 18.3 Recomendador Inteligente (Semana 3)
- [ ] Sistema de análisis de perfil de usuario
- [ ] Algoritmo de recomendación basado en IA
- [ ] UI de cursos recomendados
- [ ] A/B testing de recomendaciones

#### 18.4 Resúmenes Personalizados (Semana 4)
- [ ] Generación automática al completar curso
- [ ] Narrativa storytelling por IA
- [ ] Identificación de fortalezas/áreas de mejora
- [ ] Sugerencias de próximo paso

**Entregable:** AI Mentor + Recomendador + Resúmenes funcionando

**Costo estimado:** $10-20 USD/mes por tenant

**Ver:** `FEATURES_INNOVADORAS.md` sección 5

---

### **FASE 19: Sistema de Clases RPG** (2-3 semanas) 🎯 INNOVACIÓN
**Objetivo:** Personalización tipo RPG por "clase" de usuario

#### 19.1 Class System Design (Semana 1)
- [ ] Implementar modelo de datos de clases
- [ ] 4 clases: Guerrero, Mago, Guardián, Arquero
- [ ] Sistema de bonificaciones por clase (+10% XP en especialidad)
- [ ] Árbol de habilidades por clase

#### 19.2 Class Selection & Progression (Semana 2)
- [ ] UI de selección de clase en onboarding
- [ ] Sistema de nivel de clase (classXP)
- [ ] Desbloqueo de features por nivel de clase
- [ ] Skins/avatares personalizados por clase

#### 19.3 Class Events (Semana 3)
- [ ] "Raid de Clase" mensual
- [ ] Leaderboard por clase
- [ ] Badges exclusivos de clase
- [ ] Sistema de cambio de clase (cada 3 meses)

**Entregable:** Sistema completo de clases RPG

**Ver:** `FEATURES_INNOVADORAS.md` sección 4

---

### **FASE 20: LinkedIn Integration & Credentials** (2 semanas) 🎯 INNOVACIÓN
**Objetivo:** Certificados con valor real en el mercado

#### 20.1 LinkedIn API Integration (Semana 1)
- [ ] OAuth flow con LinkedIn
- [ ] Auto-publicación de completions
- [ ] Badge en perfil de LinkedIn
- [ ] Compartir certificados

#### 20.2 Enhanced Certificates (Semana 2)
- [ ] URL de verificación pública
- [ ] Skill tree visual (RPG style)
- [ ] Comparación con colegas (opcional)
- [ ] Exportación a PDF mejorado

**Entregable:** LinkedIn integration funcionando

**Ver:** `FEATURES_INNOVADORAS.md` sección 6

---

### **FASE 21: Accesibilidad Premium** (2-3 semanas) 🎯 INNOVACIÓN
**Objetivo:** Accesibilidad como feature premium

#### 21.1 Narrador con Azure TTS (Semana 1)
- [ ] Integrar Azure Cognitive Services Speech
- [ ] Voces naturales español MX
- [ ] Control de velocidad (0.5x - 2x)
- [ ] Sincronización con texto resaltado

#### 21.2 Modo Dislexia (Semana 2)
- [ ] Fuente OpenDyslexic
- [ ] Optimizaciones de espaciado
- [ ] Colores especiales
- [ ] Testing con usuarios reales

#### 21.3 Subtítulos Automáticos (Semana 3)
- [ ] Azure Video Indexer integration
- [ ] Transcripción automática de videos
- [ ] Generación de archivos VTT/SRT
- [ ] Búsqueda dentro de videos

**Entregable:** Narrador + Modo dislexia + Subtítulos automáticos

**Costo estimado:** $15-25 USD/mes por tenant

**Ver:** `FEATURES_INNOVADORAS.md` sección 7

---

### **FASE 22: Analíticas Predictivas** (3-4 semanas) 🎯 INNOVACIÓN
**Objetivo:** ML para prevenir abandono y optimizar retención

#### 22.1 Data Collection & Model Training (Semana 1-2)
- [ ] Recolectar datos históricos de comportamiento
- [ ] Entrenar modelo de churn prediction
- [ ] Validar precisión del modelo
- [ ] Deploy modelo en Azure ML

#### 22.2 Early Warning System (Semana 3)
- [ ] Dashboard de riesgo de abandono
- [ ] Clasificación: Alto, Medio, Bajo riesgo
- [ ] Recomendaciones de acciones
- [ ] Alertas automáticas a admins

#### 22.3 Automated Interventions (Semana 4)
- [ ] Envío automático de recordatorios
- [ ] Asignación de mentores
- [ ] Sugerencias de cursos alternativos
- [ ] A/B testing de intervenciones

**Entregable:** Sistema predictivo de retención funcionando

**Impacto esperado:** -40% churn, +50% completions

**Ver:** `FEATURES_INNOVADORAS.md` sección 8

---

### **FASE 23: Integración con STPS SIRCE** (3-4 semanas) 🔮 FUTURO
**Objetivo:** Constancias oficiales de competencias laborales (STPS)

**NOTA:** Esta fase es POST-MVP, para implementar después del lanzamiento.

#### 15.1 Investigación y Diseño (Semana 1-2)
- [ ] Contactar STPS para documentación técnica
- [ ] Obtener acceso a sandbox SIRCE
- [ ] Diseñar flujo de generación de constancias
- [ ] Análisis legal (registro como agente capacitador)
- [ ] Validar con clientes si es feature valorado

#### 15.2 Implementación Backend (Semana 3)
- [ ] API para generar constancias STPS
- [ ] Validación de campos obligatorios (CURP, RFC, NSS)
- [ ] Integración con API STPS (o exportación manual)
- [ ] Almacenamiento de folios STPS en Cosmos DB

#### 15.3 Implementación Frontend (Semana 4)
- [ ] UI para solicitar constancia STPS
- [ ] Dashboard de constancias generadas
- [ ] Exportación masiva para admin
- [ ] Visualización de constancias oficiales

**Entregable:** Integración STPS funcionando (Q1 2026)

**Ver:** `INTEGRACION_STPS.md` para detalles completos

---

## 📊 RESUMEN EJECUTIVO

### **Estado Actual: 40% Completo**
✅ **Lo que está listo:**
- Features completas de gamificación
- UI/UX pulida con dual persona
- Sistema de cursos robusto
- Accesibilidad WCAG completa

### **Lo que falta: 60% del camino**
❌ **Blockers críticos:**
1. Backend no existe (3-4 semanas)
2. Multi-tenancy no implementado (2-3 semanas)
3. Autenticación empresarial faltante (2 semanas)
4. Azure infrastructure no configurada (1 semana)

### **Timeline Total Estimado:**
- **MVP Core (Fases 1-10):** 10 semanas (2.5 meses)
- **MVP + Quick Wins (Fases 1-13):** 18 semanas (4.5 meses)
- **Features Completas (Fases 1-23):** 30+ semanas (7+ meses)

### **Recursos Necesarios:**
- **Desarrolladores:** 2-3 full-time
  - 1 Backend specialist (Node.js + Azure)
  - 1 Frontend specialist (React + TypeScript)
  - 1 DevOps/Infrastructure (Azure + CI/CD)
- **Socia/Partner:** Contenido de cursos + networking + ventas

- **Budget Azure (mensual estimado):**
  - Azure Functions: $50-200/mes
  - Cosmos DB Serverless: $50-300/mes (por tenant)
  - Azure Storage: $20-50/mes
  - Azure AD B2C: $0.0055 por autenticación (primeras 50k gratis)
  - Total: ~$200-600/mes para comenzar

### **MVP para 2 Clientes Demo:**
**Timeline acelerado: 8-10 semanas**

Fases mínimas:
1. ✅ Backend Foundation (3 semanas)
2. ✅ Multi-tenancy Frontend (2 semanas)
3. ✅ Autenticación básica (1 semana)
4. ✅ Tenant Onboarding (1 semana)
5. ✅ Storage (1 semana)
6. ✅ DevOps básico (1 semana)

---

## 🎯 RECOMENDACIONES INMEDIATAS

### **Próximos Pasos (Esta Semana):**

1. **Decisión de Arquitectura** (1 día)
   - Cosmos DB vs Azure SQL
   - Database-per-tenant vs Shared
   - Documentar decisión

2. **Setup Azure** (2 días)
   - Crear Azure subscription
   - Crear Resource Group
   - Crear servicios básicos
   - Configurar accesos

3. **Prototipo Backend** (2 días)
   - Crear Azure Functions project
   - Implementar 1-2 APIs de prueba
   - Conectar con Cosmos DB
   - Validar arquitectura

### **Preguntas Críticas para Resolver:**

1. **¿Cuántos clientes esperas tener en 6 meses?**
   - **Target:** 5-10 clientes de pago (según modelo B2B2C)
   - **Arquitectura:** Database-per-tenant (aislamiento total)

2. **¿Cuál es el budget mensual de Azure?**
   - **Estimado:** $200-600/mes para 10 tenants
   - **Recomendado:** Cosmos Serverless + Functions

3. **¿Los clientes necesitarán SSO empresarial?**
   - **Fase 1:** No (auth simple para MVP)
   - **Fase 6:** Sí (Azure AD B2C para Enterprise plan)

4. **¿Cuál es la urgencia de tener los 2 clientes demo?**
   - **Timeline:** 10 semanas para MVP con 2 clientes demo
   - **Estrategia:** 2 meses de trial gratuito a cambio de feedback
   - **Objetivo:** Validar modelo B2B2C antes de escalar

5. **¿Qué prioridad tiene la integración con STPS?** 🆕
   - **Respuesta:** Media-baja (feature diferenciador pero NO bloqueante)
   - **Timeline:** Fase 15, post-lanzamiento (Q1 2026)
   - **Razón:** Permite lanzar MVP más rápido, agregar STPS como upgrade

---

## 📞 Conclusión

**El proyecto tiene una base sólida (40%)** con features bien implementadas y una UI/UX pulida. Sin embargo, **faltan componentes críticos (60%)** para ser una plataforma SaaS multi-tenant:

### **Crítico (Blockers):**
1. 🔴 Backend + Database real
2. 🔴 Multi-tenancy architecture
3. 🔴 Azure infrastructure

### **Importante:**
1. 🟡 Autenticación empresarial (Azure AD)
2. 🟡 Tenant onboarding
3. 🟡 Storage en cloud

### **Nice to Have:**
1. 🟢 Subscriptions & billing
2. 🟢 Advanced analytics
3. 🟢 Testing automatizado

**Con un equipo de 2-3 personas enfocadas, puedes tener un MVP listo para 2 clientes demo en 8-10 semanas.**

---

**¿Quieres que empecemos por alguna fase específica?**  
**¿Tienes acceso a Azure ya o necesitas ayuda para configurar la cuenta?**
