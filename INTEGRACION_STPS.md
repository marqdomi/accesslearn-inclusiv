# Análisis de Integración con STPS (SIRCE Empresas)

**Fecha:** 19 de noviembre de 2025  
**Última actualización:** 19 de noviembre de 2025

---

## 📋 Resumen Ejecutivo

La integración con **SIRCE Empresas (Sistema de Registro de Constancias de Competencias o de Habilidades Laborales)** de la Secretaría del Trabajo y Previsión Social (STPS) representa un **valor agregado estratégico** para AccessLearn en el mercado mexicano.

### ¿Qué es SIRCE Empresas?

El sistema SIRCE permite a las empresas:
- Registrar constancias de competencias laborales de sus empleados
- Obtener reconocimiento oficial de la STPS sobre capacitación
- Cumplir con obligaciones de capacitación según la Ley Federal del Trabajo (Art. 153-A a 153-X)
- Generar constancias con validez oficial para trabajadores

### Valor Agregado para AccessLearn

✅ **Diferenciador de mercado**: Pocas plataformas LMS ofrecen integración directa con STPS  
✅ **Cumplimiento regulatorio**: Ayuda a empresas a cumplir obligaciones legales  
✅ **Certificación oficial**: Las constancias tienen reconocimiento gubernamental  
✅ **Competitividad**: Aumenta el valor percibido de la plataforma vs competidores  

---

## 🎯 Estrategia de Implementación

### Fase 1: Investigación y Análisis (Semanas 13-14)
**Estado:** Feature Futuro (Post-MVP)

#### Tareas:
1. **Investigación técnica:**
   - Verificar si SIRCE ofrece API pública o requiere integración manual
   - Analizar documentación técnica de la STPS
   - Contactar con STPS para obtener acceso a sandbox/ambiente de pruebas
   - Entender el proceso de registro de empresas en SIRCE

2. **Análisis de requerimientos:**
   - Identificar datos necesarios para generar constancias válidas
   - Mapear campos de AccessLearn con campos requeridos por STPS
   - Definir flujo de generación de constancias post-curso

3. **Análisis legal:**
   - Revisar requisitos para empresas agentes capacitadores
   - Verificar si AccessLearn necesita registro como agente capacitador
   - Entender obligaciones de almacenamiento de constancias

### Fase 2: Diseño de Integración (Semanas 15-16)

#### Arquitectura Propuesta:

```
┌─────────────────────────────────────────────────────────┐
│                    AccessLearn                          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Curso Completado (80%+ aprobación)              │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│                   ▼                                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Validación de Datos del Empleado                │  │
│  │  - CURP completo                                 │  │
│  │  - RFC                                            │  │
│  │  - NSS                                            │  │
│  │  - Datos de la empresa (Registro Patronal)      │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│                   ▼                                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Generación de Pre-Constancia                    │  │
│  │  - Folio interno AccessLearn                     │  │
│  │  - Nombre del curso                              │  │
│  │  - Horas de capacitación                         │  │
│  │  - Competencias desarrolladas                    │  │
│  │  - Fecha de finalización                         │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Integración STPS SIRCE                     │
│                                                         │
│  Opción A: API REST (si existe)                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  POST /api/constancias                           │  │
│  │  {                                                │  │
│  │    curp: "...",                                   │  │
│  │    curso: "...",                                  │  │
│  │    horas: 40,                                     │  │
│  │    fecha: "2025-11-19"                           │  │
│  │  }                                                │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│                   ▼                                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Respuesta STPS                                  │  │
│  │  {                                                │  │
│  │    folio_stps: "STPS-2025-123456",              │  │
│  │    fecha_registro: "2025-11-19",                │  │
│  │    url_constancia: "https://..."                │  │
│  │  }                                                │  │
│  └────────────────┬─────────────────────────────────┘  │
│                                                         │
│  Opción B: Exportación de Datos                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Generar archivo CSV/XML según formato STPS      │  │
│  │  Admin carga manualmente en portal SIRCE         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Almacenamiento en AccessLearn              │
│                                                         │
│  Cosmos DB - Colección: certificates                    │
│  {                                                      │
│    id: "cert-123",                                      │
│    userId: "user-456",                                  │
│    courseId: "course-789",                              │
│    type: "stps_constancia",                             │
│    folioInterno: "AL-2025-001",                         │
│    folioSTPS: "STPS-2025-123456",                       │
│    urlConstanciaSTPS: "https://...",                    │
│    fechaEmision: "2025-11-19",                          │
│    metadata: {                                          │
│      curp: "...",                                       │
│      horas: 40,                                         │
│      competencias: ["..."]                              │
│    }                                                    │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
```

### Fase 3: Implementación (Semanas 17-20)

