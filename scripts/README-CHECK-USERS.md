# 🔍 Scripts para Verificar Usuarios de Labolamx

Scripts rápidos para verificar los usuarios del tenant "labolamx".

## Opción 1: Script HTML (⭐ Recomendado - Más fácil)

Abre el archivo `check-users.html` directamente en tu navegador.

### Ventajas:
- ✅ Interfaz visual amigable
- ✅ Carga automáticamente el token desde localStorage
- ✅ No requiere configuración adicional
- ✅ Muestra estadísticas y lista completa de usuarios

### Uso:
1. Abre la aplicación en tu navegador y autentícate
2. Abre `scripts/check-users.html` en la misma sesión del navegador
3. El script detectará automáticamente el token de autenticación
4. Haz clic en "Verificar Usuarios"

### O manualmente:
```bash
# Desde la terminal
open scripts/check-users.html

# O arrastra el archivo al navegador
```

---

## Opción 2: Script Node.js

Requiere Node.js 18+ (que incluye fetch nativo).

### Uso:
```bash
# Con token como variable de entorno
export AUTH_TOKEN="tu-token-aqui"
node scripts/check-labolamx-users.js

# O directamente (si el endpoint público funciona)
node scripts/check-labolamx-users.js
```

### Obtener el token:
Desde la consola del navegador (F12):
```javascript
localStorage.getItem('auth-token')
```

---

## Opción 3: Script Bash (Curl)

Script simple usando curl.

### Uso:
```bash
# Con token
export AUTH_TOKEN="tu-token-aqui"
./scripts/check-users-simple.sh

# O edita el script y agrega el token directamente
```

---

## 📊 Qué muestra el script

- ✅ Información del tenant (nombre, ID, slug)
- ✅ Total de usuarios
- ✅ Estadísticas por rol
- ✅ Estadísticas por status
- ✅ Lista completa de usuarios con:
  - Nombre completo
  - Email
  - ID
  - Rol
  - Status
  - XP y Nivel
  - Fecha de creación

## 🔧 Configuración

### Cambiar tenant
Edita el valor en el script:
- HTML: Campo "Tenant Slug"
- Node.js: Variable `TENANT_SLUG = 'labolamx'`
- Bash: Variable `TENANT_SLUG="labolamx"`

### Cambiar API URL
Por defecto usa: `https://api.kainet.mx/api`

Para cambiar:
- HTML: Campo "API URL"
- Node.js: Variable `API_BASE_URL` o env var `VITE_API_URL`
- Bash: Variable `API_URL` o env var `VITE_API_URL`

## ❌ Solución de problemas

### Error 401/403
- Necesitas un token de autenticación válido
- Obtén el token desde `localStorage.getItem('auth-token')` en la consola

### No se encuentran usuarios
- Verifica que el tenant slug sea correcto
- Verifica que tengas permisos para ver usuarios
- Verifica que realmente existan usuarios en el tenant

### Error de CORS
- El script HTML debe abrirse desde la misma sesión donde estás autenticado
- O usa los scripts Node.js/Bash que no tienen restricciones de CORS

## 📝 Ejemplo de salida

```
🔍 Verificando usuarios de LABOLAMX...
API URL: https://api.kainet.mx/api

📋 Obteniendo información del tenant "labolamx"...
✅ Tenant encontrado: Labolamx (ID: tenant-labolamx)

👥 Obteniendo usuarios del tenant...
✅ Encontrados 15 usuarios

📊 RESUMEN DE USUARIOS - LABOLAMX
================================================================================

🏢 Tenant: Labolamx
   ID: tenant-labolamx
   Slug: labolamx
   Email: admin@labolamx.mx

👥 Total de usuarios: 15

📈 Estadísticas por Rol:
   admin: 2
   instructor: 3
   student: 10

📈 Estadísticas por Status:
   active: 14
   inactive: 1

📋 Lista de Usuarios:
...
```

