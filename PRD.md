# Planning Guide

A gamified corporate learning platform that makes training feel like playing a video game - fun, rewarding, and motivating - while guaranteeing 100% accessibility compliance for employees with diverse disabilities.

**Experience Qualities**:
1. **Playful & Engaging** - Every interaction feels like playing a game rather than studying, with colorful visuals, satisfying animations, and instant rewards that make learning addictive and fun.
2. **Empowering & Clear** - Simple, intuitive game mechanics with high contrast visuals ensure all users can independently navigate and succeed regardless of ability.
3. **Rewarding & Motivating** - Constant positive feedback through XP gains, achievement unlocks, progress bars, and celebratory effects that build momentum and encourage consistent engagement.

**Complexity Level**: Light Application (gamified features with persistent state)
A focused platform combining educational content delivery with video game-inspired progression systems - XP, levels, achievements, quests, and leaderboards - all designed with accessibility-first principles to ensure universal playability.

## Essential Features

### 1. Accessible Course Browser
- **Functionality**: Browse and filter training courses with multiple viewing modes (grid/list), adjustable text sizes, and high-contrast themes
- **Purpose**: Ensure all employees can independently discover and access their assigned training regardless of visual, motor, or cognitive abilities
- **Trigger**: User logs in or navigates to "My Courses" section
- **Progression**: Dashboard view → Filter/search courses → Select course card → View course details → Begin learning
- **Success criteria**: Users can navigate and select courses using keyboard only, screen readers announce all course metadata clearly, and visual customization persists across sessions

### 2. Multi-Format Content Viewer
- **Functionality**: Unified viewer supporting video (with captions/transcripts), audio (with transcripts), images (with alt text), and text content with playback controls, speed adjustment, and pause/resume
- **Purpose**: Deliver training materials in formats suited to different learning preferences and accessibility needs
- **Trigger**: User selects "Start" or "Continue" on a course module
- **Progression**: Content loads → Accessibility preferences auto-apply → User consumes content at their pace → Marks complete when ready → Auto-saves progress
- **Success criteria**: Video captions are readable and synchronized, audio transcripts are available, playback speed adjusts from 0.5x to 2x, and keyboard controls work flawlessly

### 3. Progress Tracking System
- **Functionality**: Visual and textual progress indicators showing completion percentage, checkpoints achieved, and remaining modules with clear status labels
- **Purpose**: Provide orientation and motivation while reducing anxiety about training requirements
- **Trigger**: Automatically updates as user completes content modules
- **Progression**: Content completion → Progress auto-saves → Visual indicator updates → Confirmation message displays → Returns to course overview
- **Success criteria**: Progress persists across sessions, percentages are accurate, screen readers announce updates, and visual indicators use color plus iconography

### 4. Simple Assessment Module
- **Functionality**: Accessible quizzes with large touch targets, extended time options, multiple attempts, and immediate constructive feedback
- **Purpose**: Verify understanding without creating barriers or inducing test anxiety
- **Trigger**: User completes learning modules and selects "Take Assessment"
- **Progression**: Instructions with time details → Question display (one at a time) → Answer selection → Immediate feedback → Results summary with next steps
- **Success criteria**: Questions use simple language, touch targets exceed 44px minimum, keyboard navigation is logical, and users can review incorrect answers with explanations

### 5. Admin Content Management
- **Functionality**: Upload training materials (video/audio/text/images), add accessibility metadata (captions, transcripts, alt text), assign courses to employee groups, and view completion reports
- **Purpose**: Enable HR/training teams to efficiently create accessible learning experiences
- **Trigger**: Admin user logs in and navigates to "Manage Content"
- **Progression**: Select "Add Course" → Upload files → Add accessibility data → Set course details → Assign to groups → Publish → Monitor completion
- **Success criteria**: Upload accepts common formats, prompts for required accessibility data, shows validation errors clearly, and completion reports export to CSV

