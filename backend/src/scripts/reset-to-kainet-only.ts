#!/usr/bin/env node
/**
 * Reset to Kainet Only
 * 
 * This script:
 * 1. Deletes ALL tenants and all related data (users, courses, progress, etc.)
 * 2. Creates only the Kainet tenant
 * 3. Creates basic demo users for testing
 * 
 * WARNING: This will delete ALL data in the database!
 */

import 'dotenv/config'
import { initializeCosmos, getContainer } from '../services/cosmosdb.service'
import { createTenant } from '../functions/TenantFunctions'
import { createUser } from '../functions/UserFunctions'
import * as crypto from 'crypto'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function deleteAllTenants() {
  console.log('\n🗑️  Step 1: Deleting all tenants and related data...\n')
  
  const tenantsContainer = getContainer('tenants')
  const usersContainer = getContainer('users')
  const coursesContainer = getContainer('courses')
  const progressContainer = getContainer('user-progress')
  const certificatesContainer = getContainer('certificates')
  const assignmentsContainer = getContainer('course-assignments')
  const groupsContainer = getContainer('user-groups')
  const forumsContainer = getContainer('forums')
  const activityFeedContainer = getContainer('activity-feed')
  const quizAttemptsContainer = getContainer('quiz-attempts')
  const mentorshipRequestsContainer = getContainer('mentorship-requests')
  const mentorshipSessionsContainer = getContainer('mentorship-sessions')
  const auditLogsContainer = getContainer('audit-logs')
  const notificationsContainer = getContainer('notifications')
  const achievementsContainer = getContainer('achievements')
  const categoriesContainer = getContainer('categories')
  
  // Get all tenants first
  const { resources: allTenants } = await tenantsContainer.items.readAll().fetchAll()
  console.log(`   Found ${allTenants.length} tenant(s) to delete\n`)
  
  for (const tenant of allTenants) {
    const tenantId: string = (tenant as any).id || ''
    if (!tenantId) {
      console.log(`   ⚠️  Skipping tenant without ID: ${JSON.stringify(tenant)}`)
      continue
    }
    console.log(`   🗑️  Deleting tenant: ${(tenant as any).name || tenantId}`)
    
    // Delete all users for this tenant
    try {
      const { resources: users } = await usersContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${users.length} user(s)...`)
      for (const user of users) {
        try {
          await usersContainer.item(user.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting user ${user.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying users:`, err.message)
      }
    }
    
    // Delete all courses for this tenant
    try {
      const { resources: courses } = await coursesContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${courses.length} course(s)...`)
      for (const course of courses) {
        try {
          await coursesContainer.item(course.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting course ${course.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying courses:`, err.message)
      }
    }
    
    // Delete all user progress for this tenant
    try {
      const { resources: progress } = await progressContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${progress.length} progress record(s)...`)
      for (const prog of progress) {
        try {
          await progressContainer.item(prog.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting progress ${prog.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying progress:`, err.message)
      }
    }
    
    // Delete all certificates for this tenant
    try {
      const { resources: certificates } = await certificatesContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${certificates.length} certificate(s)...`)
      for (const cert of certificates) {
        try {
          await certificatesContainer.item(cert.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting certificate ${cert.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying certificates:`, err.message)
      }
    }
    
    // Delete all course assignments for this tenant
    try {
      const { resources: assignments } = await assignmentsContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${assignments.length} assignment(s)...`)
      for (const assignment of assignments) {
        try {
          await assignmentsContainer.item(assignment.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting assignment ${assignment.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying assignments:`, err.message)
      }
    }
    
    // Delete all groups for this tenant
    try {
      const { resources: groups } = await groupsContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${groups.length} group(s)...`)
      for (const group of groups) {
        try {
          await groupsContainer.item(group.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting group ${group.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying groups:`, err.message)
      }
    }
    
    // Delete all forums for this tenant
    try {
      const { resources: forums } = await forumsContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${forums.length} forum item(s)...`)
      for (const forum of forums) {
        try {
          await forumsContainer.item(forum.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting forum ${forum.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying forums:`, err.message)
      }
    }
    
    // Delete all activity feed items for this tenant
    try {
      const { resources: activities } = await activityFeedContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${activities.length} activity feed item(s)...`)
      for (const activity of activities) {
        try {
          await activityFeedContainer.item(activity.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting activity ${activity.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying activity feed:`, err.message)
      }
    }
    
    // Delete all quiz attempts for this tenant
    try {
      const { resources: quizAttempts } = await quizAttemptsContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${quizAttempts.length} quiz attempt(s)...`)
      for (const attempt of quizAttempts) {
        try {
          await quizAttemptsContainer.item(attempt.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting quiz attempt ${attempt.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying quiz attempts:`, err.message)
      }
    }
    
    // Delete all mentorship requests for this tenant
    try {
      const { resources: mentorshipRequests } = await mentorshipRequestsContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${mentorshipRequests.length} mentorship request(s)...`)
      for (const ment of mentorshipRequests) {
        try {
          await mentorshipRequestsContainer.item(ment.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting mentorship request ${ment.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying mentorship requests:`, err.message)
      }
    }
    
    // Delete all mentorship sessions for this tenant
    try {
      const { resources: mentorshipSessions } = await mentorshipSessionsContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${mentorshipSessions.length} mentorship session(s)...`)
      for (const ment of mentorshipSessions) {
        try {
          await mentorshipSessionsContainer.item(ment.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting mentorship session ${ment.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying mentorship sessions:`, err.message)
      }
    }
    
    // Delete all notifications for this tenant
    try {
      const { resources: notifications } = await notificationsContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${notifications.length} notification(s)...`)
      for (const notif of notifications) {
        try {
          await notificationsContainer.item(notif.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting notification ${notif.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying notifications:`, err.message)
      }
    }
    
    // Delete all achievements for this tenant
    try {
      const { resources: achievements } = await achievementsContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${achievements.length} achievement(s)...`)
      for (const achievement of achievements) {
        try {
          await achievementsContainer.item(achievement.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting achievement ${achievement.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying achievements:`, err.message)
      }
    }
    
    // Delete all categories for this tenant
    try {
      const { resources: categories } = await categoriesContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${categories.length} categor(ies)...`)
      for (const category of categories) {
        try {
          await categoriesContainer.item(category.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting category ${category.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying categories:`, err.message)
      }
    }
    
    // Delete all audit logs for this tenant
    try {
      const { resources: auditLogs } = await auditLogsContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.tenantId = @tenantId',
          parameters: [{ name: '@tenantId', value: tenantId }]
        })
        .fetchAll()
      
      console.log(`      Deleting ${auditLogs.length} audit log(s)...`)
      for (const log of auditLogs) {
        try {
          await auditLogsContainer.item(log.id, tenantId).delete()
        } catch (err: any) {
          if (err.code !== 404) {
            console.error(`         ⚠️  Error deleting audit log ${log.id}:`, err.message)
          }
        }
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error querying audit logs:`, err.message)
      }
    }
    
    // Finally, delete the tenant itself
    try {
      if (tenantId) {
        await tenantsContainer.item(tenantId, tenantId).delete()
        console.log(`      ✅ Tenant ${tenantId} deleted\n`)
      }
    } catch (err: any) {
      if (err.code !== 404) {
        console.error(`      ⚠️  Error deleting tenant ${tenantId}:`, err.message)
      }
    }
  }
  
  console.log('   ✅ All tenants and related data deleted\n')
}

async function createKainetTenant() {
  console.log('📋 Step 2: Creating Kainet tenant...\n')
  
  try {
    const tenant = await createTenant({
      name: 'Kainet',
      slug: 'kainet',
      contactEmail: 'admin@kainet.mx',
      plan: 'professional',
      primaryColor: '#4F46E5',
      secondaryColor: '#10B981'
    })
    
    console.log(`   ✅ Tenant created: ${tenant.id}`)
    console.log(`   📧 Contact: ${tenant.contactEmail}`)
    console.log(`   🎨 Colors: ${tenant.primaryColor} / ${tenant.secondaryColor}\n`)
    
    return tenant
  } catch (error: any) {
    console.error('   ❌ Error creating tenant:', error.message)
    throw error
  }
}

async function createDemoUsers(tenantId: string) {
  console.log('👥 Step 3: Creating demo users...\n')
  
  const users = [
    {
      email: 'ana.lopez@kainet.mx',
      firstName: 'Ana',
      lastName: 'López Torres',
      role: 'super-admin' as const,
      password: 'Demo123!'
    },
    {
      email: 'carlos.content@kainet.mx',
      firstName: 'Carlos',
      lastName: 'García',
      role: 'content-manager' as const,
      password: 'Demo123!'
    },
    {
      email: 'maria.instructor@kainet.mx',
      firstName: 'María',
      lastName: 'Rodríguez',
      role: 'instructor' as const,
      password: 'Demo123!'
    },
    {
      email: 'juan.student@kainet.mx',
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'student' as const,
      password: 'Demo123!'
    }
  ]
  
  const createdUsers: any[] = []
  
  for (const userData of users) {
    try {
      let user = await createUser({
        tenantId: tenantId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        temporaryPassword: userData.password
      })
      
      // Hash password
      const usersContainer = getContainer('users')
      user = {
        ...user,
        password: hashPassword(userData.password),
        passwordResetRequired: false
      }
      await usersContainer.items.upsert(user)
      
      createdUsers.push(user)
      console.log(`   ✅ User: ${user.email} (${user.role}) - ID: ${user.id}`)
    } catch (error: any) {
      console.error(`   ❌ Error creating ${userData.email}:`, error.message)
    }
  }
  
  console.log(`\n   ✅ Created ${createdUsers.length} user(s)\n`)
  return createdUsers
}

async function main() {
  try {
    console.log('🚀 Starting reset to Kainet-only setup...\n')
    console.log('⚠️  WARNING: This will delete ALL tenants and ALL related data!')
    console.log('=' .repeat(60))
    
    await initializeCosmos()
    console.log('✅ Cosmos DB connected\n')
    
    // Step 1: Delete all tenants and related data
    await deleteAllTenants()
    
    // Step 2: Create Kainet tenant
    const tenant = await createKainetTenant()
    
    // Step 3: Create demo users
    await createDemoUsers(tenant.id)
    
    console.log('=' .repeat(60))
    console.log('🎉 Reset complete! Kainet tenant is ready for testing.\n')
    console.log('📋 Login credentials:')
    console.log('   Tenant slug: kainet')
    console.log('   Super Admin:     ana.lopez@kainet.mx / Demo123!')
    console.log('   Content Manager: carlos.content@kainet.mx / Demo123!')
    console.log('   Instructor:       maria.instructor@kainet.mx / Demo123!')
    console.log('   Student:         juan.student@kainet.mx / Demo123!')
    console.log('\n🌐 Access at: http://localhost:5173 (or your frontend URL)')
    console.log('   Use tenant slug: kainet\n')
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()

