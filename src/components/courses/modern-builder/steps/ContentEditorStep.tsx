import { CourseStructure } from '@/lib/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Construction } from '@phosphor-icons/react'

interface ContentEditorStepProps {
  course: CourseStructure
  updateCourse: (updates: Partial<CourseStructure>) => void
}

export function ContentEditorStep({ course, updateCourse }: ContentEditorStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Editor de Contenido</h2>
        <p className="text-muted-foreground">
          Crea contenido rico con bloques de aprendizaje
        </p>
      </div>
      
      <Alert>
        <Construction className="h-4 w-4" />
        <AlertDescription>
          Este paso está en construcción. Pronto podrás crear bloques de contenido aquí.
        </AlertDescription>
      </Alert>
    </div>
  )
}
