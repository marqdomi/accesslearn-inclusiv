# 💰 Guía de Optimización de Costos en Azure

**Última actualización:** Enero 2025

---

## 📋 Tabla de Contenidos

1. [Auditoría de Recursos](#auditoría-de-recursos)
2. [Servicios Gratuitos de Azure](#servicios-gratuitos-de-azure)
3. [Optimizaciones Específicas](#optimizaciones-específicas)
4. [Programa Azure for Startups](#programa-azure-for-startups)
5. [Recomendaciones por Servicio](#recomendaciones-por-servicio)
6. [Scripts de Automatización](#scripts-de-automatización)

---

## 🔍 Auditoría de Recursos

### Paso 1: Autenticarse en Azure

```bash
# Ejecutar script de login
./scripts/azure-login.sh
```

Este script te ayudará a:
- Verificar que Azure CLI esté instalado
- Iniciar sesión en Azure
- Seleccionar la suscripción correcta

### Paso 2: Ejecutar Auditoría

```bash
# Revisar recursos y costos
./scripts/azure-audit.sh
```

Este script mostrará:
- Todos los grupos de recursos
- Recursos por grupo
- Costos de los últimos 7 días
- Recursos potencialmente inactivos
- Recomendaciones de Azure Advisor

### Paso 3: Limpiar Recursos No Utilizados

```bash
# Modo dry-run (solo muestra qué se eliminaría)
./scripts/azure-cleanup.sh --dry-run

# Eliminar recursos (con confirmación)
./scripts/azure-cleanup.sh

# Eliminar sin confirmación (¡CUIDADO!)
./scripts/azure-cleanup.sh --force
```

---

## 🎁 Servicios Gratuitos de Azure

Azure ofrece **más de 65 servicios gratuitos** de forma permanente y otros gratuitos durante los primeros 12 meses.

### Servicios Siempre Gratuitos (Relevantes para tu proyecto)

#### 1. **Azure Cosmos DB**
- ✅ **25 GB de almacenamiento** gratis/mes
- ✅ **1000 RU/s** (Request Units) gratis/mes
- ✅ Perfecto para tu caso de uso multi-tenant
- 📊 **Ahorro estimado:** $6-10/mes

#### 2. **Log Analytics Workspace**
- ✅ **5 GB de ingesta de datos** gratis/mes
- ✅ **Retención de 30 días** incluida
- 📊 **Ahorro estimado:** $2-5/mes

#### 3. **Application Insights**
- ✅ **5 GB de telemetría** gratis/mes
- ✅ Monitoreo de aplicaciones
- 📊 **Ahorro estimado:** $2-5/mes

#### 4. **Azure Functions**
- ✅ **1 millón de ejecuciones** gratis/mes
- ✅ **400,000 GB-segundos** de compute gratis/mes
- 📊 **Ahorro estimado:** $0-5/mes (dependiendo del uso)

#### 5. **Azure Container Registry**
- ⚠️ **NO es gratis**, pero el tier Basic es económico:
  - $5/mes por 10GB de almacenamiento
  - Considera eliminar si no lo usas activamente

### Servicios Gratuitos por 12 Meses (Nuevos clientes)

Si tu suscripción es nueva, estos servicios son gratuitos por 12 meses:

- **Azure App Service:** 750 horas/mes
- **Azure SQL Database:** 250 GB S0
- **Azure Storage:** 5 GB LRS
- **Azure Virtual Machines:** 750 horas/mes (B1S)

**⚠️ Importante:** Verifica si tu suscripción califica para estos beneficios.

---

## 🎯 Optimizaciones Específicas

### 1. Azure Container Apps

**Situación actual:**
- Backend: 0.5 CPU, 1GB RAM, 1-10 réplicas
- Frontend: 0.25 CPU, 0.5GB RAM, 1-5 réplicas

**Optimizaciones:**

#### ✅ Reducir réplicas mínimas
```bash
# Si el tráfico es bajo, considera reducir minReplicas a 0
# Esto permite que las apps se apaguen completamente cuando no hay tráfico
```

**Ahorro estimado:** $10-30/mes si reduces de 1 a 0 réplicas mínimas

#### ✅ Ajustar recursos según uso real
- Monitorea el uso de CPU y memoria
- Si siempre usas <50% de recursos asignados, reduce el tamaño

**Ahorro estimado:** $5-15/mes

#### ✅ Usar Consumption Plan (si es posible)
- Container Apps ya usa un modelo de consumo
- Asegúrate de que el auto-scaling esté configurado correctamente

### 2. Azure Container Registry (ACR)

**Situación actual:**
- Tier: Basic ($5/mes)
- Storage: 10GB

**Optimizaciones:**

#### ✅ Limpiar imágenes antiguas
```bash
# Listar repositorios
az acr repository list --name <registry-name>

# Eliminar imágenes antiguas (>30 días)
az acr repository show-tags --name <registry-name> --repository <repo-name> --orderby time_desc --query "[?timestamp < '$(date -d '30 days ago' -Iseconds)'].name" -o tsv
```

**Ahorro estimado:** Evita costos de almacenamiento adicionales

#### ✅ Considerar eliminar si no lo usas activamente
- Si solo lo usas ocasionalmente, considera eliminarlo y recrearlo cuando lo necesites
- O usa Azure Container Registry Tasks para builds bajo demanda

### 3. Azure Cosmos DB

**Situación actual:**
- Serverless mode (buena elección)
- Multi-tenant con database-per-tenant

**Optimizaciones:**

#### ✅ Aprovechar tier gratuito
- Primeros 25 GB gratis
- Primeros 1000 RU/s gratis
- **Ahorro estimado:** $6-10/mes

#### ✅ Optimizar queries
- Usa índices apropiados
- Evita queries cross-partition cuando sea posible
- Usa TTL para datos temporales (analytics-events)

#### ✅ Revisar throughput
- Serverless cobra por operación, no por RU/s reservadas
- Asegúrate de que no tengas throughput reservado innecesario

### 4. Log Analytics Workspace

**Situación actual:**
- SKU: PerGB2018
- Retención: 30 días

**Optimizaciones:**

#### ✅ Aprovechar tier gratuito
- Primeros 5 GB gratis/mes
- **Ahorro estimado:** $2-5/mes

#### ✅ Reducir retención si es posible
- 30 días es razonable, pero si puedes reducir a 7-14 días, ahorras storage

#### ✅ Filtrar logs innecesarios
- Configura filtros para evitar ingerir logs de debug en producción

### 5. Application Insights

**Optimizaciones:**

#### ✅ Aprovechar tier gratuito
- Primeros 5 GB gratis/mes
- **Ahorro estimado:** $2-5/mes

#### ✅ Configurar sampling
- Reduce la cantidad de telemetría sin perder información crítica
- Sampling rate del 50% puede reducir costos a la mitad

---

## 🚀 Programa Azure for Startups

### ¿Qué es?

Microsoft for Startups ofrece beneficios significativos para startups elegibles:

- **Hasta $5,000 USD en créditos de Azure** por año
- **Hasta $120,000 USD en créditos** durante 2 años (para startups seleccionadas)
- Acceso a herramientas de desarrollo
- Soporte técnico
- Networking y eventos

### Elegibilidad

Para calificar, tu startup debe:

1. ✅ Ser una startup tecnológica
2. ✅ Tener menos de 10 años de operación
3. ✅ Tener menos de $50M USD en funding recibido
4. ✅ Estar construyendo una solución de software/SaaS
5. ✅ No ser una subsidiaria de una empresa grande

### Cómo Aplicar

1. **Visita:** https://www.microsoft.com/es/startups/
2. **Completa el formulario de aplicación**
3. **Proporciona información sobre tu startup:**
   - Descripción del producto
   - Modelo de negocio
   - Tracción actual
   - Equipo

### Beneficios Específicos

- **Azure Credits:** Usa para cualquier servicio de Azure
- **GitHub Enterprise:** Incluido
- **Microsoft 365:** Licencias para el equipo
- **Power Platform:** Acceso a herramientas de automatización
- **Support:** Soporte técnico prioritario

### ⚠️ Importante

- Los créditos tienen fecha de expiración (típicamente 12 meses)
- Debes usar los créditos activamente
- Puedes aplicar incluso si ya tienes una suscripción de Azure

---

## 📊 Recomendaciones por Servicio

### Recursos Actuales del Proyecto

Basado en tus archivos de infraestructura (`infra/*.bicep`):

| Servicio | Tier Actual | Costo Estimado | Optimización Posible |
|----------|-------------|----------------|---------------------|
| Container Apps | Consumption | $20-50/mes | Reducir minReplicas |
| Container Registry | Basic | $5/mes | Limpiar imágenes |
| Cosmos DB | Serverless | $0-10/mes | ✅ Ya optimizado |
| Log Analytics | PerGB2018 | $0-5/mes | ✅ Tier gratuito |
| Application Insights | Standard | $0-5/mes | ✅ Tier gratuito |

**Costo total estimado:** $25-75/mes

### Ahorro Potencial

Con las optimizaciones sugeridas:
- **Reducir minReplicas:** -$10-30/mes
- **Limpiar recursos no usados:** -$5-15/mes
- **Aprovechar servicios gratuitos:** Ya estás usando la mayoría

**Costo optimizado estimado:** $10-30/mes

---

## 🔧 Scripts de Automatización

### 1. Login a Azure
```bash
./scripts/azure-login.sh
```

### 2. Auditoría de Recursos
```bash
./scripts/azure-audit.sh
```

### 3. Limpieza de Recursos
```bash
# Ver qué se eliminaría
./scripts/azure-cleanup.sh --dry-run

# Eliminar con confirmación
./scripts/azure-cleanup.sh
```

### 4. Monitoreo de Costos (Manual)

```bash
# Ver costos del mes actual
az consumption usage list \
  --start-date $(date -u -d '1 month ago' +%Y-%m-%d) \
  --end-date $(date -u +%Y-%m-%d) \
  --query "[].{Date:usageDate,Service:instanceName,Cost:pretaxCost}" \
  -o table

# Ver costos por recurso
az consumption usage list \
  --start-date $(date -u -d '1 month ago' +%Y-%m-%d) \
  --end-date $(date -u +%Y-%m-%d) \
  --query "[].{Resource:instanceName,Cost:pretaxCost}" \
  -o table \
  | sort -k2 -rn
```

---

## 📈 Monitoreo Continuo

### Configurar Alertas de Presupuesto

1. Ve a **Cost Management + Billing** en el portal
2. Selecciona **Budgets**
3. Crea un presupuesto mensual (ej: $50/mes)
4. Configura alertas al 50%, 75%, 90% y 100%

### Revisar Azure Advisor Regularmente

Azure Advisor proporciona recomendaciones personalizadas:

```bash
# Ver todas las recomendaciones
az advisor recommendation list --output table

# Ver solo recomendaciones de costo
az advisor recommendation list --category Cost --output table
```

---

## 🎯 Plan de Acción Recomendado

### Esta Semana

1. ✅ Ejecutar `azure-login.sh` para autenticarse
2. ✅ Ejecutar `azure-audit.sh` para ver estado actual
3. ✅ Revisar recursos en el portal de Azure
4. ✅ Identificar recursos no utilizados

### Próxima Semana

1. ✅ Ejecutar `azure-cleanup.sh --dry-run`
2. ✅ Eliminar recursos no utilizados
3. ✅ Aplicar a Microsoft for Startups
4. ✅ Configurar alertas de presupuesto

### Mes Siguiente

1. ✅ Revisar costos mensuales
2. ✅ Optimizar Container Apps (reducir minReplicas si es posible)
3. ✅ Limpiar Container Registry
4. ✅ Revisar recomendaciones de Azure Advisor

---

## 🔗 Enlaces Útiles

- **Portal Azure:** https://portal.azure.com
- **Cost Management:** https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview
- **Azure Advisor:** https://portal.azure.com/#view/Microsoft_Azure_Expert/AdvisorMenuBlade/~/overview
- **Servicios Gratuitos:** https://azure.microsoft.com/es-es/pricing/free-services/
- **Microsoft for Startups:** https://www.microsoft.com/es/startups/
- **Azure Pricing Calculator:** https://azure.microsoft.com/es-es/pricing/calculator/

---

## 💡 Consejos Finales

1. **Revisa costos semanalmente** al principio para identificar tendencias
2. **Usa tags** para organizar recursos y entender costos por proyecto/ambiente
3. **Aprovecha el tier gratuito** siempre que sea posible
4. **Aplica a Microsoft for Startups** - los beneficios son significativos
5. **Configura alertas** para evitar sorpresas en la factura
6. **Elimina recursos de prueba** inmediatamente después de usarlos
7. **Usa Azure Cost Management** para análisis detallado

---

**¿Preguntas?** Revisa la documentación oficial o ejecuta los scripts de auditoría para más información específica de tu suscripción.

