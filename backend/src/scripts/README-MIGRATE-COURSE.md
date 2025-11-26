# Script de Migración de Cursos

## Descripción

Este script copia un curso desde la tenant "kainet" a todas las demás tenants en el sistema. Es útil para compartir cursos de ejemplo entre tenants.

## Uso

### Requisitos Previos

1. Asegúrate de tener las variables de entorno configuradas en `.env`:
   ```
   COSMOS_ENDPOINT=...
   COSMOS_KEY=...
   COSMOS_DATABASE=...
   ```

2. El curso debe existir en la tenant "kainet" con el título exacto especificado en el script.

### Ejecución

**IMPORTANTE**: El script debe ejecutarse desde el directorio `backend` para que encuentre el archivo `.env` correctamente:

```bash
cd backend
npx ts-node src/scripts/migrate-course-to-all-tenants.ts
```

O si tienes un script npm configurado:

```bash
cd backend
npm run ts-node src/scripts/migrate-course-to-all-tenants.ts
```

## Configuración

El script tiene las siguientes constantes configurables al inicio del archivo:

```typescript
const SOURCE_TENANT_SLUG = 'kainet';
const COURSE_TITLE = 'Introducción a AccessLearn';
```

### Cambiar el curso a migrar

Para migrar un curso diferente, simplemente cambia la constante `COURSE_TITLE`:

```typescript
const COURSE_TITLE = 'Nombre del Curso a Migrar';
```

### Cambiar la tenant fuente

Para usar una tenant diferente como fuente, cambia la constante `SOURCE_TENANT_SLUG`:

```typescript
const SOURCE_TENANT_SLUG = 'otra-tenant';
```

## Qué hace el script

1. **Busca el curso fuente**: Encuentra el curso especificado en la tenant fuente (kainet).

2. **Obtiene todas las tenants**: Lista todas las tenants excepto la fuente.

3. **Para cada tenant destino**:
   - Verifica si el curso ya existe (lo omite si existe)
   - Busca un usuario administrador en la tenant (tenant-admin, content-manager, instructor, o cualquier usuario activo)
   - Crea una copia del curso con:
     - Mismo título, descripción, categoría
     - Todos los módulos y lecciones (deep clone)
     - Todas las evaluaciones/quizzes
     - Estado: `draft` (borrador)
     - Nuevo `tenantId`
     - Creado por el administrador de la tenant destino

4. **Muestra un resumen**: Al final, muestra cuántos cursos se crearon exitosamente, cuántos se omitieron, y si hubo errores.

## Estructura de datos copiada

El script copia completamente:
- ✅ Título y descripción
- ✅ Categoría
- ✅ Tiempo estimado
- ✅ Imagen de portada
- ✅ Todos los módulos con su estructura completa
- ✅ Todas las lecciones dentro de los módulos
- ✅ Todos los bloques de contenido dentro de las lecciones
- ✅ Todas las evaluaciones/quizzes
- ✅ Configuración de quizzes (si existe)

No se copia:
- ❌ ID del curso (se genera uno nuevo)
- ❌ Fechas de creación/actualización
- ❌ Estado de publicación (siempre se crea como `draft`)
- ❌ Comentarios de revisión
- ❌ IDs de revisores
- ❌ Cualquier dato específico del workflow de aprobación

## Resultado

- Los cursos se crean como **borradores (draft)** en cada tenant
- Los administradores de cada tenant pueden editarlos y publicarlos cuando deseen
- Si un curso con el mismo título ya existe en una tenant, se omite (no se sobrescribe)

## Ejemplo de salida

```
🚀 Iniciando migración de curso a todas las tenants...

✅ Conexión a Cosmos DB establecida

📋 Buscando tenant fuente: kainet...
✅ Tenant fuente encontrada: Kainet (tenant-kainet)

📖 Buscando curso: "Introducción a AccessLearn"...
✅ Curso encontrado: Introducción a AccessLearn (course-123...)
   - Módulos: 3
   - Estado: published
   - Tiempo estimado: 60 minutos

📋 Obteniendo todas las tenants...
✅ Encontradas 2 tenant(s) destino:

   1. Labolamx (labolamx)
   2. Otra Tenant (otra-tenant)

🔄 Procesando: Labolamx...
   👤 Buscando usuario administrador...
   📝 Creando curso...
   📚 Agregando módulos y evaluaciones...
   ✅ Curso creado exitosamente: course-456...

============================================================
📊 RESUMEN DE MIGRACIÓN
============================================================
✅ Exitosas: 2
⏭️  Omitidas: 0
❌ Errores: 0
📦 Total procesadas: 2
============================================================

💡 Los cursos fueron creados como borradores (draft).
   Los administradores de cada tenant pueden editarlos y publicarlos.
```

## Solución de problemas

### Error: "No se encontró la tenant 'kainet'"
- Verifica que la tenant existe usando: `npm run ts-node src/scripts/list-tenants.ts`
- Verifica que el slug sea correcto (case-sensitive)

### Error: "No se encontró el curso"
- Verifica que el curso existe en kainet
- Verifica que el título sea exacto (case-sensitive y con caracteres especiales)

### Error: "No se encontró un usuario administrador"
- El script usará 'system' como fallback
- Es recomendable crear al menos un tenant-admin en cada tenant antes de migrar

### Curso se omite aunque debería crearse
- Verifica que no exista ya un curso con el mismo título en la tenant destino
- Si necesitas sobrescribir, primero elimina el curso existente manualmente

## Notas importantes

⚠️ **Este script NO elimina cursos existentes**. Si un curso con el mismo título ya existe en una tenant, simplemente se omite.

⚠️ **Los cursos se crean como borradores**. Los administradores de cada tenant deben editarlos y publicarlos manualmente.

✅ **El script es seguro de ejecutar múltiples veces**. Si un curso ya existe, simplemente se omite sin error.

