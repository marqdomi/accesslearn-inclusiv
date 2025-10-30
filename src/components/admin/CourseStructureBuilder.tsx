import { useState } from 'react'
import { Module, Lesson } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Trash, PencilSimple, DotsSixVertical, CaretUp, CaretDown } from '@phosphor-icons/react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

interface CourseStructureBuilderProps {
  modules: Module[]
  onModulesChange: (modules: Module[]) => void
  onEditLesson: (module: Module, lesson: Lesson) => void
}

export function CourseStructureBuilder({ modules, onModulesChange, onEditLesson }: CourseStructureBuilderProps) {
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [newModuleDescription, setNewModuleDescription] = useState('')

  const addModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: newModuleTitle || `Module ${modules.length + 1}`,
      description: newModuleDescription,
      lessons: [],
      order: modules.length
    }
    onModulesChange([...modules, newModule])
    setNewModuleTitle('')
    setNewModuleDescription('')
  }

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    onModulesChange(
      modules.map(m => m.id === moduleId ? { ...m, ...updates } : m)
    )
  }

  const deleteModule = (moduleId: string) => {
    onModulesChange(modules.filter(m => m.id !== moduleId))
  }

  const moveModule = (moduleId: string, direction: 'up' | 'down') => {
    const index = modules.findIndex(m => m.id === moduleId)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === modules.length - 1)
    ) return

    const newModules = [...modules]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newModules[index], newModules[swapIndex]] = [newModules[swapIndex], newModules[index]]
    
    onModulesChange(newModules.map((m, idx) => ({ ...m, order: idx })))
  }

  const addLessonToModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: `Lesson ${module.lessons.length + 1}`,
      description: '',
      blocks: [],
      totalXP: 0,
      estimatedMinutes: 5
    }

    updateModule(moduleId, {
      lessons: [...module.lessons, newLesson]
    })
  }

  const deleteLesson = (moduleId: string, lessonId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    updateModule(moduleId, {
      lessons: module.lessons.filter(l => l.id !== lessonId)
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Structure</CardTitle>
          <CardDescription>
            Build your course by adding modules and lessons. Drag to reorder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Add New Module</Label>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Module title (e.g., HTML Basics)"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Module description (optional)"
                  value={newModuleDescription}
                  onChange={(e) => setNewModuleDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <Button onClick={addModule} className="self-start">
                <Plus size={18} className="mr-2" />
                Add Module
              </Button>
            </div>
          </div>

          {modules.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No modules yet. Add your first module above.</p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {modules.map((module, moduleIndex) => (
                <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                  <div className="flex items-center gap-2 py-2">
                    <DotsSixVertical size={20} className="text-muted-foreground cursor-grab" />
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveModule(module.id, 'up')}
                        disabled={moduleIndex === 0}
                      >
                        <CaretUp size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveModule(module.id, 'down')}
                        disabled={moduleIndex === modules.length - 1}
                      >
                        <CaretDown size={16} />
                      </Button>
                    </div>
                    <AccordionTrigger className="flex-1 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="text-left">
                          <p className="font-medium">
                            Module {moduleIndex + 1}: {module.title}
                          </p>
                          {module.description && (
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary">{module.lessons.length} lessons</Badge>
                      </div>
                    </AccordionTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteModule(module.id)}
                    >
                      <Trash size={16} className="text-destructive" />
                    </Button>
                  </div>

                  <AccordionContent className="pb-4">
                    <div className="space-y-2 ml-8 mt-2">
                      {module.lessons.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">
                          No lessons in this module yet
                        </p>
                      ) : (
                        module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <DotsSixVertical size={16} className="text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  Lesson {lessonIndex + 1}: {lesson.title}
                                </p>
                                {lesson.description && (
                                  <p className="text-xs text-muted-foreground">{lesson.description}</p>
                                )}
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {lesson.blocks.length} blocks
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {lesson.totalXP} XP
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditLesson(module, lesson)}
                              >
                                <PencilSimple size={16} className="mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => deleteLesson(module.id, lesson.id)}
                              >
                                <Trash size={14} className="text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addLessonToModule(module.id)}
                        className="w-full mt-2"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Lesson to {module.title}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
