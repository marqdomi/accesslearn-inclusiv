# GameLearn Admin Panel

## Overview
The GameLearn Admin Panel is a comprehensive, intuitive tool for HR and training staff to create, manage, and deploy accessible gamified training courses.

## Accessing the Admin Panel
Click the "Admin" button in the top navigation bar to enter admin mode.

## Core Features

### 1. Admin Dashboard
- **At-a-glance metrics**: Total courses, active learners, completion rates, XP awarded
- **Quick actions**: Create course, manage users, view reports, configure gamification
- **Getting started guide**: Step-by-step instructions for first-time admins

### 2. Course Management
- **Create new courses**: Build training courses from scratch
- **Edit existing courses**: Modify published or draft courses
- **Search and filter**: Find courses quickly
- **Draft/Published status**: Control course visibility to learners

### 3. Course Builder
Comprehensive course authoring with three tabs:

#### Course Details
- Title, description, category
- Estimated hours
- Auto-save functionality

#### Course Structure
- **Visual hierarchy**: Course → Modules → Lessons
- **Drag and drop**: Reorder modules and lessons
- **Add/Edit/Delete**: Full CRUD operations
- **Nested structure**: Expandable/collapsible modules

#### Preview
- See exactly how learners will view your course
- Module count and structure overview

### 4. Lesson Editor
Build engaging lesson content with multiple block types:

#### Content Blocks
- **Welcome**: Character message + welcome content
- **Text**: Standard text content with formatting
- **Image**: Image with mandatory alt text
- **Video**: Video with mandatory captions file
- **Audio**: Audio with mandatory transcript
- **Challenge**: Interactive challenge with XP rewards

#### Accessibility Guardrails
- **Required fields**: Alt text for images, captions for video, transcripts for audio
- **Validation**: Cannot save without accessibility data
- **Helpful tooltips**: Guidance on how to write good alt text, captions, etc.
- **Visual indicators**: Required fields marked with red badges

### 5. User Management

#### Users Tab
- **Add users manually**: Create individual user accounts
- **User roles**: Employee or Admin
- **Assign courses**: Dropdown to assign published courses to users
- **View assignments**: See how many courses each user has

#### Groups Tab
- **Create groups**: Organize users (e.g., "New Hires", "Sales Team")
- **Bulk assignment**: Assign courses to entire groups at once
- **Track membership**: See user and course counts per group

### 6. Gamification Hub

#### XP Settings
Configure default XP values for:
- Complete Module (default: 50 XP)
- Complete Course (default: 200 XP)
- Pass Assessment (default: 100 XP)
- Daily Login (default: 10 XP)
- Perfect Score bonus (default: 50 XP)

#### Badge Creator
- **Create custom badges**: Name, description, and icon (emoji or URL)
- **Visual preview**: See how badges appear to learners
- **Assignment**: Link badges to course/module completion

### 7. Reports & Analytics

#### Overview Metrics
- Total learners
- Published courses
- Total enrollments
- Completion count

#### User Progress
- Individual user tracking
- Completion percentages
- Visual progress bars
- Status badges (Completed, In Progress, Not Started)

#### Export Functionality
- **CSV export**: Download complete learning data
- Includes: User name, email, course, status, progress %, assessment scores

## Design Philosophy

### Simplicity Empowers Accessibility
The admin panel is designed for non-technical users:
- **No coding required**: Everything is visual and form-based
- **Clear labels**: Every field has helpful descriptions
- **Guided creation**: Tooltips and helper text throughout
- **Validation feedback**: Clear error messages before publishing

### Accessibility-First
Built-in guardrails prevent publishing inaccessible content:
- **Mandatory accessibility fields**: System requires alt text, captions, and transcripts
- **Visual warnings**: Red badges and error messages for missing accessibility data
- **Preview mode**: See content through learner's eyes before publishing
- **WCAG compliance**: All admin interfaces are fully keyboard navigable

### Professional & Efficient
- **Clean design**: Ample white space, clear visual hierarchy
- **Auto-save**: Drafts save automatically
- **Quick actions**: Common tasks one click away
- **Search and filter**: Find content quickly

## Workflow Example

### Creating Your First Course

1. **Navigate to Admin Panel**
   - Click "Admin" button in navigation

2. **Create New Course**
   - Click "Create New Course" from dashboard or course management
   - Fill in course details (title, description, category, estimated hours)

3. **Build Course Structure**
   - Switch to "Course Structure" tab
   - Add modules with titles and descriptions
   - Add lessons to each module

4. **Edit Lesson Content**
   - Click "Edit" on a lesson
   - Add content blocks (text, image, video, audio, challenges)
   - Fill in required accessibility fields
   - Set XP values for challenges
   - Save lesson

5. **Preview Course**
   - Switch to "Preview" tab
   - Review how learners will see the course

6. **Validate & Publish**
   - Click "Publish Course"
   - System validates all accessibility requirements
   - Fix any errors shown in validation alert
   - Publish when validation passes

7. **Assign to Learners**
   - Go to User Management
   - Assign course to individuals or groups

8. **Monitor Progress**
   - View Reports & Analytics
   - Track completion rates
   - Export data to CSV

## Keyboard Shortcuts

- **Tab**: Navigate between fields
- **Enter**: Submit forms
- **Escape**: Close dialogs
- **Arrow keys**: Navigate dropdowns and selects

## Best Practices

### Writing Alt Text
- Be specific and concise
- Describe the image's content and purpose
- Avoid "image of" or "picture of"
- Example: ❌ "Image of a chart" → ✓ "Bar chart showing 40% increase in sales from Q1 to Q2"

### Captions for Video
- Upload .vtt or .srt files
- Ensure captions are synchronized
- Include speaker identification if multiple speakers
- Caption sound effects when relevant

### Audio Transcripts
- Provide complete text version
- Include speaker names
- Note important non-speech sounds
- Format for readability

### XP Values
- Keep rewards proportional to effort
- Suggested ranges:
  - Simple lessons: 20-50 XP
  - Modules: 50-100 XP
  - Courses: 200-500 XP
  - Challenges: 10-50 XP depending on difficulty
  - Perfect scores: 25-50 XP bonus

### Course Organization
- Keep modules focused on single topics
- Limit lessons to 5-10 minutes each
- Use descriptive, action-oriented titles
- Group related content together

## Troubleshooting

### "Cannot publish" error
- Check validation alert for specific errors
- Ensure all images have alt text
- Ensure all videos have caption files
- Ensure all audio has transcripts
- Verify all required fields are filled

### Course not appearing for users
- Ensure course is published (not draft)
- Verify course is assigned to user or their group
- Check that user has correct role (employee can't see admin-only courses)

### Changes not saving
- Check internet connection
- Ensure you're clicking "Save" buttons
- Drafts auto-save, but must explicitly save lessons
- Refresh page if issues persist

## Support
Built with accessibility and ease-of-use as top priorities. All interfaces meet WCAG AA standards and are fully keyboard navigable.
