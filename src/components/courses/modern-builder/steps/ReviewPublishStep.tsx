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
import { CoursePreviewRenderer } from '../shared/CoursePreviewRenderer'

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
      
      {/* Course Completion & Certification Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap size={20} />
            Configuración de Completación y Certificación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Completion Mode */}
          <div className="space-y-2">
            <Label htmlFor="completion-mode">Modo de Completación</Label>
            <Select
              value={course.completionMode || 'modules-and-quizzes'}
              onValueChange={(value: 'modules-only' | 'modules-and-quizzes' | 'exam-mode' | 'study-guide') => {
                updateCourse({ completionMode: value })
              }}
            >
              <SelectTrigger id="completion-mode">
                <SelectValue placeholder="Selecciona el modo de completación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modules-only">Solo Módulos</SelectItem>
                <SelectItem value="modules-and-quizzes">Módulos + Quizzes</SelectItem>
                <SelectItem value="exam-mode">Modo Examen</SelectItem>
                <SelectItem value="study-guide">Guía de Estudio</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {course.completionMode === 'modules-only' && 'Los estudiantes solo necesitan completar los módulos para finalizar el curso.'}
              {course.completionMode === 'modules-and-quizzes' && 'Los estudiantes deben completar módulos y quizzes para finalizar el curso.'}
              {course.completionMode === 'exam-mode' && 'El curso se evalúa como un examen con calificación final.'}
              {course.completionMode === 'study-guide' && 'El curso es una guía de estudio sin requisitos estrictos de completación.'}
            </p>
          </div>

          {/* Quiz Requirement (only if there are quizzes) */}
          {totalQuizzes > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="quiz-requirement">Requisitos de Quizzes</Label>
                <Select
                  value={course.quizRequirement || 'required'}
                  onValueChange={(value: 'required' | 'optional' | 'none') => {
                    updateCourse({ quizRequirement: value })
                  }}
                >
                  <SelectTrigger id="quiz-requirement">
                    <SelectValue placeholder="Selecciona los requisitos de quizzes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">Requeridos</SelectItem>
                    <SelectItem value="optional">Opcionales</SelectItem>
                    <SelectItem value="none">Ninguno</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Define si los quizzes son obligatorios, opcionales o no se requieren para completar el curso.
                </p>
              </div>

              {/* Require All Quizzes Passed */}
              {course.quizRequirement === 'required' && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-all-quizzes">Requerir pasar todos los quizzes</Label>
                    <p className="text-xs text-muted-foreground">
                      Los estudiantes deben aprobar todos los quizzes para completar el curso.
                    </p>
                  </div>
                  <Switch
                    id="require-all-quizzes"
                    checked={course.requireAllQuizzesPassed || false}
                    onCheckedChange={(checked) => {
                      updateCourse({ requireAllQuizzesPassed: checked })
                    }}
                  />
                </div>
              )}

              {/* Minimum Score for Completion */}
              {course.completionMode === 'exam-mode' && (
                <div className="space-y-2">
                  <Label htmlFor="min-score-completion">Calificación Mínima para Completar (%)</Label>
                  <Input
                    id="min-score-completion"
                    type="number"
                    min={0}
                    max={100}
                    value={course.minimumScoreForCompletion || 70}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 70
                      updateCourse({ minimumScoreForCompletion: value })
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Calificación mínima requerida para considerar el curso completado.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Certificate Configuration */}
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="certificate-enabled">Certificado Disponible</Label>
                <p className="text-xs text-muted-foreground">
                  Los estudiantes pueden obtener un certificado al completar el curso.
                </p>
              </div>
              <Switch
                id="certificate-enabled"
                checked={course.certificateEnabled !== false}
                onCheckedChange={(checked) => {
                  updateCourse({ certificateEnabled: checked })
                }}
              />
            </div>

            {course.certificateEnabled !== false && (
              <>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="certificate-requires-score">Certificado requiere calificación aprobatoria</Label>
                    <p className="text-xs text-muted-foreground">
                      El certificado solo se otorga si el estudiante alcanza la calificación mínima.
                    </p>
                  </div>
                  <Switch
                    id="certificate-requires-score"
                    checked={course.certificateRequiresPassingScore || false}
                    onCheckedChange={(checked) => {
                      updateCourse({ certificateRequiresPassingScore: checked })
                    }}
                  />
                </div>

                {course.certificateRequiresPassingScore && (
                  <div className="space-y-2">
                    <Label htmlFor="min-score-certificate">Calificación Mínima para Certificado (%)</Label>
                    <Input
                      id="min-score-certificate"
                      type="number"
                      min={0}
                      max={100}
                      value={course.minimumScoreForCertificate || 70}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 70
                        updateCourse({ minimumScoreForCertificate: value })
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Calificación mínima requerida para obtener el certificado.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Retake Configuration */}
          {totalQuizzes > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-retakes">Permitir Reintentos</Label>
                    <p className="text-xs text-muted-foreground">
                      Los estudiantes pueden reintentar quizzes para mejorar su calificación.
                    </p>
                  </div>
                  <Switch
                    id="allow-retakes"
                    checked={course.allowRetakes || false}
                    onCheckedChange={(checked) => {
                      updateCourse({ allowRetakes: checked })
                    }}
                  />
                </div>

                {course.allowRetakes && (
                  <div className="space-y-2">
                    <Label htmlFor="max-retakes">Máximo de Reintentos por Quiz</Label>
                    <Input
                      id="max-retakes"
                      type="number"
                      min={0}
                      max={10}
                      value={course.maxRetakesPerQuiz || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0
                        updateCourse({ maxRetakesPerQuiz: value })
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      {course.maxRetakesPerQuiz === 0 
                        ? 'Ilimitado: Los estudiantes pueden reintentar sin límite.'
                        : `Los estudiantes pueden reintentar hasta ${course.maxRetakesPerQuiz} vez(es) por quiz.`}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
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
            <div className="pb-4">
              <CoursePreviewRenderer course={course} />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
