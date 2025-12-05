/**
 * Course Adapter
 * 
 * Converts between frontend CourseStructure and backend Course formats
 */

import { CourseStructure } from '@/lib/types'

interface BackendCourse {
  id: string
  tenantId: string
  title: string
  description: string
  category: string
  estimatedTime: number
  modules: any[]
  assessment?: any[]
  coverImage?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  status: 'draft' | 'pending-review' | 'published' | 'archived'
  publishedAt?: string
  // Configuración flexible de completación y certificación
  certificateEnabled?: boolean
  completionMode?: 'modules-only' | 'modules-and-quizzes' | 'exam-mode' | 'study-guide'
  quizRequirement?: 'required' | 'optional' | 'none'
  requireAllQuizzesPassed?: boolean
  minimumScoreForCompletion?: number
  minimumScoreForCertificate?: number
  allowRetakes?: boolean
  maxRetakesPerQuiz?: number
  certificateRequiresPassingScore?: boolean
}

/**
 * Convert backend Course to frontend CourseStructure
 */
export function adaptBackendCourseToFrontend(backendCourse: BackendCourse): CourseStructure {
  // Ensure modules is an array and each module has lessons as an array
  const modules = (backendCourse.modules || []).map((m: any) => ({
    ...m,
    lessons: Array.isArray(m.lessons) ? m.lessons : []
  }))

  return {
    id: backendCourse.id,
    title: backendCourse.title,
    description: backendCourse.description,
    category: backendCourse.category,
    coverImage: backendCourse.coverImage,
    modules: modules,
    estimatedHours: backendCourse.estimatedTime ? Math.round(backendCourse.estimatedTime / 60) : 0,
    totalXP: modules.reduce((sum, m) => {
      return sum + (m.lessons || []).reduce((lessonSum: number, l: any) => {
        return lessonSum + (l.xpReward || 0)
      }, 0)
    }, 0),
    published: backendCourse.status === 'published',
    publishedAt: backendCourse.publishedAt ? new Date(backendCourse.publishedAt).getTime() : undefined,
    enrollmentMode: 'open', // Default
    difficulty: 'Novice', // Default, could be mapped from backend if available
    createdAt: new Date(backendCourse.createdAt).getTime(),
    updatedAt: new Date(backendCourse.updatedAt).getTime(),
    createdBy: backendCourse.createdBy,
    status: backendCourse.status,
    // Configuración flexible de completación y certificación
    certificateEnabled: backendCourse.certificateEnabled,
    completionMode: backendCourse.completionMode,
    quizRequirement: backendCourse.quizRequirement,
    requireAllQuizzesPassed: backendCourse.requireAllQuizzesPassed,
    minimumScoreForCompletion: backendCourse.minimumScoreForCompletion,
    minimumScoreForCertificate: backendCourse.minimumScoreForCertificate,
    allowRetakes: backendCourse.allowRetakes,
    maxRetakesPerQuiz: backendCourse.maxRetakesPerQuiz,
    certificateRequiresPassingScore: backendCourse.certificateRequiresPassingScore,
  } as CourseStructure
}

/**
 * Convert frontend CourseStructure to backend Course format for updates
 */
export function adaptFrontendCourseToBackend(
  frontendCourse: CourseStructure,
  tenantId: string
): Partial<BackendCourse> {
  return {
    title: frontendCourse.title,
    description: frontendCourse.description,
    category: frontendCourse.category,
    estimatedTime: (frontendCourse.estimatedHours || 0) * 60, // Convert hours to minutes
    modules: frontendCourse.modules || [],
    coverImage: frontendCourse.coverImage,
    status: (frontendCourse as any).status || (frontendCourse.published ? 'published' : 'draft'),
    // Configuración flexible de completación y certificación
    certificateEnabled: frontendCourse.certificateEnabled,
    completionMode: frontendCourse.completionMode,
    quizRequirement: frontendCourse.quizRequirement,
    requireAllQuizzesPassed: frontendCourse.requireAllQuizzesPassed,
    minimumScoreForCompletion: frontendCourse.minimumScoreForCompletion,
    minimumScoreForCertificate: frontendCourse.minimumScoreForCertificate,
    allowRetakes: frontendCourse.allowRetakes,
    maxRetakesPerQuiz: frontendCourse.maxRetakesPerQuiz,
    certificateRequiresPassingScore: frontendCourse.certificateRequiresPassingScore,
  }
}

