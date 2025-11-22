import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeCosmos, getContainer } from './services/cosmosdb.service';
import { authenticateToken } from './middleware/authentication';
import {
  requireAuth,
  requireRole,
  requirePermission,
  requireOwnershipOrAdmin,
  requireActiveUser,
} from './middleware/authorization';
import {
  getTenantBySlug,
  getTenantById,
  listTenants,
  createTenant,
} from './functions/TenantFunctions';
import {
  createUser,
  getUserById,
  getUsersByTenant,
  getTenantUserStats,
  enrollUserInCourse,
  completeCourse,
  updateUser,
  deleteUser,
  inviteUser,
  acceptInvitation,
} from './functions/UserFunctions';
import { emailService } from './services/email.service';
import { getCourses } from './functions/GetCourses';
import {
  getCourses as getCoursesNew,
  getCourseById,
  createCourse,
  updateCourse,
  submitCourseForReview,
  approveCourse,
  rejectCourse,
  requestCourseChanges,
  archiveCourse,
  unarchiveCourse,
  deleteCourse
} from './functions/CourseFunctions';
import { login, validateToken } from './functions/AuthFunctions';
import {
  createMentorshipRequest,
  getMentorPendingRequests,
  getMenteeRequests,
  acceptMentorshipRequest,
  rejectMentorshipRequest,
  getMentorSessions,
  getMenteeSessions,
  completeMentorshipSession,
  rateMentorshipSession,
  getAvailableMentors,
  getMentorStats
} from './functions/MentorshipFunctions';
import {
  getUserLibrary,
  getCourseAttempts,
  startCourseRetake,
  completeCourseAttempt
} from './functions/LibraryFunctions';
import {
  getUserProgress,
  getAllUserProgress,
  getCourseProgress,
  upsertUserProgress,
  updateProgress
} from './functions/UserProgressFunctions';
import {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMemberToGroup,
  removeMemberFromGroup
} from './functions/UserGroupFunctions';
import {
  getAssignments,
  getUserAssignments,
  getCourseAssignments,
  createAssignment,
  updateAssignmentStatus,
  deleteAssignment
} from './functions/CourseAssignmentFunctions';
import {
  awardXP,
  getUserGamificationStats,
  awardBadge,
  removeBadge
} from './functions/GamificationFunctions';
import {
  getUserCertificates,
  getCertificateById,
  getCertificateByCode,
  getCertificateByUserAndCourse,
  createCertificate,
  deleteCertificate,
  getCourseCertificates
} from './functions/CertificateFunctions';
import {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
} from './functions/AuditFunctions';
import { attachAuditMetadata, auditCreate, auditRoleChange } from './middleware/audit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7071;

// Middleware
// CORS configuration - allow specific origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://app.kainet.mx',
        'https://api.kainet.mx',
        process.env.FRONTEND_URL || 'https://app.kainet.mx'
      ]
    : true, // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
// Note: authenticateToken is NOT applied globally - it's applied selectively to protected routes

// Health check (both paths for compatibility)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AccessLearn Backend API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AccessLearn Backend API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ============================================
// AUTH ENDPOINTS (Public)
// ============================================

