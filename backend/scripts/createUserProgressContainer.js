require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');

async function createUserProgressContainer() {
  try {
    console.log('🔧 Creando contenedor user-progress...\n');

    const client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY
    });

    const database = client.database(process.env.COSMOS_DATABASE);

    // Verificar si el contenedor ya existe
    try {
      const container = database.container('user-progress');
      await container.read();
      console.log('ℹ️  El contenedor user-progress ya existe.');
      return;
    } catch (error) {
      if (error.code !== 404) {
        throw error;
      }
      // El contenedor no existe, continuar con la creación
    }

    // Crear el contenedor
    const { container } = await database.containers.create({
      id: 'user-progress',
      partitionKey: {
        paths: ['/tenantId'],
        version: 2
      },
      indexingPolicy: {
        automatic: true,
        indexingMode: 'consistent',
        includedPaths: [
          {
            path: '/*'
          }
        ],
        excludedPaths: [
          {
            path: '/"_etag"/?'
          }
        ]
      }
    });

    console.log('✅ Contenedor user-progress creado exitosamente!');
    console.log('   Partition Key: /tenantId');
    console.log('   Indexing: automatic, consistent\n');

  } catch (error) {
    console.error('❌ Error creando contenedor:', error);
    throw error;
  }
}

createUserProgressContainer()
  .then(() => {
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });
