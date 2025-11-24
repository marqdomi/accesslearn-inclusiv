import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initializeAppInsights, trackException, trackMetric, trackEvent } from './services/applicationinsights.service';
import { trackRequestTelemetry, trackErrorTelemetry } from './middleware/telemetry';
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
  updateTenant,
} from './functions/TenantFunctions';
import {
  createUser,
  getUserById,
  getUsersByTenant,
  getTenantUserStats,
  enrollUserInCourse,
  completeCourse,
  updateUser,
  changePassword,
  updateProfile,
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
  publishCourse,
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
  getUserAchievements,
  unlockAchievement,
  getUserStats,
  checkAndUnlockAchievements
} from './functions/AchievementFunctions';
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
  getHighLevelStats,
  getUserProgressReport,
  getCourseReport,
  getTeamReport,
  getAssessmentReport,
  getMentorshipReport
} from './functions/AnalyticsFunctions';
import {
  getCourseQuestions,
  getQuestionAnswers,
  createQuestion,
  createAnswer,
  upvoteQuestion,
  upvoteAnswer,
  markBestAnswer,
  deleteQuestion,
  deleteAnswer
} from './functions/ForumFunctions';
import {
  createQuizAttempt,
  getUserQuizAttempts,
  getQuizAttemptsByQuiz,
  getCourseQuizAttempts,
  getBestQuizScore,
  getQuizAttemptStats
} from './functions/QuizAttemptFunctions';
import {
  getActivityFeed,
  getUserActivityFeed,
  createActivityFeedItem,
  addActivityReaction,
  addActivityComment
} from './functions/ActivityFeedFunctions';
import {
  getUserNotifications,
  getUnreadNotificationCount,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences
} from './functions/NotificationFunctions';
import {
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
} from './functions/AuditFunctions';
import { attachAuditMetadata, auditCreate, auditRoleChange } from './middleware/audit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7071;

// ============================================
// CORS CONFIGURATION - MUST BE FIRST
// ============================================

// CORS configuration - allow specific origins in production
// IMPORTANT: CORS must be configured BEFORE other middleware
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          'https://app.kainet.mx',
          'https://api.kainet.mx',
          process.env.FRONTEND_URL || 'https://app.kainet.mx'
        ]
      : ['http://localhost:5173', 'http://localhost:5001', 'http://127.0.0.1:5173', 'http://127.0.0.1:5001'];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origin not allowed: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
};

// Apply CORS FIRST, before any other middleware
app.use(cors(corsOptions));

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet.js - Security headers (configured to work with CORS)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for iframes if needed
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin requests
}));

// Rate limiting - General API rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: {
    error: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for OPTIONS requests (preflight)
    return req.method === 'OPTIONS';
  },
});

// Rate limiting - Stricter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    error: 'Demasiados intentos de inicio de sesión, por favor intenta de nuevo más tarde.',
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => {
    // Skip rate limiting for OPTIONS requests (preflight)
    return req.method === 'OPTIONS';
  },
});

// Apply general rate limiting to all routes
app.use('/api/', generalLimiter);
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size

// Application Insights telemetry middleware (track all requests)
app.use(trackRequestTelemetry);

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

