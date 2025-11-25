#!/bin/bash

# Script para redesplegar el backend a producción
# Esto construirá una nueva imagen y la desplegará

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 Redesplegar Backend a Producción${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Variables
RESOURCE_GROUP="rg-accesslearn-prod"
BACKEND_APP="ca-accesslearn-backend-prod"
REGISTRY_NAME="craccesslearnprodheqnzemqhoxru"
REGISTRY_SERVER="${REGISTRY_NAME}.azurecr.io"

# Verificar que estamos autenticados en Azure
echo -e "${YELLOW}1. Verificando autenticación en Azure...${NC}"
if ! az account show &>/dev/null; then
    echo -e "${RED}❌ No estás autenticado en Azure${NC}"
    echo -e "${YELLOW}Ejecuta: az login${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Autenticado${NC}"
echo ""

# Verificar que Docker está corriendo
echo -e "${YELLOW}2. Verificando Docker...${NC}"
if ! docker info &>/dev/null; then
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker está corriendo${NC}"
echo ""

# Login a ACR
echo -e "${YELLOW}3. Iniciando sesión en Azure Container Registry...${NC}"
az acr login --name $REGISTRY_NAME
echo -e "${GREEN}✅ Login exitoso${NC}"
echo ""

# Build y push de la imagen
echo -e "${YELLOW}4. Construyendo imagen del backend...${NC}"
IMAGE_TAG="backend:$(date +%Y%m%d-%H%M%S)"
FULL_IMAGE="${REGISTRY_SERVER}/${IMAGE_TAG}"
LATEST_IMAGE="${REGISTRY_SERVER}/backend:latest"

docker build -t $FULL_IMAGE -t $LATEST_IMAGE ./backend
echo -e "${GREEN}✅ Imagen construida${NC}"
echo ""

echo -e "${YELLOW}5. Subiendo imagen a ACR...${NC}"
docker push $FULL_IMAGE
docker push $LATEST_IMAGE
echo -e "${GREEN}✅ Imagen subida${NC}"
echo ""

# Actualizar Container App
echo -e "${YELLOW}6. Actualizando Container App...${NC}"
az containerapp update \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --image $LATEST_IMAGE

echo -e "${GREEN}✅ Container App actualizado${NC}"
echo ""

# Esperar a que el backend esté listo
echo -e "${YELLOW}7. Esperando a que el backend esté listo...${NC}"
sleep 10

BACKEND_URL=$(az containerapp show \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" -o tsv)

echo -e "${BLUE}Backend URL: https://${BACKEND_URL}${NC}"
echo ""

# Health check
echo -e "${YELLOW}8. Verificando health check...${NC}"
for i in {1..10}; do
    if curl -f -s "https://${BACKEND_URL}/health" > /dev/null; then
        echo -e "${GREEN}✅ Health check OK${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Health check falló después de 10 intentos${NC}"
        exit 1
    fi
    echo "Intento $i/10 falló, reintentando en 5 segundos..."
    sleep 5
done
echo ""

# Verificar endpoint de upload
echo -e "${YELLOW}9. Verificando endpoint /api/media/upload...${NC}"
UPLOAD_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://${BACKEND_URL}/api/media/upload" || echo "000")

if [ "$UPLOAD_CODE" = "401" ] || [ "$UPLOAD_CODE" = "403" ]; then
    echo -e "${GREEN}✅ Endpoint existe (${UPLOAD_CODE} - requiere auth)${NC}"
elif [ "$UPLOAD_CODE" = "404" ]; then
    echo -e "${RED}❌ Endpoint aún no existe (404)${NC}"
    echo -e "${YELLOW}Espera unos minutos más y verifica nuevamente${NC}"
else
    echo -e "${YELLOW}⚠️  Código inesperado: ${UPLOAD_CODE}${NC}"
fi
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Redespliegue completado${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo -e "  1. Verificar que el endpoint funciona:"
echo -e "     ${BLUE}./quick-test-upload.sh https://${BACKEND_URL}${NC}"
echo -e "  2. Agregar AZURE_STORAGE_CONNECTION_STRING si falta"
echo -e "  3. Probar upload desde la UI"
echo ""

