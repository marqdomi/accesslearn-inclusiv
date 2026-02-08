import { CosmosClient } from '@azure/cosmos';
import dotenv from 'dotenv';
dotenv.config();
const client = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT!, key: process.env.COSMOS_KEY! });
const db = client.database('accesslearn-db');

async function check() {
  const collections = [
    'users', 'courses', 'user-progress', 'mentorship-requests', 'mentorship-sessions',
    'forums', 'notifications', 'quiz-attempts', 'activity-feed', 'achievements',
    'user-groups', 'course-assignments', 'categories', 'company-settings',
    'certificate-templates', 'certificates', 'audit-logs',
  ];
  console.log('=== Cosmos DB Collection Counts (tenant-kainet) ===');
  for (const name of collections) {
    try {
      const { resources } = await db.container(name).items.query({
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.tenantId = @t',
        parameters: [{ name: '@t', value: 'tenant-kainet' }]
      }).fetchAll();
      console.log(`  ${name.padEnd(25)} ${resources[0]} items`);
    } catch (e: any) {
      console.log(`  ${name.padEnd(25)} (error: ${e.message?.slice(0,50)})`);
    }
  }
}
check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
