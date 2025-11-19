import dotenv from "dotenv"
import { initializeCosmos } from "./services/cosmosdb.service"
import { getCourses } from "./functions/GetCourses"

dotenv.config()

async function main() {
  try {
    console.log("🚀 Iniciando AccessLearn Backend...")

    // Inicializar Cosmos DB
    await initializeCosmos()

    // Test: obtener cursos del tenant demo
    const courses = await getCourses({ tenantId: "tenant-demo" })

    console.log("📚 Cursos encontrados:")
    console.log(JSON.stringify(courses, null, 2))

    if (courses.length === 0) {
      console.log(
        "⚠️  No hay cursos. Ve a Azure Portal y agrega datos de prueba."
      )
    }
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

main()
