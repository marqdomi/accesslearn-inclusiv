import { useState, useEffect } from 'react'
import { UserProgress } from '@/lib/types'
import { ApiService } from '@/services/api.service'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { toast } from 'sonner'

export function useCourseProgress(courseId: string, userId?: string, courseName?: string) {
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  const effectiveUserId = userId || user?.id
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)

  // Load progress from Cosmos DB
  useEffect(() => {
    if (effectiveUserId && currentTenant) {
      loadProgress()
    }
  }, [courseId, effectiveUserId, currentTenant?.id])

  const loadProgress = async () => {
    if (!effectiveUserId || !currentTenant) return

    try {
      setLoading(true)
      const progressData = await ApiService.getCourseProgress(effectiveUserId, courseId)
      
      if (progressData) {
        // Convert backend format to frontend format
        setProgress({
          courseId: progressData.courseId,
          status: progressData.status || 'not-started',
          completedModules: progressData.completedLessons || [],
          lastAccessed: new Date(progressData.lastAccessedAt).getTime(),
          assessmentAttempts: progressData.quizScores?.length || 0,
          assessmentScore: progressData.progress || 0,
        })
      } else {
        // Initialize new progress
        setProgress({
          courseId,
          status: 'not-started',
          completedModules: [],
          lastAccessed: Date.now(),
          assessmentAttempts: 0,
        })
      }
    } catch (error) {
      console.error('Error loading progress:', error)
      // Fallback to local state
      setProgress({
        courseId,
        status: 'not-started',
        completedModules: [],
        lastAccessed: Date.now(),
        assessmentAttempts: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const markModuleComplete = async (moduleId: string) => {
    if (!effectiveUserId || !currentTenant) return

    const currentProgress = progress || {
      courseId,
      status: 'not-started' as const,
      completedModules: [],
      lastAccessed: Date.now(),
      assessmentAttempts: 0,
    }

    const completedModules = [...currentProgress.completedModules]
    if (!completedModules.includes(moduleId)) {
      completedModules.push(moduleId)
    }

    // Calculate progress percentage
    const progressPercentage = Math.min(100, (completedModules.length / 10) * 100) // Assuming ~10 modules per course

    try {
      const updated = await ApiService.updateUserProgress(
        effectiveUserId,
        courseId,
        progressPercentage,
        completedModules
      )

      setProgress({
        courseId: updated.courseId,
        status: updated.status || 'in-progress',
        completedModules: updated.completedLessons || completedModules,
        lastAccessed: new Date(updated.lastAccessedAt).getTime(),
        assessmentAttempts: updated.quizScores?.length || currentProgress.assessmentAttempts,
      })
    } catch (error) {
      console.error('Error updating progress:', error)
      // Update local state as fallback
      setProgress({
        ...currentProgress,
        completedModules,
        status: 'in-progress' as const,
        lastAccessed: Date.now(),
      })
    }
  }

  const setCurrentModule = (moduleId: string) => {
    // This is just for UI state, doesn't need to be saved immediately
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

  const completeCourse = async (assessmentScore?: number) => {
    if (!effectiveUserId || !currentTenant) return

    const currentProgress = progress || {
      courseId,
      status: 'not-started' as const,
      completedModules: [],
      lastAccessed: Date.now(),
      assessmentAttempts: 0,
    }

    const isFirstCompletion = currentProgress.status !== 'completed'

    try {
      const updated = await ApiService.updateUserProgress(
        effectiveUserId,
        courseId,
        100, // 100% complete
        currentProgress.completedModules
      )

      setProgress({
        courseId: updated.courseId,
        status: 'completed' as const,
        completedModules: updated.completedLessons || currentProgress.completedModules,
        lastAccessed: new Date(updated.lastAccessedAt).getTime(),
        assessmentAttempts: updated.quizScores?.length || currentProgress.assessmentAttempts,
        assessmentScore: assessmentScore || updated.progress,
      })
    } catch (error) {
      console.error('Error completing course:', error)
      // Update local state as fallback
      setProgress({
        ...currentProgress,
        status: 'completed' as const,
        assessmentScore,
        lastAccessed: Date.now(),
      })
    }
  }

  const recordAssessmentAttempt = async (score?: number) => {
    if (!effectiveUserId || !currentTenant) return

    const currentProgress = progress || {
      courseId,
      status: 'not-started' as const,
      completedModules: [],
      lastAccessed: Date.now(),
      assessmentAttempts: 0,
    }

    const newAttempts = currentProgress.assessmentAttempts + 1

    // Update progress with quiz score
    try {
      await ApiService.updateUserProgress(
        effectiveUserId,
        courseId,
        score || currentProgress.assessmentScore || 0,
        currentProgress.completedModules
      )

      setProgress({
        ...currentProgress,
        assessmentAttempts: newAttempts,
        assessmentScore: score,
        lastAccessed: Date.now(),
      })
    } catch (error) {
      console.error('Error recording assessment attempt:', error)
      // Update local state as fallback
      setProgress({
        ...currentProgress,
        assessmentAttempts: newAttempts,
        assessmentScore: score,
      })
    }
  }

  return {
    progress: progress || {
      courseId,
      status: 'not-started' as const,
      completedModules: [],
      lastAccessed: Date.now(),
      assessmentAttempts: 0,
    },
    loading,
    markModuleComplete,
    setCurrentModule,
    completeCourse,
    recordAssessmentAttempt,
    refresh: loadProgress,
  }
}
