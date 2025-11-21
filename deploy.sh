#!/bin/bash
# Azure Container Apps Deployment Script for AccessLearn Inclusiv
# This script builds Docker images, pushes to ACR, and deploys to Azure Container Apps

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  AccessLearn Inclusiv - Azure Deployment  ${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Configuration
RESOURCE_GROUP="rg-accesslearn-prod"
LOCATION="eastus"
APP_NAME="accesslearn"
ENVIRONMENT="prod"

# Load secrets from .env files
if [ -f "./backend/.env" ]; then
    set -a  # Automatically export all variables
    source ./backend/.env
    set +a
fi

# Check if required secrets are set
if [ -z "$COSMOS_KEY" ]; then
    echo -e "${RED}❌ Error: COSMOS_KEY not set in backend/.env${NC}"
    echo -e "${YELLOW}Current COSMOS_KEY value: ${COSMOS_KEY:-NOT SET}${NC}"
    exit 1
fi

if [ -z "$RESEND_API_KEY" ]; then
    echo -e "${RED}❌ Error: RESEND_API_KEY not set in backend/.env${NC}"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}❌ Error: JWT_SECRET not set in backend/.env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables loaded${NC}"
echo ""

# Step 1: Create or validate resource group
echo -e "${YELLOW}📦 Step 1: Validating resource group...${NC}"
if az group show --name $RESOURCE_GROUP &> /dev/null; then
    echo -e "${GREEN}✅ Resource group $RESOURCE_GROUP exists${NC}"
else
    echo -e "${YELLOW}Creating resource group $RESOURCE_GROUP...${NC}"
    az group create --name $RESOURCE_GROUP --location $LOCATION
    echo -e "${GREEN}✅ Resource group created${NC}"
fi
echo ""

# Step 2: Deploy Phase 1 - ACR and Log Analytics
echo -e "${YELLOW}🔍 Step 2: Deploying Phase 1 (ACR + Log Analytics)...${NC}"
PHASE1_OUTPUT=$(az deployment group create \
    --resource-group $RESOURCE_GROUP \
    --template-file ./infra/phase1-acr.bicep \
    --parameters location=$LOCATION \
    --parameters environment=$ENVIRONMENT \
    --parameters appName=$APP_NAME \
    --output json)

echo -e "${GREEN}✅ Phase 1 deployed${NC}"

# Extract Phase 1 outputs
ACR_NAME=$(echo $PHASE1_OUTPUT | jq -r '.properties.outputs.containerRegistryName.value')
ACR_LOGIN_SERVER=$(echo $PHASE1_OUTPUT | jq -r '.properties.outputs.containerRegistryLoginServer.value')
LOG_ANALYTICS_ID=$(echo $PHASE1_OUTPUT | jq -r '.properties.outputs.logAnalyticsId.value')

echo ""
echo -e "${BLUE}📋 Deployment Details:${NC}"
echo -e "  Registry: ${GREEN}$ACR_NAME${NC}"
echo -e "  Backend URL: ${GREEN}https://$BACKEND_FQDN${NC}"
echo -e "  Frontend URL: ${GREEN}https://$FRONTEND_FQDN${NC}"
echo ""
echo -e "${BLUE}📋 Phase 1 Complete:${NC}"
echo -e "  Registry: ${GREEN}$ACR_NAME${NC}"
echo -e "  Login Server: ${GREEN}$ACR_LOGIN_SERVER${NC}"
echo ""

# Step 3: Login to ACR
echo -e "${YELLOW}🔐 Step 3: Logging into Azure Container Registry...${NC}"
az acr login --name $ACR_NAME
echo -e "${GREEN}✅ Logged into ACR${NC}"
echo ""

# Step 4: Build and push backend image
echo -e "${YELLOW}🐳 Step 4: Building backend Docker image (linux/amd64)...${NC}"
docker build --platform linux/amd64 -t $ACR_LOGIN_SERVER/$APP_NAME-backend:latest ./backend
echo -e "${GREEN}✅ Backend image built${NC}"

echo -e "${YELLOW}📤 Pushing backend image to ACR...${NC}"
docker push $ACR_LOGIN_SERVER/$APP_NAME-backend:latest
echo -e "${GREEN}✅ Backend image pushed${NC}"
echo ""

# Step 5: Prepare for frontend build (will build after we know backend URL)
echo -e "${YELLOW}⏭️  Step 5: Frontend build prepared (will build with actual backend URL after Phase 2)${NC}"
echo ""

