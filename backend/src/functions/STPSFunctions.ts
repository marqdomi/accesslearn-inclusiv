/**
 * STPS Functions — DC-3/DC-4 Compliance Engine
 * 
 * Generates DC-3 constancias, manages STPS course configurations,
 * and produces DC-4 summary reports for Mexican labor training compliance.
 * 
 * Ley Federal del Trabajo, Art. 153-A to 153-X
 */

import { getContainer } from '../services/cosmosdb.service';
import { getUserById } from './UserFunctions';
import { getCourseById } from './CourseFunctions';
import { ulid } from 'ulid';
import {
  STPSConstancia,
  STPSCourseConfig,
  STPSTenantConfig,
  STPSDC4Report,
  STPS_AREAS_TEMATICAS,
  CreateSTPSCourseConfigRequest,
  UpdateSTPSTenantConfigRequest,
  GenerateConstanciaRequest,
  STPSConstanciaStatus,
} from '../types/stps.types';

// ============================================
// Container accessors
// ============================================
const getConstanciasContainer = () => getContainer('stps-constancias');
const getSTPSConfigContainer = () => getContainer('stps-config');

// ============================================
// STPS Tenant Config
// ============================================

export async function getSTPSTenantConfig(tenantId: string): Promise<STPSTenantConfig | null> {
  const container = getSTPSConfigContainer();
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.type = @type',
    parameters: [
      { name: '@tenantId', value: tenantId },
      { name: '@type', value: 'stps-tenant-config' },
    ],
  };
  const { resources } = await container.items.query(query).fetchAll();
  return (resources[0] as unknown as STPSTenantConfig) || null;
}

export async function upsertSTPSTenantConfig(
  tenantId: string,
  updates: UpdateSTPSTenantConfigRequest
): Promise<STPSTenantConfig> {
  const container = getSTPSConfigContainer();
  const existing = await getSTPSTenantConfig(tenantId);

  const config: STPSTenantConfig = {
    id: existing?.id || `stps-tenant-${tenantId}`,
    tenantId,
    type: 'stps-tenant-config',
    registroPatronalIMSS: updates.registroPatronalIMSS ?? existing?.registroPatronalIMSS,
    actividadGiro: updates.actividadGiro ?? existing?.actividadGiro,
    representanteLegal: updates.representanteLegal ?? existing?.representanteLegal,
    domicilioEstructurado: updates.domicilioEstructurado ?? existing?.domicilioEstructurado,
    lastFolioNumber: existing?.lastFolioNumber || 0,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { resource } = await container.items.upsert(config);
  return resource as unknown as STPSTenantConfig;
}

// ============================================
// STPS Course Config
// ============================================

export async function getSTPSCourseConfig(
  tenantId: string,
  courseId: string
): Promise<STPSCourseConfig | null> {
  const container = getSTPSConfigContainer();
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.courseId = @courseId AND c.type = @type',
    parameters: [
      { name: '@tenantId', value: tenantId },
      { name: '@courseId', value: courseId },
      { name: '@type', value: 'stps-course-config' },
    ],
  };
  const { resources } = await container.items.query(query).fetchAll();
  return (resources[0] as unknown as STPSCourseConfig) || null;
}

export async function getSTPSEnabledCourses(tenantId: string): Promise<STPSCourseConfig[]> {
  const container = getSTPSConfigContainer();
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.type = @type AND c.habilitadoSTPS = true',
    parameters: [
      { name: '@tenantId', value: tenantId },
      { name: '@type', value: 'stps-course-config' },
    ],
  };
  const { resources } = await container.items.query(query).fetchAll();
  return resources;
}

