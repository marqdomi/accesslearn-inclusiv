/**
 * Seed Platform Admin Data
 * Creates initial subscriptions, invoices, and platform settings
 */
import { CosmosClient } from '@azure/cosmos'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

dotenv.config()

const COSMOS_ENDPOINT = process.env.COSMOS_ENDPOINT!
const COSMOS_KEY = process.env.COSMOS_KEY!
const COSMOS_DATABASE = process.env.COSMOS_DATABASE!

async function seedPlatformData() {
  console.log('🌱 Seeding Platform Admin data...\n')
  
  const client = new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY })
  const database = client.database(COSMOS_DATABASE)
  
  // Get existing tenants
  const tenantsContainer = database.container('tenants')
  const { resources: tenants } = await tenantsContainer.items
    .query('SELECT * FROM c')
    .fetchAll()
  
  console.log(`📊 Found ${tenants.length} tenants\n`)
  
  // ============================================
  // Seed Platform Settings
  // ============================================
  console.log('⚙️  Seeding platform settings...')
  const settingsContainer = database.container('platform-settings')
  
  const platformSettings = {
    id: 'global-settings',
    platformName: 'AccessLearn Inclusiv',
    supportEmail: 'soporte@kainet.mx',
    maintenanceMode: false,
    defaultLanguage: 'es',
    allowedLanguages: ['es', 'en'],
    security: {
      requireMfa: false,
      sessionTimeout: 60, // minutes
      maxLoginAttempts: 5,
      passwordMinLength: 8
    },
    email: {
      provider: 'resend',
      fromEmail: 'newsletter@kainet.mx',
      fromName: 'AccessLearn Inclusiv'
    },
    branding: {
      primaryColor: '#6366F1',
      secondaryColor: '#8B5CF6'
    },
    features: {
      gamification: true,
      mentorship: true,
      certificates: true,
      forums: true,
      analytics: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: 'system'
  }
  
  await settingsContainer.items.upsert(platformSettings)
  console.log('   ✅ Platform settings created')
  
  // ============================================
  // Seed Subscriptions
  // ============================================
  console.log('\n💳 Seeding subscriptions...')
  const subscriptionsContainer = database.container('subscriptions')
  
  const planPricing: Record<string, number> = {
    'starter': 29,
    'profesional': 99,
    'enterprise': 299
  }
  
  for (const tenant of tenants) {
    // Check if subscription already exists
    const { resources: existing } = await subscriptionsContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
        parameters: [{ name: '@tenantId', value: tenant.id }]
      })
      .fetchAll()
    
    if (existing.length > 0) {
      console.log(`   ⏭️  Subscription already exists for ${tenant.name}`)
      continue
    }
    
    const now = new Date()
    const startDate = new Date(tenant.subscriptionStartDate || tenant.createdAt)
    const nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, startDate.getDate())
    
    const subscription = {
      id: `sub-${uuidv4()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      plan: tenant.plan || 'profesional',
      status: tenant.status === 'active' ? 'active' : 'canceled',
      priceMonthly: planPricing[tenant.plan] || 99,
      billingCycle: 'monthly',
      startDate: startDate.toISOString(),
      nextBillingDate: nextBillingDate.toISOString(),
      autoRenew: true,
      paymentMethod: 'card_**** 4242',
      createdAt: startDate.toISOString(),
      updatedAt: now.toISOString()
    }
    
    await subscriptionsContainer.items.create(subscription)
    console.log(`   ✅ Subscription created for ${tenant.name} (${tenant.plan}: $${subscription.priceMonthly}/mo)`)
  }
  
  // ============================================
  // Seed Invoices
  // ============================================
  console.log('\n🧾 Seeding invoices...')
  const invoicesContainer = database.container('invoices')
  
  for (const tenant of tenants) {
    // Check if invoices already exist
    const { resources: existing } = await invoicesContainer.items
      .query({
        query: 'SELECT VALUE COUNT(1) FROM c WHERE c.tenantId = @tenantId',
        parameters: [{ name: '@tenantId', value: tenant.id }]
      })
      .fetchAll()
    
    if (existing[0] > 0) {
      console.log(`   ⏭️  Invoices already exist for ${tenant.name}`)
      continue
    }
    
    const price = planPricing[tenant.plan] || 99
    const startDate = new Date(tenant.subscriptionStartDate || tenant.createdAt)
    
    // Generate invoices for past months
    const today = new Date()
    const monthsActive = Math.min(
      Math.floor((today.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000)),
      3 // Max 3 past invoices
    )
    
    for (let i = 0; i <= monthsActive; i++) {
      const invoiceDate = new Date(startDate)
      invoiceDate.setMonth(invoiceDate.getMonth() + i)
      
      const dueDate = new Date(invoiceDate)
      dueDate.setDate(dueDate.getDate() + 15)
      
      const isPaid = i < monthsActive || (i === monthsActive && today.getDate() > 15)
      
      const invoice = {
        id: `inv-${uuidv4()}`,
        tenantId: tenant.id,
        tenantName: tenant.name,
        subscriptionId: `sub-${tenant.id}`,
        amount: price,
        currency: 'USD',
        status: isPaid ? 'paid' : 'pending',
        issueDate: invoiceDate.toISOString(),
        dueDate: dueDate.toISOString(),
        paidDate: isPaid ? new Date(dueDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        items: [
          {
            description: `Plan ${tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)} - ${invoiceDate.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}`,
            quantity: 1,
            unitPrice: price,
            total: price
          }
        ],
        createdAt: invoiceDate.toISOString()
      }
      
      await invoicesContainer.items.create(invoice)
    }
    
    console.log(`   ✅ ${monthsActive + 1} invoices created for ${tenant.name}`)
  }
  
  // ============================================
  // Seed Platform Alerts
  // ============================================
  console.log('\n🔔 Seeding platform alerts...')
  const alertsContainer = database.container('platform-alerts')
  
  // Check if alerts already exist
  const { resources: existingAlerts } = await alertsContainer.items
    .query('SELECT VALUE COUNT(1) FROM c')
    .fetchAll()
  
  if (existingAlerts[0] > 0) {
    console.log('   ⏭️  Alerts already exist, skipping...')
  } else {
    const alerts = [
      {
        id: `alert-${uuidv4()}`,
        type: 'info',
        category: 'system',
        title: 'Sistema Actualizado',
        message: 'Se ha desplegado la nueva versión del Platform Admin Console con funcionalidades mejoradas.',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: `alert-${uuidv4()}`,
        type: 'success',
        category: 'tenant',
        title: 'Nuevo Tenant Registrado',
        message: 'El tenant "Kainet" se ha registrado exitosamente en la plataforma.',
        tenantId: 'tenant-kainet',
        tenantName: 'Kainet',
        isRead: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      },
      {
        id: `alert-${uuidv4()}`,
        type: 'warning',
        category: 'billing',
        title: 'Factura Próxima a Vencer',
        message: 'La factura de LaboralMX vence en 5 días.',
        tenantId: 'tenant-laboralmx',
        tenantName: 'LaboralMX',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      }
    ]
    
    for (const alert of alerts) {
      await alertsContainer.items.create(alert)
    }
    console.log(`   ✅ ${alerts.length} alerts created`)
  }
  
  // ============================================
  // Summary
  // ============================================
  console.log('\n' + '='.repeat(50))
  console.log('✨ Platform Admin data seeding complete!')
  console.log('='.repeat(50))
  console.log('\nData created:')
  console.log('  • Platform settings: 1 document')
  console.log(`  • Subscriptions: ${tenants.length} documents`)
  console.log(`  • Invoices: Multiple per tenant`)
  console.log('  • Alerts: 3 sample documents')
  console.log('\nYou can now test the Platform Admin Console!')
}

seedPlatformData().catch(console.error)
