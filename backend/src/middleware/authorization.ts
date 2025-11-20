/**
 * Authorization Middleware - Protección de Rutas
 * 
 * Middlewares para proteger endpoints con verificación de roles y permisos
 */

import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../models/User';
import { 
  hasPermission, 
  canAccessResource, 
  canChangeRole,
  Permission 
} from '../services/permissions.service';

/**
 * Extiende Request de Express para incluir el usuario autenticado
 */
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware: Requiere que el usuario esté autenticado
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
  
  next();
}

/**
 * Middleware: Requiere uno de los roles especificados
 * 
 * Uso:
 * app.get('/api/admin', requireAuth, requireRole('super-admin', 'tenant-admin'), handler)
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }
    
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        required: allowedRoles,
        current: user.role
      });
    }
    
    next();
  };
}

/**
 * Middleware: Requiere un permiso específico
 * 
 * Uso:
 * app.post('/api/courses', requireAuth, requirePermission('courses:create'), handler)
 */
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }
    
    const userHasPermission = hasPermission(user.role, permission, user.customPermissions);
    
    if (!userHasPermission) {
      return res.status(403).json({ 
        error: 'Permission denied',
        message: `You do not have permission to perform this action`,
        required: permission,
        role: user.role
      });
    }
    
    next();
  };
}

/**
 * Middleware: Requiere acceso a un recurso específico
 * 
 * Uso:
 * app.put('/api/courses/:courseId', requireAuth, requireResourceAccess('courses', 'update'), handler)
 */
export function requireResourceAccess(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }
    
    const hasAccess = canAccessResource(user.role, resource, action, user.customPermissions);
    
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `You do not have permission to ${action} ${resource}`,
        resource,
        action,
        role: user.role
      });
    }
    
    next();
  };
}

/**
 * Middleware: Requiere que el usuario sea el dueño del recurso o tenga permisos de admin
 * 
 * Uso:
 * app.put('/api/courses/:courseId', requireAuth, requireOwnershipOrAdmin('createdBy'), handler)
 */
export function requireOwnershipOrAdmin(resourceOwnerField: string = 'userId') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }
    
    // Super Admin y Tenant Admin tienen acceso completo
    if (user.role === 'super-admin' || user.role === 'tenant-admin') {
      return next();
    }
    
    // Content Manager puede editar cualquier curso
    if (user.role === 'content-manager') {
      return next();
    }
    
    // Obtener el recurso (asumimos que está en req.body o req.params)
    const resourceId = req.params.id || req.params.courseId || req.params.userId;
    
    // Esta es una verificación básica - en producción, deberías:
    // 1. Hacer query a la DB para obtener el recurso
    // 2. Verificar el campo resourceOwnerField
    // 3. Comparar con user.id
    
    // Por ahora, pasamos al siguiente middleware para que el handler lo maneje
    next();
  };
}

/**
 * Middleware: Verifica que el usuario puede cambiar el rol de otro usuario
 */
export function requireRoleChangePermission() {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }
    
    const { targetRole, newRole } = req.body;
    
    if (!targetRole || !newRole) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'targetRole and newRole are required'
      });
    }
    
    const canChange = canChangeRole(user.role, targetRole as UserRole, newRole as UserRole);
    
    if (!canChange) {
      return res.status(403).json({ 
        error: 'Permission denied',
        message: 'You cannot assign this role',
        currentUserRole: user.role,
        targetRole,
        newRole
      });
    }
    
    next();
  };
}

/**
 * Middleware: Requiere que el usuario esté activo
 */
export function requireActiveUser(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
  
  if (user.status !== 'active') {
    return res.status(403).json({ 
      error: 'Account inactive',
      message: 'Your account is not active. Please contact support.',
      status: user.status
    });
  }
  
  next();
}

/**
 * Middleware: Requiere que el usuario pertenezca al tenant especificado
 */
export function requireTenantAccess(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }
  
  const tenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;
  
  // Super Admin puede acceder a cualquier tenant
  if (user.role === 'super-admin') {
    return next();
  }
  
  // Otros usuarios solo pueden acceder a su propio tenant
  if (user.tenantId !== tenantId) {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'You do not have access to this organization',
      userTenant: user.tenantId,
      requestedTenant: tenantId
    });
  }
  
  next();
}

/**
 * Helper: Extrae el usuario del token JWT (deberías implementar esto según tu estrategia de auth)
 */
export function extractUserFromToken(token: string): User | null {
  // TODO: Implementar verificación de JWT
  // Por ahora, retorna null
  return null;
}
