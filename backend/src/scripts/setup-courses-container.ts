import { CosmosClient } from '@azure/cosmos'
import * as dotenv from 'dotenv'

dotenv.config()

const endpoint = process.env.COSMOS_ENDPOINT!
const key = process.env.COSMOS_KEY!
const databaseId = process.env.COSMOS_DATABASE || 'accesslearn-db'

const client = new CosmosClient({ endpoint, key })

async function setupCoursesContainer() {
  try {
    const database = client.database(databaseId)
    
    console.log('📦 Verificando container "courses"...')
    
    // Try to create the container if it doesn't exist
    const { container } = await database.containers.createIfNotExists({
      id: 'courses',
      partitionKey: {
        paths: ['/id'],  // Partition key por ID del curso
        kind: 'Hash'
      }
    })
    
    console.log('✅ Container "courses" está listo')
    
    // Verificar si el curso demo existe
    try {
      const { resource } = await container.item('course-intro-react-kainet', 'course-intro-react-kainet').read()
      if (resource) {
        console.log('✅ Curso demo encontrado:', resource.title)
        console.log('   ID:', resource.id)
        console.log('   TenantID:', resource.tenantId)
        console.log('   Módulos:', resource.modules?.length || 0)
      }
    } catch (error: any) {
      if (error.code === 404) {
        console.log('⚠️  Curso demo NO encontrado')
        console.log('   Ejecuta: npm run create-demo-course')
      } else {
        console.log('❌ Error al buscar curso:', error.message)
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

setupCoursesContainer()
  .then(() => {
    console.log('\n✅ Setup completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Setup falló:', error)
    process.exit(1)
  })
