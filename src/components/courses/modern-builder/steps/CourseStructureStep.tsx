import { CourseStructure } from '@/lib/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Construction } from '@phosphor-icons/react'

interface CourseStructureStepProps {
  course: CourseStructure
  updateCourse: (updates: Partial<CourseStructure>) => void
}

export function CourseStructureStep({ course, updateCourse }: CourseStructureStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Estructura del Curso</h2>
        <p className="text-muted-foreground">
          Organiza tu curso en módulos y lecciones
        </p>
      </div>
      
      <Alert>
        <Construction className="h-4 w-4" />
        <AlertDescription>
          Este paso está en construcción. Pronto podrás crear módulos y lecciones aquí.
        </AlertDescription>
      </Alert>
      
      {/* TODO: Module/Lesson builder will go here */}
      <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
        <p>Módulos: {course.modules.length}</p>
        <p>Lecciones: {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)}</p>
      </div>
    </div>
  )
}
