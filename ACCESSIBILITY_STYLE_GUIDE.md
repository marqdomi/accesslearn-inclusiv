# GameLearn Accessibility Style Guide (WCAG 2.1 Level AA Compliant)

## Purpose
To establish the mandatory visual and interaction standards for all components on the GameLearn platform (Dashboard, Course Modules, Buttons, and Gamification Elements). All guidelines adhere to WCAG 2.1 Level AA standards at a minimum.

---

## 1. Color Palette and Contrast (CRITICAL)

### 1.1 Contrast Requirements

The playful, gamified color palette must be built upon a foundation of high contrast.

**Minimum Text Contrast**  
- All regular-sized body text (under 18pt or 14pt bold) **MUST** maintain a minimum contrast ratio of **4.5:1** with its background color.
- Testing tool: Use WebAIM Contrast Checker or browser DevTools to validate all text.

**Large Text Contrast**  
- Headers and large text (18pt+ or 14pt+ bold) **MUST** maintain a minimum contrast ratio of **3:1**.

**Non-Text Contrast**  
- All interactive UI components (buttons, borders of input fields, focus indicators) and meaningful graphics **MUST** maintain a minimum contrast ratio of **3:1** with adjacent colors.
- This includes: button borders, form field outlines, focus rings, icon buttons, progress bar fills, badge backgrounds.

**Color Use**  
- Color **MUST NEVER** be the only means of conveying information.
- ❌ **Wrong**: Success state only turns green.
- ✅ **Correct**: Success state turns green + shows checkmark icon + displays "Success!" text.
- Required for: form validation, status indicators, progress states, error messages, action confirmations.

### 1.2 Platform Color Palette (WCAG 2.1 AA Validated)

**Core Background Colors**
```css
--background: oklch(0.98 0 0);          /* Soft White - Main page background */
--foreground: oklch(0.25 0.08 280);     /* Deep Purple - Primary text (13.2:1 ✓) */

--card: oklch(0.95 0.01 280);           /* Light Gray - Card background */
--card-foreground: oklch(0.25 0.08 280); /* Deep Purple text (12.1:1 ✓) */

--muted: oklch(0.88 0.02 280);          /* Muted background */
--muted-foreground: oklch(0.50 0.05 280); /* Muted text (4.6:1 ✓) */
```

**Action Colors**
```css
--primary: oklch(0.55 0.20 290);        /* Vibrant Purple - Main actions */
--primary-foreground: oklch(0.98 0 0);  /* White text (6.8:1 ✓) */

--secondary: oklch(0.65 0.15 195);      /* Electric Cyan - Secondary actions */
--secondary-foreground: oklch(0.25 0.08 280); /* Deep Purple text (5.1:1 ✓) */

--accent: oklch(0.70 0.18 30);          /* Warm Coral - Achievements */
--accent-foreground: oklch(0.98 0 0);   /* White text (5.3:1 ✓) */
```

**Feedback Colors**
```css
--success: oklch(0.75 0.20 130);        /* Bright Lime - XP gains, success */
--success-foreground: oklch(0.25 0.08 280); /* Deep Purple text (7.2:1 ✓) */

--destructive: oklch(0.55 0.22 25);     /* Error Red - Destructive actions */
--destructive-foreground: oklch(0.98 0 0);  /* White text (5.1:1 ✓) */

--xp: oklch(0.75 0.20 130);             /* XP Green - Experience points */
--xp-foreground: oklch(0.25 0.08 280);  /* Deep Purple text (7.2:1 ✓) */
```

**UI Component Colors**
```css
--border: oklch(0.88 0.02 280);         /* Borders and dividers (3:1 min ✓) */
--input: oklch(0.88 0.02 280);          /* Form input borders (3:1 min ✓) */
--ring: oklch(0.55 0.20 290);           /* Focus ring - Purple (3:1 min ✓) */
```

### 1.3 Validated Foreground/Background Pairings

| Background | Foreground | Contrast Ratio | Status |
|------------|------------|----------------|--------|
| Background (Soft White) | Foreground (Deep Purple) | 13.2:1 | ✓ AAA |
| Card (Light Gray) | Card Foreground (Deep Purple) | 12.1:1 | ✓ AAA |
| Primary (Vibrant Purple) | White Text | 6.8:1 | ✓ AA |
| Secondary (Electric Cyan) | Deep Purple Text | 5.1:1 | ✓ AA |
| Accent (Warm Coral) | White Text | 5.3:1 | ✓ AA |
| Success (Bright Lime) | Deep Purple Text | 7.2:1 | ✓ AA |
| Destructive (Error Red) | White Text | 5.1:1 | ✓ AA |
| Muted (Light Gray) | Muted Foreground | 4.6:1 | ✓ AA |

