import { useState, useEffect } from 'react'
import { Course } from '@/lib/types'
import { useCourseProgress } from '@/hooks/use-course-progress'
import { ContentViewer } from './ContentViewer'
import { AssessmentModule } from './AssessmentModule'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Check, ListBullets } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CourseViewerProps {
  course: Course
  onExit: () => void
}

export function CourseViewer({ course, onExit }: CourseViewerProps) {
  const { progress, markModuleComplete, setCurrentModule, completeCourse, recordAssessmentAttempt } = useCourseProgress(course.id)
  const [showAssessment, setShowAssessment] = useState(false)
  const [showModuleList, setShowModuleList] = useState(false)

  const currentModuleIndex = progress?.currentModule
    ? course.modules.findIndex((m) => m.id === progress.currentModule)
    : 0

  const validIndex = currentModuleIndex >= 0 ? currentModuleIndex : 0
  const currentModule = course.modules[validIndex]

  useEffect(() => {
    if (currentModule && (!progress?.currentModule || progress.currentModule !== currentModule.id)) {
      setCurrentModule(currentModule.id)
    }
  }, [currentModule, progress?.currentModule, setCurrentModule])

  const handleModuleComplete = () => {
    markModuleComplete(currentModule.id)
    toast.success('Module completed!', {
      description: `You've completed "${currentModule.title}"`,
    })

    if (validIndex < course.modules.length - 1) {
      handleNext()
    } else if (course.assessment && course.assessment.length > 0) {
      setShowAssessment(true)
    } else {
      completeCourse()
      toast.success('Course completed!', {
        description: `Congratulations on completing "${course.title}"`,
      })
    }
  }

  const handleNext = () => {
    if (validIndex < course.modules.length - 1) {
      const nextModule = course.modules[validIndex + 1]
      setCurrentModule(nextModule.id)
    }
  }

  const handlePrevious = () => {
    if (validIndex > 0) {
      const prevModule = course.modules[validIndex - 1]
      setCurrentModule(prevModule.id)
    }
  }

  const handleJumpToModule = (moduleId: string) => {
    setCurrentModule(moduleId)
    setShowModuleList(false)
  }

  const handleAssessmentComplete = (score: number) => {
    recordAssessmentAttempt(score)
    completeCourse(score)
    toast.success('Assessment completed!', {
      description: `You scored ${score}%`,
    })
  }

  const progressPercentage = progress
    ? Math.round((progress.completedModules.length / course.modules.length) * 100)
    : 0

  if (showAssessment && course.assessment) {
    return (
      <div className="mx-auto max-w-3xl">
        <Button
          onClick={() => setShowAssessment(false)}
          variant="ghost"
          className="mb-6 gap-2"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          Back to Course
        </Button>

        <AssessmentModule assessments={course.assessment} onComplete={handleAssessmentComplete} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Button onClick={onExit} variant="ghost" className="gap-2">
          <ArrowLeft size={20} aria-hidden="true" />
          Back to Courses
        </Button>

        <Button
          onClick={() => setShowModuleList(!showModuleList)}
          variant="outline"
          className="gap-2"
          aria-expanded={showModuleList}
        >
          <ListBullets size={20} aria-hidden="true" />
          Modules
        </Button>
      </div>

      <Card className="mb-6 p-6">
        <h1 className="mb-2 text-3xl font-bold">{course.title}</h1>
        <p className="mb-4 text-lg text-muted-foreground">{course.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} aria-label={`Course progress: ${progressPercentage}%`} />
        </div>
      </Card>

      {showModuleList && (
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-xl font-semibold">Course Modules</h2>
          <div className="space-y-2">
            {course.modules.map((module, index) => {
              const isCompleted = progress?.completedModules.includes(module.id)
              const isCurrent = module.id === currentModule.id

              return (
                <button
                  key={module.id}
                  onClick={() => handleJumpToModule(module.id)}
                  className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                    isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isCompleted
                        ? 'bg-success text-success-foreground'
                        : isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <Check size={16} weight="bold" aria-label="Completed" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{module.title}</p>
                    {module.duration && (
                      <p className="text-sm text-muted-foreground">{module.duration} min</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      <ContentViewer
        module={currentModule}
        onComplete={handleModuleComplete}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={validIndex < course.modules.length - 1}
        hasPrevious={validIndex > 0}
        currentIndex={validIndex}
        totalModules={course.modules.length}
      />
    </div>
  )
}
