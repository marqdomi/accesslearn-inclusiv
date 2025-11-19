import dotenv from 'dotenv'
import { CosmosClient } from '@azure/cosmos'

dotenv.config()

const endpoint = process.env.COSMOS_ENDPOINT!
const key = process.env.COSMOS_KEY!
const databaseName = process.env.COSMOS_DATABASE || 'accesslearn-db'

async function clearUserProgress() {
  console.log('🧹 Limpiando progreso del usuario...\n')

  const client = new CosmosClient({ endpoint, key })
  const database = client.database(databaseName)
  const container = database.container('users')

  // Buscar usuario ana.lopez@kainet.mx
  const querySpec = {
    query: 'SELECT * FROM c WHERE c.email = @email',
    parameters: [{ name: '@email', value: 'ana.lopez@kainet.mx' }]
  }

  const { resources } = await container.items.query(querySpec, {
    enableCrossPartitionQuery: true
  }).fetchAll()

  if (resources.length === 0) {
    console.log('❌ Usuario no encontrado')
    return
  }

  const user = resources[0]
  console.log(`📧 Usuario encontrado: ${user.email}`)
  console.log(`📊 XP actual: ${user.xpPoints || 0}`)
  console.log(`📚 Progreso actual:`, user.progress || {})

  // Limpiar progreso
  user.progress = {}
  user.xpPoints = 0

  // Actualizar en DB
  await container.item(user.id, user.tenantId).replace(user)

  console.log('\n✅ Progreso limpiado exitosamente!')
  console.log('🎮 Ahora puedes completar las lecciones de nuevo y ver la gamificación')
}

clearUserProgress()
  .then(() => {
    console.log('\n✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
