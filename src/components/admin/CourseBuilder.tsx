import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { CourseStructure, Module, Lesson, ValidationError } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FloppyDisk, Eye, Warning, CheckCircle, Plus, Tree } from '@phosphor-icons/react'
import { CourseStructureBuilder } from './CourseStructureBuilder'
import { LessonEditor } from './LessonEditor'
import { QuizBuilder } from './QuizBuilder'
import { toast } from 'sonner'

interface CourseBuilderProps {
  courseId?: string
  onBack: () => void
}

export function CourseBuilder({ courseId, onBack }: CourseBuilderProps) {
  const [courses, setCourses] = useKV<CourseStructure[]>('admin-courses', [])
  
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
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: 'admin'
  })

  const [activeTab, setActiveTab] = useState('details')
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

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

    course.modules.forEach((module, mIdx) => {
      if (!module.title.trim()) {
        errors.push({ field: `module-${mIdx}-title`, message: `Module ${mIdx + 1} needs a title`, severity: 'error' })
      }
      if (module.lessons.length === 0) {
        errors.push({ field: `module-${mIdx}-lessons`, message: `Module "${module.title}" needs at least one lesson`, severity: 'warning' })
      }

      module.lessons.forEach((lesson, lIdx) => {
        if (!lesson.title.trim()) {
          errors.push({ field: `lesson-${mIdx}-${lIdx}-title`, message: `Lesson in "${module.title}" needs a title`, severity: 'error' })
        }

        lesson.blocks.forEach((block, bIdx) => {
          if (block.type === 'image' && !block.accessibility?.altText) {
            errors.push({ 
              field: `block-${mIdx}-${lIdx}-${bIdx}`, 
              message: `Image in "${lesson.title}" missing alt text (accessibility requirement)`, 
              severity: 'error' 
            })
          }
          if (block.type === 'video' && !block.accessibility?.captions) {
            errors.push({ 
              field: `block-${mIdx}-${lIdx}-${bIdx}`, 
              message: `Video in "${lesson.title}" missing captions (accessibility requirement)`, 
              severity: 'error' 
            })
          }
          if (block.type === 'audio' && !block.accessibility?.transcript) {
            errors.push({ 
              field: `block-${mIdx}-${lIdx}-${bIdx}`, 
              message: `Audio in "${lesson.title}" missing transcript (accessibility requirement)`, 
              severity: 'error' 
            })
          }
        })
      })
    })

    return errors
  }

  const handleSaveDraft = () => {
    const updatedCourse = { ...course, updatedAt: Date.now() }
    
    if (courseId) {
      setCourses((current) => 
        (current || []).map(c => c.id === courseId ? updatedCourse : c)
      )
    } else {
      setCourses((current) => [...(current || []), updatedCourse])
    }

    toast.success('Course draft saved')
  }

  const handlePublish = () => {
    const errors = validateCourse()
    setValidationErrors(errors)

    const criticalErrors = errors.filter(e => e.severity === 'error')
    
    if (criticalErrors.length > 0) {
      toast.error(`Cannot publish: ${criticalErrors.length} error(s) must be fixed`, {
        description: 'Check the validation section below'
      })
      return
    }

    const publishedCourse = { ...course, published: true, updatedAt: Date.now() }
    
    if (courseId) {
      setCourses((current) => 
        (current || []).map(c => c.id === courseId ? publishedCourse : c)
      )
    } else {
      setCourses((current) => [...(current || []), publishedCourse])
    }

    toast.success('Course published successfully!', {
      description: 'Learners can now access this course'
    })
    onBack()
  }

  const updateCourseField = (field: keyof CourseStructure, value: any) => {
    setCourse(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {courseId ? 'Edit Course' : 'Create New Course'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {course.published ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle size={14} weight="fill" />
                  Published
                </Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <FloppyDisk className="mr-2" size={18} />
            Save Draft
          </Button>
          <Button onClick={handlePublish}>
            <CheckCircle className="mr-2" size={18} weight="fill" />
            Publish Course
          </Button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <Alert variant={validationErrors.some(e => e.severity === 'error') ? 'destructive' : 'default'}>
          <Warning size={18} />
          <AlertDescription>
            <p className="font-medium mb-2">
              {validationErrors.filter(e => e.severity === 'error').length} error(s), {' '}
              {validationErrors.filter(e => e.severity === 'warning').length} warning(s)
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {validationErrors.slice(0, 5).map((error, idx) => (
                <li key={idx}>{error.message}</li>
              ))}
              {validationErrors.length > 5 && (
                <li className="text-muted-foreground">...and {validationErrors.length - 5} more</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="structure">Course Structure</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the core details about this training course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course-title">Course Title *</Label>
                <Input
                  id="course-title"
                  placeholder="e.g., Web Development Quest: HTML Fundamentals"
                  value={course.title}
                  onChange={(e) => updateCourseField('title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-description">Description *</Label>
                <Textarea
                  id="course-description"
                  placeholder="Describe what learners will achieve in this course"
                  value={course.description}
                  onChange={(e) => updateCourseField('description', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-category">Category *</Label>
                <Input
                  id="course-category"
                  placeholder="e.g., Web Development, Sales Training, Compliance"
                  value={course.category}
                  onChange={(e) => updateCourseField('category', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated-hours">Estimated Hours</Label>
                <Input
                  id="estimated-hours"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={course.estimatedHours}
                  onChange={(e) => updateCourseField('estimatedHours', parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Help learners know how long this will take
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-6 mt-6">
          {selectedLesson ? (
            <LessonEditor
              lesson={selectedLesson}
              moduleTitle={selectedModule?.title || ''}
              onSave={(updatedLesson) => {
                if (selectedModule) {
                  const updatedModule = {
                    ...selectedModule,
                    lessons: selectedModule.lessons.map(l => 
                      l.id === updatedLesson.id ? updatedLesson : l
                    )
                  }
                  setCourse(prev => ({
                    ...prev,
                    modules: prev.modules.map(m => m.id === updatedModule.id ? updatedModule : m)
                  }))
                  setSelectedLesson(null)
                  toast.success('Lesson saved')
                }
              }}
              onCancel={() => setSelectedLesson(null)}
            />
          ) : (
            <CourseStructureBuilder
              modules={course.modules}
              onModulesChange={(modules) => updateCourseField('modules', modules)}
              onEditLesson={(module, lesson) => {
                setSelectedModule(module)
                setSelectedLesson(lesson)
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={24} />
                Student View Preview
              </CardTitle>
              <CardDescription>
                This is how learners will see your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{course.title || 'Untitled Course'}</h3>
                <p className="text-muted-foreground">{course.description || 'No description'}</p>
                <div className="flex gap-2 mt-4">
                  <Badge>{course.category || 'Uncategorized'}</Badge>
                  {course.estimatedHours > 0 && (
                    <Badge variant="outline">{course.estimatedHours}h estimated</Badge>
                  )}
                  <Badge variant="outline">{course.totalXP} XP</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Tree size={20} />
                  Course Modules ({course.modules.length})
                </h4>
                {course.modules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No modules added yet</p>
                ) : (
                  <div className="space-y-3">
                    {course.modules.map((module, idx) => (
                      <Card key={module.id}>
                        <CardHeader>
                          <CardTitle className="text-base">
                            Module {idx + 1}: {module.title}
                          </CardTitle>
                          <CardDescription>
                            {module.lessons.length} lesson(s)
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
