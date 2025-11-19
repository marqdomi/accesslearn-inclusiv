# Internationalization (i18n) Implementation Guide

## Overview

The GameLearn platform now supports full internationalization with **Spanish (es)** as the default language and **English (en)** as the secondary language.

## Key Features

### 1. **Default Language: Spanish**
- All first-time visitors see the platform in Spanish
- Spanish is set as the default in the i18n configuration
- The platform automatically loads Spanish translations on initial load

### 2. **Language Persistence**
- User language preferences are saved using `useKV` hook
- Preferences persist across:
  - Page refreshes
  - Browser restarts
  - Login/logout cycles
- Stored in key: `user-language`

### 3. **Language Switcher Locations**
The language switcher is available in multiple locations for maximum accessibility:

#### a. **Login Page** (Top Right Corner)
- Visible before authentication
- Allows users to set their preferred language before logging in
- Persists selection for when they return

#### b. **Main Navigation Header** (All Authenticated Views)
- Accessible from Dashboard, Achievements, Community, and Admin views
- Located in the navigation bar with other primary actions
- Displays current language code (ES/EN)

#### c. **Accessibility Settings Panel** (Gear Icon ⚙️)
- Floating button bottom-right of screen
- Full language name display (Español / English)
- Integrated with other accessibility preferences

### 4. **Translation Coverage**

All user-facing text is translated, including:

#### Static UI Elements:
- Navigation labels (Dashboard, Community, Achievements, Admin, Sign Out)
- Button text (Sign In, Save, Cancel, Delete, etc.)
- Headers and titles
- Form labels and placeholders
- Accessibility settings

#### Dynamic Content:
- Course titles and descriptions
- Module names
- Achievement names and descriptions
- Activity feed messages
- System notifications

#### System Messages:
- Error messages (login errors, validation errors)
- Success notifications
- Warning messages
- Info messages

#### Accessibility Text:
- ARIA labels
- Screen reader announcements
- Alt text for images
- Skip links

### 5. **Translation Files**

Located in `/src/locales/`:
- `es.json` - Spanish translations (default)
- `en.json` - English translations

### 6. **Usage in Components**

```typescript
import { useTranslation } from '@/lib/i18n'

function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('app.subtitle')}</p>
    </div>
  )
}
```

### 7. **Language Switcher Component**

```typescript
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

// Basic usage (compact, shows language code)
<LanguageSwitcher />

// With full language name
<LanguageSwitcher variant="outline" showLabel />
```

## Testing Guide

### Acceptance Criteria Tests

#### Test 1: Default Language
1. Open the application in a new browser (incognito/private mode)
2. Clear all application data
3. Navigate to the login page
4. **Expected**: All text should appear in Spanish

#### Test 2: Language Switch on Login Page
1. On the login page, click the language switcher (top-right)
2. Select "English"
3. **Expected**: All text changes to English immediately
4. Enter invalid credentials
5. **Expected**: Error message appears in English
6. Switch back to "Español"
7. **Expected**: Error message updates to Spanish

#### Test 3: Persistence Test
1. On the login page, switch to English
2. Log in with valid credentials: `sarah.johnson@gamelearn.test` / `Welcome123!`
3. Change password and complete onboarding
4. Navigate to dashboard
5. Click the language switcher in the navigation
6. Verify language is still English
7. Click "Sign Out"
8. **Expected**: Login page loads in English (preference persisted)
9. Refresh the page
10. **Expected**: Still in English
11. Close browser and reopen
12. **Expected**: Still in English

#### Test 4: Full Coverage Test
Visit each page and verify 100% translation:

**Login Page:**
- Title, subtitle, form labels, buttons, test credentials box, error messages

**Password Change:**
- Title, subtitle, form fields, requirements list, strength indicator, error messages

**Onboarding:**
- Welcome message, step titles, form labels, avatar selection, accessibility preferences

**Dashboard:**
- Navigation items, player identity section, main mission card, side missions, progress goals, empty states

**Course Viewer:**
- Course intro, description, modules list, progress indicators, buttons (Start Learning, Mark Complete)

**Achievements:**
- Page title, achievement cards, locked/unlocked states, tier labels (Bronze, Silver, Gold, Platinum)

**Community:**
- Activity feed, team challenges, Q&A section, reaction buttons

**Admin Panel:**
- Section titles, form labels, table headers, action buttons

**Accessibility Panel:**
- Settings title, all preference labels, language switcher with full names

### Switching Between Languages

1. Click any language switcher (login page, navigation, or accessibility panel)
2. Select desired language from dropdown
3. All text updates immediately (no page refresh required)
4. Preference is saved automatically

## Technical Implementation

### Architecture

```
src/
├── lib/
│   └── i18n.ts                 # Translation hooks and utilities
├── locales/
│   ├── es.json                 # Spanish translations (default)
│   └── en.json                 # English translations
└── components/
    └── LanguageSwitcher.tsx    # Language selection component
```

### Core Functions

**`useLanguage()`** - Returns current language and setter
```typescript
const { language, setLanguage, isSpanish, isEnglish } = useLanguage()
```

**`useTranslation()`** - Returns translation function
```typescript
const { t, language } = useTranslation()
const text = t('key.path', 'Optional fallback')
```

### Data Storage

- Storage: `spark.kv` (persistent key-value store)
- Key: `user-language`
- Default: `'es'` (Spanish)
- Values: `'es' | 'en'`

## Adding New Translations

1. Add the key to both `es.json` and `en.json`
2. Use the `t()` function in your component
3. Provide a fallback if the key might not exist

Example:
```typescript
// In es.json
{
  "feature.newButton": "Nuevo Botón"
}

// In en.json
{
  "feature.newButton": "New Button"
}

// In component
<Button>{t('feature.newButton')}</Button>
```

## Exclusions

The following elements remain in English (internal/debug use only):
- Debug information panel on login screen
- Developer console logs
- Technical error stack traces
- Code comments

## Accessibility Compliance

✅ Language switcher is keyboard accessible
✅ Language switcher has proper ARIA labels
✅ Language changes are announced to screen readers
✅ 44px minimum touch targets maintained
✅ High contrast mode compatible
✅ Works with all accessibility preferences

## Future Language Support

To add a new language:

1. Create `/src/locales/[lang-code].json`
2. Add language to `SUPPORTED_LANGUAGES` in `/src/lib/i18n.ts`
3. Update `Language` type to include new code
4. Translate all keys from `es.json` or `en.json`

Example:
```typescript
// In i18n.ts
export type Language = 'es' | 'en' | 'fr'  // Add 'fr' for French

export const SUPPORTED_LANGUAGES = {
  es: 'Español',
  en: 'English',
  fr: 'Français'  // Add French
} as const
```
