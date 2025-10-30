# Planning Guide

An inclusive corporate learning management system that empowers employees with diverse disabilities to access training materials with dignity, independence, and confidence.

**Experience Qualities**:
1. **Empowering** - Every interaction reinforces user autonomy and capability, with features designed to adapt to individual needs rather than forcing users to adapt to the system.
2. **Clarity** - Information hierarchy is immediately apparent, navigation paths are predictable, and cognitive load is minimized through thoughtful simplification.
3. **Reassuring** - Progress is always visible, actions are reversible, and success states are celebrated in ways that build confidence without condescension.

**Complexity Level**: Light Application (multiple features with basic state)
This platform serves a focused purpose with thoughtfully constrained features - content delivery, progress tracking, and administrative oversight - without overwhelming complexity that could create barriers to access.

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

## Edge Case Handling

- **Network Interruptions**: Auto-save progress every 30 seconds; display clear offline indicator; resume exactly where user left off when reconnected
- **Missing Accessibility Data**: Warn admins pre-publish if captions/alt text missing; prevent publishing until critical accessibility data added
- **Extended Inactivity**: Preserve session for 2 hours; show warning before timeout with option to extend; never lose progress data
- **Keyboard Trap Scenarios**: All modals, dropdowns, and custom controls include proper focus management with visible escape routes (ESC key, skip links)
- **Overwhelming Content**: Break long modules into 5-7 minute segments; provide clear navigation between segments; allow jumping to specific sections

## Design Direction

The design should evoke calmness, competence, and trust - professional yet warm, modern yet timeless. It must feel like a supportive workspace, not a clinical tool or playful consumer app. The interface should recede to let content shine, with sufficient white space to reduce cognitive load and purposeful use of color to guide without overwhelming. A minimal interface better serves the core purpose - when learning content is the star, the interface should be an invisible facilitator.

## Color Selection

**Complementary color scheme** - Using blue and warm orange as opposites on the color wheel to create clear visual distinction between primary actions and important highlights, with careful attention to ensuring all combinations meet WCAG AAA contrast ratios.

- **Primary Color**: Deep Blue (oklch(0.45 0.12 250)) - Communicates trust, stability, and professionalism while being distinguishable for most color vision types
- **Secondary Colors**: Soft Slate (oklch(0.65 0.02 250)) for supporting UI elements and Cool Gray (oklch(0.85 0.01 250)) for backgrounds - creates calm visual hierarchy without competing for attention
- **Accent Color**: Warm Orange (oklch(0.65 0.15 45)) - Attention-grabbing for CTAs, completion states, and success messages; high visibility against blue primary
- **Foreground/Background Pairings**:
  - Background (White oklch(0.98 0 0)): Foreground Dark Gray (oklch(0.25 0 0)) - Ratio 14.8:1 ✓ AAA
  - Card (Light Gray oklch(0.96 0 0)): Foreground Dark Gray (oklch(0.25 0 0)) - Ratio 13.2:1 ✓ AAA
  - Primary (Deep Blue oklch(0.45 0.12 250)): White (oklch(0.98 0 0)) - Ratio 8.5:1 ✓ AAA
  - Secondary (Soft Slate oklch(0.65 0.02 250)): Dark Gray (oklch(0.25 0 0)) - Ratio 5.2:1 ✓ AA
  - Accent (Warm Orange oklch(0.65 0.15 45)): Dark Gray (oklch(0.25 0 0)) - Ratio 5.4:1 ✓ AA
  - Muted (Cool Gray oklch(0.85 0.01 250)): Dark Gray (oklch(0.25 0 0)) - Ratio 9.8:1 ✓ AAA

## Font Selection

Typography should prioritize maximum legibility and readability across all abilities - clear letterforms with generous spacing, appropriate weight variations for hierarchy, and system fonts that render consistently across platforms. Using **Inter** for its exceptional clarity at all sizes, humanist proportions, and optimized spacing for screen reading, paired with **Georgia** for extended body text in content areas where serif readability aids comprehension.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Inter Bold/32px/tight letter spacing (-0.02em)/line height 1.2 - Maximum clarity for primary navigation waypoints
  - H2 (Section Headers): Inter Semibold/24px/normal letter spacing/line height 1.3 - Clear delineation of content sections
  - H3 (Module Titles): Inter Medium/20px/normal letter spacing/line height 1.4 - Subsection identification
  - Body (Content): Georgia Regular/18px/normal letter spacing/line height 1.6 - Extended reading comfort
  - UI Labels: Inter Medium/16px/slight letter spacing (0.01em)/line height 1.5 - Interface clarity
  - Captions/Metadata: Inter Regular/14px/normal letter spacing/line height 1.5 - Supporting information

## Animations

Animations must serve functional purposes only - never decorative or distracting. Motion should be minimal, predictable, and always respects user preferences for reduced motion. The balance tips heavily toward subtle functionality: state changes are communicated through gentle fades, focus indicators transition smoothly, and progress updates feel connected without calling attention to themselves.

- **Purposeful Meaning**: Smooth transitions (200ms) communicate state changes; progress bar fills communicate advancement; gentle fades (150ms) for modal appearances reduce jarring context switches
- **Hierarchy of Movement**: Progress indicators > Focus states > Content transitions > Background elements (which remain static)

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
