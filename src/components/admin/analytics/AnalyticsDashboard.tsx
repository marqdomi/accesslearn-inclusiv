import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HighLevelDashboard } from './HighLevelDashboard'
import { ArrowLeft } from 'lucide-react'

interface AnalyticsDashboardProps {
  onBack: () => void
}

export function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 gap-2"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </Button>

          <div>
            <h1 className="text-4xl font-bold mb-2">Analytics</h1>
            <p className="text-lg text-muted-foreground">
              Métricas y estadísticas de la plataforma
            </p>
          </div>
        </div>

        {/* High Level Dashboard */}
        <HighLevelDashboard />
      </div>
    </div>
  )
}
