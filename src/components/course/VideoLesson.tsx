import ReactPlayer from 'react-player'
import { Card } from '@/components/ui/card'
import { PlayCircle } from 'lucide-react'
import { useState } from 'react'

interface VideoLessonProps {
  videoProvider: 'youtube' | 'vimeo' | 'url'
  videoId?: string
  videoUrl?: string
  title?: string
}

export function VideoLesson({ videoProvider, videoId, videoUrl, title }: VideoLessonProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Construir URL del video
  const getVideoUrl = () => {
    if (videoUrl) return videoUrl
    
    switch (videoProvider) {
      case 'youtube':
        return `https://www.youtube.com/watch?v=${videoId}`
      case 'vimeo':
        return `https://vimeo.com/${videoId}`
      default:
        return ''
    }
  }

  const url = getVideoUrl()

  return (
    <Card className="p-6">
      {title && (
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-primary" />
          {title}
        </h3>
      )}
      
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          playing={isPlaying}
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1,
                rel: 0,
              },
            },
            vimeo: {
              playerOptions: {
                byline: false,
                portrait: false,
              },
            },
          }}
        />
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        💡 Tip: Puedes ajustar la velocidad de reproducción en los controles del video
      </p>
    </Card>
  )
}
