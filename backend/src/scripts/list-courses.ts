import { CosmosClient } from '@azure/cosmos'
import * as dotenv from 'dotenv'

dotenv.config()

const endpoint = process.env.COSMOS_ENDPOINT!
const key = process.env.COSMOS_KEY!
const databaseId = process.env.COSMOS_DATABASE || 'accesslearn-db'

const client = new CosmosClient({ endpoint, key })

async function listAllCourses() {
  try {
    const database = client.database(databaseId)
    const container = database.container('courses')
    
    console.log('📚 Listando TODOS los cursos...\n')
    
    const { resources } = await container.items
      .query('SELECT c.id, c.tenantId, c.title, c.status FROM c')
      .fetchAll()
    
    console.log(`Total cursos encontrados: ${resources.length}\n`)
    
    resources.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`)
      console.log(`   ID: ${course.id}`)
      console.log(`   Tenant: ${course.tenantId}`)
      console.log(`   Status: ${course.status}`)
      console.log('')
    })
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

listAllCourses()
  .then(() => {
    console.log('✅ Completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Falló:', error)
    process.exit(1)
  })
