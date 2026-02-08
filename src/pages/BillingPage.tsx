/**
 * Billing & Subscription Page
 *
 * Allows tenant-admins to:
 * - View current plan and status
 * - Compare available plans
 * - Upgrade/downgrade via Stripe Checkout
 * - Manage billing via Stripe Customer Portal
 */

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ApiService } from '@/services/api.service'
import {
  type BillingStatus,
  type PlanDefinition,
  type BillingPlan,
  type BillingInterval,
} from '@/lib/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  CreditCard,
  CheckCircle,
  Crown,
  Rocket,
  Lightning,
  ArrowRight,
  ArrowClockwise,
  Warning,
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function BillingPage() {
  const [searchParams] = useSearchParams()
  const [billing, setBilling] = useState<BillingStatus | null>(null)
  const [plans, setPlans] = useState<PlanDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [interval, setInterval] = useState<BillingInterval>('monthly')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [billingRes, plansRes] = await Promise.allSettled([
        ApiService.getBillingStatus(),
        ApiService.getBillingPlans(),
      ])
      if (billingRes.status === 'fulfilled') setBilling(billingRes.value)
      if (plansRes.status === 'fulfilled') setPlans(plansRes.value)
    } catch (error: any) {
      console.error('[Billing] Error loading:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('¡Suscripción activada exitosamente!')
    }
    if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout cancelado')
    }
  }, [searchParams])

  const handleCheckout = async (planId: BillingPlan) => {
    setCheckoutLoading(planId)
    try {
      const result = await ApiService.createCheckoutSession(planId, interval)
      window.location.href = result.url
    } catch (error: any) {
      toast.error(error.message || 'Error iniciando checkout')
      setCheckoutLoading(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      const result = await ApiService.createBillingPortalSession()
      window.location.href = result.url
    } catch (error: any) {
      toast.error(error.message || 'Error abriendo portal de facturación')
    }
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(cents / 100)
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const statusLabel: Record<string, { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    active: { text: 'Activa', variant: 'default' },
    trialing: { text: 'Prueba', variant: 'secondary' },
    past_due: { text: 'Pago pendiente', variant: 'destructive' },
    canceled: { text: 'Cancelada', variant: 'destructive' },
    unpaid: { text: 'Impaga', variant: 'destructive' },
    none: { text: 'Sin suscripción', variant: 'outline' },
  }

  const planIcons: Record<string, React.ReactNode> = {
    'free-trial': <Lightning className="h-6 w-6" weight="duotone" />,
    starter: <Rocket className="h-6 w-6" weight="duotone" />,
    professional: <Crown className="h-6 w-6" weight="duotone" />,
    enterprise: <Crown className="h-6 w-6 text-amber-500" weight="fill" />,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-primary" weight="duotone" />
            Facturación y Suscripción
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra tu plan y método de pago
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <ArrowClockwise className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </motion.div>

      {/* Current Plan Status */}
      {billing && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {planIcons[billing.currentPlan]}
                <div>
                  <CardTitle>{billing.planName}</CardTitle>
                  <CardDescription>
                    {billing.interval === 'yearly' ? 'Facturación anual' : billing.interval === 'monthly' ? 'Facturación mensual' : 'Sin facturación'}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={statusLabel[billing.status]?.variant || 'outline'}>
                {statusLabel[billing.status]?.text || billing.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoRow label="Usuarios permitidos" value={`${billing.limits.maxUsers}`} />
              <InfoRow label="Cursos permitidos" value={billing.limits.maxCourses >= 999 ? 'Ilimitados' : `${billing.limits.maxCourses}`} />
              <InfoRow label="Almacenamiento" value={`${billing.limits.maxStorageGB} GB`} />
            </div>
            {billing.currentPeriodEnd && (
              <p className="text-sm text-muted-foreground">
                Próxima renovación: {formatDate(billing.currentPeriodEnd)}
              </p>
            )}
            {billing.canceledAt && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <Warning className="h-4 w-4" />
                Cancelada — acceso hasta {formatDate(billing.currentPeriodEnd)}
              </p>
            )}
          </CardContent>
          {billing.hasActiveSubscription && (
            <CardFooter>
              <Button variant="outline" onClick={handleManageBilling}>
                <CreditCard className="h-4 w-4 mr-2" />
                Gestionar Facturación
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      <Separator />

      {/* Plan Selector */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Planes Disponibles</h2>
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button
              variant={interval === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setInterval('monthly')}
            >
              Mensual
            </Button>
            <Button
              variant={interval === 'yearly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setInterval('yearly')}
            >
              Anual
              <Badge variant="secondary" className="ml-2 text-xs">
                -17%
              </Badge>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => {
            const isCurrentPlan = billing?.currentPlan === plan.id
            const price = interval === 'yearly' ? plan.pricing.yearly / 12 : plan.pricing.monthly
            const isPopular = plan.id === 'professional'

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`relative h-full flex flex-col ${isPopular ? 'border-primary shadow-md' : ''}`}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Más Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {planIcons[plan.id]}
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-2">
                      {price === 0 ? (
                        <span className="text-3xl font-bold">Gratis</span>
                      ) : (
                        <>
                          <span className="text-3xl font-bold">{formatPrice(price)}</span>
                          <span className="text-muted-foreground text-sm">/mes</span>
                        </>
                      )}
                      {interval === 'yearly' && price > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatPrice(plan.pricing.yearly)} facturado anualmente
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" weight="fill" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {isCurrentPlan ? (
                      <Button variant="outline" className="w-full" disabled>
                        Plan actual
                      </Button>
                    ) : plan.id === 'free-trial' ? (
                      <Button variant="ghost" className="w-full" disabled>
                        —
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={isPopular ? 'default' : 'outline'}
                        onClick={() => handleCheckout(plan.id)}
                        disabled={checkoutLoading !== null}
                      >
                        {checkoutLoading === plan.id ? (
                          'Redirigiendo...'
                        ) : (
                          <>
                            Seleccionar
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}
