# 🔧 Pasos Manuales para Optimización de Azure

Ya que Azure CLI tiene problemas de permisos desde Cursor, sigue estos pasos **manualmente desde tu Terminal**.

---

## 📋 Paso 1: Abrir Terminal

1. Abre **Terminal** (⌘ + Espacio, busca "Terminal")
2. Navega al proyecto:
```bash
cd ~/Projects/accesslearn-inclusiv
```

---

## 🔐 Paso 2: Autenticarse en Azure

```bash
# Login a Azure (abrirá el navegador)
az login
```

Esto abrirá una ventana del navegador. Sigue estos pasos:
1. Ingresa tus credenciales de Azure
2. Autoriza el acceso
3. Cierra la ventana del navegador
4. Vuelve a la terminal

**Verificar login:**
```bash
# Ver suscripciones disponibles
az account list --output table

# Ver suscripción actual
az account show --output table
```

**Si tienes múltiples suscripciones, selecciona la correcta:**
```bash
az account set --subscription "NOMBRE_O_ID_DE_TU_SUSCRIPCION"
```

---

## 📊 Paso 3: Auditoría de Recursos

Ejecuta estos comandos uno por uno:

### 3.1 Ver Grupos de Recursos
```bash
echo "📦 GRUPOS DE RECURSOS"
az group list --output table
```

### 3.2 Ver Todos los Recursos
```bash
echo "🔧 TODOS LOS RECURSOS"
az resource list --output table
```

### 3.3 Ver Recursos por Grupo
```bash
# Listar por cada grupo (ajusta los nombres según lo que veas arriba)
RESOURCE_GROUPS=$(az group list --query "[].name" -o tsv)

for RG in $RESOURCE_GROUPS; do
    echo ""
    echo "📁 Grupo: $RG"
    az resource list --resource-group "$RG" --output table
done
```

### 3.4 Ver Container Apps
```bash
echo "📦 CONTAINER APPS"
az containerapp list --output table
```

### 3.5 Ver Container Registries
```bash
echo "🐳 CONTAINER REGISTRIES"
az acr list --output table

# Ver repositorios en cada registry
for ACR in $(az acr list --query "[].name" -o tsv); do
    echo ""
    echo "Registry: $ACR"
    az acr repository list --name "$ACR" --output table
done
```

### 3.6 Ver Cosmos DB
```bash
echo "🌐 COSMOS DB"
az cosmosdb list --output table

# Ver databases en Cosmos DB
for COSMOS in $(az cosmosdb list --query "[].name" -o tsv); do
    RG=$(az cosmosdb list --query "[?name=='$COSMOS'].resourceGroup" -o tsv)
    echo ""
    echo "Cosmos DB: $COSMOS"
    az cosmosdb sql database list --account-name "$COSMOS" --resource-group "$RG" --output table
done
```

### 3.7 Ver Log Analytics
```bash
echo "📊 LOG ANALYTICS"
az monitor log-analytics workspace list --output table
```

### 3.8 Ver Costos (últimos 30 días)
```bash
echo "💰 COSTOS"
az consumption usage list \
  --start-date $(date -u -v-30d +%Y-%m-%d) \
  --end-date $(date -u +%Y-%m-%d) \
  --output table

# Resumen por servicio
az consumption usage list \
  --start-date $(date -u -v-30d +%Y-%m-%d) \
  --end-date $(date -u +%Y-%m-%d) \
  --query "[].{Service:instanceName,Cost:pretaxCost}" \
  --output table
```

**⚠️ Nota:** Los costos pueden tardar 24-48 horas en aparecer.

---

## 🔍 Paso 4: Identificar Recursos No Utilizados

### 4.1 Container Apps Detenidas
```bash
az containerapp list --query "[?properties.runningStatus!='Running'].{Name:name,Status:properties.runningStatus,ResourceGroup:resourceGroup}" --output table
```

### 4.2 Container Registries sin Repositorios
```bash
for ACR in $(az acr list --query "[].name" -o tsv); do
    REPO_COUNT=$(az acr repository list --name "$ACR" --query "length(@)" -o tsv)
    if [ "$REPO_COUNT" = "0" ]; then
        echo "⚠️  Registry vacío: $ACR"
    fi
done
```

### 4.3 Resource Groups Vacíos
```bash
for RG in $(az group list --query "[].name" -o tsv); do
    RESOURCE_COUNT=$(az resource list --resource-group "$RG" --query "length(@)" -o tsv)
    if [ "$RESOURCE_COUNT" = "0" ]; then
        echo "⚠️  Resource Group vacío: $RG"
    fi
done
```

---

## 🗑️ Paso 5: Eliminar Recursos No Utilizados

### ⚠️ IMPORTANTE: Haz backup antes de eliminar

### 5.1 Eliminar Container App (si está detenida)
```bash
# Reemplaza <app-name> y <resource-group> con los valores correctos
az containerapp delete \
  --name <app-name> \
  --resource-group <resource-group> \
  --yes
```

### 5.2 Eliminar Container Registry (si está vacío)
```bash
# Reemplaza <registry-name> y <resource-group>
az acr delete \
  --name <registry-name> \
  --resource-group <resource-group> \
  --yes
```

### 5.3 Eliminar Resource Group (si está vacío)
```bash
# Reemplaza <resource-group>
az group delete \
  --name <resource-group> \
  --yes \
  --no-wait
```

