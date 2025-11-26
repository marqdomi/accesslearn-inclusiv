/**
 * Migrate Course to All Tenants
 * 
 * This script copies a course from one tenant (kainet) to all other tenants
 * Useful for sharing example courses across tenants
 */

import dotenv from 'dotenv';
import path from 'path';
import { initializeCosmos, getContainer } from '../services/cosmosdb.service';

// Load environment variables - try backend/.env first, then root .env
const backendEnvPath = path.resolve(__dirname, '../../.env');
const rootEnvPath = path.resolve(__dirname, '../../../.env');

// Try backend/.env first (if running from root)
dotenv.config({ path: backendEnvPath });
// Fallback to root .env if backend/.env doesn't have required vars
if (!process.env.COSMOS_ENDPOINT) {
  dotenv.config({ path: rootEnvPath });
}
// Last resort: default dotenv.config() (if running from backend directory)
if (!process.env.COSMOS_ENDPOINT) {
  dotenv.config();
}
import { listTenants, getTenantBySlug } from '../functions/TenantFunctions';
import { getCourseById, createCourse, updateCourse } from '../functions/CourseFunctions';
import { getUsersByTenant } from '../functions/UserFunctions';
import { Course } from '../models/Course';

const SOURCE_TENANT_SLUG = 'kainet';
const COURSE_TITLE = 'Introducción a AccessLearn';

/**
 * Find an admin user in a tenant to use as course creator
 */
async function findAdminUser(tenantId: string): Promise<string | null> {
  try {
    // First try to find tenant-admin
    const tenantAdmins = await getUsersByTenant(tenantId, 'tenant-admin');
    if (tenantAdmins.length > 0) {
      return tenantAdmins[0].id;
    }
    
    // Then try content-manager
    const contentManagers = await getUsersByTenant(tenantId, 'content-manager');
    if (contentManagers.length > 0) {
      return contentManagers[0].id;
    }
    
    // Then try instructor
    const instructors = await getUsersByTenant(tenantId, 'instructor');
    if (instructors.length > 0) {
      return instructors[0].id;
    }
    
    // Last resort: any active user
    const users = await getUsersByTenant(tenantId);
    const activeUser = users.find(u => u.status === 'active');
    if (activeUser) {
      return activeUser.id;
    }
    
    return null;
  } catch (error) {
    console.error(`  ⚠️  Error finding admin user for tenant ${tenantId}:`, error);
    return null;
  }
}

/**
 * Deep clone course data and prepare for new tenant
 * This preserves the full structure including modules with lessons and blocks
 */
function prepareCourseForTenant(sourceCourse: any, newTenantId: string, createdBy: string): any {
  // Create a deep copy without tenant-specific fields
  // Using 'any' because courses may have modules with nested lessons structure
  const courseCopy: any = {
    tenantId: newTenantId,
    title: sourceCourse.title,
    description: sourceCourse.description,
    category: sourceCourse.category,
    estimatedTime: sourceCourse.estimatedTime,
    modules: JSON.parse(JSON.stringify(sourceCourse.modules || [])), // Deep clone modules (preserves lessons, blocks, etc.)
    assessment: sourceCourse.assessment ? JSON.parse(JSON.stringify(sourceCourse.assessment)) : undefined,
    coverImage: sourceCourse.coverImage,
    status: 'draft' as const, // Start as draft in new tenant
    createdBy: createdBy,
    // Don't copy: id, createdAt, updatedAt, publishedAt, reviewerId, reviewComments, etc.
  };
  
  return courseCopy;
}

/**
 * Check if course already exists in tenant
 */
async function courseExistsInTenant(tenantId: string, title: string): Promise<boolean> {
  const container = getContainer('courses');
  
  const query = {
    query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.title = @title',
    parameters: [
      { name: '@tenantId', value: tenantId },
      { name: '@title', value: title }
    ]
  };
  
  const { resources } = await container.items.query<Course>(query).fetchAll();
  return resources.length > 0;
}

