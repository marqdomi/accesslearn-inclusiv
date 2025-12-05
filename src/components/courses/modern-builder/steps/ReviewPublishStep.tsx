import { CourseStructure } from '@/lib/types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/courses'
import { 
  FloppyDisk, 
  PaperPlaneTilt, 
  RocketLaunch, 
  Eye, 
  CheckCircle, 
  WarningCircle,
  Info,
  XCircle,
  Tree,
  Book,
  Article,
  Question,
  Gear,
  Certificate,
  GraduationCap
} from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface ReviewPublishStepProps {
  course: CourseStructure
  updateCourse: (updates: Partial<CourseStructure>) => void
  onSaveDraft: () => void
  onSubmitForReview: () => void
  onPublish: () => void
}

interface ValidationItem {
  id: string
  label: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  required: boolean
}

export function ReviewPublishStep({ course, updateCourse, onSaveDraft, onSubmitForReview, onPublish }: ReviewPublishStepProps) {
  const { user } = useAuth()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  
  // Calculate totals
  const totalModules = course.modules.length
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const totalBlocks = course.modules.reduce((acc, m) => 
    acc + m.lessons.reduce((acc2, l) => acc2 + l.blocks.length, 0), 0
  )
  const totalQuizzes = course.modules.reduce((acc, m) => 
    acc + m.lessons.filter(l => l.quiz).length, 0
  )
  const totalXP = course.modules.reduce((acc, m) => 
    acc + m.lessons.reduce((acc2, l) => 
      acc2 + l.totalXP + (l.quiz?.totalXP || 0), 0
    ), 0
  )

  // Validation checks
  const validationItems: ValidationItem[] = [
    {
      id: 'title',
      label: 'Título del curso',
      status: course.title && course.title.length >= 10 ? 'pass' : 'fail',
      message: course.title && course.title.length >= 10 
        ? 'Título válido' 
        : 'El título debe tener al menos 10 caracteres',
      required: true,
    },
    {
      id: 'description',
      label: 'Descripción del curso',
      status: course.description && course.description.length >= 50 ? 'pass' : 'fail',
      message: course.description && course.description.length >= 50
        ? 'Descripción completa'
        : 'La descripción debe tener al menos 50 caracteres',
      required: true,
    },
    {
      id: 'category',
      label: 'Categoría',
      status: course.category ? 'pass' : 'fail',
      message: course.category ? 'Categoría seleccionada' : 'Debes seleccionar una categoría',
      required: true,
    },
    {
      id: 'modules',
      label: 'Módulos',
      status: totalModules >= 1 ? 'pass' : 'fail',
      message: totalModules >= 1
        ? `${totalModules} módulo(s) creado(s)`
        : 'El curso debe tener al menos 1 módulo',
      required: true,
    },
    {
      id: 'lessons',
      label: 'Lecciones',
      status: totalLessons >= 1 ? 'pass' : 'fail',
      message: totalLessons >= 1
        ? `${totalLessons} lección(es) creada(s)`
        : 'El curso debe tener al menos 1 lección',
      required: true,
    },
    {
      id: 'content',
      label: 'Bloques de contenido',
      status: totalBlocks >= 3 ? 'pass' : totalBlocks >= 1 ? 'warning' : 'fail',
      message: totalBlocks >= 3
        ? `${totalBlocks} bloques de contenido`
        : totalBlocks >= 1
        ? `Solo ${totalBlocks} bloque(s). Se recomiendan al menos 3 bloques`
        : 'Agrega contenido a tus lecciones',
      required: true,
    },
    {
      id: 'quizzes',
      label: 'Quizzes de evaluación',
      status: totalQuizzes >= 1 ? 'pass' : 'warning',
      message: totalQuizzes >= 1
        ? `${totalQuizzes} quiz(zes) creado(s)`
        : 'Se recomienda agregar al menos 1 quiz para evaluar el aprendizaje',
      required: false,
    },
    {
      id: 'estimated-hours',
      label: 'Horas estimadas',
      status: course.estimatedHours && course.estimatedHours > 0 ? 'pass' : 'warning',
      message: course.estimatedHours && course.estimatedHours > 0
        ? `${course.estimatedHours} horas estimadas`
        : 'Se recomienda indicar las horas estimadas',
      required: false,
    },
  ]

  const passedChecks = validationItems.filter(item => item.status === 'pass').length
  const failedChecks = validationItems.filter(item => item.status === 'fail' && item.required).length
  const canPublish = failedChecks === 0
  
  // Check if user can publish directly
  const canPublishDirectly = ['content-manager', 'admin', 'super-admin'].includes(user?.role || '')
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Revisar y Publicar</h2>
        <p className="text-muted-foreground">
          Revisa el resumen de tu curso y publícalo cuando esté listo
        </p>
      </div>
      
      {/* Validation Status */}
      <Card className={canPublish ? 'border-green-500' : 'border-yellow-500'}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {canPublish ? (
              <CheckCircle size={32} className="text-green-600" weight="fill" />
            ) : (
              <WarningCircle size={32} className="text-yellow-600" weight="fill" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-lg">
                {canPublish 
                  ? '¡Curso listo para publicar!' 
                  : 'Completa los requisitos obligatorios'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {passedChecks} de {validationItems.length} verificaciones completadas
                {failedChecks > 0 && ` • ${failedChecks} requisitos faltantes`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Curso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Título</p>
              <p className="font-semibold">{course.title || 'Sin título'}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Categoría</p>
              <p className="font-semibold">{course.category || 'Sin categoría'}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Dificultad</p>
              <p className="font-semibold capitalize">{course.difficulty}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Estado Actual</p>
              <Badge variant="outline">Borrador</Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Modo de Inscripción</p>
              <p className="font-semibold capitalize">{course.enrollmentMode || 'abierto'}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">XP Total</p>
              <p className="font-semibold">{totalXP} XP</p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-3">Estadísticas de Contenido</p>
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{totalModules}</p>
                <p className="text-xs text-muted-foreground">Módulos</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLessons}</p>
                <p className="text-xs text-muted-foreground">Lecciones</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBlocks}</p>
                <p className="text-xs text-muted-foreground">Bloques</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalQuizzes}</p>
                <p className="text-xs text-muted-foreground">Quizzes</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{course.estimatedHours || 0}h</p>
                <p className="text-xs text-muted-foreground">Duración</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Validation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle size={20} />
            Checklist de Validación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {validationItems.map((item) => (
              <div 
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border"
              >
                {item.status === 'pass' ? (
                  <CheckCircle size={20} className="text-green-600 mt-0.5" weight="fill" />
                ) : item.status === 'warning' ? (
                  <WarningCircle size={20} className="text-yellow-600 mt-0.5" weight="fill" />
                ) : (
                  <XCircle size={20} className="text-red-600 mt-0.5" weight="fill" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.label}</p>
                    {item.required && (
                      <Badge variant="outline" className="text-xs">Requerido</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!canPublish && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Completa todos los requisitos obligatorios antes de publicar. 
            Puedes guardar como borrador y continuar editando después.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full"
          onClick={onSaveDraft}
        >
          <FloppyDisk className="mr-2" size={20} />
          Guardar Borrador
        </Button>
        
        <Button 
          variant="outline"
          size="lg" 
          className="w-full"
          onClick={() => setIsPreviewOpen(true)}
        >
          <Eye className="mr-2" size={20} />
          Vista Previa del Curso
        </Button>

        {canPublishDirectly ? (
          <motion.div
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button 
              size="lg" 
              className="w-full relative overflow-hidden"
              onClick={() => {
                if (isPublishing) return
                setIsPublishing(true)
                try {
                  onPublish()
                } finally {
                  // Reset after a short delay to show the animation
                  setTimeout(() => setIsPublishing(false), 500)
                }
              }}
              disabled={!canPublish || isPublishing}
            >
              <motion.div
                className="flex items-center justify-center"
                animate={isPublishing ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                transition={{ duration: 0.5, repeat: isPublishing ? Infinity : 0 }}
              >
                <RocketLaunch className="mr-2" size={20} />
                {isPublishing ? 'Publicando...' : 'Publicar Curso Inmediatamente'}
              </motion.div>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button 
              size="lg" 
              className="w-full"
              onClick={onSubmitForReview}
              disabled={!canPublish}
            >
              <PaperPlaneTilt className="mr-2" size={20} />
              Enviar para Revisión
            </Button>
          </motion.div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="!max-w-[95vw] sm:!max-w-[90vw] lg:!max-w-7xl !max-h-[95vh] w-full p-0 sm:p-6 overflow-hidden">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
            <DialogTitle className="text-lg sm:text-xl">Vista Previa: {course.title}</DialogTitle>
            <DialogDescription className="text-sm">
              Así verán los estudiantes tu curso
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[calc(95vh-120px)] sm:h-[calc(95vh-140px)] px-4 sm:px-6">
            <div className="space-y-4 sm:space-y-6 pb-4">
              {/* Course Header */}
              <div className="bg-muted/30 rounded-lg p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 break-words">{course.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed break-words">{course.description}</p>
                <div className="flex gap-2 mt-3 sm:mt-4 flex-wrap">
                  <Badge variant="outline" className="text-xs sm:text-sm">{course.category}</Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm">Dificultad: {course.difficulty}</Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm">{course.estimatedHours || 0} horas</Badge>
                  <Badge variant="secondary" className="text-xs sm:text-sm">{totalXP} XP Total</Badge>
                </div>
              </div>

              {/* Modules and Lessons */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="font-semibold text-base sm:text-lg lg:text-xl">Contenido del Curso</h4>
                {course.modules.map((module, moduleIndex) => (
                  <Card key={module.id} className="overflow-hidden">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg flex-wrap">
                        <Tree size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                        <span className="break-words">Módulo {moduleIndex + 1}: {module.title}</span>
                        {module.badge && <Badge variant="outline" className="text-xs">{module.badge}</Badge>}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 break-words">{module.description}</p>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="space-y-2 sm:space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <Book size={14} className="sm:w-4 sm:h-4 text-muted-foreground mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs sm:text-sm lg:text-base break-words">
                                {lessonIndex + 1}. {lesson.title}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{lesson.description}</p>
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {lesson.blocks.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    <Article size={10} className="sm:w-3 sm:h-3 mr-1" />
                                    {lesson.blocks.length} bloques
                                  </Badge>
                                )}
                                {lesson.quiz && (
                                  <Badge variant="outline" className="text-xs">
                                    <Question size={10} className="sm:w-3 sm:h-3 mr-1" />
                                    Quiz ({lesson.quiz.questions.length} preguntas)
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {lesson.totalXP + (lesson.quiz?.totalXP || 0)} XP
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {lesson.estimatedMinutes} min
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
