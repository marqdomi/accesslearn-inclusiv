# 🧪 Testing Guide - CourseManagement Phase 1

## 🚀 Cómo Probar las Nuevas Funcionalidades

### ⚙️ Prerequisitos
```bash
# 1. Asegúrate de que el servidor esté corriendo
npm run server

# 2. En otra terminal, corre la aplicación
npm run dev

# 3. Abre el navegador en http://localhost:5173
```

---

## 📋 Test Checklist

### 1️⃣ NAVEGACIÓN BÁSICA

#### Test 1.1: Acceder a Course Management
```
✅ PASOS:
1. Login como admin
2. Ir a Admin Dashboard
3. Click en tarjeta "Total Courses"
4. → Debe abrir CourseManagement

✅ ESPERADO:
• Vista con header "Course Management"
• Botón "+ Create New Course" visible
• 4 tarjetas de estadísticas
• Barra de filtros
• Lista de cursos (grid o tabla)
```

#### Test 1.2: Volver al Dashboard
```
✅ PASOS:
1. En CourseManagement
2. Click botón "←" (back)
3. → Debe volver a AdminDashboard

✅ ESPERADO:
• Vuelve al dashboard
• Sin errores en consola
```

---

### 2️⃣ ESTADÍSTICAS

#### Test 2.1: Verificar Stats Cards
```
✅ PASOS:
1. Observa las 4 tarjetas superiores

✅ ESPERADO:
• Total Courses: Número correcto
• Published: Contador de publicados
• Drafts: Contador de borradores
• Archived: Contador de archivados
• Suma de Published + Drafts + Archived = Total
```

#### Test 2.2: Stats se Actualizan
```
✅ PASOS:
1. Nota el número en "Drafts"
2. Publica un curso draft
3. → Stats deben actualizarse

✅ ESPERADO:
• Drafts disminuye en 1
• Published aumenta en 1
• Total se mantiene igual
```

---

### 3️⃣ FILTROS

#### Test 3.1: Búsqueda por Texto
```
✅ PASOS:
1. En barra de búsqueda, escribe "JavaScript"
2. → Lista se filtra en tiempo real

✅ ESPERADO:
• Solo cursos con "JavaScript" en título/descripción
• Contador actualizado: "X courses (Y total)"
• Si no hay resultados: Empty state
```

#### Test 3.2: Filtro por Estado
```
✅ PASOS:
1. Dropdown "Status" → Selecciona "Draft"
2. → Solo cursos draft visibles

✅ ESPERADO:
• Todos los cursos mostrados tienen badge "Draft"
• Cambiar a "Published" → Solo publicados
• "All Status" → Todos visibles
```

#### Test 3.3: Filtro por Categoría
```
✅ PASOS:
1. Dropdown "Category" → Selecciona una categoría
2. → Solo cursos de esa categoría

✅ ESPERADO:
• Dropdown muestra categorías reales del sistema
• Filtro funciona correctamente
• "All Categories" muestra todos
```

#### Test 3.4: Filtro por Dificultad
```
✅ PASOS:
1. Dropdown "Difficulty" → Selecciona "Beginner"
2. → Solo cursos beginner visibles

✅ ESPERADO:
• Filtro funciona
• Badge de difficulty visible en cursos
• "All Levels" muestra todos
```

#### Test 3.5: Combinación de Filtros
```
✅ PASOS:
1. Status: "Draft"
2. Category: "Programming"
3. Difficulty: "Beginner"
4. Búsqueda: "Python"

✅ ESPERADO:
• Solo cursos que cumplan TODOS los criterios
• Contador correcto
• Empty state si no hay coincidencias
```

---

### 4️⃣ VISTAS (GRID / TABLE)

#### Test 4.1: Toggle Grid/Table
```
✅ PASOS:
1. Click icono [⊞] (grid)
2. → Vista de tarjetas 3 columnas
3. Click icono [☰] (table)
4. → Vista de tabla

✅ ESPERADO:
• Grid: Tarjetas responsive
• Table: Tabla ordenable
• Toggle mantiene selección de cursos
• Toggle mantiene filtros activos
```

#### Test 4.2: Responsive Grid
```
✅ PASOS:
1. En vista Grid
2. Redimensiona ventana:
   - Desktop (>1024px) → 3 columnas
   - Tablet (768-1024px) → 2 columnas
   - Mobile (<768px) → 1 columna

✅ ESPERADO:
• Layout se adapta correctamente
• Sin scroll horizontal
• Tarjetas mantienen diseño
```

---

### 5️⃣ ORDENAMIENTO

#### Test 5.1: Ordenar por Título
```
✅ PASOS:
1. Vista Table
2. Click header "Title"
3. → Ordena A-Z (ascending)
4. Click de nuevo
5. → Ordena Z-A (descending)

✅ ESPERADO:
• Icono ↑ o ↓ visible
• Orden correcto
• Se mantiene al cambiar de página
```

