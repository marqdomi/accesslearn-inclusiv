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
    source <(grep -v '^#' ./backend/.env | sed 's/^/export /')
fi

# Check if required secrets are set
if [ -z "$COSMOS_KEY" ]; then
    echo -e "${RED}❌ Error: COSMOS_KEY not set in backend/.env${NC}"
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

# Step 2: Validate deployment with what-if
echo -e "${YELLOW}🔍 Step 2: Validating Bicep deployment (what-if)...${NC}"
az deployment group what-if \
    --resource-group $RESOURCE_GROUP \
    --template-file ./infra/main.bicep \
    --parameters location=$LOCATION \
    --parameters environment=$ENVIRONMENT \
    --parameters appName=$APP_NAME \
    --parameters cosmosEndpoint=$COSMOS_ENDPOINT \
    --parameters cosmosKey=$COSMOS_KEY \
    --parameters resendApiKey=$RESEND_API_KEY \
    --parameters emailFrom=$EMAIL_FROM \
    --parameters jwtSecret=$JWT_SECRET

echo ""
echo -e "${YELLOW}⚠️  Review the what-if output above.${NC}"
read -p "Do you want to proceed with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Deployment cancelled${NC}"
    exit 1
fi
echo ""

# Step 3: Deploy infrastructure
echo -e "${YELLOW}🚀 Step 3: Deploying Azure infrastructure...${NC}"
DEPLOYMENT_OUTPUT=$(az deployment group create \
    --resource-group $RESOURCE_GROUP \
    --template-file ./infra/main.bicep \
    --parameters location=$LOCATION \
    --parameters environment=$ENVIRONMENT \
    --parameters appName=$APP_NAME \
    --parameters cosmosEndpoint=$COSMOS_ENDPOINT \
    --parameters cosmosKey=$COSMOS_KEY \
    --parameters resendApiKey=$RESEND_API_KEY \
    --parameters emailFrom=$EMAIL_FROM \
    --parameters jwtSecret=$JWT_SECRET \
    --output json)

echo -e "${GREEN}✅ Infrastructure deployed${NC}"

# Extract outputs
ACR_NAME=$(echo $DEPLOYMENT_OUTPUT | jq -r '.properties.outputs.containerRegistryName.value')
ACR_LOGIN_SERVER=$(echo $DEPLOYMENT_OUTPUT | jq -r '.properties.outputs.containerRegistryLoginServer.value')
BACKEND_FQDN=$(echo $DEPLOYMENT_OUTPUT | jq -r '.properties.outputs.backendFqdn.value')
FRONTEND_FQDN=$(echo $DEPLOYMENT_OUTPUT | jq -r '.properties.outputs.frontendFqdn.value')

echo ""
echo -e "${BLUE}📋 Deployment Details:${NC}"
echo -e "  Registry: ${GREEN}$ACR_NAME${NC}"
echo -e "  Backend URL: ${GREEN}https://$BACKEND_FQDN${NC}"
echo -e "  Frontend URL: ${GREEN}https://$FRONTEND_FQDN${NC}"
echo ""

# Step 4: Login to ACR
echo -e "${YELLOW}🔐 Step 4: Logging into Azure Container Registry...${NC}"
az acr login --name $ACR_NAME
echo -e "${GREEN}✅ Logged into ACR${NC}"
echo ""

# Step 5: Build and push backend image
echo -e "${YELLOW}🐳 Step 5: Building backend Docker image...${NC}"
docker build -t $ACR_LOGIN_SERVER/$APP_NAME-backend:latest ./backend
echo -e "${GREEN}✅ Backend image built${NC}"

echo -e "${YELLOW}📤 Pushing backend image to ACR...${NC}"
docker push $ACR_LOGIN_SERVER/$APP_NAME-backend:latest
echo -e "${GREEN}✅ Backend image pushed${NC}"
echo ""

# Step 6: Build frontend with correct API URL
echo -e "${YELLOW}🐳 Step 6: Building frontend Docker image...${NC}"

# Create .env.production for frontend build
cat > .env.production << EOF
VITE_API_URL=https://$BACKEND_FQDN
EOF

docker build -t $ACR_LOGIN_SERVER/$APP_NAME-frontend:latest .
echo -e "${GREEN}✅ Frontend image built${NC}"

echo -e "${YELLOW}📤 Pushing frontend image to ACR...${NC}"
docker push $ACR_LOGIN_SERVER/$APP_NAME-frontend:latest
echo -e "${GREEN}✅ Frontend image pushed${NC}"
echo ""

# Step 7: Restart container apps to pull new images
echo -e "${YELLOW}🔄 Step 7: Restarting container apps...${NC}"
az containerapp revision restart \
    --name ca-$APP_NAME-backend-$ENVIRONMENT \
    --resource-group $RESOURCE_GROUP

az containerapp revision restart \
    --name ca-$APP_NAME-frontend-$ENVIRONMENT \
    --resource-group $RESOURCE_GROUP

echo -e "${GREEN}✅ Container apps restarted${NC}"
echo ""

# Step 8: Test deployments
echo -e "${YELLOW}🧪 Step 8: Testing deployments...${NC}"

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
