# 🚀 Estrategia CI/CD para Azure Container Apps

**Fecha:** 2025-01-28  
**Proyecto:** AccessLearn Inclusiv  
**Infraestructura:** Azure Container Apps

---

## 🎯 OBJETIVO

Implementar CI/CD automatizado similar a Vercel, donde:
- ✅ Push a `main` → Deploy automático a producción
- ✅ Pull Request → Deploy a staging para testing
- ✅ Build, test y deploy automáticos
- ✅ Rollback fácil en caso de errores

---

## 📊 OPCIONES DISPONIBLES EN AZURE

### Opción 1: GitHub Actions (Recomendado) ⭐

**Similar a Vercel**, pero más control y flexibilidad.

**Ventajas:**
- ✅ Gratis para repos públicos
- ✅ Totalmente configurable
- ✅ Integración nativa con GitHub
- ✅ Workflows complejos y paralelos
- ✅ Testing antes de deploy
- ✅ Notificaciones y rollback automático

**Desventajas:**
- ⚠️ Requiere configuración inicial
- ⚠️ Puede ser complejo para principiantes

---

### Opción 2: Azure DevOps Pipelines

**Ventajas:**
- ✅ Integración profunda con Azure
- ✅ UI muy completa
- ✅ Excelente para equipos grandes

**Desventajas:**
- ⚠️ Más complejo que GitHub Actions
- ⚠️ Requiere Azure DevOps setup

---

### Opción 3: Container Apps Native Integration

**Ventajas:**
- ✅ Más simple que GitHub Actions
- ✅ Integración directa con Container Apps

**Desventajas:**
- ⚠️ Menos control que GitHub Actions
- ⚠️ Menos opciones de customización

---

## 🏆 RECOMENDACIÓN: GitHub Actions

Para este proyecto, **recomiendo GitHub Actions** porque:

1. ✅ Ya usas GitHub (tu repo está ahí)
2. ✅ Similar a Vercel (workflows automáticos)
3. ✅ Gratis para repos públicos/privados (con límites generosos)
4. ✅ Totalmente configurable
5. ✅ Mejores prácticas de la industria

---

## 🏗️ ARQUITECTURA RECOMENDADA

### Branches y Environments

```
main (production)
  ↓
  Auto-deploy → Azure Container Apps (Production)
  
develop/staging (staging)
  ↓
  Auto-deploy → Azure Container Apps (Staging)
  
feature/* (PR)
  ↓
  Build + Test → No deploy automático
  (Solo testing)
```

### Workflow de Deploy

```
1. Push a main
   ↓
2. GitHub Actions detecta el push
   ↓
3. Ejecuta tests (unit, security, functionality)
   ↓
4. Build Docker images (backend + frontend)
   ↓
5. Push images a Azure Container Registry (ACR)
   ↓
6. Update Azure Container Apps
   ↓
7. Health check + smoke tests
   ↓
8. Notificaciones (Slack, email, etc.)
```

---

## 📋 IMPLEMENTACIÓN PASO A PASO

### Paso 1: Configurar GitHub Actions

**Crear:** `.github/workflows/deploy-production.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main
  workflow_dispatch: # Permite deploy manual

env:
  AZURE_WEBAPP_NAME_BACKEND: ca-accesslearn-backend-prod
  AZURE_WEBAPP_NAME_FRONTEND: ca-accesslearn-frontend-prod
  RESOURCE_GROUP: rg-accesslearn-prod
  REGISTRY_NAME: acr-accesslearn-prod

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    # Backend
    - name: Build and push backend
      run: |
        docker build -t ${{ env.REGISTRY_NAME }}.azurecr.io/backend:${{ github.sha }} ./backend
        docker push ${{ env.REGISTRY_NAME }}.azurecr.io/backend:${{ github.sha }}
    
    # Frontend
    - name: Build and push frontend
      run: |
        docker build -t ${{ env.REGISTRY_NAME }}.azurecr.io/frontend:${{ github.sha }} ./frontend
        docker push ${{ env.REGISTRY_NAME }}.azurecr.io/frontend:${{ github.sha }}
    
    # Deploy to Azure
    - name: Deploy to Azure Container Apps
      uses: azure/container-apps-deploy-action@v1
      with:
        acrName: ${{ env.REGISTRY_NAME }}
        containerAppName: ${{ env.AZURE_WEBAPP_NAME_BACKEND }}
        resourceGroup: ${{ env.RESOURCE_GROUP }}
        imageToDeploy: ${{ env.REGISTRY_NAME }}.azurecr.io/backend:${{ github.sha }}
```

---

### Paso 2: Configurar Secrets en GitHub

