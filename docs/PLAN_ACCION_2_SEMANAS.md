# 🚀 Plan de Acción Inmediato: Próximas 2 Semanas

**Objetivo:** Tener un prototipo funcional con backend + Cosmos DB + 1 tenant de prueba

**Fecha Inicio:** 18 de Noviembre, 2025  
**Fecha Target:** 2 de Diciembre, 2025

---

## 📅 SEMANA 1: Azure Setup + Backend Foundation

### **Día 1-2: Azure Infrastructure Setup** ⚡

#### **Tareas Técnicas:**
- [ ] **Crear Azure Subscription** (si no existe)
  - Ir a https://azure.microsoft.com/free
  - Registrar con $200 USD de crédito gratis
  - Activar subscripción

- [ ] **Crear Resource Group**
  ```bash
  az login
  az group create \
    --name accesslearn-dev-rg \
    --location eastus
  ```

- [ ] **Crear Azure Cosmos DB (Serverless)**
  ```bash
  az cosmosdb create \
    --name accesslearn-dev \
    --resource-group accesslearn-dev-rg \
    --locations regionName=eastus failoverPriority=0 \
    --capabilities EnableServerless \
    --kind GlobalDocumentDB
  ```

- [ ] **Crear Azure Key Vault** (para secrets)
  ```bash
  az keyvault create \
    --name accesslearn-kv \
    --resource-group accesslearn-dev-rg \
    --location eastus
  ```

- [ ] **Guardar Connection String en Key Vault**
  ```bash
  # Obtener connection string
  COSMOS_CONN=$(az cosmosdb keys list \
    --name accesslearn-dev \
    --resource-group accesslearn-dev-rg \
    --type connection-strings \
    --query "connectionStrings[0].connectionString" -o tsv)
  
  # Guardar en Key Vault
  az keyvault secret set \
    --vault-name accesslearn-kv \
    --name cosmos-connection-string \
    --value "$COSMOS_CONN"
  ```

- [ ] **Crear Storage Account** (para blobs)
  ```bash
  az storage account create \
    --name accesslearnstorage \
    --resource-group accesslearn-dev-rg \
    --location eastus \
    --sku Standard_LRS
  ```

#### **Entregables Día 1-2:**
- ✅ Azure subscription activa
- ✅ Cosmos DB creado y accesible
- ✅ Connection strings guardadas
- ✅ Storage Account listo

**Tiempo:** 4-6 horas

---

### **Día 3-4: Backend Project Setup** 🛠️

#### **1. Crear Proyecto Backend**
```bash
cd /Users/marco.dominguez/Projects
mkdir accesslearn-backend
cd accesslearn-backend

# Inicializar proyecto
npm init -y

# Instalar dependencias
npm install \
  @azure/cosmos \
  @azure/identity \
  @azure/keyvault-secrets \
  @azure/storage-blob \
  express \
  cors \
  dotenv \
  zod \
  jsonwebtoken \
  bcryptjs

# Instalar dev dependencies
npm install -D \
  @types/node \
  @types/express \
  @types/cors \
  @types/jsonwebtoken \
  @types/bcryptjs \
  typescript \
  tsx \
  @azure/functions
```

#### **2. Configurar TypeScript**
```bash
npx tsc --init
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### **3. Estructura de Carpetas**
```bash
mkdir -p src/{config,middleware,repositories,services,types,utils}
mkdir -p src/functions
```

```
accesslearn-backend/
├── src/
│   ├── config/
│   │   ├── cosmos.ts          # Cosmos DB client
│   │   ├── keyvault.ts        # Key Vault client
│   │   └── storage.ts         # Blob Storage client
│   ├── middleware/
│   │   ├── tenant-resolver.ts # Tenant resolution
│   │   ├── auth.ts            # JWT validation
│   │   └── error-handler.ts   # Global error handler
│   ├── repositories/
│   │   ├── base.repository.ts
│   │   ├── user.repository.ts
│   │   ├── course.repository.ts
│   │   └── progress.repository.ts
│   ├── services/
│   │   ├── tenant.service.ts
│   │   ├── user.service.ts
│   │   └── auth.service.ts
│   ├── types/
│   │   ├── tenant.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── validators.ts
│   └── functions/           # Azure Functions
│       ├── users/
│       ├── courses/
│       └── tenants/
├── package.json
├── tsconfig.json
└── .env.example
```

#### **4. Crear Archivos Base**

**src/config/cosmos.ts:**
```typescript
import { CosmosClient, Database } from '@azure/cosmos';
import { getSecret } from './keyvault';

