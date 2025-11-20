/**
 * Tests for Authorization Middleware
 * 
 * Validates authentication and permission checking middleware
 */

import { Request, Response, NextFunction } from 'express';
import {
  requireAuth,
  requireRole,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireTenantAccess,
  requireResourceOwnership,
  requireRoleChangePermission,
} from '../src/middleware/authorization';
import type { User } from '../src/models/User';

// Mock response object
const createMockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

// Mock next function
const createMockNext = () => jest.fn() as NextFunction;

describe('Authorization Middleware', () => {
  describe('requireAuth', () => {
    it('should call next() if user is authenticated', () => {
      const req: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'user@example.com',
          role: 'student',
          firstName: 'Test',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      };
      const res = createMockResponse();
      const next = createMockNext();

      requireAuth(req as Request, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      const req: Partial<Request> = {};
      const res = createMockResponse();
      const next = createMockNext();

      requireAuth(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Authentication required',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should call next() if user has required role', () => {
      const req: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'admin@example.com',
          role: 'tenant-admin',
          firstName: 'Admin',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole('tenant-admin', 'super-admin');
      middleware(req as Request, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have required role', () => {
      const req: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'student@example.com',
          role: 'student',
          firstName: 'Student',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole('tenant-admin', 'super-admin');
      middleware(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Insufficient permissions',
          current: 'student',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      const req: Partial<Request> = {};
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole('student');
      middleware(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept multiple roles', () => {
      const instructor: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'instructor@example.com',
          role: 'instructor',
          firstName: 'Instructor',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRole('instructor', 'content-creator', 'tenant-admin');
      middleware(instructor as Request, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('requirePermission', () => {
    it('should call next() if user has permission via role', () => {
      const req: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'instructor@example.com',
          role: 'instructor',
          firstName: 'Instructor',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requirePermission('courses:create');
      middleware(req as Request, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() if user has permission via customPermissions', () => {
      const req: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'student@example.com',
          role: 'student',
          firstName: 'Student',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          customPermissions: ['courses:create'],
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requirePermission('courses:create');
      middleware(req as Request, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have permission', () => {
      const req: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'student@example.com',
          role: 'student',
          firstName: 'Student',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requirePermission('users:delete');
      middleware(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Permission denied',
          required: 'users:delete',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      const req: Partial<Request> = {};
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requirePermission('courses:read');
      middleware(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireAnyPermission', () => {
    it('should call next() if user has any of the required permissions', () => {
      const req: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'instructor@example.com',
          role: 'instructor',
          firstName: 'Instructor',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireAnyPermission(['courses:create', 'courses:publish']);
      middleware(req as Request, res, next);

      expect(next).toHaveBeenCalled(); // Has courses:create
    });

    it('should return 403 if user has none of the required permissions', () => {
      const req: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'student@example.com',
          role: 'student',
          firstName: 'Student',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireAnyPermission(['users:create', 'courses:publish']);
      middleware(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireAllPermissions', () => {
    it('should call next() if user has all required permissions', () => {
      const req: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'admin@example.com',
          role: 'tenant-admin',
          firstName: 'Admin',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireAllPermissions(['users:create', 'courses:publish']);
      middleware(req as Request, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user is missing any required permission', () => {
      const req: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'instructor@example.com',
          role: 'instructor',
          firstName: 'Instructor',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
      };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireAllPermissions(['courses:create', 'courses:publish']);
      middleware(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(403); // Missing courses:publish
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireTenantAccess', () => {
    it('should call next() if super-admin accesses any tenant', () => {
      const req: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'super@example.com',
          role: 'super-admin',
          firstName: 'Super',
          lastName: 'Admin',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        params: { tenantId: 'tenant-2' },
      };
      const res = createMockResponse();
      const next = createMockNext();

      requireTenantAccess(req as Request, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next() if user accesses their own tenant', () => {
      const req: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'admin@example.com',
          role: 'tenant-admin',
          firstName: 'Admin',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        params: { tenantId: 'tenant-1' },
      };
      const res = createMockResponse();
      const next = createMockNext();

      requireTenantAccess(req as Request, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user tries to access different tenant', () => {
      const req: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'admin@example.com',
          role: 'tenant-admin',
          firstName: 'Admin',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        params: { tenantId: 'tenant-2' },
      };
      const res = createMockResponse();
      const next = createMockNext();

      requireTenantAccess(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Tenant access denied',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should also check query params for tenantId', () => {
      const req: Partial<Request> = {
        user: {
          id: '1',
          tenantId: 'tenant-1',
          email: 'admin@example.com',
          role: 'tenant-admin',
          firstName: 'Admin',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        params: {},
        query: { tenantId: 'tenant-1' },
      };
      const res = createMockResponse();
      const next = createMockNext();

      requireTenantAccess(req as Request, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireResourceOwnership', () => {
    it('should call next() if user is the resource owner', () => {
      const req: Partial<Request> = {
        user: {
          id: 'user-123',
          tenantId: 'tenant-1',
          email: 'user@example.com',
          role: 'instructor',
          firstName: 'Instructor',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        params: { userId: 'user-123' },
      };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireResourceOwnership('userId');
      middleware(req as Request, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user is not the resource owner', () => {
      const req: Partial<Request> = {
        user: {
          id: 'user-123',
          tenantId: 'tenant-1',
          email: 'user@example.com',
          role: 'instructor',
          firstName: 'Instructor',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        params: { userId: 'user-456' },
      };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireResourceOwnership('userId');
      middleware(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if user is admin even without ownership', () => {
      const req: Partial<Request> = {
        user: {
          id: 'admin-1',
          tenantId: 'tenant-1',
          email: 'admin@example.com',
          role: 'tenant-admin',
          firstName: 'Admin',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        params: { userId: 'user-456' },
      };
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireResourceOwnership('userId');
      middleware(req as Request, res, next);

      expect(next).toHaveBeenCalled(); // Admin bypass
    });
  });

  describe('requireRoleChangePermission', () => {
    it('should call next() if admin changing to valid role', () => {
      const req: Partial<Request> = {
        user: {
          id: 'admin-1',
          tenantId: 'tenant-1',
          email: 'admin@example.com',
          role: 'tenant-admin',
          firstName: 'Admin',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        body: { newRole: 'instructor' },
      };
      const res = createMockResponse();
      const next = createMockNext();

      requireRoleChangePermission(req as Request, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if tenant-admin tries to create super-admin', () => {
      const req: Partial<Request> = {
        user: {
          id: 'admin-1',
          tenantId: 'tenant-1',
          email: 'admin@example.com',
          role: 'tenant-admin',
          firstName: 'Admin',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        body: { newRole: 'super-admin' },
      };
      const res = createMockResponse();
      const next = createMockNext();

      requireRoleChangePermission(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Role change not allowed',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow super-admin to change to any role', () => {
      const req: Partial<Request> = {
        user: {
          id: 'super-1',
          tenantId: 'tenant-1',
          email: 'super@example.com',
          role: 'super-admin',
          firstName: 'Super',
          lastName: 'Admin',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        body: { newRole: 'tenant-admin' },
      };
      const res = createMockResponse();
      const next = createMockNext();

      requireRoleChangePermission(req as Request, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 400 if newRole is missing', () => {
      const req: Partial<Request> = {
        user: {
          id: 'admin-1',
          tenantId: 'tenant-1',
          email: 'admin@example.com',
          role: 'tenant-admin',
          firstName: 'Admin',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        body: {},
      };
      const res = createMockResponse();
      const next = createMockNext();

      requireRoleChangePermission(req as Request, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('middleware chaining', () => {
    it('should properly chain requireAuth -> requireRole -> requirePermission', () => {
      const user: User = {
        id: '1',
        tenantId: 'tenant-1',
        email: 'admin@example.com',
        role: 'tenant-admin',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: 'hash',
        isActive: true,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      const req: Partial<Request> = { user };
      const res = createMockResponse();

      // Simulate middleware chain
      const next1 = jest.fn();
      requireAuth(req as Request, res, next1);
      expect(next1).toHaveBeenCalled();

      const next2 = jest.fn();
      const roleMiddleware = requireRole('tenant-admin', 'super-admin');
      roleMiddleware(req as Request, res, next2);
      expect(next2).toHaveBeenCalled();

      const next3 = jest.fn();
      const permMiddleware = requirePermission('users:create');
      permMiddleware(req as Request, res, next3);
      expect(next3).toHaveBeenCalled();
    });

    it('should stop chain at first failure', () => {
      const user: User = {
        id: '1',
        tenantId: 'tenant-1',
        email: 'student@example.com',
        role: 'student',
        firstName: 'Student',
        lastName: 'User',
        passwordHash: 'hash',
        isActive: true,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      const req: Partial<Request> = { user };
      const res = createMockResponse();

      // Auth passes
      const next1 = jest.fn();
      requireAuth(req as Request, res, next1);
      expect(next1).toHaveBeenCalled();

      // Role check fails
      const next2 = jest.fn();
      const roleMiddleware = requireRole('tenant-admin', 'super-admin');
      roleMiddleware(req as Request, res, next2);
      expect(next2).not.toHaveBeenCalled(); // Stopped here
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
