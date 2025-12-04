/**
 * Script to seed accessibility profiles for all existing tenants
 * 
 * Usage: ts-node seed-all-tenants-profiles.ts
 */

import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file in project root
// This ensures the script works whether run from root or backend directory
// __dirname points to backend/src/scripts when compiled, so we go up 3 levels to reach project root
const envPath = path.resolve(__dirname, '../../../.env')
dotenv.config({ path: envPath })

import { initializeCosmos } from '../services/cosmosdb.service'
import { listTenants } from '../functions/TenantFunctions'
import { seedAccessibilityProfiles } from './seed-accessibility-profiles'

async function seedAllTenants() {
  try {
    console.log('[Seed All] Initializing Cosmos DB...')
    await initializeCosmos()

    console.log('[Seed All] Fetching all tenants...')
    const tenants = await listTenants()

    if (tenants.length === 0) {
      console.log('[Seed All] No tenants found')
      return
    }

    console.log(`[Seed All] Found ${tenants.length} tenant(s)`)
    console.log('[Seed All] Starting seed process...\n')

    let successCount = 0
    let errorCount = 0

    for (const tenant of tenants) {
      try {
        console.log(`[Seed All] Processing tenant: ${tenant.name} (${tenant.id})...`)
        await seedAccessibilityProfiles(tenant.id)
        console.log(`[Seed All] ✅ Successfully seeded profiles for tenant: ${tenant.name}\n`)
        successCount++
      } catch (error: any) {
        console.error(`[Seed All] ❌ Error seeding profiles for tenant ${tenant.name}:`, error.message)
        errorCount++
      }
    }

    console.log('\n[Seed All] ==========================================')
    console.log(`[Seed All] Summary:`)
    console.log(`[Seed All]   Total tenants: ${tenants.length}`)
    console.log(`[Seed All]   Success: ${successCount}`)
    console.log(`[Seed All]   Errors: ${errorCount}`)
    console.log('[Seed All] ==========================================\n')
  } catch (error: any) {
    console.error('[Seed All] Fatal error:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedAllTenants()
    .then(() => {
      console.log('[Seed All] Process completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('[Seed All] Process failed:', error)
      process.exit(1)
    })
}

export { seedAllTenants }

