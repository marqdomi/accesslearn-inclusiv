/**
 * BlockRenderer - Renders lesson content blocks directly
 * 
 * This component handles rendering of different block types:
 * - text: Rich text content from TipTap editor (HTML)
 * - file: Downloadable file attachments
 * - image: Image blocks with optional captions
 * - video: Embedded videos (YouTube, Vimeo, etc.)
 * 
 * This approach is cleaner than converting blocks to markdown/HTML strings
 * and parsing them back, avoiding complexity and potential bugs.
 */

import { useState, useEffect } from 'react'
import { HTMLContent } from './HTMLContent'
import { VideoLesson } from './VideoLesson'
import { FileBlock } from '@/components/courses/lesson-blocks/FileBlock'
import { ApiService } from '@/services/api.service'

export interface ContentBlock {
  id: string
  type: 'text' | 'file' | 'image' | 'video' | 'welcome' | 'code' | 'challenge'
  order: number
  content?: string
  // File block properties
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  // Image block properties
  imageFile?: string
  imageAlt?: string
  // Video block properties
  videoUrl?: string
  videoProvider?: 'youtube' | 'vimeo' | 'tiktok' | 'url'
}

interface BlockRendererProps {
  blocks: ContentBlock[]
  className?: string
}

// Component to render images with SAS URL resolution
function ImageBlock({ imageFile, imageAlt }: { imageFile: string; imageAlt?: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadImage = async () => {
      if (!imageFile) {
        setLoading(false)
        return
      }

      // If already a full URL, use directly
      if (imageFile.startsWith('http') || imageFile.startsWith('data:')) {
        setImageUrl(imageFile)
        setLoading(false)
        return
      }

      // If it's a blob reference (container/path), get SAS URL
      if (imageFile.includes('/')) {
        try {
          const [containerName, ...blobNameParts] = imageFile.split('/')
          const blobName = blobNameParts.join('/')
          const { url } = await ApiService.getMediaUrl(containerName, blobName)
          setImageUrl(url)
        } catch (err) {
          console.error('Error loading image:', err)
          setError(true)
        }
      } else {
        setImageUrl(imageFile)
      }
      setLoading(false)
    }

    loadImage()
  }, [imageFile])

  if (loading) {
    return (
      <div className="my-4 h-48 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Cargando imagen...</span>
      </div>
    )
  }

  if (error || !imageUrl) {
    return null
  }

  return (
    <figure className="my-6">
      <img
        src={imageUrl}
        alt={imageAlt || 'Imagen del contenido'}
        className="rounded-lg max-w-full h-auto shadow-md"
      />
      {imageAlt && (
        <figcaption className="mt-2 text-sm text-muted-foreground text-center">
          {imageAlt}
        </figcaption>
      )}
    </figure>
  )
}

// Extract video ID from URL
function extractVideoInfo(url: string): { provider: string; embedUrl: string } | null {
  if (!url) return null

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    const videoId = match ? match[1] : null
    if (videoId) {
      return {
        provider: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}`
      }
    }
  }

  // Vimeo
  if (url.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(\d+)/)
    const videoId = match ? match[1] : null
    if (videoId) {
      return {
        provider: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${videoId}`
      }
    }
  }

  // TikTok - can't easily embed
  if (url.includes('tiktok.com')) {
    return {
      provider: 'tiktok',
      embedUrl: url
    }
  }

  return null
}

// Video block component
function VideoBlock({ videoUrl }: { videoUrl: string }) {
  const videoInfo = extractVideoInfo(videoUrl)

  if (!videoInfo) {
    return (
      <div className="my-6 p-4 bg-muted rounded-lg text-center text-muted-foreground">
        Video no disponible
      </div>
    )
  }

  if (videoInfo.provider === 'tiktok') {
    return (
      <div className="my-6 p-4 bg-muted rounded-lg text-center">
        <a 
          href={videoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Ver video en TikTok
        </a>
      </div>
    )
  }

  return (
    <div className="my-6 rounded-lg overflow-hidden shadow-lg bg-muted/30">
      <div className="relative aspect-video w-full">
        <iframe
          src={videoInfo.embedUrl}
          title="Video del contenido"
          className="w-full h-full absolute inset-0 rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          frameBorder="0"
        />
      </div>
    </div>
  )
}

export function BlockRenderer({ blocks, className }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="text-muted-foreground italic">
        Sin contenido disponible
      </div>
    )
  }

  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <div className={className}>
      {sortedBlocks.map((block) => {
        switch (block.type) {
          case 'text':
          case 'welcome':
            return (
              <div key={block.id} className="mb-6">
                <HTMLContent content={block.content || ''} />
              </div>
            )

          case 'file':
            return (
              <div key={block.id} className="my-6">
                <FileBlock
                  fileUrl={block.fileUrl || ''}
                  fileName={block.fileName}
                  fileSize={block.fileSize}
                  fileType={block.fileType}
                  description={block.content}
                />
              </div>
            )

          case 'image':
            return (
              <div key={block.id}>
                <ImageBlock 
                  imageFile={block.imageFile || ''} 
                  imageAlt={block.imageAlt || block.content} 
                />
                {block.content && block.content !== block.imageAlt && (
                  <HTMLContent content={block.content} />
                )}
              </div>
            )

          case 'video':
            return (
              <div key={block.id}>
                {block.videoUrl && <VideoBlock videoUrl={block.videoUrl} />}
                {block.content && <HTMLContent content={block.content} />}
              </div>
            )

          case 'code':
            return (
              <div key={block.id} className="my-6">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono">{block.content}</code>
                </pre>
              </div>
            )

          default:
            // Fallback: render as HTML if there's content
            if (block.content) {
              return (
                <div key={block.id} className="mb-6">
                  <HTMLContent content={block.content} />
                </div>
              )
            }
            return null
        }
      })}
    </div>
  )
}
