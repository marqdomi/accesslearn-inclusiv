/**
 * Forum Functions
 * 
 * Manages Q&A forum posts (questions and answers) stored in Cosmos DB
 */

import { getContainer } from '../services/cosmosdb.service'
import { ulid } from 'ulid'

export interface ForumQuestion {
  id: string
  tenantId: string
  courseId: string
  moduleId: string
  userId: string
  userName: string
  userAvatar?: string
  title: string
  content: string
  timestamp: number
  upvotes: number
  upvotedBy: string[]
  answered: boolean
  createdAt: string
  updatedAt: string
}

export interface ForumAnswer {
  id: string
  tenantId: string
  questionId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: number
  upvotes: number
  upvotedBy: string[]
  isBestAnswer: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Get all questions for a course
 */
export async function getCourseQuestions(
  tenantId: string,
  courseId: string,
  moduleId?: string
): Promise<ForumQuestion[]> {
  const container = getContainer('forums')

  let query = 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.courseId = @courseId AND c.type = @type'
  const parameters: any[] = [
    { name: '@tenantId', value: tenantId },
    { name: '@courseId', value: courseId },
    { name: '@type', value: 'question' }
  ]

  if (moduleId) {
    query += ' AND c.moduleId = @moduleId'
    parameters.push({ name: '@moduleId', value: moduleId })
  }

  query += ' ORDER BY c.timestamp DESC'

  const { resources } = await container.items
    .query({ query, parameters })
    .fetchAll()

  return resources.map((r: any) => ({
    id: r.id,
    tenantId: r.tenantId,
    courseId: r.courseId,
    moduleId: r.moduleId,
    userId: r.userId,
    userName: r.userName,
    userAvatar: r.userAvatar,
    title: r.title,
    content: r.content,
    timestamp: r.timestamp,
    upvotes: r.upvotes || 0,
    upvotedBy: r.upvotedBy || [],
    answered: r.answered || false,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }))
}

/**
 * Get all answers for a question
 */
export async function getQuestionAnswers(
  tenantId: string,
  questionId: string
): Promise<ForumAnswer[]> {
  const container = getContainer('forums')

  const { resources } = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.questionId = @questionId AND c.type = @type ORDER BY c.isBestAnswer DESC, c.upvotes DESC, c.timestamp DESC',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@questionId', value: questionId },
        { name: '@type', value: 'answer' }
      ]
    })
    .fetchAll()

  return resources.map((r: any) => ({
    id: r.id,
    tenantId: r.tenantId,
    questionId: r.questionId,
    userId: r.userId,
    userName: r.userName,
    userAvatar: r.userAvatar,
    content: r.content,
    timestamp: r.timestamp,
    upvotes: r.upvotes || 0,
    upvotedBy: r.upvotedBy || [],
    isBestAnswer: r.isBestAnswer || false,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }))
}

/**
 * Create a new question
 */
export async function createQuestion(
  tenantId: string,
  courseId: string,
  moduleId: string,
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  title: string,
  content: string
): Promise<ForumQuestion> {
  const container = getContainer('forums')

  const now = new Date().toISOString()
  const question: ForumQuestion = {
    id: ulid(),
    tenantId,
    courseId,
    moduleId,
    userId,
    userName,
    userAvatar,
    title,
    content,
    timestamp: Date.now(),
    upvotes: 0,
    upvotedBy: [],
    answered: false,
    createdAt: now,
    updatedAt: now
  }

  await container.items.create({
    ...question,
    type: 'question'
  })

  return question
}

/**
 * Create a new answer
 */
export async function createAnswer(
  tenantId: string,
  questionId: string,
  userId: string,
  userName: string,
  userAvatar: string | undefined,
  content: string
): Promise<ForumAnswer> {
  const container = getContainer('forums')

  // Get question to get courseId
  const { resource: question } = await container.item(questionId, tenantId).read()
  if (!question) {
    throw new Error('Question not found')
  }

  const now = new Date().toISOString()
  const answer: ForumAnswer = {
    id: ulid(),
    tenantId,
    questionId,
    userId,
    userName,
    userAvatar,
    content,
    timestamp: Date.now(),
    upvotes: 0,
    upvotedBy: [],
    isBestAnswer: false,
    createdAt: now,
    updatedAt: now
  }

  await container.items.create({
    ...answer,
    type: 'answer',
    courseId: question.courseId
  })

  // Mark question as answered
  await container.item(questionId, tenantId).replace({
    ...question,
    answered: true,
    updatedAt: now
  })

  return answer
}

/**
 * Upvote a question
 */
