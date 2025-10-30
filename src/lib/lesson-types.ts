export interface LessonContent {
  id: string
  type: 'welcome' | 'text-and-image' | 'audio-message' | 'challenge' | 'code-example'
  order: number
}

export interface WelcomeContent extends LessonContent {
  type: 'welcome'
  character: string
  message: string
  audioUrl?: string
  captionText: string
}

export interface TextImageContent extends LessonContent {
  type: 'text-and-image'
  heading: string
  bodyText: string
  imageUrl?: string
  imageAlt: string
  audioUrl?: string
  captionText?: string
}

export interface AudioMessageContent extends LessonContent {
  type: 'audio-message'
  heading: string
  bodyText: string
  audioUrl?: string
  captionText: string
}

export interface ChallengeOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface ChallengeFeedback {
  correct: {
    visual: string
    audio?: string
    captionText: string
    xpReward: number
    badge?: string
  }
  incorrect: {
    visual: string
    audio?: string
    captionText: string
    hint?: string
  }
}

export interface ChallengeContent extends LessonContent {
  type: 'challenge'
  challengeType: 'multiple-choice' | 'drag-drop' | 'code-match'
  question: string
  instruction?: string
  options: ChallengeOption[]
  feedback: ChallengeFeedback
}

export interface CodeExampleContent extends LessonContent {
  type: 'code-example'
  heading: string
  code: string
  language: string
  explanation: string
  imageUrl?: string
  imageAlt?: string
}

export type LessonContentBlock =
  | WelcomeContent
  | TextImageContent
  | AudioMessageContent
  | ChallengeContent
  | CodeExampleContent

export interface Lesson {
  id: string
  moduleId: string
  title: string
  chapterNumber: number
  contentBlocks: LessonContentBlock[]
  estimatedTime: number
  xpReward: number
}

export interface LessonModule {
  id: string
  courseId: string
  title: string
  moduleNumber: number
  lessons: Lesson[]
  totalXP: number
}
