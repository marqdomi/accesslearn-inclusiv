# GameLearn Accessibility Implementation

## Overview

GameLearn is a fully WCAG 2.1 Level AA compliant gamified learning platform. This document provides an overview of our accessibility features and how they work.

## Quick Start: Accessibility Features

### For Users

**Accessing Accessibility Settings:**
1. Look for the gear icon (⚙️) in the bottom-right corner
2. Click or tap to open the Accessibility Settings panel
3. Adjust preferences:
   - **Text Size:** Normal, Large, or X-Large
   - **High Contrast Mode:** Enhanced color contrast
   - **Captions Enabled:** Toggle captions for video/audio
   - **Reduce Motion:** Disable decorative animations
   - **Playback Speed:** Adjust video/audio speed (0.5x to 2.0x)

**Keyboard Navigation:**
- Press `Tab` to navigate between interactive elements
- Press `Shift + Tab` to navigate backwards
- Press `Enter` or `Space` to activate buttons
- Press `Esc` to close modals/dialogs
- On page load, press `Tab` once to access "Skip to main content" link

### For Developers

All accessibility features are implemented using:
- **Semantic HTML** with proper heading hierarchy
- **ARIA attributes** for custom components
- **CSS custom properties** for themeable colors
- **React hooks** for persistent user preferences
- **Tailwind CSS** utilities for consistent spacing

---

## Architecture

### File Structure

```
src/
├── components/
│   └── accessibility/
│       ├── AccessibilityPanel.tsx    # Settings UI
│       └── SkipLink.tsx              # Skip navigation link
├── hooks/
│   └── use-accessibility-preferences.ts  # Preference management
├── index.css                          # Global styles & theme variables
└── App.tsx                            # Root component
```

### Key Components

#### 1. AccessibilityPanel Component

**Location:** `src/components/accessibility/AccessibilityPanel.tsx`

**Features:**
- Floating action button (bottom-right)
- Modal dialog with settings
- Persists preferences using `useKV` hook
- Applies changes to `document.documentElement`

**Usage:**
```tsx
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel'

function App() {
  return (
    <>
      {/* Your app content */}
      <AccessibilityPanel />
    </>
  )
}
```

#### 2. useAccessibilityPreferences Hook

**Location:** `src/hooks/use-accessibility-preferences.ts`

**Features:**
- Reads and writes to persistent key-value store
- Provides preferences object and update function
- Default values for all settings

**Usage:**
```tsx
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'

function MyComponent() {
  const { preferences, updatePreference } = useAccessibilityPreferences()
  
  // Access current preferences
  console.log(preferences.textSize)        // 'normal' | 'large' | 'x-large'
  console.log(preferences.reduceMotion)    // boolean
  
  // Update a preference
  updatePreference('textSize', 'large')
}
```

**Preference Types:**
```typescript
interface UserPreferences {
  textSize: 'normal' | 'large' | 'x-large'    // Font size multiplier
  playbackSpeed: number                       // 0.5 to 2.0
  highContrast: boolean                       // Enhanced contrast mode
  captionsEnabled: boolean                    // Video/audio captions
  reduceMotion: boolean                       // Disable animations
}
```

#### 3. SkipLink Component

**Location:** `src/components/accessibility/SkipLink.tsx`

**Features:**
- Hidden until focused (Tab key)
- Jumps to `#main-content`
- First element in tab order

**Usage:**
```tsx
import { SkipLink } from '@/components/accessibility/SkipLink'

function App() {
  return (
    <>
      <SkipLink />
      <header>...</header>
      <main id="main-content">
        {/* Main content here */}
      </main>
    </>
  )
}
```

---

## Theme Implementation

### Color System

All colors are defined in `src/index.css` using OKLCH color space for perceptual uniformity.

**Default Theme (Light):**
```css
:root {
  --background: oklch(0.98 0 0);          /* Soft White */
  --foreground: oklch(0.25 0.08 280);     /* Deep Purple */
  --primary: oklch(0.55 0.20 290);        /* Vibrant Purple */
  --secondary: oklch(0.65 0.15 195);      /* Electric Cyan */
  --accent: oklch(0.70 0.18 30);          /* Warm Coral */
  --success: oklch(0.75 0.20 130);        /* Bright Lime */
  --destructive: oklch(0.55 0.22 25);     /* Error Red */
  /* ... more variables */
}
```

