# Modern Course Builder - Architecture Document

## Overview
Complete rebuild of the course creation tool with modern architecture, quiz integration, and workflow support.

## Key Features
- ✅ Multi-step wizard interface (5 steps)
- ✅ 4 quiz types (multiple-choice, true-false, matching, scenario-solver)
- ✅ 7 lesson block types (welcome, text, image, audio, video, challenge, code)
- ✅ Workflow integration (draft → pending-review → published)
- ✅ Auto-save every 30 seconds
- ✅ Real-time validation with Zod schemas
- ✅ Accessibility-first design
- ✅ Drag-and-drop reordering
- ✅ Student preview mode
- ✅ Media upload support

---

## Architecture

### Component Hierarchy
```
ModernCourseBuilder (Main Container)
├── StepperNavigation (Progress indicator)
├── AutoSaveIndicator (Save status)
│
├── Step 1: CourseDetailsStep
│   ├── CourseMetadataForm
│   ├── MediaUploader (Cover image)
│   └── ValidationAlert
│
├── Step 2: CourseStructureStep
│   ├── ModuleList (DragDropList)
│   │   └── ModuleCard
│   │       └── LessonList (DragDropList)
│   │           └── LessonCard
│   ├── ModuleEditor (Add/Edit modal)
│   ├── LessonEditor (Add/Edit modal)
│   └── TreePreview
│
├── Step 3: ContentEditorStep
│   ├── LessonSelector (Dropdown)
│   ├── BlockEditor
│   │   ├── WelcomeBlock
│   │   ├── TextBlock (Rich text editor)
│   │   ├── ImageBlock (with MediaUploader)
│   │   ├── AudioBlock (with MediaUploader)
│   │   ├── VideoBlock (with MediaUploader)
│   │   ├── ChallengeBlock
│   │   └── CodeBlock (Syntax highlighting)
│   ├── AccessibilityFieldset
│   └── BlockPreview
│
├── Step 4: QuizBuilderStep
│   ├── LessonSelector (Dropdown)
│   ├── QuizEditor
│   │   ├── QuizMetadataForm (title, passing score, max attempts)
│   │   ├── QuestionList
│   │   │   ├── MultipleChoiceQuestion
│   │   │   ├── TrueFalseQuestion
│   │   │   ├── MatchingQuestion
│   │   │   └── ScenarioSolverQuestion
│   │   └── QuestionEditor (Add/Edit)
│   └── QuizPreview
│
└── Step 5: ReviewPublishStep
    ├── CourseSummary (Stats and overview)
    ├── ValidationChecklist
    ├── PreviewModal (Student view)
    ├── StatusBadge (Current workflow status)
    └── ActionButtons
        ├── Save Draft
        ├── Submit for Review (instructors)
        ├── Publish (content-managers/admins)
        └── Back to Edit
```

---

## Data Flow

### State Management
```typescript
interface CourseBuilderState {
  course: CourseStructure
  currentStep: 1 | 2 | 3 | 4 | 5
  selectedModuleId: string | null
  selectedLessonId: string | null
  validationErrors: ValidationError[]
  isDirty: boolean
  lastSaved: number | null
  isSaving: boolean
}
```

### Auto-Save Logic
```typescript
useEffect(() => {
  if (isDirty && !isSaving) {
    const timer = setTimeout(() => {
      saveDraft()
    }, 30000) // 30 seconds
    
    return () => clearTimeout(timer)
  }
}, [course, isDirty])

// Also save on:
// - Step navigation
// - Window beforeunload
// - Component unmount
```

