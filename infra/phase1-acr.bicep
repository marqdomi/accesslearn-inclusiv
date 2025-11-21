// Phase 1: Azure Container Registry and Log Analytics only
// This must be deployed first before building Docker images

// Parameters
@description('Location for all resources')
param location string = 'eastus'

@description('Environment name (prod, staging, dev)')
param environment string = 'prod'

@description('Application name prefix')
param appName string = 'accesslearn'

// Variables
var containerRegistryName = 'cr${appName}${environment}${uniqueString(resourceGroup().id)}'
var logAnalyticsName = 'log-${appName}-${environment}'

// Log Analytics Workspace for Container Apps
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Azure Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: containerRegistryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
  }
}

// Outputs
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
output containerRegistryName string = containerRegistry.name
output logAnalyticsId string = logAnalytics.id
output logAnalyticsCustomerId string = logAnalytics.properties.customerId
