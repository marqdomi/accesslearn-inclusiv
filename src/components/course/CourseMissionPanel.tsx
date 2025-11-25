interface CourseMissionPanelProps {
  courseTitle: string
  currentModuleTitle?: string
  currentLessonTitle?: string
}

export function CourseMissionPanel({
  courseTitle,
  currentModuleTitle,
  currentLessonTitle,
}: CourseMissionPanelProps) {
  return (
    <div className="rounded-3xl border border-primary/15 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-6 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-primary font-semibold">
        Misión en curso
      </p>
      <h2 className="text-2xl font-bold mt-1">{courseTitle}</h2>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
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
  )
}
