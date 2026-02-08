#!/usr/bin/env node
/**
 * Setup Demo Data
 * Creates a demo tenant with sample users for testing
 */

import 'dotenv/config'
import { initializeCosmos } from '../services/cosmosdb.service'
import { createTenant, getTenantBySlug } from '../functions/TenantFunctions'
import { createUser } from '../functions/UserFunctions'

async function main() {
  try {
    await initializeCosmos()
    console.log('✅ Cosmos DB connected\n')

    // Create or get demo tenant
    const tenantSlug = 'kainet'
    let tenant = await getTenantBySlug(tenantSlug)

    if (!tenant) {
      console.log('🔨 Creating demo tenant...')
      tenant = await createTenant({
        name: 'Kainet',
        slug: tenantSlug,
        contactEmail: 'admin@kainet.mx',
        plan: 'professional',
        primaryColor: '#4F46E5',
        secondaryColor: '#10B981'
      })
      console.log(`✅ Tenant created: ${tenant.id}\n`)
    } else {
      console.log(`✅ Tenant exists: ${tenant.id}\n`)
    }

    // Create demo users
    const users = [
      {
        email: 'ana.lopez@kainet.mx',
        firstName: 'Ana',
        lastName: 'López Torres',
        role: 'super-admin' as const,
        password: 'Demo123!'
      },
      {
        email: 'carlos.content@kainet.mx',
        firstName: 'Carlos',
        lastName: 'García',
        role: 'content-manager' as const,
        password: 'Demo123!'
      },
      {
        email: 'maria.instructor@kainet.mx',
        firstName: 'María',
        lastName: 'Rodríguez',
        role: 'instructor' as const,
        password: 'Demo123!'
      },
      {
        email: 'juan.student@kainet.mx',
        firstName: 'Juan',
        lastName: 'Pérez',
        role: 'student' as const,
        password: 'Demo123!'
      }
    ]

    console.log('🔨 Creating demo users...\n')
    
    for (const userData of users) {
      try {
        const user = await createUser({
          tenantId: tenant.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          temporaryPassword: userData.password
        })
        console.log(`✅ Created: ${user.email} (${user.role})`)
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          console.log(`ℹ️  Exists: ${userData.email} (${userData.role})`)
        } else {
          console.error(`❌ Error creating ${userData.email}:`, error.message)
        }
      }
    }

    console.log('\n🎉 Demo setup complete!\n')
    console.log('📋 Login credentials:')
    console.log('   Tenant: kainet')
    console.log('   Super Admin:     ana.lopez@kainet.mx / Demo123!')
    console.log('   Content Manager: carlos.content@kainet.mx / Demo123!')
    console.log('   Instructor:      maria.instructor@kainet.mx / Demo123!')
    console.log('   Student:         juan.student@kainet.mx / Demo123!')
    console.log('\n🌐 Access at: http://localhost:5173')
    console.log('   Use tenant slug: kainet\n')

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()
