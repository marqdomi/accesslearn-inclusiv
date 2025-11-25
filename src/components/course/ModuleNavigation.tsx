import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, PlayCircle, FileText, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Lesson {
  id: string
  title: string
  type: 'markdown' | 'video' | 'quiz'
  isCompleted?: boolean
  duration?: number
}

interface Module {
  id: string
  title: string
  lessons: Lesson[]
  isCompleted?: boolean
}

interface ModuleNavigationProps {
  modules: Module[]
  currentLessonId: string
  onLessonSelect: (moduleId: string, lessonId: string) => void
}

export function ModuleNavigation({
  modules,
  currentLessonId,
  onLessonSelect,
}: ModuleNavigationProps) {
  const getLessonIcon = (type: Lesson['type'], isCompleted?: boolean) => {
    if (isCompleted) {
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
    }

    switch (type) {
      case 'video':
        return <PlayCircle className="h-3.5 w-3.5 text-muted-foreground" />
      case 'quiz':
        return <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
      case 'markdown':
      default:
        return <FileText className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  return (
    <Card className="p-3 sticky top-4">
      <div className="space-y-4">
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Contenido del curso
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">{modules.length} módulos</p>
        </div>

        <div className="space-y-3">
          {modules.map((module, moduleIndex) => {
            const completedLessons = module.lessons.filter(l => l.isCompleted).length
            const totalLessons = module.lessons.length
            const progress = Math.round((completedLessons / totalLessons) * 100)

            return (
              <div key={module.id} className="space-y-1.5">
                {/* Module Header */}
                <div className="flex items-start gap-1.5">
                  <div className="flex-shrink-0 mt-0.5">
                    {module.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-xs leading-tight">
                      <span className="text-[10px] text-muted-foreground">
                        M{moduleIndex + 1}
                      </span>{' '}
                      {module.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {completedLessons}/{totalLessons}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lessons List */}
                <div className="ml-5 space-y-0.5">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <button
                      key={lesson.id}
                      onClick={() => onLessonSelect(module.id, lesson.id)}
                      className={cn(
                        'w-full text-left px-2 py-1.5 rounded-md transition-colors',
                        'hover:bg-muted/50 group',
                        currentLessonId === lesson.id && 'bg-primary/10 border-l-2 border-primary'
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {getLessonIcon(lesson.type, lesson.isCompleted)}
                        <span
                          className={cn(
                            'text-xs flex-1 leading-tight',
                            currentLessonId === lesson.id && 'font-medium text-primary',
                            lesson.isCompleted && 'text-muted-foreground'
                          )}
                        >
                          {lessonIndex + 1}. {lesson.title}
                        </span>
                        {lesson.duration && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {lesson.duration}min
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
