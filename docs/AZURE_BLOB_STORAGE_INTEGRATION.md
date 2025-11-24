# 📦 Plan de Integración: Azure Blob Storage para Media

**Fecha:** Diciembre 2024  
**Estado:** 📋 Planificación  
**Prioridad:** Alta (mejora de performance y costos)

---

## 🎯 Objetivo

Migrar el almacenamiento de archivos multimedia (imágenes, videos, documentos) de Base64 en Cosmos DB a Azure Blob Storage, mejorando:
- ⚡ **Performance**: Carga más rápida de páginas
- 💰 **Costos**: Reducción significativa de costos de almacenamiento
- 📊 **Escalabilidad**: Soporte para archivos grandes
- 🔒 **Seguridad**: Control de acceso granular con SAS tokens

---

## 📊 Estado Actual

### Almacenamiento Actual (Base64 en Cosmos DB)

**Frontend:**
- `BrandingSettingsPage.tsx`: Logo del tenant como Base64
- `WYSIWYGEditor.tsx`: Imágenes de lecciones como Base64
- `ProfilePage.tsx`: Avatar de usuario como Base64
- `ModernCourseBuilder.tsx`: Imágenes de cursos como Base64

**Backend:**
- `TenantFunctions.ts`: Logo almacenado como string Base64
- `UserFunctions.ts`: Avatar almacenado como string Base64
- `CourseFunctions.ts`: Imágenes de cursos como Base64 en el objeto del curso

**Problemas:**
- ❌ Archivos grandes aumentan el tamaño de documentos en Cosmos DB
- ❌ Costos altos (Cosmos DB cobra por GB almacenado)
- ❌ Límite de 2MB por documento en Cosmos DB
- ❌ No hay CDN para delivery rápido
- ❌ No hay versionado de archivos
- ❌ No hay control de acceso granular

---

## 🏗️ Arquitectura Propuesta

### Estructura de Containers en Blob Storage

```
Storage Account: accesslearn-media
├── Container: tenant-logos
│   └── {tenantId}/logo.{ext}
│
├── Container: user-avatars
│   └── {tenantId}/{userId}/avatar.{ext}
│
├── Container: course-media
│   └── {tenantId}/{courseId}/
│       ├── cover-image.{ext}
│       ├── lessons/
│       │   ├── {lessonId}/
│       │   │   ├── images/
│       │   │   ├── videos/
│       │   │   ├── audio/
│       │   │   └── captions/
│
├── Container: certificates
│   └── {tenantId}/{userId}/{certificateId}.pdf
│
└── Container: course-files
    └── {tenantId}/{courseId}/files/
```

### Flujo de Upload

```
Frontend (Usuario)
    ↓
1. Selecciona archivo
2. Valida tipo y tamaño
3. Muestra preview
    ↓
Backend API
    ↓
4. POST /api/media/upload
   - Recibe FormData
   - Valida permisos
   - Genera nombre único
   - Sube a Blob Storage
   - Retorna URL pública
    ↓
Frontend
    ↓
5. Guarda URL en Cosmos DB
   (en lugar de Base64)
```

---

## 📋 Checklist de Implementación

### Fase 1: Configuración de Azure (1-2 días)

#### 1.1 Crear Storage Account
- [x] Script de configuración creado (`setup-blob-storage.ts`)
- [ ] Crear Azure Storage Account (ver [AZURE_BLOB_STORAGE_SETUP_GUIDE.md](./AZURE_BLOB_STORAGE_SETUP_GUIDE.md))
- [ ] Configurar redundancia (LRS para desarrollo, GRS para producción)
- [ ] Habilitar soft delete (30 días)
- [ ] Configurar versionado (opcional)
- [ ] Configurar lifecycle policies (archivar archivos antiguos)

#### 1.2 Crear Containers
- [x] Script automatizado para crear containers
- [ ] Ejecutar `npm run setup-blob-storage` para crear:
  - [ ] `tenant-logos` (público con CORS)
  - [ ] `user-avatars` (privado)
  - [ ] `course-media` (privado)
  - [ ] `certificates` (privado)
  - [ ] `course-files` (privado)

#### 1.3 Configurar CORS
- [x] CORS configurado automáticamente por el script
- [ ] Verificar que los orígenes del frontend estén incluidos
- [ ] Métodos: GET, PUT, OPTIONS
- [ ] Headers permitidos

#### 1.4 Configurar CDN (Opcional pero Recomendado)
- [ ] Crear Azure CDN Profile
- [ ] Agregar endpoint apuntando a Storage Account
- [ ] Configurar custom domain (opcional)
- [ ] Configurar cache policies

