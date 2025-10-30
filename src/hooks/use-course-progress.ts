import { useKV } from '@github/spark/hooks'
import { UserProgress } from '@/lib/types'

export function useCourseProgress(courseId: string) {
  const [progress, setProgress] = useKV<UserProgress>(
    `course-progress-${courseId}`,
    {
      courseId,
      status: 'not-started',
      completedModules: [],
      lastAccessed: Date.now(),
      assessmentAttempts: 0,
    }
  )

  const markModuleComplete = (moduleId: string) => {
    setProgress((current) => {
      if (!current) return {
        courseId,
        status: 'in-progress' as const,
        completedModules: [moduleId],
        lastAccessed: Date.now(),
        assessmentAttempts: 0,
      }
      
      const completedModules = [...current.completedModules]
      if (!completedModules.includes(moduleId)) {
        completedModules.push(moduleId)
      }
      return {
        ...current,
        completedModules,
        status: 'in-progress' as const,
        lastAccessed: Date.now(),
      }
    })
  }

  const setCurrentModule = (moduleId: string) => {
    setProgress((current) => ({
      ...(current || {
        courseId,
        status: 'not-started' as const,
        completedModules: [],
        assessmentAttempts: 0,
        lastAccessed: Date.now(),
      }),
      currentModule: moduleId,
      status: 'in-progress' as const,
      lastAccessed: Date.now(),
    }))
  }

  const completeCourse = (assessmentScore?: number) => {
    setProgress((current) => ({
      ...(current || {
        courseId,
        status: 'not-started' as const,
        completedModules: [],
        assessmentAttempts: 0,
        lastAccessed: Date.now(),
      }),
      status: 'completed' as const,
      assessmentScore,
      lastAccessed: Date.now(),
    }))
  }

  const recordAssessmentAttempt = () => {
    setProgress((current) => {
      const base = current || {
        courseId,
        status: 'not-started' as const,
        completedModules: [],
        lastAccessed: Date.now(),
        assessmentAttempts: 0,
      }
      return {
        ...base,
        assessmentAttempts: base.assessmentAttempts + 1,
      }
    })
  }

  return {
    progress,
    markModuleComplete,
    setCurrentModule,
    completeCourse,
    recordAssessmentAttempt,
  }
}
