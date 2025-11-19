# 🌐 Estrategia de Azure Cosmos DB para AccessLearn Multi-Tenant

**Recomendación:** Azure Cosmos DB es la **mejor opción** para este proyecto

---

## 🎯 ¿Por qué Cosmos DB?

### **Ventajas Específicas para AccessLearn:**

1. **✅ Escalabilidad Automática**
   - Crece automáticamente con cada nuevo tenant
   - Serverless = pagas solo lo que usas
   - Perfecto para empezar con pocos clientes

2. **✅ Global Distribution (Futuro)**
   - Clientes internacionales tendrán baja latencia
   - Multi-region replication automática
   - 99.999% SLA de disponibilidad

3. **✅ Flexible Data Model**
   - JSON nativo = tu modelo actual de datos casi no cambia
   - Perfecto para datos semi-estructurados (cursos con contenido variable)
   - Schemas flexibles por tenant

4. **✅ Cost-Effective para MVP**
   - Serverless tier: $0.25 por millón de operaciones
   - Primeros 1000 RU/s gratis mensualmente
   - Primeros 25 GB gratis mensualmente
   - Ideal para comenzar con 2-5 tenants

5. **✅ Built for Multi-Tenancy**
   - Partition Keys = perfecto para tenant isolation
   - Container-per-tenant o Shared Container con partition
   - Backups automáticos

---

## 🏗️ Diseño de Multi-Tenancy con Cosmos DB

### **Opción A: Database-per-Tenant (RECOMENDADO)**

```
Azure Cosmos DB Account: "accesslearn-prod"
├── Database: tenant-acme-corp
│   ├── Container: users
│   ├── Container: courses
│   ├── Container: progress
│   ├── Container: achievements
│   └── Container: analytics-events
│
├── Database: tenant-techstart-inc
│   ├── Container: users
│   ├── Container: courses
│   ├── Container: progress
│   ├── Container: achievements
│   └── Container: analytics-events
│
└── Database: tenant-edulearn-ltd
    ├── Container: users
    └── ...
```

**Ventajas:**
- ✅ Aislamiento total de datos por tenant
- ✅ Fácil GDPR compliance (eliminar database completo)
- ✅ Backups independientes por tenant
- ✅ Throughput dedicado por tenant (pagar lo que usa cada uno)
- ✅ Facturación separada por cliente

**Costo Estimado:**
- Serverless: ~$10-50/mes por tenant (con poco tráfico)
- 10 tenants = ~$100-500/mes

---

### **Opción B: Shared Containers with Partition Keys**

```
Azure Cosmos DB Account: "accesslearn-prod"
└── Database: "production"
    ├── Container: users
    │   ├── Partition Key: /tenantId
    │   └── Items:
    │       ├── { id: "user-1", tenantId: "acme", name: "John" }
    │       └── { id: "user-2", tenantId: "techstart", name: "Jane" }
    │
    ├── Container: courses
    │   ├── Partition Key: /tenantId
    │   └── Items: [...]
    │
    └── Container: progress
        ├── Partition Key: /tenantId
        └── Items: [...]
```

**Ventajas:**
- ✅ Más simple de mantener (una sola DB)
- ✅ Costo menor (recursos compartidos)
- ✅ Mejor para muchos tenants pequeños (50+)

**Desventajas:**
- ⚠️ Riesgo de data leakage (bug = ver datos de otro tenant)
- ⚠️ Backups compartidos
- ⚠️ Compliance más complejo

---

## 📊 Modelo de Datos Propuesto

