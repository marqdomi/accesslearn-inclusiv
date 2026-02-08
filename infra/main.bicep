// Azure Container Apps Deployment for AccessLearn Inclusiv
// This Bicep template deploys:
// - Azure Cosmos DB (Serverless, NoSQL API)
// - Azure Blob Storage for tenant assets
// - Application Insights for observability
// - Azure Container Registry for Docker images
// - Azure Container Apps Environment
// - Backend Container App (Node.js API)
// - Frontend Container App (React SPA with nginx)
// - Custom domain + managed SSL certificates

// Parameters
@description('Location for all resources')
param location string = 'eastus'

@description('Environment name (prod, staging, dev)')
param environment string = 'prod'

@description('Application name prefix')
param appName string = 'accesslearn'

@description('Resend API key for email service')
@secure()
param resendApiKey string

@description('Email from address')
param emailFrom string = 'newsletter@kainet.mx'

@description('JWT secret for authentication')
@secure()
param jwtSecret string

@description('Container image tag')
param imageTag string = 'latest'

@description('Stripe secret key')
@secure()
param stripeSecretKey string = ''

@description('Stripe webhook secret')
@secure()
param stripeWebhookSecret string = ''

@description('Custom domain for frontend (e.g., app.kainet.mx)')
param frontendCustomDomain string = ''

@description('Custom domain for backend API (e.g., api.kainet.mx)')
param backendCustomDomain string = ''

// Variables
var resourceGroupName = 'rg-${appName}-${environment}'
var containerRegistryName = 'cr${appName}${environment}${uniqueString(resourceGroup().id)}'
var containerAppsEnvName = 'cae-${appName}-${environment}'
var backendAppName = 'ca-${appName}-backend-${environment}'
var frontendAppName = 'ca-${appName}-frontend-${environment}'
var logAnalyticsName = 'log-${appName}-${environment}'
var cosmosAccountName = 'cosmos-${appName}-${environment}'
var cosmosDatabaseName = 'accesslearn-db'
var storageAccountName = 'st${appName}${environment}'
var appInsightsName = 'ai-${appName}-${environment}'

// ============================================
// Azure Cosmos DB (Serverless, NoSQL API)
// ============================================
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: cosmosAccountName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    capabilities: [
      { name: 'EnableServerless' }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    backupPolicy: {
      type: 'Continuous'
      continuousModeProperties: {
        tier: 'Continuous7Days'
      }
    }
  }
}

resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: cosmosAccount
  name: cosmosDatabaseName
  properties: {
    resource: {
      id: cosmosDatabaseName
    }
  }
}

// Core containers with partition keys
var containers = [
  { name: 'tenants', partitionKey: '/id' }
  { name: 'users', partitionKey: '/tenantId' }
  { name: 'courses', partitionKey: '/tenantId' }
  { name: 'lessons', partitionKey: '/tenantId' }
  { name: 'user-progress', partitionKey: '/tenantId' }
  { name: 'certificates', partitionKey: '/tenantId' }
  { name: 'stps-records', partitionKey: '/tenantId' }
  { name: 'subscriptions', partitionKey: '/tenantId' }
  { name: 'invoices', partitionKey: '/tenantId' }
  { name: 'analytics', partitionKey: '/tenantId' }
  { name: 'notifications', partitionKey: '/tenantId' }
  { name: 'audit-logs', partitionKey: '/tenantId' }
  { name: 'accessibility-profiles', partitionKey: '/tenantId' }
  { name: 'gamification', partitionKey: '/tenantId' }
  { name: 'quizzes', partitionKey: '/tenantId' }
  { name: 'mentoring-sessions', partitionKey: '/tenantId' }
  { name: 'forums', partitionKey: '/tenantId' }
  { name: 'badges', partitionKey: '/tenantId' }
  { name: 'missions', partitionKey: '/tenantId' }
  { name: 'rewards', partitionKey: '/tenantId' }
  { name: 'leaderboards', partitionKey: '/tenantId' }
  { name: 'feedback', partitionKey: '/tenantId' }
]

