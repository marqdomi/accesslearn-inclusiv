import { CourseStructure, LessonBlock, Lesson } from '@/lib/types'
import { getFileTypeIcon, formatFileSize } from '@/lib/file-utils'
import { useState, useRef } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  TextB,
  TextItalic,
  ListBullets,
  ListNumbers,
  Link as LinkIcon,
  Quotes,
  Eye,
  UploadSimple,
  File as FileIcon,
} from '@phosphor-icons/react'
import ReactMarkdown from 'react-markdown'
import { ApiService } from '@/services/api.service'
import { toast } from 'sonner'
import { RichTextEditor } from '../RichTextEditor'
import { VideoPreview } from '../VideoPreview'

interface ContentEditorStepProps {
  course: CourseStructure
  updateCourse: (updates: Partial<CourseStructure>) => void
  courseId?: string
}

const BLOCK_TYPES = [
  { value: 'welcome', label: 'Bienvenida', icon: Sparkle, description: 'Mensaje introductorio' },
  { value: 'text', label: 'Texto', icon: TextT, description: 'Contenido de texto rico' },
  { value: 'image', label: 'Imagen', icon: ImageIcon, description: 'Imagen con descripción' },
  { value: 'audio', label: 'Audio', icon: MusicNote, description: 'Contenido de audio' },
  { value: 'video', label: 'Video', icon: VideoCamera, description: 'Video educativo' },
  { value: 'file', label: 'Material', icon: FileIcon, description: 'PDF, Word, Excel, etc.' },
  { value: 'challenge', label: 'Desafío', icon: Lightning, description: 'Ejercicio interactivo' },
  { value: 'code', label: 'Código', icon: Code, description: 'Bloque de código' },
] as const

