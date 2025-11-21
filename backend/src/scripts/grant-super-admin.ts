import { initializeCosmos, getContainer } from '../services/cosmosdb.service';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script to grant super admin permissions to any_g_a@hotmail.com
 */
async function grantSuperAdmin() {
  console.log('🔐 Granting super admin permissions...');

  try {
    await initializeCosmos();
    console.log('✅ Connected to Cosmos DB');

    const usersContainer = getContainer('users');
    const userId = 'any_g_a@hotmail.com';
    const tenantId = 'dra-amayrani-gomez';

    // Fetch the user
    const { resource: user } = await usersContainer
      .item(userId, tenantId)
      .read();

    if (!user) {
      console.error('❌ User not found');
      process.exit(1);
    }

    console.log(`Found user: ${user.email}`);

    // Update with super admin permissions
    user.role = 'admin'; // Keep as admin (highest role)
    user.permissions = [
      // User management
      'users:view',
      'users:create',
      'users:edit',
      'users:delete',
      'users:invite',
      'users:manage-roles',
      'users:impersonate',
      
      // Content management
      'content:view',
      'content:create',
      'content:edit',
      'content:delete',
      'content:archive',
      'content:publish',
      'content:approve',
      'content:reject',
      
      // Course management
      'courses:view-all',
      'courses:create',
      'courses:edit-all',
      'courses:delete-all',
      'courses:publish',
      'courses:approve',
      'courses:manage-enrollment',
      
      // Analytics and reporting
      'analytics:view',
      'analytics:export',
      'analytics:view-all-tenants',
      
      // Settings and configuration
      'settings:manage',
      'settings:manage-tenant',
      'settings:manage-billing',
      'settings:manage-integrations',
      
      // Mentorship
      'mentorship:manage',
      'mentorship:view-all',
      'mentorship:assign',
      
      // Q&A and community
      'qanda:moderate',
      'qanda:delete-any',
      'community:moderate',
      
      // Certificates
      'certificates:view-all',
      'certificates:issue',
      'certificates:revoke',
      
      // System
      'system:admin',
      'system:debug',
      'tenants:list-all',
      'tenants:create',
      'tenants:edit',
      'tenants:delete',
    ];

    // Update the user
    await usersContainer.items.upsert(user);

    console.log('\n✅ Super admin permissions granted!');
    console.log('\n📋 Summary:');
    console.log(`   User: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Permissions: ${user.permissions.length} total`);
    console.log('\n🔓 User now has full access to all features');

  } catch (error) {
    console.error('❌ Error granting permissions:', error);
    throw error;
  }
}

// Run the script
grantSuperAdmin()
  .then(() => {
    console.log('Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
