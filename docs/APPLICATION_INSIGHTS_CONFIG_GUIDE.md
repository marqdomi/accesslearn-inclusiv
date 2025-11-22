# 🔧 Guía de Configuración: Application Insights

**Fecha:** 2025-01-28  
**Connection String:** `fb0cc223-bade-4ac7-a0dc-f87a248f57b9`

---

## 📋 PASOS PARA CONFIGURAR APPLICATION INSIGHTS

### Paso 1: Configurar en Desarrollo Local (`.env`)

1. **Crear o editar archivo `.env` en `backend/`:**

```bash
cd backend
```

2. **Agregar la variable de entorno:**

```env
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8
```

**Nota:** El archivo `.env` no debería estar en git (está en `.gitignore`).

---

### Paso 2: Probar en Desarrollo Local

1. **Reiniciar el servidor backend:**

```bash
cd backend
npm run server
```

2. **Verificar que Application Insights se inicializa:**

Deberías ver en la consola:
```
📊 Inicializando Application Insights...
✅ Application Insights initialized successfully
```

3. **Hacer algunas requests al servidor:**

```bash
# En otra terminal
curl http://localhost:3000/api/health
```

4. **Hacer login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.lopez@kainet.mx","password":"Demo123!","tenantId":"kainet"}'
```

---

### Paso 3: Configurar en Azure Container Apps (Producción)

#### Opción A: Desde Azure Portal

1. **Ir a Azure Portal → Container Apps**
2. **Seleccionar:** `accesslearn-backend-prod` (o tu Container App)
3. **Ir a:** Configuration → Environment variables
4. **Agregar nueva variable:**
   - **Name:** `APPLICATIONINSIGHTS_CONNECTION_STRING`
   - **Value:** `InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8`
5. **Guardar** (Revisar y crear)
6. **El Container App se reiniciará automáticamente**

#### Opción B: Desde Azure CLI

```bash
az containerapp update \
  --name accesslearn-backend-prod \
  --resource-group your-resource-group \
  --set-env-vars APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8"