export function ContentEditorStep({ course, updateCourse, courseId }: ContentEditorStepProps) {
  const [selectedLessonPath, setSelectedLessonPath] = useState<string>('')
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<{ moduleIndex: number; lessonIndex: number; blockIndex: number; data: LessonBlock } | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const imageFileInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [blockForm, setBlockForm] = useState({
    type: 'text' as LessonBlock['type'],
    content: '',
    xpValue: 10,
    characterMessage: '',
    videoUrl: '',
    videoType: 'upload' as 'upload' | 'youtube' | 'vimeo' | 'wistia' | 'tiktok',
    imageFile: '',
    // File attachment fields
    fileUrl: '',
    fileName: '',
    fileSize: 0,
    fileType: '',
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

  // Markdown toolbar helpers
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('block-content') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = blockForm.content.substring(start, end)
    const newText = blockForm.content.substring(0, start) + before + selectedText + after + blockForm.content.substring(end)
    
    setBlockForm({ ...blockForm, content: newText })
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const insertAtCursor = (text: string) => {
    const textarea = document.getElementById('block-content') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const newText = blockForm.content.substring(0, start) + text + blockForm.content.substring(start)
    
    setBlockForm({ ...blockForm, content: newText })
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

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
      fileUrl: '',
      fileName: '',
      fileSize: 0,
      fileType: '',
    })
    setImagePreviewUrl(null)
    setIsBlockDialogOpen(true)
  }

  // Edit existing block
  const handleEditBlock = async (moduleIndex: number, lessonIndex: number, blockIndex: number) => {
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
      fileUrl: block.fileUrl || '',
      fileName: block.fileName || '',
      fileSize: block.fileSize || 0,
      fileType: block.fileType || '',
    })
    
    // Load image preview if it's an image block with blobName
    if (block.type === 'image' && block.imageFile) {
      if (block.imageFile.startsWith('http') || block.imageFile.startsWith('data:')) {
        setImagePreviewUrl(block.imageFile)
      } else if (block.imageFile.startsWith('http')) {
        // It's a blobName, try to get preview URL
        try {
          const [containerName, ...blobNameParts] = block.imageFile.split('/')
          const blobName = blobNameParts.join('/')
          const { url } = await ApiService.getMediaUrl(containerName, blobName)
          setImagePreviewUrl(url)
        } catch (error) {
          console.error('Error loading image preview:', error)
          setImagePreviewUrl(null)
        }
      }
    } else {
      setImagePreviewUrl(null)
    }
    
    setIsBlockDialogOpen(true)
  }

  // Save block (create or update)
  const handleSaveBlock = () => {
    if (!selectedLesson) return

    // Validate based on block type
    if (blockForm.type === 'video') {
      if (!blockForm.videoUrl || !blockForm.videoUrl.trim()) {
        toast.error('Por favor, ingresa una URL de video válida')
        return
      }
    } else if (blockForm.type === 'image') {
      if (!blockForm.imageFile || !blockForm.imageFile.trim()) {
        toast.error('Por favor, sube una imagen o ingresa una URL de imagen válida')
        return
      }
    } else if (blockForm.type === 'file') {
      if (!blockForm.fileUrl || !blockForm.fileUrl.trim()) {
        toast.error('Por favor, sube un archivo')
        return
      }
    } else {
      // For other block types (text, welcome, code, challenge), content is required
      if (!blockForm.content || !blockForm.content.trim()) {
        toast.error('Por favor, ingresa el contenido del bloque')
        return
      }
    }

    const newBlock: LessonBlock = {
      id: editingBlock ? editingBlock.data.id : `block-${Date.now()}`,
      type: blockForm.type,
      content: blockForm.content || '', // Allow empty content for video/image/file blocks
      order: editingBlock ? editingBlock.data.order : selectedLesson.lesson.blocks.length,
      xpValue: blockForm.xpValue || 10,
      characterMessage: blockForm.characterMessage || undefined,
      videoUrl: blockForm.type === 'video' ? blockForm.videoUrl : undefined,
      videoType: blockForm.type === 'video' ? blockForm.videoType : undefined,
      imageFile: blockForm.type === 'image' ? blockForm.imageFile : undefined,
      // File attachment fields
      fileUrl: blockForm.type === 'file' ? blockForm.fileUrl : undefined,
      fileName: blockForm.type === 'file' ? blockForm.fileName : undefined,
      fileSize: blockForm.type === 'file' ? blockForm.fileSize : undefined,
      fileType: blockForm.type === 'file' ? blockForm.fileType : undefined,
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
      fileUrl: '',
      fileName: '',
      fileSize: 0,
      fileType: '',
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
                const BlockIcon = block.type === 'file' ? getFileTypeIcon(block.fileType) : getBlockIcon(block.type)
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
                          {block.type === 'file' ? (
                            <div className="text-sm">
                              <p className="font-medium">{block.fileName || 'Archivo'}</p>
                              <p className="text-muted-foreground text-xs">
                                {formatFileSize(block.fileSize)}
                                {block.content && ` • ${block.content}`}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm line-clamp-2">{block.content}</p>
                          )}
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
        <DialogContent className="!max-w-[90vw] !w-full max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingBlock ? 'Editar Bloque' : 'Nuevo Bloque'}
            </DialogTitle>
            <DialogDescription>
              Los bloques son unidades de contenido que los estudiantes consumen
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 flex-1 overflow-y-auto min-h-0">
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

            {/* Content - WYSIWYG Editor */}
            {(blockForm.type === 'text' || blockForm.type === 'welcome' || blockForm.type === 'challenge') && (
              <div className="space-y-2">
                <Label htmlFor="block-content">Contenido *</Label>
                <RichTextEditor
                  value={blockForm.content}
                  onChange={(value) => setBlockForm({ ...blockForm, content: value })}
                  placeholder={
                    blockForm.type === 'welcome' 
                      ? 'Escribe un mensaje de bienvenida...' 
                      : blockForm.type === 'challenge'
                      ? 'Describe el desafío que los estudiantes deben completar...'
                      : 'Escribe el contenido de la lección. Usa los botones de formato para aplicar estilos en tiempo real...'
                  }
                  maxLength={5000}
                  className="w-full"
                />
                <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <div className="text-xs text-green-900 dark:text-green-100">
                    <strong>Editor Visual:</strong> Formatea tu texto directamente y ve los cambios en tiempo real, como en Word. 
                    Selecciona texto y usa los botones de formato, o escribe y aplica estilos mientras escribes.
                  </div>
                </div>
              </div>
            )}

            {/* Content - Markdown Editor (for code blocks) */}
            {(blockForm.type === 'code') && (
              <div className="space-y-2">
                <Label htmlFor="block-content">Contenido *</Label>
                
                <Tabs defaultValue="edit" className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <TabsList>
                      <TabsTrigger value="edit" className="flex items-center gap-1">
                        <PencilSimple size={14} />
                        Editar
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="flex items-center gap-1">
                        <Eye size={14} />
                        Vista Previa
                      </TabsTrigger>
                    </TabsList>
                    <p className="text-xs text-muted-foreground">
                      {blockForm.content.length}/5000 caracteres
                    </p>
                  </div>

                  <TabsContent value="edit" className="mt-0">
                    <Textarea
                      id="block-content"
                      placeholder={'```javascript\n// Escribe o pega tu código aquí\nfunction ejemplo() {\n  return "Hola Mundo"\n}\n```'}
                      value={blockForm.content}
                      onChange={(e) => setBlockForm({ ...blockForm, content: e.target.value })}
                      className="min-h-[300px] max-h-[600px] resize-y font-mono text-sm"
                      maxLength={5000}
                    />
                  </TabsContent>

                  <TabsContent value="preview" className="mt-0">
                    <div className="min-h-[300px] max-h-[600px] overflow-y-auto p-4 border rounded-lg bg-background">
                      {blockForm.content ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{blockForm.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          Escribe código en la pestaña "Editar" para ver la vista previa aquí
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

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
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="wistia">Wistia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-url">URL del Video</Label>
                  <Input
                    id="video-url"
                    placeholder={
                      blockForm.videoType === 'youtube' 
                        ? 'https://www.youtube.com/watch?v=... o https://youtu.be/...'
                        : blockForm.videoType === 'tiktok'
                        ? 'https://www.tiktok.com/@usuario/video/...'
                        : 'https://...'
                    }
                    value={blockForm.videoUrl}
                    onChange={(e) => {
                      const url = e.target.value
                      setBlockForm({ ...blockForm, videoUrl: url })
                      
                      // Auto-detect video type from URL
                      if (url) {
                        if (url.includes('youtube.com') || url.includes('youtu.be')) {
                          setBlockForm(prev => ({ ...prev, videoUrl: url, videoType: 'youtube' }))
                        } else if (url.includes('tiktok.com')) {
                          setBlockForm(prev => ({ ...prev, videoUrl: url, videoType: 'tiktok' }))
                        } else if (url.includes('vimeo.com')) {
                          setBlockForm(prev => ({ ...prev, videoUrl: url, videoType: 'vimeo' }))
                        } else if (url.includes('wistia.com')) {
                          setBlockForm(prev => ({ ...prev, videoUrl: url, videoType: 'wistia' }))
                        }
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {blockForm.videoType === 'youtube' && 'Pega la URL completa de YouTube'}
                    {blockForm.videoType === 'tiktok' && 'Pega la URL completa del video de TikTok'}
                    {blockForm.videoType === 'vimeo' && 'Pega la URL completa de Vimeo'}
                    {blockForm.videoType === 'wistia' && 'Pega la URL completa de Wistia'}
                    {blockForm.videoType === 'upload' && 'Sube un archivo de video'}
                  </p>
                </div>

                {/* Video Preview */}
                {blockForm.videoUrl && blockForm.videoType !== 'upload' && (
                  <div className="space-y-2">
                    <Label>Vista Previa del Video</Label>
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <VideoPreview 
                        videoUrl={blockForm.videoUrl} 
                        videoType={blockForm.videoType}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Image File (only for image blocks) */}
            {blockForm.type === 'image' && (
              <div className="space-y-2">
                <Label htmlFor="image-file">Imagen</Label>
                <div className="space-y-2">
                  {/* Upload Button */}
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      ref={imageFileInputRef}
                      id="image-file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
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

                        if (!courseId || !selectedLesson) {
                          toast.error('Error: No se pudo determinar el curso o lección')
                          return
                        }

                        setIsUploadingImage(true)
                        try {
                          const { url, blobName, containerName } = await ApiService.uploadFile(file, 'lesson-image', {
                            courseId,
                            lessonId: selectedLesson.lesson.id
                          })

                          // Guardar blobName en formato container/blobName
                          const blobNameForStorage = `${containerName}/${blobName}`
                          setBlockForm({ ...blockForm, imageFile: blobNameForStorage })
                          setImagePreviewUrl(url) // Set preview URL
                          toast.success('Imagen subida exitosamente')
                        } catch (error: any) {
                          console.error('Error uploading image:', error)
                          toast.error(error.message || 'Error al subir la imagen')
                        } finally {
                          setIsUploadingImage(false)
                        }
                      }}
                      disabled={isUploadingImage}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => imageFileInputRef.current?.click()}
                      disabled={isUploadingImage}
                    >
                      <UploadSimple size={20} className="mr-2" />
                      {isUploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG, GIF • Máx 5MB
                    </p>
                  </div>

                  {/* Preview or URL Input */}
                  {blockForm.imageFile && (
                    <div className="space-y-2">
                      {(imagePreviewUrl || blockForm.imageFile.startsWith('http') || blockForm.imageFile.startsWith('data:')) ? (
                        <div className="border rounded-lg p-2">
                          <img 
                            src={imagePreviewUrl || blockForm.imageFile} 
                            alt="Preview" 
                            className="max-w-full h-auto rounded"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            id="image-file"
                            placeholder="blobName o URL de imagen"
                            value={blockForm.imageFile}
                            onChange={(e) => setBlockForm({ ...blockForm, imageFile: e.target.value })}
                            readOnly
                          />
                          <p className="text-xs text-muted-foreground">
                            Imagen guardada: {blockForm.imageFile}
                          </p>
                          <p className="text-xs text-blue-600">
                            La imagen se mostrará correctamente cuando los estudiantes vean el curso
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* File Upload (only for file blocks) */}
            {blockForm.type === 'file' && (
              <div className="space-y-4">
                <Label>Material Descargable</Label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/30">
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        // Validate file size (20MB max)
                        if (file.size > 20 * 1024 * 1024) {
                          toast.error('El archivo debe ser menor a 20MB')
                          return
                        }

                        if (!courseId || !selectedLesson) {
                          toast.error('Error: No se pudo determinar el curso o lección')
                          return
                        }

                        setIsUploadingFile(true)
                        try {
                          const { url, blobName, containerName, size, contentType, originalName } = await ApiService.uploadFile(file, 'lesson-file', {
                            courseId,
                            lessonId: selectedLesson.lesson.id
                          })

                          // Store the blob reference for future retrieval
                          const blobNameForStorage = `${containerName}/${blobName}`
                          setBlockForm({ 
                            ...blockForm, 
                            fileUrl: blobNameForStorage,
                            fileName: originalName || file.name,
                            fileSize: size,
                            fileType: contentType
                          })
                          toast.success('Archivo subido exitosamente')
                        } catch (error: any) {
                          console.error('Error uploading file:', error)
                          toast.error(error.message || 'Error al subir el archivo')
                        } finally {
                          setIsUploadingFile(false)
                        }
                      }}
                      disabled={isUploadingFile}
                    />
                    <FileIcon size={40} className="mx-auto text-muted-foreground mb-3" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingFile}
                      className="mb-2"
                    >
                      <UploadSimple size={20} className="mr-2" />
                      {isUploadingFile ? 'Subiendo...' : 'Subir Material'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      PDF, Word, Excel, PowerPoint, TXT, CSV, ZIP • Máx 20MB
                    </p>
                  </div>

                  {/* File Preview */}
                  {blockForm.fileUrl && (
                    <div className="border rounded-lg p-4 bg-background">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const FileTypeIcon = getFileTypeIcon(blockForm.fileType)
                          return <FileTypeIcon size={32} className="text-primary flex-shrink-0" />
                        })()}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{blockForm.fileName || 'Archivo'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(blockForm.fileSize)}
                            {blockForm.fileType && ` • ${blockForm.fileType.split('/').pop()?.toUpperCase()}`}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setBlockForm({ ...blockForm, fileUrl: '', fileName: '', fileSize: 0, fileType: '' })}
                          className="text-destructive"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Description input for file */}
                  <div className="space-y-2">
                    <Label htmlFor="file-description">Descripción del archivo (opcional)</Label>
                    <Input
                      id="file-description"
                      placeholder="ej. Guía de ejercicios complementarios"
                      value={blockForm.content}
                      onChange={(e) => setBlockForm({ ...blockForm, content: e.target.value })}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground">
                      Describe el contenido del archivo para los estudiantes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-900 dark:text-blue-100">
                    <strong>Material de Apoyo:</strong> Los estudiantes podrán descargar este archivo desde la lección. 
                    Los PDF se pueden previsualizar directamente en el navegador.
                  </div>
                </div>
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

          <DialogFooter className="mt-4 border-t pt-4">
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveBlock} 
              disabled={
                blockForm.type === 'video' 
                  ? !blockForm.videoUrl || !blockForm.videoUrl.trim()
                  : blockForm.type === 'image'
                  ? !blockForm.imageFile || !blockForm.imageFile.trim()
                  : blockForm.type === 'file'
                  ? !blockForm.fileUrl || !blockForm.fileUrl.trim()
                  : !blockForm.content || !blockForm.content.trim()
              }
            >
              {editingBlock ? 'Actualizar' : 'Crear'} Bloque
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
