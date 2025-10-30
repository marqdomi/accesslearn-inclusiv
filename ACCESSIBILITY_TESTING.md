# GameLearn Accessibility Testing Checklist

This document provides step-by-step testing procedures to validate WCAG 2.1 Level AA compliance across the GameLearn platform.

## Quick Reference: WCAG 2.1 Level AA Requirements

| Category | Requirement | Minimum Standard | Status |
|----------|-------------|------------------|--------|
| **Color Contrast** | Body text | 4.5:1 | ✓ Implemented |
| **Color Contrast** | Large text (18pt+/14pt+ bold) | 3:1 | ✓ Implemented |
| **Color Contrast** | UI components & graphics | 3:1 | ✓ Implemented |
| **Keyboard** | Full keyboard operability | All functions accessible | ✓ Implemented |
| **Focus** | Visible focus indicator | 3:1 contrast, always visible | ✓ Implemented |
| **Touch Targets** | Minimum size | 44x44 CSS pixels | ✓ Implemented |
| **Labels** | Form inputs | Visible permanent labels | ✓ Implemented |
| **Text Spacing** | User adjustable spacing | No loss of content/function | ✓ Implemented |
| **Motion** | Reduce motion support | System + user toggle | ✓ Implemented |
| **ARIA** | Semantic markup | Proper roles, states, properties | ✓ Implemented |

---

## 1. Color Contrast Testing

