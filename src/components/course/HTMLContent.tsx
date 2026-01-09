/**
 * HTMLContent - Renders HTML content safely with professional styling
 * 
 * This component displays rich text content that was created with the 
 * TipTap WYSIWYG editor. It applies consistent typography and handles
 * accessibility features.
 */

import { cn } from '@/lib/utils'
import DOMPurify from 'dompurify'

interface HTMLContentProps {
  content: string
  className?: string
}

// Configure DOMPurify to allow safe HTML tags and attributes
const sanitizeConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'div', 'span'
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'src', 'alt', 'title',
    'class', 'style', 'id'
  ],
  ALLOWED_STYLE_PROPS: ['text-align', 'color', 'background-color'],
}

export function HTMLContent({ content, className }: HTMLContentProps) {
  // Return empty if no content
  if (!content || content.trim() === '' || content === '<p></p>') {
    return (
      <div className={cn("text-muted-foreground italic", className)}>
        Sin contenido disponible
      </div>
    )
  }

  // Sanitize HTML to prevent XSS
  const sanitizedHTML = DOMPurify.sanitize(content, sanitizeConfig)

  return (
    <div 
      className={cn(
        // Base typography
        "prose prose-slate dark:prose-invert max-w-none",
        
        // Headings
        "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4",
        "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3",
        "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2",
        "[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-2",
        
        // Paragraphs and text
        "[&_p]:my-3 [&_p]:leading-relaxed",
        "[&_strong]:font-bold",
        "[&_em]:italic",
        "[&_u]:underline",
        "[&_s]:line-through",
        
        // Lists
        "[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-3",
        "[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-3",
        "[&_li]:my-1.5 [&_li]:leading-relaxed",
        
        // Blockquotes
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/50",
        "[&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-4",
        "[&_blockquote]:bg-muted/30 [&_blockquote]:rounded-r",
        "[&_blockquote]:italic [&_blockquote]:text-muted-foreground",
        
        // Code
        "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5",
        "[&_code]:rounded [&_code]:font-mono [&_code]:text-sm",
        "[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg",
        "[&_pre]:overflow-x-auto [&_pre]:my-4",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
        
        // Links
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
        "[&_a:hover]:text-primary/80",
        
        // Images
        "[&_img]:rounded-lg [&_img]:my-4 [&_img]:max-w-full",
        
        // Tables
        "[&_table]:w-full [&_table]:border-collapse [&_table]:my-4",
        "[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-muted",
        "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2",
        
        // Horizontal rule
        "[&_hr]:my-6 [&_hr]:border-border",
        
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  )
}
