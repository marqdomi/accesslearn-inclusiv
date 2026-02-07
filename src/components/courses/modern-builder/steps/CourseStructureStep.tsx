import { CourseStructure, Module, Lesson } from '@/lib/types'
import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Tree, 
  Book, 
  PencilSimple, 
  Trash, 
  DotsSixVertical,
  Info
} from '@phosphor-icons/react'
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// ---------- Sortable sub-components ----------

interface SortableLessonRowProps {
  lesson: Lesson
  moduleIndex: number
  lessonIndex: number
  onEdit: (moduleIndex: number, lessonIndex: number) => void
  onDelete: (moduleIndex: number, lessonIndex: number) => void
}

function SortableLessonRow({ lesson, moduleIndex, lessonIndex, onEdit, onDelete }: SortableLessonRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <DotsSixVertical
        className="text-muted-foreground cursor-grab active:cursor-grabbing"
        size={16}
        {...attributes}
        {...listeners}
      />
      <Book size={16} className="text-muted-foreground" />
      <div className="flex-1">
        <p className="font-medium">{lesson.title}</p>
        <p className="text-xs text-muted-foreground">{lesson.estimatedMinutes || 0} min</p>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => onEdit(moduleIndex, lessonIndex)}>
          <PencilSimple size={14} />
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(moduleIndex, lessonIndex)}>
          <Trash size={14} />
        </Button>
      </div>
    </div>
  )
}

interface SortableModuleCardProps {
  module: Module
  moduleIndex: number
  sensors: ReturnType<typeof useSensors>
  onEdit: (index: number) => void
  onDelete: (index: number) => void
  onAddLesson: (moduleIndex: number) => void
  onEditLesson: (moduleIndex: number, lessonIndex: number) => void
  onDeleteLesson: (moduleIndex: number, lessonIndex: number) => void
  onLessonDragEnd: (event: DragEndEvent) => void
}

