#!/bin/bash

# Script para verificar que la última versión esté en producción

RESOURCE_GROUP="rg-accesslearn-prod"
BACKEND_APP="ca-accesslearn-backend-prod"
FRONTEND_APP="ca-accesslearn-frontend-prod"

echo "🔍 Verificando estado del deployment en Azure..."
echo ""

# Verificar última revisión del backend
echo "📦 BACKEND (${BACKEND_APP}):"
BACKEND_REVISION=$(az containerapp revision list \
  --name "${BACKEND_APP}" \
  --resource-group "${RESOURCE_GROUP}" \
  --query "[0].{name:name, active:properties.active, createdTime:properties.createdTime, trafficWeight:properties.trafficWeight}" \
  -o json)

echo "${BACKEND_REVISION}" | jq -r '.name' | head -1 | xargs -I {} echo "  Revisión: {}"
echo "${BACKEND_REVISION}" | jq -r '.active' | head -1 | xargs -I {} echo "  Activa: {}"
echo "${BACKEND_REVISION}" | jq -r '.createdTime' | head -1 | xargs -I {} echo "  Creada: {}"
echo "${BACKEND_REVISION}" | jq -r '.trafficWeight' | head -1 | xargs -I {} echo "  Tráfico: {}%"

echo ""
echo "📦 FRONTEND (${FRONTEND_APP}):"
FRONTEND_REVISION=$(az containerapp revision list \
  --name "${FRONTEND_APP}" \
  --resource-group "${RESOURCE_GROUP}" \
  --query "[0].{name:name, active:properties.active, createdTime:properties.createdTime, trafficWeight:properties.trafficWeight}" \
  -o json)

echo "${FRONTEND_REVISION}" | jq -r '.name' | head -1 | xargs -I {} echo "  Revisión: {}"
echo "${FRONTEND_REVISION}" | jq -r '.active' | head -1 | xargs -I {} echo "  Activa: {}"
echo "${FRONTEND_REVISION}" | jq -r '.createdTime' | head -1 | xargs -I {} echo "  Creada: {}"
echo "${FRONTEND_REVISION}" | jq -r '.trafficWeight' | head -1 | xargs -I {} echo "  Tráfico: {}%"

echo ""
echo "✅ Verificación completada"
