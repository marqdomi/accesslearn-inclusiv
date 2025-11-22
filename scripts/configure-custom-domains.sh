#!/bin/bash
# Script para configurar dominios personalizados en Azure Container Apps
# Uso: ./scripts/configure-custom-domains.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Configuración de Dominios Personalizados  ${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Configuration
RESOURCE_GROUP="rg-accesslearn-prod"
FRONTEND_APP="ca-accesslearn-frontend-prod"
BACKEND_APP="ca-accesslearn-backend-prod"
FRONTEND_DOMAIN="app.kainet.mx"
BACKEND_DOMAIN="api.kainet.mx"

# Step 1: Get verification IDs
echo -e "${YELLOW}📋 Paso 1: Obteniendo IDs de verificación...${NC}"
FRONTEND_VERIFICATION_ID=$(az containerapp show \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query "properties.customDomainVerificationId" -o tsv)

BACKEND_VERIFICATION_ID=$(az containerapp show \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query "properties.customDomainVerificationId" -o tsv)

if [ -z "$FRONTEND_VERIFICATION_ID" ] || [ -z "$BACKEND_VERIFICATION_ID" ]; then
  echo -e "${RED}❌ Error: No se pudieron obtener los IDs de verificación${NC}"
  exit 1
fi

echo -e "${GREEN}✅ IDs de verificación obtenidos${NC}"
echo ""
echo -e "${BLUE}📝 Configura estos registros TXT en GoDaddy:${NC}"
echo ""
echo -e "${YELLOW}Registro 1 (Frontend):${NC}"
echo -e "  Tipo: ${GREEN}TXT${NC}"
echo -e "  Nombre: ${GREEN}asuid.app${NC}"
echo -e "  Valor: ${GREEN}$FRONTEND_VERIFICATION_ID${NC}"
echo -e "  TTL: ${GREEN}600${NC}"
echo ""
echo -e "${YELLOW}Registro 2 (Backend):${NC}"
echo -e "  Tipo: ${GREEN}TXT${NC}"
echo -e "  Nombre: ${GREEN}asuid.api${NC}"
echo -e "  Valor: ${GREEN}$BACKEND_VERIFICATION_ID${NC}"
echo -e "  TTL: ${GREEN}600${NC}"
echo ""

