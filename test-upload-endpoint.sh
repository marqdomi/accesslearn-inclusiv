#!/bin/bash

# Script de diagnóstico para el endpoint de upload
# Uso: ./test-upload-endpoint.sh [BACKEND_URL]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Obtener URL del backend
if [ -z "$1" ]; then
    echo -e "${YELLOW}⚠️  No se proporcionó URL del backend${NC}"
    echo -e "${BLUE}Intentando obtenerla de Azure...${NC}"
    
    BACKEND_FQDN=$(az containerapp show \
        --name ca-accesslearn-backend-prod \
        --resource-group accesslearn-inclusiv-rg \
        --query "properties.configuration.ingress.fqdn" \
        -o tsv 2>/dev/null || echo "")
    
    if [ -z "$BACKEND_FQDN" ]; then
        echo -e "${RED}❌ No se pudo obtener la URL del backend${NC}"
        echo -e "${YELLOW}Por favor, proporciona la URL manualmente:${NC}"
        echo -e "  ./test-upload-endpoint.sh https://ca-accesslearn-backend-prod....azurecontainerapps.io"
        exit 1
    fi
else
    BACKEND_FQDN="$1"
fi

# Remover trailing slash si existe
BACKEND_FQDN="${BACKEND_FQDN%/}"

# Construir URLs base
BASE_URL="https://${BACKEND_FQDN}"
API_BASE="${BASE_URL}/api"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔍 Diagnóstico del Endpoint de Upload${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Backend URL:${NC} ${BASE_URL}"
echo -e "${YELLOW}API Base:${NC} ${API_BASE}"
echo ""

# Test 1: Health check
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 1: Health Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
HEALTH_URL="${BASE_URL}/health"
echo -e "GET ${HEALTH_URL}"
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${HEALTH_URL}" || echo "ERROR")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$HEALTH_RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Health check OK (${HTTP_CODE})${NC}"
    echo "$BODY" | head -5
else
    echo -e "${RED}❌ Health check FAILED (${HTTP_CODE})${NC}"
    echo "$BODY"
fi
echo ""

# Test 2: Verificar si el endpoint existe (sin auth)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 2: Verificar Endpoint /api/media/upload (sin auth)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
UPLOAD_URL="${API_BASE}/media/upload"
echo -e "POST ${UPLOAD_URL} (sin autenticación)"
UPLOAD_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "${UPLOAD_URL}" || echo "ERROR")
UPLOAD_HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
UPLOAD_BODY=$(echo "$UPLOAD_RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$UPLOAD_HTTP_CODE" = "401" ] || [ "$UPLOAD_HTTP_CODE" = "403" ]; then
    echo -e "${GREEN}✅ Endpoint existe (requiere autenticación) - ${UPLOAD_HTTP_CODE}${NC}"
    echo "$UPLOAD_BODY" | head -3
elif [ "$UPLOAD_HTTP_CODE" = "404" ]; then
    echo -e "${RED}❌ Endpoint NO existe (404)${NC}"
    echo "$UPLOAD_BODY" | head -10
elif [ "$UPLOAD_HTTP_CODE" = "405" ]; then
    echo -e "${YELLOW}⚠️  Método no permitido (405) - endpoint puede existir pero no acepta POST${NC}"
    echo "$UPLOAD_BODY" | head -3
else
    echo -e "${YELLOW}⚠️  Respuesta inesperada: ${UPLOAD_HTTP_CODE}${NC}"
    echo "$UPLOAD_BODY" | head -5
fi
echo ""

# Test 3: Verificar rutas disponibles (OPTIONS)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 3: Verificar Métodos Permitidos (OPTIONS)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
OPTIONS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X OPTIONS "${UPLOAD_URL}" -H "Access-Control-Request-Method: POST" || echo "ERROR")
OPTIONS_HTTP_CODE=$(echo "$OPTIONS_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
OPTIONS_HEADERS=$(curl -s -I -X OPTIONS "${UPLOAD_URL}" 2>/dev/null | grep -i "allow\|access-control" || echo "")

if [ ! -z "$OPTIONS_HEADERS" ]; then
    echo -e "${GREEN}✅ Métodos permitidos:${NC}"
    echo "$OPTIONS_HEADERS"
else
    echo -e "${YELLOW}⚠️  No se pudieron obtener métodos permitidos${NC}"
fi
echo ""

# Test 4: Verificar otras rutas de API
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 4: Verificar Otras Rutas de API${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
TEST_ENDPOINTS=(
    "/api/health"
    "/api/users/me"
    "/api/tenants"
)

for endpoint in "${TEST_ENDPOINTS[@]}"; do
    TEST_URL="${BASE_URL}${endpoint}"
    TEST_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "${TEST_URL}" 2>/dev/null || echo "ERROR")
    TEST_HTTP_CODE=$(echo "$TEST_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    
    if [ "$TEST_HTTP_CODE" = "200" ] || [ "$TEST_HTTP_CODE" = "401" ] || [ "$TEST_HTTP_CODE" = "403" ]; then
        echo -e "${GREEN}✅ ${endpoint} - ${TEST_HTTP_CODE}${NC}"
    elif [ "$TEST_HTTP_CODE" = "404" ]; then
        echo -e "${RED}❌ ${endpoint} - 404${NC}"
    else
        echo -e "${YELLOW}⚠️  ${endpoint} - ${TEST_HTTP_CODE}${NC}"
    fi
done
echo ""

# Resumen
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 Resumen${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Backend URL: ${BASE_URL}"
echo -e "Upload Endpoint: ${UPLOAD_URL}"
echo ""

if [ "$UPLOAD_HTTP_CODE" = "404" ]; then
    echo -e "${RED}❌ PROBLEMA DETECTADO: El endpoint /api/media/upload no existe en producción${NC}"
    echo ""
    echo -e "${YELLOW}Posibles causas:${NC}"
    echo -e "  1. El backend en producción no tiene el código más reciente"
    echo -e "  2. El endpoint no está desplegado o está comentado"
    echo -e "  3. La ruta está mal configurada"
    echo ""
    echo -e "${YELLOW}Soluciones:${NC}"
    echo -e "  1. Verificar que el backend tenga el endpoint en server.ts (línea ~2895)"
    echo -e "  2. Redesplegar el backend con el código más reciente"
    echo -e "  3. Verificar logs del backend en Azure Portal"
elif [ "$UPLOAD_HTTP_CODE" = "401" ] || [ "$UPLOAD_HTTP_CODE" = "403" ]; then
    echo -e "${GREEN}✅ El endpoint existe y está funcionando (requiere autenticación)${NC}"
    echo -e "${YELLOW}El problema puede ser:${NC}"
    echo -e "  1. Token de autenticación inválido o expirado"
    echo -e "  2. Permisos insuficientes (requiere tenant-admin o super-admin)"
    echo -e "  3. CORS bloqueando la petición"
else
    echo -e "${YELLOW}⚠️  Estado desconocido - revisar logs${NC}"
fi
echo ""

