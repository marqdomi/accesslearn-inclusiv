/**
 * Tests for Billing Service
 *
 * Covers plan catalog, billing stats, and service functions
 * (Stripe API calls are mocked)
 */

jest.mock('../src/services/cosmosdb.service', () => {
  const mockContainer = {
    items: {
      query: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
    },
    item: jest.fn(),
  }
  return {
    getContainer: jest.fn().mockReturnValue(mockContainer),
    initializeCosmos: jest.fn(),
  }
})

jest.mock('../src/services/applicationinsights.service', () => ({
  trackEvent: jest.fn(),
  trackException: jest.fn(),
  trackMetric: jest.fn(),
  initializeAppInsights: jest.fn(),
}))

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      list: jest.fn().mockResolvedValue({ data: [] }),
      create: jest.fn().mockResolvedValue({ id: 'cus_test_123' }),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/test',
        }),
      },
    },
    billingPortal: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          url: 'https://billing.stripe.com/test',
        }),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
    subscriptions: {
      retrieve: jest.fn().mockResolvedValue({
        id: 'sub_test_123',
        status: 'active',
        items: { data: [{ price: { id: 'price_test' }, current_period_start: 1000, current_period_end: 2000 }] },
        metadata: { tenantId: 'tenant-test', plan: 'starter' },
      }),
    },
  }))
})

import { PLAN_CATALOG } from '../src/types/billing.types'
import {
  getPlanDefinition,
  getPlanLimits,
  getBillingStats,
  getTenantSubscription,
} from '../src/services/billing.service'
import { getContainer } from '../src/services/cosmosdb.service'
import { TEST_TENANT_ID } from './helpers/fixtures'

const mockContainer = (getContainer as jest.Mock)()

describe('Billing Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PLAN_CATALOG', () => {
    it('should define exactly 4 plans', () => {
      expect(PLAN_CATALOG).toHaveLength(4)
    })

    it('should include free-trial, starter, professional, enterprise', () => {
      const ids = PLAN_CATALOG.map((p) => p.id)
      expect(ids).toEqual(['free-trial', 'starter', 'professional', 'enterprise'])
    })

    it('should have free-trial priced at 0', () => {
      const freeTrial = PLAN_CATALOG.find((p) => p.id === 'free-trial')
      expect(freeTrial?.pricing.monthly).toBe(0)
      expect(freeTrial?.pricing.yearly).toBe(0)
    })

    it('should have correct MXN pricing for starter', () => {
      const starter = PLAN_CATALOG.find((p) => p.id === 'starter')
      expect(starter?.pricing.monthly).toBe(299900) // $2,999 MXN in centavos
    })

    it('should have professional plan with STPS enabled', () => {
      const pro = PLAN_CATALOG.find((p) => p.id === 'professional')
      expect(pro?.limits.stpsEnabled).toBe(true)
    })

    it('should have enterprise as the most expensive plan', () => {
      const enterprise = PLAN_CATALOG.find((p) => p.id === 'enterprise')
      const professional = PLAN_CATALOG.find((p) => p.id === 'professional')
      expect(enterprise!.pricing.monthly).toBeGreaterThan(professional!.pricing.monthly)
    })

    it('should give yearly pricing discount vs monthly*12', () => {
      for (const plan of PLAN_CATALOG) {
        if (plan.pricing.monthly > 0) {
          expect(plan.pricing.yearly).toBeLessThan(plan.pricing.monthly * 12)
        }
      }
    })

    it('should have all plans with features list', () => {
      for (const plan of PLAN_CATALOG) {
        expect(plan.features.length).toBeGreaterThan(0)
        expect(plan.name).toBeTruthy()
        expect(plan.description).toBeTruthy()
      }
    })
  })

  describe('getPlanDefinition', () => {
    it('should return plan for valid ID', () => {
      const plan = getPlanDefinition('starter')
      expect(plan).toBeDefined()
      expect(plan?.id).toBe('starter')
    })

    it('should return undefined for invalid ID', () => {
      const plan = getPlanDefinition('nonexistent' as any)
      expect(plan).toBeUndefined()
    })
  })

  describe('getPlanLimits', () => {
    it('should return limits for free-trial', () => {
      const limits = getPlanLimits('free-trial')
      expect(limits.maxUsers).toBe(10)
      expect(limits.maxCourses).toBe(3)
    })

    it('should return limits for enterprise', () => {
      const limits = getPlanLimits('enterprise')
      expect(limits.maxUsers).toBe(9999)
      expect(limits.apiAccess).toBe(true)
    })
  })

  describe('getTenantSubscription', () => {
    it('should return null when no subscription exists', async () => {
      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: [] }),
      })

      const result = await getTenantSubscription(TEST_TENANT_ID)

      expect(result).toBeNull()
    })

    it('should return subscription when it exists', async () => {
      const subscription = {
        id: 'sub-test-001',
        tenantId: TEST_TENANT_ID,
        type: 'subscription',
        plan: 'starter',
        status: 'active',
      }

      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: [subscription] }),
      })

      const result = await getTenantSubscription(TEST_TENANT_ID)

      expect(result).toBeDefined()
      expect(result?.plan).toBe('starter')
    })
  })

  describe('getBillingStats', () => {
    it('should return default stats for tenant without subscription', async () => {
      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: [] }),
      })

      const result = await getBillingStats(TEST_TENANT_ID)

      expect(result).toBeDefined()
      expect(result.currentPlan).toBe('free-trial')
      expect(result.status).toBe('trialing')
    })

    it('should return stats for tenant with active subscription', async () => {
      const subscription = {
        id: 'sub-test-001',
        tenantId: TEST_TENANT_ID,
        type: 'subscription',
        plan: 'professional',
        interval: 'monthly',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }

      mockContainer.items.query.mockReturnValue({
        fetchAll: jest.fn().mockResolvedValue({ resources: [subscription] }),
      })

      const result = await getBillingStats(TEST_TENANT_ID)

      expect(result.currentPlan).toBe('professional')
      expect(result.status).toBe('active')
      expect(result.hasActiveSubscription).toBe(true)
    })
  })
})
