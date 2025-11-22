# 🌐 Guía de Configuración DNS para AccessLearn

Esta guía te ayudará a configurar los dominios personalizados `app.kainet.mx` y `api.kainet.mx` para tu aplicación en Azure Container Apps.

## 📋 Requisitos Previos

- Dominio `kainet.mx` registrado en GoDaddy
- Acceso al panel de administración de GoDaddy
- Azure CLI instalado y autenticado
- Container Apps desplegados en Azure

## 🔧 Paso 1: Obtener IDs de Verificación de Dominio

Azure necesita verificar que eres el propietario del dominio. Para esto, necesitas obtener los IDs de verificación:

```bash
# Frontend
FRONTEND_VERIFICATION_ID=$(az containerapp show \
  --name ca-accesslearn-frontend-prod \
  --resource-group rg-accesslearn-prod \
  --query "properties.customDomainVerificationId" -o tsv)

echo "Frontend Verification ID: $FRONTEND_VERIFICATION_ID"

# Backend
BACKEND_VERIFICATION_ID=$(az containerapp show \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --query "properties.customDomainVerificationId" -o tsv)

echo "Backend Verification ID: $BACKEND_VERIFICATION_ID"
```

## 📝 Paso 2: Configurar DNS en GoDaddy

### 2.1. Acceder a GoDaddy

