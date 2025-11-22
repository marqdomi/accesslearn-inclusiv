# 📊 Application Insights Setup Guide

**Fecha:** 2025-01-28  
**Estado:** ✅ Implementado

---

## 📋 RESUMEN

Se ha implementado Azure Application Insights para monitoreo y logging básico del backend. Esto permite:

- ✅ Tracking automático de requests HTTP
- ✅ Tracking de errores y excepciones
- ✅ Métricas de performance (response times)
- ✅ Tracking de dependencias (Cosmos DB)
- ✅ Eventos custom (login, course creation, etc.)
- ✅ Métricas custom

---

## ✅ IMPLEMENTACIÓN COMPLETADA

### 1. Servicio de Application Insights

**Archivo:** `backend/src/services/applicationinsights.service.ts`

**Funcionalidades:**
- ✅ Inicialización de Application Insights
- ✅ `trackException()` - Para tracking de errores
- ✅ `trackMetric()` - Para métricas custom
- ✅ `trackEvent()` - Para eventos custom
- ✅ `trackDependency()` - Para dependencias (Cosmos DB, APIs externas)
- ✅ `trackRequest()` - Para requests HTTP
- ✅ `setUserContext()` - Para tracking de usuarios
- ✅ `setOperationContext()` - Para correlación de operaciones

### 2. Middleware de Telemetría

**Archivo:** `backend/src/middleware/telemetry.ts`

**Funcionalidades:**
- ✅ Tracking automático de todas las requests HTTP
- ✅ Tracking de duración de requests
- ✅ Tracking de errores automático
- ✅ Contexto de usuario automático

### 3. Integración en Server

**Archivo:** `backend/src/server.ts`

**Cambios:**
- ✅ Inicialización de Application Insights al inicio
- ✅ Tracking de eventos de login
- ✅ Tracking de errores en todos los endpoints
- ✅ Tracking de startup del servidor
- ✅ Middleware de telemetría aplicado globalmente

---

## 🔧 CONFIGURACIÓN

### 1. Variable de Entorno

Agregar a `.env` o variables de ambiente de Azure:

```env
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxxxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/
```

**Nota:** Si no se configura, la aplicación funcionará normalmente pero sin monitoreo.

### 2. Obtener Connection String desde Azure Portal

1. Ir a Azure Portal → Application Insights
2. Seleccionar el recurso de Application Insights (o crear uno nuevo)
3. Ir a "Overview" → "Connection String"
4. Copiar el connection string
5. Agregarlo a las variables de ambiente

### 3. Crear Application Insights Resource (Si no existe)

**Azure Portal:**
1. Ir a "Create a resource"
2. Buscar "Application Insights"
3. Crear nuevo recurso con:
   - **Name:** `accesslearn-backend-insights`
   - **Application Type:** Node.js
   - **Subscription:** Tu suscripción
   - **Resource Group:** Tu resource group
   - **Location:** East US (o tu región)
4. Crear
5. Copiar "Connection String" desde Overview

**Azure CLI:**
```bash
az monitor app-insights component create \
  --app accesslearn-backend-insights \
  --location eastus \
  --resource-group your-resource-group \
  --application-type web

# Obtener connection string
az monitor app-insights component show \
  --app accesslearn-backend-insights \
  --resource-group your-resource-group \
  --query connectionString
```

---

## 📊 MÉTRICAS TRACKED

### Automáticas
- ✅ **Requests:** Todas las requests HTTP (método, path, duración, status code)
- ✅ **Dependencies:** Llamadas a Cosmos DB (automáticas)
- ✅ **Exceptions:** Todas las excepciones capturadas
- ✅ **Performance:** Response times automáticos
- ✅ **Console logs:** Logs de consola (opcional)

### Custom Events
- ✅ **UserLoggedIn:** Cuando un usuario inicia sesión
- ✅ **ServerStarted:** Cuando el servidor inicia
- ✅ **CosmosDB.Connected:** Cuando Cosmos DB se conecta

### Custom Metrics
- ✅ **Request.{method}.{path}:** Duración de requests por endpoint
- ✅ **Server.Started:** Métrica de startup
- ✅ **CosmosDB.Connected:** Métrica de conexión

---

## 🔍 USO EN EL CÓDIGO

### Tracking de Errores