#### Test 5.2: Ordenar por Fecha
```
✅ PASOS:
1. Cambiar sort a "Updated At" (default)
2. → Más recientes primero (descending)

✅ ESPERADO:
• Cursos recién editados arriba
• Orden cronológico correcto
```

---

### 6️⃣ ACCIONES INDIVIDUALES

#### Test 6.1: Editar Curso
```
✅ PASOS:
1. Click botón [Edit] en cualquier curso
2. → Abre ProfessionalCourseBuilder

✅ ESPERADO:
• Editor se abre con datos del curso
• Puede editar
• Al volver, cambios reflejados
```

#### Test 6.2: Publicar Curso (Válido)
```
✅ PASOS:
1. Curso draft CON módulos y lecciones
2. Click botón [Publish]
3. → Confirma validación

✅ ESPERADO:
• Alert: "Course published successfully"
• Badge cambia a "Published"
• Botón cambia a [Unpublish]
• Stats actualizados
```

#### Test 6.3: Publicar Curso (Inválido)
```
✅ PASOS:
1. Curso draft SIN módulos
2. Click botón [Publish]

✅ ESPERADO:
• Alert con errores:
  "Cannot publish: Course must have at least one module"
• Curso permanece como "Draft"
• No se publica
```

#### Test 6.4: Despublicar Curso
```
✅ PASOS:
1. Curso publicado
2. Click botón [Unpublish]
3. → Confirma

✅ ESPERADO:
• Alert: "Course unpublished successfully"
• Badge cambia a "Draft"
• Botón cambia a [Publish]
```

#### Test 6.5: Duplicar Curso
```
✅ PASOS:
1. Click icono [📋 Copy]
2. Confirma: "Duplicate this course?"

✅ ESPERADO:
• Alert: "Course duplicated successfully"
• Nuevo curso aparece con "(Copy)" en título
• Status: "Draft"
• Módulos y lecciones clonados
• Lista se recarga
```

#### Test 6.6: Archivar Curso
```
✅ PASOS:
1. Click icono [🗄️ Archive]
2. Confirma

✅ ESPERADO:
• Alert: "Course archived successfully"
• Badge cambia a "Archived"
• Stats actualizados
```

#### Test 6.7: Eliminar Draft
```
✅ PASOS:
1. Curso con status "Draft"
2. Click icono [🗑️ Delete]
3. Confirma: "Are you sure?"

✅ ESPERADO:
• Alert: "Course deleted successfully"
• Curso desaparece de lista
• Stats actualizados
```

#### Test 6.8: Intentar Eliminar Publicado
```
✅ PASOS:
1. Curso con status "Published"
2. Click icono [🗑️ Delete]

✅ ESPERADO:
• Alert: "Cannot delete a published course. Unpublish it first."
• Curso NO se elimina
• Permanece en lista
```

---

### 7️⃣ SELECCIÓN MÚLTIPLE

#### Test 7.1: Seleccionar Individual
```
✅ PASOS:
1. Click checkbox en un curso
2. → Checkbox marcado
3. → Barra de bulk actions aparece

✅ ESPERADO:
• "1 course selected"
• Botones: Publish, Archive, Delete, Clear
• Selección persistente al cambiar vista grid/table
```

#### Test 7.2: Select All
```
✅ PASOS:
1. Vista Table
2. Click checkbox en header
3. → Todos en página actual seleccionados

✅ ESPERADO:
• Todos los checkboxes marcados
• "12 courses selected" (o número en página)
• Barra de bulk actions visible
```

#### Test 7.3: Deseleccionar
```
✅ PASOS:
1. Varios cursos seleccionados
2. Click [Clear]

✅ ESPERADO:
• Todos los checkboxes desmarcados
• Barra de bulk actions desaparece
• Selección limpia
```

---

### 8️⃣ ACCIONES MASIVAS

#### Test 8.1: Bulk Publish
```
✅ PASOS:
1. Selecciona 3 cursos draft VÁLIDOS
2. Click [Publish]
3. Confirma: "Publish 3 selected courses?"

✅ ESPERADO:
• Alert: "Courses published successfully"
• 3 cursos cambian a "Published"
• Selección se limpia
• Stats actualizados
```

#### Test 8.2: Bulk Publish con Inválidos
```
✅ PASOS:
1. Selecciona cursos sin módulos
2. Click [Publish]

✅ ESPERADO:
• Alert: "Some courses failed to publish"
• Solo válidos se publican
• Inválidos permanecen como draft
```

#### Test 8.3: Bulk Archive
```
✅ PASOS:
1. Selecciona 5 cursos (mix de draft/published)
2. Click [Archive]
3. Confirma

✅ ESPERADO:
• Alert: "Courses archived successfully"
• 5 cursos cambian a "Archived"
• Selección limpia
```