export async function upsertSTPSCourseConfig(
  data: CreateSTPSCourseConfigRequest
): Promise<STPSCourseConfig> {
  const container = getSTPSConfigContainer();
  const existing = await getSTPSCourseConfig(data.tenantId, data.courseId);

  const config: STPSCourseConfig = {
    id: existing?.id || `stps-config-${data.courseId}`,
    tenantId: data.tenantId,
    courseId: data.courseId,
    type: 'stps-course-config',
    habilitadoSTPS: data.habilitadoSTPS,
    areaTematica: data.areaTematica,
    objetivoGeneral: data.objetivoGeneral,
    modalidad: data.modalidad,
    horasOficiales: data.horasOficiales,
    instructorNombre: data.instructorNombre,
    instructorTipoAgente: data.instructorTipoAgente || 'interno',
    agentCapacitadorRegistro: data.agentCapacitadorRegistro,
    agentCapacitadorNombre: data.agentCapacitadorNombre,
    calificacionMinima: data.calificacionMinima ?? 80,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const { resource } = await container.items.upsert(config);
  return resource as unknown as STPSCourseConfig;
}

// ============================================
// DC-3 Constancia Generation
// ============================================

/**
 * Generate a DC-3 constancia for a user who completed a course.
 * Validates all required data (CURP, company RFC, STPS config) before generating.
 */
export async function generateConstancia(
  data: GenerateConstanciaRequest
): Promise<STPSConstancia> {
  const { tenantId, userId, courseId, certificateId } = data;

  // 1. Fetch all required data in parallel
  const [user, course, stpsCourseConfig, stpsTenantConfig, tenant] = await Promise.all([
    getUserById(userId, tenantId),
    getCourseById(courseId, tenantId),
    getSTPSCourseConfig(tenantId, courseId),
    getSTPSTenantConfig(tenantId),
    getTenantById(tenantId),
  ]);

  // 2. Validate required data
  if (!user) throw new Error(`Usuario ${userId} no encontrado`);
  if (!course) throw new Error(`Curso ${courseId} no encontrado`);
  if (!stpsCourseConfig) throw new Error(`Configuración STPS no encontrada para el curso "${course.title}". Configure el curso para cumplimiento STPS primero.`);
  if (!stpsCourseConfig.habilitadoSTPS) throw new Error(`El curso "${course.title}" no está habilitado para generar constancias STPS`);

  // Validate CURP (required for DC-3)
  if (!user.curp) throw new Error(`El empleado ${user.firstName} ${user.lastName} no tiene CURP registrado. CURP es obligatorio para la constancia DC-3.`);

  // Validate company data
  if (!tenant) throw new Error(`Tenant ${tenantId} no encontrado`);
  const companyRFC = tenant.rfc;
  if (!companyRFC) throw new Error(`La empresa no tiene RFC registrado. RFC es obligatorio para la constancia DC-3.`);

  // 3. Get user progress to check completion
  const progressContainer = getContainer('user-progress');
  const progressQuery = {
    query: 'SELECT * FROM c WHERE c.userId = @userId AND c.courseId = @courseId AND c.tenantId = @tenantId',
    parameters: [
      { name: '@userId', value: userId },
      { name: '@courseId', value: courseId },
      { name: '@tenantId', value: tenantId },
    ],
  };
  const { resources: progressDocs } = await progressContainer.items.query(progressQuery).fetchAll();
  const progress = progressDocs[0];

  if (!progress || progress.status !== 'completed') {
    throw new Error(`El empleado no ha completado el curso "${course.title}". El curso debe estar completado para generar la constancia.`);
  }

  const calificacion = progress.bestScore || progress.progress || 0;
  const aprobado = calificacion >= stpsCourseConfig.calificacionMinima;

  // 4. Generate folio
  const configContainer = getSTPSConfigContainer();
  const tenantConfig = stpsTenantConfig || {
    id: `stps-tenant-${tenantId}`,
    tenantId,
    type: 'stps-tenant-config' as const,
    lastFolioNumber: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  tenantConfig.lastFolioNumber = (tenantConfig.lastFolioNumber || 0) + 1;
  tenantConfig.updatedAt = new Date().toISOString();
  await configContainer.items.upsert(tenantConfig);

  const year = new Date().getFullYear();
  const folioNumber = String(tenantConfig.lastFolioNumber).padStart(6, '0');
  const tenantSlug = tenant.slug?.toUpperCase() || tenantId.replace('tenant-', '').toUpperCase();
  const folioInterno = `KAIDO-${tenantSlug}-${year}-${folioNumber}`;

  // 5. Build the constancia document
  const now = new Date().toISOString();
  const constancia: STPSConstancia = {
    id: `constancia-${ulid()}`,
    tenantId,
    type: 'stps-constancia',
    userId,
    courseId,
    certificateId,
    userProgressId: progress.id,

    trabajador: {
      nombreCompleto: `${user.lastName} ${user.firstName}`.toUpperCase(),
      curp: user.curp,
      rfc: user.rfc || '',
      nss: user.nss || '',
      ocupacion: (user as any).puesto || (user as any).ocupacion || 'EMPLEADO',
      puesto: (user as any).puesto || 'EMPLEADO',
      nacionalidad: (user as any).nacionalidad || 'MEXICANA',
    },

    empresa: {
      razonSocial: tenant.businessName || tenant.name,
      rfc: companyRFC,
      registroPatronalIMSS: stpsTenantConfig?.registroPatronalIMSS,
      actividadGiro: stpsTenantConfig?.actividadGiro,
      domicilio: stpsTenantConfig?.domicilioEstructurado || {
        calle: tenant.address || '',
        colonia: '',
        municipio: '',
        estado: '',
        codigoPostal: '',
      },
    },

    curso: {
      nombre: course.title,
      duracionHoras: stpsCourseConfig.horasOficiales,
      fechaInicio: progress.startedAt || progress.createdAt || now,
      fechaFin: progress.completedAt || now,
      areaTematica: stpsCourseConfig.areaTematica,
      areaTematicaDescripcion: STPS_AREAS_TEMATICAS[stpsCourseConfig.areaTematica],
      objetivoGeneral: stpsCourseConfig.objetivoGeneral,
      modalidad: stpsCourseConfig.modalidad,
    },

    instructor: {
      nombre: stpsCourseConfig.instructorNombre || 'PLATAFORMA KAIDO',
      tipoAgente: stpsCourseConfig.instructorTipoAgente,
      registroSTPS: stpsCourseConfig.agentCapacitadorRegistro,
      nombreAgente: stpsCourseConfig.agentCapacitadorNombre,
    },

    resultado: {
      calificacion,
      aprobado,
    },

    folioInterno,
    fechaExpedicion: now,
    lugarExpedicion: stpsTenantConfig?.domicilioEstructurado
      ? `${stpsTenantConfig.domicilioEstructurado.municipio}, ${stpsTenantConfig.domicilioEstructurado.estado}`
      : 'CIUDAD DE MÉXICO',

    status: 'generated',
    createdAt: now,
    updatedAt: now,
  };

  // 6. Save to Cosmos DB
  const constanciasContainer = getConstanciasContainer();
  const { resource } = await constanciasContainer.items.create(constancia);

  return resource as STPSConstancia;
}

// ============================================
// Constancia CRUD
// ============================================

export async function getConstanciasByUser(
  tenantId: string,
  userId: string
): Promise<STPSConstancia[]> {
  const container = getConstanciasContainer();
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.userId = @userId ORDER BY c.createdAt DESC',
    parameters: [
      { name: '@tenantId', value: tenantId },
      { name: '@userId', value: userId },
    ],
  };
  const { resources } = await container.items.query(query).fetchAll();
  return resources;
}

export async function getConstanciasByCourse(
  tenantId: string,
  courseId: string
): Promise<STPSConstancia[]> {
  const container = getConstanciasContainer();
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.courseId = @courseId ORDER BY c.createdAt DESC',
    parameters: [
      { name: '@tenantId', value: tenantId },
      { name: '@courseId', value: courseId },
    ],
  };
  const { resources } = await container.items.query(query).fetchAll();
  return resources;
}

