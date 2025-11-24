# Plan de Integración Azure AD B2C

## 📋 Resumen Ejecutivo

Azure AD B2C es una solución de identidad empresarial que permite autenticación segura sin gestionar contraseñas. Este documento detalla el plan para integrar B2C en AccessLearn, manteniendo compatibilidad con el sistema actual y permitiendo migración gradual.

**Complejidad Estimada**: Media-Alta (2-3 semanas de desarrollo)
**Costo**: Gratis hasta 50,000 MAU (Monthly Active Users), luego $0.00325 por MAU

---

## 🎯 Beneficios de Azure AD B2C

### Seguridad
- ✅ Autenticación multi-factor (MFA) integrada
- ✅ Protección contra ataques (brute force, credential stuffing)
- ✅ Políticas de contraseña robustas
- ✅ Single Sign-On (SSO) entre aplicaciones
- ✅ Cumplimiento con estándares (SOC 2, ISO 27001)

### Experiencia de Usuario
- ✅ Social login (Google, Microsoft, Facebook, etc.)
- ✅ Self-service password reset
- ✅ Flujos personalizables (User Flows)
- ✅ Branding personalizado por tenant

### Operaciones
- ✅ Sin gestión de contraseñas en nuestra BD
- ✅ Escalabilidad automática
- ✅ Analytics y logs de autenticación
- ✅ Integración con Azure Monitor

---

## 🏗️ Arquitectura Propuesta

### Opción 1: Híbrida (Recomendada para Migración Gradual)

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐         ┌──────────────┐             │
│  │ Login B2C   │         │ Login Local  │             │
│  │ (MSAL.js)   │         │ (Actual)     │             │
│  └──────┬───────┘         └──────┬───────┘             │
│         │                        │                       │
│         └────────┬───────────────┘                       │
│                  │                                       │
└──────────────────┼───────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    ┌────▼────┐        ┌─────▼─────┐
    │ Azure   │        │ Backend   │
    │ AD B2C  │        │ API       │
    └─────────┘        └─────┬─────┘
                              │
                    ┌─────────▼─────────┐
                    │   Cosmos DB       │
                    │   (User Profile)  │
                    └───────────────────┘
```

**Ventajas**:
- Migración gradual sin interrumpir usuarios existentes
- Permite mantener usuarios locales durante transición
- Flexibilidad para elegir método de autenticación por usuario

### Opción 2: Completa (Solo B2C)

Todos los usuarios migran a B2C, sistema local se elimina.

**Ventajas**: Más simple, menos mantenimiento
**Desventajas**: Migración forzada de todos los usuarios

---

## 🔄 Flujo de Autenticación con B2C

### 1. Login con B2C

```typescript
// Frontend: src/services/b2c-auth.service.ts
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: process.env.VITE_AZURE_B2C_CLIENT_ID,
    authority: `https://${process.env.VITE_AZURE_B2C_TENANT}.b2clogin.com/${process.env.VITE_AZURE_B2C_TENANT}.onmicrosoft.com/${process.env.VITE_AZURE_B2C_SIGNUP_SIGNIN_POLICY}`,
    knownAuthorities: [`${process.env.VITE_AZURE_B2C_TENANT}.b2clogin.com`],
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

export async function loginWithB2C() {
  const loginRequest = {
    scopes: ['openid', 'profile', 'email'],
  };
  
  try {
    const response = await msalInstance.loginPopup(loginRequest);
    
    // Enviar token a backend para validar y obtener user profile
    const backendResponse = await ApiService.validateB2CToken(response.idToken);
    
    return backendResponse;
  } catch (error) {
    console.error('B2C login error:', error);
    throw error;
  }
}
```

### 2. Validación en Backend

```typescript
// Backend: src/middleware/b2c-authentication.ts
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: `https://${process.env.AZURE_B2C_TENANT}.b2clogin.com/${process.env.AZURE_B2C_TENANT}.onmicrosoft.com/${process.env.AZURE_B2C_SIGNUP_SIGNIN_POLICY}/discovery/v2.0/keys`,
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export async function validateB2CToken(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: process.env.AZURE_B2C_CLIENT_ID,
        issuer: `https://${process.env.AZURE_B2C_TENANT}.b2clogin.com/${process.env.AZURE_B2C_TENANT_ID}/v2.0/`,
      },
      (err, decoded: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      }
    );
  });
}
```

---

## 👥 Gestión de Roles y Usuarios

### Estrategia: Sincronización B2C ↔ Cosmos DB

Azure AD B2C maneja la **autenticación**, pero Cosmos DB mantiene el **perfil de usuario** y **roles**.

### Flujo de Creación de Usuarios

#### Opción A: Creación desde Admin Panel (Recomendada)

```
1. Admin crea usuario en Admin Panel
   ↓
