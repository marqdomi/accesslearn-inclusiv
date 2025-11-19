# 📝 Agregar Datos de Prueba en Cosmos DB

Sigue estos pasos para agregar cursos de prueba en Azure Portal:

## Paso 1: Acceder a Azure Portal

1. Ve a https://portal.azure.com
2. Busca: "accesslearn-cosmos-prod"
3. Haz click en el recurso

## Paso 2: Abrir Data Explorer

1. En el menú izquierdo, haz click en **Data Explorer**
2. Expande: accesslearn-db → courses
3. Haz click en **New Item**

## Paso 3: Agregar Primer Curso (Tenant Demo)

Copia y pega este JSON:

```json
{
  "id": "course-001",
  "tenantId": "tenant-demo",
  "title": "Introducción a AccessLearn",
  "description": "Curso de prueba para validar el backend multi-tenant",
  "instructor": "Marco Dominguez",
  "status": "active",
  "startDate": "2025-11-19",
  "duration": 4,
  "level": "beginner"
}
```

Haz click en **Save**

## Paso 4: Agregar Segundo Curso (Otro Tenant)

Haz click nuevamente en **New Item** y pega:

```json
{
  "id": "course-002",
  "tenantId": "tenant-kainet",
  "title": "Capacitación Empresarial Kainet",
  "description": "Cursos específicos para empleados de Kainet",
  "instructor": "Socia Partner",
  "status": "active",
  "startDate": "2025-11-20",
  "duration": 6,
  "level": "intermediate"
}
```

Haz click en **Save**

## Paso 5: Verificar Datos

Verás dos items en el container:
- `course-001` con `tenantId: "tenant-demo"`
- `course-002` con `tenantId: "tenant-kainet"`

## Paso 6: Testear el Backend

En terminal:

```bash
cd backend
npm run dev
```

Debe conectarse a Cosmos DB y mostrar los cursos del tenant-demo.

---

## ✅ Resultado Esperado

```
🚀 Iniciando AccessLearn Backend...
✅ Cosmos DB connected: accesslearn-db
📚 Cursos encontrados:
[
  {
    "id": "course-001",
    "tenantId": "tenant-demo",
    "title": "Introducción a AccessLearn",
    "description": "Curso de prueba para validar el backend multi-tenant",
    "instructor": "Marco Dominguez",
    "status": "active",
    "startDate": "2025-11-19",
    "duration": 4,
    "level": "beginner"
  }
]
```

---

**¡Listo! Ya tienes tu primer backend funcionando contra Cosmos DB real en Azure.** 🎉