### Workflow Integration
```typescript
// Submit for Review (instructors)
const handleSubmitForReview = async () => {
  // 1. Validate course completeness
  const errors = validateCourse()
  if (errors.length > 0) {
    toast.error('Please fix validation errors')
    return
  }
  
  // 2. Update course status
  const updatedCourse = {
    ...course,
    status: 'pending-review',
    submittedAt: Date.now()
  }
  
  // 3. Save to backend
  await saveCourse(updatedCourse)
  
  // 4. Send notification
  workflowNotifications.notifyCourseSubmitted(
    updatedCourse.id,
    contentManagerIds,
    user.name,
    updatedCourse.title
  )
  
  // 5. Navigate to dashboard
  toast.success('Course submitted for review')
  navigate('/my-courses')
}

// Direct Publish (content-managers/admins)
const handlePublish = async () => {
  // 1. Validate
  const errors = validateCourse()
  if (errors.length > 0) return
  
  // 2. Update status
  const updatedCourse = {
    ...course,
    status: 'published',
    published: true,
    publishedAt: Date.now()
  }
  
  // 3. Save
  await saveCourse(updatedCourse)
  
  // 4. Notify
  if (user.role === 'instructor') {
    workflowNotifications.notifyCoursePublished(
      updatedCourse.id,
      updatedCourse.createdBy,
      updatedCourse.title
    )
  }
  
  toast.success('Course published successfully')
  navigate('/my-courses')
}
```

---

## Step Details

### Step 1: Course Details
**Purpose:** Basic course metadata and configuration

**Fields:**
- Title (required, max 100 chars)
- Description (required, max 500 chars, rich text)
- Category (required, dropdown: Programming, Data Science, Design, Business, etc.)
- Difficulty (required, dropdown: Novice, Intermediate, Advanced, Expert)
- Enrollment Mode (required, radio: Open, Approval Required)
- Cover Image (optional, upload max 2MB, formats: jpg, png, webp)
- Estimated Hours (auto-calculated from lessons, editable)
- Tags (optional, multi-select)
- Language (required, default: Spanish)

**Validation:**
```typescript
const validateCourseDetails = () => {
  const errors = []
  
  if (!course.title?.trim()) {
    errors.push({ field: 'title', message: 'Title is required' })
  }
  
  if (course.title && course.title.length > 100) {
    errors.push({ field: 'title', message: 'Title must be under 100 characters' })
  }
  
  if (!course.description?.trim()) {
    errors.push({ field: 'description', message: 'Description is required' })
  }
  
  if (!course.category) {
    errors.push({ field: 'category', message: 'Category is required' })
  }
  
  return errors
}
```

**Next Button:** Enabled only when title, description, and category are filled.

---

### Step 2: Course Structure
**Purpose:** Define modules and lessons hierarchy

**Features:**
- Add/Edit/Delete modules
- Add/Edit/Delete lessons within modules
- Drag-and-drop reordering (modules and lessons independently)
- Visual tree structure with expand/collapse
- Module badges (optional icons)
- Lesson duration estimates (minutes)
- Auto-calculate total course hours

**Module Fields:**
- Title (required)
- Description (required)
- Order (auto-assigned, editable via drag-drop)
- Badge (optional, emoji or icon selector)

**Lesson Fields:**
- Title (required)
- Description (required)
- Estimated Minutes (required, number input)
- Order (auto-assigned within module)

**Validation:**
```typescript
const validateCourseStructure = () => {
  const errors = []
  
  if (course.modules.length === 0) {
    errors.push({ field: 'modules', message: 'At least one module is required' })
  }
  
  course.modules.forEach((module, mIdx) => {
    if (!module.title?.trim()) {
      errors.push({ field: `module-${mIdx}`, message: `Module ${mIdx + 1} title is required` })
    }
    
    if (module.lessons.length === 0) {
      errors.push({ field: `module-${mIdx}`, message: `Module "${module.title}" needs at least one lesson`, severity: 'warning' })
    }
    
    module.lessons.forEach((lesson, lIdx) => {
      if (!lesson.title?.trim()) {
        errors.push({ field: `lesson-${mIdx}-${lIdx}`, message: `Lesson ${lIdx + 1} in module ${mIdx + 1} title is required` })
      }
    })
  })
  
  return errors
}
```

**Next Button:** Enabled when at least one module with one lesson exists.

---

### Step 3: Content Editor
**Purpose:** Create lesson content with rich blocks

**Workflow:**
1. Select lesson from dropdown (grouped by module)
2. Add content blocks to lesson
3. Configure each block (content, accessibility, XP)
4. Preview lesson in student view

**Block Types:**

#### 1. Welcome Block
- Type: `welcome`
- Fields: title, message, character avatar
- Usage: First block of a lesson, sets the tone
- Accessibility: None required (text-based)

