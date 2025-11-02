import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Course, EmployeeCredentials, TeamChallenge, ActivityFeedItem } from '@/lib/types'
import { LessonModule } from '@/lib/lesson-types'
import { htmlFundamentalsModule } from '@/lib/sample-lessons'

const SAMPLE_COURSES: Course[] = [
  {
    id: 'intro-web-dev',
    title: 'courses.webDev.title',
    description: 'courses.webDev.description',
    category: 'Development',
    estimatedTime: 120,
    coverImage: '🌐',
    modules: [
      {
        id: 'html-basics',
        title: 'modules.htmlBasics.title',
        type: 'text',
        url: '',
        order: 1,
        accessibility: {
          altText: 'modules.htmlBasics.description',
        },
      },
      {
        id: 'css-styling',
        title: 'modules.cssStyling.title',
        type: 'text',
        url: '',
        order: 2,
        accessibility: {
          altText: 'modules.cssStyling.description',
        },
      },
      {
        id: 'js-intro',
        title: 'modules.jsIntro.title',
        type: 'text',
        url: '',
        order: 3,
        accessibility: {
          altText: 'modules.jsIntro.description',
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
    title: 'courses.dataScience.title',
    description: 'courses.dataScience.description',
    category: 'Data Science',
    estimatedTime: 180,
    coverImage: '📈',
    modules: [
      {
        id: 'stats-basics',
        title: 'modules.statsBasics.title',
        type: 'text',
        url: '',
        order: 1,
        accessibility: {
          altText: 'modules.statsBasics.description',
        },
      },
      {
        id: 'data-viz',
        title: 'modules.dataViz.title',
        type: 'text',
        url: '',
        order: 2,
        accessibility: {
          altText: 'modules.dataViz.description',
        },
      },
      {
        id: 'ml-intro',
        title: 'modules.mlIntro.title',
        type: 'text',
        url: '',
        order: 3,
        accessibility: {
          altText: 'modules.mlIntro.description',
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
    title: 'courses.accessibility.title',
    description: 'courses.accessibility.description',
    category: 'Accessibility',
    estimatedTime: 90,
    coverImage: '🌟',
    modules: [
      {
        id: 'wcag-intro',
        title: 'modules.wcagIntro.title',
        type: 'text',
        url: '',
        order: 1,
        accessibility: {
          altText: 'modules.wcagIntro.description',
        },
      },
      {
        id: 'aria-labels',
        title: 'modules.ariaLabels.title',
        type: 'text',
        url: '',
        order: 2,
        accessibility: {
          altText: 'modules.ariaLabels.description',
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
    title: 'courses.leadership.title',
    description: 'courses.leadership.description',
    category: 'Leadership',
    estimatedTime: 150,
    coverImage: '⭐',
    modules: [
      {
        id: 'communication',
        title: 'modules.communication.title',
        type: 'text',
        url: '',
        order: 1,
        accessibility: {
          altText: 'modules.communication.description',
        },
      },
      {
        id: 'delegation',
        title: 'modules.delegation.title',
        type: 'text',
        url: '',
        order: 2,
        accessibility: {
          altText: 'modules.delegation.description',
        },
      },
      {
        id: 'feedback',
        title: 'modules.feedback.title',
        type: 'text',
        url: '',
        order: 3,
        accessibility: {
          altText: 'modules.feedback.description',
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
    title: 'courses.cybersecurity.title',
    description: 'courses.cybersecurity.description',
    category: 'Security',
    estimatedTime: 120,
    coverImage: '🛡️',
    modules: [
      {
        id: 'security-fundamentals',
        title: 'modules.securityFundamentals.title',
        type: 'text',
        url: '',
        order: 1,
        accessibility: {
          altText: 'modules.securityFundamentals.description',
        },
      },
      {
        id: 'password-security',
        title: 'modules.passwordSecurity.title',
        type: 'text',
        url: '',
        order: 2,
        accessibility: {
          altText: 'modules.passwordSecurity.description',
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

const SAMPLE_TEAM_CHALLENGES: TeamChallenge[] = [
  {
    id: 'challenge-weekly-xp-1',
    title: 'Weekly XP Challenge',
    description: 'Which department can earn the most XP this week?',
    type: 'xp',
    startDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
    endDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    status: 'active',
    rewards: '🏆 Winner gets recognition and special badge!',
    teams: [
      {
        id: 'team-sales',
        name: 'Sales Team',
        department: 'Sales',
        memberCount: 12,
        totalXP: 8450,
      },
      {
        id: 'team-engineering',
        name: 'Engineering Team',
        department: 'Engineering',
        memberCount: 18,
        totalXP: 12300,
      },
      {
        id: 'team-marketing',
        name: 'Marketing Team',
        department: 'Marketing',
        memberCount: 8,
        totalXP: 6200,
      },
      {
        id: 'team-hr',
        name: 'HR Team',
        department: 'Human Resources',
        memberCount: 5,
        totalXP: 4100,
      },
    ],
  },
]

const SAMPLE_ACTIVITIES: ActivityFeedItem[] = [
  {
    id: 'activity-1',
    userId: 'user-001',
    userName: 'Sarah Johnson',
    userAvatar: '👩',
    type: 'level-up',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    data: { level: 5 },
    reactions: [
      {
        id: 'reaction-1',
        userId: 'user-002',
        userName: 'Mike Chen',
        type: 'congrats',
        timestamp: Date.now() - 1.5 * 60 * 60 * 1000,
      },
    ],
    comments: [],
  },
  {
    id: 'activity-2',
    userId: 'user-002',
    userName: 'Mike Chen',
    userAvatar: '👨',
    type: 'course-completed',
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    data: { courseName: 'Web Development Quest' },
    reactions: [
      {
        id: 'reaction-2',
        userId: 'user-003',
        userName: 'Emma Rodriguez',
        type: 'fire',
        timestamp: Date.now() - 4.5 * 60 * 60 * 1000,
      },
      {
        id: 'reaction-3',
        userId: 'user-001',
        userName: 'Sarah Johnson',
        type: 'trophy',
        timestamp: Date.now() - 4 * 60 * 60 * 1000,
      },
    ],
    comments: [],
  },
  {
    id: 'activity-3',
    userId: 'user-003',
    userName: 'Emma Rodriguez',
    userAvatar: '👩‍💼',
    type: 'badge-earned',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    data: { badgeName: 'Quick Learner', badgeIcon: '⚡' },
    reactions: [],
    comments: [],
  },
]

const SAMPLE_CREDENTIALS: EmployeeCredentials[] = [
  {
    id: 'admin-001',
    email: 'admin@gamelearn.test',
    temporaryPassword: 'Admin2024!',
    firstName: 'Admin',
    lastName: 'User',
    department: 'IT',
    role: 'admin',
    status: 'activated',
    createdAt: Date.now(),
  },
  {
    id: 'user-001',
    email: 'sarah.johnson@gamelearn.test',
    temporaryPassword: 'Welcome123!',
    firstName: 'Sarah',
    lastName: 'Johnson',
    department: 'Sales',
    role: 'employee',
    status: 'activated',
    createdAt: Date.now(),
  },
  {
    id: 'user-002',
    email: 'mike.chen@gamelearn.test',
    temporaryPassword: 'Welcome123!',
    firstName: 'Mike',
    lastName: 'Chen',
    department: 'Engineering',
    role: 'employee',
    status: 'activated',
    createdAt: Date.now(),
  },
  {
    id: 'user-003',
    email: 'emma.rodriguez@gamelearn.test',
    temporaryPassword: 'Welcome123!',
    firstName: 'Emma',
    lastName: 'Rodriguez',
    department: 'Marketing',
    role: 'employee',
    status: 'activated',
    createdAt: Date.now(),
  },
]

export function SampleDataInitializer() {
  const [courses, setCourses] = useKV<Course[]>('courses', [])
  const [lessonModules, setLessonModules] = useKV<Record<string, LessonModule>>('lesson-modules', {})
  const [credentials, setCredentials] = useKV<EmployeeCredentials[]>('employee-credentials', [])
  const [challenges, setChallenges] = useKV<TeamChallenge[]>('team-challenges', [])
  const [activities, setActivities] = useKV<ActivityFeedItem[]>('activity-feed', [])

  useEffect(() => {
    const initCourses = async () => {
      if (!courses || courses.length === 0) {
        console.log('🎓 Initializing sample courses...')
        setCourses(SAMPLE_COURSES)
      }
    }
    initCourses()
  }, [])

  useEffect(() => {
    const initLessons = async () => {
      if (!lessonModules || Object.keys(lessonModules).length === 0) {
        console.log('📚 Initializing lesson modules...')
        setLessonModules({
          'web-dev-quest': htmlFundamentalsModule,
        })
      }
    }
    initLessons()
  }, [])

  useEffect(() => {
    const initCredentials = async () => {
      if (!credentials || credentials.length === 0) {
        console.log('🔧 Initializing sample credentials...', SAMPLE_CREDENTIALS)
        setCredentials(SAMPLE_CREDENTIALS)
        console.log('✅ Sample credentials initialized successfully')
      } else {
        console.log('✅ Credentials already initialized:', credentials)
        console.log('📊 Credential count:', credentials.length)
        console.log('📧 Available emails:', credentials.map(c => c.email))
      }
    }
    initCredentials()
  }, [])

  useEffect(() => {
    const initChallenges = async () => {
      if (!challenges || challenges.length === 0) {
        console.log('🏆 Initializing team challenges...')
        setChallenges(SAMPLE_TEAM_CHALLENGES)
      }
    }
    initChallenges()
  }, [])

  useEffect(() => {
    const initActivities = async () => {
      if (!activities || activities.length === 0) {
        console.log('📰 Initializing activity feed...')
        setActivities(SAMPLE_ACTIVITIES)
      }
    }
    initActivities()
  }, [])

  return null
}
