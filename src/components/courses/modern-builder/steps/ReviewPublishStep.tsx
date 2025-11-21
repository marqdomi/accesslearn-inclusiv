import { CourseStructure } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/courses'
import { FloppyDisk, PaperPlaneTilt, RocketLaunch, Eye, Construction } from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'

interface ReviewPublishStepProps {
  course: CourseStructure
  onSaveDraft: () => void
  onPublish: () => void
}

export function ReviewPublishStep({ course, onSaveDraft, onPublish }: ReviewPublishStepProps) {
  const { user } = useAuth()
  
  // Calculate totals
  const totalModules = course.modules.length
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)
  const totalBlocks = course.modules.reduce((acc, m) => 
    acc + m.lessons.reduce((acc2, l) => acc2 + l.blocks.length, 0), 0
  )
  
  // Check if user can publish directly
  const canPublishDirectly = ['content-manager', 'admin', 'super-admin'].includes(user?.role || '')
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Revisar y Publicar</h2>
        <p className="text-muted-foreground">
          Revisa el resumen de tu curso y publícalo cuando esté listo
        </p>
      </div>
      
      {/* Course Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Curso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Título</p>
              <p className="font-semibold">{course.title || 'Sin título'}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Categoría</p>
              <p className="font-semibold">{course.category || 'Sin categoría'}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Dificultad</p>
              <p className="font-semibold">{course.difficulty}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Estado Actual</p>
              <StatusBadge status={course.status || 'draft'} />
            </div>
          </div>
          
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Estadísticas</p>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{totalModules}</p>
                <p className="text-xs text-muted-foreground">Módulos</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLessons}</p>
                <p className="text-xs text-muted-foreground">Lecciones</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBlocks}</p>
                <p className="text-xs text-muted-foreground">Bloques</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{course.estimatedHours || 0}</p>
                <p className="text-xs text-muted-foreground">Horas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Validation Checklist */}
      <Alert>
        <Construction className="h-4 w-4" />
        <AlertDescription>
          Checklist de validación en construcción. Pronto verás aquí todos los requisitos para publicar.
        </AlertDescription>
      </Alert>
      
      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full"
          onClick={onSaveDraft}
        >
          <FloppyDisk className="mr-2" size={20} />
          Guardar Borrador
        </Button>
        
        {canPublishDirectly ? (
          <Button 
            size="lg" 
            className="w-full"
            onClick={onPublish}
          >
            <RocketLaunch className="mr-2" size={20} />
            Publicar Curso Inmediatamente
          </Button>
        ) : (
          <Button 
            size="lg" 
            className="w-full"
            onClick={onPublish}
          >
            <PaperPlaneTilt className="mr-2" size={20} />
            Enviar para Revisión
          </Button>
        )}
        
        <Button variant="ghost" size="lg" className="w-full">
          <Eye className="mr-2" size={20} />
          Vista Previa del Curso
        </Button>
      </div>
    </div>
  )
}
