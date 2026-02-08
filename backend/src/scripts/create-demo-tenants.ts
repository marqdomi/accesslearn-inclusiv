#!/usr/bin/env node
/**
 * Create Demo Tenants
 * 
 * Creates two new tenants for demos:
 * 1. LaboralMX - with super admin admin@laboral.mx
 * 2. Dra. Amayrani Gómez Alonso - with super admin any_g_a@hotmail.com
 * 
 * Password for both: Demo123!
 */

import 'dotenv/config'
import { initializeCosmos } from '../services/cosmosdb.service'
import { createTenant, getTenantBySlug } from '../functions/TenantFunctions'
import { createUser } from '../functions/UserFunctions'
import * as crypto from 'crypto'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function main() {
  try {
    await initializeCosmos()
    console.log('✅ Cosmos DB connected\n')

    // ============================================
    // 1. CREATE LABORALMX TENANT
    // ============================================
    console.log('📋 Step 1: Setting up LaboralMX tenant...')
    const laboralSlug = 'laboralmx'
    let laboralTenant = await getTenantBySlug(laboralSlug)

    if (!laboralTenant) {
      console.log('  🔨 Creating LaboralMX tenant...')
      laboralTenant = await createTenant({
        name: 'LaboralMX',
        slug: laboralSlug,
        contactEmail: 'admin@laboral.mx',
        plan: 'professional',
        primaryColor: '#1E40AF', // Azul corporativo
        secondaryColor: '#059669' // Verde
      })
      console.log(`  ✅ Tenant created: ${laboralTenant.id}\n`)
    } else {
      console.log(`  ✅ Tenant exists: ${laboralTenant.id}\n`)
    }

    // Create super admin for LaboralMX
    console.log('  👤 Creating super admin for LaboralMX...')
    try {
      const { getContainer } = await import('../services/cosmosdb.service')
      const usersContainer = getContainer('users')
      const { resources: existingUsers } = await usersContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.email = @email',
          parameters: [
            { name: '@tenantId', value: laboralTenant.id },
            { name: '@email', value: 'admin@laboral.mx' }
          ]
        })
        .fetchAll()

      if (existingUsers.length > 0) {
        // Update existing user
        const existingUser = existingUsers[0]
        const updatedUser = {
          ...existingUser,
          role: 'super-admin',
          password: hashPassword('Demo123!'),
          passwordResetRequired: false,
          status: 'active',
          updatedAt: new Date().toISOString()
        }
        await usersContainer.items.upsert(updatedUser)
        console.log(`  ✅ Updated: admin@laboral.mx (${updatedUser.role})\n`)
      } else {
        // Create new user
        let user = await createUser({
          tenantId: laboralTenant.id,
          email: 'admin@laboral.mx',
          firstName: 'Admin',
          lastName: 'LaboralMX',
          role: 'super-admin',
          temporaryPassword: 'Demo123!'
        })
        
        // Hash password and update
        user = {
          ...user,
          password: hashPassword('Demo123!'),
          passwordResetRequired: false,
          status: 'active'
        }
        await usersContainer.items.upsert(user)
        console.log(`  ✅ Created: ${user.email} (${user.role})\n`)
      }
    } catch (error: any) {
      console.error(`  ❌ Error creating admin@laboral.mx:`, error.message)
    }

    // ============================================
    // 2. CREATE DRA. AMAYRANI GÓMEZ ALONSO TENANT
    // ============================================
    console.log('📋 Step 2: Setting up Dra. Amayrani Gómez Alonso tenant...')
    const draSlug = 'dra-amayrani-gomez-alonso'
    let draTenant = await getTenantBySlug(draSlug)

    if (!draTenant) {
      console.log('  🔨 Creating Dra. Amayrani Gómez Alonso tenant...')
      draTenant = await createTenant({
        name: 'Dra. Amayrani Gómez Alonso',
        slug: draSlug,
        contactEmail: 'any_g_a@hotmail.com',
        plan: 'professional',
        primaryColor: '#2563EB', // Azul médico
        secondaryColor: '#10B981' // Verde salud
      })
      console.log(`  ✅ Tenant created: ${draTenant.id}\n`)
    } else {
      console.log(`  ✅ Tenant exists: ${draTenant.id}\n`)
    }

    // Create super admin for Dra. Amayrani
    console.log('  👤 Creating super admin for Dra. Amayrani Gómez Alonso...')
    try {
      const { getContainer } = await import('../services/cosmosdb.service')
      const usersContainer = getContainer('users')
      const { resources: existingUsers } = await usersContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.email = @email',
          parameters: [
            { name: '@tenantId', value: draTenant.id },
            { name: '@email', value: 'any_g_a@hotmail.com' }
          ]
        })
        .fetchAll()

      if (existingUsers.length > 0) {
        // Update existing user
        const existingUser = existingUsers[0]
        const updatedUser = {
          ...existingUser,
          role: 'super-admin',
          password: hashPassword('Demo123!'),
          passwordResetRequired: false,
          status: 'active',
          updatedAt: new Date().toISOString()
        }
        await usersContainer.items.upsert(updatedUser)
        console.log(`  ✅ Updated: any_g_a@hotmail.com (${updatedUser.role})\n`)
      } else {
        // Create new user
        let user = await createUser({
          tenantId: draTenant.id,
          email: 'any_g_a@hotmail.com',
          firstName: 'Amayrani',
          lastName: 'Gómez Alonso',
          role: 'super-admin',
          temporaryPassword: 'Demo123!'
        })
        
        // Hash password and update
        user = {
          ...user,
          password: hashPassword('Demo123!'),
          passwordResetRequired: false,
          status: 'active'
        }
        await usersContainer.items.upsert(user)
        console.log(`  ✅ Created: ${user.email} (${user.role})\n`)
      }
    } catch (error: any) {
      console.error(`  ❌ Error creating any_g_a@hotmail.com:`, error.message)
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n🎉 Demo tenants setup complete!\n')
    console.log('📋 Login credentials:\n')
    
    console.log('🏢 LaboralMX:')
    console.log('   Tenant Slug: laboralmx')
    console.log('   Super Admin: admin@laboral.mx / Demo123!')
    console.log('   Access: http://localhost:5173/login?tenant=laboralmx\n')
    
    console.log('🏥 Dra. Amayrani Gómez Alonso:')
    console.log('   Tenant Slug: dra-amayrani-gomez-alonso')
    console.log('   Super Admin: any_g_a@hotmail.com / Demo123!')
    console.log('   Access: http://localhost:5173/login?tenant=dra-amayrani-gomez-alonso\n')

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()

