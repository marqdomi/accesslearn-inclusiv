# 🧪 Guía de Testing de Seguridad

**Fecha:** 2025-01-28  
**Versión:** 1.0

---

## 📋 Resumen

Esta guía describe cómo probar las mejoras de seguridad implementadas:
- JWT Authentication
- Rate Limiting
- Security Headers (Helmet.js)

---

## 🚀 Inicio Rápido

### 1. Asegúrate de que el servidor esté corriendo

```bash
cd backend
npm run server
```

El servidor debería estar corriendo en `http://localhost:7071`

### 2. Ejecuta todos los tests de seguridad

```bash
cd backend/scripts
./test-all-security.sh
```

O usando npm:

```bash
cd backend
npm run test:all-security
```

---

## 📦 Scripts de Testing Disponibles

### 1. Test Completo (Recomendado)

```bash
cd backend
npm run test:all-security
```

Ejecuta todos los tests en secuencia:
- ✅ JWT Authentication
- ✅ Rate Limiting
- ✅ Security Headers

### 2. Tests Individuales

#### Test JWT

```bash
cd backend
npm run test:jwt
```

O manualmente:

```bash
cd backend/scripts
./test-jwt-manual.sh
```

**Qué prueba:**
- ✅ Login y obtención de token JWT
- ✅ Validación de token
- ✅ Formato JWT (3 partes separadas por puntos)
- ✅ Rechazo de tokens inválidos
- ✅ Manejo de requests sin token

#### Test Rate Limiting

```bash
cd backend
npm run test:rate-limit
```

O manualmente:

```bash
cd backend/scripts
./test-rate-limiting.sh
```

**Qué prueba:**
- ✅ Rate limiting general (101 requests)
- ✅ Rate limiting en auth (6 intentos de login)
- ✅ Headers de rate limit

#### Test Security Headers

```bash
cd backend
npm run test:headers
```

O manualmente:

```bash
cd backend/scripts
./test-security-headers.sh
```

**Qué prueba:**
- ✅ Headers de seguridad requeridos (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- ✅ Headers opcionales (CSP, HSTS, etc.)

#### Test TypeScript (Completo)

```bash
cd backend
npm run test:security
```

Ejecuta un test suite completo en TypeScript que verifica todos los aspectos.

---

## 🔧 Configuración de Variables de Ambiente

Los scripts usan estas variables (opcionales):

```bash
export API_URL="http://localhost:7071"
export TEST_EMAIL="test@example.com"
export TEST_PASSWORD="test123"
export TEST_TENANT_ID="tenant-test"
```

Puedes configurarlas antes de ejecutar los tests:

```bash
export TEST_EMAIL="your-user@example.com"
export TEST_PASSWORD="your-password"
export TEST_TENANT_ID="your-tenant-id"
npm run test:all-security
```

---

## 📝 Testing Manual con cURL

### 1. Test Login y JWT

```bash
# Login
curl -X POST http://localhost:7071/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "tenantId": "tenant-test"
  }'

# Deberías recibir un token JWT
# Guarda el token para el siguiente paso
TOKEN="your-jwt-token-here"

# Validar token
curl -X GET http://localhost:7071/api/auth/validate \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Test Rate Limiting

```bash
# Hacer 101 requests rápidas
for i in {1..101}; do
  curl -s http://localhost:7071/api/health
  echo "Request $i"
done

# Deberías ver algunos requests devolver 429 (Too Many Requests)
```

### 3. Test Security Headers

```bash
# Ver headers
curl -I http://localhost:7071/api/health

# Deberías ver headers como:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

---

## ✅ Checklist de Testing

### JWT Authentication

- [ ] Login exitoso devuelve token JWT
- [ ] Token tiene formato correcto (3 partes)
- [ ] Token puede validarse correctamente
- [ ] Token expirado es rechazado
- [ ] Token inválido es rechazado
- [ ] Request sin token es manejado correctamente

### Rate Limiting

- [ ] Más de 100 requests en 15 minutos son bloqueadas
- [ ] Más de 5 intentos de login en 15 minutos son bloqueadas
- [ ] Headers de rate limit están presentes
- [ ] Mensajes de error son claros

### Security Headers

- [ ] X-Content-Type-Options está presente
- [ ] X-Frame-Options está presente
- [ ] X-XSS-Protection está presente
- [ ] Content-Security-Policy está presente (opcional)

---

## 🐛 Troubleshooting

### Error: "Server is not running"

**Solución:**
```bash
cd backend
npm run server
```

Asegúrate de que el servidor esté corriendo en el puerto correcto (por defecto: 7071).

### Error: "Token is not a valid JWT"

**Posibles causas:**
1. El servidor no está usando JWT (verifica que hayas hecho build)
2. Variables de ambiente incorrectas (JWT_SECRET)

**Solución:**
```bash
cd backend
npm run build
# Verifica que JWT_SECRET esté configurado en .env
```

### Error: "Rate limiting not working"

**Posibles causas:**
1. Estás en modo desarrollo (permite más requests)
2. Rate limiter no está configurado correctamente

**Solución:**
- Verifica que `NODE_ENV=production` esté configurado para pruebas estrictas
- Revisa la configuración en `server.ts`

### Error: "Security headers missing"

**Posibles causas:**
1. Helmet.js no está instalado
2. Helmet.js no está configurado en `server.ts`

**Solución:**
```bash
cd backend
npm install helmet
# Verifica que helmet esté configurado en server.ts
```

---

## 📊 Interpretación de Resultados

### JWT Tests

**✅ PASSED:** Todos los tests pasaron, JWT está funcionando correctamente

**❌ FAILED:** Revisa:
- Que el servidor esté usando el código actualizado
- Que JWT_SECRET esté configurado
- Que hayas hecho `npm run build`

### Rate Limiting Tests

**✅ PASSED:** Rate limiting está funcionando correctamente

**⚠️ WARNING (Development):** En desarrollo, rate limiting puede ser más permisivo. Esto es normal.

**❌ FAILED:** Verifica que `express-rate-limit` esté instalado y configurado

### Security Headers Tests

**✅ PASSED:** Todos los headers de seguridad están presentes

**❌ FAILED:** Verifica que `helmet` esté instalado y configurado en `server.ts`

---

## 🚀 Próximos Pasos

Después de completar el testing:

1. **Probar en producción:** Ejecuta los tests contra el servidor de producción
2. **Validar JWT_SECRET:** Asegúrate de usar un secret seguro en producción
3. **Configurar alertas:** Configura alertas para rate limiting excesivo
4. **Documentar:** Documenta los límites de rate limiting para usuarios

---

## 📚 Referencias

- [JWT Documentation](https://jwt.io/)
- [express-rate-limit Documentation](https://github.com/express-rate-limit/express-rate-limit)
- [Helmet.js Documentation](https://helmetjs.github.io/)

---

**Última actualización:** 2025-01-28

