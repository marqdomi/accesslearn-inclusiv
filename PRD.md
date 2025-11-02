# Planning Guide

A gamified corporate learning platform that makes training feel like playing a video game - fun, rewarding, and motivating - while guaranteeing 100% accessibility compliance for employees with diverse disabilities.

**Experience Qualities**:
1. **Playful & Engaging** - Every interaction feels like playing a game rather than studying, with colorful visuals, satisfying animations, and instant rewards that make learning addictive and fun.
2. **Empowering & Clear** - Simple, intuitive game mechanics with high contrast visuals ensure all users can independently navigate and succeed regardless of ability.
3. **Rewarding & Motivating** - Constant positive feedback through XP gains, achievement unlocks, progress bars, and celebratory effects that build momentum and encourage consistent engagement.

**Complexity Level**: Light Application (gamified features with persistent state)
A focused platform combining educational content delivery with video game-inspired progression systems - XP, levels, achievements, quests, and leaderboards - all designed with accessibility-first principles to ensure universal playability.

## Adaptive Gamification & Personalization System

### Scalable Progression System (The Infinite Game)

**XP Rewards Structure** (Prioritized by Value):
- Daily Login: +10 XP (habit formation)
- Lesson Block Complete: +15 XP (micro-progress)
- Interactive Challenge Complete: +30 XP (active engagement)
- Lesson Complete: +50 XP (checkpoint milestone)
- Module Complete: +100 XP (major milestone)
- Quiz Pass (70%+): +150 XP (knowledge validation)
- Quiz Perfect (100%): +250 XP (mastery bonus)
- Course Complete: +500 XP (achievement unlock)
- Final Assessment Pass: +500 XP (certification level)
- Final Assessment Perfect: +750 XP (excellence reward)
- First Try Bonus: +100 XP (efficiency incentive)
- 3-Day Streak: +25 XP (consistency bonus)
- 7-Day Streak: +75 XP (habit reinforcement)
- 30-Day Streak: +300 XP (dedication reward)
- Speed Bonus: +50 XP (performance incentive)
- Return After Failure: +25 XP (resilience reward)
- Complete with Accessibility Features: +20 XP (inclusive bonus)

**Infinite Level Scaling**:
- Levels 1-5: Fast progression (100 XP × 1.5^level) for early motivation
- Levels 6-20: Moderate scaling (+200 XP per level) for sustained engagement
- Levels 21+: Linear scaling (+500 XP per level) ensuring infinite scalability
- New content automatically feeds into existing XP economy
- No level cap - system supports unlimited growth

**Rank Progression** (Every 5 Levels):
Novice → Learner → Student → Scholar → Specialist → Expert → Professional → Master → Grandmaster → Legend → Champion → Hero

### Achievement Strategy (Tiered & Scalable)

**Course Completion Tiers**:
- First Steps (1 course) - Bronze
- Learning Specialist I (5 courses) - Silver
- Learning Specialist II (10 courses) - Gold
- Learning Specialist III (15 courses) - Platinum
- Learning Master (25 courses) - Platinum
- Learning Legend (50 courses) - Platinum

**Assessment Excellence Tiers** (90%+ scores):
- Assessment Specialist I (5 assessments) - Silver
- Assessment Specialist II (10 assessments) - Gold
- Assessment Specialist III (25 assessments) - Platinum

**Streak Achievements** (Evergreen Cycling):
- 7-Day Study Streak - Silver
- 30-Day Study Streak - Gold
- Streak Specialist I (60 days) - Platinum
- Streak Specialist II (90 days) - Platinum
- Unstoppable (180 days) - Platinum

**Module Milestones** (Scales with Content):
- Module Specialist I (25 modules) - Bronze
- Module Specialist II (50 modules) - Silver
- Module Specialist III (100 modules) - Gold
- Module Master (250 modules) - Platinum
- Module Legend (500 modules) - Platinum

**Special Achievements**:
- Perfect Score (100% on any assessment) - Gold
- First Try Success (pass on first attempt) - Bronze
- Quick Study (10 modules in one session) - Silver
- Speed Runner (course in under 1 hour) - Gold (Hidden)
- Quarterly Engagement Badge (10 activities per quarter) - Silver (Hidden)

### Adaptive Feedback & Remediation

**Constructive Failure Messaging**:
- 100%: "Perfect! You aced it on your first try! Outstanding work!" 🎉
- 90-99%: "Excellent work! You've mastered this material!" 🌟
- 70-89%: "Great job! You passed! Keep up the good work!" ✅
- 50-69%: "Mission incomplete, but you're close! Review and try again!" 💪
- <50%: "Don't worry! Focus on these specific areas and you'll ace it!" 🎯

**Intelligent Remediation**:
- System analyzes failed questions to identify specific missed concepts
- Offers targeted micro-resources (30-second video clips, specific paragraphs)
- No full module repetition - only review what's needed
- Remediation suggestions prioritized by frequency of errors
- Types: Video Segment (with timestamp), Text Section, Interactive Challenge

**Progress Retention (Auto-Save)**:
- Saves at start of every lesson block
- Saves after every question answered
- Saves every 30 seconds during active session
- Saves on browser close/tab switch
- Saves current position, answered questions, video timestamps, time spent
- Visual indicator shows last save time
- Resume exactly where user left off after any interruption

### Smart Personalization & Accessibility Integration

**Automatic Accessibility Profile Application**:
- All preferences recalled from onboarding automatically
- High Contrast mode applies instantly across all new content
- Reduced Motion preference respected in all animations
- Text Size preference scales all content dynamically
- Font family preference (if set) applied globally
- Settings persist forever, never require re-entry

**Adaptive Media Delivery Requirements**:
- Video content flagged "incomplete" until captions added (required for all)
- Audio description track required before publishing if user has visual impairment flag
- Alternative text required for all images before publishing
- Transcript required for all audio/video content
- Admin publishing blocked until all accessibility data complete
- Real-time validation with specific error messages

**Pacing & Time Extensions**:
- Timed assessments automatically grant 200% time for users with accessibility needs
- Custom time multiplier supported per user profile
- All timers show extended time without stigma or special indication
- No time limits are mandatory - all assessments can be untimed
- Extended time applies to: quizzes, final assessments, challenges

**Accessibility Validation on Upload**:
- Admin sees checklist of required accessibility data
- Visual indicators show missing vs complete requirements
- Publishing button disabled until all required fields filled
- Warnings for recommended improvements (audio description)
- Suggestions for enhancement (longer alt text descriptions)

## Essential Features

### 1. Corporate Login & Authentication System
- **Functionality**: Secure, accessible login screen with email/password fields, password visibility toggle, forgot password link, and clear error messaging. Supports both temporary (first-time) and permanent (returning user) passwords.
- **Purpose**: Provide secure, WCAG-compliant access control while maintaining ease of use for all employees including those with disabilities
- **Trigger**: User navigates to platform URL or session expires
- **Progression**: Login screen loads → User enters email/password → System validates credentials → First-time users proceed to password change → Returning users access dashboard
- **Success criteria**: All form fields have visible labels, password toggle works with keyboard, error messages are announced by screen readers, login persists for 2 hours, accessibility standards met (4.5:1 contrast, 44px touch targets)

