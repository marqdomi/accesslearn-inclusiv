/**
 * Course Validation System
 * Sistema de validación avanzada para cursos
 * Valida estructura, contenido, configuración y calidad
 */

import { CourseWithStructure } from '@/services/course-management-service'

export interface ValidationResult {
  valid: boolean
  score: number // 0-100
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  suggestions: ValidationIssue[]
}

export interface ValidationIssue {
  category: ValidationCategory
  severity: 'error' | 'warning' | 'suggestion'
  message: string
  field?: string
  moduleId?: string
  lessonId?: string
}

export type ValidationCategory =
  | 'basic_info'
  | 'structure'
  | 'content'
  | 'metadata'
  | 'accessibility'
  | 'quality'
  | 'engagement'

/**
 * Validación completa del curso
 */
export function validateCourse(course: CourseWithStructure): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  const suggestions: ValidationIssue[] = []

  // 1. Validación de información básica (CRÍTICA)
  validateBasicInfo(course, errors, warnings)

  // 2. Validación de estructura (CRÍTICA)
  validateStructure(course, errors, warnings)

  // 3. Validación de contenido
  validateContent(course, warnings, suggestions)

  // 4. Validación de metadata
  validateMetadata(course, warnings, suggestions)

  // 5. Validación de accesibilidad
  validateAccessibility(course, warnings, suggestions)

  // 6. Validación de calidad
  validateQuality(course, suggestions)

  // 7. Validación de engagement
  validateEngagement(course, suggestions)

  // Calcular score
  const score = calculateValidationScore(course, errors, warnings)

  return {
    valid: errors.length === 0,
    score,
    errors,
    warnings,
    suggestions,
  }
}

/**
 * Validar información básica requerida
 */
function validateBasicInfo(
  course: CourseWithStructure,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
) {
  if (!course.title || course.title.trim().length === 0) {
    errors.push({
      category: 'basic_info',
      severity: 'error',
      message: 'Course title is required',
      field: 'title',
    })
  } else if (course.title.length < 10) {
    warnings.push({
      category: 'basic_info',
      severity: 'warning',
      message: 'Course title should be at least 10 characters for better clarity',
      field: 'title',
    })
  }

  if (!course.description || course.description.trim().length === 0) {
    errors.push({
      category: 'basic_info',
      severity: 'error',
      message: 'Course description is required',
      field: 'description',
    })
  } else if (course.description.length < 50) {
    warnings.push({
      category: 'basic_info',
      severity: 'warning',
      message: 'Course description should be at least 50 characters for better understanding',
      field: 'description',
    })
  }

  if (!course.category) {
    warnings.push({
      category: 'basic_info',
      severity: 'warning',
      message: 'Course category is recommended for better discoverability',
      field: 'category',
    })
  }

  if (!course.difficulty) {
    warnings.push({
      category: 'basic_info',
      severity: 'warning',
      message: 'Difficulty level helps students choose appropriate courses',
      field: 'difficulty',
    })
  }
}

/**
 * Validar estructura del curso
 */