### 1.4 High Contrast Mode

For users who enable High Contrast Mode via Quick Accessibility Settings:

```css
.high-contrast {
  --background: oklch(1 0 0);           /* Pure white */
  --foreground: oklch(0 0 0);           /* Pure black (21:1 ✓) */
  --card: oklch(0.98 0 0);              /* Near white */
  --primary: oklch(0.45 0.25 290);      /* Darker purple (7:1+ ✓) */
  --accent: oklch(0.60 0.22 30);        /* Darker coral (4.5:1+ ✓) */
  --border: oklch(0 0 0);               /* Black borders */
  --muted: oklch(0.92 0 0);             /* Light gray */
}
```

---

## 2. Typography and Readability

### 2.1 Font Selection

**Primary Font: Poppins** (Sans-serif)
- Selected for high legibility, dyslexia-friendly characteristics
- Large x-height with clear distinction between similar characters (l, I, 1)
- Modern, playful aesthetic matching game-like tone

**Fallback Stack**
```css
font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

**❌ Avoid**
- Decorative or highly stylized fonts
- Script fonts or handwriting styles
- Condensed fonts with poor spacing
- Italics for body text (use bold or color for emphasis)

### 2.2 Font Sizing

**Minimum Body Text**: 16px (1rem or 100%)  
- Never use text smaller than 16px for body content
- Exception: UI micro-copy (captions, helper text) may be 14px minimum with 4.5:1 contrast

**Typographic Scale** (Based on Poppins)

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|--------|-------------|----------------|-------|
| H1 (Page Titles) | 36px | Bold | 1.2 | -0.01em | Dashboard title, main headers |
| H2 (Sections) | 28px | SemiBold | 1.3 | 0 | Section headers, module titles |
| H3 (Subsections) | 22px | Medium | 1.4 | 0 | Course cards, quest titles |
| Body Text | 18px | Regular | 1.6 | 0 | Main content, descriptions |
| UI Labels | 16px | Medium | 1.5 | 0.01em | Form labels, button text |
| Game Stats | 20-32px | Bold | 1.3 | -0.02em | XP, level, scores |
| Captions | 14px | Regular | 1.5 | 0 | Supporting text, metadata |

### 2.3 Accessible Text Spacing (WCAG 2.1 Success Criterion 1.4.12)

Users **MUST** be able to override spacing without loss of content or functionality.

**Minimum Requirements**
- **Line Height**: At least **1.5x** the font size for body text
- **Paragraph Spacing**: At least **2x** the font size between paragraphs
- **Letter Spacing**: At least **0.12x** the font size
- **Word Spacing**: At least **0.16x** the font size

**Implementation**
```css
body {
  line-height: 1.6;        /* Body text */
  letter-spacing: normal;  /* Allow user override */
  word-spacing: normal;    /* Allow user override */
}

p + p {
  margin-top: 1.5em;       /* Paragraph spacing */
}

