# 🎨 Patrones de Diseño - AccessLearn

## 📚 Tres Patrones Principales

AccessLearn utiliza tres patrones de diseño principales, cada uno optimizado para su contexto de uso específico.

---

## 1️⃣ Patrón: Dashboards y Listados

**Usado en:** Catálogo de Cursos, Mi Biblioteca, Mis Cursos, Directorio de Mentores, Mis Mentorías, Content Manager, Gestión de Usuarios

### Características:
- ✅ Header simple con título y descripción
- ✅ Stats cards con colores pastel e iconos pequeños
- ✅ Buscador y filtros en Card
- ✅ Grid de contenido responsive
- ✅ Estados vacíos con iconos grandes

### Cuándo Usar:
- Listados de elementos (cursos, usuarios, mentores)
- Dashboards con métricas
- Páginas de exploración y búsqueda

### Estructura:
```tsx
<div className="container mx-auto px-4 py-8">
  {/* Navegación */}
  <div className="mb-6">
    <Button variant="ghost" onClick={handleBack} className="gap-2 mb-4">
      <ArrowLeft size={18} />
      Volver al Dashboard
    </Button>
  </div>

  {/* Header */}
  <div className="space-y-2 mb-6">
    <h1 className="text-3xl font-bold">Título de la Página</h1>
    <p className="text-muted-foreground">Descripción breve</p>
  </div>

  {/* Stats Cards */}
  <div className="grid gap-4 md:grid-cols-3 mb-6">
    <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Métrica</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  {/* Buscador */}
  <Card className="mb-6">
    <CardContent className="pt-6">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
        <Input placeholder="Buscar..." className="pl-10" />
      </div>
    </CardContent>
  </Card>

  {/* Grid de Contenido */}
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {items.map(item => (
      <Card key={item.id}>
        {/* Contenido del item */}
      </Card>
    ))}
  </div>
</div>
```

---

## 2️⃣ Patrón: Builders y Editores

**Usado en:** ModernCourseBuilder

### Características:
- ✅ Header con stepper navigation
- ✅ Auto-save indicator
- ✅ Múltiples steps con validación
- ✅ Navegación entre pasos
- ✅ Acciones contextuales por step

### Cuándo Usar:
- Creación de contenido complejo
- Procesos multi-paso
- Editores con múltiples secciones
- Formularios extensos

### Estructura:
```tsx
<div className="min-h-screen bg-background">
  {/* Header */}
  <div className="border-b bg-background">
    <div className="container mx-auto px-4 py-6">
      {/* Navegación */}
      <div className="mb-4">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft size={18} />
          Volver a Mis Cursos
        </Button>
      </div>
      
      {/* Título y Estado */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Crear Nuevo Curso</h1>
          <p className="text-muted-foreground">Estado o descripción</p>
        </div>
        
        <div className="flex items-center gap-4">
          <AutoSaveIndicator {...props} />
          <Button onClick={handleSave}>Guardar</Button>
        </div>
      </div>
      
      {/* Stepper Navigation */}
      <StepperNavigation
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepChange}
      />
    </div>
  </div>

  {/* Contenido del Step Actual */}
  <div className="container mx-auto px-4 py-6">
    <div className="space-y-6">
      {/* Header del Step */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Título del Paso</h2>
        <p className="text-muted-foreground">Descripción del paso</p>
      </div>
      
      {/* Contenido en Cards */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Formularios y contenido */}
        </CardContent>
      </Card>
      
      {/* Navegación entre Steps */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious}>
          Anterior
        </Button>
        <Button onClick={handleNext}>
          Siguiente
        </Button>
      </div>
    </div>
  </div>
</div>
```

---

## 3️⃣ Patrón: Vistas de Aprendizaje

**Usado en:** CourseViewer, LessonViewer

### Características:
- ✅ Header sticky con progreso visible
- ✅ Layout de dos columnas (sidebar + contenido)
- ✅ Navegación de módulos y lecciones
- ✅ Indicadores de completado
- ✅ Navegación secuencial (anterior/siguiente)
- ✅ Gamificación integrada (XP, confetti)

### Cuándo Usar:
- Consumo de contenido educativo
- Experiencias de aprendizaje
- Navegación secuencial de contenido
- Tracking de progreso

### Estructura:
```tsx
<div className="min-h-screen bg-background">
  {/* Header Sticky */}
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

  {/* Layout de Dos Columnas */}
  <div className="container mx-auto px-4 py-6">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar - Navegación */}
      <aside className="lg:col-span-3">
        <Card className="p-4 sticky top-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Contenido del Curso</h2>
            
            {/* Lista de Módulos y Lecciones */}
            {modules.map(module => (
              <div key={module.id} className="space-y-2">
                {/* Módulo con barra de progreso */}
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{module.title}</h3>
                    <div className="h-1.5 bg-muted rounded-full mt-1">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Lecciones */}
                <div className="ml-7 space-y-1">
                  {module.lessons.map(lesson => (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonSelect(lesson.id)}
                      className="w-full text-left px-3 py-2 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{lesson.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </aside>

      {/* Contenido Principal */}
      <main className="lg:col-span-9">
        {/* Contenido de la Lección con Animación */}
        <AnimatePresence mode="wait">
          <motion.div
            key={lessonId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              {/* Contenido de la lección */}
            </Card>
            
            {/* Navegación Secuencial */}
            <div className="flex items-center justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={!hasPrevious}
              >
                <ChevronLeft size={18} />
                Anterior
              </Button>
              
              <Button onClick={handleComplete}>
                Marcar como Completado
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
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  </div>
</div>
```

---

## 🎯 Guía de Selección de Patrón

### ¿Qué patrón usar?

| Contexto | Patrón Recomendado | Razón |
|----------|-------------------|-------|
| Listado de elementos | Dashboards y Listados | Optimizado para exploración y búsqueda |
| Creación de contenido | Builders y Editores | Proceso guiado multi-paso |
| Consumo de contenido | Vistas de Aprendizaje | Experiencia inmersiva y enfocada |
| Métricas y estadísticas | Dashboards y Listados | Stats cards y visualización de datos |
| Formularios complejos | Builders y Editores | Validación y navegación por pasos |
| Navegación secuencial | Vistas de Aprendizaje | Progreso lineal con tracking |

---

## ✅ Checklist por Patrón

### Dashboards y Listados:
- [ ] Header simple (h1 + descripción)
- [ ] Botón "Volver" en esquina superior
- [ ] Stats cards con colores pastel
- [ ] Buscador en Card sin título
- [ ] Grid responsive (gap-6)
- [ ] Estados vacíos con iconos grandes

### Builders y Editores:
- [ ] Header con stepper navigation
- [ ] Auto-save indicator visible
- [ ] Steps con headers consistentes
- [ ] Validación antes de cambiar step
- [ ] Navegación anterior/siguiente
- [ ] Confirmación antes de salir

### Vistas de Aprendizaje:
- [ ] Header sticky con progreso
- [ ] Sidebar de navegación (sticky top-4)
- [ ] Layout de dos columnas
- [ ] Animaciones suaves (duration-300)
- [ ] Navegación secuencial
- [ ] Indicadores de completado

---

**Documento creado:** Noviembre 2024  
**Última actualización:** Noviembre 2024  
**Mantenido por:** Equipo de Desarrollo AccessLearn
