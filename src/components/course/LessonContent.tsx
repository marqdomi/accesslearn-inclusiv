import { MarkdownLesson } from './MarkdownLesson'
import { VideoLesson } from './VideoLesson'

interface LessonContentProps {
  lesson: {
    id: string
    title: string
    type: 'markdown' | 'video' | 'quiz'
    content: {
      markdown?: string
      videoProvider?: 'youtube' | 'vimeo' | 'url'
      videoId?: string
      videoUrl?: string
    }
  }
}

export function LessonContent({ lesson }: LessonContentProps) {
  switch (lesson.type) {
    case 'markdown':
      return <MarkdownLesson content={lesson.content.markdown || ''} />
    
    case 'video':
      return (
        <VideoLesson
          videoProvider={lesson.content.videoProvider || 'youtube'}
          videoId={lesson.content.videoId}
          videoUrl={lesson.content.videoUrl}
          title={lesson.title}
        />
      )
    
    case 'quiz':
      // TODO: Implementar en Phase 3
      return (
        <div className="p-8 text-center text-muted-foreground">
          Quiz component - Coming soon in Phase 3
        </div>
      )
    
    default:
      return null
  }
}
