# Professional Course Authoring Tool (CAT) - User Guide

## Overview

The Professional Course Authoring Tool empowers non-technical users (HR professionals, trainers, subject matter experts) to create, manage, and publish fully accessible training missions without developer assistance. The tool provides an intuitive visual interface with built-in accessibility guardrails to ensure WCAG 2.1 Level AA compliance.

## Key Features

### 1. Visual Course Builder with Drag-and-Drop

**Purpose**: Build course structure through direct visual manipulation

**How to Use**:
1. Navigate to Admin Panel → Course Management → Create New Course
2. Fill in course details (title, description, category, difficulty)
3. Switch to "Course Structure" tab
4. Click module type buttons to add:
   - **Lesson Module**: Text, images, and video content
   - **Quiz Module**: Assessments with multiple question types
   - **Completion Module**: Certificate/badge award upon completion
5. Drag modules up/down to reorder (or use arrow buttons)
6. Click "Edit" on any module to configure it
7. Save as draft or publish when ready

**Visual Indicators**:
- ⚠️ Warning badge: Missing required accessibility data
- ✓ Green checkmark: All requirements met
- Badge colors: Draft (gray), Published (blue)

---

### 2. WYSIWYG Lesson Editor

**Purpose**: Create rich multimedia lessons without HTML knowledge

**Content Types**:

#### Text Content
- Use formatting toolbar: **Bold**, *Italic*, Bullet Lists, Numbered Lists
- Write in plain text with simple markdown-like syntax
- Preview updates in real-time

#### Image Upload
1. Switch to "Image Upload" tab
2. Click "Choose Image File" or drag-and-drop
3. **REQUIRED**: Fill in Alt Text field (minimum 10 characters)
4. Save button disabled until alt text provided
5. Describe image content for screen reader users

**Example Alt Text**:
- ❌ Bad: "image"
- ✓ Good: "Bar chart showing 25% increase in quarterly sales"

#### Video Embedding
1. Switch to "Video" tab
2. Paste URL from YouTube, Vimeo, or Wistia
3. **REQUIRED**: Upload caption file (.srt or .vtt)
4. Publish button disabled until captions uploaded
5. Captions ensure accessibility for deaf/hard-of-hearing learners

**Supported Video Platforms**:
- YouTube (youtube.com or youtu.be URLs)
- Vimeo (vimeo.com URLs)
- Wistia (wistia.com URLs)
- Direct MP4 uploads (coming soon)

---

### 3. Advanced Quiz Builder

**Purpose**: Create professional assessments beyond basic multiple-choice

**Question Types**:

#### 1. Multiple Choice (Single Answer)
- Radio buttons for options
- Only one correct answer
- Suggested XP: 50-100 per question

#### 2. Multiple Select (Check All That Apply)
- Checkboxes for options
- Multiple correct answers
- Learner must select all correct options
- Suggested XP: 100-150 per question

#### 3. True/False
- Two options: True or False
- Quick knowledge checks
- Suggested XP: 25-50 per question

#### 4. Short Answer
- Text input field
- Define acceptable keyword(s)
- Comma-separate multiple acceptable answers
- Example: "HTML, Hypertext Markup Language"
- Suggested XP: 75-125 per question

#### 5. Ordering/Sequencing
- Drag items into correct order
- Tests process understanding
- Options shuffled for learner
- Suggested XP: 100-150 per question

**Custom Feedback**:
- **Correct Feedback**: Celebratory message when answer is right
  - Example: "¡Excelente! Ese es el concepto clave. +100 XP"
- **Incorrect Feedback**: Gentle guidance when answer is wrong
  - Example: "Casi. Recuerda que HTML es para estructura, no estilo. ¡Inténtalo de nuevo!"

**Quiz Configuration**:
- Set XP value per question (recommended: 50-150)
- Total quiz XP calculated automatically
- Reorder questions by dragging or using arrows
- Preview quiz from learner perspective

---

### 4. Accessibility Guardrails (CRITICAL)

**Purpose**: Prevent publication of inaccessible content

The system enforces WCAG 2.1 Level AA compliance through:

#### Image Accessibility
- ✅ **Required**: Alt text for every image
- Minimum 10 characters
- Save button disabled until alt text provided
- Warning: "Image missing alt text (required for accessibility)"

#### Video Accessibility
- ✅ **Required**: Caption file (.srt or .vtt) for every video
- Upload caption file before publishing
- Publish button disabled until captions uploaded
- Warning: "Video missing captions (required for accessibility)"

#### Audio Accessibility
- ✅ **Required**: Transcript for audio-only content
- Upload or paste transcript text
- Save disabled until transcript provided

#### Accessibility Validation
- Real-time validation as you build
- Warning badges appear on incomplete modules
- Publication checklist shows all requirements
- Green checkmarks when requirements met
- Red warnings when data missing

