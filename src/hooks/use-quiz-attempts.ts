import { useKV } from '@github/spark/hooks'
import { QuizAttempt } from '@/lib/types'

export function useQuizAttempts() {
  const [quizAttempts, setQuizAttempts] = useKV<QuizAttempt[]>('quiz-attempts', [])

  const addQuizAttempt = async (attempt: QuizAttempt) => {
    setQuizAttempts((current) => [...(current || []), attempt])
  }

  const getQuizAttemptsByUser = (userId: string) => {
    return (quizAttempts || []).filter(a => a.userId === userId)
  }

  const getQuizAttemptsByCourse = (courseId: string) => {
    return (quizAttempts || []).filter(a => a.courseId === courseId)
  }

  const getQuizAttemptsByQuizId = (quizId: string) => {
    return (quizAttempts || []).filter(a => a.quizId === quizId)
  }

  return {
    quizAttempts: quizAttempts || [],
    addQuizAttempt,
    getQuizAttemptsByUser,
    getQuizAttemptsByCourse,
    getQuizAttemptsByQuizId
  }
}
