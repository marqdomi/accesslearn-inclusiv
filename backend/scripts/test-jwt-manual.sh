#!/bin/bash
# Manual JWT Testing Script
# Tests JWT authentication manually with curl

set -e

API_URL="${API_URL:-http://localhost:7071}"
TEST_EMAIL="${TEST_EMAIL:-test@example.com}"
TEST_PASSWORD="${TEST_PASSWORD:-test123}"
TEST_TENANT_ID="${TEST_TENANT_ID:-tenant-test}"

echo "🔒 JWT Authentication Manual Testing"
echo "====================================="
echo "API URL: $API_URL"
echo "Test User: $TEST_EMAIL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Login
echo "📋 Test 1: Login and get JWT token"
echo "-----------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"tenantId\": \"$TEST_TENANT_ID\"
  }")

echo "Response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ FAILED: No token received${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Token received: ${TOKEN:0:50}...${NC}"
echo ""

# Test 2: Validate token
echo "📋 Test 2: Validate JWT token"
echo "------------------------------"
VALIDATE_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/validate" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $VALIDATE_RESPONSE"

if echo "$VALIDATE_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Token validation successful${NC}"
else
  echo -e "${RED}❌ FAILED: Token validation failed${NC}"
  exit 1
fi
echo ""

# Test 3: Decode token (verify it's a JWT)
echo "📋 Test 3: Verify JWT format"
echo "----------------------------"
TOKEN_PARTS=$(echo $TOKEN | tr '.' '\n' | wc -l)

if [ "$TOKEN_PARTS" -eq 3 ]; then
  echo -e "${GREEN}✅ Token is a valid JWT (3 parts)${NC}"
  
  # Decode header (first part)
  HEADER=$(echo $TOKEN | cut -d'.' -f1 | base64 -d 2>/dev/null || echo $TOKEN | cut -d'.' -f1)
  echo "Header (first 50 chars): ${HEADER:0:50}..."
  
  # Decode payload (second part) - note: may need padding
  PAYLOAD=$(echo $TOKEN | cut -d'.' -f2)
  # Add padding if needed
  case $((${#PAYLOAD} % 4)) in
    2) PAYLOAD="${PAYLOAD}==" ;;
    3) PAYLOAD="${PAYLOAD}=" ;;
  esac
  DECODED_PAYLOAD=$(echo "$PAYLOAD" | base64 -d 2>/dev/null || echo "Could not decode")
  echo "Payload preview: ${DECODED_PAYLOAD:0:100}..."
else
  echo -e "${RED}❌ FAILED: Token is not a valid JWT (should have 3 parts, got $TOKEN_PARTS)${NC}"
  exit 1
fi
echo ""

# Test 4: Test with invalid token
echo "📋 Test 4: Test with invalid token"
echo "----------------------------------"
INVALID_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/validate" \
  -H "Authorization: Bearer invalid.token.here")

if echo "$INVALID_RESPONSE" | grep -q '"error"'; then
  echo -e "${GREEN}✅ Invalid token correctly rejected${NC}"
else
  echo -e "${YELLOW}⚠️  Invalid token response: $INVALID_RESPONSE${NC}"
fi
echo ""

# Test 5: Test without token
echo "📋 Test 5: Test without token"
echo "-----------------------------"
NO_TOKEN_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/validate")

if [ -z "$NO_TOKEN_RESPONSE" ] || echo "$NO_TOKEN_RESPONSE" | grep -q '"error"'; then
  echo -e "${GREEN}✅ Request without token correctly handled${NC}"
else
  echo -e "${YELLOW}⚠️  No token response: $NO_TOKEN_RESPONSE${NC}"
fi
echo ""

echo "====================================="
echo -e "${GREEN}✅ All JWT tests completed!${NC}"
echo ""
echo "Token for manual testing:"
echo "$TOKEN"