### Tools Required
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools (Lighthouse + Accessibility panel)
- [axe DevTools](https://www.deque.com/axe/devtools/) browser extension

### Test Procedure

#### 1.1 Body Text Contrast (4.5:1 minimum)

**Test Cases:**
- [ ] Dashboard main text on background
- [ ] Course card descriptions on card background
- [ ] Form labels on background
- [ ] Modal/dialog text on modal background
- [ ] Button labels on button backgrounds
- [ ] Table text on table cells
- [ ] Tooltip text on tooltip background

**How to Test:**
1. Open Chrome DevTools
2. Inspect text element
3. Navigate to "Accessibility" tab
4. Check "Contrast" section
5. Verify ratio is 4.5:1 or higher

**Expected Results:**
- All body text: Minimum 4.5:1 ✓
- Example: Deep Purple (oklch(0.25 0.08 280)) on Soft White (oklch(0.98 0 0)) = 13.2:1 ✓

#### 1.2 Large Text Contrast (3:1 minimum)

**Test Cases:**
- [ ] H1 headings (36px bold)
- [ ] H2 headings (28px semibold)
- [ ] H3 headings (22px medium)
- [ ] Large stats/numbers (20-32px bold)
- [ ] Large buttons

**How to Test:**
1. Same as 1.1 but verify 3:1 minimum
2. Ensure text is actually large (18pt+/14pt+ bold)

#### 1.3 UI Component Contrast (3:1 minimum)

**Test Cases:**
- [ ] Button borders vs background
- [ ] Form input borders vs background
- [ ] Focus ring vs all backgrounds
- [ ] Progress bar fill vs background
- [ ] Badge backgrounds vs page background
- [ ] Icon buttons vs background
- [ ] Card borders vs background

**How to Test:**
1. Use Color Contrast Analyzer
2. Sample component color
3. Sample adjacent background
4. Verify 3:1 minimum ratio

#### 1.4 High Contrast Mode Test

**Test Cases:**
- [ ] Enable High Contrast Mode via Accessibility Settings
- [ ] Verify all text becomes pure black on pure white
- [ ] Verify buttons have enhanced borders
- [ ] Verify all UI components maintain 3:1 minimum

**How to Test:**
1. Open Accessibility Settings (gear icon bottom-right)
2. Toggle "High Contrast Mode"
3. Verify visual changes applied
4. Re-test contrast ratios (should exceed requirements)

---

## 2. Keyboard Navigation Testing

### Test Setup
- **No mouse allowed during test**
- Use only: Tab, Shift+Tab, Enter, Space, Arrow keys, Escape

### Test Procedure

#### 2.1 Skip Links

**Test Cases:**
- [ ] On page load, press Tab once
- [ ] "Skip to main content" link receives focus
- [ ] Link is visible when focused
- [ ] Pressing Enter jumps to main content
- [ ] Focus moves to main content area

**Expected Result:**
- Skip link appears at top of page ✓
- High contrast focus indicator visible ✓
- Keyboard activation works ✓

#### 2.2 Logical Tab Order (Dashboard)

**Test Cases:**
- [ ] Tab through entire Dashboard without mouse
- [ ] Verify tab order matches visual layout:
  1. Skip link
  2. Player identity section
  3. Main mission card
  4. Side missions
  5. Progress goals
  6. Accessibility settings button
  7. Footer/navigation

**How to Test:**
1. Refresh page
2. Press Tab repeatedly
3. Observe focus indicator movement
4. Verify it follows logical visual flow (top→bottom, left→right)

**Expected Result:**
- Tab order is logical ✓
- No unexpected jumps ✓
- All interactive elements reachable ✓

#### 2.3 Interactive Element Activation

**Test Cases:**
- [ ] Buttons activate with Enter key
- [ ] Buttons activate with Space key
- [ ] Links activate with Enter key
- [ ] Checkboxes toggle with Space key
- [ ] Switches toggle with Space key
- [ ] Accordions expand/collapse with Enter/Space
- [ ] Tabs switch with arrow keys

**How to Test:**
1. Tab to each element type
2. Try activating with Enter
3. Try activating with Space
4. Verify expected behavior occurs

#### 2.4 Modal/Dialog Focus Management

**Test Cases:**
- [ ] Open Accessibility Settings dialog (Tab to gear icon, press Enter)
- [ ] Focus moves inside dialog
- [ ] Tab cycles through dialog elements only
- [ ] Cannot Tab outside dialog (focus trap)
- [ ] Press Escape to close dialog
- [ ] Focus returns to trigger button (gear icon)

**How to Test:**
1. Tab to Accessibility Settings button
2. Press Enter to open
3. Press Tab multiple times
4. Verify focus stays within dialog
5. Press Escape
6. Verify focus returns to gear button

**Expected Result:**
- Focus trap works ✓
- Escape closes dialog ✓
- Focus returns correctly ✓

#### 2.5 Dropdown/Select Navigation

**Test Cases:**
- [ ] Tab to dropdown/select
- [ ] Press Enter or Space to open
- [ ] Use arrow keys to navigate options
- [ ] Press Enter to select option
- [ ] Press Escape to close without selection

**Expected Result:**
- Keyboard navigation complete ✓
- Arrow keys work ✓
- Enter selects ✓
- Escape cancels ✓

---

## 3. Focus Indicator Testing

### Requirements
- **Width:** Minimum 3px
- **Contrast:** Minimum 3:1 against all backgrounds
- **Color:** Primary purple (oklch(0.55 0.20 290))
- **Offset:** 2px from element edge

### Test Procedure

#### 3.1 Focus Visibility on All Elements

**Test Cases:**
- [ ] Buttons (all variants)
- [ ] Links
- [ ] Form inputs (text, email, etc.)
- [ ] Textareas
- [ ] Checkboxes
- [ ] Radio buttons
- [ ] Switches
- [ ] Sliders
- [ ] Select/dropdown triggers
- [ ] Accordion headers
- [ ] Tab controls
- [ ] Cards (if clickable)
- [ ] Icon buttons

**How to Test:**
1. Tab to each element
2. Verify focus indicator appears
3. Verify it's clearly visible (3px purple ring)
4. Verify 2px offset from element
5. Take screenshot for documentation

**Expected Result:**
- Purple 3px outline/ring visible on ALL interactive elements ✓
- Offset creates clear separation ✓
- Never invisible or barely visible ✓

#### 3.2 Focus Contrast Measurement

**Test Cases:**
- [ ] Focus ring on white background
- [ ] Focus ring on card background
- [ ] Focus ring on primary button background
- [ ] Focus ring on secondary button background
- [ ] Focus ring on accent backgrounds

**How to Test:**
1. Tab to element on each background type
2. Use Color Contrast Analyzer
3. Sample focus ring color
4. Sample adjacent background color
5. Verify 3:1 minimum

**Expected Result:**
- Primary purple focus ring vs all backgrounds: 3:1+ ✓

---

## 4. Touch Target Testing (Mobile)

### Test Setup
- Mobile device (iPhone, Android) OR
- Chrome DevTools device emulation (responsive mode)

### Requirements
- **Minimum size:** 44x44 CSS pixels
- **Minimum spacing:** 8px between targets

### Test Procedure

#### 4.1 Button Touch Targets

**Test Cases:**
- [ ] Primary action buttons
- [ ] Secondary buttons
- [ ] Icon buttons (gear icon, close buttons)
- [ ] Text size toggle buttons
- [ ] Navigation buttons

**How to Test:**
1. Inspect element in DevTools
2. Check computed dimensions
3. Verify width ≥ 44px AND height ≥ 44px
4. Attempt to tap on real device
5. Verify no accidental mis-taps

**Expected Result:**
- All buttons minimum 44x44px ✓
- Easy to tap without errors ✓

#### 4.2 Form Input Touch Targets

**Test Cases:**
- [ ] Text inputs
- [ ] Checkboxes (including label hit area)
- [ ] Radio buttons (including label hit area)
- [ ] Switches
- [ ] Slider thumbs

**How to Test:**
1. Inspect each input
2. Verify minimum 44px height
3. For checkbox/radio: verify parent label provides adequate hit area
4. Test on mobile device

**Expected Result:**
- Input height ≥ 44px ✓
- Labels increase hit area ✓
- Easy to select on mobile ✓

#### 4.3 Spacing Between Targets

**Test Cases:**
- [ ] Button groups (text size toggles)
- [ ] Navigation buttons
- [ ] Form inputs stacked vertically
- [ ] Course cards in grid

**How to Test:**
1. Inspect spacing using DevTools ruler
2. Measure gap between adjacent interactive elements
3. Verify ≥ 8px (0.5rem / gap-2 in Tailwind)

**Expected Result:**
- Minimum 8px spacing ✓
- No accidental activations ✓

---

## 5. Form Label Testing

### Requirements
- All form inputs must have **visible** labels
- Labels must be **permanently visible** (not just placeholders)
- Labels must be **programmatically associated** (htmlFor + id)
- Labels must have **4.5:1 contrast**

### Test Procedure

#### 5.1 Label Visibility

**Test Cases:**
- [ ] All text inputs have visible label above or beside
- [ ] Labels remain visible when input is focused
- [ ] Labels remain visible when input is filled
- [ ] Labels are not placeholders alone

**How to Test:**
1. View all forms in platform
2. Verify label text is visible for every input
3. Focus input and verify label stays visible
4. Fill input and verify label stays visible

**Expected Result:**
- All inputs have permanent visible labels ✓
- No placeholder-only inputs ✓

#### 5.2 Programmatic Association

**Test Cases:**
- [ ] Every `<Label>` has `htmlFor` attribute
- [ ] Every `<Input>` has matching `id` attribute
- [ ] Screen reader announces label when input focused

**How to Test (Code Review):**
```tsx
// ✓ Correct
<Label htmlFor="email">Email Address</Label>
<Input id="email" />

// ✗ Wrong
<Label>Email</Label>
<Input />
```

**How to Test (Screen Reader):**
1. Enable screen reader (VoiceOver, NVDA, etc.)
2. Tab to form input
3. Verify screen reader announces label text

**Expected Result:**
- All inputs have htmlFor/id association ✓
- Screen reader reads label ✓

#### 5.3 Required Field Indication

**Test Cases:**
- [ ] Required inputs indicated with asterisk (*)
- [ ] Required inputs have `aria-required="true"`
- [ ] Visual indicator not color-only

**Expected Result:**
- Visual asterisk present ✓
- ARIA attribute present ✓
- Not relying on color alone ✓

---

## 6. Motion Preference Testing

### Requirements
- Respect `prefers-reduced-motion` system setting
- Provide user toggle in Accessibility Settings
- Disable/simplify non-essential animations when active

### Test Procedure

#### 6.1 System Preference Test

**How to Enable Reduce Motion:**
- **macOS:** System Settings → Accessibility → Display → Reduce motion ✓
- **Windows:** Settings → Ease of Access → Display → Show animations (OFF)
- **iOS:** Settings → Accessibility → Motion → Reduce Motion ✓
- **Android:** Settings → Accessibility → Remove animations ✓

**Test Cases:**
- [ ] Enable system reduce motion setting
- [ ] Load GameLearn platform
- [ ] Verify animations are disabled/simplified:
  - [ ] XP gain animations
  - [ ] Level-up celebrations
  - [ ] Achievement unlock animations
  - [ ] Progress bar fills (instant)
  - [ ] Floating elements
  - [ ] Glow effects
- [ ] Essential animations still work:
  - [ ] Loading indicators
  - [ ] Focus transitions (can be very fast)

**Expected Result:**
- Platform respects system setting ✓
- Decorative animations disabled ✓
- Essential animations remain ✓

#### 6.2 User Toggle Test

**Test Cases:**
- [ ] Open Accessibility Settings
- [ ] Toggle "Reduce Motion" switch
- [ ] Verify animations disable immediately
- [ ] Verify preference persists on page refresh
- [ ] Toggle OFF, verify animations re-enable

**How to Test:**
1. Ensure system reduce motion is OFF
2. Open Accessibility Settings (gear icon)
3. Toggle "Reduce Motion" ON
4. Perform actions that trigger animations (earn XP, complete module)
5. Verify animations are disabled
6. Refresh page
7. Verify setting persisted
8. Toggle OFF and verify animations return

**Expected Result:**
- User toggle overrides animations ✓
- Preference persists across sessions ✓
- Animations re-enable when toggled off ✓

#### 6.3 CSS Implementation Check

**Verify CSS:**
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

.reduce-motion * {
  animation: none !important;
  transition: none !important;
}
```

**Expected Result:**
- CSS media query present ✓
- Class-based override present ✓

---

## 7. Screen Reader Testing

### Tools Required
- **Windows:** NVDA (free) or JAWS
- **macOS:** VoiceOver (built-in)
- **iOS:** VoiceOver (built-in)
- **Android:** TalkBack (built-in)

### Test Procedure

#### 7.1 Page Structure Test (VoiceOver/NVDA)

**Test Cases:**
- [ ] Enable screen reader
- [ ] Navigate to Dashboard
- [ ] Verify page title announced: "GameLearn - Gamified Learning Platform"
- [ ] Use heading navigation (H key in NVDA)
- [ ] Verify heading hierarchy:
  - [ ] H1: "GameLearn" (main title)
  - [ ] H2: Section headings (Player Identity, Main Mission, etc.)
  - [ ] H3: Subsections (course titles, module names)

**Expected Result:**
- Headings in correct order (H1→H2→H3) ✓
- Screen reader can navigate by headings ✓
- Hierarchy matches visual importance ✓

#### 7.2 Interactive Element Announcements

**Test Cases:**
- [ ] Tab to "Continue Adventure" button
  - [ ] Screen reader announces: "Continue Adventure, button"
- [ ] Tab to course card
  - [ ] Announces: Course title, description, progress
- [ ] Tab to checkbox
  - [ ] Announces: Label text, checkbox, checked/unchecked
- [ ] Tab to switch (High Contrast Mode)
  - [ ] Announces: "High Contrast Mode, switch, on/off"

**How to Test:**
1. Enable screen reader
2. Tab through interactive elements
3. Listen to announcements
4. Verify role and state are correct

**Expected Result:**
- All buttons announced as "button" ✓
- All inputs announce their label ✓
- State changes announced (checked, expanded, etc.) ✓

#### 7.3 Form Error Announcements

**Test Cases:**
- [ ] Submit form with missing required field
- [ ] Screen reader announces error message
- [ ] Error associated with correct field via aria-describedby

**How to Test:**
1. Navigate to form with validation
2. Leave required field empty
3. Submit form
4. Verify error announced by screen reader

**Expected Result:**
- Errors announced immediately ✓
- User knows which field has error ✓

#### 7.4 Dynamic Content Announcements

**Test Cases:**
- [ ] Earn XP (complete module)
  - [ ] Screen reader announces: "+50 XP earned!"
- [ ] Unlock achievement
  - [ ] Screen reader announces achievement details
- [ ] Progress bar updates
  - [ ] Screen reader announces percentage

**How to Test:**
1. Enable screen reader
2. Perform action that triggers dynamic update
3. Listen for ARIA live region announcement

**Implementation Check:**
```tsx
// Toast notifications
toast.success("+50 XP earned!", {
  // Sonner automatically uses aria-live
})

// Progress announcements
<Progress
  value={progress}
  aria-label={`Course ${progress}% complete`}
  aria-live="polite"
/>
```

**Expected Result:**
- Dynamic updates announced ✓
- User aware of changes without seeing screen ✓

---

## 8. Text Spacing Override Test

### WCAG 2.1 SC 1.4.12 Requirements

Users must be able to adjust spacing without loss of content or functionality:
- **Line height:** 1.5x font size
- **Paragraph spacing:** 2x font size  
- **Letter spacing:** 0.12x font size
- **Word spacing:** 0.16x font size

### Test Procedure

#### 8.1 Browser Zoom Test

**Test Cases:**
- [ ] Set browser zoom to 200%
- [ ] Verify all text remains readable
- [ ] Verify no horizontal scrolling required
- [ ] Verify no content overlap
- [ ] Verify no truncated text

**How to Test:**
1. Chrome: Cmd/Ctrl + Plus (+) to 200%
2. Navigate entire platform
3. Verify all pages functional

**Expected Result:**
- Platform functional at 200% zoom ✓
- No loss of content ✓
- No horizontal scroll ✓

#### 8.2 Text Spacing Bookmarklet Test

**Test Tool:**
Use [WCAG 2.1 Text Spacing Bookmarklet](https://cdpn.io/stevef/debug/YLMqbo)

**Test Cases:**
- [ ] Apply bookmarklet
- [ ] CSS applies maximum spacing values
- [ ] Verify no text overlap
- [ ] Verify no truncation
- [ ] Verify buttons still readable
- [ ] Verify forms still functional

**Expected Result:**
- All content remains accessible ✓
- No broken layouts ✓

---

## 9. Automated Testing

### Tools

#### 9.1 Lighthouse (Chrome DevTools)

**How to Run:**
1. Open Chrome DevTools
2. Navigate to "Lighthouse" tab
3. Select "Accessibility" category
4. Click "Generate report"

**Pass Criteria:**
- [ ] Score ≥ 95/100
- [ ] Zero critical issues
- [ ] Address all warnings

#### 9.2 axe DevTools

**How to Run:**
1. Install axe DevTools browser extension
2. Open extension in DevTools
3. Click "Scan ALL of my page"
4. Review issues

**Pass Criteria:**
- [ ] Zero critical issues
- [ ] Zero serious issues
- [ ] Document and address moderate/minor issues

#### 9.3 WAVE Tool

**How to Run:**
1. Visit https://wave.webaim.org/
2. Enter platform URL
3. Review visual indicators

**Pass Criteria:**
- [ ] No errors
- [ ] All warnings reviewed and justified

---

## 10. Compliance Certification Checklist

Before launching or after major updates, verify:

### Color & Contrast
- [x] All body text 4.5:1 minimum
- [x] All large text 3:1 minimum  
- [x] All UI components 3:1 minimum
- [x] High contrast mode available
- [x] Color never used alone to convey information

### Keyboard & Focus
- [x] 100% keyboard operable
- [x] Logical tab order
- [x] Visible focus indicators (3px, 3:1 contrast)
- [x] No keyboard traps
- [x] Skip links present

### Touch & Interaction
- [x] All touch targets minimum 44x44px
- [x] Adequate spacing between targets (8px min)
- [x] Form labels visible and associated
- [x] Required fields clearly indicated

### Motion & Animation
- [x] Respects prefers-reduced-motion
- [x] User toggle available
- [x] Essential animations remain

### Screen Reader Support
- [x] Semantic HTML structure
- [x] Proper heading hierarchy
- [x] ARIA labels where needed
- [x] Form errors announced
- [x] Dynamic content announced

### Text & Readability
- [x] Minimum 16px body text
- [x] Dyslexia-friendly font (Poppins)
- [x] Line height 1.5x minimum
- [x] Functional at 200% zoom
- [x] User adjustable text size

### Testing Completed
- [ ] Manual keyboard testing
- [ ] Screen reader testing (NVDA/VoiceOver)
- [ ] Mobile touch target testing
- [ ] Automated testing (Lighthouse, axe, WAVE)
- [ ] Color contrast validation
- [ ] All issues documented and resolved

---

## Issue Tracking Template

When accessibility issues are found:

```markdown
**Issue:** [Brief description]
**WCAG Criterion:** [e.g., 1.4.3 Contrast (Minimum)]
**Severity:** Critical / Serious / Moderate / Minor
**Location:** [Page/Component]
**Current State:** [What's wrong]
**Expected State:** [What should happen]
**Steps to Reproduce:**
1. 
2. 
3. 

**Screenshot:** [Attach if helpful]
**Resolution:** [How it was fixed]
**Verified:** [ ] Yes [ ] No
```

---

## Maintenance Schedule

- **Weekly:** Automated scans (axe DevTools)
- **Monthly:** Manual keyboard/screen reader spot checks
- **Quarterly:** Full compliance audit
- **Before major releases:** Complete testing checklist
- **After design changes:** Re-test affected components

---

## Resources

### Testing Tools
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- axe DevTools: https://www.deque.com/axe/devtools/
- WAVE: https://wave.webaim.org/
- Lighthouse: Built into Chrome DevTools

### Screen Readers
- NVDA (Windows): https://www.nvaccess.org/
- JAWS (Windows): https://www.freedomscientific.com/products/software/jaws/
- VoiceOver (macOS/iOS): Built-in
- TalkBack (Android): Built-in

### Standards
- WCAG 2.1 Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Practices: https://www.w3.org/WAI/ARIA/apg/

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Next Review:** Quarterly
