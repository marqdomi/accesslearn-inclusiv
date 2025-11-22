# 🧪 Guía de Testing - Feature de Perfiles

**Fecha:** 2025-01-28  
**Objetivo:** Testing completo del feature de gestión de perfiles

---

## 🚀 Testing Automatizado

### Ejecutar Script de Testing

```bash
cd backend
npm run test:profile
```

**Variables de Entorno:**
```bash
API_URL=http://localhost:3000
TEST_EMAIL=ana.lopez@kainet.mx
TEST_PASSWORD=Demo123!
TEST_TENANT_ID=kainet
```

**Nota:** El servidor backend debe estar corriendo antes de ejecutar los tests.

---

## 📝 Testing Manual

### 1. Acceso a Perfil

#### Test 1.1: Navegar a Perfil
- [ ] Login como cualquier usuario
- [ ] Click en botón "Perfil" en el header del Dashboard
- [ ] Verificar que se carga la ruta `/profile`
- [ ] Verificar que se muestra la página de perfil completa

**Resultado Esperado:** ✅ Página de perfil carga correctamente

#### Test 1.2: Información Inicial
- [ ] Verificar que se muestra:
  - [ ] Nombre completo del usuario
  - [ ] Email (campo deshabilitado)
  - [ ] Avatar actual (o placeholder con iniciales)
  - [ ] XP y nivel
  - [ ] Rol del usuario
- [ ] Verificar que los datos coinciden con el usuario logueado

**Resultado Esperado:** ✅ Toda la información se muestra correctamente

---

### 2. Actualización de Información Personal

#### Test 2.1: Editar Nombre y Apellido
- [ ] Modificar campo "Nombre"
- [ ] Modificar campo "Apellido"
- [ ] Click en "Guardar Cambios"
- [ ] Verificar mensaje de éxito
- [ ] Recargar página
- [ ] Verificar que los cambios persisten

**Resultado Esperado:** ✅ Nombre y apellido se actualizan correctamente

#### Test 2.2: Agregar Teléfono
- [ ] Agregar teléfono: `+52 55 1234 5678`
- [ ] Guardar cambios
- [ ] Verificar que el teléfono se guarda
- [ ] Recargar y verificar persistencia

**Resultado Esperado:** ✅ Teléfono se guarda y persiste

#### Test 2.3: Agregar Fecha de Nacimiento y Género
- [ ] Seleccionar fecha de nacimiento: `1990-01-01`
- [ ] Seleccionar género: `Masculino`
- [ ] Guardar cambios
- [ ] Verificar que se guardan correctamente

**Resultado Esperado:** ✅ Fecha de nacimiento y género se guardan

#### Test 2.4: Agregar Dirección Completa
- [ ] Agregar calle: `123 Test Street`
- [ ] Agregar ciudad: `Test City`
- [ ] Agregar estado: `Test State`
- [ ] Agregar código postal: `12345`
- [ ] Agregar país: `México`
- [ ] Guardar cambios
- [ ] Verificar que toda la dirección se guarda

**Resultado Esperado:** ✅ Dirección completa se guarda correctamente

#### Test 2.5: Validaciones de Formulario
- [ ] Intentar guardar sin nombre (campo vacío)
- [ ] Verificar que aparece error: "El campo nombre es requerido"
- [ ] Intentar guardar sin apellido (campo vacío)
- [ ] Verificar que aparece error: "El campo apellido es requerido"
- [ ] Llenar campos requeridos y guardar
- [ ] Verificar que se guarda correctamente

**Resultado Esperado:** ✅ Validaciones funcionan correctamente

---

### 3. Upload de Avatar

#### Test 3.1: Subir Imagen Pequeña
- [ ] Click en ícono de cámara sobre el avatar
- [ ] Seleccionar imagen pequeña (< 1MB)
- [ ] Verificar que aparece preview inmediato
- [ ] Esperar a que se complete el upload
- [ ] Verificar que el avatar se actualiza en la página
- [ ] Recargar página
- [ ] Verificar que el avatar persiste

**Resultado Esperado:** ✅ Avatar se sube y muestra correctamente

