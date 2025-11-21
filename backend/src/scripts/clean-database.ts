import { initializeCosmos, getContainer } from '../services/cosmosdb.service';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script to clean all data from Cosmos DB
 * WARNING: This will delete ALL data from all containers
 */
async function cleanDatabase() {
  console.log('🧹 Starting database cleanup...');
  console.log('⚠️  WARNING: This will delete ALL data!');

  try {
    // Initialize Cosmos DB connection
    await initializeCosmos();
    console.log('✅ Connected to Cosmos DB');

    const containers = ['tenants', 'users', 'courses'];
    
    for (const containerName of containers) {
      console.log(`\n🗑️  Cleaning container: ${containerName}`);
      const container = getContainer(containerName);
      
      // Query all items
      const { resources } = await container.items.readAll().fetchAll();
      console.log(`   Found ${resources.length} items`);
      
      // Delete each item
      for (const item of resources) {
        if (!item.id) continue;
        const partitionKey: string = (item as any).tenantId || item.id;
        await container.item(item.id, partitionKey).delete();
        console.log(`   ✓ Deleted: ${item.id}`);
      }
      
      console.log(`✅ Container ${containerName} cleaned`);
    }

    console.log('\n✅ Database cleanup completed!');

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  }
}

// Run the cleanup
cleanDatabase()
  .then(() => {
    console.log('Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
