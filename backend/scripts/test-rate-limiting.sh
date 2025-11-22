#!/bin/bash
# Rate Limiting Testing Script
# Tests rate limiting functionality

set -e

API_URL="${API_URL:-http://localhost:7071}"

echo "🚦 Rate Limiting Testing"
echo "========================"
echo "API URL: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: General API Rate Limiting
echo "📋 Test 1: General API Rate Limiting (101 requests)"
echo "---------------------------------------------------"
echo "Making 101 requests to /api/health..."
echo ""

SUCCESS_COUNT=0
RATE_LIMITED_COUNT=0

for i in {1..101}; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/health")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" -eq 200 ]; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    if [ $((i % 10)) -eq 0 ]; then
      echo -n "."
    fi
  elif [ "$HTTP_CODE" -eq 429 ]; then
    RATE_LIMITED_COUNT=$((RATE_LIMITED_COUNT + 1))
    if [ $RATE_LIMITED_COUNT -eq 1 ]; then
      echo ""
      echo -e "${YELLOW}⚠️  First rate limit hit at request #$i${NC}"
    fi
  fi
done

echo ""
echo ""
echo "Results:"
echo "  ✅ Successful requests: $SUCCESS_COUNT"
echo "  🚫 Rate limited requests: $RATE_LIMITED_COUNT"

if [ "$RATE_LIMITED_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ Rate limiting is working!${NC}"
else
  echo -e "${YELLOW}⚠️  No rate limiting detected (might be in development mode)${NC}"
fi
echo ""

# Test 2: Auth Rate Limiting
echo "📋 Test 2: Auth Endpoint Rate Limiting (6 login attempts)"
echo "---------------------------------------------------------"
echo "Making 6 login attempts with wrong credentials..."
echo ""

AUTH_RATE_LIMITED=0
for i in {1..6}; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"test$i@example.com\",
      \"password\": \"wrongpassword\",
      \"tenantId\": \"tenant-test\"
    }")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" -eq 429 ]; then
    AUTH_RATE_LIMITED=$((AUTH_RATE_LIMITED + 1))
    if [ $AUTH_RATE_LIMITED -eq 1 ]; then
      echo -e "${YELLOW}⚠️  Auth rate limit hit at attempt #$i${NC}"
      echo "Response: $(echo "$RESPONSE" | head -n1)"
    fi
  fi
done

echo ""
echo "Results:"
echo "  🚫 Rate limited requests: $AUTH_RATE_LIMITED"

if [ "$AUTH_RATE_LIMITED" -gt 0 ]; then
  echo -e "${GREEN}✅ Auth rate limiting is working!${NC}"
else
  echo -e "${YELLOW}⚠️  No auth rate limiting detected${NC}"
  echo "Note: Auth rate limiting might allow 5 attempts before blocking"
fi
echo ""

# Test 3: Check Rate Limit Headers
echo "📋 Test 3: Check Rate Limit Headers"
echo "-----------------------------------"
HEADERS=$(curl -s -I -X GET "$API_URL/api/health")

if echo "$HEADERS" | grep -qi "ratelimit"; then
  echo -e "${GREEN}✅ Rate limit headers present:${NC}"
  echo "$HEADERS" | grep -i "ratelimit"
else
  echo -e "${YELLOW}⚠️  No rate limit headers found${NC}"
  echo "Headers:"
  echo "$HEADERS"
fi
echo ""

echo "====================================="
echo -e "${GREEN}✅ Rate limiting tests completed!${NC}"

