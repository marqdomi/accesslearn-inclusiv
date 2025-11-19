import { getContainer } from "../services/cosmosdb.service"

interface CourseQuery {
  tenantId?: string
}

export interface Course {
  id: string
  tenantId: string
  title: string
  description: string
  instructor: string
  status: "active" | "draft" | "archived"
}

export async function getCourses(query: CourseQuery): Promise<Course[]> {
  if (!query.tenantId) {
    throw new Error("tenantId is required")
  }

  const container = getContainer("courses")

  const sqlQuery = `SELECT * FROM c WHERE c.tenantId = "${query.tenantId}"`

  const { resources } = await container.items
    .query<Course>(sqlQuery)
    .fetchAll()

  return resources
}