// POST /api/auth/login - Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, tenantId } = req.body;

    if (!email || !tenantId) {
      return res.status(400).json({ error: 'email and tenantId are required' });
    }

    const result = await login({ email, password, tenantId });

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    res.json(result);
  } catch (error: any) {
    console.error('[API] Error during login:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/validate - Validate token
app.get('/api/auth/validate', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const result = await validateToken(token);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    res.json(result);
  } catch (error: any) {
    console.error('[API] Error validating token:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// TENANT ENDPOINTS
// ============================================

// GET /api/tenants - List all tenants (public endpoint for tenant selection)
app.get('/api/tenants', async (req, res) => {
  try {
    const tenants = await listTenants();
    res.json(tenants);
  } catch (error: any) {
    console.error('[API] Error listing tenants:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tenants/slug/:slug - Get tenant by slug
app.get('/api/tenants/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const tenant = await getTenantBySlug(slug);

    if (!tenant) {
      return res.status(404).json({ error: `Tenant with slug "${slug}" not found` });
    }

    res.json(tenant);
  } catch (error: any) {
    console.error('[API] Error getting tenant by slug:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tenants/:id - Get tenant by ID
app.get('/api/tenants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await getTenantById(id);

    if (!tenant) {
      return res.status(404).json({ error: `Tenant ${id} not found` });
    }

    res.json(tenant);
  } catch (error: any) {
    console.error('[API] Error getting tenant by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tenants - Create new tenant
app.post('/api/tenants', requireAuth, requirePermission('tenants:create'), async (req, res) => {
  try {
    const tenant = await createTenant(req.body);
    res.status(201).json(tenant);
  } catch (error: any) {
    console.error('[API] Error creating tenant:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// PROTECTED ENDPOINTS (Apply auth middleware)
// ============================================

// Apply authentication and audit middleware to all routes below
app.use(authenticateToken); // Validate JWT and attach user to request
app.use(attachAuditMetadata); // Add audit metadata to all requests

// ============================================
// USER ENDPOINTS
// ============================================

// GET /api/users - Get users by tenant (query param)
app.get('/api/users', requireAuth, requirePermission('users:list'), async (req, res) => {
  try {
    const { tenantId, role } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId query parameter is required' });
    }

    const users = await getUsersByTenant(tenantId as string, role as string);
    res.json(users);
  } catch (error: any) {
    console.error('[API] Error getting users:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/tenant/:tenantId - Get users by tenant (path param)
app.get('/api/users/tenant/:tenantId', requireAuth, requirePermission('users:list'), async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { role } = req.query;

    const users = await getUsersByTenant(tenantId, role as string);
    res.json(users);
  } catch (error: any) {
    console.error('[API] Error getting users:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - Get user by ID
app.get('/api/users/:id', requireAuth, requireOwnershipOrAdmin('id'), async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId query parameter is required' });
    }

    const user = await getUserById(id, tenantId as string);

    if (!user) {
      return res.status(404).json({ error: `User ${id} not found` });
    }

    res.json(user);
  } catch (error: any) {
    console.error('[API] Error getting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users - Create new user
app.post('/api/users', requireAuth, requirePermission('users:create'), auditCreate('user'), async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    console.error('[API] Error creating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/users/:id/enroll - Enroll user in course
app.post('/api/users/:id/enroll', requireAuth, requirePermission('enrollment:assign-individual'), async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId, courseId } = req.body;

    if (!tenantId || !courseId) {
      return res.status(400).json({ error: 'tenantId and courseId are required' });
    }

    const user = await enrollUserInCourse(id, tenantId, courseId);
    res.json(user);
  } catch (error: any) {
    console.error('[API] Error enrolling user:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/users/:id/complete - Mark course as complete
app.post('/api/users/:id/complete', requireAuth, requireOwnershipOrAdmin('id'), async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId, xpEarned } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const user = await completeCourse(id, courseId, xpEarned);
    res.json(user);
  } catch (error: any) {
    console.error('[API] Error completing course:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/stats/tenant/:tenantId/users - Get tenant user stats
app.get('/api/stats/tenant/:tenantId/users', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const stats = await getTenantUserStats(tenantId);
    res.json(stats);
  } catch (error: any) {
    console.error('[API] Error getting user stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id - Update user
app.put('/api/users/:id', requireAuth, requirePermission('users:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId, ...updates } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const user = await updateUser(id, tenantId, updates);
    res.json(user);
  } catch (error: any) {
    console.error('[API] Error updating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/users/:id - Delete user (soft delete)
app.delete('/api/users/:id', requireAuth, requirePermission('users:delete'), async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    await deleteUser(id, tenantId);
    res.status(204).send();
  } catch (error: any) {
    console.error('[API] Error deleting user:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/users/invite - Invite user
app.post('/api/users/invite', requireAuth, requirePermission('users:create'), async (req, res) => {
  try {
    const { tenantId, email, firstName, lastName, role } = req.body;
    const invitedBy = req.user?.id || 'system';

    if (!tenantId || !email || !firstName || !lastName || !role) {
      return res.status(400).json({ 
        error: 'tenantId, email, firstName, lastName, and role are required' 
      });
    }

    const result = await inviteUser({
      tenantId,
      email,
      firstName,
      lastName,
      role,
      invitedBy
    });

    const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invitation?token=${result.invitationToken}`;

    // Send invitation email
    try {
      const tenant = await getTenantById(tenantId);
      const inviter = await getUserById(invitedBy, tenantId);
      
      await emailService.sendInvitationEmail({
        recipientEmail: email,
        recipientName: `${firstName} ${lastName}`,
        inviterName: inviter ? `${inviter.firstName} ${inviter.lastName}` : 'Administrador',
        tenantName: tenant?.name || 'AccessLearn',
        role,
        invitationUrl
      });
      
      console.log(`✅ Invitation email sent to ${email}`);
    } catch (emailError: any) {
      console.error('⚠️ Failed to send invitation email:', emailError.message);
      // Don't fail the request if email fails - user was created successfully
    }

    res.status(201).json({
      user: result.user,
      invitationUrl
    });
  } catch (error: any) {
    console.error('[API] Error inviting user:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/users/validate-invitation/:token - Validate invitation token and get user info
app.get('/api/users/validate-invitation/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { getUserByInvitationToken } = await import('./functions/UserFunctions');
    
    const user = await getUserByInvitationToken(token);
    
    if (!user) {
      return res.status(404).json({ error: 'Token de invitación inválido o expirado' });
    }
    
    // Check if invitation expired
    if (user.invitationExpiresAt && new Date(user.invitationExpiresAt) < new Date()) {
      return res.status(400).json({ error: 'La invitación ha expirado' });
    }
    
    // Check if already accepted
    if (user.status === 'active') {
      return res.status(400).json({ error: 'Esta invitación ya ha sido aceptada' });
    }
    
    // Return safe user info (no password, no sensitive data)
    res.json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
    });
  } catch (error: any) {
    console.error('[API] Error validating invitation:', error);
    res.status(400).json({ error: error.message || 'Error al validar la invitación' });
  }
});

// POST /api/users/accept-invitation - Accept invitation
app.post('/api/users/accept-invitation', async (req, res) => {
  try {
    const { invitationToken, password } = req.body;

    if (!invitationToken || !password) {
      return res.status(400).json({ 
        error: 'invitationToken and password are required' 
      });
    }

    const user = await acceptInvitation(invitationToken, password);
    
    // Send welcome email
    try {
      const tenant = await getTenantById(user.tenantId);
      const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
      
      await emailService.sendWelcomeEmail({
        recipientEmail: user.email,
        recipientName: `${user.firstName} ${user.lastName}`,
        tenantName: tenant?.name || 'AccessLearn',
        loginUrl
      });
      
      console.log(`✅ Welcome email sent to ${user.email}`);
    } catch (emailError: any) {
      console.error('⚠️ Failed to send welcome email:', emailError.message);
      // Don't fail the request if email fails
    }
    
    res.json(user);
  } catch (error: any) {
    console.error('[API] Error accepting invitation:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// COURSE ENDPOINTS
// ============================================

// GET /api/courses - Get courses with role-based filtering
// Supports query parameters: ?status=draft|pending-review|published|archived
app.get('/api/courses', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { status, createdBy } = req.query;

    // Role-based filtering logic:
    // - Students: only published courses
    // - Instructors: own courses (all statuses) + published courses
    // - Content managers/admins: all courses, all statuses

    let courses;

    if (user.role === 'student') {
      // Students can only see published courses
      courses = await getCoursesNew(user.tenantId, { status: 'published' });
    } else if (user.role === 'instructor') {
      // Instructors see their own courses + all published courses
      const ownCourses = await getCoursesNew(user.tenantId, { 
        createdBy: user.id 
      });
      const publishedCourses = await getCoursesNew(user.tenantId, { 
        status: 'published' 
      });
      
      // Merge and deduplicate
      const courseMap = new Map();
      [...ownCourses, ...publishedCourses].forEach(course => {
        courseMap.set(course.id, course);
      });
      courses = Array.from(courseMap.values());
      
      // Apply status filter if provided
      if (status) {
        courses = courses.filter(c => c.status === status);
      }
    } else {
      // Content managers, admins, and other roles see all courses
      const options: any = {};
      if (status) options.status = status as any;
      if (createdBy) options.createdBy = createdBy as string;
      
      courses = await getCoursesNew(user.tenantId, options);
    }

    console.log('[API] GET /api/courses - Found', courses.length, 'courses');
    res.json(courses);
  } catch (error: any) {
    console.error('[API] Error getting courses:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/courses/tenant/:tenantId - Legacy endpoint (kept for backward compatibility)
app.get('/api/courses/tenant/:tenantId', requireAuth, async (req, res) => {
  try {
    const { tenantId } = req.params;
    console.log('[API] GET /api/courses/tenant/:tenantId -', tenantId);
    const courses = await getCourses({ tenantId });
    console.log('[API] Found', courses.length, 'courses for tenant', tenantId);
    courses.forEach(c => console.log('  -', c.title, '(', c.id, ')'));
    res.json(courses);
  } catch (error: any) {
    console.error('[API] Error getting courses:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/courses/:courseId - Get course by ID
app.get('/api/courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const container = getContainer('courses');
    
    // Query for the course by ID (cross-partition query)
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @courseId',
      parameters: [{ name: '@courseId', value: courseId }]
    };
    
    const { resources } = await container.items.query(querySpec).fetchAll();
    
    if (!resources || resources.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(resources[0]);
  } catch (error: any) {
    console.error('[API] Error getting course by ID:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/:userId/progress/lessons/:lessonId/complete - Mark lesson as completed
app.post('/api/users/:userId/progress/lessons/:lessonId/complete', requireAuth, requireOwnershipOrAdmin('userId'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId, lessonId } = req.params;
    const { courseId, moduleId, xpEarned } = req.body;

    if (!courseId || !moduleId) {
      return res.status(400).json({ error: 'courseId and moduleId are required' });
    }

    // Get current progress
    let progress = await getUserProgress(userId, user.tenantId, courseId);
    
    const completedLessons = progress?.completedLessons || [];
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }

    // Calculate progress percentage (simplified - assumes ~10 lessons per course)
    const progressPercentage = Math.min(100, (completedLessons.length / 10) * 100);

    // Update progress in user-progress container
    const updatedProgress = await updateProgress(
      userId,
      user.tenantId,
      courseId,
      progressPercentage,
      completedLessons
    );

    // Award XP if provided
    let totalXp = user.totalXP || 0;
    if (xpEarned && xpEarned > 0) {
      const xpResult = await awardXP(userId, user.tenantId, xpEarned, `Completed lesson: ${lessonId}`);
      totalXp = xpResult.user.totalXP || totalXp;
    }

    res.json({
      success: true,
      progress: updatedProgress,
      totalXp
    });
  } catch (error: any) {
    console.error('[API] Error marking lesson as complete:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:userId/progress/:courseId - Get user progress for course (legacy endpoint - uses new system)
app.get('/api/users/:userId/progress/:courseId', requireAuth, requireOwnershipOrAdmin('userId'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId, courseId } = req.params;
    
    // Use new user-progress endpoint
    const progress = await getUserProgress(userId, user.tenantId, courseId);
    
    if (!progress) {
      return res.json({
        completedLessons: [],
        lastAccessedAt: null,
        xpEarned: 0
      });
    }

    // Convert to legacy format for backward compatibility
    res.json({
      completedLessons: progress.completedLessons || [],
      lastAccessedAt: progress.lastAccessedAt,
      xpEarned: progress.totalXpEarned || 0
    });
  } catch (error: any) {
    console.error('[API] Error getting course progress:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// COURSE APPROVAL WORKFLOW ENDPOINTS
// ============================================

// POST /api/courses - Create new course (draft status)
app.post('/api/courses', 
  requireAuth, 
  requirePermission('content:create'),
  async (req, res) => {
    try {
      const user = (req as any).user;
      const { title, description, category, estimatedTime, coverImage } = req.body;

      if (!title || !description || !category) {
        return res.status(400).json({ 
          error: 'title, description, and category are required' 
        });
      }

      const course = await createCourse(
        { title, description, category, estimatedTime: estimatedTime || 60, coverImage },
        user.tenantId,
        user.id
      );

      res.status(201).json(course);
    } catch (error: any) {
      console.error('[API] Error creating course:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT /api/courses/:courseId - Update course
app.put('/api/courses/:courseId',
  requireAuth,
  requirePermission('content:edit'),
  async (req, res) => {
    try {
      const user = (req as any).user;
      const { courseId } = req.params;
      const updates = req.body;

      const course = await updateCourse(courseId, user.tenantId, user.id, updates);
      res.json(course);
    } catch (error: any) {
      console.error('[API] Error updating course:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/courses/:courseId/submit-review - Submit course for review
app.post('/api/courses/:courseId/submit-review',
  requireAuth,
  requirePermission('content:review'),
  async (req, res) => {
    try {
      const user = (req as any).user;
      const { courseId } = req.params;

      const course = await submitCourseForReview(courseId, user.tenantId, user.id);
      res.json(course);
    } catch (error: any) {
      console.error('[API] Error submitting course for review:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/courses/:courseId/approve - Approve course
app.post('/api/courses/:courseId/approve',
  requireAuth,
  requirePermission('content:approve'),
  async (req, res) => {
    try {
      const user = (req as any).user;
      const { courseId } = req.params;
      const { comments } = req.body;

      const course = await approveCourse(courseId, user.tenantId, user.id, comments);
      res.json(course);
    } catch (error: any) {
      console.error('[API] Error approving course:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/courses/:courseId/reject - Reject course
app.post('/api/courses/:courseId/reject',
  requireAuth,
  requirePermission('content:reject'),
  async (req, res) => {
    try {
      const user = (req as any).user;
      const { courseId } = req.params;
      const { comments } = req.body;

      if (!comments) {
        return res.status(400).json({ error: 'comments are required when rejecting' });
      }

      const course = await rejectCourse(courseId, user.tenantId, user.id, comments);
      res.json(course);
    } catch (error: any) {
      console.error('[API] Error rejecting course:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/courses/:courseId/request-changes - Request changes on course
app.post('/api/courses/:courseId/request-changes',
  requireAuth,
  requirePermission('content:request-changes'),
  async (req, res) => {
    try {
      const user = (req as any).user;
      const { courseId } = req.params;
      const { requestedChanges } = req.body;

      if (!requestedChanges) {
        return res.status(400).json({ 
          error: 'requestedChanges is required' 
        });
      }

      const course = await requestCourseChanges(
        courseId, 
        user.tenantId, 
        user.id, 
        requestedChanges
      );
      res.json(course);
    } catch (error: any) {
      console.error('[API] Error requesting changes:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// ============================================
// CATEGORY ENDPOINTS
// ============================================

// GET /api/categories - Get all categories for tenant
app.get('/api/categories', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { getCategories } = await import('./functions/CategoryFunctions');
    const categories = await getCategories(user.tenantId);
    res.json(categories);
  } catch (error: any) {
    console.error('[API] Error getting categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/categories - Create new category
app.post('/api/categories',
  requireAuth,
  requirePermission('content:create'),
  async (req, res) => {
    try {
      const user = (req as any).user;
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required' });
      }

      const { createCategory } = await import('./functions/CategoryFunctions');
      const category = await createCategory(user.tenantId, name.trim(), user.id);
      res.status(201).json(category);
    } catch (error: any) {
      console.error('[API] Error creating category:', error);
      if (error.message === 'Category already exists') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE /api/categories/:categoryId - Delete category
app.delete('/api/categories/:categoryId',
  requireAuth,
  requirePermission('content:delete'),
  async (req, res) => {
    try {
      const user = (req as any).user;
      const { categoryId } = req.params;

      const { deleteCategory } = await import('./functions/CategoryFunctions');
      await deleteCategory(categoryId, user.tenantId);
      res.status(204).send();
    } catch (error: any) {
      console.error('[API] Error deleting category:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/courses/:courseId/archive - Archive course
app.post('/api/courses/:courseId/archive',
  requireAuth,
  requirePermission('content:archive'),
  async (req, res) => {
    try {
      const user = (req as any).user;
      const { courseId } = req.params;

      const course = await archiveCourse(courseId, user.tenantId, user.id);
      res.json(course);
    } catch (error: any) {
      console.error('[API] Error archiving course:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/courses/:courseId/unarchive - Unarchive course
app.post('/api/courses/:courseId/unarchive',
  requireAuth,
  requirePermission('content:archive'),
  async (req, res) => {
    try {
      const user = (req as any).user;
      const { courseId } = req.params;

      const course = await unarchiveCourse(courseId, user.tenantId, user.id);
      res.json(course);
    } catch (error: any) {
      console.error('[API] Error unarchiving course:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE /api/courses/:courseId - Delete course (soft delete)
app.delete('/api/courses/:courseId',
  requireAuth,
  requirePermission('content:delete'),
  async (req, res) => {
    try {
      const user = (req as any).user;
      const { courseId } = req.params;

      await deleteCourse(courseId, user.tenantId, user.id);
      res.status(204).send();
    } catch (error: any) {
      console.error('[API] Error deleting course:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// ============================================
// MENTORSHIP ENDPOINTS
// ============================================

// POST /api/mentorship/requests - Create mentorship request
app.post('/api/mentorship/requests', requireAuth, async (req, res) => {
  try {
    const {
      tenantId,
      menteeId,
      menteeName,
      menteeEmail,
      mentorId,
      mentorName,
      mentorEmail,
      topic,
      message,
      preferredDate
    } = req.body;

    const request = await createMentorshipRequest(
      tenantId,
      menteeId,
      menteeName,
      menteeEmail,
      mentorId,
      mentorName,
      mentorEmail,
      topic,
      message,
      preferredDate
    );

    res.status(201).json(request);
  } catch (error: any) {
    console.error('[API] Error creating mentorship request:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/mentorship/requests - Get mentorship requests (for mentor)
app.get('/api/mentorship/requests', requireAuth, requireRole('mentor', 'instructor', 'content-manager', 'tenant-admin', 'super-admin'), async (req, res) => {
  try {
    const { tenantId, mentorId, status } = req.query;

    if (!tenantId || !mentorId) {
      return res.status(400).json({ error: 'tenantId and mentorId are required' });
    }

    const requests = await getMentorPendingRequests(tenantId as string, mentorId as string);
    res.json(requests);
  } catch (error: any) {
    console.error('[API] Error getting mentorship requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/mentorship/my-requests - Get mentee's own requests
app.get('/api/mentorship/my-requests', requireAuth, async (req, res) => {
  try {
    const { tenantId, menteeId } = req.query;

    if (!tenantId || !menteeId) {
      return res.status(400).json({ error: 'tenantId and menteeId are required' });
    }

    const requests = await getMenteeRequests(tenantId as string, menteeId as string);
    res.json(requests);
  } catch (error: any) {
    console.error('[API] Error getting mentee requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/mentorship/requests/:requestId/accept - Accept mentorship request
app.post('/api/mentorship/requests/:requestId/accept', requireAuth, requirePermission('mentorship:accept-requests'), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { tenantId, scheduledDate, duration } = req.body;

    if (!tenantId || !scheduledDate) {
      return res.status(400).json({ error: 'tenantId and scheduledDate are required' });
    }

    const result = await acceptMentorshipRequest(requestId, tenantId, scheduledDate, duration);
    res.json(result);
  } catch (error: any) {
    console.error('[API] Error accepting mentorship request:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/mentorship/requests/:requestId/reject - Reject mentorship request
app.post('/api/mentorship/requests/:requestId/reject', requireAuth, requirePermission('mentorship:accept-requests'), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const request = await rejectMentorshipRequest(requestId, tenantId);
    res.json(request);
  } catch (error: any) {
    console.error('[API] Error rejecting mentorship request:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/mentorship/sessions - Get mentorship sessions
app.get('/api/mentorship/sessions', requireAuth, async (req, res) => {
  try {
    const { tenantId, mentorId, menteeId, status } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    let sessions;
    if (mentorId) {
      sessions = await getMentorSessions(
        tenantId as string,
        mentorId as string,
        status as any
      );
    } else if (menteeId) {
      sessions = await getMenteeSessions(
        tenantId as string,
        menteeId as string,
        status as any
      );
    } else {
      return res.status(400).json({ error: 'mentorId or menteeId is required' });
    }

    res.json(sessions);
  } catch (error: any) {
    console.error('[API] Error getting mentorship sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/mentorship/sessions/:sessionId/complete - Complete session
app.post('/api/mentorship/sessions/:sessionId/complete', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { tenantId, notes } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const session = await completeMentorshipSession(sessionId, tenantId, notes);
    res.json(session);
  } catch (error: any) {
    console.error('[API] Error completing mentorship session:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/mentorship/sessions/:sessionId/rate - Rate session
app.post('/api/mentorship/sessions/:sessionId/rate', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { tenantId, rating, feedback } = req.body;

    if (!tenantId || !rating) {
      return res.status(400).json({ error: 'tenantId and rating are required' });
    }

    const session = await rateMentorshipSession(sessionId, tenantId, rating, feedback);
    res.json(session);
  } catch (error: any) {
    console.error('[API] Error rating mentorship session:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/mentorship/mentors - Get available mentors
app.get('/api/mentorship/mentors', requireAuth, async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const mentors = await getAvailableMentors(tenantId as string);
    res.json(mentors);
  } catch (error: any) {
    console.error('[API] Error getting mentors:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/mentorship/mentors/:mentorId/stats - Get mentor stats
app.get('/api/mentorship/mentors/:mentorId/stats', requireAuth, async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const stats = await getMentorStats(tenantId as string, mentorId);
    res.json(stats);
  } catch (error: any) {
    console.error('[API] Error getting mentor stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// LIBRARY ENDPOINTS
// ============================================

// GET /api/library/:userId - Get user's course library
app.get('/api/library/:userId', requireAuth, requireOwnershipOrAdmin('userId'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { tenantId } = req.query;

    console.log('[API] GET /api/library/:userId called with:', { userId, tenantId });

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const library = await getUserLibrary(userId, tenantId as string);
    console.log('[API] Library retrieved successfully, count:', library.length);
    res.json(library);
  } catch (error: any) {
    console.error('[API] Error getting user library:', error);
    console.error('[API] Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/courses/:courseId/attempts/:userId - Get course attempts for user
app.get('/api/courses/:courseId/attempts/:userId', requireAuth, requireOwnershipOrAdmin('userId'), async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const attempts = await getCourseAttempts(userId, tenantId as string, courseId);
    res.json(attempts);
  } catch (error: any) {
    console.error('[API] Error getting course attempts:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/courses/:courseId/retake - Start a new course retake
app.post('/api/courses/:courseId/retake', requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId, tenantId } = req.body;

    if (!userId || !tenantId) {
      return res.status(400).json({ error: 'userId and tenantId are required' });
    }

    const progress = await startCourseRetake(userId, tenantId, courseId);
    res.json(progress);
  } catch (error: any) {
    console.error('[API] Error starting course retake:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/courses/:courseId/complete-attempt - Complete a course attempt
app.post('/api/courses/:courseId/complete-attempt', requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId, tenantId, finalScore, completedLessons, quizScores } = req.body;

    if (!userId || !tenantId || finalScore === undefined) {
      return res.status(400).json({ 
        error: 'userId, tenantId, and finalScore are required' 
      });
    }

    const result = await completeCourseAttempt(
      userId,
      tenantId,
      courseId,
      finalScore,
      completedLessons || [],
      quizScores || []
    );

    res.json(result);
  } catch (error: any) {
    console.error('[API] Error completing course attempt:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// AUDIT LOG ENDPOINTS
// ============================================

// GET /api/audit/logs - Get audit logs with filters
app.get('/api/audit/logs', requireAuth, requirePermission('audit:view-logs'), async (req, res) => {
  try {
    const { tenantId } = req.query;
    const {
      action,
      actorId,
      resourceType,
      resourceId,
      severity,
      status,
      startDate,
      endDate,
      limit
    } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const filters: any = {};
    if (action) filters.action = action;
    if (actorId) filters.actorId = actorId;
    if (resourceType) filters.resourceType = resourceType;
    if (resourceId) filters.resourceId = resourceId;
    if (severity) filters.severity = severity;
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (limit) filters.limit = parseInt(limit as string);

    const logs = await getAuditLogs(tenantId as string, filters);
    res.json(logs);
  } catch (error: any) {
    console.error('[API] Error getting audit logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/audit/logs/:logId - Get specific audit log
app.get('/api/audit/logs/:logId', requireAuth, requirePermission('audit:view-logs'), async (req, res) => {
  try {
    const { logId } = req.params;
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const log = await getAuditLogById(logId, tenantId as string);

    if (!log) {
      return res.status(404).json({ error: `Audit log ${logId} not found` });
    }

    res.json(log);
  } catch (error: any) {
    console.error('[API] Error getting audit log:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/audit/stats - Get audit statistics
app.get('/api/audit/stats', requireAuth, requirePermission('audit:view-logs'), async (req, res) => {
  try {
    const { tenantId, period } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const stats = await getAuditStats(
      tenantId as string,
      (period as 'day' | 'week' | 'month') || 'week'
    );

    res.json(stats);
  } catch (error: any) {
    console.error('[API] Error getting audit stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USER PROGRESS ENDPOINTS
// ============================================

// GET /api/user-progress/:userId - Get all progress for a user
app.get('/api/user-progress/:userId', requireAuth, requireOwnershipOrAdmin('userId'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId } = req.params;
    const progress = await getAllUserProgress(userId, user.tenantId);
    res.json(progress);
  } catch (error: any) {
    console.error('[API] Error getting user progress:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/user-progress/:userId/course/:courseId - Get progress for specific course
app.get('/api/user-progress/:userId/course/:courseId', requireAuth, requireOwnershipOrAdmin('userId'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId, courseId } = req.params;
    const progress = await getUserProgress(userId, user.tenantId, courseId);
    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }
    res.json(progress);
  } catch (error: any) {
    console.error('[API] Error getting course progress:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/courses/:courseId/progress - Get all progress for a course
app.get('/api/courses/:courseId/progress', requireAuth, requirePermission('analytics:view-user-progress'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { courseId } = req.params;
    const progress = await getCourseProgress(courseId, user.tenantId);
    res.json(progress);
  } catch (error: any) {
    console.error('[API] Error getting course progress:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/user-progress/:userId/course/:courseId - Update user progress
app.put('/api/user-progress/:userId/course/:courseId', requireAuth, requireOwnershipOrAdmin('userId'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId, courseId } = req.params;
    const { progress, completedLessons } = req.body;
    
    const updated = await updateProgress(userId, user.tenantId, courseId, progress, completedLessons);
    res.json(updated);
  } catch (error: any) {
    console.error('[API] Error updating progress:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/user-progress - Create or update progress
app.post('/api/user-progress', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const progressData = req.body;
    
    // Ensure tenantId and userId match authenticated user
    if (progressData.userId !== user.id && user.role !== 'super-admin' && user.role !== 'tenant-admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    progressData.tenantId = user.tenantId;
    const progress = await upsertUserProgress(progressData);
    res.json(progress);
  } catch (error: any) {
    console.error('[API] Error creating/updating progress:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USER GROUPS ENDPOINTS
// ============================================

// GET /api/groups - Get all groups for tenant
app.get('/api/groups', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const groups = await getGroups(user.tenantId);
    res.json(groups);
  } catch (error: any) {
    console.error('[API] Error getting groups:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/groups/:groupId - Get group by ID
app.get('/api/groups/:groupId', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { groupId } = req.params;
    const group = await getGroupById(groupId, user.tenantId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json(group);
  } catch (error: any) {
    console.error('[API] Error getting group:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/groups - Create new group
app.post('/api/groups', requireAuth, requirePermission('users:create'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { name, description, memberIds } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }
    
    const group = await createGroup(user.tenantId, name, description, user.id, memberIds || []);
    res.status(201).json(group);
  } catch (error: any) {
    console.error('[API] Error creating group:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/groups/:groupId - Update group
app.put('/api/groups/:groupId', requireAuth, requirePermission('groups:update'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { groupId } = req.params;
    const updates = req.body;
    
    const group = await updateGroup(groupId, user.tenantId, updates);
    res.json(group);
  } catch (error: any) {
    console.error('[API] Error updating group:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/groups/:groupId - Delete group
app.delete('/api/groups/:groupId', requireAuth, requirePermission('users:delete'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { groupId } = req.params;
    await deleteGroup(groupId, user.tenantId);
    res.status(204).send();
  } catch (error: any) {
    console.error('[API] Error deleting group:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/groups/:groupId/members/:userId - Add member to group
app.post('/api/groups/:groupId/members/:userId', requireAuth, requirePermission('groups:assign-users'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { groupId, userId } = req.params;
    const group = await addMemberToGroup(groupId, user.tenantId, userId);
    res.json(group);
  } catch (error: any) {
    console.error('[API] Error adding member:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/groups/:groupId/members/:userId - Remove member from group
app.delete('/api/groups/:groupId/members/:userId', requireAuth, requirePermission('groups:assign-users'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { groupId, userId } = req.params;
    const group = await removeMemberFromGroup(groupId, user.tenantId, userId);
    res.json(group);
  } catch (error: any) {
    console.error('[API] Error removing member:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// COURSE ASSIGNMENTS ENDPOINTS
// ============================================

// GET /api/course-assignments - Get all assignments for tenant
app.get('/api/course-assignments', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const assignments = await getAssignments(user.tenantId);
    res.json(assignments);
  } catch (error: any) {
    console.error('[API] Error getting assignments:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/course-assignments/user/:userId - Get assignments for a user
app.get('/api/course-assignments/user/:userId', requireAuth, requireOwnershipOrAdmin('userId'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId } = req.params;
    const assignments = await getUserAssignments(userId, user.tenantId);
    res.json(assignments);
  } catch (error: any) {
    console.error('[API] Error getting user assignments:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/course-assignments/course/:courseId - Get assignments for a course
app.get('/api/course-assignments/course/:courseId', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { courseId } = req.params;
    const assignments = await getCourseAssignments(courseId, user.tenantId);
    res.json(assignments);
  } catch (error: any) {
    console.error('[API] Error getting course assignments:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/course-assignments - Create new assignment
app.post('/api/course-assignments', requireAuth, requirePermission('enrollment:assign-individual'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { courseId, assignedToType, assignedToId, dueDate } = req.body;
    
    if (!courseId || !assignedToType || !assignedToId) {
      return res.status(400).json({ error: 'courseId, assignedToType, and assignedToId are required' });
    }
    
    const assignment = await createAssignment(
      user.tenantId,
      courseId,
      assignedToType,
      assignedToId,
      user.id,
      dueDate
    );
    res.status(201).json(assignment);
  } catch (error: any) {
    console.error('[API] Error creating assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/course-assignments/:assignmentId/status - Update assignment status
app.put('/api/course-assignments/:assignmentId/status', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { assignmentId } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }
    
    const assignment = await updateAssignmentStatus(assignmentId, user.tenantId, status);
    res.json(assignment);
  } catch (error: any) {
    console.error('[API] Error updating assignment status:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/course-assignments/:assignmentId - Delete assignment
app.delete('/api/course-assignments/:assignmentId', requireAuth, requirePermission('enrollment:remove'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { assignmentId } = req.params;
    await deleteAssignment(assignmentId, user.tenantId);
    res.status(204).send();
  } catch (error: any) {
    console.error('[API] Error deleting assignment:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GAMIFICATION ENDPOINTS
// ============================================

// POST /api/gamification/award-xp - Award XP to user
app.post('/api/gamification/award-xp', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId, xpAmount, reason } = req.body;
    
    // Users can only award XP to themselves unless admin
    const targetUserId = userId || user.id;
    if (targetUserId !== user.id && user.role !== 'super-admin' && user.role !== 'tenant-admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const result = await awardXP(targetUserId, user.tenantId, xpAmount, reason);
    
    // Include badge information in response
    const response: any = {
      user: result.user,
      levelUp: result.levelUp,
      newLevel: result.newLevel,
    };
    
    if (result.newlyAwardedBadges && result.newlyAwardedBadges.length > 0) {
      response.newlyAwardedBadges = result.newlyAwardedBadges;
    }
    
    res.json(response);
  } catch (error: any) {
    console.error('[API] Error awarding XP:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/gamification/stats/:userId - Get user gamification stats
app.get('/api/gamification/stats/:userId', requireAuth, requireOwnershipOrAdmin('userId'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId } = req.params;
    const stats = await getUserGamificationStats(userId, user.tenantId);
    res.json(stats);
  } catch (error: any) {
    console.error('[API] Error getting gamification stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/gamification/badges/:userId - Award badge to user
app.post('/api/gamification/badges/:userId', requireAuth, requirePermission('gamification:create-badges'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId } = req.params;
    const { badgeId } = req.body;
    
    if (!badgeId) {
      return res.status(400).json({ error: 'badgeId is required' });
    }
    
    const updatedUser = await awardBadge(userId, user.tenantId, badgeId);
    res.json(updatedUser);
  } catch (error: any) {
    console.error('[API] Error awarding badge:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/gamification/badges/:userId/:badgeId - Remove badge from user
app.delete('/api/gamification/badges/:userId/:badgeId', requireAuth, requirePermission('gamification:create-badges'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId, badgeId } = req.params;
    const updatedUser = await removeBadge(userId, user.tenantId, badgeId);
    res.json(updatedUser);
  } catch (error: any) {
    console.error('[API] Error removing badge:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CERTIFICATES ENDPOINTS
// ============================================

// GET /api/certificates/user/:userId - Get all certificates for a user
app.get('/api/certificates/user/:userId', requireAuth, requireOwnershipOrAdmin('userId'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId } = req.params;
    const certificates = await getUserCertificates(userId, user.tenantId);
    res.json(certificates);
  } catch (error: any) {
    console.error('[API] Error getting user certificates:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/certificates/:certificateId - Get certificate by ID
app.get('/api/certificates/:certificateId', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { certificateId } = req.params;
    const certificate = await getCertificateById(certificateId, user.tenantId);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    res.json(certificate);
  } catch (error: any) {
    console.error('[API] Error getting certificate:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/certificates/verify/:code - Verify certificate by code (public endpoint)
app.get('/api/certificates/verify/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { tenantId } = req.query;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }
    
    const certificate = await getCertificateByCode(code, tenantId as string);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    res.json(certificate);
  } catch (error: any) {
    console.error('[API] Error verifying certificate:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/certificates/course/:courseId - Get all certificates for a course
app.get('/api/certificates/course/:courseId', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { courseId } = req.params;
    const certificates = await getCourseCertificates(courseId, user.tenantId);
    res.json(certificates);
  } catch (error: any) {
    console.error('[API] Error getting course certificates:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/certificates - Create a new certificate
app.post('/api/certificates', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId, courseId, courseTitle, userFullName } = req.body;
    
    if (!userId || !courseId || !courseTitle || !userFullName) {
      return res.status(400).json({ error: 'userId, courseId, courseTitle, and userFullName are required' });
    }
    
    // Check if certificate already exists
    const existing = await getCertificateByUserAndCourse(userId, courseId, user.tenantId);
    if (existing) {
      return res.json(existing); // Return existing certificate
    }
    
    const certificate = await createCertificate(
      user.tenantId,
      userId,
      courseId,
      courseTitle,
      userFullName,
      user.id
    );
    
    res.status(201).json(certificate);
  } catch (error: any) {
    console.error('[API] Error creating certificate:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/certificates/:certificateId - Delete certificate
app.delete('/api/certificates/:certificateId', requireAuth, requirePermission('content:delete'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { certificateId } = req.params;
    await deleteCertificate(certificateId, user.tenantId);
    res.status(204).send();
  } catch (error: any) {
    console.error('[API] Error deleting certificate:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================

async function startServer() {
  try {
    console.log('\n🚀 Iniciando AccessLearn Backend API...\n');

    // Initialize Cosmos DB
    console.log('📦 Conectando a Cosmos DB...');
    await initializeCosmos();
    console.log('✅ Cosmos DB conectado\n');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Base URL: http://localhost:${PORT}/api\n`);
      console.log('📋 Endpoints disponibles:');
      console.log('   GET  /api/tenants');
      console.log('   GET  /api/tenants/slug/:slug');
      console.log('   GET  /api/tenants/:id');
      console.log('   POST /api/tenants');
      console.log('   GET  /api/users/tenant/:tenantId');
      console.log('   GET  /api/users/:id');
      console.log('   POST /api/users');
      console.log('   POST /api/users/:id/enroll');
      console.log('   POST /api/users/:id/complete');
      console.log('   GET  /api/stats/tenant/:tenantId/users');
      console.log('   GET  /api/courses/tenant/:tenantId');
      console.log('   GET  /api/courses/:courseId');
      console.log('   POST /api/users/:userId/progress/lessons/:lessonId/complete');
      console.log('   GET  /api/users/:userId/progress/:courseId\n');
      console.log('🎯 Presiona Ctrl+C para detener el servidor\n');
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

startServer();
