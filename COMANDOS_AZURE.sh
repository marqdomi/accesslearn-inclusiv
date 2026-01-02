#!/bin/bash

# ============================================
# COMANDOS DE AZURE - AUDITORÍA Y OPTIMIZACIÓN
# ============================================
# 
# Copia y pega estos comandos en tu Terminal
# Ejecútalos uno por uno para revisar y optimizar tus recursos

echo "🚀 Iniciando auditoría de Azure..."
echo ""

# ============================================
# 1. LOGIN Y CONFIGURACIÓN
# ============================================

echo "📋 PASO 1: Autenticación"
echo "========================"
echo ""
echo "Ejecuta: az login"
echo "Esto abrirá el navegador para autenticarte"
echo ""
read -p "Presiona Enter cuando hayas completado el login..."

# Verificar suscripción
echo ""
echo "📌 Suscripción actual:"
az account show --output table

echo ""
echo "📋 Todas las suscripciones disponibles:"
az account list --output table

echo ""
echo "💡 Para cambiar de suscripción, usa:"
echo "   az account set --subscription \"NOMBRE_O_ID\""
echo ""
read -p "Presiona Enter para continuar..."

# ============================================
# 2. AUDITORÍA DE RECURSOS
# ============================================

echo ""
echo "📦 PASO 2: Grupos de Recursos"
echo "============================="
echo ""
az group list --output table

echo ""
read -p "Presiona Enter para ver todos los recursos..."

echo ""
echo "🔧 PASO 3: Todos los Recursos"
echo "============================="
echo ""
az resource list --output table

echo ""
echo "📊 Contando recursos..."
TOTAL_RESOURCES=$(az resource list --query "length(@)" -o tsv)
echo "Total de recursos: $TOTAL_RESOURCES"

echo ""
read -p "Presiona Enter para ver Container Apps..."

# ============================================
# 3. RECURSOS ESPECÍFICOS
# ============================================

echo ""
echo "📦 PASO 4: Container Apps"
echo "========================="
echo ""
CONTAINER_APPS=$(az containerapp list --query "[].{Name:name,Status:properties.runningStatus,ResourceGroup:resourceGroup,CPU:properties.template.containers[0].resources.cpu,Memory:properties.template.containers[0].resources.memory}" --output table)

if [ -z "$CONTAINER_APPS" ]; then
    echo "No se encontraron Container Apps"
else
    echo "$CONTAINER_APPS"
fi

echo ""
read -p "Presiona Enter para ver Container Registries..."

echo ""
echo "🐳 PASO 5: Container Registries"
echo "==============================="
echo ""
ACR_LIST=$(az acr list --output table)

if [ -z "$ACR_LIST" ]; then
    echo "No se encontraron Container Registries"
else
    echo "$ACR_LIST"
    
    echo ""
    echo "📦 Repositorios por Registry:"
    for ACR in $(az acr list --query "[].name" -o tsv); do
        echo ""
        echo "Registry: $ACR"
        az acr repository list --name "$ACR" --output table 2>/dev/null || echo "  (vacío)"
    done
fi

echo ""
read -p "Presiona Enter para ver Cosmos DB..."

echo ""
echo "🌐 PASO 6: Cosmos DB"
echo "===================="
echo ""
COSMOS_LIST=$(az cosmosdb list --output table)

if [ -z "$COSMOS_LIST" ]; then
    echo "No se encontraron cuentas de Cosmos DB"
else
    echo "$COSMOS_LIST"
    
    echo ""
    echo "💾 Databases por cuenta:"
    for COSMOS in $(az cosmosdb list --query "[].name" -o tsv); do
        RG=$(az cosmosdb list --query "[?name=='$COSMOS'].resourceGroup" -o tsv)
        echo ""
        echo "Cosmos DB: $COSMOS"
        az cosmosdb sql database list --account-name "$COSMOS" --resource-group "$RG" --output table 2>/dev/null || echo "  (error al listar)"
    done
fi

echo ""
read -p "Presiona Enter para ver Log Analytics..."

echo ""
echo "📊 PASO 7: Log Analytics Workspaces"
echo "===================================="
echo ""
LOG_ANALYTICS=$(az monitor log-analytics workspace list --output table)

if [ -z "$LOG_ANALYTICS" ]; then
    echo "No se encontraron Log Analytics Workspaces"
else
    echo "$LOG_ANALYTICS"
fi

echo ""
read -p "Presiona Enter para ver costos..."

# ============================================
# 4. COSTOS
# ============================================

echo ""
echo "💰 PASO 8: Análisis de Costos"
echo "=============================="
echo ""
echo "⚠️  Nota: Los costos pueden tardar 24-48 horas en aparecer"
echo ""

