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
      expect(ROLE_PERMISSIONS['content-manager']).toBeDefined();
      expect(ROLE_PERMISSIONS['mentor']).toBeDefined();
      expect(ROLE_PERMISSIONS['user-manager']).toBeDefined();
      expect(ROLE_PERMISSIONS['student']).toBeDefined();
      expect(ROLE_PERMISSIONS['analytics-viewer']).toBeDefined();
    });

    it('should give super-admin all permissions', () => {
      const superAdminPerms = ROLE_PERMISSIONS['super-admin'];
      expect(superAdminPerms.length).toBeGreaterThanOrEqual(53);
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
      const creatorPerms = ROLE_PERMISSIONS['content-manager'];
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
      const teamLeadPerms = ROLE_PERMISSIONS['user-manager'];
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
      expect(studentPerms).toContain('analytics:view-own');
      expect(studentPerms).toContain('mentorship:view-own-sessions');
      // Should NOT create or manage anything
      expect(studentPerms).not.toContain('courses:create');
      expect(studentPerms).not.toContain('users:create');
      expect(studentPerms.length).toBeLessThan(15);
    });

    it('should give viewer only read permissions', () => {
      const viewerPerms = ROLE_PERMISSIONS['analytics-viewer'];
      expect(viewerPerms).toContain('courses:list-all');
      expect(viewerPerms).toContain('analytics:view-all');
      // Should NOT have any write permissions
      expect(viewerPerms.every((p: string) => p.includes(':list') || p.includes(':view') || p.includes(':export'))).toBe(true);
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
          status: 'active' as const,
          enrolledCourses: [],
          completedCourses: [],
          totalXP: 0,
          level: 1,
          badges: [],
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        expect(hasPermission(superAdmin.role, 'tenants:create', superAdmin.customPermissions)).toBe(true);
        expect(hasPermission(superAdmin.role, 'users:delete', superAdmin.customPermissions)).toBe(true);
        expect(hasPermission(superAdmin.role, 'courses:publish', superAdmin.customPermissions)).toBe(true);
      });

      it('should deny permission if user role does not have it', () => {
        const student: User = {
          id: '2',
          tenantId: 'tenant-1',
          email: 'student@example.com',
          role: 'student',
          firstName: 'John',
          lastName: 'Student',
          status: 'active' as const,
          enrolledCourses: [],
          completedCourses: [],
          totalXP: 0,
          level: 1,
          badges: [],
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        expect(hasPermission(student.role, 'users:create', student.customPermissions)).toBe(false);
        expect(hasPermission(student.role, 'courses:publish', student.customPermissions)).toBe(false);
        expect(hasPermission(student.role, 'settings:branding', student.customPermissions)).toBe(false);
      });

      it('should allow student to read courses', () => {
        const student: User = {
          id: '2',
          tenantId: 'tenant-1',
          email: 'student@example.com',
          role: 'student',
          firstName: 'John',
          lastName: 'Student',
          status: 'active' as const,
          enrolledCourses: [],
          completedCourses: [],
          totalXP: 0,
          level: 1,
          badges: [],
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        expect(hasPermission(student.role, 'courses:read', student.customPermissions)).toBe(true);
        expect(hasPermission(student.role, 'analytics:view-own', student.customPermissions)).toBe(true);
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
          status: 'active' as const,
          enrolledCourses: [],
          completedCourses: [],
          totalXP: 0,
          level: 1,
          badges: [],
          updatedAt: new Date().toISOString(),
          customPermissions: ['courses:create', 'assets:upload'],
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        expect(hasPermission(studentWithCustomPerm.role, 'courses:create', studentWithCustomPerm.customPermissions)).toBe(true);
        expect(hasPermission(studentWithCustomPerm.role, 'assets:upload', studentWithCustomPerm.customPermissions)).toBe(true);
      });

      it('should combine role permissions with custom permissions', () => {
        const student: User = {
          id: '4',
          tenantId: 'tenant-1',
          email: 'hybrid@example.com',
          role: 'student',
          firstName: 'Hybrid',
          lastName: 'User',
          status: 'active' as const,
          enrolledCourses: [],
          completedCourses: [],
          totalXP: 0,
          level: 1,
          badges: [],
          updatedAt: new Date().toISOString(),
          customPermissions: ['analytics:export'],
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        // Role permission
        expect(hasPermission(student.role, 'courses:read', student.customPermissions)).toBe(true);
        // Custom permission
        expect(hasPermission(student.role, 'analytics:export', student.customPermissions)).toBe(true);
        // Neither role nor custom
        expect(hasPermission(student.role, 'users:delete', student.customPermissions)).toBe(false);
      });

      it('should work when customPermissions is undefined', () => {
        const instructor: User = {
          id: '5',
          tenantId: 'tenant-1',
          email: 'instructor@example.com',
          role: 'instructor',
          firstName: 'John',
          lastName: 'Instructor',
          status: 'active' as const,
          enrolledCourses: [],
          completedCourses: [],
          totalXP: 0,
          level: 1,
          badges: [],
          updatedAt: new Date().toISOString(),
          // customPermissions: undefined (implicit)
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        expect(hasPermission(instructor.role, 'courses:create', instructor.customPermissions)).toBe(true);
        expect(hasPermission(instructor.role, 'users:delete', instructor.customPermissions)).toBe(false);
      });

      it('should work when customPermissions is empty array', () => {
        const mentor: User = {
          id: '6',
          tenantId: 'tenant-1',
          email: 'mentor@example.com',
          role: 'mentor',
          firstName: 'Jane',
          lastName: 'Mentor',
          status: 'active' as const,
          enrolledCourses: [],
          completedCourses: [],
          totalXP: 0,
          level: 1,
          badges: [],
          updatedAt: new Date().toISOString(),
          customPermissions: [],
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        expect(hasPermission(mentor.role, 'mentorship:accept-requests', mentor.customPermissions)).toBe(true);
        expect(hasPermission(mentor.role, 'users:create', mentor.customPermissions)).toBe(false);
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
          status: 'active' as const,
          enrolledCourses: [],
          completedCourses: [],
          totalXP: 0,
          level: 1,
          badges: [],
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        expect(hasPermission(user.role, 'invalid:permission' as any)).toBe(false);
        expect(hasPermission(user.role, '' as any)).toBe(false);
      });

      it('should handle case-sensitive permission checks', () => {
        const user: User = {
          id: '8',
          tenantId: 'tenant-1',
          email: 'user@example.com',
          role: 'instructor',
          firstName: 'Test',
          lastName: 'User',
          status: 'active' as const,
          enrolledCourses: [],
          completedCourses: [],
          totalXP: 0,
          level: 1,
          badges: [],
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        // Correct case
        expect(hasPermission(user.role, 'courses:create', user.customPermissions)).toBe(true);
        // Wrong case should fail
        expect(hasPermission(user.role, 'COURSES:CREATE' as any)).toBe(false);
        expect(hasPermission(user.role, 'Courses:Create' as any)).toBe(false);
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
          status: 'active' as const,
          enrolledCourses: [],
          completedCourses: [],
          totalXP: 0,
          level: 1,
          badges: [],
          updatedAt: new Date().toISOString(),
          customPermissions: ['courses:publish'],
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        // Role permissions
        expect(hasPermission(seniorInstructor.role, 'courses:create', seniorInstructor.customPermissions)).toBe(true);
        expect(hasPermission(seniorInstructor.role, 'courses:update', seniorInstructor.customPermissions)).toBe(true);
        // Custom permission (normally only admins can publish)
        expect(hasPermission(seniorInstructor.role, 'courses:publish', seniorInstructor.customPermissions)).toBe(true);
        // Still can't do admin stuff
        expect(hasPermission(seniorInstructor.role, 'users:create', seniorInstructor.customPermissions)).toBe(false);
      });

      it('should handle team-lead with analytics:view-all custom permission', () => {
        const seniorLead: User = {
          id: '10',
          tenantId: 'tenant-1',
          email: 'lead@example.com',
          role: 'user-manager',
          firstName: 'Team',
          lastName: 'Lead',
          status: 'active' as const,
          enrolledCourses: [],
          completedCourses: [],
          totalXP: 0,
          level: 1,
          badges: [],
          updatedAt: new Date().toISOString(),
          customPermissions: ['analytics:view-all'],
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        // Role permissions
        expect(hasPermission(seniorLead.role, 'groups:create', seniorLead.customPermissions)).toBe(true);
        expect(hasPermission(seniorLead.role, 'analytics:view-team-stats', seniorLead.customPermissions)).toBe(true);
        // Custom permission (elevated analytics access)
        expect(hasPermission(seniorLead.role, 'analytics:view-all', seniorLead.customPermissions)).toBe(true);
      });

      it('should handle content-creator with mentor permissions', () => {
        const hybridUser: User = {
          id: '11',
          tenantId: 'tenant-1',
          email: 'hybrid@example.com',
          role: 'content-manager',
          firstName: 'Hybrid',
          lastName: 'Creator',
          status: 'active' as const,
          enrolledCourses: [],
          completedCourses: [],
          totalXP: 0,
          level: 1,
          badges: [],
          updatedAt: new Date().toISOString(),
          customPermissions: [
            'mentorship:accept-requests',
            'mentorship:rate-sessions'
          ],
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        // Role permissions (content creator)
        expect(hasPermission(hybridUser.role, 'courses:create', hybridUser.customPermissions)).toBe(true);
        expect(hasPermission(hybridUser.role, 'assets:upload', hybridUser.customPermissions)).toBe(true);
        // Custom permissions (mentor capabilities)
        expect(hasPermission(hybridUser.role, 'mentorship:accept-requests', hybridUser.customPermissions)).toBe(true);
        expect(hasPermission(hybridUser.role, 'mentorship:rate-sessions', hybridUser.customPermissions)).toBe(true);
        // Still no admin permissions
        expect(hasPermission(hybridUser.role, 'users:create', hybridUser.customPermissions)).toBe(false);
      });
    });
  });
});
