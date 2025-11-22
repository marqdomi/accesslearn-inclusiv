#!/bin/bash
# Script para configurar Application Insights en Azure Container Apps
# Uso: ./scripts/configure-app-insights-azure.sh

set -e

echo "🔧 Configurando Application Insights en Azure Container Apps..."
echo ""

CONTAINER_APP_NAME="ca-accesslearn-backend-prod"
RESOURCE_GROUP="rg-accesslearn-prod"
CONNECTION_STRING="InstrumentationKey=fb0cc223-bade-4ac7-a0dc-f87a248f57b9;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=981ff82c-0569-4e64-b722-533fa1d16ed8"

echo "Container App: $CONTAINER_APP_NAME"
echo "Resource Group: $RESOURCE_GROUP"
echo ""

# Verificar que Azure CLI está instalado
if ! command -v az &> /dev/null; then
    echo "❌ Error: Azure CLI no está instalado"
    echo "   Instala desde: https://aka.ms/InstallAzureCLI"
    exit 1
fi

# Verificar que estás logueado en Azure
echo "🔍 Verificando autenticación en Azure..."
if ! az account show &> /dev/null; then
    echo "⚠️  No estás autenticado en Azure CLI"
    echo "   Ejecutando: az login"
    az login
fi

# Verificar que el Container App existe
echo "🔍 Verificando que el Container App existe..."
if ! az containerapp show --name "$CONTAINER_APP_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
    echo "❌ Error: Container App '$CONTAINER_APP_NAME' no encontrado en resource group '$RESOURCE_GROUP'"
    exit 1
fi

echo "✅ Container App encontrado"
echo ""

# Configurar la variable de entorno
echo "📝 Configurando variable de entorno APPLICATIONINSIGHTS_CONNECTION_STRING..."
az containerapp update \
  --name "$CONTAINER_APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --set-env-vars APPLICATIONINSIGHTS_CONNECTION_STRING="$CONNECTION_STRING"

echo ""
echo "✅ Variable de entorno configurada exitosamente!"
echo ""
echo "⏳ El Container App se está reiniciando..."
echo "   Esto puede tardar 1-2 minutos"
echo ""
echo "🔍 Para verificar que funciona:"
echo "1. Ve a Azure Portal → Container Apps → $CONTAINER_APP_NAME"
echo "2. Ir a 'Log stream' (en el menú izquierdo)"
echo "3. Deberías ver: '✅ Application Insights initialized successfully'"
echo ""
echo "📊 Para ver métricas en tiempo real:"
echo "1. Ve a Application Insights → Live Metrics Stream"
echo "2. Haz requests a tu API: https://api.kainet.mx/api/health"
echo "3. Verás métricas apareciendo en tiempo real ✅"
echo ""

