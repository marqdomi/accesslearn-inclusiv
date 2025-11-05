/**
 * CoursePreview Component
 * Vista previa del curso como lo vería un estudiante
 * Modal completo con navegación por módulos y lecciones
 */

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  ChevronRight,
  ChevronLeft,
  X,
  BookOpen,
  Clock,
  Award,
  Target,
  AlertCircle,
  PlayCircle,
  FileText,
  HelpCircle,
  Code,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import {
  CourseWithStructure,
  CourseLesson,
  CourseManagementService,
} from '@/services/course-management-service'

interface CoursePreviewProps {
  courseId: string | null
  isOpen: boolean
  onClose: () => void
}

// Iconos por tipo de lección
const LESSON_TYPE_ICONS = {
  video: PlayCircle,
  text: FileText,
  quiz: HelpCircle,
  interactive: Code,
  exercise: Target,
}

const LESSON_TYPE_LABELS = {
  video: 'Video',
  text: 'Reading',
  quiz: 'Quiz',
  interactive: 'Interactive',
  exercise: 'Exercise',
}

export default function CoursePreview({ courseId, isOpen, onClose }: CoursePreviewProps) {
  const [course, setCourse] = useState<CourseWithStructure | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'overview' | 'lesson'>('overview')

  // Cargar datos del curso
  useEffect(() => {
    if (courseId && isOpen) {
      loadCourse()
    }
  }, [courseId, isOpen])

  const loadCourse = async () => {
    if (!courseId) return
    
    setLoading(true)
    try {
      const data = await CourseManagementService.getCourseWithStructure(courseId)
      setCourse(data)
      setCurrentModuleIndex(0)
      setCurrentLessonIndex(0)
      setViewMode('overview')
    } catch (error) {
      console.error('Failed to load course for preview:', error)
      alert('Failed to load course preview')
    } finally {
      setLoading(false)
    }
  }

  const currentModule = course?.modules[currentModuleIndex]
  const currentLesson = currentModule?.lessons?.[currentLessonIndex]
  const totalLessons = course?.modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0

  // Navegación
  const goToNextLesson = () => {
    if (!course || !currentModule) return

    const lessonsInModule = currentModule.lessons?.length || 0
    
    if (currentLessonIndex < lessonsInModule - 1) {
      // Siguiente lección en el mismo módulo
      setCurrentLessonIndex(currentLessonIndex + 1)
    } else if (currentModuleIndex < course.modules.length - 1) {
      // Primera lección del siguiente módulo
      setCurrentModuleIndex(currentModuleIndex + 1)
      setCurrentLessonIndex(0)
    }
  }

  const goToPreviousLesson = () => {
    if (!course) return

    if (currentLessonIndex > 0) {
      // Lección anterior en el mismo módulo
      setCurrentLessonIndex(currentLessonIndex - 1)
    } else if (currentModuleIndex > 0) {
      // Última lección del módulo anterior
      const prevModule = course.modules[currentModuleIndex - 1]
      setCurrentModuleIndex(currentModuleIndex - 1)
      setCurrentLessonIndex((prevModule.lessons?.length || 1) - 1)
    }
  }

  const canGoNext = () => {
    if (!course || !currentModule) return false
    const lessonsInModule = currentModule.lessons?.length || 0
    return currentLessonIndex < lessonsInModule - 1 || currentModuleIndex < course.modules.length - 1
  }

  const canGoPrevious = () => {
    return currentModuleIndex > 0 || currentLessonIndex > 0
  }

  const startCourse = (moduleIndex: number, lessonIndex: number) => {
    setCurrentModuleIndex(moduleIndex)
    setCurrentLessonIndex(lessonIndex)
    setViewMode('lesson')
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading course preview...</p>
            </div>
          </div>
        ) : course ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b bg-background px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <DialogTitle className="text-2xl font-bold">{course.title}</DialogTitle>
                    <Badge variant={course.status === 'published' ? 'default' : 'outline'}>
                      {course.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.modules.length} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {totalLessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.estimatedHours}h
                    </span>
                    {course.totalXP && (
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {course.totalXP} XP
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="shrink-0"
                  aria-label="Close preview"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {viewMode === 'overview' ? (
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* Course Header */}
                    {course.banner && (
                      <div className="rounded-lg overflow-hidden bg-muted h-48">
                        <img
                          src={course.banner}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Course Info */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">About This Course</h3>
                          <p className="text-muted-foreground">{course.description}</p>
                        </div>

                        {course.objectives && course.objectives.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              <Target className="w-5 h-5" />
                              Learning Objectives
                            </h3>
                            <ul className="space-y-2">
                              {course.objectives.map((obj, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                  <span className="text-muted-foreground">{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {course.prerequisites && course.prerequisites.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              <AlertCircle className="w-5 h-5" />
                              Prerequisites
                            </h3>
                            <ul className="space-y-1">
                              {course.prerequisites.map((prereq, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                                  <span className="text-primary">•</span>
                                  <span>{prereq}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Sidebar Info */}
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4 space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Difficulty</p>
                            <Badge variant="outline" className="mt-1">
                              {course.difficulty}
                            </Badge>
                          </div>
                          {course.category && (
                            <div>
                              <p className="text-sm text-muted-foreground">Category</p>
                              <p className="font-medium">{course.category}</p>
                            </div>
                          )}
                          {course.instructor && (
                            <div>
                              <p className="text-sm text-muted-foreground">Instructor</p>
                              <p className="font-medium">{course.instructor}</p>
                            </div>
                          )}
                          {course.tags && course.tags.length > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Tags</p>
                              <div className="flex flex-wrap gap-1">
                                {course.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Course Curriculum */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Course Curriculum</h3>
                      <div className="space-y-4">
                        {course.modules.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No modules in this course yet</p>
                          </div>
                        ) : (
                          course.modules.map((module, moduleIdx) => (
                            <div key={module.id} className="border rounded-lg overflow-hidden">
                              <div className="bg-muted px-4 py-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-primary">
                                        Module {moduleIdx + 1}
                                      </span>
                                    </div>
                                    <h4 className="font-semibold">{module.title}</h4>
                                    {module.description && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {module.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {module.lessons?.length || 0} lessons
                                  </div>
                                </div>
                              </div>

                              {module.lessons && module.lessons.length > 0 ? (
                                <div className="divide-y">
                                  {module.lessons.map((lesson, lessonIdx) => {
                                    const LessonIcon = LESSON_TYPE_ICONS[lesson.type] || FileText
                                    return (
                                      <div
                                        key={lesson.id}
                                        className="px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer group"
                                        onClick={() => startCourse(moduleIdx, lessonIdx)}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3 flex-1">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                              <LessonIcon className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium group-hover:text-primary transition-colors">
                                                  {lesson.title}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                  {LESSON_TYPE_LABELS[lesson.type]}
                                                </Badge>
                                                {lesson.isOptional && (
                                                  <Badge variant="secondary" className="text-xs">
                                                    Optional
                                                  </Badge>
                                                )}
                                              </div>
                                              {lesson.description && (
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                  {lesson.description}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            {lesson.duration && (
                                              <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {lesson.duration}m
                                              </span>
                                            )}
                                            {lesson.xpReward && (
                                              <span className="flex items-center gap-1">
                                                <Award className="w-3.5 h-3.5" />
                                                {lesson.xpReward}
                                              </span>
                                            )}
                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                                  No lessons in this module yet
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                /* Lesson View */
                <div className="h-full flex flex-col">
                  {/* Lesson Header */}
                  <div className="border-b px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('overview')}
                        className="gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Overview
                      </Button>
                      <div className="text-sm text-muted-foreground">
                        Module {currentModuleIndex + 1}, Lesson {currentLessonIndex + 1} of{' '}
                        {currentModule?.lessons?.length || 0}
                      </div>
                    </div>
                    {currentLesson && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{LESSON_TYPE_LABELS[currentLesson.type]}</Badge>
                          {currentLesson.isOptional && (
                            <Badge variant="secondary">Optional</Badge>
                          )}
                        </div>
                        <h2 className="text-xl font-bold">{currentLesson.title}</h2>
                        {currentLesson.description && (
                          <p className="text-muted-foreground mt-1">{currentLesson.description}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Lesson Content */}
                  <ScrollArea className="flex-1">
                    <div className="p-6">
                      {currentLesson ? (
                        <div className="space-y-4">
                          {/* Placeholder content based on lesson type */}
                          {currentLesson.type === 'video' && (
                            <div className="bg-muted rounded-lg aspect-video flex items-center justify-center">
                              <div className="text-center">
                                <PlayCircle className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
                                <p className="text-muted-foreground">Video Player Placeholder</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Duration: {currentLesson.duration || 0} minutes
                                </p>
                              </div>
                            </div>
                          )}

                          {currentLesson.type === 'text' && (
                            <div className="prose max-w-none">
                              <div className="bg-muted/30 border-l-4 border-primary p-4 rounded">
                                <FileText className="w-8 h-8 mb-2 text-primary" />
                                <p className="text-muted-foreground">
                                  Text content would appear here. This is a preview placeholder.
                                </p>
                              </div>
                            </div>
                          )}

                          {currentLesson.type === 'quiz' && (
                            <div className="space-y-4">
                              <div className="bg-muted/30 border-l-4 border-blue-500 p-4 rounded">
                                <HelpCircle className="w-8 h-8 mb-2 text-blue-500" />
                                <p className="font-medium mb-2">Quiz Preview</p>
                                <p className="text-sm text-muted-foreground">
                                  Interactive quiz questions would appear here
                                </p>
                              </div>
                            </div>
                          )}

                          {currentLesson.type === 'interactive' && (
                            <div className="bg-muted/30 border-l-4 border-purple-500 p-4 rounded">
                              <Code className="w-8 h-8 mb-2 text-purple-500" />
                              <p className="font-medium mb-2">Interactive Exercise</p>
                              <p className="text-sm text-muted-foreground">
                                Interactive coding exercise would appear here
                              </p>
                            </div>
                          )}

                          {currentLesson.type === 'exercise' && (
                            <div className="bg-muted/30 border-l-4 border-green-500 p-4 rounded">
                              <Target className="w-8 h-8 mb-2 text-green-500" />
                              <p className="font-medium mb-2">Practice Exercise</p>
                              <p className="text-sm text-muted-foreground">
                                Practice exercise instructions would appear here
                              </p>
                            </div>
                          )}

                          {/* Lesson Metadata */}
                          <div className="border-t pt-4 mt-6">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              {currentLesson.duration && (
                                <div>
                                  <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-sm font-medium">{currentLesson.duration}m</p>
                                  <p className="text-xs text-muted-foreground">Duration</p>
                                </div>
                              )}
                              {currentLesson.xpReward && (
                                <div>
                                  <Award className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                                  <p className="text-sm font-medium">{currentLesson.xpReward} XP</p>
                                  <p className="text-xs text-muted-foreground">Reward</p>
                                </div>
                              )}
                              <div>
                                <Badge variant={currentLesson.isOptional ? 'secondary' : 'default'}>
                                  {currentLesson.isOptional ? 'Optional' : 'Required'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-muted-foreground">Lesson not available</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Lesson Navigation */}
                  <div className="border-t px-6 py-4">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        onClick={goToPreviousLesson}
                        disabled={!canGoPrevious()}
                        className="gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous Lesson
                      </Button>
                      <Button
                        onClick={goToNextLesson}
                        disabled={!canGoNext()}
                        className="gap-2"
                      >
                        Next Lesson
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Course not found</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