2. Backend crea usuario en Cosmos DB con:
   - email
   - role (instructor, student, etc.)
   - tenantId
   - status: 'pending'
   ↓
3. Backend invita usuario a B2C (opcional)
   - Envía email con link de registro
   - Usuario completa registro en B2C
   ↓
4. Usuario se autentica con B2C
   ↓
5. Backend sincroniza:
   - B2C Object ID → Cosmos DB (azureB2CId)
   - Actualiza status: 'pending' → 'active'
```

**Código Backend**:

```typescript
// backend/src/functions/UserFunctions.ts

export async function createUserWithB2C(request: {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  invitedBy: string;
}): Promise<User> {
  // 1. Crear usuario en Cosmos DB
  const user = await createUser({
    ...request,
    status: 'pending',
    authMethod: 'b2c', // Nuevo campo
    azureB2CId: null, // Se llenará después del registro
  });

  // 2. Invitar a B2C (opcional - puede registrarse directamente)
  // Opción A: Enviar email con link de registro
  await sendB2CRegistrationEmail(user.email, user.id);
  
  // Opción B: Crear usuario directamente en B2C (requiere Graph API)
  // const b2cUser = await createB2CUser(user.email, user.firstName, user.lastName);
  // user.azureB2CId = b2cUser.id;
  // await updateUser(user.id, user.tenantId, { azureB2CId: b2cUser.id });

  return user;
}
```

#### Opción B: Self-Registration (Estudiantes)

```
1. Usuario se registra en B2C (User Flow de Sign Up)
   ↓
2. B2C redirige a nuestra app con token
   ↓
3. Backend valida token y busca usuario en Cosmos DB
   ↓
4a. Si existe: Actualiza azureB2CId y activa cuenta
4b. Si NO existe: Crea usuario con role='student'
   ↓
5. Usuario puede acceder a la app
```

**Código Backend**:

```typescript
// backend/src/server.ts

app.post('/api/auth/b2c/callback', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Validar token B2C
    const decoded = await validateB2CToken(idToken);
    
    const email = decoded.email || decoded.emails?.[0];
    const azureB2CId = decoded.sub; // Object ID de B2C
    
    // Buscar usuario en Cosmos DB
    let user = await getUserByEmail(email, req.body.tenantId);
    
    if (!user) {
      // Usuario nuevo: crear con role 'student' por defecto
      user = await createUser({
        email,
        firstName: decoded.given_name || '',
        lastName: decoded.family_name || '',
        role: 'student', // Default para self-registration
        tenantId: req.body.tenantId,
        authMethod: 'b2c',
        azureB2CId,
        status: 'active',
      });
    } else {
      // Usuario existente: actualizar azureB2CId
      if (!user.azureB2CId) {
        await updateUser(user.id, user.tenantId, {
          azureB2CId,
          authMethod: 'b2c',
          status: 'active',
        });
      }
    }
    
    // Generar JWT interno (para compatibilidad con sistema actual)
    const internalToken = generateInternalJWT(user);
    
    res.json({
      success: true,
      user: mapUserToResponse(user),
      token: internalToken,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid B2C token' });
  }
});
```

---

## 🎭 Manejo de Roles

### Estrategia: Roles en Cosmos DB + Claims en B2C (Opcional)

#### Opción 1: Roles Solo en Cosmos DB (Recomendada)

**Ventajas**:
- Control total sobre roles
- Fácil modificación sin cambiar B2C
- Compatible con sistema actual

**Implementación**:
```typescript
// El rol se mantiene en Cosmos DB
interface User {
  id: string;
  email: string;
  role: UserRole; // 'instructor', 'student', etc.
  tenantId: string;
  azureB2CId?: string; // Link a B2C
  authMethod: 'local' | 'b2c';
}
```

#### Opción 2: Roles como Custom Attributes en B2C

**Ventajas**:
- Roles en el token (menos queries a BD)
- Puede usarse para autorización en múltiples apps

**Desventajas**:
- Requiere Graph API para modificar
- Más complejo de mantener

**Implementación**:
```typescript
// 1. Crear Custom Attribute en B2C: "role"
// 2. Asignar role al crear/invitar usuario
// 3. Leer role del token en backend