function validateStructure(
  course: CourseWithStructure,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
) {
  // Validar módulos
  if (!course.modules || course.modules.length === 0) {
    errors.push({
      category: 'structure',
      severity: 'error',
      message: 'Course must have at least one module',
    })
    return // No seguir validando si no hay módulos
  }

  // Validar lecciones
  const totalLessons = course.modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0)
  if (totalLessons === 0) {
    errors.push({
      category: 'structure',
      severity: 'error',
      message: 'Course must have at least one lesson',
    })
  }

  // Validar cada módulo
  course.modules.forEach((module, index) => {
    if (!module.title || module.title.trim().length === 0) {
      errors.push({
        category: 'structure',
        severity: 'error',
        message: `Module ${index + 1} requires a title`,
        moduleId: module.id,
      })
    }

    if (!module.lessons || module.lessons.length === 0) {
      warnings.push({
        category: 'structure',
        severity: 'warning',
        message: `Module "${module.title}" has no lessons`,
        moduleId: module.id,
      })
    }

    // Validar lecciones del módulo
    module.lessons?.forEach((lesson, lessonIndex) => {
      if (!lesson.title || lesson.title.trim().length === 0) {
        errors.push({
          category: 'structure',
          severity: 'error',
          message: `Lesson ${lessonIndex + 1} in module "${module.title}" requires a title`,
          moduleId: module.id,
          lessonId: lesson.id,
        })
      }

      if (!lesson.type) {
        errors.push({
          category: 'structure',
          severity: 'error',
          message: `Lesson "${lesson.title}" requires a type`,
          moduleId: module.id,
          lessonId: lesson.id,
        })
      }
    })
  })

  // Validar distribución
  if (course.modules.length > 20) {
    warnings.push({
      category: 'structure',
      severity: 'warning',
      message: 'Course has many modules (>20). Consider reorganizing for better learning flow',
    })
  }

  if (totalLessons < 3) {
    warnings.push({
      category: 'structure',
      severity: 'warning',
      message: 'Course has very few lessons. Consider adding more content',
    })
  }
}

/**
 * Validar contenido
 */
function validateContent(
  course: CourseWithStructure,
  warnings: ValidationIssue[],
  suggestions: ValidationIssue[]
) {
  const lessonTypes = new Set<string>()
  let totalDuration = 0
  let lessonsWithDuration = 0

  course.modules.forEach((module) => {
    module.lessons?.forEach((lesson) => {
      lessonTypes.add(lesson.type)

      if (lesson.duration) {
        totalDuration += lesson.duration
        lessonsWithDuration++
      } else {
        warnings.push({
          category: 'content',
          severity: 'warning',
          message: `Lesson "${lesson.title}" has no duration specified`,
          moduleId: module.id,
          lessonId: lesson.id,
        })
      }

      if (!lesson.description) {
        suggestions.push({
          category: 'content',
          severity: 'suggestion',
          message: `Lesson "${lesson.title}" would benefit from a description`,
          moduleId: module.id,
          lessonId: lesson.id,
        })
      }

      if (!lesson.xpReward) {
        suggestions.push({
          category: 'content',
          severity: 'suggestion',
          message: `Lesson "${lesson.title}" has no XP reward configured`,
          moduleId: module.id,
          lessonId: lesson.id,
        })
      }
    })
  })

  // Validar variedad de contenido
  if (lessonTypes.size === 1) {
    suggestions.push({
      category: 'content',
      severity: 'suggestion',
      message: 'Consider adding different types of lessons (video, quiz, interactive) for better engagement',
    })
  }

  // Validar duración total
  if (lessonsWithDuration > 0 && totalDuration < 60) {
    warnings.push({
      category: 'content',
      severity: 'warning',
      message: 'Course duration is quite short (<1 hour). Consider adding more content',
    })
  }
}

/**
 * Validar metadata
 */
function validateMetadata(
  course: CourseWithStructure,
  warnings: ValidationIssue[],
  suggestions: ValidationIssue[]
) {
  if (!course.thumbnail) {
    warnings.push({
      category: 'metadata',
      severity: 'warning',
      message: 'Course thumbnail is recommended for better visual appeal',
      field: 'thumbnail',
    })
  }

  if (!course.banner) {
    suggestions.push({
      category: 'metadata',
      severity: 'suggestion',
      message: 'Course banner image enhances the course page appearance',
      field: 'banner',
    })
  }

  if (!course.tags || course.tags.length === 0) {
    warnings.push({
      category: 'metadata',
      severity: 'warning',
      message: 'Tags help with course discoverability and search',
      field: 'tags',
    })
  }

  if (!course.instructor) {
    suggestions.push({
      category: 'metadata',
      severity: 'suggestion',
      message: 'Instructor name adds credibility to the course',
      field: 'instructor',
    })
  }

  if (!course.targetAudience) {
    suggestions.push({
      category: 'metadata',
      severity: 'suggestion',
      message: 'Defining target audience helps students determine if the course is right for them',
      field: 'targetAudience',
    })
  }

  if (course.estimatedHours === 0) {
    warnings.push({
      category: 'metadata',
      severity: 'warning',
      message: 'Estimated hours should be greater than 0',
      field: 'estimatedHours',
    })
  }
}