#### Backend (Azure Functions):
```typescript
// /api/stps/generate-constancia
export async function generateConstanciaSTPS(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const { userId, courseId, tenantId } = req.body;
  
  // 1. Validar que el usuario completó el curso
  const progress = await progressService.getProgress(userId, courseId, tenantId);
  if (progress.completionPercentage < 80) {
    return { status: 400, body: { error: 'Curso no completado' } };
  }
  
  // 2. Obtener datos del usuario
  const user = await userService.getById(userId, tenantId);
  if (!user.curp || !user.rfc) {
    return { status: 400, body: { error: 'Datos incompletos del empleado' } };
  }
  
  // 3. Obtener datos del curso
  const course = await courseService.getById(courseId, tenantId);
  
  // 4. Generar folio interno
  const folioInterno = `AL-${tenantId}-${Date.now()}`;
  
  // 5. Llamar API de STPS (o generar exportación)
  const stpsResponse = await stpsService.registerConstancia({
    curp: user.curp,
    nombre: user.name,
    curso: course.title,
    horas: course.estimatedHours || 0,
    competencias: course.learningObjectives,
    fechaFinalizacion: progress.completionDate,
  });
  
  // 6. Almacenar en base de datos
  const certificate = await certificateService.create({
    userId,
    courseId,
    tenantId,
    type: 'stps_constancia',
    folioInterno,
    folioSTPS: stpsResponse.folio,
    urlConstanciaSTPS: stpsResponse.url,
    fechaEmision: new Date(),
    metadata: {
      curp: user.curp,
      horas: course.estimatedHours,
      competencias: course.learningObjectives,
    },
  }, tenantId);
  
  return { status: 201, body: certificate };
}
```

