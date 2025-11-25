#!/bin/bash

# Test rápido del endpoint de upload
# Extrae la URL del error del navegador o úsala directamente

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Test Rápido del Endpoint de Upload${NC}"
echo ""

# Si se proporciona URL como argumento, usarla
if [ ! -z "$1" ]; then
    BACKEND_URL="$1"
else
    # Intentar obtener de Azure
    echo -e "${YELLOW}Intentando obtener URL del backend...${NC}"
    BACKEND_URL=$(az containerapp show \
        --name ca-accesslearn-backend-prod \
        --resource-group accesslearn-inclusiv-rg \
        --query "properties.configuration.ingress.fqdn" \
        -o tsv 2>/dev/null || echo "")
    
    if [ -z "$BACKEND_URL" ]; then
        echo -e "${RED}❌ No se pudo obtener la URL automáticamente${NC}"
        echo ""
        echo -e "${YELLOW}Por favor, proporciona la URL completa que ves en el error:${NC}"
        echo -e "  ${BLUE}Ejemplo:${NC} https://ca-accesslearn-backend-prod.gentlerock-167...eastus.azurecontainerapps.io"
        echo ""
        read -p "URL del backend: " BACKEND_URL
    fi
fi

# Remover https:// si está presente y trailing slash
BACKEND_URL="${BACKEND_URL#https://}"
BACKEND_URL="${BACKEND_URL#http://}"
BACKEND_URL="${BACKEND_URL%/}"

UPLOAD_URL="https://${BACKEND_URL}/api/media/upload"
HEALTH_URL="https://${BACKEND_URL}/health"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Backend:${NC} https://${BACKEND_URL}"
echo -e "${YELLOW}Upload Endpoint:${NC} ${UPLOAD_URL}"
echo ""

# Test 1: Health
echo -e "${BLUE}1. Health Check:${NC}"
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_URL}" 2>/dev/null || echo "000")
if [ "$HEALTH_CODE" = "200" ]; then
    echo -e "   ${GREEN}✅ OK (200)${NC}"
else
    echo -e "   ${RED}❌ FAILED (${HEALTH_CODE})${NC}"
fi
echo ""

# Test 2: Upload endpoint (sin auth - debería dar 401/403 si existe)
echo -e "${BLUE}2. Upload Endpoint (sin auth):${NC}"
UPLOAD_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${UPLOAD_URL}" 2>/dev/null || echo "000")
UPLOAD_BODY=$(curl -s -X POST "${UPLOAD_URL}" 2>/dev/null | head -3)

if [ "$UPLOAD_CODE" = "401" ] || [ "$UPLOAD_CODE" = "403" ]; then
    echo -e "   ${GREEN}✅ Endpoint EXISTE (${UPLOAD_CODE} - requiere auth)${NC}"
    echo -e "   ${YELLOW}El problema puede ser autenticación o permisos${NC}"
elif [ "$UPLOAD_CODE" = "404" ]; then
    echo -e "   ${RED}❌ Endpoint NO EXISTE (404)${NC}"
    echo -e "   ${YELLOW}El backend no tiene este endpoint desplegado${NC}"
    echo ""
    echo -e "   ${BLUE}Respuesta:${NC}"
    echo "$UPLOAD_BODY" | head -5
elif [ "$UPLOAD_CODE" = "405" ]; then
    echo -e "   ${YELLOW}⚠️  Método no permitido (405)${NC}"
else
    echo -e "   ${YELLOW}⚠️  Código: ${UPLOAD_CODE}${NC}"
    echo "$UPLOAD_BODY"
fi
echo ""

# Resumen
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ "$UPLOAD_CODE" = "404" ]; then
    echo -e "${RED}❌ CONCLUSIÓN: El endpoint /api/media/upload NO existe en producción${NC}"
    echo ""
    echo -e "${YELLOW}Acción requerida:${NC}"
    echo -e "  1. Verificar que backend/src/server.ts tenga el endpoint (línea ~2895)"
    echo -e "  2. Redesplegar el backend a producción"
    echo -e "  3. Verificar logs del backend en Azure Portal"
elif [ "$UPLOAD_CODE" = "401" ] || [ "$UPLOAD_CODE" = "403" ]; then
    echo -e "${GREEN}✅ CONCLUSIÓN: El endpoint existe${NC}"
    echo -e "${YELLOW}El problema es de autenticación/permisos o CORS${NC}"
fi
echo ""