### 2. First-Time Password Change Flow
- **Functionality**: Mandatory password change screen for first-time login with current/new/confirm password fields, real-time password strength indicator, requirement checklist (8+ chars, uppercase, lowercase, number, special char), and clear visual feedback
- **Purpose**: Ensure account security while guiding users to create strong passwords through educational UI
- **Trigger**: Successful first login with temporary credentials
- **Progression**: Enter temporary password → Create new password → View strength meter and requirements → Confirm new password → Validate all requirements → Password updated → Proceed to onboarding
- **Success criteria**: Password strength visualized accessibly (color + text), requirements checklist uses checkmarks + text labels, all fields keyboard navigable, validation errors are descriptive and actionable

### 3. Employee Onboarding & Accessibility Check-In
- **Functionality**: Two-step onboarding wizard: (1) Create player identity (display name, avatar selection from 8 emoji options, preview card), (2) Set accessibility preferences (high contrast mode, text size selection, reduce motion toggle, disable sound effects toggle) with clear descriptions and instant previews
- **Purpose**: Personalize the user experience and capture accessibility needs before showing main content, ensuring optimal UX from first interaction
- **Trigger**: After successful password change on first login
- **Progression**: Welcome message → Step 1: Choose display name and avatar → Preview identity card → Step 2: Configure accessibility (high contrast, text size, motion, sound) → Review preferences → Complete setup → Dashboard appears with applied preferences
- **Success criteria**: All preferences persist across sessions, avatar selection is keyboard accessible, text size changes preview in real-time, reduce motion is respected immediately, preferences can be changed later from accessibility panel

### 4. Corporate Admin Bulk Employee Enrollment
- **Functionality**: CSV upload interface for bulk employee creation with template download, file validation, automatic secure temporary password generation (readable format like "SwiftEagle4782!"), success/failure reporting with detailed errors, and credential download (CSV with email, name, dept, temp password, instructions)
- **Purpose**: Enable HR/training teams to efficiently onboard entire cohorts without manual account creation
- **Trigger**: Admin navigates to "Bulk Enrollment" section
- **Progression**: Download CSV template → Fill with employee data (email, firstName, lastName, department) → Upload file → System validates and processes → View success/failure summary → Download credentials CSV → Distribute to employees
- **Success criteria**: CSV parser handles common formatting variations, duplicate email detection prevents conflicts, generated passwords are strong yet readable, credentials download includes clear instructions for employees, failed rows display actionable error messages

### 5. Employee Group Management
- **Functionality**: Create and manage groups (e.g., "New Hires", "Sales Team") with name, description, and member selection via checkbox list. View all groups in table with member count, assigned courses, and creation date. Delete groups with confirmation.
- **Purpose**: Organize employees for batch course assignment and simplified administration
- **Trigger**: Admin navigates to "Create Groups" section
- **Progression**: Click create group → Enter name and description → Select members from employee list via checkboxes → Preview selected count → Save group → Group appears in overview table
- **Success criteria**: Groups are searchable/filterable, member selection works with keyboard, groups display member count badge, deletion requires confirmation, empty state guides users to create first group

### 6. Course Assignment Manager
- **Functionality**: Assign courses to groups or individual employees via dropdown selectors. Toggle between group/individual assignment modes. View all assignments in separate tables (group assignments show member count, individual assignments list by employee). Real-time assignment creation with toast confirmations.
- **Purpose**: Simplify the process of assigning training (missions/quests) to the right employees
- **Trigger**: Admin navigates to "Assign Courses" section
- **Progression**: Select assignment type (group/individual) → Choose course from dropdown → Choose target group/employee → Assign → View confirmation → Assignment appears in relevant table
- **Success criteria**: Assignments are instant, dropdowns are keyboard accessible, tables show clear status (Active/Complete), assignments persist across sessions, duplicate prevention avoids redundant assignments

### 7. Corporate Reporting & Analytics Dashboard
- **Functionality**: Two-tab reporting interface: (1) Course Completion - shows completion rates, in-progress, not-started counts per course with visual/table toggle, (2) Engagement Metrics - displays average daily XP, courses in progress/completed, learning streaks per user. Includes overall metrics cards (total users, courses, completion %, avg XP). Export to CSV functionality for both report types.
- **Purpose**: Provide HR/training teams with actionable insights on training effectiveness and employee engagement
- **Trigger**: Admin navigates to "Analytics Dashboard" section
- **Progression**: View overview metrics → Select tab (Completion/Engagement) → Toggle between visual/table view → Filter/sort data → Export to CSV for further analysis
- **Success criteria**: All charts have table view alternative for screen readers, CSV exports include all data with headers, metrics update in real-time, visual progress bars use color + percentage text, high contrast mode is respected

### 8. User Dashboard (Operations Base)
- **Functionality**: Centralized command center showing player identity (avatar, level, XP bar), main mission (most urgent/recent course), progress goals (achievements, learning streak), side missions (course catalog), and quick accessibility settings. Prioritizes "what to do now" with clear visual hierarchy.
- **Purpose**: Provide at-a-glance game status and immediate actionable next steps while ensuring accessibility controls are always prominent
- **Trigger**: User logs in or navigates to dashboard from header
- **Progression**: Dashboard loads → Player identity displays at top → Main mission card shows current/next course → Side missions list other courses → Progress goals show streak and recent achievements → Accessibility settings always visible → Select any course to begin
- **Success criteria**: Tab order follows visual priority (Identity → Main Mission → Side Missions → Progress Goals → Accessibility), screen reader heading hierarchy matches visual importance, keyboard navigation works flawlessly, all sections clearly separated with borders/backgrounds

### 2. Accessible Course Browser
- **Functionality**: Browse and filter training courses with multiple viewing modes (grid/list), adjustable text sizes, and high-contrast themes
- **Purpose**: Ensure all employees can independently discover and access their assigned training regardless of visual, motor, or cognitive abilities
- **Trigger**: User logs in or navigates to "My Courses" section
- **Progression**: Dashboard view → Filter/search courses → Select course card → View course details → Begin learning
- **Success criteria**: Users can navigate and select courses using keyboard only, screen readers announce all course metadata clearly, and visual customization persists across sessions

### 2. Interactive Lesson System
- **Functionality**: Gamified lesson viewer with multiple content types (welcome messages, text/image, audio, code examples, interactive challenges) that presents educational content in an engaging, game-like format with animations, character guides, and instant feedback
- **Purpose**: Transform passive learning into active engagement through interactive challenges, immediate rewards, and narrative framing that makes training feel like playing a game
- **Trigger**: User selects "Start Learning" from a course intro screen for courses with interactive lessons
- **Progression**: Course intro → Start Learning → Welcome block with animated character → Text/image/audio content blocks → Interactive challenge → Immediate feedback (correct: XP + celebration, incorrect: hint + try again) → Complete lesson → Lesson completion celebration → Next lesson or return to course
- **Success criteria**: All content blocks are keyboard navigable, screen reader compatible, animations respect reduced motion preferences, challenge feedback is clear and encouraging, XP awards are instant and satisfying, character messages have full captions/transcripts

