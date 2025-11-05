# Data Architecture Migration Guide

## Overview

This guide documents the migration from direct KV storage access to a structured service layer architecture.

## Problem Statement

The application was experiencing critical data integrity bugs due to:
- Direct `useKV` calls scattered throughout the codebase
- No referential integrity validation
- Ghost user references (deleted users still referenced in teams/groups)
- Inconsistent data structures across different KV keys
- "Edit" buttons not working correctly
- "Unknown User" errors in dashboards

## Solution

Implement a real SQL persistence layer backed by SQLite and exposed through an Express API:
- Centralized data access through HTTP services
- Durable storage in `data/app.db`
- Consistent CRUD operations enforced by the backend
- Type-safe data management in the client service layer
- Data migration utilities for importing legacy KV snapshots

## Architecture

### Backend API (`server/`)

1. **index.js**: Express server exposing REST endpoints at `/api/:table`
2. **SQLite datastore**: `data_store` table persists JSON payloads by table + id
3. **.env config**: `.env.example` documents `API_PORT`, `SQLITE_DATA_DIR`, etc.
4. **Admin bootstrap**: Rutas `/api/admin/setup-status` y `/api/admin/initialize` crean el primer usuario administrador de forma segura.
5. **Login seguro**: Endpoint `/api/auth/login` valida contraseñas con hashing `scrypt`.
6. **Migrate script**: `scripts/migrate-kv-to-sql.js` importa instantáneas históricas de KV.

### Service Layer (`src/services/`)

1. **base-service.ts**: Core CRUD operations executed through the API
2. **course-service.ts**: Course management with publishing
3. **user-progress-service.ts**: Progress tracking
4. **team-service.ts**: Teams and groups management
5. **user-service.ts**: User profiles, stats, and XP tracking
6. **social-service.ts**: Mentorships, forums, activities, notifications
7. **gamification-service.ts**: Achievements, certificates, quizzes, reviews
8. **auth-service.ts**: Setup inicial, login seguro y futuras operaciones de autenticación.
9. **migration-utils.ts**: Data cleanup and validation utilities

### Modern Hooks (`src/hooks/`)

New hooks that wrap the service layer:
- `use-course-management.ts`: Course CRUD operations
- `use-user-progress-service.ts`: User progress and stats
- More hooks to be created...

## Migration Strategy

### Phase 1: Provision SQL Backend ✅ COMPLETED

- [x] Add Express server with SQLite persistence (`server/index.js`)
- [x] Store entity payloads in `data_store` with ACID guarantees
- [x] Provide migration script for legacy KV exports (`scripts/migrate-kv-to-sql.js`)
- [x] Document environment variables and runtime scripts

### Phase 2: Create Modern Hooks 🔄 IN PROGRESS

- [x] `use-course-management`: Course operations
- [x] `use-user-progress-service`: Progress and stats
- [ ] `use-team-management`: Teams and groups
- [ ] `use-social-features`: Forums, activities, notifications
- [ ] `use-gamification`: Achievements, certificates
- [ ] `use-mentorship`: Mentor-mentee pairings

### Phase 3: Migrate Components

Priority order based on bug severity:

1. **HIGH PRIORITY** - Fixing "Edit" bugs:
   - `CourseBuilder.tsx`: Use `useCourseManagement` instead of `useKV('admin-courses')`
   - `CourseManagement.tsx`: Update to use new hook
   - `GroupManagement.tsx`: Use team service to fix "Unknown User"

2. **MEDIUM PRIORITY** - Dashboard fixes:
   - `UserDashboard.tsx`: Use `useUserProgress` for progress data
   - `AdminDashboard.tsx`: Use services for stats
   - `MentorDashboard.tsx`: Use mentorship service

3. **LOW PRIORITY** - Other components:
   - Social features (forums, activity feed)
   - Gamification features (achievements, certificates)

### Phase 4: Data Cleanup

Run migration utilities to fix existing data:
```typescript
import { runFullDataCleanup, validateDataIntegrity } from '@/services/migration-utils'

// Validate data first
const validation = await validateDataIntegrity()
console.log(validation)

// Run cleanup if needed
if (!validation.isValid) {
  const report = await runFullDataCleanup()
  console.log(report)
}
```

## Migration Examples

### Example 1: Migrating CourseBuilder Component

**BEFORE** (using direct KV):
```typescript
const [courses, setCourses] = useKV<CourseStructure[]>('admin-courses', [])

const handleSaveDraft = () => {
  const updatedCourse = { ...course, updatedAt: Date.now() }
  
  if (courseId) {
    setCourses((current) => 
      (current || []).map(c => c.id === courseId ? updatedCourse : c)
    )
  } else {
    setCourses((current) => [...(current || []), updatedCourse])
  }
}
```