### 5.4 Limpiar Imágenes Antiguas en Container Registry
```bash
# Ver tags de un repositorio
az acr repository show-tags \
  --name <registry-name> \
  --repository <repo-name> \
  --orderby time_desc \
  --output table

# Eliminar tags antiguas (más de 30 días)
# Este comando es más complejo, hazlo con cuidado
```

---

## 💡 Paso 6: Optimizaciones

### 6.1 Reducir minReplicas de Container Apps

Si tu tráfico es bajo, puedes reducir las réplicas mínimas a 0:

```bash
# Ver configuración actual
az containerapp show \
  --name <app-name> \
  --resource-group <resource-group> \
  --query "properties.template.scale" \
  --output yaml

# Actualizar minReplicas a 0
az containerapp update \
  --name <app-name> \
  --resource-group <resource-group> \
  --min-replicas 0
```

**Ahorro estimado:** $10-30/mes

### 6.2 Verificar Tier Gratuito de Cosmos DB

```bash
# Ver información de Cosmos DB
az cosmosdb show \
  --name <cosmos-name> \
  --resource-group <resource-group> \
  --query "{Name:name,Kind:kind,Capabilities:capabilities}" \
  --output yaml
```

Verifica que:
- Esté en modo **Serverless** (si aplica)
- Aproveches los 25GB + 1000 RU/s gratis

---

## 🚀 Paso 7: Aplicar a Microsoft for Startups

### ¿Por qué?
- Hasta **$5,000 USD en créditos de Azure** por año
- Puede llegar a **$120,000 USD en 2 años** para startups seleccionadas

### Requisitos:
✅ Startup tecnológica  
✅ Menos de 10 años de operación  
✅ Menos de $50M USD en funding  
✅ Construyendo SaaS/software  

### Aplicar:
1. Ve a: https://www.microsoft.com/es/startups/
2. Haz clic en "Apply Now" o "Aplicar"
3. Completa el formulario con:
   - Información de tu startup (AccessLearn Inclusiv)
   - Descripción del producto (plataforma de aprendizaje multi-tenant)
   - Modelo de negocio (B2B2C)
   - Tracción actual (usuarios, clientes, etc.)

### Información para el Formulario:

**Nombre del producto:** AccessLearn Inclusiv  
**Categoría:** EdTech / SaaS  
**Descripción corta:**
> Plataforma de aprendizaje corporativo multi-tenant con gamificación, accesibilidad y cumplimiento normativo para el mercado mexicano.

**Tecnologías usadas:**
- Azure Container Apps
- Azure Cosmos DB
- React + TypeScript
- Node.js

**Caso de uso de Azure:**
- Hosting de aplicaciones (Container Apps)
- Base de datos (Cosmos DB)
- Container Registry
- Log Analytics & Monitoring

---

## 📊 Paso 8: Configurar Alertas de Presupuesto

### En Azure Portal:

1. Ve a: https://portal.azure.com
2. Busca "Cost Management + Billing"
3. Selecciona "Budgets" en el menú izquierdo
4. Haz clic en "+ Add"
5. Configura:
   - **Budget name:** Monthly Budget
   - **Amount:** $50 USD (ajusta según tu necesidad)
   - **Reset period:** Monthly
   - **Alerts:**
     - 50% del presupuesto
     - 75% del presupuesto
     - 90% del presupuesto
     - 100% del presupuesto

---

## 📋 Resumen de Comandos Esenciales

```bash
# Login
az login

# Ver recursos
az resource list --output table

# Ver costos
az consumption usage list \
  --start-date $(date -u -v-30d +%Y-%m-%d) \
  --end-date $(date -u +%Y-%m-%d) \
  --output table

# Ver suscripción
az account show --output table

# Ver grupos de recursos
az group list --output table

# Ver Container Apps
az containerapp list --output table

# Ver Cosmos DB
az cosmosdb list --output table

# Ver recomendaciones de Azure Advisor
az advisor recommendation list --category Cost --output table
```

---

## 🔗 Enlaces Importantes

- **Portal Azure:** https://portal.azure.com
- **Cost Management:** https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview
- **Resource Groups:** https://portal.azure.com/#view/HubsExtension/BrowseResourceGroups
- **Azure Advisor:** https://portal.azure.com/#view/Microsoft_Azure_Expert/AdvisorMenuBlade/~/overview
- **Microsoft for Startups:** https://www.microsoft.com/es/startups/
- **Servicios Gratuitos:** https://azure.microsoft.com/es-es/pricing/free-services/

---

## ✅ Checklist

Marca cada paso a medida que lo completes:

- [ ] Login a Azure (`az login`)
- [ ] Listar grupos de recursos
- [ ] Listar todos los recursos
- [ ] Identificar Container Apps
- [ ] Identificar Container Registries
- [ ] Identificar Cosmos DB
- [ ] Ver costos del último mes
- [ ] Identificar recursos no utilizados
- [ ] Eliminar recursos innecesarios
- [ ] Reducir minReplicas si es posible
- [ ] Aplicar a Microsoft for Startups
- [ ] Configurar alertas de presupuesto

---

## 💡 Siguiente Paso

**Empieza con:** `az login` en tu Terminal y sigue los pasos en orden.

**Si tienes dudas,** revisa la documentación completa en `docs/AZURE_COST_OPTIMIZATION.md`

