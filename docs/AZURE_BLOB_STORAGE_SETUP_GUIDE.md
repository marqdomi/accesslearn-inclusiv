# 🚀 Guía de Configuración: Azure Blob Storage - Fase 1

**Fecha:** Diciembre 2024  
**Fase:** 1 - Configuración de Azure  
**Tiempo Estimado:** 1-2 horas

---

## 📋 Objetivo

Configurar Azure Blob Storage para almacenar archivos multimedia (imágenes, videos, documentos) en lugar de Base64 en Cosmos DB.

---

## ✅ Checklist de Configuración

### Paso 1: Crear Azure Storage Account

#### 1.1 Desde Azure Portal

1. **Iniciar sesión en Azure Portal**
   - Ve a [portal.azure.com](https://portal.azure.com)
   - Inicia sesión con tu cuenta

2. **Crear nuevo recurso**
   - Click en "Create a resource" o "Crear un recurso"
   - Busca "Storage account"
   - Click en "Create" o "Crear"

3. **Configurar Storage Account**
   
   **Basics (Básico):**
   - **Subscription**: Selecciona tu suscripción
   - **Resource group**: Crea uno nuevo o usa existente (ej: `accesslearn-rg`)
   - **Storage account name**: `accesslearnmedia` (debe ser único globalmente)
   - **Region**: Misma región que tu Cosmos DB (ej: `East US`)
   - **Performance**: `Standard` (suficiente para la mayoría de casos)
   - **Redundancy**: 
     - **Desarrollo**: `Locally-redundant storage (LRS)` - Más económico
     - **Producción**: `Geo-redundant storage (GRS)` - Mayor disponibilidad

   **Advanced (Avanzado):**
   - **Enable hierarchical namespace**: ❌ No (solo para Data Lake)
   - **Enable blob soft delete**: ✅ **Sí** (30 días) - Recomendado
   - **Enable versioning**: ⚠️ Opcional (aumenta costos)
   - **Enable storage account key access**: ✅ Sí (necesario para connection string)

   **Networking (Redes):**
   - **Network access**: `Enabled from all networks` (o configura reglas específicas)
   - **Secure transfer required**: ✅ Sí (HTTPS only)

   **Data protection (Protección de datos):**
   - **Enable soft delete for blobs**: ✅ Sí (30 días)
   - **Enable soft delete for containers**: ✅ Sí (30 días)

   **Encryption (Cifrado):**
   - **Encryption type**: `Microsoft-managed keys` (suficiente)

4. **Review + Create**
   - Revisa la configuración
   - Click en "Create" o "Crear"
   - Espera a que se complete el deployment (1-2 minutos)

#### 1.2 Obtener Connection String

1. **Ir a Access Keys**
   - En el Storage Account creado
   - Ve a "Access keys" en el menú lateral
   - Click en "Show" en "key1" o "key2"

2. **Copiar Connection String**
   - Copia el valor de "Connection string" (no solo la key)
   - Formato: `DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net`
   - **⚠️ Mantén esto seguro, no lo subas a GitHub**

---

### Paso 2: Instalar Dependencias

```bash
cd backend
npm install @azure/storage-blob
```

---

### Paso 3: Configurar Variables de Entorno

Edita `backend/.env` y agrega:

```env
# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=accesslearnmedia;AccountKey=...;EndpointSuffix=core.windows.net
AZURE_STORAGE_ACCOUNT_NAME=accesslearnmedia

# Opcional: CDN endpoint (si configuras CDN después)
# AZURE_CDN_ENDPOINT=https://accesslearn.azureedge.net

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:5173
```

**⚠️ Importante:**
- No subas el archivo `.env` a GitHub
- Agrega `.env` a `.gitignore` si no está ya
- Usa Azure Key Vault en producción

---

### Paso 4: Ejecutar Script de Configuración

El script creará automáticamente todos los containers necesarios y configurará CORS.

```bash
cd backend
npm run setup-blob-storage
```

**Salida esperada:**
```
🚀 Configurando Azure Blob Storage...

✅ Conexión a Azure Storage establecida

📦 Creando containers...

   ✅ Container "tenant-logos" creado (access: blob)
   ✅ CORS configurado para "tenant-logos"
   ✅ Container "user-avatars" creado (access: private)
   ✅ CORS configurado para "user-avatars"
   ✅ Container "course-media" creado (access: private)
   ✅ CORS configurado para "course-media"
   ✅ Container "certificates" creado (access: private)
   ✅ CORS configurado para "certificates"
   ✅ Container "course-files" creado (access: private)
   ✅ CORS configurado para "course-files"

🔍 Verificando configuración...

   Storage Account: accesslearnmedia
   SKU: Standard_LRS
   Kind: StorageV2

📋 Containers existentes:
   - tenant-logos (blob)
   - user-avatars (private)
   - course-media (private)
   - certificates (private)
   - course-files (private)

✅ Configuración de Blob Storage completada exitosamente!
```

---

### Paso 5: Verificar en Azure Portal

1. **Ir a Containers**
   - En tu Storage Account
   - Click en "Containers" en el menú lateral
   - Verifica que aparezcan los 5 containers:
     - `tenant-logos`
     - `user-avatars`
     - `course-media`
     - `certificates`
     - `course-files`

2. **Verificar CORS**
   - Ve a "Settings" > "Resource sharing (CORS)"
   - Verifica que haya reglas CORS configuradas

---

## 🔧 Configuración Manual (Alternativa)

Si prefieres configurar manualmente desde Azure Portal:

### Crear Containers Manualmente

1. **Ir a Containers**
   - En tu Storage Account
   - Click en "Containers"
   - Click en "+ Container"

2. **Para cada container:**

   **tenant-logos:**
   - Name: `tenant-logos`
   - Public access level: `Blob (anonymous read access for blobs only)`

   **user-avatars:**
   - Name: `user-avatars`
   - Public access level: `Private (no anonymous access)`

   **course-media:**
   - Name: `course-media`
   - Public access level: `Private (no anonymous access)`

   **certificates:**
   - Name: `certificates`
   - Public access level: `Private (no anonymous access)`

   **course-files:**
   - Name: `course-files`
   - Public access level: `Private (no anonymous access)`

### Configurar CORS Manualmente

1. **Ir a CORS Settings**
   - En tu Storage Account
   - Ve a "Settings" > "Resource sharing (CORS)"

2. **Agregar regla CORS:**
   - **Allowed origins**: 
     - `http://localhost:5173`
     - `http://localhost:3000`
     - Tu URL de producción (ej: `https://accesslearn.azurestaticapps.net`)
   - **Allowed methods**: `GET, PUT, OPTIONS`
   - **Allowed headers**: `*`
   - **Exposed headers**: `*`
   - **Max age**: `3600`

---

## 🧪 Verificación

### Test de Conexión

Crea un archivo de prueba `backend/test-blob-connection.ts`:

```typescript
import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  
  if (!connectionString) {
    console.error('❌ AZURE_STORAGE_CONNECTION_STRING no configurada');
    return;
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const properties = await blobServiceClient.getProperties();
    
    console.log('✅ Conexión exitosa!');
    console.log('   Account:', properties.accountName);
    console.log('   SKU:', properties.skuName);
    
    // Listar containers
    console.log('\n📦 Containers:');
    for await (const container of blobServiceClient.listContainers()) {
      console.log(`   - ${container.name}`);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();
```

Ejecuta:
```bash
ts-node backend/test-blob-connection.ts
```

---

## ⚠️ Troubleshooting

### Error: "Connection string is not valid"

**Solución:**
- Verifica que copiaste la connection string completa
- Asegúrate de que no haya espacios extra
- Verifica que el Storage Account esté activo

### Error: "Container already exists"

**Solución:**
- Es normal si ejecutas el script múltiples veces
- El script detecta containers existentes y los omite

### Error: "Access denied"

**Solución:**
- Verifica que tengas permisos de "Storage Blob Data Contributor" o "Owner"
- Verifica que el Storage Account esté en la misma suscripción

### CORS no funciona

**Solución:**
- Verifica que los orígenes en CORS coincidan exactamente con tu frontend
- Asegúrate de que el protocolo sea correcto (http vs https)
- Verifica que no haya trailing slashes en las URLs

---

## 📊 Estructura Final

Después de la configuración, deberías tener:

```
Azure Storage Account: accesslearnmedia
├── Container: tenant-logos (blob access)
├── Container: user-avatars (private)
├── Container: course-media (private)
├── Container: certificates (private)
└── Container: course-files (private)
```

---

## ✅ Checklist Final

- [ ] Storage Account creado
- [ ] Connection string obtenida y guardada en `.env`
- [ ] Dependencia `@azure/storage-blob` instalada
- [ ] Script `setup-blob-storage` ejecutado exitosamente
- [ ] 5 containers creados y visibles en Azure Portal
- [ ] CORS configurado correctamente
- [ ] Test de conexión exitoso

---

## 🎯 Próximos Pasos

Una vez completada la Fase 1, continúa con:

**Fase 2: Backend - Servicio de Blob Storage**
- Crear servicio `blob-storage.service.ts`
- Implementar endpoints de upload/delete
- Ver [AZURE_BLOB_STORAGE_INTEGRATION.md](./AZURE_BLOB_STORAGE_INTEGRATION.md#fase-2-backend---servicio-de-blob-storage-2-3-días)

---

## 📚 Recursos

- [Azure Blob Storage Documentation](https://learn.microsoft.com/azure/storage/blobs/)
- [@azure/storage-blob SDK](https://www.npmjs.com/package/@azure/storage-blob)
- [Azure Storage Connection Strings](https://learn.microsoft.com/azure/storage/common/storage-configure-connection-string)
- [CORS Configuration](https://learn.microsoft.com/azure/storage/blobs/storage-cors-support)

---

**Última Actualización:** Diciembre 2024

