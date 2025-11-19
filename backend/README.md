# AccessLearn Backend

Backend serverless multi-tenant SaaS LMS usando Azure Functions y Cosmos DB.

## 🚀 Setup

### Azure Resources Creados

✅ **Resource Group:** `rg-accesslearn-prod`  
✅ **Cosmos DB Account:** `accesslearn-cosmos-prod` (Serverless, West US 2)  
✅ **Database:** `accesslearn-db`  
✅ **Containers:**
- `courses` (partition key: `/tenantId`)
- `users` (partition key: `/tenantId`)
- `tenants` (partition key: `/id`)

## 🔐 Credenciales

⚠️ **IMPORTANTE:** Copia el archivo `.env.example` a `.env` y rellena con tus valores:

```bash
cp .env.example .env
```

Luego edita `.env` con tus credenciales de Cosmos DB:
- `COSMOS_ENDPOINT` - URL de tu cuenta Cosmos DB
- `COSMOS_KEY` - Primary key (NO compartir públicamente)
- `COSMOS_DATABASE` - Nombre de la database

**NUNCA hagas commit del archivo `.env` con credenciales reales.**

## 📦 Instalación

```bash
npm install
npm run build
```

## 🧪 Testing

```bash
# Development (hot reload)
npm run dev

# Production
npm run start
```

## 📁 Estructura

```
src/
├── functions/          # API endpoints
│   └── GetCourses.ts
├── services/           # Business logic
│   └── cosmosdb.service.ts
├── models/             # TypeScript interfaces
├── utils/              # Helper functions
└── index.ts            # Entry point
```

## 🔑 APIs Implementadas

1. **GetCourses** ✅ - Obtener cursos de un tenant
2. **CreateTenant** ✅ - Crear nuevo tenant (empresa cliente)
3. **GetTenantBySlug** ✅ - Buscar tenant por slug
4. **ListTenants** ✅ - Listar todos los tenants
5. **UpdateTenantStatus** ✅ - Activar/suspender/cancelar tenant

## 📝 Crear Tenant desde CLI

```bash
# Sintaxis
npm run create-tenant <slug> <nombre> <email> <plan>

# Ejemplo: Crear tenant demo
npm run create-tenant acme "ACME Corporation" admin@acme.com demo

# Ejemplo: Crear tenant profesional
npm run create-tenant techcorp "Tech Corp SA" tech@corp.com profesional
```

## 🔜 Próximas APIs

1. **GetUsers** - Obtener usuarios de un tenant
2. **CreateUser** - Crear nuevo usuario
3. **UpdateProgress** - Actualizar progreso de usuario
4. **GetCertificates** - Obtener certificados de usuario

## 📚 Documentación

Ver: `../ESTADO_ACTUAL_Y_ROADMAP.md` Fase 1 (Backend Foundation)

## ⚙️ Deployment

```bash
# Compilar
npm run build

# Deploy a Azure Functions
func azure functionapp publish accesslearn-func
```

## 🔗 Recursos

- [Cosmos DB JavaScript SDK](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/cosmosdb/cosmos)
- [Azure Functions TypeScript Guide](https://learn.microsoft.com/azure/azure-functions/functions-reference-node)
- [Multi-tenant SaaS Patterns](https://learn.microsoft.com/azure/architecture/guide/multitenant/overview)
