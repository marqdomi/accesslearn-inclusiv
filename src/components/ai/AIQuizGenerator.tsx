/**
 * AI Quiz Generator Component
 * Button + Dialog that generates quiz questions from course content via Gemini
 */

import { useState } from 'react'
import { ApiService } from '@/services/api.service'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, CheckCircle2, XCircle, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GeneratedQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: string
}

interface AIQuizGeneratorProps {
  courseId: string
  courseTitle: string
  moduleCount?: number
  onQuestionsGenerated?: (questions: GeneratedQuestion[]) => void
  variant?: 'button' | 'icon'
  className?: string
}

export function AIQuizGenerator({
  courseId,
  courseTitle,
  moduleCount = 0,
  onQuestionsGenerated,
  variant = 'button',
  className,
}: AIQuizGeneratorProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [questionCount, setQuestionCount] = useState('5')
  const [difficulty, setDifficulty] = useState('medium')
  const [moduleIndex, setModuleIndex] = useState<string>('all')

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setQuestions([])

    try {
      const data = await ApiService.generateAIQuiz(courseId, {
        questionCount: parseInt(questionCount),
        difficulty,
        moduleIndex: moduleIndex !== 'all' ? parseInt(moduleIndex) : undefined,
      })
      setQuestions(data.questions)
    } catch (err: any) {
      setError(err.message || 'Error al generar preguntas')
    } finally {
      setLoading(false)
    }
  }

  const handleUseQuestions = () => {
    if (onQuestionsGenerated && questions.length > 0) {
      onQuestionsGenerated(questions)
      setOpen(false)
    }
  }

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(questions, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getDifficultyLabel = (d: string) => {
    switch (d) {
      case 'easy': return 'Fácil'
      case 'medium': return 'Medio'
      case 'hard': return 'Difícil'
      default: return d
    }
  }

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return 'bg-green-50 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'hard': return 'bg-red-50 text-red-700 border-red-200'
      default: return ''
    }
  }

  return (
    <>
      {variant === 'button' ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className={cn('gap-1.5', className)}
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-500" />
          Generar Quiz con IA
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className={className}
          title="Generar Quiz con IA"
        >
          <Sparkles className="h-4 w-4 text-purple-500" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Generador de Quiz con IA
            </DialogTitle>
            <DialogDescription>
              Genera preguntas automáticamente basadas en el contenido de{' '}
              <span className="font-medium">{courseTitle}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Configuration */}
          {questions.length === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cantidad de preguntas</Label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 preguntas</SelectItem>
                      <SelectItem value="5">5 preguntas</SelectItem>
                      <SelectItem value="8">8 preguntas</SelectItem>
                      <SelectItem value="10">10 preguntas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dificultad</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Medio</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {moduleCount > 0 && (
                <div className="space-y-2">
                  <Label>Módulo</Label>
                  <Select value={moduleIndex} onValueChange={setModuleIndex}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los módulos</SelectItem>
                      {Array.from({ length: moduleCount }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          Módulo {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  <XCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando preguntas...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generar Preguntas
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Results */}
          {questions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {questions.length} preguntas generadas
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleCopyJSON}>
                  {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copied ? 'Copiado' : 'Copiar JSON'}
                </Button>
              </div>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                {questions.map((q, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">
                        {i + 1}. {q.question}
                      </p>
                      <Badge variant="outline" className={cn('text-[10px] shrink-0', getDifficultyColor(q.difficulty))}>
                        {getDifficultyLabel(q.difficulty)}
                      </Badge>
                    </div>
                    <div className="space-y-1 pl-4">
                      {q.options.map((opt, j) => (
                        <div
                          key={j}
                          className={cn(
                            'text-xs py-1 px-2 rounded',
                            j === q.correctAnswer
                              ? 'bg-green-50 text-green-700 font-medium dark:bg-green-950/30 dark:text-green-400'
                              : 'text-muted-foreground',
                          )}
                        >
                          {String.fromCharCode(65 + j)}) {opt}
                          {j === q.correctAnswer && ' ✓'}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-[11px] text-muted-foreground pl-4 italic">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {questions.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuestions([])
                    setError(null)
                  }}
                >
                  Regenerar
                </Button>
                {onQuestionsGenerated && (
                  <Button onClick={handleUseQuestions} className="gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Usar estas preguntas
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
