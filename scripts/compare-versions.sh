#!/bin/bash

# Script para comparar la versión en GitHub con la versión en producción

RESOURCE_GROUP="rg-accesslearn-prod"
BACKEND_APP="ca-accesslearn-backend-prod"
FRONTEND_APP="ca-accesslearn-frontend-prod"

echo "🔍 COMPARACIÓN DE VERSIONES"
echo "==========================="
echo ""

# Obtener último commit en GitHub
echo "📋 ÚLTIMO COMMIT EN GITHUB:"
GIT_HASH=$(git log -1 --format='%H')
GIT_MSG=$(git log -1 --format='%s')
GIT_DATE=$(git log -1 --format='%cd' --date=iso)
echo "  Hash: ${GIT_HASH}"
echo "  Mensaje: ${GIT_MSG}"
echo "  Fecha: ${GIT_DATE}"
echo ""

# Verificar backend
echo "📦 BACKEND (${BACKEND_APP}):"
echo "────────────────────────────"
BACKEND_INFO=$(az containerapp revision list \
  --name "${BACKEND_APP}" \
  --resource-group "${RESOURCE_GROUP}" \
  --query "[0]" \
  -o json 2>/dev/null)

if [ -n "$BACKEND_INFO" ] && [ "$BACKEND_INFO" != "null" ]; then
  BACKEND_NAME=$(echo "$BACKEND_INFO" | jq -r '.name')
  BACKEND_ACTIVE=$(echo "$BACKEND_INFO" | jq -r '.properties.active')
  BACKEND_TIME=$(echo "$BACKEND_INFO" | jq -r '.properties.createdTime')
  BACKEND_WEIGHT=$(echo "$BACKEND_INFO" | jq -r '.properties.trafficWeight // 0')
  
  # Convertir fechas a segundos para comparar
  GIT_DATE_SEC=$(date -j -f "%a %b %d %H:%M:%S %Y %z" "$GIT_DATE" +%s 2>/dev/null || date -d "$GIT_DATE" +%s 2>/dev/null || echo "0")
  BACKEND_DATE_SEC=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${BACKEND_TIME%Z}" +%s 2>/dev/null || date -d "${BACKEND_TIME}" +%s 2>/dev/null || echo "0")
  
  echo "  Revisión: ${BACKEND_NAME}"
  echo "  Activa: ${BACKEND_ACTIVE}"
  echo "  Creada: ${BACKEND_TIME}"
  echo "  Tráfico: ${BACKEND_WEIGHT}%"
  
  # Comparar fechas
  if [ "$BACKEND_DATE_SEC" -gt "$GIT_DATE_SEC" ] || [ "$BACKEND_DATE_SEC" -eq 0 ] || [ "$GIT_DATE_SEC" -eq 0 ]; then
    echo "  ✅ Estado: Actualizado (revisión creada después del commit o fecha no disponible)"
  elif [ "$BACKEND_DATE_SEC" -lt "$GIT_DATE_SEC" ]; then
    echo "  ⚠️ Estado: Posiblemente desactualizado (revisión anterior al último commit)"
  else
    echo "  ✅ Estado: Actualizado (fechas coinciden)"
  fi
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

if [ -n "$FRONTEND_INFO" ] && [ "$FRONTEND_INFO" != "null" ]; then
  FRONTEND_NAME=$(echo "$FRONTEND_INFO" | jq -r '.name')
  FRONTEND_ACTIVE=$(echo "$FRONTEND_INFO" | jq -r '.properties.active')
  FRONTEND_TIME=$(echo "$FRONTEND_INFO" | jq -r '.properties.createdTime')
  FRONTEND_WEIGHT=$(echo "$FRONTEND_INFO" | jq -r '.properties.trafficWeight // 0')
  
  # Convertir fechas a segundos para comparar
  GIT_DATE_SEC=$(date -j -f "%a %b %d %H:%M:%S %Y %z" "$GIT_DATE" +%s 2>/dev/null || date -d "$GIT_DATE" +%s 2>/dev/null || echo "0")
  FRONTEND_DATE_SEC=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${FRONTEND_TIME%Z}" +%s 2>/dev/null || date -d "${FRONTEND_TIME}" +%s 2>/dev/null || echo "0")
  
  echo "  Revisión: ${FRONTEND_NAME}"
  echo "  Activa: ${FRONTEND_ACTIVE}"
  echo "  Creada: ${FRONTEND_TIME}"
  echo "  Tráfico: ${FRONTEND_WEIGHT}%"
  
  # Comparar fechas
  if [ "$FRONTEND_DATE_SEC" -gt "$GIT_DATE_SEC" ] || [ "$FRONTEND_DATE_SEC" -eq 0 ] || [ "$GIT_DATE_SEC" -eq 0 ]; then
    echo "  ✅ Estado: Actualizado (revisión creada después del commit o fecha no disponible)"
  elif [ "$FRONTEND_DATE_SEC" -lt "$GIT_DATE_SEC" ]; then
    echo "  ⚠️ Estado: Posiblemente desactualizado (revisión anterior al último commit)"
  else
    echo "  ✅ Estado: Actualizado (fechas coinciden)"
  fi
else
  echo "  ❌ No se pudo obtener información del frontend"
fi

echo ""
echo "🔗 VERIFICACIÓN ADICIONAL:"
echo "  GitHub Actions: https://github.com/marqdomi/accesslearn-inclusiv/actions"
echo "  Health Endpoint: https://api.kainet.mx/api/health"
echo "  Frontend: https://app.kainet.mx"
echo ""
