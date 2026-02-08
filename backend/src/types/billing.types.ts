/**
 * Billing Types
 * 
 * Types for subscription management, Stripe integration,
 * and billing features.
 */

export type BillingPlan = 'free-trial' | 'starter' | 'professional' | 'enterprise';
export type BillingInterval = 'monthly' | 'yearly';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';

export interface PlanDefinition {
  id: BillingPlan;
  name: string;
  description: string;
  features: string[];
  limits: {
    maxUsers: number;
    maxCourses: number;
    maxStorageGB: number;
    stpsEnabled: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
  };
  pricing: {
    monthly: number;    // MXN cents
    yearly: number;     // MXN cents (per year)
  };
  stripePriceIds?: {
    monthly: string;
    yearly: string;
  };
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  type: 'subscription';
  
  // Plan info
  plan: BillingPlan;
  interval: BillingInterval;
  status: SubscriptionStatus;
  
  // Stripe references
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  
  // Dates
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  canceledAt?: string;
  
  // Billing info
  billingEmail: string;
  billingName?: string;
  rfc?: string;               // For Mexican invoicing
  razonSocial?: string;       // For CFDI
  regimenFiscal?: string;     // SAT regime
  usoCFDI?: string;           // CFDI use code
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheckoutRequest {
  plan: BillingPlan;
  interval: BillingInterval;
  billingEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface BillingPortalRequest {
  returnUrl?: string;
}

export interface WebhookEvent {
  type: string;
  data: {
    object: Record<string, any>;
  };
}

// Plan catalog — single source of truth
export const PLAN_CATALOG: PlanDefinition[] = [
  {
    id: 'free-trial',
    name: 'Prueba Gratuita',
    description: '14 días para explorar la plataforma',
    features: [
      'Hasta 10 usuarios',
      '3 cursos',
      '1 GB de almacenamiento',
      'Soporte por correo',
    ],
    limits: {
      maxUsers: 10,
      maxCourses: 3,
      maxStorageGB: 1,
      stpsEnabled: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
    },
    pricing: { monthly: 0, yearly: 0 },
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para equipos pequeños que inician su capacitación',
    features: [
      'Hasta 50 usuarios',
      '10 cursos',
      '5 GB de almacenamiento',
      'Certificados personalizados',
      'Analytics básico',
      'Soporte por correo',
    ],
    limits: {
      maxUsers: 50,
      maxCourses: 10,
      maxStorageGB: 5,
      stpsEnabled: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
    },
    pricing: { monthly: 299900, yearly: 2999000 }, // $2,999 MXN/mo, $29,990/yr
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Todo lo necesario para cumplimiento STPS',
    features: [
      'Hasta 250 usuarios',
      'Cursos ilimitados',
      '25 GB de almacenamiento',
      'Constancias DC-3 / DC-4',
      'Branding personalizado',
      'Analytics avanzado',
      'Mentoría integrada',
      'Soporte prioritario',
    ],
    limits: {
      maxUsers: 250,
      maxCourses: 999,
      maxStorageGB: 25,
      stpsEnabled: true,
      customBranding: true,
      apiAccess: false,
      prioritySupport: true,
    },
    pricing: { monthly: 699900, yearly: 6999000 }, // $6,999 MXN/mo, $69,990/yr
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes organizaciones con necesidades avanzadas',
    features: [
      'Usuarios ilimitados',
      'Cursos ilimitados',
      '100 GB de almacenamiento',
      'Constancias DC-3 / DC-4',
      'Branding completo',
      'Acceso API',
      'Analytics avanzado + BI export',
      'SSO / Active Directory',
      'Soporte dedicado 24/7',
      'SLA garantizado',
    ],
    limits: {
      maxUsers: 9999,
      maxCourses: 9999,
      maxStorageGB: 100,
      stpsEnabled: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
    },
    pricing: { monthly: 1499900, yearly: 14999000 }, // $14,999 MXN/mo, $149,990/yr
  },
];
