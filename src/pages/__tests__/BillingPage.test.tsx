/**
 * Tests for BillingPage Component
 *
 * Validates the billing/subscription UI renders correctly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { BillingPage } from '@/pages/BillingPage'

// Mock API service
const mockGetBillingStatus = vi.fn()
const mockGetBillingPlans = vi.fn()
const mockCreateCheckoutSession = vi.fn()
const mockCreateBillingPortalSession = vi.fn()

vi.mock('@/services/api.service', () => ({
  ApiService: {
    getBillingStatus: (...args: any[]) => mockGetBillingStatus(...args),
    getBillingPlans: (...args: any[]) => mockGetBillingPlans(...args),
    createCheckoutSession: (...args: any[]) => mockCreateCheckoutSession(...args),
    createBillingPortalSession: (...args: any[]) => mockCreateBillingPortalSession(...args),
  },
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

const mockPlans = [
  {
    id: 'free-trial',
    name: 'Prueba Gratuita',
    description: 'Ideal para probar la plataforma',
    features: ['10 usuarios', '3 cursos', '1 GB almacenamiento'],
    limits: { maxUsers: 10, maxCourses: 3, maxStorageGB: 1, stpsEnabled: false, customBranding: false, apiAccess: false, prioritySupport: false },
    pricing: { monthly: 0, yearly: 0 },
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para empresas pequeñas',
    features: ['50 usuarios', '10 cursos', '5 GB'],
    limits: { maxUsers: 50, maxCourses: 10, maxStorageGB: 5, stpsEnabled: false, customBranding: false, apiAccess: false, prioritySupport: false },
    pricing: { monthly: 299900, yearly: 2999000 },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Para empresas medianas',
    features: ['250 usuarios', 'Cursos ilimitados', 'STPS DC-3/DC-4'],
    limits: { maxUsers: 250, maxCourses: 999, maxStorageGB: 25, stpsEnabled: true, customBranding: true, apiAccess: false, prioritySupport: true },
    pricing: { monthly: 699900, yearly: 6999000 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes organizaciones',
    features: ['Usuarios ilimitados', 'API access', 'SSO'],
    limits: { maxUsers: 9999, maxCourses: 9999, maxStorageGB: 100, stpsEnabled: true, customBranding: true, apiAccess: true, prioritySupport: true },
    pricing: { monthly: 1499900, yearly: 14999000 },
  },
]

const mockBillingStatus = {
  currentPlan: 'free-trial',
  planName: 'Prueba Gratuita',
  status: 'none',
  interval: null,
  hasActiveSubscription: false,
  currentPeriodEnd: null,
  canceledAt: null,
  limits: { maxUsers: 10, maxCourses: 3, maxStorageGB: 1 },
}

function renderBillingPage() {
  return render(
    <BrowserRouter>
      <BillingPage />
    </BrowserRouter>
  )
}

describe('BillingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetBillingPlans.mockResolvedValue(mockPlans)
    mockGetBillingStatus.mockResolvedValue(mockBillingStatus)
  })

  it('should render the page header', async () => {
    renderBillingPage()

    await waitFor(() => {
      expect(screen.getByText('Facturación y Suscripción')).toBeInTheDocument()
    })
  })

  it('should show loading spinner initially', () => {
    mockGetBillingStatus.mockReturnValue(new Promise(() => {})) // never resolves
    renderBillingPage()

    // The spinner is an animated div, just check the page doesn't show plans yet
    expect(screen.queryByText('Planes Disponibles')).not.toBeInTheDocument()
  })

  it('should display current plan status', async () => {
    renderBillingPage()

    await waitFor(() => {
      const elements = screen.getAllByText('Prueba Gratuita')
      expect(elements.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('should display all 4 plan cards', async () => {
    renderBillingPage()

    await waitFor(() => {
      expect(screen.getByText('Starter')).toBeInTheDocument()
      expect(screen.getByText('Professional')).toBeInTheDocument()
      expect(screen.getByText('Enterprise')).toBeInTheDocument()
    })
  })

  it('should show "Plan actual" button on current plan', async () => {
    renderBillingPage()

    await waitFor(() => {
      expect(screen.getByText('Plan actual')).toBeInTheDocument()
    })
  })

  it('should show "Seleccionar" buttons for upgrade plans', async () => {
    renderBillingPage()

    await waitFor(() => {
      const selectButtons = screen.getAllByText('Seleccionar')
      expect(selectButtons.length).toBe(3) // starter, professional, enterprise
    })
  })

  it('should toggle between monthly and yearly pricing', async () => {
    renderBillingPage()
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('Mensual')).toBeInTheDocument()
    })

    const yearlyButton = screen.getByText('Anual')
    await user.click(yearlyButton)

    // Should show annual pricing indicator
    expect(screen.getByText('-17%')).toBeInTheDocument()
  })

  it('should show "Más Popular" badge on Professional plan', async () => {
    renderBillingPage()

    await waitFor(() => {
      expect(screen.getByText('Más Popular')).toBeInTheDocument()
    })
  })

  it('should show Actualizar button', async () => {
    renderBillingPage()

    await waitFor(() => {
      expect(screen.getByText('Actualizar')).toBeInTheDocument()
    })
  })

  it('should display plan features', async () => {
    renderBillingPage()

    await waitFor(() => {
      expect(screen.getByText('50 usuarios')).toBeInTheDocument()
      expect(screen.getByText('STPS DC-3/DC-4')).toBeInTheDocument()
    })
  })

  it('should show price as "Gratis" for free-trial', async () => {
    renderBillingPage()

    await waitFor(() => {
      expect(screen.getByText('Gratis')).toBeInTheDocument()
    })
  })

  it('should show manage billing button when subscription is active', async () => {
    mockGetBillingStatus.mockResolvedValue({
      ...mockBillingStatus,
      currentPlan: 'professional',
      planName: 'Professional',
      status: 'active',
      hasActiveSubscription: true,
      interval: 'monthly',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    renderBillingPage()

    await waitFor(() => {
      expect(screen.getByText('Gestionar Facturación')).toBeInTheDocument()
    })
  })

  it('should not show manage billing button when no active subscription', async () => {
    renderBillingPage()

    await waitFor(() => {
      expect(screen.getByText('Planes Disponibles')).toBeInTheDocument()
    })

    expect(screen.queryByText('Gestionar Facturación')).not.toBeInTheDocument()
  })

  it('should show cancellation warning when subscription is canceled', async () => {
    mockGetBillingStatus.mockResolvedValue({
      ...mockBillingStatus,
      currentPlan: 'starter',
      planName: 'Starter',
      status: 'canceled',
      hasActiveSubscription: false,
      canceledAt: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    })

    renderBillingPage()

    await waitFor(() => {
      const cancelElements = screen.getAllByText(/Cancelada/)
      expect(cancelElements.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('should show limits in current plan card', async () => {
    renderBillingPage()

    await waitFor(() => {
      expect(screen.getByText('Usuarios permitidos')).toBeInTheDocument()
      expect(screen.getByText('Cursos permitidos')).toBeInTheDocument()
      expect(screen.getByText('Almacenamiento')).toBeInTheDocument()
    })
  })
})