### 3. Multi-Format Content Viewer
- **Functionality**: Unified viewer supporting video (with captions/transcripts), audio (with transcripts), images (with alt text), and text content with playback controls, speed adjustment, and pause/resume
- **Purpose**: Deliver training materials in formats suited to different learning preferences and accessibility needs
- **Trigger**: User selects "View Modules" from course intro or clicks on a traditional content module
- **Progression**: Content loads → Accessibility preferences auto-apply → User consumes content at their pace → Marks complete when ready → Auto-saves progress
- **Success criteria**: Video captions are readable and synchronized, audio transcripts are available, playback speed adjusts from 0.5x to 2x, and keyboard controls work flawlessly

### 4. Progress Tracking System
- **Functionality**: Visual and textual progress indicators showing completion percentage, checkpoints achieved, and remaining modules with clear status labels
- **Purpose**: Provide orientation and motivation while reducing anxiety about training requirements
- **Trigger**: Automatically updates as user completes content modules
- **Progression**: Content completion → Progress auto-saves → Visual indicator updates → Confirmation message displays → Returns to course overview
- **Success criteria**: Progress persists across sessions, percentages are accurate, screen readers announce updates, and visual indicators use color plus iconography

### 5. Simple Assessment Module
- **Functionality**: Accessible quizzes with large touch targets, extended time options, multiple attempts, and immediate constructive feedback
- **Purpose**: Verify understanding without creating barriers or inducing test anxiety
- **Trigger**: User completes learning modules and selects "Take Assessment"
- **Progression**: Instructions with time details → Question display (one at a time) → Answer selection → Immediate feedback → Results summary with next steps
- **Success criteria**: Questions use simple language, touch targets exceed 44px minimum, keyboard navigation is logical, and users can review incorrect answers with explanations

### 6. Admin Content Management
- **Functionality**: Upload training materials (video/audio/text/images), add accessibility metadata (captions, transcripts, alt text), assign courses to employee groups, and view completion reports
- **Purpose**: Enable HR/training teams to efficiently create accessible learning experiences
- **Trigger**: Admin user logs in and navigates to "Manage Content"
- **Progression**: Select "Add Course" → Upload files → Add accessibility data → Set course details → Assign to groups → Publish → Monitor completion
- **Success criteria**: Upload accepts common formats, prompts for required accessibility data, shows validation errors clearly, and completion reports export to CSV

### 7. Achievements & Trophy System
- **Functionality**: PlayStation-style trophy system with bronze, silver, gold, and platinum achievements for completing courses, maintaining streaks, scoring perfectly on assessments, and reaching milestones. Users can view unlocked achievements, track progress toward locked achievements, and share their accomplishments.
- **Purpose**: Motivate learners through recognition and social sharing, making learning feel rewarding and encouraging consistent engagement
- **Trigger**: Achievements unlock automatically when requirements are met; users can navigate to achievements page to view all trophies
- **Progression**: Complete action (course/module/assessment) → Achievement check triggers → Toast notification appears → Achievement unlocked and saved → View in achievements dashboard → Share progress with colleagues
- **Success criteria**: Achievement notifications are celebratory but not disruptive, progress bars accurately reflect advancement toward locked achievements, sharing functionality works cross-platform, and all achievement logic is accessible via keyboard and screen readers

### 8. Experience Points (XP) & Leveling System
- **Functionality**: Award XP for every learning action - completing modules (+50 XP), finishing courses (+200 XP), passing assessments (+100 XP), daily login streaks (+10 XP). XP accumulates to unlock levels with visual rank badges and celebratory level-up animations.
- **Purpose**: Create constant positive reinforcement and visible progression that makes every small action feel meaningful and rewarding
- **Trigger**: Automatically awards XP after any learning activity; level-up triggers when XP threshold reached
- **Progression**: Complete activity → XP awarded with animated counter → Progress bar fills toward next level → Level-up celebration when threshold met → New rank badge displayed → Continue learning
- **Success criteria**: XP awards are instant and satisfying, level thresholds are balanced for regular progression, rank badges are visually distinct and motivating, all XP notifications include ARIA announcements for screen readers

### 9. Learning Quests & Missions
- **Functionality**: Frame course assignments and learning paths as "Quests" or "Missions" with quest cards showing objectives, rewards (XP + achievements), and progress. Quests can be daily challenges, weekly goals, or long-term learning paths.
- **Purpose**: Transform mandatory training into exciting challenges that feel purposeful and game-like, increasing motivation through narrative framing
- **Trigger**: Quests appear on dashboard; users can accept/track active quests; complete objectives to earn rewards
- **Progression**: View available quests → Accept quest → Track objectives in quest log → Complete objectives → Claim rewards (XP, achievements, badges) → Quest marked complete
- **Success criteria**: Quest objectives are crystal clear, progress tracking is accurate, quest cards are visually engaging with high contrast, rewards feel generous and motivating, quest system is fully keyboard navigable

### 10. Progress Visualization Dashboard
- **Functionality**: Game-like stats dashboard showing total XP, current level, rank badge, achievement completion %, course completion stats, current streak, and visual progress rings/bars for each metric
- **Purpose**: Provide at-a-glance gamified overview of all progress to build pride and motivation
- **Trigger**: Always visible on main dashboard; updates in real-time as progress occurs
- **Progression**: Dashboard loads → All stats displayed with animated counters → Visual rings/bars show percentages → Click any stat to drill into details → Celebrate milestones with badges
- **Success criteria**: All metrics update instantly, visualizations use color + patterns for accessibility, stats are announced by screen readers, dashboard is responsive and clear on mobile

### 11. Team Leaderboards (Optional)
- **Functionality**: Simple, encouraging leaderboard showing XP rankings within a team/department. Emphasis on personal improvement with "You've climbed 3 ranks this week!" rather than harsh competition. Can be toggled off by users who prefer private learning.
- **Purpose**: Add optional social motivation for competitive learners while keeping focus on personal growth
- **Trigger**: Opt-in from settings; view team leaderboard page to see rankings
- **Progression**: Enable leaderboard → View current ranking → See XP comparison → Celebrate rank improvements → Option to disable anytime
- **Success criteria**: Leaderboard is opt-in only, messaging is always encouraging never shaming, personal progress highlighted over peer comparison, fully accessible with screen reader support

### 12. Admin Dashboard & Analytics
- **Functionality**: Clean analytics dashboard showing user progress, course completion rates, assessment scores, and active users. Quick access tiles for common tasks (Create Course, Manage Users, View Reports). Simple charts with clear legends and data tables.
- **Purpose**: Empower HR/training staff to monitor learning effectiveness and manage content efficiently without technical expertise
- **Trigger**: Admin users log in or click "Admin Panel" in navigation
- **Progression**: Dashboard loads → View key metrics → Click quick access tiles → Navigate to detailed reports → Export data if needed
- **Success criteria**: Charts are accessible with screen readers, data exports to CSV, quick actions are one-click away, dashboard loads quickly even with large datasets

