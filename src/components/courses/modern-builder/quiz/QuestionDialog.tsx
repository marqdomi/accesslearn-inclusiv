import { QuizQuestion, ScenarioQuestion } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus,
  X,
  Question,
  ListChecks,
  CheckCircle,
  TextT,
  SortAscending,
  GitBranch,
} from '@phosphor-icons/react'
import { ScenarioEditor } from './ScenarioEditor'

const QUESTION_TYPES = [
  { value: 'multiple-choice', label: 'Opción Múltiple', icon: Question, description: 'Una respuesta correcta' },
  { value: 'multiple-select', label: 'Selección Múltiple', icon: ListChecks, description: 'Varias respuestas correctas' },
  { value: 'true-false', label: 'Verdadero/Falso', icon: CheckCircle, description: 'Pregunta binaria' },
  { value: 'fill-blank', label: 'Completar Espacios', icon: TextT, description: 'Arrastra palabras para completar' },
  { value: 'ordering', label: 'Ordenamiento', icon: SortAscending, description: 'Ordenar elementos' },
  { value: 'scenario-solver', label: 'Árbol de Decisiones', icon: GitBranch, description: 'Escenario interactivo ramificado' },
] as const

export interface QuestionFormState {
  type: QuizQuestion['type']
  question: string
  options: string[]
  correctAnswer: number
  correctAnswers: number[]
  correctOrder: number[]
  fillBlankText: string
  fillBlankAnswers: string[]
  fillBlankOptions: string[]
  correctFeedback: string
  incorrectFeedback: string
  xpValue: number
}

interface QuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questionForm: QuestionFormState
  setQuestionForm: React.Dispatch<React.SetStateAction<QuestionFormState>>
  scenarioForm: ScenarioQuestion
  setScenarioForm: React.Dispatch<React.SetStateAction<ScenarioQuestion>>
  editingQuestion: { questionIndex: number; data: QuizQuestion } | null
  onSave: () => void
}

