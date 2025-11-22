# 🔍 Verificar Versión en Producción

**Fecha:** 2025-01-28  
**Propósito:** Asegurar que la última versión del código esté desplegada en producción

---

## 🎯 MÉTODOS DE VERIFICACIÓN

### Método 1: Script Automatizado (Recomendado)

```bash
./scripts/check-production-version.sh
```

Este script muestra:
- ✅ Último commit en GitHub
- ✅ Información de revisiones activas en Azure
- ✅ Fechas de creación de revisiones
- ✅ URLs de producción

---

### Método 2: Verificar en GitHub Actions

**URL:** https://github.com/marqdomi/accesslearn-inclusiv/actions

**Pasos:**
1. Abre la página de Actions
2. Busca el workflow "Deploy to Production" más reciente
3. Verifica que tenga un ✅ (check verde)
4. Haz clic para ver los detalles del deploy
5. Verifica que ambos jobs (backend y frontend) hayan completado exitosamente

---

### Método 3: Verificar en Azure Portal

**URL:** https://portal.azure.com

**Pasos para Backend:**
1. Navega a: **Container Apps** → `ca-accesslearn-backend-prod`
2. Ve a la sección **Revision management**
3. Verifica la revisión activa más reciente
4. Revisa la fecha de creación (debe ser reciente)
5. Verifica que tenga **100%** de tráfico

**Pasos para Frontend:**
1. Navega a: **Container Apps** → `ca-accesslearn-frontend-prod`
2. Ve a la sección **Revision management**
3. Verifica la revisión activa más reciente
4. Revisa la fecha de creación (debe ser reciente)
5. Verifica que tenga **100%** de tráfico

---

### Método 4: Verificar Health Endpoint

**Backend:**
```bash
curl https://api.kainet.mx/api/health
```

**Esperado:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": "..."
}
```

Si el endpoint responde correctamente, el backend está funcionando.

---

### Método 5: Verificar en Producción (Frontend)

**URL:** https://app.kainet.mx

**Verificaciones:**
1. La página carga correctamente
2. No hay errores en la consola del navegador (F12)
3. Las funcionalidades recientes están disponibles
4. El footer o header muestra información de versión (si está configurado)

---

## 🔄 COMPARAR VERSIONES

### Comparar Último Commit con Último Deploy

**1. Obtener último commit en GitHub:**
```bash
git log -1 --format="%H - %s - %cd"
```

**2. Obtener última revisión en Azure (Backend):**
```bash
az containerapp revision list \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --query "[0].properties.createdTime" \
  -o tsv
```

**3. Comparar fechas:**
- Si la fecha de Azure es **posterior** a la del commit → ✅ Está actualizado
- Si la fecha de Azure es **anterior** a la del commit → ⚠️ Necesita deploy

---

## 🚨 SI LA VERSIÓN NO ESTÁ ACTUALIZADA

### Opción 1: Forzar Deploy Manual

```bash
# Hacer un cambio pequeño
echo "" >> README.md
git add README.md
git commit -m "chore: Forzar deploy"
git push origin main
```

Esto disparará el workflow de GitHub Actions automáticamente.

### Opción 2: Verificar Workflow de GitHub Actions

1. Ve a: https://github.com/marqdomi/accesslearn-inclusiv/actions
2. Busca el workflow más reciente
3. Si falló (❌), revisa los logs para identificar el error
4. Si no se ejecutó, verifica que el push haya sido a la rama `main`

### Opción 3: Deploy Manual desde Azure CLI

```bash
# Backend
az containerapp update \
  --name ca-accesslearn-backend-prod \
  --resource-group rg-accesslearn-prod \
  --image <ACR_NAME>.azurecr.io/accesslearn-backend:latest

# Frontend
az containerapp update \
  --name ca-accesslearn-frontend-prod \
  --resource-group rg-accesslearn-prod \
  --image <ACR_NAME>.azurecr.io/accesslearn-frontend:latest
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Último commit en GitHub está en la rama `main`
- [ ] Workflow de GitHub Actions se ejecutó exitosamente (✅)
- [ ] Revisión activa en Azure fue creada después del último commit
- [ ] Health endpoint responde correctamente
- [ ] Frontend carga correctamente en https://app.kainet.mx
- [ ] Funcionalidades recientes están disponibles en producción

---

## 📊 VERIFICACIÓN PERIÓDICA

**Recomendado:**
- Verificar después de cada deploy importante
- Verificar semanalmente para confirmar que todo está actualizado
- Usar el script `check-production-version.sh` para verificación rápida

---

## 🔗 LINKS ÚTILES

- **GitHub Actions:** https://github.com/marqdomi/accesslearn-inclusiv/actions
- **Azure Portal:** https://portal.azure.com
- **Frontend Producción:** https://app.kainet.mx
- **Backend Producción:** https://api.kainet.mx
- **Health Endpoint:** https://api.kainet.mx/api/health

---

**¿Necesitas ayuda con la verificación?**
