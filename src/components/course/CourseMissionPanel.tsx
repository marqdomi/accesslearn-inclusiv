import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LayoutSidebar, LayoutSidebarRight } from 'lucide-react'

interface CourseMissionPanelProps {
  courseTitle: string
  currentModuleTitle?: string
  currentLessonTitle?: string
  nextLessonTitle?: string
  progressPercentage: number
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export function CourseMissionPanel({
  courseTitle,
  currentModuleTitle,
  currentLessonTitle,
  nextLessonTitle,
  progressPercentage,
  sidebarCollapsed,
  onToggleSidebar,
}: CourseMissionPanelProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">
            Misión en curso
          </p>
          <h2 className="text-2xl font-bold mt-1">{courseTitle}</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            {currentModuleTitle
              ? `Estás avanzado en "${currentModuleTitle}". Mantén el ritmo y desbloquea más XP.`
              : 'Selecciona una lección para comenzar tu experiencia.'}
          </p>
          {currentLessonTitle && (
            <div className="mt-3 text-sm text-primary font-semibold">
              Lección actual: {currentLessonTitle}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 min-w-[220px]">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Progreso</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2 mt-1" />
          </div>
          {nextLessonTitle && (
            <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-primary/20 px-4 py-3 shadow-sm">
              <p className="text-xs text-muted-foreground uppercase font-semibold">
                Próxima parada
              </p>
              <p className="text-sm font-medium truncate">{nextLessonTitle}</p>
            </div>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleSidebar}
        className="absolute top-4 right-4 text-xs gap-2"
      >
        {sidebarCollapsed ? (
          <>
            <LayoutSidebarRight className="h-4 w-4" />
            Mostrar mapa
          </>
        ) : (
          <>
            <LayoutSidebar className="h-4 w-4" />
            Ocultar mapa
          </>
        )}
      </Button>
    </div>
  )
}

