/**
 * Tests for STPSCompliancePage Component
 *
 * Validates the STPS/DC-3 compliance UI renders correctly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { STPSCompliancePage } from '@/pages/STPSCompliancePage'

// Mock API service
const mockGetSTPSStats = vi.fn()
const mockGetSTPSTenantConfig = vi.fn()
const mockGetSTPSEnabledCourses = vi.fn()
const mockGetSTPSConstancias = vi.fn()

vi.mock('@/services/api.service', () => ({
  ApiService: {
    getSTPSStats: (...args: any[]) => mockGetSTPSStats(...args),
    getSTPSTenantConfig: (...args: any[]) => mockGetSTPSTenantConfig(...args),
    getSTPSEnabledCourses: (...args: any[]) => mockGetSTPSEnabledCourses(...args),
    getSTPSConstancias: (...args: any[]) => mockGetSTPSConstancias(...args),
    updateSTPSTenantConfig: vi.fn().mockResolvedValue({}),
    updateSTPSCourseConfig: vi.fn().mockResolvedValue({}),
    generateConstancia: vi.fn().mockResolvedValue({}),
    downloadDC3PDF: vi.fn().mockResolvedValue(new Blob()),
    getSTPSDC4Report: vi.fn().mockResolvedValue({}),
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

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock useAuth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-test-001',
      tenantId: 'tenant-test',
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'tenant-admin',
    },
    isAuthenticated: true,
    loading: false,
  }),
}))

const mockStats = {
  totalConstancias: 42,
  constanciasAprobadas: 38,
  totalTrabajadoresCapacitados: 25,
  horasCapacitacion: 500,
  tasaAprobacion: 90.48,
  constanciasPorEstatus: {
    generated: 38,
    draft: 2,
    'registered-sirce': 2,
    invalidated: 0,
  },
}

const mockTenantConfig = {
  id: 'stps-config-tenant-test',
  tenantId: 'tenant-test',
  registroPatronalIMSS: '12345678901',
  representanteLegal: 'John Doe',
  domicilioRegistrado: '123 Main St, CDMX',
}

function renderSTPSPage() {
  return render(
    <BrowserRouter>
      <STPSCompliancePage />
    </BrowserRouter>
  )
}

describe('STPSCompliancePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSTPSStats.mockResolvedValue(mockStats)
    mockGetSTPSTenantConfig.mockResolvedValue(mockTenantConfig)
    mockGetSTPSEnabledCourses.mockResolvedValue([])
    mockGetSTPSConstancias.mockResolvedValue([])
  })

  it('should render the page header', async () => {
    renderSTPSPage()

    await waitFor(() => {
      expect(screen.getByText('Cumplimiento STPS')).toBeInTheDocument()
    })
  })

  it('should render all 4 tabs', async () => {
    renderSTPSPage()

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Constancias DC-3')).toBeInTheDocument()
      expect(screen.getByText('Configuración')).toBeInTheDocument()
      expect(screen.getByText('Cursos STPS')).toBeInTheDocument()
    })
  })

  it('should display stats cards on dashboard', async () => {
    renderSTPSPage()

    await waitFor(() => {
      expect(screen.getByText('Total Constancias')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument()
    })
  })

  it('should display approval rate', async () => {
    renderSTPSPage()

    await waitFor(() => {
      expect(screen.getByText('Tasa de Aprobación')).toBeInTheDocument()
    })
  })

  it('should display workers trained count', async () => {
    renderSTPSPage()

    await waitFor(() => {
      expect(screen.getByText('Trabajadores Capacitados')).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
    })
  })

  it('should show compliance status section', async () => {
    renderSTPSPage()

    await waitFor(() => {
      expect(screen.getByText('Estado del Cumplimiento')).toBeInTheDocument()
    })
  })

  it('should show tenant config data in compliance status', async () => {
    renderSTPSPage()

    await waitFor(() => {
      expect(screen.getByText('Registro Patronal IMSS')).toBeInTheDocument()
    })
  })

  it('should display Actualizar button', async () => {
    renderSTPSPage()

    await waitFor(() => {
      expect(screen.getByText('Actualizar')).toBeInTheDocument()
    })
  })

  it('should handle empty stats gracefully', async () => {
    mockGetSTPSStats.mockResolvedValue({
      totalConstancias: 0,
      constanciasAprobadas: 0,
      totalTrabajadoresCapacitados: 0,
      horasCapacitacion: 0,
      tasaAprobacion: 0,
      constanciasPorEstatus: {
        generated: 0,
        draft: 0,
        'registered-sirce': 0,
        invalidated: 0,
      },
    })

    renderSTPSPage()

    await waitFor(() => {
      expect(screen.getByText('0.0%')).toBeInTheDocument()
    })
  })

  it('should handle missing tenant config', async () => {
    mockGetSTPSTenantConfig.mockResolvedValue(null)

    renderSTPSPage()

    await waitFor(() => {
      // Should still render but show "Sin configurar" indicators
      expect(screen.getByText('Estado del Cumplimiento')).toBeInTheDocument()
    })
  })

  it('should show Configurar Datos button', async () => {
    renderSTPSPage()

    await waitFor(() => {
      expect(screen.getByText('Configurar Datos')).toBeInTheDocument()
    })
  })
})