**AFTER** (using service):
```typescript
const { updateCourse, createCourse } = useCourseManagement()

const handleSaveDraft = async () => {
  try {
    if (courseId) {
      await updateCourse(courseId, course)
    } else {
      await createCourse(course)
    }
    toast.success('Course draft saved')
  } catch (error) {
    toast.error('Failed to save course')
  }
}
```

### Example 2: Migrating User Progress

**BEFORE**:
```typescript
const [progress, setProgress] = useKV<UserProgress>(
  `course-progress-${courseId}-${userId}`,
  defaultProgress
)
```

**AFTER**:
```typescript
const { getUserCourseProgress, updateProgress } = useUserProgress(userId)

const progress = getUserCourseProgress(courseId)
```

### Example 3: Fixing "Unknown User" in Groups

**BEFORE**:
```typescript
const getUserName = (userId: string) => {
  const employee = employees?.find(e => e.id === userId)
  return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown User'
}
```

**AFTER** (with data cleanup):
```typescript
import { cleanGroupReferences } from '@/services/migration-utils'

// Run cleanup on mount
useEffect(() => {
  cleanGroupReferences().then(result => {
    console.log(`Cleaned ${result.ghostUsersRemoved} ghost users`)
  })
}, [])

// Now all user references are guaranteed to be valid
const getUserName = (userId: string) => {
  const employee = employees?.find(e => e.id === userId)
  return employee ? `${employee.firstName} ${employee.lastName}` : null
}
```

## Key Migration Patterns

### Pattern 1: Replace useKV with Service Hook

```typescript
// OLD
const [data, setData] = useKV<Type>('key', defaultValue)

// NEW
const { data, updateData, createData } = useServiceHook()
```

### Pattern 2: Async Operations

```typescript
// OLD (synchronous)
setData(newValue)

// NEW (asynchronous)
await updateData(newValue)
```

### Pattern 3: Error Handling

```typescript
// OLD (no error handling)
setCourses([...courses, newCourse])

// NEW (with error handling)
try {
  await createCourse(newCourse)
  toast.success('Course created')
} catch (error) {
  toast.error('Failed to create course')
  console.error(error)
}
```

### Pattern 4: Data Validation

```typescript
// NEW - services automatically validate references
try {
  await GroupService.addUser(groupId, userId)
} catch (error) {
  // Will throw if user doesn't exist
  console.error('Invalid user reference')
}
```

## Data Cleanup Utilities

### Available Utilities

1. **cleanTeamReferences()**: Remove invalid user IDs from teams
2. **cleanGroupReferences()**: Remove invalid user and course IDs from groups
3. **cleanMentorshipReferences()**: Remove invalid mentorship pairings
4. **cleanProgressReferences()**: Remove invalid progress records
5. **runFullDataCleanup()**: Run all cleanup operations with reporting
6. **validateDataIntegrity()**: Check for issues without modifying data

### When to Run Cleanup

- After deploying the new service layer
- When "Unknown User" errors appear
- When dashboards show incorrect data
- As part of regular maintenance

### Example Cleanup Script

```typescript
// src/utils/data-cleanup-admin.ts
import { runFullDataCleanup } from '@/services/migration-utils'

export async function adminDataCleanup() {
  console.log('Starting data cleanup...')
  
  try {
    const report = await runFullDataCleanup()
    
    console.log('Cleanup Report:')
    console.log(`- Total issues found: ${report.totalIssuesFound}`)
    console.log(`- Issues fixed: ${report.issuesFixed}`)
    console.log(`- Errors: ${report.errors.length}`)
    console.log('Details:', report.details)
    
    return report
  } catch (error) {
    console.error('Cleanup failed:', error)
    throw error
  }
}
```

## Testing Checklist

After migration, verify:

- [ ] Course edit button loads correct course data
- [ ] Course changes persist after save
- [ ] No "Unknown User" errors in groups/teams
- [ ] Dashboard counters show accurate data
- [ ] User progress persists across sessions
- [ ] All CRUD operations work correctly
- [ ] Data validation prevents invalid references
- [ ] Error messages are user-friendly

## Benefits

✅ **Data Integrity**: Automatic validation of all references
✅ **Consistency**: Single source of truth for all data
✅ **Maintainability**: Centralized data access logic
✅ **Type Safety**: Full TypeScript support
✅ **Error Handling**: Proper error propagation
✅ **Testing**: Services can be easily mocked
✅ **Performance**: Optimized query patterns
✅ **Debugging**: Clear data flow and logging

## Next Steps

1. Continue creating modern hooks for remaining entities
2. Migrate high-priority components (CourseBuilder, GroupManagement)
3. Run data cleanup utilities
4. Test all functionality thoroughly
5. Update documentation as needed

## Need Help?

- Check existing service implementations in `src/services/`
- Review modern hook examples in `src/hooks/use-course-management.ts`
- Run `validateDataIntegrity()` to identify issues
- See migration examples in this guide
