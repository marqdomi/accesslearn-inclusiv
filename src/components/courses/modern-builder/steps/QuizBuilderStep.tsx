/**
 * QuizBuilderStep — Orchestrator
 *
 * Decomposed from 1 536-line monolith into:
 *  - quiz/QuizMetadataDialog.tsx  (~260 lines) — quiz config dialog
 *  - quiz/QuestionDialog.tsx      (~340 lines) — question editor (all 6 types)
 *  - quiz/QuestionList.tsx        (~110 lines) — question cards
 *  - quiz/ScenarioEditor.tsx      (~260 lines) — decision-tree editor
 */
import { CourseStructure, Quiz, QuizQuestion, ScenarioQuestion } from '@/lib/types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, PencilSimple, Trash, Info } from '@phosphor-icons/react'

import { QuizMetadataDialog, type QuizFormState } from '../quiz/QuizMetadataDialog'
import { QuestionDialog, type QuestionFormState } from '../quiz/QuestionDialog'
import { QuestionList } from '../quiz/QuestionList'

interface QuizBuilderStepProps {
  course: CourseStructure
  updateCourse: (updates: Partial<CourseStructure>) => void
}

export function QuizBuilderStep({ course, updateCourse }: QuizBuilderStepProps) {
  const [selectedLessonPath, setSelectedLessonPath] = useState<string>('')
  const [isQuizMetadataOpen, setIsQuizMetadataOpen] = useState(false)
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<{ questionIndex: number; data: QuizQuestion } | null>(null)

  // ── Form states ────────────────────────────────────────
  const [quizForm, setQuizForm] = useState<QuizFormState>({
    title: '',
    description: '',
    passingScore: 70,
    maxAttempts: 3,
    showTimer: false,
    timeLimit: 0,
    examMode: false,
    examModeType: 'timed',
    examDuration: 60,
    examMinPassingScore: 70,
    examQuestionCount: 0,
    useRandomSelection: false,
  })

  const [questionForm, setQuestionForm] = useState<QuestionFormState>({
    type: 'multiple-choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    correctAnswers: [],
    correctOrder: [],
    fillBlankText: '',
    fillBlankAnswers: [],
    fillBlankOptions: [],
    correctFeedback: '¡Correcto! Excelente trabajo.',
    incorrectFeedback: 'Incorrecto. Inténtalo de nuevo.',
    xpValue: 10,
  })

  const [scenarioForm, setScenarioForm] = useState<ScenarioQuestion>({
    title: '',
    description: '',
    steps: [],
    startStepId: 'step-1',
    perfectScore: 100,
  })

  // ── Helpers ────────────────────────────────────────────
  const getSelectedLesson = () => {
    if (!selectedLessonPath) return null
    const [moduleIndex, lessonIndex] = selectedLessonPath.split('-').map(Number)
    const lesson = course.modules[moduleIndex]?.lessons[lessonIndex]
    if (!lesson) return null
    return { moduleIndex, lessonIndex, lesson }
  }

  const selectedLesson = getSelectedLesson()
  const currentQuiz = selectedLesson?.lesson.quiz

  // ── Quiz metadata handlers ─────────────────────────────
  const handleOpenQuizMetadata = () => {
    if (currentQuiz) {
      setQuizForm({
        title: currentQuiz.title,
        description: currentQuiz.description,
        passingScore: currentQuiz.passingScore,
        maxAttempts: currentQuiz.maxAttempts,
        showTimer: currentQuiz.showTimer ?? false,
        timeLimit: currentQuiz.timeLimit ? Math.floor(currentQuiz.timeLimit / 60) : 0,
        examMode: currentQuiz.examMode ?? false,
        examModeType: (currentQuiz as any).examModeType ?? 'timed',
        examDuration: (currentQuiz as any).examDuration ?? 60,
        examMinPassingScore: (currentQuiz as any).examMinPassingScore ?? 70,
        examQuestionCount: (currentQuiz as any).examQuestionCount ?? 0,
        useRandomSelection: (currentQuiz as any).useRandomSelection ?? false,
      })
    } else {
      setQuizForm({
        title: `Quiz: ${selectedLesson?.lesson.title || ''}`,
        description: 'Evaluación de la lección',
        passingScore: 70,
        maxAttempts: 3,
        showTimer: false,
        timeLimit: 0,
        examMode: false,
        examModeType: 'timed',
        examDuration: 60,
        examMinPassingScore: 70,
        examQuestionCount: 0,
        useRandomSelection: false,
      })
    }
    setIsQuizMetadataOpen(true)
  }

  const handleSaveQuizMetadata = () => {
    if (!selectedLesson) return

    const updatedModules = [...course.modules]
    const lesson = updatedModules[selectedLesson.moduleIndex].lessons[selectedLesson.lessonIndex]

    if (!lesson.quiz) {
      lesson.quiz = {
        id: `quiz-${Date.now()}`,
        title: quizForm.title,
        description: quizForm.description,
        questions: [],
        passingScore: quizForm.passingScore,
        maxAttempts: quizForm.maxAttempts,
        totalXP: 0,
        showTimer: quizForm.showTimer || quizForm.examMode,
        timeLimit: quizForm.timeLimit > 0 ? quizForm.timeLimit * 60 : undefined,
        examMode: quizForm.examMode,
        examModeType: quizForm.examMode ? quizForm.examModeType : undefined,
        examDuration: quizForm.examMode && quizForm.examModeType === 'timed' ? quizForm.examDuration : undefined,
        examMinPassingScore: quizForm.examMode ? quizForm.examMinPassingScore : undefined,
        examQuestionCount: quizForm.examMode && quizForm.useRandomSelection ? quizForm.examQuestionCount : undefined,
        useRandomSelection: quizForm.examMode ? quizForm.useRandomSelection : undefined,
        questionBank: undefined,
      }
    } else {
      lesson.quiz.title = quizForm.title
      lesson.quiz.description = quizForm.description
      lesson.quiz.passingScore = quizForm.passingScore
      lesson.quiz.maxAttempts = quizForm.maxAttempts
      lesson.quiz.showTimer = quizForm.showTimer || quizForm.examMode
      lesson.quiz.timeLimit = quizForm.timeLimit > 0 ? quizForm.timeLimit * 60 : undefined
      lesson.quiz.examMode = quizForm.examMode

      if (quizForm.examMode) {
        lesson.quiz.examModeType = quizForm.examModeType
        if (quizForm.examModeType === 'timed') lesson.quiz.examDuration = quizForm.examDuration
        lesson.quiz.examMinPassingScore = quizForm.examMinPassingScore
        if (quizForm.useRandomSelection) {
          lesson.quiz.examQuestionCount = quizForm.examQuestionCount
          lesson.quiz.useRandomSelection = true
          if (!lesson.quiz.questionBank || lesson.quiz.questionBank.length === 0) {
            lesson.quiz.questionBank = [...(lesson.quiz.questions || [])]
          }
        } else {
          lesson.quiz.useRandomSelection = false
          lesson.quiz.examQuestionCount = undefined
        }
      } else {
        lesson.quiz.examModeType = undefined
        lesson.quiz.examDuration = undefined
        lesson.quiz.examMinPassingScore = undefined
        lesson.quiz.examQuestionCount = undefined
        lesson.quiz.useRandomSelection = undefined
        lesson.quiz.questionBank = undefined
      }
    }

    updateCourse({ modules: updatedModules })
    setIsQuizMetadataOpen(false)
  }

  const handleDeleteQuiz = () => {
    if (!selectedLesson || !confirm('¿Eliminar este quiz? Se perderán todas las preguntas.')) return
    const updatedModules = [...course.modules]
    updatedModules[selectedLesson.moduleIndex].lessons[selectedLesson.lessonIndex].quiz = undefined
    updateCourse({ modules: updatedModules })
  }

  // ── Question handlers ──────────────────────────────────
  const handleAddQuestion = () => {
    setEditingQuestion(null)
    setQuestionForm({
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      correctAnswers: [],
      correctOrder: [],
      fillBlankText: '',
      fillBlankAnswers: [],
      fillBlankOptions: [],
      correctFeedback: '¡Correcto! Excelente trabajo.',
      incorrectFeedback: 'Incorrecto. Inténtalo de nuevo.',
      xpValue: 10,
    })
    setScenarioForm({ title: '', description: '', steps: [], startStepId: 'step-1', perfectScore: 100 })
    setIsQuestionDialogOpen(true)
  }

  const handleEditQuestion = (questionIndex: number) => {
    if (!currentQuiz) return
    const question = currentQuiz.questions[questionIndex]
    setEditingQuestion({ questionIndex, data: question })

    if (question.type === 'scenario-solver') {
      setScenarioForm(
        typeof question.question === 'object'
          ? (question.question as ScenarioQuestion)
          : { title: '', description: '', steps: [], startStepId: 'step-1', perfectScore: 100 }
      )
    }

    const isFillBlank = question.type === 'fill-blank'
    const fillBlankData = isFillBlank && typeof question.question === 'object' ? (question.question as any) : null

    setQuestionForm({
      type: question.type,
      question: typeof question.question === 'string' ? question.question : fillBlankData?.text || '',
      options: Array.isArray(question.options) ? question.options : ['', '', '', ''],
      correctAnswer: typeof question.correctAnswer === 'number' ? question.correctAnswer : 0,
      correctAnswers: Array.isArray(question.correctAnswer) ? question.correctAnswer : [],
      correctOrder:
        question.type === 'ordering' && Array.isArray(question.correctAnswer)
          ? question.correctAnswer
          : Array.isArray(question.options)
            ? question.options.map((_, i) => i)
            : [],
      fillBlankText: fillBlankData?.text || '',
      fillBlankAnswers: fillBlankData?.blanks || [],
      fillBlankOptions: fillBlankData?.options || [],
      correctFeedback: question.correctFeedback,
      incorrectFeedback: question.incorrectFeedback,
      xpValue: question.xpValue,
    })
    setIsQuestionDialogOpen(true)
  }

  const handleSaveQuestion = () => {
    if (!selectedLesson || !currentQuiz) return

    if (questionForm.type === 'scenario-solver') {
      if (!scenarioForm.title.trim() || scenarioForm.steps.length === 0) {
        alert('El escenario debe tener un título y al menos un paso.')
        return
      }
    } else if (!questionForm.question.trim() && questionForm.type !== 'fill-blank') {
      return
    }

    let correctAnswer: number | number[] | string
    let questionText: string | ScenarioQuestion | any

    if (questionForm.type === 'scenario-solver') {
      questionText = scenarioForm
      correctAnswer = 0
    } else if (questionForm.type === 'multiple-choice') {
      questionText = questionForm.question
      correctAnswer = questionForm.correctAnswer
    } else if (questionForm.type === 'multiple-select') {
      questionText = questionForm.question
      correctAnswer = questionForm.correctAnswers
    } else if (questionForm.type === 'ordering') {
      questionText = questionForm.question
      const validCorrectOrder = Array.isArray(questionForm.correctOrder) ? questionForm.correctOrder : []
      const validOptions = Array.isArray(questionForm.options) ? questionForm.options : []
      correctAnswer =
        validCorrectOrder.length > 0
          ? validCorrectOrder
          : validOptions.map((_, i) => i).filter((_, i) => validOptions[i]?.trim() !== '')
    } else if (questionForm.type === 'true-false') {
      questionText = questionForm.question
      correctAnswer = questionForm.correctAnswer
    } else if (questionForm.type === 'fill-blank') {
      questionText = {
        text: questionForm.fillBlankText,
        blanks: questionForm.fillBlankAnswers.filter((b) => b.trim()),
        options: questionForm.fillBlankOptions.filter((o) => o.trim()),
        explanation: questionForm.correctFeedback || undefined,
      }
      correctAnswer = questionForm.fillBlankAnswers.join('|')
    } else {
      questionText = questionForm.question
      correctAnswer = 0
    }

    const newQuestion: QuizQuestion = {
      id: editingQuestion ? editingQuestion.data.id : `question-${Date.now()}`,
      type: questionForm.type,
      question: questionText,
      options: ['multiple-choice', 'multiple-select', 'true-false', 'ordering', 'fill-blank'].includes(
        questionForm.type
      )
        ? (Array.isArray(questionForm.options) ? questionForm.options.filter((o) => o?.trim()) : [])
        : [],
      correctAnswer,
      correctFeedback: questionForm.correctFeedback,
      incorrectFeedback: questionForm.incorrectFeedback,
      xpValue: questionForm.xpValue,
    }

    const updatedModules = [...course.modules]
    const quiz = updatedModules[selectedLesson.moduleIndex].lessons[selectedLesson.lessonIndex].quiz!

    if (editingQuestion !== null) {
      quiz.questions[editingQuestion.questionIndex] = newQuestion
      if (quiz.useRandomSelection && quiz.questionBank) {
        const bankIndex = quiz.questionBank.findIndex((q) => q.id === newQuestion.id)
        if (bankIndex !== -1) quiz.questionBank[bankIndex] = newQuestion
      }
    } else {
      quiz.questions.push(newQuestion)
      if (quiz.useRandomSelection) {
        if (!quiz.questionBank) quiz.questionBank = []
        if (!quiz.questionBank.find((q) => q.id === newQuestion.id)) quiz.questionBank.push(newQuestion)
      }
    }

    quiz.totalXP = quiz.questions.reduce((acc, q) => acc + q.xpValue, 0)
    updateCourse({ modules: updatedModules })
    setIsQuestionDialogOpen(false)
  }

  const handleDeleteQuestion = (questionIndex: number) => {
    if (!selectedLesson || !currentQuiz || !confirm('¿Eliminar esta pregunta?')) return
    const updatedModules = [...course.modules]
    const quiz = updatedModules[selectedLesson.moduleIndex].lessons[selectedLesson.lessonIndex].quiz!
    const questionToDelete = quiz.questions[questionIndex]
    quiz.questions = quiz.questions.filter((_, i) => i !== questionIndex)
    if (quiz.useRandomSelection && quiz.questionBank && questionToDelete) {
      quiz.questionBank = quiz.questionBank.filter((q) => q.id !== questionToDelete.id)
    }
    quiz.totalXP = quiz.questions.reduce((acc, q) => acc + q.xpValue, 0)
    updateCourse({ modules: updatedModules })
  }

  // ── Stats ──────────────────────────────────────────────
  const totalQuizzes = course.modules.reduce((acc, m) => acc + m.lessons.filter((l) => l.quiz).length, 0)

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Constructor de Quizzes</h2>
        <p className="text-muted-foreground">Añade evaluaciones a tus lecciones para validar el aprendizaje</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalQuizzes}</p>
              <p className="text-sm text-muted-foreground">Quizzes Totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{currentQuiz?.questions.length || 0}</p>
              <p className="text-sm text-muted-foreground">Preguntas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{currentQuiz?.totalXP || 0} XP</p>
              <p className="text-sm text-muted-foreground">XP del Quiz</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Seleccionar Lección</label>
        <Select value={selectedLessonPath} onValueChange={setSelectedLessonPath}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una lección para agregar un quiz" />
          </SelectTrigger>
          <SelectContent>
            {course.modules.map((module, moduleIndex) => (
              <SelectGroup key={module.id}>
                <SelectLabel>{module.title}</SelectLabel>
                {module.lessons.map((lesson, lessonIndex) => (
                  <SelectItem key={lesson.id} value={`${moduleIndex}-${lessonIndex}`}>
                    {lesson.title} {lesson.quiz && '✓'}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedLesson ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>Selecciona una lección para agregar o editar un quiz.</AlertDescription>
        </Alert>
      ) : !currentQuiz ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Esta lección aún no tiene un quiz</p>
            <Button onClick={handleOpenQuizMetadata}>
              <Plus className="mr-2" size={16} />
              Crear Quiz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Quiz Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentQuiz.title}</span>
                <div className="flex gap-2">
                  <Badge>{currentQuiz.totalXP} XP</Badge>
                  <Badge variant="outline">{currentQuiz.passingScore}% para aprobar</Badge>
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{currentQuiz.description}</p>
              <p className="text-xs text-muted-foreground">Máximo {currentQuiz.maxAttempts} intentos</p>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={handleOpenQuizMetadata}>
                  <PencilSimple className="mr-2" size={14} />
                  Editar Configuración
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={handleDeleteQuiz}>
                  <Trash className="mr-2" size={14} />
                  Eliminar Quiz
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Add Question Button */}
          <Button onClick={handleAddQuestion} size="lg" className="w-full">
            <Plus className="mr-2" size={20} />
            Agregar Pregunta
          </Button>

          {/* Questions List */}
          {currentQuiz.questions.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>Este quiz aún no tiene preguntas. Agrega tu primera pregunta.</AlertDescription>
            </Alert>
          ) : (
            <QuestionList
              questions={currentQuiz.questions}
              onEdit={handleEditQuestion}
              onDelete={handleDeleteQuestion}
            />
          )}
        </>
      )}

      {/* Dialogs */}
      <QuizMetadataDialog
        open={isQuizMetadataOpen}
        onOpenChange={setIsQuizMetadataOpen}
        quizForm={quizForm}
        setQuizForm={setQuizForm}
        currentQuiz={currentQuiz}
        onSave={handleSaveQuizMetadata}
      />

      <QuestionDialog
        open={isQuestionDialogOpen}
        onOpenChange={setIsQuestionDialogOpen}
        questionForm={questionForm}
        setQuestionForm={setQuestionForm}
        scenarioForm={scenarioForm}
        setScenarioForm={setScenarioForm}
        editingQuestion={editingQuestion}
        onSave={handleSaveQuestion}
      />
    </div>
  )
}
