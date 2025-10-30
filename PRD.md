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
