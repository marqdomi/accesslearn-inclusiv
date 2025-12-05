import ReactPlayer from 'react-player'
import { Card } from '@/components/ui/card'
import { PlayCircle } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

interface VideoLessonProps {
  videoProvider: 'youtube' | 'vimeo' | 'tiktok' | 'wistia' | 'url'
  videoId?: string
  videoUrl?: string
  title?: string
}

export function VideoLesson({ videoProvider, videoId, videoUrl, title }: VideoLessonProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [tiktokScriptLoaded, setTiktokScriptLoaded] = useState(false)

  // Load TikTok embed script
  useEffect(() => {
    if (videoProvider === 'tiktok' && !tiktokScriptLoaded) {
      const script = document.createElement('script')
      script.src = 'https://www.tiktok.com/embed.js'
      script.async = true
      script.onload = () => setTiktokScriptLoaded(true)
      document.body.appendChild(script)
      
      return () => {
        // Cleanup script if component unmounts
        const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]')
        if (existingScript) {
          document.body.removeChild(existingScript)
        }
      }
    }
  }, [videoProvider, tiktokScriptLoaded])

  // Construir URL del video
  const getVideoUrl = () => {
    // Always prefer videoUrl if available
    if (videoUrl) return videoUrl
    
    switch (videoProvider) {
      case 'youtube':
        return videoId ? `https://www.youtube.com/watch?v=${videoId}` : ''
      case 'vimeo':
        return videoId ? `https://vimeo.com/${videoId}` : ''
      case 'wistia':
        return videoId ? `https://wistia.com/medias/${videoId}` : ''
      case 'tiktok':
        return videoUrl || ''
      default:
        return ''
    }
  }

  const url = getVideoUrl()
  
  // Extract embed URLs for different video providers
  const embedUrl = useMemo(() => {
    if (!url) return null
    
    switch (videoProvider) {
      case 'youtube': {
        // Extract video ID from various YouTube URL formats
        let extractedVideoId = videoId || ''
        
        if (!extractedVideoId) {
          if (url.includes('youtube.com/watch?v=')) {
            extractedVideoId = url.split('v=')[1]?.split('&')[0] || ''
          } else if (url.includes('youtu.be/')) {
            extractedVideoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
          } else if (url.includes('youtube.com/embed/')) {
            extractedVideoId = url.split('embed/')[1]?.split('?')[0] || ''
          }
        }
        
        if (extractedVideoId) {
          return `https://www.youtube.com/embed/${extractedVideoId}?modestbranding=1&rel=0&showinfo=0&enablejsapi=1`
        }
        break
      }
      
      case 'vimeo': {
        // Extract Vimeo video ID
        let extractedVideoId = videoId || ''
        
        if (!extractedVideoId) {
          // Vimeo URLs: https://vimeo.com/123456789 or https://player.vimeo.com/video/123456789
          const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
          if (vimeoMatch) {
            extractedVideoId = vimeoMatch[1]
          }
        }
        
        if (extractedVideoId) {
          return `https://player.vimeo.com/video/${extractedVideoId}?byline=0&portrait=0&title=0`
        }
        break
      }
      
      case 'wistia': {
        // Wistia URLs: https://wistia.com/medias/abc123 or https://fast.wistia.net/embed/iframe/abc123
        let wistiaId = ''
        
        if (url.includes('wistia.com/medias/')) {
          wistiaId = url.split('medias/')[1]?.split('?')[0] || ''
        } else if (url.includes('wistia.net/embed/iframe/')) {
          wistiaId = url.split('embed/iframe/')[1]?.split('?')[0] || ''
        }
        
        if (wistiaId) {
          return `https://fast.wistia.net/embed/iframe/${wistiaId}`
        }
        break
      }
      
      default:
        return null
    }
    
    return null
  }, [videoProvider, url, videoId])
  
  // Debug logging
  useEffect(() => {
    console.log('VideoLesson props:', { videoProvider, videoId, videoUrl, url, embedUrl })
  }, [videoProvider, videoId, videoUrl, url, embedUrl])
  
  // Validate URL and set timeout fallback
  useEffect(() => {
    if (!url) {
      console.warn('VideoLesson: No URL provided')
      setHasError(true)
      return
    }
    
    // Check if ReactPlayer can play this URL
    const canPlay = ReactPlayer.canPlay(url)
    console.log('VideoLesson: canPlay check', { url, canPlay, videoProvider })
    
    // For providers with native iframe embeds, we don't need ReactPlayer
    const usesNativeEmbed = ['youtube', 'vimeo', 'wistia', 'tiktok'].includes(videoProvider)
    
    if (!usesNativeEmbed && !canPlay) {
      console.warn('ReactPlayer cannot play URL:', url, 'Provider:', videoProvider)
      // Don't set error immediately - let ReactPlayer try first
    } else {
      setHasError(false)
    }
    
    // Fallback: if onReady/onStart don't fire within 5 seconds, show the player anyway
    const timeout = setTimeout(() => {
      if (!isReady && !hasError) {
        console.log('VideoLesson: Timeout fallback - showing player anyway')
        setIsReady(true)
      }
    }, 5000)
    
    return () => clearTimeout(timeout)
  }, [url, videoProvider, isReady, hasError])

  return (
    <Card className="p-6">
      {title && (
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-primary" />
          {title}
        </h3>
      )}
      
      <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg bg-muted">
        {!url ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">No se proporcionó una URL de video válida</p>
          </div>
        ) : videoProvider === 'tiktok' ? (
          // TikTok requires blockquote embed format
          <div className="w-full h-full flex items-center justify-center bg-black p-4">
            <blockquote 
              className="tiktok-embed" 
              cite={url}
              data-video-id={url.split('/video/')[1]?.split('?')[0] || url.split('/').pop()}
              style={{ maxWidth: '100%', minWidth: '325px', width: '100%' }}
            >
              <section>
                <a
                  target="_blank"
                  title={title || 'Video de TikTok'}
                  href={url}
                  rel="noopener noreferrer"
                  style={{ color: '#fff', textDecoration: 'none' }}
                >
                  Ver en TikTok
                </a>
              </section>
            </blockquote>
          </div>
        ) : hasError ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-center p-4">
              <p className="text-muted-foreground mb-2">Error al cargar el video</p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Abrir video en nueva pestaña
              </a>
            </div>
          </div>
        ) : embedUrl ? (
          // Use iframe embed directly for YouTube, Vimeo, and Wistia
          <div className="relative w-full h-full">
            <iframe
              src={embedUrl}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={title || `Video de ${videoProvider}`}
              onLoad={() => {
                console.log(`${videoProvider} iframe loaded`)
                setIsReady(true)
                setHasError(false)
              }}
              onError={() => {
                console.error(`${videoProvider} iframe error`)
                setHasError(true)
              }}
            />
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-0 pointer-events-none rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm text-white">Cargando video...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Use ReactPlayer for other providers (Vimeo, etc.)
          <div className="relative w-full h-full">
            <ReactPlayer
              url={url}
              width="100%"
              height="100%"
              playing={isPlaying}
              controls
              onReady={() => {
                console.log('ReactPlayer onReady called')
                setIsReady(true)
                setHasError(false)
              }}
              onStart={() => {
                console.log('ReactPlayer onStart called')
                setIsReady(true)
                setHasError(false)
              }}
              onProgress={() => {
                // If we get progress, the player is definitely ready
                if (!isReady) {
                  console.log('ReactPlayer onProgress called - marking as ready')
                  setIsReady(true)
                }
              }}
              onError={(error) => {
                console.error('ReactPlayer error:', error, 'URL:', url)
                setHasError(true)
                setIsReady(false)
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              config={{
                vimeo: {
                  playerOptions: {
                    byline: false,
                    portrait: false,
                    autoplay: false,
                  },
                },
              }}
            />
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-0 pointer-events-none rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm text-white">Cargando video...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        💡 Tip: Puedes ajustar la velocidad de reproducción en los controles del video
      </p>
    </Card>
  )
}







