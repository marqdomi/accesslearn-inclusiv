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

    // Update with super admin role and permissions
    user.role = 'super-admin'; // Set to super-admin (highest role)
    user.customPermissions = [
      // User management
      'users:read',
      'users:create',
      'users:update',
      'users:delete',
      'users:list',
      'users:change-role',
      'users:change-status',
      
      // Content management
      'content:create',
      'content:edit',
      'content:archive',
      'content:delete',
      'content:review',
      'content:approve',
      'content:reject',
      'content:request-changes',
      
      // Course management
      'courses:create',
      'courses:read',
      'courses:update',
      'courses:delete',
      'courses:publish',
      'courses:archive',
      'courses:list-all',
      'courses:list-own',
      
      // Enrollment
      'enrollment:assign-individual',
      'enrollment:assign-bulk',
      'enrollment:remove',
      'enrollment:view',
      
      // Groups
      'groups:create',
      'groups:read',
      'groups:update',
      'groups:delete',
      'groups:assign-users',
      'groups:assign-courses',
      
      // Analytics and reporting
      'analytics:view-all',
      'analytics:view-own',
      'analytics:export',
      'analytics:view-user-progress',
      'analytics:view-course-stats',
      'analytics:view-team-stats',
      
      // Gamification
      'gamification:configure-xp',
      'gamification:create-badges',
      'gamification:manage-leaderboards',
      
      // Mentorship
      'mentorship:configure',
      'mentorship:view-all-sessions',
      'mentorship:view-own-sessions',
      'mentorship:accept-requests',
      'mentorship:rate-sessions',
      
      // Settings and configuration
      'settings:branding',
      'settings:notifications',
      'settings:integrations',
      'settings:languages',
      'settings:compliance',
      
      // Audit
      'audit:view-logs',
      'audit:export-logs',
      
      // Assets
      'assets:upload',
      'assets:manage',
      'assets:delete',
      
      // Tenants
      'tenants:create',
      'tenants:read',
      'tenants:update',
      'tenants:delete',
      'tenants:list-all',
    ];

    // Update the user
    await usersContainer.items.upsert(user);

    console.log('\n✅ Super admin permissions granted!');
    console.log('\n📋 Summary:');
    console.log(`   User: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Permissions: ${user.customPermissions.length} total`);
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