let client: CosmosClient | null = null;

export async function getCosmosClient(): Promise<CosmosClient> {
  if (!client) {
    const connectionString = await getSecret('cosmos-connection-string');
    client = new CosmosClient(connectionString);
  }
  return client;
}

export async function getTenantDatabase(tenantId: string): Promise<Database> {
  const client = await getCosmosClient();
  return client.database(`tenant-${tenantId}`);
}
```

**src/middleware/tenant-resolver.ts:**
```typescript
import { Request, Response, NextFunction } from 'express';
import { Database } from '@azure/cosmos';
import { getTenantDatabase } from '../config/cosmos';

export interface TenantRequest extends Request {
  tenantId: string;
  tenantDb: Database;
}

export async function resolveTenant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extraer tenant ID
    const subdomain = req.hostname.split('.')[0];
    const headerTenant = req.headers['x-tenant-id'] as string;
    const tenantId = headerTenant || subdomain;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }

    // Obtener database del tenant
    const tenantDb = await getTenantDatabase(tenantId);

    // Validar que existe
    try {
      await tenantDb.read();
    } catch {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Inyectar en request
    (req as TenantRequest).tenantId = tenantId;
    (req as TenantRequest).tenantDb = tenantDb;

    next();
  } catch (error) {
    next(error);
  }
}
```

**src/repositories/user.repository.ts:**
```typescript
import { Container } from '@azure/cosmos';

export class UserRepository {
  constructor(private container: Container) {}

  async findById(userId: string, tenantId: string) {
    const { resource } = await this.container
      .item(userId, tenantId)
      .read();
    return resource;
  }

  async findByEmail(email: string, tenantId: string) {
    const query = {
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.email = @email',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@email', value: email }
      ]
    };

    const { resources } = await this.container.items
      .query(query, { partitionKey: tenantId })
      .fetchAll();

    return resources[0] || null;
  }

  async create(user: any) {
    const { resource } = await this.container.items.create(user);
    return resource;
  }

  async update(userId: string, tenantId: string, updates: any) {
    const { resource } = await this.container
      .item(userId, tenantId)
      .replace(updates);
    return resource;
  }

  async list(tenantId: string, limit = 100) {
    const query = {
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
      parameters: [{ name: '@tenantId', value: tenantId }]
    };

    const { resources } = await this.container.items
      .query(query, { 
        partitionKey: tenantId,
        maxItemCount: limit 
      })
      .fetchAll();

    return resources;
  }
}
```

#### **Entregables Día 3-4:**
- ✅ Proyecto backend estructurado
- ✅ Cosmos DB client configurado
- ✅ Repositories base implementados
- ✅ Middleware de tenant resolution

**Tiempo:** 8-10 horas

---

### **Día 5-6: Primera API Funcional** 🎯

#### **1. Crear Azure Function: Get Users**

**src/functions/users/get-users.ts:**
```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getTenantDatabase } from '../../config/cosmos';
import { UserRepository } from '../../repositories/user.repository';

export async function getUsers(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return {
        status: 400,
        jsonBody: { error: 'Tenant ID required' }
      };
    }

    const database = await getTenantDatabase(tenantId);
    const container = database.container('users');
    const userRepo = new UserRepository(container);

    const users = await userRepo.list(tenantId);

    return {
      status: 200,
      jsonBody: { users }
    };
  } catch (error: any) {
    context.error('Error getting users:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' }
    };
  }
}

app.http('getUsers', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'users',
  handler: getUsers
});
```

#### **2. Crear Azure Function: Create User**

**src/functions/users/create-user.ts:**
```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getTenantDatabase } from '../../config/cosmos';
import { UserRepository } from '../../repositories/user.repository';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const CreateUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['admin', 'employee']),
  department: z.string().optional()
});

export async function createUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return {
        status: 400,
        jsonBody: { error: 'Tenant ID required' }
      };
    }

    // Parse body
    const body = await request.json();
    const validatedData = CreateUserSchema.parse(body);

    // Crear usuario
    const newUser = {
      id: randomUUID(),
      tenantId,
      type: 'user',
      ...validatedData,
      status: 'active',
      profile: {
        xp: 0,
        level: 1,
        rank: 'Novice',
        achievements: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const database = await getTenantDatabase(tenantId);
    const container = database.container('users');
    const userRepo = new UserRepository(container);

    const user = await userRepo.create(newUser);

    return {
      status: 201,
      jsonBody: { user }
    };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return {
        status: 400,
        jsonBody: { error: 'Validation error', details: error.errors }
      };
    }

    context.error('Error creating user:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' }
    };
  }
}

