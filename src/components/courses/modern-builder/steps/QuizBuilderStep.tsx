import { CourseStructure, Quiz, QuizQuestion, ScenarioQuestion, ScenarioStep, ScenarioOption } from '@/lib/types'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  PencilSimple,
  Trash,
  Info,
  CheckCircle,
  Question,
  ListChecks,
  TextT,
  SortAscending,
  FlowArrow,
  GitBranch,
  Target,
} from '@phosphor-icons/react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'

interface QuizBuilderStepProps {
  course: CourseStructure
  updateCourse: (updates: Partial<CourseStructure>) => void
}

const QUESTION_TYPES = [
  { value: 'multiple-choice', label: 'Opción Múltiple', icon: Question, description: 'Una respuesta correcta' },
  { value: 'multiple-select', label: 'Selección Múltiple', icon: ListChecks, description: 'Varias respuestas correctas' },
  { value: 'true-false', label: 'Verdadero/Falso', icon: CheckCircle, description: 'Pregunta binaria' },
  { value: 'short-answer', label: 'Respuesta Corta', icon: TextT, description: 'Respuesta de texto' },
  { value: 'ordering', label: 'Ordenamiento', icon: SortAscending, description: 'Ordenar elementos' },
  { value: 'scenario-solver', label: 'Árbol de Decisiones', icon: GitBranch, description: 'Escenario interactivo ramificado' },
] as const

