# Scripts de Perfiles de Accesibilidad

Este directorio contiene scripts para gestionar los perfiles de accesibilidad por defecto en la plataforma.

## Requisitos Previos

Antes de ejecutar los scripts, asegúrate de tener configuradas las variables de entorno de Cosmos DB. Crea un archivo `.env` en el directorio `backend/` con las siguientes variables:

```env
COSMOS_ENDPOINT=https://tu-cuenta.documents.azure.com:443/
COSMOS_KEY=tu-clave-de-cosmos-db
COSMOS_DATABASE=nombre-de-tu-base-de-datos
```

O si prefieres usar variables de entorno del sistema:

```bash
export COSMOS_ENDPOINT="https://tu-cuenta.documents.azure.com:443/"
export COSMOS_KEY="tu-clave-de-cosmos-db"
export COSMOS_DATABASE="nombre-de-tu-base-de-datos"
```

## Scripts Disponibles

### 1. `seed-accessibility-profiles.ts`

Crea los 6 perfiles de accesibilidad por defecto para un tenant específico.

**Uso:**
```bash
# Desde el directorio backend
npx ts-node src/scripts/seed-accessibility-profiles.ts <tenantId>
```

**Ejemplo:**
```bash
npx ts-node src/scripts/seed-accessibility-profiles.ts tenant-laboralmx
```

**Perfiles creados:**
- Discalexia
- Baja Visión
- Daltonismo
- Auditiva
- Motora
- Cognitiva

**Características:**
- Solo crea perfiles que no existen (evita duplicados)
- Marca los perfiles como `isDefault: true`
- Los perfiles vienen activados por defecto (`enabled: true`)
- Incluye metadata completa (caso de uso, objetivo, beneficios, audiencia)

### 2. `seed-all-tenants-profiles.ts`

Ejecuta el seed de perfiles para todos los tenants existentes en la base de datos.

**Uso:**
```bash
# Desde el directorio raíz del proyecto
npx ts-node backend/src/scripts/seed-all-tenants-profiles.ts
```

**Nota:** Asegúrate de tener las variables de entorno de Cosmos DB configuradas antes de ejecutar.

**Características:**
- Procesa todos los tenants automáticamente
- Muestra un resumen al final con éxito/errores
- No falla si un tenant tiene errores (continúa con los demás)

## Integración Automática

Los perfiles de accesibilidad se crean automáticamente cuando se crea un nuevo tenant. Esto sucede en:

**Archivo:** `backend/src/functions/TenantFunctions.ts`

La función `createTenant()` automáticamente llama a `seedAccessibilityProfiles()` después de crear el tenant.

## Migración de Tenants Existentes

Si tienes tenants existentes que no tienen perfiles de accesibilidad, ejecuta:

```bash
# Desde el directorio raíz del proyecto
npx ts-node backend/src/scripts/seed-all-tenants-profiles.ts
```

**Importante:** Asegúrate de tener configuradas las variables de entorno de Cosmos DB antes de ejecutar.

Esto creará los perfiles por defecto para todos los tenants existentes.

## Estructura de los Perfiles

Cada perfil incluye:

- **Información básica:**
  - Nombre
  - Descripción
  - Icono (opcional)
  - Estado (activo/inactivo)

- **Configuración técnica:**
  - Preferencias visuales (tamaño de texto, fuente, contraste, etc.)
  - Preferencias de audio (subtítulos, descripción de audio)
  - Preferencias de navegación (velocidad, pausas automáticas)
  - Preferencias cognitivas (modo de lectura, tooltips)

- **Metadata para administradores:**
  - Caso de uso
  - Objetivo
  - Lista de beneficios
  - Configuraciones recomendadas
  - Audiencia objetivo

## Personalización

Los administradores pueden:

1. **Editar perfiles del sistema:** Modificar configuración y metadata
2. **Activar/Desactivar:** Controlar qué perfiles ven los usuarios finales
3. **Crear perfiles personalizados:** Adaptados a necesidades específicas de su organización
4. **Duplicar perfiles:** Crear variaciones de perfiles existentes

Los usuarios finales solo pueden:

1. **Seleccionar perfiles activos:** Elegir entre los perfiles que el admin ha activado
2. **Restablecer a valores por defecto:** Volver a la configuración predeterminada

## Notas Importantes

- Los perfiles del sistema (`isDefault: true`) no se pueden eliminar
- Los perfiles personalizados pueden ser eliminados por el admin
- Solo los perfiles activos (`enabled: true`) son visibles para usuarios finales
- Los cambios en perfiles se aplican inmediatamente cuando un usuario los selecciona