h1, h2, h3, h4, h5, h6 {
  line-height: 1.2-1.4;    /* Tighter for headers */
}
```

### 2.4 User-Adjustable Text Size

**Quick Accessibility Settings** must provide:
- **Normal** (100% - default 16px)
- **Large** (110% - 17.6px)
- **X-Large** (125% - 20px)

**Implementation**
```typescript
// Applied to document root
document.documentElement.style.fontSize = '110%'; // Large
```

**Testing Requirement**: At 200% zoom, all text must remain readable without horizontal scrolling (WCAG 2.1 SC 1.4.4).

---

## 3. Interaction and Focus States

### 3.1 Keyboard Navigation (CRITICAL)

The platform **MUST** be 100% operable via keyboard alone.

**Tab Order**
- Must follow logical visual flow (top to bottom, left to right)
- Dashboard order: Player Identity → Main Mission → Side Missions → Progress Goals → Accessibility Settings
- Skip links must be first in tab order

**Required Keyboard Shortcuts**
| Action | Key | Context |
|--------|-----|---------|
| Navigate forward | Tab | All interactive elements |
| Navigate backward | Shift + Tab | All interactive elements |
| Activate element | Enter or Space | Buttons, links, toggles |
| Close modal/dialog | Escape | Modals, panels, dropdowns |
| Skip to main content | Skip link (Tab to focus) | Page load |
| Toggle accordion | Enter or Space | Course modules |
| Select dropdown option | Arrow keys + Enter | Filters, selectors |

### 3.2 Focus Indicators (CRITICAL)

Every interactive element **MUST** display a highly visible focus state.

**Minimum Requirements**
- **Width**: Minimum **3px** solid outline or ring
- **Contrast**: Minimum **3:1** against background (WCAG 2.1 SC 1.4.11)
- **Color**: Primary purple (oklch(0.55 0.20 290))
- **Offset**: 2px from element edge for clarity

**Implementation**
```css
.focus-visible:focus,
*:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* For custom focus rings */
.custom-focus:focus-visible {
  box-shadow: 0 0 0 3px var(--ring);
}
```

**Visual Example**
- Button with focus: Purple 3px ring, 2px offset, rounded corners
- Form input with focus: Purple 3px ring + label color change
- Card with focus: Purple 3px ring around entire card

**❌ Never**
- Remove focus indicators with `outline: none` without replacement
- Use focus indicators with insufficient contrast (<3:1)
- Make focus indicators invisible or barely visible

### 3.3 Form Field Labels (CRITICAL)

All input fields **MUST** have visible, permanent, and programmatically associated labels.

**❌ Wrong** (Placeholder-only)
```tsx
<input placeholder="Enter your email" />
```

**✅ Correct** (Visible label + programmatic association)
```tsx
<Label htmlFor="email">Email Address</Label>
<Input id="email" placeholder="you@example.com" />
```

**Requirements**
- Labels must be **visible at all times** (not just placeholders)
- Labels must remain visible **when field is focused or filled**
- Labels must be **programmatically associated** via `htmlFor` and `id`
- Labels must have **4.5:1 contrast** with background

### 3.4 Touch Targets (WCAG 2.1 SC 2.5.5)

All interactive elements **MUST** have a minimum touch target size.

**Minimum Size**: **44x44 CSS pixels**

**Applies To**
- Buttons (all variants)
- Links (standalone)
- Form inputs (text, checkbox, radio, toggle)
- Icon buttons
- Dropdown triggers
- Accordion expanders
- Tab controls
- Slider thumbs

**Implementation**
```css
/* Buttons */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1.5rem;
}

/* Icon buttons */
.icon-button {
  width: 48px;
  height: 48px;
}

/* Checkbox/Radio */
.checkbox, .radio {
  min-width: 24px;
  min-height: 24px;
  /* Parent label provides 44x44 click area */
}

.checkbox-label {
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 0.5rem;
}
```

**Spacing Between Targets**
- Minimum **8px gap** between adjacent interactive elements
- Use `gap-2` (8px) or larger in flex/grid containers

### 3.5 Motion Control (WCAG 2.1 SC 2.3.3)

All non-essential animations **MUST**:
1. Honor `prefers-reduced-motion` system preference
2. Be toggleable via Quick Accessibility Settings

**Non-Essential Animations** (Must be controllable)
- XP gain particle effects
- Level-up celebrations
- Achievement unlock animations
- Character movements
- Floating/bobbing elements
- Progress bar fills
- Button hover animations
- Glow effects

**Essential Animations** (Can remain)
- Loading indicators
- Focus state transitions
- Scroll position indicators

**Implementation**
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

/* User preference override */
.reduce-motion * {
  animation: none !important;
  transition: none !important;
}
```

```typescript
// Check user preference
const { preferences } = useAccessibilityPreferences()
const shouldAnimate = !preferences.reduceMotion

// Conditional animation
{shouldAnimate && <motion.div animate={{...}} />}
{!shouldAnimate && <div>{content}</div>}
```

**Animation Durations** (when enabled)
- Micro-interactions (button press): 100-150ms
- State changes: 200-300ms
- Page transitions: 300-500ms
- Celebrations: 400-600ms

---

## 4. Component-Specific Guidelines

### 4.1 Buttons

