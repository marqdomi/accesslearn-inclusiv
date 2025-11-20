import { MarkdownLesson } from './MarkdownLesson'
import { VideoLesson } from './VideoLesson'
import { QuizLesson } from '../quiz/QuizLesson'

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
      quiz?: {
        description?: string
        questions: any[]
        maxLives?: number
        showTimer?: boolean
        passingScore?: number
      }
    }
  }
  onQuizComplete?: (results: any) => void
}

export function LessonContent({ lesson, onQuizComplete }: LessonContentProps) {
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
      if (!lesson.content.quiz?.questions) {
        return (
          <div className="p-8 text-center text-muted-foreground">
            Error: Quiz sin preguntas configuradas
          </div>
        )
      }
      
      return (
        <QuizLesson
          title={lesson.title}
          description={lesson.content.quiz.description}
          questions={lesson.content.quiz.questions}
          maxLives={lesson.content.quiz.maxLives}
          showTimer={lesson.content.quiz.showTimer}
          passingScore={lesson.content.quiz.passingScore}
          onComplete={onQuizComplete}
        />
      )
    
    default:
      return null
  }
}
