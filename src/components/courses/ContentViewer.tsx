import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ContentModule } from '@/lib/types'
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'
import { useState, useRef, useEffect } from 'react'
import { Play, Pause, ArrowLeft, ArrowRight, Check } from '@phosphor-icons/react'

interface ContentViewerProps {
  module: ContentModule
  onComplete: () => void
  onNext?: () => void
  onPrevious?: () => void
  hasNext: boolean
  hasPrevious: boolean
  currentIndex: number
  totalModules: number
}

export function ContentViewer({
  module,
  onComplete,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  currentIndex,
  totalModules,
}: ContentViewerProps) {
  const { preferences: rawPreferences } = useAccessibilityPreferences()
  const preferences = rawPreferences || {
    textSize: 'normal' as const,
    playbackSpeed: 1,
    highContrast: false,
    captionsEnabled: true,
    reduceMotion: false,
  }
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const mediaElement = videoRef.current || audioRef.current
    if (mediaElement) {
      mediaElement.playbackRate = preferences.playbackSpeed
    }
  }, [preferences.playbackSpeed])

  useEffect(() => {
    if (videoRef.current && preferences.captionsEnabled) {
      const tracks = videoRef.current.textTracks
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = 'showing'
      }
    }
  }, [preferences.captionsEnabled])

  const togglePlayPause = () => {
    const mediaElement = videoRef.current || audioRef.current
    if (mediaElement) {
      if (isPlaying) {
        mediaElement.pause()
      } else {
        mediaElement.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const renderContent = () => {
    switch (module.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <video
              ref={videoRef}
              className="w-full rounded-lg"
              controls
              aria-label={module.title}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={module.url} type="video/mp4" />
              {module.accessibility.captions && (
                <track
                  kind="captions"
                  src={module.accessibility.captions}
                  srcLang="en"
                  label="English"
                  default={preferences.captionsEnabled}
                />
              )}
              Your browser does not support the video element.
            </video>
            {module.accessibility.transcript && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowTranscript(!showTranscript)}
                  aria-expanded={showTranscript}
                >
                  {showTranscript ? 'Hide' : 'Show'} Transcript
                </Button>
                {showTranscript && (
                  <Card className="mt-3 p-4">
                    <p className="whitespace-pre-wrap text-base leading-relaxed">
                      {module.accessibility.transcript}
                    </p>
                  </Card>
                )}
              </div>
            )}
          </div>
        )

      case 'audio':
        return (
          <div className="space-y-4">
            <Card className="p-8">
              <audio
                ref={audioRef}
                className="w-full"
                controls
                aria-label={module.title}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={module.url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </Card>
            {module.accessibility.transcript && (
              <Card className="p-6">
                <h3 className="mb-3 text-lg font-semibold">Transcript</h3>
                <p className="whitespace-pre-wrap text-base leading-relaxed">
                  {module.accessibility.transcript}
                </p>
              </Card>
            )}
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            <img
              src={module.url}
              alt={module.accessibility.altText || module.title}
              className="w-full rounded-lg"
            />
            {module.accessibility.altText && (
              <Card className="p-4">
                <h3 className="mb-2 text-base font-semibold">Image Description</h3>
                <p className="text-base leading-relaxed">{module.accessibility.altText}</p>
              </Card>
            )}
          </div>
        )

      case 'text':
        return (
          <Card className="p-8">
            <div
              className="prose max-w-none text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: module.url }}
            />
          </Card>
        )

      default:
        return <p>Unsupported content type</p>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Module {currentIndex + 1} of {totalModules}
          </p>
          <h2 className="text-2xl font-semibold">{module.title}</h2>
        </div>
        {module.duration && (
          <p className="text-sm text-muted-foreground">{module.duration} min</p>
        )}
      </div>

      <div>{renderContent()}</div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onPrevious}
          disabled={!hasPrevious}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          Previous
        </Button>

        <Button onClick={onComplete} variant="default" size="lg" className="flex-1 gap-2">
          <Check size={20} aria-hidden="true" />
          Mark Complete
        </Button>

        {hasNext ? (
          <Button onClick={onNext} size="lg" className="gap-2">
            Next
            <ArrowRight size={20} aria-hidden="true" />
          </Button>
        ) : (
          <Button onClick={onComplete} variant="default" size="lg" className="gap-2">
            Finish Module
          </Button>
        )}
      </div>
    </div>
  )
}
