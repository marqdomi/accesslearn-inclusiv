import { useState, useRef, useEffect } from 'react'
import { CourseStructure } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Info, Plus, X, UploadSimple, Image as ImageIcon } from '@phosphor-icons/react'
import { useCustomCategories } from '@/hooks/use-custom-categories'
import { toast } from 'sonner'
import { ApiService } from '@/services/api.service'

interface CourseDetailsStepProps {
  course: CourseStructure
  updateCourse: (updates: Partial<CourseStructure>) => void
  courseId?: string
}

const DIFFICULTIES = [
  { value: 'Novice', label: 'Novato', description: 'Sin conocimientos previos' },
  { value: 'Intermediate', label: 'Intermedio', description: 'Conocimientos básicos' },
  { value: 'Advanced', label: 'Avanzado', description: 'Experiencia considerable' },
  { value: 'Expert', label: 'Experto', description: 'Dominio del tema' },
]

export function CourseDetailsStep({ course, updateCourse, courseId }: CourseDetailsStepProps) {
  const { categories, addCategory, loading: categoriesLoading } = useCustomCategories()
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const coverImageInputRef = useRef<HTMLInputElement>(null)

  // Load cover image preview when course changes
  useEffect(() => {
    const loadCoverImagePreview = async () => {
      if (course.coverImage) {
        // Si ya es una URL (con SAS token o externa), usarla directamente
        if (course.coverImage.startsWith('http') || course.coverImage.startsWith('data:')) {
          setCoverImagePreview(course.coverImage)
        } else if (course.coverImage.includes('/')) {
          // Es un blobName (formato: container/blobName), generar URL con SAS
          try {
            const [containerName, ...blobNameParts] = course.coverImage.split('/')
            const blobName = blobNameParts.join('/')
            const { url } = await ApiService.getMediaUrl(containerName, blobName)
            setCoverImagePreview(url)
          } catch (error) {
            console.error('Error generating cover image preview URL:', error)
            setCoverImagePreview(null)
          }
        } else {
          setCoverImagePreview(course.coverImage)
        }
      } else {
        setCoverImagePreview(null)
      }
    }

    loadCoverImagePreview()
  }, [course.coverImage])

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, sube un archivo de imagen (JPG, PNG, GIF)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB')
      return
    }

    if (!courseId && !course.id) {
      toast.error('Error: No se pudo determinar el curso. Guarda el curso primero.')
      return
    }

    setIsUploadingCover(true)
    try {
      const { url, blobName, containerName } = await ApiService.uploadFile(file, 'course-cover', {
        courseId: courseId || course.id
      })

      // Guardar blobName en formato container/blobName
      const blobNameForStorage = `${containerName}/${blobName}`
      updateCourse({ coverImage: blobNameForStorage })
      
      // Actualizar preview con URL con SAS token
      setCoverImagePreview(url)
      toast.success('Imagen de portada subida exitosamente')
    } catch (error: any) {
      console.error('Error uploading cover image:', error)
      toast.error(error.message || 'Error al subir la imagen de portada')
    } finally {
      setIsUploadingCover(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    
    setAddingCategory(true)
    try {
      const success = await addCategory(newCategory.trim())
      if (success) {
        updateCourse({ category: newCategory.trim() })
        setNewCategory('')
        setShowAddCategory(false)
      }
    } finally {
      setAddingCategory(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Detalles del Curso</h2>
        <p className="text-muted-foreground">
          Proporciona información básica sobre tu curso. Estos detalles ayudarán a los estudiantes
          a entender de qué trata el curso y si es adecuado para ellos.
        </p>
      </div>
      
      {/* Cover Image */}
      <div className="space-y-2">
        <Label htmlFor="cover-image">Imagen de Portada</Label>
        <div className="space-y-2">
          {/* Upload Button */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={coverImageInputRef}
              id="cover-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverImageUpload}
              disabled={isUploadingCover}
            />
            {coverImagePreview ? (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img 
                    src={coverImagePreview} 
                    alt="Portada del curso" 
                    className="max-w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      updateCourse({ coverImage: undefined })
                      setCoverImagePreview(null)
                    }}
                  >
                    <X size={16} />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => coverImageInputRef.current?.click()}
                  disabled={isUploadingCover}
                >
                  <UploadSimple size={20} className="mr-2" />
                  {isUploadingCover ? 'Subiendo...' : 'Cambiar Imagen'}
                </Button>
              </div>
            ) : (
              <>
                <ImageIcon size={48} className="mx-auto text-muted-foreground mb-2" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => coverImageInputRef.current?.click()}
                  disabled={isUploadingCover}
                >
                  <UploadSimple size={20} className="mr-2" />
                  {isUploadingCover ? 'Subiendo...' : 'Subir Imagen de Portada'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG, GIF • Máx 5MB • Recomendado: 1200x675px
                </p>
              </>
            )}
          </div>
        </div>
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
        <div className="flex gap-2">
          <Select 
            value={course.category} 
            onValueChange={(value) => updateCourse({ category: value })}
            className="flex-1"
            disabled={categoriesLoading}
          >
            <SelectTrigger id="course-category">
              <SelectValue placeholder={categoriesLoading ? "Cargando categorías..." : "Selecciona una categoría"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowAddCategory(!showAddCategory)}
            title="Agregar nueva categoría"
            disabled={categoriesLoading}
          >
            {showAddCategory ? <X size={20} /> : <Plus size={20} />}
          </Button>
        </div>
        {showAddCategory && (
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Nombre de la nueva categoría"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !addingCategory) {
                  handleAddCategory()
                } else if (e.key === 'Escape') {
                  setShowAddCategory(false)
                  setNewCategory('')
                }
              }}
              autoFocus
              disabled={addingCategory}
            />
            <Button
              type="button"
              onClick={handleAddCategory}
              disabled={!newCategory.trim() || addingCategory}
            >
              {addingCategory ? 'Agregando...' : 'Agregar'}
            </Button>
          </div>
        )}
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
