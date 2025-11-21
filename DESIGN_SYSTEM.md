# 🎨 Sistema de Diseño - AccessLearn

## 📊 Resumen Ejecutivo

**Estado:** ✅ Homogeneización Completa  
**Componentes Actualizados:** 9 componentes principales  
**Fecha de Última Actualización:** Noviembre 2024

Este documento define el sistema de diseño unificado de AccessLearn, asegurando una experiencia de usuario consistente y profesional en toda la plataforma.

### Logros Principales:
- ✅ Todos los dashboards siguen el mismo patrón visual
- ✅ Stats cards con diseño uniforme y colores pastel
- ✅ Navegación consistente en toda la aplicación
- ✅ Componentes especializados (como el creador de cursos) integrados al ecosistema
- ✅ Dark mode considerado en todos los componentes
- ✅ Eliminación de inconsistencias visuales (gradientes, animaciones innecesarias)

---

## Objetivo
Mantener una experiencia de usuario consistente y profesional en toda la aplicación, siguiendo las mejores prácticas de la industria moderna.

## 📐 Principios de Diseño

### 1. Consistencia Visual
- Todos los componentes deben seguir el mismo lenguaje visual
- Espaciado uniforme y predecible
- Jerarquía tipográfica clara

### 2. Simplicidad
- Evitar elementos decorativos innecesarios
- Priorizar la funcionalidad sobre la estética
- Diseño limpio y minimalista

### 3. Accesibilidad
- Contraste adecuado para legibilidad
- Tamaños de fuente apropiados
- Navegación clara y predecible

## 🏗️ Componentes Estándar

### Headers de Página
```tsx
// ✅ CORRECTO - Simple y limpio
<div className="space-y-2">
  <h1 className="text-3xl font-bold">Título de la Página</h1>
  <p className="text-muted-foreground">
    Descripción breve de la funcionalidad
  </p>
</div>

// ❌ INCORRECTO - Iconos grandes con gradientes
<div className="flex items-center gap-3">
  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-secondary to-accent">
    <Icon size={28} weight="fill" className="text-white" />
  </div>
  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
      Título
    </h1>
  </div>
</div>
```

### Botón de Navegación "Volver"
```tsx
// ✅ CORRECTO - Simple en la esquina
<Button
  variant="ghost"
  onClick={() => navigate('/dashboard')}
  className="gap-2"
>
  <ArrowLeft size={18} />
  Volver al Dashboard
</Button>

// ❌ INCORRECTO - Botón prominente con estilos especiales
<Button variant="outline" size="lg" className="mb-6">
  <ArrowLeft /> Volver
</Button>
```

### Cards de Estadísticas
```tsx
// ✅ CORRECTO - Colores pastel con iconos pequeños
<Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
  <CardContent className="pt-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Métrica</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
    </div>
  </CardContent>
</Card>

// ❌ INCORRECTO - Sin contexto visual o colores planos
<Card>
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Métrica
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{value}</div>
  </CardContent>
</Card>
```

### Buscadores y Filtros
```tsx
// ✅ CORRECTO - En un Card sin título prominente
<Card>
  <CardContent className="pt-6 space-y-4">
    <div className="relative">
      <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
      <Input placeholder="Buscar..." className="pl-10" />
    </div>
    <div className="flex gap-4">
      <Select>...</Select>
      <Select>...</Select>
    </div>
  </CardContent>
</Card>

// ❌ INCORRECTO - Con CardHeader y título grande
<Card>
  <CardHeader>
    <CardTitle>Buscar Cursos</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Estados Vacíos
```tsx
// ✅ CORRECTO - Icono grande centrado
<Card>
  <CardContent className="py-16 text-center">
    <Icon size={64} className="mx-auto text-muted-foreground mb-4" />
    <h3 className="text-xl font-semibold mb-2">
      No hay elementos
    </h3>
    <p className="text-muted-foreground">
      Descripción del estado vacío
    </p>
  </CardContent>
