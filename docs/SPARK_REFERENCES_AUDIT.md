# 🔍 Auditoría de Referencias a Spark

**Fecha:** $(date)
**Objetivo:** Identificar y eliminar todas las referencias problemáticas a `@github/spark` para evitar errores futuros.

## 📊 Resumen

### Referencias encontradas:
- **Total de archivos con imports de `@github/spark`:** 27
- **Archivos de backup:** 2 (no problemáticos)
- **Dependencia en package.json:** ✅ Encontrada
- **Referencias a `window.spark`:** 4 archivos

## 📁 Archivos con Referencias Problemáticas

### 🔴 Críticos (En uso activo):
1. **`package.json`**
   - Tiene `@github/spark` como dependencia
   - Tiene `"name": "spark-template"`

2. **`src/hooks/use-auth.ts`**
   - Usa `useKV` de `@github/spark/hooks`
   - ⚠️ **CRÍTICO:** Este hook puede estar siendo usado

3. **`src/lib/i18n.ts`**
   - Usa `useKV` de `@github/spark/hooks`
   - ⚠️ **CRÍTICO:** Sistema de traducciones

4. **`src/hooks/use-auto-save.ts`**
   - Usa `useKV` de `@github/spark/hooks`
   - Sistema de autoguardado

### 🟡 Legacy/No críticos (Verificar uso):
- `src/components/admin/CourseBuilder.tsx`
- `src/components/admin/EmployeeManagement.tsx`
- `src/components/admin/AdminDashboard.tsx`
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
- `src/components/courses/CourseViewer.tsx`
- `src/components/community/CourseForum.tsx`
- `src/components/auth/LoginScreen.tsx`
- `src/components/SampleDataInitializer.tsx`
- `src/hooks/use-accessibility-preferences.ts`

### 🔵 Servicios (Verificar si se usan):
- `src/services/base-service.ts` - Usa `window.spark?.kv`
- `src/services/course.service.ts` - Usa `DB` de `@github/spark/db`
- `src/services/user-progress.service.ts` - Usa `DB` de `@github/spark/db`
- `src/services/group.service.ts` - Usa `DB` de `@github/spark/db`
- `src/services/achievement.service.ts` - Usa `DB` de `@github/spark/db`

### 🟢 Hooks Específicos:
- `src/hooks/use-mentor-xp.ts` - Usa `window.spark.kv`

### 📄 Archivos de Backup (No problemáticos):
- `src/components/admin/CourseManagement.tsx.backup`
- `src/pages/MentorDashboardPage.tsx.backup`

## ✅ Referencias NO Problemáticas (OK)

### Iconos y Nombres:
- `Sparkles`, `Sparkle` - Son nombres de iconos de `lucide-react` o `@phosphor-icons/react`, NO relacionados con Spark
- Referencias en documentación (README, docs) - Solo documentación histórica

## 🎯 Plan de Acción

### Fase 1: Verificación
1. Verificar qué archivos están realmente en uso en `App.tsx` y rutas principales
2. Verificar si los hooks legacy se están usando

### Fase 2: Limpieza
1. Remover `@github/spark` de `package.json`
2. Cambiar `"name": "spark-template"` en `package.json`
3. Eliminar imports no usados de archivos legacy
4. Eliminar archivos de backup si no son necesarios

### Fase 3: Migración
1. Los hooks que todavía usan `useKV` deben migrarse a usar APIs backend
2. Los servicios que usan `DB` de Spark deben migrarse a Cosmos DB

## 🔍 Notas

- Algunos archivos pueden tener imports de Spark pero no estar siendo usados activamente
- La migración a Cosmos DB ya está completa para la mayoría de funcionalidades críticas
- Los archivos de servicios (`*service.ts`) pueden ser legacy y no estar en uso

