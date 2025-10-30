import { Lesson, LessonModule } from './lesson-types'

export const htmlFundamentalsModule: LessonModule = {
  id: 'module-html-fundamentals',
  courseId: 'web-dev-quest',
  title: 'HTML Fundamentals',
  moduleNumber: 1,
  totalXP: 130,
  lessons: [
    {
      id: 'lesson-1-html-basics',
      moduleId: 'module-html-fundamentals',
      title: 'Chapter 1: The Digital Blueprint: What is HTML?',
      chapterNumber: 1,
      estimatedTime: 5,
      xpReward: 30,
      contentBlocks: [
        {
          id: 'welcome-1',
          type: 'welcome',
          order: 1,
          character: '🤖',
          message: "Hey there, future web wizard! Ready to dive into your first mission? Today, we're uncovering the secret language of the internet: HTML! Think of it as your digital LEGO set.",
          captionText: "Hey there, future web wizard! Ready to dive into your first mission? Today, we're uncovering the secret language of the internet: HTML! Think of it as your digital LEGO set.",
        },
        {
          id: 'text-image-1',
          type: 'text-and-image',
          order: 2,
          heading: 'What is HTML?',
          bodyText: "HTML stands for HyperText Markup Language. It's not a programming language like magic spells, but a markup language – like a detailed blueprint that tells your web browser what content to display and where.",
          imageUrl: '',
          imageAlt: 'Illustration comparing HTML structure to a house blueprint with labeled sections showing living room as heading and kitchen as paragraph.',
        },
        {
          id: 'audio-1',
          type: 'audio-message',
          order: 3,
          heading: 'Why is HTML important?',
          bodyText: "Without HTML, your browser wouldn't know if text is a title, a paragraph, or a secret message! It's the skeleton of every webpage.",
          captionText: "Imagine trying to build a castle without a plan! That's what a webpage would be without HTML. It gives everything its place.",
        },
        {
          id: 'challenge-1',
          type: 'challenge',
          order: 4,
          challengeType: 'multiple-choice',
          question: 'Imagine you\'re building a tower of blocks. What does HTML help you decide?',
          instruction: 'Choose the best answer:',
          options: [
            {
              id: 'opt-1',
              text: 'The color of the blocks.',
              isCorrect: false,
            },
            {
              id: 'opt-2',
              text: 'Where each block goes in the tower.',
              isCorrect: true,
            },
            {
              id: 'opt-3',
              text: 'How fast the tower falls down.',
              isCorrect: false,
            },
          ],
          feedback: {
            correct: {
              visual: '🌟 AWESOME! You got it!',
              captionText: 'Fantastic! That\'s 10 XP for your quest!',
              xpReward: 10,
            },
            incorrect: {
              visual: 'Oops! Not quite.',
              captionText: 'Almost! Remember, HTML is about structure. Give it another shot!',
              hint: 'Think about what makes a webpage organized and structured.',
            },
          },
        },
      ],
    },
    {
      id: 'lesson-2-tags-elements',
      moduleId: 'module-html-fundamentals',
      title: 'Chapter 2: Your First Magic Words: Tags and Elements!',
      chapterNumber: 2,
      estimatedTime: 7,
      xpReward: 50,
      contentBlocks: [
        {
          id: 'welcome-2',
          type: 'welcome',
          order: 1,
          character: '🤖',
          message: "Welcome back, adventurer! Now that we know what HTML is, let's learn its basic components: Tags and Elements. These are your digital LEGO bricks!",
          captionText: "Welcome back, adventurer! Now that we know what HTML is, let's learn its basic components: Tags and Elements. These are your digital LEGO bricks!",
        },
        {
          id: 'code-1',
          type: 'code-example',
          order: 2,
          heading: 'What are Tags?',
          code: '<p>This is a paragraph!</p>',
          language: 'html',
          explanation: 'HTML uses tags to markup (or label) content. Tags usually come in pairs: an opening tag <tag> and a closing tag </tag>. The <p> is the opening tag, </p> is the closing tag. Together, they tell the browser: "Hey, everything in between is a paragraph!"',
          imageAlt: 'Diagram showing opening and closing HTML tags surrounding text.',
        },
        {
          id: 'text-2',
          type: 'text-and-image',
          order: 3,
          heading: 'What are Elements?',
          bodyText: 'An element is made up of the opening tag, the closing tag, and all the content in between! So, <p>This is a paragraph!</p> is one complete HTML element.',
          imageUrl: '',
          imageAlt: 'Diagram showing a complete HTML element with opening tag, content, and closing tag.',
        },
        {
          id: 'challenge-2',
          type: 'challenge',
          order: 4,
          challengeType: 'multiple-choice',
          question: 'Can you help our Web Builder Bot complete the HTML sentence?',
          instruction: 'Which tags would you use for a heading: "This is a heading for my webpage!"',
          options: [
            {
              id: 'opt-1',
              text: '<h1> and </h1>',
              isCorrect: true,
            },
            {
              id: 'opt-2',
              text: '<title> and </title>',
              isCorrect: false,
            },
            {
              id: 'opt-3',
              text: '<head> and </head>',
              isCorrect: false,
            },
          ],
          feedback: {
            correct: {
              visual: '🎉 LEVEL UP! You just mastered your first tags!',
              captionText: 'Incredible! You earned the Tag Master badge! Keep up the great work!',
              xpReward: 20,
              badge: 'tag-master',
            },
            incorrect: {
              visual: 'Hmm, not quite the right spell!',
              captionText: 'Close, but not a heading tag. Think about what makes text big and bold on a page!',
              hint: 'Remember, headings are important for structure. Headings use numbers like h1, h2, etc.',
            },
          },
        },
      ],
    },
  ],
}