# Get FQDNs
FRONTEND_FQDN=$(az containerapp show \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" -o tsv)

BACKEND_FQDN=$(az containerapp show \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" -o tsv)

echo -e "${BLUE}📝 Después de agregar los TXT, configura estos registros CNAME:${NC}"
echo ""
echo -e "${YELLOW}Registro 3 (Frontend CNAME):${NC}"
echo -e "  Tipo: ${GREEN}CNAME${NC}"
echo -e "  Nombre: ${GREEN}app${NC}"
echo -e "  Valor: ${GREEN}$FRONTEND_FQDN${NC}"
echo -e "  TTL: ${GREEN}600${NC}"
echo ""
echo -e "${YELLOW}Registro 4 (Backend CNAME):${NC}"
echo -e "  Tipo: ${GREEN}CNAME${NC}"
echo -e "  Nombre: ${GREEN}api${NC}"
echo -e "  Valor: ${GREEN}$BACKEND_FQDN${NC}"
echo -e "  TTL: ${GREEN}600${NC}"
echo ""

# Wait for user confirmation
echo -e "${YELLOW}⏳ Espera a que los registros DNS se propaguen (15-30 minutos)${NC}"
echo -e "${YELLOW}   Puedes verificar con: dig TXT asuid.app.kainet.mx${NC}"
echo ""
read -p "¿Ya configuraste los registros DNS en GoDaddy y esperaste la propagación? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}⏸️  Ejecuta este script nuevamente cuando hayas configurado DNS${NC}"
  exit 0
fi

# Step 2: Verify DNS propagation
echo -e "${YELLOW}🔍 Paso 2: Verificando propagación DNS...${NC}"
FRONTEND_TXT=$(dig +short TXT asuid.app.kainet.mx | tr -d '"' || echo "")
BACKEND_TXT=$(dig +short TXT asuid.api.kainet.mx | tr -d '"' || echo "")

if [ -z "$FRONTEND_TXT" ] || [ "$FRONTEND_TXT" != "$FRONTEND_VERIFICATION_ID" ]; then
  echo -e "${RED}⚠️  Advertencia: El registro TXT de frontend no se encuentra o no coincide${NC}"
  echo -e "${YELLOW}   Valor esperado: $FRONTEND_VERIFICATION_ID${NC}"
  echo -e "${YELLOW}   Valor encontrado: $FRONTEND_TXT${NC}"
  echo -e "${YELLOW}   Puede que necesites esperar más tiempo para la propagación DNS${NC}"
  read -p "¿Continuar de todas formas? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
  fi
fi

if [ -z "$BACKEND_TXT" ] || [ "$BACKEND_TXT" != "$BACKEND_VERIFICATION_ID" ]; then
  echo -e "${RED}⚠️  Advertencia: El registro TXT de backend no se encuentra o no coincide${NC}"
  echo -e "${YELLOW}   Valor esperado: $BACKEND_VERIFICATION_ID${NC}"
  echo -e "${YELLOW}   Valor encontrado: $BACKEND_TXT${NC}"
  echo -e "${YELLOW}   Puede que necesites esperar más tiempo para la propagación DNS${NC}"
  read -p "¿Continuar de todas formas? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
  fi
fi

echo -e "${GREEN}✅ Verificación DNS completada${NC}"
echo ""

# Step 3: Add custom domains
echo -e "${YELLOW}🌐 Paso 3: Agregando dominios personalizados en Azure...${NC}"

echo -e "${BLUE}Agregando $FRONTEND_DOMAIN al frontend...${NC}"
az containerapp hostname add \
  --hostname $FRONTEND_DOMAIN \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP || {
    echo -e "${RED}❌ Error agregando dominio del frontend${NC}"
    exit 1
  }

echo -e "${BLUE}Agregando $BACKEND_DOMAIN al backend...${NC}"
az containerapp hostname add \
  --hostname $BACKEND_DOMAIN \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP || {
    echo -e "${RED}❌ Error agregando dominio del backend${NC}"
    exit 1
  }

echo -e "${GREEN}✅ Dominios agregados${NC}"
echo ""

# Step 4: Update frontend environment variable
echo -e "${YELLOW}🔄 Paso 4: Actualizando variable de entorno del frontend...${NC}"
az containerapp update \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars "VITE_API_URL=https://$BACKEND_DOMAIN" || {
    echo -e "${RED}❌ Error actualizando variable de entorno${NC}"
    exit 1
  }

echo -e "${GREEN}✅ Variable de entorno actualizada${NC}"
echo ""

# Step 5: Restart frontend to apply new config
echo -e "${YELLOW}🔄 Paso 5: Reiniciando frontend para aplicar nueva configuración...${NC}"
LATEST_REVISION=$(az containerapp revision list \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query "[?properties.active].name" -o tsv | head -1)

az containerapp revision restart \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --revision $LATEST_REVISION || {
    echo -e "${RED}❌ Error reiniciando frontend${NC}"
    exit 1
  }

echo -e "${GREEN}✅ Frontend reiniciado${NC}"
echo ""

# Step 6: Verify configuration
echo -e "${YELLOW}✅ Paso 6: Verificando configuración...${NC}"
echo ""
echo -e "${BLUE}Hostnames configurados:${NC}"
az containerapp hostname list \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query "[].{name:name, bindingType:bindingType, certificateId:certificateId}" -o table

echo ""
az containerapp hostname list \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query "[].{name:name, bindingType:bindingType, certificateId:certificateId}" -o table

echo ""
echo -e "${GREEN}✅ Configuración completada!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos pasos:${NC}"
echo -e "  1. Espera 5-10 minutos para que Azure genere los certificados SSL"
echo -e "  2. Prueba los dominios:"
echo -e "     - Frontend: ${GREEN}https://$FRONTEND_DOMAIN${NC}"
echo -e "     - Backend: ${GREEN}https://$BACKEND_DOMAIN/api/health${NC}"
echo ""
echo -e "${YELLOW}⚠️  Nota: Los certificados SSL pueden tardar hasta 24 horas en generarse${NC}"

