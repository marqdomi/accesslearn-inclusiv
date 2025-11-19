import { listTenants } from '../functions/TenantFunctions';

async function main() {
  console.log('\n📋 Listando todos los tenants...\n');

  try {
    const tenants = await listTenants();

    if (tenants.length === 0) {
      console.log('❌ No hay tenants en la base de datos');
      process.exit(0);
    }

    console.log(`✅ Encontrados ${tenants.length} tenants:\n`);

    tenants.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.name}`);
      console.log(`   - ID: ${tenant.id}`);
      console.log(`   - Slug: ${tenant.slug}`);
      console.log(`   - Plan: ${tenant.plan}`);
      console.log(`   - Status: ${tenant.status}`);
      console.log(`   - Email: ${tenant.contactEmail}`);
      console.log('');
    });

    console.log('\n💡 Para acceder en desarrollo:');
    tenants.forEach(tenant => {
      console.log(`   http://localhost:5001?tenant=${tenant.slug}`);
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
