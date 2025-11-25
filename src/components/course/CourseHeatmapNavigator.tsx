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

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-500/90 hover:bg-emerald-500 text-white',
  current:
    'bg-primary text-white ring-2 ring-offset-2 ring-primary/30 shadow-lg shadow-primary/30',
  pending: 'bg-muted hover:bg-muted/70 text-muted-foreground',
  locked: 'bg-muted/60 text-muted-foreground cursor-not-allowed',
}

  return (
    <TooltipProvider delayDuration={150}>
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Mapa de progreso
            </p>
            <p className="text-xs text-muted-foreground">
              Celdas compactas; el texto aparece al pasar el cursor.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <LegendDot className="bg-emerald-500" /> Completado
            <LegendDot className="bg-primary" /> Actual
            <LegendDot className="bg-muted" /> Pendiente
          </div>
        </div>

        <div className="overflow-x-auto">
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${modules.length}, minmax(60px, 1fr))`,
            }}
          >
            {modules.map((module, moduleIndex) => (
              <div key={module.id} className="space-y-2">
                <p className="text-[11px] font-semibold text-muted-foreground text-center">
                  M{moduleIndex + 1}
                </p>
                <div className="flex flex-col items-center gap-2">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const status = getStatus(lesson)
                    const disabled = status === 'locked'

                    return (
                      <Tooltip key={lesson.id}>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              'h-8 w-8 rounded-md text-[11px] font-semibold flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm',
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
                            <p className="text-xs text-muted-foreground">
                              {lesson.duration
                                ? `${lesson.duration} min`
                                : 'Sin duración'}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
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

function LegendDot({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-block h-3 w-3 rounded-sm border border-white/30', className)}
    />
  )
}

