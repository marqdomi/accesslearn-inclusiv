# 🚀 EMPIEZA AQUÍ - Optimización Azure

## ⚡ Inicio Rápido (2 minutos)

### Opción A: Script Interactivo (RECOMENDADO)

Abre tu **Terminal** y ejecuta:

```bash
cd ~/Projects/accesslearn-inclusiv
./COMANDOS_AZURE.sh
```

Este script te guiará paso a paso por toda la auditoría.

---

### Opción B: Comandos Manuales

Si prefieres ir a tu ritmo, ejecuta estos comandos en tu **Terminal**:

#### 1. Login
```bash
az login
```

#### 2. Ver Recursos
```bash
az resource list --output table
```

#### 3. Ver Costos
```bash
az consumption usage list \
  --start-date $(date -u -v-30d +%Y-%m-%d) \
  --end-date $(date -u +%Y-%m-%d) \
  --output table
```

---

## 📋 Documentación Completa

Según tus necesidades, revisa:

| Documento | Descripción | Cuándo usarlo |
|-----------|-------------|---------------|
| **AZURE_QUICK_START.md** | Resumen ejecutivo | Visión general rápida |
| **AZURE_MANUAL_STEPS.md** | Guía paso a paso | Seguir instrucciones detalladas |
| **COMANDOS_AZURE.sh** | Script interactivo | Ejecutar auditoría automática |
| **docs/AZURE_COST_OPTIMIZATION.md** | Guía completa | Referencia detallada |

---

## 🎯 Los 3 Pasos Más Importantes

### 1️⃣ Auditoría (HOY)
```bash
cd ~/Projects/accesslearn-inclusiv
./COMANDOS_AZURE.sh
```

### 2️⃣ Microsoft for Startups (ESTA SEMANA)
Aplica aquí: https://www.microsoft.com/es/startups/

**Beneficio:** Hasta $5,000 USD en créditos de Azure

### 3️⃣ Alertas de Presupuesto (ESTA SEMANA)
1. Ve a: https://portal.azure.com
2. Busca "Cost Management + Billing"
3. Crea un presupuesto mensual de $50 USD
4. Configura alertas al 50%, 75%, 90% y 100%

---

## 💡 ¿Qué Esperar?

Después de seguir estos pasos:

✅ Sabrás exactamente qué recursos tienes en Azure  
✅ Conocerás tus costos actuales  
✅ Identificarás recursos no utilizados  
✅ Podrás optimizar y ahorrar $10-30/mes  
✅ Tendrás acceso a $5,000 USD en créditos (Microsoft for Startups)  

---

## ❓ ¿Problemas?

Si el script `COMANDOS_AZURE.sh` no funciona:
1. Verifica que Azure CLI esté instalado: `az --version`
2. Si no está instalado: `brew install azure-cli`
3. Sigue los pasos en **AZURE_MANUAL_STEPS.md**

---

## 🔗 Enlaces Rápidos

- **Portal Azure:** https://portal.azure.com
- **Cost Management:** https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview
- **Microsoft for Startups:** https://www.microsoft.com/es/startups/
- **Servicios Gratuitos:** https://azure.microsoft.com/es-es/pricing/free-services/

---

**🎉 ¡Comienza ahora con `./COMANDOS_AZURE.sh`!**

