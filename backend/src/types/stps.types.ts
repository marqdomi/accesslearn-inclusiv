/**
 * STPS Compliance Types
 * 
 * Tipos para cumplimiento con la Secretaría del Trabajo y Previsión Social (STPS)
 * - DC-3: Constancia de Competencias o Habilidades Laborales
 * - DC-4: Lista de Constancias de Competencias o Habilidades Laborales
 * 
 * Referencia: Ley Federal del Trabajo, Art. 153-V
 */

// ============================================
// STPS Thematic Areas (Áreas Temáticas)
// ============================================
export type STPSAreaTematica = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const STPS_AREAS_TEMATICAS: Record<STPSAreaTematica, string> = {
  1: 'Seguridad, salud en el trabajo y medio ambiente',
  2: 'Competencia laboral',
  3: 'Productividad',
  4: 'Desarrollo tecnológico',
  5: 'Habilidades administrativas',
  6: 'Desarrollo humano',
  7: 'Calidad',
  8: 'Otras',
};

export type STPSModalidad = 'presencial' | 'en-linea' | 'mixta';
export type STPSTipoAgente = 'interno' | 'externo';
export type STPSConstanciaStatus = 'draft' | 'generated' | 'registered-sirce' | 'invalidated';

// ============================================
// DC-3 Constancia
// ============================================
export interface STPSConstancia {
  id: string;                          // constancia-{ulid}
  tenantId: string;                    // Partition key
  type: 'stps-constancia';

  // Reference IDs
  userId: string;
  courseId: string;
  certificateId?: string;              // Link to existing Certificate (if any)
  userProgressId?: string;             // Link to UserProgress

  // Sección A: Datos del Trabajador
  trabajador: {
    nombreCompleto: string;            // "LÓPEZ GARCÍA ANA MARÍA"
    curp: string;                      // 18 caracteres
    rfc?: string;
    nss?: string;
    ocupacion: string;                 // Puesto/cargo
    puesto: string;
    nacionalidad: string;              // Default: "MEXICANA"
  };

  // Sección B: Datos de la Empresa
  empresa: {
    razonSocial: string;
    rfc: string;
    registroPatronalIMSS?: string;
    actividadGiro?: string;
    domicilio: {
      calle: string;
      colonia: string;
      municipio: string;
      estado: string;
      codigoPostal: string;
    };
  };

  // Sección C: Datos del Curso
  curso: {
    nombre: string;
    duracionHoras: number;
    fechaInicio: string;               // ISO date
    fechaFin: string;                  // ISO date
    areaTematica: STPSAreaTematica;
    areaTematicaDescripcion: string;
    objetivoGeneral: string;
    modalidad: STPSModalidad;
  };

  // Sección D: Instructor
  instructor: {
    nombre: string;
    tipoAgente: STPSTipoAgente;
    registroSTPS?: string;             // ACE number if external
    nombreAgente?: string;             // Training provider name
  };

  // Sección E: Resultado
  resultado: {
    calificacion: number;              // 0-100
    aprobado: boolean;
    observaciones?: string;
  };

  // Administrative
  folioInterno: string;                // "KAIDO-{TENANT}-{YEAR}-{SEQ}"
  folioSTPS?: string;                  // SIRCE folio if registered
  fechaExpedicion: string;             // ISO date
  lugarExpedicion: string;

  // Status
  status: STPSConstanciaStatus;
  pdfUrl?: string;                     // Azure Blob Storage URL
  pdfBlobName?: string;                // Blob name for retrieval
  sirceRegisteredAt?: string;

  createdAt: string;
  updatedAt: string;
}

// ============================================
// STPS Course Configuration
// ============================================
export interface STPSCourseConfig {
  id: string;                          // stps-config-{courseId}
  tenantId: string;
  courseId: string;
  type: 'stps-course-config';

  // STPS-specific fields
  habilitadoSTPS: boolean;             // Whether this course generates DC-3s
  areaTematica: STPSAreaTematica;
  objetivoGeneral: string;
  modalidad: STPSModalidad;
  horasOficiales: number;              // May differ from course.estimatedTime
  
  // Instructor default
  instructorNombre?: string;
  instructorTipoAgente: STPSTipoAgente;
  agentCapacitadorRegistro?: string;   // STPS registration if external
  agentCapacitadorNombre?: string;

  // Thresholds
  calificacionMinima: number;          // Min score to "aprobar" (default 80)

  createdAt: string;
  updatedAt: string;
}

// ============================================
// STPS Tenant Config (extends Tenant data)
// ============================================
export interface STPSTenantConfig {
  id: string;                          // stps-tenant-{tenantId}
  tenantId: string;
  type: 'stps-tenant-config';

  // Employer data for DC-3 Section B
  registroPatronalIMSS?: string;
  actividadGiro?: string;
  representanteLegal?: string;
  domicilioEstructurado?: {
    calle: string;
    colonia: string;
    municipio: string;
    estado: string;
    codigoPostal: string;
  };

  // Folio counter
  lastFolioNumber: number;             // Sequential counter per tenant

  createdAt: string;
  updatedAt: string;
}

// ============================================
// DC-4 Report
// ============================================
export interface STPSDC4Report {
  empresa: {
    razonSocial: string;
    rfc: string;
    registroPatronalIMSS?: string;
  };
  periodo: {
    inicio: string;
    fin: string;
  };
  cursos: Array<{
    nombre: string;
    areaTematica: STPSAreaTematica;
    areaTematicaDescripcion: string;
    duracionHoras: number;
    fechaInicio: string;
    fechaFin: string;
    modalidad: STPSModalidad;
    instructorNombre: string;
    agentCapacitador?: string;
    registroSTPS?: string;
    trabajadores: Array<{
      nombreCompleto: string;
      curp: string;
      ocupacion: string;
      resultado: 'Aprobado' | 'No aprobado';
      calificacion: number;
    }>;
  }>;
  totales: {
    totalTrabajadoresCapacitados: number;
    totalHorasHombreCapacitacion: number;
    totalCursos: number;
    totalConstancias: number;
  };
}

// ============================================
// Create/Update request types
// ============================================
export interface CreateSTPSCourseConfigRequest {
  courseId: string;
  tenantId: string;
  habilitadoSTPS: boolean;
  areaTematica: STPSAreaTematica;
  objetivoGeneral: string;
  modalidad: STPSModalidad;
  horasOficiales: number;
  instructorNombre?: string;
  instructorTipoAgente?: STPSTipoAgente;
  agentCapacitadorRegistro?: string;
  agentCapacitadorNombre?: string;
  calificacionMinima?: number;
}

export interface UpdateSTPSTenantConfigRequest {
  tenantId: string;
  registroPatronalIMSS?: string;
  actividadGiro?: string;
  representanteLegal?: string;
  domicilioEstructurado?: {
    calle: string;
    colonia: string;
    municipio: string;
    estado: string;
    codigoPostal: string;
  };
}

export interface GenerateConstanciaRequest {
  tenantId: string;
  userId: string;
  courseId: string;
  certificateId?: string;
  generadoPor?: string;
  observaciones?: string;
}
