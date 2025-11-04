# i18n Implementation Guide

## Overview

This application now supports live, instant language switching between English (en) and Spanish (es) without requiring a page reload. The implementation uses **react-i18next**, a powerful internationalization framework for React applications.

## Quick Start

### For Users

1. Look for the language toggle button in the header (shows "ES" or "EN")
2. Click to switch languages instantly
3. Your preference is automatically saved

### For Developers

To add translations to a new component:

```tsx
import { useTranslation } from 'react-i18next'

export function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('mySection.title')}</h1>
      <p>{t('mySection.description')}</p>
    </div>
  )
}
```

Then add the translations to both files:
- `src/i18n/locales/es.json` (Spanish)
- `src/i18n/locales/en.json` (English)

```json
{
  "mySection": {
    "title": "Mi Título",
    "description": "Mi descripción"
  }
}
```

## Architecture

### Configuration
- **Location**: `src/i18n/config.ts`
- **Default language**: Spanish (es)
- **Fallback language**: Spanish (es)
- **Storage**: localStorage (key: `i18nextLng`)

### Translation Files
- `src/i18n/locales/es.json` - Spanish translations (default)
- `src/i18n/locales/en.json` - English translations

### Key Components
- `LanguageToggle.tsx` - The ES/EN toggle button
- All components using `useTranslation()` hook

## How It Works

1. **Initialization**: i18n is configured in `main.tsx` before the React app renders
2. **Detection**: Browser language is detected, but Spanish is always the fallback
3. **Component Integration**: Components use `useTranslation()` hook to access the `t()` function
4. **Live Switching**: When user clicks the language toggle:
   - `i18n.changeLanguage(newLang)` is called
   - i18next updates its internal state
   - React detects the state change
   - All components re-render with new translations
   - No page reload occurs
5. **Persistence**: New language preference is automatically saved to localStorage

## Translation Guidelines

### Namespace Organization

The translation files are organized into logical sections:

- `common` - Shared UI elements (buttons, labels, etc.)
- `app` - Application-level text (titles, navigation)
- `nav` - Navigation items
- `auth` - Authentication screens
- `dashboard` - User dashboard
- `admin` - Admin panel
- `course` - Course-related text
- `achievements` - Achievement system
- `accessibility` - Accessibility features
- `gamification` - Gamification elements
- `errors` - Error messages
- `time` - Time-related text

### Best Practices

1. **Use semantic keys**: `auth.welcomeBack` instead of `auth.text1`
2. **Keep translations parallel**: Ensure both en.json and es.json have the same keys
3. **Use placeholders for dynamic content**:
   ```tsx
   t('course.modulesCount', { count: 5 })
   // Translation: "5 modules"
   ```
4. **Avoid hardcoded text**: All user-facing text should use `t()`
5. **Test both languages**: Always verify translations in both ES and EN

## Adding Translations to Existing Components

### Step 1: Import useTranslation
```tsx
import { useTranslation } from 'react-i18next'
```

### Step 2: Use the hook
```tsx
export function MyComponent() {
  const { t } = useTranslation()
  // ...
}
```

### Step 3: Replace hardcoded text
Before:
```tsx
<h1>Welcome</h1>
```

After:
```tsx
<h1>{t('welcome.title')}</h1>
```

### Step 4: Add to translation files
In `es.json` and `en.json`:
```json
{
  "welcome": {
    "title": "Bienvenido" // in es.json
    "title": "Welcome"    // in en.json
  }
}
```

## Components Already Translated

### Core App
- ✅ App.tsx (header, navigation)
- ✅ LanguageToggle.tsx

### Authentication
- ✅ LoginScreen.tsx

### Dashboard
- ✅ MainMission.tsx
- ✅ SideMissions.tsx

### Admin
- ✅ AdminDashboard.tsx

### Accessibility
- ✅ SkipLink.tsx

## Components Pending Translation

The following components still contain hardcoded text and should be translated in future iterations:

### High Priority (User-Facing)
- [ ] PasswordChangeScreen.tsx
- [ ] OnboardingScreen.tsx
- [ ] PlayerIdentity.tsx
- [ ] ProgressGoals.tsx
- [ ] QuickAccessibilitySettings.tsx
- [ ] CourseViewer.tsx
- [ ] AchievementsDashboard.tsx
- [ ] AccessibilityPanel.tsx

### Medium Priority (Admin)
- [ ] AdminPanel.tsx
- [ ] CourseManagement.tsx
- [ ] UserManagement.tsx
- [ ] ReportsView.tsx
- [ ] GamificationHub.tsx
- [ ] CourseBuilder.tsx
- [ ] QuizBuilder.tsx
- [ ] LessonEditor.tsx

### Lower Priority (Supporting Components)
- [ ] Various UI components in `src/components/ui/`
- [ ] Course and lesson detail components
- [ ] Analytics and reporting components

## Testing

### Manual Testing Checklist

1. **Default Language**
   - [ ] Fresh browser (clear localStorage) shows Spanish
   - [ ] Login screen in Spanish
   - [ ] All visible text in Spanish

2. **Language Toggle**
   - [ ] Toggle button visible in header
   - [ ] Shows current language (ES or EN)
   - [ ] Clicking switches language instantly
   - [ ] No page reload occurs
   - [ ] All visible text updates immediately

3. **Persistence**
   - [ ] Change language to English
   - [ ] Refresh page (F5)
   - [ ] Page loads in English
   - [ ] Close browser, reopen
   - [ ] Language still English

4. **Coverage**
   - [ ] Navigate through all major sections
   - [ ] Verify translations in both languages
   - [ ] Check for any remaining hardcoded text

### Automated Testing

To add i18n tests:

```tsx
import { render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'

describe('MyComponent', () => {
  it('renders in Spanish', () => {
    i18n.changeLanguage('es')
    render(
      <I18nextProvider i18n={i18n}>
        <MyComponent />
      </I18nextProvider>
    )
    expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Issue: Translations not showing
**Solution**: Verify the translation key exists in both es.json and en.json

### Issue: Language doesn't persist
**Solution**: Check browser localStorage for `i18nextLng` key

### Issue: Some text not translating
**Solution**: Component might not be using `useTranslation()` hook yet

### Issue: Page reloads when switching language
**Solution**: This shouldn't happen. Verify `LanguageToggle` is using `i18n.changeLanguage()` correctly

## Future Enhancements

1. **Add more languages**: Extend to support French, Portuguese, etc.
2. **Pluralization**: Handle singular/plural forms correctly
3. **Date/time formatting**: Localize dates and times
4. **Number formatting**: Localize numbers and currencies
5. **RTL support**: Add support for right-to-left languages
6. **Translation management**: Consider using a translation management service
7. **Dynamic content**: Translate course content from database

## Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Best Practices](https://react.i18next.com/guides/best-practices)
- [WCAG Language of Parts](https://www.w3.org/WAI/WCAG21/Understanding/language-of-parts.html)

## Support

For questions or issues related to i18n:
1. Check this guide
2. Review existing translated components as examples
3. Consult the official documentation
4. Open an issue in the repository
