/**
 * TenantContext - Global Tenant Management
 * 
 * Provides current tenant information across the entire app.
 * In a real multi-tenant SaaS, the tenant would be determined by:
 * - Subdomain (tenant-demo.kaido.com)
 * - Custom domain (kainet.kaido.com)
 * - URL parameter (?tenant=kainet)
 * 
 * For now, we'll use localStorage to simulate tenant selection.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ApiService } from '@/services/api.service'

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
  clearTenant: () => void
  isLoading: boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [currentTenant, setCurrentTenantState] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load tenant from localStorage and API on mount
  useEffect(() => {
    const loadTenant = async () => {
      const storedTenantId = localStorage.getItem('current-tenant-id')
      const tenantId = storedTenantId || 'tenant-demo'
      
      // Extract slug from tenantId (tenant-kainet -> kainet)
      const slug = tenantId.replace('tenant-', '')

      try {
        // Try to load tenant from API using slug (public endpoint, no auth required)
        // This works for login page where user is not authenticated yet
        const tenant = await ApiService.getTenantBySlug(slug)
        
        if (tenant) {
          // Map backend tenant to frontend Tenant interface
          const frontendTenant: Tenant = {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            domain: tenant.domain,
            logo: tenant.logo, // This will be blobName if from Blob Storage
            primaryColor: tenant.primaryColor || '#4F46E5',
            secondaryColor: tenant.secondaryColor || '#10B981',
            plan: tenant.plan as 'demo' | 'profesional' | 'enterprise',
            status: tenant.status as 'active' | 'suspended' | 'canceled'
          }
          setCurrentTenantState(frontendTenant)
        } else {
          // Fallback to default tenant if API call fails or tenant not found
          const defaultTenant: Tenant = {
            id: tenantId,
            name: tenantId === 'tenant-demo' ? 'Empresa Demo' : slug,
            slug: slug,
            primaryColor: '#4F46E5',
            secondaryColor: '#10B981',
            plan: tenantId === 'tenant-demo' ? 'demo' : 'profesional',
            status: 'active'
          }
          setCurrentTenantState(defaultTenant)
        }
      } catch (error) {
        // If API call fails, use default tenant
        console.warn('[TenantContext] Failed to load tenant from API, using default:', error)
        const defaultTenant: Tenant = {
          id: tenantId,
          name: tenantId === 'tenant-demo' ? 'Empresa Demo' : slug,
          slug: slug,
          primaryColor: '#4F46E5',
          secondaryColor: '#10B981',
          plan: tenantId === 'tenant-demo' ? 'demo' : 'profesional',
          status: 'active'
        }
        setCurrentTenantState(defaultTenant)
        
        if (!storedTenantId) {
          localStorage.setItem('current-tenant-id', 'tenant-demo')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadTenant()
  }, [])

  const setCurrentTenant = (tenant: Tenant | null) => {
    setCurrentTenantState(tenant)
    if (tenant) {
      localStorage.setItem('current-tenant-id', tenant.id)
    } else {
      localStorage.removeItem('current-tenant-id')
    }
  }

  const clearTenant = () => {
    setCurrentTenantState(null)
    localStorage.removeItem('current-tenant-id')
  }

  return (
    <TenantContext.Provider value={{ currentTenant, setCurrentTenant, clearTenant, isLoading }}>
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
