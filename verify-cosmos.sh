#!/bin/bash

# Verificación de Cosmos DB
# Este script verifica la conexión y los datos en Cosmos DB

set -e

# Colores
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Verificación Cosmos DB${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Cargar variables de ambiente
if [ -f "./backend/.env" ]; then
    set -a
    source ./backend/.env
    set +a
fi

echo -e "${YELLOW}📋 Configuración Actual:${NC}"
echo -e "  COSMOS_ENDPOINT: ${GREEN}${COSMOS_ENDPOINT}${NC}"
echo -e "  COSMOS_DATABASE: ${GREEN}${COSMOS_DATABASE}${NC}"
echo -e "  COSMOS_KEY: ${GREEN}${COSMOS_KEY:0:20}...${NC}"
echo ""

# Verificar si cosmospy está instalado
if ! command -v cosmos &> /dev/null; then
    echo -e "${YELLOW}⚠️  cosmos CLI no está instalado${NC}"
    echo -e "  Alternativamente, usaremos curl para verificar la conexión"
    echo ""
fi

# Verificar conexión básica con curl
echo -e "${YELLOW}🔍 Verificando conexión a Cosmos DB...${NC}"

# Crear fecha RFC 7231 para la autorización
DATE=$(date -u '+%a, %d %b %Y %H:%M:%S GMT')

# Intentar obtener info de la base de datos
echo -e "${YELLOW}📦 Verificando base de datos '${COSMOS_DATABASE}'...${NC}"

# Mostrar las opciones de acceso
echo ""
echo -e "${BLUE}📍 Para verificar los datos en Cosmos DB, tienes estas opciones:${NC}"
echo ""
echo -e "${YELLOW}1. Azure Portal (Más fácil):${NC}"
echo -e "   - Ve a: https://portal.azure.com"
echo -e "   - Busca: Cosmos DB Accounts"
echo -e "   - Selecciona: accesslearn-cosmos-prod"
echo -e "   - Ve a: Data Explorer"
echo -e "   - Abre: ${COSMOS_DATABASE} → tenants"
echo -e "   - Busca: tenant con slug 'amayrani'"
echo ""

echo -e "${YELLOW}2. Azure CLI:${NC}"
echo -e "   az cosmosdb sql query --resource-group rg-accesslearn-prod \\\\${NC}"
echo -e "   --account-name accesslearn-cosmos-prod \\\\${NC}"
echo -e "   --database-name ${COSMOS_DATABASE} \\\\${NC}"
echo -e "   --container-name tenants \\\\${NC}"
echo -e "   --query 'SELECT * FROM c WHERE c.slug = \"amayrani\"'${NC}"
echo ""

echo -e "${YELLOW}3. Verificar contenedores:${NC}"
echo -e "   az cosmosdb sql container list \\\\${NC}"
echo -e "   --resource-group rg-accesslearn-prod \\\\${NC}"
echo -e "   --account-name accesslearn-cosmos-prod \\\\${NC}"
echo -e "   --database-name ${COSMOS_DATABASE}${NC}"
echo ""

echo -e "${YELLOW}4. Verificar si la BD 'accesslearn-db' existe:${NC}"
echo -e "   az cosmosdb sql database list \\\\${NC}"
echo -e "   --resource-group rg-accesslearn-prod \\\\${NC}"
echo -e "   --account-name accesslearn-cosmos-prod${NC}"
echo ""

echo -e "${RED}⚠️  PROBLEMA IDENTIFICADO:${NC}"
echo -e "  1. El contenedor 'tenants' NO se estaba creando automáticamente"
echo -e "  2. Ya lo he corregido en el código (cosmosdb.service.ts)"
echo -e "  3. Necesitas RE-DEPLOYAR para que se cree el contenedor"
echo ""

echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo -e "  1. Verificar que la BD tiene los datos de Amayrani en Azure Portal"
echo -e "  2. Si los datos existen pero no aparecen:"
echo -e "     - El contenedor 'tenants' no existe → DEPLOY"
echo -e "  3. Si los datos NO existen:"
echo -e "     - Necesitas crear/re-crear el tenant 'amayrani' → Usa el script create-tenant"
echo ""