export async function getConstanciaById(
  tenantId: string,
  constanciaId: string
): Promise<STPSConstancia | null> {
  const container = getConstanciasContainer();
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.id = @id',
    parameters: [
      { name: '@tenantId', value: tenantId },
      { name: '@id', value: constanciaId },
    ],
  };
  const { resources } = await container.items.query(query).fetchAll();
  return resources[0] || null;
}

export async function getAllConstancias(
  tenantId: string,
  filters?: { status?: STPSConstanciaStatus; startDate?: string; endDate?: string }
): Promise<STPSConstancia[]> {
  const container = getConstanciasContainer();
  let queryText = 'SELECT * FROM c WHERE c.tenantId = @tenantId';
  const parameters: any[] = [{ name: '@tenantId', value: tenantId }];

  if (filters?.status) {
    queryText += ' AND c.status = @status';
    parameters.push({ name: '@status', value: filters.status });
  }
  if (filters?.startDate) {
    queryText += ' AND c.fechaExpedicion >= @startDate';
    parameters.push({ name: '@startDate', value: filters.startDate });
  }
  if (filters?.endDate) {
    queryText += ' AND c.fechaExpedicion <= @endDate';
    parameters.push({ name: '@endDate', value: filters.endDate });
  }

  queryText += ' ORDER BY c.createdAt DESC';

  const { resources } = await container.items.query({ query: queryText, parameters }).fetchAll();
  return resources;
}