#### Test 3.2: Validación de Tamaño
- [ ] Intentar subir imagen > 5MB
- [ ] Verificar que aparece error: "La imagen debe ser menor a 5MB"
- [ ] Verificar que no se sube la imagen

**Resultado Esperado:** ✅ Validación de tamaño funciona

#### Test 3.3: Validación de Formato
- [ ] Intentar subir archivo que no es imagen (PDF, DOC, etc.)
- [ ] Verificar que aparece error: "El archivo debe ser una imagen"
- [ ] Verificar que no se sube el archivo

**Resultado Esperado:** ✅ Validación de formato funciona

#### Test 3.4: Verificar Persistencia en Cosmos DB
- [ ] Subir avatar
- [ ] Verificar en Cosmos DB (Azure Portal):
  - [ ] Container: `users`
  - [ ] Documento del usuario tiene campo `avatar`
  - [ ] El valor es un string base64
- [ ] Recargar página y verificar que el avatar se carga

**Resultado Esperado:** ✅ Avatar se guarda en Cosmos DB como base64

---

### 4. Cambio de Contraseña

#### Test 4.1: Cambio Exitoso
- [ ] Ir a pestaña "Cambiar Contraseña"
- [ ] Ingresar contraseña actual: `Demo123!`
- [ ] Ingresar nueva contraseña: `NewPassword123!`
- [ ] Confirmar nueva contraseña: `NewPassword123!`
- [ ] Click en "Cambiar Contraseña"
- [ ] Verificar mensaje de éxito
- [ ] Verificar que el formulario se limpia
- [ ] Logout
- [ ] Login con nueva contraseña: `NewPassword123!`
- [ ] Verificar que el login funciona
- [ ] Cambiar contraseña de vuelta a la original: `Demo123!`

**Resultado Esperado:** ✅ Cambio de contraseña funciona correctamente

#### Test 4.2: Validación de Contraseña Actual
- [ ] Ingresar contraseña actual incorrecta: `WrongPassword123!`
- [ ] Ingresar nueva contraseña: `NewPassword123!`
- [ ] Confirmar nueva contraseña: `NewPassword123!`
- [ ] Click en "Cambiar Contraseña"
- [ ] Verificar que aparece error: "Contraseña actual incorrecta"

**Resultado Esperado:** ✅ Validación de contraseña actual funciona

#### Test 4.3: Validación de Longitud Mínima
- [ ] Ingresar contraseña actual: `Demo123!`
- [ ] Ingresar nueva contraseña corta: `Short1!` (< 8 caracteres)
- [ ] Confirmar nueva contraseña: `Short1!`
- [ ] Click en "Cambiar Contraseña"
- [ ] Verificar que aparece error: "La nueva contraseña debe tener al menos 8 caracteres"

**Resultado Esperado:** ✅ Validación de longitud funciona

#### Test 4.4: Validación de Coincidencia
- [ ] Ingresar contraseña actual: `Demo123!`
- [ ] Ingresar nueva contraseña: `NewPassword123!`
- [ ] Confirmar nueva contraseña diferente: `DifferentPassword123!`
- [ ] Click en "Cambiar Contraseña"
- [ ] Verificar que aparece error: "Las contraseñas no coinciden"
- [ ] Verificar mensaje visual bajo el campo de confirmación

**Resultado Esperado:** ✅ Validación de coincidencia funciona

#### Test 4.5: Validación de Contraseña Diferente
- [ ] Ingresar contraseña actual: `Demo123!`
- [ ] Ingresar nueva contraseña igual a la actual: `Demo123!`
- [ ] Confirmar nueva contraseña: `Demo123!`
- [ ] Click en "Cambiar Contraseña"
- [ ] Verificar que aparece error: "La nueva contraseña debe ser diferente a la actual"

**Resultado Esperado:** ✅ Validación de contraseña diferente funciona

#### Test 4.6: Mostrar/Ocultar Contraseña
- [ ] Verificar que los campos de contraseña están ocultos (tipo password)
- [ ] Click en ícono de ojo en "Contraseña Actual"
- [ ] Verificar que se muestra el texto
- [ ] Click nuevamente
- [ ] Verificar que se oculta
- [ ] Repetir con "Nueva Contraseña" y "Confirmar Nueva Contraseña"