### 13. Visual Course Builder
- **Functionality**: Drag-and-drop interface for building course structure (Course → Modules → Lessons). Visual hierarchy tree showing nested structure. Easy reordering by dragging. Add/edit/delete at any level. Preview mode to see student view.
- **Purpose**: Make course creation intuitive for non-technical users through visual, direct manipulation
- **Trigger**: Admin clicks "Create New Course" or "Edit Course"
- **Progression**: Create course → Add details → Build structure (drag modules/lessons) → Reorder content → Preview → Save draft → Publish when ready
- **Success criteria**: Drag-and-drop works smoothly, keyboard alternatives available, changes save automatically, preview accurately reflects student experience, structure is collapsible/expandable

### 14. Accessible Content Editor (WYSIWYG)
- **Functionality**: Rich text editor with standard formatting (bold, lists, headings). Media upload with mandatory accessibility fields (alt text for images, captions for video, transcripts for audio). Warning system prevents publishing without accessibility data. Preview mode shows how content appears to different users.
- **Purpose**: Guide admins to create accessible content by default through built-in guardrails and helpful prompts
- **Trigger**: Admin creates or edits a lesson within course builder
- **Progression**: Open editor → Add text/formatting → Upload media → System prompts for accessibility data → Add alt text/captions/transcript → Preview → Save lesson
- **Success criteria**: Required accessibility fields block publishing until filled, helpful tooltips guide admins, media uploads support common formats, preview mode includes screen reader simulation

### 15. Quiz & Assessment Builder
- **Functionality**: Create accessible quizzes with multiple choice, true/false, and matching questions. Custom feedback fields for correct/incorrect answers with gamified messaging. Set XP rewards per quiz. Preview mode to test question flow.
- **Purpose**: Enable admins to create engaging, accessible assessments that feel rewarding rather than stressful
- **Trigger**: Admin adds assessment to course or module
- **Progression**: Click "Add Quiz" → Choose question type → Enter question text → Add answer options → Mark correct answer → Write custom feedback ("Great job! +20 XP!") → Set XP value → Add more questions → Preview quiz → Save
- **Success criteria**: All question types meet accessibility standards, feedback is encouraging and gamified, XP values are suggested based on difficulty, preview shows exactly what students see

### 16. Gamification Configuration Hub
- **Functionality**: Central interface for managing XP values, creating badges (upload icon + metadata), defining achievements, and assigning rewards to course milestones. Visual preview of how badges appear to students.
- **Purpose**: Simplify gamification setup so admins can easily motivate learners without complex configuration
- **Trigger**: Admin navigates to "Gamification" settings or configures rewards within course builder
- **Progression**: View current XP settings → Adjust values → Create new badge (upload image, set name/description) → Assign badge to course/module completion → Preview badge display → Save
- **Success criteria**: Badge creator is simple with clear image requirements, XP values have suggested defaults, badge assignments are straightforward dropdown selections, preview shows student view

### 17. User & Group Management
- **Functionality**: Add users individually or via CSV upload. Create groups (New Hires, Sales Team, etc.). Assign courses to users or entire groups. View user progress and history. Export user reports.
- **Purpose**: Streamline user administration and course assignment for HR teams managing large employee bases
- **Trigger**: Admin clicks "Manage Users" or "Manage Groups"
- **Progression**: Add user (manual or CSV) → Create groups → Assign users to groups → Assign courses to users/groups → View progress → Export reports
- **Success criteria**: CSV upload provides clear error feedback, bulk operations work efficiently, course assignments propagate instantly, reports include completion status and scores

### 18. Reporting & Analytics
- **Functionality**: Detailed reports showing who started/completed courses, quiz results per user, time spent learning, achievement unlock rates, and engagement trends. Filterable by user, group, course, or date range. Export to CSV for external analysis.
- **Purpose**: Provide actionable insights to measure training effectiveness and identify struggling learners
- **Trigger**: Admin navigates to "Reports" section
- **Progression**: Select report type → Set filters (user/group/course/dates) → View visualizations and data tables → Drill into details → Export to CSV
- **Success criteria**: Reports load quickly, filters work intuitively, charts are accessible, CSV exports include all relevant data, trends are easy to identify visually

### 28. Professional Course Authoring Tool - Visual Course Builder
- **Functionality**: Drag-and-drop visual course builder allowing admins to create courses by dragging module blocks (Lesson, Quiz, Completion) into a timeline/canvas. Easy reordering by dragging blocks up/down. Each module type has distinct visual appearance and icon. Course timeline shows hierarchical structure with clear visual nesting.
- **Purpose**: Empower non-technical HR/trainers to build professional courses through direct visual manipulation without coding
- **Trigger**: Admin clicks "Create Course" or "Edit Course" in Course Management
- **Progression**: Create course → Enter course details → Switch to "Structure" tab → Drag module types onto canvas → Configure each module → Reorder by dragging → Preview course → Save draft or publish
- **Success criteria**: Drag-and-drop is smooth and intuitive, modules visually distinct, reordering updates instantly, keyboard alternatives available for accessibility, changes auto-save, preview accurately reflects learner view

### 29. WYSIWYG Lesson Editor with Rich Content
- **Functionality**: Rich text editor (WYSIWYG) for lesson blocks supporting bold, italic, lists (ul/ol), headings, paragraphs. Media upload interface for images and videos with drag-drop support. Embedded video player for YouTube/Vimeo/Wistia URLs. Direct file upload for MP4 videos and JPG/PNG images.
- **Purpose**: Enable admins to create engaging, multimedia-rich lessons without HTML knowledge
- **Trigger**: Admin adds or edits a Lesson module within course builder
- **Progression**: Open lesson editor → Use formatting toolbar for text → Click image upload → Select or drag file → Upload → Fill accessibility fields → Or paste video URL → System auto-embeds → Preview content → Save lesson
- **Success criteria**: Toolbar buttons clearly labeled, formatting applies instantly, image uploads support drag-drop, video URLs auto-detect platform, preview matches final output, all common formats supported (MP4, MOV, JPG, PNG, GIF)

### 30. Accessibility Guardrails - Mandatory Metadata
- **Functionality**: System blocks saving/publishing until all accessibility requirements met. Image upload shows disabled "Save" button with warning icon until alt-text field filled (minimum 10 characters). Video upload shows disabled "Publish" button until caption file (.srt or .vtt) uploaded. Warning badges (⚠️) appear next to any incomplete modules in course structure view.
- **Purpose**: Prevent publication of inaccessible content by enforcing WCAG compliance through required fields
- **Trigger**: Admin attempts to save lesson with image missing alt-text, or publish course with video missing captions
- **Progression**: Upload image → Alt-text field required and highlighted → Type alt-text → Save enabled → Or upload video → Caption upload required → Upload .srt file → Publish enabled → Accessibility warnings clear automatically
- **Success criteria**: Save/publish buttons visually disabled with clear tooltip explaining requirement, warning icons prominent but not alarming, requirements stated in plain language ("Add alt-text to save"), validation occurs real-time, green checkmarks replace warnings when requirements met