function SortableModuleCard({
  module,
  moduleIndex,
  sensors,
  onEdit,
  onDelete,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onLessonDragEnd,
}: SortableModuleCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <Card ref={setNodeRef} style={style}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <DotsSixVertical
              className="text-muted-foreground mt-1 cursor-grab active:cursor-grabbing"
              size={20}
              {...attributes}
              {...listeners}
            />
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                <Tree size={20} />
                {module.title}
                {module.badge && <Badge variant="outline">{module.badge}</Badge>}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
              <p className="text-xs text-muted-foreground mt-2">{module.lessons.length} lecciones</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(moduleIndex)}>
              <PencilSimple size={16} />
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(moduleIndex)}>
              <Trash size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {module.lessons.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">Este módulo aún no tiene lecciones</p>
            <Button variant="outline" size="sm" onClick={() => onAddLesson(moduleIndex)}>
              <Plus className="mr-2" size={16} />
              Agregar Primera Lección
            </Button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onLessonDragEnd}>
            <SortableContext items={module.lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {module.lessons.map((lesson, lessonIndex) => (
                  <SortableLessonRow
                    key={lesson.id}
                    lesson={lesson}
                    moduleIndex={moduleIndex}
                    lessonIndex={lessonIndex}
                    onEdit={onEditLesson}
                    onDelete={onDeleteLesson}
                  />
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => onAddLesson(moduleIndex)}>
                  <Plus className="mr-2" size={16} />
                  Agregar Lección
                </Button>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  )
}

// ---------- Main component ----------

interface CourseStructureStepProps {
  course: CourseStructure
  updateCourse: (updates: Partial<CourseStructure>) => void
}

export function CourseStructureStep({ course, updateCourse }: CourseStructureStepProps) {
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null)
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<{ index: number; data: Module } | null>(null)
  const [editingLesson, setEditingLesson] = useState<{ moduleIndex: number; lessonIndex: number; data: Lesson } | null>(null)
  
  // Form states
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', badge: '' })
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', estimatedMinutes: 15 })

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Module reorder
  const handleModuleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = course.modules.findIndex((m) => m.id === active.id)
    const newIndex = course.modules.findIndex((m) => m.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove([...course.modules], oldIndex, newIndex).map((m, i) => ({ ...m, order: i }))
    updateCourse({ modules: reordered })
  }, [course.modules, updateCourse])

  // Lesson reorder within a module
  const handleLessonDragEnd = useCallback((moduleIndex: number) => (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const lessons = course.modules[moduleIndex].lessons
    const oldIndex = lessons.findIndex((l) => l.id === active.id)
    const newIndex = lessons.findIndex((l) => l.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const updatedModules = [...course.modules]
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      lessons: arrayMove([...lessons], oldIndex, newIndex),
    }
    updateCourse({ modules: updatedModules })
  }, [course.modules, updateCourse])

  // Add new module
  const handleAddModule = () => {
    setEditingModule(null)
    setModuleForm({ title: '', description: '', badge: '' })
    setIsModuleDialogOpen(true)
  }

  // Edit existing module
  const handleEditModule = (index: number) => {
    const module = course.modules[index]
    setEditingModule({ index, data: module })
    setModuleForm({
      title: module.title,
      description: module.description,
      badge: module.badge || '',
    })
    setIsModuleDialogOpen(true)
  }

  // Save module (create or update)
  const handleSaveModule = () => {
    if (!moduleForm.title.trim()) return

    const newModule: Module = {
      id: editingModule ? editingModule.data.id : `module-${Date.now()}`,
      title: moduleForm.title,
      description: moduleForm.description,
      type: 'lesson', // Default type for modules containing lessons
      lessons: editingModule ? editingModule.data.lessons : [],
      order: editingModule ? editingModule.data.order : course.modules.length,
      badge: moduleForm.badge || undefined,
    }

    if (editingModule !== null) {
      // Update existing module
      const updatedModules = [...course.modules]
      updatedModules[editingModule.index] = newModule
      updateCourse({ modules: updatedModules })
    } else {
      // Add new module
      updateCourse({ modules: [...course.modules, newModule] })
    }

    setIsModuleDialogOpen(false)
    setModuleForm({ title: '', description: '', badge: '' })
  }

  // Delete module
  const handleDeleteModule = (index: number) => {
    if (confirm('¿Eliminar este módulo? Se eliminarán también todas sus lecciones.')) {
      const updatedModules = course.modules.filter((_, i) => i !== index)
      updateCourse({ modules: updatedModules })
    }
  }

  // Add new lesson to module
  const handleAddLesson = (moduleIndex: number) => {
    setSelectedModuleIndex(moduleIndex)
    setEditingLesson(null)
    setLessonForm({ title: '', description: '', estimatedMinutes: 15 })
    setIsLessonDialogOpen(true)
  }

  // Edit existing lesson
  const handleEditLesson = (moduleIndex: number, lessonIndex: number) => {
    const lesson = course.modules[moduleIndex].lessons[lessonIndex]
    setSelectedModuleIndex(moduleIndex)
    setEditingLesson({ moduleIndex, lessonIndex, data: lesson })
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      estimatedMinutes: lesson.estimatedMinutes || 15,
    })
    setIsLessonDialogOpen(true)
  }

  // Save lesson (create or update)
  const handleSaveLesson = () => {
    if (!lessonForm.title.trim() || selectedModuleIndex === null) return

    const newLesson: Lesson = {
      id: editingLesson ? editingLesson.data.id : `lesson-${Date.now()}`,
      title: lessonForm.title,
      description: lessonForm.description,
      blocks: editingLesson ? editingLesson.data.blocks : [],
      totalXP: editingLesson ? editingLesson.data.totalXP : 0,
      estimatedMinutes: lessonForm.estimatedMinutes,
      quiz: editingLesson ? editingLesson.data.quiz : undefined,
    }

    const updatedModules = [...course.modules]
    
    if (editingLesson !== null) {
      // Update existing lesson
      updatedModules[selectedModuleIndex].lessons[editingLesson.lessonIndex] = newLesson
    } else {
      // Add new lesson
      updatedModules[selectedModuleIndex].lessons.push(newLesson)
    }

    updateCourse({ modules: updatedModules })
    setIsLessonDialogOpen(false)
    setLessonForm({ title: '', description: '', estimatedMinutes: 15 })
  }

  // Delete lesson
  const handleDeleteLesson = (moduleIndex: number, lessonIndex: number) => {
    if (confirm('¿Eliminar esta lección?')) {
      const updatedModules = [...course.modules]
      updatedModules[moduleIndex].lessons = updatedModules[moduleIndex].lessons.filter(
        (_, i) => i !== lessonIndex
      )
      updateCourse({ modules: updatedModules })
    }
  }

  // Calculate total lessons and duration
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const totalMinutes = course.modules.reduce((acc, m) => 
    acc + m.lessons.reduce((acc2, l) => acc2 + (l.estimatedMinutes || 0), 0), 0
  )
  const totalHours = (totalMinutes / 60).toFixed(1)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Estructura del Curso</h2>
        <p className="text-muted-foreground">
          Organiza tu curso en módulos y lecciones. Arrastra para reordenar.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{course.modules.length}</p>
              <p className="text-sm text-muted-foreground">Módulos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalLessons}</p>
              <p className="text-sm text-muted-foreground">Lecciones</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalHours}h</p>
              <p className="text-sm text-muted-foreground">Duración</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Module Button */}
      <Button onClick={handleAddModule} size="lg" className="w-full">
        <Plus className="mr-2" size={20} />
        Agregar Módulo
      </Button>

      {/* Modules List */}
      {course.modules.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Comienza agregando un módulo. Los módulos agrupan lecciones relacionadas por tema.
          </AlertDescription>
        </Alert>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
          <SortableContext items={course.modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <SortableModuleCard
                  key={module.id}
                  module={module}
                  moduleIndex={moduleIndex}
                  sensors={sensors}
                  onEdit={handleEditModule}
                  onDelete={handleDeleteModule}
                  onAddLesson={handleAddLesson}
                  onEditLesson={handleEditLesson}
                  onDeleteLesson={handleDeleteLesson}
                  onLessonDragEnd={handleLessonDragEnd(moduleIndex)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Module Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}
            </DialogTitle>
            <DialogDescription>
              Los módulos agrupan lecciones relacionadas por tema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Título del Módulo *</Label>
              <Input
                id="module-title"
                placeholder="ej. Introducción a JavaScript"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-description">Descripción *</Label>
              <Textarea
                id="module-description"
                placeholder="Describe qué aprenderán los estudiantes en este módulo..."
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                rows={3}
                maxLength={300}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="module-badge">Insignia (opcional)</Label>
              <Input
                id="module-badge"
                placeholder="ej. 🚀 o Básico"
                value={moduleForm.badge}
                onChange={(e) => setModuleForm({ ...moduleForm, badge: e.target.value })}
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                Puedes usar emojis o texto corto
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveModule} disabled={!moduleForm.title.trim()}>
              {editingModule ? 'Actualizar' : 'Crear'} Módulo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Editar Lección' : 'Nueva Lección'}
            </DialogTitle>
            <DialogDescription>
              Las lecciones contienen el contenido que los estudiantes aprenderán
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Título de la Lección *</Label>
              <Input
                id="lesson-title"
                placeholder="ej. Variables y Tipos de Datos"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-description">Descripción *</Label>
              <Textarea
                id="lesson-description"
                placeholder="Describe qué cubrirás en esta lección..."
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                rows={3}
                maxLength={300}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-duration">Duración Estimada (minutos) *</Label>
              <Input
                id="lesson-duration"
                type="number"
                min={1}
                max={180}
                value={lessonForm.estimatedMinutes}
                onChange={(e) => setLessonForm({ ...lessonForm, estimatedMinutes: parseInt(e.target.value) || 15 })}
              />
              <p className="text-xs text-muted-foreground">
                ¿Cuánto tiempo tomará completar esta lección?
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLesson} disabled={!lessonForm.title.trim()}>
              {editingLesson ? 'Actualizar' : 'Crear'} Lección
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
