import { useState, useEffect, useCallback } from 'react'
import { QuizAttempt } from '@/lib/types'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'

export function useQuizAttempts(userId?: string) {
  const { currentTenant } = useTenant()
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(false)

  const addQuizAttempt = async (attempt: QuizAttempt) => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      const created = await ApiService.createQuizAttempt({
        courseId: attempt.courseId,
        quizId: attempt.quizId,
        score: attempt.score,
        answers: attempt.answers
      })
      
      // Add to local state
      setQuizAttempts(prev => [created, ...prev])
      
      return created
    } catch (error) {
      console.error('Error creating quiz attempt:', error)
      throw error
    }
  }

  const loadUserQuizAttempts = useCallback(async (targetUserId: string, quizId?: string) => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const data = await ApiService.getUserQuizAttempts(targetUserId, quizId)
      setQuizAttempts(data)
    } catch (error) {
      console.error('Error loading quiz attempts:', error)
    } finally {
      setLoading(false)
    }
  }, [currentTenant])

  // Auto-load if userId is provided
  useEffect(() => {
    if (userId && currentTenant) {
      loadUserQuizAttempts(userId)
    }
  }, [userId, currentTenant?.id, loadUserQuizAttempts])

  const getQuizAttemptsByUser = useCallback((targetUserId: string) => {
    return (quizAttempts || []).filter(a => a.userId === targetUserId)
  }, [quizAttempts])

  const getQuizAttemptsByCourse = useCallback((courseId: string) => {
    return (quizAttempts || []).filter(a => a.courseId === courseId)
  }, [quizAttempts])

  const getQuizAttemptsByQuizId = useCallback((quizId: string) => {
    return (quizAttempts || []).filter(a => a.quizId === quizId)
  }, [quizAttempts])

  const getBestScore = useCallback(async (quizId: string): Promise<number> => {
    if (!userId || !currentTenant) return 0

    try {
      const { bestScore } = await ApiService.getBestQuizScore(quizId)
      return bestScore
    } catch (error) {
      console.error('Error getting best score:', error)
      return 0
    }
  }, [userId, currentTenant])

  return {
    quizAttempts: quizAttempts || [],
    loading,
    addQuizAttempt,
    loadUserQuizAttempts,
    getQuizAttemptsByUser,
    getQuizAttemptsByCourse,
    getQuizAttemptsByQuizId,
    getBestScore
  }
}