// POST /api/auth/login - Login user (with stricter rate limiting)
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password, tenantId } = req.body;

    if (!email || !tenantId) {
      return res.status(400).json({ error: 'email and tenantId are required' });
    }

    const result = await login({ email, password, tenantId });

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    // Track successful login
    if (result.success && result.user) {
      trackEvent('UserLoggedIn', {
        userId: result.user.id,
        tenantId: result.user.tenantId,
        role: result.user.role,
      });
    }

    res.json(result);
  } catch (error: any) {
    console.error('[API] Error during login:', error);
    trackException(error, {
      endpoint: '/api/auth/login',
      tenantId: req.body.tenantId,
      errorType: 'LoginError',
    });
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

// GET /api/tenants/:id - Get tenant by ID (requires auth)
app.get('/api/tenants/:id', authenticateToken, requireAuth, async (req, res) => {
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
app.post('/api/tenants', authenticateToken, requireAuth, requirePermission('tenants:create'), async (req, res) => {
  try {
    const tenant = await createTenant(req.body);
    res.status(201).json(tenant);
  } catch (error: any) {
    console.error('[API] Error creating tenant:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/tenants/:id - Update tenant
app.put('/api/tenants/:id', authenticateToken, requireAuth, requirePermission('tenants:update'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }
    
    // Only super-admin or tenant-admin of the same tenant can update
    if (user.role !== 'super-admin' && user.tenantId !== id) {
      return res.status(403).json({ error: 'No tienes permiso para actualizar este tenant' });
    }
    
    const tenant = await updateTenant(id, req.body);
    res.json(tenant);
  } catch (error: any) {
    console.error('[API] Error updating tenant:', error);
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

    console.log(`[API] Getting user ${id} for tenant ${tenantId}`);
    const user = await getUserById(id, tenantId as string);

    if (!user) {
      console.warn(`[API] User ${id} not found for tenant ${tenantId}`);
      return res.status(404).json({ 
        error: `User ${id} not found for tenant ${tenantId}`,
        userId: id,
        tenantId: tenantId
      });
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

    console.log(`[API] Enrolling user ${id} in course ${courseId} for tenant ${tenantId}`);
    const user = await enrollUserInCourse(id, tenantId, courseId);
    res.json(user);
  } catch (error: any) {
    console.error('[API] Error enrolling user:', error);
    // Provide more context in error message
    const errorMessage = error.message || 'Error al inscribir usuario en el curso';
    res.status(400).json({ 
      error: errorMessage,
      userId: req.params.id,
      tenantId: req.body.tenantId,
      courseId: req.body.courseId
    });
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

// PUT /api/users/:id - Update user (admin only - for role/status changes)
app.put('/api/users/:id', requireAuth, requirePermission('users:update'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { tenantId, ...updates } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    // Users can only update their own profile, admins can update anyone
    if (user.id !== id && user.role !== 'super-admin' && user.role !== 'tenant-admin') {
      return res.status(403).json({ error: 'No tienes permiso para actualizar este usuario' });
    }

    const updatedUser = await updateUser(id, tenantId, updates);
    res.json(updatedUser);
  } catch (error: any) {
    console.error('[API] Error updating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/users/:id/profile - Update user profile (user can update own profile)
app.put('/api/users/:id/profile', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { tenantId, ...profileUpdates } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    // Users can only update their own profile
    if (user.id !== id && user.role !== 'super-admin' && user.role !== 'tenant-admin') {
      return res.status(403).json({ error: 'No tienes permiso para actualizar este perfil' });
    }

    const updatedUser = await updateProfile(id, tenantId, profileUpdates);
    res.json(updatedUser);
  } catch (error: any) {
    console.error('[API] Error updating profile:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/users/:id/password - Change user password
app.put('/api/users/:id/password', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { tenantId, currentPassword, newPassword } = req.body;

    if (!tenantId || !currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'tenantId, currentPassword, and newPassword are required' 
      });
    }

    // Users can only change their own password
    if (user.id !== id && user.role !== 'super-admin' && user.role !== 'tenant-admin') {
      return res.status(403).json({ error: 'No tienes permiso para cambiar esta contraseña' });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe tener al menos 8 caracteres' 
      });
    }

    const updatedUser = await changePassword(id, tenantId, currentPassword, newPassword);
    res.json({ 
      success: true, 
      message: 'Contraseña actualizada correctamente',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      }
    });
  } catch (error: any) {
    console.error('[API] Error changing password:', error);
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

// POST /api/users/register - Public user registration (for demos)
app.post('/api/users/register', async (req, res) => {
  try {
    const { tenantSlug, email, firstName, lastName, password, role } = req.body;

    if (!tenantSlug || !email || !firstName || !lastName || !password) {
      return res.status(400).json({ 
        error: 'tenantSlug, email, firstName, lastName, and password are required' 
      });
    }

    // Get tenant by slug
    const { getTenantBySlug } = await import('./functions/TenantFunctions');
    const tenant = await getTenantBySlug(tenantSlug);
    
    if (!tenant) {
      return res.status(404).json({ error: `Organización "${tenantSlug}" no encontrada.` });
    }

    // Register user
    const { registerUser } = await import('./functions/UserFunctions');
    const user = await registerUser({
      tenantId: tenant.id,
      email,
      firstName,
      lastName,
      password,
      role: role || 'student' // Default to student for public registration
    });
    
    // Send welcome email
    try {
      const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
      
      await emailService.sendWelcomeEmail({
        recipientEmail: user.email,
        recipientName: `${user.firstName} ${user.lastName}`,
        tenantName: tenant.name,
        loginUrl
      });
      
      console.log(`✅ Welcome email sent to ${user.email}`);
    } catch (emailError: any) {
      console.error('⚠️ Failed to send welcome email:', emailError.message);
      // Don't fail the request if email fails
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      user: userWithoutPassword,
      message: 'Usuario registrado exitosamente. Ya puedes iniciar sesión.'
    });
  } catch (error: any) {
    console.error('[API] Error registering user:', error);
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

// POST /api/courses/:courseId/publish - Publish course directly (bypass approval)
app.post('/api/courses/:courseId/publish',
  requireAuth,
  requirePermission('courses:publish'),
  async (req, res) => {
    try {
      const user = (req as any).user;
      const { courseId } = req.params;

      const course = await publishCourse(courseId, user.tenantId, user.id);
      res.json(course);
    } catch (error: any) {
      console.error('[API] Error publishing course:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/courses/:courseId/approve - Approve course (from pending-review)
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
// ANALYTICS ENDPOINTS
// ============================================

// GET /api/analytics/high-level - Get high-level platform statistics
app.get('/api/analytics/high-level', requireAuth, requirePermission('analytics:view-all'), async (req, res) => {
  try {
    const user = (req as any).user;
    const stats = await getHighLevelStats(user.tenantId);
    res.json(stats);
  } catch (error: any) {
    console.error('[API] Error getting high-level stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/user-progress - Get user progress report
app.get('/api/analytics/user-progress', requireAuth, requirePermission('analytics:view-all'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { searchQuery, teamId, mentorId } = req.query;
    
    const filters: any = {};
    if (searchQuery) filters.searchQuery = searchQuery as string;
    if (teamId) filters.teamId = teamId as string;
    if (mentorId) filters.mentorId = mentorId as string;
    
    const report = await getUserProgressReport(user.tenantId, filters);
    res.json(report);
  } catch (error: any) {
    console.error('[API] Error getting user progress report:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/course/:courseId - Get course report
app.get('/api/analytics/course/:courseId', requireAuth, requirePermission('analytics:view-all'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { courseId } = req.params;
    const report = await getCourseReport(user.tenantId, courseId);
    res.json(report);
  } catch (error: any) {
    console.error('[API] Error getting course report:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/team - Get team report
app.get('/api/analytics/team', requireAuth, requirePermission('analytics:view-all'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { teamId } = req.query;
    const report = await getTeamReport(user.tenantId, teamId as string | undefined);
    res.json(report);
  } catch (error: any) {
    console.error('[API] Error getting team report:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/assessment/:quizId - Get assessment/quiz report
app.get('/api/analytics/assessment/:quizId', requireAuth, requirePermission('analytics:view-all'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { quizId } = req.params;
    const report = await getAssessmentReport(user.tenantId, quizId);
    res.json(report);
  } catch (error: any) {
    console.error('[API] Error getting assessment report:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/mentorship - Get mentorship report
app.get('/api/analytics/mentorship', requireAuth, requirePermission('analytics:view-all'), async (req, res) => {
  try {
    const user = (req as any).user;
    const report = await getMentorshipReport(user.tenantId);
    res.json(report);
  } catch (error: any) {
    console.error('[API] Error getting mentorship report:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// FORUM/Q&A ENDPOINTS
// ============================================

// GET /api/forums/course/:courseId/questions - Get all questions for a course
app.get('/api/forums/course/:courseId/questions', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { courseId } = req.params;
    const { moduleId } = req.query;
    const questions = await getCourseQuestions(user.tenantId, courseId, moduleId as string | undefined);
    res.json(questions);
  } catch (error: any) {
    console.error('[API] Error getting course questions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/forums/question/:questionId/answers - Get all answers for a question
app.get('/api/forums/question/:questionId/answers', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { questionId } = req.params;
    const answers = await getQuestionAnswers(user.tenantId, questionId);
    res.json(answers);
  } catch (error: any) {
    console.error('[API] Error getting question answers:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/forums/course/:courseId/questions - Create a new question
app.post('/api/forums/course/:courseId/questions', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { courseId } = req.params;
    const { moduleId, title, content, userName, userAvatar } = req.body;

    if (!moduleId || !title || !content) {
      return res.status(400).json({ error: 'moduleId, title, and content are required' });
    }

    const question = await createQuestion(
      user.tenantId,
      courseId,
      moduleId,
      user.id,
      userName || `${user.firstName} ${user.lastName}`,
      userAvatar,
      title,
      content
    );
    res.json(question);
  } catch (error: any) {
    console.error('[API] Error creating question:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/forums/question/:questionId/answers - Create a new answer
app.post('/api/forums/question/:questionId/answers', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { questionId } = req.params;
    const { content, userName, userAvatar } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const answer = await createAnswer(
      user.tenantId,
      questionId,
      user.id,
      userName || `${user.firstName} ${user.lastName}`,
      userAvatar,
      content
    );
    res.json(answer);
  } catch (error: any) {
    console.error('[API] Error creating answer:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/forums/question/:questionId/upvote - Upvote a question
app.post('/api/forums/question/:questionId/upvote', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { questionId } = req.params;
    const question = await upvoteQuestion(user.tenantId, questionId, user.id);
    res.json(question);
  } catch (error: any) {
    console.error('[API] Error upvoting question:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/forums/answer/:answerId/upvote - Upvote an answer
app.post('/api/forums/answer/:answerId/upvote', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { answerId } = req.params;
    const answer = await upvoteAnswer(user.tenantId, answerId, user.id);
    res.json(answer);
  } catch (error: any) {
    console.error('[API] Error upvoting answer:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/forums/answer/:answerId/best - Mark answer as best answer
app.post('/api/forums/answer/:answerId/best', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { answerId } = req.params;
    
    // Get the answer to check question ownership
    const forumsContainer = getContainer('forums');
    const { resource: answer } = await forumsContainer.item(answerId, user.tenantId).read();
    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Get the question to check ownership
    const { resource: question } = await forumsContainer.item(answer.questionId, user.tenantId).read();
    const isQuestionOwner = question?.userId === user.id;
    const isAdmin = user.role === 'super-admin' || user.role === 'tenant-admin';

    const updatedAnswer = await markBestAnswer(user.tenantId, answerId, user.id, isQuestionOwner, isAdmin);
    res.json(updatedAnswer);
  } catch (error: any) {
    console.error('[API] Error marking best answer:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/forums/question/:questionId - Delete a question
app.delete('/api/forums/question/:questionId', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { questionId } = req.params;
    const isAdmin = user.role === 'super-admin' || user.role === 'tenant-admin';
    await deleteQuestion(user.tenantId, questionId, user.id, isAdmin);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[API] Error deleting question:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/forums/answer/:answerId - Delete an answer
app.delete('/api/forums/answer/:answerId', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { answerId } = req.params;
    const isAdmin = user.role === 'super-admin' || user.role === 'tenant-admin';
    await deleteAnswer(user.tenantId, answerId, user.id, isAdmin);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[API] Error deleting answer:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// QUIZ ATTEMPTS ENDPOINTS
// ============================================

// POST /api/quiz-attempts - Create a new quiz attempt
app.post('/api/quiz-attempts', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { courseId, quizId, score, answers } = req.body;

    if (!courseId || !quizId || score === undefined || !answers) {
      return res.status(400).json({ error: 'courseId, quizId, score, and answers are required' });
    }

    const attempt = await createQuizAttempt(
      user.tenantId,
      user.id,
      courseId,
      quizId,
      score,
      answers
    );
    res.json(attempt);
  } catch (error: any) {
    console.error('[API] Error creating quiz attempt:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quiz-attempts/user/:userId - Get all quiz attempts for a user
app.get('/api/quiz-attempts/user/:userId', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId } = req.params;
    const { quizId } = req.query;

    // Users can only see their own attempts unless admin
    if (userId !== user.id && user.role !== 'super-admin' && user.role !== 'tenant-admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const attempts = await getUserQuizAttempts(user.tenantId, userId, quizId as string | undefined);
    res.json(attempts);
  } catch (error: any) {
    console.error('[API] Error getting user quiz attempts:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quiz-attempts/quiz/:quizId - Get all attempts for a quiz
app.get('/api/quiz-attempts/quiz/:quizId', requireAuth, requirePermission('analytics:view-all'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { quizId } = req.params;
    const attempts = await getQuizAttemptsByQuiz(user.tenantId, quizId);
    res.json(attempts);
  } catch (error: any) {
    console.error('[API] Error getting quiz attempts:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quiz-attempts/course/:courseId - Get all attempts for a course
app.get('/api/quiz-attempts/course/:courseId', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { courseId } = req.params;
    const { userId } = req.query;

    // Users can only see their own attempts unless admin
    const targetUserId = (user.role === 'super-admin' || user.role === 'tenant-admin') 
      ? (userId as string | undefined)
      : user.id;

    const attempts = await getCourseQuizAttempts(user.tenantId, courseId, targetUserId);
    res.json(attempts);
  } catch (error: any) {
    console.error('[API] Error getting course quiz attempts:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quiz-attempts/best/:quizId - Get best score for current user on a quiz
app.get('/api/quiz-attempts/best/:quizId', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { quizId } = req.params;
    const bestScore = await getBestQuizScore(user.tenantId, user.id, quizId);
    res.json({ bestScore });
  } catch (error: any) {
    console.error('[API] Error getting best quiz score:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quiz-attempts/stats/:quizId - Get quiz attempt statistics
app.get('/api/quiz-attempts/stats/:quizId', requireAuth, requirePermission('analytics:view-all'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { quizId } = req.params;
    const stats = await getQuizAttemptStats(user.tenantId, quizId);
    res.json(stats);
  } catch (error: any) {
    console.error('[API] Error getting quiz attempt stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ACTIVITY FEED ENDPOINTS
// ============================================

// GET /api/activity-feed - Get activity feed
app.get('/api/activity-feed', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { limit } = req.query;
    const activities = await getActivityFeed(user.tenantId, limit ? parseInt(limit as string) : 50);
    res.json(activities);
  } catch (error: any) {
    console.error('[API] Error getting activity feed:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/activity-feed/user/:userId - Get user's activity feed
app.get('/api/activity-feed/user/:userId', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId } = req.params;
    const { limit } = req.query;

    // Users can only see their own activities unless admin
    if (userId !== user.id && user.role !== 'super-admin' && user.role !== 'tenant-admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const activities = await getUserActivityFeed(user.tenantId, userId, limit ? parseInt(limit as string) : 20);
    res.json(activities);
  } catch (error: any) {
    console.error('[API] Error getting user activity feed:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/activity-feed - Create activity feed item
app.post('/api/activity-feed', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { type, data, userName, userAvatar } = req.body;

    if (!type || !data) {
      return res.status(400).json({ error: 'type and data are required' });
    }

    const activity = await createActivityFeedItem(
      user.tenantId,
      user.id,
      userName || `${user.firstName} ${user.lastName}`,
      userAvatar,
      type,
      data
    );
    res.json(activity);
  } catch (error: any) {
    console.error('[API] Error creating activity feed item:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/activity-feed/:activityId/reaction - Add reaction to activity
app.post('/api/activity-feed/:activityId/reaction', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { activityId } = req.params;
    const { reactionType } = req.body;

    if (!reactionType) {
      return res.status(400).json({ error: 'reactionType is required' });
    }

    const activity = await addActivityReaction(
      user.tenantId,
      activityId,
      user.id,
      `${user.firstName} ${user.lastName}`,
      reactionType
    );
    res.json(activity);
  } catch (error: any) {
    console.error('[API] Error adding activity reaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/activity-feed/:activityId/comment - Add comment to activity
app.post('/api/activity-feed/:activityId/comment', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { activityId } = req.params;
    const { content, userName, userAvatar } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const activity = await addActivityComment(
      user.tenantId,
      activityId,
      user.id,
      userName || `${user.firstName} ${user.lastName}`,
      userAvatar,
      content
    );
    res.json(activity);
  } catch (error: any) {
    console.error('[API] Error adding activity comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// NOTIFICATIONS ENDPOINTS
// ============================================

// GET /api/notifications - Get user notifications
app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { unreadOnly } = req.query;
    const notifications = await getUserNotifications(
      user.tenantId,
      user.id,
      unreadOnly === 'true'
    );
    res.json(notifications);
  } catch (error: any) {
    console.error('[API] Error getting notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notifications/unread-count - Get unread notification count
app.get('/api/notifications/unread-count', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const count = await getUnreadNotificationCount(user.tenantId, user.id);
    res.json({ count });
  } catch (error: any) {
    console.error('[API] Error getting unread notification count:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notifications - Create notification
app.post('/api/notifications', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { userId, ...notificationData } = req.body;

    // Only admins can create notifications for other users
    const targetUserId = (user.role === 'super-admin' || user.role === 'tenant-admin') && userId
      ? userId
      : user.id;

    const notification = await createNotification(user.tenantId, targetUserId, notificationData);
    res.json(notification);
  } catch (error: any) {
    console.error('[API] Error creating notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/notifications/:notificationId/read - Mark notification as read
app.put('/api/notifications/:notificationId/read', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { notificationId } = req.params;
    const notification = await markNotificationAsRead(user.tenantId, notificationId);
    res.json(notification);
  } catch (error: any) {
    console.error('[API] Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read
app.put('/api/notifications/read-all', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const count = await markAllNotificationsAsRead(user.tenantId, user.id);
    res.json({ count });
  } catch (error: any) {
    console.error('[API] Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/notifications/:notificationId - Delete notification
app.delete('/api/notifications/:notificationId', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { notificationId } = req.params;
    await deleteNotification(user.tenantId, notificationId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[API] Error deleting notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/notifications/preferences - Get notification preferences
app.get('/api/notifications/preferences', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const preferences = await getNotificationPreferences(user.tenantId, user.id);
    res.json(preferences);
  } catch (error: any) {
    console.error('[API] Error getting notification preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/notifications/preferences - Update notification preferences
app.put('/api/notifications/preferences', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const preferences = await updateNotificationPreferences(user.tenantId, user.id, req.body);
    res.json(preferences);
  } catch (error: any) {
    console.error('[API] Error updating notification preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ERROR HANDLING MIDDLEWARE (Must be last)
// ============================================

// Application Insights error tracking
app.use(trackErrorTelemetry);

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[GLOBAL ERROR HANDLER]', error);
  
  // Track exception
  trackException(error, {
    endpoint: req.path,
    method: req.method,
    tenantId: (req as any).user?.tenantId || 'unknown',
    userId: (req as any).user?.id || 'anonymous',
  });
  
  res.status(error.status || 500).json({
    error: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// ============================================
// START SERVER
// ============================================

async function startServer() {
  try {
    console.log('\n🚀 Iniciando AccessLearn Backend API...\n');

    // Initialize Application Insights (must be done before anything else)
    console.log('📊 Inicializando Application Insights...');
    initializeAppInsights();
    
    // Track server startup event
    trackEvent('ServerStarted', {
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '3000',
    });

    // Initialize Cosmos DB
    console.log('📦 Conectando a Cosmos DB...');
    await initializeCosmos();
    console.log('✅ Cosmos DB conectado\n');
    
    // Track Cosmos DB connection metric
    trackMetric('CosmosDB.Connected', 1);

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
      
      // Track server startup metric
      trackMetric('Server.Started', 1, {
        port: PORT.toString(),
        environment: process.env.NODE_ENV || 'development',
      });
      
      console.log('');
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
  } catch (error: any) {
    console.error('❌ Error iniciando servidor:', error);
    trackException(error, {
      context: 'startServer',
      errorType: 'ServerStartupError',
    });
    process.exit(1);
  }
}

startServer();