#### 2. Text Block
- Type: `text`
- Fields: content (rich text), character message (optional)
- Editor: TipTap or similar (bold, italic, lists, links)
- Accessibility: Alt text for inline images
- XP: Optional (for reading comprehension)

#### 3. Image Block
- Type: `image`
- Fields: image upload, caption
- Accessibility: Alt text (required), long description (optional)
- XP: Optional

#### 4. Audio Block
- Type: `audio`
- Fields: audio file upload, title
- Accessibility: Transcript (required)
- XP: Optional

#### 5. Video Block
- Type: `video`
- Fields: video upload or URL (YouTube, Vimeo), title
- Accessibility: Captions (required), transcript (optional), audio description (optional)
- XP: Optional

#### 6. Challenge Block
- Type: `challenge`
- Fields: challenge description, solution guidelines
- Usage: Hands-on exercises, projects
- XP: Required (reward for completion)

#### 7. Code Block
- Type: `code`
- Fields: code content, language (JavaScript, Python, etc.), description
- Editor: Syntax highlighting (CodeMirror or Monaco)
- Accessibility: Screen reader friendly code
- XP: Optional

**Block Interface:**
```typescript
interface LessonBlock {
  id: string
  type: 'welcome' | 'text' | 'image' | 'audio' | 'video' | 'challenge' | 'code'
  content: string
  accessibility?: {
    captions?: string
    transcript?: string
    altText?: string
    audioDescription?: string
  }
  characterMessage?: string
  xpValue?: number
  order: number
}
```

**Validation:**
```typescript
const validateContent = () => {
  const errors = []
  
  course.modules.forEach((module, mIdx) => {
    module.lessons.forEach((lesson, lIdx) => {
      if (lesson.blocks.length === 0) {
        errors.push({ 
          field: `lesson-${mIdx}-${lIdx}`, 
          message: `Lesson "${lesson.title}" has no content blocks`,
          severity: 'warning'
        })
      }
      
      lesson.blocks.forEach((block, bIdx) => {
        // Image blocks need alt text
        if (block.type === 'image' && !block.accessibility?.altText) {
          errors.push({
            field: `block-${mIdx}-${lIdx}-${bIdx}`,
            message: `Image block in "${lesson.title}" missing alt text`,
            severity: 'error'
          })
        }
        
        // Audio blocks need transcript
        if (block.type === 'audio' && !block.accessibility?.transcript) {
          errors.push({
            field: `block-${mIdx}-${lIdx}-${bIdx}`,
            message: `Audio block in "${lesson.title}" missing transcript`,
            severity: 'error'
          })
        }
        
        // Video blocks need captions
        if (block.type === 'video' && !block.accessibility?.captions) {
          errors.push({
            field: `block-${mIdx}-${lIdx}-${bIdx}`,
            message: `Video block in "${lesson.title}" missing captions`,
            severity: 'warning'
          })
        }
      })
    })
  })
  
  return errors
}
```

**Next Button:** No blocking validation, but shows warnings for incomplete accessibility.

---

### Step 4: Quiz Builder
**Purpose:** Add quizzes to lessons

**Workflow:**
1. Select lesson from dropdown
2. Add quiz to lesson (optional)
3. Configure quiz metadata (title, passing score, max attempts)
4. Add questions (one of 4 types)
5. Preview quiz

**Quiz Configuration:**
- Title (required)
- Description (optional)
- Passing Score (required, percentage 0-100, default 70%)
- Max Attempts (required, number 1-10, default 3)
- Total XP (auto-calculated from questions, editable)

**Question Types:**

#### 1. Multiple Choice
```typescript
interface MultipleChoiceQuestion {
  id: string
  type: 'multiple-choice'
  question: string
  options: string[] // 2-6 options
  correctAnswer: number // Index of correct option
  correctFeedback: string
  incorrectFeedback: string
  xpValue: number
}
```

#### 2. True/False
```typescript
interface TrueFalseQuestion {
  id: string
  type: 'true-false'
  question: string
  correctAnswer: boolean
  correctFeedback: string
  incorrectFeedback: string
  xpValue: number
}
```

