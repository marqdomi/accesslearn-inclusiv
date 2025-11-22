# 📍 Ubicación de Variables de Entorno en Azure Portal

**Container App:** `ca-accesslearn-backend-prod`  
**Fecha:** 2025-01-28

---

## 🎯 RUTA EXACTA EN AZURE PORTAL

Las variables de entorno están en **"Revision management"** dentro de **"Application"**.

---

## 📋 PASOS DETALLADOS PASO A PASO

### Paso 1: Ir a "Application"

1. **Estás en la página de tu Container App** (`ca-accesslearn-backend-prod`)
2. **En el menú izquierdo**, busca la sección **"Application"** (debe estar expandida)
3. **Haz clic en:** **"Revision management"** o **"Revisions and replicas"**

---

### Paso 2: Seleccionar la Revisión Activa

1. **Verás una lista de revisiones** con estado (Active, Inactive, etc.)
2. **Busca la revisión que tiene el badge "Active"** (verde) o el ícono de check ✓
3. **Haz clic en el nombre de la revisión** (o en el botón de menú ⋮ a la derecha)

---

### Paso 3: Editar el Template

1. **Se abrirá el panel de detalles de la revisión**
2. **Busca el botón:** **"Edit and deploy"** (arriba a la derecha) o **"Edit"**
3. **Haz clic en ese botón**

---

### Paso 4: Buscar "Environment variables"

1. **Se abrirá el editor de template** (formulario grande)
2. **Busca la sección:** **"Environment variables"** o **"env"**
3. **Si no la ves, busca dentro de:**
   - `Containers` → Seleccionar el contenedor → `Environment variables`
   - O en la sección `template.containers[0].env`

---

### Paso 5: Agregar Variable

1. **Haz clic en:** **"+ Add"** o **"Add environment variable"**
2. **En el formulario que aparece, agrega:**
   - **Name:** `APPLICATIONINSIGHTS_CONNECTION_STRING`
   - **Value:** 
     ```
     InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8
     ```
3. **Haz clic en:** **"OK"** o **"Save"**

---

### Paso 6: Guardar y Deployar

1. **En el editor, busca el botón:** **"Create"** o **"Review + create"** (abajo)
2. **Haz clic en:** **"Create"** o **"Save"**
3. **El Container App se reiniciará automáticamente** (1-2 minutos)

---

## 🔍 ALTERNATIVA: Buscar en "Settings"

Si no encuentras "Revision management", intenta:

1. **En el menú izquierdo**, busca **"Settings"**
2. **Haz clic en:** **"Configuration"** o **"Environment variables"**
3. **Deberías ver una lista de variables de entorno**
4. **Haz clic en:** **"+ Add"**

---

## ⚡ MÉTODO MÁS RÁPIDO: Azure CLI (Recomendado)

Si no encuentras la opción en el portal, usa Azure CLI (es más rápido):

### Opción A: Ejecutar Script Automático

```bash
cd /Users/marco.dominguez/Projects/accesslearn-inclusiv
./scripts/configure-app-insights-azure.sh
```

Este script hace todo automáticamente:
- Verifica que estás logueado en Azure
- Verifica que el Container App existe
- Configura la variable de entorno
- Te dice cómo verificar que funcionó

---

### Opción B: Ejecutar Comando Directo

```bash
az containerapp update \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --set-env-vars APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8"
```

---

## 📸 RUTA VISUAL

```
Azure Portal
└── Container Apps
    └── ca-accesslearn-backend-prod
        └── Menú Izquierdo
            └── Application
                └── Revision management  ← AQUÍ
                    └── [Seleccionar revisión activa]
                        └── Edit and deploy
                            └── Environment variables  ← AQUÍ
                                └── + Add
```

---

## ✅ DESPUÉS DE CONFIGURAR

1. **Espera 1-2 minutos** a que el Container App se reinicie
2. **Ve a:** Container App → **Log stream** (en el menú izquierdo)
3. **Deberías ver:**
   ```
   📊 Inicializando Application Insights...
   ✅ Application Insights initialized successfully
   ```

---

## 🆘 SI AÚN NO LO ENCUENTRAS

**Usa Azure CLI** - Es mucho más rápido:

```bash
./scripts/configure-app-insights-azure.sh
```

O ejecuta el comando manual:

```bash
az containerapp update \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --set-env-vars APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8"
```

---

**¿Prefieres usar Azure CLI o seguir buscando en el portal?** 🚀

