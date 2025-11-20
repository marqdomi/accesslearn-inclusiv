/**
 * Script para crear el container de Audit Logs en Cosmos DB
 * 
 * Ejecutar: node backend/scripts/createAuditLogsContainer.js
 */

const { CosmosClient } = require('@azure/cosmos');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function createAuditLogsContainer() {
  const client = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY
  });
  
  const databaseId = process.env.COSMOS_DATABASE || 'accesslearn-db';
  const database = client.database(databaseId);

  const containerDefinition = {
    id: 'audit-logs',
    partitionKey: {
      paths: ['/tenantId'],
      kind: 'Hash'
    },
    indexingPolicy: {
      automatic: true,
      indexingMode: 'consistent',
      includedPaths: [
        { path: '/*' }
      ],
      excludedPaths: [
        { path: '/"_etag"/?' }
      ]
    },
    // TTL para auto-delete de logs antiguos (opcional, 90 días = 7776000 segundos)
    defaultTtl: -1, // -1 = sin expiración, cambiar a 7776000 para 90 días
  };

  try {
    console.log(`Creating container: ${containerDefinition.id}`);
    const { container } = await database.containers.createIfNotExists(containerDefinition);
    console.log(`✅ Container "${container.id}" created or already exists`);
    
    console.log('\n📋 Container Details:');
    console.log(`  - Database: ${databaseId}`);
    console.log(`  - Container: ${containerDefinition.id}`);
    console.log(`  - Partition Key: /tenantId`);
    console.log(`  - TTL: ${containerDefinition.defaultTtl === -1 ? 'Disabled (no expiration)' : `${containerDefinition.defaultTtl} seconds`}`);
    
    console.log('\n💡 Audit Log Schema:');
    console.log(`  {
    id: string,              // UUID
    tenantId: string,        // Partition key
    timestamp: string,       // ISO 8601
    action: string,          // 'user:create', 'role:change', 'course:publish', etc.
    actor: {
      userId: string,
      email: string,
      role: string,
      name: string
    },
    resource: {
      type: string,          // 'user', 'course', 'tenant', etc.
      id: string,
      name?: string
    },
    changes?: {
      before: any,
      after: any
    },
    metadata?: {
      ipAddress?: string,
      userAgent?: string,
      requestId?: string
    },
    severity: 'info' | 'warning' | 'critical',
    status: 'success' | 'failure'
  }`);

  } catch (error) {
    console.error('❌ Error creating container:', error.message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createAuditLogsContainer()
    .then(() => {
      console.log('\n✅ Setup complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { createAuditLogsContainer };