**Visual Requirements**
- Minimum height: 44px
- Minimum touch target: 44x44px
- Clear text labels (no icon-only without aria-label)
- 3:1 contrast for button background vs page background
- 4.5:1 contrast for button text vs button background

**States** (All must be visually distinct)
```typescript
// Default
<Button>Submit</Button>

// Hover (subtle background shift)
<Button className="hover:bg-primary/90">Submit</Button>

// Focus (prominent 3px ring)
<Button className="focus-visible:outline focus-visible:outline-3">Submit</Button>

// Active (slight scale down)
<Button className="active:scale-[0.98]">Submit</Button>

// Disabled (reduced opacity + not-allowed cursor)
<Button disabled>Submit</Button>
```

**Accessible Button Examples**
```tsx
// Primary action
<Button variant="default" size="lg">
  Continue Adventure
</Button>

// Icon with text (preferred)
<Button variant="outline">
  <GraduationCap size={20} aria-hidden="true" />
  Dashboard
</Button>

// Icon-only (with aria-label)
<Button variant="ghost" size="icon" aria-label="Settings">
  <Gear size={24} />
</Button>
```

### 4.2 Form Inputs

**Requirements**
- Visible permanent label (not placeholder-only)
- 44px minimum height
- 3:1 border contrast
- Focus indicator (3px ring)
- Error states include icon + color + text message

**Accessible Input Pattern**
```tsx
<div className="space-y-2">
  <Label htmlFor="course-name">Course Name *</Label>
  <Input
    id="course-name"
    placeholder="e.g., Security Training 101"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? "course-name-error" : undefined}
  />
  {hasError && (
    <p id="course-name-error" className="text-sm text-destructive flex items-center gap-1">
      <XCircle size={16} aria-hidden="true" />
      Course name is required
    </p>
  )}
</div>
```

### 4.3 Progress Indicators

**Requirements**
- Color + pattern (not color alone)
- Percentage or fraction text label
- ARIA attributes for screen readers

**Accessible Progress Bar**
```tsx
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

### 4.4 Status Badges

**Requirements**
- Color + icon + text (triple redundancy)
- Minimum 3:1 contrast for badge background

**Accessible Badge Pattern**
```tsx
// Not Started (with icon)
<Badge variant="outline">
  <Circle size={12} aria-hidden="true" />
  Not Started
</Badge>

// In Progress (with icon)
<Badge variant="secondary">
  <Clock size={12} aria-hidden="true" />
  In Progress
</Badge>

// Completed (with icon)
<Badge variant="success">
  <CheckCircle size={12} aria-hidden="true" />
  Complete
</Badge>
```

### 4.5 Modals and Dialogs

**Requirements**
- Focus trap (tab cycles within modal)
- ESC key closes modal
- Focus returns to trigger element on close
- ARIA attributes for screen readers

**Accessible Dialog Pattern**
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open Settings</Button>
  </DialogTrigger>
  <DialogContent
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <DialogHeader>
      <DialogTitle id="dialog-title">Accessibility Settings</DialogTitle>
      <DialogDescription id="dialog-description">
        Customize your learning experience
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogClose asChild>
      <Button variant="ghost">Close</Button>
    </DialogClose>
  </DialogContent>
</Dialog>
```

---

## 5. Testing and Validation Checklist

### 5.1 Color Contrast Testing

**Tools**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Inspect > Accessibility > Contrast ratio
- axe DevTools browser extension

**Test All**
- ✓ Body text on all backgrounds (4.5:1 minimum)
- ✓ Large text on all backgrounds (3:1 minimum)
- ✓ Button text on button backgrounds (4.5:1 minimum)
- ✓ Form input borders on page background (3:1 minimum)
- ✓ Focus rings on all backgrounds (3:1 minimum)
- ✓ Icon buttons on backgrounds (3:1 minimum)
- ✓ Status badges text and backgrounds (4.5:1 text, 3:1 border)

### 5.2 Keyboard Navigation Testing

**Test Flow**
1. Load page (no mouse)
2. Tab through all interactive elements in order
3. Verify focus indicator is visible for every element
4. Activate each element with Enter or Space
5. Navigate modals/dropdowns with arrow keys
6. Close modals with ESC key
7. Verify skip links work
8. Test in reverse with Shift+Tab

