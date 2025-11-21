# Azure Container Apps Deployment Guide

This guide explains how to deploy AccessLearn Inclusiv to Azure Container Apps for production use.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Azure Cloud                         │
│                                                          │
│  ┌──────────────┐         ┌──────────────┐             │
│  │   Frontend   │         │   Backend    │             │
│  │ Container App│◄────────┤Container App │             │
│  │  (React +    │         │  (Node.js)   │             │
│  │   nginx)     │         │              │             │
│  └──────┬───────┘         └──────┬───────┘             │
│         │                        │                      │
│         │                        ├──► Cosmos DB         │
│         │                        ├──► Resend (Email)    │
│         │                        └──► Log Analytics     │
│         │                                                │
│  ┌──────┴───────────────────────────────────┐          │
│  │     Azure Container Registry (ACR)       │          │
│  │   - accesslearn-backend:latest           │          │
│  │   - accesslearn-frontend:latest          │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Components

### 1. Azure Container Registry (ACR)
- Stores Docker images for backend and frontend
- Basic tier ($5/month for 10GB storage)
- Private registry for secure image storage

### 2. Container Apps Environment
- Shared environment for both apps
- Includes Log Analytics workspace
- Managed networking and scaling

### 3. Backend Container App
- **Image**: Node.js 20 Alpine
- **Port**: 3000
- **Resources**: 0.5 CPU, 1GB RAM
- **Scaling**: 1-10 replicas based on load
- **Health checks**: `/health` endpoint

### 4. Frontend Container App
- **Image**: React + nginx Alpine
- **Port**: 8080
- **Resources**: 0.25 CPU, 0.5GB RAM
- **Scaling**: 1-5 replicas based on load
- **Health checks**: `/health` endpoint

## Prerequisites

1. **Azure CLI** installed and authenticated
   ```bash
   az login
   az account set --subscription "6ab56dbc-0375-45aa-a673-c007f5bd2a2d"
   ```

2. **Docker** installed and running
   ```bash
   docker --version
   # Should show: Docker version 20.10+ or higher
   ```

3. **Environment variables** configured in `backend/.env`:
   ```bash
   COSMOS_ENDPOINT=https://accesslearn-cosmos-prod.documents.azure.com:443/
   COSMOS_KEY=your-cosmos-key-here
   RESEND_API_KEY=re_E8vrV4gy_5Qja2b86Q6K3p8kXuaj98V5K
   EMAIL_FROM=newsletter@kainet.mx
   JWT_SECRET=your-secure-jwt-secret-here
   ```

## Deployment Steps

### Option 1: Automated Deployment (Recommended)

Run the deployment script:

```bash
./deploy.sh
```

This script will:
1. ✅ Validate resource group
2. ✅ Preview infrastructure changes (what-if)
3. ✅ Deploy Bicep template
4. ✅ Build Docker images
5. ✅ Push images to ACR
6. ✅ Deploy container apps
7. ✅ Test health endpoints

**Total time**: ~10-15 minutes

### Option 2: Manual Deployment

If you prefer manual control:

#### Step 1: Deploy Infrastructure

```bash
# Validate deployment
az deployment group what-if \
  --resource-group rg-accesslearn-prod \
  --template-file ./infra/main.bicep \
  --parameters ./infra/main.parameters.json

# Deploy
az deployment group create \
  --resource-group rg-accesslearn-prod \
  --template-file ./infra/main.bicep \
  --parameters ./infra/main.parameters.json
```

#### Step 2: Build and Push Images

```bash
# Get ACR name
ACR_NAME=$(az deployment group show \
  --resource-group rg-accesslearn-prod \
  --name main \
  --query 'properties.outputs.containerRegistryName.value' -o tsv)

# Login to ACR
az acr login --name $ACR_NAME

# Build and push backend
docker build -t $ACR_NAME.azurecr.io/accesslearn-backend:latest ./backend
docker push $ACR_NAME.azurecr.io/accesslearn-backend:latest

# Build and push frontend
docker build -t $ACR_NAME.azurecr.io/accesslearn-frontend:latest .
docker push $ACR_NAME.azurecr.io/accesslearn-frontend:latest
```

