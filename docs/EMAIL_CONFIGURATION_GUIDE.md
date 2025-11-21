# Guía de Configuración de Email con SendGrid y kainet.mx

## 📧 Servicio de Email Integrado

El sistema ahora envía emails automáticamente para:
- ✅ **Invitaciones de usuarios** - Cuando un admin invita a alguien
- ✅ **Bienvenida** - Cuando un usuario activa su cuenta
- ⏳ **Verificación de email** - Para auto-registro (próximamente)

---

## 🚀 Configuración de SendGrid con kainet.mx

### Paso 1: Crear Cuenta en SendGrid

1. Ve a [sendgrid.com/pricing](https://sendgrid.com/pricing)
2. Selecciona el plan **Free** (100 emails/día gratuitos)
3. Regístrate con tu email

### Paso 2: Obtener API Key

1. Login a SendGrid
2. Ve a **Settings** → **API Keys**
3. Click **Create API Key**
4. Nombre: `accesslearn-production`
5. Permisos: **Full Access** (o al menos **Mail Send**)
6. Click **Create & View**
7. **¡IMPORTANTE!** Copia la API Key (solo se muestra una vez)
8. Guárdala en `backend/.env`:
   ```bash
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Paso 3: Verificar Dominio kainet.mx

Para evitar que los emails lleguen a spam, debes verificar tu dominio.

#### Opción A: Single Sender (Rápido - Para Testing)

1. Ve a **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Completa el formulario:
   - **From Name:** AccessLearn Inclusiv
   - **From Email:** noreply@kainet.mx
   - **Reply To:** (tu email personal)
   - **Company:** AccessLearn / kainet.mx
   - **Address, City, State, etc.**
4. SendGrid enviará email de verificación a `noreply@kainet.mx`
5. Verifica el email

#### Opción B: Domain Authentication (Recomendado - Para Producción)

1. Ve a **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Selecciona tu DNS provider
4. Ingresa dominio: `kainet.mx`
5. SendGrid te dará 3 registros DNS tipo CNAME:

   ```
   Ejemplo de registros DNS:
   
   em4567.kainet.mx    CNAME    u12345678.wl123.sendgrid.net
   s1._domainkey.kainet.mx    CNAME    s1.domainkey.u12345678.wl123.sendgrid.net
   s2._domainkey.kainet.mx    CNAME    s2.domainkey.u12345678.wl123.sendgrid.net
   ```

6. **Agregar registros a tu DNS de kainet.mx:**
   - Si usas Cloudflare, GoDaddy, etc., agrégalos ahí
   - Puede tardar hasta 48 horas en propagar
   - Verifica en SendGrid que estén activos (✅ verde)

### Paso 4: Configurar Variables de Entorno

Edita `backend/.env`:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.tu-api-key-real-aqui
FROM_EMAIL=noreply@kainet.mx
FROM_NAME=AccessLearn Inclusiv

# Frontend URL para links en emails
FRONTEND_URL=https://app.kainet.mx  # O http://localhost:5173 para dev
```

### Paso 5: Probar el Envío

1. Inicia el backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Invita un usuario desde el admin panel
3. Revisa la consola del backend:
   ```
   ✅ Invitation email sent to usuario@example.com
   ```

4. Verifica que llegó el email (revisa spam si no llega)

---

## 🎨 Diseño de Emails

Los emails tienen diseño profesional con:
- ✅ Gradientes (morado para invitación, verde para verificación, naranja para bienvenida)
- ✅ Botones call-to-action
- ✅ Responsive (se ve bien en móvil)
- ✅ Branding: "Powered by kainet.mx"
- ✅ Links alternativos si el botón no funciona

### Vista previa de email de invitación:

```
┌─────────────────────────────────────┐
│   🎉 ¡Has sido invitado!            │ (Header morado)
├─────────────────────────────────────┤
│                                     │
│  Hola Juan Pérez,                   │
│                                     │
│  Dr. Amayrani Gómez te ha invitado  │
│  a unirte a Hospital Ejemplo.       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Rol: Estudiante             │   │
│  │ Organización: Hospital      │   │
│  └─────────────────────────────┘   │
│                                     │
│     [Activar mi cuenta] (botón)     │
│                                     │
│  ⏰ Esta invitación expira en 7     │
│     días.                           │
│                                     │
├─────────────────────────────────────┤
│  © 2024 AccessLearn Inclusiv        │
│  Powered by kainet.mx               │
└─────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### ❌ Emails no llegan

**1. Verifica API Key:**
```bash
# En backend/.env
echo $SENDGRID_API_KEY
# Debe empezar con SG.
```

**2. Verifica logs del backend:**
```bash
cd backend
npm run dev
# Deberías ver:
# ✅ Invitation email sent to ...
# O
# ⚠️ Failed to send invitation email: ...
```

**3. Revisa spam:**
- Los emails pueden llegar a spam si el dominio no está verificado
- Marca como "no es spam" en Gmail/Outlook

**4. Verifica dominio en SendGrid:**
- Settings → Sender Authentication
- Debe tener ✅ verde

**5. Revisa Activity Feed en SendGrid:**
- Ve a Activity → Activity Feed
- Verás todos los emails enviados y su estado
- Si aparece "Delivered" pero no llega, está en spam
- Si aparece "Bounced" o "Dropped", hay problema con el email receptor

### ⚠️ API Key inválida

Error:
```
Failed to send invitation email: Unauthorized
```

Solución:
- Verifica que el API Key esté correcto
- Verifica que tenga permisos de "Mail Send"
- Regenera el API Key en SendGrid si es necesario

### 📊 Límites del Plan Gratuito

SendGrid Free Plan:
- ✅ 100 emails/día
- ✅ Suficiente para testing y demo
- ❌ Límite bajo para producción con muchos usuarios

Para producción real:
- Upgrade a **Essentials** ($19.95/mes) = 50,000 emails/mes
- O considera Azure Communication Services (integrado con Azure)

---

## 💰 Costos

### SendGrid
- **Free:** $0/mes (100 emails/día)
- **Essentials:** $19.95/mes (50,000 emails/mes)
- **Pro:** $89.95/mes (100,000 emails/mes)

### Azure Communication Services (Alternativa)
- **Email:** $0.0001 por email (muy barato)
- **Ventaja:** Integrado con Azure, dominio propio fácil
- **Desventaja:** Configuración más compleja

---

## 📝 Next Steps

Una vez configurado SendGrid:

1. ✅ **Testing Local:**
   - Invita usuarios de prueba
   - Verifica que lleguen los emails
   - Prueba links de invitación

2. ✅ **Deploy a Azure:**
   - Configura las mismas variables en Azure
   - App Settings → Configuration
   - Agrega SENDGRID_API_KEY, FROM_EMAIL, etc.

3. ⏳ **Auto-registro:**
   - Implementar página de registro
   - Usar `emailService.sendVerificationEmail()`
   - Crear endpoint `/verify-email`

4. ⏳ **Password Reset (futuro):**
   - Botón "Olvidé mi contraseña"
   - Enviar email con token temporal
   - Usuario resetea password

---

## 🎯 URLs Configuradas

Para **app.kainet.mx**:

### Emails enviados contendrán links a:
- Invitación: `https://app.kainet.mx/accept-invitation?token=...`
- Login: `https://app.kainet.mx/login`
- Verificación: `https://app.kainet.mx/verify-email?token=...` (futuro)

### Configuración DNS sugerida:
```
Tipo    Nombre       Valor
A       app          [IP de Azure Static Web App]
A       api          [IP de Azure Functions/Container App]
CNAME   @            kainet.mx.azurewebsites.net
```

---

## ✅ Checklist de Configuración

- [ ] Crear cuenta SendGrid (Free)
- [ ] Obtener API Key
- [ ] Verificar Single Sender o Domain
- [ ] Agregar API Key a backend/.env
- [ ] Configurar FROM_EMAIL y FROM_NAME
- [ ] Configurar FRONTEND_URL
- [ ] Probar envío de invitación local
- [ ] Verificar email llegó correctamente
- [ ] Verificar links funcionan
- [ ] (Producción) Agregar variables a Azure App Settings
- [ ] (Producción) Configurar registros DNS CNAME

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del backend
2. Revisa Activity Feed en SendGrid
3. Verifica que el dominio esté verificado
4. Contacta soporte de SendGrid si es necesario

**SendGrid Support:**
- Docs: [docs.sendgrid.com](https://docs.sendgrid.com)
- Support: support@sendgrid.com
- Status: [status.sendgrid.com](https://status.sendgrid.com)
