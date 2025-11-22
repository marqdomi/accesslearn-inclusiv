#!/bin/bash

# Script para verificar que la última versión esté en producción

RESOURCE_GROUP="rg-accesslearn-prod"
BACKEND_APP="ca-accesslearn-backend-prod"
FRONTEND_APP="ca-accesslearn-frontend-prod"

echo "🔍 VERIFICACIÓN DE VERSIÓN EN PRODUCCIÓN"
echo "========================================"
echo ""

# Obtener último commit en GitHub
echo "📋 ÚLTIMO COMMIT EN GITHUB:"
echo "  Hash: $(git log -1 --format='%H')"
echo "  Mensaje: $(git log -1 --format='%s')"
echo "  Fecha: $(git log -1 --format='%cd')"
echo ""

# Verificar backend
echo "📦 BACKEND (${BACKEND_APP}):"
echo "────────────────────────────"
BACKEND_INFO=$(az containerapp revision list \
  --name "${BACKEND_APP}" \
  --resource-group "${RESOURCE_GROUP}" \
  --query "[0]" \
  -o json 2>/dev/null)

if [ -n "$BACKEND_INFO" ]; then
  BACKEND_NAME=$(echo "$BACKEND_INFO" | jq -r '.name')
  BACKEND_ACTIVE=$(echo "$BACKEND_INFO" | jq -r '.properties.active')
  BACKEND_TIME=$(echo "$BACKEND_INFO" | jq -r '.properties.createdTime')
  BACKEND_WEIGHT=$(echo "$BACKEND_INFO" | jq -r '.properties.trafficWeight')
  BACKEND_REPLICAS=$(echo "$BACKEND_INFO" | jq -r '.properties.replicas // 0')
  
  echo "  Revisión: ${BACKEND_NAME}"
  echo "  Activa: ${BACKEND_ACTIVE}"
  echo "  Creada: ${BACKEND_TIME}"
  echo "  Tráfico: ${BACKEND_WEIGHT}%"
  echo "  Réplicas: ${BACKEND_REPLICAS}"
else
  echo "  ❌ No se pudo obtener información del backend"
fi

echo ""
echo "📦 FRONTEND (${FRONTEND_APP}):"
echo "─────────────────────────────"
FRONTEND_INFO=$(az containerapp revision list \
  --name "${FRONTEND_APP}" \
  --resource-group "${RESOURCE_GROUP}" \
  --query "[0]" \
  -o json 2>/dev/null)

if [ -n "$FRONTEND_INFO" ]; then
  FRONTEND_NAME=$(echo "$FRONTEND_INFO" | jq -r '.name')
  FRONTEND_ACTIVE=$(echo "$FRONTEND_INFO" | jq -r '.properties.active')
  FRONTEND_TIME=$(echo "$FRONTEND_INFO" | jq -r '.properties.createdTime')
  FRONTEND_WEIGHT=$(echo "$FRONTEND_INFO" | jq -r '.properties.trafficWeight')
  FRONTEND_REPLICAS=$(echo "$FRONTEND_INFO" | jq -r '.properties.replicas // 0')
  
  echo "  Revisión: ${FRONTEND_NAME}"
  echo "  Activa: ${FRONTEND_ACTIVE}"
  echo "  Creada: ${FRONTEND_TIME}"
  echo "  Tráfico: ${FRONTEND_WEIGHT}%"
  echo "  Réplicas: ${FRONTEND_REPLICAS}"
else
  echo "  ❌ No se pudo obtener información del frontend"
fi

echo ""
echo "🔗 URLs DE PRODUCCIÓN:"
echo "  Frontend: https://app.kainet.mx"
echo "  Backend: https://api.kainet.mx"
echo ""
echo "📊 GITHUB ACTIONS:"
echo "  👉 https://github.com/marqdomi/accesslearn-inclusiv/actions"
echo ""