### **Container: users**
```json
{
  "id": "user-abc-123",
  "tenantId": "acme-corp",
  "type": "user",
  "email": "john@acmecorp.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "employee",
  "department": "Sales",
  "status": "active",
  
  // ✨ NUEVOS CAMPOS PARA MERCADO MEXICANO (Compliance Laboral)
  "complianceMexico": {
    "curp": "DOEJ850615HDFXXX09",          // Clave Única de Registro de Población (18 caracteres)
    "rfc": "DOEJ850615ABC",                // Registro Federal de Contribuyentes (13 caracteres)
    "nss": "12345678901",                  // Número de Seguridad Social (11 dígitos)
    "puesto": "Ejecutivo de Ventas",       // Puesto o cargo laboral
    "area": "Ventas Corporativas",         // Área organizacional
    "centroCostos": "CC-VENTAS-001"        // Centro de costos para control administrativo
  },
  
  "profile": {
    "xp": 1250,
    "level": 12,
    "rank": "Specialist",
    "achievements": ["first-course", "speed-runner"],
    "avatarUrl": "https://..."
  },
  "preferences": {
    "language": "es",                      // Español prioritario para mercado mexicano
    "accessibility": {
      "highContrast": false,
      "reduceMotion": false,
      "textSize": "large"
    }
  },
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-11-18T14:20:00Z",
  "_ts": 1700315200
}
```

**Partition Key:** `/tenantId`  
**Índices:** email, role, status, department, complianceMexico.curp, complianceMexico.rfc

**NOTAS sobre campos mexicanos:**
- `complianceMexico` es opcional (solo para clientes en México)
- CURP, RFC, NSS son críticos para integración STPS (constancias oficiales)
- Puesto, área, centro de costos facilitan reportes administrativos y control por departamento
- Validaciones: CURP (18 chars), RFC (13 chars), NSS (11 dígitos)
- Privacidad: Estos datos son sensibles, requieren encryption at rest

---

### **Container: courses**
```json
{
  "id": "course-xyz-789",
  "tenantId": "acme-corp",
  "type": "course",
  "title": "Sales Mastery 101",
  "slug": "sales-mastery-101",
  "description": "Learn advanced sales techniques",
  "category": "sales",
  "difficulty": "intermediate",
  "estimatedHours": 8,
  "status": "published",
  "issueCertificate": true,
  "branding": {
    "coverImage": "https://...",
    "color": "#8B5CF6"
  },
  "structure": {
    "modules": [
      {
        "id": "module-1",
        "title": "Introduction to Sales",
        "order": 1,
        "lessons": [
          {
            "id": "lesson-1-1",
            "title": "What is Sales?",
            "order": 1,
            "type": "video",
            "content": {
              "videoUrl": "https://...",
              "duration": 600,
              "captionsUrl": "https://..."
            }
          }
        ]
      }
    ]
  },
  "enrollment": {
    "type": "manual",
    "enrolledCount": 45,
    "completedCount": 12
  },
  "createdBy": "admin-001",
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-11-15T16:45:00Z",
  "_ts": 1700060700
}
```

**Partition Key:** `/tenantId`  
**Índices:** status, category, slug

---

### **Container: progress**
```json
{
  "id": "progress-user123-course789",
  "tenantId": "acme-corp",
  "type": "progress",
  "userId": "user-abc-123",
  "courseId": "course-xyz-789",
  "status": "in-progress",
  "startedAt": "2025-11-01T09:00:00Z",
  "lastAccessedAt": "2025-11-18T14:00:00Z",
  "completedAt": null,
  "progress": {
    "currentModuleId": "module-2",
    "currentLessonId": "lesson-2-3",
    "modulesCompleted": ["module-1"],
    "lessonsCompleted": [
      "lesson-1-1",
      "lesson-1-2",
      "lesson-2-1",
      "lesson-2-2"
    ],
    "percentComplete": 45,
    "xpEarned": 350
  },
  "quizAttempts": [
    {
      "moduleId": "module-1",
      "quizId": "quiz-1",
      "attemptNumber": 1,
      "score": 85,
      "maxScore": 100,
      "passed": true,
      "attemptedAt": "2025-11-05T10:30:00Z"
    }
  ],
  "_ts": 1700315200
}
```

**Partition Key:** `/tenantId`  
**Índices:** userId, courseId, status