#### Step 3: Restart Container Apps

```bash
# Restart backend
az containerapp revision restart \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod

# Restart frontend
az containerapp revision restart \
  --name ca-accesslearn-frontend-prod \
  --resource-group rg-accesslearn-prod
```

## DNS Configuration

After deployment, configure DNS records in your domain registrar (kainet.mx):

### 1. Get FQDNs from deployment

```bash
# Backend FQDN
az containerapp show \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --query properties.configuration.ingress.fqdn -o tsv

# Frontend FQDN
az containerapp show \
  --name ca-accesslearn-frontend-prod \
  --resource-group rg-accesslearn-prod \
  --query properties.configuration.ingress.fqdn -o tsv
```

### 2. Create CNAME records

In your DNS provider (e.g., Cloudflare, GoDaddy):

| Type  | Name | Target | TTL |
|-------|------|--------|-----|
| CNAME | app  | `ca-accesslearn-frontend-prod.<region>.azurecontainerapps.io` | 300 |
| CNAME | api  | `ca-accesslearn-backend-prod.<region>.azurecontainerapps.io` | 300 |

### 3. Add custom domains to Container Apps

```bash
# Add custom domain to frontend
az containerapp hostname add \
  --name ca-accesslearn-frontend-prod \
  --resource-group rg-accesslearn-prod \
  --hostname app.kainet.mx

# Add custom domain to backend
az containerapp hostname add \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --hostname api.kainet.mx
```

### 4. Enable managed certificates (free SSL)

```bash
# Frontend certificate
az containerapp hostname bind \
  --name ca-accesslearn-frontend-prod \
  --resource-group rg-accesslearn-prod \
  --hostname app.kainet.mx \
  --environment ca-accesslearn-frontend-prod \
  --validation-method CNAME

# Backend certificate
az containerapp hostname bind \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --hostname api.kainet.mx \
  --environment ca-accesslearn-backend-prod \
  --validation-method CNAME
```

## Testing Deployment

### 1. Test Backend Health

```bash
# Using temporary FQDN
curl https://ca-accesslearn-backend-prod.<region>.azurecontainerapps.io/health

# Expected response:
{
  "status": "OK",
  "message": "AccessLearn Backend API",
  "timestamp": "2024-11-21T...",
  "environment": "production"
}
```

### 2. Test Frontend

```bash
# Using temporary FQDN
curl -I https://ca-accesslearn-frontend-prod.<region>.azurecontainerapps.io/

# Expected: HTTP/2 200
```

### 3. Test User Management Flow

1. Open frontend URL in browser
2. Login as admin: `dra.amayrani@hospital-ejemplo.com` / `Demo2024!`
3. Navigate to Users tab
4. Invite a new user
5. Check email delivery
6. Accept invitation
7. Login as new user

## Monitoring

### View Logs

```bash
# Backend logs
az containerapp logs show \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --follow

# Frontend logs
az containerapp logs show \
  --name ca-accesslearn-frontend-prod \
  --resource-group rg-accesslearn-prod \
  --follow
```

### View Metrics in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to resource group: `rg-accesslearn-prod`
3. Select Container App
4. View metrics: CPU, Memory, HTTP requests, Response time

### Log Analytics Queries

Access Log Analytics workspace to run KQL queries:

```kql
// All backend errors
ContainerAppConsoleLogs_CL
| where ContainerAppName_s == "ca-accesslearn-backend-prod"
| where Log_s contains "ERROR"
| order by TimeGenerated desc

// HTTP requests
ContainerAppSystemLogs_CL
| where ContainerAppName_s == "ca-accesslearn-backend-prod"
| where Log_s contains "HTTP"
| summarize count() by bin(TimeGenerated, 5m)
```

## Costs

### Estimated Monthly Costs (Production)

