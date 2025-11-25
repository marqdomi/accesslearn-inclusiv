import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface LessonCell {
  id: string
  title: string
  duration?: number
  isCompleted?: boolean
  isCurrent?: boolean
  order: number
}

interface ModuleColumn {
  id: string
  title: string
  lessons: LessonCell[]
}

interface CourseHeatmapNavigatorProps {
  modules: ModuleColumn[]
  currentLessonId: string
  onLessonSelect: (moduleId: string, lessonId: string) => void
  onToggleSidebar?: () => void
  isCollapsed?: boolean
}

export function CourseHeatmapNavigator({
  modules,
  currentLessonId,
  onLessonSelect,
}: CourseHeatmapNavigatorProps) {
  const getStatus = (lesson: LessonCell) => {
    if (lesson.isCurrent) return 'current'
    if (lesson.isCompleted) return 'completed'
    if (lesson.isCompleted === false) return 'pending'
    return 'locked'
  }

  const getModuleStatus = (module: ModuleColumn) => {
    const hasCurrent = module.lessons.some((lesson) => lesson.isCurrent)
    if (hasCurrent) return 'current'
    const allCompleted = module.lessons.every((lesson) => lesson.isCompleted)
    if (allCompleted) return 'completed'
    const anyCompleted = module.lessons.some((lesson) => lesson.isCompleted)
    if (anyCompleted) return 'in-progress'
    return 'pending'
  }

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-500/90 hover:bg-emerald-500 text-white',
  current:
    'bg-primary text-white ring-2 ring-offset-2 ring-primary/30 shadow-lg shadow-primary/30',
  pending: 'bg-muted hover:bg-muted/70 text-muted-foreground',
  locked: 'bg-muted/60 text-muted-foreground cursor-not-allowed',
}

const moduleBadgeStyles: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  current: 'bg-primary/10 text-primary border border-primary/20 shadow-sm',
  'in-progress': 'bg-muted text-muted-foreground border border-transparent',
  pending: 'bg-muted text-muted-foreground border border-transparent',
}

  return (
    <TooltipProvider delayDuration={150}>
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="max-h-[65vh] overflow-y-auto pr-1">
          <div className="space-y-6 pt-2">
            {modules.map((module, moduleIndex) => (
              <div key={module.id} className="relative pl-8">
                <div className="flex flex-col items-center gap-2 relative">
                  <span className="absolute left-1/2 top-4 bottom-4 w-px bg-muted/40" />
                  <span
                    className={cn(
                      'px-3 py-1 text-[10px] font-semibold rounded-full shadow-sm',
                      moduleBadgeStyles[getModuleStatus(module)]
                    )}
                  >
                    M{moduleIndex + 1}
                  </span>
                  {module.lessons.map((lesson, lessonIndex) => {
                    const status = getStatus(lesson)
                    const disabled = status === 'locked'
                    const isLast = lessonIndex === module.lessons.length - 1

                    return (
                      <div key={lesson.id} className="flex flex-col items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={cn(
                                'h-9 w-9 rounded-full text-[11px] font-semibold flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm border border-white/30',
                                statusStyles[status],
                                status === 'current' && 'animate-pulse'
                              )}
                              disabled={disabled}
                              onClick={() => onLessonSelect(module.id, lesson.id)}
                            >
                              {lessonIndex + 1}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" align="center">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold">
                                {module.title}
                              </p>
                              <p className="text-sm font-medium">
                                {lesson.title}
                              </p>
                              <p className="text-xs font-medium text-foreground/80">
                                {lesson.duration
                                  ? `${lesson.duration} min`
                                  : 'Sin duración'}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                        {!isLast && <div className="w-[3px] h-3 bg-muted/40 rounded-full" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

