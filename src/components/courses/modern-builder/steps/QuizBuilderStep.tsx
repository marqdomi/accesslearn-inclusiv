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
  X,
} from '@phosphor-icons/react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'

interface QuizBuilderStepProps {
  course: CourseStructure
  updateCourse: (updates: Partial<CourseStructure>) => void
}

const QUESTION_TYPES = [
  { value: 'multiple-choice', label: 'Opción Múltiple', icon: Question, description: 'Una respuesta correcta' },
  { value: 'multiple-select', label: 'Selección Múltiple', icon: ListChecks, description: 'Varias respuestas correctas' },
  { value: 'true-false', label: 'Verdadero/Falso', icon: CheckCircle, description: 'Pregunta binaria' },
  { value: 'fill-blank', label: 'Completar Espacios', icon: TextT, description: 'Arrastra palabras para completar' },
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
    showTimer: false, // Mostrar timer visualmente
    timeLimit: 0, // Límite de tiempo en minutos (0 = sin límite)
    examMode: false, // Modo examen de certificación
    // Configuración avanzada de examen
    examModeType: 'timed' as 'timed' | 'untimed', // Tipo de examen: con tiempo o sin tiempo
    examDuration: 60, // Duración del examen en minutos (solo para timed)
    examMinPassingScore: 70, // Calificación mínima aprobatoria específica para el examen
    examQuestionCount: 0, // Número de preguntas en el examen (0 = todas las preguntas del banco)
    useRandomSelection: false, // Seleccionar preguntas aleatoriamente del banco
  })

  // Question form
  const [questionForm, setQuestionForm] = useState({
    type: 'multiple-choice' as QuizQuestion['type'],
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    correctAnswers: [] as number[],
    correctOrder: [] as number[], // Para preguntas de ordenamiento: [0, 1, 2, 3...]
    fillBlankText: '', // Texto con {blank} para completar espacios
    fillBlankAnswers: [] as string[], // Respuestas correctas para cada blank
    fillBlankOptions: [] as string[], // Opciones disponibles (correctas + distractores)
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
        showTimer: currentQuiz.showTimer ?? false,
        timeLimit: currentQuiz.timeLimit ? Math.floor(currentQuiz.timeLimit / 60) : 0, // Convertir segundos a minutos
        examMode: currentQuiz.examMode ?? false,
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
        showTimer: quizForm.showTimer || quizForm.examMode,
        timeLimit: quizForm.timeLimit > 0 ? quizForm.timeLimit * 60 : undefined, // Convertir minutos a segundos
        examMode: quizForm.examMode,
        examModeType: quizForm.examMode ? quizForm.examModeType : undefined,
        examDuration: quizForm.examMode && quizForm.examModeType === 'timed' ? quizForm.examDuration : undefined,
        examMinPassingScore: quizForm.examMode ? quizForm.examMinPassingScore : undefined,
        examQuestionCount: quizForm.examMode && quizForm.useRandomSelection ? quizForm.examQuestionCount : undefined,
        useRandomSelection: quizForm.examMode ? quizForm.useRandomSelection : undefined,
        questionBank: undefined, // Se llenará cuando se agreguen preguntas
      }
    } else {
      // Update existing quiz
      lesson.quiz.title = quizForm.title
      lesson.quiz.description = quizForm.description
      lesson.quiz.passingScore = quizForm.passingScore
      lesson.quiz.maxAttempts = quizForm.maxAttempts
      lesson.quiz.showTimer = quizForm.showTimer || quizForm.examMode
      lesson.quiz.timeLimit = quizForm.timeLimit > 0 ? quizForm.timeLimit * 60 : undefined
      lesson.quiz.examMode = quizForm.examMode
      
      if (quizForm.examMode) {
        lesson.quiz.examModeType = quizForm.examModeType
        if (quizForm.examModeType === 'timed') {
          lesson.quiz.examDuration = quizForm.examDuration
        }
        lesson.quiz.examMinPassingScore = quizForm.examMinPassingScore
        if (quizForm.useRandomSelection) {
          lesson.quiz.examQuestionCount = quizForm.examQuestionCount
          lesson.quiz.useRandomSelection = true
          // Guardar todas las preguntas actuales en questionBank si aún no existe
          if (!lesson.quiz.questionBank || lesson.quiz.questionBank.length === 0) {
            lesson.quiz.questionBank = [...(lesson.quiz.questions || [])]
          }
        } else {
          lesson.quiz.useRandomSelection = false
          lesson.quiz.examQuestionCount = undefined
        }
      } else {
        // Limpiar configuración de examen si se desactiva
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
      fillBlankText: '',
      fillBlankAnswers: [],
      fillBlankOptions: [],
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
    
    // Para fill-blank, el question.question es un objeto con text, blanks, options
    const isFillBlank = question.type === 'fill-blank'
    const fillBlankData = isFillBlank && typeof question.question === 'object' 
      ? question.question as any 
      : null
    
    setQuestionForm({
      type: question.type,
      question: typeof question.question === 'string' ? question.question : (fillBlankData?.text || ''),
      options: Array.isArray(question.options) ? question.options : ['', '', '', ''],
      correctAnswer: typeof question.correctAnswer === 'number' ? question.correctAnswer : 0,
      correctAnswers: Array.isArray(question.correctAnswer) ? question.correctAnswer : [],
      correctOrder: question.type === 'ordering' && Array.isArray(question.correctAnswer) 
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
    } else if (questionForm.type === 'fill-blank') {
      // Para fill-blank, question es un objeto con text, blanks, options
      questionText = {
        text: questionForm.fillBlankText,
        blanks: questionForm.fillBlankAnswers.filter(b => b.trim()),
        options: questionForm.fillBlankOptions.filter(o => o.trim()),
        explanation: questionForm.correctFeedback || undefined
      }
      correctAnswer = questionForm.fillBlankAnswers // No se usa directamente, está en questionText.blanks
    } else {
      questionText = questionForm.question
      correctAnswer = 0
    }

    const newQuestion: QuizQuestion = {
      id: editingQuestion ? editingQuestion.data.id : `question-${Date.now()}`,
      type: questionForm.type,
      question: questionText,
      options: ['multiple-choice', 'multiple-select', 'true-false', 'ordering', 'fill-blank'].includes(questionForm.type) 
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
      // Si useRandomSelection está activo, actualizar también el questionBank
      if (quiz.useRandomSelection && quiz.questionBank) {
        const bankIndex = quiz.questionBank.findIndex(q => q.id === newQuestion.id)
        if (bankIndex !== -1) {
          quiz.questionBank[bankIndex] = newQuestion
        }
      }
    } else {
      quiz.questions.push(newQuestion)
      // Si useRandomSelection está activo, agregar también al questionBank
      if (quiz.useRandomSelection) {
        if (!quiz.questionBank) {
          quiz.questionBank = []
        }
        // Solo agregar si no existe ya (por si acaso)
        if (!quiz.questionBank.find(q => q.id === newQuestion.id)) {
          quiz.questionBank.push(newQuestion)
        }
      }
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
    
    const questionToDelete = quiz.questions[questionIndex]
    quiz.questions = quiz.questions.filter((_, i) => i !== questionIndex)
    
    // Si useRandomSelection está activo, eliminar también del questionBank
    if (quiz.useRandomSelection && quiz.questionBank && questionToDelete) {
      quiz.questionBank = quiz.questionBank.filter(q => q.id !== questionToDelete.id)
    }
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
                      showTimer: checked || quizForm.showTimer // Si activa examMode, también activa showTimer
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
                  disabled={quizForm.examMode} // Si examMode está activo, showTimer también lo está
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

                    {/* Tipo de Examen */}
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

                    {/* Duración del Examen (solo para timed) */}
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
                        <p className="text-xs text-muted-foreground">
                          Tiempo total disponible para completar el examen
                        </p>
                      </div>
                    )}

                    {/* Calificación Mínima Aprobatoria */}
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
                      <p className="text-xs text-muted-foreground">
                        Score mínimo requerido para aprobar el examen
                      </p>
                    </div>

                    {/* Selección Aleatoria de Preguntas */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="use-random-selection">Selección Aleatoria de Preguntas</Label>
                        <p className="text-xs text-muted-foreground">
                          Seleccionar preguntas aleatoriamente del banco completo (útil para exámenes de certificación)
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

                    {/* Número de Preguntas (solo si useRandomSelection está activo) */}
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
                              examQuestionCount: Math.min(count, maxQuestions)
                            })
                          }}
                          placeholder={`Máximo: ${currentQuiz?.questions.length || 0}`}
                        />
                        <p className="text-xs text-muted-foreground">
                          {quizForm.examQuestionCount > 0
                            ? `El examen seleccionará ${quizForm.examQuestionCount} pregunta${quizForm.examQuestionCount > 1 ? 's' : ''} aleatoriamente del banco de ${currentQuiz?.questions.length || 0} preguntas`
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
                                            value={option.nextScenarioId || '__NONE__'}
                                            onValueChange={(value) => 
                                              handleUpdateOption(stepIndex, optionIndex, 'nextScenarioId', value === '__NONE__' ? undefined : value)
                                            }
                                          >
                                            <SelectTrigger className="h-7 text-xs">
                                              <SelectValue placeholder="Fin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="__NONE__">Sin siguiente (Fin)</SelectItem>
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

                {/* Fill Blank - Completar Espacios */}
                {questionForm.type === 'fill-blank' && (
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
                          const blankCount = (text.match(/\{blank\}/g) || []).length
                          setQuestionForm({ 
                            ...questionForm, 
                            fillBlankText: text,
                            // Ajustar arrays si cambia el número de blanks
                            fillBlankAnswers: Array(blankCount).fill('').map((_, i) => 
                              questionForm.fillBlankAnswers[i] || ''
                            ).slice(0, blankCount)
                          })
                        }}
                        rows={4}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        {questionForm.fillBlankText.match(/\{blank\}/g)?.length || 0} espacio(s) en blanco detectado(s)
                      </p>
                    </div>

                    {/* Respuestas Correctas */}
                    {(questionForm.fillBlankText.match(/\{blank\}/g) || []).length > 0 && (
                      <div className="space-y-2">
                        <Label>Respuestas Correctas (en orden) *</Label>
                        <div className="space-y-2">
                          {(questionForm.fillBlankText.match(/\{blank\}/g) || []).map((_, index) => (
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

                    {/* Opciones Disponibles (correctas + distractores) */}
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
                              variant={questionForm.fillBlankAnswers.includes(option) ? "default" : "secondary"}
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
                              fillBlankOptions: [...questionForm.fillBlankOptions, ''] 
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
                  : questionForm.type === 'fill-blank'
                    ? !questionForm.fillBlankText.trim() || 
                      questionForm.fillBlankAnswers.some(a => !a.trim()) ||
                      questionForm.fillBlankOptions.length < questionForm.fillBlankAnswers.length
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
