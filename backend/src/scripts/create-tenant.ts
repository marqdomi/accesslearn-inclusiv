import dotenv from "dotenv"
import { initializeCosmos } from "../services/cosmosdb.service"
import { createTenant, getTenantBySlug } from "../functions/TenantFunctions"

dotenv.config()

async function main() {
  try {
    await initializeCosmos()

    // Parse command line arguments
    const args = process.argv.slice(2)
    
    if (args.length < 4) {
      console.log(`
📝 Uso: npm run create-tenant <slug> <name> <email> <plan>

Ejemplo:
  npm run create-tenant acme "ACME Corporation" admin@acme.com profesional

Planes disponibles:
  - demo         (50 usuarios, 10 cursos, 60 días gratis)
  - profesional  (200 usuarios, 50 cursos)
  - enterprise   (1000 usuarios, 500 cursos)
`)
      process.exit(1)
    }

    const [slug, name, email, plan] = args

    // Validate plan
    if (!["demo", "profesional", "enterprise"].includes(plan)) {
      console.error("❌ Plan inválido. Usa: demo, profesional, o enterprise")
      process.exit(1)
    }

    // Check if tenant exists
    const existing = await getTenantBySlug(slug)
    if (existing) {
      console.error(`❌ Tenant con slug "${slug}" ya existe`)
      process.exit(1)
    }

    // Create tenant
    console.log(`\n🔨 Creando tenant "${name}"...\n`)
    
    const tenant = await createTenant({
      name,
      slug,
      contactEmail: email,
      plan: plan as "demo" | "profesional" | "enterprise"
    })

    console.log("✅ Tenant creado exitosamente!\n")
    console.log("📋 Detalles:")
    console.log(`   ID:           ${tenant.id}`)
    console.log(`   Nombre:       ${tenant.name}`)
    console.log(`   Slug:         ${tenant.slug}`)
    console.log(`   Email:        ${tenant.contactEmail}`)
    console.log(`   Plan:         ${tenant.plan}`)
    console.log(`   Status:       ${tenant.status}`)
    console.log(`   Max Usuarios: ${tenant.maxUsers}`)
    console.log(`   Max Cursos:   ${tenant.maxCourses}`)
    
    if (tenant.trialEndsAt) {
      const trialEnd = new Date(tenant.trialEndsAt)
      console.log(`   Trial hasta:  ${trialEnd.toLocaleDateString()}`)
    }

    console.log(`\n🎉 ¡Listo! Ahora puedes usar tenantId: "${tenant.id}"\n`)
  } catch (error) {
    console.error("\n❌ Error:", error)
    process.exit(1)
  }
}

main()
