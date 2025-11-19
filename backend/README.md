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

## 🔑 Próximas APIs a Implementar

1. **GetCourses** ✅ - Obtener cursos de un tenant
2. **CreateTenant** - Crear nuevo tenant
3. **GetUsers** - Obtener usuarios de un tenant
4. **CreateUser** - Crear nuevo usuario
5. **UpdateProgress** - Actualizar progreso de usuario
6. **GetCertificates** - Obtener certificados de usuario

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