resource cosmosContainers 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = [for container in containers: {
  parent: cosmosDatabase
  name: container.name
  properties: {
    resource: {
      id: container.name
      partitionKey: {
        paths: [container.partitionKey]
        kind: 'Hash'
        version: 2
      }
      indexingPolicy: {
        automatic: true
        indexingMode: 'consistent'
      }
    }
  }
}]

// ============================================
// Azure Blob Storage (tenant logos, course assets)
// ============================================
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    networkAcls: {
      defaultAction: 'Allow'
    }
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
}

resource tenantLogosContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'tenant-logos'
  properties: {
    publicAccess: 'None'
  }
}

resource courseAssetsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'course-assets'
  properties: {
    publicAccess: 'None'
  }
}

resource certificateAssetsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'certificates'
  properties: {
    publicAccess: 'None'
  }
}

// ============================================
// Log Analytics + Application Insights
// ============================================
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

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
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
    anonymousPullEnabled: false // Security best practice
    publicNetworkAccess: 'Enabled'
  }
}

// Container Apps Environment
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: containerAppsEnvName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// Backend Container App (Node.js API)
resource backendApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: backendAppName
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000 // Must match Dockerfile EXPOSE
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: [
        {
          name: 'registry-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'cosmos-key'
          value: cosmosAccount.listKeys().primaryMasterKey
        }
        {
          name: 'resend-api-key'
          value: resendApiKey
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
        {
          name: 'stripe-secret-key'
          value: stripeSecretKey
        }
        {
          name: 'stripe-webhook-secret'
          value: stripeWebhookSecret
        }
        {
          name: 'storage-connection-string'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
        }
        {
          name: 'appinsights-connection-string'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: '${containerRegistry.properties.loginServer}/${appName}-backend:${imageTag}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '3000'
            }
            {
              name: 'COSMOS_ENDPOINT'
              value: cosmosAccount.properties.documentEndpoint
            }
            {
              name: 'COSMOS_KEY'
              secretRef: 'cosmos-key'
            }
            {
              name: 'COSMOS_DATABASE'
              value: cosmosDatabaseName
            }
            {
              name: 'RESEND_API_KEY'
              secretRef: 'resend-api-key'
            }
            {
              name: 'EMAIL_FROM'
              value: emailFrom
            }
            {
              name: 'FROM_NAME'
              value: 'AccessLearn Inclusiv'
            }
            {
              name: 'JWT_SECRET'
              secretRef: 'jwt-secret'
            }
            {
              name: 'STRIPE_SECRET_KEY'
              secretRef: 'stripe-secret-key'
            }
            {
              name: 'STRIPE_WEBHOOK_SECRET'
              secretRef: 'stripe-webhook-secret'
            }
            {
              name: 'AZURE_STORAGE_CONNECTION_STRING'
              secretRef: 'storage-connection-string'
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              secretRef: 'appinsights-connection-string'
            }
            {
              name: 'FRONTEND_URL'
              value: frontendCustomDomain != '' ? 'https://${frontendCustomDomain}' : 'https://${frontendAppName}.${containerAppsEnvironment.properties.defaultDomain}'
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: 3000
              }
              initialDelaySeconds: 10
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/health'
                port: 3000
              }
              initialDelaySeconds: 5
              periodSeconds: 10
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

// Frontend Container App (React + nginx)
resource frontendApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: frontendAppName
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080 // Must match nginx.conf listen port
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: [
        {
          name: 'registry-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: '${containerRegistry.properties.loginServer}/${appName}-frontend:${imageTag}'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'VITE_API_URL'
              value: 'https://${backendApp.properties.configuration.ingress.fqdn}'
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: 8080
              }
              initialDelaySeconds: 10
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/health'
                port: 8080
              }
              initialDelaySeconds: 5
              periodSeconds: 10
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 5
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}

// Outputs for DNS configuration
output backendFqdn string = backendApp.properties.configuration.ingress.fqdn
output frontendFqdn string = frontendApp.properties.configuration.ingress.fqdn
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
output containerRegistryName string = containerRegistry.name
output resourceGroupName string = resourceGroupName
output cosmosEndpoint string = cosmosAccount.properties.documentEndpoint
output cosmosAccountName string = cosmosAccount.name
output storageAccountName string = storageAccount.name
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output appInsightsConnectionString string = appInsights.properties.ConnectionString
