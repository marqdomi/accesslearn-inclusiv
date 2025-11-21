#!/usr/bin/env node
/**
 * Update Ana's role to super-admin
 */

import 'dotenv/config'
import { initializeCosmos, getContainer } from '../services/cosmosdb.service'

async function main() {
  try {
    await initializeCosmos()
    console.log('✅ Cosmos DB connected\n')

    const usersContainer = getContainer('users')
    
    console.log('🔨 Updating Ana\'s role to super-admin...\n')

    // Query user
    const query = {
      query: 'SELECT * FROM c WHERE c.email = @email AND c.tenantId = @tenantId',
      parameters: [
        { name: '@email', value: 'ana.lopez@kainet.mx' },
        { name: '@tenantId', value: 'tenant-kainet' }
      ]
    }

    const { resources } = await usersContainer.items.query(query).fetchAll()

    if (resources.length > 0) {
      const user = resources[0]
      
      console.log(`Current role: ${user.role}`)
      
      // Update role
      user.role = 'super-admin'
      user.updatedAt = new Date().toISOString()

      await usersContainer.items.upsert(user)
      console.log(`✅ Updated Ana's role to: super-admin`)
    } else {
      console.log(`⚠️  User not found: ana.lopez@kainet.mx`)
    }

    console.log('\n🎉 Role update complete!')
    
  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

main()
