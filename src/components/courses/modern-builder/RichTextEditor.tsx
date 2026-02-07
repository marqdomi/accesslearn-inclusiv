import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import type { EditorView } from '@tiptap/pm/view'
import type { Slice } from '@tiptap/pm/model'
import { Button } from '@/components/ui/button'
import { 
  TextB, 
  TextItalic, 
  ListBullets, 
  ListNumbers,
  Link as LinkIcon,
  Quotes,
  Code,
  TextT,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  TextAlignJustify,
  Image as ImageIcon
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ApiService } from '@/services/api.service'
import { toast } from 'sonner'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
  courseId?: string
  lessonId?: string
}

// Toolbar button component
interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
  className?: string
}

function ToolbarButton({ onClick, isActive, disabled, title, children, className }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      className={cn("h-8 w-8 p-0", className)}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  )
}

// Editor toolbar component
interface EditorToolbarProps {
  editor: Editor | null
  onImageClick?: () => void
}

function EditorToolbar({ editor, onImageClick }: EditorToolbarProps) {
  const setLink = useCallback(() => {
    if (!editor) return
    
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL del enlace:', previousUrl)
    
    if (url === null) return
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-muted/30 rounded-lg border border-b-0 rounded-b-none">
      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Negrita (Ctrl+B)"
      >
        <TextB size={16} weight="bold" />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Cursiva (Ctrl+I)"
      >
        <TextItalic size={16} />
      </ToolbarButton>
      
      <div className="w-px h-6 bg-border my-auto mx-1" />
      
      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Título Principal (H2)"
        className="w-auto px-2"
      >
        <TextT size={16} weight="bold" />
        <span className="ml-1 text-xs">H2</span>
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Subtítulo (H3)"
        className="w-auto px-2"
      >
        <TextT size={16} weight="regular" />
        <span className="ml-1 text-xs">H3</span>
      </ToolbarButton>
      
      <div className="w-px h-6 bg-border my-auto mx-1" />
      
      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Lista con viñetas"
      >
        <ListBullets size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Lista numerada"
      >
        <ListNumbers size={16} />
      </ToolbarButton>
      
      <div className="w-px h-6 bg-border my-auto mx-1" />
      
      {/* Other elements */}
      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive('link')}
        title="Insertar enlace"
      >
        <LinkIcon size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Cita"
      >
        <Quotes size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Código"
      >
        <Code size={16} />
      </ToolbarButton>
      
      <div className="w-px h-6 bg-border my-auto mx-1" />
      
      {/* Text alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Alinear izquierda"
      >
        <TextAlignLeft size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Centrar"
      >
        <TextAlignCenter size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Alinear derecha"
      >
        <TextAlignRight size={16} />
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        isActive={editor.isActive({ textAlign: 'justify' })}
        title="Justificar"
      >
        <TextAlignJustify size={16} />
      </ToolbarButton>
      
      <div className="w-px h-6 bg-border my-auto mx-1" />
      
      {/* Image Upload */}
      <ToolbarButton
        onClick={onImageClick || (() => {})}
        isActive={editor.isActive('image')}
        title="Insertar imagen"
      >
        <ImageIcon size={18} weight="bold" />
      </ToolbarButton>
    </div>
  )
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Escribe tu contenido aquí...',
  maxLength = 50000,
  className,
  courseId,
  lessonId
}: RichTextEditorProps) {
  
  // State for image dialog and upload
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Debounce timer for onChange to avoid re-rendering the entire wizard on every keystroke
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debouncedOnChange = useCallback((html: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      onChange(html)
    }, 300)
  }, [onChange])
  
  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])
  
  // Function to upload image
  const handleImageUpload = async (file: File, editorInstance?: Editor | null) => {
    const currentEditor = editorInstance || editor
    if (!currentEditor) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe exceder 5MB')
      return
    }

    setIsUploading(true)

    try {
      // Upload to Azure Blob Storage using existing ApiService
      // Use editor-image type for images inserted in rich text editor
      const { url } = await ApiService.uploadFile(file, 'editor-image', {
        courseId: courseId || 'temp-course',
        lessonId: lessonId,
      })

      // Insert image in the editor
      currentEditor.chain().focus().setImage({ 
        src: url, 
        alt: file.name 
      }).run()
      
      toast.success('Imagen insertada exitosamente')
    } catch (error: unknown) {
      console.error('Error uploading image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen'
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  // Function to insert image from URL
  const handleImageUrlInsert = () => {
    if (!editor || !imageUrl) return
    
    editor.chain().focus().setImage({ 
      src: imageUrl, 
      alt: imageAlt || 'Imagen del curso' 
    }).run()
    
    setImageUrl('')
    setImageAlt('')
    setIsImageDialogOpen(false)
    toast.success('Imagen insertada exitosamente')
  }
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: cn(
          'min-h-[380px] w-full p-4 focus:outline-none',
          'prose prose-sm dark:prose-invert max-w-none',
          '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2',
          '[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2',
          '[&_strong]:font-bold',
          '[&_em]:italic',
          '[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2',
          '[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2',
          '[&_li]:my-1',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-2',
          '[&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm',
          '[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-2',
          '[&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80',
          '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4'
        ),
      },
      // Handle pasting images (Ctrl+V)
      handlePaste: (view: EditorView, event: ClipboardEvent) => {
        const items = Array.from(event.clipboardData?.items || [])
        const imageItem = items.find(item => item.type.indexOf('image') === 0)
        
        if (imageItem) {
          event.preventDefault()
          const file = imageItem.getAsFile()
          if (file && editor) {
            handleImageUpload(file, editor)
          }
          return true
        }
        return false
      },
      // Handle drag and drop images
      handleDrop: (view: EditorView, event: DragEvent, slice: Slice, moved: boolean) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.indexOf('image') === 0) {
            event.preventDefault()
            if (editor) {
              handleImageUpload(file, editor)
            }
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      // Debounced save to avoid re-rendering entire wizard on every keystroke
      if (html.length <= maxLength) {
        debouncedOnChange(html)
      }
    },
  })

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== undefined && !editor.isFocused) {
      const currentHTML = editor.getHTML()
      // Only update if actually different to avoid cursor jumps
      if (currentHTML !== value) {
        editor.commands.setContent(value || '', { emitUpdate: false })
      }
    }
  }, [value, editor])

  // Get text length using TipTap's getText() - more efficient than creating DOM elements
  const currentLength = useMemo(() => {
    if (editor) {
      return editor.getText().length
    }
    return 0
  }, [editor, value])

  return (
    <div className={cn("space-y-2", className)}>
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-10 bg-background">
        <EditorToolbar editor={editor} onImageClick={() => setIsImageDialogOpen(true)} />
      </div>
      
      <div 
        className={cn(
          "rounded-lg border rounded-t-none bg-background",
          "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
          "min-h-[400px] max-h-[600px] overflow-y-auto"
        )}
      >
        <EditorContent editor={editor} className="relative" />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Puedes pegar o arrastrar imágenes directamente en el editor
        </span>
        <span>
          {currentLength.toLocaleString()} caracteres
        </span>
      </div>

      {currentLength > maxLength * 0.9 && (
        <div className="text-xs text-yellow-600">
          Casi alcanzaste el límite
        </div>
      )}
      
      {/* Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Insertar imagen</DialogTitle>
            <DialogDescription>
              Sube una imagen desde tu computadora o inserta una desde URL
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Subir archivo</TabsTrigger>
              <TabsTrigger value="url">URL de imagen</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Seleccionar archivo</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleImageUpload(file)
                      setIsImageDialogOpen(false)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? 'Subiendo...' : 'Seleccionar imagen'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Formato: JPG, PNG, GIF, WebP. Máximo 5MB.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">URL de la imagen</Label>
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image-alt">Texto alternativo (opcional)</Label>
                <Input
                  id="image-alt"
                  type="text"
                  placeholder="Descripción de la imagen para accesibilidad"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  El texto alternativo ayuda a usuarios con lectores de pantalla.
                </p>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsImageDialogOpen(false)
                    setImageUrl('')
                    setImageAlt('')
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleImageUrlInsert}
                  disabled={!imageUrl}
                >
                  Insertar imagen
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
          
          {isUploading && (
            <div className="flex items-center justify-center p-4 border-t">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Subiendo imagen...</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