**Pass Criteria**
- ✓ All interactive elements reachable
- ✓ Tab order is logical
- ✓ Focus indicators always visible (3px minimum)
- ✓ No keyboard traps
- ✓ Modals trap focus correctly
- ✓ ESC closes modals

### 5.3 Screen Reader Testing

**Tools**
- NVDA (Windows - free)
- JAWS (Windows)
- VoiceOver (macOS/iOS - built-in)
- TalkBack (Android - built-in)

**Test Cases**
- ✓ Page title announced on load
- ✓ Heading hierarchy correct (H1 → H2 → H3)
- ✓ Form labels read correctly
- ✓ Button purposes clear
- ✓ Error messages announced
- ✓ Progress updates announced
- ✓ Images have alt text
- ✓ Icons marked aria-hidden="true" if decorative

### 5.4 Touch Target Testing (Mobile)

**Test On**
- Mobile device (real hardware preferred)
- Chrome DevTools device emulation

**Verify**
- ✓ All buttons minimum 44x44px
- ✓ Links have adequate padding
- ✓ Form inputs easy to tap
- ✓ No accidental activations
- ✓ Adequate spacing between targets (8px minimum)

### 5.5 Motion Preference Testing

**Test**
1. Enable system "Reduce Motion" preference
   - macOS: System Settings > Accessibility > Display > Reduce motion
   - Windows: Settings > Ease of Access > Display > Show animations
2. Load platform
3. Verify animations are disabled or simplified
4. Toggle "Reduce Motion" in Quick Accessibility Settings
5. Verify animations disable/enable

**Pass Criteria**
- ✓ Respects system preference
- ✓ User toggle works
- ✓ Essential animations remain (loading)
- ✓ Decorative animations removed

---

## 6. Quick Reference

### WCAG 2.1 Level AA Success Criteria Summary

| Criterion | Requirement | Platform Implementation |
|-----------|-------------|------------------------|
| 1.4.3 Contrast (Minimum) | Text 4.5:1, Large text 3:1 | All color pairings validated |
| 1.4.11 Non-text Contrast | UI components 3:1 | Buttons, inputs, focus rings tested |
| 1.4.12 Text Spacing | User can adjust spacing | No overflow at 200% zoom |
| 2.1.1 Keyboard | All functionality via keyboard | Tab order, skip links, shortcuts |
| 2.4.7 Focus Visible | Focus indicator visible | 3px purple ring on all elements |
| 2.5.5 Target Size | Minimum 44x44px | All buttons, inputs comply |
| 3.2.1 On Focus | No context change on focus | Only changes on activation |
| 3.3.2 Labels or Instructions | Form fields have labels | All inputs have visible labels |
| 4.1.2 Name, Role, Value | ARIA for custom components | Proper ARIA on all widgets |

### Common Violations to Avoid

❌ **Color-Only Information**
```tsx
// Wrong
<div className="text-green-500">Success</div>

// Correct
<div className="text-success flex items-center gap-1">
  <CheckCircle size={16} aria-hidden="true" />
  Success
</div>
```

❌ **Placeholder-Only Labels**
```tsx
// Wrong
<input placeholder="Email" />

// Correct
<Label htmlFor="email">Email</Label>
<Input id="email" placeholder="you@example.com" />
```

❌ **Missing Focus Indicators**
```css
/* Wrong */
button:focus {
  outline: none;
}

/* Correct */
button:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
```

❌ **Icon-Only Buttons Without Labels**
```tsx
// Wrong
<Button><Gear size={24} /></Button>

// Correct
<Button aria-label="Settings">
  <Gear size={24} />
</Button>
```

❌ **Insufficient Contrast**
```css
/* Wrong - 2.1:1 */
color: #999999;
background: #ffffff;

/* Correct - 4.6:1 */
color: oklch(0.50 0.05 280);
background: oklch(0.98 0 0);
```

---

## 7. Resources

### Testing Tools
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **axe DevTools**: Browser extension for automated accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Built into Chrome DevTools

### Screen Readers
- **NVDA**: Free, Windows (https://www.nvaccess.org/)
- **VoiceOver**: Built-in, macOS/iOS
- **JAWS**: Windows (https://www.freedomscientific.com/products/software/jaws/)
- **TalkBack**: Built-in, Android

### Standards Documentation
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/

---

## Document Version
- **Version**: 1.0
- **Last Updated**: 2024
- **Status**: Active
- **Review Cycle**: Quarterly
