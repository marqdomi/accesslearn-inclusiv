import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeCosmos } from './services/cosmosdb.service';
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
      console.log('   GET  /api/courses/tenant/:tenantId\n');
      console.log('🎯 Presiona Ctrl+C para detener el servidor\n');
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

startServer();
