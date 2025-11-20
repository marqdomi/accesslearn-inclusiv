/**
 * Tests for RequireRole Component
 * 
 * Validates role-based rendering
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequireRole } from '../RequireRole';
import type { User } from '@/lib/types';

// Mock useAuth
let currentUser: User | null = null;

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: currentUser }),
}));

describe('RequireRole Component', () => {
  beforeEach(() => {
    currentUser = null;
  });

  it('should render children when user has required role', () => {
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
      <RequireRole roles="tenant-admin">
        <div>Admin Content</div>
      </RequireRole>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should not render children when user lacks role', () => {
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
      <RequireRole roles="tenant-admin">
        <div>Admin Content</div>
      </RequireRole>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should render fallback when user lacks role', () => {
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
      <RequireRole roles="tenant-admin" fallback={<div>Access Denied</div>}>
        <div>Admin Content</div>
      </RequireRole>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
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
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    render(
      <RequireRole roles={['instructor', 'content-manager', 'tenant-admin']}>
        <div>Instructor Content</div>
      </RequireRole>
    );

    expect(screen.getByText('Instructor Content')).toBeInTheDocument();
  });

  it('should not render when user is not logged in', () => {
    currentUser = null;

    render(
      <RequireRole roles="student">
        <div>Student Content</div>
      </RequireRole>
    );

    expect(screen.queryByText('Student Content')).not.toBeInTheDocument();
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
      <RequireRole roles="tenant-admin">
        <div>Admin Content</div>
      </RequireRole>
    );

    expect(container.textContent).toBe('');
  });

  it('should work with super-admin role', () => {
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
      <RequireRole roles="super-admin">
        <div>Super Admin Dashboard</div>
      </RequireRole>
    );

    expect(screen.getByText('Super Admin Dashboard')).toBeInTheDocument();
  });

  it('should work with mentor role', () => {
    currentUser = {
      id: '1',
      tenantId: 'tenant-1',
      email: 'mentor@example.com',
      role: 'mentor',
      firstName: 'Jane',
      lastName: 'Mentor',
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    render(
      <RequireRole roles="mentor">
        <div>Mentorship Dashboard</div>
      </RequireRole>
    );

    expect(screen.getByText('Mentorship Dashboard')).toBeInTheDocument();
  });
});