// ============================================
// DC-4 Report Generation
// ============================================

export async function generateDC4Report(
  tenantId: string,
  startDate: string,
  endDate: string
): Promise<STPSDC4Report> {
  // Get tenant info
  const tenant = await getTenantById(tenantId);
  if (!tenant) throw new Error(`Tenant ${tenantId} no encontrado`);

  const stpsTenantConfig = await getSTPSTenantConfig(tenantId);

  // Get all constancias for the period
  const constancias = await getAllConstancias(tenantId, {
    status: 'generated',
    startDate,
    endDate,
  });

  // Group by course
  const courseMap = new Map<string, {
    config: STPSConstancia['curso'];
    instructor: STPSConstancia['instructor'];
    workers: Array<{
      nombreCompleto: string;
      curp: string;
      ocupacion: string;
      resultado: 'Aprobado' | 'No aprobado';
      calificacion: number;
    }>;
  }>();

  for (const c of constancias) {
    const key = c.courseId;
    if (!courseMap.has(key)) {
      courseMap.set(key, {
        config: c.curso,
        instructor: c.instructor,
        workers: [],
      });
    }
    courseMap.get(key)!.workers.push({
      nombreCompleto: c.trabajador.nombreCompleto,
      curp: c.trabajador.curp,
      ocupacion: c.trabajador.ocupacion,
      resultado: c.resultado.aprobado ? 'Aprobado' : 'No aprobado',
      calificacion: c.resultado.calificacion,
    });
  }

  // Build DC-4 report
  const cursos = Array.from(courseMap.values()).map(({ config, instructor, workers }) => ({
    nombre: config.nombre,
    areaTematica: config.areaTematica,
    areaTematicaDescripcion: config.areaTematicaDescripcion,
    duracionHoras: config.duracionHoras,
    fechaInicio: config.fechaInicio,
    fechaFin: config.fechaFin,
    modalidad: config.modalidad,
    instructorNombre: instructor.nombre,
    agentCapacitador: instructor.nombreAgente,
    registroSTPS: instructor.registroSTPS,
    trabajadores: workers,
  }));

  // Unique workers across all courses
  const uniqueWorkers = new Set(constancias.map(c => c.userId));
  const totalHorasHombre = cursos.reduce(
    (sum, curso) => sum + curso.duracionHoras * curso.trabajadores.length,
    0
  );

  return {
    empresa: {
      razonSocial: tenant.businessName || tenant.name,
      rfc: tenant.rfc || '',
      registroPatronalIMSS: stpsTenantConfig?.registroPatronalIMSS,
    },
    periodo: {
      inicio: startDate,
      fin: endDate,
    },
    cursos,
    totales: {
      totalTrabajadoresCapacitados: uniqueWorkers.size,
      totalHorasHombreCapacitacion: totalHorasHombre,
      totalCursos: cursos.length,
      totalConstancias: constancias.length,
    },
  };
}

// ============================================
// STPS Dashboard Stats
// ============================================

export async function getSTPSStats(tenantId: string) {
  const constancias = await getAllConstancias(tenantId);
  const enabledCourses = await getSTPSEnabledCourses(tenantId);

  const year = new Date().getFullYear();
  const thisYearConstancias = constancias.filter(c =>
    c.fechaExpedicion.startsWith(String(year))
  );

  const aprobados = thisYearConstancias.filter(c => c.resultado.aprobado);
  const uniqueWorkers = new Set(thisYearConstancias.map(c => c.userId));

  const totalHorasHombre = thisYearConstancias.reduce(
    (sum, c) => sum + c.curso.duracionHoras,
    0
  );

  return {
    totalConstancias: constancias.length,
    constanciasEsteAnio: thisYearConstancias.length,
    tasaAprobacion: thisYearConstancias.length > 0
      ? Math.round((aprobados.length / thisYearConstancias.length) * 100)
      : 0,
    trabajadoresCapacitados: uniqueWorkers.size,
    totalHorasHombre,
    cursosHabilitados: enabledCourses.length,
  };
}

// Helper: Get tenant by ID (imported from TenantFunctions)
async function getTenantById(tenantId: string) {
  const container = getContainer('tenants');
  const query = {
    query: 'SELECT * FROM c WHERE c.id = @id',
    parameters: [{ name: '@id', value: tenantId }],
  };
  const { resources } = await container.items.query(query).fetchAll();
  return resources[0] || null;
}
