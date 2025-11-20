require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');

async function checkDatabase() {
  try {
    console.log('🔍 Verificando base de datos...\n');

    const client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY
    });

    const database = client.database(process.env.COSMOS_DATABASE);

    // Listar todos los contenedores disponibles
    console.log('📦 CONTENEDORES DISPONIBLES:');
    const { resources: containers } = await database.containers.readAll().fetchAll();
    console.log(`Total: ${containers.length} contenedores\n`);
    containers.forEach(container => {
      console.log(`  • ${container.id}`);
    });
    console.log();

    // 1. Verificar usuarios
    console.log('📋 USUARIOS:');
    const usersContainer = database.container('users');
    const { resources: users } = await usersContainer.items
      .query({
        query: 'SELECT c.id, c.email, c.firstName, c.lastName, c.role, c.tenantId FROM c'
      })
      .fetchAll();
    
    console.log(`Total: ${users.length} usuarios\n`);
    users.forEach(user => {
      console.log(`  • ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`    Role: ${user.role} | ID: ${user.id}`);
    });

    // 2. Verificar tenants
    console.log('\n📋 TENANTS:');
    const tenantsContainer = database.container('tenants');
    const { resources: tenants } = await tenantsContainer.items
      .query({
        query: 'SELECT c.id, c.name, c.slug FROM c'
      })
      .fetchAll();
    
    console.log(`Total: ${tenants.length} tenants\n`);
    tenants.forEach(tenant => {
      console.log(`  • ${tenant.name} (${tenant.slug}) | ID: ${tenant.id}`);
    });

    // 3. Verificar solicitudes de mentoría
    console.log('\n📋 SOLICITUDES DE MENTORÍA:');
    try {
      const requestsContainer = database.container('mentorship-requests');
      const { resources: requests } = await requestsContainer.items
        .query({
          query: 'SELECT * FROM c'
        })
        .fetchAll();
      
      console.log(`Total: ${requests.length} solicitudes\n`);
      requests.forEach(req => {
        console.log(`  • ${req.menteeName} → ${req.mentorName}`);
        console.log(`    Topic: ${req.topic}`);
        console.log(`    Status: ${req.status}`);
        console.log(`    ID: ${req.id}`);
      });
    } catch (error) {
      console.log('  ⚠️  Container "mentorship-requests" no existe');
    }

    // 4. Verificar sesiones de mentoría
    console.log('\n📋 SESIONES DE MENTORÍA:');
    try {
      const sessionsContainer = database.container('mentorship-sessions');
      const { resources: sessions } = await sessionsContainer.items
        .query({
          query: 'SELECT * FROM c'
        })
        .fetchAll();
      
      console.log(`Total: ${sessions.length} sesiones\n`);
      sessions.forEach(session => {
        console.log(`  • ${session.menteeName} con ${session.mentorName}`);
        console.log(`    Topic: ${session.topic}`);
        console.log(`    Status: ${session.status}`);
        console.log(`    ID: ${session.id}`);
      });
    } catch (error) {
      console.log('  ⚠️  Container "mentorship-sessions" no existe');
    }

    // 5. Verificar cursos
    console.log('\n📋 CURSOS:');
    try {
      const coursesContainer = database.container('courses');
      const { resources: courses } = await coursesContainer.items
        .query({
          query: 'SELECT c.id, c.title, c.tenantId FROM c'
        })
        .fetchAll();
      
      console.log(`Total: ${courses.length} cursos\n`);
      courses.forEach(course => {
        console.log(`  • ${course.title} | ID: ${course.id}`);
      });
    } catch (error) {
      console.log('  ⚠️  Container "courses" no existe');
    }

    console.log('\n✅ Verificación completa\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('   Code:', error.code);
    }
  }
}

checkDatabase();
