# 📝 Formulario de Registro Público para Demos

**Versión:** 1.0.0  
**Fecha:** 23 de Noviembre, 2025  
**Propósito:** Permitir que usuarios externos se registren directamente en un tenant para demos

---

## 🎯 Descripción

El formulario de registro público permite que usuarios externos se registren directamente en un tenant específico sin necesidad de invitación previa. Esto es ideal para:

- **Demos con clientes:** Los clientes pueden registrarse ellos mismos durante una demo
- **Pruebas de usuario:** Permitir que usuarios de prueba se registren fácilmente
- **Eventos y talleres:** Registro rápido para participantes
- **Evaluaciones beta:** Permitir que usuarios beta se registren sin intervención del administrador

---

## 🔗 URLs y Acceso

### URL Base
```
/register?tenant={tenant-slug}
```

### Ejemplos

**Para tenant "kainet":**
```
http://localhost:5173/register?tenant=kainet
```

**Para producción:**
```
https://app.kainet.mx/register?tenant=kainet
```

**Sin parámetro (usa "kainet" por defecto):**
```
http://localhost:5173/register
```

---

## 📋 Funcionalidad

### Proceso de Registro

1. **Validación de Tenant**
   - El sistema valida que el tenant existe
   - Muestra el nombre de la organización
   - Si el tenant no existe, muestra un error

2. **Formulario de Registro**
   - Nombre (requerido)
   - Apellido (requerido)
   - Email (requerido, validación de formato)
   - Contraseña (mínimo 8 caracteres, requerido)
   - Confirmar Contraseña (debe coincidir)

3. **Creación de Usuario**
   - Se crea el usuario con rol `student` por defecto
   - El usuario queda activo inmediatamente
   - Se envía email de bienvenida (si está configurado)

4. **Redirección**
   - Después del registro exitoso, redirige al login
   - El usuario puede iniciar sesión inmediatamente

---

## 🔧 Backend API

### Endpoint

```
POST /api/users/register
```

### Request Body

```json
{
  "tenantSlug": "kainet",
  "email": "usuario@ejemplo.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "password": "MiPassword123!",
  "role": "student" // Opcional, por defecto es "student"
}
```

### Response (Success)

```json
{
  "user": {
    "id": "user-xxx",
    "tenantId": "tenant-kainet",
    "email": "usuario@ejemplo.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "student",
    "status": "active"
  },
  "message": "Usuario registrado exitosamente. Ya puedes iniciar sesión."
}
```

### Response (Error)

```json
{
  "error": "El email usuario@ejemplo.com ya está registrado en esta organización."
}
```

---

## 🎨 Características del Formulario

### Validaciones

- ✅ **Nombre:** Requerido, no puede estar vacío
- ✅ **Apellido:** Requerido, no puede estar vacío
- ✅ **Email:** Requerido, formato válido de email
- ✅ **Contraseña:** Mínimo 8 caracteres
- ✅ **Confirmar Contraseña:** Debe coincidir con la contraseña

### UX Features

- 🔒 **Mostrar/Ocultar Contraseña:** Botones para ver la contraseña mientras se escribe
- ⚡ **Validación en Tiempo Real:** Errores se muestran mientras el usuario escribe
- 🎨 **Diseño Responsive:** Funciona en móvil y desktop
- 🌈 **Tema Adaptativo:** Soporta modo claro y oscuro
- ✨ **Feedback Visual:** Mensajes de éxito/error claros
- 🔄 **Estados de Carga:** Indicadores mientras se procesa el registro

---

## 📱 Uso para Demos

### Escenario 1: Demo en Vivo

1. **Preparación:**
   - Asegúrate de que el tenant existe
   - Ten la URL lista: `https://app.kainet.mx/register?tenant=kainet`

2. **Durante la Demo:**
   - Comparte la URL con los participantes
   - Pídeles que se registren con su email real
   - Ellos pueden crear su cuenta en menos de 1 minuto

3. **Después del Registro:**
   - Los usuarios pueden iniciar sesión inmediatamente
   - Tienen acceso completo como estudiantes
   - Pueden inscribirse en cursos disponibles

### Escenario 2: Evento o Taller

1. **Antes del Evento:**
   - Crea un tenant específico para el evento
   - Prepara cursos de demostración
   - Comparte la URL de registro

