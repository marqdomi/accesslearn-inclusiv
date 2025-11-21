import { CourseStructure, LessonBlock, Lesson } from '@/lib/types'
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
import {
  Plus,
  PencilSimple,
  Trash,
  Info,
  Sparkle,
  TextT,
  Image as ImageIcon,
  MusicNote,
  VideoCamera,
  Lightning,
  Code,
  DotsSixVertical,
} from '@phosphor-icons/react'

interface ContentEditorStepProps {
  course: CourseStructure
  updateCourse: (updates: Partial<CourseStructure>) => void
}

const BLOCK_TYPES = [
  { value: 'welcome', label: 'Bienvenida', icon: Sparkle, description: 'Mensaje introductorio' },
  { value: 'text', label: 'Texto', icon: TextT, description: 'Contenido de texto rico' },
  { value: 'image', label: 'Imagen', icon: ImageIcon, description: 'Imagen con descripción' },
  { value: 'audio', label: 'Audio', icon: MusicNote, description: 'Contenido de audio' },
  { value: 'video', label: 'Video', icon: VideoCamera, description: 'Video educativo' },
  { value: 'challenge', label: 'Desafío', icon: Lightning, description: 'Ejercicio interactivo' },
  { value: 'code', label: 'Código', icon: Code, description: 'Bloque de código' },
] as const

