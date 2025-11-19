/**
 * Tenant Selector
 * Allows switching between different tenants for testing
 * Only shown in development mode
 */

import { useState } from 'react'
import { useTenant } from '@/contexts/TenantContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Buildings, CaretDown } from '@phosphor-icons/react'

const AVAILABLE_TENANTS = [
  {
    id: 'tenant-demo',
    name: 'Empresa Demo',
    slug: 'demo',
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
    plan: 'demo' as const,
    status: 'active' as const,
  },
  {
    id: 'tenant-kainet',
    name: 'Kainet',
    slug: 'kainet',
    primaryColor: '#2563EB',
    secondaryColor: '#F59E0B',
    plan: 'profesional' as const,
    status: 'active' as const,
  },
  {
    id: 'tenant-socia',
    name: 'Socia Partner',
    slug: 'socia',
    primaryColor: '#7C3AED',
    secondaryColor: '#EC4899',
    plan: 'enterprise' as const,
    status: 'active' as const,
  },
]

export function TenantSelector() {
  const { currentTenant, setCurrentTenant } = useTenant()
  
  // Only show in development
  if (import.meta.env.PROD) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Buildings size={16} />
          {currentTenant?.name || 'Select Tenant'}
          <CaretDown size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Tenant</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {AVAILABLE_TENANTS.map(tenant => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => setCurrentTenant(tenant)}
            className={currentTenant?.id === tenant.id ? 'bg-accent' : ''}
          >
            <div className="flex items-center gap-2 w-full">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tenant.primaryColor }}
              />
              <div className="flex-1">
                <div className="font-medium">{tenant.name}</div>
                <div className="text-xs text-muted-foreground">
                  {tenant.plan} plan
                </div>
              </div>
              {currentTenant?.id === tenant.id && (
                <span className="text-xs">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