export async function upvoteQuestion(
  tenantId: string,
  questionId: string,
  userId: string
): Promise<ForumQuestion> {
  const container = getContainer('forums')

  const { resource: question } = await container.item(questionId, tenantId).read()
  if (!question) {
    throw new Error('Question not found')
  }

  const upvotedBy = question.upvotedBy || []
  const hasUpvoted = upvotedBy.includes(userId)

  if (hasUpvoted) {
    // Remove upvote
    const newUpvotedBy = upvotedBy.filter((id: string) => id !== userId)
    const updated = {
      ...question,
      upvotes: Math.max(0, (question.upvotes || 0) - 1),
      upvotedBy: newUpvotedBy,
      updatedAt: new Date().toISOString()
    }
    await container.item(questionId, tenantId).replace(updated)
    return updated as ForumQuestion
  } else {
    // Add upvote
    const updated = {
      ...question,
      upvotes: (question.upvotes || 0) + 1,
      upvotedBy: [...upvotedBy, userId],
      updatedAt: new Date().toISOString()
    }
    await container.item(questionId, tenantId).replace(updated)
    return updated as ForumQuestion
  }
}

/**
 * Upvote an answer
 */
export async function upvoteAnswer(
  tenantId: string,
  answerId: string,
  userId: string
): Promise<ForumAnswer> {
  const container = getContainer('forums')

  const { resource: answer } = await container.item(answerId, tenantId).read()
  if (!answer) {
    throw new Error('Answer not found')
  }

  const upvotedBy = answer.upvotedBy || []
  const hasUpvoted = upvotedBy.includes(userId)

  if (hasUpvoted) {
    // Remove upvote
    const newUpvotedBy = upvotedBy.filter((id: string) => id !== userId)
    const updated = {
      ...answer,
      upvotes: Math.max(0, (answer.upvotes || 0) - 1),
      upvotedBy: newUpvotedBy,
      updatedAt: new Date().toISOString()
    }
    await container.item(answerId, tenantId).replace(updated)
    return updated as ForumAnswer
  } else {
    // Add upvote
    const updated = {
      ...answer,
      upvotes: (answer.upvotes || 0) + 1,
      upvotedBy: [...upvotedBy, userId],
      updatedAt: new Date().toISOString()
    }
    await container.item(answerId, tenantId).replace(updated)
    return updated as ForumAnswer
  }
}

/**
 * Mark an answer as best answer
 */
export async function markBestAnswer(
  tenantId: string,
  answerId: string,
  userId: string,
  isQuestionOwner: boolean,
  isAdmin: boolean
): Promise<ForumAnswer> {
  const container = getContainer('forums')

  if (!isQuestionOwner && !isAdmin) {
    throw new Error('Only question owner or admin can mark best answer')
  }

  const { resource: answer } = await container.item(answerId, tenantId).read()
  if (!answer) {
    throw new Error('Answer not found')
  }

  // Unmark all other answers for this question
  const { resources: allAnswers } = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.questionId = @questionId AND c.type = @type',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@questionId', value: answer.questionId },
        { name: '@type', value: 'answer' }
      ]
    })
    .fetchAll()

  for (const a of allAnswers) {
    if (a.id !== answerId && a.isBestAnswer) {
      await container.item(a.id, tenantId).replace({
        ...a,
        isBestAnswer: false,
        updatedAt: new Date().toISOString()
      })
    }
  }

  // Mark this answer as best
  const updated = {
    ...answer,
    isBestAnswer: true,
    updatedAt: new Date().toISOString()
  }
  await container.item(answerId, tenantId).replace(updated)

  return updated as ForumAnswer
}

/**
 * Delete a question
 */
export async function deleteQuestion(
  tenantId: string,
  questionId: string,
  userId: string,
  isAdmin: boolean
): Promise<void> {
  const container = getContainer('forums')

  const { resource: question } = await container.item(questionId, tenantId).read()
  if (!question) {
    throw new Error('Question not found')
  }

  if (question.userId !== userId && !isAdmin) {
    throw new Error('Only question owner or admin can delete')
  }

  // Delete all answers for this question
  const { resources: answers } = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.questionId = @questionId AND c.type = @type',
      parameters: [
        { name: '@tenantId', value: tenantId },
        { name: '@questionId', value: questionId },
        { name: '@type', value: 'answer' }
      ]
    })
    .fetchAll()

  for (const answer of answers) {
    await container.item(answer.id, tenantId).delete()
  }

  // Delete the question
  await container.item(questionId, tenantId).delete()
}

/**
 * Delete an answer
 */
export async function deleteAnswer(
  tenantId: string,
  answerId: string,
  userId: string,
  isAdmin: boolean
): Promise<void> {
  const container = getContainer('forums')

  const { resource: answer } = await container.item(answerId, tenantId).read()
  if (!answer) {
    throw new Error('Answer not found')
  }

  if (answer.userId !== userId && !isAdmin) {
    throw new Error('Only answer owner or admin can delete')
  }

  await container.item(answerId, tenantId).delete()
}

