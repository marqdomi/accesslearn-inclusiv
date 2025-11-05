const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export interface AdminStats {
  totalEmployees: number
  pendingActivation: number
  totalCourses: number
  publishedCourses: number
  completionRate: number
  totalXP: number
  totalUsers: number
  activeUsers: number
}

export class AdminStatsService {
  /**
   * Obtener estadísticas generales del dashboard de administrador
   */
  static async getStats(): Promise<AdminStats> {
    try {
      const response = await fetch(`${API_BASE}/api/admin/stats`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch admin stats: ${response.statusText}`)
      }

      const { data } = await response.json()
      return data
    } catch (error) {
      console.error('AdminStatsService.getStats failed:', error)
      // Retornar valores por defecto en caso de error
      return {
        totalEmployees: 0,
        pendingActivation: 0,
        totalCourses: 0,
        publishedCourses: 0,
        completionRate: 0,
        totalXP: 0,
        totalUsers: 0,
        activeUsers: 0
      }
    }
  }
}