### 31. Advanced Quiz Builder - Multiple Question Types
- **Functionality**: Quiz module builder supporting 5 question types: Multiple Choice (radio buttons, single answer), Multiple Select (checkboxes, multiple answers), True/False (two buttons), Short Answer (text input with keyword matching), and Ordering/Sequencing (drag items into correct order). Each question has custom feedback fields for correct and incorrect responses. XP value configurable per question.
- **Purpose**: Enable professional assessments beyond basic multiple choice, accommodating diverse learning validation needs
- **Trigger**: Admin adds Quiz module to course and clicks "Add Question"
- **Progression**: Click "Add Question" → Select question type → Enter question text → Add answer options → Mark correct answer(s) → Write custom correct feedback ("Great job! +50 XP") → Write custom incorrect feedback ("Almost! Remember that...") → Set XP value → Add next question → Preview quiz → Save
- **Success criteria**: All question types have clear setup flows, custom feedback fields accept rich text, XP values default to reasonable amounts (50-150), preview shows exact learner experience, questions can be reordered, deletion requires confirmation

### 32. Gamification Controls - XP & Achievement Assignment
- **Functionality**: Each lesson and quiz module has "Rewards" section with XP input field (number input with suggested values) and Achievement dropdown selector showing all available achievements. Course completion can be linked to unlock a specific achievement badge. Total course XP calculated automatically by summing all module XP values.
- **Purpose**: Give admins complete control over gamification mechanics without complex configuration
- **Trigger**: Admin configures lesson or quiz module rewards
- **Progression**: Edit module → Scroll to "Rewards" section → Enter XP value (or use suggested default) → Optionally select achievement from dropdown → Achievement preview shows icon and description → Save → Total course XP updates automatically in course details
- **Success criteria**: XP input shows suggested ranges based on module type, achievement dropdown shows icons for visual selection, total XP calculation accurate and real-time, achievement preview includes full metadata, linking achievement prevents duplicate assignments

### 33. Publishing Workflow - Draft vs. Published
- **Functionality**: All new courses and edits start in "Draft" mode (badge shows "Draft" status). Learners cannot see draft courses. Large "Publish" button in course header (disabled if accessibility validation fails). Publish dialog shows checklist of requirements (title, description, at least one module, all accessibility metadata complete, enrollment mode selected). Published courses show "Published" badge with last published date.
- **Purpose**: Provide safe editing environment where admins can work without affecting learners, with clear publication gate
- **Trigger**: Admin completes course creation and clicks "Publish"
- **Progression**: Build course in draft mode → Click "Publish" → Review requirements checklist → Fix any issues highlighted → All checks pass → Confirm publication → Course goes live → Appears in Mission Library for eligible learners → Draft badge changes to Published
- **Success criteria**: Draft courses invisible to learners, publish button clearly disabled with tooltip when requirements unmet, checklist shows green checks for met requirements and red X for unmet, publication is instant, published courses immediately available, date stamp shows when published

### 34. Enrollment Mode Integration
- **Functionality**: Publish dialog includes enrollment mode selector with three radio options: "Open Enrollment" (anyone can enroll), "Restricted" (request access required), "Admin-Assign Only" (hidden from library, admin assigns to users/groups). Description text explains each mode. Selected mode saves with course and controls visibility in Mission Library.
- **Purpose**: Give admins flexible control over who can access courses, supporting open training and confidential/role-specific content
- **Trigger**: Admin publishes course or edits published course settings
- **Progression**: Click "Publish" → Select enrollment mode from radio group → Read description of selected mode → Confirm → Course published with enrollment mode → Mission Library respects mode (Open shows to all, Restricted shows "Request Access" button, Admin-Assign hidden)
- **Success criteria**: Mode descriptions clear and concise, selection persists with course, Mission Library correctly filters based on mode, restricted courses show request workflow, admin-assign courses only appear for assigned users, mode can be changed post-publication

## Edge Case Handling

- **Network Interruptions**: Auto-save progress every 30 seconds; display clear offline indicator; resume exactly where user left off when reconnected
- **Missing Accessibility Data**: Warn admins pre-publish if captions/alt text missing; prevent publishing until critical accessibility data added
- **Extended Inactivity**: Preserve session for 2 hours; show warning before timeout with option to extend; never lose progress data
- **Keyboard Trap Scenarios**: All modals, dropdowns, and custom controls include proper focus management with visible escape routes (ESC key, skip links)
- **Overwhelming Content**: Break long modules into 5-7 minute segments; provide clear navigation between segments; allow jumping to specific sections

## Design Direction

The design should evoke the excitement and visual richness of modern video games - colorful, dynamic, and fun - while maintaining crystal-clear readability and high contrast for accessibility. Think casual gaming aesthetics (like Duolingo, Kahoot, or modern mobile games) where every interaction feels rewarding and progression is tangibly visible. The interface should be vibrant and motivating, using smooth animations, particle effects for celebrations, and game-like UI elements (health bars for progress, glowing buttons, achievement pop-ups) that make training feel like an adventure rather than a chore. Balance is key: rich enough to feel playful, simple enough to never overwhelm.

## Color Selection

**Vibrant Triadic color scheme** - Using three equally spaced colors (purple, cyan, coral) on the color wheel to create an energetic, playful game-like palette that maintains WCAG 2.1 Level AA minimum contrast standards (4.5:1 for body text, 3:1 for large text and UI components) while feeling fun and motivating.

- **Primary Color**: Vibrant Purple (oklch(0.55 0.20 290)) - Energetic and playful, commonly associated with gaming and achievement, creates excitement and engagement
- **Secondary Colors**: Electric Cyan (oklch(0.65 0.15 195)) for supporting actions and progress indicators, Warm Coral (oklch(0.70 0.18 30)) for achievements and celebrations - creates dynamic visual variety
- **Accent Color**: Bright Lime Green (oklch(0.75 0.20 130)) - High-energy color for XP gains, level-ups, and success states; unmissable and exciting
- **Game UI Elements**: Deep Indigo backgrounds (oklch(0.25 0.08 280)) with glowing neon accents create video game atmosphere while maintaining readability
- **Foreground/Background Pairings** (All WCAG 2.1 Level AA Compliant):
  - Background (Soft White oklch(0.98 0 0)): Foreground Deep Purple (oklch(0.25 0.08 280)) - Ratio 13.2:1 ✓ AAA
  - Card (Light Gray oklch(0.95 0.01 280)): Foreground Deep Purple (oklch(0.25 0.08 280)) - Ratio 12.1:1 ✓ AAA
  - Primary (Vibrant Purple oklch(0.55 0.20 290)): White Text (oklch(0.98 0 0)) - Ratio 6.8:1 ✓ AA
  - Secondary (Electric Cyan oklch(0.65 0.15 195)): Deep Purple (oklch(0.25 0.08 280)) - Ratio 5.1:1 ✓ AA
  - Accent (Bright Lime oklch(0.75 0.20 130)): Deep Purple (oklch(0.25 0.08 280)) - Ratio 7.2:1 ✓ AA
  - Muted (Light Gray oklch(0.88 0.02 280)): Muted Text (oklch(0.50 0.05 280)) - Ratio 4.6:1 ✓ AA
  - Success (Lime Green oklch(0.75 0.20 130)): Foreground Deep Purple (oklch(0.25 0.08 280)) - Ratio 7.2:1 ✓ AA
  - Destructive (Error Red oklch(0.55 0.22 25)): White Text (oklch(0.98 0 0)) - Ratio 5.1:1 ✓ AA
  - Border (Light Gray oklch(0.88 0.02 280)): Adjacent Colors - Ratio 3:1 minimum ✓ AA
  - Focus Ring (Primary oklch(0.55 0.20 290)): All Backgrounds - Ratio 3:1 minimum ✓ AA