---

### **Container: tenants** (Metadata)
```json
{
  "id": "acme-corp",
  "type": "tenant",
  "companyName": "ACME Corporation",
  "subdomain": "acme",
  "status": "active",
  "subscription": {
    "plan": "professional",
    "status": "active",
    "startDate": "2025-01-01T00:00:00Z",
    "renewalDate": "2026-01-01T00:00:00Z",
    "limits": {
      "maxUsers": 100,
      "maxCourses": 50,
      "maxStorageGB": 50
    },
    "usage": {
      "currentUsers": 45,
      "currentCourses": 12,
      "currentStorageGB": 8.5
    }
  },
  "branding": {
    "logoUrl": "https://storage.../acme-logo.png",
    "primaryColor": "oklch(0.55 0.20 290)",
    "companyName": "ACME Corp"
  },
  "settings": {
    "language": "en",
    "timezone": "America/New_York",
    "features": {
      "gamification": true,
      "mentorship": true,
      "certificates": true,
      "analytics": true,
      "sso": false
    }
  },
  "contact": {
    "adminEmail": "admin@acmecorp.com",
    "billingEmail": "billing@acmecorp.com",
    "phone": "+1-555-0100"
  },
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-11-18T10:00:00Z",
  "_ts": 1700308800
}
```

**Partition Key:** `/id` (single partition, pocos tenants)

---

### **Container: analytics-events**
```json
{
  "id": "event-abc-def-123",
  "tenantId": "acme-corp",
  "type": "analytics-event",
  "eventType": "course-completed",
  "userId": "user-abc-123",
  "entityId": "course-xyz-789",
  "timestamp": "2025-11-18T14:30:00Z",
  "metadata": {
    "courseTitle": "Sales Mastery 101",
    "completionTime": 7.5,
    "score": 92,
    "xpEarned": 500
  },
  "session": {
    "sessionId": "session-xyz",
    "deviceType": "desktop",
    "browser": "Chrome"
  },
  "_ts": 1700316600
}
```

**Partition Key:** `/tenantId`  
**TTL:** 90 días (limpieza automática)

---

## 🔧 Configuración de Cosmos DB

### **1. Crear Cosmos DB Account**

```bash
# Azure CLI
az cosmosdb create \
  --name accesslearn-prod \
  --resource-group accesslearn-rg \
  --locations regionName=eastus failoverPriority=0 \
  --capabilities EnableServerless \
  --kind GlobalDocumentDB \
  --default-consistency-level Session
```

### **2. Crear Database (por cada tenant)**

```typescript
// TypeScript SDK
import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT!,
  key: process.env.COSMOS_KEY!
});

async function createTenantDatabase(tenantId: string) {
  const { database } = await client.databases.createIfNotExists({
    id: `tenant-${tenantId}`
  });

  // Crear containers
  await database.containers.createIfNotExists({
    id: "users",
    partitionKey: { paths: ["/tenantId"] }
  });

  await database.containers.createIfNotExists({
    id: "courses",
    partitionKey: { paths: ["/tenantId"] }
  });

  await database.containers.createIfNotExists({
    id: "progress",
    partitionKey: { paths: ["/tenantId"] },
    indexingPolicy: {
      includedPaths: [{ path: "/*" }],
      excludedPaths: [{ path: "/content/*" }] // Optimizar
    }
  });

  await database.containers.createIfNotExists({
    id: "analytics-events",
    partitionKey: { paths: ["/tenantId"] },
    defaultTtl: 7776000 // 90 días
  });

  return database;
}
```

---

## 💰 Estimación de Costos

### **Cosmos DB Serverless Pricing:**
- **Storage:** $0.25/GB por mes
- **Operations:** $0.25 por millón RU (Request Units)
- **Backup:** Incluido (2 copias, retención 30 días)

### **Estimación por Tenant (100 usuarios activos):**