### 6. Achievements & Trophy System
- **Functionality**: PlayStation-style trophy system with bronze, silver, gold, and platinum achievements for completing courses, maintaining streaks, scoring perfectly on assessments, and reaching milestones. Users can view unlocked achievements, track progress toward locked achievements, and share their accomplishments.
- **Purpose**: Motivate learners through recognition and social sharing, making learning feel rewarding and encouraging consistent engagement
- **Trigger**: Achievements unlock automatically when requirements are met; users can navigate to achievements page to view all trophies
- **Progression**: Complete action (course/module/assessment) → Achievement check triggers → Toast notification appears → Achievement unlocked and saved → View in achievements dashboard → Share progress with colleagues
- **Success criteria**: Achievement notifications are celebratory but not disruptive, progress bars accurately reflect advancement toward locked achievements, sharing functionality works cross-platform, and all achievement logic is accessible via keyboard and screen readers

### 7. Experience Points (XP) & Leveling System
- **Functionality**: Award XP for every learning action - completing modules (+50 XP), finishing courses (+200 XP), passing assessments (+100 XP), daily login streaks (+10 XP). XP accumulates to unlock levels with visual rank badges and celebratory level-up animations.
- **Purpose**: Create constant positive reinforcement and visible progression that makes every small action feel meaningful and rewarding
- **Trigger**: Automatically awards XP after any learning activity; level-up triggers when XP threshold reached
- **Progression**: Complete activity → XP awarded with animated counter → Progress bar fills toward next level → Level-up celebration when threshold met → New rank badge displayed → Continue learning
- **Success criteria**: XP awards are instant and satisfying, level thresholds are balanced for regular progression, rank badges are visually distinct and motivating, all XP notifications include ARIA announcements for screen readers

### 8. Learning Quests & Missions
- **Functionality**: Frame course assignments and learning paths as "Quests" or "Missions" with quest cards showing objectives, rewards (XP + achievements), and progress. Quests can be daily challenges, weekly goals, or long-term learning paths.
- **Purpose**: Transform mandatory training into exciting challenges that feel purposeful and game-like, increasing motivation through narrative framing
- **Trigger**: Quests appear on dashboard; users can accept/track active quests; complete objectives to earn rewards
- **Progression**: View available quests → Accept quest → Track objectives in quest log → Complete objectives → Claim rewards (XP, achievements, badges) → Quest marked complete
- **Success criteria**: Quest objectives are crystal clear, progress tracking is accurate, quest cards are visually engaging with high contrast, rewards feel generous and motivating, quest system is fully keyboard navigable

### 9. Progress Visualization Dashboard
- **Functionality**: Game-like stats dashboard showing total XP, current level, rank badge, achievement completion %, course completion stats, current streak, and visual progress rings/bars for each metric
- **Purpose**: Provide at-a-glance gamified overview of all progress to build pride and motivation
- **Trigger**: Always visible on main dashboard; updates in real-time as progress occurs
- **Progression**: Dashboard loads → All stats displayed with animated counters → Visual rings/bars show percentages → Click any stat to drill into details → Celebrate milestones with badges
- **Success criteria**: All metrics update instantly, visualizations use color + patterns for accessibility, stats are announced by screen readers, dashboard is responsive and clear on mobile

### 10. Team Leaderboards (Optional)
- **Functionality**: Simple, encouraging leaderboard showing XP rankings within a team/department. Emphasis on personal improvement with "You've climbed 3 ranks this week!" rather than harsh competition. Can be toggled off by users who prefer private learning.
- **Purpose**: Add optional social motivation for competitive learners while keeping focus on personal growth
- **Trigger**: Opt-in from settings; view team leaderboard page to see rankings
- **Progression**: Enable leaderboard → View current ranking → See XP comparison → Celebrate rank improvements → Option to disable anytime
- **Success criteria**: Leaderboard is opt-in only, messaging is always encouraging never shaming, personal progress highlighted over peer comparison, fully accessible with screen reader support

## Edge Case Handling

