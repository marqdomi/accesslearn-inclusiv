/**
 * AI Analytics Insights Component
 * Admin dashboard cards showing AI-generated insights about platform usage
 */

import { useState, useEffect } from 'react'
import { ApiService } from '@/services/api.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Info,
  ArrowUpRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Insight {
  title: string
  description: string
  type: 'positive' | 'warning' | 'suggestion' | 'info'
  priority: 'high' | 'medium' | 'low'
  metric?: string
  recommendation?: string
}

interface AIAnalyticsInsightsProps {
  className?: string
}

export function AIAnalyticsInsights({ className }: AIAnalyticsInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ApiService.getAIAnalyticsInsights()
      setInsights(data.insights || [])
    } catch (err: any) {
      if (err.status === 503) {
        setError('Servicio de IA no disponible')
      } else if (err.status === 403) {
        setError('Se require permisos de administrador')
      } else {
        setError('Error al obtener insights')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'suggestion':
        return <Lightbulb className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeColors = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800/30'
      case 'warning':
        return 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/30'
      case 'suggestion':
        return 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800/30'
      default:
        return 'border-gray-200 bg-gray-50/50 dark:bg-gray-950/20 dark:border-gray-800/30'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-[10px] px-1.5">Alta</Badge>
      case 'medium':
        return <Badge variant="outline" className="text-[10px] px-1.5 border-amber-300 text-amber-600">Media</Badge>
      case 'low':
        return <Badge variant="outline" className="text-[10px] px-1.5">Baja</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card className={cn('border-purple-200/50', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
            Insights de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('border-muted', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            Insights de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchInsights}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('border-purple-200/50 bg-gradient-to-br from-purple-50/30 to-blue-50/30 dark:from-purple-950/20 dark:to-blue-950/20 dark:border-purple-800/30', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Insights de IA
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchInsights} disabled={loading}>
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Análisis inteligente de tu plataforma</p>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay suficientes datos para generar insights
          </p>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn('rounded-lg border p-3', getTypeColors(insight.type))}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">{getTypeIcon(insight.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                      {getPriorityBadge(insight.priority)}
                    </div>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                    {insight.metric && (
                      <p className="text-xs font-medium mt-1 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" />
                        {insight.metric}
                      </p>
                    )}
                    {insight.recommendation && (
                      <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1.5 font-medium">
                        💡 {insight.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
