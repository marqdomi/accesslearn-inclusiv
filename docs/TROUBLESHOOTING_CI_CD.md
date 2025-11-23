# 🔧 Troubleshooting CI/CD - GitHub Actions

**Fecha:** 2025-01-28  
**Proyecto:** AccessLearn Inclusiv

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Error 1: "Resource not found" o "Container App not found"

**Síntomas:**
- Error en el step "Deploy to Container Apps"
- Mensaje: "Resource 'ca-accesslearn-backend-prod' not found"

**Solución:**
1. Verificar que los Container Apps existan:
   ```bash
   az containerapp list --resource-group rg-accesslearn-prod
   ```
2. Verificar nombres en el workflow:
   - `.github/workflows/deploy-production.yml`
   - Línea 15-16: `AZURE_WEBAPP_NAME_BACKEND` y `AZURE_WEBAPP_NAME_FRONTEND`
3. Asegurar que los nombres coincidan exactamente

---

### Error 2: "Authentication failed" o "Invalid credentials"

**Síntomas:**
- Error en el step "Azure Login"
- Mensaje: "Authentication failed" o "Invalid service principal"

**Solución:**
1. Verificar que `AZURE_CREDENTIALS` esté configurado en GitHub Secrets
2. Verificar que el JSON sea válido (sin espacios extra, comillas correctas)
3. Recrear Service Principal si es necesario:
   ```bash
   ./scripts/setup-github-actions.sh
   ```

---

### Error 3: "ACR login failed"

**Síntomas:**
- Error en el step "Login to Azure Container Registry"
- Mensaje: "Failed to authenticate with ACR"

**Solución:**
1. Verificar que `ACR_USERNAME` y `ACR_PASSWORD` estén configurados en GitHub Secrets
2. Obtener credenciales actualizadas:
   ```bash
   ACR_NAME=$(az acr list --resource-group rg-accesslearn-prod --query "[0].name" -o tsv)
   az acr credential show --name $ACR_NAME
   ```
3. Actualizar los secrets en GitHub con las credenciales correctas

---

### Error 4: "Docker build failed"

**Síntomas:**
- Error en el step "Build and Push Docker Image"
- Mensaje de error relacionado con Dockerfile

**Solución:**
1. Verificar que los Dockerfiles existan y sean válidos:
   - `backend/Dockerfile`
   - `Dockerfile` (frontend)
2. Probar build localmente:
   ```bash
   # Backend
   docker build -t test-backend ./backend
   
   # Frontend
   docker build -t test-frontend .
   ```
3. Revisar errores de sintaxis en los Dockerfiles

---

### Error 5: "Permission denied" o "Insufficient permissions"

**Síntomas:**
- Error en cualquier step que interactúa con Azure
- Mensaje: "Permission denied" o "Insufficient permissions"

**Solución:**
1. Verificar que el Service Principal tenga el rol `contributor`:
   ```bash
   az role assignment list \
     --assignee <service-principal-client-id> \
     --scope /subscriptions/<subscription-id>/resourceGroups/rg-accesslearn-prod
   ```
2. Asignar permisos si es necesario:
   ```bash
   az role assignment create \
     --role contributor \
     --assignee <service-principal-client-id> \
     --scope /subscriptions/<subscription-id>/resourceGroups/rg-accesslearn-prod
   ```

---

### Error 6: "Workflow file syntax error"

**Síntomas:**
- Error inmediato al ejecutar el workflow
- Mensaje de sintaxis YAML

**Solución:**
1. Validar sintaxis YAML:
   ```bash
   # Usar un validador YAML online o:
   python -c "import yaml; yaml.safe_load(open('.github/workflows/deploy-production.yml'))"
   ```
2. Revisar indentación (debe ser con espacios, no tabs)
3. Verificar que todas las comillas estén cerradas

---

## 🔍 CÓMO DIAGNOSTICAR ERRORES

### Paso 1: Ver Logs del Workflow

1. Ve a: https://github.com/marqdomi/accesslearn-inclusiv/actions
2. Haz clic en el workflow fallido
3. Haz clic en el job que falló (backend o frontend)
4. Desplázate hacia abajo hasta encontrar el error

### Paso 2: Identificar el Step que Falló

Cada step tiene un nombre:
- `Azure Login` → Problema de autenticación
- `Build and Push` → Problema con Docker
- `Deploy to Container Apps` → Problema con deploy
- `Login to Azure Container Registry` → Problema con ACR

### Paso 3: Leer el Mensaje de Error

Busca líneas que contengan:
- `Error:`
- `Failed:`
- `❌`
- `ERROR`

Copia el mensaje completo para diagnosticar.

---

## ✅ VERIFICACIÓN PRE-DEPLOY

Antes de hacer push, verifica:

1. **Recursos en Azure existen:**
   ```bash
   ./scripts/check-production-version.sh
   ```

2. **Secrets configurados en GitHub:**
   - https://github.com/marqdomi/accesslearn-inclusiv/settings/secrets/actions
   - Verificar que existan: `AZURE_CREDENTIALS`, `ACR_USERNAME`, `ACR_PASSWORD`

3. **Workflow file es válido:**
   ```bash
   cat .github/workflows/deploy-production.yml | head -20
   ```

---

## 🆘 OBTENER AYUDA

Si no puedes resolver el error:

1. **Copia el error completo** del workflow
2. **Identifica el step que falló**
3. **Comparte ambos** para diagnóstico detallado

---

## 📚 REFERENCIAS

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Azure Container Apps Docs:** https://learn.microsoft.com/en-us/azure/container-apps/
- **Azure CLI Docs:** https://learn.microsoft.com/en-us/cli/azure/

---

**¿Necesitas ayuda con un error específico? Comparte el mensaje de error completo.**

