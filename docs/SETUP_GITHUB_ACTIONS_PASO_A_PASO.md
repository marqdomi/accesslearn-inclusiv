# 🔧 Guía Paso a Paso: Configurar GitHub Actions

**Fecha:** 2025-01-28  
**Proyecto:** AccessLearn Inclusiv

---

## ✅ PASO 1: Service Principal CREADO

El Service Principal ya fue creado exitosamente en Azure.

---

## 📋 PASO 2: Configurar Secrets en GitHub

**Ve a:** https://github.com/marqdomi/accesslearn-inclusiv/settings/secrets/actions

**Haz clic en:** "New repository secret"

### Secret 1: `AZURE_CREDENTIALS`

1. **Name:** `AZURE_CREDENTIALS`
2. **Secret:** (Pega el JSON completo que se mostró arriba)
   ```json
   {
     "clientId": "YOUR_CLIENT_ID",
     "clientSecret": "YOUR_CLIENT_SECRET",
     "subscriptionId": "YOUR_SUBSCRIPTION_ID",
     "tenantId": "YOUR_TENANT_ID",
     "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
     "resourceManagerEndpointUrl": "https://management.azure.com/",
     "activeDirectoryGraphResourceId": "https://graph.windows.net/",
     "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
     "galleryEndpointUrl": "https://gallery.azure.com/",
     "managementEndpointUrl": "https://management.core.windows.net/"
   }
   ```
   
   **Nota:** Ejecuta `./scripts/setup-github-actions.sh` para obtener el JSON completo con tus credenciales reales.
3. **Haz clic en:** "Add secret"

### Secret 2: `ACR_USERNAME`

1. **Name:** `ACR_USERNAME`
2. **Secret:** (Ejecuta `./scripts/setup-github-actions.sh` para obtener el username del ACR)
3. **Haz clic en:** "Add secret"

### Secret 3: `ACR_PASSWORD`

1. **Name:** `ACR_PASSWORD`
2. **Secret:** (Ejecuta `./scripts/setup-github-actions.sh` para obtener el password del ACR)
3. **Haz clic en:** "Add secret"

---

## ✅ PASO 3: Verificar Workflows

Los workflows ya están configurados en:
- `.github/workflows/deploy-production.yml` ✅
- `.github/workflows/test.yml` ✅

---

## 🚀 PASO 4: Probar CI/CD

**Hacer un cambio pequeño y push a main:**

```bash
git checkout main
git pull origin main  # Asegúrate de estar actualizado

# Hacer un cambio pequeño
echo "" >> README.md
echo "## CI/CD Automático" >> README.md
echo "Deploy automático desde GitHub Actions" >> README.md

git add README.md
git commit -m "test: Probar CI/CD automático con GitHub Actions"
git push origin main
```

---

## 📊 PASO 5: Verificar en GitHub Actions

**Ir a:** https://github.com/marqdomi/accesslearn-inclusiv/actions

**Deberías ver:**
1. ✅ Workflow "Deploy to Production" ejecutándose
2. ✅ Jobs "build-and-deploy-backend" y "build-and-deploy-frontend"
3. ✅ Todos los steps pasando (green check)

**Si todo funciona:**
- ✅ Verás "✅ Deploy to Production" con check verde
- ✅ Tu aplicación estará actualizada en producción

**Si algo falla:**
- ❌ Verás "❌ Deploy to Production" con X roja
- 📝 Haz clic en el workflow para ver los logs
- 🔍 Revisa qué paso falló

---

## ✅ VERIFICACIÓN FINAL

**Después de que el workflow pase:**

1. **Verificar en Azure Portal:**
   - Container Apps → `ca-accesslearn-backend-prod`
   - Ver que la nueva revisión esté activa
   - Ver logs para confirmar que funciona

2. **Verificar aplicación web:**
   - Ir a: https://app.kainet.mx
   - Verificar que funcione correctamente
   - Verificar que los cambios estén aplicados

---

## 🎯 RESUMEN

**Secrets a configurar en GitHub:**
1. ✅ `AZURE_CREDENTIALS` (JSON completo del Service Principal - obtener con `./scripts/setup-github-actions.sh`)
2. ✅ `ACR_USERNAME` (Username del ACR - obtener con `./scripts/setup-github-actions.sh`)
3. ✅ `ACR_PASSWORD` (Password del ACR - obtener con `./scripts/setup-github-actions.sh`)

**URLs importantes:**
- GitHub Secrets: https://github.com/marqdomi/accesslearn-inclusiv/settings/secrets/actions
- GitHub Actions: https://github.com/marqdomi/accesslearn-inclusiv/actions
- Azure Portal: https://portal.azure.com

---

## 🆘 TROUBLESHOOTING

### Error: "Authentication failed"
- Verificar que `AZURE_CREDENTIALS` tenga el JSON completo
- Verificar que no haya espacios extra o caracteres especiales

### Error: "ACR login failed"
- Verificar que `ACR_USERNAME` y `ACR_PASSWORD` sean correctos
- Verificar que el ACR esté activo en Azure

### Error: "Container App not found"
- Verificar nombres en `.github/workflows/deploy-production.yml`
- Verificar que los Container Apps existan en Azure

---

**¿Necesitas ayuda con algún paso específico?**

