/**
 * AI Course Summary Component
 * Displays an AI-generated summary of course content
 */

import { useState } from 'react'
import { ApiService } from '@/services/api.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, BookOpen, Target, Users, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CourseSummaryData {
  overview: string
  keyTopics: string[]
  learningObjectives: string[]
  estimatedEffort: string
  prerequisites: string[]
  targetAudience: string
}

interface AICourseSummaryProps {
  courseId: string
  courseTitle: string
  className?: string
}

export function AICourseSummary({ courseId, courseTitle, className }: AICourseSummaryProps) {
  const [summary, setSummary] = useState<CourseSummaryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ApiService.getAICourseSummary(courseId)
      setSummary(data.summary)
    } catch (err: any) {
      setError(err.message || 'Error al generar resumen')
    } finally {
      setLoading(false)
    }
  }

  if (!summary && !loading) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        disabled={loading}
        className={cn('gap-1.5', className)}
      >
        <Sparkles className="h-3.5 w-3.5 text-purple-500" />
        Generar Resumen con IA
      </Button>
    )
  }

  if (loading) {
    return (
      <Card className={cn('border-purple-200/50', className)}>
        <CardContent className="py-6">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            <p className="text-sm text-muted-foreground">Analizando contenido del curso...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-destructive">{error}</span>
        <Button variant="ghost" size="sm" onClick={handleGenerate}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn('border-purple-200/50 bg-gradient-to-br from-purple-50/20 to-blue-50/20 dark:from-purple-950/10 dark:to-blue-950/10', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Resumen generado por IA
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {expanded && summary && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="space-y-4 pt-0">
                {/* Overview */}
                <p className="text-sm text-muted-foreground leading-relaxed">{summary.overview}</p>

                {/* Key Topics */}
                {summary.keyTopics.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <BookOpen className="h-3.5 w-3.5 text-purple-500" />
                      <span className="text-xs font-medium">Temas Clave</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.keyTopics.map((topic, i) => (
                        <Badge key={i} variant="secondary" className="text-[11px]">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Objectives */}
                {summary.learningObjectives.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Target className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-xs font-medium">Objetivos de Aprendizaje</span>
                    </div>
                    <ul className="space-y-1">
                      {summary.learningObjectives.map((obj, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                          <span className="text-purple-500 shrink-0">•</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap gap-3 pt-1">
                  {summary.estimatedEffort && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {summary.estimatedEffort}
                    </div>
                  )}
                  {summary.targetAudience && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {summary.targetAudience}
                    </div>
                  )}
                </div>

                {/* Prerequisites */}
                {summary.prerequisites.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Prerequisitos:</span>{' '}
                    {summary.prerequisites.join(', ')}
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
