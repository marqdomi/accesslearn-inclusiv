/**
 * Hook para gestionar progreso de usuarios desde Cosmos DB
 */

import { useState, useEffect } from 'react'
import { ApiService } from '@/services/api.service'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'

export interface UserProgress {
  id?: string
  userId: string
  tenantId: string
  courseId: string
  status?: 'not-started' | 'in-progress' | 'completed'
  progress: number
  lastAccessedAt: string
  completedLessons: string[]
  quizScores: {
    quizId: string
    score: number
    attempts: number
    completedAt: string
  }[]
  certificateEarned: boolean
  certificateId?: string
  attempts?: any[]
  bestScore?: number
  totalXpEarned?: number
  currentAttempt?: number
}

export function useUserProgress(courseId?: string) {
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  const [progress, setProgress] = useState<Record<string, UserProgress>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && currentTenant) {
      loadProgress()
    }
  }, [user?.id, currentTenant?.id, courseId])

  const loadProgress = async () => {
    if (!user || !currentTenant) return

    try {
      setLoading(true)
      const allProgress = await ApiService.getUserProgress(user.id)
      
      // Convert to record by courseId
      const progressRecord: Record<string, UserProgress> = {}
      allProgress.forEach((p: UserProgress) => {
        progressRecord[p.courseId] = p
      })
      
      setProgress(progressRecord)
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCourseProgress = (courseId: string): UserProgress | null => {
    return progress[courseId] || null
  }

  const updateCourseProgress = async (
    courseId: string,
    progressValue: number,
    completedLessons?: string[]
  ) => {
    if (!user || !currentTenant) return

    try {
      const updated = await ApiService.updateUserProgress(
        user.id,
        courseId,
        progressValue,
        completedLessons
      )
      
      setProgress(prev => ({
        ...prev,
        [courseId]: updated
      }))
      
      return updated
    } catch (error) {
      console.error('Error updating progress:', error)
      throw error
    }
  }

  return {
    progress,
    loading,
    getCourseProgress,
    updateCourseProgress,
    refresh: loadProgress
  }
}

