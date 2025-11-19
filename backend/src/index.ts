import dotenv from "dotenv"
import { initializeCosmos } from "./services/cosmosdb.service"
import { getCourses } from "./functions/GetCourses"
import {
  createTenant,
  getTenantBySlug,
  listTenants
} from "./functions/TenantFunctions"
import {
  createUser,
  getUsersByTenant,
  getTenantUserStats,
  enrollUserInCourse
} from "./functions/UserFunctions"

dotenv.config()

async function main() {
  try {
    console.log("🚀 Iniciando AccessLearn Backend...\n")

    // Inicializar Cosmos DB
    await initializeCosmos()

    // ============================================
    // TEST 1: Crear Tenant Demo (si no existe)
    // ============================================
    console.log("📋 TEST 1: Crear Tenant Demo")
    
    let demoTenant = await getTenantBySlug("demo")
    
    if (!demoTenant) {
      console.log("   → Creando tenant 'demo'...")
      demoTenant = await createTenant({
        name: "Empresa Demo",
        slug: "demo",
        contactEmail: "demo@accesslearn.com",
        contactPhone: "+52 555 123 4567",
        plan: "demo",
        primaryColor: "#4F46E5",
        secondaryColor: "#10B981"
      })
      console.log("   ✅ Tenant creado:", demoTenant.name)
    } else {
      console.log("   ℹ️  Tenant 'demo' ya existe")
    }

    // ============================================
    // TEST 2: Crear Tenant Kainet (si no existe)
    // ============================================
    console.log("\n📋 TEST 2: Crear Tenant Kainet")
    
    let kainetTenant = await getTenantBySlug("kainet")
    
    if (!kainetTenant) {
      console.log("   → Creando tenant 'kainet'...")
      kainetTenant = await createTenant({
        name: "Kainet",
        slug: "kainet",
        contactEmail: "contacto@kainet.mx",
        contactPhone: "+52 555 000 0000",
        plan: "profesional",
        rfc: "KAINET123456",
        businessName: "Kainet S.A. de C.V.",
        address: "Ciudad de México",
        primaryColor: "#2563EB",
        secondaryColor: "#F59E0B"
      })
      console.log("   ✅ Tenant creado:", kainetTenant.name)
    } else {
      console.log("   ℹ️  Tenant 'kainet' ya existe")
    }

    // ============================================
    // TEST 3: Listar todos los tenants
    // ============================================
    console.log("\n📋 TEST 3: Listar Todos los Tenants")
    const allTenants = await listTenants()
    console.log(`   📊 Total tenants: ${allTenants.length}`)
    allTenants.forEach((t) => {
      console.log(`   - ${t.name} (${t.slug}) - Plan: ${t.plan} - Status: ${t.status}`)
    })

    // ============================================
    // TEST 4: Crear Usuario Demo (estudiante)
    // ============================================
    console.log("\n📋 TEST 4: Crear Usuario Demo (estudiante)")
    
    try {
      const studentUser = await createUser({
        tenantId: "tenant-demo",
        email: "juan.perez@demo.com",
        firstName: "Juan",
        lastName: "Pérez García",
        role: "student",
        curp: "PEGJ900101HDFRNN09",
        rfc: "PEGJ900101ABC",
        phone: "+52 555 1234567"
      })
      console.log("   ✅ Usuario creado:", `${studentUser.firstName} ${studentUser.lastName}`)
      console.log("   📧 Email:", studentUser.email)
      console.log("   🎓 Role:", studentUser.role)
      console.log("   📋 CURP:", studentUser.curp)
    } catch (error: any) {
      if (error.message.includes("ya está registrado")) {
        console.log("   ℹ️  Usuario 'juan.perez@demo.com' ya existe")
      } else {
        throw error
      }
    }

    // ============================================
    // TEST 5: Crear Usuario Mentor (Kainet)
    // ============================================
    console.log("\n📋 TEST 5: Crear Usuario Mentor (Kainet)")
    
    try {
      const mentorUser = await createUser({
        tenantId: "tenant-kainet",
        email: "ana.lopez@kainet.mx",
        firstName: "Ana",
        lastName: "López Torres",
        role: "mentor",
        curp: "LOTA850315MDFPRN09",
        rfc: "LOTA850315ABC",
        nss: "12345678901",
        phone: "+52 555 9876543"
      })
      console.log("   ✅ Usuario creado:", `${mentorUser.firstName} ${mentorUser.lastName}`)
      console.log("   📧 Email:", mentorUser.email)
      console.log("   👨‍🏫 Role:", mentorUser.role)
      console.log("   🏥 NSS:", mentorUser.nss)
    } catch (error: any) {
      if (error.message.includes("ya está registrado")) {
        console.log("   ℹ️  Usuario 'ana.lopez@kainet.mx' ya existe")
      } else {
        throw error
      }
    }

    // ============================================
    // TEST 6: Listar usuarios por tenant
    // ============================================
    console.log("\n📋 TEST 6: Listar Usuarios (tenant-demo)")
    const demoUsers = await getUsersByTenant("tenant-demo")
    console.log(`   👥 Total usuarios: ${demoUsers.length}`)
    demoUsers.forEach((u) => {
      console.log(`   - ${u.firstName} ${u.lastName} (${u.role}) - ${u.email}`)
    })

    // ============================================
    // TEST 7: Estadísticas de usuarios
    // ============================================
    console.log("\n📋 TEST 7: Estadísticas de Usuarios (tenant-demo)")
    const stats = await getTenantUserStats("tenant-demo")
    console.log(`   📊 Total usuarios: ${stats.totalUsers}`)
    console.log(`   ✅ Activos: ${stats.activeUsers}`)
    console.log(`   👨‍🎓 Estudiantes: ${stats.students}`)
    console.log(`   👨‍🏫 Mentores: ${stats.mentors}`)
    console.log(`   🔧 Admins: ${stats.admins}`)
    console.log(`   ⭐ XP promedio: ${stats.averageXP.toFixed(0)}`)

    // ============================================
    // TEST 8: Obtener cursos del tenant demo
    // ============================================
    console.log("\n📋 TEST 8: Obtener Cursos (tenant-demo)")
    const courses = await getCourses({ tenantId: "tenant-demo" })
    console.log(`   📚 Cursos encontrados: ${courses.length}`)
    courses.forEach((c) => {
      console.log(`   - ${c.title} (${c.instructor})`)
    })

    if (courses.length === 0) {
      console.log(
        "   ⚠️  No hay cursos. Ve a Azure Portal y agrega datos de prueba."
      )
    }

    console.log("\n✅ Todos los tests completados exitosamente!\n")
  } catch (error) {
    console.error("\n❌ Error:", error)
    process.exit(1)
  }
}

main()
