/**
 * Data Source Indicator
 * Shows which data source is currently being used (Backend API vs KV Storage)
 * and current tenant information for debugging/dev purposes
 */

import { useTenant } from '@/contexts/TenantContext'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Database, CloudArrowDown } from '@phosphor-icons/react'

interface DataSourceIndicatorProps {
  usingBackend: boolean
  coursesCount: number
}

export function DataSourceIndicator({ usingBackend, coursesCount }: DataSourceIndicatorProps) {
  const { currentTenant } = useTenant()
  
  // Only show in development
  if (import.meta.env.PROD) {
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 p-3 shadow-lg border-2">
      <div className="flex items-center gap-3 text-xs">
        {usingBackend ? (
          <>
            <CloudArrowDown size={20} className="text-green-500" />
            <div>
              <Badge variant="default" className="bg-green-500 mb-1">
                Backend API
              </Badge>
              <p className="text-muted-foreground">
                {currentTenant?.name} ({coursesCount} courses)
              </p>
            </div>
          </>
        ) : (
          <>
            <Database size={20} className="text-orange-500" />
            <div>
              <Badge variant="secondary" className="bg-orange-500 text-white mb-1">
                KV Storage
              </Badge>
              <p className="text-muted-foreground">
                Local data ({coursesCount} courses)
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
