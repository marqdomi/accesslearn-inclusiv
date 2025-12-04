# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.1.0] - 2025-12-04

### ✨ Añadido

#### Sistema de Perfiles de Accesibilidad
- **6 Perfiles Predefinidos**: Sistema completo de perfiles de accesibilidad para necesidades específicas
  - **Discalexia**: Fuente especializada (OpenDyslexic), espaciado mejorado, texto grande
  - **Baja Visión**: Alto contraste (yellow-on-black), texto aumentado al 150%, zoom al 150%
  - **Daltonismo**: Filtros de color (protanopia, deuteranopia, tritanopia), indicadores visuales adicionales
  - **Auditiva**: Subtítulos grandes (x-large), notificaciones visuales, transcripciones, descripción de audio
  - **Motora**: Navegación simplificada, áreas de toque grandes (56px mínimo), sin límites de tiempo, pausas automáticas
  - **Cognitiva**: Lectura simplificada, ayudas contextuales siempre visibles, sin límites de tiempo, pausas automáticas

#### Gestión Administrativa
- **Panel de Gestión de Perfiles**: Interfaz completa para administradores
  - Crear perfiles personalizados
  - Editar perfiles existentes (incluyendo perfiles del sistema)
  - Activar/desactivar perfiles para usuarios finales
  - Duplicar perfiles existentes
  - Eliminar perfiles personalizados (los del sistema están protegidos)

#### Componentes de Usuario
- **Selector de Perfiles**: Componente intuitivo para que usuarios seleccionen y apliquen perfiles
- **Página de Configuración de Accesibilidad**: Interfaz dedicada para gestión de accesibilidad

#### Scripts y Utilidades
- **Script de Migración**: `seed-all-tenants-profiles.ts` - Crea perfiles por defecto para todos los tenants existentes
- **Script de Seed Individual**: `seed-accessibility-profiles.ts` - Crea perfiles para un tenant específico
- **Script de Credenciales Azure**: `scripts/get-cosmos-credentials.sh` - Obtiene credenciales de Cosmos DB automáticamente desde Azure CLI

#### Backend
- **Nuevas Funciones**: `AccessibilityProfileFunctions.ts` - CRUD completo para perfiles
- **Nuevo Modelo**: `AccessibilityProfile.ts` - Modelo de datos completo con metadata
- **Nuevo Container**: `accessibility-profiles` en Cosmos DB con partición por `tenantId`

### 🔧 Cambiado

- **Optimización de Queries**: Eliminado `ORDER BY` de consultas Cosmos DB para evitar errores de índices compuestos
- **Ordenamiento en Memoria**: Los perfiles ahora se ordenan en memoria después de la consulta
- **Integración Automática**: Los perfiles se crean automáticamente al crear un nuevo tenant

### 📚 Documentación

- **README Actualizado**: Sección completa sobre perfiles de accesibilidad
- **Guía de Scripts**: `backend/src/scripts/README-ACCESSIBILITY-PROFILES.md` - Documentación completa de scripts
- **CHANGELOG**: Este archivo para registro de cambios

### 🐛 Corregido

- **Error de Índices Compuestos**: Corregido error "The order by query does not have a corresponding composite index" en Cosmos DB
- **Carga de Variables de Entorno**: Mejorada la carga de variables de entorno en scripts de migración

---

## [1.0.0] - 2025-01-25

### ✨ Añadido

- Sistema completo de gamificación (XP, logros, niveles)
- Multi-tenancy con aislamiento completo de datos
- Constructor de cursos profesional
- Sistema de certificados PDF
- Dashboard de analíticas avanzado
- Sistema de mentoría
- Foros Q&A y comunidad
- Internacionalización completa (ES/EN)
- Azure Blob Storage para media
- CI/CD automatizado con GitHub Actions
- Application Insights para monitoreo

---

## Formato de Versión

- **MAJOR** (X.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (0.X.0): Nuevas funcionalidades compatibles con versiones anteriores
- **PATCH** (0.0.X): Correcciones de bugs compatibles con versiones anteriores

