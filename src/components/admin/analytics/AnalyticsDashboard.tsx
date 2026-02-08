import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HighLevelDashboard } from './HighLevelDashboard'
import { AIAnalyticsInsights } from '@/components/ai'
import { ArrowLeft } from 'lucide-react'

interface AnalyticsDashboardProps {
  onBack: () => void
}

export function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-3 md:mb-4 gap-2 touch-target"
            size="sm"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Volver al Dashboard</span>
            <span className="sm:hidden">Volver</span>
          </Button>

          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Analytics</h1>
            <p className="text-sm md:text-lg text-muted-foreground">
              Métricas y estadísticas de la plataforma
            </p>
          </div>
        </div>

        {/* AI Insights */}
        <div className="mb-6">
          <AIAnalyticsInsights />
        </div>

        {/* High Level Dashboard */}
        <HighLevelDashboard />
      </div>
    </div>
  )
}