**Publication Requirements**:
1. Course title ✓
2. Course description ✓
3. Course category ✓
4. At least one module ✓
5. Enrollment mode selected ✓
6. **All images have alt text** ✓
7. **All videos have captions** ✓
8. **All audio has transcripts** ✓

---

### 5. Gamification Controls

**Purpose**: Configure XP rewards and achievement unlocks

**Module-Level Rewards**:
- Set XP value for completing each lesson
- Link achievement badge to module completion
- Achievement dropdown shows all available badges
- Preview badge icon and description

**Course-Level Rewards**:
- Set total course XP (auto-calculated from all modules)
- Link achievement to course completion
- Example: "Web Development Master" badge unlocks upon course completion

**Suggested XP Values**:
- Lesson block: 15-30 XP
- Lesson complete: 50 XP
- Quiz question: 50-150 XP (based on difficulty)
- Module complete: 100 XP
- Course complete: 500-1000 XP

**Achievement Linking**:
1. Edit module or course settings
2. Scroll to "Rewards" section
3. Select achievement from dropdown
4. Preview shows achievement icon and title
5. Learner unlocks achievement upon completion

---

### 6. Publishing Workflow

**Purpose**: Safe editing with controlled publication

#### Draft Mode (Default)
- All new courses start as Draft
- Draft courses invisible to learners
- Edit freely without affecting users
- Auto-save preserves work
- Gray "Draft" badge in header

#### Publishing Process
1. Click "Publish Course" button
2. Review publication checklist
3. Fix any errors highlighted in red
4. Confirm publication when all requirements met
5. Course goes live immediately
6. Blue "Published" badge with timestamp

#### Enrollment Modes

**Open Enrollment**:
- Anyone can enroll from Mission Library
- Course visible to all learners
- Self-service enrollment
- Best for: General training, onboarding, skills development

**Restricted (Request Access)**:
- Course visible in library
- Learners see "Request Access" button
- Admin must approve requests
- Best for: Specialized training, certification programs

**Admin-Assign Only (Hidden)**:
- Course hidden from Mission Library
- Only assigned users can access
- Admin assigns to individuals or groups
- Best for: Confidential training, role-specific content, compliance

#### Updating Published Courses
- Edit published course (creates new draft)
- Make changes
- Click "Update Published" to push changes live
- Changes apply immediately
- Updated timestamp shown

---

## Step-by-Step: Creating Your First Course

### Example: "Introduction to Web Development"

**Step 1: Course Details**
1. Click "Create New Course"
2. Enter title: "Introduction to Web Development"
3. Enter description: "Learn the fundamentals of HTML, CSS, and JavaScript..."
4. Category: "Web Development"
5. Difficulty: "Novice"
6. Estimated Hours: 2
7. Save Draft

**Step 2: Build Structure**
1. Switch to "Course Structure" tab
2. Click "Add Lesson" → Edit module
   - Title: "What is HTML?"
   - Description: "Understanding the building blocks of the web"
3. Click "Add Quiz" → Edit module
   - Title: "HTML Knowledge Check"
4. Click "Add Completion" → Edit module
   - Title: "You've Completed Web Dev 101!"

**Step 3: Add Lesson Content**
1. Edit "What is HTML?" lesson
2. Add text block with WYSIWYG editor:
   ```
   **HTML** stands for HyperText Markup Language.
   
   Key concepts:
   - HTML provides structure
   - CSS provides style
   - JavaScript provides interactivity
   ```
3. Add image: Upload diagram of HTML structure
4. **REQUIRED**: Add alt text: "Diagram showing HTML, CSS, and JavaScript layers"
5. Add video: Paste YouTube URL
6. **REQUIRED**: Upload captions file (HTML-intro.srt)
7. Set lesson XP: 100
8. Save lesson

**Step 4: Build Quiz**
1. Edit "HTML Knowledge Check" module
2. Click "Add Question" → Multiple Choice
3. Question: "What does HTML stand for?"
4. Options:
   - HyperText Markup Language ✓
   - HighText Modern Language
   - HyperTool Markup Language
   - HomeText Markup Language
5. Mark first option as correct
6. Correct feedback: "Perfect! HTML is HyperText Markup Language. +50 XP"
7. Incorrect feedback: "Not quite! Review the lesson and try again."
8. XP value: 50
9. Add 2 more questions
10. Save quiz

**Step 5: Configure Rewards**
1. Edit course details
2. Select completion achievement: "Web Dev Basics" badge
3. Total XP auto-calculated: 500 XP

**Step 6: Publishing Settings**
1. Switch to "Publishing Settings" tab
2. Select enrollment mode: "Open Enrollment"
3. Review publication checklist
4. All items checked ✓

**Step 7: Publish**
1. Click "Publish Course"
2. Review summary dialog
3. Click "Publish Course"
4. Success! Course now visible in Mission Library

---

## Acceptance Criteria Checklist

Use this checklist to verify your course meets all requirements:

### Content Requirements
- [ ] Course has descriptive title
- [ ] Course has detailed description (minimum 50 characters)
- [ ] Course category selected
- [ ] Difficulty level set
- [ ] At least one lesson or quiz module added

