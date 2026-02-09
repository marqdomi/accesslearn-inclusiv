---
applyTo: '**'
---

# Azure Cost Guard — AccessLearn Inclusiv

## CRITICAL: This project generates ZERO revenue. Every Azure dollar matters.

### Golden Rule
**Before deploying ANY Azure resource or change, estimate the monthly cost impact and present it to the user for approval.**

---

## 1. Current Monthly Budget: $15 USD

A budget alert is configured at the resource group level (`rg-accesslearn-prod`) with email notifications at 50%, 80%, and 100% thresholds. Never exceed this budget without explicit user approval.

---

## 2. Pre-Deploy Cost Estimate (MANDATORY)

Before running `az deployment`, `bicep`, `az containerapp`, or any resource-creating command:

1. **List every resource** being created or modified
2. **Show estimated monthly cost** per resource using the table format below
3. **Show total estimated monthly cost**
4. **Wait for explicit user approval** before executing

### Cost Estimate Template
```
💰 ESTIMACIÓN DE COSTO AZURE
═══════════════════════════════════════════
| Recurso                | Tier/SKU       | Costo Est./Mes |
|------------------------|----------------|----------------|
| Container Apps Backend | Consumption    | ~$0 (idle)     |
| Cosmos DB Serverless   | Serverless     | ~$X.XX         |
| ...                    | ...            | ...            |
═══════════════════════════════════════════
| TOTAL ESTIMADO MENSUAL |                | ~$X.XX USD     |
═══════════════════════════════════════════
⚠️ Presupuesto actual: $15 USD/mes
✅ ¿Proceder con el deploy? (sí/no)
```

---

## 3. Approved Resource Tiers (Use ONLY these)

| Resource               | Tier/SKU                | Monthly Cost | Notes                         |
|------------------------|-------------------------|-------------|-------------------------------|
| Container Apps         | **Consumption** plan    | ~$0 idle    | minReplicas: 0 (scale to zero)|
| Container Registry     | **Basic** ($5/mo)       | ~$5         | Cheapest ACR tier             |
| Cosmos DB              | **Serverless**          | ~$0-3       | Pay per RU consumed only      |
| Blob Storage           | **Standard_LRS Hot**    | ~$0.02/GB   | Minimal data                  |
| Log Analytics          | **PerGB2018** (free 5GB)| ~$0         | Daily cap: 0.1 GB             |
| App Insights           | **Basic** (free 5GB)    | ~$0         | Daily cap: 0.1 GB, 30d retain|

### NEVER use these without explicit approval:
- Cosmos DB with **provisioned throughput** (RU/s) — this caused the $400 bill
- Container Apps with **minReplicas > 0** (always-on = ~$36+/mo per replica)
- Container Registry **Standard** or **Premium** ($20-50/mo)
- App Insights with retention > 30 days or no daily cap
- Log Analytics with no daily cap (dailyQuotaGb: -1)
- Any **Premium** or **Zone Redundant** features
- Azure App Service plans (use Container Apps Consumption instead)
- Azure SQL / Azure Database for PostgreSQL (use Cosmos DB Serverless)
- Azure Front Door, CDN, or Traffic Manager
- Any resource in a region other than **eastus** (cheapest US region)

---

## 4. Scaling Rules

| Resource        | Min  | Max | Scale Trigger            |
|-----------------|------|-----|--------------------------|
| Backend App     | 0    | 3   | 50 concurrent requests   |
| Frontend App    | 0    | 2   | 100 concurrent requests  |

- Never set `maxReplicas` above 3 for backend or 2 for frontend
- Always keep `minReplicas: 0` for scale-to-zero

---

## 5. Resource Cleanup Rules

- **Delete unused containers** in Cosmos DB if they have no data
- **Purge old ACR images** — keep only the 3 most recent tags per repository
- **Never create resources "just in case"** — create when actually needed
- **Review the DefaultResourceGroup-EUS** — contains `accesslearnmedia` storage (currently in use, keep)

---

## 6. Bicep Deployment Safety

When modifying `infra/main.bicep`:
- Always use `--what-if` flag before actual deployment: `az deployment group create --what-if`
- Review what-if output for any resource deletions or recreations
- Confirm no provisioned-throughput databases are being created
- Verify all `minReplicas` are set to 0
- Verify `enableFreeTier: false` on Cosmos DB (changing to true requires recreation)

---

## 7. CI/CD Cost Safety

The GitHub Actions pipeline (`.github/workflows/deploy.yml`) should:
- Only deploy on push to `main` (not on PRs)
- Use `--what-if` in a preview step before actual deployment
- Never run Bicep deployment automatically — only build + push images

---

## 8. Current Resource Inventory (Feb 2026)

**Resource Group: `rg-accesslearn-prod`** (eastus)
- `accesslearn-cosmos-serverless` — Cosmos DB Serverless (1 DB, 25 containers)
- `craccesslearnprodheqnzemqhoxru` — Container Registry Basic
- `cae-accesslearn-prod` — Container Apps Environment (Consumption)
- `ca-accesslearn-backend-prod` — Backend API (0.5 vCPU, 1Gi, scale 0-5→0-3)
- `ca-accesslearn-frontend-prod` — Frontend SPA (0.25 vCPU, 0.5Gi, scale 0-3→0-2)
- `log-accesslearn-prod` — Log Analytics (30d retention, 0.1 GB/day cap)
- `AP-insights-access-learn` — App Insights Basic (30d retention, 0.1 GB/day cap)

**DNS Architecture:**
- `kaido.kainet.mx` → Frontend Container App (primary domain)
- `app.kainet.mx` → Frontend Container App (legacy, 301 redirect to kaido.kainet.mx)
- `api.kainet.mx` → Backend Container App
- Tenant URLs: `kaido.kainet.mx/t/{slug}` (e.g., `/t/scientifica`, `/t/laboralmx`)
- Platform Admin: `kaido.kainet.mx/platform-admin`

**Resource Group: `DefaultResourceGroup-EUS`** (eastus)
- `accesslearnmedia` — Storage Account Standard_LRS Hot (6 blob containers, in use)

---

## 9. Monthly Cost Target Breakdown

| Resource               | Target Cost  |
|------------------------|-------------|
| Container Registry     | $5.00       |
| Cosmos DB Serverless   | $1-3.00     |
| Container Apps (idle)  | $0.00       |
| Container Apps (usage) | $0-2.00     |
| Storage                | $0.10       |
| Log Analytics          | $0.00       |
| App Insights           | $0.00       |
| **TOTAL TARGET**       | **$6-10 USD** |

---

## 10. Emergency: If Costs Spike

1. Check Azure Portal → Cost Management → Cost Analysis
2. Look for: provisioned DBs, always-on containers, uncapped log ingestion
3. Scale to zero: `az containerapp update --min-replicas 0`
4. Check Log Analytics cap: `az monitor log-analytics workspace show --query workspaceCapping`
5. Check App Insights cap: `az monitor app-insights component billing show`
