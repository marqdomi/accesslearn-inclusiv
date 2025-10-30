import { QuizQuestion, Assessment } from './types'

export interface FeedbackConfig {
  tone: 'encouraging' | 'neutral' | 'celebratory'
  includeHints: boolean
  showProgress: boolean
}

export interface AdaptiveFeedback {
  message: string
  emoji: string
  tone: 'success' | 'info' | 'warning' | 'error'
  remediation?: RemediationSuggestion
}

export interface RemediationSuggestion {
  type: 'video-segment' | 'text-section' | 'interactive-challenge' | 'full-module'
  title: string
  description: string
  resourceId: string
  estimatedMinutes: number
  startTime?: number
  endTime?: number
}

export interface FailureAnalysis {
  failedQuestions: number[]
  missedConcepts: string[]
  suggestedRemediation: RemediationSuggestion[]
  encouragement: string
}

export function generateConstructiveFeedback(
  score: number,
  totalQuestions: number,
  isFirstAttempt: boolean,
  attemptsRemaining: number
): AdaptiveFeedback {
  const percentage = (score / totalQuestions) * 100
  
  if (percentage === 100) {
    return {
      message: isFirstAttempt 
        ? "Perfect! You aced it on your first try! Outstanding work!" 
        : "Perfect score! All your hard work paid off!",
      emoji: "🎉",
      tone: 'success',
    }
  }
  
  if (percentage >= 90) {
    return {
      message: "Excellent work! You've mastered this material!",
      emoji: "🌟",
      tone: 'success',
    }
  }
  
  if (percentage >= 70) {
    return {
      message: "Great job! You passed! Keep up the good work!",
      emoji: "✅",
      tone: 'success',
    }
  }
  
  if (percentage >= 50) {
    return {
      message: `Mission incomplete, but you're close! You got ${score} out of ${totalQuestions} right. ${attemptsRemaining > 0 ? `You have ${attemptsRemaining} more ${attemptsRemaining === 1 ? 'attempt' : 'attempts'}. Let's review and try again!` : 'Review the material and come back stronger!'}`,
      emoji: "💪",
      tone: 'warning',
    }
  }
  
  return {
    message: `Mission incomplete, but don't worry! You only missed ${totalQuestions - score} ${totalQuestions - score === 1 ? 'question' : 'questions'}. ${attemptsRemaining > 0 ? `You have ${attemptsRemaining} more ${attemptsRemaining === 1 ? 'try' : 'tries'}!` : ''} Let me help you focus on what matters most.`,
    emoji: "🎯",
    tone: 'info',
  }
}

export function analyzeFailure(
  questions: QuizQuestion[],
  userAnswers: (number | number[])[],
  failedIndices: number[]
): FailureAnalysis {
  const missedConcepts: string[] = []
  const suggestedRemediation: RemediationSuggestion[] = []
  
  const conceptMap: { [key: string]: number } = {}
  
  failedIndices.forEach((index) => {
    const question = questions[index]
    if (question) {
      const concept = extractConceptFromQuestion(question.question)
      conceptMap[concept] = (conceptMap[concept] || 0) + 1
    }
  })
  
  const sortedConcepts = Object.entries(conceptMap)
    .sort((a, b) => b[1] - a[1])
    .map(([concept]) => concept)
  
  missedConcepts.push(...sortedConcepts)
  
  sortedConcepts.forEach((concept, index) => {
    suggestedRemediation.push({
      type: index === 0 ? 'video-segment' : 'text-section',
      title: `Review: ${concept}`,
      description: `Quick refresher on ${concept.toLowerCase()} to help you master this concept`,
      resourceId: `concept-${concept.toLowerCase().replace(/\s+/g, '-')}`,
      estimatedMinutes: 3,
      startTime: 0,
      endTime: 180,
    })
  })
  
  const encouragementMessages = [
    "You're so close! These are just small gaps in understanding.",
    "Great effort! Let's focus on these specific areas and you'll ace it next time!",
    "Almost there! A quick review of these concepts and you'll be unstoppable!",
    "Nice try! Everyone learns at their own pace - let's strengthen these areas together!",
    "You've got this! These are common tricky spots - let's master them!",
  ]
  
  const encouragement = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]
  
  return {
    failedQuestions: failedIndices,
    missedConcepts,
    suggestedRemediation,
    encouragement,
  }
}

function extractConceptFromQuestion(question: string): string {
  const keywords = [
    'accessibility',
    'contrast',
    'screen reader',
    'keyboard navigation',
    'ARIA',
    'semantic HTML',
    'focus management',
    'color blindness',
    'captions',
    'alternative text',
  ]
  
  const lowerQuestion = question.toLowerCase()
  
  for (const keyword of keywords) {
    if (lowerQuestion.includes(keyword.toLowerCase())) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1)
    }
  }
  
  const firstSentence = question.split(/[.?!]/)[0]
  const words = firstSentence.split(' ').slice(0, 3).join(' ')
  return words || 'Core Concept'
}

export function generateQuestionFeedback(
  question: QuizQuestion,
  userAnswer: number | number[],
  isCorrect: boolean
): AdaptiveFeedback {
  if (isCorrect) {
    return {
      message: question.correctFeedback || "Correct! Great job!",
      emoji: "✅",
      tone: 'success',
    }
  }
  
  return {
    message: question.incorrectFeedback || "Not quite. Try reviewing the material and give it another shot!",
    emoji: "💡",
    tone: 'info',
  }
}

export interface ProgressRetention {
  lastSavedAt: number
  completedSteps: string[]
  currentStep: string
  answeredQuestions: { [questionId: string]: number | number[] }
  timeSpentSeconds: number
}

export function createAutoSaveCheckpoint(
  courseId: string,
  moduleId: string,
  lessonId: string,
  blockId: string,
  additionalData?: any
): ProgressRetention {
  return {
    lastSavedAt: Date.now(),
    completedSteps: [blockId],
    currentStep: blockId,
    answeredQuestions: {},
    timeSpentSeconds: 0,
    ...additionalData,
  }
}

export function shouldShowRemediationFocus(
  attemptsCount: number,
  score: number,
  passingScore: number
): boolean {
  return attemptsCount >= 2 && score < passingScore && score >= passingScore * 0.6
}

export function getAdaptiveTimeExtension(
  hasAccessibilityNeeds: boolean,
  baseTimeMinutes: number
): number {
  if (hasAccessibilityNeeds) {
    return baseTimeMinutes * 2
  }
  return baseTimeMinutes
}
