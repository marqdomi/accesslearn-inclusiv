import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Course, UserProgress, CourseStructure } from '@/lib/types'
import { BookOpen, Clock, Lightning, CheckCircle, BookBookmark, Play, X } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslation } from '@/lib/i18n'
import { useUserLibrary } from '@/hooks/use-user-library'
import { toast } from 'sonner'

interface SideMissionsProps {
  courses: Course[]
  progress: Record<string, UserProgress>
  onSelectCourse: (course: Course) => void
  excludeCourseId?: string
  userId?: string
}

export function SideMissions({ courses, progress, onSelectCourse, excludeCourseId, userId }: SideMissionsProps) {
  const { t } = useTranslation()
  const allCourses: CourseStructure[] = []
  const { library, removeFromLibrary } = useUserLibrary(userId || 'default-user')
  const [activeTab, setActiveTab] = useState('current')
  
  const availableCourses = courses.filter(course => course.id !== excludeCourseId)

  const libraryCourses = useMemo(() => {
    if (!library || !allCourses) return []

    return library.courseIds
      .map(courseId => allCourses.find(c => c.id === courseId))
      .filter((c): c is CourseStructure => c !== undefined)
      .map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        estimatedTime: c.estimatedHours * 60,
        modules: [],
        coverImage: c.coverImage
      } as Course))
  }, [library, allCourses])

  const handleRemoveFromLibrary = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeFromLibrary(courseId)
    toast.success(t('missionLibrary.removedFromLibrary'))
  }

  const getStatusBadge = (courseId: string) => {
    const courseProgress = progress[courseId]
    if (!courseProgress) {
      return <Badge variant="outline" className="gap-1">{t('course.notStarted')}</Badge>
    }
    if (courseProgress.status === 'completed') {
      return (
        <Badge variant="default" className="gap-1 bg-success text-success-foreground">
          <CheckCircle size={14} weight="fill" aria-hidden="true" />
          {t('course.complete')}
        </Badge>
      )
    }
    return <Badge variant="secondary" className="gap-1">{t('course.inProgress')}</Badge>
  }

  const getCompletionPercent = (courseId: string, course: Course) => {
    const courseProgress = progress[courseId]
    if (!courseProgress) return 0
    return (courseProgress.completedModules.length / course.modules.length) * 100
  }

  if (availableCourses.length === 0 && libraryCourses.length === 0) {
    return (
      <Card className="p-8 text-center border-2 border-dashed border-muted">
        <BookOpen size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" aria-hidden="true" />
        <p className="text-muted-foreground">{t('dashboard.noAdditionalMissions')}</p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="p-6 pb-4 border-b bg-muted/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-secondary/70">
              <BookOpen size={20} weight="fill" className="text-white" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{t('dashboard.sideMissions')}</h3>
            </div>
          </div>

          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current" className="gap-2">
              <BookOpen size={16} />
              <span className="hidden sm:inline">{t('dashboard.currentMissions')}</span>
              <span className="sm:hidden">{t('nav.home')}</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <BookBookmark size={16} />
              <span className="hidden sm:inline">{t('dashboard.myLibrary')}</span>
              <span className="sm:hidden">{t('nav.myLibrary')}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="current" className="m-0">
          {availableCourses.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" aria-hidden="true" />
              <p className="text-muted-foreground text-sm">{t('dashboard.noAdditionalMissions')}</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="p-4 space-y-3">
                {availableCourses.map((course) => {
                  const completionPercent = getCompletionPercent(course.id, course)
                  const courseProgress = progress[course.id]

                  return (
                    <Card 
                      key={course.id} 
                      className="p-4 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
                      onClick={() => onSelectCourse(course)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onSelectCourse(course)
                        }
                      }}
                      role="button"
                      aria-label={`Select ${course.title} course. ${courseProgress?.status === 'completed' ? 'Completed' : courseProgress?.status === 'in-progress' ? `${Math.floor(completionPercent)}% complete` : 'Not started'}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base truncate mb-1">{course.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                        {getStatusBadge(course.id)}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} aria-hidden="true" />
                          <span>{course.estimatedTime} {t('dashboard.minutes')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Lightning size={14} weight="fill" className="text-xp" aria-hidden="true" />
                          <span className="text-xp font-semibold">+50 XP</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={14} aria-hidden="true" />
                          <span>{course.modules.length} {t('dashboard.modules')}</span>
                        </div>
                      </div>

                      {courseProgress && courseProgress.status !== 'completed' && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5 text-xs">
                            <span className="font-medium">{t('course.progress')}</span>
                            <span className="font-bold">{Math.floor(completionPercent)}%</span>
                          </div>
                          <Progress 
                            value={completionPercent} 
                            className="h-2 bg-muted"
                            aria-label={`Course progress: ${Math.floor(completionPercent)}%`}
                          />
                        </div>
                      )}

                      {courseProgress?.status === 'completed' && (
                        <div className="flex items-center justify-center gap-2 py-2 bg-success/10 rounded-md text-success text-sm font-semibold">
                          <CheckCircle size={16} weight="fill" aria-hidden="true" />
                          <span>{t('dashboard.missionComplete')}</span>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="library" className="m-0">
          {libraryCourses.length === 0 ? (
            <div className="p-8 text-center">
              <BookBookmark size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" aria-hidden="true" />
              <p className="text-muted-foreground text-sm mb-1">{t('myLibrary.empty')}</p>
              <p className="text-xs text-muted-foreground">{t('myLibrary.emptyDesc')}</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="p-4 space-y-3">
                {libraryCourses.map((course) => (
                  <Card 
                    key={course.id} 
                    className="p-4 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group"
                    onClick={() => onSelectCourse(course)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectCourse(course)
                      }
                    }}
                    role="button"
                    aria-label={`Select ${course.title} course from library`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base truncate mb-1">{course.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {course.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleRemoveFromLibrary(course.id, e)}
                        aria-label={t('myLibrary.removeFromLibrary')}
                      >
                        <X size={16} />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Play size={14} weight="fill" />
                      <span className="text-xs font-medium">{t('myLibrary.startMission')}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  )
}
