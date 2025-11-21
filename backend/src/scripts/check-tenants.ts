import { CosmosClient } from "@azure/cosmos";

async function checkTenants() {
  // Use environment variables instead of hardcoding secrets
  const endpoint = process.env.COSMOS_ENDPOINT || "https://accesslearn-cosmos-prod.documents.azure.com:443/";
  const key = process.env.COSMOS_KEY;
  const database = process.env.COSMOS_DATABASE || "accesslearn-db";
  const container = "tenants";

  if (!key) {
    console.error("❌ Error: COSMOS_KEY environment variable not set");
    console.log("Set COSMOS_KEY in backend/.env file");
    process.exit(1);
  }

  try {
    console.log("\n🔍 Conectando a Cosmos DB...\n");

    const client = new CosmosClient({ endpoint, key });
    const db = client.database(database);
    const cont = db.container(container);

    console.log(`✅ Conectado a ${database}/${container}\n`);

    // Query all tenants
    const query = "SELECT c.id, c.name, c.slug FROM c ORDER BY c.createdAt DESC";

    console.log(`📋 Ejecutando query: ${query}\n`);

    const { resources } = await cont.items.query(query).fetchAll();

    if (resources.length === 0) {
      console.log("❌ No hay tenants en la BD\n");
      return;
    }

    console.log(`✅ Se encontraron ${resources.length} tenants:\n`);

    resources.forEach((tenant, index) => {
      console.log(
        `  ${index + 1}. ${tenant.name} (${tenant.slug}) - ID: ${tenant.id}`
      );
    });

    console.log("\n");

    // Buscar específicamente por Amayrani
    const amayrani = resources.find((t) => t.slug === "amayrani");

    if (amayrani) {
      console.log(`✅ Tenant 'amayrani' encontrado:`);
      console.log(`   ID: ${amayrani.id}`);
      console.log(`   Nombre: ${amayrani.name}\n`);
    } else {
      console.log(`❌ Tenant 'amayrani' NO encontrado\n`);
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
}

checkTenants();