#### 3. Matching
```typescript
interface MatchingQuestion {
  id: string
  type: 'matching'
  question: string
  pairs: Array<{ left: string; right: string }> // 3-8 pairs
  correctFeedback: string
  incorrectFeedback: string
  xpValue: number
}
```

#### 4. Scenario Solver
```typescript
interface ScenarioSolverQuestion {
  id: string
  type: 'scenario-solver'
  scenario: string // Long-form problem description
  question: string
  options: string[] // Possible solutions
  correctAnswer: number
  explanation: string // Why this is the best solution
  correctFeedback: string
  incorrectFeedback: string
  xpValue: number // Higher XP for complex scenarios
}
```

**Validation:**
```typescript
const validateQuizzes = () => {
  const errors = []
  
  course.modules.forEach((module, mIdx) => {
    module.lessons.forEach((lesson, lIdx) => {
      const quiz = lesson.quiz
      
      if (quiz) {
        if (!quiz.title?.trim()) {
          errors.push({ field: `quiz-${mIdx}-${lIdx}`, message: `Quiz in "${lesson.title}" needs a title` })
        }
        
        if (quiz.questions.length === 0) {
          errors.push({ field: `quiz-${mIdx}-${lIdx}`, message: `Quiz in "${lesson.title}" has no questions` })
        }
        
        if (quiz.passingScore < 0 || quiz.passingScore > 100) {
          errors.push({ field: `quiz-${mIdx}-${lIdx}`, message: `Quiz passing score must be 0-100` })
        }
        
        quiz.questions.forEach((question, qIdx) => {
          if (!question.question?.trim()) {
            errors.push({ field: `question-${mIdx}-${lIdx}-${qIdx}`, message: `Question ${qIdx + 1} text is required` })
          }
          
          if (question.type === 'multiple-choice' && question.options.length < 2) {
            errors.push({ field: `question-${mIdx}-${lIdx}-${qIdx}`, message: `Multiple choice needs at least 2 options` })
          }
        })
      }
    })
  })
  
  return errors
}
```

**Next Button:** No blocking validation if no quizzes added. Shows errors if quiz exists but incomplete.

---

### Step 5: Review & Publish
**Purpose:** Final review and workflow actions

**Components:**

#### Course Summary Card
- Title, category, difficulty
- Total modules, lessons, quizzes
- Total estimated hours
- Total XP available
- Cover image preview

#### Validation Checklist
```typescript
const getValidationChecklist = () => {
  return [
    { label: 'Course details complete', status: validateCourseDetails().length === 0 },
    { label: 'At least 1 module with lessons', status: course.modules.length > 0 && course.modules.some(m => m.lessons.length > 0) },
    { label: 'All lessons have content', status: course.modules.every(m => m.lessons.every(l => l.blocks.length > 0)) },
    { label: 'Accessibility requirements met', status: validateAccessibility().length === 0 },
    { label: 'All quizzes complete', status: validateQuizzes().filter(e => e.severity === 'error').length === 0 },
  ]
}
```

#### Preview Button
Opens PreviewModal showing course exactly as students will see it:
- Course landing page
- Module/lesson navigation
- Content rendering (all block types)
- Quiz interaction (read-only preview)

#### Action Buttons (Role-based)

**For Instructors:**
- **Save Draft** (always available)
  - Saves to backend with status: 'draft'
  - Shows toast: "Draft saved"
  - Stays on page
  
- **Submit for Review** (enabled when validation passes)
  - Updates status to 'pending-review'
  - Sends notification to content managers
  - Shows toast: "Course submitted for review"
  - Navigates to /my-courses

