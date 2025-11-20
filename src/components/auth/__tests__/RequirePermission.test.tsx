/**
 * Tests for RequirePermission Component
 * 
 * Validates permission-based rendering
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequirePermission } from '../RequirePermission';
import type { User } from '@/lib/types';

// Mock useAuth
let currentUser: User | null = null;

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: currentUser }),
}));

describe('RequirePermission Component', () => {
  beforeEach(() => {
    currentUser = null;
  });

  it('should render children when user has required permission', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'instructor@example.com',
      role: 'instructor',
      firstName: 'John',
      lastName: 'Instructor',
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    render(
      <RequirePermission permission="courses:create">
        <div>Create Course Button</div>
      </RequirePermission>
    );

    expect(screen.getByText('Create Course Button')).toBeInTheDocument();
  });

  it('should not render children when user lacks permission', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'student@example.com',
      role: 'student',
      firstName: 'Jane',
      lastName: 'Student',
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    render(
      <RequirePermission permission="courses:create">
        <div>Create Course Button</div>
      </RequirePermission>
    );

    expect(screen.queryByText('Create Course Button')).not.toBeInTheDocument();
  });

  it('should render fallback when user lacks permission', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'student@example.com',
      role: 'student',
      firstName: 'Jane',
      lastName: 'Student',
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    render(
      <RequirePermission
        permission="users:create"
        fallback={<div>Insufficient Permissions</div>}
      >
        <div>Create User Button</div>
      </RequirePermission>
    );

    expect(screen.getByText('Insufficient Permissions')).toBeInTheDocument();
    expect(screen.queryByText('Create User Button')).not.toBeInTheDocument();
  });

  it('should support custom permissions', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'special@example.com',
      role: 'student',
      firstName: 'Special',
      lastName: 'Student',
      customPermissions: ['courses:publish'],
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    render(
      <RequirePermission permission="courses:publish">
        <div>Publish Course Button</div>
      </RequirePermission>
    );

    expect(screen.getByText('Publish Course Button')).toBeInTheDocument();
  });

  it('should support array of permissions with ANY logic (default)', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'instructor@example.com',
      role: 'instructor',
      firstName: 'John',
      lastName: 'Instructor',
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    render(
      <RequirePermission permission={['courses:create', 'courses:publish']}>
        <div>Course Actions</div>
      </RequirePermission>
    );

    // Has courses:create, so should render even without courses:publish
    expect(screen.getByText('Course Actions')).toBeInTheDocument();
  });

  it('should support array of permissions with ALL logic', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'instructor@example.com',
      role: 'instructor',
      firstName: 'John',
      lastName: 'Instructor',
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    render(
      <RequirePermission
        permission={['courses:create', 'courses:publish']}
        requireAll={true}
      >
        <div>Full Course Management</div>
      </RequirePermission>
    );

    // Has courses:create but NOT courses:publish, so should not render
    expect(screen.queryByText('Full Course Management')).not.toBeInTheDocument();
  });

  it('should support array of permissions with ALL logic when user has all', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'admin@example.com',
      role: 'tenant-admin',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    render(
      <RequirePermission
        permission={['users:create', 'courses:publish']}
        requireAll={true}
      >
        <div>Admin Panel</div>
      </RequirePermission>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('should not render when user is not logged in', () => {
    currentUser = null;

    render(
      <RequirePermission permission="courses:read">
        <div>Course Content</div>
      </RequirePermission>
    );

    expect(screen.queryByText('Course Content')).not.toBeInTheDocument();
  });

  it('should render null fallback by default', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'student@example.com',
      role: 'student',
      firstName: 'Jane',
      lastName: 'Student',
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    const { container } = render(
      <RequirePermission permission="users:delete">
        <div>Delete User Button</div>
      </RequirePermission>
    );

    expect(container.textContent).toBe('');
  });

  it('should work with super-admin having all permissions', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'super@example.com',
      role: 'super-admin',
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    render(
      <RequirePermission permission="tenants:create">
        <div>Create Tenant</div>
      </RequirePermission>
    );

    expect(screen.getByText('Create Tenant')).toBeInTheDocument();
  });

  it('should work with analytics permissions', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'admin@example.com',
      role: 'tenant-admin',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    render(
      <RequirePermission permission="analytics:view-all">
        <div>Analytics Dashboard</div>
      </RequirePermission>
    );

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  it('should work with audit permissions', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'admin@example.com',
      role: 'tenant-admin',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    render(
      <RequirePermission permission="audit:view-logs">
        <div>Audit Logs</div>
      </RequirePermission>
    );

    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });
});
