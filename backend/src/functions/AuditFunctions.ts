/**
 * Audit Functions - Sistema de auditoría para AccessLearn
 * 
 * Registra eventos críticos del sistema para compliance y seguridad
 */

import { getContainer } from '../services/cosmosdb.service';
// Use require for uuid to avoid ESM issues in Jest
const { v4: uuidv4 } = require('uuid');

/**
 * Tipos de eventos auditables
 */
export type AuditAction =
  // User Management
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  | 'user:role-change'
  | 'user:status-change'
  | 'user:permission-grant'
  | 'user:permission-revoke'
  // Course Management
  | 'course:create'
  | 'course:update'
  | 'course:delete'
  | 'course:publish'
  | 'course:archive'
  | 'course:approve'
  | 'course:reject'
  // Enrollment
  | 'enrollment:assign'
  | 'enrollment:remove'
  | 'enrollment:bulk-assign'
  // Tenant Management
  | 'tenant:create'
  | 'tenant:update'
  | 'tenant:delete'
  // Security
  | 'security:access-denied'
  | 'security:login-failed'
  | 'security:token-invalid'
  // Settings
  | 'settings:update'
  | 'settings:branding-change';

export type AuditSeverity = 'info' | 'warning' | 'critical';
export type AuditStatus = 'success' | 'failure';

