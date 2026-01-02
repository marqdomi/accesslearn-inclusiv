# 🚀 Guía Rápida: Optimización de Costos Azure

## ⚡ Inicio Rápido (5 minutos)

### 1. Autenticarse en Azure
```bash
./scripts/azure-login.sh
```

### 2. Revisar Recursos y Costos
```bash
./scripts/azure-audit.sh
```

### 3. Limpiar Recursos No Utilizados
```bash
# Primero ver qué se eliminaría (sin hacer cambios)
./scripts/azure-cleanup.sh --dry-run

# Luego eliminar con confirmación
./scripts/azure-cleanup.sh
```

---

## 📋 Checklist de Optimización

### ✅ Esta Semana
- [ ] Autenticarse en Azure (`azure-login.sh`)
- [ ] Ejecutar auditoría (`azure-audit.sh`)
- [ ] Revisar recursos en portal: https://portal.azure.com
- [ ] Identificar recursos no utilizados

### ✅ Próxima Semana
- [ ] Limpiar recursos no utilizados (`azure-cleanup.sh`)
- [ ] **Aplicar a Microsoft for Startups** (hasta $5,000 USD en créditos)
- [ ] Configurar alertas de presupuesto en Azure Portal
- [ ] Revisar servicios gratuitos disponibles

### ✅ Optimizaciones Específicas
- [ ] Reducir `minReplicas` de Container Apps si es posible (ahorro: $10-30/mes)
- [ ] Limpiar imágenes antiguas de Container Registry
- [ ] Verificar que Cosmos DB esté usando tier gratuito (25GB + 1000 RU/s gratis)
- [ ] Revisar Log Analytics (5GB gratis/mes)

---

## 🎁 Servicios Gratuitos que Ya Usas

✅ **Cosmos DB:** 25GB + 1000 RU/s gratis/mes  
✅ **Log Analytics:** 5GB gratis/mes  
✅ **Application Insights:** 5GB gratis/mes  

**Ahorro estimado:** $10-20/mes

---

## 🚀 Microsoft for Startups

**Beneficios:**
- Hasta **$5,000 USD en créditos de Azure** por año
- GitHub Enterprise incluido
- Microsoft 365 para el equipo
- Soporte técnico prioritario

**Aplicar aquí:** https://www.microsoft.com/es/startups/

**Elegibilidad:**
- Startup tecnológica
- <10 años de operación
- <$50M USD en funding
- Construyendo SaaS/software

---

## 💰 Costos Actuales vs Optimizados

| Estado | Costo Estimado |
|--------|----------------|
| **Actual** | $25-75/mes |
| **Optimizado** | $10-30/mes |
| **Con Azure for Startups** | $0/mes (con créditos) |

---

## 🔗 Enlaces Importantes

- **Portal Azure:** https://portal.azure.com
- **Cost Management:** https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview
- **Azure Advisor:** https://portal.azure.com/#view/Microsoft_Azure_Expert/AdvisorMenuBlade/~/overview
- **Microsoft for Startups:** https://www.microsoft.com/es/startups/
- **Servicios Gratuitos:** https://azure.microsoft.com/es-es/pricing/free-services/

---

## 📖 Documentación Completa

Para más detalles, revisa: `docs/AZURE_COST_OPTIMIZATION.md`

---

## ⚠️ Próximos Pasos Inmediatos

1. **Ejecuta:** `./scripts/azure-login.sh`
2. **Ejecuta:** `./scripts/azure-audit.sh`
3. **Revisa:** Los recursos listados y costos
4. **Aplica:** A Microsoft for Startups (¡puede darte $5,000 USD!)
5. **Limpia:** Recursos no utilizados con `azure-cleanup.sh`

---

**💡 Tip:** Empieza con la auditoría para ver exactamente qué recursos tienes y cuánto cuestan.

