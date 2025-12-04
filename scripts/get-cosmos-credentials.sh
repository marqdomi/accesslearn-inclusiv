#!/bin/bash

# Script para obtener las credenciales de Azure Cosmos DB
# Uso: ./scripts/get-cosmos-credentials.sh

set -e

# Colores
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Obtener Credenciales Cosmos DB${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Configuración
COSMOS_ACCOUNT_NAME="accesslearn-cosmos-prod"
RESOURCE_GROUP="rg-accesslearn-prod"

# Verificar que Azure CLI está instalado
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Error: Azure CLI no está instalado${NC}"
    echo -e "   Instala desde: https://aka.ms/InstallAzureCLI"
    exit 1
fi

# Verificar que estás logueado en Azure
echo -e "${YELLOW}🔍 Verificando autenticación en Azure...${NC}"
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  No estás autenticado en Azure CLI${NC}"
    echo -e "   Ejecutando: az login"
    az login
fi

ACCOUNT_INFO=$(az account show)
SUBSCRIPTION_ID=$(echo $ACCOUNT_INFO | jq -r '.id')
SUBSCRIPTION_NAME=$(echo $ACCOUNT_INFO | jq -r '.name')

echo -e "${GREEN}✅ Autenticado en Azure${NC}"
echo -e "   Subscription: ${SUBSCRIPTION_NAME}"
echo -e "   ID: ${SUBSCRIPTION_ID}"
echo ""

# Verificar que el Cosmos DB account existe
echo -e "${YELLOW}🔍 Verificando que el Cosmos DB account existe...${NC}"
if ! az cosmosdb show --name "$COSMOS_ACCOUNT_NAME" --resource-group "$RESOURCE_GROUP" &> /dev/null; then
    echo -e "${RED}❌ Error: Cosmos DB account '$COSMOS_ACCOUNT_NAME' no encontrado en resource group '$RESOURCE_GROUP'${NC}"
    echo ""
    echo -e "${YELLOW}💡 Intenta listar los Cosmos DB accounts disponibles:${NC}"
    echo -e "   az cosmosdb list --output table"
    exit 1
fi

echo -e "${GREEN}✅ Cosmos DB account encontrado${NC}"
echo ""

# Obtener endpoint
echo -e "${YELLOW}📋 Obteniendo información de Cosmos DB...${NC}"
ENDPOINT=$(az cosmosdb show \
    --name "$COSMOS_ACCOUNT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query "documentEndpoint" -o tsv)

if [ -z "$ENDPOINT" ]; then
    echo -e "${RED}❌ Error: No se pudo obtener el endpoint${NC}"
    exit 1
fi

# Obtener primary key
PRIMARY_KEY=$(az cosmosdb keys list \
    --name "$COSMOS_ACCOUNT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --type keys \
    --query "primaryMasterKey" -o tsv)

if [ -z "$PRIMARY_KEY" ]; then
    echo -e "${RED}❌ Error: No se pudo obtener la primary key${NC}"
    exit 1
fi

# Listar databases disponibles
echo -e "${YELLOW}📦 Listando databases disponibles...${NC}"
DATABASES=$(az cosmosdb sql database list \
    --account-name "$COSMOS_ACCOUNT_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query "[].{Name:name}" -o tsv)

if [ -z "$DATABASES" ]; then
    echo -e "${YELLOW}⚠️  No se encontraron databases${NC}"
    DATABASE_NAME=""
else
    echo -e "${GREEN}Databases encontradas:${NC}"
    echo "$DATABASES" | nl
    echo ""
    # Usar la primera database o preguntar
    DATABASE_NAME=$(echo "$DATABASES" | head -n1)
fi

# Mostrar resultados
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Credenciales de Cosmos DB${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}✅ Endpoint:${NC}"
echo -e "   ${ENDPOINT}"
echo ""
echo -e "${GREEN}✅ Primary Key:${NC}"
echo -e "   ${PRIMARY_KEY:0:20}...${PRIMARY_KEY: -10}"
echo ""
if [ -n "$DATABASE_NAME" ]; then
    echo -e "${GREEN}✅ Database:${NC}"
    echo -e "   ${DATABASE_NAME}"
    echo ""
fi

# Crear archivo .env si no existe o mostrar instrucciones
ENV_FILE="./backend/.env"
ENV_FILE_ROOT="./.env"

echo -e "${YELLOW}📝 Variables de entorno necesarias:${NC}"
echo ""
echo "COSMOS_ENDPOINT=${ENDPOINT}"
echo "COSMOS_KEY=${PRIMARY_KEY}"
if [ -n "$DATABASE_NAME" ]; then
    echo "COSMOS_DATABASE=${DATABASE_NAME}"
else
    echo "COSMOS_DATABASE=accesslearn-db"
fi
echo ""

# Preguntar si quiere guardar en .env
if [ -f "$ENV_FILE" ] || [ -f "$ENV_FILE_ROOT" ]; then
    echo -e "${YELLOW}⚠️  Ya existe un archivo .env${NC}"
    echo -e "   ¿Deseas actualizar las variables de Cosmos DB? (s/n)"
    read -r response
    if [[ "$response" =~ ^[Ss]$ ]]; then
        # Actualizar .env
        if [ -f "$ENV_FILE" ]; then
            TARGET_FILE="$ENV_FILE"
        else
            TARGET_FILE="$ENV_FILE_ROOT"
        fi
        
        # Backup del archivo original
        cp "$TARGET_FILE" "${TARGET_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Actualizar o agregar variables (compatible con macOS y Linux)
        DB_NAME=${DATABASE_NAME:-"accesslearn-db"}
        
        # Crear archivo temporal con las nuevas variables
        TEMP_FILE=$(mktemp)
        
        # Procesar cada línea del archivo original
        while IFS= read -r line || [ -n "$line" ]; do
            if [[ "$line" =~ ^COSMOS_ENDPOINT= ]]; then
                echo "COSMOS_ENDPOINT=${ENDPOINT}"
            elif [[ "$line" =~ ^COSMOS_KEY= ]]; then
                echo "COSMOS_KEY=${PRIMARY_KEY}"
            elif [[ "$line" =~ ^COSMOS_DATABASE= ]]; then
                echo "COSMOS_DATABASE=${DB_NAME}"
            else
                echo "$line"
            fi
        done < "$TARGET_FILE" > "$TEMP_FILE"
        
        # Agregar variables que no existían
        if ! grep -q "^COSMOS_ENDPOINT=" "$TEMP_FILE"; then
            echo "COSMOS_ENDPOINT=${ENDPOINT}" >> "$TEMP_FILE"
        fi
        if ! grep -q "^COSMOS_KEY=" "$TEMP_FILE"; then
            echo "COSMOS_KEY=${PRIMARY_KEY}" >> "$TEMP_FILE"
        fi
        if ! grep -q "^COSMOS_DATABASE=" "$TEMP_FILE"; then
            echo "COSMOS_DATABASE=${DB_NAME}" >> "$TEMP_FILE"
        fi
        
        # Reemplazar archivo original
        mv "$TEMP_FILE" "$TARGET_FILE"
        
        echo -e "${GREEN}✅ Archivo .env actualizado${NC}"
        echo -e "   Backup guardado en: ${TARGET_FILE}.backup.*"
    fi
else
    echo -e "${YELLOW}💡 Para guardar estas credenciales en un archivo .env:${NC}"
    echo ""
    echo "   # Crear archivo .env en backend/"
    echo "   cat > backend/.env << EOF"
    echo "   COSMOS_ENDPOINT=${ENDPOINT}"
    echo "   COSMOS_KEY=${PRIMARY_KEY}"
    if [ -n "$DATABASE_NAME" ]; then
        echo "   COSMOS_DATABASE=${DATABASE_NAME}"
    else
        echo "   COSMOS_DATABASE=accesslearn-db"
    fi
    echo "   EOF"
    echo ""
fi

echo ""
echo -e "${GREEN}✅ Credenciales obtenidas exitosamente${NC}"
echo ""
echo -e "${YELLOW}📚 Próximos pasos:${NC}"
echo "   1. Configura las variables de entorno en tu archivo .env"
echo "   2. Ejecuta la migración:"
echo "      npx ts-node backend/src/scripts/seed-all-tenants-profiles.ts"
echo ""

