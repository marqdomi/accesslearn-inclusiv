/**
 * Setup Platform Admin Containers
 * Creates the necessary containers for the Platform Admin Console
 */
import { CosmosClient } from '@azure/cosmos'
import dotenv from 'dotenv'

dotenv.config()

const COSMOS_ENDPOINT = process.env.COSMOS_ENDPOINT!
const COSMOS_KEY = process.env.COSMOS_KEY!
const COSMOS_DATABASE = process.env.COSMOS_DATABASE!

interface ContainerConfig {
  id: string
  partitionKey: string
  description: string
}

const containersToCreate: ContainerConfig[] = [
  {
    id: 'platform-settings',
    partitionKey: '/id',
    description: 'Global platform configuration settings'
  },
  {
    id: 'platform-alerts',
    partitionKey: '/category',
    description: 'System alerts and notifications for platform admins'
  },
  {
    id: 'subscriptions',
    partitionKey: '/tenantId',
    description: 'Tenant subscription information and billing plans'
  },
  {
    id: 'invoices',
    partitionKey: '/tenantId',
    description: 'Billing invoices for tenants'
  },
  {
    id: 'platform-health',
    partitionKey: '/service',
    description: 'Platform health metrics and service status'
  }
]

async function setupPlatformContainers() {
  console.log('🚀 Setting up Platform Admin containers...\n')
  
  const client = new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY })
  const database = client.database(COSMOS_DATABASE)
  
  for (const config of containersToCreate) {
    try {
      const { container } = await database.containers.createIfNotExists({
        id: config.id,
        partitionKey: { paths: [config.partitionKey] }
      })
      console.log(`✅ Container "${config.id}" ready (partition: ${config.partitionKey})`)
      console.log(`   📝 ${config.description}`)
    } catch (error: any) {
      console.error(`❌ Failed to create "${config.id}": ${error.message}`)
    }
  }
  
  console.log('\n✨ Container setup complete!')
}

setupPlatformContainers().catch(console.error)