### Accessibility Requirements
- [ ] All images have alt text (minimum 10 characters each)
- [ ] All videos have caption files uploaded (.srt or .vtt)
- [ ] All audio has transcripts
- [ ] No accessibility warnings in validation panel

### Gamification Configuration
- [ ] XP values set for lessons and quizzes
- [ ] Total course XP is reasonable (500-2000 for typical course)
- [ ] Achievement badge selected (optional but recommended)

### Publishing Configuration
- [ ] Enrollment mode selected (Open/Restricted/Admin-Only)
- [ ] Course tested in preview mode
- [ ] All modules reviewed and complete

### Post-Publication
- [ ] Course appears in Mission Library (if Open/Restricted)
- [ ] Learners can enroll successfully
- [ ] Content displays correctly
- [ ] Quizzes function as expected
- [ ] XP awards correctly
- [ ] Achievements unlock as configured

---

## Troubleshooting

### "Cannot save lesson with image"
**Cause**: Alt text field is empty or too short
**Solution**: Fill in alt text field with descriptive text (minimum 10 characters)

### "Cannot publish course with video"
**Cause**: Caption file not uploaded
**Solution**: Upload .srt or .vtt caption file for the video

### "Publish button is disabled"
**Cause**: One or more publication requirements not met
**Solution**: Review publication checklist, fix items marked with ⚠️

### "Course not appearing in Mission Library"
**Cause**: Enrollment mode set to "Admin-Assign Only"
**Solution**: Change to "Open" or "Restricted" in Publishing Settings

### "Total XP not updating"
**Cause**: Changes not saved
**Solution**: Click "Save Draft" to recalculate total XP

### "Learners cannot access course"
**Cause**: Course still in Draft mode
**Solution**: Click "Publish Course" to make visible

---

## Best Practices

### Content Creation
1. **Keep lessons focused**: 5-10 minutes per lesson
2. **Use multimedia**: Mix text, images, and video
3. **Chunk content**: Break complex topics into multiple lessons
4. **Provide context**: Start each lesson with "You'll learn..."

### Accessibility
1. **Alt text**: Describe what's in the image, not just "image" or "photo"
2. **Captions**: Use professional caption services for best results
3. **Contrast**: Use high-contrast colors for text
4. **Language**: Use plain, simple language

### Assessment Design
1. **Mix question types**: Don't use only multiple choice
2. **Clear questions**: One concept per question
3. **Helpful feedback**: Explain why answers are correct/incorrect
4. **Fair XP**: Harder questions = more XP

### Gamification
1. **Balanced rewards**: Not too stingy, not too generous
2. **Meaningful achievements**: Link to real accomplishments
3. **Celebrate completion**: Use completion module for recognition

### Course Management
1. **Save often**: Draft mode auto-saves, but manual saves are faster
2. **Preview before publishing**: Test from learner perspective
3. **Iterate**: Update based on feedback
4. **Monitor analytics**: Check completion rates and scores

---

## Support & Resources

### Getting Help
- **Admin Guide**: See ADMIN_GUIDE.md for full admin features
- **Accessibility Guide**: See ACCESSIBILITY.md for WCAG compliance details
- **Gamification Guide**: See GAMIFICATION_GUIDE.md for XP/achievement configuration

### Caption File Resources
- **YouTube Auto-Captions**: Download auto-generated captions and edit for accuracy
- **Rev.com**: Professional caption service ($1-3/minute)
- **Otter.ai**: AI-powered transcription and captions
- **Subtitle Edit**: Free software for creating/editing .srt files

### Design Resources
- **Unsplash**: Free stock images (remember to add alt text!)
- **Canva**: Create custom graphics for courses
- **Loom**: Record and share training videos easily

---

## Version History

**v2.0 - Professional Course Authoring Tool**
- Visual drag-and-drop course builder
- WYSIWYG lesson editor with rich media support
- Advanced quiz builder (5 question types)
- Accessibility guardrails (mandatory alt text, captions, transcripts)
- Gamification controls (XP and achievement configuration)
- Draft/Published workflow
- Enrollment mode integration
- Real-time accessibility validation

**v1.0 - Basic Course Builder**
- Simple text-based course creation
- Basic multiple-choice quizzes
- Manual accessibility fields

---

## Quick Reference

### Keyboard Shortcuts
- `Ctrl/Cmd + S`: Save draft
- `Esc`: Close dialog
- Arrow keys: Navigate between quiz options

### File Format Support
- **Images**: JPG, PNG, GIF
- **Video URLs**: YouTube, Vimeo, Wistia
- **Captions**: .srt, .vtt

### Suggested Timings
- Lesson: 5-10 minutes
- Quiz: 5-15 questions
- Course: 1-3 hours total

### XP Guidelines
- Lesson block: 15-30 XP
- Lesson: 50 XP
- Quiz question: 50-150 XP
- Course: 500-2000 XP
