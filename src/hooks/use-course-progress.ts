import { useKV } from '@github/spark/hooks'
import { UserProgress } from '@/lib/types'
import { useAchievements } from './use-achievements'

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

  const { updateModuleCompletion, updateCourseCompletion, updateAssessmentCompletion, updateStreak } = useAchievements()

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
        updateModuleCompletion()
        updateStreak()
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
    setProgress((current) => {
      const isFirstCompletion = current?.status !== 'completed'
      if (isFirstCompletion) {
        updateCourseCompletion()
        updateStreak()
      }
      
      return {
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
      }
    })
  }

  const recordAssessmentAttempt = (score?: number) => {
    setProgress((current) => {
      const base = current || {
        courseId,
        status: 'not-started' as const,
        completedModules: [],
        lastAccessed: Date.now(),
        assessmentAttempts: 0,
      }
      
      const isFirstAttempt = base.assessmentAttempts === 0
      const newAttempts = base.assessmentAttempts + 1
      
      if (score !== undefined) {
        updateAssessmentCompletion(score, isFirstAttempt)
      }
      
      return {
        ...base,
        assessmentAttempts: newAttempts,
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
