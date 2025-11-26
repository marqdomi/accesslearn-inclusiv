#!/bin/bash
# Script simplificado para verificar usuarios - usa curl

API_URL="${VITE_API_URL:-https://api.kainet.mx/api}"
TENANT_SLUG="labolamx"
TOKEN="${AUTH_TOKEN:-}"

echo "🔍 Verificando usuarios de $TENANT_SLUG..."
echo "API URL: $API_URL"
echo ""

# Obtener tenant
echo "📋 Obteniendo información del tenant..."
TENANT_RESPONSE=$(curl -s "$API_URL/tenants/slug/$TENANT_SLUG")

if echo "$TENANT_RESPONSE" | grep -q "error"; then
  echo "❌ Error: $TENANT_RESPONSE"
  exit 1
fi

TENANT_ID=$(echo "$TENANT_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
TENANT_NAME=$(echo "$TENANT_RESPONSE" | grep -o '"name":"[^"]*' | cut -d'"' -f4)

if [ -z "$TENANT_ID" ]; then
  echo "❌ No se encontró el tenant"
  exit 1
fi

echo "✅ Tenant encontrado: $TENANT_NAME (ID: $TENANT_ID)"
echo ""

# Obtener usuarios
echo "👥 Obteniendo usuarios..."
if [ -z "$TOKEN" ]; then
  echo "⚠️  Sin token de autenticación, algunos endpoints pueden fallar"
  echo "💡 Exporta AUTH_TOKEN para autenticarte"
  echo ""
fi

USERS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  "$API_URL/users?tenantId=$TENANT_ID")

if echo "$USERS_RESPONSE" | grep -q "error"; then
  echo "❌ Error obteniendo usuarios: $USERS_RESPONSE"
  exit 1
fi

USER_COUNT=$(echo "$USERS_RESPONSE" | grep -o '"id"' | wc -l | tr -d ' ')

echo "📊 Total de usuarios: $USER_COUNT"
echo ""
echo "📋 Lista de usuarios:"
echo "$USERS_RESPONSE" | grep -o '"email":"[^"]*' | cut -d'"' -f4 | nl

