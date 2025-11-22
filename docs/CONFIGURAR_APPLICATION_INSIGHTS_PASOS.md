# 🚀 Pasos para Configurar Application Insights

**Connection String:** `fb0cc223-bade-4ac7-a0dc-f87a248f57b9`  
**Fecha:** 2025-01-28

---

## 📋 PASOS RÁPIDOS

### 1️⃣ Configurar en Desarrollo Local

```bash
cd backend

# Si ya tienes un .env, editarlo. Si no, crear uno nuevo
nano .env
# o
code .env
```

**Agregar esta línea al archivo `.env`:**

```env
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8
```

**Guardar y cerrar.**

---

### 2️⃣ Probar en Desarrollo Local

```bash
# Reiniciar el servidor backend
npm run server
```

**Deberías ver:**
```
📊 Inicializando Application Insights...
✅ Application Insights initialized successfully
```

**Si ves esto, ¡funciona!** ✅

**Hacer algunas requests:**
```bash
# En otra terminal
curl http://localhost:3000/api/health
```

---

### 3️⃣ Configurar en Azure Container Apps (Producción)

#### Opción A: Desde Azure Portal (Recomendado)

1. Ir a: https://portal.azure.com
2. Buscar: "Container Apps"
3. Seleccionar: `accesslearn-backend-prod` (o tu Container App)
4. Ir a: **Configuration** → **Environment variables**
5. Hacer clic en: **+ Add**
6. Agregar:
   - **Name:** `APPLICATIONINSIGHTS_CONNECTION_STRING`
   - **Value:** 
     ```
     InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8
     ```
7. Hacer clic en: **Save**
8. El Container App se reiniciará automáticamente

#### Opción B: Desde Azure CLI

```bash
az containerapp update \
  --name accesslearn-backend-prod \
  --resource-group TU-RESOURCE-GROUP \
  --set-env-vars APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8"
```

**Nota:** Reemplaza `TU-RESOURCE-GROUP` con el nombre de tu resource group.

---

### 4️⃣ Verificar en Azure Portal

1. Ir a: https://portal.azure.com
2. Buscar: "Application Insights"
3. Seleccionar tu recurso de Application Insights
4. Ir a: **Live Metrics Stream**
5. Hacer algunas requests a tu API (desde la app o manualmente)
6. **Deberías ver métricas en tiempo real:** ✅

**Verificar eventos custom:**
1. Ir a: **Logs (Analytics)**
2. Ejecutar query:
   ```kusto
   customEvents
   | where timestamp > ago(1h)
   | project timestamp, name
   | order by timestamp desc
   ```
3. **Deberías ver eventos como `ServerStarted` y `UserLoggedIn`:** ✅

---

## ✅ CHECKLIST

### Desarrollo
- [ ] Variable agregada a `backend/.env`
- [ ] Servidor reiniciado
- [ ] Ver mensaje "✅ Application Insights initialized successfully"

### Producción
- [ ] Variable agregada a Azure Container App
- [ ] Container App reiniciado
- [ ] Ver datos en Live Metrics Stream
- [ ] Ver eventos custom en Logs

---

## 🔍 VERIFICACIÓN RÁPIDA

### En Desarrollo Local:

```bash
# Verificar que el servidor muestra el mensaje correcto
cd backend
npm run server
# Deberías ver: ✅ Application Insights initialized successfully
```

### En Producción (Azure Portal):

1. Ir a: Application Insights → Live Metrics Stream
2. Hacer requests a tu API
3. **Deberías ver métricas apareciendo en tiempo real** ✅

---

## 📊 QUERIES ÚTILES

### Ver todos los eventos recientes:
```kusto
customEvents
| where timestamp > ago(1h)
| project timestamp, name, customDimensions
| order by timestamp desc
```

### Ver logins recientes:
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

### Ver requests lentas:
```kusto
requests
| where timestamp > ago(24h)
| where duration > 5000
| project timestamp, name, duration, url
| order by duration desc
```

---

## 🆘 AYUDA

Si algo no funciona:

1. **Verificar que el connection string está completo** (todos los campos)
2. **Verificar que no hay espacios extra** al inicio/final
3. **Reiniciar el servidor/Container App**
4. **Esperar 1-2 minutos** (puede haber delay en Azure Portal)

---

**¿Listo? ¡Empieza con el Paso 1!** 🚀

