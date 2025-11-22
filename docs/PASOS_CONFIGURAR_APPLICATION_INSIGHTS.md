# ✅ Pasos para Configurar Application Insights

**Connection String:** `fb0cc223-bade-4ac7-a0dc-f87a248f57b9`  
**Fecha:** 2025-01-28

---

## ✅ PASO 1: Configurado en Desarrollo Local

Ya se agregó automáticamente a tu archivo `backend/.env`:

```env
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8
```

**Próximo paso:** Reiniciar el servidor backend y verificar que funciona.

---

## 🔍 PASO 2: Probar en Desarrollo Local

```bash
cd backend
npm run server
```

**Deberías ver:**
```
📊 Inicializando Application Insights...
✅ Application Insights initialized successfully
```

Si ves esto, ¡funciona! ✅

**Hacer algunas requests para probar:**
```bash
# En otra terminal
curl http://localhost:3000/api/health
```

---

## 🚀 PASO 3: Configurar en Azure Container Apps (Producción)

Tienes **2 opciones** para configurar en producción:

### Opción A: Desde Azure Portal (Recomendado - Más Fácil)

1. **Ir a:** https://portal.azure.com
2. **Buscar:** "Container Apps"
3. **Seleccionar:** `ca-accesslearn-backend-prod` (o tu Container App)
4. **Ir a:** **Configuration** → **Environment variables**
5. **Hacer clic en:** **+ Add**
6. **Agregar:**
   - **Name:** `APPLICATIONINSIGHTS_CONNECTION_STRING`
   - **Value:** 
     ```
     InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8
     ```
7. **Hacer clic en:** **Save** (o **Review + create** → **Create**)
8. **El Container App se reiniciará automáticamente** (puede tardar 1-2 minutos)

**✅ Listo!**

---

### Opción B: Desde Azure CLI

```bash
az containerapp update \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --set-env-vars APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8"
```

**Nota:** Asegúrate de reemplazar el resource group si es diferente.

---

### Opción C: Actualizar Bicep Template (Para Futuro Deploy)

Ya actualicé el template de Bicep (`infra/phase2-apps.bicep`) y el archivo de parámetros (`infra/main.parameters.json`) para incluir Application Insights.

**La próxima vez que hagas deploy con Bicep, automáticamente incluirá Application Insights.**

---

## 📊 PASO 4: Verificar en Azure Portal

### 4.1 Verificar Live Metrics (Tiempo Real)

1. **Ir a:** https://portal.azure.com
2. **Buscar:** "Application Insights"
3. **Seleccionar tu recurso** de Application Insights
4. **Ir a:** **Live Metrics Stream** (en el menú izquierdo)
5. **Hacer algunas requests a tu API:**
   ```bash
   curl https://api.kainet.mx/api/health
   ```
6. **Deberías ver métricas apareciendo en tiempo real:** ✅
   - Requests por segundo
   - Response time
   - Server info

### 4.2 Verificar Eventos Custom

1. **Ir a:** Application Insights → **Logs (Analytics)**
2. **Ejecutar esta query:**

```kusto
customEvents
| where timestamp > ago(1h)
| project timestamp, name, customDimensions
| order by timestamp desc
| take 20
```

**Deberías ver eventos como:**
- `ServerStarted`
- `UserLoggedIn` (cuando alguien hace login)

### 4.3 Verificar Métricas

1. **Ir a:** Application Insights → **Metrics**
2. **Seleccionar métricas:**
   - **Server response time** (gráfico de línea)
   - **Server requests** (gráfico de línea)
   - **Failed requests** (gráfico de línea)

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Desarrollo Local ✅
- [x] Variable agregada a `backend/.env`
- [ ] Servidor reiniciado y muestra "✅ Application Insights initialized successfully"
- [ ] Hacer requests y verificar que funcionan

### Producción (Azure)
- [ ] Variable agregada a Azure Container App (Opción A, B o C)
- [ ] Container App reiniciado
- [ ] Ver datos en Live Metrics Stream ✅
- [ ] Ver eventos custom en Logs ✅

---

## 🔍 VERIFICACIÓN RÁPIDA

### En Desarrollo Local:

```bash
cd backend
npm run server

# Deberías ver:
# 📊 Inicializando Application Insights...
# ✅ Application Insights initialized successfully
```

### En Producción (Azure Portal):

1. Application Insights → **Live Metrics Stream**
2. Hacer requests a tu API: `https://api.kainet.mx/api/health`
3. **Deberías ver métricas apareciendo en tiempo real** ✅

---

## 🆘 TROUBLESHOOTING

### No veo "✅ Application Insights initialized successfully"

**Solución:**
1. Verificar que la variable está en `backend/.env`
2. Verificar que el formato es correcto (sin espacios extra)
3. Reiniciar el servidor

### No aparecen datos en Azure Portal

**Solución:**
1. Verificar que el connection string en Azure Container App es correcto
2. Esperar 1-2 minutos (puede haber delay)
3. Hacer algunas requests al servidor
4. Verificar en **Live Metrics Stream**

---

## 📖 DOCUMENTACIÓN ADICIONAL

- **Guía completa:** `docs/APPLICATION_INSIGHTS_CONFIG_GUIDE.md`
- **Pasos rápidos:** `docs/CONFIGURAR_APPLICATION_INSIGHTS_PASOS.md`

---

## 🎯 RESUMEN

✅ **Paso 1:** Variable agregada a `backend/.env` (completado)  
⏳ **Paso 2:** Probar en desarrollo local (hacerlo ahora)  
⏳ **Paso 3:** Configurar en Azure Container Apps (hacerlo ahora)  
⏳ **Paso 4:** Verificar en Azure Portal (después del paso 3)

**¿Listo? ¡Empieza con el Paso 2 (probar localmente)!** 🚀

