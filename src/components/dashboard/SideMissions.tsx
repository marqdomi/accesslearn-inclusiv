import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Course, UserProgress } from '@/lib/types'
import { BookOpen, Clock, Lightning, CheckCircle } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SideMissionsProps {
  courses: Course[]
  progress: Record<string, UserProgress>
  onSelectCourse: (course: Course) => void
  excludeCourseId?: string
}

export function SideMissions({ courses, progress, onSelectCourse, excludeCourseId }: SideMissionsProps) {
  const availableCourses = courses.filter(course => course.id !== excludeCourseId)

  const getStatusBadge = (courseId: string) => {
    const courseProgress = progress[courseId]
    if (!courseProgress) {
      return <Badge variant="outline" className="gap-1.5 font-semibold">🆕 Not Started</Badge>
    }
    if (courseProgress.status === 'completed') {
      return (
        <Badge variant="default" className="learner-badge gap-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CheckCircle size={16} weight="fill" aria-hidden="true" />
          ✨ Complete
        </Badge>
      )
    }
    return <Badge variant="secondary" className="gap-1.5 font-semibold bg-yellow-100 text-yellow-800 border-yellow-300">⚡ In Progress</Badge>
  }

  const getCompletionPercent = (courseId: string, course: Course) => {
    const courseProgress = progress[courseId]
    if (!courseProgress) return 0
    return (courseProgress.completedModules.length / course.modules.length) * 100
  }

  if (availableCourses.length === 0) {
    return (
      <Card className="learner-card p-10 text-center border-2 border-dashed border-primary/30 bg-gradient-to-br from-muted/30 to-muted/10">
        <BookOpen size={56} className="mx-auto mb-3 text-primary/50" aria-hidden="true" />
        <p className="text-muted-foreground text-lg font-medium">No additional missions available</p>
      </Card>
    )
  }

  return (
    <Card className="learner-card overflow-hidden border-2 border-secondary/30">
      <div className="p-6 pb-4 border-b bg-gradient-to-r from-secondary/10 via-primary/5 to-accent/10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-secondary/70 shadow-lg">
            <BookOpen size={24} weight="fill" className="text-white" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold learner-heading">Side Missions 🎯</h3>
            <p className="text-sm font-semibold text-muted-foreground">
              {availableCourses.length} {availableCourses.length === 1 ? 'course' : 'courses'} ready to explore!
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="p-4 space-y-3">
          {availableCourses.map((course) => {
            const completionPercent = getCompletionPercent(course.id, course)
            const courseProgress = progress[course.id]

            return (
              <Card 
                key={course.id} 
                className="learner-card learner-focus p-5 hover:border-primary/70 hover:scale-[1.02] transition-all cursor-pointer bg-gradient-to-br from-card to-card/50"
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
                    <h4 className="font-bold text-lg truncate mb-1 text-primary">{course.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 font-medium">
                      {course.description}
                    </p>
                  </div>
                  {getStatusBadge(course.id)}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-full">
                    <Clock size={16} className="text-primary" aria-hidden="true" />
                    <span>{course.estimatedTime} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-2 py-1 rounded-full">
                    <Lightning size={16} weight="fill" className="text-green-600" aria-hidden="true" />
                    <span className="text-green-700">+50 XP</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-full">
                    <BookOpen size={16} className="text-secondary" aria-hidden="true" />
                    <span>{course.modules.length} modules</span>
                  </div>
                </div>

                {courseProgress && courseProgress.status !== 'completed' && (
                  <div className="bg-card/50 p-3 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="font-semibold flex items-center gap-1">
                        <span className="text-base">📊</span> Progress
                      </span>
                      <span className="font-bold text-primary text-base">{Math.floor(completionPercent)}%</span>
                    </div>
                    <div className="h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="learner-progress-bar h-full"
                        style={{ width: `${completionPercent}%` }}
                        aria-label={`Course progress: ${Math.floor(completionPercent)}%`}
                        role="progressbar"
                        aria-valuenow={Math.floor(completionPercent)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </div>
                )}

                {courseProgress?.status === 'completed' && (
                  <div className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border-2 border-green-500/30 text-green-700 text-base font-bold">
                    <CheckCircle size={20} weight="fill" aria-hidden="true" />
                    <span>Mission Complete! 🎉</span>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </Card>
  )
}
