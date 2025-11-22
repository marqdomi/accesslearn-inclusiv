/**
 * Assign Tutorial Courses to User
 * 
 * Assigns all tutorial courses to a specific user (e.g., Dra. Amayrani)
 */

import 'dotenv/config';
import { initializeCosmos, getContainer } from '../services/cosmosdb.service';
import { getTenantBySlug } from '../functions/TenantFunctions';
import { getCourses } from '../functions/CourseFunctions';
import { createAssignment } from '../functions/CourseAssignmentFunctions';

async function main() {
  try {
    console.log('\n📚 Assigning Tutorial Courses to User\n');
    console.log('='.repeat(60));

    // Initialize Cosmos DB
    console.log('📦 Conectando a Cosmos DB...');
    await initializeCosmos();
    console.log('✅ Cosmos DB conectado\n');

    // Get tenant
    const tenantSlug = process.env.TENANT_SLUG || 'kainet';
    const userEmail = process.env.USER_EMAIL || 'dra.amayrani@kainet.mx';
    const assignedByEmail = process.env.ASSIGNED_BY_EMAIL || 'ana.lopez@kainet.mx';

    console.log(`📋 Tenant: ${tenantSlug}`);
    console.log(`👤 Usuario: ${userEmail}`);
    console.log(`👨‍💼 Asignado por: ${assignedByEmail}\n`);

    const tenant = await getTenantBySlug(tenantSlug);
    if (!tenant) {
      console.error(`❌ Error: Tenant "${tenantSlug}" no encontrado`);
      process.exit(1);
    }

    // Get users
    const usersContainer = getContainer('users');
    
    const { resources: targetUsers } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.email = @email',
        parameters: [
          { name: '@tenantId', value: tenant.id },
          { name: '@email', value: userEmail },
        ],
      })
      .fetchAll();

    if (targetUsers.length === 0) {
      console.error(`❌ Error: Usuario "${userEmail}" no encontrado`);
      console.error('💡 Crea el usuario primero o verifica el email');
      process.exit(1);
    }

    const targetUser = targetUsers[0];

    const { resources: assignedByUsers } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.email = @email',
        parameters: [
          { name: '@tenantId', value: tenant.id },
          { name: '@email', value: assignedByEmail },
        ],
      })
      .fetchAll();

    if (assignedByUsers.length === 0) {
      console.error(`❌ Error: Usuario "${assignedByEmail}" no encontrado`);
      process.exit(1);
    }

    const assignedByUser = assignedByUsers[0];

    // Get all tutorial courses (titles starting with emojis or containing "Tutorial")
    const allCourses = await getCourses(tenant.id, { status: 'published' });
    const tutorialCourses = allCourses.filter(course => 
      course.title.includes('🎓') || 
      course.title.includes('📚') || 
      course.title.includes('🏆') ||
      course.title.includes('📜') ||
      course.title.includes('💬') ||
      course.title.includes('📊') ||
      course.title.includes('🔔') ||
      course.title.includes('👥') ||
      course.category === 'Tutorial'
    );

    console.log(`📚 Cursos tutoriales encontrados: ${tutorialCourses.length}\n`);

    if (tutorialCourses.length === 0) {
      console.error('❌ Error: No se encontraron cursos tutoriales');
      console.error('💡 Ejecuta primero: npm run setup-tutorial-courses');
      process.exit(1);
    }

    // Get existing assignments
    const assignmentsContainer = getContainer('course-assignments');
    const { resources: existingAssignments } = await assignmentsContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.tenantId = @tenantId AND c.assignedToType = @type AND c.assignedToId = @userId',
        parameters: [
          { name: '@tenantId', value: tenant.id },
          { name: '@type', value: 'user' },
          { name: '@userId', value: targetUser.id },
        ],
      })
      .fetchAll();

    const assignedCourseIds = new Set(existingAssignments.map(a => a.courseId));

    // Assign tutorial courses
    let assignedCount = 0;
    let skippedCount = 0;

    for (const course of tutorialCourses) {
      try {
        if (assignedCourseIds.has(course.id)) {
          console.log(`  ℹ️  Curso ya asignado: ${course.title}`);
          skippedCount++;
          continue;
        }

        await createAssignment(
          tenant.id,
          course.id,
          'user',
          targetUser.id,
          assignedByUser.id
        );

        console.log(`  ✅ Asignado: ${course.title}`);
        assignedCount++;
      } catch (error: any) {
        console.error(`  ❌ Error asignando "${course.title}":`, error.message);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 RESUMEN:\n');
    console.log(`  ✅ Cursos asignados: ${assignedCount}`);
    console.log(`  ℹ️  Cursos ya asignados: ${skippedCount}`);
    console.log(`  📚 Total de cursos tutoriales: ${tutorialCourses.length}`);
    console.log('');
    console.log(`👤 Usuario: ${targetUser.firstName} ${targetUser.lastName} (${targetUser.email})`);
    console.log('');
    console.log('🎯 Próximos pasos:');
    console.log(`   1. El usuario puede acceder a: https://app.kainet.mx`);
    console.log(`   2. Login con: ${targetUser.email}`);
    console.log(`   3. Verá los ${tutorialCourses.length} cursos tutoriales en su biblioteca`);
    console.log('');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main as assignTutorialCoursesToUser };