## Font Selection

Typography should feel modern, dynamic, and energetic while maintaining perfect legibility and WCAG 2.1 Level AA compliance. Using **Poppins** - a geometric sans-serif that feels playful and contemporary with high dyslexia-friendly characteristics: large x-height and clear distinction between easily confused characters (l, I, 1). Minimum body text size is 16px per accessibility requirements.

- **Typographic Hierarchy** (WCAG 2.1 Compliant):
  - H1 (Page Titles): Poppins Bold/36px/tight letter spacing (-0.01em)/line height 1.2 - Bold headers (3:1 contrast minimum)
  - H2 (Section Headers): Poppins SemiBold/28px/normal letter spacing/line height 1.3 - Section breaks (3:1 contrast minimum)
  - H3 (Module Titles): Poppins Medium/22px/normal letter spacing/line height 1.4 - Subsection headers (3:1 contrast minimum)
  - Body (Content): Poppins Regular/18px (minimum 16px)/normal letter spacing/line height 1.6 - Main content (4.5:1 contrast required)
  - UI Labels: Poppins Medium/16px/letter spacing 0.01em/line height 1.5 - Interface text (4.5:1 contrast required)
  - Game Stats/Numbers: Poppins Bold/20-32px/tight spacing (-0.02em)/line height 1.3 - XP, scores (3:1 contrast minimum)
  - Captions: Poppins Regular/14px (minimum size exception)/normal letter spacing/line height 1.5 - Supporting text (4.5:1 contrast required)
  
**Accessible Spacing Requirements** (WCAG 2.1 SC 1.4.12):
  - Line height: Minimum 1.5x font size for body text (1.6 implemented)
  - Paragraph spacing: Minimum 2x font size between paragraphs
  - Letter spacing: Minimum 0.12x font size (users can override)
  - Word spacing: Minimum 0.16x font size (users can override)
  - No italics for emphasis (use bold or color contrast instead)

## Animations

Animations are critical to creating the video game feel - they should be smooth, satisfying, and celebratory. Motion communicates success, progression, and excitement while always respecting reduced-motion preferences. The balance tips toward engaging and rewarding: level-ups trigger particle effects, achievements slide in with bounce, XP bars fill with satisfying easing, and buttons respond with scale transforms. All animations must have accessible alternatives (instant state changes) for users with motion sensitivity.

- **Purposeful Meaning**: 
  - Celebration animations (300-500ms) with particle effects for achievements, level-ups, and course completions
  - Smooth progress bar fills (400ms) with anticipation easing to make advancement feel earned
  - Button interactions (150ms) with scale transforms for tactile feedback
  - XP gain animations (250ms) with number count-ups and glow effects
  - Toast notifications slide in with spring physics (300ms) for satisfying micro-interactions
  
- **Hierarchy of Movement**: 
  - Achievement unlocks & level-ups (highest priority, full-screen celebrations)
  - XP gains & progress updates (medium priority, localized effects)
  - Button states & micro-interactions (low priority, subtle responses)
  - Background elements remain stable for orientation

## Component Selection

- **Components**:
  - **Card**: Course containers with clear borders, generous padding, hover states for keyboard/mouse navigation
  - **Button**: Large touch targets (min 48px height), clear labels, distinct variants (Primary/Secondary/Ghost) with proper contrast
  - **Progress**: Linear progress bars with percentage labels, completion checkmarks, clear color coding
  - **Tabs**: Keyboard-navigable content switching with arrow key support and clear focus indicators
  - **Dialog**: Modal overlays for assessments and confirmations with proper focus trapping and ESC key support
  - **Select/Dropdown**: Accessible course filtering with keyboard navigation and clear option labels
  - **Switch**: Preference toggles (captions on/off, high contrast mode) with visible state indicators
  - **Accordion**: Expandable course modules with clear expand/collapse affordances
  - **Alert**: Feedback messages for success/error states with role="alert" for screen reader announcements
  - **Badge**: Status indicators (Complete/In Progress/Not Started) using color + text

- **Customizations**:
  - **Accessibility Control Panel**: Custom component for user preferences (text size, playback speed, contrast themes) - sticky and always available
  - **Content Viewer**: Custom unified player for video/audio/text with consistent controls and keyboard shortcuts
  - **Skip Links**: Custom focus-visible skip navigation links at page top
  - **Focus Indicators**: Enhanced 3px solid ring with high contrast, following focus through all interactive elements

- **States**:
  - **Buttons**: Default/Hover (subtle background shift)/Focus (prominent ring)/Active (slight scale)/Disabled (reduced opacity + not-allowed cursor)
  - **Inputs**: Default/Focus (ring + label color change)/Filled (check icon)/Error (red ring + icon + message)/Disabled (grayed background)
  - **Cards**: Default/Hover (subtle elevation)/Focus (ring around entire card)/Selected (primary color border)

- **Icon Selection**:
  - Play/Pause (video/audio controls)
  - Check (completion, correct answers)
  - X (close modals, incorrect answers)
  - ChevronDown/Up (accordions, dropdowns)
  - ListBullets/SquaresFour (view mode toggles)
  - TextAa (text size controls)
  - Gauge (progress indicators)
  - Upload (admin content upload)
  - Eye/EyeSlash (visibility toggles)
  - MagnifyingGlass (search/filter)

- **Spacing**: Consistent spacing using Tailwind scale - 4px base unit: Components use p-6 (24px), gaps use gap-4 (16px), sections separated by my-8 (32px), page margins px-6 md:px-12

- **Mobile**: Mobile-first design - single column layouts on mobile, cards stack vertically, navigation collapses to hamburger menu, touch targets minimum 48px, bottom navigation for primary actions, reduced motion by default on mobile, sticky accessibility controls accessible via floating button

## Community & Social Features (WCAG 2.1 AA Compliant)

### Activity Feed - Social Recognition System

**Purpose**: Foster team spirit and motivation through celebrating peer achievements in an accessible, non-intrusive manner.

**Functionality**:
- Real-time feed displaying team member accomplishments: Level Ups, Badge Unlocks, Course Completions, Achievement Unlocks
- Simple reaction system with 5 preset options: Congrats (👏), High Five (✨), On Fire (🔥), Superstar (⭐), Champion (🏆)
- Each activity item shows: User avatar/name, achievement type, timestamp (relative), reaction counts
- Expandable reactions list showing who reacted and when
- Chronological feed with newest items at top, limited to most recent 20 items

**Accessibility**:
- Calm, non-animated presentation (no auto-scrolling or rapid updates)
- Screen reader announcements for new activity (polite, not aggressive)
- Keyboard navigation through all reaction buttons
- Clear ARIA labels on all interactive elements
- High contrast between text and backgrounds
- No reliance on color alone for meaning