```typescript
import { trackException } from './services/applicationinsights.service';

try {
  // código
} catch (error: any) {
  trackException(error, {
    endpoint: '/api/courses',
    tenantId: tenantId,
    errorType: 'DatabaseError',
  });
  throw error;
}
```

### Tracking de Eventos

```typescript
import { trackEvent } from './services/applicationinsights.service';

trackEvent('CourseCreated', {
  courseId: course.id,
  tenantId: tenantId,
  userId: userId,
});
```

### Tracking de Métricas

```typescript
import { trackMetric } from './services/applicationinsights.service';

trackMetric('Users.Active', activeUserCount, {
  tenantId: tenantId,
});
```

---

## 📈 DASHBOARD EN AZURE PORTAL

### Métricas Disponibles

1. **Server Response Time:**
   - Tiempo promedio de respuesta
   - P95, P99 response times

2. **Request Rate:**
   - Requests por segundo
   - Requests por minuto/hora

3. **Failed Requests:**
   - Error rate
   - Error count por endpoint

4. **Dependencies:**
   - Cosmos DB call duration
   - External API call duration

5. **Custom Events:**
   - UserLoggedIn count
   - CourseCreated count
   - etc.

### Crear Dashboard Básico

1. Ir a Application Insights → Dashboards
2. Crear nuevo dashboard
3. Agregar métricas:
   - **Server Response Time** (Line chart)
   - **Request Rate** (Line chart)
   - **Failed Requests** (Bar chart)
   - **Exceptions** (Table)
   - **Top Requests** (Table)

---

## 🚨 ALERTAS RECOMENDADAS

### 1. Error Rate Alto

**Condición:** Error rate > 5%  
**Acción:** Enviar email/SMS

### 2. Response Time Alto

**Condición:** P95 response time > 5 segundos  
**Acción:** Enviar email

### 3. Excepciones Críticas

**Condición:** Exception count > 10 en 5 minutos  
**Acción:** Enviar email inmediato

### 4. Server Down

**Condición:** Sin requests en 5 minutos (cuando debería haber actividad)  
**Acción:** Enviar alerta crítica

---

## 🧪 VERIFICACIÓN

### 1. Verificar que Application Insights está Inicializado

Al iniciar el servidor, deberías ver:
```
📊 Inicializando Application Insights...
✅ Application Insights initialized successfully
```

Si no ves esto, verifica que `APPLICATIONINSIGHTS_CONNECTION_STRING` esté configurada.

### 2. Verificar Métricas en Azure Portal

1. Ir a Application Insights → Live Metrics
2. Deberías ver requests en tiempo real
3. Hacer algunas requests al servidor
4. Verificar que aparecen en Live Metrics

### 3. Verificar Eventos Custom

1. Login como usuario
2. Ir a Application Insights → Events
3. Buscar "UserLoggedIn"
4. Deberías ver el evento con propiedades (userId, tenantId, role)

---

## 📝 VARIABLES DE ENTORNO

### Local Development (.env)

```env
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxxxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/
```

### Azure Container Apps

Agregar en las variables de ambiente del Container App:

```bash
az containerapp update \
  --name accesslearn-backend-prod \
  --resource-group your-resource-group \
  --set-env-vars APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=xxxxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/"
```

O desde Azure Portal:
1. Container App → Configuration → Environment variables
2. Agregar nueva variable:
   - **Name:** `APPLICATIONINSIGHTS_CONNECTION_STRING`
   - **Value:** Connection string completo

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Servicio de Application Insights creado
- [x] Middleware de telemetría creado
- [x] Integrado en server.ts
- [x] Tracking de eventos de login
- [x] Tracking de errores automático
- [x] Tracking de requests automático
- [x] Documentación creada

---

## 🎯 PRÓXIMOS PASOS (Opcionales)

### Mejoras Futuras

1. **Tracking Avanzado:**
   - Tracking de operaciones de Cosmos DB manualmente
   - Tracking de cache hits/misses
   - Tracking de business metrics (cursos creados, usuarios activos)

2. **Alertas:**
   - Configurar alertas en Azure Portal
   - Alertas por email/SMS/Slack

3. **Dashboards Personalizados:**
   - Dashboard para cada tenant
   - Dashboard de business metrics
   - Dashboard de performance

4. **Correlación:**
   - Correlación entre frontend y backend
   - Distributed tracing

---

**Última actualización:** 2025-01-28  
**Estado:** ✅ Implementado y Listo

