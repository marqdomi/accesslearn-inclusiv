/**
 * Stripe Billing Service
 * 
 * Handles Stripe integration for subscription management:
 * - Customer creation
 * - Checkout sessions
 * - Billing portal
 * - Webhook processing
 * - Subscription lifecycle
 */

import Stripe from 'stripe';
import { getContainer } from './cosmosdb.service';
import {
  type TenantSubscription,
  type BillingPlan,
  type BillingInterval,
  type SubscriptionStatus,
  type CreateCheckoutRequest,
  PLAN_CATALOG,
} from '../types/billing.types';
import { ulid } from 'ulid';

// Initialize Stripe lazily to avoid crash when STRIPE_SECRET_KEY is not set
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured. Billing features are unavailable.');
    }
    _stripe = new Stripe(key, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return _stripe;
}

function getSubscriptionsContainer() {
  return getContainer('subscriptions');
}

// ============================================
// Plan Helpers
// ============================================

export function getPlanDefinition(planId: BillingPlan) {
  return PLAN_CATALOG.find(p => p.id === planId);
}

export function getPlanLimits(planId: BillingPlan) {
  const plan = getPlanDefinition(planId);
  return plan?.limits || PLAN_CATALOG[0].limits;
}

// ============================================
// Subscription CRUD
// ============================================

export async function getTenantSubscription(tenantId: string): Promise<TenantSubscription | null> {
  const container = getSubscriptionsContainer();
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.type = @type ORDER BY c.createdAt DESC',
    parameters: [
      { name: '@tenantId', value: tenantId },
      { name: '@type', value: 'subscription' },
    ],
  };
  const { resources } = await container.items.query(query).fetchAll();
  return (resources[0] as unknown as TenantSubscription) || null;
}

export async function upsertTenantSubscription(
  sub: TenantSubscription
): Promise<TenantSubscription> {
  const container = getSubscriptionsContainer();
  sub.updatedAt = new Date().toISOString();
  const { resource } = await container.items.upsert(sub);
  return resource as unknown as TenantSubscription;
}

// ============================================
// Stripe Customer Management
// ============================================

export async function getOrCreateStripeCustomer(
  tenantId: string,
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<string> {
  // Check if subscription has a customer ID already
  const existing = await getTenantSubscription(tenantId);
  if (existing?.stripeCustomerId) {
    return existing.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await getStripe().customers.create({
    email,
    name: name || undefined,
    metadata: {
      tenantId,
      ...metadata,
    },
  });

  return customer.id;
}

// ============================================
// Checkout Session
// ============================================

export async function createCheckoutSession(
  tenantId: string,
  request: CreateCheckoutRequest,
  tenantEmail: string
): Promise<{ url: string; sessionId: string }> {
  const plan = getPlanDefinition(request.plan);
  if (!plan) {
    throw new Error(`Plan not found: ${request.plan}`);
  }

  if (plan.id === 'free-trial') {
    throw new Error('Cannot purchase free trial plan');
  }

  const priceId = plan.stripePriceIds?.[request.interval];
  if (!priceId) {
    throw new Error(`No Stripe price configured for ${plan.id}/${request.interval}. Set STRIPE_PRICE_* env vars.`);
  }

  const customerId = await getOrCreateStripeCustomer(
    tenantId,
    request.billingEmail || tenantEmail
  );

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: request.successUrl || `${process.env.FRONTEND_URL}/admin/billing?success=true`,
    cancel_url: request.cancelUrl || `${process.env.FRONTEND_URL}/admin/billing?canceled=true`,
    metadata: {
      tenantId,
      plan: request.plan,
      interval: request.interval,
    },
    subscription_data: {
      metadata: {
        tenantId,
        plan: request.plan,
      },
      trial_period_days: request.plan === 'starter' ? 14 : undefined,
    },
    tax_id_collection: { enabled: true }, // Enable RFC collection for Mexican invoicing
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  });

  return {
    url: session.url!,
    sessionId: session.id,
  };
}

// ============================================
// Billing Portal
// ============================================

export async function createBillingPortalSession(
  tenantId: string,
  returnUrl?: string
): Promise<{ url: string }> {
  const subscription = await getTenantSubscription(tenantId);
  if (!subscription?.stripeCustomerId) {
    throw new Error('No active subscription found. Please subscribe first.');
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: returnUrl || `${process.env.FRONTEND_URL}/admin/billing`,
  });

  return { url: session.url };
}

// ============================================
// Webhook Processing
// ============================================