const decoded = await validateB2CToken(idToken);
const role = decoded.extension_role; // Custom attribute
```

**Recomendación**: Usar Opción 1 (roles en Cosmos DB) para mantener simplicidad y compatibilidad.

---

## 📝 Creación de Usuarios por Rol

### Flujo Detallado

#### 1. Instructor (Requiere Aprobación)

```typescript
// Admin crea instructor
const instructor = await createUserWithB2C({
  email: 'instructor@example.com',
  firstName: 'Juan',
  lastName: 'Pérez',
  role: 'instructor',
  tenantId: 'tenant-kainet',
  invitedBy: adminUserId,
});

// Backend:
// 1. Crea en Cosmos DB con role='instructor', status='pending'
// 2. Envía email de invitación a B2C
// 3. Usuario se registra en B2C
// 4. Al autenticarse, backend actualiza azureB2CId
// 5. Admin debe aprobar instructor (workflow existente)
```

#### 2. Estudiante (Self-Registration)

```typescript
// Usuario se registra directamente en B2C
// Backend detecta usuario nuevo y crea automáticamente:

app.post('/api/auth/b2c/callback', async (req, res) => {
  const decoded = await validateB2CToken(req.body.idToken);
  const email = decoded.email;
  
  let user = await getUserByEmail(email, tenantId);
  
  if (!user) {
    // Auto-crear como estudiante
    user = await createUser({
      email,
      firstName: decoded.given_name,
      lastName: decoded.family_name,
      role: 'student', // Default
      tenantId,
      authMethod: 'b2c',
      azureB2CId: decoded.sub,
      status: 'active',
    });
  }
  
  // ... resto del flujo
});
```

#### 3. Admin/Content Manager (Solo por Super Admin)

```typescript
// Solo super-admin puede crear estos roles
const admin = await createUserWithB2C({
  email: 'admin@example.com',
  firstName: 'María',
  lastName: 'González',
  role: 'tenant-admin', // Requiere permisos especiales
  tenantId: 'tenant-kainet',
  invitedBy: superAdminUserId,
});

// Validación en backend:
if (request.role === 'super-admin' || request.role === 'tenant-admin') {
  if (req.user.role !== 'super-admin') {
    throw new Error('No tienes permisos para crear este rol');
  }
}
```

---

## 🔄 Migración Gradual

### Fase 1: Preparación (Semana 1)

1. **Configurar Azure AD B2C**
   - Crear tenant B2C
   - Configurar User Flows (Sign Up, Sign In, Password Reset)
   - Configurar Custom Attributes (opcional)
   - Configurar Social Identity Providers (Google, Microsoft)

2. **Actualizar Modelo de Datos**
   ```typescript
   interface User {
     // ... campos existentes
     authMethod?: 'local' | 'b2c';
     azureB2CId?: string; // Object ID de B2C
     password?: string; // Opcional si authMethod='b2c'
   }
   ```

3. **Instalar Dependencias**
   ```bash
   # Frontend
   npm install @azure/msal-browser @azure/msal-react
   
   # Backend
   npm install jsonwebtoken jwks-rsa @azure/identity
   ```

### Fase 2: Implementación Dual (Semana 2)

1. **Frontend: Agregar Login B2C**
   - Crear componente `B2CLoginButton`
   - Actualizar `TenantLoginPage` para mostrar ambas opciones
   - Implementar MSAL.js

2. **Backend: Endpoint de Validación B2C**
   - Crear `/api/auth/b2c/callback`
   - Implementar validación de tokens B2C
   - Sincronización con Cosmos DB

3. **Testing**
   - Probar login B2C
   - Probar creación de usuarios
   - Verificar sincronización de roles

### Fase 3: Migración de Usuarios (Semana 3)

1. **Script de Migración**
   ```typescript
   // backend/src/scripts/migrate-users-to-b2c.ts
   
   // Opción A: Invitar usuarios existentes a B2C
   // Opción B: Crear usuarios en B2C y actualizar Cosmos DB
   ```

2. **Comunicación a Usuarios**
   - Email explicando nuevo método de login
   - Instrucciones para migrar cuenta

3. **Soporte Dual**
   - Mantener login local para usuarios no migrados
   - Priorizar B2C para nuevos usuarios

### Fase 4: Deprecación (Opcional, Futuro)

- Deshabilitar registro local
- Forzar migración de usuarios restantes
- Eliminar código de autenticación local

---

## 🔐 Configuración de Azure AD B2C

### 1. Crear Tenant B2C

```bash
# Azure CLI
az ad b2c tenant create \
  --tenant-name accesslearn-b2c \
  --display-name "AccessLearn B2C" \
  --location "United States"
