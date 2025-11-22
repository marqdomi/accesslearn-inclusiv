/**
 * Functional Testing Script
 * Tests main application functionality
 */

import * as http from 'http';

const API_URL = process.env.API_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration?: number;
}

const results: TestResult[] = [];
let authToken: string | null = null;
let testUserId: string | null = null;
let testTenantId: string | null = null;
let testCourseId: string | null = null;

function makeRequest(url: string, options: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function test(name: string, testFn: () => Promise<boolean>): Promise<void> {
  const start = Date.now();
  try {
    const passed = await testFn();
    const duration = Date.now() - start;
    results.push({ name, passed, message: passed ? '✅ PASSED' : '❌ FAILED', duration });
    console.log(`${passed ? '✅' : '❌'} ${name} (${duration}ms)`);
  } catch (error: any) {
    const duration = Date.now() - start;
    results.push({ name, passed: false, message: `❌ ERROR: ${error.message}`, duration });
    console.log(`❌ ${name} - ERROR: ${error.message}`);
  }
}

// Test 1: Login with different roles
async function testLoginSuperAdmin(): Promise<boolean> {
  const response = await makeRequest(`${API_URL}/api/auth/login`, {
    method: 'POST',
    body: {
      email: 'ana.lopez@kainet.mx',
      password: 'Demo123!',
      tenantId: 'kainet',
    },
  });

  if (response.status === 429) {
    console.log(`  ⚠️  Rate limited (429) - This is expected behavior. Rate limiting is working correctly.`);
    console.log(`  Note: Wait 15 minutes or use a different IP to test login.`);
    // Try to continue with other tests that don't require auth
    return false;
  }

  if (response.status !== 200 || !response.body.success || !response.body.token) {
    console.log(`  Expected 200 with token, got ${response.status}`);
    if (response.body.error) {
      console.log(`  Error: ${response.body.error}`);
    }
    return false;
  }

  authToken = response.body.token;
  testUserId = response.body.user.id;
  testTenantId = response.body.user.tenantId;

  if (response.body.user.role !== 'super-admin') {
    console.log(`  Expected super-admin, got ${response.body.user.role}`);
    return false;
  }

  console.log(`  User: ${response.body.user.email} (${response.body.user.role})`);
  return true;
}

// Test 2: Get user by ID
async function testGetUserById(): Promise<boolean> {
  if (!testUserId || !testTenantId) {
    console.log(`  No user ID available`);
    return false;
  }

  const response = await makeRequest(`${API_URL}/api/users/${testUserId}?tenantId=${testTenantId}`);

  if (response.status !== 200 || !response.body.id) {
    console.log(`  Expected 200 with user data, got ${response.status}`);
    return false;
  }

  console.log(`  User retrieved: ${response.body.email}`);
  return true;
}

// Test 3: Get tenants
async function testGetTenants(): Promise<boolean> {
  const response = await makeRequest(`${API_URL}/api/tenants`);

  if (response.status !== 200 || !Array.isArray(response.body)) {
    console.log(`  Expected 200 with array, got ${response.status}`);
    return false;
  }

  console.log(`  Found ${response.body.length} tenant(s)`);
  return true;
}

// Test 4: Get tenant by slug
async function testGetTenantBySlug(): Promise<boolean> {
  const response = await makeRequest(`${API_URL}/api/tenants/slug/kainet`);

  if (response.status !== 200 || !response.body.id) {
    console.log(`  Expected 200 with tenant data, got ${response.status}`);
    return false;
  }

  // Set tenant ID for other tests
  if (!testTenantId) {
    testTenantId = response.body.id;
  }

  console.log(`  Tenant retrieved: ${response.body.name}`);
  return true;
}

// Test 5: Get courses
async function testGetCourses(): Promise<boolean> {
  if (!testTenantId) {
    console.log(`  No tenant ID available`);
    return false;
  }

  const response = await makeRequest(`${API_URL}/api/courses/tenant/${testTenantId}`);

  if (response.status !== 200 || !Array.isArray(response.body)) {
    console.log(`  Expected 200 with array, got ${response.status}`);
    return false;
  }

  console.log(`  Found ${response.body.length} course(s)`);
  if (response.body.length > 0) {
    testCourseId = response.body[0].id;
  }
  return true;
}

// Test 6: Create course
async function testCreateCourse(): Promise<boolean> {
  if (!testTenantId || !testUserId) {
    console.log(`  No tenant/user ID available`);
    return false;
  }

  const response = await makeRequest(`${API_URL}/api/courses`, {
    method: 'POST',
    body: {
      title: 'Test Course - Functional Testing',
      description: 'This is a test course created during functional testing',
      category: 'testing',
      estimatedTime: 30,
    },
  });

  if (response.status !== 201 && response.status !== 200) {
    console.log(`  Expected 201/200, got ${response.status}`);
    console.log(`  Response:`, response.body);
    return false;
  }

  if (!response.body.id) {
    console.log(`  Course created but no ID returned`);
    return false;
  }

  testCourseId = response.body.id;
  console.log(`  Course created: ${response.body.title} (${response.body.id})`);
  return true;
}

// Test 7: Get course by ID
async function testGetCourseById(): Promise<boolean> {
  if (!testCourseId) {
    console.log(`  No course ID available`);
    return false;
  }

  const response = await makeRequest(`${API_URL}/api/courses/${testCourseId}`);

  if (response.status !== 200 || !response.body.id) {
    console.log(`  Expected 200 with course data, got ${response.status}`);
    return false;
  }

  console.log(`  Course retrieved: ${response.body.title}`);
  return true;
}

// Test 8: Get user progress
async function testGetUserProgress(): Promise<boolean> {
  if (!testUserId || !testTenantId) {
    console.log(`  No user/tenant ID available`);
    return false;
  }

  const response = await makeRequest(`${API_URL}/api/users/${testUserId}/progress?tenantId=${testTenantId}`);

  if (response.status !== 200) {
    console.log(`  Expected 200, got ${response.status}`);
    return false;
  }

  console.log(`  User progress retrieved`);
  return true;
}

// Test 9: Get gamification stats
async function testGetGamificationStats(): Promise<boolean> {
  if (!testUserId || !testTenantId) {
    console.log(`  No user/tenant ID available`);
    return false;
  }

  const response = await makeRequest(`${API_URL}/api/gamification/stats/${testUserId}?tenantId=${testTenantId}`);

  if (response.status !== 200) {
    console.log(`  Expected 200, got ${response.status}`);
    return false;
  }

  console.log(`  Gamification stats retrieved: Level ${response.body.level || 'N/A'}, XP: ${response.body.totalXP || 0}`);
  return true;
}

// Test 10: Get analytics
async function testGetAnalytics(): Promise<boolean> {
  if (!testTenantId) {
    console.log(`  No tenant ID available`);
    return false;
  }

  const response = await makeRequest(`${API_URL}/api/analytics/high-level-stats?tenantId=${testTenantId}`);

  if (response.status !== 200) {
    console.log(`  Expected 200, got ${response.status}`);
    return false;
  }

  console.log(`  Analytics retrieved`);
  return true;
}

// Test 11: Get user library
async function testGetUserLibrary(): Promise<boolean> {
  if (!testUserId || !testTenantId) {
    console.log(`  No user/tenant ID available`);
    return false;
  }

  const response = await makeRequest(`${API_URL}/api/library/user/${testUserId}?tenantId=${testTenantId}`);

  if (response.status !== 200) {
    console.log(`  Expected 200, got ${response.status}`);
    return false;
  }

  console.log(`  User library retrieved`);
  return true;
}

// Test 12: Get notifications
async function testGetNotifications(): Promise<boolean> {
  if (!testUserId || !testTenantId) {
    console.log(`  No user/tenant ID available`);
    return false;
  }

  const response = await makeRequest(`${API_URL}/api/notifications/user/${testUserId}?tenantId=${testTenantId}`);

  if (response.status !== 200) {
    console.log(`  Expected 200, got ${response.status}`);
    return false;
  }

  console.log(`  Notifications retrieved: ${Array.isArray(response.body) ? response.body.length : 'N/A'} notifications`);
  return true;
}

// Test 13: Get activity feed
async function testGetActivityFeed(): Promise<boolean> {
  if (!testTenantId) {
    console.log(`  No tenant ID available`);
    return false;
  }

  const response = await makeRequest(`${API_URL}/api/activity-feed?tenantId=${testTenantId}`);

  if (response.status !== 200) {
    console.log(`  Expected 200, got ${response.status}`);
    return false;
  }

  console.log(`  Activity feed retrieved: ${Array.isArray(response.body) ? response.body.length : 'N/A'} activities`);
  return true;
}

async function runTests(): Promise<void> {
  console.log('\n🧪 Functional Testing Suite\n');
  console.log(`API URL: ${API_URL}`);
  console.log('='.repeat(60));

  // Authentication Tests
  console.log('\n📋 Authentication Tests:');
  await test('Login (Super Admin)', testLoginSuperAdmin);
  await test('Get User by ID', testGetUserById);

  // Tenant Tests
  console.log('\n📋 Tenant Tests:');
  await test('Get Tenants', testGetTenants);
  await test('Get Tenant by Slug', testGetTenantBySlug);

  // Course Tests
  console.log('\n📋 Course Tests:');
  await test('Get Courses', testGetCourses);
  await test('Create Course', testCreateCourse);
  await test('Get Course by ID', testGetCourseById);

  // User Progress Tests
  console.log('\n📋 User Progress Tests:');
  await test('Get User Progress', testGetUserProgress);

  // Gamification Tests
  console.log('\n📋 Gamification Tests:');
  await test('Get Gamification Stats', testGetGamificationStats);

  // Analytics Tests
  console.log('\n📋 Analytics Tests:');
  await test('Get High-Level Analytics', testGetAnalytics);

  // Library Tests
  console.log('\n📋 Library Tests:');
  await test('Get User Library', testGetUserLibrary);

  // Notifications Tests
  console.log('\n📋 Notifications Tests:');
  await test('Get Notifications', testGetNotifications);

  // Activity Feed Tests
  console.log('\n📋 Activity Feed Tests:');
  await test('Get Activity Feed', testGetActivityFeed);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  results.forEach(r => {
    console.log(`${r.message} - ${r.name}${r.duration ? ` (${r.duration}ms)` : ''}`);
  });

  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  
  if (failed === 0) {
    console.log('\n🎉 All functional tests passed!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.\n');
    process.exit(1);
  }
}

// Check if server is running
async function checkServer(): Promise<boolean> {
  try {
    const response = await makeRequest(`${API_URL}/api/health`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error('\n❌ Error: Server is not running or not accessible');
    console.error(`   Please start the server at ${API_URL}`);
    console.error('\n   Run: cd backend && npm run server\n');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  
  await runTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { runTests, test, makeRequest };

