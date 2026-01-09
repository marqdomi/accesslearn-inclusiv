import { CosmosClient, Container, Database, PartitionKeyDefinition } from "@azure/cosmos"

let cosmosClient: CosmosClient | null = null
let database: Database | null = null
let useOfflineMode = false

export function isOfflineMode(): boolean {
  return useOfflineMode
}

export async function initializeCosmos(): Promise<void> {
  if (cosmosClient) return

  const endpoint = process.env.COSMOS_ENDPOINT
  const key = process.env.COSMOS_KEY
  const databaseName = process.env.COSMOS_DATABASE

  if (!endpoint || !key || !databaseName) {
    console.warn('⚠️  Missing Cosmos DB configuration - running in OFFLINE mode')
    useOfflineMode = true
    return
  }

  // Test connectivity first with a timeout
  try {
    console.log('📡 Testing Cosmos DB connectivity...')
    const testClient = new CosmosClient({ endpoint, key })
    
    // Try to get database with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 10000)
    )
    
    await Promise.race([
      testClient.database(databaseName).read(),
      timeoutPromise
    ])
    
    cosmosClient = testClient
    database = cosmosClient.database(databaseName)
    console.log(`✅ Cosmos DB connected: ${databaseName}`)
  } catch (error: any) {
    console.warn(`⚠️  Cannot connect to Cosmos DB: ${error.message}`)
    console.warn('📴 Running in OFFLINE mode with mock data')
    console.warn('💡 To use Cosmos DB, ensure your IP is allowed in Azure or use VPN')
    useOfflineMode = true
    return
  }
  
  // Skip container creation in development - assumes containers already exist in Azure
  // This significantly speeds up local development startup time
  console.log(`ℹ️  Ready to use existing containers in Azure Cosmos DB`)
}

export function getDatabase(): Database {
  if (!database) {
    throw new Error("Cosmos DB not initialized. Call initializeCosmos() first.")
  }
  return database
}

export function getContainer(containerName: string): Container {
  const db = getDatabase()
  return db.container(containerName)
}

export async function createContainerIfNotExists(
  containerName: string,
  partitionKeyPath: string
): Promise<Container> {
  const db = getDatabase()
  const { container } = await db.containers.createIfNotExists({
    id: containerName,
    partitionKey: { paths: [partitionKeyPath] }
  })
  return container
}
