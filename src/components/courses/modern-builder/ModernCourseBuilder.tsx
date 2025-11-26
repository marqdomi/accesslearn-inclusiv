import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { CourseStructure } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, ArrowRight, FloppyDisk } from '@phosphor-icons/react'
import { StepperNavigation } from './shared/StepperNavigation'
import { AutoSaveIndicator } from './shared/AutoSaveIndicator'
import { useAutoSave } from './hooks/useAutoSave'
import { toast } from 'sonner'
import { ApiService } from '@/services/api.service'
import { adaptBackendCourseToFrontend, adaptFrontendCourseToBackend } from '@/lib/course-adapter'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

// Import steps (we'll create these next)
import { CourseDetailsStep } from './steps/CourseDetailsStep'
import { CourseStructureStep } from './steps/CourseStructureStep'
import { ContentEditorStep } from './steps/ContentEditorStep'
import { QuizBuilderStep } from './steps/QuizBuilderStep'
import { ReviewPublishStep } from './steps/ReviewPublishStep'

interface ModernCourseBuilderProps {
  courseId?: string
  onBack: () => void
}

const STEPS = [
  { id: 1, title: 'Detalles', description: 'Información básica' },
  { id: 2, title: 'Estructura', description: 'Módulos y lecciones' },
  { id: 3, title: 'Contenido', description: 'Bloques de aprendizaje' },
  { id: 4, title: 'Quizzes', description: 'Evaluaciones' },
  { id: 5, title: 'Revisar', description: 'Publicar curso' },
]