**Edge Cases**:
- Empty state: Shows encouraging message when no activity exists
- Long names: Truncate with ellipsis while maintaining accessibility
- Multiple reactions: Users can toggle reactions on/off
- Performance: Limit to 20 most recent items, older items archived

### Team Challenges - Accessible Leaderboards

**Purpose**: Drive engagement through friendly team competition with full accessibility compliance.

**Functionality**:
- Weekly/Monthly XP challenges between departments
- Visual leaderboard showing: Rank, Team Name, Department, Member Count, Total XP/Progress
- Progress bars showing relative performance
- Rank badges for top 3 teams (Gold/Silver/Bronze)
- Challenge details: Title, Description, Time Remaining, Rewards
- Dual view modes: Visual (graphs/progress bars) + Table (semantic HTML table)

**WCAG Compliance**:
- Toggle between visual leaderboard and accessible data table
- Table mode uses proper semantic HTML (<table>, <th>, <td>, scope attributes)
- All data relationships clear to screen readers
- Progress bars include aria-label with percentage values
- Rank positions announced clearly ("Team Engineering, Rank 1 of 4")
- Color never the only indicator of rank (uses icons + text + position)

**Edge Cases**:
- No active challenges: Show "Check back soon" message
- Tied scores: Display teams alphabetically when tied
- Single-member teams: Show member count clearly
- Mobile: Table scrolls horizontally, visual mode stacks vertically

### Q&A Forum - Contextual Peer Support

**Purpose**: Enable employees to help each other within specific course context, reducing training staff burden.

**Functionality**:
- Questions scoped to specific course module
- Ask Question dialog with Title + Details fields
- Upvoting system for questions and answers
- Mark Best Answer feature (available to question author and admins)
- Admin/Expert badges for subject matter experts
- Sorted by: Best Answer first, then by upvotes, then by recency

**Accessibility Focus**:
- Large, clearly labeled input fields for questions/answers
- Keyboard navigation through all questions and answers
- Expandable question details with clear expand/collapse affordances
- High contrast between questions, answers, and metadata
- Screen reader announces answer count and best answer status
- Form validation with clear error messages

**Hierarchical Structure**:
- Question → Multiple Answers → Best Answer (highlighted)
- Questions show: Title, Content, Author, Timestamp, Upvote Count, Answer Count
- Answers show: Content, Author, Role Badge (if admin/expert), Timestamp, Upvote Count
- Best Answer: Visually distinct with success color + "Best Answer" badge

**Edge Cases**:
- No questions: "Be the first to ask!" message with CTA
- Deleted users: Show "Former Employee" as author name
- Spam prevention: Admin can mark answers as best to surface quality
- Multiple best answers: System allows only one per question

### Notification Preferences - Full User Control

**Purpose**: Give users complete control over how they receive updates, critical for accessibility and sensory sensitivity.

**Customizable Alerts**:
- In-app notification badges (visual count indicators)
- Email summaries (Never / Daily / Weekly)
- Individual toggles for each notification type:
  - Activity Feed Updates
  - Forum Replies to My Questions
  - Achievements & Badges Earned
  - Team Challenge Updates
  - Course Reminders
- Sound effects toggle (disabled by default)
- Notification badge visibility toggle

**Accessibility Priority**:
- All notifications use clear, concise language
- No flashing or rapid animations
- Sound effects opt-in only (never auto-play)
- Vibration disable option for sensory sensitivity
- Email summaries formatted for screen reader compatibility
- Direct links from notifications to relevant content

**Edge Cases**:
- All notifications disabled: Show warning that user may miss important updates
- Email bounce: System tracks and prompts user to update email
- Overload prevention: Cap notifications to 10 per hour max
- Quiet hours: Optional setting to pause notifications during specific times

## Mentorship Program (WCAG 2.1 AA Compliant)

### Purpose
Enable experienced employees (Mentors) to guide newer or junior employees (Mentees) through their learning journey, fostering knowledge transfer, building team connections, and accelerating employee development within the gamified learning framework.

### Core Concept & User Roles

**Mentor Role**:
- An experienced employee assigned by administrators to guide one or more mentees
- Can view detailed progress dashboards for each assigned mentee
- Can communicate directly with mentees through private messaging
- Receives 10% XP bonus when mentees complete courses (incentivizing active mentorship)

**Mentee Role**:
- An employee assigned a mentor for guidance and support
- Can view their mentor's profile, level, and achievements
- Can initiate communication with their mentor through integrated messaging
- Unlocks special "Team Up" achievement upon completing first course with a mentor

### 19. Admin Mentorship Management
- **Functionality**: Dedicated "Mentorship Management" section in Admin Panel allowing administrators to designate users as mentors, create mentor-mentee pairings, view all active relationships, and remove pairings when necessary
- **Purpose**: Provide HR/training teams with simple tools to establish and manage mentorship relationships across the organization
- **Trigger**: Admin navigates to "Mentorship Program" from Admin Dashboard
- **Progression**: View active pairings → Select mentor from employee list → Select mentee from available employees → Create pairing → View pairing in active list → Search/filter pairings → Remove pairing if needed
- **Success criteria**: Mentors can be assigned multiple mentees, mentees can only have one active mentor, pairing creation prevents duplicates, search functionality works across mentor and mentee names, removal is confirmed before execution, all actions provide clear feedback

### 20. Mentor Dashboard - Mentee Progress Tracking
- **Functionality**: Dedicated "My Mentees" section visible to users designated as mentors, displaying a card for each assigned mentee showing: name/avatar, current level and XP progress bar, current course/mission in progress, recently unlocked achievements, and "Send Message" action button
- **Purpose**: Empower mentors to monitor mentee progress at a glance and proactively offer guidance when needed, making mentorship actionable rather than passive
- **Trigger**: Automatically appears on mentor's main dashboard when they have assigned mentees
- **Progression**: View mentee cards → Review progress metrics → Identify struggling mentees or celebration opportunities → Click "Send Message" → Write encouraging message or guidance → Send → Message delivered to mentee
- **Success criteria**: Progress data updates in real-time, mentee cards are visually distinct and scannable, messaging interface is intuitive, sent messages are confirmed, mentor can view message history, no mentees state shows helpful empty message

### 21. Mentee Mentor Widget - Direct Access to Support
- **Functionality**: Prominent "My Mentor" widget on mentee's main dashboard displaying mentor's name/avatar, level and rank title, total XP, and large "Ask My Mentor" CTA button that opens messaging interface with conversation history
- **Purpose**: Make it effortless for mentees to seek help, reducing barriers to asking questions and building mentor-mentee relationship
- **Trigger**: Widget automatically appears when user has an assigned mentor
- **Progression**: See mentor info → Click "Ask My Mentor" → View conversation history → Write question or message → Send → Receive response notification when mentor replies → Continue conversation
- **Success criteria**: Widget is visually prominent but not overwhelming, messaging interface shows full conversation thread with timestamps, unread message badge appears when mentor replies, conversation history persists, keyboard navigation works flawlessly

