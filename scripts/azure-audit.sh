#!/bin/bash

# Script de auditoría de recursos y costos de Azure
# Uso: ./scripts/azure-audit.sh

set -e

echo "🔍 Azure Resource & Cost Audit"
echo "================================"
echo ""

# Verificar si está autenticado
if ! az account show &> /dev/null; then
    echo "❌ No estás autenticado en Azure."
    echo "🔐 Ejecuta primero: ./scripts/azure-login.sh"
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)

echo "📌 Suscripción: $SUBSCRIPTION_NAME"
echo "🆔 ID: $SUBSCRIPTION_ID"
echo ""

# 1. Listar todos los grupos de recursos
echo "📦 GRUPOS DE RECURSOS"
echo "===================="
az group list --output table
echo ""

# 2. Listar todos los recursos por grupo
echo "🔧 RECURSOS POR GRUPO"
echo "===================="
RESOURCE_GROUPS=$(az group list --query "[].name" -o tsv)

TOTAL_RESOURCES=0
for RG in $RESOURCE_GROUPS; do
    echo ""
    echo "📁 Grupo: $RG"
    RESOURCES=$(az resource list --resource-group "$RG" --output table 2>/dev/null || echo "")
    if [ -z "$RESOURCES" ]; then
        echo "   (vacío o sin permisos)"
    else
        COUNT=$(az resource list --resource-group "$RG" --query "length(@)" -o tsv)
        TOTAL_RESOURCES=$((TOTAL_RESOURCES + COUNT))
        echo "$RESOURCES"
    fi
done

echo ""
echo "📊 Total de recursos: $TOTAL_RESOURCES"
echo ""

# 3. Costos del mes actual (últimos 7 días)
echo "💰 COSTOS (Últimos 7 días)"
echo "=========================="
echo ""
echo "⚠️  Nota: Los costos pueden tardar hasta 24-48 horas en aparecer"
echo ""

# Intentar obtener costos (puede fallar si no hay datos aún)
COST_DATA=$(az consumption usage list --start-date "$(date -u -d '7 days ago' +%Y-%m-%d)" --end-date "$(date -u +%Y-%m-%d)" --query "[].{Date:usageDate,Service:instanceName,Cost:pretaxCost}" -o table 2>/dev/null || echo "")

if [ -z "$COST_DATA" ]; then
    echo "ℹ️  No hay datos de costos disponibles aún."
    echo "   Revisa en el portal: https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview"
else
    echo "$COST_DATA"
fi

echo ""

# 4. Recursos potencialmente no utilizados
echo "🔍 RECURSOS POTENCIALMENTE INACTIVOS"
echo "===================================="
echo ""
echo "⚠️  Revisa estos recursos manualmente:"
echo ""

for RG in $RESOURCE_GROUPS; do
    # Container Apps detenidas
    CONTAINER_APPS=$(az containerapp list --resource-group "$RG" --query "[?properties.runningStatus!='Running'].{Name:name,Status:properties.runningStatus}" -o table 2>/dev/null || echo "")
    if [ ! -z "$CONTAINER_APPS" ]; then
        echo "📦 Container Apps detenidas en $RG:"
        echo "$CONTAINER_APPS"
        echo ""
    fi
    
    # Storage accounts sin actividad reciente (últimos 30 días)
    STORAGE_ACCOUNTS=$(az storage account list --resource-group "$RG" --query "[].name" -o tsv 2>/dev/null || echo "")
    if [ ! -z "$STORAGE_ACCOUNTS" ]; then
        echo "💾 Storage Accounts en $RG:"
        for SA in $STORAGE_ACCOUNTS; do
            echo "   - $SA"
        done
        echo ""
    fi
done

# 5. Recomendaciones de Azure Advisor
echo "💡 RECOMENDACIONES DE AZURE ADVISOR"
echo "==================================="
echo ""
echo "Obteniendo recomendaciones de costo..."
echo ""

ADVISOR_RECOMMENDATIONS=$(az advisor recommendation list --category Cost --query "[].{Name:shortDescription.solution,Impact:impact,Category:category}" -o table 2>/dev/null || echo "")

if [ -z "$ADVISOR_RECOMMENDATIONS" ]; then
    echo "ℹ️  No hay recomendaciones disponibles aún o no tienes permisos."
    echo "   Revisa manualmente en: https://portal.azure.com/#view/Microsoft_Azure_Expert/AdvisorMenuBlade/~/overview"
else
    echo "$ADVISOR_RECOMMENDATIONS"
fi

echo ""

# 6. Resumen de servicios gratuitos disponibles
echo "🎁 SERVICIOS GRATUITOS DISPONIBLES"
echo "==================================="
echo ""
echo "Azure ofrece servicios gratuitos que podrías estar usando:"
echo ""
echo "✅ Cosmos DB:"
echo "   - Primeros 25 GB de almacenamiento gratis/mes"
echo "   - Primeros 1000 RU/s gratis/mes"
echo "   - Verifica: az cosmosdb list --query \"[].{Name:name,Kind:kind}\" -o table"
echo ""
echo "✅ Container Registry:"
echo "   - Basic tier: $5/mes (10GB storage)"
echo "   - Considera eliminar si no lo usas activamente"
echo ""
echo "✅ Log Analytics:"
echo "   - Primeros 5 GB de datos de ingesta gratis/mes"
echo "   - Retención de 30 días incluida"
echo ""
echo "✅ Application Insights:"
echo "   - Primeros 5 GB de telemetría gratis/mes"
echo ""
echo "📚 Más información: https://azure.microsoft.com/es-es/pricing/free-services/"
echo ""

# 7. Resumen final
echo "📋 RESUMEN"
echo "=========="
echo ""
echo "✅ Grupos de recursos encontrados: $(echo $RESOURCE_GROUPS | wc -w | tr -d ' ')"
echo "✅ Total de recursos: $TOTAL_RESOURCES"
echo ""
echo "🔗 Enlaces útiles:"
echo "   - Portal Azure: https://portal.azure.com"
echo "   - Cost Management: https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview"
echo "   - Resource Groups: https://portal.azure.com/#view/HubsExtension/BrowseResourceGroups"
echo "   - Advisor: https://portal.azure.com/#view/Microsoft_Azure_Expert/AdvisorMenuBlade/~/overview"
echo ""
echo "📖 Revisa docs/AZURE_COST_OPTIMIZATION.md para más recomendaciones"
echo ""