export function constructWebhookEvent(
  payload: Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }
  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
}

export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;

    default:
      console.log(`[Billing] Unhandled webhook event: ${event.type}`);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenantId;
  if (!tenantId) {
    console.error('[Billing] No tenantId in checkout session metadata');
    return;
  }

  const plan = (session.metadata?.plan || 'starter') as BillingPlan;
  const interval = (session.metadata?.interval || 'monthly') as BillingInterval;

  const subscription: TenantSubscription = {
    id: `sub-${ulid()}`,
    tenantId,
    type: 'subscription',
    plan,
    interval,
    status: 'active',
    stripeCustomerId: session.customer as string,
    stripeSubscriptionId: session.subscription as string,
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    billingEmail: session.customer_details?.email || '',
    billingName: session.customer_details?.name || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await upsertTenantSubscription(subscription);

  // Update tenant plan and limits
  await updateTenantPlan(tenantId, plan);

  console.log(`[Billing] Checkout completed for tenant ${tenantId}, plan: ${plan}`);
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const tenantId = sub.metadata?.tenantId;
  if (!tenantId) return;

  const existing = await getTenantSubscription(tenantId);
  if (!existing) return;

  const stripeStatus = sub.status;
  const statusMap: Record<string, SubscriptionStatus> = {
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
  };

  existing.status = statusMap[stripeStatus] || 'active';
  // Period dates from Stripe subscription items
  const currentItem = sub.items?.data?.[0];
  if (currentItem?.current_period_start) {
    existing.currentPeriodStart = new Date(currentItem.current_period_start * 1000).toISOString();
  }
  if (currentItem?.current_period_end) {
    existing.currentPeriodEnd = new Date(currentItem.current_period_end * 1000).toISOString();
  }
  
  if (sub.cancel_at) {
    existing.canceledAt = new Date(sub.cancel_at * 1000).toISOString();
  }

  await upsertTenantSubscription(existing);
  console.log(`[Billing] Subscription updated for ${tenantId}: ${existing.status}`);
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const tenantId = sub.metadata?.tenantId;
  if (!tenantId) return;

  const existing = await getTenantSubscription(tenantId);
  if (!existing) return;

  existing.status = 'canceled';
  existing.canceledAt = new Date().toISOString();

  await upsertTenantSubscription(existing);

  // Downgrade tenant to free-trial limits
  await updateTenantPlan(tenantId, 'free-trial');

  console.log(`[Billing] Subscription canceled for tenant ${tenantId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  console.warn(`[Billing] Payment failed for customer ${customerId}, invoice ${invoice.id}`);
  // Could send notification to tenant-admin here
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`[Billing] Invoice paid: ${invoice.id}, amount: ${invoice.amount_paid}`);
}

// ============================================
// Tenant Plan Updates
// ============================================

async function updateTenantPlan(tenantId: string, plan: BillingPlan) {
  const planDef = getPlanDefinition(plan);
  if (!planDef) return;

  const container = getContainer('tenants');
  
  // Tenant model now uses BillingPlan directly — no mapping needed
  try {
    const { resource: tenant } = await container.item(tenantId, tenantId).read();
    if (!tenant) return;

    tenant.plan = plan;
    tenant.maxUsers = planDef.limits.maxUsers;
    tenant.maxCourses = planDef.limits.maxCourses;
    tenant.updatedAt = new Date().toISOString();

    await container.item(tenantId, tenantId).replace(tenant);
    console.log(`[Billing] Tenant ${tenantId} updated to plan ${plan}`);
  } catch (error) {
    console.error(`[Billing] Error updating tenant plan:`, error);
  }
}

// ============================================
// Billing Stats
// ============================================

export async function getBillingStats(tenantId: string) {
  const subscription = await getTenantSubscription(tenantId);
  const plan = subscription ? getPlanDefinition(subscription.plan) : getPlanDefinition('free-trial');

  return {
    currentPlan: subscription?.plan || 'free-trial',
    planName: plan?.name || 'Prueba Gratuita',
    status: subscription?.status || 'trialing',
    interval: subscription?.interval || null,
    currentPeriodEnd: subscription?.currentPeriodEnd || null,
    canceledAt: subscription?.canceledAt || null,
    limits: plan?.limits || PLAN_CATALOG[0].limits,
    pricing: plan?.pricing || { monthly: 0, yearly: 0 },
    hasActiveSubscription: subscription?.status === 'active' || subscription?.status === 'trialing',
  };
}