/**
 * Validar accesibilidad
 */
function validateAccessibility(
  course: CourseWithStructure,
  warnings: ValidationIssue[],
  suggestions: ValidationIssue[]
) {
  if (!course.objectives || course.objectives.length === 0) {
    warnings.push({
      category: 'accessibility',
      severity: 'warning',
      message: 'Learning objectives help students understand what they will learn',
      field: 'objectives',
    })
  }

  if (!course.prerequisites || course.prerequisites.length === 0) {
    suggestions.push({
      category: 'accessibility',
      severity: 'suggestion',
      message: 'Prerequisites help students assess if they are ready for the course',
      field: 'prerequisites',
    })
  }

  // Verificar si hay lecciones muy largas
  course.modules.forEach((module) => {
    module.lessons?.forEach((lesson) => {
      if (lesson.duration && lesson.duration > 30) {
        suggestions.push({
          category: 'accessibility',
          severity: 'suggestion',
          message: `Lesson "${lesson.title}" is quite long (${lesson.duration}m). Consider breaking it into smaller chunks`,
          moduleId: module.id,
          lessonId: lesson.id,
        })
      }
    })
  })
}

/**
 * Validar calidad del curso
 */
function validateQuality(course: CourseWithStructure, suggestions: ValidationIssue[]) {
  const totalLessons = course.modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0)
  const quizCount = course.modules.reduce((acc, mod) => {
    return acc + (mod.lessons?.filter((l) => l.type === 'quiz').length || 0)
  }, 0)

  if (totalLessons > 0 && quizCount === 0) {
    suggestions.push({
      category: 'quality',
      severity: 'suggestion',
      message: 'Consider adding quizzes to reinforce learning and assess understanding',
    })
  }

  // Verificar balance de tipos
  const interactiveLessons = course.modules.reduce((acc, mod) => {
    return acc + (mod.lessons?.filter((l) => l.type === 'interactive' || l.type === 'exercise').length || 0)
  }, 0)

  if (totalLessons > 5 && interactiveLessons === 0) {
    suggestions.push({
      category: 'quality',
      severity: 'suggestion',
      message: 'Interactive lessons and exercises improve engagement and retention',
    })
  }
}

/**
 * Validar engagement
 */
function validateEngagement(course: CourseWithStructure, suggestions: ValidationIssue[]) {
  const totalXP = course.modules.reduce((acc, mod) => {
    return acc + (mod.lessons?.reduce((sum, l) => sum + (l.xpReward || 0), 0) || 0)
  }, 0)

  if (totalXP === 0) {
    suggestions.push({
      category: 'engagement',
      severity: 'suggestion',
      message: 'XP rewards increase student motivation and engagement',
    })
  }

  // Verificar progresión de dificultad
  const lessonsPerModule = course.modules.map((mod) => mod.lessons?.length || 0)
  const avgLessonsPerModule = lessonsPerModule.reduce((a, b) => a + b, 0) / course.modules.length

  if (avgLessonsPerModule < 2) {
    suggestions.push({
      category: 'engagement',
      severity: 'suggestion',
      message: 'Modules with only one lesson might feel fragmented. Consider consolidating',
    })
  }
}

/**
 * Calcular score de validación (0-100)
 */
function calculateValidationScore(
  course: CourseWithStructure,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): number {
  let score = 100

  // Penalización por errores (críticos)
  score -= errors.length * 15

  // Penalización por warnings
  score -= warnings.length * 5

  // Bonificaciones por calidad
  if (course.objectives && course.objectives.length >= 3) score += 5
  if (course.tags && course.tags.length >= 3) score += 5
  if (course.thumbnail) score += 5
  if (course.modules.length >= 3) score += 5
  if (course.totalXP && course.totalXP > 0) score += 5

  return Math.max(0, Math.min(100, score))
}
