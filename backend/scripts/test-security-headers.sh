#!/bin/bash
# Security Headers Testing Script
# Tests Helmet.js security headers

set -e

API_URL="${API_URL:-http://localhost:7071}"

echo "🛡️  Security Headers Testing"
echo "============================"
echo "API URL: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get headers
echo "📋 Checking Security Headers"
echo "----------------------------"
HEADERS=$(curl -s -I -X GET "$API_URL/api/health")

# Check for required security headers
REQUIRED_HEADERS=(
  "x-content-type-options"
  "x-frame-options"
  "x-xss-protection"
)

OPTIONAL_HEADERS=(
  "content-security-policy"
  "strict-transport-security"
  "x-dns-prefetch-control"
  "x-download-options"
  "x-permitted-cross-domain-policies"
)

echo "Required Headers:"
MISSING_REQUIRED=0
for header in "${REQUIRED_HEADERS[@]}"; do
  if echo "$HEADERS" | grep -qi "^$header:"; then
    VALUE=$(echo "$HEADERS" | grep -i "^$header:" | cut -d':' -f2 | xargs)
    echo -e "  ${GREEN}✅${NC} $header: $VALUE"
  else
    echo -e "  ${RED}❌${NC} $header: MISSING"
    MISSING_REQUIRED=$((MISSING_REQUIRED + 1))
  fi
done

echo ""
echo "Optional Headers:"
for header in "${OPTIONAL_HEADERS[@]}"; do
  if echo "$HEADERS" | grep -qi "^$header:"; then
    VALUE=$(echo "$HEADERS" | grep -i "^$header:" | cut -d':' -f2 | xargs)
    echo -e "  ${GREEN}✅${NC} $header: $VALUE"
  else
    echo -e "  ${YELLOW}⚠️${NC}  $header: Not present (optional)"
  fi
done

echo ""
echo "====================================="

if [ "$MISSING_REQUIRED" -eq 0 ]; then
  echo -e "${GREEN}✅ All required security headers present!${NC}"
  exit 0
else
  echo -e "${RED}❌ Missing $MISSING_REQUIRED required security header(s)${NC}"
  exit 1
fi

