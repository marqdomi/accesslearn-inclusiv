import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Course } from '@/lib/types'
import { LessonModule } from '@/lib/lesson-types'
import { htmlFundamentalsModule } from '@/lib/sample-lessons'

const SAMPLE_COURSES: Course[] = [
  {
    id: 'intro-web-dev',
    title: '🚀 Web Development Quest',
    description: 'Begin your journey into the world of web development. Learn HTML, CSS, and JavaScript basics!',
    category: 'Development',
    estimatedTime: 120,
    coverImage: '🌐',
    modules: [
      {
        id: 'html-basics',
        title: 'HTML Fundamentals',
        type: 'text',
        url: '',
        order: 1,
        accessibility: {
          altText: 'HTML structure basics',
        },
      },
      {
        id: 'css-styling',
        title: 'CSS Styling Magic',
        type: 'text',
        url: '',
        order: 2,
        accessibility: {
          altText: 'CSS styling fundamentals',
        },
      },
      {
        id: 'js-intro',
        title: 'JavaScript Basics',
        type: 'text',
        url: '',
        order: 3,
        accessibility: {
          altText: 'JavaScript programming basics',
        },
      },
    ],
    assessment: [
      {
        id: 'q1',
        question: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Home Tool Markup Language',
          'Hyperlinks and Text Markup Language',
        ],
        correctAnswer: 0,
        explanation: 'HTML stands for Hyper Text Markup Language, the standard markup language for web pages.',
      },
      {
        id: 'q2',
        question: 'Which property is used to change the background color in CSS?',
        options: ['color', 'bg-color', 'background-color', 'bgcolor'],
        correctAnswer: 2,
        explanation: 'The background-color property is used to set the background color of an element.',
      },
    ],
  },
  {
    id: 'data-science-intro',
    title: '📊 Data Science Adventure',
    description: 'Explore the exciting world of data science. Learn statistics, data visualization, and basic machine learning!',
    category: 'Data Science',
    estimatedTime: 180,
    coverImage: '📈',
    modules: [
      {
        id: 'stats-basics',
        title: 'Statistics Fundamentals',
        type: 'text',
        url: '',
        order: 1,
        accessibility: {
          altText: 'Basic statistics concepts',
        },
      },
      {
        id: 'data-viz',
        title: 'Data Visualization',
        type: 'text',
        url: '',
        order: 2,
        accessibility: {
          altText: 'Creating effective data visualizations',
        },
      },
      {
        id: 'ml-intro',
        title: 'Machine Learning Basics',
        type: 'text',
        url: '',
        order: 3,
        accessibility: {
          altText: 'Introduction to machine learning',
        },
      },
    ],
    assessment: [
      {
        id: 'q1',
        question: 'What is the mean of the numbers 2, 4, 6, 8, 10?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 1,
        explanation: 'The mean is calculated by adding all numbers and dividing by the count: (2+4+6+8+10)/5 = 6',
      },
    ],
  },
  {
    id: 'accessibility-101',
    title: '♿ Accessibility Champion',
    description: 'Master web accessibility standards and create inclusive digital experiences for everyone!',
    category: 'Accessibility',
    estimatedTime: 90,
    coverImage: '🌟',
    modules: [
      {
        id: 'wcag-intro',
        title: 'WCAG Guidelines',
        type: 'text',
        url: '',
        order: 1,
        accessibility: {
          altText: 'Web Content Accessibility Guidelines overview',
        },
      },
      {
        id: 'aria-labels',
        title: 'ARIA and Semantic HTML',
        type: 'text',
        url: '',
        order: 2,
        accessibility: {
          altText: 'Using ARIA labels and semantic HTML',
        },
      },
    ],
    assessment: [
      {
        id: 'q1',
        question: 'What does WCAG stand for?',
        options: [
          'Web Content Accessibility Guidelines',
          'Website Code Access Guide',
          'Web Compliance and Accessibility Group',
          'World Content Accessibility Guidelines',
        ],
        correctAnswer: 0,
        explanation: 'WCAG stands for Web Content Accessibility Guidelines, developed by W3C.',
      },
    ],
  },
  {
    id: 'team-leadership',
    title: '👥 Leadership Mastery',
    description: 'Develop essential leadership skills to inspire and guide your team to success!',
    category: 'Leadership',
    estimatedTime: 150,
    coverImage: '⭐',
    modules: [
      {
        id: 'communication',
        title: 'Effective Communication',
        type: 'text',
        url: '',
        order: 1,
        accessibility: {
          altText: 'Leadership communication strategies',
        },
      },
      {
        id: 'delegation',
        title: 'Delegation & Empowerment',
        type: 'text',
        url: '',
        order: 2,
        accessibility: {
          altText: 'Delegation and team empowerment',
        },
      },
      {
        id: 'feedback',
        title: 'Giving Constructive Feedback',
        type: 'text',
        url: '',
        order: 3,
        accessibility: {
          altText: 'Providing effective feedback',
        },
      },
    ],
    assessment: [
      {
        id: 'q1',
        question: 'What is the most important quality of a good leader?',
        options: [
          'Being the smartest person in the room',
          'Effective communication and empathy',
          'Making all decisions alone',
          'Never admitting mistakes',
        ],
        correctAnswer: 1,
        explanation: 'Effective communication and empathy are crucial for building trust and motivating teams.',
      },
    ],
  },
  {
    id: 'cybersecurity-basics',
    title: '🔐 Cybersecurity Defender',
    description: 'Learn to protect digital assets and understand security best practices in the modern world!',
    category: 'Security',
    estimatedTime: 120,
    coverImage: '🛡️',
    modules: [
      {
        id: 'security-fundamentals',
        title: 'Security Fundamentals',
        type: 'text',
        url: '',
        order: 1,
        accessibility: {
          altText: 'Basic cybersecurity concepts',
        },
      },
      {
        id: 'password-security',
        title: 'Password & Authentication',
        type: 'text',
        url: '',
        order: 2,
        accessibility: {
          altText: 'Password security and authentication methods',
        },
      },
    ],
    assessment: [
      {
        id: 'q1',
        question: 'Which is the most secure type of authentication?',
        options: [
          'Password only',
          'Two-factor authentication (2FA)',
          'Security questions',
          'PIN code',
        ],
        correctAnswer: 1,
        explanation: 'Two-factor authentication provides an extra layer of security beyond just passwords.',
      },
    ],
  },
]

export function SampleDataInitializer() {
  const [courses, setCourses] = useKV<Course[]>('courses', [])
  const [lessonModules, setLessonModules] = useKV<Record<string, LessonModule>>('lesson-modules', {})

  useEffect(() => {
    if (!courses || courses.length === 0) {
      setCourses(SAMPLE_COURSES)
    }
  }, [])

  useEffect(() => {
    if (!lessonModules || Object.keys(lessonModules).length === 0) {
      setLessonModules({
        'web-dev-quest': htmlFundamentalsModule,
      })
    }
  }, [])

  return null
}
