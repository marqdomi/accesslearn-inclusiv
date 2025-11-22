#!/bin/bash
# Complete Security Testing Suite
# Runs all security tests

set -e

API_URL="${API_URL:-http://localhost:7071}"

echo "🔒 Complete Security Testing Suite"
echo "==================================="
echo "API URL: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if server is running
echo "🔍 Checking if server is running..."
if curl -s -f "$API_URL/api/health" > /dev/null; then
  echo -e "${GREEN}✅ Server is running${NC}"
else
  echo -e "${RED}❌ Server is not running or not accessible${NC}"
  echo "   Please start the server at $API_URL"
  echo ""
  echo "   Run: cd backend && npm run server"
  echo ""
  exit 1
fi

echo ""
echo "=" .repeat(60)
echo ""

# Test 1: JWT Authentication
echo -e "${BLUE}📋 Test 1: JWT Authentication${NC}"
echo "-----------------------------------"
cd "$(dirname "$0")"
if ./test-jwt-manual.sh; then
  echo -e "${GREEN}✅ JWT tests passed${NC}"
else
  echo -e "${RED}❌ JWT tests failed${NC}"
  exit 1
fi

echo ""
echo "=" .repeat(60)
echo ""

# Test 2: Rate Limiting
echo -e "${BLUE}📋 Test 2: Rate Limiting${NC}"
echo "-----------------------------------"
if ./test-rate-limiting.sh; then
  echo -e "${GREEN}✅ Rate limiting tests passed${NC}"
else
  echo -e "${RED}❌ Rate limiting tests failed${NC}"
  exit 1
fi

echo ""
echo "=" .repeat(60)
echo ""

# Test 3: Security Headers
echo -e "${BLUE}📋 Test 3: Security Headers${NC}"
echo "-----------------------------------"
if ./test-security-headers.sh; then
  echo -e "${GREEN}✅ Security headers tests passed${NC}"
else
  echo -e "${RED}❌ Security headers tests failed${NC}"
  exit 1
fi

echo ""
echo "==================================="
echo -e "${GREEN}✅ All security tests passed!${NC}"
echo ""