</Card>
```

### Grids de Contenido
```tsx
// ✅ CORRECTO - Grid responsive con gap consistente
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => (
    <Card key={item.id}>...</Card>
  ))}
</div>

// ❌ INCORRECTO - Sin motion o con delays innecesarios
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card>...</Card>
    </motion.div>
  ))}
</div>
```

## 🎨 Paleta de Colores para Stats

### Colores Pastel para Cards de Estadísticas
- **Azul**: `bg-blue-50/50 dark:bg-blue-950/20 border-blue-100`
- **Verde**: `bg-green-50/50 dark:bg-green-950/20 border-green-100`
- **Púrpura**: `bg-purple-50/50 dark:bg-purple-950/20 border-purple-100`
- **Amarillo**: `bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-100`
- **Rosa**: `bg-pink-50/50 dark:bg-pink-950/20 border-pink-100`
- **Naranja**: `bg-orange-50/50 dark:bg-orange-950/20 border-orange-100`

### Iconos en Cards
- Tamaño del contenedor: `h-12 w-12`
- Tamaño del icono: `h-6 w-6`
- Background: `bg-{color}-100 dark:bg-{color}-900/50`
- Color del icono: `text-{color}-600 dark:text-{color}-400`

## 📏 Espaciado

### Espaciado entre secciones
- Entre secciones principales: `space-y-6`
- Dentro de cards: `space-y-4`
- Entre elementos pequeños: `gap-2` o `gap-3`

### Padding en Cards
- CardContent general: `pt-6`
- CardHeader cuando se usa: `pb-3`

## 🔤 Tipografía

### Jerarquía
- **H1 (Título de página)**: `text-3xl font-bold`
- **H2 (Subtítulos)**: `text-xl font-semibold`
- **H3 (Títulos de card)**: `text-lg font-semibold`
- **Body**: `text-sm` o tamaño base
- **Muted**: `text-sm text-muted-foreground`

## 🚫 Anti-Patrones a Evitar

1. **Gradientes en texto o fondos grandes**
   - Usar colores sólidos o pastel
   
2. **Iconos decorativos grandes en headers**
   - Los iconos deben ser funcionales, no decorativos
   
3. **Animaciones excesivas**
   - Evitar delays en grids (hace la carga lenta)
   
4. **Doble navegación**
   - Un solo botón "Volver" es suficiente
   
5. **Tabs con contadores en el nombre**
   - Usar badges separados si es necesario

## 📋 Checklist de Revisión

Antes de considerar un componente "terminado", verificar:

- [ ] Header simple sin iconos decorativos grandes
- [ ] Botón "Volver" en la esquina superior izquierda
- [ ] Stats cards con colores pastel e iconos pequeños
- [ ] Buscador y filtros en un Card sin título prominente
- [ ] Estados vacíos con iconos grandes centrados
- [ ] Grid responsive con gap-6
- [ ] Sin animaciones innecesarias
- [ ] Espaciado consistente (space-y-6 entre secciones)
- [ ] Tipografía siguiendo la jerarquía definida
- [ ] Dark mode considerado en todos los colores

## ✅ Componentes Actualizados - Homogeneización Completa

### Dashboards y Vistas Principales:
1. ✅ **Dashboard Principal** - Referencia base del diseño
2. ✅ **Catálogo de Cursos** - Actualizado
3. ✅ **Mi Biblioteca** - Actualizado
4. ✅ **Mis Cursos** - Actualizado (doble navegación eliminada)
5. ✅ **Directorio de Mentores** - Actualizado
6. ✅ **Mis Mentorías** - Actualizado
7. ✅ **Content Manager Dashboard** - Actualizado
8. ✅ **Gestión de Usuarios** - Actualizado

### Componentes Especializados:
9. ✅ **ModernCourseBuilder** - Revisado y validado
   - Header actualizado para consistencia
   - Mantiene funcionalidad especializada (stepper, auto-save)
   - Steps siguen estructura consistente

10. ✅ **CourseViewer (Vistas de Aprendizaje)** - Actualizado
   - Header sticky con progreso visible
   - Layout de dos columnas optimizado
   - Navegación consistente
   - Gamificación integrada

## 🎉 Estado del Proyecto

**Homogeneización GUI: COMPLETADA**

Todos los componentes principales ahora siguen el mismo sistema de diseño:
- Headers consistentes sin iconos decorativos grandes
- Stats cards con colores pastel e iconos pequeños
- Buscadores y filtros en Cards sin títulos prominentes
- Navegación simple con un solo botón "Volver"
- Sin animaciones innecesarias (motion delays removidos)
- Espaciado uniforme (space-y-6 entre secciones)
- Tipografía consistente
- Dark mode considerado en todos los colores

## 🎓 Componentes Especiales - Creador de Cursos

El **ModernCourseBuilder** es un componente complejo que requiere consideraciones especiales:

### Características Únicas Permitidas:
- ✅ **Stepper Navigation** - Necesario para guiar el proceso de creación
- ✅ **Auto-save Indicator** - Importante para no perder trabajo
- ✅ **Múltiples Cards por Step** - Cada paso puede tener su propia estructura
- ✅ **Formularios extensos** - Necesarios para capturar toda la información

### Debe Mantener Consistencia En:
- ✅ **Header principal** - Mismo estilo que otros componentes
- ✅ **Botón "Volver"** - Ubicación y estilo consistente
- ✅ **Espaciado** - space-y-6 entre secciones principales
- ✅ **Tipografía** - Jerarquía de títulos consistente
- ✅ **Cards** - Mismo estilo de bordes y sombras
- ✅ **Inputs y Forms** - Componentes UI estándar

### Patrón de Header para Builder:
```tsx
<div className="border-b bg-background">
  <div className="container mx-auto px-4 py-6">
    <div className="mb-4">
      <Button variant="ghost" onClick={handleBack} className="gap-2">
        <ArrowLeft size={18} />
        Volver a Mis Cursos
      </Button>
    </div>
    
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Título del Builder</h1>
        <p className="text-muted-foreground">Descripción o estado</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Indicadores o acciones especiales */}
      </div>
    </div>
    
    {/* Stepper Navigation */}
    <StepperNavigation {...props} />
  </div>
