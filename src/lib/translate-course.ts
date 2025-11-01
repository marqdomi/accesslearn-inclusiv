import { Course } from './types'
import { LessonModule, Lesson, LessonContentBlock } from './lesson-types'

export function translateCourse(course: Course, t: (key: string) => string): Course {
  return {
    ...course,
    title: course.title.startsWith('courses.') ? t(course.title) : course.title,
    description: course.description.startsWith('courses.') ? t(course.description) : course.description,
    modules: course.modules.map(module => ({
      ...module,
      title: module.title.startsWith('modules.') ? t(module.title) : module.title,
      accessibility: {
        ...module.accessibility,
        altText: module.accessibility.altText?.startsWith('modules.') 
          ? t(module.accessibility.altText) 
          : module.accessibility.altText
      }
    }))
  }
}

export function translateLessonModule(module: LessonModule, t: (key: string) => string): LessonModule {
  return {
    ...module,
    title: module.title.startsWith('modules.') ? t(module.title) : module.title,
    lessons: module.lessons.map(lesson => translateLesson(lesson, t))
  }
}

export function translateLesson(lesson: Lesson, t: (key: string) => string): Lesson {
  return {
    ...lesson,
    title: lesson.title.startsWith('lessons.') ? t(lesson.title) : lesson.title,
    contentBlocks: lesson.contentBlocks.map(block => translateContentBlock(block, t))
  }
}

function translateContentBlock(block: LessonContentBlock, t: (key: string) => string): LessonContentBlock {
  const translateIfKey = (text: string | undefined): string | undefined => {
    if (!text) return text
    return text.startsWith('lessons.') || text.startsWith('modules.') || text.startsWith('courses.') 
      ? t(text) 
      : text
  }

  switch (block.type) {
    case 'welcome':
      return {
        ...block,
        message: translateIfKey(block.message) || block.message,
        captionText: translateIfKey(block.captionText) || block.captionText
      }
    
    case 'text-and-image':
      return {
        ...block,
        heading: translateIfKey(block.heading) || block.heading,
        bodyText: translateIfKey(block.bodyText) || block.bodyText
      }
    
    case 'audio-message':
      return {
        ...block,
        heading: translateIfKey(block.heading) || block.heading,
        bodyText: translateIfKey(block.bodyText) || block.bodyText,
        captionText: translateIfKey(block.captionText) || block.captionText
      }
    
    case 'code-example':
      return {
        ...block,
        heading: translateIfKey(block.heading) || block.heading,
        explanation: translateIfKey(block.explanation) || block.explanation
      }
    
    case 'challenge':
      return {
        ...block,
        question: translateIfKey(block.question) || block.question,
        instruction: translateIfKey(block.instruction),
        options: block.options.map(opt => ({
          ...opt,
          text: translateIfKey(opt.text) || opt.text
        })),
        feedback: {
          correct: {
            ...block.feedback.correct,
            visual: translateIfKey(block.feedback.correct.visual) || block.feedback.correct.visual,
            captionText: translateIfKey(block.feedback.correct.captionText) || block.feedback.correct.captionText
          },
          incorrect: {
            ...block.feedback.incorrect,
            visual: translateIfKey(block.feedback.incorrect.visual) || block.feedback.incorrect.visual,
            captionText: translateIfKey(block.feedback.incorrect.captionText) || block.feedback.incorrect.captionText,
            hint: translateIfKey(block.feedback.incorrect.hint)
          }
        }
      }
    
    default:
      return block
  }
}
