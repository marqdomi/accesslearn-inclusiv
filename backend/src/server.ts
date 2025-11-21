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
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
} from './functions/AuditFunctions';
import { attachAuditMetadata, auditCreate, auditRoleChange } from './middleware/audit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7071;

// Middleware
app.use(cors());
app.use(express.json());
app.use(authenticateToken); // Validate JWT and attach user to request
app.use(attachAuditMetadata); // Agregar metadata de auditoría a todos los requests

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
// AUTH ENDPOINTS
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
app.post('/api/users/:userId/progress/lessons/:lessonId/complete', async (req, res) => {
  try {
    const { userId, lessonId } = req.params;
    const { courseId, moduleId, xpEarned } = req.body;

    if (!courseId || !moduleId) {
      return res.status(400).json({ error: 'courseId and moduleId are required' });
    }

    const container = getContainer('users');
    
    // Get user
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @userId',
      parameters: [{ name: '@userId', value: userId }]
    };
    
    const { resources } = await container.items.query(querySpec).fetchAll();
    
    if (!resources || resources.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = resources[0];
    
    // Initialize progress structure if it doesn't exist
    if (!user.progress) {
      user.progress = {};
    }
    if (!user.progress[courseId]) {
      user.progress[courseId] = {
        completedLessons: [],
        lastAccessedAt: new Date().toISOString(),
        xpEarned: 0
      };
    }

    // Add lesson to completed if not already there
    if (!user.progress[courseId].completedLessons.includes(lessonId)) {
      user.progress[courseId].completedLessons.push(lessonId);
      user.progress[courseId].xpEarned = (user.progress[courseId].xpEarned || 0) + (xpEarned || 0);
      user.xpPoints = (user.xpPoints || 0) + (xpEarned || 0);
    }

    user.progress[courseId].lastAccessedAt = new Date().toISOString();

    // Update user in database
    await container.item(user.id, user.tenantId).replace(user);

    res.json({
      success: true,
      progress: user.progress[courseId],
      totalXp: user.xpPoints
    });
  } catch (error: any) {
    console.error('[API] Error marking lesson as complete:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:userId/progress/:courseId - Get user progress for course
app.get('/api/users/:userId/progress/:courseId', requireAuth, requireOwnershipOrAdmin('userId'), async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const container = getContainer('users');
    
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @userId',
      parameters: [{ name: '@userId', value: userId }]
    };
    
    const { resources } = await container.items.query(querySpec).fetchAll();
    
    if (!resources || resources.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = resources[0];
    const courseProgress = user.progress?.[courseId] || {
      completedLessons: [],
      lastAccessedAt: null,
      xpEarned: 0
    };

    res.json(courseProgress);
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