export interface AuditLogActor {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export interface AuditLogResource {
  type: string; // 'user', 'course', 'tenant', etc.
  id: string;
  name?: string;
}

export interface AuditLogMetadata {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  [key: string]: any;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  timestamp: string;
  action: AuditAction;
  actor: AuditLogActor;
  resource: AuditLogResource;
  changes?: {
    before: any;
    after: any;
  };
  metadata?: AuditLogMetadata;
  severity: AuditSeverity;
  status: AuditStatus;
  description?: string;
}

/**
 * Crear un log de auditoría
 */
export async function createAuditLog(
  tenantId: string,
  action: AuditAction,
  actor: AuditLogActor,
  resource: AuditLogResource,
  options: {
    changes?: { before: any; after: any };
    metadata?: AuditLogMetadata;
    severity?: AuditSeverity;
    status?: AuditStatus;
    description?: string;
  } = {}
): Promise<AuditLog> {
  try {
    const container = getContainer('audit-logs');
    
    const auditLog: AuditLog = {
      id: uuidv4(),
      tenantId,
      timestamp: new Date().toISOString(),
      action,
      actor,
      resource,
      changes: options.changes,
      metadata: options.metadata,
      severity: options.severity || 'info',
      status: options.status || 'success',
      description: options.description,
    };

    const { resource: createdLog } = await container.items.create(auditLog);
    
    console.log(`[AUDIT] ${action} by ${actor.email} on ${resource.type}:${resource.id}`);
    
    return createdLog as AuditLog;
  } catch (error) {
    console.error('[AUDIT] Error creating audit log:', error);
    // No lanzar error para no interrumpir flujo principal
    throw error;
  }
}

/**
 * Obtener logs de auditoría con filtros
 */
export async function getAuditLogs(
  tenantId: string,
  filters: {
    action?: AuditAction | AuditAction[];
    actorId?: string;
    resourceType?: string;
    resourceId?: string;
    severity?: AuditSeverity;
    status?: AuditStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<AuditLog[]> {
  try {
    const container = getContainer('audit-logs');
    
    let query = `SELECT * FROM c WHERE c.tenantId = @tenantId`;
    const parameters: any[] = [{ name: '@tenantId', value: tenantId }];

    // Filtro por acción
    if (filters.action) {
      if (Array.isArray(filters.action)) {
        const actionParams = filters.action.map((a, i) => {
          parameters.push({ name: `@action${i}`, value: a });
          return `@action${i}`;
        });
        query += ` AND c.action IN (${actionParams.join(', ')})`;
      } else {
        query += ` AND c.action = @action`;
        parameters.push({ name: '@action', value: filters.action });
      }
    }

    // Filtro por actor
    if (filters.actorId) {
      query += ` AND c.actor.userId = @actorId`;
      parameters.push({ name: '@actorId', value: filters.actorId });
    }

    // Filtro por tipo de recurso
    if (filters.resourceType) {
      query += ` AND c.resource.type = @resourceType`;
      parameters.push({ name: '@resourceType', value: filters.resourceType });
    }

    // Filtro por ID de recurso
    if (filters.resourceId) {
      query += ` AND c.resource.id = @resourceId`;
      parameters.push({ name: '@resourceId', value: filters.resourceId });
    }

    // Filtro por severidad
    if (filters.severity) {
      query += ` AND c.severity = @severity`;
      parameters.push({ name: '@severity', value: filters.severity });
    }

    // Filtro por status
    if (filters.status) {
      query += ` AND c.status = @status`;
      parameters.push({ name: '@status', value: filters.status });
    }

    // Filtro por fecha inicio
    if (filters.startDate) {
      query += ` AND c.timestamp >= @startDate`;
      parameters.push({ name: '@startDate', value: filters.startDate.toISOString() });
    }

    // Filtro por fecha fin
    if (filters.endDate) {
      query += ` AND c.timestamp <= @endDate`;
      parameters.push({ name: '@endDate', value: filters.endDate.toISOString() });
    }

    // Ordenar por timestamp descendente
    query += ` ORDER BY c.timestamp DESC`;

    const querySpec = {
      query,
      parameters,
    };

    const { resources } = await container.items
      .query(querySpec, { maxItemCount: filters.limit || 100 })
      .fetchAll();

    return resources;
  } catch (error) {
    console.error('[AUDIT] Error getting audit logs:', error);
    throw error;
  }
}

/**
 * Obtener log específico por ID
 */
export async function getAuditLogById(
  logId: string,
  tenantId: string
): Promise<AuditLog | null> {
  try {
    const container = getContainer('audit-logs');
    
    const { resource } = await container.item(logId, tenantId).read();
    return resource || null;
  } catch (error: any) {
    if (error.code === 404) {
      return null;
    }
    console.error('[AUDIT] Error getting audit log:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de auditoría
 */
export async function getAuditStats(
  tenantId: string,
  period: 'day' | 'week' | 'month' = 'week'
): Promise<{
  totalLogs: number;
  bySeverity: Record<AuditSeverity, number>;
  byAction: Record<string, number>;
  byStatus: Record<AuditStatus, number>;
  criticalEvents: number;
  failedActions: number;
}> {
  try {
    const container = getContainer('audit-logs');
    
    // Calcular fecha de inicio según período
    const now = new Date();
    const startDate = new Date();
    if (period === 'day') {
      startDate.setDate(now.getDate() - 1);
    } else if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    }

    const query = `
      SELECT 
        COUNT(1) as totalLogs,
        c.severity,
        c.action,
        c.status
      FROM c 
      WHERE c.tenantId = @tenantId 
        AND c.timestamp >= @startDate
      GROUP BY c.severity, c.action, c.status
    `;

    const { resources } = await container.items
      .query({
        query,
        parameters: [
          { name: '@tenantId', value: tenantId },
          { name: '@startDate', value: startDate.toISOString() },
        ],
      })
      .fetchAll();

    // Procesar resultados
    const stats = {
      totalLogs: 0,
      bySeverity: { info: 0, warning: 0, critical: 0 } as Record<AuditSeverity, number>,
      byAction: {} as Record<string, number>,
      byStatus: { success: 0, failure: 0 } as Record<AuditStatus, number>,
      criticalEvents: 0,
      failedActions: 0,
    };

    resources.forEach((r: any) => {
      stats.totalLogs += r.totalLogs || 0;
      const severity = r.severity as AuditSeverity;
      const status = r.status as AuditStatus;
      if (severity in stats.bySeverity) {
        stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + (r.totalLogs || 0);
      }
      stats.byAction[r.action] = (stats.byAction[r.action] || 0) + (r.totalLogs || 0);
      if (status in stats.byStatus) {
        stats.byStatus[status] = (stats.byStatus[status] || 0) + (r.totalLogs || 0);
      }
      
      if (r.severity === 'critical') {
        stats.criticalEvents += r.totalLogs || 0;
      }
      if (r.status === 'failure') {
        stats.failedActions += r.totalLogs || 0;
      }
    });

    return stats;
  } catch (error) {
    console.error('[AUDIT] Error getting audit stats:', error);
    throw error;
  }
}

/**
 * Helper: Log cambio de rol
 */
export async function logRoleChange(
  tenantId: string,
  actor: AuditLogActor,
  targetUser: { id: string; email: string; name: string },
  oldRole: string,
  newRole: string,
  metadata?: AuditLogMetadata
): Promise<AuditLog> {
  return createAuditLog(
    tenantId,
    'user:role-change',
    actor,
    { type: 'user', id: targetUser.id, name: targetUser.name },
    {
      changes: {
        before: { role: oldRole },
        after: { role: newRole },
      },
      metadata,
      severity: 'warning',
      description: `Role changed from ${oldRole} to ${newRole} for ${targetUser.email}`,
    }
  );
}

/**
 * Helper: Log publicación de curso
 */
export async function logCoursePublish(
  tenantId: string,
  actor: AuditLogActor,
  course: { id: string; title: string },
  metadata?: AuditLogMetadata
): Promise<AuditLog> {
  return createAuditLog(
    tenantId,
    'course:publish',
    actor,
    { type: 'course', id: course.id, name: course.title },
    {
      metadata,
      severity: 'info',
      description: `Course "${course.title}" published`,
    }
  );
}

/**
 * Helper: Log acceso denegado
 */
export async function logAccessDenied(
  tenantId: string,
  actor: AuditLogActor,
  resource: AuditLogResource,
  requiredPermission: string,
  metadata?: AuditLogMetadata
): Promise<AuditLog> {
  return createAuditLog(
    tenantId,
    'security:access-denied',
    actor,
    resource,
    {
      metadata: {
        ...metadata,
        requiredPermission,
      },
      severity: 'warning',
      status: 'failure',
      description: `Access denied: ${actor.email} attempted to access ${resource.type}:${resource.id} without ${requiredPermission}`,
    }
  );
}
