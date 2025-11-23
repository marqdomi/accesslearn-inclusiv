# 🎓 Guía: Subir Cursos Demo a Producción

**Fecha:** 2025-01-28  
**Proyecto:** AccessLearn Inclusiv

---

## 🎯 OBJETIVO

Subir los 8 cursos tutoriales a producción para el demo con Dra. Amayrani.

---

## 📋 PREREQUISITOS

### 1. Verificar que la Plataforma Esté en Producción

- ✅ Frontend: https://app.kainet.mx
- ✅ Backend: https://api.kainet.mx
- ✅ Cosmos DB: Conectado y funcionando

### 2. Verificar Variables de Entorno

Los scripts necesitan conectarse a Cosmos DB de producción. Necesitas:

```bash
# En backend/.env o como variables de entorno
COSMOS_ENDPOINT=https://accesslearn-cosmos.documents.azure.com:443/
COSMOS_KEY=<tu-key-de-cosmos-db>
COSMOS_DATABASE_NAME=accesslearn-prod
```

### 3. Verificar que el Tenant Exista

El script busca el tenant `kainet`. Si no existe, lo creará.

### 4. Verificar que el Usuario Admin Exista

El script busca `ana.lopez@kainet.mx` como admin. Debe existir y tener rol `super-admin` o `admin`.

---

## 🚀 PASOS PARA SUBIR CURSOS DEMO

### Paso 1: Preparar Entorno

```bash
cd backend

# Verificar que las dependencias estén instaladas
npm install

# Verificar que las variables de entorno estén configuradas
cat .env | grep COSMOS
```

### Paso 2: Crear los Cursos Tutoriales

```bash
# Ejecutar script para crear los 8 cursos
npm run setup-tutorial-courses
```

Este script:
- ✅ Crea o encuentra el tenant "kainet"
- ✅ Crea los 8 cursos tutoriales con contenido completo
- ✅ Aprueba los cursos (los marca como publicados)
- ✅ Muestra un resumen de los cursos creados

**Cursos que se crearán:**
1. Bienvenida a AccessLearn
2. Navegación y Uso Básico
3. Creación de Cursos
4. Gestión de Usuarios
5. Sistema de Gamificación
6. Certificados y Logros
7. Analytics y Reportes
8. Comunidad y Foros

### Paso 3: Asignar Cursos a Dra. Amayrani

```bash
# Asignar todos los cursos tutoriales a un usuario específico
npm run assign-tutorial-courses

# O especificar un email diferente
npm run assign-tutorial-courses -- --email=amayrani.gomez@kainet.mx
```

Este script:
- ✅ Busca el usuario por email (por defecto: Dra. Amayrani)
- ✅ Asigna todos los cursos tutoriales al usuario
- ✅ Crea CourseAssignments en Cosmos DB
- ✅ Muestra un resumen de asignaciones

### Paso 4: Verificar en Producción

1. **Abrir la aplicación:**
   ```
   https://app.kainet.mx/?tenant=dra-amayrani-gomez
   ```

2. **Login con las credenciales de Dra. Amayrani**

3. **Verificar que los cursos aparezcan:**
   - En "Mi Biblioteca" o "Mis Cursos"
   - En "Cursos Asignados"
   - En el dashboard

4. **Verificar en el Admin Panel:**
   - Ir a "Administración" → "Cursos"
   - Verificar que los 8 cursos aparezcan
   - Verificar que estén en estado "Publicado"

---

## 🔍 VERIFICACIÓN DETALLADA

### Verificar Cursos en Cosmos DB

```bash
# Listar todos los cursos del tenant kainet
az cosmosdb sql container query \
  --account-name accesslearn-cosmos \
  --database-name accesslearn-prod \
  --container-name courses \
  --query-text "SELECT * FROM c WHERE c.tenantId = 'kainet'"
```

### Verificar Asignaciones

```bash
# Listar asignaciones de cursos
az cosmosdb sql container query \
  --account-name accesslearn-cosmos \
  --database-name accesslearn-prod \
  --container-name course-assignments \
  --query-text "SELECT * FROM c WHERE c.tenantId = 'kainet'"
```

---

## 🆘 TROUBLESHOOTING

### Error: "Cannot connect to Cosmos DB"

**Solución:**
1. Verificar que `COSMOS_ENDPOINT` y `COSMOS_KEY` estén correctos
2. Verificar que la IP esté permitida en Cosmos DB firewall
3. Probar conexión:
   ```bash
   cd backend
   npm run server  # Debe conectar exitosamente
   ```

### Error: "Tenant 'kainet' not found"

**Solución:**
El script debería crear el tenant automáticamente. Si falla:
1. Verificar permisos en Cosmos DB
2. Verificar que el contenedor `tenants` exista
3. Crear el tenant manualmente si es necesario

### Error: "User not found"

**Solución:**
1. Verificar que el usuario exista:
   ```bash
   # Buscar en Cosmos DB
   az cosmosdb sql container query \
     --account-name accesslearn-cosmos \
     --database-name accesslearn-prod \
     --container-name users \
     --query-text "SELECT * FROM c WHERE c.email = 'ana.lopez@kainet.mx'"
   ```
2. Si no existe, crear el usuario primero
3. Asegurar que tenga el rol correcto (`admin` o `super-admin`)

### Error: "Course already exists"

**Solución:**
- El script debería verificar si el curso ya existe antes de crearlo
- Si aparece este error, los cursos ya fueron creados
- Puedes verificar en el admin panel o en Cosmos DB

---

## 📊 RESUMEN DE CURSOS TUTORIALES

| # | Curso | Descripción | Módulos |
|---|-------|-------------|---------|
| 1 | Bienvenida a AccessLearn | Introducción general a la plataforma | 3 módulos |
| 2 | Navegación y Uso Básico | Cómo navegar y usar las funciones básicas | 4 módulos |
| 3 | Creación de Cursos | Guía completa para crear cursos | 5 módulos |
| 4 | Gestión de Usuarios | Administración de usuarios y grupos | 4 módulos |
| 5 | Sistema de Gamificación | Cómo funciona XP, niveles, badges | 4 módulos |
| 6 | Certificados y Logros | Generación y gestión de certificados | 3 módulos |
| 7 | Analytics y Reportes | Uso del dashboard de analytics | 4 módulos |
| 8 | Comunidad y Foros | Sistema de Q&A y foros | 3 módulos |

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Variables de entorno configuradas (COSMOS_ENDPOINT, COSMOS_KEY)
- [ ] Tenant "kainet" existe o se puede crear
- [ ] Usuario admin existe (ana.lopez@kainet.mx)
- [ ] Script `setup-tutorial-courses` ejecutado exitosamente
- [ ] Script `assign-tutorial-courses` ejecutado exitosamente
- [ ] Cursos visibles en producción (app.kainet.mx)
- [ ] Cursos asignados al usuario de demo
- [ ] Cursos publicados y disponibles

---

## 🎯 PRÓXIMOS PASOS DESPUÉS DE SUBIR CURSOS

1. **Verificar que los cursos funcionen correctamente:**
   - Abrir cada curso
   - Verificar que el contenido se muestre
   - Verificar que los módulos se puedan completar

2. **Preparar demo:**
   - Revisar el flujo de demo
   - Asegurar que todas las funcionalidades estén disponibles
   - Preparar preguntas/respuestas

3. **Documentar:**
   - Crear guía de demo actualizada
   - Documentar cualquier ajuste necesario

---

**¿Listo para ejecutar los scripts?** 🚀

