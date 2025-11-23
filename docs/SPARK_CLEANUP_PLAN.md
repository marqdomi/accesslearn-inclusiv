# 🧹 Plan de Limpieza de Referencias a Spark

## 📊 Resumen

**Objetivo:** Eliminar todas las referencias problemáticas a `@github/spark` para evitar errores futuros.

### Estado Actual:
- ✅ `main.tsx` y `vite.config.ts` - Ya limpiados (sin referencias a Spark)
- ❌ `package.json` - Todavía tiene `@github/spark` como dependencia
- ❌ `package.json` - Todavía tiene `"name": "spark-template"`
- ❌ Muchos archivos legacy todavía tienen imports, pero NO están en uso activo
- ⚠️ `src/hooks/use-profile.ts` - Usa el hook legacy `use-auth.ts` que depende de Spark

## 🎯 Acciones Inmediatas (Críticas)

### 1. Actualizar `package.json`
- [ ] Cambiar `"name": "spark-template"` a `"name": "accesslearn-inclusiv"` (o el nombre correcto del proyecto)
- [ ] Remover `"@github/spark": "^0.39.0"` de dependencies
- [ ] Ejecutar `npm install` para limpiar `node_modules` y `package-lock.json`

### 2. Corregir `src/hooks/use-profile.ts`
- [ ] Cambiar `import { useAuth } from '@/hooks/use-auth'` a `import { useAuth } from '@/contexts/AuthContext'`
- [ ] Ajustar el código si es necesario (el `AuthContext` tiene una API diferente)

### 3. Eliminar archivos de backup
- [ ] Eliminar `src/components/admin/CourseManagement.tsx.backup`
- [ ] Eliminar `src/pages/MentorDashboardPage.tsx.backup`

## 🔍 Archivos Legacy (No críticos - Pueden eliminarse si no se usan)

Estos archivos tienen imports de Spark pero NO están siendo usados en `App.tsx`:

### Componentes Admin Legacy:
- `src/components/admin/CourseBuilder.tsx`
- `src/components/admin/EmployeeManagement.tsx`
- `src/components/admin/AdminDashboard.tsx` (⚠️ Nota: Puede estar siendo usado por `AdminPanel.tsx`)
- `src/components/admin/ProfessionalCourseBuilder.tsx`
- `src/components/admin/GamificationHub.tsx`
- `src/components/admin/CorporateReportingDashboard.tsx`
- `src/components/admin/BrandingManagement.tsx`
- `src/components/admin/UserManagement.tsx`
- `src/components/admin/TeamManagement.tsx`
- `src/components/admin/ReportsView.tsx`
- `src/components/admin/MentorshipManagement.tsx`
- `src/components/admin/ManualEmployeeEnrollment.tsx`
- `src/components/admin/GroupSuggestions.tsx`
- `src/components/admin/BulkEmployeeUpload.tsx`

### Componentes Legacy:
- `src/components/courses/CourseViewer.tsx` (⚠️ Verificar si es diferente de `CourseViewerPage.tsx`)
- `src/components/community/CourseForum.tsx`
- `src/components/auth/LoginScreen.tsx`
- `src/components/SampleDataInitializer.tsx`

### Hooks Legacy:
- `src/hooks/use-auth.ts` (⚠️ Problema: `use-profile.ts` lo usa, pero debería usar `AuthContext`)
- `src/hooks/use-auto-save.ts`
- `src/hooks/use-accessibility-preferences.ts`
- `src/hooks/use-mentor-xp.ts` (Usa `window.spark.kv`)

### Servicios Legacy:
- `src/services/base-service.ts` (Usa `window.spark?.kv`)
- `src/services/course.service.ts` (Usa `DB` de Spark)
- `src/services/user-progress.service.ts` (Usa `DB` de Spark)
- `src/services/group.service.ts` (Usa `DB` de Spark)
- `src/services/achievement.service.ts` (Usa `DB` de Spark)

### Utilidades Legacy:
- `src/lib/i18n.ts` (Usa `useKV` de Spark)
- `src/lib/user-data-migration.ts` (Documenta migración de Spark KV)

## ⚠️ Notas Importantes

1. **`src/hooks/use-profile.ts`** está usando el hook legacy. Necesita migrarse a usar `AuthContext`.

2. **Archivos de documentación** que mencionan Spark están bien - solo documentan la historia del proyecto.

3. **Iconos `Sparkles` y `Sparkle`** NO son problemáticos - son nombres de iconos de librerías de iconos.

4. **Verificar antes de eliminar**: Algunos archivos pueden estar siendo importados indirectamente. Verificar con `grep` antes de eliminar.

## ✅ Referencias NO Problemáticas

- Iconos: `Sparkles`, `Sparkle` (de `lucide-react` o `@phosphor-icons/react`)
- Documentación que menciona Spark históricamente
- Referencias en archivos `.md` de documentación

## 🚀 Próximos Pasos

1. **Fase 1 (Inmediata):** Actualizar `package.json` y corregir `use-profile.ts`
2. **Fase 2 (Verificación):** Verificar qué archivos legacy están realmente en uso
3. **Fase 3 (Limpieza):** Eliminar archivos legacy no usados o migrarlos
4. **Fase 4 (Validación):** Ejecutar build y verificar que no hay errores