```

**Nota:** Reemplaza `your-resource-group` con el nombre de tu resource group.

---

### Paso 4: Verificar en Azure Portal

#### 4.1 Verificar que los datos están llegando

1. **Ir a Azure Portal → Application Insights**
2. **Buscar:** Tu recurso de Application Insights (probablemente `accesslearn-backend-insights` o similar)
3. **Ir a:** Live Metrics Stream
4. **Hacer algunas requests a tu API** (desde la aplicación o con curl)
5. **Verificar que aparecen métricas en tiempo real:**
   - Requests por segundo
   - Response time
   - Failed requests
   - Server info

#### 4.2 Verificar Eventos Custom

1. **Ir a:** Application Insights → Logs (Analytics)
2. **Ejecutar query:**

```kusto
customEvents
| where timestamp > ago(1h)
| project timestamp, name, customDimensions
| order by timestamp desc
| take 20
```

Deberías ver eventos como:
- `ServerStarted`
- `UserLoggedIn`

#### 4.3 Verificar Métricas

1. **Ir a:** Application Insights → Metrics
2. **Seleccionar métricas:**
   - **Server response time** (gráfico de línea)
   - **Server requests** (gráfico de línea)
   - **Failed requests** (gráfico de línea)
   - **Exceptions** (tabla)

#### 4.4 Verificar Excepciones

1. **Ir a:** Application Insights → Failures → Exceptions
2. **Ver excepciones recientes** (si hay alguna)
3. **Ver detalles** de cada excepción

---

### Paso 5: Crear Dashboard Básico (Opcional)

1. **Ir a:** Application Insights → Dashboards
2. **Crear nuevo dashboard:** "AccessLearn Backend Monitoring"
3. **Agregar gráficos:**

   **Gráfico 1: Server Response Time**
   - Métrica: Server response time
   - Tipo: Line chart
   - Agregación: Average
   - Rango de tiempo: Last 24 hours

   **Gráfico 2: Request Rate**
   - Métrica: Server requests
   - Tipo: Line chart
   - Agregación: Count
   - Rango de tiempo: Last 24 hours

   **Gráfico 3: Failed Requests**
   - Métrica: Failed requests
   - Tipo: Bar chart
   - Agregación: Count
   - Rango de tiempo: Last 24 hours

   **Gráfico 4: Custom Events (User Logins)**
   - Query: `customEvents | where name == "UserLoggedIn" | summarize count() by bin(timestamp, 1h)`
   - Tipo: Line chart
   - Rango de tiempo: Last 24 hours

---

### Paso 6: Configurar Alertas (Opcional pero Recomendado)

#### Alerta 1: Error Rate Alto

1. **Ir a:** Application Insights → Alerts
2. **Crear nueva alerta:**
   - **Condition:** Failed requests rate > 5%
   - **Action:** Email/SMS/Slack notification
   - **Window:** 5 minutes

#### Alerta 2: Response Time Alto

1. **Ir a:** Application Insights → Alerts
2. **Crear nueva alerta:**
   - **Condition:** Server response time P95 > 5 segundos
   - **Action:** Email notification
   - **Window:** 5 minutes

#### Alerta 3: Excepciones Críticas

1. **Ir a:** Application Insights → Alerts
2. **Crear nueva alerta:**
   - **Condition:** Exception count > 10 en 5 minutos
   - **Action:** Email inmediato
   - **Window:** 5 minutes

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Desarrollo Local
- [ ] Variable `APPLICATIONINSIGHTS_CONNECTION_STRING` agregada a `.env`
- [ ] Servidor backend reiniciado
- [ ] Ver mensaje "✅ Application Insights initialized successfully"
- [ ] Hacer requests y verificar que funcionan
- [ ] Hacer login y verificar que funciona

### Producción (Azure)
- [ ] Variable agregada a Azure Container App
- [ ] Container App reiniciado
- [ ] Verificar en Live Metrics que aparecen requests
- [ ] Verificar en Logs que aparecen eventos custom
- [ ] Verificar en Metrics que aparecen métricas
- [ ] (Opcional) Dashboard creado
- [ ] (Opcional) Alertas configuradas

---

## 🔍 TROUBLESHOOTING

### Problema: No veo "✅ Application Insights initialized successfully"

**Solución:**
1. Verificar que la variable `APPLICATIONINSIGHTS_CONNECTION_STRING` está configurada
2. Verificar que el formato del connection string es correcto
3. Reiniciar el servidor

### Problema: No aparecen datos en Azure Portal

**Solución:**
1. Verificar que el connection string en Azure Container App es correcto
2. Esperar 1-2 minutos (puede haber delay)
3. Hacer algunas requests al servidor
4. Verificar en Live Metrics Stream

### Problema: Veo errores de conexión

**Solución:**
1. Verificar que el connection string está completo (todos los campos)
2. Verificar que no hay espacios extra al inicio/final
3. Verificar que el Application Insights resource existe y está activo

---

## 📊 QUERIES ÚTILES PARA ANALYTICS

### Ver todos los eventos custom recientes

```kusto
customEvents
| where timestamp > ago(1h)
| project timestamp, name, customDimensions
| order by timestamp desc
```

### Ver todos los logins recientes

```kusto
customEvents
| where name == "UserLoggedIn"
| where timestamp > ago(24h)
| project timestamp, 
    userId = tostring(customDimensions.userId),
    tenantId = tostring(customDimensions.tenantId),
    role = tostring(customDimensions.role)
| order by timestamp desc
```

### Ver requests lentas

```kusto
requests
| where timestamp > ago(24h)
| where duration > 5000
| project timestamp, name, duration, success, resultCode, url
| order by duration desc
```

### Ver excepciones recientes

```kusto
exceptions
| where timestamp > ago(24h)
| project timestamp, type, outerMessage, details
| order by timestamp desc
```

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Configurar connection string en `.env` (desarrollo)
2. ✅ Probar en desarrollo local
3. ✅ Configurar en Azure Container Apps (producción)
4. ✅ Verificar en Azure Portal
5. ⏳ (Opcional) Crear dashboard
6. ⏳ (Opcional) Configurar alertas

---

**Última actualización:** 2025-01-28  
**Estado:** Listo para configurar

