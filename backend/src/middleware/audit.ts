/**
 * Audit Middleware - Registro automático de eventos de auditoría
 * 
 * Middleware para Express que registra automáticamente acciones críticas
 */

import { Request, Response, NextFunction } from 'express';
import { createAuditLog, AuditAction, logAccessDenied } from '../functions/AuditFunctions';

/**
 * Extender Request para incluir audit metadata
 */
declare global {
  namespace Express {
    interface Request {
      auditMetadata?: {
        ipAddress?: string;
        userAgent?: string;
        requestId?: string;
      };
    }
  }
}

/**
 * Middleware para agregar metadata de auditoría al request
 */
export function attachAuditMetadata(req: Request, res: Response, next: NextFunction) {
  req.auditMetadata = {
    ipAddress: req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    requestId: req.headers['x-request-id'] as string || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  next();
}

/**
 * Middleware para auditar creación de recursos
 */
export function auditCreate(
  resourceType: string,
  getResourceInfo?: (req: Request, createdResource: any) => { id: string; name?: string | undefined }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Capturar el response original
    const originalJson = res.json.bind(res);
    
    res.json = function (body: any) {
      // Si fue exitoso (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Registrar en background (no bloquear response)
        setImmediate(async () => {
          try {
            if (req.user && req.user.tenantId) {
              let resourceInfo = { id: body.id, name: body.name || body.title };
              
              if (getResourceInfo) {
                resourceInfo = getResourceInfo(req, body);
              }
              
              await createAuditLog(
                req.user.tenantId,
                `${resourceType}:create` as AuditAction,
                {
                  userId: req.user.id,
                  email: req.user.email,
                  role: req.user.role,
                  name: `${req.user.firstName} ${req.user.lastName}`,
                },
                {
                  type: resourceType,
                  id: resourceInfo.id,
                  name: resourceInfo.name,
                },
                {
                  metadata: req.auditMetadata,
                  severity: 'info',
                  description: `${resourceType} created: ${resourceInfo.name || resourceInfo.id}`,
                }
              );
            }
          } catch (error) {
            console.error('[AUDIT MIDDLEWARE] Error logging create:', error);
          }
        });
      }
      
      return originalJson(body);
    };
    
    next();
  };
}

/**
 * Middleware para auditar actualización de recursos
 */
export function auditUpdate(
  resourceType: string,
  getResourceInfo?: (req: Request) => { id: string; name?: string | undefined },
  captureChanges?: (req: Request) => { before: any; after: any }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setImmediate(async () => {
          try {
            if (req.user && req.user.tenantId) {
              let resourceInfo = { 
                id: req.params.id || req.params.userId || req.params.courseId, 
                name: body.name || body.title 
              };
              
              if (getResourceInfo) {
                resourceInfo = getResourceInfo(req);
              }
              
              const changes = captureChanges ? captureChanges(req) : undefined;
              
              await createAuditLog(
                req.user.tenantId,
                `${resourceType}:update` as AuditAction,
                {
                  userId: req.user.id,
                  email: req.user.email,
                  role: req.user.role,
                  name: `${req.user.firstName} ${req.user.lastName}`,
                },
                {
                  type: resourceType,
                  id: resourceInfo.id,
                  name: resourceInfo.name,
                },
                {
                  changes,
                  metadata: req.auditMetadata,
                  severity: 'info',
                  description: `${resourceType} updated: ${resourceInfo.name || resourceInfo.id}`,
                }
              );
            }
          } catch (error) {
            console.error('[AUDIT MIDDLEWARE] Error logging update:', error);
          }
        });
      }
      
      return originalJson(body);
    };
    
    next();
  };
}

/**
 * Middleware para auditar eliminación de recursos
 */