**Ir a:** GitHub → Settings → Secrets and variables → Actions

**Agregar secrets:**
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_TENANT_ID`
- `ACR_USERNAME`
- `ACR_PASSWORD`

---

### Paso 3: Configurar Service Principal en Azure

**Crear Service Principal para GitHub Actions:**

```bash
az ad sp create-for-rbac \
  --name "github-actions-accesslearn" \
  --role contributor \
  --scopes /subscriptions/{SUBSCRIPTION_ID}/resourceGroups/rg-accesslearn-prod
```

---

## 🎯 ESTRATEGIA RECOMENDADA PARA ESTE PROYECTO

### Fase 1: CI/CD Básico (Inmediato)

**Objetivo:** Deploy automático desde `main` a producción

**Implementación:**
1. ✅ GitHub Actions workflow básico
2. ✅ Build + Push a ACR
3. ✅ Deploy a Container Apps
4. ✅ Health checks básicos

**Tiempo estimado:** 2-3 horas

---

### Fase 2: CI/CD Avanzado (Próxima semana)

**Objetivo:** Testing, staging, y mejores prácticas

**Implementación:**
1. ✅ Testing antes de deploy
2. ✅ Staging environment
3. ✅ Rollback automático
4. ✅ Notificaciones
5. ✅ Preview deployments para PRs

**Tiempo estimado:** 4-6 horas

---

### Fase 3: CI/CD Enterprise (Futuro)

**Objetivo:** Optimización y monitoreo

**Implementación:**
1. ✅ Blue-green deployments
2. ✅ Canary releases
3. ✅ Performance testing automático
4. ✅ Security scanning
5. ✅ Compliance checks

---

## 🔧 IMPLEMENTACIÓN RÁPIDA

### Opción A: Manual Script (Actual)

**Estado actual:**
- ✅ Script `deploy.sh` funcional
- ✅ Deploy manual cuando sea necesario
- ⚠️ Requiere ejecución manual

**Mejoras rápidas:**
- Agregar GitHub Actions que ejecute `deploy.sh`
- Mantener el script pero automatizarlo

---

### Opción B: GitHub Actions Completo (Recomendado)

**Ventajas:**
- ✅ Totalmente automatizado
- ✅ Testing antes de deploy
- ✅ Rollback automático
- ✅ Historial completo

---

## 📚 RECURSOS Y MEJORES PRÁCTICAS

### Mejores Prácticas

1. **✅ Branch Protection Rules**
   - Requerir PR antes de merge a main
   - Requerir aprobación de code review
   - Requerir que tests pasen

2. **✅ Environment Secrets**
   - Secrets separados por environment (staging/prod)
   - No hardcodear secrets en código

3. **✅ Semantic Versioning**
   - Tags para releases: `v1.0.0`, `v1.1.0`, etc.
   - Deploy solo de tags versionados

4. **✅ Health Checks**
   - Verificar que la app esté funcionando después de deploy
   - Rollback automático si health check falla

5. **✅ Notificaciones**
   - Slack/Email cuando deploy falla
   - Dashboard de deploy status

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

### 1. Crear GitHub Actions Workflow Básico

**Archivo:** `.github/workflows/deploy-production.yml`

**Funcionalidad:**
- Detecta push a `main`
- Build Docker images
- Push a ACR
- Deploy a Container Apps
- Health check básico

### 2. Configurar Secrets en GitHub

**Secrets necesarios:**
- Azure credentials (Service Principal)
- ACR credentials
- Application Insights connection string

### 3. Configurar Branch Protection

**GitHub Settings:**
- Requerir PR antes de merge
- Requerir que GitHub Actions pasen
- Requerir code review

---

## 💡 RECOMENDACIÓN FINAL

Para este proyecto específico, recomiendo:

1. **Corto plazo (Hoy):**
   - ✅ Crear GitHub Actions workflow básico
   - ✅ Automatizar deploy desde `main` a producción
   - ✅ Mantener el script manual como backup

2. **Mediano plazo (Esta semana):**
   - ✅ Agregar staging environment
   - ✅ Testing antes de deploy
   - ✅ Health checks y rollback

3. **Largo plazo (Próximo mes):**
   - ✅ Preview deployments para PRs
   - ✅ Performance testing
   - ✅ Security scanning

---

## 🎯 ¿QUIERES QUE IMPLEMENTE EL CI/CD AHORA?

Puedo crear:
1. ✅ GitHub Actions workflow completo
2. ✅ Configuración de secrets
3. ✅ Scripts de testing y health checks
4. ✅ Documentación paso a paso

**¿Te parece bien empezar con la implementación básica ahora?**

