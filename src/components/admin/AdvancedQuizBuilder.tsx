import { useState } from 'react'
import { QuizQuestion } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup } from '@/components/ui/radio-group'
import { 
  Plus, Trash, DotsSixVertical, CaretUp, CaretDown,
  CheckCircle, XCircle, ListDashes
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AdvancedQuizBuilderProps {
  questions: QuizQuestion[]
  onChange: (questions: QuizQuestion[]) => void
}

export function AdvancedQuizBuilder({ questions, onChange }: AdvancedQuizBuilderProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const addQuestion = (type: QuizQuestion['type']) => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      type,
      question: '',
      options: type === 'true-false' ? ['True', 'False'] : 
               type === 'short-answer' ? [] : 
               ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: type === 'true-false' ? 0 : 
                     type === 'short-answer' ? '' : 
                     type === 'multiple-select' ? [] : 0,
      correctFeedback: 'Great job! +50 XP',
      incorrectFeedback: 'Not quite. Review the material and try again.',
      xpValue: 50
    }

    onChange([...questions, newQuestion])
    setEditingIndex(questions.length)
    toast.success('Question added')
  }

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], ...updates }
    onChange(updated)
  }

  const deleteQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index))
    toast.success('Question deleted')
  }

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) {
      return
    }

    const newQuestions = [...questions]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]]
    onChange(newQuestions)
  }

  const addOption = (index: number) => {
    const question = questions[index]
    updateQuestion(index, {
      options: [...question.options, `Option ${question.options.length + 1}`]
    })
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const question = questions[questionIndex]
    const newOptions = [...question.options]
    newOptions[optionIndex] = value
    updateQuestion(questionIndex, { options: newOptions })
  }

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex]
    if (question.options.length <= 2) {
      toast.error('Question must have at least 2 options')
      return
    }
    
    const newOptions = question.options.filter((_, i) => i !== optionIndex)
    updateQuestion(questionIndex, { options: newOptions })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Questions</CardTitle>
          <CardDescription>
            Build your assessment with various question types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => addQuestion('multiple-choice')} variant="outline" size="sm">
              <Plus size={16} className="mr-2" />
              Multiple Choice
            </Button>
            <Button onClick={() => addQuestion('multiple-select')} variant="outline" size="sm">
              <Plus size={16} className="mr-2" />
              Multiple Select
            </Button>
            <Button onClick={() => addQuestion('true-false')} variant="outline" size="sm">
              <Plus size={16} className="mr-2" />
              True/False
            </Button>
            <Button onClick={() => addQuestion('short-answer')} variant="outline" size="sm">
              <Plus size={16} className="mr-2" />
              Short Answer
            </Button>
            <Button onClick={() => addQuestion('ordering')} variant="outline" size="sm">
              <Plus size={16} className="mr-2" />
              Ordering
            </Button>
          </div>

          {questions.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <ListDashes size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first question using the buttons above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id} className={editingIndex === index ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <DotsSixVertical size={20} className="text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge>
                            {question.type === 'multiple-choice' ? 'Multiple Choice' :
                             question.type === 'multiple-select' ? 'Multiple Select' :
                             question.type === 'true-false' ? 'True/False' :
                             question.type === 'short-answer' ? 'Short Answer' :
                             'Ordering'}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveQuestion(index, 'up')}
                              disabled={index === 0}
                            >
                              <CaretUp size={20} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveQuestion(index, 'down')}
                              disabled={index === questions.length - 1}
                            >
                              <CaretDown size={20} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                            >
                              {editingIndex === index ? 'Collapse' : 'Edit'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuestion(index)}
                            >
                              <Trash size={20} />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Question Text</Label>
                          <Textarea
                            value={question.question}
                            onChange={(e) => updateQuestion(index, { question: e.target.value })}
                            placeholder="Enter your question here..."
                            rows={2}
                          />
                        </div>

                        {editingIndex === index && (
                          <>
                            {(question.type === 'multiple-choice' || question.type === 'multiple-select' || question.type === 'ordering') && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label>Answer Options</Label>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addOption(index)}
                                  >
                                    <Plus size={16} className="mr-1" />
                                    Add Option
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {question.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center gap-2">
                                      {question.type === 'multiple-choice' && (
                                        <input
                                          type="radio"
                                          name={`correct-${index}`}
                                          checked={question.correctAnswer === optionIndex}
                                          onChange={() => updateQuestion(index, { correctAnswer: optionIndex })}
                                          className="mt-2"
                                        />
                                      )}
                                      {question.type === 'multiple-select' && (
                                        <Checkbox
                                          checked={Array.isArray(question.correctAnswer) && question.correctAnswer.includes(optionIndex)}
                                          onCheckedChange={(checked) => {
                                            const current = Array.isArray(question.correctAnswer) ? question.correctAnswer : []
                                            const updated = checked 
                                              ? [...current, optionIndex]
                                              : current.filter(i => i !== optionIndex)
                                            updateQuestion(index, { correctAnswer: updated })
                                          }}
                                          className="mt-2"
                                        />
                                      )}
                                      {question.type === 'ordering' && (
                                        <Badge variant="outline" className="mt-2">{optionIndex + 1}</Badge>
                                      )}
                                      <Input
                                        value={option}
                                        onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                        placeholder={`Option ${optionIndex + 1}`}
                                        className="flex-1"
                                      />
                                      {question.options.length > 2 && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteOption(index, optionIndex)}
                                        >
                                          <Trash size={16} />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {question.type === 'multiple-choice' && 'Select the correct answer with the radio button'}
                                  {question.type === 'multiple-select' && 'Check all correct answers'}
                                  {question.type === 'ordering' && 'Options will be shuffled for learners to arrange in this order'}
                                </p>
                              </div>
                            )}

                            {question.type === 'true-false' && (
                              <div className="space-y-2">
                                <Label>Correct Answer</Label>
                                <Select
                                  value={question.correctAnswer.toString()}
                                  onValueChange={(value) => updateQuestion(index, { correctAnswer: parseInt(value) })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">True</SelectItem>
                                    <SelectItem value="1">False</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {question.type === 'short-answer' && (
                              <div className="space-y-2">
                                <Label>Accepted Answer(s)</Label>
                                <Input
                                  value={typeof question.correctAnswer === 'string' ? question.correctAnswer : ''}
                                  onChange={(e) => updateQuestion(index, { correctAnswer: e.target.value })}
                                  placeholder="Enter acceptable answer keywords (comma-separated)"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Multiple acceptable answers can be separated by commas
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Correct Feedback</Label>
                                <Textarea
                                  value={question.correctFeedback}
                                  onChange={(e) => updateQuestion(index, { correctFeedback: e.target.value })}
                                  placeholder="Great job! +50 XP"
                                  rows={2}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Incorrect Feedback</Label>
                                <Textarea
                                  value={question.incorrectFeedback}
                                  onChange={(e) => updateQuestion(index, { incorrectFeedback: e.target.value })}
                                  placeholder="Almost! Review the material and try again."
                                  rows={2}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>XP Value</Label>
                              <Input
                                type="number"
                                min="0"
                                max="500"
                                step="10"
                                value={question.xpValue}
                                onChange={(e) => updateQuestion(index, { xpValue: parseInt(e.target.value) || 0 })}
                                className="max-w-32"
                              />
                              <p className="text-xs text-muted-foreground">
                                Suggested: 50-150 XP per question
                              </p>
                            </div>
                          </>
                        )}

                        {editingIndex !== index && (
                          <div className="text-sm text-muted-foreground">
                            {question.question || 'No question text yet'} • {question.xpValue} XP
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {questions.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Total Quiz Value:</span>
                  <Badge variant="secondary" className="text-base">
                    {questions.reduce((sum, q) => sum + q.xpValue, 0)} XP
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
