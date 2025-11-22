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

  // Create necessary containers
  await createContainerIfNotExists('tenants', '/id')
  await createContainerIfNotExists('users', '/tenantId')
  await createContainerIfNotExists('courses', '/tenantId')
  await createContainerIfNotExists('categories', '/tenantId')
  await createContainerIfNotExists('user-progress', '/tenantId')
  await createContainerIfNotExists('user-groups', '/tenantId')
  await createContainerIfNotExists('course-assignments', '/tenantId')
  await createContainerIfNotExists('certificates', '/tenantId')
  await createContainerIfNotExists('achievements', '/tenantId')
  await createContainerIfNotExists('quiz-attempts', '/tenantId')
  await createContainerIfNotExists('forum-questions', '/tenantId')
  await createContainerIfNotExists('forum-answers', '/tenantId')
  await createContainerIfNotExists('mentorship-requests', '/tenantId')
  await createContainerIfNotExists('mentorship-sessions', '/tenantId')
  await createContainerIfNotExists('audit-logs', '/tenantId')
  
  console.log(`✅ Containers initialized (tenants, users, courses, categories, user-progress, groups, assignments, certificates, achievements, quiz-attempts, forums, mentorship, audit-logs)`)
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