app.http('createUser', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'users',
  handler: createUser
});
```

#### **3. Crear Database y Containers en Cosmos DB**

**scripts/setup-tenant.ts:**
```typescript
import { CosmosClient } from '@azure/cosmos';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);

async function setupTenant(tenantId: string) {
  console.log(`Setting up tenant: ${tenantId}`);

  // Crear database
  const { database } = await client.databases.createIfNotExists({
    id: `tenant-${tenantId}`
  });

  console.log(`Database created: tenant-${tenantId}`);

  // Crear containers
  const containers = [
    {
      id: 'users',
      partitionKey: { paths: ['/tenantId'] },
      uniqueKeyPolicy: {
        uniqueKeys: [{ paths: ['/email'] }]
      }
    },
    {
      id: 'courses',
      partitionKey: { paths: ['/tenantId'] }
    },
    {
      id: 'progress',
      partitionKey: { paths: ['/tenantId'] }
    },
    {
      id: 'achievements',
      partitionKey: { paths: ['/tenantId'] }
    }
  ];

  for (const containerDef of containers) {
    await database.containers.createIfNotExists(containerDef);
    console.log(`Container created: ${containerDef.id}`);
  }

  console.log('Tenant setup completed!');
}

// Ejecutar
setupTenant('demo').catch(console.error);
```

Ejecutar:
```bash
npm run build
node dist/scripts/setup-tenant.js
```

#### **4. Probar las APIs**

**Crear .env:**
```bash
COSMOS_CONNECTION_STRING=<tu-connection-string>
AZURE_KEYVAULT_URL=https://accesslearn-kv.vault.azure.net/
```

**Iniciar Functions localmente:**
```bash
npm install -g azure-functions-core-tools@4
func start
```

**Probar con curl:**
```bash
# GET users
curl http://localhost:7071/api/users \
  -H "x-tenant-id: demo"

# POST user
curl -X POST http://localhost:7071/api/users \
  -H "x-tenant-id: demo" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@demo.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "employee",
    "department": "IT"
  }'
```

#### **Entregables Día 5-6:**
- ✅ Azure Functions configuradas
- ✅ 2 APIs funcionando (GET/POST users)
- ✅ Database + containers creados
- ✅ APIs probadas localmente

**Tiempo:** 8-10 horas

---

### **Día 7: Testing & Documentation** 📝

#### **Tareas:**
- [ ] Crear colección de Postman/Thunder Client
- [ ] Documentar APIs (OpenAPI/Swagger)
- [ ] Escribir tests básicos
- [ ] Crear README del backend

**Tiempo:** 4-6 horas

---

## 📅 SEMANA 2: Frontend Integration + Multi-Tenant

### **Día 8-9: Frontend HTTP Client** 🔌

#### **1. Crear API Client en Frontend**

**src/lib/api-client.ts:**
```typescript
import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private tenantId: string = 'demo'; // Default

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7071/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      config.headers['x-tenant-id'] = this.tenantId;
      
      const token = localStorage.getItem('auth-token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  setTenantId(tenantId: string) {
    this.tenantId = tenantId;
  }

  // Users
  async getUsers() {
    const response = await this.client.get('/users');
    return response.data;
  }

  async createUser(data: any) {
    const response = await this.client.post('/users', data);
    return response.data;
  }

  async getUserById(userId: string) {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  // Courses (to implement)
  async getCourses() {
    const response = await this.client.get('/courses');
    return response.data;
  }

  async createCourse(data: any) {
    const response = await this.client.post('/courses', data);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

#### **2. Crear Tenant Context**

**src/contexts/TenantContext.tsx:**
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface TenantContextType {
  tenantId: string;
  setTenantId: (id: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantIdState] = useState<string>('demo');

  useEffect(() => {
    // Detectar tenant desde subdomain
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    
    if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
      setTenantIdState(subdomain);
    }
  }, []);

  const setTenantId = (id: string) => {
    setTenantIdState(id);
    apiClient.setTenantId(id);
  };

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}
```

#### **3. Migrar primer hook: use-auth**

**src/hooks/use-auth-v2.ts:**
```typescript
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useTenant } from '@/contexts/TenantContext';

