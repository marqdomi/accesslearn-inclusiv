import { useState } from 'react'
import { UserProgress } from '@/lib/types'

export function useCourseProgress(courseId: string, userId?: string, courseName?: string) {
  const [progress, setProgress] = useState<UserProgress>({
    courseId,
    status: 'not-started',
    completedModules: [],
    lastAccessed: Date.now(),
    assessmentAttempts: 0,
  })
  
  const [globalProgress, setGlobalProgress] = useState<Record<string, UserProgress>>({})

  // Simplified hooks - no achievements for now
  const updateModuleCompletion = () => {}
  const updateCourseCompletion = () => {}
  const updateAssessmentCompletion = () => {}
  const updateStreak = () => {}
  const postCourseCompleted = () => {}

  // Removed useEffect - simplified version

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
        
        if (userId && courseName) {
          postCourseCompleted(userId, courseName)
        }
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