**Operaciones diarias:**
- Login/Auth: 100 usuarios × 2 sesiones = 200 requests (10 RU c/u) = 2,000 RU
- Ver cursos: 50 usuarios × 5 veces = 250 requests (5 RU c/u) = 1,250 RU
- Guardar progreso: 50 usuarios × 10 veces = 500 requests (10 RU c/u) = 5,000 RU
- Analytics events: 100 usuarios × 20 eventos = 2,000 requests (5 RU c/u) = 10,000 RU
- Queries varias: 5,000 RU

**Total diario:** ~25,000 RU/día = 750,000 RU/mes

**Costo operaciones:** 0.75 millones × $0.25 = **$0.19/mes** 😱

**Storage:**
- Users: 100 × 5KB = 500KB
- Courses: 20 × 100KB = 2MB
- Progress: 100 × 50KB = 5MB
- Analytics: ~50MB/mes (con TTL de 90 días)
- Total: ~60MB

**Costo storage:** 0.06GB × $0.25 = **$0.015/mes** 😱

### **Total por Tenant: ~$0.20/mes** (con 100 usuarios activos)

**Para 10 tenants: ~$2/mes** (en realidad gratis, por los $25 GB y 1000 RU/s gratis)

**Para 50 tenants: ~$10/mes**

**Para 100 tenants: ~$20/mes**

---

## 🔒 Multi-Tenant Isolation Strategy

### **Tenant Resolution Middleware**

```typescript
// middleware/tenant-resolver.ts
import { Request, Response, NextFunction } from 'express';
import { CosmosClient } from '@azure/cosmos';

export interface TenantRequest extends Request {
  tenantId: string;
  tenantDb: Database;
}

export async function resolveTenant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Método 1: Subdomain (acme.accesslearn.com)
  const subdomain = req.hostname.split('.')[0];
  
  // Método 2: Header (para APIs)
  const tenantHeader = req.headers['x-tenant-id'] as string;
  
  // Método 3: JWT claim (después de autenticación)
  const tenantFromToken = req.user?.tenantId;

  const tenantId = tenantFromToken || tenantHeader || subdomain;

  if (!tenantId || tenantId === 'www' || tenantId === 'api') {
    return res.status(400).json({ error: 'Tenant ID required' });
  }

  // Validar que el tenant existe
  const tenantDb = client.database(`tenant-${tenantId}`);
  
  try {
    await tenantDb.read();
  } catch (error) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  // Inyectar en request
  (req as TenantRequest).tenantId = tenantId;
  (req as TenantRequest).tenantDb = tenantDb;

  next();
}
```

### **Repository Pattern con Tenant Isolation**

```typescript
// repositories/user-repository.ts
import { Container } from '@azure/cosmos';

export class UserRepository {
  constructor(private container: Container) {}

  async findById(userId: string, tenantId: string) {
    const { resource } = await this.container.item(userId, tenantId).read();
    return resource;
  }

  async findByEmail(email: string, tenantId: string) {
    const query = {
      query: 'SELECT * FROM users u WHERE u.tenantId = @tenantId AND u.email = @email',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@email', value: email }
      ]
    };

    const { resources } = await this.container.items.query(query).fetchAll();
    return resources[0] || null;
  }

  async create(user: User) {
    // Cosmos DB automáticamente particiona por tenantId
    const { resource } = await this.container.items.create(user);
    return resource;
  }

  async listByTenant(tenantId: string, limit = 100) {
    const query = {
      query: 'SELECT * FROM users u WHERE u.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    };

    const { resources } = await this.container.items
      .query(query, {
        maxItemCount: limit,
        partitionKey: tenantId // Query optimization
      })
      .fetchAll();

    return resources;
  }
}
```

---

## 🚀 Migración de Datos Actuales

### **Script de Migración: Spark KV → Cosmos DB**