export function useAuthV2() {
  const { tenantId } = useTenant();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar sesión desde localStorage
    const savedSession = localStorage.getItem(`session-${tenantId}`);
    if (savedSession) {
      setSession(JSON.parse(savedSession));
    }
    setLoading(false);
  }, [tenantId]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { 
        email, 
        password 
      });
      
      const { user, token } = response.data;
      
      setSession(user);
      localStorage.setItem(`session-${tenantId}`, JSON.stringify(user));
      localStorage.setItem('auth-token', token);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(`session-${tenantId}`);
    localStorage.removeItem('auth-token');
  };

  return { session, login, logout, loading };
}
```

#### **4. Actualizar App.tsx**

```typescript
import { TenantProvider } from '@/contexts/TenantContext';

function App() {
  return (
    <TenantProvider>
      {/* resto de la app */}
    </TenantProvider>
  );
}
```

#### **Entregables Día 8-9:**
- ✅ API client configurado
- ✅ Tenant context implementado
- ✅ Primer hook migrado a APIs
- ✅ Frontend conectado al backend

**Tiempo:** 8-10 horas

---

### **Día 10-12: Testing End-to-End** 🧪

#### **Tareas:**
- [ ] Crear tenant "acme" en Cosmos DB
- [ ] Crear tenant "techstart" en Cosmos DB
- [ ] Probar flujo completo con ambos tenants
- [ ] Validar aislamiento de datos
- [ ] Probar branding por tenant
- [ ] Documentar bugs encontrados
- [ ] Fix critical bugs

#### **Entregables Día 10-12:**
- ✅ 2 tenants funcionando
- ✅ Datos aislados correctamente
- ✅ Branding por tenant OK
- ✅ Lista de bugs/mejoras

**Tiempo:** 12 horas

---

### **Día 13-14: Documentation & Presentation** 📊

#### **Tareas:**
- [ ] Crear presentación para stakeholders
- [ ] Grabar video demo
- [ ] Documentar arquitectura
- [ ] Crear guía de deployment
- [ ] Preparar estimaciones de costo
- [ ] Crear roadmap visual

**Tiempo:** 8 horas

---

## ✅ Checklist Final Semana 2

Al final de las 2 semanas debes tener:

- [x] Azure subscription configurada
- [x] Cosmos DB funcionando
- [x] Backend con 2+ APIs funcionales
- [x] Frontend conectado al backend
- [x] 2 tenants de prueba funcionando
- [x] Aislamiento de datos validado
- [x] Documentación básica
- [x] Demo grabado

---

## 🎯 Métricas de Éxito

- **APIs Response Time:** < 200ms
- **Frontend Load Time:** < 2s
- **Data Isolation:** 100% (sin data leakage)
- **Bugs Críticos:** 0
- **Code Coverage:** > 60%

---

## 🚨 Riesgos y Mitigaciones

### **Riesgo 1: No tienes acceso a Azure**
**Mitigación:** 
- Usar Azure Free Trial ($200 crédito)
- Usar Cosmos DB Emulator local para desarrollo

### **Riesgo 2: APIs muy lentas**
**Mitigación:**
- Usar partition keys correctamente
- Implementar caching
- Optimizar queries

### **Riesgo 3: Frontend roto después de migración**
**Mitigación:**
- Migrar hook por hook
- Mantener versión vieja mientras migras
- Tests E2E

---

## 📞 Próximos Pasos Después de 2 Semanas

Una vez completadas estas 2 semanas:

1. **Semana 3-4:** Migrar TODOS los hooks restantes
2. **Semana 5:** Implementar autenticación real (Azure AD B2C)
3. **Semana 6:** Tenant onboarding flow
4. **Semana 7-8:** Storage en Azure Blob
5. **Semana 9-10:** Testing & deployment a staging

---

## 💡 Consejos

1. **Documenta TODO** - Vas a olvidar cosas
2. **Git commits frecuentes** - No perder trabajo
3. **Testing manual constante** - No esperes al final
4. **Azure Portal Dashboard** - Monitor costos desde día 1
5. **Postman Collections** - Documenta APIs desde el inicio

---

**¿Listo para comenzar? 🚀**

Empieza por el **Día 1: Crear Azure Subscription**