2. **Durante el Evento:**
   - Los participantes se registran ellos mismos
   - No necesitas crear cuentas manualmente
   - Todos quedan listos para empezar

### Escenario 3: Pruebas Beta

1. **Configuración:**
   - Crea un tenant de prueba
   - Configura cursos de prueba
   - Comparte la URL con usuarios beta

2. **Registro:**
   - Los usuarios beta se registran solos
   - Puedes monitorear los registros desde el admin panel
   - Todos tienen acceso inmediato

---

## 🔐 Seguridad

### Medidas Implementadas

- ✅ **Validación de Email:** No permite emails duplicados en el mismo tenant
- ✅ **Contraseña Segura:** Mínimo 8 caracteres requeridos
- ✅ **Hash de Contraseña:** Las contraseñas se hashean antes de guardarse
- ✅ **Validación de Tenant:** Solo permite registro en tenants existentes
- ✅ **Rol por Defecto:** Todos los registros públicos son `student` (sin permisos administrativos)

### Recomendaciones

- ⚠️ **Para Producción:** Considera agregar CAPTCHA para prevenir spam
- ⚠️ **Límites de Registro:** Puedes configurar límites por tenant si es necesario
- ⚠️ **Verificación de Email:** Considera agregar verificación de email opcional

---

## 🧪 Testing

### Casos de Prueba

#### TC-REG-001: Registro Exitoso
1. Ir a `/register?tenant=kainet`
2. Llenar todos los campos correctamente
3. Hacer clic en "Crear Cuenta"
4. **Esperado:** Usuario creado, redirección a login, mensaje de éxito

#### TC-REG-002: Email Duplicado
1. Intentar registrar un email que ya existe
2. **Esperado:** Error "Email ya registrado", sugerencia de iniciar sesión

#### TC-REG-003: Validación de Campos
1. Dejar campos vacíos
2. **Esperado:** Mensajes de error específicos para cada campo

#### TC-REG-004: Contraseña Corta
1. Ingresar contraseña de menos de 8 caracteres
2. **Esperado:** Error "La contraseña debe tener al menos 8 caracteres"

#### TC-REG-005: Contraseñas No Coinciden
1. Ingresar contraseñas diferentes
2. **Esperado:** Error "Las contraseñas no coinciden"

#### TC-REG-006: Tenant Inexistente
1. Ir a `/register?tenant=inexistente`
2. **Esperado:** Error "Organización no encontrada", botón para volver al login

---

## 📊 Monitoreo

### Ver Registros

Los usuarios registrados aparecen en:
- **Admin Panel:** `/admin/users`
- **Security Settings:** `/admin/settings/security`

### Métricas

Puedes monitorear:
- Total de usuarios registrados
- Registros por fecha
- Usuarios activos vs inactivos

---

## 🔗 Integración con Login

Después del registro, el usuario es redirigido a:
```
/login?tenant={tenant-slug}
```

El formulario de login detecta automáticamente el tenant y permite iniciar sesión inmediatamente.

---

## 📝 Ejemplo de Uso Completo

### Paso 1: Preparar el Tenant
```bash
# Asegúrate de que el tenant existe
# Ejemplo: tenant "kainet" ya está configurado
```

### Paso 2: Compartir URL
```
https://app.kainet.mx/register?tenant=kainet
```

### Paso 3: Usuario se Registra
1. Usuario abre la URL
2. Ve el formulario con el nombre de la organización
3. Llena sus datos
4. Crea su cuenta

### Paso 4: Usuario Inicia Sesión
1. Redirigido automáticamente al login
2. Ingresa su email y contraseña
3. Accede a la plataforma

---

## 🚀 Próximas Mejoras

### Funcionalidades Futuras

- [ ] Verificación de email opcional
- [ ] CAPTCHA para prevenir spam
- [ ] Campos adicionales (teléfono, empresa, etc.)
- [ ] Términos y condiciones checkbox
- [ ] Política de privacidad
- [ ] Registro con redes sociales (OAuth)
- [ ] Límites de registro por tenant
- [ ] Auto-asignación a grupos/cursos

---

## 📚 Referencias

- **API Endpoint:** `POST /api/users/register`
- **Backend Function:** `backend/src/functions/UserFunctions.ts::registerUser`
- **Frontend Page:** `src/pages/RegisterPage.tsx`
- **API Service:** `src/services/api.service.ts::registerUser`

---

**Última Actualización:** 23 de Noviembre, 2025

