import { QuizQuestion } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Question,
  ListChecks,
  CheckCircle,
  TextT,
  SortAscending,
  GitBranch,
  FlowArrow,
  Target,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react'

const QUESTION_TYPES = [
  { value: 'multiple-choice', label: 'Opción Múltiple', icon: Question },
  { value: 'multiple-select', label: 'Selección Múltiple', icon: ListChecks },
  { value: 'true-false', label: 'Verdadero/Falso', icon: CheckCircle },
  { value: 'fill-blank', label: 'Completar Espacios', icon: TextT },
  { value: 'ordering', label: 'Ordenamiento', icon: SortAscending },
  { value: 'scenario-solver', label: 'Árbol de Decisiones', icon: GitBranch },
] as const

export function getQuestionTypeLabel(type: QuizQuestion['type']): string {
  return QUESTION_TYPES.find((qt) => qt.value === type)?.label || 'Pregunta'
}

interface QuestionListProps {
  questions: QuizQuestion[]
  onEdit: (index: number) => void
  onDelete: (index: number) => void
}

export function QuestionList({ questions, onEdit, onDelete }: QuestionListProps) {
  return (
    <div className="space-y-3">
      {questions.map((question, questionIndex) => {
        const QuestionIcon = QUESTION_TYPES.find((qt) => qt.value === question.type)?.icon || Question
        return (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                  {questionIndex + 1}
                </div>
                <QuestionIcon size={20} className="text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="outline">{getQuestionTypeLabel(question.type)}</Badge>
                    <Badge variant="secondary">{question.xpValue} XP</Badge>
                  </div>
                  {question.type === 'scenario-solver' ? (
                    <div>
                      <p className="font-medium mb-1">
                        {typeof question.question === 'object' ? question.question.title : 'Escenario sin título'}
                      </p>
                      {typeof question.question === 'object' && (
                        <p className="text-sm text-muted-foreground mb-2">{question.question.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FlowArrow size={14} />
                          {typeof question.question === 'object' ? question.question.steps.length : 0} pasos
                        </span>
                        <span className="flex items-center gap-1">
                          <Target size={14} />
                          {typeof question.question === 'object' ? question.question.perfectScore : 0} puntos máx.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium mb-2">
                        {typeof question.question === 'string' ? question.question : ''}
                      </p>
                      {question.options.length > 0 && (
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {question.options.map((option, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">
                                {String.fromCharCode(65 + i)}
                              </span>
                              {option}
                              {(question.correctAnswer === i ||
                                (Array.isArray(question.correctAnswer) && question.correctAnswer.includes(i))) && (
                                <CheckCircle size={14} className="text-green-600 dark:text-green-400" weight="fill" />
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(questionIndex)}>
                    <PencilSimple size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => onDelete(questionIndex)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
