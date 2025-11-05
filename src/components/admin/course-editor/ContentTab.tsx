/**
 * ContentTab Component
 * Tab para editar contenido de lecciones (texto, video, quiz)
 * Incluye RichTextEditor y QuizBuilder
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CourseWithStructure,
  CourseModule,
  CourseLesson,
} from '@/services/course-management-service'
import RichTextEditor from './RichTextEditor'
import QuizBuilder, { Quiz } from './QuizBuilder'
import {
  PlayCircle,
  FileText,
  HelpCircle,
  Code,
  Target,
  Eye,
  Save,
  AlertCircle,
} from 'lucide-react'

interface ContentTabProps {
  course: Partial<CourseWithStructure>
  onChange: (updates: Partial<CourseWithStructure>) => void
}

const LESSON_TYPE_ICONS = {
  video: PlayCircle,
  text: FileText,
  quiz: HelpCircle,
  interactive: Code,
  exercise: Target,
}

const LESSON_TYPE_LABELS = {
  video: 'Video Lesson',
  text: 'Reading/Article',
  quiz: 'Quiz',
  interactive: 'Interactive Exercise',
  exercise: 'Practice Exercise',
}

export function ContentTab({ course, onChange }: ContentTabProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [contentMode, setContentMode] = useState<'edit' | 'preview'>('edit')
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  const modules = course.modules || []
  const selectedModule = modules.find((m) => m.id === selectedModuleId)
  const selectedLesson = selectedModule?.lessons?.find((l) => l.id === selectedLessonId)

  // Auto-select first module and lesson on load
  useEffect(() => {
    if (modules.length > 0 && !selectedModuleId) {
      const firstModule = modules[0]
      setSelectedModuleId(firstModule.id)
      if (firstModule.lessons && firstModule.lessons.length > 0) {
        setSelectedLessonId(firstModule.lessons[0].id)
      }
    }
  }, [modules, selectedModuleId])

  const updateLesson = (lessonId: string, updates: Partial<CourseLesson>) => {
    if (!course.modules) return

    const updatedModules = course.modules.map((module) => ({
      ...module,
      lessons: module.lessons?.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, ...updates } : lesson
      ),
    }))

    onChange({ modules: updatedModules })
    setUnsavedChanges(true)
  }

  const handleSaveContent = () => {
    // In a real app, this would save to backend
    setUnsavedChanges(false)
    alert('Content saved successfully!')
  }

  // Parse quiz content
  const getQuizContent = (lesson: CourseLesson): Quiz => {
    if (lesson.type === 'quiz' && lesson.content) {
      try {
        return typeof lesson.content === 'string'
          ? JSON.parse(lesson.content)
          : lesson.content
      } catch {
        return {
          questions: [],
          passingScore: 70,
          showExplanations: true,
          shuffleQuestions: false,
          shuffleOptions: false,
        }
      }
    }
    return {
      questions: [],
      passingScore: 70,
      showExplanations: true,
      shuffleQuestions: false,
      shuffleOptions: false,
    }
  }

  const setQuizContent = (quiz: Quiz) => {
    if (selectedLessonId) {
      updateLesson(selectedLessonId, {
        content: quiz,
      })
    }
  }

  // Get text content
  const getTextContent = (lesson: CourseLesson): string => {
    if (lesson.type === 'text' && lesson.content) {
      return typeof lesson.content === 'string' ? lesson.content : ''
    }
    return ''
  }

  const setTextContent = (content: string) => {
    if (selectedLessonId) {
      updateLesson(selectedLessonId, { content })
    }
  }

  if (!course.modules || course.modules.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Course Structure</h3>
        <p className="text-muted-foreground mb-4">
          Please create modules and lessons in the Structure tab first.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Lesson Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Lesson to Edit</CardTitle>
          <CardDescription>Choose a module and lesson to edit its content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Module Selector */}
            <div>
              <Label htmlFor="module-select">Module</Label>
              <Select value={selectedModuleId || ''} onValueChange={setSelectedModuleId}>
                <SelectTrigger id="module-select">
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module, idx) => (
                    <SelectItem key={module.id} value={module.id}>
                      Module {idx + 1}: {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lesson Selector */}
            <div>
              <Label htmlFor="lesson-select">Lesson</Label>
              <Select
                value={selectedLessonId || ''}
                onValueChange={setSelectedLessonId}
                disabled={!selectedModuleId || !selectedModule?.lessons?.length}
              >
                <SelectTrigger id="lesson-select">
                  <SelectValue placeholder="Select a lesson" />
                </SelectTrigger>
                <SelectContent>
                  {selectedModule?.lessons?.map((lesson, idx) => {
                    const Icon = LESSON_TYPE_ICONS[lesson.type]
                    return (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          Lesson {idx + 1}: {lesson.title}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedLesson && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Badge variant="outline">{LESSON_TYPE_LABELS[selectedLesson.type]}</Badge>
              {selectedLesson.isOptional && <Badge variant="secondary">Optional</Badge>}
              {unsavedChanges && (
                <Badge variant="destructive" className="ml-auto">
                  Unsaved Changes
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Editor */}
      {selectedLesson ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Content: {selectedLesson.title}</CardTitle>
                <CardDescription>
                  {LESSON_TYPE_LABELS[selectedLesson.type]}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContentMode(contentMode === 'edit' ? 'preview' : 'edit')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {contentMode === 'edit' ? 'Preview' : 'Edit'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveContent}
                  disabled={!unsavedChanges}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Content
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Video Lesson */}
            {selectedLesson.type === 'video' && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Video lessons support embedded videos from YouTube, Vimeo, or direct URLs.
                  </AlertDescription>
                </Alert>
                <div>
                  <Label htmlFor="video-url">Video URL</Label>
                  <Input
                    id="video-url"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={(selectedLesson.content as string) || ''}
                    onChange={(e) => updateLesson(selectedLesson.id, { content: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Supported: YouTube, Vimeo, MP4, WebM
                  </p>
                </div>
                {selectedLesson.content && (
                  <div className="bg-muted rounded-lg aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <PlayCircle className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">Video Preview Placeholder</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedLesson.content as string}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Text/Article Lesson */}
            {selectedLesson.type === 'text' && (
              <Tabs value={contentMode} onValueChange={(v) => setContentMode(v as 'edit' | 'preview')}>
                <TabsList>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="mt-4">
                  <RichTextEditor
                    content={getTextContent(selectedLesson)}
                    onChange={setTextContent}
                    placeholder="Write your lesson content here..."
                    minHeight="400px"
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-4">
                  <div className="border rounded-lg p-6 min-h-[400px] bg-background">
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: getTextContent(selectedLesson) || '<p class="text-muted-foreground">No content yet</p>' }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Quiz Lesson */}
            {selectedLesson.type === 'quiz' && (
              <QuizBuilder
                quiz={getQuizContent(selectedLesson)}
                onChange={setQuizContent}
              />
            )}

            {/* Interactive/Exercise Lesson */}
            {(selectedLesson.type === 'interactive' || selectedLesson.type === 'exercise') && (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    {selectedLesson.type === 'interactive'
                      ? 'Interactive exercises support embedded code editors, sandboxes, and interactive widgets.'
                      : 'Practice exercises include instructions, starter code, and expected outputs.'}
                  </AlertDescription>
                </Alert>
                <div>
                  <Label htmlFor="exercise-instructions">Instructions</Label>
                  <Textarea
                    id="exercise-instructions"
                    placeholder="Describe what students should do in this exercise..."
                    rows={4}
                    value={(selectedLesson.content as any)?.instructions || ''}
                    onChange={(e) =>
                      updateLesson(selectedLesson.id, {
                        content: {
                          ...(typeof selectedLesson.content === 'object' ? selectedLesson.content : {}),
                          instructions: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="starter-code">Starter Code (Optional)</Label>
                  <Textarea
                    id="starter-code"
                    placeholder="// Starter code for students"
                    rows={8}
                    className="font-mono text-sm"
                    value={(selectedLesson.content as any)?.starterCode || ''}
                    onChange={(e) =>
                      updateLesson(selectedLesson.id, {
                        content: {
                          ...(typeof selectedLesson.content === 'object' ? selectedLesson.content : {}),
                          starterCode: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="solution">Solution (Hidden from students)</Label>
                  <Textarea
                    id="solution"
                    placeholder="// Expected solution"
                    rows={8}
                    className="font-mono text-sm"
                    value={(selectedLesson.content as any)?.solution || ''}
                    onChange={(e) =>
                      updateLesson(selectedLesson.id, {
                        content: {
                          ...(typeof selectedLesson.content === 'object' ? selectedLesson.content : {}),
                          solution: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Select a module and lesson to start editing content
          </p>
        </div>
      )}
    </div>
  )
}
