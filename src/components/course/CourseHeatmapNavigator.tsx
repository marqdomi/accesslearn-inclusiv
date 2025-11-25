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
  completed: 'bg-emerald-500/90 hover:bg-emerald-500 text-white border-emerald-600',
  current:
    'bg-primary text-white border-primary ring-2 ring-offset-2 ring-primary/30 shadow-lg shadow-primary/30',
  pending: 'bg-muted hover:bg-muted/70 text-muted-foreground border-muted-foreground/30',
  locked: 'bg-muted/60 text-muted-foreground cursor-not-allowed border-muted-foreground/20',
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
            {modules.map((module, moduleIndex) => {
              const isLastModule = moduleIndex === modules.length - 1
              const lastLessonIndex = module.lessons.length - 1
              
              return (
                <div key={module.id} className="relative pl-8">
                  <div className="flex flex-col items-center relative">
                    {/* Línea vertical continua - se extiende desde el badge del módulo hasta el último botón */}
                    {module.lessons.length > 0 && (
                      <div 
                        className="absolute left-1/2 top-[18px] w-[2px] bg-muted/40 -translate-x-1/2 z-0"
                        style={{ 
                          height: `${module.lessons.length * 40 + (module.lessons.length - 1) * 8 + 3}px`
                        }}
                      />
                    )}
                    
                    {/* Badge del módulo */}
                    <div className="relative z-10">
                      <span
                        className={cn(
                          'px-3 py-1 text-[10px] font-semibold rounded-full shadow-sm block relative',
                          moduleBadgeStyles[getModuleStatus(module)]
                        )}
                      >
                        M{moduleIndex + 1}
                      </span>
                    </div>
                    
                    {/* Lecciones con conectores integrados */}
                    {module.lessons.map((lesson, lessonIndex) => {
                      const status = getStatus(lesson)
                      const disabled = status === 'locked'
                      const isLast = lessonIndex === lastLessonIndex

                      return (
                        <div key={lesson.id} className="flex flex-col items-center relative">
                          {/* Conector superior que se extiende hasta el borde del botón */}
                          {lessonIndex === 0 ? (
                            <div className="w-[2px] h-3 bg-muted/40" />
                          ) : (
                            <div className="w-[2px] h-4 bg-muted/40" />
                          )}
                          
                          {/* Botón de lección */}
                          <div className="relative z-10">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className={cn(
                                    'h-9 w-9 rounded-full text-[11px] font-semibold flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm border-2 relative',
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
                          </div>
                          
                          {/* Conector inferior hacia la siguiente lección */}
                          {!isLast && (
                            <div className="w-[2px] h-4 bg-muted/40" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