# Costos de los últimos 30 días
echo "📊 Costos de los últimos 30 días:"
echo ""
az consumption usage list \
  --start-date $(date -u -v-30d +%Y-%m-%d 2>/dev/null || date -u -d '30 days ago' +%Y-%m-%d) \
  --end-date $(date -u +%Y-%m-%d) \
  --output table 2>/dev/null || echo "No hay datos de costos disponibles aún"

echo ""
read -p "Presiona Enter para ver recomendaciones de Azure Advisor..."

# ============================================
# 5. RECOMENDACIONES
# ============================================

echo ""
echo "💡 PASO 9: Recomendaciones de Azure Advisor"
echo "==========================================="
echo ""
az advisor recommendation list --category Cost --output table 2>/dev/null || echo "No hay recomendaciones disponibles o no tienes permisos"

echo ""
read -p "Presiona Enter para ver el resumen final..."

# ============================================
# 6. RESUMEN Y RECOMENDACIONES
# ============================================

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║         📋 RESUMEN DE AUDITORÍA            ║"
echo "╚════════════════════════════════════════════╝"
echo ""

RESOURCE_GROUPS=$(az group list --query "length(@)" -o tsv)
TOTAL_RESOURCES=$(az resource list --query "length(@)" -o tsv)
CONTAINER_APPS_COUNT=$(az containerapp list --query "length(@)" -o tsv 2>/dev/null || echo "0")
ACR_COUNT=$(az acr list --query "length(@)" -o tsv 2>/dev/null || echo "0")
COSMOS_COUNT=$(az cosmosdb list --query "length(@)" -o tsv 2>/dev/null || echo "0")

echo "📦 Grupos de recursos: $RESOURCE_GROUPS"
echo "🔧 Total de recursos: $TOTAL_RESOURCES"
echo "📦 Container Apps: $CONTAINER_APPS_COUNT"
echo "🐳 Container Registries: $ACR_COUNT"
echo "🌐 Cosmos DB cuentas: $COSMOS_COUNT"

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║       💡 RECOMENDACIONES                   ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Identificar recursos potencialmente no utilizados
echo "🔍 Recursos potencialmente no utilizados:"
echo ""

# Container Apps detenidas
STOPPED_APPS=$(az containerapp list --query "[?properties.runningStatus!='Running'].name" -o tsv 2>/dev/null)
if [ ! -z "$STOPPED_APPS" ]; then
    echo "⚠️  Container Apps detenidas:"
    for APP in $STOPPED_APPS; do
        echo "   - $APP"
    done
else
    echo "✅ No hay Container Apps detenidas"
fi

echo ""

# Container Registries vacíos
EMPTY_REGISTRIES=0
for ACR in $(az acr list --query "[].name" -o tsv 2>/dev/null); do
    REPO_COUNT=$(az acr repository list --name "$ACR" --query "length(@)" -o tsv 2>/dev/null || echo "0")
    if [ "$REPO_COUNT" = "0" ]; then
        EMPTY_REGISTRIES=$((EMPTY_REGISTRIES + 1))
        echo "⚠️  Container Registry vacío: $ACR"
    fi
done

if [ "$EMPTY_REGISTRIES" = "0" ]; then
    echo "✅ Todos los Container Registries tienen repositorios"
fi

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║       🎯 PRÓXIMOS PASOS                    ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "1. ✅ Revisa los recursos listados arriba"
echo "2. 🗑️  Elimina recursos no utilizados"
echo "3. 🚀 Aplica a Microsoft for Startups:"
echo "      https://www.microsoft.com/es/startups/"
echo "4. 💰 Configura alertas de presupuesto en:"
echo "      https://portal.azure.com/#view/Microsoft_Azure_CostManagement"
echo "5. 📊 Reduce minReplicas de Container Apps si el tráfico es bajo"
echo ""
echo "📖 Documentación completa: docs/AZURE_COST_OPTIMIZATION.md"
echo ""

# ============================================
# 7. COMANDOS ÚTILES DE REFERENCIA
# ============================================

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║       📚 COMANDOS ÚTILES                   ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Ver suscripción actual:"
echo "  az account show"
echo ""
echo "Cambiar suscripción:"
echo "  az account set --subscription \"NOMBRE_O_ID\""
echo ""
echo "Ver todos los recursos:"
echo "  az resource list --output table"
echo ""
echo "Ver costos:"
echo "  az consumption usage list --start-date YYYY-MM-DD --end-date YYYY-MM-DD"
echo ""
echo "Eliminar Container App:"
echo "  az containerapp delete --name <name> --resource-group <rg> --yes"
echo ""
echo "Eliminar Container Registry:"
echo "  az acr delete --name <name> --resource-group <rg> --yes"
echo ""
echo "Eliminar Resource Group:"
echo "  az group delete --name <rg> --yes --no-wait"
echo ""
echo "Actualizar Container App (reducir minReplicas):"
echo "  az containerapp update --name <name> --resource-group <rg> --min-replicas 0"
echo ""

echo "✅ Auditoría completada!"
echo ""