**📚 Guía Completa:** [AZURE_BLOB_STORAGE_SETUP_GUIDE.md](./AZURE_BLOB_STORAGE_SETUP_GUIDE.md)  
**⚡ Quick Start:** [BLOB_STORAGE_FASE1_QUICKSTART.md](./BLOB_STORAGE_FASE1_QUICKSTART.md)

---

### Fase 2: Backend - Servicio de Blob Storage (2-3 días)

#### 2.1 Instalar Dependencias
```bash
cd backend
npm install @azure/storage-blob
npm install multer @types/multer  # Para manejo de FormData
```

#### 2.2 Crear Servicio de Blob Storage
**Archivo:** `backend/src/services/blob-storage.service.ts`

```typescript
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

class BlobStorageService {
  private blobServiceClient: BlobServiceClient;
  private connectionString: string;

  constructor() {
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
    if (!this.connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
    }
    this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
  }

  // Obtener container client
  private getContainerClient(containerName: string): ContainerClient {
    return this.blobServiceClient.getContainerClient(containerName);
  }

  // Upload file
  async uploadFile(
    containerName: string,
    blobName: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<string> {
    const containerClient = this.getContainerClient(containerName);
    
    // Crear container si no existe
    await containerClient.createIfNotExists({
      access: 'private' // o 'blob' para acceso público con URL
    });

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: { blobContentType: contentType }
    });

    // Retornar URL del blob
    return blockBlobClient.url;
  }

  // Generar SAS token para acceso temporal
  async generateSasToken(
    containerName: string,
    blobName: string,
    expiresInMinutes: number = 60
  ): Promise<string> {
    // Implementar generación de SAS token
    // ...
  }

  // Delete file
  async deleteFile(containerName: string, blobName: string): Promise<void> {
    const containerClient = this.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
  }

  // Get file URL
  getFileUrl(containerName: string, blobName: string): string {
    const containerClient = this.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.url;
  }
}

export const blobStorageService = new BlobStorageService();
```

#### 2.3 Crear Endpoints de Upload
**Archivo:** `backend/src/server.ts`

```typescript
import multer from 'multer';
import { blobStorageService } from './services/blob-storage.service';

// Configurar multer para manejar FormData
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo permitidos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// POST /api/media/upload
app.post('/api/media/upload', 
  requireAuth,
  upload.single('file'),
  async (req, res) => {
    try {
      const user = (req as any).user;
      const { tenantId } = user;
      const { type, courseId, lessonId } = req.body; // type: 'logo' | 'avatar' | 'course-cover' | 'lesson-image'
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Generar nombre único
      const fileExtension = file.originalname.split('.').pop();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

      // Determinar container y path según tipo
      let containerName: string;
      let blobName: string;

      switch (type) {
        case 'logo':
          containerName = 'tenant-logos';
          blobName = `${tenantId}/logo.${fileExtension}`;
          break;
        case 'avatar':
          containerName = 'user-avatars';
          blobName = `${tenantId}/${user.id}/avatar.${fileExtension}`;
          break;
        case 'course-cover':
          containerName = 'course-media';
          blobName = `${tenantId}/${courseId}/cover-image.${fileExtension}`;
          break;
        case 'lesson-image':
          containerName = 'course-media';
          blobName = `${tenantId}/${courseId}/lessons/${lessonId}/images/${uniqueName}`;
          break;
        default:
          return res.status(400).json({ error: 'Invalid upload type' });
      }

      // Upload a Blob Storage
      const fileUrl = await blobStorageService.uploadFile(
        containerName,
        blobName,
        file.buffer,
        file.mimetype
      );

      res.json({
        success: true,
        url: fileUrl,
        blobName,
        containerName
      });
    } catch (error: any) {
      console.error('[API] Error uploading file:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/media/url/:container/:blobName - Obtener URL con SAS token
app.get('/api/media/url/:container/:blobName', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { container, blobName } = req.params;
    
    // Validar que el usuario tenga acceso al archivo
    // (verificar que pertenezca al tenant correcto)
    
    const sasUrl = await blobStorageService.generateSasToken(container, blobName, 60);
    res.json({ url: sasUrl });
  } catch (error: any) {
    console.error('[API] Error generating SAS URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/media/:container/:blobName
app.delete('/api/media/:container/:blobName', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { container, blobName } = req.params;
    
    // Validar permisos antes de eliminar
    
    await blobStorageService.deleteFile(container, blobName);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[API] Error deleting file:', error);
    res.status(500).json({ error: error.message });
  }
});
```

#### 2.4 Variables de Entorno
**Archivo:** `backend/.env.example`

