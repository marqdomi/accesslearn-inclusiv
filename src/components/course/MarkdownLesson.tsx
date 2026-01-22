import { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { Card } from '@/components/ui/card'
import { ApiService } from '@/services/api.service'
import { FileBlock } from '@/components/courses/lesson-blocks/FileBlock'

interface MarkdownLessonProps {
  content: string
}

// Detect if content is HTML or Markdown
const isHtmlContent = (content: string): boolean => {
  if (!content) return false
  const trimmed = content.trim()
  // Check for common HTML patterns
  return (
    trimmed.startsWith('<') && trimmed.endsWith('>') ||
    /<(p|div|h[1-6]|ul|ol|li|strong|em|a|blockquote|pre|code|br|hr|img)[^>]*>/i.test(trimmed)
  )
}

// Convert HTML to Markdown for consistent rendering
const htmlToMarkdownForViewer = (html: string): string => {
  if (!html) return ''
  
  const temp = document.createElement('div')
  temp.innerHTML = html

  const extractContent = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || ''
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const tagName = element.tagName.toLowerCase()
      const children = Array.from(element.childNodes).map(extractContent).join('')
      const trimmedChildren = children.trim()

      switch (tagName) {
        case 'strong':
        case 'b':
          return trimmedChildren ? `**${trimmedChildren}**` : ''
        case 'em':
        case 'i':
          return trimmedChildren ? `*${trimmedChildren}*` : ''
        case 'h1':
          return `\n# ${trimmedChildren}\n`
        case 'h2':
          return `\n## ${trimmedChildren}\n`
        case 'h3':
          return `\n### ${trimmedChildren}\n`
        case 'h4':
          return `\n#### ${trimmedChildren}\n`
        case 'ul':
          return `\n${children}`
        case 'ol':
          return `\n${children}`
        case 'li':
          return `- ${trimmedChildren}\n`
        case 'blockquote':
          return trimmedChildren.split('\n').map((line: string) => `> ${line.trim()}`).filter(Boolean).join('\n') + '\n'
        case 'code':
          if (element.parentElement?.tagName.toLowerCase() === 'pre') {
            return trimmedChildren
          }
          return `\`${trimmedChildren}\``
        case 'pre':
          const codeEl = element.querySelector('code')
          const codeContent = codeEl ? codeEl.textContent : trimmedChildren
          return `\n\`\`\`\n${codeContent}\n\`\`\`\n`
        case 'a':
          const href = element.getAttribute('href') || ''
          return `[${trimmedChildren}](${href})`
        case 'img':
          const src = element.getAttribute('src') || ''
          const alt = element.getAttribute('alt') || ''
          return `![${alt}](${src})`
        case 'p':
          return children ? `${children}\n\n` : ''
        case 'br':
          return '\n'
        case 'hr':
          return '\n---\n'
        case 'div':
          // Handle text-align styles
          const style = element.getAttribute('style') || ''
          if (style.includes('text-align')) {
            // Keep alignment in HTML for proper rendering
            return `<div style="${style}">${children}</div>\n\n`
          }
          return children ? `${children}\n\n` : ''
        default:
          return children
      }
    }
    return ''
  }

  return extractContent(temp).trim().replace(/\n{3,}/g, '\n\n')
}

