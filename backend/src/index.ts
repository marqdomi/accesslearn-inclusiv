import dotenv from "dotenv"
import { initializeCosmos } from "./services/cosmosdb.service"
import { getCourses } from "./functions/GetCourses"
import {
  createTenant,
  getTenantBySlug,
  listTenants
} from "./functions/TenantFunctions"

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
    // TEST 4: Obtener cursos del tenant demo
    // ============================================
    console.log("\n📋 TEST 4: Obtener Cursos (tenant-demo)")
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