export function QuizBuilderStep({ course, updateCourse }: QuizBuilderStepProps) {
  const [selectedLessonPath, setSelectedLessonPath] = useState<string>('')
  const [isQuizMetadataOpen, setIsQuizMetadataOpen] = useState(false)
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<{ questionIndex: number; data: QuizQuestion } | null>(null)

  // Quiz metadata form
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    passingScore: 70,
    maxAttempts: 3,
  })

  // Question form
  const [questionForm, setQuestionForm] = useState({
    type: 'multiple-choice' as QuizQuestion['type'],
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    correctAnswers: [] as number[],
    correctOrder: [] as number[], // Para preguntas de ordenamiento: [0, 1, 2, 3...]
    shortAnswer: '',
    correctFeedback: '¡Correcto! Excelente trabajo.',
    incorrectFeedback: 'Incorrecto. Inténtalo de nuevo.',
    xpValue: 10,
  })

  // Scenario form states
  const [scenarioForm, setScenarioForm] = useState<ScenarioQuestion>({
    title: '',
    description: '',
    steps: [],
    startStepId: 'step-1',
    perfectScore: 100,
  })
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false)

  // Parse selected lesson path
  const getSelectedLesson = () => {
    if (!selectedLessonPath) return null
    const [moduleIndex, lessonIndex] = selectedLessonPath.split('-').map(Number)
    const lesson = course.modules[moduleIndex]?.lessons[lessonIndex]
    if (!lesson) return null
    return { moduleIndex, lessonIndex, lesson }
  }

  const selectedLesson = getSelectedLesson()
  const currentQuiz = selectedLesson?.lesson.quiz

  // Create or edit quiz metadata
  const handleOpenQuizMetadata = () => {
    if (currentQuiz) {
      setQuizForm({
        title: currentQuiz.title,
        description: currentQuiz.description,
        passingScore: currentQuiz.passingScore,
        maxAttempts: currentQuiz.maxAttempts,
      })
    } else {
      setQuizForm({
        title: `Quiz: ${selectedLesson?.lesson.title || ''}`,
        description: 'Evaluación de la lección',
        passingScore: 70,
        maxAttempts: 3,
      })
    }
    setIsQuizMetadataOpen(true)
  }

  // Save quiz metadata
  const handleSaveQuizMetadata = () => {
    if (!selectedLesson) return

    const updatedModules = [...course.modules]
    const lesson = updatedModules[selectedLesson.moduleIndex].lessons[selectedLesson.lessonIndex]

    if (!lesson.quiz) {
      // Create new quiz
      lesson.quiz = {
        id: `quiz-${Date.now()}`,
        title: quizForm.title,
        description: quizForm.description,
        questions: [],
        passingScore: quizForm.passingScore,
        maxAttempts: quizForm.maxAttempts,
        totalXP: 0,
      }
    } else {
      // Update existing quiz
      lesson.quiz.title = quizForm.title
      lesson.quiz.description = quizForm.description
      lesson.quiz.passingScore = quizForm.passingScore
      lesson.quiz.maxAttempts = quizForm.maxAttempts
    }

    updateCourse({ modules: updatedModules })
    setIsQuizMetadataOpen(false)
  }

  // Delete quiz
  const handleDeleteQuiz = () => {
    if (!selectedLesson || !confirm('¿Eliminar este quiz? Se perderán todas las preguntas.')) return

    const updatedModules = [...course.modules]
    updatedModules[selectedLesson.moduleIndex].lessons[selectedLesson.lessonIndex].quiz = undefined
    updateCourse({ modules: updatedModules })
  }

  // Add new question
  const handleAddQuestion = () => {
    setEditingQuestion(null)
    setQuestionForm({
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      correctAnswers: [],
      correctOrder: [], // Inicializar correctOrder para evitar undefined
      shortAnswer: '',
      correctFeedback: '¡Correcto! Excelente trabajo.',
      incorrectFeedback: 'Incorrecto. Inténtalo de nuevo.',
      xpValue: 10,
    })
    setScenarioForm({
      title: '',
      description: '',
      steps: [],
      startStepId: 'step-1',
      perfectScore: 100,
    })
    setIsQuestionDialogOpen(true)
  }

  // Edit existing question
  const handleEditQuestion = (questionIndex: number) => {
    if (!currentQuiz) return

    const question = currentQuiz.questions[questionIndex]
    setEditingQuestion({ questionIndex, data: question })
    
    if (question.type === 'scenario-solver') {
      setScenarioForm(typeof question.question === 'object' ? question.question as ScenarioQuestion : {
        title: '',
        description: '',
        steps: [],
        startStepId: 'step-1',
        perfectScore: 100,
      })
    }
    
    setQuestionForm({
      type: question.type,
      question: typeof question.question === 'string' ? question.question : '',
      options: Array.isArray(question.options) ? question.options : ['', '', '', ''],
      correctAnswer: typeof question.correctAnswer === 'number' ? question.correctAnswer : 0,
      correctAnswers: Array.isArray(question.correctAnswer) ? question.correctAnswer : [],
      correctOrder: question.type === 'ordering' && Array.isArray(question.correctAnswer) 
        ? question.correctAnswer 
        : Array.isArray(question.options) 
          ? question.options.map((_, i) => i) 
          : [],
      shortAnswer: typeof question.correctAnswer === 'string' ? question.correctAnswer : '',
      correctFeedback: question.correctFeedback,
      incorrectFeedback: question.incorrectFeedback,
      xpValue: question.xpValue,
    })
    setIsQuestionDialogOpen(true)
  }

  // Save question
  const handleSaveQuestion = () => {
    if (!selectedLesson || !currentQuiz) return

    // Validación específica por tipo
    if (questionForm.type === 'scenario-solver') {
      if (!scenarioForm.title.trim() || scenarioForm.steps.length === 0) {
        alert('El escenario debe tener un título y al menos un paso.')
        return
      }
    } else {
      if (!questionForm.question.trim()) return
    }

    let correctAnswer: number | number[] | string
    let questionText: string | ScenarioQuestion
    
    if (questionForm.type === 'scenario-solver') {
      questionText = scenarioForm
      correctAnswer = 0 // No aplica para scenarios
    } else if (questionForm.type === 'multiple-choice') {
      questionText = questionForm.question
      correctAnswer = questionForm.correctAnswer
    } else if (questionForm.type === 'multiple-select') {
      questionText = questionForm.question
      correctAnswer = questionForm.correctAnswers
    } else if (questionForm.type === 'ordering') {
      questionText = questionForm.question
      // El orden correcto es el orden en que están las opciones por defecto [0, 1, 2, 3...]
      // O el orden que el usuario haya configurado en correctOrder
      const validCorrectOrder = Array.isArray(questionForm.correctOrder) ? questionForm.correctOrder : []
      const validOptions = Array.isArray(questionForm.options) ? questionForm.options : []
      correctAnswer = validCorrectOrder.length > 0 
        ? validCorrectOrder 
        : validOptions.map((_, i) => i).filter((_, i) => validOptions[i]?.trim() !== '')
    } else if (questionForm.type === 'true-false') {
      questionText = questionForm.question
      correctAnswer = questionForm.correctAnswer
    } else {
      questionText = questionForm.question
      correctAnswer = questionForm.shortAnswer
    }

    const newQuestion: QuizQuestion = {
      id: editingQuestion ? editingQuestion.data.id : `question-${Date.now()}`,
      type: questionForm.type,
      question: questionText,
      options: ['multiple-choice', 'multiple-select', 'true-false', 'ordering'].includes(questionForm.type) 
        ? (Array.isArray(questionForm.options) ? questionForm.options.filter(o => o?.trim()) : [])
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
    } else {
      quiz.questions.push(newQuestion)
    }

    // Recalculate total XP
    quiz.totalXP = quiz.questions.reduce((acc, q) => acc + q.xpValue, 0)

    updateCourse({ modules: updatedModules })
    setIsQuestionDialogOpen(false)
  }

  // Delete question
  const handleDeleteQuestion = (questionIndex: number) => {
    if (!selectedLesson || !currentQuiz || !confirm('¿Eliminar esta pregunta?')) return

    const updatedModules = [...course.modules]
    const quiz = updatedModules[selectedLesson.moduleIndex].lessons[selectedLesson.lessonIndex].quiz!
    
    quiz.questions = quiz.questions.filter((_, i) => i !== questionIndex)
    quiz.totalXP = quiz.questions.reduce((acc, q) => acc + q.xpValue, 0)

    updateCourse({ modules: updatedModules })
  }

  // Scenario step management
  const handleAddStep = () => {
    const newStep: ScenarioStep = {
      id: `step-${scenarioForm.steps.length + 1}`,
      situation: '',
      context: '',
      options: [],
    }
    setScenarioForm({ ...scenarioForm, steps: [...scenarioForm.steps, newStep] })
  }

  const handleDeleteStep = (stepIndex: number) => {
    if (!confirm('¿Eliminar este paso del escenario?')) return
    const updatedSteps = scenarioForm.steps.filter((_, i) => i !== stepIndex)
    setScenarioForm({ ...scenarioForm, steps: updatedSteps })
  }

  const handleUpdateStep = (stepIndex: number, field: keyof ScenarioStep, value: any) => {
    const updatedSteps = [...scenarioForm.steps]
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], [field]: value }
    setScenarioForm({ ...scenarioForm, steps: updatedSteps })
  }

  const handleAddOption = (stepIndex: number) => {
    const newOption: ScenarioOption = {
      id: `opt-${stepIndex}-${scenarioForm.steps[stepIndex].options.length + 1}`,
      text: '',
      consequence: '',
      isCorrect: false,
      score: 0,
    }
    const updatedSteps = [...scenarioForm.steps]
    updatedSteps[stepIndex].options.push(newOption)
    setScenarioForm({ ...scenarioForm, steps: updatedSteps })
  }

  const handleDeleteOption = (stepIndex: number, optionIndex: number) => {
    const updatedSteps = [...scenarioForm.steps]
    updatedSteps[stepIndex].options = updatedSteps[stepIndex].options.filter((_, i) => i !== optionIndex)
    setScenarioForm({ ...scenarioForm, steps: updatedSteps })
  }

  const handleUpdateOption = (stepIndex: number, optionIndex: number, field: keyof ScenarioOption, value: any) => {
    const updatedSteps = [...scenarioForm.steps]
    updatedSteps[stepIndex].options[optionIndex] = {
      ...updatedSteps[stepIndex].options[optionIndex],
      [field]: value
    }
    setScenarioForm({ ...scenarioForm, steps: updatedSteps })
  }

  // Get question type label
  const getQuestionTypeLabel = (type: QuizQuestion['type']) => {
    return QUESTION_TYPES.find(qt => qt.value === type)?.label || 'Pregunta'
  }

  // Calculate total quizzes
  const totalQuizzes = course.modules.reduce((acc, m) => 
    acc + m.lessons.filter(l => l.quiz).length, 0
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Constructor de Quizzes</h2>
        <p className="text-muted-foreground">
          Añade evaluaciones a tus lecciones para validar el aprendizaje
        </p>
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
        <Label>Seleccionar Lección</Label>
        <Select value={selectedLessonPath} onValueChange={setSelectedLessonPath}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una lección para agregar un quiz" />
          </SelectTrigger>
          <SelectContent>
            {course.modules.map((module, moduleIndex) => (
              <SelectGroup key={module.id}>
                <SelectLabel>{module.title}</SelectLabel>
                {module.lessons.map((lesson, lessonIndex) => (
                  <SelectItem 
                    key={lesson.id} 
                    value={`${moduleIndex}-${lessonIndex}`}
                  >
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
          <AlertDescription>
            Selecciona una lección para agregar o editar un quiz.
          </AlertDescription>
        </Alert>
      ) : !currentQuiz ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Esta lección aún no tiene un quiz
            </p>
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
              <p className="text-sm text-muted-foreground">
                {currentQuiz.description}
              </p>
              <p className="text-xs text-muted-foreground">
                Máximo {currentQuiz.maxAttempts} intentos
              </p>
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
              <AlertDescription>
                Este quiz aún no tiene preguntas. Agrega tu primera pregunta.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {currentQuiz.questions.map((question, questionIndex) => {
                const QuestionIcon = QUESTION_TYPES.find(qt => qt.value === question.type)?.icon || Question
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
                              <p className="font-medium mb-2">{typeof question.question === 'string' ? question.question : ''}</p>
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
                                        <CheckCircle size={14} className="text-green-600" weight="fill" />
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuestion(questionIndex)}
                          >
                            <PencilSimple size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteQuestion(questionIndex)}
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
          )}
        </>
      )}

      {/* Quiz Metadata Dialog */}
      <Dialog open={isQuizMetadataOpen} onOpenChange={setIsQuizMetadataOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración del Quiz</DialogTitle>
            <DialogDescription>
              Define la configuración general del quiz
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuizMetadataOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveQuizMetadata} disabled={!quizForm.title.trim()}>
              {currentQuiz ? 'Actualizar' : 'Crear'} Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}
            </DialogTitle>
            <DialogDescription>
              Las preguntas evalúan la comprensión del estudiante
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
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
              <div className="space-y-4">
                {/* Scenario Metadata */}
                <div className="space-y-2">
                  <Label htmlFor="scenario-title">Título del Escenario *</Label>
                  <Input
                    id="scenario-title"
                    placeholder="ej. Cliente Frustrado por Retraso"
                    value={scenarioForm.title}
                    onChange={(e) => setScenarioForm({ ...scenarioForm, title: e.target.value })}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scenario-description">Descripción *</Label>
                  <Textarea
                    id="scenario-description"
                    placeholder="Describe el escenario interactivo..."
                    value={scenarioForm.description}
                    onChange={(e) => setScenarioForm({ ...scenarioForm, description: e.target.value })}
                    rows={2}
                    maxLength={300}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-step">ID de Paso Inicial *</Label>
                    <Input
                      id="start-step"
                      placeholder="step-1"
                      value={scenarioForm.startStepId}
                      onChange={(e) => setScenarioForm({ ...scenarioForm, startStepId: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perfect-score">Puntaje Perfecto *</Label>
                    <Input
                      id="perfect-score"
                      type="number"
                      min={0}
                      max={200}
                      value={scenarioForm.perfectScore}
                      onChange={(e) => setScenarioForm({ ...scenarioForm, perfectScore: parseInt(e.target.value) || 100 })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Steps Editor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <FlowArrow size={18} />
                      Pasos del Escenario ({scenarioForm.steps.length})
                    </Label>
                    <Button onClick={handleAddStep} size="sm" variant="outline">
                      <Plus className="mr-1" size={14} />
                      Agregar Paso
                    </Button>
                  </div>

                  {scenarioForm.steps.length === 0 ? (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Agrega al menos un paso con opciones para crear el árbol de decisiones.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <ScrollArea className="h-[400px] border rounded-lg p-4">
                      <div className="space-y-4">
                        {scenarioForm.steps.map((step, stepIndex) => (
                          <Card key={step.id} className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Target size={14} />
                                  {step.id}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive h-7 w-7 p-0"
                                  onClick={() => handleDeleteStep(stepIndex)}
                                >
                                  <Trash size={14} />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs">Situación *</Label>
                                <Input
                                  placeholder="Título de este paso..."
                                  value={step.situation}
                                  onChange={(e) => handleUpdateStep(stepIndex, 'situation', e.target.value)}
                                  maxLength={100}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs">Contexto</Label>
                                <Textarea
                                  placeholder="Descripción del escenario en este punto..."
                                  value={step.context || ''}
                                  onChange={(e) => handleUpdateStep(stepIndex, 'context', e.target.value)}
                                  rows={2}
                                  maxLength={500}
                                />
                              </div>

                              {/* Options for this step */}
                              <div className="space-y-2 pl-3 border-l-2">
                                <Label className="text-xs font-semibold">Opciones de Decisión ({step.options.length})</Label>
                                {step.options.map((option, optionIndex) => (
                                  <Card key={option.id} className="p-3 bg-muted/30">
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-mono text-muted-foreground">{option.id}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-6 p-0 text-destructive"
                                          onClick={() => handleDeleteOption(stepIndex, optionIndex)}
                                        >
                                          <Trash size={12} />
                                        </Button>
                                      </div>

                                      <Input
                                        placeholder="Texto de la opción..."
                                        value={option.text}
                                        onChange={(e) => handleUpdateOption(stepIndex, optionIndex, 'text', e.target.value)}
                                        className="text-sm"
                                        maxLength={200}
                                      />

                                      <Textarea
                                        placeholder="Consecuencia de elegir esta opción..."
                                        value={option.consequence}
                                        onChange={(e) => handleUpdateOption(stepIndex, optionIndex, 'consequence', e.target.value)}
                                        rows={2}
                                        className="text-sm"
                                        maxLength={300}
                                      />

                                      <div className="grid grid-cols-3 gap-2">
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            id={`correct-${stepIndex}-${optionIndex}`}
                                            checked={option.isCorrect}
                                            onCheckedChange={(checked) => 
                                              handleUpdateOption(stepIndex, optionIndex, 'isCorrect', checked)
                                            }
                                          />
                                          <Label htmlFor={`correct-${stepIndex}-${optionIndex}`} className="text-xs">
                                            Correcta
                                          </Label>
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-xs">Puntos</Label>
                                          <Input
                                            type="number"
                                            min={-20}
                                            max={50}
                                            value={option.score}
                                            onChange={(e) => handleUpdateOption(stepIndex, optionIndex, 'score', parseInt(e.target.value) || 0)}
                                            className="h-7 text-xs"
                                          />
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-xs">Siguiente</Label>
                                          <Select
                                            value={option.nextScenarioId || ''}
                                            onValueChange={(value) => 
                                              handleUpdateOption(stepIndex, optionIndex, 'nextScenarioId', value || undefined)
                                            }
                                          >
                                            <SelectTrigger className="h-7 text-xs">
                                              <SelectValue placeholder="Fin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="">Sin siguiente (Fin)</SelectItem>
                                              {scenarioForm.steps.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.id}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-7 text-xs"
                                  onClick={() => handleAddOption(stepIndex)}
                                >
                                  <Plus className="mr-1" size={12} />
                                  Agregar Opción
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
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
              <div className="space-y-2">
                <Label>Opciones de Respuesta *</Label>
                {questionForm.type === 'true-false' ? (
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
                ) : questionForm.type === 'ordering' ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Define el orden correcto. El orden por defecto es el orden de la lista (1, 2, 3, 4...).
                    </p>
                    {(Array.isArray(questionForm.options) ? questionForm.options : []).map((option, index) => {
                      // Asegurar que correctOrder y options sean arrays válidos
                      const validOptions = Array.isArray(questionForm.options) ? questionForm.options : []
                      const validCorrectOrder = Array.isArray(questionForm.correctOrder) ? questionForm.correctOrder : []
                      
                      // Inicializar correctOrder si está vacío o undefined
                      const currentOrder = validCorrectOrder.length > 0 
                        ? validCorrectOrder 
                        : validOptions.map((_, i) => i).filter((_, i) => validOptions[i]?.trim() !== '')
                      
                      const position = currentOrder.indexOf(index) >= 0 ? currentOrder.indexOf(index) + 1 : index + 1
                      
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-20">
                            <Label className="text-xs text-muted-foreground">Posición:</Label>
                            <Input
                              type="number"
                              min={1}
                              max={validOptions.filter(o => o?.trim()).length || 1}
                              value={position || 1}
                              onChange={(e) => {
                                const newPosition = parseInt(e.target.value) - 1
                                if (isNaN(newPosition) || newPosition < 0 || newPosition >= currentOrder.length) return
                                
                                // Intercambiar posiciones
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
                              const currentOptions = Array.isArray(questionForm.options) ? questionForm.options : []
                              const newOptions = [...currentOptions]
                              newOptions[index] = e.target.value
                              // Recalcular correctOrder si cambian las opciones
                              const filteredOptions = newOptions.filter(o => o?.trim())
                              const newOrder = filteredOptions.map((_, i) => i)
                              setQuestionForm({ 
                                ...questionForm, 
                                options: newOptions,
                                correctOrder: newOrder
                              })
                            }}
                            className="flex-1"
                          />
                        </div>
                      )
                    })}
                  </div>
                ) : (
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
                                setQuestionForm({ ...questionForm, correctAnswers: questionForm.correctAnswers.filter(i => i !== index) })
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
                        const newOrder = questionForm.type === 'ordering' 
                          ? newOptions.map((_, i) => i)
                          : questionForm.correctOrder
                        setQuestionForm({ ...questionForm, options: newOptions, correctOrder: newOrder })
                      }}
                    >
                      <Plus className="mr-2" size={14} />
                      Agregar Opción
                    </Button>
                  </div>
                )}
              </div>
            )}

                {/* Short Answer */}
                {questionForm.type === 'short-answer' && (
                  <div className="space-y-2">
                    <Label htmlFor="short-answer">Respuesta Correcta *</Label>
                    <Input
                      id="short-answer"
                      placeholder="Escribe la respuesta correcta..."
                      value={questionForm.shortAnswer}
                      onChange={(e) => setQuestionForm({ ...questionForm, shortAnswer: e.target.value })}
                    />
                  </div>
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
            <Button variant="outline" onClick={() => setIsQuestionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveQuestion} 
              disabled={
                questionForm.type === 'scenario-solver' 
                  ? !scenarioForm.title.trim() || scenarioForm.steps.length === 0
                  : !questionForm.question.trim()
              }
            >
              {editingQuestion ? 'Actualizar' : 'Crear'} Pregunta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