```typescript
// scripts/migrate-to-cosmos.ts
import { CosmosClient } from '@azure/cosmos';

async function migrateToCosmosDB() {
  const client = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT!,
    key: process.env.COSMOS_KEY!
  });

  // Crear tenant de prueba
  const tenantId = 'demo-tenant';
  const database = client.database(`tenant-${tenantId}`);

  // Migrar usuarios
  const sparkUsers = await window.spark.kv.get('user-profiles');
  const usersContainer = database.container('users');

  for (const user of sparkUsers) {
    const cosmosUser = {
      ...user,
      tenantId,
      type: 'user',
      _ts: Date.now() / 1000
    };
    await usersContainer.items.create(cosmosUser);
  }

  // Migrar cursos
  const sparkCourses = await window.spark.kv.get('courses');
  const coursesContainer = database.container('courses');

  for (const course of sparkCourses) {
    const cosmosCourse = {
      ...course,
      tenantId,
      type: 'course',
      _ts: Date.now() / 1000
    };
    await coursesContainer.items.create(cosmosCourse);
  }

  console.log('Migration completed!');
}
```

---

## 📋 Checklist de Implementación

### **Fase 1: Setup Inicial (Semana 1)**
- [ ] Crear Azure Cosmos DB Account (Serverless)
- [ ] Configurar connection strings en Key Vault
- [ ] Instalar SDK: `npm install @azure/cosmos`
- [ ] Crear database de prueba
- [ ] Crear containers base (users, courses, progress)
- [ ] Implementar tenant-resolver middleware
- [ ] Implementar repositories básicos

### **Fase 2: Backend APIs (Semana 2-3)**
- [ ] Crear Azure Functions con Cosmos DB bindings
- [ ] Implementar CRUD de usuarios
- [ ] Implementar CRUD de cursos
- [ ] Implementar progreso de usuario
- [ ] Implementar achievements
- [ ] Implementar analytics events
- [ ] Testing con Postman/Thunder Client

### **Fase 3: Frontend Migration (Semana 3-4)**
- [ ] Crear servicio HTTP client
- [ ] Migrar hooks de Spark KV a APIs
- [ ] Implementar error handling
- [ ] Implementar loading states
- [ ] Implementar retry logic
- [ ] Testing E2E

### **Fase 4: Multi-Tenant Features (Semana 4-5)**
- [ ] Implementar tenant onboarding
- [ ] Crear super-admin dashboard
- [ ] Implementar tenant settings
- [ ] Implementar subdomain routing
- [ ] Testing con múltiples tenants

---

## 🎯 Próximos Pasos Inmediatos

1. **Crear Azure Account** (si no tienes)
   - Ir a https://azure.microsoft.com
   - Registrar con crédito de $200 USD gratis

2. **Crear Resource Group**
   ```bash
   az group create \
     --name accesslearn-rg \
     --location eastus
   ```

3. **Crear Cosmos DB Account**
   ```bash
   az cosmosdb create \
     --name accesslearn-prod \
     --resource-group accesslearn-rg \
     --capabilities EnableServerless
   ```

4. **Obtener Connection String**
   ```bash
   az cosmosdb keys list \
     --name accesslearn-prod \
     --resource-group accesslearn-rg \
     --type connection-strings
   ```

5. **Crear primer tenant de prueba**
   - Usar Azure Portal o SDK
   - Crear database: `tenant-demo`
   - Crear containers básicos

---

## 💡 Recomendación Final

**Cosmos DB Serverless es PERFECTO para tu caso:**

✅ **Costo inicial casi CERO**  
✅ **Escala automáticamente**  
✅ **Multi-tenancy natural**  
✅ **JSON/NoSQL = tu data model actual**  
✅ **Global distribution lista para crecer**  
✅ **99.99% SLA**  

**No necesitas Azure SQL** a menos que:
- Requieras transacciones complejas ACID
- Requieras stored procedures pesados
- Tu equipo solo conoce SQL

Para AccessLearn, **Cosmos DB es la mejor opción**. 🚀