export function MarkdownLesson({ content }: MarkdownLessonProps) {
  const [processedContent, setProcessedContent] = useState(content)
  const [imageUrlMap, setImageUrlMap] = useState<Map<string, string>>(new Map())
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Convert HTML to Markdown if needed
  const normalizedContent = useMemo(() => {
    if (!content) return ''
    if (isHtmlContent(content)) {
      console.log('[MarkdownLesson] Detected HTML content, converting to Markdown')
      return htmlToMarkdownForViewer(content)
    }
    return content
  }, [content])

  // Process blob references and convert to URLs
  useEffect(() => {
    const processBlobReferences = async () => {
      setIsProcessing(true)
      
      try {
        // Use normalizedContent instead of content directly
        const sourceContent = normalizedContent
        
        // Find all BLOB: references in markdown
        const blobRegex = /!\[([^\]]*)\]\(BLOB:([^)]+)\)/g
        const matches = Array.from(sourceContent.matchAll(blobRegex))
        
        if (matches.length === 0) {
          setProcessedContent(sourceContent)
          setIsProcessing(false)
          return
        }

        const urlMap = new Map<string, string>()
        
        // Process each blob reference
        for (const match of matches) {
          const [fullMatch, altText, blobPath] = match
          const blobKey = `BLOB:${blobPath}`
          
          // Check if we already have this URL cached
          if (imageUrlMap.has(blobKey)) {
            urlMap.set(blobKey, imageUrlMap.get(blobKey)!)
            continue
          }
          
          try {
            // Parse container/blobName format - expects format like "course-media/tenant-id/path/file.png"
            const pathParts = blobPath.split('/')
            if (pathParts.length < 2) {
              console.warn(`[MarkdownLesson] Invalid blob path format: ${blobPath}`)
              // Skip this blob reference - will be removed from content
              continue
            }
            
            const [containerName, ...blobNameParts] = pathParts
            const blobName = blobNameParts.join('/')
            
            // Validate container and blob name
            if (!containerName || !blobName) {
              console.warn(`[MarkdownLesson] Missing container or blob name: container=${containerName}, blob=${blobName}`)
              continue
            }
            
            // Get media URL with SAS token
            const { url } = await ApiService.getMediaUrl(containerName, blobName)
            urlMap.set(blobKey, url)
          } catch (error: any) {
            console.error(`[MarkdownLesson] Error getting image URL for ${blobPath}:`, error?.message || error)
            // Remove the broken image reference from content instead of showing broken image
            // We'll handle this below when replacing
          }
        }
        
        // Replace BLOB references with actual URLs or remove broken references
        let processed = sourceContent
        
        // First, replace successful blob references
        urlMap.forEach((url, blobKey) => {
          const blobPath = blobKey.replace('BLOB:', '')
          processed = processed.replace(
            new RegExp(`!\\[([^\\]]*)\\]\\(BLOB:${blobPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'),
            `![$1](${url})`
          )
        })
        
        // Then, remove any remaining broken BLOB references (ones that failed to load)
        // Replace with just the alt text in italics
        processed = processed.replace(
          /!\[([^\]]*)\]\(BLOB:[^)]+\)/g,
          (_match, altText) => altText ? `*${altText}*` : ''
        )
        
        setProcessedContent(processed)
        setImageUrlMap(urlMap)
      } catch (error) {
        console.error('[MarkdownLesson] Error processing blob references:', error)
        // Fallback: show content without blob processing
        setProcessedContent(normalizedContent.replace(/!\[([^\]]*)\]\(BLOB:[^)]+\)/g, (_match, altText) => altText ? `*${altText}*` : ''))
      } finally {
        setIsProcessing(false)
      }
    }
    
    processBlobReferences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedContent])

  // Pre-process markdown to fix common formatting issues
  const preprocessMarkdown = (md: string): string => {
    let processed = md
    
    // Fix bold markers with trailing spaces before closing: **text ** -> **text**
    processed = processed.replace(/\*\*([^*]+?)\s+\*\*/g, '**$1**')
    
    // Fix italic markers with trailing spaces before closing: *text * -> *text*
    processed = processed.replace(/(?<!\*)\*([^*]+?)\s+\*(?!\*)/g, '*$1*')
    
    // Fix bold markers with leading spaces after opening: ** text** -> **text**
    processed = processed.replace(/\*\*\s+([^*]+?)\*\*/g, '**$1**')
    
    // Fix italic markers with leading spaces after opening: * text* -> *text*
    processed = processed.replace(/(?<!\*)\*\s+([^*]+?)\*(?!\*)/g, '*$1*')
    
    // Clean up multiple consecutive spaces
    processed = processed.replace(/  +/g, ' ')
    
    return processed
  }

  const finalContent = preprocessMarkdown(processedContent)

  return (
    <Card className="p-8">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeRaw,
            [
              rehypeSanitize,
              {
                ...defaultSchema,
                tagNames: [...(defaultSchema.tagNames || []), 'iframe', 'div'],
                attributes: {
                  ...defaultSchema.attributes,
                  iframe: [
                    'src',
                    'title',
                    'allow',
                    'allowfullscreen',
                    'frameborder',
                    'width',
                    'height',
                    'class',
                    'className',
                    'style',
                  ],
                  div: ['class', 'className', 'data-video-url', 'data-file', 'data-file-encoded', 'style'],
                  p: [...(defaultSchema.attributes?.p || []), 'style'],
                  h1: [...(defaultSchema.attributes?.h1 || []), 'style'],
                  h2: [...(defaultSchema.attributes?.h2 || []), 'style'],
                  h3: [...(defaultSchema.attributes?.h3 || []), 'style'],
                },
              },
            ],
          ]}
          components={{
            // Personalizar componentes markdown
            h1: ({ node, ...props }) => (
              <h1 className="text-4xl font-bold mb-6 text-primary" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-3xl font-semibold mb-4 mt-8 text-primary" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-2xl font-semibold mb-3 mt-6" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="mb-4 leading-relaxed text-base" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="ml-4" {...props} />
            ),
            code: ({ node, inline, ...props }: any) =>
              inline ? (
                <code
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                />
              ) : (
                <code
                  className="block bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono my-4"
                  {...props}
                />
              ),
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground"
                {...props}
              />
            ),
            a: ({ node, ...props }) => (
              <a
                className="text-primary hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            img: ({ node, ...props }) => (
              <img
                className="rounded-lg my-4 max-w-full h-auto shadow-md"
                {...props}
              />
            ),
            div: ({ node, className, children, ...props }: any) => {
              // Handle file download blocks
              if (className === 'file-download-block' || (typeof className === 'string' && className.includes('file-download-block'))) {
                try {
                  // Support both legacy data-file and new encoded format
                  const dataFileEncoded = (props as any)['data-file-encoded']
                  const dataFile = (props as any)['data-file']
                  
                  let fileData = null
                  if (dataFileEncoded) {
                    // Decode base64 encoded data
                    fileData = JSON.parse(atob(dataFileEncoded))
                  } else if (dataFile) {
                    // Legacy format (direct JSON)
                    fileData = JSON.parse(dataFile)
                  }
                  
                  if (fileData) {
                    return (
                      <div className="my-6">
                        <FileBlock 
                          fileUrl={fileData.fileUrl}
                          fileName={fileData.fileName}
                          fileSize={fileData.fileSize}
                          fileType={fileData.fileType}
                          description={fileData.description}
                        />
                      </div>
                    )
                  }
                } catch (error) {
                  console.error('[MarkdownLesson] Error parsing file data:', error)
                }
                return null
              }
              // Handle video embeds
              if (className === 'video-embed' || (typeof className === 'string' && className.includes('video-embed'))) {
                return (
                  <div className="my-6 rounded-lg overflow-hidden shadow-lg bg-muted/30">
                    <div className="relative aspect-video w-full">
                      {children}
                    </div>
                  </div>
                )
              }
              if (className === 'tiktok-video-embed' || (typeof className === 'string' && className.includes('tiktok-video-embed'))) {
                return (
                  <div className="my-6 rounded-lg overflow-hidden shadow-lg bg-black p-4 flex items-center justify-center">
                    {children}
                  </div>
                )
              }
              return <div className={className} {...props}>{children}</div>
            },
            iframe: ({ node, src, ...props }: any) => {
              if (!src) return null
              return (
                <iframe
                  src={src}
                  className="w-full h-full absolute inset-0 rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  frameBorder="0"
                  {...props}
                />
              )
            },
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-border" {...props} />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th
                className="px-4 py-2 bg-muted font-semibold text-left"
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td className="px-4 py-2 border-t border-border" {...props} />
            ),
          }}
        >
          {finalContent}
        </ReactMarkdown>
      </div>
    </Card>
  )
}