#### Frontend (React):
```typescript
// Nuevo componente: src/components/certificates/STPSConstanciaCard.tsx
export function STPSConstanciaCard({ certificate }: { certificate: Certificate }) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-600">
            STPS Oficial
          </Badge>
          Constancia de Competencias Laborales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Folio STPS:</strong> {certificate.folioSTPS}</p>
          <p><strong>Fecha de emisión:</strong> {formatDate(certificate.fechaEmision)}</p>
          <p><strong>Horas de capacitación:</strong> {certificate.metadata.horas}</p>
          <Button asChild className="w-full mt-4">
            <a href={certificate.urlConstanciaSTPS} target="_blank" rel="noopener">
              Ver Constancia Oficial STPS
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📊 Datos Requeridos para Integración STPS

### Campos Obligatorios del Empleado:

| Campo | Tipo | Descripción | Validación |
|-------|------|-------------|------------|
| **CURP** | string | Clave Única de Registro de Población | 18 caracteres, formato oficial |
| **RFC** | string | Registro Federal de Contribuyentes | 13 caracteres (personas físicas) |
| **NSS** | string | Número de Seguridad Social | 11 dígitos |
| **Nombre completo** | string | Apellido paterno, materno y nombre(s) | Según CURP |
| **Puesto** | string | Puesto o cargo laboral | Texto libre |
| **Área/Departamento** | string | Área organizacional | Texto libre |

### Campos Obligatorios de la Empresa:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **Registro Patronal** | string | Número de registro ante IMSS |
| **Razón Social** | string | Nombre legal de la empresa |
| **RFC Empresa** | string | RFC de la empresa (12-13 caracteres) |

### Campos Obligatorios del Curso:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **Nombre del curso** | string | Título del curso de capacitación |
| **Horas de capacitación** | number | Total de horas del curso |
| **Competencias desarrolladas** | string[] | Lista de competencias adquiridas |
| **Fecha de inicio** | date | Fecha de inicio del curso |
| **Fecha de finalización** | date | Fecha de término del curso |
| **Calificación** | number | Porcentaje de aprobación (mínimo 80%) |

---

## 🔄 Flujo de Usuario (UX)

### Para el Empleado:
1. Completa un curso con 80%+ de aprobación
2. Ve notificación: "¡Felicidades! Puedes obtener tu Constancia STPS oficial"
3. Click en "Generar Constancia STPS"
4. Sistema valida datos (CURP, RFC, NSS)
5. Si faltan datos, muestra formulario para completar
6. Genera constancia y muestra folio STPS
7. Puede descargar PDF y consultar en portal STPS

### Para el Admin/Manager:
1. Dashboard con métricas de constancias generadas
2. Exportación masiva de datos para SIRCE
3. Seguimiento de constancias pendientes
4. Reporte de cumplimiento de capacitación

---

## 💰 Impacto en el Modelo de Negocio

### Ventajas Competitivas:
- **Premium Feature**: Integración STPS puede ser parte de plan Enterprise
- **Compliance as a Service**: Ayuda a empresas a cumplir con la ley
- **Reducción de carga administrativa**: Automatiza proceso que normalmente es manual
- **Diferenciador**: Pocas plataformas LMS en México ofrecen esto

### Pricing Sugerido:
- **Plan Básico**: Sin integración STPS
- **Plan Profesional**: Integración STPS incluida (límite 50 constancias/mes)
- **Plan Enterprise**: Integración STPS ilimitada + soporte prioritario

---

## 🚧 Riesgos y Consideraciones

### Riesgos Técnicos:
❌ **API no disponible**: STPS podría no tener API pública → Solución: Exportación manual  
❌ **Latencia**: Proceso de registro en STPS puede tardar días → Solución: Constancia interna inmediata, folio STPS después  
❌ **Mantenimiento**: Cambios en sistema STPS requieren actualizaciones → Solución: Diseño flexible con adaptadores  

### Riesgos Legales:
⚖️ **Registro como agente capacitador**: AccessLearn podría necesitar registro ante STPS  
⚖️ **Responsabilidad**: Validez legal de constancias requiere cumplir normas oficiales  
⚖️ **Privacidad**: Manejo de datos sensibles (CURP, NSS) requiere cumplir LFPDPPP  

### Riesgos de Negocio:
📉 **Complejidad**: Feature puede retrasar MVP  
📉 **Costo**: Investigación e implementación requiere tiempo/recursos  
📉 **Adopción**: No todos los clientes necesitan integración STPS  

---

## 📅 Timeline Recomendado

| Fase | Semanas | Descripción | Prioridad |
|------|---------|-------------|-----------|
| **MVP** | 1-10 | NO incluir STPS, enfocarse en multi-tenancy | ✅ CRÍTICA |
| **Post-MVP** | 11-12 | Certificados internos AccessLearn funcionando | ⚠️ ALTA |
| **Investigación STPS** | 13-14 | Análisis técnico y legal de integración | 🔵 MEDIA |
| **Diseño STPS** | 15-16 | Arquitectura y UX de integración | 🔵 MEDIA |
| **Implementación STPS** | 17-20 | Desarrollo de integración completa | 🟢 BAJA (futuro) |
| **Beta Testing STPS** | 21-22 | Pruebas con 1-2 clientes piloto | 🟢 BAJA (futuro) |

### Recomendación:
🎯 **NO implementar en MVP (primeras 10 semanas)**  
🎯 **Investigar en paralelo mientras se construye el core**  
🎯 **Incluir en Roadmap como Feature Fase 7-8 (después de lanzamiento)**  

---

## ✅ Checklist de Pre-Implementación

Antes de comenzar el desarrollo de la integración STPS, asegurar:

- [ ] Contacto establecido con STPS para obtener documentación técnica
- [ ] Acceso a ambiente de pruebas SIRCE (sandbox)
- [ ] Confirmación de disponibilidad de API (o proceso de exportación)
- [ ] Análisis legal completado (registro como agente capacitador)
- [ ] Política de privacidad actualizada para incluir uso de CURP/NSS
- [ ] Validación con clientes potenciales de la necesidad de esta funcionalidad
- [ ] Modelo de User actualizado con campos mexicanos (CURP, RFC, NSS)
- [ ] Sistema de certificados internos funcionando (prerequisito)

---

## 📚 Referencias y Recursos

### Legislación:
- **Ley Federal del Trabajo**: Artículos 153-A a 153-X (Capacitación y Adiestramiento)
- **LFPDPPP**: Ley Federal de Protección de Datos Personales en Posesión de los Particulares
- **NOM-035-STPS-2018**: Factores de riesgo psicosocial en el trabajo

### Enlaces STPS:
- Portal SIRCE Empresas: https://sirceempesas.stps.gob.mx/
- Agentes Capacitadores Externos: https://www.gob.mx/stps/acciones-y-programas/agentes-capacitadores-externos-registro-y-autorizacion
- Documentación STPS: https://www.gob.mx/stps

### Contacto STPS:
- **Teléfono**: 800 911 7877 (Atención a empresas)
- **Correo**: contacto.empresa@stps.gob.mx

---

## 🎯 Conclusión

La integración con STPS SIRCE es un **diferenciador estratégico** para AccessLearn en el mercado mexicano, pero debe ser tratada como un **feature futuro** que NO bloquee el lanzamiento del MVP.

### Próximos Pasos Inmediatos:
1. ✅ Actualizar modelo de User con campos mexicanos (CURP, RFC, NSS, puesto, área, centro de costos)
2. ✅ Incluir en roadmap como Fase 7-8 (semanas 13-20+)
3. ✅ Iniciar contacto con STPS en paralelo al desarrollo del MVP
4. ✅ Validar con clientes piloto si este feature es realmente valorado

**Fecha objetivo para integración STPS:** Q1 2026 (post-lanzamiento MVP)
