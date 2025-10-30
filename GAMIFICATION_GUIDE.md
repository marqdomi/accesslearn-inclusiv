# Adaptive Gamification & Personalization System

This document describes the comprehensive adaptive gamification and personalization logic implemented in the GameLearn platform.

## Table of Contents
1. [Scalable Progression System](#scalable-progression-system)
2. [Achievement Strategy](#achievement-strategy)
3. [Adaptive Feedback & Remediation](#adaptive-feedback--remediation)
4. [Smart Personalization](#smart-personalization)
5. [Progress Retention](#progress-retention)
6. [Implementation Guide](#implementation-guide)

## Scalable Progression System

### The Infinite Game: XP & Levels

The platform uses an **infinitely scalable XP and leveling system** that ensures fair progression regardless of content library size.

#### XP Rewards Structure

All XP rewards are weighted by value and impact:

| Action | XP Reward | Purpose |
|--------|-----------|---------|
| Daily Login | +10 | Habit formation |
| Lesson Block Complete | +15 | Micro-progress |
| Interactive Challenge | +30 | Active engagement |
| Lesson Complete | +50 | Checkpoint milestone |
| Module Complete | +100 | Major milestone |
| Quiz Pass (70%+) | +150 | Knowledge validation |
| Quiz Perfect (100%) | +250 | Mastery bonus |
| Course Complete | +500 | Achievement unlock |
| Final Assessment Pass | +500 | Certification level |
| Final Assessment Perfect | +750 | Excellence reward |
| First Try Bonus | +100 | Efficiency incentive |
| 3-Day Streak | +25 | Consistency bonus |
| 7-Day Streak | +75 | Habit reinforcement |
| 30-Day Streak | +300 | Dedication reward |
| Speed Bonus | +50 | Performance incentive |
| Return After Failure | +25 | Resilience reward |
| Accessibility Features Used | +20 | Inclusive bonus |

#### Level Scaling Formula

The system uses a **logarithmic progression curve** for sustainable long-term engagement:

- **Levels 1-5**: Fast progression using `100 × 1.5^(level-1)`
  - Provides quick early wins for motivation
  - Level 2: 150 XP, Level 3: 225 XP, Level 4: 338 XP, Level 5: 506 XP

- **Levels 6-20**: Moderate scaling at `+200 XP per level`
  - Maintains steady progress feel
  - Predictable increments reduce frustration

- **Levels 21+**: Linear scaling at `+500 XP per level`
  - Ensures infinite scalability
  - New content automatically contributes to progression
  - No artificial level cap

#### Rank System

Every 5 levels, users earn a new rank title:

1-5: **Novice**  
6-10: **Learner**  
11-15: **Student**  
16-20: **Scholar**  
21-25: **Specialist**  
26-30: **Expert**  
31-35: **Professional**  
36-40: **Master**  
41-45: **Grandmaster**  
46-50: **Legend**  
51-55: **Champion**  
56+: **Hero**

### Implementation

```typescript
import { useXP } from '@/hooks/use-xp'
import { XP_REWARDS } from '@/hooks/use-xp'

const { awardXP, totalXP, currentLevel, getRankName, getProgressToNextLevel } = useXP()

// Award XP for completing a module
awardXP(XP_REWARDS.MODULE_COMPLETE, 'Completed Sales Basics Module')

// Get progress to next level
const progress = getProgressToNextLevel()
// Returns: { current: 450, required: 1000, percentage: 45 }
```

## Achievement Strategy

### Tiered Achievement System

Achievements are designed to **scale with content growth** using a tiered structure.

#### Course Completion Tiers
Progressive achievements that unlock as more content is added:

- **First Steps** (1 course) - Bronze
- **Learning Specialist I** (5 courses) - Silver
- **Learning Specialist II** (10 courses) - Gold
- **Learning Specialist III** (15 courses) - Platinum
- **Learning Master** (25 courses) - Platinum
- **Learning Legend** (50 courses) - Platinum

*Design Note: As new courses are added, higher tiers (II, III, Master, Legend) become achievable, motivating users to explore new content.*

#### Assessment Excellence Tiers
Based on passing assessments with 90%+ scores:

- **Assessment Specialist I** (5 assessments) - Silver
- **Assessment Specialist II** (10 assessments) - Gold
- **Assessment Specialist III** (25 assessments) - Platinum

#### Streak Achievements (Evergreen)
These are **cyclic achievements** that drive consistent behavior indefinitely:

- **7-Day Study Streak** - Silver
- **30-Day Study Streak** - Gold
- **Streak Specialist I** (60 days) - Platinum
- **Streak Specialist II** (90 days) - Platinum
- **Unstoppable** (180 days) - Platinum

#### Module Milestones (Content-Scalable)
Automatically scale as module library grows:

- **Module Specialist I** (25 modules) - Bronze
- **Module Specialist II** (50 modules) - Silver
- **Module Specialist III** (100 modules) - Gold
- **Module Master** (250 modules) - Platinum
- **Module Legend** (500 modules) - Platinum

#### Special & Hidden Achievements

- **Perfect Score** - Achieve 100% on any assessment (Gold)
- **First Try Success** - Pass on first attempt (Bronze)
- **Quick Study** - Complete 10 modules in one session (Silver)
- **Speed Runner** - Complete course in under 1 hour (Gold, Hidden)
- **Quarterly Engagement Badge** - 10+ activities per quarter (Silver, Hidden)

### Unlock Criteria Documentation

All achievement unlock logic is centralized in `/src/hooks/use-achievements.ts`:

```typescript
switch (achievement.category) {
  case 'course':
    shouldUnlock = stats.totalCoursesCompleted >= achievement.requirement
    break
  case 'assessment':
    shouldUnlock = stats.totalAssessmentsPassed >= achievement.requirement
    break
  case 'streak':
    shouldUnlock = stats.currentStreak >= achievement.requirement
    break
  case 'milestone':
    shouldUnlock = stats.totalModulesCompleted >= achievement.requirement
    break
}
```

## Adaptive Feedback & Remediation

### Constructive Failure Feedback

The system provides **positive, game-like feedback** that reframes failure as progress:

| Score Range | Message | Emoji | Tone |
|-------------|---------|-------|------|
| 100% | "Perfect! You aced it on your first try!" | 🎉 | Success |
| 90-99% | "Excellent work! You've mastered this material!" | 🌟 | Success |
| 70-89% | "Great job! You passed! Keep up the good work!" | ✅ | Success |
| 50-69% | "Mission incomplete, but you're close! Review and try again!" | 💪 | Warning |
| <50% | "Don't worry! Focus on these specific areas!" | 🎯 | Info |

### Intelligent Remediation

Instead of forcing full module repetition, the system:

1. **Analyzes Failed Questions** - Identifies specific concepts missed
2. **Extracts Concepts** - Maps questions to learning topics
3. **Prioritizes by Frequency** - Focuses on most-failed concepts first
4. **Suggests Micro-Resources**:
   - **Video Segment**: 30-second clip with exact timestamp
   - **Text Section**: Specific paragraph or section
   - **Interactive Challenge**: Focused practice exercise

#### Example Remediation Flow

```typescript
import { analyzeFailure } from '@/lib/adaptive-feedback'

const analysis = analyzeFailure(questions, userAnswers, failedIndices)
// Returns:
// {
//   failedQuestions: [2, 5, 7],
//   missedConcepts: ['Keyboard Navigation', 'ARIA Labels'],
//   suggestedRemediation: [
//     {
//       type: 'video-segment',
//       title: 'Review: Keyboard Navigation',
//       description: 'Quick refresher on keyboard navigation',
//       resourceId: 'concept-keyboard-navigation',
//       estimatedMinutes: 3,
//       startTime: 120,
//       endTime: 300
//     }
//   ],
//   encouragement: "You're so close! These are just small gaps."
// }
```

### Diagnostic Precision

The system should never say "You failed the quiz" but rather:
- "Mission incomplete - you only missed 2 concepts!"
- "You got 8 out of 10 right! Let's review keyboard navigation together."
- "Almost there! A 2-minute video will get you to 100%."

## Smart Personalization

### Automatic Accessibility Profile

The system **automatically recalls and applies** user preferences from onboarding:

```typescript
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'

const { preferences, profile, updatePreference, getTimeExtension } = useAccessibilityPreferences()

// Preferences automatically applied:
// - High Contrast Mode → Adds 'high-contrast' class to <html>
// - Reduce Motion → Adds 'reduce-motion' class, disables animations
// - Text Size → Sets root font-size (18px, 20px, 24px)
// - Font Family → Sets preferred font globally
```

### Adaptive Media Delivery

Before content can be published, admins must provide:

| Content Type | Required Data | Validates |
|--------------|---------------|-----------|
| Video | Captions, Transcript | ✅ Mandatory for all |
| Video | Audio Description | ⚠️ Recommended if visual impairment flagged |
| Audio | Transcript | ✅ Mandatory for all |
| Image | Alternative Text | ✅ Mandatory for all |

**Admin Workflow**:
1. Upload media file
2. System shows accessibility checklist
3. Missing requirements highlighted in red
4. Publish button disabled until complete
5. Warnings shown for recommended improvements

```typescript
import { validateAccessibilityMetadata } from '@/components/admin/AccessibilityChecker'

const validation = validateAccessibilityMetadata('video', metadata)
// Returns:
// {
//   isValid: false,
//   errors: ['Closed captions are required for all video content'],
//   warnings: ['Audio description track is recommended'],
//   suggestions: ['Add timestamps to transcript for easier navigation']
// }
```

### Pacing & Time Extensions

Users with accessibility needs automatically receive extended time:

```typescript
const { getTimeExtension } = useAccessibilityPreferences()

const baseTime = 30 // minutes
const actualTime = getTimeExtension(baseTime)
// If needsExtendedTime: true → Returns 60 minutes (200%)
// If customTimeMultiplier: 1.5 → Returns 45 minutes (150%)
```

**Key Principles**:
- Extensions apply automatically without stigma
- No visual indication user has "extra time"
- All timed assessments are optional
- Extensions configurable per-user (1.5x, 2x, 3x, etc.)

## Progress Retention

### Robust Auto-Save System

The platform implements **comprehensive auto-save** to ensure zero data loss:

#### Save Triggers

1. **Start of Every Lesson Block** - Checkpoint at beginning
2. **After Every Question Answered** - Immediate persistence
3. **Every 30 Seconds** - Periodic background save
4. **Browser Close/Tab Switch** - onBeforeUnload event
5. **Visibility Change** - When user switches tabs

#### Saved State

```typescript
interface AutoSaveState {
  lastSavedAt: number
  currentPosition: {
    courseId: string
    moduleId?: string
    lessonId?: string
    blockId?: string
    scrollPosition?: number
  }
  answeredQuestions: { [questionId: string]: number | number[] }
  timeSpentSeconds: number
  lessonProgress: { [lessonId: string]: string[] }
  videoProgress: { [videoId: string]: number }
  attemptData: any
}
```

#### Implementation

```typescript
import { useAutoSave } from '@/hooks/use-auto-save'

const autoSave = useAutoSave(`course-${courseId}`, {
  enabled: true,
  intervalSeconds: 30,
  saveOnEveryAction: true,
  showNotifications: false
})

// Update position
autoSave.updatePosition({ courseId, lessonId, blockId })

// Save question answer
autoSave.updateQuestionAnswer('q1', 2)

// Save video progress
autoSave.updateVideoProgress('video-123', 145) // 145 seconds

// Manual save with notification
autoSave.saveNow({ timeSpentSeconds: 300 })
```

## Implementation Guide

### Quick Start: Adding Gamification to a New Feature

#### 1. Award XP for Completion

```typescript
import { useXP, XP_REWARDS } from '@/hooks/use-xp'

const { awardXP } = useXP()

const handleModuleComplete = () => {
  awardXP(XP_REWARDS.MODULE_COMPLETE, 'Completed Customer Service Module')
  // Shows toast: "+100 XP - Completed Customer Service Module"
}
```

#### 2. Update Achievement Progress

```typescript
import { useAchievements } from '@/hooks/use-achievements'

const { updateModuleCompletion } = useAchievements()

const handleModuleComplete = () => {
  updateModuleCompletion() // Automatically checks and unlocks achievements
}
```

#### 3. Add Auto-Save

```typescript
import { useAutoSave } from '@/hooks/use-auto-save'

const autoSave = useAutoSave('my-feature')

// Save user's current position
autoSave.updatePosition({ courseId, moduleId, lessonId })

// Save on every interaction
autoSave.updateQuestionAnswer(questionId, answer)
```

#### 4. Add Adaptive Feedback

```typescript
import { generateConstructiveFeedback } from '@/lib/adaptive-feedback'
import { AdaptiveFeedbackDisplay } from '@/components/gamification/AdaptiveFeedbackDisplay'

const feedback = generateConstructiveFeedback(score, totalQuestions, isFirstAttempt, attemptsRemaining)

return <AdaptiveFeedbackDisplay feedback={feedback} />
```

#### 5. Respect Accessibility Preferences

```typescript
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'

const { preferences, getTimeExtension } = useAccessibilityPreferences()

// Apply reduced motion
const shouldAnimate = !preferences.reduceMotion

// Apply time extension
const quizTime = getTimeExtension(30) // Base: 30 min, Returns: 60 min if extended
```

### Best Practices

1. **Always use XP_REWARDS constants** - Never hardcode XP values
2. **Show encouraging messages** - Frame all feedback positively
3. **Save early, save often** - Use auto-save for all user interactions
4. **Respect accessibility settings** - Check preferences before animations
5. **Provide specific remediation** - Link to exact resources, not full modules
6. **Make time limits optional** - Offer untimed alternative for all assessments
7. **Validate accessibility data** - Block publishing without required metadata

### Testing Gamification Features

```typescript
// Test XP awards
const { awardXP, totalXP } = useXP()
awardXP(100, 'Test XP')
expect(totalXP).toBe(100)

// Test achievement unlocks
const { userStats, updateCourseCompletion } = useAchievements()
updateCourseCompletion()
expect(userStats.achievementsUnlocked.length).toBeGreaterThan(0)

// Test auto-save
const autoSave = useAutoSave('test')
autoSave.updatePosition({ courseId: 'test' })
expect(autoSave.saveState?.currentPosition.courseId).toBe('test')
```

## Future Enhancements

- [ ] Social sharing of achievements
- [ ] Team leaderboards with opt-in
- [ ] Monthly challenges with special rewards
- [ ] Personalized learning path recommendations based on performance
- [ ] Predictive analytics for at-risk learners
- [ ] Gamified peer review system
- [ ] Custom achievement designer for admins
- [ ] XP multiplier events (2x XP weekends)

## Support

For questions or issues with the gamification system, please refer to:
- `/src/hooks/use-xp.ts` - XP and leveling logic
- `/src/hooks/use-achievements.ts` - Achievement unlock logic
- `/src/lib/adaptive-feedback.ts` - Feedback and remediation algorithms
- `/src/hooks/use-auto-save.ts` - Progress retention system
