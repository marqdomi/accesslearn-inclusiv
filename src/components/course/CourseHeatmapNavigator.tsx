import { cn } from '@/lib/utils'

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
    completed: 'bg-emerald-500/80 hover:bg-emerald-500 text-white',
    current: 'bg-primary/90 hover:bg-primary text-white ring-2 ring-offset-2 ring-primary/40',
    pending: 'bg-muted hover:bg-muted/70 text-muted-foreground',
    locked: 'bg-muted/70 text-muted-foreground cursor-not-allowed',
  }

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            Mapa de progreso
          </p>
          <p className="text-sm text-muted-foreground">
            Cada celda representa una lección. Selecciona para navegar.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LegendDot className="bg-emerald-500" /> Completado
          <LegendDot className="bg-primary" /> Actual
          <LegendDot className="bg-muted" /> Pendiente
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${modules.length}, minmax(120px, 1fr))`,
          }}
        >
          {modules.map((module) => (
            <div key={module.id} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground truncate">
                {module.title}
              </p>
              <div className="grid gap-2">
                {module.lessons.map((lesson) => {
                  const status = getStatus(lesson)
                  const disabled = status === 'locked'

                  return (
                    <button
                      key={lesson.id}
                      className={cn(
                        'rounded-lg px-3 py-2 text-left text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        statusStyles[status]
                      )}
                      disabled={disabled}
                      onClick={() => onLessonSelect(module.id, lesson.id)}
                    >
                      <span className="block truncate">{lesson.title}</span>
                      {lesson.duration && (
                        <span className="text-[10px] opacity-80">
                          {lesson.duration} min
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LegendDot({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-block h-3 w-3 rounded-sm border border-white/30', className)}
    />
  )
}

