# 🔍 Análisis de Problemas Potenciales para Migración

**Fecha:** $(date)  
**Objetivo:** Identificar problemas que necesitan migración o corrección

## 🚨 Problemas Críticos (Causarán Errores)

### 1. ✅ Referencias directas a `window.spark` (2 archivos restantes)

#### a) `src/hooks/use-mentor-xp.ts` - ✅ **MIGRADO**
- **Estado:** ✅ **COMPLETADO** - Migrado a usar `ApiService.awardXP()` y `ApiService.getMentorshipReport()`
- **Cambios:** 
  - Eliminado `window.spark.kv.get` y `window.spark.kv.set`
  - Ahora usa `ApiService.awardXP()` para otorgar XP al mentor
  - Usa `ApiService.getMentorshipReport()` para encontrar el pairing activo
  - Agregados imports necesarios: `ApiService`, `useAuth`, `useTenant`, `toast`, `useTranslation`
- **Fecha:** $(date)

#### b) `src/services/base-service.ts`
- **Problema:** Base service layer usa `window.spark?.kv` como acceso principal
- **Línea:** 12
- **Impacto:** ⚠️ **MODERADO** - Solo afecta servicios legacy que ya no se usan
- **Acción:** Verificar si se usa, si no, puede eliminarse o comentarse

#### c) `src/components/admin/GroupSuggestions.tsx`
- **Problema:** Usa `window.spark.llm()` para generar sugerencias de grupos con IA
- **Línea:** 106
- **Impacto:** ⚠️ **BAJO** - Feature avanzada, no crítica
- **Acción:** Migrar a backend API o deshabilitar si no está en uso

---

## 🟡 Problemas Moderados (No críticos pero deberían migrarse)

### 2. `src/lib/i18n.ts` - Usa `useKV` de Spark
- **Problema:** Usa `useKV` para guardar preferencia de idioma
- **Estado:** ✅ **LEGÍTIMO** - Preferencia de UI puede estar en localStorage
- **Acción:** Opcional - Migrar a localStorage nativo si queremos remover Spark completamente
- **Nota:** El sistema de i18n funciona, solo usa Spark como storage

### 3. `src/hooks/use-auto-save.ts` - Usa `useKV` de Spark
- **Problema:** Usa `useKV` para autoguardado temporal
- **Estado:** ✅ **LEGÍTIMO** - Cache temporal puede estar en localStorage
- **Acción:** Opcional - El nuevo `useAutoSave.ts` en `modern-builder` ya usa localStorage nativo
- **Nota:** Este hook legacy puede no estar en uso si ya se migró al nuevo sistema

### 4. Servicios Legacy con `DB` de Spark (4 archivos)
- `src/services/user-progress.service.ts`
- `src/services/group.service.ts`
- `src/services/course.service.ts`
- `src/services/achievement.service.ts`
- **Estado:** ❓ **VERIFICAR** - Probablemente no se usan, ya migrados a `ApiService`
- **Acción:** Verificar uso y eliminar si no se usan

---

## 📦 Archivos Legacy que Deberían Eliminarse

### 5. `src/App-old.tsx`
- **Estado:** ❌ **LEGACY** - Versión antigua de App
- **Acción:** Eliminar si `App.tsx` actual funciona correctamente
- **Nota:** Verificar que no se importe en ningún lado

### 6. `src/components/courses/CourseViewer.tsx` (versión legacy)
- **Estado:** ❓ **VERIFICAR** - Hay `CourseViewerPage.tsx` nuevo que parece ser el activo
- **Acción:** Verificar cuál se usa y eliminar el legacy
- **Nota:** `App.tsx` usa `CourseViewerPage`, no `CourseViewer`

---

## ✅ Referencias Legítimas (No problemáticas)

### 7. `localStorage` en `AuthContext.tsx`
- **Uso:** Guarda `auth-token` y `current-user`
- **Estado:** ✅ **LEGÍTIMO** - Tokens JWT deben estar en localStorage
- **Acción:** Nada - Esto es correcto

### 8. `localStorage` en `useAutoSave.ts` (modern-builder)
- **Uso:** Cache temporal de borradores
- **Estado:** ✅ **LEGÍTIMO** - Cache temporal puede estar en localStorage
- **Acción:** Nada - Esto es correcto

---

## 🎯 Prioridad de Acción

### **ALTA PRIORIDAD** (Causarán errores):
1. ✅ Migrar `use-mentor-xp.ts` a usar `ApiService` para XP
2. ⚠️ Verificar y migrar `window.spark.llm` en `GroupSuggestions.tsx` o deshabilitar

### **MEDIA PRIORIDAD** (Mejoran la limpieza del código):
3. Verificar y eliminar servicios legacy (`*service.ts` con Spark DB)
4. Eliminar `App-old.tsx` si no se usa
5. Verificar y eliminar `CourseViewer.tsx` legacy si no se usa

### **BAJA PRIORIDAD** (Opcionales):
6. Migrar `i18n.ts` de `useKV` a `localStorage` nativo
7. Migrar `use-auto-save.ts` legacy a `localStorage` nativo (si aún se usa)

---

## 📊 Resumen

| Categoría | Cantidad | Estado |
|-----------|----------|--------|
| Referencias a `window.spark` | 3 | ⚠️ Requieren atención |
| Imports de `@github/spark` | 26 | 🟡 Mayormente legacy |
| Servicios legacy | 4 | ❓ Verificar uso |
| Archivos legacy | 2 | 🗑️ Eliminar |
| Referencias legítimas | Múltiples | ✅ OK |

