import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  PencilSimple, 
  Trash, 
  Copy, 
  Article,
  ListChecks,
  Video,
  CaretUp,
  CaretDown,
  Info
} from '@phosphor-icons/react'
import { CourseModule } from '@/services/course-management-service'

interface StructureTabProps {
  modules: CourseModule[]
  onAddModule: () => void
  onEditModule: (moduleId: string) => void
  onDeleteModule: (moduleId: string) => void
  onDuplicateModule: (moduleId: string) => void
  onMoveModule: (moduleId: string, direction: 'up' | 'down') => void
  onAddLesson: (moduleId: string) => void
  onEditLesson: (moduleId: string, lessonId: string) => void
  onDeleteLesson: (moduleId: string, lessonId: string) => void
  onMoveLesson: (moduleId: string, lessonId: string, direction: 'up' | 'down') => void
}

export function StructureTab({
  modules,
  onAddModule,
  onEditModule,
  onDeleteModule,
  onDuplicateModule,
  onMoveModule,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onMoveLesson,
}: StructureTabProps) {
  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={16} />
      case 'quiz':
        return <ListChecks size={16} />
      default:
        return <Article size={16} />
    }
  }

  const getLessonTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      video: 'default',
      quiz: 'secondary',
      text: 'outline',
      interactive: 'outline',
      exercise: 'outline',
    }
    return variants[type] || 'outline'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Course Structure</h3>
          <p className="text-sm text-muted-foreground">
            Organize your course into modules and lessons
          </p>
        </div>
        <Button onClick={onAddModule}>
          <Plus className="mr-2" size={16} />
          Add Module
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Modules group related lessons together. Each module should focus on a specific topic or skill.
          Use the arrows to reorder modules and lessons.
        </AlertDescription>
      </Alert>

      {/* Empty State */}
      {modules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Article size={48} className="text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No modules yet</p>
            <Button onClick={onAddModule}>
              <Plus className="mr-2" size={16} />
              Create Your First Module
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Modules List */
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => (
            <Card key={module.id} className="border-2">
              <CardHeader className="bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">Module {moduleIndex + 1}</Badge>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                    {module.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {/* Move Module Up/Down */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onMoveModule(module.id, 'up')}
                      disabled={moduleIndex === 0}
                      title="Move module up"
                      aria-label="Move module up"
                    >
                      <CaretUp size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onMoveModule(module.id, 'down')}
                      disabled={moduleIndex === modules.length - 1}
                      title="Move module down"
                      aria-label="Move module down"
                    >
                      <CaretDown size={16} />
                    </Button>
                    {/* Edit Module */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditModule(module.id)}
                      title="Edit module"
                      aria-label="Edit module"
                    >
                      <PencilSimple size={16} />
                    </Button>
                    {/* Duplicate Module */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDuplicateModule(module.id)}
                      title="Duplicate module"
                      aria-label="Duplicate module"
                    >
                      <Copy size={16} />
                    </Button>
                    {/* Delete Module */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteModule(module.id)}
                      title="Delete module"
                      aria-label="Delete module"
                    >
                      <Trash size={16} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                {/* Lessons List */}
                {module.lessons && module.lessons.length > 0 ? (
                  <div className="space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        {/* Lesson Icon */}
                        <div className="shrink-0 text-muted-foreground">
                          {getLessonIcon(lesson.type)}
                        </div>
                        
                        {/* Lesson Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{lesson.title}</span>
                            <Badge variant={getLessonTypeBadge(lesson.type) as any} className="text-xs">
                              {lesson.type}
                            </Badge>
                            {lesson.isOptional && (
                              <Badge variant="outline" className="text-xs">
                                Optional
                              </Badge>
                            )}
                          </div>
                          {lesson.description && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {lesson.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {lesson.duration && <span>{lesson.duration} min</span>}
                            {lesson.xpReward && <span>{lesson.xpReward} XP</span>}
                          </div>
                        </div>

                        {/* Lesson Actions */}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onMoveLesson(module.id, lesson.id, 'up')}
                            disabled={lessonIndex === 0}
                            title="Move lesson up"
                            aria-label="Move lesson up"
                          >
                            <CaretUp size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onMoveLesson(module.id, lesson.id, 'down')}
                            disabled={lessonIndex === (module.lessons?.length || 0) - 1}
                            title="Move lesson down"
                            aria-label="Move lesson down"
                          >
                            <CaretDown size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEditLesson(module.id, lesson.id)}
                            title="Edit lesson"
                            aria-label="Edit lesson"
                          >
                            <PencilSimple size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteLesson(module.id, lesson.id)}
                            title="Delete lesson"
                            aria-label="Delete lesson"
                          >
                            <Trash size={14} className="text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm mb-3">No lessons in this module yet</p>
                  </div>
                )}

                {/* Add Lesson Button */}
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => onAddLesson(module.id)}
                >
                  <Plus className="mr-2" size={14} />
                  Add Lesson to This Module
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {modules.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Course Summary:</span>
              <div className="flex gap-4">
                <span>
                  <strong>{modules.length}</strong> Module{modules.length !== 1 ? 's' : ''}
                </span>
                <span>
                  <strong>
                    {modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)}
                  </strong> Lesson{modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) !== 1 ? 's' : ''}
                </span>
                <span>
                  <strong>
                    {modules.reduce((sum, m) => 
                      sum + (m.lessons?.reduce((lSum, l) => lSum + (l.xpReward || 0), 0) || 0), 0
                    )}
                  </strong> Total XP
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
