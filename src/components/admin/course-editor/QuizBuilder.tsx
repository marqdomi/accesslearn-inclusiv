/**
 * QuizBuilder Component
 * Constructor visual de quizzes interactivos
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  CheckCircle2,
  Circle,
  Square,
  CheckSquare,
} from 'lucide-react'

export type QuizQuestionType = 'single' | 'multiple' | 'true-false'

export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface QuizQuestion {
  id: string
  type: QuizQuestionType
  question: string
  options: QuizOption[]
  explanation?: string
  points: number
}

export interface Quiz {
  questions: QuizQuestion[]
  passingScore: number
  showExplanations: boolean
  shuffleQuestions: boolean
  shuffleOptions: boolean
}

interface QuizBuilderProps {
  quiz: Quiz
  onChange: (quiz: Quiz) => void
}

export default function QuizBuilder({ quiz, onChange }: QuizBuilderProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      type: 'single',
      question: '',
      options: [
        { id: `o-${Date.now()}-1`, text: '', isCorrect: false },
        { id: `o-${Date.now()}-2`, text: '', isCorrect: false },
      ],
      points: 1,
    }
    onChange({
      ...quiz,
      questions: [...quiz.questions, newQuestion],
    })
    setExpandedQuestion(newQuestion.id)
  }

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    onChange({
      ...quiz,
      questions: quiz.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    })
  }

  const deleteQuestion = (questionId: string) => {
    onChange({
      ...quiz,
      questions: quiz.questions.filter((q) => q.id !== questionId),
    })
  }

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const index = quiz.questions.findIndex((q) => q.id === questionId)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === quiz.questions.length - 1)
    ) {
      return
    }

    const newQuestions = [...quiz.questions]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newQuestions[index], newQuestions[newIndex]] = [
      newQuestions[newIndex],
      newQuestions[index],
    ]

    onChange({ ...quiz, questions: newQuestions })
  }

  const addOption = (questionId: string) => {
    const question = quiz.questions.find((q) => q.id === questionId)
    if (!question) return

    const newOption: QuizOption = {
      id: `o-${Date.now()}`,
      text: '',
      isCorrect: false,
    }

    updateQuestion(questionId, {
      options: [...question.options, newOption],
    })
  }

  const updateOption = (
    questionId: string,
    optionId: string,
    updates: Partial<QuizOption>
  ) => {
    const question = quiz.questions.find((q) => q.id === questionId)
    if (!question) return

    updateQuestion(questionId, {
      options: question.options.map((o) =>
        o.id === optionId ? { ...o, ...updates } : o
      ),
    })
  }

  const deleteOption = (questionId: string, optionId: string) => {
    const question = quiz.questions.find((q) => q.id === questionId)
    if (!question || question.options.length <= 2) return

    updateQuestion(questionId, {
      options: question.options.filter((o) => o.id !== optionId),
    })
  }

  const toggleCorrectAnswer = (questionId: string, optionId: string) => {
    const question = quiz.questions.find((q) => q.id === questionId)
    if (!question) return

    if (question.type === 'single') {
      // Solo una respuesta correcta
      updateQuestion(questionId, {
        options: question.options.map((o) => ({
          ...o,
          isCorrect: o.id === optionId,
        })),
      })
    } else {
      // Múltiples respuestas
      updateOption(questionId, optionId, {
        isCorrect: !question.options.find((o) => o.id === optionId)?.isCorrect,
      })
    }
  }

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0)

  return (
    <div className="space-y-4">
      {/* Quiz Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passing-score">Passing Score (%)</Label>
              <Input
                id="passing-score"
                type="number"
                min="0"
                max="100"
                value={quiz.passingScore}
                onChange={(e) =>
                  onChange({ ...quiz, passingScore: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-end">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-explanations"
                    checked={quiz.showExplanations}
                    onCheckedChange={(checked) =>
                      onChange({ ...quiz, showExplanations: checked as boolean })
                    }
                  />
                  <Label htmlFor="show-explanations">Show explanations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shuffle-questions"
                    checked={quiz.shuffleQuestions}
                    onCheckedChange={(checked) =>
                      onChange({ ...quiz, shuffleQuestions: checked as boolean })
                    }
                  />
                  <Label htmlFor="shuffle-questions">Shuffle questions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shuffle-options"
                    checked={quiz.shuffleOptions}
                    onCheckedChange={(checked) =>
                      onChange({ ...quiz, shuffleOptions: checked as boolean })
                    }
                  />
                  <Label htmlFor="shuffle-options">Shuffle options</Label>
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Total Points: <span className="font-medium">{totalPoints}</span> •{' '}
            Questions: <span className="font-medium">{quiz.questions.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-3">
        {quiz.questions.map((question, index) => (
          <Card key={question.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Question {index + 1}</Badge>
                    <Badge variant="secondary">
                      {question.type === 'single'
                        ? 'Single Choice'
                        : question.type === 'multiple'
                        ? 'Multiple Choice'
                        : 'True/False'}
                    </Badge>
                    <Badge>{question.points} pts</Badge>
                  </div>
                  <CardTitle className="text-base cursor-pointer" onClick={() => 
                    setExpandedQuestion(expandedQuestion === question.id ? null : question.id)
                  }>
                    {question.question || 'Click to edit question...'}
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveQuestion(question.id, 'up')}
                    disabled={index === 0}
                    title="Move Up"
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveQuestion(question.id, 'down')}
                    disabled={index === quiz.questions.length - 1}
                    title="Move Down"
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteQuestion(question.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedQuestion === question.id && (
              <CardContent className="space-y-4 pt-0">
                {/* Question Text */}
                <div>
                  <Label htmlFor={`question-${question.id}`}>Question Text</Label>
                  <Textarea
                    id={`question-${question.id}`}
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(question.id, { question: e.target.value })
                    }
                    placeholder="Enter your question here..."
                    rows={3}
                  />
                </div>

                {/* Question Type & Points */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`type-${question.id}`}>Question Type</Label>
                    <Select
                      value={question.type}
                      onValueChange={(value: QuizQuestionType) =>
                        updateQuestion(question.id, {
                          type: value,
                          options:
                            value === 'true-false'
                              ? [
                                  { id: 'true', text: 'True', isCorrect: false },
                                  { id: 'false', text: 'False', isCorrect: false },
                                ]
                              : question.options,
                        })
                      }
                    >
                      <SelectTrigger id={`type-${question.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Choice</SelectItem>
                        <SelectItem value="multiple">Multiple Choice</SelectItem>
                        <SelectItem value="true-false">True/False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`points-${question.id}`}>Points</Label>
                    <Input
                      id={`points-${question.id}`}
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          points: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                {/* Options */}
                <div>
                  <Label>Answer Options</Label>
                  <div className="space-y-2 mt-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCorrectAnswer(question.id, option.id)}
                          className="shrink-0"
                          title={
                            option.isCorrect ? 'Correct answer' : 'Mark as correct'
                          }
                        >
                          {question.type === 'single' ? (
                            option.isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )
                          ) : option.isCorrect ? (
                            <CheckSquare className="w-5 h-5 text-green-600" />
                          ) : (
                            <Square className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                        <Input
                          value={option.text}
                          onChange={(e) =>
                            updateOption(question.id, option.id, {
                              text: e.target.value,
                            })
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                          disabled={question.type === 'true-false'}
                          className={
                            option.isCorrect
                              ? 'border-green-500'
                              : ''
                          }
                        />
                        {question.type !== 'true-false' &&
                          question.options.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteOption(question.id, option.id)}
                              title="Delete option"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                      </div>
                    ))}
                  </div>
                  {question.type !== 'true-false' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(question.id)}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Option
                    </Button>
                  )}
                </div>

                {/* Explanation */}
                <div>
                  <Label htmlFor={`explanation-${question.id}`}>
                    Explanation (Optional)
                  </Label>
                  <Textarea
                    id={`explanation-${question.id}`}
                    value={question.explanation || ''}
                    onChange={(e) =>
                      updateQuestion(question.id, { explanation: e.target.value })
                    }
                    placeholder="Explain why this answer is correct..."
                    rows={2}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Add Question Button */}
      <Button onClick={addQuestion} className="w-full" variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        Add Question
      </Button>

      {quiz.questions.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No questions yet</p>
          <Button onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Question
          </Button>
        </div>
      )}
    </div>
  )
}
