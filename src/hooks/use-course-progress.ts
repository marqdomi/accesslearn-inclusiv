import { useState, useEffect } from 'react'
import { UserProgressService } from '@/services'
import { UserProgress } from '@/lib/types'
import { useAchievements } from './use-achievements'

export function useCourseProgress(courseId: string, userId: string = 'current-user') {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)

  const { updateModuleCompletion, updateCourseCompletion, updateAssessmentCompletion, updateStreak } = useAchievements()

  // Load initial progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true)
        const data = await UserProgressService.getByUserAndCourse(userId, courseId)
        setProgress(data || {
          id: '',
          userId,
          courseId,
          status: 'not-started',
          completedModules: [],
          lastAccessed: Date.now(),
          assessmentAttempts: 0,
        })
      } catch (error) {
        console.error('Failed to load progress:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProgress()
  }, [courseId, userId])

  const markModuleComplete = async (moduleId: string) => {
    try {
      if (!progress?.completedModules.includes(moduleId)) {
        updateModuleCompletion()
        updateStreak()
      }
      const updated = await UserProgressService.completeModule(userId, courseId, moduleId)
      setProgress(updated)
    } catch (error) {
      console.error('Failed to mark module complete:', error)
    }
  }

  const setCurrentModule = async (moduleId: string) => {
    try {
      const updated = await UserProgressService.upsert(userId, courseId, {
        currentModule: moduleId,
        status: 'in-progress',
      })
      setProgress(updated)
    } catch (error) {
      console.error('Failed to set current module:', error)
    }
  }

  const completeCourse = async (assessmentScore?: number) => {
    try {
      const isFirstCompletion = progress?.status !== 'completed'
      if (isFirstCompletion) {
        updateCourseCompletion()
        updateStreak()
      }
      
      const updated = await UserProgressService.completeCourse(userId, courseId, assessmentScore)
      setProgress(updated)
    } catch (error) {
      console.error('Failed to complete course:', error)
    }
  }

  const recordAssessmentAttempt = async (score?: number) => {
    try {
      const isFirstAttempt = progress?.assessmentAttempts === 0
      
      if (score !== undefined) {
        updateAssessmentCompletion(score, isFirstAttempt)
      }
      
      const updated = await UserProgressService.upsert(userId, courseId, {
        assessmentAttempts: (progress?.assessmentAttempts || 0) + 1,
      })
      setProgress(updated)
    } catch (error) {
      console.error('Failed to record assessment attempt:', error)
    }
  }

  return {
    progress,
    loading,
    markModuleComplete,
    setCurrentModule,
    completeCourse,
    recordAssessmentAttempt,
  }
}
