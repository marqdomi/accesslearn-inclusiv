/**
 * Tests for usePermissions Hook
 * 
 * Validates permission checking in React components
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePermissions, useHasRole, useCanAccess } from '../use-permissions';
import type { User } from '@/lib/types';

// Mock AuthContext
const mockUser: User | null = null;
let currentUser: User | null = null;

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: currentUser }),
}));

describe('usePermissions Hook', () => {
  beforeEach(() => {
    currentUser = null;
  });

  describe('hasPermission', () => {
    it('should return false when user is not logged in', () => {
      currentUser = null;
      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('courses:read')).toBe(false);
    });

    it('should return true for super-admin with any permission', () => {
      currentUser = {
        id: '1',
        tenantId: 'tenant-1',
        email: 'super@example.com',
        role: 'super-admin',
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('tenants:create')).toBe(true);
      expect(result.current.hasPermission('users:delete')).toBe(true);
      expect(result.current.hasPermission('courses:publish')).toBe(true);
      expect(result.current.hasPermission('settings:branding')).toBe(true);
    });

    it('should return true for tenant-admin with tenant management permissions', () => {
      currentUser = {
        id: '2',
        tenantId: 'tenant-1',
        email: 'admin@example.com',
        role: 'tenant-admin',
        firstName: 'Tenant',
        lastName: 'Admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('users:create')).toBe(true);
      expect(result.current.hasPermission('courses:publish')).toBe(true);
      expect(result.current.hasPermission('settings:branding')).toBe(true);
      // Should NOT have super-admin only permissions
      expect(result.current.hasPermission('tenants:create')).toBe(false);
    });

    it('should return true for instructor with course creation permissions', () => {
      currentUser = {
        id: '3',
        tenantId: 'tenant-1',
        email: 'instructor@example.com',
        role: 'instructor',
        firstName: 'John',
        lastName: 'Instructor',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('courses:create')).toBe(true);
      expect(result.current.hasPermission('courses:read')).toBe(true);
      expect(result.current.hasPermission('courses:update')).toBe(true);
      // Should NOT be able to publish
      expect(result.current.hasPermission('courses:publish')).toBe(false);
    });

    it('should return true for student with minimal permissions', () => {
      currentUser = {
        id: '4',
        tenantId: 'tenant-1',
        email: 'student@example.com',
        role: 'student',
        firstName: 'Jane',
        lastName: 'Student',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('courses:read')).toBe(true);
      expect(result.current.hasPermission('analytics:view-own')).toBe(true);
      // Should NOT have write permissions
      expect(result.current.hasPermission('courses:create')).toBe(false);
      expect(result.current.hasPermission('users:create')).toBe(false);
    });

    it('should support custom permissions', () => {
      currentUser = {
        id: '5',
        tenantId: 'tenant-1',
        email: 'special@example.com',
        role: 'student',
        firstName: 'Special',
        lastName: 'Student',
        customPermissions: ['courses:create', 'analytics:export'],
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePermissions());

      // Role permission
      expect(result.current.hasPermission('courses:read')).toBe(true);
      // Custom permissions
      expect(result.current.hasPermission('courses:create')).toBe(true);
      expect(result.current.hasPermission('analytics:export')).toBe(true);
      // Should NOT have other permissions
      expect(result.current.hasPermission('users:delete')).toBe(false);
    });

    it('should work with undefined customPermissions', () => {
      currentUser = {
        id: '6',
        tenantId: 'tenant-1',
        email: 'mentor@example.com',
        role: 'mentor',
        firstName: 'Jane',
        lastName: 'Mentor',
        // customPermissions: undefined
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasPermission('mentorship:accept-requests')).toBe(true);
      expect(result.current.hasPermission('users:create')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the permissions', () => {
      currentUser = {
        id: '1',
        tenantId: 'tenant-1',
        email: 'instructor@example.com',
        role: 'instructor',
        firstName: 'John',
        lastName: 'Instructor',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAnyPermission(['courses:create', 'courses:publish'])
      ).toBe(true); // Has courses:create
    });

    it('should return false if user has none of the permissions', () => {
      currentUser = {
        id: '1',
        tenantId: 'tenant-1',
        email: 'student@example.com',
        role: 'student',
        firstName: 'Jane',
        lastName: 'Student',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAnyPermission(['users:create', 'courses:publish'])
      ).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all permissions', () => {
      currentUser = {
        id: '1',
        tenantId: 'tenant-1',
        email: 'admin@example.com',
        role: 'tenant-admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions(['users:create', 'courses:publish'])
      ).toBe(true);
    });

    it('should return false if user is missing any permission', () => {
      currentUser = {
        id: '1',
        tenantId: 'tenant-1',
        email: 'instructor@example.com',
        role: 'instructor',
        firstName: 'John',
        lastName: 'Instructor',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.hasAllPermissions(['courses:create', 'courses:publish'])
      ).toBe(false); // Missing courses:publish
    });
  });

  describe('canAccessResource', () => {
    it('should allow super-admin to access any tenant resource', () => {
      currentUser = {
        id: '1',
        tenantId: 'tenant-1',
        email: 'super@example.com',
        role: 'super-admin',
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canAccessResource('tenant-2')).toBe(true);
    });

    it('should allow user to access their own tenant', () => {
      currentUser = {
        id: '1',
        tenantId: 'tenant-1',
        email: 'admin@example.com',
        role: 'tenant-admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canAccessResource('tenant-1')).toBe(true);
    });

    it('should deny user from accessing other tenants', () => {
      currentUser = {
        id: '1',
        tenantId: 'tenant-1',
        email: 'admin@example.com',
        role: 'tenant-admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canAccessResource('tenant-2')).toBe(false);
    });
  });
});

describe('useHasRole Hook', () => {
  beforeEach(() => {
    currentUser = null;
  });

  it('should return true if user has the specified role', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'admin@example.com',
      role: 'tenant-admin',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const { result } = renderHook(() => useHasRole('tenant-admin'));

    expect(result.current).toBe(true);
  });

  it('should return false if user has different role', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'student@example.com',
      role: 'student',
      firstName: 'Jane',
      lastName: 'Student',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const { result } = renderHook(() => useHasRole('tenant-admin'));

    expect(result.current).toBe(false);
  });

  it('should return false if user is not logged in', () => {
    currentUser = null;

    const { result } = renderHook(() => useHasRole('student'));

    expect(result.current).toBe(false);
  });

  it('should support multiple roles (OR logic)', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'instructor@example.com',
      role: 'instructor',
      firstName: 'John',
      lastName: 'Instructor',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const { result } = renderHook(() =>
      useHasRole('instructor', 'content-manager', 'tenant-admin')
    );

    expect(result.current).toBe(true);
  });
});

describe('useCanAccess Hook', () => {
  beforeEach(() => {
    currentUser = null;
  });

  it('should return true if user has the permission', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'instructor@example.com',
      role: 'instructor',
      firstName: 'John',
      lastName: 'Instructor',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const { result } = renderHook(() => useCanAccess('courses:create'));

    expect(result.current).toBe(true);
  });

  it('should return false if user lacks the permission', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'student@example.com',
      role: 'student',
      firstName: 'Jane',
      lastName: 'Student',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const { result } = renderHook(() => useCanAccess('courses:publish'));

    expect(result.current).toBe(false);
  });

  it('should return false if user is not logged in', () => {
    currentUser = null;

    const { result } = renderHook(() => useCanAccess('courses:read'));

    expect(result.current).toBe(false);
  });
});
