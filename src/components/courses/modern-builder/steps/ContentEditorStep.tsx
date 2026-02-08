import { CourseStructure, LessonBlock, Lesson } from '@/lib/types'
import { getFileTypeIcon, formatFileSize } from '@/lib/file-utils'
import { cn } from '@/lib/utils'
import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
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

// ---------- Sortable block card ----------

interface SortableBlockCardProps {
  block: LessonBlock
  blockIndex: number
  BlockIcon: React.ComponentType<any>
  onEdit: () => void
  onDelete: () => void
}

function SortableBlockCard({ block, blockIndex, BlockIcon, onEdit, onDelete }: SortableBlockCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <DotsSixVertical
            className="text-muted-foreground mt-1 cursor-grab active:cursor-grabbing"
            size={20}
            {...attributes}
            {...listeners}
          />
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
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <PencilSimple size={16} />
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
              <Trash size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions used by SortableBlockCard
function getBlockLabel(type: string): string {
  const labels: Record<string, string> = {
    welcome: 'Bienvenida', text: 'Texto', image: 'Imagen', audio: 'Audio',
    video: 'Video', file: 'Material', challenge: 'Desafío', code: 'Código',
  }
  return labels[type] || type
}

// ---------- Main component ----------

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
  const [isUploadingAudio, setIsUploadingAudio] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null)
  const imageFileInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioFileInputRef = useRef<HTMLInputElement>(null)

  // AI Content state
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false)
  const [aiTab, setAITab] = useState<'generate' | 'document'>('generate')
  const [aiTopic, setAITopic] = useState('')
  const [aiBlockCount, setAIBlockCount] = useState('4')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiResult, setAIResult] = useState<{ blocks: Array<{ type: string; content: string; characterMessage?: string }>; suggestedTitle?: string } | null>(null)
  const [docResult, setDocResult] = useState<any>(null)
  const [isUploadingDoc, setIsUploadingDoc] = useState(false)
  const docFileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state
  const [blockForm, setBlockForm] = useState({
    type: 'text' as LessonBlock['type'],
    content: '',
    xpValue: 10,
    characterMessage: '',
    videoUrl: '',
    videoType: 'upload' as 'upload' | 'youtube' | 'vimeo' | 'wistia' | 'tiktok',
    imageFile: '',
    // Audio fields
    audioFile: '',
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

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Block reorder
  const handleBlockDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !selectedLesson) return
    const blocks = selectedLesson.lesson.blocks
    const oldIndex = blocks.findIndex((b) => b.id === active.id)
    const newIndex = blocks.findIndex((b) => b.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const updatedModules = [...course.modules]
    updatedModules[selectedLesson.moduleIndex].lessons[selectedLesson.lessonIndex].blocks =
      arrayMove([...blocks], oldIndex, newIndex).map((b, i) => ({ ...b, order: i }))
    updateCourse({ modules: updatedModules })
  }, [course.modules, selectedLesson, updateCourse])

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
      audioFile: '',
      fileUrl: '',
      fileName: '',
      fileSize: 0,
      fileType: '',
    })
    setImagePreviewUrl(null)
    setAudioPreviewUrl(null)
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
      audioFile: block.audioFile || '',
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

    // Load audio preview if it's an audio block with blobName
    if (block.type === 'audio' && block.audioFile) {
      if (block.audioFile.startsWith('http')) {
        setAudioPreviewUrl(block.audioFile)
      } else {
        try {
          const [containerName, ...blobNameParts] = block.audioFile.split('/')
          const blobName = blobNameParts.join('/')
          const { url } = await ApiService.getMediaUrl(containerName, blobName)
          setAudioPreviewUrl(url)
        } catch (error) {
          console.error('Error loading audio preview:', error)
          setAudioPreviewUrl(null)
        }
      }
    } else {
      setAudioPreviewUrl(null)
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
    } else if (blockForm.type === 'audio') {
      if (!blockForm.audioFile || !blockForm.audioFile.trim()) {
        toast.error('Por favor, sube un archivo de audio o ingresa una URL')
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
      audioFile: blockForm.type === 'audio' ? blockForm.audioFile : undefined,
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
      audioFile: '',
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

  // Calculate total blocks
  const totalBlocks = course.modules.reduce((acc, m) => 
    acc + m.lessons.reduce((acc2, l) => acc2 + l.blocks.length, 0), 0
  )

  // ── AI Content Generation ──────────────────────────────
  const handleOpenAIDialog = () => {
    setAIResult(null)
    setDocResult(null)
    setAITopic('')
    setAITab('generate')
    setIsAIDialogOpen(true)
  }

  const handleGenerateAIContent = async () => {
    if (!aiTopic.trim() || !selectedLesson) return
    setIsGeneratingAI(true)
    setAIResult(null)
    try {
      const data = await ApiService.generateAIContent({
        topic: aiTopic,
        courseTitle: course.title || 'Curso',
        lessonTitle: selectedLesson.lesson.title,
        blockCount: parseInt(aiBlockCount),
      })
      setAIResult(data.content)
    } catch (err: any) {
      toast.error(err.message || 'Error al generar contenido con IA')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingDoc(true)
    setDocResult(null)
    try {
      const data = await ApiService.extractAIFromDocument(file, course.title || 'Curso', {
        generateQuestions: true,
        generateStructure: true,
        blockCount: 6,
      })
      setDocResult(data)
      toast.success(`Documento "${file.name}" procesado exitosamente`)
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar documento')
    } finally {
      setIsUploadingDoc(false)
      if (docFileInputRef.current) docFileInputRef.current.value = ''
    }
  }

  const handleInsertAIBlocks = (blocks: Array<{ type: string; content: string; characterMessage?: string }>) => {
    if (!selectedLesson || blocks.length === 0) return
    const updatedModules = [...course.modules]
    const lesson = updatedModules[selectedLesson.moduleIndex].lessons[selectedLesson.lessonIndex]
    const newBlocks: LessonBlock[] = blocks.map((b, i) => ({
      id: `ai-block-${Date.now()}-${i}`,
      type: (b.type === 'challenge' ? 'challenge' : 'text') as LessonBlock['type'],
      content: b.content,
      characterMessage: b.characterMessage || '',
      xpValue: b.type === 'challenge' ? 20 : 10,
    }))
    lesson.blocks.push(...newBlocks)
    lesson.totalXP = lesson.blocks.reduce((acc, block) => acc + (block.xpValue || 0), 0)
    updateCourse({ modules: updatedModules })
    setIsAIDialogOpen(false)
    toast.success(`${newBlocks.length} bloques de contenido agregados a la lección`)
  }

  // Auto-select first lesson on mount or when modules change
  const allLessons = course.modules.flatMap((m, mi) =>
    m.lessons.map((l, li) => ({ path: `${mi}-${li}`, lesson: l, moduleIndex: mi, lessonIndex: li, moduleTitle: m.title }))
  )
  
  // If nothing selected but lessons exist, auto-select first
  if (!selectedLessonPath && allLessons.length > 0) {
    // Use a setTimeout to avoid setting state during render
    setTimeout(() => setSelectedLessonPath(allLessons[0].path), 0)
  }

  // Completed lessons (have at least one block)
  const completedLessons = allLessons.filter(l => l.lesson.blocks.length > 0).length

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1">Editor de Contenido</h2>
        <p className="text-muted-foreground text-sm">
          Crea bloques de aprendizaje para cada lección &mdash; {completedLessons}/{allLessons.length} lecciones con contenido
        </p>
      </div>

      {/* Two‑column layout: lesson sidebar + content editor */}
      <div className="flex gap-5 items-start">
        {/* ─── Left sidebar: module/lesson tree ─── */}
        <div className="w-64 shrink-0">
          <Card className="sticky top-4">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Lecciones
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3 max-h-[60vh] overflow-y-auto">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="mb-2">
                  <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wide truncate" title={module.title}>
                    {module.title}
                  </p>
                  {module.lessons.map((lesson, lessonIndex) => {
                    const path = `${moduleIndex}-${lessonIndex}`
                    const isActive = selectedLessonPath === path
                    const blockCount = lesson.blocks.length
                    const hasContent = blockCount > 0
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLessonPath(path)}
                        className={cn(
                          'w-full text-left px-2.5 py-2 rounded-md text-sm flex items-center gap-2 transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-muted/80'
                        )}
                      >
                        <span className={cn(
                          'shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                          hasContent ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                        )}>
                          {hasContent ? '✓' : '·'}
                        </span>
                        <span className="truncate flex-1" title={lesson.title}>{lesson.title}</span>
                        {blockCount > 0 && (
                          <Badge variant="secondary" className="shrink-0 text-[10px] h-5 px-1.5">
                            {blockCount}
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
              {allLessons.length === 0 && (
                <p className="px-2 py-4 text-xs text-muted-foreground text-center">
                  Crea módulos y lecciones en el paso anterior
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Right: editor area ─── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Stats row (compact) */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="py-3 px-4">
                <p className="text-2xl font-bold text-center">{totalBlocks}</p>
                <p className="text-xs text-muted-foreground text-center">Bloques Totales</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 px-4">
                <p className="text-2xl font-bold text-center">{selectedLesson?.lesson.blocks.length || 0}</p>
                <p className="text-xs text-muted-foreground text-center">En esta Lección</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 px-4">
                <p className="text-2xl font-bold text-center">{selectedLesson?.lesson.totalXP || 0} XP</p>
                <p className="text-xs text-muted-foreground text-center">XP de Lección</p>
              </CardContent>
            </Card>
          </div>

          {!selectedLesson ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Selecciona una lección del panel izquierdo para agregar bloques de contenido.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Lesson header + add button */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold truncate">{selectedLesson.lesson.title}</h3>
                  {selectedLesson.lesson.description && (
                    <p className="text-sm text-muted-foreground truncate">{selectedLesson.lesson.description}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button onClick={handleAddBlock} size="default">
                    <Plus className="mr-1.5" size={18} />
                    Agregar Bloque
                  </Button>
                  <Button
                    onClick={handleOpenAIDialog}
                    size="default"
                    variant="outline"
                    className="gap-1.5 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/30"
                  >
                    <Sparkle size={18} weight="fill" className="text-purple-500" />
                    IA
                  </Button>
                </div>
              </div>

              {/* Blocks List */}
              {selectedLesson.lesson.blocks.length === 0 ? (
                <div className="border-2 border-dashed rounded-xl py-12 text-center">
                  <TextT size={40} className="mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground font-medium mb-1">Lección vacía</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Agrega contenido manualmente o genera con IA
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button onClick={handleAddBlock} variant="outline">
                      <Plus className="mr-1.5" size={16} />
                      Agregar bloque
                    </Button>
                    <Button
                      onClick={handleOpenAIDialog}
                      variant="outline"
                      className="gap-1.5 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/30"
                    >
                      <Sparkle size={16} weight="fill" className="text-purple-500" />
                      Generar con IA
                    </Button>
                  </div>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBlockDragEnd}>
                  <SortableContext items={selectedLesson.lesson.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {selectedLesson.lesson.blocks.map((block, blockIndex) => {
                        const BlockIcon = block.type === 'file' ? getFileTypeIcon(block.fileType) : getBlockIcon(block.type)
                        return (
                          <SortableBlockCard
                            key={block.id}
                            block={block}
                            blockIndex={blockIndex}
                            BlockIcon={BlockIcon}
                            onEdit={() => handleEditBlock(selectedLesson.moduleIndex, selectedLesson.lessonIndex, blockIndex)}
                            onDelete={() => handleDeleteBlock(selectedLesson.moduleIndex, selectedLesson.lessonIndex, blockIndex)}
                          />
                        )
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </>
          )}
        </div>
      </div>

      {/* Block Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
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
                  courseId={courseId || course.id}
                  lessonId={selectedLesson?.lesson.id}
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

            {/* Audio Upload (only for audio blocks) */}
            {blockForm.type === 'audio' && (
              <div className="space-y-4">
                <Label>Audio</Label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/30">
                    <input
                      ref={audioFileInputRef}
                      id="audio-file-upload"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        if (!file.type.startsWith('audio/')) {
                          toast.error('Por favor, sube un archivo de audio (MP3, WAV, OGG, AAC)')
                          return
                        }

                        if (file.size > 50 * 1024 * 1024) {
                          toast.error('El audio debe ser menor a 50MB')
                          return
                        }

                        if (!courseId || !selectedLesson) {
                          toast.error('Error: No se pudo determinar el curso o lección')
                          return
                        }

                        setIsUploadingAudio(true)
                        try {
                          const { url, blobName, containerName } = await ApiService.uploadFile(file, 'lesson-file', {
                            courseId,
                            lessonId: selectedLesson.lesson.id
                          })

                          const blobNameForStorage = `${containerName}/${blobName}`
                          setBlockForm({ ...blockForm, audioFile: blobNameForStorage, content: file.name })
                          setAudioPreviewUrl(url)
                          toast.success('Audio subido exitosamente')
                        } catch (error: any) {
                          console.error('Error uploading audio:', error)
                          toast.error(error.message || 'Error al subir el audio')
                        } finally {
                          setIsUploadingAudio(false)
                        }
                      }}
                      disabled={isUploadingAudio}
                    />
                    <MusicNote size={40} className="mx-auto text-muted-foreground mb-3" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => audioFileInputRef.current?.click()}
                      disabled={isUploadingAudio}
                      className="mb-2"
                    >
                      <UploadSimple size={20} className="mr-2" />
                      {isUploadingAudio ? 'Subiendo...' : 'Subir Audio'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      MP3, WAV, OGG, AAC • Máx 50MB
                    </p>
                  </div>

                  {/* Audio Preview */}
                  {blockForm.audioFile && (
                    <div className="border rounded-lg p-4 bg-background space-y-3">
                      <div className="flex items-center gap-3">
                        <MusicNote size={24} className="text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{blockForm.content || 'Audio'}</p>
                          <p className="text-xs text-muted-foreground">{blockForm.audioFile}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setBlockForm({ ...blockForm, audioFile: '', content: '' })
                            setAudioPreviewUrl(null)
                          }}
                          className="text-destructive"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                      {audioPreviewUrl && (
                        <audio controls className="w-full" src={audioPreviewUrl}>
                          Tu navegador no soporta el elemento de audio.
                        </audio>
                      )}
                    </div>
                  )}

                  {/* Or paste external URL */}
                  {!blockForm.audioFile && (
                    <div className="space-y-2">
                      <Label htmlFor="audio-url">O pega una URL de audio externa</Label>
                      <Input
                        id="audio-url"
                        placeholder="https://ejemplo.com/audio.mp3"
                        value={blockForm.audioFile}
                        onChange={(e) => {
                          setBlockForm({ ...blockForm, audioFile: e.target.value })
                          setAudioPreviewUrl(e.target.value)
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Info className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-purple-900 dark:text-purple-100">
                    <strong>Audio Educativo:</strong> Los estudiantes podrán reproducir el audio directamente en la lección. 
                    Ideal para podcasts, explicaciones narradas o ejercicios de escucha.
                  </div>
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
                  : blockForm.type === 'audio'
                  ? !blockForm.audioFile || !blockForm.audioFile.trim()
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

      {/* ── AI Content Generation Dialog ── */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkle size={20} weight="fill" className="text-purple-500" />
              Contenido con Inteligencia Artificial
            </DialogTitle>
            <DialogDescription>
              Genera contenido automáticamente o sube un documento para extraer material educativo
            </DialogDescription>
          </DialogHeader>

          <Tabs value={aiTab} onValueChange={(v) => setAITab(v as 'generate' | 'document')} className="flex-1 min-h-0 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">
                <Sparkle className="mr-1.5 h-4 w-4" />
                Generar desde Tema
              </TabsTrigger>
              <TabsTrigger value="document">
                <UploadSimple className="mr-1.5 h-4 w-4" />
                Subir Documento
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="flex-1 min-h-0 overflow-y-auto space-y-4 mt-4">
              {!aiResult ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>¿Sobre qué tema quieres generar contenido?</Label>
                    <Textarea
                      value={aiTopic}
                      onChange={(e) => setAITopic(e.target.value)}
                      placeholder="Ej: Introducción a la accesibilidad web, principios WCAG, herramientas de evaluación..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cantidad de bloques</Label>
                    <Select value={aiBlockCount} onValueChange={setAIBlockCount}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 bloques</SelectItem>
                        <SelectItem value="4">4 bloques</SelectItem>
                        <SelectItem value="6">6 bloques</SelectItem>
                        <SelectItem value="8">8 bloques</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleGenerateAIContent}
                    disabled={isGeneratingAI || !aiTopic.trim()}
                    className="w-full gap-2"
                  >
                    {isGeneratingAI ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Generando contenido...
                      </>
                    ) : (
                      <>
                        <Sparkle size={18} weight="fill" />
                        Generar Contenido
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="gap-1 text-purple-600 border-purple-200">
                      <Sparkle size={12} weight="fill" />
                      {aiResult.blocks.length} bloques generados
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setAIResult(null)}>
                      Regenerar
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                    {aiResult.blocks.map((block, i) => (
                      <Card key={i} className="border-purple-100 dark:border-purple-900/30">
                        <CardContent className="pt-4 space-y-2">
                          <Badge variant="secondary" className="text-xs">
                            {block.type === 'challenge' ? 'Desafío' : 'Texto'}
                          </Badge>
                          <div
                            className="text-sm prose prose-sm max-w-none dark:prose-invert line-clamp-4"
                            dangerouslySetInnerHTML={{ __html: block.content }}
                          />
                          {block.characterMessage && (
                            <p className="text-xs text-muted-foreground italic">💬 {block.characterMessage}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Button onClick={() => handleInsertAIBlocks(aiResult.blocks)} className="w-full gap-2">
                    <Plus size={18} />
                    Insertar {aiResult.blocks.length} bloques en la lección
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="document" className="flex-1 min-h-0 overflow-y-auto space-y-4 mt-4">
              {!docResult ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-xl py-10 text-center">
                    <UploadSimple size={40} className="mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground font-medium mb-1">Sube un documento</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      PDF, Word (.docx), TXT o Markdown — máximo 10 MB
                    </p>
                    <input
                      ref={docFileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.md,.html"
                      className="hidden"
                      onChange={handleDocumentUpload}
                    />
                    <Button
                      variant="outline"
                      onClick={() => docFileInputRef.current?.click()}
                      disabled={isUploadingDoc}
                      className="gap-2"
                    >
                      {isUploadingDoc ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                          Procesando documento...
                        </>
                      ) : (
                        <>
                          <UploadSimple size={16} />
                          Seleccionar Archivo
                        </>
                      )}
                    </Button>
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      La IA analizará el documento y generará bloques de contenido, preguntas sugeridas y una estructura de módulos recomendada.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Document info */}
                  <Card className="bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900/30">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <FileIcon size={24} className="text-green-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{docResult.documentInfo.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {(docResult.documentInfo.fileSize / 1024).toFixed(0)} KB · {docResult.documentInfo.textLength} caracteres extraídos
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Summary */}
                  {docResult.extracted.summary && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Resumen</p>
                      <p className="text-sm">{docResult.extracted.summary}</p>
                    </div>
                  )}

                  {/* Key Topics */}
                  {docResult.extracted.keyTopics?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {docResult.extracted.keyTopics.map((topic: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{topic}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Generated Blocks Preview */}
                  <div>
                    <p className="text-sm font-semibold mb-2">
                      Bloques de Contenido ({docResult.extracted.blocks.length})
                    </p>
                    <div className="space-y-2 max-h-[25vh] overflow-y-auto pr-1">
                      {docResult.extracted.blocks.map((block: any, i: number) => (
                        <Card key={i} className="border-purple-100 dark:border-purple-900/30">
                          <CardContent className="pt-3 pb-3">
                            <div
                              className="text-sm prose prose-sm max-w-none dark:prose-invert line-clamp-3"
                              dangerouslySetInnerHTML={{ __html: block.content }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Questions */}
                  {docResult.extracted.suggestedQuestions?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">
                        Preguntas Sugeridas ({docResult.extracted.suggestedQuestions.length})
                      </p>
                      <div className="space-y-1.5 max-h-[15vh] overflow-y-auto pr-1">
                        {docResult.extracted.suggestedQuestions.map((q: any, i: number) => (
                          <div key={i} className="text-xs bg-muted/50 rounded px-2.5 py-1.5">
                            <span className="font-medium">{i + 1}.</span> {q.question}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Las preguntas se pueden agregar en el paso de Quizzes
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleInsertAIBlocks(docResult.extracted.blocks)}
                      className="flex-1 gap-2"
                    >
                      <Plus size={18} />
                      Insertar {docResult.extracted.blocks.length} bloques
                    </Button>
                    <Button variant="outline" onClick={() => setDocResult(null)} className="shrink-0">
                      Subir otro
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
