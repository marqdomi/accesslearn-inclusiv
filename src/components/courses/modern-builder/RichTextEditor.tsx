import { useState, useRef, useEffect } from 'react'
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

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Escribe tu contenido aquí...',
  maxLength = 5000,
  className 
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Initialize content - convert markdown to HTML on mount
  useEffect(() => {
    if (editorRef.current) {
      if (value) {
        const html = markdownToHtml(value)
        const currentHtml = editorRef.current.innerHTML.trim()
        if (currentHtml !== html.trim()) {
          editorRef.current.innerHTML = html
        }
      } else {
        editorRef.current.innerHTML = ''
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only on mount - initialize once

  // Convert HTML to markdown for storage
  const htmlToMarkdown = (html: string): string => {
    if (!html) return ''
    
    // Create a temporary div to parse HTML properly
    const temp = document.createElement('div')
    temp.innerHTML = html

    // Helper to extract text content recursively
    const extractText = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || ''
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        const tagName = element.tagName.toLowerCase()
        const children = Array.from(element.childNodes).map(extractText).join('')
        
        switch (tagName) {
          case 'strong':
          case 'b':
            return `**${children}**`
          case 'em':
          case 'i':
            return `*${children}*`
          case 'h2':
            return `\n## ${children}\n`
          case 'h3':
            return `\n### ${children}\n`
          case 'ul':
            return `\n${children}\n`
          case 'ol':
            return `\n${children}\n`
          case 'li':
            return `- ${children}\n`
          case 'blockquote':
            return `\n> ${children}\n`
          case 'code':
            return `\`${children}\``
          case 'pre':
            return `\n\`\`\`\n${children}\n\`\`\`\n`
          case 'a':
            const href = element.getAttribute('href') || ''
            return `[${children}](${href})`
          case 'p':
            return `${children}\n`
          case 'br':
            return '\n'
          default:
            return children
        }
      }
      return ''
    }

    return extractText(temp).trim()
  }

  // Convert markdown to HTML for display
  const markdownToHtml = (markdown: string): string => {
    if (!markdown) return ''
    
    let html = markdown
      // Code blocks first (before inline code)
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Headers
      .replace(/^### (.*)$/gim, '<h3>$1</h3>')
      .replace(/^## (.*)$/gim, '<h2>$1</h2>')
      // Bold (must be before italic)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Blockquotes
      .replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>')
      // Numbered lists
      .replace(/^\d+\. (.*)$/gim, '<li>$1</li>')
      // Bullet lists
      .replace(/^- (.*)$/gim, '<li>$1</li>')
      // Wrap consecutive list items
      .replace(/(<li>.*<\/li>)/gs, (match) => {
        // Check if it's already wrapped
        if (!match.includes('<ul>') && !match.includes('<ol>')) {
          return `<ul>${match}</ul>`
        }
        return match
      })
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
    
    // Wrap in paragraph if not already wrapped
    if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<blockquote') && !html.startsWith('<pre')) {
      html = `<p>${html}</p>`
    }
    
    return html
  }

  const handleInput = () => {
    if (!editorRef.current) return
    
    const html = editorRef.current.innerHTML
    const markdown = htmlToMarkdown(html)
    
    // Check length
    if (markdown.length > maxLength) {
      // Revert if exceeds limit
      const previousValue = value
      editorRef.current.innerHTML = markdownToHtml(previousValue)
      return
    }
    
    onChange(markdown)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const insertText = (before: string, after: string = '') => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString()
    const textToInsert = before + selectedText + after

    range.deleteContents()
    range.insertNode(document.createTextNode(textToInsert))
    
    // Move cursor after inserted text
    range.setStartAfter(range.endContainer)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    
    handleInput()
  }

  const insertHeading = (level: 2 | 3) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString() || 'Título'
    
    const heading = document.createElement(`h${level}`)
    heading.textContent = selectedText || `Título ${level === 2 ? 'Principal' : 'Secundario'}`
    
    range.deleteContents()
    range.insertNode(heading)
    
    // Move cursor after heading
    range.setStartAfter(heading)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    
    handleInput()
  }

  const insertList = (ordered: boolean) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString() || 'Elemento de lista'
    
    const list = document.createElement(ordered ? 'ol' : 'ul')
    const item = document.createElement('li')
    item.textContent = selectedText
    list.appendChild(item)
    
    range.deleteContents()
    range.insertNode(list)
    
    // Move cursor after list
    range.setStartAfter(list)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    
    handleInput()
  }

  const insertLink = () => {
    const url = prompt('Ingresa la URL del enlace:')
    if (!url) return
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const linkText = range.toString() || url
    
    const link = document.createElement('a')
    link.href = url
    link.textContent = linkText
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    
    range.deleteContents()
    range.insertNode(link)
    
    // Move cursor after link
    range.setStartAfter(link)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    
    handleInput()
  }

  // Update HTML when value changes externally (but not while user is editing)
  useEffect(() => {
    if (editorRef.current && !isFocused && value !== undefined) {
      const html = markdownToHtml(value || '')
      const currentHtml = editorRef.current.innerHTML.trim()
      // Only update if different to avoid cursor jumps
      if (currentHtml !== html.trim() && html.trim() !== '') {
        editorRef.current.innerHTML = html || ''
      } else if (!value && currentHtml !== '') {
        editorRef.current.innerHTML = ''
      }
    }
  }, [value, isFocused])

  const currentLength = value?.length || 0

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-muted/30 rounded-lg border">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('bold')}
          title="Negrita (Ctrl+B)"
        >
          <TextB size={16} weight="bold" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('italic')}
          title="Cursiva (Ctrl+I)"
        >
          <TextItalic size={16} />
        </Button>
        <div className="w-px h-6 bg-border my-auto mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertHeading(2)}
          title="Título Principal"
        >
          <TextT size={16} weight="bold" />
          <span className="ml-1 text-xs">H2</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertHeading(3)}
          title="Subtítulo"
        >
          <TextT size={16} weight="regular" />
          <span className="ml-1 text-xs">H3</span>
        </Button>
        <div className="w-px h-6 bg-border my-auto mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertList(false)}
          title="Lista con viñetas"
        >
          <ListBullets size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => insertList(true)}
          title="Lista numerada"
        >
          <ListNumbers size={16} />
        </Button>
        <div className="w-px h-6 bg-border my-auto mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={insertLink}
          title="Insertar enlace"
        >
          <LinkIcon size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('formatBlock', 'blockquote')}
          title="Cita"
        >
          <Quotes size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertText('`', '`')}
          title="Código"
        >
          <Code size={16} />
        </Button>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "min-h-[400px] w-full rounded-lg border bg-background p-4",
            "prose prose-sm dark:prose-invert max-w-none",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2",
            "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2",
            "[&_strong]:font-bold",
            "[&_em]:italic",
            "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2",
            "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2",
            "[&_li]:my-1",
            "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-2",
            "[&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm",
            "[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-2",
            "[&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80",
            !value && "text-muted-foreground"
          )}
          style={{ 
            minHeight: '400px',
            maxHeight: '600px',
            overflowY: 'auto'
          }}
          data-placeholder={placeholder}
        />
        <style>{`
          [contenteditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: hsl(var(--muted-foreground));
            pointer-events: none;
          }
        `}</style>
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

