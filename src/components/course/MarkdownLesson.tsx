import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { Card } from '@/components/ui/card'
import { ApiService } from '@/services/api.service'

interface MarkdownLessonProps {
  content: string
}

export function MarkdownLesson({ content }: MarkdownLessonProps) {
  const [processedContent, setProcessedContent] = useState(content)
  const [imageUrlMap, setImageUrlMap] = useState<Map<string, string>>(new Map())

  // Process blob references and convert to URLs
  useEffect(() => {
    const processBlobReferences = async () => {
      // Find all BLOB: references in markdown
      const blobRegex = /!\[([^\]]*)\]\(BLOB:([^)]+)\)/g
      const matches = Array.from(content.matchAll(blobRegex))
      
      if (matches.length === 0) {
        setProcessedContent(content)
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
          // Parse container/blobName format
          const [containerName, ...blobNameParts] = blobPath.split('/')
          const blobName = blobNameParts.join('/')
          
          // Get media URL with SAS token
          const { url } = await ApiService.getMediaUrl(containerName, blobName)
          urlMap.set(blobKey, url)
        } catch (error) {
          console.error('Error getting image URL:', error)
          // Keep the original blob reference as fallback
          urlMap.set(blobKey, blobPath)
        }
      }
      
      // Replace BLOB references with actual URLs
      let processed = content
      urlMap.forEach((url, blobKey) => {
        const blobPath = blobKey.replace('BLOB:', '')
        // Replace BLOB:container/blobName with actual URL
        processed = processed.replace(
          new RegExp(`!\\[([^\\]]*)\\]\\(BLOB:${blobPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'),
          `![$1](${url})`
        )
      })
      
      setProcessedContent(processed)
      setImageUrlMap(urlMap)
    }
    
    processBlobReferences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])
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
                  div: ['class', 'className', 'data-video-url'],
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
          {processedContent}
        </ReactMarkdown>
      </div>
    </Card>
  )
}
