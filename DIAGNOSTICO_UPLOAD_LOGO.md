# 🔍 Diagnóstico: Problema con Upload de Logo

**Fecha:** 2025-01-24  
**Problema:** Error 404 al intentar subir logo en producción

---

## 📋 Problemas Identificados

### 1. ❌ Endpoint `/api/media/upload` puede no estar desplegado
- **Síntoma:** Error 404 al hacer POST a `/api/media/upload`
- **Causa posible:** El backend en producción no tiene el código más reciente con el endpoint

### 2. ❌ Variable de entorno `AZURE_STORAGE_CONNECTION_STRING` faltante
- **Síntoma:** El servicio `BlobStorageService` lanza error al inicializar
- **Causa:** No está configurada en `infra/phase2-apps.bicep`
- **Ubicación del código:** `backend/src/services/blob-storage.service.ts:32-34`

---

## 🔧 Soluciones

### Solución 1: Verificar que el endpoint existe

Ejecuta el script de diagnóstico:

```bash
# Opción 1: Script completo
./test-upload-endpoint.sh https://ca-accesslearn-backend-prod....azurecontainerapps.io

# Opción 2: Script rápido
./quick-test-upload.sh https://ca-accesslearn-backend-prod....azurecontainerapps.io
```

**O manualmente con curl:**

```bash
# 1. Health check
curl https://ca-accesslearn-backend-prod....azurecontainerapps.io/health

# 2. Probar endpoint (debería dar 401/403 si existe, 404 si no existe)
curl -X POST https://ca-accesslearn-backend-prod....azurecontainerapps.io/api/media/upload
```

**Resultados esperados:**
- ✅ **401/403:** El endpoint existe, el problema es autenticación/permisos
- ❌ **404:** El endpoint NO existe, necesita redesplegarse el backend

---

### Solución 2: Agregar `AZURE_STORAGE_CONNECTION_STRING` al backend

#### Opción A: Desde Azure Portal (Rápido)

1. Ir a: https://portal.azure.com
2. Buscar: "Container Apps"
3. Seleccionar: `ca-accesslearn-backend-prod`
4. Ir a: **Configuration** → **Environment variables**
5. Hacer clic en: **+ Add**
6. Agregar:
   - **Name:** `AZURE_STORAGE_CONNECTION_STRING`
   - **Value:** Obtener de Azure Portal:
     - Ir a: **Storage accounts** → `accesslearnmedia`
     - **Access keys** → Copiar **Connection string** (key1)
7. Hacer clic en: **Save**
8. El Container App se reiniciará automáticamente

#### Opción B: Agregar al template Bicep (Recomendado para futuro)

Editar `infra/phase2-apps.bicep` y agregar en la sección `env` del backend:

```bicep
{
  name: 'AZURE_STORAGE_CONNECTION_STRING'
  secretRef: 'azure-storage-connection-string'
}
```

Y crear el secret en Azure:

```bash
az containerapp secret set \
  --name ca-accesslearn-backend-prod \
  --resource-group accesslearn-inclusiv-rg \
  --secrets azure-storage-connection-string="DefaultEndpointsProtocol=https;AccountName=accesslearnmedia;AccountKey=..."
```

---

### Solución 3: Verificar que el backend tiene el código más reciente

1. **Verificar en el código local:**
   ```bash
   grep -n "app.post('/api/media/upload" backend/src/server.ts
   ```
   Debería mostrar la línea ~2895

2. **Verificar logs del backend en producción:**
   - Azure Portal → Container Apps → `ca-accesslearn-backend-prod` → **Log stream**
   - Buscar errores relacionados con `BlobStorageService` o `AZURE_STORAGE_CONNECTION_STRING`

3. **Redesplegar el backend si es necesario:**
   ```bash
   # Verificar que el código está en main
   git log --oneline -5
   
   # Si el endpoint está en el código, redesplegar
   # (seguir proceso de deployment normal)
   ```

---

## 🧪 Pruebas Post-Fix

Después de aplicar las soluciones:

1. **Verificar health check:**
   ```bash
   curl https://ca-accesslearn-backend-prod....azurecontainerapps.io/health
   ```

2. **Probar upload (con token de autenticación):**
   ```bash
   # Obtener token primero (login)
   TOKEN=$(curl -X POST https://ca-accesslearn-backend-prod....azurecontainerapps.io/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@kainet.mx","password":"...","tenantId":"kainet"}' \
     | jq -r '.token')
   
   # Probar upload
   curl -X POST https://ca-accesslearn-backend-prod....azurecontainerapps.io/api/media/upload \
     -H "Authorization: Bearer $TOKEN" \
     -F "file=@test-logo.png" \
     -F "type=logo"
   ```

3. **Probar desde la UI:**
   - Ir a: https://app.kainet.mx/admin/settings/branding
   - Intentar subir un logo
   - Verificar que no hay error 404

---

## 📝 Checklist

- [ ] Ejecutar script de diagnóstico
- [ ] Verificar que el endpoint existe (no 404)
- [ ] Agregar `AZURE_STORAGE_CONNECTION_STRING` al backend
- [ ] Verificar que el contenedor `tenant-logos` existe en Blob Storage
- [ ] Probar upload desde la UI
- [ ] Verificar logs del backend para errores

---

## 🔗 Referencias

- **Código del endpoint:** `backend/src/server.ts:2895`
- **Servicio Blob Storage:** `backend/src/services/blob-storage.service.ts`
- **Storage Account:** `accesslearnmedia` (Azure Portal)
- **Container:** `tenant-logos` (ya existe, confirmado en imágenes)

