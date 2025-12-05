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

  // Configure Cosmos DB client
  // Note: SDK v4 handles retries automatically, but we can configure connection behavior
  cosmosClient = new CosmosClient({ 
    endpoint, 
    key
    // The SDK automatically handles retries with exponential backoff
    // No need to configure retry policy manually in v4
  })
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
  await createContainerIfNotExists('forums', '/tenantId')
  await createContainerIfNotExists('activity-feed', '/tenantId')
  await createContainerIfNotExists('notifications', '/tenantId')
  await createContainerIfNotExists('notification-preferences', '/tenantId')
  await createContainerIfNotExists('mentorship-requests', '/tenantId')
  await createContainerIfNotExists('mentorship-sessions', '/tenantId')
  await createContainerIfNotExists('audit-logs', '/tenantId')
  await createContainerIfNotExists('accessibility-profiles', '/tenantId')
  await createContainerIfNotExists('company-settings', '/tenantId')
  await createContainerIfNotExists('certificate-templates', '/tenantId')
  
  console.log(`✅ Containers initialized (tenants, users, courses, categories, user-progress, groups, assignments, certificates, achievements, quiz-attempts, forums, activity-feed, notifications, notification-preferences, mentorship, audit-logs, accessibility-profiles, company-settings, certificate-templates)`)
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
