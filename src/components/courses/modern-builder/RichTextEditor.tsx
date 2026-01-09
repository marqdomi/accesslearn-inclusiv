import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
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
  TextAlignJustify
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useCallback, useEffect } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
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
function EditorToolbar({ editor }: { editor: Editor | null }) {
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
    </div>
  )
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Escribe tu contenido aquí...',
  maxLength = 50000,
  className 
}: RichTextEditorProps) {
  
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
      TextAlign.configure({
        types: ['heading', 'paragraph'],
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
          '[&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      // Save HTML directly - no conversion needed
      if (html.length <= maxLength) {
        onChange(html)
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

  // Get text length for character count (strip HTML tags)
  const getTextLength = (html: string) => {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent?.length || 0
  }

  const currentLength = getTextLength(value || '')

  return (
    <div className={cn("space-y-2", className)}>
      <EditorToolbar editor={editor} />
      
      <div 
        className={cn(
          "rounded-lg border rounded-t-none bg-background",
          "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
          "min-h-[400px] max-h-[600px] overflow-y-auto"
        )}
      >
        <EditorContent editor={editor} className="relative" />
      </div>

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>
          {currentLength.toLocaleString()} caracteres
        </span>
        {currentLength > maxLength * 0.9 && (
          <span className="text-yellow-600">
            Casi alcanzaste el límite
          </span>
        )}
      </div>
    </div>
  )
}