| Resource | Tier | Cost |
|----------|------|------|
| Container Registry | Basic | $5 |
| Backend Container App | 0.5 CPU, 1GB RAM, 1-10 replicas | $15-50 |
| Frontend Container App | 0.25 CPU, 0.5GB RAM, 1-5 replicas | $8-25 |
| Log Analytics | 5GB/month | $10 |
| Cosmos DB | Existing | $0 (already provisioned) |
| Resend Email | Free tier | $0 (3000 emails/month) |
| **Total** | | **$38-90/month** |

### Cost Optimization Tips

1. **Use consumption-based pricing** - Only pay for what you use
2. **Set minimum replicas to 0** during off-hours (dev/staging)
3. **Enable autoscaling** to scale down during low traffic
4. **Monitor Log Analytics ingestion** to avoid overage charges

## Troubleshooting

### Container Not Starting

```bash
# Check container logs
az containerapp logs show \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --tail 100

# Common issues:
# - Port mismatch (check Dockerfile EXPOSE vs app listening port)
# - Missing environment variables
# - Image not found in ACR
```

### Health Check Failing

```bash
# Check health endpoint directly
az containerapp exec \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --command "curl localhost:3000/health"
```

### Cannot Push to ACR

```bash
# Re-authenticate
az acr login --name <acr-name>

# Check credentials
az acr credential show --name <acr-name>
```

### High Costs

```bash
# Check replica count
az containerapp show \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --query properties.template.scale

# Reduce max replicas if needed
az containerapp update \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --max-replicas 5
```

## Updating Application

### Update Backend Code

```bash
# 1. Make code changes
# 2. Build new image
docker build -t <acr-name>.azurecr.io/accesslearn-backend:latest ./backend

# 3. Push to ACR
docker push <acr-name>.azurecr.io/accesslearn-backend:latest

# 4. Restart container app
az containerapp revision restart \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod
```

### Update Frontend Code

```bash
# Same process as backend
docker build -t <acr-name>.azurecr.io/accesslearn-frontend:latest .
docker push <acr-name>.azurecr.io/accesslearn-frontend:latest
az containerapp revision restart \
  --name ca-accesslearn-frontend-prod \
  --resource-group rg-accesslearn-prod
```

### Zero-Downtime Deployments

Container Apps supports blue-green deployments:

```bash
# Create new revision without activating
az containerapp update \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --image <acr-name>.azurecr.io/accesslearn-backend:v2 \
  --revision-suffix v2

# Test new revision
curl https://ca-accesslearn-backend-prod--v2.<region>.azurecontainerapps.io/health

# Switch traffic to new revision
az containerapp ingress traffic set \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --revision-weight ca-accesslearn-backend-prod--v2=100
```

## Security Considerations

### 1. Secrets Management

- ✅ Secrets stored as Container App secrets (encrypted at rest)
- ✅ No hardcoded credentials in code
- ✅ Environment variables injected at runtime
- ⚠️ Consider Azure Key Vault for enhanced security

### 2. Network Security

- ✅ HTTPS enforced (managed certificates)
- ✅ Private container registry
- ✅ No public endpoints except HTTPS ingress
- ⚠️ Consider Azure Private Link for Cosmos DB

### 3. Authentication

- ✅ JWT-based authentication
- ✅ Token expiration enforced
- ✅ Role-based access control (RBAC)
- ✅ Audit logging enabled

### 4. CORS Configuration

- ⚠️ Review CORS settings in production
- ⚠️ Restrict to specific domains (app.kainet.mx)

## Additional Resources

- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Container Apps Best Practices](https://learn.microsoft.com/azure/container-apps/best-practices)
- [Bicep Documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## Support

For issues or questions:
1. Check Azure Portal diagnostics
2. Review container logs
3. Check Application Insights (if enabled)
4. Contact: contacto@kainet.mx

---

**✅ Ready for Production Deployment!**

Run `./deploy.sh` to start the deployment process.
