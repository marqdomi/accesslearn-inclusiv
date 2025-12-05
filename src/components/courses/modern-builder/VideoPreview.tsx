import { useMemo } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface VideoPreviewProps {
  videoUrl: string
  videoType: 'youtube' | 'vimeo' | 'tiktok' | 'wistia' | 'upload'
}

export function VideoPreview({ videoUrl, videoType }: VideoPreviewProps) {
  // Extract embed URLs for different video providers (same logic as VideoLesson)
  const embedUrl = useMemo(() => {
    if (!videoUrl) return null
    
    switch (videoType) {
      case 'youtube': {
        let extractedVideoId = ''
        
        if (videoUrl.includes('youtube.com/watch?v=')) {
          extractedVideoId = videoUrl.split('v=')[1]?.split('&')[0] || ''
        } else if (videoUrl.includes('youtu.be/')) {
          extractedVideoId = videoUrl.split('youtu.be/')[1]?.split('?')[0] || ''
        } else if (videoUrl.includes('youtube.com/embed/')) {
          extractedVideoId = videoUrl.split('embed/')[1]?.split('?')[0] || ''
        }
        
        if (extractedVideoId) {
          return `https://www.youtube.com/embed/${extractedVideoId}?modestbranding=1&rel=0&showinfo=0&enablejsapi=1`
        }
        break
      }
      
      case 'vimeo': {
        const vimeoMatch = videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/)
        if (vimeoMatch) {
          return `https://player.vimeo.com/video/${vimeoMatch[1]}?byline=0&portrait=0&title=0`
        }
        break
      }
      
      case 'wistia': {
        let wistiaId = ''
        
        if (videoUrl.includes('wistia.com/medias/')) {
          wistiaId = videoUrl.split('medias/')[1]?.split('?')[0] || ''
        } else if (videoUrl.includes('wistia.net/embed/iframe/')) {
          wistiaId = videoUrl.split('embed/iframe/')[1]?.split('?')[0] || ''
        }
        
        if (wistiaId) {
          return `https://fast.wistia.net/embed/iframe/${wistiaId}`
        }
        break
      }
      
      case 'tiktok': {
        // TikTok preview is handled separately
        return null
      }
      
      default:
        return null
    }
    
    return null
  }, [videoUrl, videoType])

  if (!videoUrl) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Ingresa una URL válida para ver la vista previa
        </AlertDescription>
      </Alert>
    )
  }

  // TikTok preview
  if (videoType === 'tiktok') {
    return (
      <div className="space-y-2">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            TikTok se mostrará correctamente en el curso. La vista previa puede no estar disponible aquí.
          </AlertDescription>
        </Alert>
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Video de TikTok: {videoUrl}
          </p>
        </div>
      </div>
    )
  }

  // Use iframe embed for YouTube, Vimeo, and Wistia
  if (embedUrl) {
    return (
      <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={embedUrl}
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={`Preview de ${videoType}`}
        />
      </div>
    )
  }

  // Fallback for unsupported URLs
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        No se pudo generar la vista previa para esta URL. Verifica que sea válida.
      </AlertDescription>
    </Alert>
  )
}
