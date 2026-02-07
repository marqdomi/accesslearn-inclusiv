/**
 * Script de migración de Cosmos DB
 * De: accesslearn-cosmos-free (provisioned) 
 * A: accesslearn-cosmos-serverless (serverless)
 */

const { CosmosClient } = require("@azure/cosmos");

// Configuración origen
const SOURCE_ENDPOINT = "https://accesslearn-cosmos-free.documents.azure.com:443/";
const SOURCE_KEY = "28NKp9JjZEeDbLHLsww3qvjDAlX5TdvOIKNzuu4agvUkgjTxlAKiGD75dwk5250FsKVTMF1H86jHACDbELZMOQ==";

// Configuración destino
const DEST_ENDPOINT = "https://accesslearn-cosmos-serverless.documents.azure.com:443/";
const DEST_KEY = "3rqYd1FGji1qhdHRiKjdC49PhEvIobpiinbT8tB2OnGqLFKXBTjEsycpe1WRFiUpOqxgLr7ck8tmACDbWlih5w==";

const DATABASE_NAME = "accesslearn-db";

// Contenedores a migrar (excluimos el "0" que era basura)
const CONTAINERS = [
  "users",
  "tenants", 
  "courses",
  "categories",
  "certificates",
  "user-progress",
  "quiz-attempts",
  "notifications",
  "audit-logs",
  "user-groups",
  "activity-feed",
  "accessibility-profiles",
  "company-settings",
  "forums",
  "mentorship-requests",
  "certificate-templates",
  "notification-preferences",
  "course-assignments",
  "mentorship-sessions",
  "achievements"
];

async function migrateContainer(sourceClient, destClient, containerName) {
  console.log(`\n📦 Migrando contenedor: ${containerName}`);
  
  const sourceContainer = sourceClient
    .database(DATABASE_NAME)
    .container(containerName);
  
  const destContainer = destClient
    .database(DATABASE_NAME)
    .container(containerName);
  
  try {
    // Leer todos los documentos del origen
    const { resources: documents } = await sourceContainer.items
      .query("SELECT * FROM c")
      .fetchAll();
    
    console.log(`   📄 Encontrados: ${documents.length} documentos`);
    
    if (documents.length === 0) {
      console.log(`   ⏭️  Sin datos, saltando...`);
      return { container: containerName, migrated: 0, errors: 0 };
    }
    
    let migrated = 0;
    let errors = 0;
    
    // Insertar documentos en destino
    for (const doc of documents) {
      try {
        // Remover propiedades del sistema de Cosmos
        const cleanDoc = { ...doc };
        delete cleanDoc._rid;
        delete cleanDoc._self;
        delete cleanDoc._etag;
        delete cleanDoc._attachments;
        delete cleanDoc._ts;
        
        await destContainer.items.upsert(cleanDoc);
        migrated++;
      } catch (err) {
        console.error(`   ❌ Error migrando doc ${doc.id}: ${err.message}`);
        errors++;
      }
    }
    
    console.log(`   ✅ Migrados: ${migrated}, Errores: ${errors}`);
    return { container: containerName, migrated, errors };
    
  } catch (err) {
    console.error(`   ❌ Error leyendo contenedor: ${err.message}`);
    return { container: containerName, migrated: 0, errors: 1 };
  }
}

async function main() {
  console.log("🚀 Iniciando migración de Cosmos DB");
  console.log("   Origen: accesslearn-cosmos-free (provisioned)");
  console.log("   Destino: accesslearn-cosmos-serverless (serverless)");
  console.log("=" .repeat(60));
  
  const sourceClient = new CosmosClient({
    endpoint: SOURCE_ENDPOINT,
    key: SOURCE_KEY
  });
  
  const destClient = new CosmosClient({
    endpoint: DEST_ENDPOINT,
    key: DEST_KEY
  });
  
  const results = [];
  
  for (const containerName of CONTAINERS) {
    const result = await migrateContainer(sourceClient, destClient, containerName);
    results.push(result);
  }
  
  // Resumen
  console.log("\n" + "=".repeat(60));
  console.log("📊 RESUMEN DE MIGRACIÓN:");
  console.log("=".repeat(60));
  
  let totalMigrated = 0;
  let totalErrors = 0;
  
  for (const r of results) {
    console.log(`   ${r.container}: ${r.migrated} docs migrados, ${r.errors} errores`);
    totalMigrated += r.migrated;
    totalErrors += r.errors;
  }
  
  console.log("=".repeat(60));
  console.log(`✅ TOTAL: ${totalMigrated} documentos migrados`);
  console.log(`❌ ERRORES: ${totalErrors}`);
  
  if (totalErrors === 0) {
    console.log("\n🎉 ¡Migración completada exitosamente!");
  } else {
    console.log("\n⚠️ Migración completada con algunos errores. Revisar logs.");
  }
}

main().catch(console.error);
