import { CourseStructure } from '@/lib/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Construction } from '@phosphor-icons/react'

interface QuizBuilderStepProps {
  course: CourseStructure
  updateCourse: (updates: Partial<CourseStructure>) => void
}

export function QuizBuilderStep({ course, updateCourse }: QuizBuilderStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Constructor de Quizzes</h2>
        <p className="text-muted-foreground">
          Añade evaluaciones a tus lecciones
        </p>
      </div>
      
      <Alert>
        <Construction className="h-4 w-4" />
        <AlertDescription>
          Este paso está en construcción. Pronto podrás crear quizzes aquí.
        </AlertDescription>
      </Alert>
    </div>
  )
}
