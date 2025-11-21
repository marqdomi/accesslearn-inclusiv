#!/usr/bin/env node
/**
 * Update Passwords for Existing Users
 * Adds Demo123! password to all demo users
 */

import 'dotenv/config'
import { initializeCosmos, getContainer } from '../services/cosmosdb.service'

async function main() {
  try {
    await initializeCosmos()
    console.log('✅ Cosmos DB connected\n')

    const usersContainer = getContainer('users')
    
    // List of users to update
    const usersToUpdate = [
      { email: 'ana.lopez@kainet.mx', tenantId: 'tenant-kainet' },
      { email: 'carlos.content@kainet.mx', tenantId: 'tenant-kainet' },
      { email: 'maria.instructor@kainet.mx', tenantId: 'tenant-kainet' },
      { email: 'juan.student@kainet.mx', tenantId: 'tenant-kainet' }
    ]

    console.log('🔨 Updating user passwords...\n')

    for (const userData of usersToUpdate) {
      try {
        // Query user
        const query = {
          query: 'SELECT * FROM c WHERE c.email = @email AND c.tenantId = @tenantId',
          parameters: [
            { name: '@email', value: userData.email },
            { name: '@tenantId', value: userData.tenantId }
          ]
        }

        const { resources } = await usersContainer.items.query(query).fetchAll()

        if (resources.length > 0) {
          const user = resources[0]
          
          // Update password
          user.password = 'Demo123!'
          user.passwordResetRequired = false
          user.updatedAt = new Date().toISOString()

          await usersContainer.items.upsert(user)
          console.log(`✅ Updated password for: ${userData.email}`)
        } else {
          console.log(`⚠️  User not found: ${userData.email}`)
        }
      } catch (error: any) {
        console.error(`❌ Error updating ${userData.email}:`, error.message)
      }
    }

    console.log('\n🎉 Password update complete!')
    console.log('\n📋 All users now have password: Demo123!')
    
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

main()