**High Contrast Theme:**
```css
.high-contrast {
  --background: oklch(1 0 0);             /* Pure White */
  --foreground: oklch(0 0 0);             /* Pure Black */
  --primary: oklch(0.45 0.25 290);        /* Darker Purple */
  /* ... enhanced contrast */
}
```

### Applying Themes

Themes are applied by toggling CSS classes on `document.documentElement`:

```typescript
useEffect(() => {
  const root = document.documentElement
  root.classList.toggle('high-contrast', preferences.highContrast)
  root.classList.toggle('reduce-motion', preferences.reduceMotion)
  
  // Text size
  root.style.fontSize = preferences.textSize === 'large' 
    ? '110%' 
    : preferences.textSize === 'x-large' 
    ? '125%' 
    : '100%'
}, [preferences])
```

---

## Animation Control

### Reduce Motion Implementation

**CSS Media Query** (System Preference):
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**CSS Class** (User Toggle):
```css
.reduce-motion *,
.reduce-motion *::before,
.reduce-motion *::after {
  animation: none !important;
  transition: none !important;
}
```

**React Component Usage:**
```tsx
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences'
import { motion } from 'framer-motion'

function AnimatedComponent() {
  const { preferences } = useAccessibilityPreferences()
  const shouldAnimate = !preferences.reduceMotion
  
  return shouldAnimate ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      Content
    </motion.div>
  ) : (
    <div>Content</div>
  )
}
```

---

## Focus Management

### Focus Indicator Styles

All interactive elements receive a 3px purple focus ring:

```css
*:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
  border-radius: 4px;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
```

### Custom Focus States

For components with custom focus needs:

```tsx
<button className="focus-visible:outline focus-visible:outline-3 focus-visible:outline-ring focus-visible:outline-offset-2">
  Click me
</button>
```

---

## Form Accessibility

### Accessible Input Pattern

Always use visible labels with programmatic association:

```tsx
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

function AccessibleForm() {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email Address *</Label>
      <Input
        id="email"
        type="email"
        placeholder="you@example.com"
        aria-required="true"
      />
    </div>
  )
}
```

### Error Handling

Include visual + icon + text + ARIA:

```tsx
const [error, setError] = useState<string | null>(null)

<div className="space-y-2">
  <Label htmlFor="password">Password *</Label>
  <Input
    id="password"
    type="password"
    aria-required="true"
    aria-invalid={!!error}
    aria-describedby={error ? "password-error" : undefined}
  />
  {error && (
    <p id="password-error" className="text-sm text-destructive flex items-center gap-1">
      <XCircle size={16} aria-hidden="true" />
      {error}
    </p>
  )}
</div>
```

---

## Screen Reader Support

### ARIA Live Regions

For dynamic content updates (toasts, notifications):

```tsx
import { toast } from 'sonner'

// Success notification (automatically accessible)
toast.success('+50 XP earned!', {
  description: 'Module completed successfully'
})

// Custom live region
<div aria-live="polite" aria-atomic="true">
  {status}
</div>
```

### Semantic HTML

Use proper heading hierarchy:

```tsx
function Dashboard() {
  return (
    <>
      <h1>GameLearn Dashboard</h1>
      
      <section>
        <h2>Player Identity</h2>
        {/* Content */}
      </section>
      
      <section>
        <h2>Main Mission</h2>
        <h3>Security Training 101</h3>
        {/* Content */}
      </section>
    </>
  )
}
```

### Icon Accessibility

Decorative icons:
```tsx
<Trophy size={24} aria-hidden="true" />
```

Meaningful icons (icon-only buttons):
```tsx
<Button variant="ghost" size="icon" aria-label="Settings">
  <Gear size={24} />
</Button>
```

---

## Testing Checklist

### Manual Testing

- [ ] **Keyboard Navigation**: Tab through entire app without mouse
- [ ] **Focus Indicators**: Verify visible on all interactive elements
- [ ] **Screen Reader**: Test with NVDA (Windows) or VoiceOver (macOS)
- [ ] **Touch Targets**: Verify 44x44px minimum on mobile
- [ ] **Color Contrast**: Use WebAIM Contrast Checker
- [ ] **Zoom**: Test at 200% browser zoom
- [ ] **Motion**: Enable system reduce motion and verify