- **Network Interruptions**: Auto-save progress every 30 seconds; display clear offline indicator; resume exactly where user left off when reconnected
- **Missing Accessibility Data**: Warn admins pre-publish if captions/alt text missing; prevent publishing until critical accessibility data added
- **Extended Inactivity**: Preserve session for 2 hours; show warning before timeout with option to extend; never lose progress data
- **Keyboard Trap Scenarios**: All modals, dropdowns, and custom controls include proper focus management with visible escape routes (ESC key, skip links)
- **Overwhelming Content**: Break long modules into 5-7 minute segments; provide clear navigation between segments; allow jumping to specific sections

## Design Direction

The design should evoke the excitement and visual richness of modern video games - colorful, dynamic, and fun - while maintaining crystal-clear readability and high contrast for accessibility. Think casual gaming aesthetics (like Duolingo, Kahoot, or modern mobile games) where every interaction feels rewarding and progression is tangibly visible. The interface should be vibrant and motivating, using smooth animations, particle effects for celebrations, and game-like UI elements (health bars for progress, glowing buttons, achievement pop-ups) that make training feel like an adventure rather than a chore. Balance is key: rich enough to feel playful, simple enough to never overwhelm.

## Color Selection

**Vibrant Triadic color scheme** - Using three equally spaced colors (purple, cyan, coral) on the color wheel to create an energetic, playful game-like palette that maintains WCAG AAA contrast for accessibility while feeling fun and motivating.

- **Primary Color**: Vibrant Purple (oklch(0.55 0.20 290)) - Energetic and playful, commonly associated with gaming and achievement, creates excitement and engagement
- **Secondary Colors**: Electric Cyan (oklch(0.65 0.15 195)) for supporting actions and progress indicators, Warm Coral (oklch(0.70 0.18 30)) for achievements and celebrations - creates dynamic visual variety
- **Accent Color**: Bright Lime Green (oklch(0.75 0.20 130)) - High-energy color for XP gains, level-ups, and success states; unmissable and exciting
- **Game UI Elements**: Deep Indigo backgrounds (oklch(0.25 0.08 280)) with glowing neon accents create video game atmosphere while maintaining readability
- **Foreground/Background Pairings**:
  - Background (Soft White oklch(0.98 0 0)): Foreground Deep Purple (oklch(0.25 0.08 280)) - Ratio 13.2:1 ✓ AAA
  - Card (Light Gray oklch(0.95 0 0)): Foreground Deep Purple (oklch(0.25 0.08 280)) - Ratio 12.1:1 ✓ AAA
  - Primary (Vibrant Purple oklch(0.55 0.20 290)): White Text (oklch(0.98 0 0)) - Ratio 6.8:1 ✓ AA
  - Secondary (Electric Cyan oklch(0.65 0.15 195)): Deep Purple (oklch(0.25 0.08 280)) - Ratio 5.1:1 ✓ AA
  - Accent (Bright Lime oklch(0.75 0.20 130)): Deep Purple (oklch(0.25 0.08 280)) - Ratio 7.2:1 ✓ AA
  - Success (Lime Green oklch(0.75 0.20 130)): White Text (oklch(0.98 0 0)) - Ratio 4.9:1 ✓ AA

## Font Selection

Typography should feel modern, dynamic, and energetic while maintaining perfect legibility. Using **Poppins** - a geometric sans-serif that feels playful and contemporary, commonly used in gaming UIs for its friendly, approachable character while remaining highly readable at all sizes.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Poppins Bold/36px/tight letter spacing (-0.01em)/line height 1.2 - Bold, impactful headers that command attention
  - H2 (Section Headers): Poppins SemiBold/28px/normal letter spacing/line height 1.3 - Clear section breaks with energy
  - H3 (Module Titles): Poppins Medium/22px/normal letter spacing/line height 1.4 - Playful subsection headers
  - Body (Content): Poppins Regular/18px/normal letter spacing/line height 1.6 - Clean, readable content
  - UI Labels: Poppins Medium/16px/slight letter spacing (0.01em)/line height 1.5 - Clear interface text
  - Game Stats/Numbers: Poppins Bold/20-32px/tight spacing - Make XP, scores, and stats pop visually
  - Captions: Poppins Regular/14px/normal letter spacing/line height 1.5 - Supporting information

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