export function QuestionDialog({
  open,
  onOpenChange,
  questionForm,
  setQuestionForm,
  scenarioForm,
  setScenarioForm,
  editingQuestion,
  onSave,
}: QuestionDialogProps) {
  const isDisabled =
    questionForm.type === 'scenario-solver'
      ? !scenarioForm.title.trim() || scenarioForm.steps.length === 0
      : questionForm.type === 'fill-blank'
        ? !questionForm.fillBlankText.trim() ||
          questionForm.fillBlankAnswers.some((a) => !a.trim()) ||
          questionForm.fillBlankOptions.length < questionForm.fillBlankAnswers.length
        : !questionForm.question.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}</DialogTitle>
          <DialogDescription>Las preguntas evalúan la comprensión del estudiante</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 flex-1 overflow-y-auto min-h-0">
          {/* Question Type */}
          <div className="space-y-2">
            <Label>Tipo de Pregunta *</Label>
            <Select
              value={questionForm.type}
              onValueChange={(value) => setQuestionForm({ ...questionForm, type: value as QuizQuestion['type'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((qt) => {
                  const Icon = qt.icon
                  return (
                    <SelectItem key={qt.value} value={qt.value}>
                      <div className="flex items-center gap-2">
                        <Icon size={16} />
                        <span>{qt.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Scenario Solver Editor */}
          {questionForm.type === 'scenario-solver' ? (
            <ScenarioEditor scenarioForm={scenarioForm} setScenarioForm={setScenarioForm} />
          ) : (
            <>
              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor="question-text">Pregunta *</Label>
                <Textarea
                  id="question-text"
                  placeholder="Escribe la pregunta..."
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  rows={3}
                  maxLength={500}
                />
              </div>

              {/* Options (for multiple-choice, multiple-select, true-false, ordering) */}
              {['multiple-choice', 'multiple-select', 'true-false', 'ordering'].includes(questionForm.type) && (
                <OptionsEditor questionForm={questionForm} setQuestionForm={setQuestionForm} />
              )}

              {/* Fill Blank */}
              {questionForm.type === 'fill-blank' && (
                <FillBlankEditor questionForm={questionForm} setQuestionForm={setQuestionForm} />
              )}

              {/* XP Value */}
              <div className="space-y-2">
                <Label htmlFor="question-xp">Puntos XP *</Label>
                <Input
                  id="question-xp"
                  type="number"
                  min={0}
                  max={100}
                  value={questionForm.xpValue}
                  onChange={(e) => setQuestionForm({ ...questionForm, xpValue: parseInt(e.target.value) || 10 })}
                />
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <Label htmlFor="correct-feedback">Retroalimentación Correcta</Label>
                <Textarea
                  id="correct-feedback"
                  placeholder="Mensaje cuando responden correctamente..."
                  value={questionForm.correctFeedback}
                  onChange={(e) => setQuestionForm({ ...questionForm, correctFeedback: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incorrect-feedback">Retroalimentación Incorrecta</Label>
                <Textarea
                  id="incorrect-feedback"
                  placeholder="Mensaje cuando responden incorrectamente..."
                  value={questionForm.incorrectFeedback}
                  onChange={(e) => setQuestionForm({ ...questionForm, incorrectFeedback: e.target.value })}
                  rows={2}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isDisabled}>
            {editingQuestion ? 'Actualizar' : 'Crear'} Pregunta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ──── Options Editor (MC, MS, T/F, Ordering) ────

function OptionsEditor({
  questionForm,
  setQuestionForm,
}: {
  questionForm: QuestionFormState
  setQuestionForm: React.Dispatch<React.SetStateAction<QuestionFormState>>
}) {
  if (questionForm.type === 'true-false') {
    return (
      <div className="space-y-2">
        <Label>Opciones de Respuesta *</Label>
        <RadioGroup
          value={questionForm.correctAnswer.toString()}
          onValueChange={(value) => setQuestionForm({ ...questionForm, correctAnswer: parseInt(value) })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="0" id="true" />
            <Label htmlFor="true">Verdadero</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1" id="false" />
            <Label htmlFor="false">Falso</Label>
          </div>
        </RadioGroup>
      </div>
    )
  }

  if (questionForm.type === 'ordering') {
    const validOptions = Array.isArray(questionForm.options) ? questionForm.options : []
    const validCorrectOrder = Array.isArray(questionForm.correctOrder) ? questionForm.correctOrder : []
    const currentOrder =
      validCorrectOrder.length > 0
        ? validCorrectOrder
        : validOptions.map((_, i) => i).filter((_, i) => validOptions[i]?.trim() !== '')

    return (
      <div className="space-y-2">
        <Label>Opciones de Respuesta *</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Define el orden correcto. El orden por defecto es el orden de la lista (1, 2, 3, 4...).
        </p>
        {validOptions.map((option, index) => {
          const position = currentOrder.indexOf(index) >= 0 ? currentOrder.indexOf(index) + 1 : index + 1
          return (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-shrink-0 w-20">
                <Label className="text-xs text-muted-foreground">Posición:</Label>
                <Input
                  type="number"
                  min={1}
                  max={validOptions.filter((o) => o?.trim()).length || 1}
                  value={position || 1}
                  onChange={(e) => {
                    const newPosition = parseInt(e.target.value) - 1
                    if (isNaN(newPosition) || newPosition < 0 || newPosition >= currentOrder.length) return
                    const newOrder = [...currentOrder]
                    const oldIndex = currentOrder.indexOf(index)
                    if (oldIndex === -1 || newPosition >= newOrder.length) return
                    ;[newOrder[oldIndex], newOrder[newPosition]] = [newOrder[newPosition], newOrder[oldIndex]]
                    setQuestionForm({ ...questionForm, correctOrder: newOrder })
                  }}
                  className="w-full"
                />
              </div>
              <Input
                placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                value={option || ''}
                onChange={(e) => {
                  const newOptions = [...validOptions]
                  newOptions[index] = e.target.value
                  const filteredOptions = newOptions.filter((o) => o?.trim())
                  const newOrder = filteredOptions.map((_, i) => i)
                  setQuestionForm({ ...questionForm, options: newOptions, correctOrder: newOrder })
                }}
                className="flex-1"
              />
            </div>
          )
        })}
      </div>
    )
  }

  // Multiple choice / Multiple select
  return (
    <div className="space-y-2">
      <Label>Opciones de Respuesta *</Label>
      <div className="space-y-2">
        {questionForm.options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            {questionForm.type === 'multiple-choice' ? (
              <RadioGroup
                value={questionForm.correctAnswer.toString()}
                onValueChange={(value) => setQuestionForm({ ...questionForm, correctAnswer: parseInt(value) })}
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              </RadioGroup>
            ) : (
              <Checkbox
                checked={questionForm.correctAnswers.includes(index)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setQuestionForm({ ...questionForm, correctAnswers: [...questionForm.correctAnswers, index] })
                  } else {
                    setQuestionForm({
                      ...questionForm,
                      correctAnswers: questionForm.correctAnswers.filter((i) => i !== index),
                    })
                  }
                }}
              />
            )}
            <Input
              placeholder={`Opción ${String.fromCharCode(65 + index)}`}
              value={option}
              onChange={(e) => {
                const newOptions = [...questionForm.options]
                newOptions[index] = e.target.value
                setQuestionForm({ ...questionForm, options: newOptions })
              }}
            />
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newOptions = [...questionForm.options, '']
            setQuestionForm({ ...questionForm, options: newOptions })
          }}
        >
          <Plus className="mr-2" size={14} />
          Agregar Opción
        </Button>
      </div>
    </div>
  )
}

// ──── Fill Blank Editor ────

function FillBlankEditor({
  questionForm,
  setQuestionForm,
}: {
  questionForm: QuestionFormState
  setQuestionForm: React.Dispatch<React.SetStateAction<QuestionFormState>>
}) {
  const blankCount = (questionForm.fillBlankText.match(/\{blank\}/g) || []).length

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fill-blank-text">
          Enunciado con Espacios en Blanco *
          <span className="text-xs text-muted-foreground ml-2">
            Usa <code className="px-1 py-0.5 bg-muted rounded text-xs">{'{blank}'}</code> para marcar cada espacio
          </span>
        </Label>
        <Textarea
          id="fill-blank-text"
          placeholder='Ejemplo: "La capital de {blank} es {blank}."'
          value={questionForm.fillBlankText}
          onChange={(e) => {
            const text = e.target.value
            const newBlankCount = (text.match(/\{blank\}/g) || []).length
            setQuestionForm({
              ...questionForm,
              fillBlankText: text,
              fillBlankAnswers: Array(newBlankCount)
                .fill('')
                .map((_, i) => questionForm.fillBlankAnswers[i] || '')
                .slice(0, newBlankCount),
            })
          }}
          rows={4}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">{blankCount} espacio(s) en blanco detectado(s)</p>
      </div>

      {blankCount > 0 && (
        <div className="space-y-2">
          <Label>Respuestas Correctas (en orden) *</Label>
          <div className="space-y-2">
            {Array.from({ length: blankCount }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                  {index + 1}
                </Badge>
                <Input
                  placeholder={`Respuesta para espacio ${index + 1}`}
                  value={questionForm.fillBlankAnswers[index] || ''}
                  onChange={(e) => {
                    const newAnswers = [...questionForm.fillBlankAnswers]
                    newAnswers[index] = e.target.value
                    setQuestionForm({ ...questionForm, fillBlankAnswers: newAnswers })
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>
          Palabras Disponibles *
          <span className="text-xs text-muted-foreground ml-2">
            Incluye las respuestas correctas y palabras adicionales (distractores)
          </span>
        </Label>
        <div className="space-y-2">
          {questionForm.fillBlankOptions.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Badge
                variant={questionForm.fillBlankAnswers.includes(option) ? 'default' : 'secondary'}
                className="w-6 h-6 flex items-center justify-center p-0"
              >
                {questionForm.fillBlankAnswers.includes(option) ? '✓' : index + 1}
              </Badge>
              <Input
                placeholder={`Palabra ${index + 1}`}
                value={option}
                onChange={(e) => {
                  const newOptions = [...questionForm.fillBlankOptions]
                  newOptions[index] = e.target.value
                  setQuestionForm({ ...questionForm, fillBlankOptions: newOptions })
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newOptions = questionForm.fillBlankOptions.filter((_, i) => i !== index)
                  setQuestionForm({ ...questionForm, fillBlankOptions: newOptions })
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setQuestionForm({
                ...questionForm,
                fillBlankOptions: [...questionForm.fillBlankOptions, ''],
              })
            }}
          >
            <Plus className="mr-1" size={12} />
            Agregar Palabra
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Las palabras marcadas con ✓ son las respuestas correctas. Agrega palabras adicionales como distractores.
        </p>
      </div>
    </div>
  )
}
