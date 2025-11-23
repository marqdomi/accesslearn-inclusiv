# 🧹 Limpieza de Código Legacy

**Fecha:** $(date)  
**Estado:** ✅ En progreso

## 📋 Archivos Eliminados

### ✅ Archivos Legacy Eliminados (No se usan):

1. **`src/App-old.tsx`**
   - ✅ **Eliminado** - Versión antigua de App, no se importa en ningún lado
   - Solo usaba componentes legacy que también fueron eliminados

2. **`src/components/courses/CourseViewer.tsx`**
   - ✅ **Eliminado** - Versión legacy, solo usado en `App-old.tsx`
   - Reemplazado por `CourseViewerPage.tsx` que usa `ApiService`

3. **Backup files** (anteriormente eliminados):
   - `src/components/admin/CourseManagement.tsx.backup`
   - `src/pages/MentorDashboardPage.tsx.backup`

## 🔍 Archivos Legacy Pendientes (En uso activo):

### ⚠️ Servicios Legacy que AÚN se usan:

1. **`src/services/base-service.ts`**
   - **Estado:** ⚠️ **EN USO** - Usado por varios servicios legacy
   - **Problema:** Usa `window.spark?.kv`
   - **Usado por:**
     - `src/services/course-service.ts`
     - `src/services/user-progress-service.ts`
     - `src/services/team-service.ts`
     - `src/services/social-service.ts`
     - `src/services/gamification-service.ts`

2. **`src/services/course-service.ts`**
   - **Estado:** ⚠️ **EN USO** - Usado por varios hooks y componentes
   - **Usado por:**
     - `src/hooks/use-course-management.ts`
     - `src/hooks/use-courses.ts`
     - `src/services/migration-utils.ts`

3. **`src/services/user-progress-service.ts`**
   - **Estado:** ⚠️ **EN USO** - Usado por hooks
   - **Usado por:**
     - `src/hooks/use-user-progress-service.ts`
     - `src/components/courses/CourseDashboard.tsx`
     - `src/services/migration-utils.ts`

4. **`src/services/team-service.ts`** (incluye GroupService)
   - **Estado:** ⚠️ **EN USO** - Usado por hooks
   - **Usado por:**
     - `src/hooks/use-groups.ts`
     - `src/services/migration-utils.ts`

5. **`src/services/gamification-service.ts`** (incluye AchievementService)
   - **Estado:** ⚠️ **EN USO** - Exportado en `src/services/index.ts`

### ⚠️ Componentes Legacy que AÚN se usan:

1. **`src/components/admin/GroupSuggestions.tsx`**
   - **Estado:** ⚠️ **EN USO** - Usado en `GroupManagement.tsx`
   - **Problema:** Usa `window.spark.llm()` para IA
   - **Acción:** Migrar a backend API o deshabilitar

2. **`src/components/auth/LoginScreen.tsx`**
   - **Estado:** ❓ **VERIFICAR** - No parece usarse en `App.tsx`
   - `App.tsx` usa `TenantLoginPage` en su lugar

3. **`src/components/admin/ProfessionalCourseBuilder.tsx`**
   - **Estado:** ❓ **VERIFICAR** - Usa `useKV` de Spark
   - Verificar si se usa en algún lugar activo

### ⚠️ Hooks Legacy que AÚN se usan:

1. **`src/hooks/use-auth.ts`**
   - **Estado:** ❓ **VERIFICAR** - Usa `useKV` de Spark
   - Ya existe `AuthContext` que usa `ApiService`
   - Verificar si algún componente activo lo usa

## 📊 Resumen de Estado

| Categoría | Cantidad | Estado |
|-----------|----------|--------|
| Archivos eliminados | 2 | ✅ Completado |
| Servicios legacy en uso | 5 | ⚠️ Requieren migración |
| Componentes legacy en uso | 3 | ⚠️ Requieren verificación |
| Hooks legacy en uso | 1+ | ❓ Requieren verificación |

## 🎯 Plan de Acción

### **FASE 1: Verificación (Pendiente)**
1. ✅ Eliminar `App-old.tsx` - **COMPLETADO**
2. ✅ Eliminar `CourseViewer.tsx` legacy - **COMPLETADO**
3. ⏳ Verificar si `LoginScreen.tsx` se usa activamente
4. ⏳ Verificar si `ProfessionalCourseBuilder.tsx` se usa activamente
5. ⏳ Verificar si `use-auth.ts` se usa activamente

### **FASE 2: Migración de Servicios Legacy (Futuro)**
1. Migrar servicios legacy a usar `ApiService` en lugar de `BaseService`
2. Eliminar dependencia de `window.spark?.kv` en `base-service.ts`
3. Migrar componentes que usan servicios legacy a usar `ApiService` directamente

### **FASE 3: Migración de Componentes Legacy (Futuro)**
1. Migrar `GroupSuggestions.tsx` a usar backend API para IA
2. Eliminar componentes legacy que no se usan
3. Migrar hooks legacy a usar `ApiService`

## 📝 Notas

- Los servicios legacy todavía se usan en varios lugares, por lo que no se pueden eliminar todavía
- La migración completa de Spark a Cosmos DB requiere que todos los componentes usen `ApiService`
- Algunos componentes legacy pueden no estar en uso activo pero aún están importados
- Se recomienda una migración gradual para evitar romper funcionalidad existente

