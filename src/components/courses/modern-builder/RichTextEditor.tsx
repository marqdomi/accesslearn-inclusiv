import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { 
  TextB, 
  TextItalic, 
  ListBullets, 
  ListNumbers,
  Link as LinkIcon,
  Quotes,
  Code,
  TextT
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

// Convert TipTap HTML to Markdown for storage
const htmlToMarkdown = (html: string): string => {
  if (!html || html === '<p></p>') return ''
  
  const temp = document.createElement('div')
  temp.innerHTML = html

  const extractText = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const tagName = element.tagName.toLowerCase()
      const children = Array.from(element.childNodes).map(extractText).join('')
      const trimmedChildren = children.trim()

      switch (tagName) {
        case 'strong':
        case 'b':
          return trimmedChildren ? `**${trimmedChildren}**` : ''
        case 'em':
        case 'i':
          return trimmedChildren ? `*${trimmedChildren}*` : ''
        case 'h2':
          return `\n## ${trimmedChildren}\n`
        case 'h3':
          return `\n### ${trimmedChildren}\n`
        case 'ul':
          return `\n${children}`
        case 'ol':
          return `\n${children}`
        case 'li':
          return `- ${trimmedChildren}\n`
        case 'blockquote':
          return trimmedChildren.split('\n').map((line: string) => `> ${line}`).join('\n') + '\n'
        case 'code':
          return `\`${trimmedChildren}\``
        case 'pre':
          const codeEl = element.querySelector('code')
          const codeContent = codeEl ? codeEl.textContent : trimmedChildren
          return `\n\`\`\`\n${codeContent}\n\`\`\`\n`
        case 'a':
          const href = element.getAttribute('href') || ''
          return `[${trimmedChildren}](${href})`
        case 'p':
          return children ? `${children}\n\n` : ''
        case 'br':
          return '\n'
        case 'hr':
          return '\n---\n'
        default:
          return children
      }
    }
    return ''
  }

  return extractText(temp).trim().replace(/\n{3,}/g, '\n\n')
}

// Convert Markdown to HTML for TipTap display
const markdownToHtml = (markdown: string): string => {
  if (!markdown) return '<p></p>'
  
  let html = markdown
    // Code blocks first
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Headers (must handle full line)
    .replace(/^### (.*)$/gim, '<h3>$1</h3>')
    .replace(/^## (.*)$/gim, '<h2>$1</h2>')
    // Bold (must be before italic) - handle edge cases
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Blockquotes (handle multi-line)
    .replace(/^> (.*)$/gim, '<blockquote><p>$1</p></blockquote>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr>')
    // Bullet lists - handle each item
    .replace(/^- (.*)$/gim, '<li>$1</li>')
    // Wrap consecutive list items in <ul>
    .replace(/(<li>[\s\S]*?<\/li>)(?=\s*(?:<li>|$))/g, (match) => match)
  
  // Wrap list items that aren't already in ul/ol
  html = html.replace(/(?<!<[uo]l>)(<li>[\s\S]*?<\/li>)+/g, (match) => `<ul>${match}</ul>`)
  
  // Convert double newlines to paragraphs
  const lines = html.split(/\n\n+/)
  html = lines.map(line => {
    const trimmed = line.trim()
    // Don't wrap if already a block element
    if (!trimmed || 
        trimmed.startsWith('<h') || 
        trimmed.startsWith('<ul') || 
        trimmed.startsWith('<ol') || 
        trimmed.startsWith('<blockquote') || 
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<hr')) {
      return trimmed
    }
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`
  }).filter(Boolean).join('')
  
  return html || '<p></p>'
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
    
    // cancelled
    if (url === null) return
    
    // empty - remove link
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    
    // set link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-muted/30 rounded-lg border border-b-0 rounded-b-none">
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
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Título Principal"
        className="w-auto px-2"
      >
        <TextT size={16} weight="bold" />
        <span className="ml-1 text-xs">H2</span>
      </ToolbarButton>
      
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Subtítulo"
        className="w-auto px-2"
      >
        <TextT size={16} weight="regular" />
        <span className="ml-1 text-xs">H3</span>
      </ToolbarButton>
      
      <div className="w-px h-6 bg-border my-auto mx-1" />
      
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
    </div>
  )
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Escribe tu contenido aquí...',
  maxLength = 5000,
  className 
}: RichTextEditorProps) {
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-muted p-4 rounded overflow-x-auto my-2 font-mono text-sm',
          },
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
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'before:content-[attr(data-placeholder)] before:text-muted-foreground before:pointer-events-none before:absolute before:top-0 before:left-0',
      }),
    ],
    content: markdownToHtml(value || ''),
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
      const markdown = htmlToMarkdown(html)
      
      // Check length
      if (markdown.length <= maxLength) {
        onChange(markdown)
      }
    },
  })

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentMarkdown = htmlToMarkdown(editor.getHTML())
      // Only update if actually different to avoid cursor jumps
      if (currentMarkdown !== value && !editor.isFocused) {
        const html = markdownToHtml(value)
        editor.commands.setContent(html, false)
      }
    }
  }, [value, editor])

  const currentLength = value?.length || 0

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar */}
      <div>
        <EditorToolbar editor={editor} />
        
        {/* Editor */}
        <div 
          className={cn(
            "rounded-lg border rounded-t-none bg-background",
            "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
          )}
          style={{ 
            minHeight: '400px',
            maxHeight: '600px',
            overflowY: 'auto'
          }}
        >
          <EditorContent 
            editor={editor} 
            className="relative"
          />
        </div>
      </div>

      {/* Character count */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>
          {currentLength}/{maxLength} caracteres
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