**Resultado Esperado:** ✅ Mostrar/ocultar contraseña funciona en todos los campos

---

### 5. Persistencia en Cosmos DB

#### Test 5.1: Verificar Actualización de Perfil
- [ ] Realizar cambios en el perfil (nombre, teléfono, etc.)
- [ ] Guardar cambios
- [ ] Verificar en Cosmos DB:
  - [ ] Container: `users`
  - [ ] Documento del usuario se actualizó
  - [ ] Campo `updatedAt` tiene timestamp reciente
  - [ ] Campos modificados tienen los nuevos valores
- [ ] Recargar página y verificar que los cambios persisten

**Resultado Esperado:** ✅ Cambios persisten en Cosmos DB

#### Test 5.2: Verificar Cambio de Contraseña
- [ ] Cambiar contraseña
- [ ] Verificar en Cosmos DB:
  - [ ] Campo `password` se actualizó (hash SHA-256)
  - [ ] Campo `passwordResetRequired` es `false`
  - [ ] Campo `updatedAt` se actualizó
- [ ] Verificar que el hash es diferente al anterior

**Resultado Esperado:** ✅ Contraseña se guarda hasheada en Cosmos DB

#### Test 5.3: Verificar Upload de Avatar
- [ ] Subir avatar
- [ ] Verificar en Cosmos DB:
  - [ ] Campo `avatar` existe
  - [ ] El valor es un string base64 (empieza con `data:image/...`)
  - [ ] El tamaño es razonable (< 1MB base64)
- [ ] Recargar página y verificar que el avatar se carga desde Cosmos DB

**Resultado Esperado:** ✅ Avatar se guarda como base64 en Cosmos DB

---

### 6. Integración con Otros Features

#### Test 6.1: Avatar en Dashboard
- [ ] Subir avatar en perfil
- [ ] Ir al Dashboard
- [ ] Verificar que el avatar se muestra en el header
- [ ] Click en el avatar (si tiene link)
- [ ] Verificar que navega a `/profile`

**Resultado Esperado:** ✅ Avatar se muestra en otros lugares de la app

#### Test 6.2: Información Actualizada en Dashboard
- [ ] Cambiar nombre en perfil
- [ ] Ir al Dashboard
- [ ] Verificar que el nombre se actualiza en el header

**Resultado Esperado:** ✅ Información se sincroniza en tiempo real

---

## 📊 Reporte de Testing

### Estado de Tests

| Test | Estado | Observaciones |
|------|--------|---------------|
| Acceso a Perfil | ⬜ | |
| Información Inicial | ⬜ | |
| Editar Nombre/Apellido | ⬜ | |
| Agregar Teléfono | ⬜ | |
| Fecha de Nacimiento/Género | ⬜ | |
| Dirección Completa | ⬜ | |
| Validaciones de Formulario | ⬜ | |
| Upload de Avatar | ⬜ | |
| Validación Tamaño Avatar | ⬜ | |
| Validación Formato Avatar | ⬜ | |
| Cambio de Contraseña | ⬜ | |
| Validación Contraseña Actual | ⬜ | |
| Validación Longitud | ⬜ | |
| Validación Coincidencia | ⬜ | |
| Mostrar/Ocultar Contraseña | ⬜ | |
| Persistencia Cosmos DB | ⬜ | |

### Problemas Encontrados

1. **Problema:** [Descripción]
   - **Severidad:** [Alta/Media/Baja]
   - **Pasos para reproducir:** [Pasos]
   - **Resultado esperado:** [Resultado]
   - **Resultado actual:** [Resultado]
   - **Screenshots:** [Links]

---

## ✅ Criterios de Éxito

### Para Demo
- [ ] 100% de los tests críticos pasan:
  - [ ] Acceso a perfil funciona
  - [ ] Actualización de información personal funciona
  - [ ] Cambio de contraseña funciona
  - [ ] Upload de avatar funciona (opcional para demo)

### Para Producción
- [ ] 100% de todos los tests pasan
- [ ] Todas las validaciones funcionan correctamente
- [ ] Persistencia en Cosmos DB verificada
- [ ] No hay errores en consola del navegador
- [ ] Performance aceptable (< 2s para cargar perfil)

---

**Última actualización:** 2025-01-28

