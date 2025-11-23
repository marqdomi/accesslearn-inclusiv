#!/usr/bin/env node
/**
 * Create Test Users for All Roles - Kainet Tenant
 * 
 * This script creates test users for ALL roles in the system
 * to facilitate comprehensive manual testing.
 * 
 * Usage:
 *   npm run create-test-users-all-roles
 */

import 'dotenv/config'
import { initializeCosmos, getContainer } from '../services/cosmosdb.service'
import { getTenantBySlug } from '../functions/TenantFunctions'
import { createUser } from '../functions/UserFunctions'
import * as crypto from 'crypto'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function main() {
  try {
    console.log('🚀 Creating test users for all roles...\n')
    
    await initializeCosmos()
    console.log('✅ Cosmos DB connected\n')
    
    // Get Kainet tenant
    const tenant = await getTenantBySlug('kainet')
    if (!tenant) {
      console.error('❌ Error: Tenant "kainet" not found')
      console.error('   Please run: npm run reset-kainet')
      process.exit(1)
    }
    
    console.log(`✅ Tenant found: ${tenant.id} (${tenant.name})\n`)
    
    // Define all test users for each role
    const testUsers = [
      {
        email: 'ana.lopez@kainet.mx',
        firstName: 'Ana',
        lastName: 'López Torres',
        role: 'super-admin' as const,
        password: 'Demo123!',
        description: 'Super Admin - Acceso completo a nivel plataforma'
      },
      {
        email: 'admin.tenant@kainet.mx',
        firstName: 'Roberto',
        lastName: 'Martínez',
        role: 'tenant-admin' as const,
        password: 'Demo123!',
        description: 'Tenant Admin - Administrador completo de la organización'
      },
      {
        email: 'carlos.content@kainet.mx',
        firstName: 'Carlos',
        lastName: 'García',
        role: 'content-manager' as const,
        password: 'Demo123!',
        description: 'Content Manager - Gestión de cursos y contenido'
      },
      {
        email: 'laura.users@kainet.mx',
        firstName: 'Laura',
        lastName: 'Sánchez',
        role: 'user-manager' as const,
        password: 'Demo123!',
        description: 'User Manager - Gestión de usuarios y equipos'
      },
      {
        email: 'pedro.analytics@kainet.mx',
        firstName: 'Pedro',
        lastName: 'González',
        role: 'analytics-viewer' as const,
        password: 'Demo123!',
        description: 'Analytics Viewer - Acceso solo lectura a analytics'
      },
      {
        email: 'maria.instructor@kainet.mx',
        firstName: 'María',
        lastName: 'Rodríguez',
        role: 'instructor' as const,
        password: 'Demo123!',
        description: 'Instructor - Creación de cursos (con aprobación)'
      },
      {
        email: 'carlos.mentor@kainet.mx',
        firstName: 'Carlos',
        lastName: 'Hernández',
        role: 'mentor' as const,
        password: 'Demo123!',
        description: 'Mentor - Guía de estudiantes'
      },
      {
        email: 'juan.student@kainet.mx',
        firstName: 'Juan',
        lastName: 'Pérez',
        role: 'student' as const,
        password: 'Demo123!',
        description: 'Student - Experiencia de aprendizaje'
      }
    ]
    
    console.log('👥 Creating/updating test users...\n')
    
    const usersContainer = getContainer('users')
    const createdUsers: any[] = []
    const updatedUsers: any[] = []
    
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const { resources: existingUsers } = await usersContainer.items
          .query({
            query: 'SELECT * FROM c WHERE c.email = @email AND c.tenantId = @tenantId',
            parameters: [
              { name: '@email', value: userData.email },
              { name: '@tenantId', value: tenant.id }
            ]
          })
          .fetchAll()
        
        if (existingUsers.length > 0) {
          // Update existing user
          const existingUser = existingUsers[0]
          const updatedUser = {
            ...existingUser,
            role: userData.role,
            password: hashPassword(userData.password),
            passwordResetRequired: false,
            status: 'active',
            updatedAt: new Date().toISOString()
          }
          
          await usersContainer.items.upsert(updatedUser)
          updatedUsers.push(updatedUser)
          console.log(`   🔄 Updated: ${userData.email} (${userData.role})`)
          console.log(`      ${userData.description}`)
        } else {
          // Create new user
          let user = await createUser({
            tenantId: tenant.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            temporaryPassword: userData.password
          })
          
          // Hash password and update
          user = {
            ...user,
            password: hashPassword(userData.password),
            passwordResetRequired: false,
            status: 'active'
          }
          await usersContainer.items.upsert(user)
          
          createdUsers.push(user)
          console.log(`   ✅ Created: ${userData.email} (${userData.role})`)
          console.log(`      ${userData.description}`)
        }
      } catch (error: any) {
        console.error(`   ❌ Error with ${userData.email}:`, error.message)
      }
    }
    
    console.log(`\n   ✅ Created ${createdUsers.length} new user(s)`)
    console.log(`   🔄 Updated ${updatedUsers.length} existing user(s)`)
    console.log(`   📊 Total: ${createdUsers.length + updatedUsers.length} user(s) ready for testing\n`)
    
    console.log('='.repeat(70))
    console.log('📋 TEST USER CREDENTIALS - Kainet Tenant')
    console.log('='.repeat(70))
    console.log('\nTenant Slug: kainet')
    console.log('Password (all users): Demo123!\n')
    
    console.log('👤 ROLES AND USERS:')
    console.log('─'.repeat(70))
    
    for (const userData of testUsers) {
      const status = createdUsers.find(u => u.email === userData.email) 
        ? '✅ NEW' 
        : updatedUsers.find(u => u.email === userData.email)
        ? '🔄 UPDATED'
        : '❓ UNKNOWN'
      
      console.log(`\n${status} ${userData.role.toUpperCase()}`)
      console.log(`   Email:    ${userData.email}`)
      console.log(`   Name:     ${userData.firstName} ${userData.lastName}`)
      console.log(`   Password: Demo123!`)
      console.log(`   Desc:     ${userData.description}`)
    }
    
    console.log('\n' + '='.repeat(70))
    console.log('🌐 Access at: http://localhost:5173 (or your frontend URL)')
    console.log('   Use tenant slug: kainet')
    console.log('='.repeat(70) + '\n')
    
    console.log('✅ All test users are ready for manual testing!\n')
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()