export function auditDelete(
  resourceType: string,
  getResourceInfo?: (req: Request) => { id: string; name?: string | undefined }
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setImmediate(async () => {
          try {
            if (req.user && req.user.tenantId) {
              let resourceInfo = { 
                id: req.params.id || req.params.userId || req.params.courseId,
                name: undefined as string | undefined
              };
              
              if (getResourceInfo) {
                resourceInfo = getResourceInfo(req);
              }
              
              await createAuditLog(
                req.user.tenantId,
                `${resourceType}:delete` as AuditAction,
                {
                  userId: req.user.id,
                  email: req.user.email,
                  role: req.user.role,
                  name: `${req.user.firstName} ${req.user.lastName}`,
                },
                {
                  type: resourceType,
                  id: resourceInfo.id,
                  name: resourceInfo.name,
                },
                {
                  metadata: req.auditMetadata,
                  severity: 'warning',
                  description: `${resourceType} deleted: ${resourceInfo.name || resourceInfo.id}`,
                }
              );
            }
          } catch (error) {
            console.error('[AUDIT MIDDLEWARE] Error logging delete:', error);
          }
        });
      }
      
      return originalJson(body);
    };
    
    next();
  };
}

/**
 * Middleware para auditar accesos denegados (usar después de requirePermission)
 */
export function auditAccessDenied(resourceType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalStatus = res.status.bind(res);
    
    res.status = function (code: number) {
      if (code === 403 && req.user && req.user.tenantId) {
        setImmediate(async () => {
          try {
            const resourceId = req.params.id || req.params.userId || req.params.courseId || 'unknown';
            
            await logAccessDenied(
              req.user!.tenantId,
              {
                userId: req.user!.id,
                email: req.user!.email,
                role: req.user!.role,
                name: `${req.user!.firstName} ${req.user!.lastName}`,
              },
              {
                type: resourceType,
                id: resourceId,
              },
              'unknown', // Se podría extraer del mensaje de error
              req.auditMetadata
            );
          } catch (error) {
            console.error('[AUDIT MIDDLEWARE] Error logging access denied:', error);
          }
        });
      }
      
      return originalStatus(code);
    };
    
    next();
  };
}

/**
 * Middleware específico para auditar cambios de rol
 */
export function auditRoleChange() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Guardar el rol anterior antes de la operación
    const oldRole = req.body.oldRole; // Debe ser pasado en el request body
    
    const originalJson = res.json.bind(res);
    
    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300 && oldRole) {
        setImmediate(async () => {
          try {
            if (req.user && req.user.tenantId) {
              const { logRoleChange } = await import('../functions/AuditFunctions');
              
              await logRoleChange(
                req.user.tenantId,
                {
                  userId: req.user.id,
                  email: req.user.email,
                  role: req.user.role,
                  name: `${req.user.firstName} ${req.user.lastName}`,
                },
                {
                  id: req.params.userId || body.id,
                  email: body.email,
                  name: `${body.firstName} ${body.lastName}`,
                },
                oldRole,
                body.role,
                req.auditMetadata
              );
            }
          } catch (error) {
            console.error('[AUDIT MIDDLEWARE] Error logging role change:', error);
          }
        });
      }
      
      return originalJson(body);
    };
    
    next();
  };
}

/**
 * Middleware específico para auditar publicación de cursos
 */
export function auditCoursePublish() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        setImmediate(async () => {
          try {
            if (req.user && req.user.tenantId) {
              const { logCoursePublish } = await import('../functions/AuditFunctions');
              
              await logCoursePublish(
                req.user.tenantId,
                {
                  userId: req.user.id,
                  email: req.user.email,
                  role: req.user.role,
                  name: `${req.user.firstName} ${req.user.lastName}`,
                },
                {
                  id: req.params.courseId || body.id,
                  title: body.title,
                },
                req.auditMetadata
              );
            }
          } catch (error) {
            console.error('[AUDIT MIDDLEWARE] Error logging course publish:', error);
          }
        });
      }
      
      return originalJson(body);
    };
    
    next();
  };
}
