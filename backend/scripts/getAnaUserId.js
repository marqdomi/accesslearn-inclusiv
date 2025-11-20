/**
 * Script para obtener el ID real de Ana López Torres
 */

const API_BASE_URL = 'http://localhost:3000/api'

async function getUserId() {
  try {
    // Simular login para obtener el usuario
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tenantId: 'tenant-kainet',
        email: 'ana.lopez@kainet.mx',
        password: 'cualquiera' // El sistema acepta cualquier contraseña
      })
    })
    
    if (!response.ok) {
      console.error('❌ Error en login:', await response.text())
      return
    }

    const data = await response.json()
    const user = data.user
    
    console.log('\n✅ Usuario encontrado:')
    console.log('   ID:', user.id)
    console.log('   Nombre:', user.firstName, user.lastName)
    console.log('   Email:', user.email)
    console.log('   Role:', user.role)
    console.log('\n📋 Usa este ID en el script de solicitudes:')
    console.log(`   const mentorId = '${user.id}'`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

getUserId()
