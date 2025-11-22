#!/bin/bash
# Script para configurar GitHub Actions para CI/CD
# Uso: ./scripts/setup-github-actions.sh

set -e

echo "🔧 Configurando GitHub Actions para CI/CD"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
SUBSCRIPTION_ID="6ab56dbc-0375-45aa-a673-c007f5bd2a2d"
RESOURCE_GROUP="rg-accesslearn-prod"
SP_NAME="github-actions-accesslearn"
ACR_NAME="acr-accesslearn-prod"

echo "📋 Configuración:"
echo "  Subscription: $SUBSCRIPTION_ID"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Service Principal: $SP_NAME"
echo "  ACR: $ACR_NAME"
echo ""

# Verificar que Azure CLI está instalado
if ! command -v az &> /dev/null; then
    echo "❌ Error: Azure CLI no está instalado"
    echo "   Instala desde: https://aka.ms/InstallAzureCLI"
    exit 1
fi

# Verificar que estás logueado
echo "🔍 Verificando autenticación en Azure..."
if ! az account show &> /dev/null; then
    echo "⚠️  No estás autenticado en Azure CLI"
    echo "   Ejecutando: az login"
    az login
fi

# Seleccionar suscripción
echo "📝 Seleccionando suscripción..."
az account set --subscription "$SUBSCRIPTION_ID"
echo "✅ Suscripción seleccionada"
echo ""

# Verificar que el Service Principal no existe
echo "🔍 Verificando si Service Principal existe..."
EXISTING_SP=$(az ad sp list --display-name "$SP_NAME" --query "[0].appId" -o tsv 2>/dev/null || echo "")

if [ ! -z "$EXISTING_SP" ]; then
    echo "⚠️  Service Principal '$SP_NAME' ya existe"
    echo "   ¿Deseas eliminarlo y crear uno nuevo? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "🗑️  Eliminando Service Principal existente..."
        az ad sp delete --id "$EXISTING_SP" || echo "⚠️  No se pudo eliminar, continuando..."
    else
        echo "ℹ️  Usando Service Principal existente"
        SP_APP_ID="$EXISTING_SP"
    fi
fi

# Crear Service Principal si no existe
if [ -z "$SP_APP_ID" ]; then
    echo "📝 Creando Service Principal..."
    SP_OUTPUT=$(az ad sp create-for-rbac \
        --name "$SP_NAME" \
        --role contributor \
        --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
        --sdk-auth)
    
    echo ""
    echo "${GREEN}✅ Service Principal creado exitosamente${NC}"
    echo ""
    echo "📋 ${YELLOW}GUARDA ESTE JSON - Lo necesitarás para GitHub Secrets:${NC}"
    echo "$SP_OUTPUT" | jq .
    echo ""
    
    SP_APP_ID=$(echo "$SP_OUTPUT" | jq -r '.clientId')
fi

# Obtener credenciales de ACR
echo "🔍 Obteniendo credenciales de ACR..."
ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --query "username" -o tsv 2>/dev/null || echo "")
ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query "passwords[0].value" -o tsv 2>/dev/null || echo "")

if [ -z "$ACR_USERNAME" ] || [ -z "$ACR_PASSWORD" ]; then
    echo "⚠️  No se pudieron obtener credenciales de ACR"
    echo "   ACR: $ACR_NAME"
    echo "   Verifica que el ACR exista y esté activo"
    exit 1
fi

echo "${GREEN}✅ Credenciales de ACR obtenidas${NC}"
echo ""

# Resumen
echo "============================================================"
echo "📋 ${GREEN}RESUMEN DE CONFIGURACIÓN${NC}"
echo "============================================================"
echo ""
echo "1️⃣  ${YELLOW}Service Principal creado${NC}"
echo "   Name: $SP_NAME"
echo "   App ID: $SP_APP_ID"
echo ""
echo "2️⃣  ${YELLOW}Credenciales de ACR obtenidas${NC}"
echo "   Username: $ACR_USERNAME"
echo "   Password: ${ACR_PASSWORD:0:10}..."
echo ""
echo "============================================================"
echo "📝 ${YELLOW}PRÓXIMOS PASOS - Configurar GitHub Secrets:${NC}"
echo "============================================================"
echo ""
echo "1. Ir a: https://github.com/marqdomi/accesslearn-inclusiv/settings/secrets/actions"
echo ""
echo "2. Agregar los siguientes secrets:"
echo ""
echo "   ${GREEN}AZURE_CREDENTIALS${NC}:"
echo "   (El JSON completo que se mostró arriba)"
echo ""
echo "   ${GREEN}ACR_USERNAME${NC}:"
echo "   $ACR_USERNAME"
echo ""
echo "   ${GREEN}ACR_PASSWORD${NC}:"
echo "   $ACR_PASSWORD"
echo ""
echo "3. Verificar que los workflows estén en:"
echo "   - .github/workflows/deploy-production.yml"
echo "   - .github/workflows/test.yml"
echo ""
echo "4. Hacer un push a main para probar:"
echo "   git push origin main"
echo ""
echo "5. Verificar en: https://github.com/marqdomi/accesslearn-inclusiv/actions"
echo ""
echo "${GREEN}✅ Configuración local completada${NC}"
echo ""