**For Content Managers/Admins:**
- **Save Draft** (always available)
- **Submit for Review** (if they're also instructors)
- **Publish Immediately** (enabled when validation passes)
  - Updates status to 'published'
  - Sets published: true
  - Makes course visible to students
  - Sends notification to course creator
  - Shows toast: "Course published"
  - Navigates to /my-courses

**Status Display:**
```tsx
<div className="flex items-center gap-3">
  <span className="text-sm text-muted-foreground">Current Status:</span>
  <StatusBadge status={course.status} />
</div>
```

---

## Auto-Save Implementation

### Strategy
- Save to `localStorage` every 30 seconds if changes detected
- Save to backend on:
  - Step navigation
  - Explicit "Save Draft" button
  - Before submit/publish
- Restore from localStorage on mount if newer than backend version

### useAutoSave Hook
```typescript
import { useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash'

interface UseAutoSaveOptions {
  key: string
  data: any
  onSave: (data: any) => Promise<void>
  interval?: number // milliseconds, default 30000
}

export function useAutoSave({ key, data, onSave, interval = 30000 }: UseAutoSaveOptions) {
  const [lastSaved, setLastSaved] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const initialData = useRef(data)
  
  // Detect changes
  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(initialData.current)) {
      setIsDirty(true)
    }
  }, [data])
  
  // Auto-save to localStorage
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(data))
        setLastSaved(Date.now())
        console.log('[AutoSave] Saved to localStorage')
      }, interval)
      
      return () => clearTimeout(timer)
    }
  }, [data, isDirty, interval, key])
  
  // Manual save to backend
  const saveToBacked = async () => {
    setIsSaving(true)
    try {
      await onSave(data)
      setLastSaved(Date.now())
      setIsDirty(false)
      initialData.current = data
      console.log('[AutoSave] Saved to backend')
    } catch (error) {
      console.error('[AutoSave] Failed to save:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }
  
  // Restore from localStorage
  const restoreFromLocalStorage = (): any | null => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('[AutoSave] Failed to restore:', error)
    }
    return null
  }
  
  // Clear localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem(key)
  }
  
  return {
    lastSaved,
    isSaving,
    isDirty,
    saveToBackend,
    restoreFromLocalStorage,
    clearLocalStorage,
  }
}
```

### Auto-Save Indicator Component
```tsx
import { FloppyDisk, CheckCircle, Warning } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'

interface AutoSaveIndicatorProps {
  lastSaved: number | null
  isSaving: boolean
  isDirty: boolean
}

export function AutoSaveIndicator({ lastSaved, isSaving, isDirty }: AutoSaveIndicatorProps) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FloppyDisk className="animate-pulse" size={16} />
        <span>Guardando...</span>
      </div>
    )
  }
  
  if (isDirty) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600">
        <Warning size={16} />
        <span>Cambios sin guardar</span>
      </div>
    )
  }
  
  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle size={16} />
        <span>Guardado {formatDistanceToNow(lastSaved, { addSuffix: true, locale: es })}</span>
      </div>
    )
  }
  
  return null
}
```

---

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance
1. **Keyboard Navigation:** All interactions accessible via keyboard
2. **Screen Reader Support:** Proper ARIA labels and descriptions
3. **Color Contrast:** 4.5:1 for text, 3:1 for UI components
4. **Focus Indicators:** Visible focus states on all interactive elements
5. **Semantic HTML:** Use appropriate HTML5 elements

### Per-Block Accessibility
- **Images:** Alt text required (max 250 chars)
- **Audio:** Transcript required (full text version)
- **Video:** Captions required, transcript optional, audio description optional
- **Code:** Screen reader friendly formatting

### Validation
- Show accessibility warnings before publish
- Block publish if critical accessibility missing (image alt text, audio transcripts)

---

## Backend Integration

### API Endpoints

#### GET /api/courses/:id
Fetch existing course for editing.

**Response:**
```typescript
{
  success: true,
  course: CourseStructure
}
```

#### POST /api/courses
Create new course.

**Request:**
```typescript
{
  course: Partial<CourseStructure> // Without id, createdAt
}
```

**Response:**
```typescript
{
  success: true,
  courseId: string
}
```

#### PUT /api/courses/:id
Update existing course (auto-save or manual save).

**Request:**
```typescript
{
  course: CourseStructure
}
```

**Response:**
```typescript
{
  success: true
}
```

#### POST /api/courses/:id/submit
Submit course for review (instructors).

**Response:**
```typescript
{
  success: true,
  message: "Course submitted for review"
}
```

#### POST /api/courses/:id/publish
Publish course (content-managers/admins).

**Response:**
```typescript
{
  success: true,
  message: "Course published"
}
```

#### POST /api/courses/:id/media
Upload media files (images, audio, video).

**Request:** FormData with file

**Response:**
```typescript
{
  success: true,
  url: string // CDN or storage URL
}
```

---

## File Structure

```
src/components/courses/modern-builder/
├── ModernCourseBuilder.tsx (Main container)
├── StepperNavigation.tsx
├── AutoSaveIndicator.tsx
│
├── steps/
│   ├── CourseDetailsStep.tsx
│   ├── CourseStructureStep.tsx
│   ├── ContentEditorStep.tsx
│   ├── QuizBuilderStep.tsx
│   └── ReviewPublishStep.tsx
│
├── content-blocks/
│   ├── BlockEditor.tsx (Block type selector & manager)
│   ├── WelcomeBlock.tsx
│   ├── TextBlock.tsx
│   ├── ImageBlock.tsx
│   ├── AudioBlock.tsx
│   ├── VideoBlock.tsx
│   ├── ChallengeBlock.tsx
│   └── CodeBlock.tsx
│
├── quiz-builder/
│   ├── QuizEditor.tsx
│   ├── QuestionList.tsx
│   ├── MultipleChoiceEditor.tsx
│   ├── TrueFalseEditor.tsx
│   ├── MatchingEditor.tsx
│   └── ScenarioSolverEditor.tsx
│
├── shared/
│   ├── MediaUploader.tsx
│   ├── AccessibilityFieldset.tsx
│   ├── ValidationAlert.tsx
│   ├── DragDropList.tsx
│   ├── PreviewModal.tsx
│   └── ConfirmDialog.tsx
│
└── hooks/
    ├── useAutoSave.ts
    ├── useCourseBuilder.ts
    └── useValidation.ts
```

---

## Testing Strategy

### Unit Tests
- Validation functions
- Auto-save hook logic
- Data transformations

### Integration Tests
1. Create course end-to-end
2. Edit existing course
3. Auto-save triggers correctly
4. Quiz creation (all 4 types)
5. Workflow submission
6. Content manager approval
7. Student preview
8. Accessibility features
9. Drag-drop reordering
10. Media uploads

### Manual Testing Checklist
- [ ] Create course as instructor
- [ ] Save draft and restore
- [ ] Submit for review
- [ ] Approve as content manager
- [ ] Direct publish as admin
- [ ] Add all 7 block types
- [ ] Add all 4 quiz types
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Upload images, audio, video
- [ ] Reorder modules/lessons via drag-drop
- [ ] Preview as student
- [ ] Validation errors displayed correctly
- [ ] Auto-save indicator updates

---

## Migration Strategy

### Phase 1: Build (This PR)
- Create all components in `modern-builder/` directory
- Don't touch existing CourseBuilder.tsx yet
- Test in isolation

### Phase 2: Integration
- Rename `CourseBuilder.tsx` → `LegacyCourseBuilder.tsx`
- Update `CourseManagement.tsx` to use `ModernCourseBuilder`
- Update all imports

### Phase 3: Cleanup
- After 1 week of testing, remove legacy builder
- Clean up unused imports
- Update documentation

---

## Success Criteria

✅ Instructors can create courses with:
- Multiple modules and lessons
- Rich content (7 block types)
- Quizzes (4 types)
- Accessibility metadata

✅ Auto-save works reliably

✅ Workflow integration:
- Save draft
- Submit for review
- Publish (role-based)

✅ Content managers can approve courses

✅ Students see published courses

✅ WCAG 2.1 AA compliant

✅ All tests passing

---

## Future Enhancements
- **Version History:** Compare and restore previous versions
- **Collaboration:** Multiple authors working on same course
- **Templates:** Course templates for common patterns
- **AI Assistant:** Auto-generate content suggestions
- **Analytics:** Track draft completion rates
- **Bulk Import:** Import courses from JSON/CSV
- **Export:** Export courses to SCORM, xAPI

---

## References
- CourseStructure schema: `/src/schemas/course.schema.ts`
- Workflow notifications: `/src/services/workflow-notifications.service.ts`
- Quiz components: `/src/components/quiz/`
- Accessibility guide: `/docs/ACCESSIBILITY_STYLE_GUIDE.md`