#### Test 8.4: Bulk Delete (Solo Drafts)
```
✅ PASOS:
1. Selecciona 3 drafts
2. Click [Delete]
3. Confirma

✅ ESPERADO:
• Alert: "Courses deleted successfully"
• 3 cursos eliminados
• Stats actualizados
```

#### Test 8.5: Bulk Delete con Publicados
```
✅ PASOS:
1. Selecciona 2 drafts + 1 published
2. Click [Delete]

✅ ESPERADO:
• Alert: "Cannot delete 1 published courses. Unpublish them first."
• Ninguno se elimina
• Selección se mantiene
```

---

### 9️⃣ PAGINACIÓN

#### Test 9.1: Navegación de Páginas
```
✅ PASOS:
1. Con >12 cursos en lista
2. Click [Next]
3. → Va a página 2
4. Click [Previous]
5. → Vuelve a página 1

✅ ESPERADO:
• "Page 1 of X" actualizado
• Botones disabled en límites
• Contenido correcto por página
```

#### Test 9.2: Paginación con Filtros
```
✅ PASOS:
1. Aplica filtro que deja 25 cursos
2. → Debe mostrar 3 páginas (12+12+1)
3. Navega entre páginas

✅ ESPERADO:
• Paginación recalculada
• Filtros persistentes al cambiar página
• Contador correcto
```

---

### 🔟 EDGE CASES

#### Test 10.1: Sin Cursos
```
✅ PASOS:
1. Sistema sin cursos creados
2. → Empty state

✅ ESPERADO:
• Mensaje: "No courses created yet"
• Botón: "Create Your First Course"
• Stats en 0
```

#### Test 10.2: Búsqueda Sin Resultados
```
✅ PASOS:
1. Busca "xyzabc123" (no existe)

✅ ESPERADO:
• Mensaje: "No courses found matching your filters"
• Sin botón de crear
• Stats muestran totales reales
```

#### Test 10.3: Acciones Simultáneas
```
✅ PASOS:
1. Inicia duplicación de curso
2. Inmediatamente duplica otro

✅ ESPERADO:
• Ambas operaciones completan
• Lista se recarga correctamente
• Sin duplicados accidentales
```

#### Test 10.4: Network Error
```
✅ PASOS:
1. Apaga el servidor
2. Intenta publicar curso

✅ ESPERADO:
• Alert: "Failed to publish course"
• Curso permanece como estaba
• No crash de la app
```

---

## 🎯 Checklist Rápido

```
Navegación:
[ ] Abrir CourseManagement desde dashboard
[ ] Volver a dashboard

Estadísticas:
[ ] Stats cards muestran números correctos
[ ] Stats se actualizan después de acciones

Filtros:
[ ] Búsqueda por texto
[ ] Filtro por status
[ ] Filtro por categoría
[ ] Filtro por dificultad
[ ] Combinación de filtros

Vistas:
[ ] Toggle grid/table
[ ] Responsive grid (3/2/1 columnas)

Ordenamiento:
[ ] Ordenar por título
[ ] Ordenar por categoría
[ ] Ordenar por status
[ ] Ordenar por fecha

Acciones Individuales:
[ ] Editar curso
[ ] Publicar curso válido
[ ] Bloquear publicación inválida
[ ] Despublicar curso
[ ] Duplicar curso
[ ] Archivar curso
[ ] Eliminar draft
[ ] Bloquear delete de publicado

Selección:
[ ] Seleccionar individual
[ ] Select all
[ ] Deseleccionar

Bulk Actions:
[ ] Bulk publish
[ ] Bulk archive
[ ] Bulk delete (solo drafts)
[ ] Bloquear bulk delete de publicados

Paginación:
[ ] Navegar entre páginas
[ ] Previous/Next disabled en límites
[ ] Paginación con filtros

Edge Cases:
[ ] Sistema sin cursos
[ ] Búsqueda sin resultados
[ ] Network errors
```

---

## 🐛 Bugs Conocidos (Para Fase 2)

```
⚠️ LIMITACIONES ACTUALES:

1. Alerts en lugar de toasts
   → Mejorar con toast system profesional

2. No debouncing en búsqueda
   → Añadir delay de 300ms

3. Client-side pagination
   → Considerar server-side para >1000 cursos

4. Sin loading states en botones
   → Añadir spinners durante acciones

5. Curso preview no implementado
   → Añadir en Fase 2
```

---

## ✅ Testing Completo

### Cuando termines todos los tests:
```
✅ Funcionalidad básica: 100%
✅ Filtros: 100%
✅ Acciones: 100%
✅ Validaciones: 100%
✅ Edge cases: 100%

🎉 FASE 1 COMPLETAMENTE PROBADA
```

---

**Última actualización**: 5 Noviembre 2025  
**Versión**: Phase 1 - CourseManagement Avanzado
