import { Lesson, LessonModule } from './lesson-types'

export const htmlFundamentalsModule: LessonModule = {
  id: 'module-html-fundamentals',
  courseId: 'web-dev-quest',
  title: 'modules.htmlBasics.title',
  moduleNumber: 1,
  totalXP: 130,
  lessons: [
    {
      id: 'lesson-1-html-basics',
      moduleId: 'module-html-fundamentals',
      title: 'lessons.htmlIntro.title',
      chapterNumber: 1,
      estimatedTime: 5,
      xpReward: 30,
      contentBlocks: [
        {
          id: 'welcome-1',
          type: 'welcome',
          order: 1,
          character: '🤖',
          message: 'lessons.htmlIntro.welcome',
          captionText: 'lessons.htmlIntro.welcome',
        },
        {
          id: 'text-image-1',
          type: 'text-and-image',
          order: 2,
          heading: 'lessons.htmlIntro.whatIsHtml.heading',
          bodyText: 'lessons.htmlIntro.whatIsHtml.text',
          imageUrl: '',
          imageAlt: 'Illustration comparing HTML structure to a house blueprint with labeled sections showing living room as heading and kitchen as paragraph.',
        },
        {
          id: 'audio-1',
          type: 'audio-message',
          order: 3,
          heading: 'lessons.htmlIntro.whyImportant.heading',
          bodyText: 'lessons.htmlIntro.whyImportant.text',
          captionText: 'lessons.htmlIntro.whyImportant.caption',
        },
        {
          id: 'challenge-1',
          type: 'challenge',
          order: 4,
          challengeType: 'multiple-choice',
          question: 'lessons.htmlIntro.challenge.question',
          instruction: 'Choose the best answer:',
          options: [
            {
              id: 'opt-1',
              text: 'lessons.htmlIntro.challenge.option1',
              isCorrect: false,
            },
            {
              id: 'opt-2',
              text: 'lessons.htmlIntro.challenge.option2',
              isCorrect: true,
            },
            {
              id: 'opt-3',
              text: 'lessons.htmlIntro.challenge.option3',
              isCorrect: false,
            },
          ],
          feedback: {
            correct: {
              visual: 'lessons.htmlIntro.challenge.correct',
              captionText: 'lessons.htmlIntro.challenge.correctCaption',
              xpReward: 10,
            },
            incorrect: {
              visual: 'lessons.htmlIntro.challenge.incorrect',
              captionText: 'lessons.htmlIntro.challenge.incorrectCaption',
              hint: 'lessons.htmlIntro.challenge.hint',
            },
          },
        },
      ],
    },
    {
      id: 'lesson-2-tags-elements',
      moduleId: 'module-html-fundamentals',
      title: 'lessons.tagsElements.title',
      chapterNumber: 2,
      estimatedTime: 7,
      xpReward: 50,
      contentBlocks: [
        {
          id: 'welcome-2',
          type: 'welcome',
          order: 1,
          character: '🤖',
          message: 'lessons.tagsElements.welcome',
          captionText: 'lessons.tagsElements.welcome',
        },
        {
          id: 'code-1',
          type: 'code-example',
          order: 2,
          heading: 'lessons.tagsElements.whatAreTags.heading',
          code: '<p>This is a paragraph!</p>',
          language: 'html',
          explanation: 'lessons.tagsElements.whatAreTags.explanation',
          imageAlt: 'Diagram showing opening and closing HTML tags surrounding text.',
        },
        {
          id: 'text-2',
          type: 'text-and-image',
          order: 3,
          heading: 'lessons.tagsElements.whatAreElements.heading',
          bodyText: 'lessons.tagsElements.whatAreElements.text',
          imageUrl: '',
          imageAlt: 'Diagram showing a complete HTML element with opening tag, content, and closing tag.',
        },
        {
          id: 'challenge-2',
          type: 'challenge',
          order: 4,
          challengeType: 'multiple-choice',
          question: 'lessons.tagsElements.challenge.question',
          instruction: 'lessons.tagsElements.challenge.instruction',
          options: [
            {
              id: 'opt-1',
              text: 'lessons.tagsElements.challenge.option1',
              isCorrect: true,
            },
            {
              id: 'opt-2',
              text: 'lessons.tagsElements.challenge.option2',
              isCorrect: false,
            },
            {
              id: 'opt-3',
              text: 'lessons.tagsElements.challenge.option3',
              isCorrect: false,
            },
          ],
          feedback: {
            correct: {
              visual: 'lessons.tagsElements.challenge.correct',
              captionText: 'lessons.tagsElements.challenge.correctCaption',
              xpReward: 20,
              badge: 'tag-master',
            },
            incorrect: {
              visual: 'lessons.tagsElements.challenge.incorrect',
              captionText: 'lessons.tagsElements.challenge.incorrectCaption',
              hint: 'lessons.tagsElements.challenge.hint',
            },
          },
        },
      ],
    },
  ],
}
