/**
 * AI Course Recommendations Component
 * Displays Gemini-powered personalized course recommendations on dashboard
 */

import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ArrowRight, RefreshCw, Target, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Recommendation {
  courseId: string
  title: string
  reason: string
  matchScore: number
  suggestedPath: string
}

export function AIRecommendations() {
  const navigate = useNavigate()
  const { currentTenant } = useTenant()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const fetchRecommendations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ApiService.getAIRecommendations()
      setRecommendations(data.recommendations || [])
      setHasLoaded(true)
    } catch (err: any) {
      if (err.status === 503) {
        setError('El servicio de IA no está disponible en este momento')
      } else {
        setError('No se pudieron obtener recomendaciones')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!hasLoaded) {
      fetchRecommendations()
    }
  }, [fetchRecommendations, hasLoaded])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200'
    return 'text-purple-600 bg-purple-50 border-purple-200'
  }

  if (loading) {
    return (
      <Card className="border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/30 to-blue-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500 animate-pulse" />
            Recomendaciones IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-2 border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            Recomendaciones IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchRecommendations}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0 && hasLoaded) {
    return (
      <Card className="border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/30 to-blue-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Recomendaciones IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-4 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Ya estás inscrito en todos los cursos disponibles. ¡Sigue así!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-purple-200/50 bg-gradient-to-br from-purple-50/30 to-blue-50/30 dark:from-purple-950/20 dark:to-blue-950/20 dark:border-purple-800/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Recomendaciones IA
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchRecommendations} disabled={loading}>
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Personalizado con inteligencia artificial</p>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key="recommendations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.courseId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative rounded-lg border bg-card p-3 hover:shadow-md transition-all cursor-pointer"
                onClick={() =>
                  navigate(`/${currentTenant?.slug || ''}/courses/${rec.courseId}`)
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{rec.title}</h4>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] px-1.5 shrink-0', getScoreColor(rec.matchScore))}
                      >
                        <Target className="h-2.5 w-2.5 mr-0.5" />
                        {rec.matchScore}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{rec.reason}</p>
                    {rec.suggestedPath && (
                      <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 font-medium">
                        {rec.suggestedPath}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 transition-colors shrink-0 mt-1" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
