import { CosmosClient, Container, Database, PartitionKeyDefinition } from "@azure/cosmos"

let cosmosClient: CosmosClient | null = null
let database: Database | null = null

export async function initializeCosmos(): Promise<void> {
  if (cosmosClient) return

  const endpoint = process.env.COSMOS_ENDPOINT
  const key = process.env.COSMOS_KEY
  const databaseName = process.env.COSMOS_DATABASE

  if (!endpoint || !key || !databaseName) {
    throw new Error(
      "Missing Cosmos DB configuration: COSMOS_ENDPOINT, COSMOS_KEY, COSMOS_DATABASE"
    )
  }

  cosmosClient = new CosmosClient({ endpoint, key })
  database = cosmosClient.database(databaseName)

  console.log(`✅ Cosmos DB connected: ${databaseName}`)

  // Crear containers necesarios para el sistema de mentorías
  await createContainerIfNotExists('mentorship-requests', '/tenantId')
  await createContainerIfNotExists('mentorship-sessions', '/tenantId')
  
  console.log(`✅ Mentorship containers initialized`)
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