async function main() {
  console.log('\n🚀 Iniciando migración de curso a todas las tenants...\n');
  
  try {
    // Initialize Cosmos DB connection
    await initializeCosmos();
    console.log('✅ Conexión a Cosmos DB establecida\n');
    
    // 1. Get source tenant (kainet)
    console.log(`📋 Buscando tenant fuente: ${SOURCE_TENANT_SLUG}...`);
    const sourceTenant = await getTenantBySlug(SOURCE_TENANT_SLUG);
    
    if (!sourceTenant) {
      console.error(`❌ No se encontró la tenant "${SOURCE_TENANT_SLUG}"`);
      process.exit(1);
    }
    
    console.log(`✅ Tenant fuente encontrada: ${sourceTenant.name} (${sourceTenant.id})\n`);
    
    // 2. Find the course in source tenant
    console.log(`📖 Buscando curso: "${COURSE_TITLE}"...`);
    const coursesContainer = getContainer('courses');
    
    const courseQuery = {
      query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.title = @title',
      parameters: [
        { name: '@tenantId', value: sourceTenant.id },
        { name: '@title', value: COURSE_TITLE }
      ]
    };
    
    const { resources: sourceCourses } = await coursesContainer.items
      .query<Course>(courseQuery)
      .fetchAll();
    
    if (sourceCourses.length === 0) {
      console.error(`❌ No se encontró el curso "${COURSE_TITLE}" en la tenant "${SOURCE_TENANT_SLUG}"`);
      process.exit(1);
    }
    
    const sourceCourse = sourceCourses[0];
    console.log(`✅ Curso encontrado: ${sourceCourse.title} (${sourceCourse.id})`);
    console.log(`   - Módulos: ${sourceCourse.modules?.length || 0}`);
    console.log(`   - Estado: ${sourceCourse.status}`);
    console.log(`   - Tiempo estimado: ${sourceCourse.estimatedTime} minutos\n`);
    
    // 3. Get all tenants (excluding source)
    console.log('📋 Obteniendo todas las tenants...');
    const allTenants = await listTenants();
    const targetTenants = allTenants.filter(t => t.id !== sourceTenant.id);
    
    if (targetTenants.length === 0) {
      console.log('⚠️  No hay otras tenants para migrar el curso');
      process.exit(0);
    }
    
    console.log(`✅ Encontradas ${targetTenants.length} tenant(s) destino:\n`);
    targetTenants.forEach((tenant, index) => {
      console.log(`   ${index + 1}. ${tenant.name} (${tenant.slug})`);
    });
    console.log('');
    
    // 4. Confirm migration
    console.log(`⚠️  Se migrará el curso "${COURSE_TITLE}" a ${targetTenants.length} tenant(s).`);
    console.log('   El curso se creará como borrador (draft) en cada tenant.\n');
    
    // 5. Migrate to each tenant
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (const targetTenant of targetTenants) {
      try {
        console.log(`\n🔄 Procesando: ${targetTenant.name}...`);
        
        // Check if course already exists
        const exists = await courseExistsInTenant(targetTenant.id, COURSE_TITLE);
        if (exists) {
          console.log(`   ⏭️  El curso ya existe en esta tenant. Saltando...`);
          skipCount++;
          continue;
        }
        
        // Find admin user for this tenant
        console.log(`   👤 Buscando usuario administrador...`);
        const adminUserId = await findAdminUser(targetTenant.id);
        
        if (!adminUserId) {
          console.log(`   ⚠️  No se encontró un usuario administrador. Usando 'system'...`);
          // We'll use 'system' as fallback, but this might cause issues
          // Continue anyway - the course will be created
        }
        
        const creatorId = adminUserId || 'system';
        
        // Prepare course data for new tenant
        const courseData = prepareCourseForTenant(sourceCourse, targetTenant.id, creatorId);
        
        // Create course (will start as draft)
        console.log(`   📝 Creando curso...`);
        let newCourse = await createCourse(
          {
            title: courseData.title!,
            description: courseData.description!,
            category: courseData.category!,
            estimatedTime: courseData.estimatedTime!,
            coverImage: courseData.coverImage,
          },
          targetTenant.id,
          creatorId
        );
        
        // Update course with modules and assessments
        if (courseData.modules || courseData.assessment) {
          console.log(`   📚 Agregando módulos y evaluaciones...`);
          newCourse = await updateCourse(
            newCourse.id,
            targetTenant.id,
            creatorId,
            {
              modules: courseData.modules || [],
              assessment: courseData.assessment,
            }
          );
        }
        
        console.log(`   ✅ Curso creado exitosamente: ${newCourse.id}`);
        successCount++;
        
      } catch (error: any) {
        console.error(`   ❌ Error al migrar a ${targetTenant.name}:`, error.message);
        errorCount++;
      }
    }
    
    // 6. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Exitosas: ${successCount}`);
    console.log(`⏭️  Omitidas: ${skipCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📦 Total procesadas: ${targetTenants.length}`);
    console.log('='.repeat(60) + '\n');
    
    if (successCount > 0) {
      console.log('💡 Los cursos fueron creados como borradores (draft).');
      console.log('   Los administradores de cada tenant pueden editarlos y publicarlos.\n');
    }
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

