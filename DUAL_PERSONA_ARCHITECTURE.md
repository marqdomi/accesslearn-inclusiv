# Dual Persona Architecture Guide

## Overview

AccessLearn implements a **Dual Persona Architecture** that provides two distinct visual identities based on the user's role:

1. **Learner Persona** - "The Accessible Game": An immersive, gamified experience that feels like a modern video game
2. **Admin Persona** - "The Professional Tool": A clean, data-driven SaaS management interface

Both personas maintain **WCAG 2.1 Level AA accessibility compliance** as their foundation.

## Design Principles

### Learner Persona: The Accessible Game

**Objective**: Create an engaging, motivating, and fun experience that feels like playing a video game while being 100% accessible.

#### Visual Identity
- **Colors**: Vibrant gradients (purple, cyan, orange, green)
- **Typography**: Bold, energetic headings with gradient effects
- **Animations**: Engaging transitions and hover effects (respecting `prefers-reduced-motion`)
- **Icons**: Filled icons with emojis for extra personality
- **Cards**: Rounded corners, multiple borders, shadow effects
- **Buttons**: Large, colorful, with gradient backgrounds

#### Key Features
- XP bars with animated progress
- Level-up badges with glow effects
- Mission-based navigation ("Current Mission", "Side Missions")
- Achievement celebrations with emojis
- Colorful progress indicators
- Gamified language ("🚀 Start Mission!", "⚡ Continue Adventure!")

#### Accessibility
- High contrast ratios maintained in all gradients
- Keyboard navigation with bold, colorful focus indicators
- Screen reader optimized ARIA labels
- Respects `prefers-reduced-motion` and manual "Reduce Motion" toggle
- Touch targets minimum 44x44px
- Full keyboard accessibility with visible focus states

### Admin Persona: The Professional Tool

**Objective**: Provide a clean, efficient, professional interface focused on data management and productivity.

#### Visual Identity
- **Colors**: Muted, professional blues and grays
- **Typography**: Clean, readable sans-serif with reduced letter-spacing
- **Animations**: Minimal, functional transitions only
- **Icons**: Regular weight icons, no emojis
- **Cards**: Clean borders, subtle shadows
- **Buttons**: Compact, professional styling

#### Key Features
- Data tables with clear headers and hover states
- Clean forms with clear validation
- Professional metric cards
- Efficient workflows ("Manage Courses", "View Reports")
- Chart-based analytics
- No gamification elements (no XP, badges, or game language)

#### Accessibility
- High contrast maintained throughout
- Keyboard-optimized forms with tab order
- Clear focus states for productivity
- Efficient navigation patterns
- Screen reader friendly tables and forms

## Implementation

### CSS Variables

All styling is controlled through CSS custom properties in `/src/styles/personas.css`:

#### Learner Variables
```css
--learner-primary: oklch(0.55 0.20 290);  /* Purple */
--learner-secondary: oklch(0.65 0.15 195);  /* Cyan */
--learner-accent: oklch(0.70 0.18 30);  /* Orange */
--learner-card-border: 2px;
--learner-radius: 0.75rem;
```

#### Admin Variables
```css
--admin-primary: oklch(0.40 0.10 240);  /* Muted Blue */
--admin-bg: oklch(0.98 0 0);  /* Clean white/light */
--admin-card-border: 1px;
--admin-radius: 0.5rem;
```

### CSS Utility Classes

#### Learner Classes
- `.learner-gradient-bg` - Colorful gradient background
- `.learner-card` - Game-style card with shadow and border
- `.learner-button` - Bold, rounded button
- `.learner-badge` - Glowing badge with rounded corners
- `.learner-progress-bar` - Animated gradient progress bar
- `.learner-heading` - Gradient text effect for headings
- `.learner-focus` - Bold, colorful focus indicator

#### Admin Classes
- `.admin-bg` - Clean, professional background
- `.admin-card` - Subtle card with minimal shadow
- `.admin-button` - Compact, professional button
- `.admin-table` - Clean data table styling
- `.admin-input` - Professional form input
- `.admin-heading` - Clean, professional heading
- `.admin-focus` - Clear, professional focus indicator

### Component Usage

#### Learner Components Example
```tsx
// PlayerIdentity.tsx
<Card className="learner-card p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
  <h2 className="text-3xl font-bold learner-heading">{userName}</h2>
  <div className="learner-progress-bar" />
  <Button className="learner-button learner-focus">Start Mission!</Button>
</Card>
```

#### Admin Components Example
```tsx
// AdminDashboard.tsx
<Card className="admin-card">
  <h2 className="text-2xl admin-heading">Admin Dashboard</h2>
  <table className="admin-table">
    {/* Table content */}
  </table>
  <Button className="admin-button admin-focus">Save Changes</Button>
</Card>
```

## Component Checklist