```

### 2. Registrar Aplicación

```json
{
  "name": "AccessLearn Frontend",
  "platform": "Single Page Application",
  "redirectUris": [
    "http://localhost:5173",
    "https://app.accesslearn.com"
  ],
  "implicitGrant": {
    "idToken": true
  }
}
```

### 3. Crear User Flows

**Sign Up and Sign In**:
- Nombre: `B2C_1_SignUpSignIn`
- Attributes: Email, Given Name, Surname
- Claims: Email, Display Name, Object ID

**Password Reset**:
- Nombre: `B2C_1_PasswordReset`
- Attributes: Email

### 4. Configurar Social Providers (Opcional)

- Google OAuth
- Microsoft Account
- Facebook (si se requiere)

---

## 📊 Comparación: Antes vs Después

| Aspecto | Sistema Actual | Con Azure AD B2C |
|---------|---------------|------------------|
| **Gestión de Contraseñas** | En Cosmos DB (hash) | Azure B2C |
| **MFA** | No implementado | ✅ Integrado |
| **Social Login** | No | ✅ Google, Microsoft, etc. |
| **Password Reset** | Manual | ✅ Self-service |
| **Seguridad** | Básica | ✅ Enterprise-grade |
| **Escalabilidad** | Manual | ✅ Automática |
| **Costo** | $0 | Gratis hasta 50K MAU |
| **Complejidad** | Baja | Media |

---

## 🚀 Plan de Implementación Detallado

### Semana 1: Setup y Configuración

**Día 1-2: Azure Setup**
- [ ] Crear tenant B2C
- [ ] Registrar aplicación frontend
- [ ] Crear User Flows
- [ ] Configurar redirect URIs
- [ ] Probar flujos en Azure Portal

**Día 3-4: Backend Setup**
- [ ] Instalar dependencias (`jwks-rsa`, `jsonwebtoken`)
- [ ] Crear middleware `validateB2CToken`
- [ ] Crear endpoint `/api/auth/b2c/callback`
- [ ] Actualizar modelo User (agregar `authMethod`, `azureB2CId`)
- [ ] Testing de validación de tokens

**Día 5: Frontend Setup**
- [ ] Instalar `@azure/msal-browser`
- [ ] Crear servicio `b2c-auth.service.ts`
- [ ] Crear componente `B2CLoginButton`
- [ ] Testing básico de login

### Semana 2: Integración

**Día 1-2: Frontend Completo**
- [ ] Integrar B2C login en `TenantLoginPage`
- [ ] Manejar callbacks de B2C
- [ ] Actualizar `AuthContext` para soportar B2C
- [ ] Testing de flujo completo

**Día 3-4: Backend Completo**
- [ ] Implementar sincronización B2C ↔ Cosmos DB
- [ ] Crear función `createUserWithB2C`
- [ ] Actualizar `createUser` para soportar ambos métodos
- [ ] Testing de creación de usuarios

**Día 5: Testing End-to-End**
- [ ] Probar registro de estudiante
- [ ] Probar creación de instructor por admin
- [ ] Verificar roles se mantienen correctamente
- [ ] Testing de edge cases

### Semana 3: Migración y Documentación

**Día 1-2: Scripts de Migración**
- [ ] Crear script para migrar usuarios existentes
- [ ] Testing de migración
- [ ] Documentar proceso

**Día 3-4: Documentación**
- [ ] Documentar configuración B2C
- [ ] Guía para admins
- [ ] Guía para desarrolladores
- [ ] Actualizar README

**Día 5: Deploy y Monitoreo**
- [ ] Deploy a staging
- [ ] Testing en staging
- [ ] Configurar monitoring
- [ ] Preparar rollback plan

---

## 💰 Costos

### Azure AD B2C Pricing (2024)

- **Gratis**: Primeros 50,000 MAU (Monthly Active Users)
- **Después**: $0.00325 por MAU adicional
- **Ejemplo**: 100,000 MAU = $162.50/mes

### Comparación con Sistema Actual

| Usuarios | Costo Actual | Costo B2C | Ahorro en Seguridad |
|----------|--------------|------------|---------------------|
| 10,000   | $0           | $0         | ✅ MFA, SSO, etc. |
| 50,000   | $0           | $0         | ✅ MFA, SSO, etc. |
| 100,000  | $0           | $162.50    | ✅ Enterprise security |

**ROI**: El costo se justifica por la seguridad y reducción de mantenimiento.

---

## ⚠️ Consideraciones Importantes

### 1. Multi-Tenancy

Azure AD B2C es **single-tenant** por defecto. Para multi-tenancy:

**Opción A**: Un tenant B2C compartido
- Todos los tenants usan el mismo B2C
- Separación por `tenantId` en Cosmos DB
- Más simple, menos costo

**Opción B**: Tenant B2C por organización (Enterprise)
- Cada tenant grande tiene su propio B2C
- Mayor aislamiento
- Más complejo, más costo

**Recomendación**: Opción A para la mayoría, Opción B solo para enterprise clients.

### 2. Custom Attributes

Si necesitas guardar datos adicionales en B2C (ej: CURP, RFC para cumplimiento mexicano):

```typescript
// Crear Custom Attribute en B2C: "extension_curp"
// Luego leerlo del token:
const curp = decoded.extension_curp;
```

**Recomendación**: Guardar datos de cumplimiento en Cosmos DB, no en B2C (más flexible).

### 3. Roles y Permisos

**Estrategia Recomendada**:
- Roles en Cosmos DB (como ahora)
- B2C solo para autenticación
- Backend valida permisos desde Cosmos DB

### 4. Migración de Usuarios Existentes

**Estrategia**:
1. Invitar usuarios a migrar (email)
2. Usuario se registra en B2C con mismo email
3. Backend sincroniza `azureB2CId`
4. Usuario puede usar B2C o local (durante transición)
5. Después de X meses, deshabilitar login local

---

## 📋 Checklist de Implementación

### Pre-requisitos
- [ ] Suscripción Azure activa
- [ ] Acceso a Azure Portal
- [ ] Entender flujos de autenticación actuales

### Configuración Azure
- [ ] Crear tenant B2C
- [ ] Registrar aplicación
- [ ] Crear User Flows
- [ ] Configurar redirect URIs
- [ ] Probar flujos manualmente

### Backend
- [ ] Instalar dependencias
- [ ] Crear middleware de validación B2C
- [ ] Crear endpoint callback
- [ ] Actualizar modelo User
- [ ] Implementar sincronización
- [ ] Testing

### Frontend
- [ ] Instalar MSAL.js
- [ ] Crear servicio B2C
- [ ] Integrar en login page
- [ ] Actualizar AuthContext
- [ ] Testing

### Migración
- [ ] Script de migración
- [ ] Comunicación a usuarios
- [ ] Testing de migración
- [ ] Plan de rollback

### Documentación
- [ ] Guía de configuración
- [ ] Guía para admins
- [ ] Guía para desarrolladores
- [ ] Actualizar README

---

## 🎯 Recomendación Final

**Implementar Azure AD B2C es altamente recomendable** por:

1. ✅ **Seguridad Enterprise**: MFA, protección contra ataques, cumplimiento
2. ✅ **Mejor UX**: Social login, self-service password reset
3. ✅ **Reducción de Carga**: Sin gestión de contraseñas
4. ✅ **Escalabilidad**: Automática
5. ✅ **Costo**: Gratis hasta 50K usuarios

**Complejidad**: Media (2-3 semanas) pero el ROI es alto.

**Estrategia**: Migración gradual, mantener ambos sistemas durante transición.

---

## 📚 Recursos

- [Azure AD B2C Documentation](https://docs.microsoft.com/azure/active-directory-b2c/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [B2C User Flows](https://docs.microsoft.com/azure/active-directory-b2c/user-flow-overview)
- [B2C Custom Policies](https://docs.microsoft.com/azure/active-directory-b2c/custom-policy-overview)

---

**¿Seguimos con la implementación?** Puedo empezar con la Fase 1 (Setup y Configuración) cuando lo indiques.