export function ContentEditorStep({ course, updateCourse }: ContentEditorStepProps) {
  const [selectedLessonPath, setSelectedLessonPath] = useState<string>('')
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<{ moduleIndex: number; lessonIndex: number; blockIndex: number; data: LessonBlock } | null>(null)
  
  // Form state
  const [blockForm, setBlockForm] = useState({
    type: 'text' as LessonBlock['type'],
    content: '',
    xpValue: 10,
    characterMessage: '',
    videoUrl: '',
    videoType: 'upload' as 'upload' | 'youtube' | 'vimeo' | 'wistia',
    imageFile: '',
  })

  // Parse selected lesson path (format: "moduleIndex-lessonIndex")
  const getSelectedLesson = (): { moduleIndex: number; lessonIndex: number; lesson: Lesson } | null => {
    if (!selectedLessonPath) return null
    const [moduleIndex, lessonIndex] = selectedLessonPath.split('-').map(Number)
    const lesson = course.modules[moduleIndex]?.lessons[lessonIndex]
    if (!lesson) return null
    return { moduleIndex, lessonIndex, lesson }
  }

  const selectedLesson = getSelectedLesson()

  // Add new block
  const handleAddBlock = () => {
    setEditingBlock(null)
    setBlockForm({
      type: 'text',
      content: '',
      xpValue: 10,
      characterMessage: '',
      videoUrl: '',
      videoType: 'upload',
      imageFile: '',
    })
    setIsBlockDialogOpen(true)
  }

  // Edit existing block
  const handleEditBlock = (moduleIndex: number, lessonIndex: number, blockIndex: number) => {
    const block = course.modules[moduleIndex].lessons[lessonIndex].blocks[blockIndex]
    setEditingBlock({ moduleIndex, lessonIndex, blockIndex, data: block })
    setBlockForm({
      type: block.type,
      content: block.content,
      xpValue: block.xpValue || 10,
      characterMessage: block.characterMessage || '',
      videoUrl: block.videoUrl || '',
      videoType: block.videoType || 'upload',
      imageFile: block.imageFile || '',
    })
    setIsBlockDialogOpen(true)
  }

  // Save block (create or update)
  const handleSaveBlock = () => {
    if (!selectedLesson || !blockForm.content.trim()) return

    const newBlock: LessonBlock = {
      id: editingBlock ? editingBlock.data.id : `block-${Date.now()}`,
      type: blockForm.type,
      content: blockForm.content,
      order: editingBlock ? editingBlock.data.order : selectedLesson.lesson.blocks.length,
      xpValue: blockForm.xpValue || 10,
      characterMessage: blockForm.characterMessage || undefined,
      videoUrl: blockForm.type === 'video' ? blockForm.videoUrl : undefined,
      videoType: blockForm.type === 'video' ? blockForm.videoType : undefined,
      imageFile: blockForm.type === 'image' ? blockForm.imageFile : undefined,
    }

    const updatedModules = [...course.modules]
    
    if (editingBlock !== null) {
      // Update existing block
      updatedModules[selectedLesson.moduleIndex].lessons[selectedLesson.lessonIndex].blocks[editingBlock.blockIndex] = newBlock
    } else {
      // Add new block
      updatedModules[selectedLesson.moduleIndex].lessons[selectedLesson.lessonIndex].blocks.push(newBlock)
    }

    // Recalculate total XP for the lesson
    const lesson = updatedModules[selectedLesson.moduleIndex].lessons[selectedLesson.lessonIndex]
    lesson.totalXP = lesson.blocks.reduce((acc, b) => acc + (b.xpValue || 0), 0)

    updateCourse({ modules: updatedModules })
    setIsBlockDialogOpen(false)
    setBlockForm({
      type: 'text',
      content: '',
      xpValue: 10,
      characterMessage: '',
      videoUrl: '',
      videoType: 'upload',
      imageFile: '',
    })
  }

  // Delete block
  const handleDeleteBlock = (moduleIndex: number, lessonIndex: number, blockIndex: number) => {
    if (confirm('¿Eliminar este bloque?')) {
      const updatedModules = [...course.modules]
      updatedModules[moduleIndex].lessons[lessonIndex].blocks = 
        updatedModules[moduleIndex].lessons[lessonIndex].blocks.filter((_, i) => i !== blockIndex)
      
      // Recalculate total XP
      const lesson = updatedModules[moduleIndex].lessons[lessonIndex]
      lesson.totalXP = lesson.blocks.reduce((acc, b) => acc + (b.xpValue || 0), 0)
      
      updateCourse({ modules: updatedModules })
    }
  }

  // Get block icon
  const getBlockIcon = (type: LessonBlock['type']) => {
    const blockType = BLOCK_TYPES.find(bt => bt.value === type)
    return blockType ? blockType.icon : TextT
  }

  // Get block label
  const getBlockLabel = (type: LessonBlock['type']) => {
    const blockType = BLOCK_TYPES.find(bt => bt.value === type)
    return blockType ? blockType.label : 'Texto'
  }

  // Calculate total blocks
  const totalBlocks = course.modules.reduce((acc, m) => 
    acc + m.lessons.reduce((acc2, l) => acc2 + l.blocks.length, 0), 0
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Editor de Contenido</h2>
        <p className="text-muted-foreground">
          Crea bloques de aprendizaje para cada lección
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalBlocks}</p>
              <p className="text-sm text-muted-foreground">Bloques Totales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{selectedLesson?.lesson.blocks.length || 0}</p>
              <p className="text-sm text-muted-foreground">Bloques en Lección</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{selectedLesson?.lesson.totalXP || 0} XP</p>
              <p className="text-sm text-muted-foreground">XP de Lección</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Selector */}
      <div className="space-y-2">
        <Label>Seleccionar Lección</Label>
        <Select value={selectedLessonPath} onValueChange={setSelectedLessonPath}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una lección para agregar contenido" />
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
                    {lesson.title} ({lesson.blocks.length} bloques)
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
            Selecciona una lección para comenzar a agregar bloques de contenido.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Lesson Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedLesson.lesson.title}</span>
                <Badge>{selectedLesson.lesson.totalXP} XP</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedLesson.lesson.description}
              </p>
            </CardHeader>
          </Card>

          {/* Add Block Button */}
          <Button onClick={handleAddBlock} size="lg" className="w-full">
            <Plus className="mr-2" size={20} />
            Agregar Bloque
          </Button>

          {/* Blocks List */}
          {selectedLesson.lesson.blocks.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Esta lección aún no tiene bloques de contenido. Agrega tu primer bloque.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {selectedLesson.lesson.blocks.map((block, blockIndex) => {
                const BlockIcon = getBlockIcon(block.type)
                return (
                  <Card key={block.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <DotsSixVertical className="text-muted-foreground mt-1 cursor-move" size={20} />
                        <BlockIcon size={20} className="text-primary mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{getBlockLabel(block.type)}</Badge>
                            {block.xpValue && <Badge variant="secondary">{block.xpValue} XP</Badge>}
                          </div>
                          <p className="text-sm line-clamp-2">{block.content}</p>
                          {block.characterMessage && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              💬 {block.characterMessage}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditBlock(selectedLesson.moduleIndex, selectedLesson.lessonIndex, blockIndex)}
                          >
                            <PencilSimple size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteBlock(selectedLesson.moduleIndex, selectedLesson.lessonIndex, blockIndex)}
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

      {/* Block Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBlock ? 'Editar Bloque' : 'Nuevo Bloque'}
            </DialogTitle>
            <DialogDescription>
              Los bloques son unidades de contenido que los estudiantes consumen
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Block Type Selector */}
            <div className="space-y-2">
              <Label>Tipo de Bloque *</Label>
              <Select 
                value={blockForm.type} 
                onValueChange={(value) => setBlockForm({ ...blockForm, type: value as LessonBlock['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map((blockType) => {
                    const Icon = blockType.icon
                    return (
                      <SelectItem key={blockType.value} value={blockType.value}>
                        <div className="flex items-center gap-2">
                          <Icon size={16} />
                          <span>{blockType.label}</span>
                          <span className="text-xs text-muted-foreground">- {blockType.description}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="block-content">Contenido *</Label>
              <Textarea
                id="block-content"
                placeholder={
                  blockForm.type === 'welcome' ? 'Mensaje de bienvenida...' :
                  blockForm.type === 'text' ? 'Escribe el contenido de texto...' :
                  blockForm.type === 'challenge' ? 'Describe el desafío...' :
                  blockForm.type === 'code' ? 'Pega el código aquí...' :
                  'Escribe el contenido...'
                }
                value={blockForm.content}
                onChange={(e) => setBlockForm({ ...blockForm, content: e.target.value })}
                rows={6}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">
                {blockForm.content.length}/2000 caracteres
              </p>
            </div>

            {/* Video URL (only for video blocks) */}
            {blockForm.type === 'video' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="video-type">Tipo de Video</Label>
                  <Select 
                    value={blockForm.videoType} 
                    onValueChange={(value) => setBlockForm({ ...blockForm, videoType: value as typeof blockForm.videoType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upload">Subir Archivo</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="wistia">Wistia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-url">URL del Video</Label>
                  <Input
                    id="video-url"
                    placeholder="https://..."
                    value={blockForm.videoUrl}
                    onChange={(e) => setBlockForm({ ...blockForm, videoUrl: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Image File (only for image blocks) */}
            {blockForm.type === 'image' && (
              <div className="space-y-2">
                <Label htmlFor="image-file">Nombre/URL de Imagen</Label>
                <Input
                  id="image-file"
                  placeholder="imagen.jpg o https://..."
                  value={blockForm.imageFile}
                  onChange={(e) => setBlockForm({ ...blockForm, imageFile: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Por ahora ingresa el nombre o URL. Pronto agregaremos subida de archivos.
                </p>
              </div>
            )}

            {/* XP Value */}
            <div className="space-y-2">
              <Label htmlFor="block-xp">Puntos XP *</Label>
              <Input
                id="block-xp"
                type="number"
                min={0}
                max={1000}
                value={blockForm.xpValue}
                onChange={(e) => setBlockForm({ ...blockForm, xpValue: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                ¿Cuántos puntos XP gana el estudiante al completar este bloque?
              </p>
            </div>

            {/* Character Message */}
            <div className="space-y-2">
              <Label htmlFor="character-message">Mensaje del Personaje (opcional)</Label>
              <Input
                id="character-message"
                placeholder="ej. ¡Excelente trabajo! Sigamos adelante..."
                value={blockForm.characterMessage}
                onChange={(e) => setBlockForm({ ...blockForm, characterMessage: e.target.value })}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Mensaje motivacional del personaje guía
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveBlock} disabled={!blockForm.content.trim()}>
              {editingBlock ? 'Actualizar' : 'Crear'} Bloque
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
