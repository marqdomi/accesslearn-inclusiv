import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PanelLeftClose, PanelRightClose } from 'lucide-react'

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
    <div className="overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-primary font-semibold">
            Misión en curso
          </p>
          <h2 className="text-2xl font-bold mt-1">{courseTitle}</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            {currentModuleTitle
              ? `Estás avanzando en "${currentModuleTitle}". Mantén el ritmo y desbloquea más XP.`
              : 'Selecciona una lección para comenzar tu experiencia.'}
          </p>
          {currentLessonTitle && (
            <div className="mt-4 text-sm font-semibold text-primary">
              Lección actual: {currentLessonTitle}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 w-full lg:max-w-xs">
          <div className="rounded-2xl border border-white/40 bg-white/80 dark:bg-white/5 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Progreso</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2 mt-2" />
          </div>
          {nextLessonTitle && (
            <div className="rounded-2xl border border-white/40 bg-white/80 dark:bg-white/5 p-4 shadow-sm">
              <p className="text-xs text-muted-foreground uppercase font-semibold">
                Próxima parada
              </p>
              <p className="text-sm font-medium mt-1">{nextLessonTitle}</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSidebar}
            className="text-xs gap-2 self-start"
          >
            {sidebarCollapsed ? (
              <>
                <PanelRightClose className="h-4 w-4" />
                Mostrar mapa
              </>
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                Ocultar mapa
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

