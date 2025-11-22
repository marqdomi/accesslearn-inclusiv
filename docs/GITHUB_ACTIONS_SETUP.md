# 🔧 Configuración de GitHub Actions para CI/CD

**Fecha:** 2025-01-28  
**Proyecto:** AccessLearn Inclusiv

---

## 🎯 OBJETIVO

Configurar deploy automático desde GitHub a Azure Container Apps, similar a Vercel.

---

## 📋 PASOS DE CONFIGURACIÓN

### Paso 1: Crear Service Principal en Azure

**Ejecutar en Azure CLI:**

```bash
# Login a Azure
az login

# Seleccionar suscripción
az account set --subscription "6ab56dbc-0375-45aa-a673-c007f5bd2a2d"

# Crear Service Principal
az ad sp create-for-rbac \
  --name "github-actions-accesslearn" \
  --role contributor \
  --scopes /subscriptions/6ab56dbc-0375-45aa-a673-c007f5bd2a2d/resourceGroups/rg-accesslearn-prod \
  --sdk-auth
```

**Guardar la salida JSON** - la necesitarás en el siguiente paso.

---

### Paso 2: Obtener Credenciales de ACR

**Ejecutar:**

```bash
# Obtener nombre del ACR
ACR_NAME=$(az acr list \
  --resource-group rg-accesslearn-prod \
  --query "[0].name" -o tsv)

# Obtener credenciales
az acr credential show --name $ACR_NAME

# Guardar:
# - username
# - passwords[0].value
```

---

### Paso 3: Configurar Secrets en GitHub

**Ir a:** https://github.com/marqdomi/accesslearn-inclusiv/settings/secrets/actions

**Agregar los siguientes secrets:**

#### `AZURE_CREDENTIALS`
```
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "6ab56dbc-0375-45aa-a673-c007f5bd2a2d",
  "tenantId": "..."
}
```
*(Usar el JSON completo del Paso 1)*

#### `ACR_USERNAME`
```
(El username del ACR del Paso 2)
```

#### `ACR_PASSWORD`
```
(El password del ACR del Paso 2)
```

---

### Paso 4: Verificar Workflows

**Los workflows ya están creados en:**
- `.github/workflows/deploy-production.yml` - Deploy automático a producción
- `.github/workflows/test.yml` - Testing en PRs

---

### Paso 5: Hacer Push y Probar

**Hacer un cambio pequeño y push a main:**

```bash
git checkout main
echo "# Test CI/CD" >> README.md
git add README.md
git commit -m "test: Probar CI/CD automático"
git push origin main
```

**Verificar:**
1. Ir a: https://github.com/marqdomi/accesslearn-inclusiv/actions
2. Deberías ver el workflow ejecutándose
3. Verifica que todos los steps pasen

---

## ✅ VERIFICACIÓN

### Después del primer deploy exitoso:

1. **Verificar en Azure Portal:**
   - Container Apps → `ca-accesslearn-backend-prod`
   - Ver que la nueva revisión esté activa
   - Ver logs para confirmar que funciona

2. **Verificar en GitHub:**
   - Actions → Ver el workflow completado
   - Green check = ✅ Deploy exitoso
   - Red X = ❌ Algo falló (ver logs)

---

## 🔧 TROUBLESHOOTING

### Error: "Authentication failed"

**Solución:**
- Verificar que `AZURE_CREDENTIALS` esté correctamente configurado
- Verificar que el Service Principal tenga permisos

### Error: "ACR login failed"

**Solución:**
- Verificar `ACR_USERNAME` y `ACR_PASSWORD`
- Verificar que el ACR esté activo

### Error: "Container App not found"

**Solución:**
- Verificar nombres en el workflow (`.github/workflows/deploy-production.yml`)
- Verificar que los Container Apps existan en Azure

---

## 🎯 PRÓXIMOS PASOS

Después de que funcione el CI/CD básico:

1. ✅ Agregar testing antes de deploy
2. ✅ Agregar staging environment
3. ✅ Agregar rollback automático
4. ✅ Agregar notificaciones (Slack/Email)

---

**¿Necesitas ayuda con algún paso específico?**

