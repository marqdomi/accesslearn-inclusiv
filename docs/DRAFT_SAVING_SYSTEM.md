# Sistema de Guardado de Borradores

## Arquitectura

El sistema de guardado de borradores en el Constructor de Cursos tiene **dos niveles**:

### 1. Guardado Local (localStorage)
- **Cuándo**: Automáticamente cada 30 segundos cuando hay cambios detectados
- **Dónde**: Solo en el navegador del usuario (localStorage)
- **Propósito**: Respaldo rápido y recuperación ante cierres inesperados
- **Limitaciones**: Solo disponible en el mismo navegador y dispositivo

### 2. Guardado en Servidor (Cosmos DB)
- **Cuándo**: 
  - Cuando el usuario presiona "Guardar Borrador" (manual)
  - Antes de publicar o enviar para revisión
  - Al navegar entre pasos (save automático)
- **Dónde**: Base de datos Cosmos DB en Azure
- **Propósito**: Persistencia permanente, accesible desde cualquier dispositivo
- **Ventajas**: Disponible en cualquier navegador/dispositivo con la misma cuenta

## Flujo de Datos

```
Usuario hace cambios
    ↓
isDirty = true (se detectan cambios)
    ↓
┌─────────────────────────────────┐
│  Guardado Local (Automático)    │
│  - Cada 30 segundos             │
│  - Solo en localStorage         │
│  - lastSaved se actualiza       │
└─────────────────────────────────┘
    ↓
Usuario presiona "Guardar Borrador"
    ↓
┌─────────────────────────────────┐
│  Guardado en Servidor           │
│  - Llamada a ApiService         │
│  - Guarda en Cosmos DB          │
│  - lastSavedBackend se actualiza│
│  - isDirty = false              │
│  - También guarda en localStorage│
└─────────────────────────────────┘
```

## Estados del Indicador

El componente `AutoSaveIndicator` muestra diferentes estados:

### 1. Guardando...
- **Icono**: FloppyDisk animado
- **Color**: Gris
- **Cuándo**: `isSaving === true`
- **Mensaje**: "Guardando en el servidor..."

### 2. Cambios sin guardar
- **Icono**: Warning
- **Color**: Amarillo/Ámbar
- **Cuándo**: `isDirty === true`
- **Mensaje**: 
  - Si hay `lastSavedBackend`: "Cambios sin guardar en el servidor (guardado localmente hace X)"
  - Si no: "Cambios sin guardar (guardado localmente hace X)"

### 3. Guardado en el servidor
- **Icono**: CloudArrowUp (check verde)
- **Color**: Verde
- **Cuándo**: `isDirty === false && lastSavedBackend !== null`
- **Mensaje**: "Guardado en el servidor hace X"
- **Significado**: Los cambios están guardados permanentemente

### 4. Guardado localmente
- **Icono**: FloppyDisk
- **Color**: Amarillo/Ámbar
- **Cuándo**: `isDirty === false && lastSaved !== null && lastSavedBackend === null`
- **Mensaje**: "Guardado localmente hace X (no en servidor)"
- **Significado**: Solo guardado en el navegador, no en el servidor

## En Producción

### Comportamiento Esperado

1. **Al crear un nuevo curso**:
   - Los cambios se guardan automáticamente en localStorage cada 30 segundos
   - El usuario debe presionar "Guardar Borrador" para guardar en Cosmos DB
   - Una vez guardado en Cosmos DB, el curso tiene un ID permanente

2. **Al editar un curso existente**:
   - El curso se carga desde Cosmos DB
   - Los cambios se guardan localmente cada 30 segundos
   - Al presionar "Guardar Borrador", se actualiza en Cosmos DB

3. **Recuperación de borradores**:
   - Si el usuario cierra sin guardar en servidor, puede recuperar desde localStorage (solo en el mismo navegador)
   - Si guardó en servidor, puede acceder desde cualquier dispositivo

### Ventajas del Sistema Dual

- ✅ **Resiliencia**: Si falla el servidor, los cambios se mantienen localmente
- ✅ **Velocidad**: Guardado local instantáneo sin latencia de red
- ✅ **Persistencia**: Guardado en servidor permite acceso desde cualquier lugar
- ✅ **Experiencia de Usuario**: Feedback claro sobre dónde están guardados los cambios

### Limitaciones Conocidas

- ⚠️ **localStorage limitado**: Máximo ~5-10MB dependiendo del navegador
- ⚠️ **Sin sincronización automática**: El guardado en servidor requiere acción manual o navegación entre pasos
- ⚠️ **Sin colaboración en tiempo real**: Si dos usuarios editan el mismo curso, el último en guardar sobrescribe

## Mejoras Futuras

- [ ] Auto-guardado en servidor cada X minutos (configurable)
- [ ] Indicador de sincronización en tiempo real
- [ ] Conflictos de edición cuando múltiples usuarios editan
- [ ] Historial de versiones de borradores
- [ ] Notificaciones push cuando hay cambios en otro dispositivo

