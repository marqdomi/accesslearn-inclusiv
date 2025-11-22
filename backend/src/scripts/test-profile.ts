/**
 * Profile Feature Testing Script
 * Tests profile management endpoints
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'ana.lopez@kainet.mx';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Demo123!';
const TEST_TENANT_ID = process.env.TEST_TENANT_ID || 'kainet';

let authToken: string | null = null;

async function makeRequest(url: string, options: any = {}, retries = 3, delay = 5000): Promise<{ status: number; body: any; headers: Headers }> {
  for (let i = 0; i < retries; i++) {
    const headers: any = {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...(options.headers || {}),
    };

    // If body is already a string (JSON stringified), use it as is
    // Otherwise, stringify it
    let bodyToSend: string | undefined;
    if (options.body) {
      if (typeof options.body === 'string') {
        bodyToSend = options.body;
      } else if (typeof options.body === 'object') {
        bodyToSend = JSON.stringify(options.body);
      }
    }

    const response = await fetch(url, {
      ...options,
      method: options.method || 'GET',
      headers,
      body: bodyToSend,
    });

    const body = await response.json().catch(() => ({}));

    if (response.status === 429) {
      console.log(`  ⚠️  Rate limited (429) - Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    return { status: response.status, body, headers: response.headers };
  }
  throw new Error(`Request failed after ${retries} retries for ${url}`);
}

async function login(): Promise<{ success: boolean; userId?: string; tenantId?: string }> {
  console.log('\n🔐 Testing Login...');
  try {
    const loginData = {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      tenantId: TEST_TENANT_ID,
    };

    const { status, body } = await makeRequest(`${API_URL}/api/auth/login`, {
      method: 'POST',
      body: loginData, // Will be stringified in makeRequest
    }, 5, 10000); // More retries for login due to rate limiting

    if (status === 429) {
      console.log(`  ⚠️  Rate limited (429) - This is expected behavior. Rate limiting is working correctly.`);
      console.log(`  Note: Wait 15 minutes or use a different IP to test login.`);
      return { success: false };
    }

    if (status === 200 && body.success && body.token) {
      authToken = body.token;
      const userId = body.user?.id;
      const tenantId = body.user?.tenantId;
      console.log('  ✅ Login successful');
      console.log(`  👤 User: ${body.user?.firstName} ${body.user?.lastName}`);
      console.log(`  🆔 User ID: ${userId}`);
      console.log(`  🏢 Tenant: ${tenantId}`);
      return { success: true, userId, tenantId };
    } else {
      console.log(`  ❌ Login failed: ${status} - ${body.error || JSON.stringify(body)}`);
      return { success: false };
    }
  } catch (error: any) {
    console.log(`  ❌ Login error: ${error.message}`);
    return { success: false };
  }
}

async function testGetProfile(userId: string, tenantId: string) {
  console.log('\n📋 Testing GET /api/users/:id (Get Profile)...');
  try {
    const { status, body } = await makeRequest(
      `${API_URL}/api/users/${userId}?tenantId=${tenantId}`,
      { method: 'GET' }
    );

    if (status === 200 && body.id) {
      console.log('  ✅ Get profile successful');
      console.log(`  👤 User: ${body.firstName} ${body.lastName}`);
      console.log(`  📧 Email: ${body.email}`);
      console.log(`  📱 Phone: ${body.phone || 'N/A'}`);
      console.log(`  🎭 Avatar: ${body.avatar ? '✅ Set' : '❌ Not set'}`);
      return { success: true, user: body };
    } else {
      console.log(`  ❌ Get profile failed: ${status} - ${body.error || JSON.stringify(body)}`);
      return { success: false };
    }
  } catch (error: any) {
    console.log(`  ❌ Get profile error: ${error.message}`);
    return { success: false };
  }
}

async function testUpdateProfile(userId: string, tenantId: string) {
  console.log('\n📝 Testing PUT /api/users/:id/profile (Update Profile)...');
  try {
    const profileData = {
      tenantId,
      firstName: 'Test',
      lastName: 'User',
      phone: '+52 55 1234 5678',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'México',
      },
    };

    const { status, body } = await makeRequest(
      `${API_URL}/api/users/${userId}/profile`,
      {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }
    );

    if (status === 200 && body.id) {
      console.log('  ✅ Update profile successful');
      console.log(`  👤 Updated: ${body.firstName} ${body.lastName}`);
      console.log(`  📱 Phone: ${body.phone}`);
      console.log(`  📅 Date of Birth: ${body.dateOfBirth}`);
      console.log(`  🏠 Address: ${body.address?.city || 'N/A'}`);
      return { success: true, user: body };
    } else {
      console.log(`  ❌ Update profile failed: ${status} - ${body.error || JSON.stringify(body)}`);
      return { success: false };
    }
  } catch (error: any) {
    console.log(`  ❌ Update profile error: ${error.message}`);
    return { success: false };
  }
}

async function testUpdateAvatar(userId: string, tenantId: string) {
  console.log('\n🖼️  Testing PUT /api/users/:id/profile (Update Avatar)...');
  try {
    // Create a simple base64 image (1x1 pixel transparent PNG)
    const base64Avatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const profileData = {
      tenantId,
      avatar: base64Avatar,
    };

    const { status, body } = await makeRequest(
      `${API_URL}/api/users/${userId}/profile`,
      {
        method: 'PUT',
        body: JSON.stringify(profileData),
      }
    );

    if (status === 200 && body.avatar) {
      console.log('  ✅ Update avatar successful');
      console.log(`  🖼️  Avatar URL: ${body.avatar.substring(0, 50)}...`);
      return { success: true, user: body };
    } else {
      console.log(`  ❌ Update avatar failed: ${status} - ${body.error || JSON.stringify(body)}`);
      return { success: false };
    }
  } catch (error: any) {
    console.log(`  ❌ Update avatar error: ${error.message}`);
    return { success: false };
  }
}

async function testChangePassword(userId: string, tenantId: string) {
  console.log('\n🔒 Testing PUT /api/users/:id/password (Change Password)...');
  try {
    const currentPassword = TEST_PASSWORD;
    const newPassword = 'NewTest1234!';

    const passwordData = {
      tenantId,
      currentPassword,
      newPassword,
    };

    const { status, body } = await makeRequest(
      `${API_URL}/api/users/${userId}/password`,
      {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      }
    );

    if (status === 200 && body.success) {
      console.log('  ✅ Change password successful');
      console.log(`  ✅ Message: ${body.message}`);
      
      // Change back to original password
      console.log('  🔄 Changing password back to original...');
      const revertData = {
        tenantId,
        currentPassword: newPassword,
        newPassword: currentPassword,
      };

      const revertResult = await makeRequest(
        `${API_URL}/api/users/${userId}/password`,
        {
          method: 'PUT',
          body: JSON.stringify(revertData),
        }
      );

      if (revertResult.status === 200 && revertResult.body.success) {
        console.log('  ✅ Password reverted successfully');
      } else {
        console.log(`  ⚠️  Password revert failed: ${revertResult.body.error || 'Unknown error'}`);
      }

      return { success: true };
    } else {
      console.log(`  ❌ Change password failed: ${status} - ${body.error || JSON.stringify(body)}`);
      return { success: false };
    }
  } catch (error: any) {
    console.log(`  ❌ Change password error: ${error.message}`);
    return { success: false };
  }
}

async function testChangePasswordValidation(userId: string, tenantId: string) {
  console.log('\n🔒 Testing PUT /api/users/:id/password (Password Validation)...');
  try {
    // Test 1: Password too short
    console.log('  📋 Test 1: Password too short (< 8 characters)');
    const { status: status1, body: body1 } = await makeRequest(
      `${API_URL}/api/users/${userId}/password`,
      {
        method: 'PUT',
        body: JSON.stringify({
          tenantId,
          currentPassword: TEST_PASSWORD,
          newPassword: 'Short1!',
        }),
      }
    );

    if (status1 === 400 && body1.error) {
      console.log(`  ✅ Validation working: ${body1.error}`);
    } else {
      console.log(`  ❌ Validation failed: Should reject short password`);
    }

    // Test 2: Passwords don't match
    console.log('  📋 Test 2: Current password incorrect');
    const { status: status2, body: body2 } = await makeRequest(
      `${API_URL}/api/users/${userId}/password`,
      {
        method: 'PUT',
        body: JSON.stringify({
          tenantId,
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!',
        }),
      }
    );

    if (status2 === 400 && body2.error) {
      console.log(`  ✅ Validation working: ${body2.error}`);
    } else {
      console.log(`  ❌ Validation failed: Should reject incorrect current password`);
    }

    return { success: true };
  } catch (error: any) {
    console.log(`  ❌ Password validation test error: ${error.message}`);
    return { success: false };
  }
}

async function main() {
  console.log('🧪 Profile Feature Testing Script');
  console.log('==================================');
  console.log(`🌐 API URL: ${API_URL}`);
  console.log(`📧 Test Email: ${TEST_EMAIL}`);
  console.log('');

  // Step 1: Login
  const loginResult = await login();
  if (!loginResult.success || !loginResult.userId || !loginResult.tenantId) {
    console.log('\n❌ Login failed. Cannot continue with profile tests.');
    console.log('   Make sure the backend server is running and credentials are correct.');
    process.exit(1);
  }

  const userId = loginResult.userId;
  const tenantId = loginResult.tenantId;

  // Step 2: Get profile
  console.log(`\n📋 Testing with User ID: ${userId}, Tenant ID: ${tenantId}`);
  const getProfileResult = await testGetProfile(userId, tenantId);

  // Step 3: Update profile
  await testUpdateProfile(userId, tenantId);
  await testUpdateAvatar(userId, tenantId);
  await testChangePasswordValidation(userId, tenantId);
  await testChangePassword(userId, tenantId);

  console.log('\n✅ Profile testing complete!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Test profile updates manually from the browser');
  console.log('   2. Test avatar upload with real images');
  console.log('   3. Test password change flow end-to-end');
  console.log('   4. Verify all changes persist in Cosmos DB');
}

// Run tests
main().catch((error) => {
  console.error('\n❌ Test script failed:', error);
  process.exit(1);
});