1. Inicia sesión en [GoDaddy](https://www.godaddy.com)
2. Ve a **Mis Productos** → **Dominios**
3. Haz clic en **Administrar DNS** para `kainet.mx`

### 2.2. Agregar Registros TXT para Verificación

Necesitas agregar **2 registros TXT** para la verificación de dominio:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| TXT | `asuid.app` | `[FRONTEND_VERIFICATION_ID]` | 600 (o 1 hora) |
| TXT | `asuid.api` | `[BACKEND_VERIFICATION_ID]` | 600 (o 1 hora) |

**Pasos en GoDaddy:**
1. En la sección **Registros**, haz clic en **Agregar**
2. Selecciona tipo **TXT**
3. Para el frontend:
   - **Nombre**: `asuid.app`
   - **Valor**: Pega el `FRONTEND_VERIFICATION_ID`
   - **TTL**: 600 segundos (o 1 hora)
4. Repite para el backend:
   - **Nombre**: `asuid.api`
   - **Valor**: Pega el `BACKEND_VERIFICATION_ID`
   - **TTL**: 600 segundos (o 1 hora)
5. Guarda los cambios

### 2.3. Agregar Registros CNAME

Después de la verificación, necesitas agregar los registros CNAME que apuntan a tus Container Apps:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| CNAME | `app` | `ca-accesslearn-frontend-prod.gentlerock-167c09dc.eastus.azurecontainerapps.io` | 600 |
| CNAME | `api` | `ca-accesslearn-backend-prod.gentlerock-167c09dc.eastus.azurecontainerapps.io` | 600 |

**Pasos en GoDaddy:**
1. Haz clic en **Agregar** en la sección Registros
2. Selecciona tipo **CNAME**
3. Para `app.kainet.mx`:
   - **Nombre**: `app`
   - **Valor**: `ca-accesslearn-frontend-prod.gentlerock-167c09dc.eastus.azurecontainerapps.io`
   - **TTL**: 600 segundos
4. Para `api.kainet.mx`:
   - **Nombre**: `api`
   - **Valor**: `ca-accesslearn-backend-prod.gentlerock-167c09dc.eastus.azurecontainerapps.io`
   - **TTL**: 600 segundos
5. Guarda los cambios

## ⏱️ Paso 3: Esperar Propagación DNS

Los cambios DNS pueden tardar entre **5 minutos y 48 horas** en propagarse. Normalmente toma 15-30 minutos.

Puedes verificar la propagación con:

```bash
# Verificar registros TXT
dig TXT asuid.app.kainet.mx
dig TXT asuid.api.kainet.mx

# Verificar registros CNAME
dig CNAME app.kainet.mx
dig CNAME api.kainet.mx
```

## ✅ Paso 4: Verificar Dominios en Azure

Una vez que los registros TXT estén propagados, puedes verificar los dominios:

```bash
# Verificar dominio del frontend
az containerapp hostname add \
  --hostname app.kainet.mx \
  --name ca-accesslearn-frontend-prod \
  --resource-group rg-accesslearn-prod

# Verificar dominio del backend
az containerapp hostname add \
  --hostname api.kainet.mx \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod
```

## 🔒 Paso 5: Configurar Certificado SSL

Azure Container Apps automáticamente provisiona certificados SSL gratuitos para dominios personalizados. El certificado se genera automáticamente después de agregar el hostname.

Puedes verificar el estado del certificado:

```bash
# Verificar estado del certificado del frontend
az containerapp hostname list \
  --name ca-accesslearn-frontend-prod \
  --resource-group rg-accesslearn-prod \
  --query "[?name=='app.kainet.mx']" -o json

# Verificar estado del certificado del backend
az containerapp hostname list \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --query "[?name=='api.kainet.mx']" -o json
```

## 🔄 Paso 6: Actualizar Configuración del Frontend

Una vez que `api.kainet.mx` esté configurado, necesitas actualizar la variable de entorno `VITE_API_URL` en el frontend para que apunte al nuevo dominio:

```bash
az containerapp update \
  --name ca-accesslearn-frontend-prod \
  --resource-group rg-accesslearn-prod \
  --set-env-vars "VITE_API_URL=https://api.kainet.mx"
```

Después de esto, necesitarás reiniciar el frontend para que el entrypoint script genere el nuevo `config.js`:

```bash
az containerapp revision restart \
  --name ca-accesslearn-frontend-prod \
  --resource-group rg-accesslearn-prod \
  --revision $(az containerapp revision list \
    --name ca-accesslearn-frontend-prod \
    --resource-group rg-accesslearn-prod \
    --query "[?properties.active].name" -o tsv)
```

## 🧪 Paso 7: Probar los Dominios

Una vez configurado todo, prueba los dominios:

```bash
# Probar frontend
curl -I https://app.kainet.mx

# Probar backend
curl https://api.kainet.mx/api/health
curl https://api.kainet.mx/api/tenants
```

## 📊 Verificar Configuración Completa

```bash
# Ver hostnames del frontend
az containerapp hostname list \
  --name ca-accesslearn-frontend-prod \
  --resource-group rg-accesslearn-prod

# Ver hostnames del backend
az containerapp hostname list \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod
```

## 🐛 Solución de Problemas

### El dominio no se verifica

1. Verifica que los registros TXT estén correctos:
   ```bash
   dig TXT asuid.app.kainet.mx
   dig TXT asuid.api.kainet.mx
   ```

2. Asegúrate de que el nombre del registro sea exactamente `asuid.app` y `asuid.api` (sin el dominio completo)

3. Espera más tiempo para la propagación DNS (puede tardar hasta 48 horas)

### El certificado SSL no se genera

1. Verifica que el CNAME esté correcto:
   ```bash
   dig CNAME app.kainet.mx
   dig CNAME api.kainet.mx
   ```

2. Espera hasta 24 horas para que Azure genere el certificado automáticamente

3. Verifica que el dominio esté correctamente agregado:
   ```bash
   az containerapp hostname list --name ca-accesslearn-frontend-prod --resource-group rg-accesslearn-prod
   ```

### Error 404 después de configurar

1. Verifica que los CNAME apunten a los FQDN correctos de Azure
2. Espera la propagación completa de DNS
3. Limpia la caché del navegador

## 📚 Referencias

- [Azure Container Apps Custom Domains](https://learn.microsoft.com/en-us/azure/container-apps/custom-domains-certificates)
- [GoDaddy DNS Management](https://www.godaddy.com/help/manage-dns-records-680)

