import { Quiz } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface QuizFormState {
  title: string
  description: string
  passingScore: number
  maxAttempts: number
  showTimer: boolean
  timeLimit: number
  examMode: boolean
  examModeType: 'timed' | 'untimed'
  examDuration: number
  examMinPassingScore: number
  examQuestionCount: number
  useRandomSelection: boolean
}

interface QuizMetadataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quizForm: QuizFormState
  setQuizForm: React.Dispatch<React.SetStateAction<QuizFormState>>
  currentQuiz: Quiz | undefined
  onSave: () => void
}

export function QuizMetadataDialog({
  open,
  onOpenChange,
  quizForm,
  setQuizForm,
  currentQuiz,
  onSave,
}: QuizMetadataDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configuración del Quiz</DialogTitle>
          <DialogDescription>
            Define la configuración general del quiz
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 flex-1 overflow-y-auto min-h-0">
          <div className="space-y-2">
            <Label htmlFor="quiz-title">Título del Quiz *</Label>
            <Input
              id="quiz-title"
              placeholder="ej. Evaluación Final: Módulo 1"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiz-description">Descripción *</Label>
            <Textarea
              id="quiz-description"
              placeholder="Describe qué evalúa este quiz..."
              value={quizForm.description}
              onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
              rows={3}
              maxLength={300}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="passing-score">Puntaje para Aprobar (%) *</Label>
            <Input
              id="passing-score"
              type="number"
              min={0}
              max={100}
              value={quizForm.passingScore}
              onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) || 70 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-attempts">Intentos Máximos *</Label>
            <Input
              id="max-attempts"
              type="number"
              min={1}
              max={10}
              value={quizForm.maxAttempts}
              onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: parseInt(e.target.value) || 3 })}
            />
          </div>

          <Separator />

          {/* Modo Examen de Certificación */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="exam-mode">Modo Examen de Certificación</Label>
                <p className="text-xs text-muted-foreground">
                  Activa el timer visible y límite de tiempo para simular exámenes reales
                </p>
              </div>
              <Switch
                id="exam-mode"
                checked={quizForm.examMode}
                onCheckedChange={(checked) => {
                  setQuizForm({
                    ...quizForm,
                    examMode: checked,
                    showTimer: checked || quizForm.showTimer,
                  })
                }}
              />
            </div>

            {/* Mostrar Timer */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-timer">Mostrar Timer Visualmente</Label>
                <p className="text-xs text-muted-foreground">
                  Muestra el contador de tiempo durante el quiz (útil para práctica de exámenes)
                </p>
              </div>
              <Switch
                id="show-timer"
                checked={quizForm.showTimer || quizForm.examMode}
                onCheckedChange={(checked) => setQuizForm({ ...quizForm, showTimer: checked })}
                disabled={quizForm.examMode}
              />
            </div>

            {/* Límite de Tiempo */}
            {(quizForm.showTimer || quizForm.examMode) && (
              <div className="space-y-2">
                <Label htmlFor="time-limit">
                  Límite de Tiempo (minutos)
                  {quizForm.examMode && <span className="text-xs text-muted-foreground ml-2">Recomendado para exámenes</span>}
                </Label>
                <Input
                  id="time-limit"
                  type="number"
                  min={0}
                  max={300}
                  value={quizForm.timeLimit}
                  onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) || 0 })}
                  placeholder="0 = Sin límite"
                />
                <p className="text-xs text-muted-foreground">
                  {quizForm.timeLimit > 0
                    ? `El quiz se terminará automáticamente después de ${quizForm.timeLimit} minutos`
                    : 'Sin límite de tiempo (el timer seguirá contando para analytics)'}
                </p>
              </div>
            )}

            {/* Configuración Avanzada de Examen */}
            {quizForm.examMode && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Configuración Avanzada de Examen</h4>

                  <div className="space-y-2">
                    <Label htmlFor="exam-mode-type">Tipo de Examen</Label>
                    <Select
                      value={quizForm.examModeType}
                      onValueChange={(value: 'timed' | 'untimed') => {
                        setQuizForm({ ...quizForm, examModeType: value })
                      }}
                    >
                      <SelectTrigger id="exam-mode-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="timed">Con Tiempo y Cronómetro (Examen de Certificación)</SelectItem>
                        <SelectItem value="untimed">Sin Tiempo (Modo Estudio/Práctica)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {quizForm.examModeType === 'timed'
                        ? 'El examen tendrá un límite de tiempo y mostrará un cronómetro visible'
                        : 'El examen no tendrá límite de tiempo, ideal para estudiar y practicar sin presión'}
                    </p>
                  </div>

                  {quizForm.examModeType === 'timed' && (
                    <div className="space-y-2">
                      <Label htmlFor="exam-duration">Duración del Examen (minutos) *</Label>
                      <Input
                        id="exam-duration"
                        type="number"
                        min={1}
                        max={600}
                        value={quizForm.examDuration}
                        onChange={(e) => setQuizForm({ ...quizForm, examDuration: parseInt(e.target.value) || 60 })}
                        placeholder="60"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="exam-min-passing-score">Calificación Mínima Aprobatoria (%) *</Label>
                    <Input
                      id="exam-min-passing-score"
                      type="number"
                      min={0}
                      max={100}
                      value={quizForm.examMinPassingScore}
                      onChange={(e) => setQuizForm({ ...quizForm, examMinPassingScore: parseInt(e.target.value) || 70 })}
                      placeholder="70"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="use-random-selection">Selección Aleatoria de Preguntas</Label>
                      <p className="text-xs text-muted-foreground">
                        Seleccionar preguntas aleatoriamente del banco completo
                      </p>
                    </div>
                    <Switch
                      id="use-random-selection"
                      checked={quizForm.useRandomSelection}
                      onCheckedChange={(checked) => {
                        setQuizForm({ ...quizForm, useRandomSelection: checked })
                      }}
                    />
                  </div>

                  {quizForm.useRandomSelection && (
                    <div className="space-y-2">
                      <Label htmlFor="exam-question-count">
                        Número de Preguntas en el Examen
                        {currentQuiz && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Banco disponible: {currentQuiz.questions.length} preguntas)
                          </span>
                        )}
                      </Label>
                      <Input
                        id="exam-question-count"
                        type="number"
                        min={1}
                        max={currentQuiz?.questions.length || 100}
                        value={quizForm.examQuestionCount}
                        onChange={(e) => {
                          const count = parseInt(e.target.value) || 0
                          const maxQuestions = currentQuiz?.questions.length || 100
                          setQuizForm({
                            ...quizForm,
                            examQuestionCount: Math.min(count, maxQuestions),
                          })
                        }}
                        placeholder={`Máximo: ${currentQuiz?.questions.length || 0}`}
                      />
                      <p className="text-xs text-muted-foreground">
                        {quizForm.examQuestionCount > 0
                          ? `El examen seleccionará ${quizForm.examQuestionCount} pregunta${quizForm.examQuestionCount > 1 ? 's' : ''} aleatoriamente`
                          : 'Se usarán todas las preguntas del banco'}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={!quizForm.title.trim()}>
            {currentQuiz ? 'Actualizar' : 'Crear'} Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