```env
# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_ACCOUNT_NAME=accesslearn-media
AZURE_STORAGE_ACCOUNT_KEY=...
AZURE_CDN_ENDPOINT=https://accesslearn.azureedge.net  # Opcional
```

---

### Fase 3: Frontend - Servicio de Upload (2-3 días)

#### 3.1 Actualizar ApiService
**Archivo:** `src/services/api.service.ts`

```typescript
// Upload file to Azure Blob Storage
async uploadFile(
  file: File,
  type: 'logo' | 'avatar' | 'course-cover' | 'lesson-image',
  options?: {
    courseId?: string;
    lessonId?: string;
  }
): Promise<{ url: string; blobName: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  if (options?.courseId) {
    formData.append('courseId', options.courseId);
  }
  if (options?.lessonId) {
    formData.append('lessonId', options.lessonId);
  }

  const response = await fetch(`${this.baseUrl}/api/media/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.getToken()}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error uploading file');
  }

  return await response.json();
}

// Get secure URL with SAS token
async getMediaUrl(container: string, blobName: string): Promise<string> {
  const response = await fetch(
    `${this.baseUrl}/api/media/url/${container}/${encodeURIComponent(blobName)}`,
    {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Error getting media URL');
  }

  const data = await response.json();
  return data.url;
}
```

#### 3.2 Actualizar BrandingSettingsPage
**Archivo:** `src/pages/BrandingSettingsPage.tsx`

```typescript
const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validaciones...
  if (!file.type.startsWith('image/')) {
    toast.error('Por favor, selecciona un archivo de imagen');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    toast.error('La imagen debe ser menor a 2MB');
    return;
  }

  try {
    setSaving(true);
    
    // Upload a Blob Storage
    const { url } = await ApiService.uploadFile(file, 'logo');
    
    // Guardar URL en lugar de Base64
    setLogoPreview(url);
    setLogoFile(null); // Ya no necesitamos el archivo local
    
    toast.success('Logo subido exitosamente');
  } catch (error: any) {
    console.error('Error uploading logo:', error);
    toast.error('Error al subir el logo');
  } finally {
    setSaving(false);
  }
};

const handleSave = async () => {
  // ... validaciones ...
  
  const updates: any = {
    name: companyName.trim(),
    primaryColor: primaryColor,
    secondaryColor: secondaryColor,
    logo: logoPreview, // Ahora es una URL, no Base64
  };

  await ApiService.updateTenant(tenantId, updates);
  // ...
};
```

#### 3.3 Actualizar WYSIWYGEditor
**Archivo:** `src/components/admin/WYSIWYGEditor.tsx`

```typescript
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    toast.error('Please upload an image file (JPG, PNG, GIF)');
    return;
  }

  try {
    // Upload a Blob Storage
    const { url } = await ApiService.uploadFile(file, 'lesson-image', {
      courseId: courseId, // Necesitamos pasar el courseId
      lessonId: lessonId  // Y el lessonId
    });

    // Guardar URL en lugar de Base64
    onChange({
      ...block,
      type: 'image',
      content: url, // URL del blob
      imageFile: url,
      accessibility: { ...block.accessibility, altText }
    });

    toast.success('Image uploaded successfully');
  } catch (error: any) {
    console.error('Error uploading image:', error);
    toast.error('Error uploading image');
  }
};
```

#### 3.4 Actualizar ProfilePage
**Archivo:** `src/pages/ProfilePage.tsx`

Similar a `BrandingSettingsPage`, pero usando `type: 'avatar'`.

---

### Fase 4: Migración de Datos Existentes (Opcional, 1-2 días)

#### 4.1 Script de Migración
**Archivo:** `backend/src/scripts/migrate-base64-to-blob.ts`

```typescript
import { blobStorageService } from '../services/blob-storage.service';
import { getContainer } from '../services/cosmosdb.service';

async function migrateTenantLogos() {
  const tenantsContainer = getContainer('tenants');
  const { resources: tenants } = await tenantsContainer.items.query('SELECT * FROM c').fetchAll();

  for (const tenant of tenants) {
    if (tenant.logo && tenant.logo.startsWith('data:image')) {
      // Convertir Base64 a Buffer
      const base64Data = tenant.logo.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Determinar extensión
      const mimeType = tenant.logo.match(/data:image\/(\w+);base64/)?.[1] || 'png';
      const extension = mimeType === 'jpeg' ? 'jpg' : mimeType;
      
      // Upload a Blob Storage
      const blobName = `${tenant.id}/logo.${extension}`;
      const url = await blobStorageService.uploadFile(
        'tenant-logos',
        blobName,
        buffer,
        `image/${mimeType}`
      );
      
      // Actualizar tenant con URL
      tenant.logo = url;
      await tenantsContainer.items.upsert(tenant);
      
      console.log(`Migrated logo for tenant ${tenant.id}`);
    }
  }
}

