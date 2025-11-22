# 🔧 Configurar Variables de Entorno en Azure Container Apps

**Fecha:** 2025-01-28  
**Container App:** `ca-accesslearn-backend-prod`

---

## 📍 UBICACIÓN EN AZURE PORTAL

Las variables de entorno en Azure Container Apps están en la sección **"Revision management"** dentro de **"Application"**.

---

## 🚀 PASOS DETALLADOS

### Paso 1: Ir a Revision Management

1. **En la página de tu Container App** (`ca-accesslearn-backend-prod`)
2. **En el menú izquierdo**, busca la sección **"Application"**
3. **Haz clic en:** **"Revision management"** (o "Revisions and replicas")

---

### Paso 2: Seleccionar la Revisión Activa

1. **Verás una lista de revisiones**
2. **Busca la revisión que está en estado "Active"** (debería tener un badge verde)
3. **Haz clic en el nombre de la revisión** (o en el ícono de menú ⋮ a la derecha)

---

### Paso 3: Editar Template

1. **Se abrirá el panel de detalles de la revisión**
2. **Haz clic en:** **"Edit and deploy"** (o "Edit template")
3. **Esto abrirá el editor de template del Container App**

---

### Paso 4: Agregar Variable de Entorno

1. **En el editor de template**, busca la sección **"Environment variables"** o **"env"**
2. **Si no existe**, busca la sección del contenedor (usualmente dentro de `template.containers`)
3. **Haz clic en:** **"+ Add"** o **"Add environment variable"**
4. **Agregar:**
   - **Name:** `APPLICATIONINSIGHTS_CONNECTION_STRING`
   - **Value:** 
     ```
     InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8
     ```
5. **Haz clic en:** **"Create"** o **"Save"**

---

## 📝 ALTERNATIVA: Usar Azure CLI (Más Rápido)

Si no encuentras la opción en el portal, puedes usar Azure CLI:

```bash
az containerapp update \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --set-env-vars APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8"
```

---

## 🔍 UBICACIÓN ALTERNATIVA: Configuration

Si no encuentras "Revision management", intenta:

1. **En el menú izquierdo**, busca **"Settings"**
2. **Haz clic en:** **"Configuration"** o **"Environment variables"**
3. **Busca la sección de environment variables**

---

## 📸 RUTA EXACTA EN EL PORTAL

```
Container App: ca-accesslearn-backend-prod
  └── Application (menú izquierdo)
      └── Revision management
          └── [Seleccionar revisión activa]
              └── Edit and deploy
                  └── Environment variables
                      └── + Add
```

---

## ⚠️ NOTA IMPORTANTE

Al cambiar las variables de entorno, Azure Container Apps:
- Creará una nueva revisión
- Esta nueva revisión se convertirá en la activa
- La aplicación se reiniciará automáticamente (1-2 minutos)

---

## ✅ VERIFICACIÓN

Después de agregar la variable:

1. **Espera 1-2 minutos** a que el Container App se reinicie
2. **Ve a:** Container App → **Log stream** (en el menú izquierdo)
3. **Verifica que aparece:**
   ```
   📊 Inicializando Application Insights...
   ✅ Application Insights initialized successfully
   ```

---

**Si aún no encuentras la opción, usa Azure CLI que es más rápido y directo.** 🚀