### 22. Mentorship Rewards & Gamification Integration
- **Functionality**: Automatic XP bonus system that awards mentors 10% of total XP earned when a mentee completes a course. Special "Team Up" bronze achievement unlocks for mentees who complete their first course while having an assigned mentor.
- **Purpose**: Incentivize active mentorship through tangible rewards while celebrating the mentor-mentee relationship as a valuable part of the learning journey
- **Trigger**: Mentee completes course (with or without assessment) → System checks for active mentor pairing → Awards mentor bonus XP → Displays toast notification to mentee crediting their mentor → Checks if it's mentee's first completion with mentor → Unlocks "Team Up" achievement if applicable
- **Progression**: Mentee finishes course → XP awarded to mentee → Mentor receives 10% bonus automatically → Mentee sees notification: "Your mentor received X XP bonus!" → Achievement check runs → "Team Up" unlocked (if first course) → Both mentor and mentee feel rewarded
- **Success criteria**: XP bonus calculation is accurate (10% of total including assessment bonuses), mentor XP updates immediately, notification clearly explains bonus, "Team Up" achievement only unlocks once, achievement appears in both users' achievement dashboards, all XP awards logged in activity feed

### Accessibility & Edge Cases

**Accessibility Requirements**:
- All mentorship interfaces fully keyboard navigable
- Screen reader announces mentor/mentee relationship status
- Messaging interface supports assistive technology
- High contrast between mentor widget and surrounding content
- Clear focus indicators on all interactive elements
- Success/error messages use ARIA live regions

**Edge Cases**:
- Mentor with no mentees: Show encouraging empty state with "Waiting for admin to assign mentees"
- Mentee with no mentor: Widget hidden, no impact on experience
- Mentor leaves organization: Admin removes pairing, mentee widget disappears gracefully
- Multiple mentees complete courses simultaneously: All XP bonuses calculated and awarded correctly
- Mentee completes course then mentor assigned: "Team Up" achievement checks active pairing at completion time
- Message sent to removed pairing: System prevents sending and notifies user pairing no longer active
- Mentor overwhelmed with messages: No artificial limits, relies on human relationship management

## Course Ratings & Reviews System (WCAG 2.1 AA Compliant)

### Purpose
Enable learners to rate and review courses after completion, helping others discover quality content and providing valuable feedback to course creators and administrators.

### Core Functionality

**Rating System**:
- 5-star rating scale with interactive star selection
- Visual rating summary showing average rating and total reviews
- Distribution chart showing breakdown of ratings (5 stars, 4 stars, etc.)
- Ratings displayed on course cards in Mission Library

**Review System**:
- Write detailed text reviews (optional, up to 1000 characters)
- Edit or delete your own review at any time
- Mark other learners' reviews as "helpful"
- Verified badge for completed learners
- Reviews sorted by helpfulness, then recency

### 23. Course Rating & Review Submission
- **Functionality**: After completing a course, learners can submit a rating (required 1-5 stars) and optional written review. Form includes interactive star selector, text area with character counter (1000 max), and clear submit/cancel buttons.
- **Purpose**: Collect authentic feedback from course completers to help future learners make informed decisions
- **Trigger**: User navigates to "Reviews" tab in CourseViewer after completing the course
- **Progression**: View reviews tab → See prompt to share experience → Click "Write Review" → Select star rating (1-5) → Optionally write review text → Submit → Confirmation toast → Review appears in list
- **Success criteria**: Only completed learners can submit reviews, star rating is required, review text is optional, character limit enforced, submission provides instant feedback, reviews persist across sessions, users can only have one review per course

### 24. Rating Summary Display
- **Functionality**: Visual summary showing average star rating (e.g., 4.7/5.0), total review count, and distribution chart with horizontal bars showing percentage breakdown for each star level (5 stars: 60%, 4 stars: 25%, etc.)
- **Purpose**: Provide at-a-glance quality assessment to help learners choose courses
- **Trigger**: Automatically displays when course has at least one review
- **Progression**: View reviews tab or course card → See rating summary → Understand course quality at a glance
- **Success criteria**: Average rating calculated correctly, total review count accurate, distribution percentages sum to 100%, updates in real-time when new reviews submitted, accessible to screen readers with clear labels

### 25. Review Display & Interaction
- **Functionality**: List of all course reviews showing reviewer name/avatar, star rating, review text, timestamp, helpful count, and "Helpful" button. Users can mark reviews as helpful (toggle on/off). Reviews sorted by helpful count first, then recency.
- **Purpose**: Surface high-quality peer feedback and enable learners to contribute to review quality through helpfulness voting
- **Trigger**: View reviews tab in CourseViewer
- **Progression**: Scroll review list → Read review → Click "Helpful" if review was valuable → Helpful count increments → Review moves up in sort order
- **Success criteria**: Reviews display all metadata clearly, helpful toggle works instantly, users cannot mark their own reviews helpful, sort order updates dynamically, verified badge shows for completed learners, timestamps show relative time (e.g., "2 days ago")

### 26. Manage Your Review
- **Functionality**: Users can view, edit, or delete their own review. Own review displayed prominently at top with "Edit" and "Delete" buttons. Edit opens same form as submission with pre-filled data. Delete requires confirmation.
- **Purpose**: Give learners control over their contributions and allow updates based on course changes or reflection
- **Trigger**: View reviews tab when user has already submitted a review
- **Progression**: See "Your Review" section → Click "Edit" to modify rating/text → Or click "Delete" → Confirm deletion → Review removed or updated
- **Success criteria**: Own review clearly distinguished from others, edit pre-fills current data, changes save instantly, delete requires confirmation, confirmation dialog accessible, actions provide clear feedback

### 27. Rating Integration in Mission Library
- **Functionality**: Course cards in Mission Library display average star rating and review count (e.g., "★ 4.7 (23)") when reviews exist. Rating appears below course badges and above XP/time stats.
- **Purpose**: Help learners discover highly-rated courses and make informed enrollment decisions
- **Trigger**: Browse Mission Library
- **Progression**: View course cards → See ratings for courses with reviews → Use ratings to inform course selection
- **Success criteria**: Ratings display only when reviews exist, average calculated correctly, review count accurate, updates when new reviews added, visually distinct but not overwhelming, accessible with screen readers

### Accessibility & Edge Cases

**Accessibility Requirements**:
- Star rating uses keyboard navigation (arrow keys to select, Enter/Space to confirm)
- Rating summary uses semantic progressbar elements with aria-labels
- Review form has clear labels and validation messages
- Helpful button clearly announces state to screen readers
- All interactive elements meet 44px minimum touch target size
- High contrast maintained between stars and background
- Success/error messages use ARIA live regions

**Edge Cases**:
- Course with no reviews: Show "No reviews yet" message with encouragement
- User tries to review before completion: Show alert explaining requirement
- User edits review: Previous version replaced completely
- Multiple users mark review helpful simultaneously: All counts recorded accurately
- Review text contains profanity/spam: Admin tools for moderation (future enhancement)
- Course deleted: Reviews archived but not deleted
- User deletes their account: Reviews remain but author shows "Former Employee"
- Rating ties in helpfulness: Sort by recency as tiebreaker

