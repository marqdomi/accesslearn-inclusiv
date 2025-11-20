import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeCosmos, getContainer } from './services/cosmosdb.service';
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
} from './functions/UserFunctions';
import { getCourses } from './functions/GetCourses';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7071;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AccessLearn Backend API',
    timestamp: new Date().toISOString(),
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

// GET /api/tenants - List all tenants
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
app.post('/api/tenants', async (req, res) => {
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

// GET /api/users/tenant/:tenantId - Get users by tenant
app.get('/api/users/tenant/:tenantId', async (req, res) => {
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
app.get('/api/users/:id', async (req, res) => {
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
app.post('/api/users', async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    console.error('[API] Error creating user:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/users/:id/enroll - Enroll user in course
app.post('/api/users/:id/enroll', async (req, res) => {
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

// POST /api/users/:id/complete - Mark course as completed
app.post('/api/users/:id/complete', async (req, res) => {
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

// ============================================
// COURSE ENDPOINTS
// ============================================

// GET /api/courses/tenant/:tenantId - Get courses by tenant
app.get('/api/courses/tenant/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const courses = await getCourses({ tenantId });
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
    
    const { resources } = await container.items.query(querySpec, { 
      enableCrossPartitionQuery: true 
    }).fetchAll();
    
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
    
    const { resources } = await container.items.query(querySpec, { 
      enableCrossPartitionQuery: true 
    }).fetchAll();
    
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

// GET /api/users/:userId/progress/:courseId - Get user progress for a course
app.get('/api/users/:userId/progress/:courseId', async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const container = getContainer('users');
    
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @userId',
      parameters: [{ name: '@userId', value: userId }]
    };
    
    const { resources } = await container.items.query(querySpec, { 
      enableCrossPartitionQuery: true 
    }).fetchAll();
    
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
// MENTORSHIP ENDPOINTS
// ============================================

// POST /api/mentorship/requests - Create mentorship request
app.post('/api/mentorship/requests', async (req, res) => {
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
app.get('/api/mentorship/requests', async (req, res) => {
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
app.get('/api/mentorship/my-requests', async (req, res) => {
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
app.post('/api/mentorship/requests/:requestId/accept', async (req, res) => {
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
app.post('/api/mentorship/requests/:requestId/reject', async (req, res) => {
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
app.get('/api/mentorship/sessions', async (req, res) => {
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
app.get('/api/mentorship/mentors', async (req, res) => {
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
app.get('/api/mentorship/mentors/:mentorId/stats', async (req, res) => {
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