### Automated Testing

```bash
# Run Lighthouse in Chrome DevTools
# Accessibility tab → Generate report
# Target: 95+ score

# Install axe DevTools extension
# Run full page scan
# Target: 0 critical/serious issues
```

---

## Common Patterns

### Accessible Button

```tsx
import { Button } from '@/components/ui/button'
import { GraduationCap } from '@phosphor-icons/react'

// With icon and text (preferred)
<Button>
  <GraduationCap size={20} aria-hidden="true" />
  Dashboard
</Button>

// Icon only (requires aria-label)
<Button variant="ghost" size="icon" aria-label="Open dashboard">
  <GraduationCap size={24} />
</Button>
```

### Accessible Modal/Dialog

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <DialogHeader>
      <DialogTitle id="dialog-title">Course Details</DialogTitle>
      <DialogDescription id="dialog-description">
        View and manage course settings
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Accessible Progress Indicator

```tsx
import { Progress } from '@/components/ui/progress'
import { CheckCircle } from '@phosphor-icons/react'

<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Course Progress</span>
    <span className="font-semibold">{progress}%</span>
  </div>
  <Progress
    value={progress}
    aria-label={`Course ${progress}% complete`}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={progress}
  />
  {progress === 100 && (
    <div className="flex items-center gap-1 text-sm text-success">
      <CheckCircle size={16} aria-hidden="true" />
      Complete!
    </div>
  )}
</div>
```

### Accessible Status Badge

```tsx
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Circle } from '@phosphor-icons/react'

// Not Started
<Badge variant="outline">
  <Circle size={12} aria-hidden="true" />
  Not Started
</Badge>

// In Progress
<Badge variant="secondary">
  <Clock size={12} aria-hidden="true" />
  In Progress
</Badge>

// Complete
<Badge variant="default" className="bg-success text-success-foreground">
  <CheckCircle size={12} aria-hidden="true" />
  Complete
</Badge>
```

---

## Troubleshooting

### Focus Indicator Not Visible

**Issue:** Focus ring not appearing on custom component

**Solution:** Ensure `:focus-visible` styles are applied
```tsx
<div
  tabIndex={0}
  className="focus-visible:outline focus-visible:outline-3 focus-visible:outline-ring"
>
  Custom focusable element
</div>
```

### Preferences Not Persisting

**Issue:** Settings reset on page refresh

**Solution:** Verify `useKV` hook is used correctly
```tsx
// ✓ Correct - uses useKV
const { preferences, updatePreference } = useAccessibilityPreferences()

// ✗ Wrong - uses useState (won't persist)
const [preferences, setPreferences] = useState(defaultPreferences)
```

### High Contrast Mode Not Applied

**Issue:** Colors don't change when High Contrast Mode enabled

**Solution:** Verify CSS class is applied to root element
```tsx
useEffect(() => {
  document.documentElement.classList.toggle('high-contrast', preferences.highContrast)
}, [preferences.highContrast])
```

### Animations Still Playing with Reduce Motion

**Issue:** Animations continue when Reduce Motion is enabled

**Solution:** Check component respects preference
```tsx
const { preferences } = useAccessibilityPreferences()
const shouldAnimate = !preferences.reduceMotion

{shouldAnimate ? <AnimatedVersion /> : <StaticVersion />}
```

---

## Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Accessibility Style Guide](./ACCESSIBILITY_STYLE_GUIDE.md)
- [Testing Checklist](./ACCESSIBILITY_TESTING.md)

### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Tool](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (Chrome DevTools)

### Screen Readers
- [NVDA](https://www.nvaccess.org/) (Windows - Free)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows)
- VoiceOver (macOS/iOS - Built-in)
- TalkBack (Android - Built-in)

---

## Support

For accessibility-related questions or issues:

1. Review the [Accessibility Style Guide](./ACCESSIBILITY_STYLE_GUIDE.md)
2. Check the [Testing Checklist](./ACCESSIBILITY_TESTING.md)
3. Run automated tests (Lighthouse, axe DevTools)
4. File an issue with:
   - WCAG criterion violated
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

---

**Version:** 1.0  
**Last Updated:** 2024  
**WCAG Compliance:** Level AA