# Step 6: Deploy Phase 2 - Container Apps
echo -e "${YELLOW}🚀 Step 6: Deploying Phase 2 (Container Apps)...${NC}"
PHASE2_OUTPUT=$(az deployment group create \
    --resource-group $RESOURCE_GROUP \
    --template-file ./infra/phase2-apps.bicep \
    --parameters location=$LOCATION \
    --parameters environment=$ENVIRONMENT \
    --parameters appName=$APP_NAME \
    --parameters containerRegistryName=$ACR_NAME \
    --parameters containerRegistryLoginServer=$ACR_LOGIN_SERVER \
    --parameters logAnalyticsId=$LOG_ANALYTICS_ID \
    --parameters cosmosEndpoint=$COSMOS_ENDPOINT \
    --parameters cosmosKey=$COSMOS_KEY \
    --parameters resendApiKey=$RESEND_API_KEY \
    --parameters emailFrom=$EMAIL_FROM \
    --parameters jwtSecret=$JWT_SECRET \
    --output json)

echo -e "${GREEN}✅ Phase 2 deployed${NC}"

# Extract Phase 2 outputs
BACKEND_FQDN=$(echo $PHASE2_OUTPUT | jq -r '.properties.outputs.backendFqdn.value')
FRONTEND_FQDN=$(echo $PHASE2_OUTPUT | jq -r '.properties.outputs.frontendFqdn.value')

echo ""
echo -e "${BLUE}📋 Phase 2 Complete:${NC}"
echo -e "  Backend FQDN: ${GREEN}$BACKEND_FQDN${NC}"
echo -e "  Frontend FQDN: ${GREEN}$FRONTEND_FQDN${NC}"
echo ""

# Step 7: Build and push frontend with actual backend URL
echo -e "${YELLOW}🐳 Step 7: Building frontend Docker image with backend URL (linux/amd64)...${NC}"

# Create .env.production with actual backend URL
cat > .env.production << EOF
VITE_API_URL=https://$BACKEND_FQDN
EOF

docker build --platform linux/amd64 -t $ACR_LOGIN_SERVER/$APP_NAME-frontend:latest .
echo -e "${GREEN}✅ Frontend image built with correct API URL${NC}"

echo -e "${YELLOW}📤 Pushing frontend image to ACR...${NC}"
docker push $ACR_LOGIN_SERVER/$APP_NAME-frontend:latest
echo -e "${GREEN}✅ Frontend image pushed${NC}"
echo ""

# Step 8: Restart frontend to use new image
echo -e "${YELLOW}🔄 Step 8: Restarting frontend container app...${NC}"
az containerapp update \
    --name ca-$APP_NAME-frontend-$ENVIRONMENT \
    --resource-group $RESOURCE_GROUP \
    --image $ACR_LOGIN_SERVER/$APP_NAME-frontend:latest

echo -e "${GREEN}✅ Frontend restarted with correct API URL${NC}"
echo ""

# Step 9: Test deployments
echo -e "${YELLOW}🧪 Step 9: Testing deployments...${NC}"

echo -e "Testing backend health..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://$BACKEND_FQDN/health)
if [ "$BACKEND_HEALTH" -eq 200 ]; then
    echo -e "${GREEN}✅ Backend is healthy (HTTP $BACKEND_HEALTH)${NC}"
else
    echo -e "${RED}❌ Backend health check failed (HTTP $BACKEND_HEALTH)${NC}"
fi

echo -e "Testing frontend..."
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://$FRONTEND_FQDN/)
if [ "$FRONTEND_HEALTH" -eq 200 ]; then
    echo -e "${GREEN}✅ Frontend is accessible (HTTP $FRONTEND_HEALTH)${NC}"
else
    echo -e "${RED}❌ Frontend health check failed (HTTP $FRONTEND_HEALTH)${NC}"
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Deployment Complete! 🎉${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}📍 Next Steps:${NC}"
echo -e "  1. Configure DNS for kainet.mx:"
echo -e "     ${YELLOW}app.kainet.mx${NC} → CNAME → ${GREEN}$FRONTEND_FQDN${NC}"
echo -e "     ${YELLOW}api.kainet.mx${NC} → CNAME → ${GREEN}$BACKEND_FQDN${NC}"
echo ""
echo -e "  2. Access your application:"
echo -e "     Frontend: ${GREEN}https://$FRONTEND_FQDN${NC}"
echo -e "     Backend:  ${GREEN}https://$BACKEND_FQDN${NC}"
echo ""
echo -e "  3. View resources in Azure Portal:"
echo -e "     ${BLUE}https://portal.azure.com/#@/resource/subscriptions/6ab56dbc-0375-45aa-a673-c007f5bd2a2d/resourceGroups/$RESOURCE_GROUP${NC}"
echo ""
