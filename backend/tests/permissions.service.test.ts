/**
 * Tests for Permissions Service
 * 
 * Validates permission matrix and hasPermission logic
 */

import { hasPermission, ROLE_PERMISSIONS } from '../src/services/permissions.service';
import type { User } from '../src/models/User';

describe('Permissions Service', () => {
  describe('ROLE_PERMISSIONS matrix', () => {
    it('should have permissions defined for all 8 roles', () => {
      expect(ROLE_PERMISSIONS['super-admin']).toBeDefined();
      expect(ROLE_PERMISSIONS['tenant-admin']).toBeDefined();
      expect(ROLE_PERMISSIONS['instructor']).toBeDefined();
      expect(ROLE_PERMISSIONS['content-creator']).toBeDefined();
      expect(ROLE_PERMISSIONS['mentor']).toBeDefined();
      expect(ROLE_PERMISSIONS['team-lead']).toBeDefined();
      expect(ROLE_PERMISSIONS['student']).toBeDefined();
      expect(ROLE_PERMISSIONS['viewer']).toBeDefined();
    });

    it('should give super-admin all permissions', () => {
      const superAdminPerms = ROLE_PERMISSIONS['super-admin'];
      expect(superAdminPerms.length).toBeGreaterThan(70);
      expect(superAdminPerms).toContain('tenants:create');
      expect(superAdminPerms).toContain('tenants:delete');
      expect(superAdminPerms).toContain('users:change-role');
      expect(superAdminPerms).toContain('audit:view-logs');
    });

    it('should give tenant-admin tenant management permissions', () => {
      const tenantAdminPerms = ROLE_PERMISSIONS['tenant-admin'];
      expect(tenantAdminPerms).toContain('users:create');
      expect(tenantAdminPerms).toContain('users:change-role');
      expect(tenantAdminPerms).toContain('courses:publish');
      expect(tenantAdminPerms).toContain('analytics:view-all');
      expect(tenantAdminPerms).toContain('settings:branding');
      // Should NOT have cross-tenant permissions
      expect(tenantAdminPerms).not.toContain('tenants:create');
      expect(tenantAdminPerms).not.toContain('tenants:delete');
    });

    it('should give instructor course creation permissions', () => {
      const instructorPerms = ROLE_PERMISSIONS['instructor'];
      expect(instructorPerms).toContain('courses:create');
      expect(instructorPerms).toContain('courses:read');
      expect(instructorPerms).toContain('courses:update');
      expect(instructorPerms).toContain('courses:list-own');
      expect(instructorPerms).toContain('analytics:view-own');
      // Should NOT be able to publish without approval
      expect(instructorPerms).not.toContain('courses:publish');
    });

    it('should give content-creator only content creation permissions', () => {
      const creatorPerms = ROLE_PERMISSIONS['content-creator'];
      expect(creatorPerms).toContain('courses:create');
      expect(creatorPerms).toContain('courses:update');
      expect(creatorPerms).toContain('assets:upload');
      // Should NOT manage users or settings
      expect(creatorPerms).not.toContain('users:create');
      expect(creatorPerms).not.toContain('settings:branding');
    });

    it('should give mentor mentorship-specific permissions', () => {
      const mentorPerms = ROLE_PERMISSIONS['mentor'];
      expect(mentorPerms).toContain('mentorship:view-own-sessions');
      expect(mentorPerms).toContain('mentorship:accept-requests');
      expect(mentorPerms).toContain('mentorship:rate-sessions');
      expect(mentorPerms).toContain('courses:read');
      // Should NOT configure mentorship system
      expect(mentorPerms).not.toContain('mentorship:configure');
    });

    it('should give team-lead group management permissions', () => {
      const teamLeadPerms = ROLE_PERMISSIONS['team-lead'];
      expect(teamLeadPerms).toContain('groups:create');
      expect(teamLeadPerms).toContain('groups:assign-users');
      expect(teamLeadPerms).toContain('groups:assign-courses');
      expect(teamLeadPerms).toContain('analytics:view-team-stats');
      expect(teamLeadPerms).toContain('enrollment:assign-individual');
      // Should NOT manage all analytics
      expect(teamLeadPerms).not.toContain('analytics:view-all');
    });

    it('should give student minimal read permissions', () => {
      const studentPerms = ROLE_PERMISSIONS['student'];
      expect(studentPerms).toContain('courses:read');
      expect(studentPerms).toContain('enrollment:view');
      expect(studentPerms).toContain('analytics:view-own');
      expect(studentPerms).toContain('mentorship:view-own-sessions');
      // Should NOT create or manage anything
      expect(studentPerms).not.toContain('courses:create');
      expect(studentPerms).not.toContain('users:create');
      expect(studentPerms.length).toBeLessThan(15);
    });

    it('should give viewer only read permissions', () => {
      const viewerPerms = ROLE_PERMISSIONS['viewer'];
      expect(viewerPerms).toContain('courses:read');
      expect(viewerPerms).toContain('enrollment:view');
      // Should NOT have any write permissions
      expect(viewerPerms.every(p => p.includes(':read') || p.includes(':view'))).toBe(true);
      expect(viewerPerms.length).toBeLessThan(10);
    });
  });

  describe('hasPermission function', () => {
    describe('role-based permissions', () => {
      it('should grant permission if user role has it', () => {
        const superAdmin: User = {
          id: '1',
          tenantId: 'tenant-1',
          email: 'admin@example.com',
          role: 'super-admin',
          firstName: 'Super',
          lastName: 'Admin',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        expect(hasPermission(superAdmin, 'tenants:create')).toBe(true);
        expect(hasPermission(superAdmin, 'users:delete')).toBe(true);
        expect(hasPermission(superAdmin, 'courses:publish')).toBe(true);
      });

      it('should deny permission if user role does not have it', () => {
        const student: User = {
          id: '2',
          tenantId: 'tenant-1',
          email: 'student@example.com',
          role: 'student',
          firstName: 'John',
          lastName: 'Student',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        expect(hasPermission(student, 'users:create')).toBe(false);
        expect(hasPermission(student, 'courses:publish')).toBe(false);
        expect(hasPermission(student, 'settings:branding')).toBe(false);
      });

      it('should allow student to read courses', () => {
        const student: User = {
          id: '2',
          tenantId: 'tenant-1',
          email: 'student@example.com',
          role: 'student',
          firstName: 'John',
          lastName: 'Student',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        expect(hasPermission(student, 'courses:read')).toBe(true);
        expect(hasPermission(student, 'enrollment:view')).toBe(true);
      });
    });

    describe('custom permissions', () => {
      it('should grant permission if in customPermissions array', () => {
        const studentWithCustomPerm: User = {
          id: '3',
          tenantId: 'tenant-1',
          email: 'special@example.com',
          role: 'student',
          firstName: 'Special',
          lastName: 'Student',
          passwordHash: 'hash',
          isActive: true,
          customPermissions: ['courses:create', 'assets:upload'],
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        expect(hasPermission(studentWithCustomPerm, 'courses:create')).toBe(true);
        expect(hasPermission(studentWithCustomPerm, 'assets:upload')).toBe(true);
      });

      it('should combine role permissions with custom permissions', () => {
        const student: User = {
          id: '4',
          tenantId: 'tenant-1',
          email: 'hybrid@example.com',
          role: 'student',
          firstName: 'Hybrid',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          customPermissions: ['analytics:export'],
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        // Role permission
        expect(hasPermission(student, 'courses:read')).toBe(true);
        // Custom permission
        expect(hasPermission(student, 'analytics:export')).toBe(true);
        // Neither role nor custom
        expect(hasPermission(student, 'users:delete')).toBe(false);
      });

      it('should work when customPermissions is undefined', () => {
        const instructor: User = {
          id: '5',
          tenantId: 'tenant-1',
          email: 'instructor@example.com',
          role: 'instructor',
          firstName: 'John',
          lastName: 'Instructor',
          passwordHash: 'hash',
          isActive: true,
          // customPermissions: undefined (implicit)
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        expect(hasPermission(instructor, 'courses:create')).toBe(true);
        expect(hasPermission(instructor, 'users:delete')).toBe(false);
      });

      it('should work when customPermissions is empty array', () => {
        const mentor: User = {
          id: '6',
          tenantId: 'tenant-1',
          email: 'mentor@example.com',
          role: 'mentor',
          firstName: 'Jane',
          lastName: 'Mentor',
          passwordHash: 'hash',
          isActive: true,
          customPermissions: [],
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        expect(hasPermission(mentor, 'mentorship:accept-requests')).toBe(true);
        expect(hasPermission(mentor, 'users:create')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should return false for invalid permission strings', () => {
        const user: User = {
          id: '7',
          tenantId: 'tenant-1',
          email: 'user@example.com',
          role: 'student',
          firstName: 'Test',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        expect(hasPermission(user, 'invalid:permission' as any)).toBe(false);
        expect(hasPermission(user, '' as any)).toBe(false);
      });

      it('should handle case-sensitive permission checks', () => {
        const user: User = {
          id: '8',
          tenantId: 'tenant-1',
          email: 'user@example.com',
          role: 'instructor',
          firstName: 'Test',
          lastName: 'User',
          passwordHash: 'hash',
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        // Correct case
        expect(hasPermission(user, 'courses:create')).toBe(true);
        // Wrong case should fail
        expect(hasPermission(user, 'COURSES:CREATE' as any)).toBe(false);
        expect(hasPermission(user, 'Courses:Create' as any)).toBe(false);
      });
    });

    describe('real-world scenarios', () => {
      it('should handle instructor with course:publish custom permission', () => {
        const seniorInstructor: User = {
          id: '9',
          tenantId: 'tenant-1',
          email: 'senior@example.com',
          role: 'instructor',
          firstName: 'Senior',
          lastName: 'Instructor',
          passwordHash: 'hash',
          isActive: true,
          customPermissions: ['courses:publish'],
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        // Role permissions
        expect(hasPermission(seniorInstructor, 'courses:create')).toBe(true);
        expect(hasPermission(seniorInstructor, 'courses:update')).toBe(true);
        // Custom permission (normally only admins can publish)
        expect(hasPermission(seniorInstructor, 'courses:publish')).toBe(true);
        // Still can't do admin stuff
        expect(hasPermission(seniorInstructor, 'users:create')).toBe(false);
      });

      it('should handle team-lead with analytics:view-all custom permission', () => {
        const seniorLead: User = {
          id: '10',
          tenantId: 'tenant-1',
          email: 'lead@example.com',
          role: 'team-lead',
          firstName: 'Team',
          lastName: 'Lead',
          passwordHash: 'hash',
          isActive: true,
          customPermissions: ['analytics:view-all'],
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        // Role permissions
        expect(hasPermission(seniorLead, 'groups:create')).toBe(true);
        expect(hasPermission(seniorLead, 'analytics:view-team-stats')).toBe(true);
        // Custom permission (elevated analytics access)
        expect(hasPermission(seniorLead, 'analytics:view-all')).toBe(true);
      });

      it('should handle content-creator with mentor permissions', () => {
        const hybridUser: User = {
          id: '11',
          tenantId: 'tenant-1',
          email: 'hybrid@example.com',
          role: 'content-creator',
          firstName: 'Hybrid',
          lastName: 'Creator',
          passwordHash: 'hash',
          isActive: true,
          customPermissions: [
            'mentorship:accept-requests',
            'mentorship:rate-sessions'
          ],
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        // Role permissions (content creator)
        expect(hasPermission(hybridUser, 'courses:create')).toBe(true);
        expect(hasPermission(hybridUser, 'assets:upload')).toBe(true);
        // Custom permissions (mentor capabilities)
        expect(hasPermission(hybridUser, 'mentorship:accept-requests')).toBe(true);
        expect(hasPermission(hybridUser, 'mentorship:rate-sessions')).toBe(true);
        // Still no admin permissions
        expect(hasPermission(hybridUser, 'users:create')).toBe(false);
      });
    });
  });
});
