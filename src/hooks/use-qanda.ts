import { useState, useEffect, useCallback } from 'react'
import { ForumQuestion, ForumAnswer } from '@/lib/types'
import { ApiService } from '@/services/api.service'
import { useTenant } from '@/contexts/TenantContext'
import { useXP } from './use-xp'

export function useQandA(courseId: string, userId?: string) {
  const { currentTenant } = useTenant()
  const [questions, setQuestions] = useState<ForumQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, ForumAnswer[]>>({})
  const [loading, setLoading] = useState(true)
  const { awardXP } = useXP(userId)

  // Load questions on mount and when courseId changes
  useEffect(() => {
    if (currentTenant && courseId) {
      loadQuestions()
    }
  }, [currentTenant?.id, courseId])

  const loadQuestions = async () => {
    if (!currentTenant || !courseId) return

    try {
      setLoading(true)
      const data = await ApiService.getCourseQuestions(courseId)
      setQuestions(data)
      
      // Load answers for all questions
      const answersMap: Record<string, ForumAnswer[]> = {}
      for (const question of data) {
        const questionAnswers = await ApiService.getQuestionAnswers(question.id)
        answersMap[question.id] = questionAnswers
      }
      setAnswers(answersMap)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const postQuestion = async (
    title: string,
    content: string,
    moduleId: string,
    userName: string,
    userAvatar?: string
  ): Promise<string> => {
    if (!currentTenant || !courseId) {
      throw new Error('Tenant or course ID missing')
    }

    try {
      const question = await ApiService.createQuestion(courseId, {
        moduleId,
        title,
        content,
        userName,
        userAvatar
      })
      
      // Reload questions
      await loadQuestions()
      
      return question.id
    } catch (error) {
      console.error('Error posting question:', error)
      throw error
    }
  }

  const postAnswer = async (
    questionId: string,
    content: string,
    userName: string,
    userAvatar?: string,
    userRole?: 'employee' | 'admin' | 'mentor'
  ): Promise<string> => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      const answer = await ApiService.createAnswer(questionId, {
        content,
        userName,
        userAvatar
      })
      
      // Reload answers for this question
      const questionAnswers = await ApiService.getQuestionAnswers(questionId)
      setAnswers(prev => ({
        ...prev,
        [questionId]: questionAnswers
      }))
      
      // Reload questions to update answered status
      await loadQuestions()
      
      return answer.id
    } catch (error) {
      console.error('Error posting answer:', error)
      throw error
    }
  }

  const markAsCorrectAnswer = async (answerId: string, questionId: string) => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      await ApiService.markBestAnswer(answerId)
      
      // Reload answers for this question
      const questionAnswers = await ApiService.getQuestionAnswers(questionId)
      setAnswers(prev => ({
        ...prev,
        [questionId]: questionAnswers
      }))
      
      // Award XP to the answer author
      const answer = questionAnswers.find(a => a.id === answerId)
      if (answer && answer.userId !== userId) {
        awardXP(10, 'Answer marked as correct')
      }
    } catch (error) {
      console.error('Error marking best answer:', error)
      throw error
    }
  }

  const upvoteQuestion = async (questionId: string) => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      const updated = await ApiService.upvoteQuestion(questionId)
      
      // Update local state
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, upvotes: updated.upvotes, upvotedBy: updated.upvotedBy } : q
      ))
    } catch (error) {
      console.error('Error upvoting question:', error)
      throw error
    }
  }

  const upvoteAnswer = async (answerId: string) => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      const updated = await ApiService.upvoteAnswer(answerId)
      
      // Find which question this answer belongs to
      const questionId = Object.keys(answers).find(qId => 
        answers[qId].some(a => a.id === answerId)
      )
      
      if (questionId) {
        // Update local state
        setAnswers(prev => ({
          ...prev,
          [questionId]: prev[questionId].map(a =>
            a.id === answerId ? { ...a, upvotes: updated.upvotes, upvotedBy: updated.upvotedBy } : a
          )
        }))
      }
    } catch (error) {
      console.error('Error upvoting answer:', error)
      throw error
    }
  }

  const deleteQuestion = async (questionId: string) => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      await ApiService.deleteQuestion(questionId)
      
      // Remove from local state
      setQuestions(prev => prev.filter(q => q.id !== questionId))
      setAnswers(prev => {
        const newAnswers = { ...prev }
        delete newAnswers[questionId]
        return newAnswers
      })
    } catch (error) {
      console.error('Error deleting question:', error)
      throw error
    }
  }

  const deleteAnswer = async (answerId: string) => {
    if (!currentTenant) {
      throw new Error('Tenant missing')
    }

    try {
      await ApiService.deleteAnswer(answerId)
      
      // Remove from local state
      setAnswers(prev => {
        const newAnswers = { ...prev }
        Object.keys(newAnswers).forEach(questionId => {
          newAnswers[questionId] = newAnswers[questionId].filter(a => a.id !== answerId)
        })
        return newAnswers
      })
    } catch (error) {
      console.error('Error deleting answer:', error)
      throw error
    }
  }

  const getQuestionAnswers = useCallback((questionId: string): ForumAnswer[] => {
    return answers[questionId] || []
  }, [answers])

  return {
    questions: questions || [],
    answers: Object.values(answers).flat(),
    loading,
    postQuestion,
    postAnswer,
    markAsCorrectAnswer,
    upvoteQuestion,
    upvoteAnswer,
    deleteQuestion,
    deleteAnswer,
    getQuestionAnswers,
    refreshQuestions: loadQuestions
  }
}