</div>
```

### Steps Individuales:
Cada step debe seguir esta estructura:
```tsx
<div className="space-y-6">
  {/* Header del Step */}
  <div>
    <h2 className="text-2xl font-bold mb-2">Título del Paso</h2>
    <p className="text-muted-foreground">
      Descripción de qué se hace en este paso
    </p>
  </div>
  
  {/* Contenido del Step en Cards */}
  <Card>
    <CardContent className="pt-6 space-y-6">
      {/* Formularios y contenido */}
    </CardContent>
  </Card>
</div>
```

### ✅ Estado del Creador de Cursos:
El **ModernCourseBuilder** ya sigue las mejores prácticas:
- ✅ Header consistente con botón "Volver"
- ✅ Stepper navigation bien diseñado
- ✅ Steps con headers claros (h2 + descripción)
- ✅ Cards para agrupar contenido relacionado
- ✅ Validación visual clara en el paso final
- ✅ Auto-save indicator discreto
- ✅ Espaciado consistente

**No requiere cambios adicionales** - Ya se siente parte del ecosistema mientras mantiene su funcionalidad especializada.

---

## 📚 Vistas de Aprendizaje - Navegación de Cursos

Las **vistas de aprendizaje** (CourseViewer) son interfaces especializadas donde los estudiantes consumen contenido. Requieren un diseño enfocado en la experiencia de aprendizaje.

### Características Únicas Permitidas:
- ✅ **Header sticky** - Siempre visible para navegación rápida
- ✅ **Sidebar de navegación** - Muestra estructura del curso
- ✅ **Indicador de progreso** - Visible en todo momento
- ✅ **Animaciones de transición** - Entre lecciones (suaves, no delays)
- ✅ **Gamificación** - XP animations, confetti al completar
- ✅ **Navegación secuencial** - Botones anterior/siguiente

### Debe Mantener Consistencia En:
- ✅ **Botón "Volver"** - Estilo y ubicación consistente
- ✅ **Tipografía** - Jerarquía de títulos
- ✅ **Cards** - Mismo estilo de bordes y sombras
- ✅ **Espaciado** - Consistente con el resto de la app
- ✅ **Colores** - Paleta unificada

### Patrón de Header para Vistas de Aprendizaje:
```tsx
<header className="border-b bg-background sticky top-0 z-10 shadow-sm">
  <div className="container mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      {/* Navegación y Título */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft size={18} />
          Mi Biblioteca
        </Button>
        <div className="border-l pl-4">
          <h1 className="text-lg font-bold">{courseTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {completed} de {total} lecciones completadas
          </p>
        </div>
      </div>
      
      {/* Indicador de Progreso */}
      <div className="hidden md:flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{percentage}%</p>
          <p className="text-xs text-muted-foreground">Progreso</p>
        </div>
        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  </div>
</header>
```

### Layout de Dos Columnas:
```tsx
<div className="container mx-auto px-4 py-6">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    {/* Sidebar - Navegación de Módulos */}
    <aside className="lg:col-span-3">
      <Card className="p-4 sticky top-4">
        {/* Navegación de módulos y lecciones */}
      </Card>
    </aside>

    {/* Contenido Principal */}
    <main className="lg:col-span-9">
      {/* Contenido de la lección */}
    </main>
  </div>
</div>
```

### Navegación de Módulos:
- **Título de módulo:** `text-sm font-medium`
- **Barra de progreso:** `h-1.5` con colores pastel
- **Lecciones:** Lista con iconos según tipo (video, texto, quiz)
- **Estado completado:** CheckCircle verde
- **Lección actual:** Background destacado

### Navegación Secuencial:
```tsx
<div className="flex items-center justify-between">
  <Button 
    variant="outline" 
    onClick={handlePrevious}
    disabled={!hasPrevious}
  >
    <ChevronLeft size={18} />
    Anterior
  </Button>
  
  <Button 
    onClick={handleComplete}
    disabled={completing}
  >
    {isLastLesson ? 'Completar Curso' : 'Marcar como Completado'}
    <CheckCircle size={18} className="ml-2" />
  </Button>
  
  <Button 
    variant="outline"
    onClick={handleNext}
    disabled={!hasNext}
  >
    Siguiente
    <ChevronRight size={18} />
  </Button>
</div>
```

### Animaciones Permitidas:
```tsx
// Transición entre lecciones (suave, sin delay)
<AnimatePresence mode="wait">
  <motion.div
    key={lessonId}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {/* Contenido de la lección */}
  </motion.div>
</AnimatePresence>
```

### Gamificación:
- **XP Animation:** Aparece al completar lección
- **Confetti:** Solo al completar curso completo
- **Progress bars:** Transiciones suaves (duration-300)
- **Badges:** Al desbloquear logros

### ✅ Estado de Vistas de Aprendizaje:
- ✅ Header actualizado con progreso visible
- ✅ Navegación consistente con el resto de la app
- ✅ Sidebar de módulos bien diseñado
- ✅ Animaciones apropiadas para el contexto
- ✅ Gamificación integrada sin ser intrusiva

## 📚 Referencias

- Inspiración: Dashboard Principal de AccessLearn
- Biblioteca de componentes: shadcn/ui
- Iconos: Phosphor Icons (tamaño 18-24 para UI, 48-64 para estados vacíos)