### Learner Components ✅
- [x] `App.tsx` - Learner header and navigation
- [x] `PlayerIdentity.tsx` - Animated avatar and XP display
- [x] `MainMission.tsx` - Featured course with game styling
- [x] `SideMissions.tsx` - Course list with badges
- [x] `ProgressGoals.tsx` - Achievement tracking
- [ ] `AchievementsDashboard.tsx` - Trophy showcase
- [ ] `CourseViewer.tsx` - Interactive lesson player

### Admin Components ✅
- [x] `App.tsx` - Admin header (professional)
- [x] `AdminDashboard.tsx` - Clean metrics and quick actions
- [ ] `CourseBuilder.tsx` - Course creation interface
- [ ] `UserManagement.tsx` - User tables and forms
- [ ] `ReportsView.tsx` - Analytics and charts
- [ ] `GamificationHub.tsx` - XP/Badge configuration (admin view only)

## Accessibility Compliance

### WCAG 2.1 Level AA Requirements

Both personas meet all WCAG AA requirements:

#### Perceivable
- ✅ **1.1.1 Non-text Content**: All icons have `aria-hidden="true"` or descriptive labels
- ✅ **1.3.1 Info and Relationships**: Semantic HTML (headings, lists, tables)
- ✅ **1.4.3 Contrast**: All text meets 4.5:1 ratio (7:1 for large text)
- ✅ **1.4.11 Non-text Contrast**: UI components meet 3:1 ratio

#### Operable
- ✅ **2.1.1 Keyboard**: All interactive elements keyboard accessible
- ✅ **2.1.2 No Keyboard Trap**: Users can navigate away from all components
- ✅ **2.4.7 Focus Visible**: Clear focus indicators (`.learner-focus`, `.admin-focus`)
- ✅ **2.5.5 Target Size**: All touch targets minimum 44x44px

#### Understandable
- ✅ **3.2.4 Consistent Identification**: Components behave consistently
- ✅ **3.3.2 Labels or Instructions**: All form inputs have labels

#### Robust
- ✅ **4.1.2 Name, Role, Value**: Proper ARIA labels and roles
- ✅ **4.1.3 Status Messages**: Live regions for dynamic content

### Reduced Motion Support

Both personas respect motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  .learner-card,
  .admin-card {
    transition: none !important;
  }
}

.reduce-motion * {
  animation: none !important;
  transition: none !important;
}
```

### High Contrast Mode

Both personas support high contrast:

```css
.high-contrast {
  --learner-primary: oklch(0.45 0.25 290);
  --admin-primary: oklch(0.35 0.15 240);
  /* Enhanced contrast ratios */
}
```

## Testing Guidelines

### Visual Testing
1. **Learner View**: Should feel playful, engaging, and motivating
2. **Admin View**: Should feel professional, clean, and efficient
3. **Verify no "leakage"**: Admin components should have NO game elements

### Accessibility Testing

#### Keyboard Navigation
```bash
# Test with Tab key only (no mouse)
- Can you navigate to all interactive elements?
- Are focus indicators clearly visible?
- Can you activate buttons with Enter/Space?
```

#### Screen Reader Testing
```bash
# Test with NVDA (Windows) or VoiceOver (Mac)
- Are all images described?
- Are progress bars announced correctly?
- Are status changes announced?
```

#### Color Contrast
```bash
# Use browser DevTools or WebAIM Contrast Checker
- All text: minimum 4.5:1 ratio
- Large text (18pt+): minimum 3:1 ratio
- UI components: minimum 3:1 ratio
```

## Maintenance

### Adding New Learner Features
1. Use `.learner-*` utility classes
2. Add emojis for personality (🎮, 🚀, ⚡, 🎯, 🏆)
3. Use animated gradients and progress bars
4. Apply bold, energetic language
5. Test with `prefers-reduced-motion`

### Adding New Admin Features
1. Use `.admin-*` utility classes
2. NO emojis or game language
3. Use clean tables and forms
4. Apply professional, concise language
5. Focus on data clarity

### Updating Shared Components
Some components may be used in both contexts. In these cases:
1. Accept a `variant` prop: `'learner' | 'admin'`
2. Apply conditional styling based on variant
3. Ensure accessibility in both modes

```tsx
interface ButtonProps {
  variant?: 'learner' | 'admin'
}

function CustomButton({ variant = 'learner', ...props }: ButtonProps) {
  const className = variant === 'learner' 
    ? 'learner-button learner-focus'
    : 'admin-button admin-focus'
  
  return <button className={className} {...props} />
}
```

## Resources

### Design Tokens
- See `/src/styles/personas.css` for all CSS variables
- See `/src/index.css` for base color definitions

### Reference Components
- **Learner**: `PlayerIdentity.tsx`, `MainMission.tsx`, `SideMissions.tsx`
- **Admin**: `AdminDashboard.tsx`, `AdminPanel.tsx`

### Accessibility
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

**Built with ♿ accessibility and 🎮 dual persona design in mind**
