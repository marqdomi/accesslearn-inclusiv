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
      html?: string // Support both markdown and html fields
      videoProvider?: 'youtube' | 'vimeo' | 'tiktok' | 'url'
      videoId?: string
      videoUrl?: string
      quiz?: {
        description?: string
        questions: any[]
        maxLives?: number
        showTimer?: boolean
        timeLimit?: number
        passingScore?: number
      }
    }
  }
  onQuizComplete?: (results: any) => void
}

export function LessonContent({ lesson, onQuizComplete }: LessonContentProps) {
  switch (lesson.type) {
    case 'markdown':
      // Use MarkdownLesson to properly render markdown with embedded HTML blocks
      // (file-download-block, video embeds, images with SAS tokens, etc.)
      return <MarkdownLesson content={lesson.content.html || lesson.content.markdown || ''} />
    
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
          timeLimit={lesson.content.quiz.timeLimit}
          passingScore={lesson.content.quiz.passingScore}
          onComplete={onQuizComplete}
          examModeType={lesson.content.quiz.examModeType}
          examDuration={lesson.content.quiz.examDuration}
          examMinPassingScore={lesson.content.quiz.examMinPassingScore}
          examQuestionCount={lesson.content.quiz.examQuestionCount}
          questionBank={lesson.content.quiz.questionBank}
          useRandomSelection={lesson.content.quiz.useRandomSelection}
        />
      )
    
    default:
      return null
  }
}
