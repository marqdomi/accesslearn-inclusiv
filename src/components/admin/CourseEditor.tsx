import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  FloppyDisk, 
  UploadSimple, 
  Warning,
  Article,
  ListBullets,
  GearSix,
  CheckCircle
} from '@phosphor-icons/react'
import {
  CourseManagementService,
  Course,
  CourseWithStructure,
  CreateCoursePayload,
  UpdateCoursePayload,
} from '@/services/course-management-service'
import { DetailsTab } from './course-editor/DetailsTab'
import { StructureTab } from './course-editor/StructureTab'
import { PublishingTab } from './course-editor/PublishingTab'

interface CourseEditorProps {
  courseId?: string
  onBack: () => void
}

export function CourseEditor({ courseId, onBack }: CourseEditorProps) {
  const [course, setCourse] = useState<Partial<CourseWithStructure>>({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    estimatedHours: 0,
    status: 'draft',
    visibility: 'public',
    tags: [],
    objectives: [],
    prerequisites: [],
    modules: [],
  })
  
  const [activeTab, setActiveTab] = useState('details')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [categories] = useState<string[]>([
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Data Science',
    'Web Development',
    'Mobile Development',
    'DevOps',
    'Cloud Computing',
    'Cybersecurity',
  ])

  // Load existing course
  useEffect(() => {
    if (courseId) {
      loadCourse()
    }
  }, [courseId])

  const loadCourse = async () => {
    if (!courseId) return
    
    try {
      setLoading(true)
      const data = await CourseManagementService.getCourseWithStructure(courseId)
      if (data) {
        setCourse(data)
        validateCourse(data)
      }
    } catch (error) {
      console.error('Failed to load course:', error)
      alert('Failed to load course')
    } finally {
      setLoading(false)
    }
  }

  const validateCourse = (courseData: Partial<CourseWithStructure>) => {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!courseData.title?.trim()) {
      errors.push('Course title is required')
    }
    if (!courseData.description?.trim()) {
      errors.push('Course description is required')
    }
    if (!courseData.category?.trim()) {
      errors.push('Course category is required')
    }
    if (!courseData.difficulty) {
      errors.push('Difficulty level is required')
    }

    // Structure requirements
    if (!courseData.modules || courseData.modules.length === 0) {
      errors.push('Course must have at least one module')
    } else {
      const hasLessons = courseData.modules.some(m => m.lessons && m.lessons.length > 0)
      if (!hasLessons) {
        errors.push('Course must have at least one lesson')
      }
    }

    // Warnings (optional but recommended)
    if (!courseData.thumbnail) {
      warnings.push('No thumbnail image (recommended for better visibility)')
    }
    if (!courseData.tags || courseData.tags.length === 0) {
      warnings.push('No tags added (recommended for better searchability)')
    }
    if (!courseData.objectives || courseData.objectives.length === 0) {
      warnings.push('No learning objectives defined (recommended)')
    }
    if (courseData.estimatedHours === 0) {
      warnings.push('Estimated hours not set (recommended)')
    }

    setValidationErrors(errors)
    setValidationWarnings(warnings)
  }

  const handleCourseChange = (updates: Partial<Course>) => {
    const updated = { ...course, ...updates }
    setCourse(updated)
    setHasUnsavedChanges(true)
    validateCourse(updated)
  }

  const handleSaveDraft = async () => {
    try {
      setSaving(true)

      if (courseId) {
        // Update existing course
        const payload: UpdateCoursePayload = {
          title: course.title,
          description: course.description,
          category: course.category,
          difficulty: course.difficulty,
          estimatedHours: course.estimatedHours,
          thumbnail: course.thumbnail,
          banner: course.banner,
          tags: course.tags,
          objectives: course.objectives,
          prerequisites: course.prerequisites,
          targetAudience: course.targetAudience,
          instructor: course.instructor,
        }
        await CourseManagementService.updateCourse(courseId, payload)
        alert('Course saved successfully')
      } else {
        // Create new course
        const payload: CreateCoursePayload = {
          title: course.title || 'Untitled Course',
          description: course.description,
          category: course.category,
          difficulty: course.difficulty,
          estimatedHours: course.estimatedHours,
          thumbnail: course.thumbnail,
          tags: course.tags,
          objectives: course.objectives,
          prerequisites: course.prerequisites,
          targetAudience: course.targetAudience,
          instructor: course.instructor,
        }
        const newCourse = await CourseManagementService.createCourse(payload)
        setCourse(newCourse)
        alert('Course created successfully')
      }

      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Failed to save course:', error)
      alert('Failed to save course')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (validationErrors.length > 0) {
      alert('Cannot publish: Please fix all errors first')
      return
    }

    if (!courseId) {
      alert('Please save the course first before publishing')
      return
    }

    if (confirm('Publish this course? It will become visible to students.')) {
      try {
        await CourseManagementService.publishCourse(courseId)
        await loadCourse()
        alert('Course published successfully')
      } catch (error) {
        console.error('Failed to publish:', error)
        alert('Failed to publish course')
      }
    }
  }

  // Structure tab handlers (placeholders)
  const handleAddModule = () => {
    alert('Module creation will be integrated with the backend API in the next update')
  }

  const handleEditModule = (moduleId: string) => {
    alert(`Edit module ${moduleId} - Coming soon`)
  }

  const handleDeleteModule = (moduleId: string) => {
    if (confirm('Delete this module and all its lessons?')) {
      alert(`Delete module ${moduleId} - Coming soon`)
    }
  }

  const handleDuplicateModule = (moduleId: string) => {
    alert(`Duplicate module ${moduleId} - Coming soon`)
  }

  const handleMoveModule = (moduleId: string, direction: 'up' | 'down') => {
    alert(`Move module ${moduleId} ${direction} - Coming soon`)
  }

  const handleAddLesson = (moduleId: string) => {
    alert(`Add lesson to module ${moduleId} - Coming soon`)
  }

  const handleEditLesson = (moduleId: string, lessonId: string) => {
    alert(`Edit lesson ${lessonId} - Coming soon`)
  }

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    if (confirm('Delete this lesson?')) {
      alert(`Delete lesson ${lessonId} - Coming soon`)
    }
  }

  const handleMoveLesson = (moduleId: string, lessonId: string, direction: 'up' | 'down') => {
    alert(`Move lesson ${lessonId} ${direction} - Coming soon`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading course...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {courseId ? 'Edit Course' : 'Create New Course'}
            </h2>
            {course.title && (
              <p className="text-sm text-muted-foreground">{course.title}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={course.status === 'published' ? 'default' : 'outline'}>
            {course.status || 'draft'}
          </Badge>
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saving || !hasUnsavedChanges}
          >
            <FloppyDisk className="mr-2" size={16} />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={validationErrors.length > 0 || !courseId || course.status === 'published'}
          >
            <UploadSimple className="mr-2" size={16} />
            {course.status === 'published' ? 'Published' : 'Publish Course'}
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Alert>
          <Warning className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your work!
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Article size={16} />
            Details
            {!course.title && <Warning size={14} className="text-yellow-500" />}
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <ListBullets size={16} />
            Structure
            {(!course.modules || course.modules.length === 0) && (
              <Warning size={14} className="text-yellow-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="publishing" className="flex items-center gap-2">
            <GearSix size={16} />
            Publishing
            {validationErrors.length === 0 && <CheckCircle size={14} className="text-green-500" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <DetailsTab
            course={course}
            onChange={handleCourseChange}
            categories={categories}
          />
        </TabsContent>

        <TabsContent value="structure" className="mt-6">
          <StructureTab
            modules={course.modules || []}
            onAddModule={handleAddModule}
            onEditModule={handleEditModule}
            onDeleteModule={handleDeleteModule}
            onDuplicateModule={handleDuplicateModule}
            onMoveModule={handleMoveModule}
            onAddLesson={handleAddLesson}
            onEditLesson={handleEditLesson}
            onDeleteLesson={handleDeleteLesson}
            onMoveLesson={handleMoveLesson}
          />
        </TabsContent>

        <TabsContent value="publishing" className="mt-6">
          <PublishingTab
            course={course}
            onChange={handleCourseChange}
            validationErrors={validationErrors}
            validationWarnings={validationWarnings}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