export function ModernCourseBuilder({ courseId, onBack }: ModernCourseBuilderProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  const [loading, setLoading] = useState(false)
  
  // Initialize course state
  const [course, setCourse] = useState<CourseStructure>({
    id: courseId || `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    createdBy: user?.id || 'unknown',
    status: 'draft' as const,
  })
  
  // Load existing course if editing
  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId || !currentTenant) return
      
      try {
        setLoading(true)
        const backendCourse = await ApiService.getCourseById(courseId)
        const frontendCourse = adaptBackendCourseToFrontend(backendCourse)
        setCourse(frontendCourse)
        // Note: When a course is loaded from backend, it's considered synced
        // The next save will update lastSavedBackend
      } catch (error) {
        console.error('Error loading course:', error)
        toast.error('Error al cargar el curso')
      } finally {
        setLoading(false)
      }
    }
    
    loadCourse()
  }, [courseId, currentTenant])
  
  const [currentStep, setCurrentStep] = useState(1)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Auto-save hook - saves to Cosmos DB via API
  const autoSaveKey = `course-draft-${course.id}`
  const {
    lastSaved,
    lastSavedBackend,
    isSaving,
    isDirty,
    saveToBackend,
    restoreFromLocalStorage,
    clearLocalStorage,
    forceSave,
  } = useAutoSave({
    key: autoSaveKey,
    data: course,
    onSave: async (courseData) => {
      if (!currentTenant || !user) {
        throw new Error('Tenant or user not available')
      }
      
      // Ensure course has draft status if not published
      const courseToSave = {
        ...courseData,
        status: courseData.published ? 'published' : ('draft' as const),
        updatedAt: Date.now(),
      }
      
      try {
        // Convert to backend format
        const backendData = adaptFrontendCourseToBackend(courseToSave, currentTenant.id)
        
        // Always set status to draft when saving via this hook (manual save)
        backendData.status = 'draft'
        
        if (courseId || course.id.startsWith('course-')) {
          // Update existing course
          await ApiService.updateCourse(course.id, backendData)
        } else {
          // Create new course
          const newCourse = await ApiService.createCourse({
            title: courseToSave.title || 'Nuevo Curso',
            description: courseToSave.description || '',
            category: courseToSave.category || '',
            estimatedTime: (courseToSave.estimatedHours || 0) * 60,
            modules: courseToSave.modules || [],
            coverImage: courseToSave.coverImage,
            status: 'draft',
          })
          
          // Update course ID with the one from backend
          setCourse(prev => ({
            ...prev,
            id: newCourse.id,
            createdAt: new Date(newCourse.createdAt).getTime(),
          }))
        }
      } catch (error) {
        console.error('Error saving course to backend:', error)
        throw error
      }
    },
    interval: 30000, // 30 seconds
    enabled: true,
  })
  
  // Restore draft from localStorage only if no courseId (new course)
  // For existing courses, we load from backend
  useEffect(() => {
    if (!courseId && !loading) {
      const draft = restoreFromLocalStorage()
      if (draft && draft.title) {
        const shouldRestore = window.confirm(
          '¿Deseas recuperar el borrador guardado localmente?'
        )
        if (shouldRestore) {
          setCourse(draft)
          toast.info('Borrador restaurado')
        }
      }
    }
  }, [courseId, loading])
  
  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])
  
  // Validation for each step
  const canProceedToStep = (step: number): boolean => {
    if (step === 1) return true // Can always go to first step
    
    switch (step) {
      case 2:
        // Need title, description, category
        return !!(course.title?.trim() && course.description?.trim() && course.category)
      case 3:
        // Need at least one module with one lesson
        // Add defensive checks for undefined/null values
        if (!course.modules || !Array.isArray(course.modules)) return false
        return course.modules.length > 0 && course.modules.some(m => 
          m && m.lessons && Array.isArray(m.lessons) && m.lessons.length > 0
        )
      case 4:
        // Content step not blocking
        return true
      case 5:
        // Quiz step not blocking
        return true
      default:
        return true
    }
  }
  
  const handleStepChange = (newStep: number) => {
    if (!canProceedToStep(newStep)) {
      toast.error('Completa los campos requeridos antes de continuar')
      return
    }
    
    // Save current progress before changing steps
    forceSave()
    setCurrentStep(newStep)
  }
  
  const handleNext = () => {
    if (currentStep < STEPS.length) {
      handleStepChange(currentStep + 1)
    }
  }
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      handleStepChange(currentStep - 1)
    }
  }
  
  const handleSaveDraft = async () => {
    if (!currentTenant || !user) {
      toast.error('No se puede guardar: falta información de tenant o usuario')
      return
    }
    
    if (!isDirty && lastSavedBackend) {
      toast.info('No hay cambios nuevos para guardar', {
        description: `El borrador ya está guardado en el servidor${lastSavedBackend ? ` (${formatDistanceToNow(lastSavedBackend, { addSuffix: true, locale: es })})` : ''}`
      })
      return
    }
    
    try {
      // Ensure course has draft status and is not published before saving
      const draftCourse = {
        ...course,
        status: 'draft' as const,
        published: false,
        updatedAt: Date.now(),
      }
      
      // Update state first
      setCourse(draftCourse)
      
      // Use the hook's saveToBackend method which handles:
      // - Saving to Cosmos DB
      // - Updating isDirty state
      // - Updating lastSaved timestamp
      // - Saving to localStorage as backup
      await saveToBackend()
      
      // Show success notification
      toast.success('Borrador guardado exitosamente', {
        description: 'El curso se ha guardado en el servidor y está disponible desde cualquier dispositivo.',
        duration: 3000,
      })
    } catch (error: any) {
      console.error('[ModernCourseBuilder] Error saving draft:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Error al guardar borrador'
      let errorDescription = 'El borrador se ha guardado localmente como respaldo.'
      
      if (error.status === 401 || error.status === 403) {
        errorMessage = 'No tienes permisos para guardar cursos'
        errorDescription = 'Por favor, inicia sesión nuevamente o contacta al administrador.'
      } else if (error.status === 404) {
        errorMessage = 'No se encontró el recurso'
        errorDescription = 'Por favor, recarga la página e intenta de nuevo.'
      } else if (error.status === 400) {
        errorMessage = 'Error de validación'
        errorDescription = error.message || 'Los datos del curso son inválidos. Por favor, revisa los campos requeridos.'
      } else if (error.status === 500 || error.status === 0) {
        errorMessage = 'Error del servidor'
        errorDescription = 'El borrador se guardó localmente. Por favor, intenta de nuevo más tarde.'
        // Save to localStorage as backup
        forceSave()
      } else if (error.message) {
        errorDescription = error.message
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000,
      })
      
      // Still save to localStorage as backup even if backend fails
      try {
        forceSave()
        console.log('[ModernCourseBuilder] Draft saved to localStorage as backup')
      } catch (localStorageError) {
        console.error('[ModernCourseBuilder] Error saving to localStorage:', localStorageError)
      }
    }
  }
  
  const handleBack = () => {
    if (isDirty) {
      const shouldLeave = window.confirm(
        '¿Estás seguro de salir? Tienes cambios sin guardar que se perderán.'
      )
      if (!shouldLeave) return
    }
    
    onBack()
  }
  
  // Update course handler (passed to steps)
  const updateCourse = (updates: Partial<CourseStructure>) => {
    setCourse(prev => ({ ...prev, ...updates }))
    setHasUnsavedChanges(true)
  }

  // Submit for review (for instructors)
  const handleSubmitForReview = async () => {
    try {
      await saveToBackend() // Save first
      await ApiService.submitCourseForReview(course.id)
      clearLocalStorage()
      toast.success('Curso enviado para revisión')
      navigate('/my-courses')
    } catch (error) {
      console.error('Error submitting course:', error)
      toast.error('Error al enviar el curso para revisión')
    }
  }

  // Publish directly (for content managers/admins)
  const handlePublishCourse = async () => {
    try {
      await saveToBackend() // Save first
      await ApiService.publishCourse(course.id)
      clearLocalStorage()
      toast.success('Curso publicado exitosamente')
      navigate('/my-courses')
    } catch (error: any) {
      console.error('Error publishing course:', error)
      toast.error(error.message || 'Error al publicar el curso')
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft size={18} />
              Volver a Mis Cursos
            </Button>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">
                {courseId ? 'Editar Curso' : 'Crear Nuevo Curso'}
              </h1>
              <p className="text-muted-foreground">
                {course.title || 'Completa los detalles del curso para comenzar'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <AutoSaveIndicator 
                lastSaved={lastSaved} 
                lastSavedBackend={lastSavedBackend}
                isSaving={isSaving} 
                isDirty={isDirty} 
              />
              
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                <FloppyDisk className="mr-2" size={18} />
                {isSaving ? 'Guardando...' : 'Guardar Borrador'}
              </Button>
            </div>
          </div>
          
          {/* Stepper */}
          <StepperNavigation 
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={handleStepChange}
            canNavigate={canProceedToStep}
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            {/* Render current step */}
            {currentStep === 1 && (
              <CourseDetailsStep 
                course={course} 
                updateCourse={updateCourse}
                courseId={courseId || course.id}
              />
            )}
            
            {currentStep === 2 && (
              <CourseStructureStep 
                course={course} 
                updateCourse={updateCourse} 
              />
            )}
            
            {currentStep === 3 && (
              <ContentEditorStep 
                course={course} 
                updateCourse={updateCourse}
                courseId={courseId || course.id}
              />
            )}
            
            {currentStep === 4 && (
              <QuizBuilderStep 
                course={course} 
                updateCourse={updateCourse} 
              />
            )}
            
            {currentStep === 5 && (
              <ReviewPublishStep 
                course={course}
                onSaveDraft={handleSaveDraft}
                onSubmitForReview={handleSubmitForReview}
                onPublish={handlePublishCourse}
              />
            )}
          </CardContent>
        </Card>
        
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2" size={18} />
            Anterior
          </Button>
          
          {currentStep < STEPS.length && (
            <Button
              onClick={handleNext}
              disabled={!canProceedToStep(currentStep + 1)}
            >
              Siguiente
              <ArrowRight className="ml-2" size={18} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
