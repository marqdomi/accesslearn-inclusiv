# ⚡ Quick Start: Fase 1 - Azure Blob Storage

**Tiempo estimado:** 30-45 minutos

---

## 🚀 Pasos Rápidos

### 1. Crear Storage Account en Azure Portal

1. Ve a [portal.azure.com](https://portal.azure.com)
2. Click en "Create a resource" → Busca "Storage account"
3. Configura:
   - **Name**: `accesslearnmedia` (único globalmente)
   - **Region**: Misma que Cosmos DB
   - **Redundancy**: `LRS` (desarrollo) o `GRS` (producción)
   - **Enable blob soft delete**: ✅ Sí (30 días)
4. Click "Create" y espera 1-2 minutos

### 2. Obtener Connection String

1. En el Storage Account → "Access keys"
2. Click "Show" en key1
3. Copia el **Connection string** completo

### 3. Configurar Variables de Entorno

Edita `backend/.env`:

```env
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=accesslearnmedia;AccountKey=...;EndpointSuffix=core.windows.net
FRONTEND_URL=http://localhost:5173
```

### 4. Ejecutar Script de Configuración

```bash
cd backend
npm run setup-blob-storage
```

✅ **Listo!** Los containers se crearán automáticamente.

---

## 📋 Verificación

En Azure Portal → Storage Account → Containers, deberías ver:

- ✅ `tenant-logos`
- ✅ `user-avatars`
- ✅ `course-media`
- ✅ `certificates`
- ✅ `course-files`

---

## 📚 Documentación Completa

Para más detalles, ver: [AZURE_BLOB_STORAGE_SETUP_GUIDE.md](./AZURE_BLOB_STORAGE_SETUP_GUIDE.md)

---

## ➡️ Siguiente Paso

Una vez completada la Fase 1, continúa con la **Fase 2: Backend - Servicio de Blob Storage**

