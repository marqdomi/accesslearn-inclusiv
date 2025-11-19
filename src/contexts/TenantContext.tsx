/**
 * TenantContext - Global Tenant Management
 * 
 * Provides current tenant information across the entire app.
 * In a real multi-tenant SaaS, the tenant would be determined by:
 * - Subdomain (tenant-demo.accesslearn.com)
 * - Custom domain (kainet.accesslearn.com)
 * - URL parameter (?tenant=kainet)
 * 
 * For now, we'll use localStorage to simulate tenant selection.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Tenant {
  id: string              // tenant-demo, tenant-kainet
  name: string            // Empresa Demo, Kainet
  slug: string            // demo, kainet
  domain?: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  plan: 'demo' | 'profesional' | 'enterprise'
  status: 'active' | 'suspended' | 'canceled'
}

interface TenantContextType {
  currentTenant: Tenant | null
  setCurrentTenant: (tenant: Tenant | null) => void
  isLoading: boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load tenant from localStorage on mount
  useEffect(() => {
    const storedTenantId = localStorage.getItem('current-tenant-id')
    
    if (storedTenantId) {
      // In production, this would fetch from backend API
      // For now, we'll use a default tenant
      const defaultTenant: Tenant = {
        id: storedTenantId,
        name: storedTenantId === 'tenant-demo' ? 'Empresa Demo' : 'Kainet',
        slug: storedTenantId.replace('tenant-', ''),
        primaryColor: '#4F46E5',
        secondaryColor: '#10B981',
        plan: storedTenantId === 'tenant-demo' ? 'demo' : 'profesional',
        status: 'active'
      }
      setCurrentTenantState(defaultTenant)
    } else {
      // Default to demo tenant if none selected
      const demoTenant: Tenant = {
        id: 'tenant-demo',
        name: 'Empresa Demo',
        slug: 'demo',
        primaryColor: '#4F46E5',
        secondaryColor: '#10B981',
        plan: 'demo',
        status: 'active'
      }
      setCurrentTenantState(demoTenant)
      localStorage.setItem('current-tenant-id', 'tenant-demo')
    }
    
    setIsLoading(false)
  }, [])

  const setCurrentTenant = (tenant: Tenant | null) => {
    setCurrentTenantState(tenant)
    if (tenant) {
      localStorage.setItem('current-tenant-id', tenant.id)
    } else {
      localStorage.removeItem('current-tenant-id')
    }
  }

  return (
    <TenantContext.Provider value={{ currentTenant, setCurrentTenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
