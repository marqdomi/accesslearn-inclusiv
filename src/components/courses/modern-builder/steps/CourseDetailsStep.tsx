import { CourseStructure } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from '@phosphor-icons/react'

interface CourseDetailsStepProps {
  course: CourseStructure
  updateCourse: (updates: Partial<CourseStructure>) => void
}

const CATEGORIES = [
  'Programación',
  'Ciencia de Datos',
  'Diseño',
  'Negocios',
  'Marketing',
  'Desarrollo Personal',
  'Idiomas',
  'Salud y Bienestar',
  'Tecnología',
  'Arte y Creatividad',
]

const DIFFICULTIES = [
  { value: 'Novice', label: 'Novato', description: 'Sin conocimientos previos' },
  { value: 'Intermediate', label: 'Intermedio', description: 'Conocimientos básicos' },
  { value: 'Advanced', label: 'Avanzado', description: 'Experiencia considerable' },
  { value: 'Expert', label: 'Experto', description: 'Dominio del tema' },
]

export function CourseDetailsStep({ course, updateCourse }: CourseDetailsStepProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Detalles del Curso</h2>
        <p className="text-muted-foreground">
          Proporciona información básica sobre tu curso. Estos detalles ayudarán a los estudiantes
          a entender de qué trata el curso y si es adecuado para ellos.
        </p>
      </div>
      
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="course-title" className="required">
          Título del Curso
        </Label>
        <Input
          id="course-title"
          placeholder="ej. Introducción a JavaScript"
          value={course.title}
          onChange={(e) => updateCourse({ title: e.target.value })}
          maxLength={100}
          required
        />
        <p className="text-xs text-muted-foreground">
          {course.title.length}/100 caracteres
        </p>
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="course-description" className="required">
          Descripción
        </Label>
        <Textarea
          id="course-description"
          placeholder="Describe de qué trata el curso, qué aprenderán los estudiantes y por qué deberían tomarlo..."
          value={course.description}
          onChange={(e) => updateCourse({ description: e.target.value })}
          rows={6}
          maxLength={1000}
          required
        />
        <p className="text-xs text-muted-foreground">
          {course.description.length}/1000 caracteres
        </p>
      </div>
      
      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="course-category" className="required">
          Categoría
        </Label>
        <Select 
          value={course.category} 
          onValueChange={(value) => updateCourse({ category: value })}
        >
          <SelectTrigger id="course-category">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Difficulty */}
      <div className="space-y-3">
        <Label className="required">Nivel de Dificultad</Label>
        <RadioGroup 
          value={course.difficulty} 
          onValueChange={(value) => updateCourse({ difficulty: value as any })}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {DIFFICULTIES.map((diff) => (
            <div key={diff.value} className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value={diff.value} id={`diff-${diff.value}`} />
              <Label 
                htmlFor={`diff-${diff.value}`} 
                className="font-normal cursor-pointer"
              >
                <div>
                  <p className="font-semibold">{diff.label}</p>
                  <p className="text-sm text-muted-foreground">{diff.description}</p>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      {/* Enrollment Mode */}
      <div className="space-y-3">
        <Label className="required">Modo de Inscripción</Label>
        <RadioGroup 
          value={course.enrollmentMode} 
          onValueChange={(value) => updateCourse({ enrollmentMode: value as any })}
          className="space-y-3"
        >
          <div className="flex items-start space-x-3 space-y-0">
            <RadioGroupItem value="open" id="enroll-open" />
            <Label htmlFor="enroll-open" className="font-normal cursor-pointer">
              <div>
                <p className="font-semibold">Inscripción Abierta</p>
                <p className="text-sm text-muted-foreground">
                  Cualquier estudiante puede inscribirse inmediatamente
                </p>
              </div>
            </Label>
          </div>
          
          <div className="flex items-start space-x-3 space-y-0">
            <RadioGroupItem value="approval" id="enroll-approval" />
            <Label htmlFor="enroll-approval" className="font-normal cursor-pointer">
              <div>
                <p className="font-semibold">Requiere Aprobación</p>
                <p className="text-sm text-muted-foreground">
                  Los estudiantes deben solicitar acceso y ser aprobados
                </p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Estimated Hours */}
      <div className="space-y-2">
        <Label htmlFor="estimated-hours">
          Duración Estimada (horas)
        </Label>
        <Input
          id="estimated-hours"
          type="number"
          min={0}
          step={0.5}
          value={course.estimatedHours}
          onChange={(e) => updateCourse({ estimatedHours: parseFloat(e.target.value) || 0 })}
          placeholder="ej. 10"
        />
        <p className="text-xs text-muted-foreground">
          Este valor se calculará automáticamente según las lecciones, pero puedes ajustarlo manualmente
        </p>
      </div>
      
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Los campos marcados con asterisco (*) son obligatorios para continuar al siguiente paso.
          Puedes regresar en cualquier momento para editar esta información.
        </AlertDescription>
      </Alert>
    </div>
  )
}
