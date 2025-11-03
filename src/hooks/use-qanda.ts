import { useKV } from '@github/spark/hooks'
import { ForumQuestion, ForumAnswer, UserNotification } from '@/lib/types'
import { useXP, XP_REWARDS } from './use-xp'
import { ulid as generateId } from 'ulid'

export function useQandA(courseId: string, userId?: string) {
  const userKey = userId || 'default-user'
  const [questions, setQuestions] = useKV<ForumQuestion[]>(`qanda-questions-${courseId}`, [])
  const [answers, setAnswers] = useKV<ForumAnswer[]>(`qanda-answers-${courseId}`, [])
  const [notifications, setNotifications] = useKV<UserNotification[]>(`user-notifications-${userKey}`, [])
  const [correctAnswerCount, setCorrectAnswerCount] = useKV<number>(`qanda-correct-answers-${userKey}`, 0)
  const { awardXP } = useXP(userId)

  const postQuestion = (
    title: string,
    content: string,
    moduleId: string,
    userName: string,
    userAvatar?: string
  ) => {
    const newQuestion: ForumQuestion = {
      id: generateId(),
      courseId,
      moduleId,
      userId: userKey,
      userName,
      userAvatar,
      title,
      content,
      timestamp: Date.now(),
      upvotes: 0,
      upvotedBy: [],
      answered: false,
    }

    setQuestions((current) => [newQuestion, ...(current || [])])
    return newQuestion.id
  }

  const postAnswer = (
    questionId: string,
    content: string,
    userName: string,
    userAvatar?: string,
    userRole?: 'employee' | 'admin' | 'mentor'
  ) => {
    const newAnswer: ForumAnswer = {
      id: generateId(),
      questionId,
      userId: userKey,
      userName,
      userAvatar,
      userRole,
      content,
      timestamp: Date.now(),
      upvotes: 0,
      upvotedBy: [],
      isBestAnswer: false,
    }

    setAnswers((current) => [...(current || []), newAnswer])

    const question = (questions || []).find(q => q.id === questionId)
    if (question && question.userId !== userKey) {
      const notification: UserNotification = {
        id: generateId(),
        userId: question.userId,
        type: 'forum-reply',
        title: 'New Answer',
        message: `Your question "${question.title}" has a new answer`,
        timestamp: Date.now(),
        read: false,
        actionUrl: `/course/${courseId}/qanda/${questionId}`,
        relatedId: questionId,
      }
      
      setNotifications((current) => [notification, ...(current || [])])
    }

    return newAnswer.id
  }

  const markAsCorrectAnswer = (answerId: string, questionId: string) => {
    setAnswers((current) =>
      (current || []).map(answer =>
        answer.questionId === questionId
          ? { ...answer, isBestAnswer: answer.id === answerId }
          : answer
      )
    )

    setQuestions((current) =>
      (current || []).map(q =>
        q.id === questionId ? { ...q, answered: true, bestAnswerId: answerId } : q
      )
    )

    const answer = (answers || []).find(a => a.id === answerId)
    if (answer && answer.userId !== userKey) {
      awardXP(10, 'Answer marked as correct')
      
      const notification: UserNotification = {
        id: generateId(),
        userId: answer.userId,
        type: 'achievement',
        title: 'Correct Answer!',
        message: 'Your answer was marked as correct! +10 XP',
        timestamp: Date.now(),
        read: false,
        relatedId: answerId,
      }
      
      setNotifications((current) => [notification, ...(current || [])])

      if (answer.userId === userKey) {
        setCorrectAnswerCount((current) => (current || 0) + 1)
      }
    }
  }

  const upvoteQuestion = (questionId: string) => {
    setQuestions((current) =>
      (current || []).map(q => {
        if (q.id === questionId) {
          const hasUpvoted = q.upvotedBy.includes(userKey)
          return {
            ...q,
            upvotes: hasUpvoted ? q.upvotes - 1 : q.upvotes + 1,
            upvotedBy: hasUpvoted
              ? q.upvotedBy.filter(id => id !== userKey)
              : [...q.upvotedBy, userKey],
          }
        }
        return q
      })
    )
  }

  const upvoteAnswer = (answerId: string) => {
    setAnswers((current) =>
      (current || []).map(a => {
        if (a.id === answerId) {
          const hasUpvoted = a.upvotedBy.includes(userKey)
          return {
            ...a,
            upvotes: hasUpvoted ? a.upvotes - 1 : a.upvotes + 1,
            upvotedBy: hasUpvoted
              ? a.upvotedBy.filter(id => id !== userKey)
              : [...a.upvotedBy, userKey],
          }
        }
        return a
      })
    )
  }

  const deleteQuestion = (questionId: string) => {
    setQuestions((current) => (current || []).filter(q => q.id !== questionId))
    setAnswers((current) => (current || []).filter(a => a.questionId !== questionId))
  }

  const deleteAnswer = (answerId: string) => {
    setAnswers((current) => (current || []).filter(a => a.id !== answerId))
  }

  const getQuestionAnswers = (questionId: string) => {
    return (answers || []).filter(a => a.questionId === questionId)
  }

  return {
    questions: questions || [],
    answers: answers || [],
    correctAnswerCount: correctAnswerCount || 0,
    postQuestion,
    postAnswer,
    markAsCorrectAnswer,
    upvoteQuestion,
    upvoteAnswer,
    deleteQuestion,
    deleteAnswer,
    getQuestionAnswers,
  }
}
