import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { CourseStructure, Module, Lesson, LessonBlock, Quiz, QuizQuestion, Achievement, ValidationError } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { 
  ArrowLeft, FloppyDisk, Eye, Warning, CheckCircle, Plus, Trash, 
  DotsSixVertical, Article, ListChecks, Certificate, CaretUp, CaretDown,
  Image as ImageIcon, Video, UploadSimple, TextB, ListBullets, Link as LinkIcon
} from '@phosphor-icons/react'
import { WYSIWYGEditor } from './WYSIWYGEditor'
import { AdvancedQuizBuilder } from './AdvancedQuizBuilder'
import { AccessibilityValidator } from './AccessibilityValidator'

interface ProfessionalCourseBuilderProps {
  courseId?: string
  onBack: () => void
}

export function ProfessionalCourseBuilder({ courseId, onBack }: ProfessionalCourseBuilderProps) {
  const [courses, setCourses] = useKV<CourseStructure[]>('admin-courses', [])
  const [achievements] = useKV<Achievement[]>('achievements', [])
  
  const existingCourse = courseId ? courses?.find(c => c.id === courseId) : null
  
  const [course, setCourse] = useState<CourseStructure>(existingCourse || {
    id: `course-${Date.now()}`,
    title: '',
    description: '',
    category: '',
    modules: [],
    estimatedHours: 0,
    totalXP: 0,
    published: false,
    enrollmentMode: 'open',
    difficulty: 'Novice',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: 'admin'
  })

  const [activeTab, setActiveTab] = useState('details')
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null)

  useEffect(() => {
    const totalXP = course.modules.reduce((sum, module) => {
      return sum + module.lessons.reduce((lSum, lesson) => lSum + lesson.totalXP, 0)
    }, 0)
    
    if (totalXP !== course.totalXP) {
      setCourse(prev => ({ ...prev, totalXP, updatedAt: Date.now() }))
    }
  }, [course.modules])

  const validateCourse = (): ValidationError[] => {
    const errors: ValidationError[] = []

    if (!course.title.trim()) {
      errors.push({ field: 'title', message: 'Course title is required', severity: 'error' })
    }
    if (!course.description.trim()) {
      errors.push({ field: 'description', message: 'Course description is required', severity: 'error' })
    }
    if (!course.category.trim()) {
      errors.push({ field: 'category', message: 'Course category is required', severity: 'error' })
    }
    if (course.modules.length === 0) {
      errors.push({ field: 'modules', message: 'Course must have at least one module', severity: 'error' })
    }
    if (!course.enrollmentMode) {
      errors.push({ field: 'enrollmentMode', message: 'Enrollment mode must be selected', severity: 'error' })
    }

    course.modules.forEach((module, mIdx) => {
      if (!module.title.trim()) {
        errors.push({ field: `module-${mIdx}`, message: `Module ${mIdx + 1} needs a title`, severity: 'error' })
      }

      module.lessons.forEach((lesson, lIdx) => {
        lesson.blocks.forEach((block, bIdx) => {
          if (block.type === 'image' && !block.accessibility?.altText) {
            errors.push({
              field: `block-${mIdx}-${lIdx}-${bIdx}`,
              message: `Image in "${lesson.title}" missing alt text (required for accessibility)`,
              severity: 'error'
            })
          }
          if (block.type === 'video' && !block.accessibility?.captions) {
            errors.push({
              field: `block-${mIdx}-${lIdx}-${bIdx}`,
              message: `Video in "${lesson.title}" missing captions (required for accessibility)`,
              severity: 'error'
            })
          }
          if (block.type === 'audio' && !block.accessibility?.transcript) {
            errors.push({
              field: `block-${mIdx}-${lIdx}-${bIdx}`,
              message: `Audio in "${lesson.title}" missing transcript (required for accessibility)`,
              severity: 'error'
            })
          }
        })
      })
    })

    return errors
  }

  const saveDraft = () => {
    const updatedCourse = { ...course, updatedAt: Date.now() }
    setCourse(updatedCourse)
    
    setCourses((prev) => {
      const existing = prev?.findIndex(c => c.id === course.id) ?? -1
      if (existing >= 0) {
        const updated = [...(prev || [])]
        updated[existing] = updatedCourse
        return updated
      }
      return [...(prev || []), updatedCourse]
    })

    toast.success('Draft saved successfully')
  }

  const attemptPublish = () => {
    const errors = validateCourse()
    setValidationErrors(errors)
    
    if (errors.some(e => e.severity === 'error')) {
      toast.error('Cannot publish: Please fix all errors first')
      return
    }

    setShowPublishDialog(true)
  }

  const confirmPublish = () => {
    const publishedCourse = { 
      ...course, 
      published: true, 
      publishedAt: Date.now(),
      updatedAt: Date.now() 
    }
    
    setCourse(publishedCourse)
    setCourses((prev) => {
      const existing = prev?.findIndex(c => c.id === course.id) ?? -1
      if (existing >= 0) {
        const updated = [...(prev || [])]
        updated[existing] = publishedCourse
        return updated
      }
      return [...(prev || []), publishedCourse]
    })

    setShowPublishDialog(false)
    toast.success('Course published successfully! Now visible to learners.')
  }

  const addModule = (type: 'lesson' | 'quiz' | 'completion') => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: type === 'lesson' ? 'New Lesson' : type === 'quiz' ? 'New Quiz' : 'Course Completion',
      description: '',
      type,
      lessons: type === 'lesson' ? [{
        id: `lesson-${Date.now()}`,
        title: 'Untitled Lesson',
        description: '',
        blocks: [],
        totalXP: 0,
        estimatedMinutes: 5
      }] : [],
      order: course.modules.length
    }

    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, newModule],
      updatedAt: Date.now()
    }))

    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} module added`)
  }

  const deleteModule = (moduleId: string) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== moduleId).map((m, idx) => ({ ...m, order: idx })),
      updatedAt: Date.now()
    }))
    toast.success('Module deleted')
  }

  const moveModule = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === course.modules.length - 1)) {
      return
    }

    const newModules = [...course.modules]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newModules[index], newModules[swapIndex]] = [newModules[swapIndex], newModules[index]]
    
    setCourse(prev => ({
      ...prev,
      modules: newModules.map((m, idx) => ({ ...m, order: idx })),
      updatedAt: Date.now()
    }))
  }

  const handleDragStart = (index: number) => {
    setDraggedModuleIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedModuleIndex === null || draggedModuleIndex === dropIndex) {
      setDraggedModuleIndex(null)
      return
    }

    const newModules = [...course.modules]
    const [draggedModule] = newModules.splice(draggedModuleIndex, 1)
    newModules.splice(dropIndex, 0, draggedModule)
    
    setCourse(prev => ({
      ...prev,
      modules: newModules.map((m, idx) => ({ ...m, order: idx })),
      updatedAt: Date.now()
    }))
    
    setDraggedModuleIndex(null)
    toast.success('Module reordered')
  }

  const getModuleIcon = (type: Module['type']) => {
    switch (type) {
      case 'lesson': return <Article size={20} />
      case 'quiz': return <ListChecks size={20} />
      case 'completion': return <Certificate size={20} />
      default: return <Article size={20} />
    }
  }

  const getModuleErrors = (module: Module): ValidationError[] => {
    return validationErrors.filter(e => e.field.startsWith(`module-${course.modules.indexOf(module)}`))
  }

  const errorCount = validationErrors.filter(e => e.severity === 'error').length
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft size={20} />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{course.title || 'Untitled Course'}</h1>
                  <Badge variant={course.published ? 'default' : 'secondary'}>
                    {course.published ? 'Published' : 'Draft'}
                  </Badge>
                  {errorCount > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <Warning size={16} />
                      {errorCount} Error{errorCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                  {warningCount > 0 && errorCount === 0 && (
                    <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
                      <Warning size={16} />
                      {warningCount} Warning{warningCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {course.modules.length} module{course.modules.length !== 1 ? 's' : ''} • {course.totalXP} XP • {course.estimatedHours}h estimated
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={saveDraft}>
                <FloppyDisk size={20} className="mr-2" />
                Save Draft
              </Button>
              <Button 
                onClick={attemptPublish}
                disabled={course.published && validationErrors.some(e => e.severity === 'error')}
              >
                <Eye size={20} className="mr-2" />
                {course.published ? 'Update Published' : 'Publish Course'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="structure">Course Structure</TabsTrigger>
            <TabsTrigger value="settings">Publishing Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Define the core details of your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={course.title}
                    onChange={(e) => setCourse(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Introduction to Web Development"
                  />
                  {validationErrors.some(e => e.field === 'title') && (
                    <p className="text-sm text-destructive">Course title is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={course.description}
                    onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what learners will gain from this course..."
                    rows={4}
                  />
                  {validationErrors.some(e => e.field === 'description') && (
                    <p className="text-sm text-destructive">Course description is required</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={course.category}
                      onChange={(e) => setCourse(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Web Development"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={course.difficulty}
                      onValueChange={(value: 'Novice' | 'Specialist' | 'Master') => 
                        setCourse(prev => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Novice">Novice</SelectItem>
                        <SelectItem value="Specialist">Specialist</SelectItem>
                        <SelectItem value="Master">Master</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={course.estimatedHours}
                      onChange={(e) => setCourse(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completionAchievement">Course Completion Achievement (Optional)</Label>
                  <Select
                    value={course.completionAchievementId || 'none'}
                    onValueChange={(value) => 
                      setCourse(prev => ({ ...prev, completionAchievementId: value === 'none' ? undefined : value }))
                    }
                  >
                    <SelectTrigger id="completionAchievement">
                      <SelectValue placeholder="Select an achievement to unlock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No achievement</SelectItem>
                      {achievements?.map(achievement => (
                        <SelectItem key={achievement.id} value={achievement.id}>
                          {achievement.icon} {achievement.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Learners will unlock this achievement when they complete the course
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Structure</CardTitle>
                <CardDescription>
                  Build your course by adding and arranging modules. Drag modules to reorder them.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => addModule('lesson')} variant="outline">
                    <Article size={20} className="mr-2" />
                    Add Lesson
                  </Button>
                  <Button onClick={() => addModule('quiz')} variant="outline">
                    <ListChecks size={20} className="mr-2" />
                    Add Quiz
                  </Button>
                  <Button onClick={() => addModule('completion')} variant="outline">
                    <Certificate size={20} className="mr-2" />
                    Add Completion Certificate
                  </Button>
                </div>

                {course.modules.length === 0 ? (
                  <div className="border-2 border-dashed rounded-lg p-12 text-center">
                    <Article size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No modules yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get started by adding your first lesson, quiz, or completion module
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {course.modules.map((module, index) => {
                      const moduleErrors = getModuleErrors(module)
                      const hasErrors = moduleErrors.some(e => e.severity === 'error')
                      
                      return (
                        <Card
                          key={module.id}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={(e) => handleDrop(e, index)}
                          className={`cursor-move transition-all ${
                            draggedModuleIndex === index ? 'opacity-50' : ''
                          } ${hasErrors ? 'border-destructive' : ''}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                <DotsSixVertical size={20} />
                                <div className="flex items-center gap-1">
                                  {getModuleIcon(module.type)}
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{module.title || 'Untitled Module'}</h4>
                                  <Badge variant="outline">{module.type}</Badge>
                                  {hasErrors && (
                                    <Badge variant="destructive" className="gap-1">
                                      <Warning size={14} />
                                      {moduleErrors.filter(e => e.severity === 'error').length}
                                    </Badge>
                                  )}
                                </div>
                                {module.description && (
                                  <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                                )}
                                {module.type === 'lesson' && (
                                  <p className="text-xs text-muted-foreground">
                                    {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''} • 
                                    {' '}{module.lessons.reduce((sum, l) => sum + l.totalXP, 0)} XP
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveModule(index, 'up')}
                                  disabled={index === 0}
                                >
                                  <CaretUp size={20} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveModule(index, 'down')}
                                  disabled={index === course.modules.length - 1}
                                >
                                  <CaretDown size={20} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingModule(module)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteModule(module.id)}
                                >
                                  <Trash size={20} />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {validationErrors.length > 0 && (
              <AccessibilityValidator errors={validationErrors} />
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publishing Settings</CardTitle>
                <CardDescription>Control how learners can access this course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Enrollment Mode *</Label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <input
                        type="radio"
                        name="enrollmentMode"
                        value="open"
                        checked={course.enrollmentMode === 'open'}
                        onChange={() => setCourse(prev => ({ ...prev, enrollmentMode: 'open' }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">Open Enrollment</div>
                        <div className="text-sm text-muted-foreground">
                          Anyone can enroll in this course from the Mission Library
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <input
                        type="radio"
                        name="enrollmentMode"
                        value="restricted"
                        checked={course.enrollmentMode === 'restricted'}
                        onChange={() => setCourse(prev => ({ ...prev, enrollmentMode: 'restricted' }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">Restricted (Request Access)</div>
                        <div className="text-sm text-muted-foreground">
                          Users can see the course but must request access to enroll
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <input
                        type="radio"
                        name="enrollmentMode"
                        value="admin-only"
                        checked={course.enrollmentMode === 'admin-only'}
                        onChange={() => setCourse(prev => ({ ...prev, enrollmentMode: 'admin-only' }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">Admin-Assign Only (Hidden)</div>
                        <div className="text-sm text-muted-foreground">
                          Course is hidden from library; only assigned users can access
                        </div>
                      </div>
                    </label>
                  </div>
                  {validationErrors.some(e => e.field === 'enrollmentMode') && (
                    <p className="text-sm text-destructive">Enrollment mode must be selected</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificate Settings</CardTitle>
                <CardDescription>Configure certificate issuance for course completion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4 p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      <Certificate size={20} className="text-primary" />
                      Issue Certificate of Completion
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate and issue a formal PDF certificate when users complete this mission
                    </p>
                  </div>
                  <Switch
                    checked={course.certificateEnabled || false}
                    onCheckedChange={(checked) => setCourse(prev => ({ ...prev, certificateEnabled: checked }))}
                  />
                </div>
                
                {course.certificateEnabled && (
                  <Alert>
                    <Certificate size={16} />
                    <AlertDescription>
                      Learners will receive a downloadable certificate upon successful completion. 
                      The certificate will include the company logo and name configured in Admin Settings.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Publication Checklist</CardTitle>
                <CardDescription>Requirements before publishing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  {course.title ? (
                    <CheckCircle size={20} className="text-success" weight="fill" />
                  ) : (
                    <Warning size={20} className="text-destructive" weight="fill" />
                  )}
                  <span className={course.title ? 'text-foreground' : 'text-muted-foreground'}>
                    Course title provided
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {course.description ? (
                    <CheckCircle size={20} className="text-success" weight="fill" />
                  ) : (
                    <Warning size={20} className="text-destructive" weight="fill" />
                  )}
                  <span className={course.description ? 'text-foreground' : 'text-muted-foreground'}>
                    Course description provided
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {course.category ? (
                    <CheckCircle size={20} className="text-success" weight="fill" />
                  ) : (
                    <Warning size={20} className="text-destructive" weight="fill" />
                  )}
                  <span className={course.category ? 'text-foreground' : 'text-muted-foreground'}>
                    Course category provided
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {course.modules.length > 0 ? (
                    <CheckCircle size={20} className="text-success" weight="fill" />
                  ) : (
                    <Warning size={20} className="text-destructive" weight="fill" />
                  )}
                  <span className={course.modules.length > 0 ? 'text-foreground' : 'text-muted-foreground'}>
                    At least one module added
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {course.enrollmentMode ? (
                    <CheckCircle size={20} className="text-success" weight="fill" />
                  ) : (
                    <Warning size={20} className="text-destructive" weight="fill" />
                  )}
                  <span className={course.enrollmentMode ? 'text-foreground' : 'text-muted-foreground'}>
                    Enrollment mode selected
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {errorCount === 0 ? (
                    <CheckCircle size={20} className="text-success" weight="fill" />
                  ) : (
                    <Warning size={20} className="text-destructive" weight="fill" />
                  )}
                  <span className={errorCount === 0 ? 'text-foreground' : 'text-muted-foreground'}>
                    All accessibility requirements met
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Course</DialogTitle>
            <DialogDescription>
              This will make your course visible to learners based on the enrollment mode you selected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <CheckCircle size={20} className="text-success" />
              <AlertDescription>
                All requirements have been met. Your course is ready to publish!
              </AlertDescription>
            </Alert>
            <div className="space-y-2 text-sm">
              <p><strong>Enrollment Mode:</strong> {course.enrollmentMode === 'open' ? 'Open Enrollment' : course.enrollmentMode === 'restricted' ? 'Restricted (Request Access)' : 'Admin-Assign Only'}</p>
              <p><strong>Total Modules:</strong> {course.modules.length}</p>
              <p><strong>Total XP:</strong> {course.totalXP}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPublish}>
              Publish Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingModule && (
        <ModuleEditor
          module={editingModule}
          onSave={(updated) => {
            setCourse(prev => ({
              ...prev,
              modules: prev.modules.map(m => m.id === updated.id ? updated : m),
              updatedAt: Date.now()
            }))
            setEditingModule(null)
            toast.success('Module updated')
          }}
          onCancel={() => setEditingModule(null)}
          achievements={achievements || []}
        />
      )}
    </div>
  )
}

interface ModuleEditorProps {
  module: Module
  onSave: (module: Module) => void
  onCancel: () => void
  achievements: Achievement[]
}

function ModuleEditor({ module, onSave, onCancel, achievements }: ModuleEditorProps) {
  const [editedModule, setEditedModule] = useState(module)

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {module.type === 'lesson' ? 'Lesson' : module.type === 'quiz' ? 'Quiz' : 'Completion'} Module</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="moduleTitle">Module Title</Label>
            <Input
              id="moduleTitle"
              value={editedModule.title}
              onChange={(e) => setEditedModule(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moduleDescription">Description</Label>
            <Textarea
              id="moduleDescription"
              value={editedModule.description}
              onChange={(e) => setEditedModule(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {(editedModule.type === 'lesson' || editedModule.type === 'quiz') && (
            <div className="space-y-2">
              <Label htmlFor="moduleAchievement">Achievement Unlock (Optional)</Label>
              <Select
                value={editedModule.achievementId || 'none'}
                onValueChange={(value) => 
                  setEditedModule(prev => ({ ...prev, achievementId: value === 'none' ? undefined : value }))
                }
              >
                <SelectTrigger id="moduleAchievement">
                  <SelectValue placeholder="Select an achievement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No achievement</SelectItem>
                  {achievements.map(achievement => (
                    <SelectItem key={achievement.id} value={achievement.id}>
                      {achievement.icon} {achievement.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Learners will unlock this achievement when they complete this module
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editedModule)}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