// Ejecutar migración
migrateTenantLogos()
  .then(() => console.log('Migration complete'))
  .catch(console.error);
```

---

### Fase 5: Testing y Validación (2-3 días)

#### 5.1 Testing Manual
- [ ] Upload de logo de tenant
- [ ] Upload de avatar de usuario
- [ ] Upload de imagen de curso
- [ ] Upload de imagen en lección
- [ ] Verificación de URLs en Cosmos DB
- [ ] Verificación de acceso a archivos
- [ ] Verificación de eliminación de archivos
- [ ] Testing de límites de tamaño
- [ ] Testing de tipos de archivo permitidos

#### 5.2 Testing de Performance
- [ ] Comparar tiempo de carga antes/después
- [ ] Verificar uso de CDN (si aplica)
- [ ] Monitorear costos de Storage

#### 5.3 Testing de Seguridad
- [ ] Verificar que SAS tokens expiran correctamente
- [ ] Verificar que usuarios solo pueden acceder a archivos de su tenant
- [ ] Verificar validación de tipos de archivo
- [ ] Verificar límites de tamaño

---

## 🔒 Consideraciones de Seguridad

### 1. Control de Acceso
- ✅ Validar que el usuario pertenezca al tenant correcto
- ✅ Validar permisos antes de upload/delete
- ✅ Usar SAS tokens con expiración corta (1 hora)
- ✅ Containers privados por defecto

### 2. Validación de Archivos
- ✅ Validar tipo MIME (no solo extensión)
- ✅ Validar tamaño máximo (10MB para imágenes, 100MB para videos)
- ✅ Escanear archivos en busca de malware (opcional, usar Azure Security Center)

### 3. Nombres de Archivos
- ✅ Generar nombres únicos (timestamp + random)
- ✅ Sanitizar nombres de archivo
- ✅ No permitir paths relativos (../)

---

## 💰 Estimación de Costos

### Azure Blob Storage (LRS - Local Redundancy)

**Precios aproximados (región: East US):**
- Storage: $0.0184/GB/mes
- Transacciones: $0.004 por 10,000 transacciones
- Egress: $0.05/GB (primeros 5GB gratis)

**Ejemplo para 10 tenants:**
- 1GB de logos: $0.0184/mes
- 10GB de course media: $0.184/mes
- 1GB de avatares: $0.0184/mes
- **Total: ~$0.22/mes** (vs ~$0.25/GB en Cosmos DB)

**Con CDN:**
- CDN: $0.085/GB (primeros 5GB gratis)
- Reduce egress costs significativamente

---

## 📝 Checklist Final

### Pre-requisitos
- [ ] Azure Storage Account creado
- [ ] Containers creados
- [ ] CORS configurado
- [ ] Variables de entorno configuradas

### Backend
- [ ] Servicio de Blob Storage implementado
- [ ] Endpoints de upload implementados
- [ ] Endpoints de delete implementados
- [ ] Generación de SAS tokens implementada
- [ ] Validación de permisos implementada

### Frontend
- [ ] ApiService actualizado con métodos de upload
- [ ] BrandingSettingsPage actualizado
- [ ] ProfilePage actualizado
- [ ] WYSIWYGEditor actualizado
- [ ] ModernCourseBuilder actualizado

### Testing
- [ ] Testing manual completo
- [ ] Testing de performance
- [ ] Testing de seguridad

### Documentación
- [ ] README actualizado
- [ ] Documentación de API actualizada
- [ ] Guía de migración documentada

---

## 🚀 Próximos Pasos

1. **Revisar y aprobar este plan**
2. **Crear Azure Storage Account** (Fase 1)
3. **Implementar servicio de Blob Storage** (Fase 2)
4. **Actualizar frontend** (Fase 3)
5. **Testing exhaustivo** (Fase 5)
6. **Migración de datos existentes** (Fase 4, opcional)
7. **Deploy a producción**

---

## 📚 Recursos

- [Azure Blob Storage Documentation](https://learn.microsoft.com/azure/storage/blobs/)
- [@azure/storage-blob SDK](https://www.npmjs.com/package/@azure/storage-blob)
- [Azure CDN Documentation](https://learn.microsoft.com/azure/cdn/)
- [SAS Tokens Best Practices](https://learn.microsoft.com/azure/storage/common/storage-sas-overview)

---

**Última Actualización:** Diciembre 2024

