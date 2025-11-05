/**
 * User Management Service
 * Gestión de usuarios desde la base de datos SQL
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export interface ManagedUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  department?: string
  role: 'admin' | 'employee' | 'mentor'
  status: 'pending' | 'active' | 'inactive'
  createdAt: number
  lastLoginAt: number | null
  temporaryPassword?: string
  requiresPasswordChange?: boolean
}

export interface UserUpdateData {
  firstName?: string
  lastName?: string
  department?: string
  role?: 'admin' | 'employee' | 'mentor'
  displayName?: string
}

export class UserManagementService {
  /**
   * Obtener todos los usuarios del sistema desde SQL
   */
  static async getAllUsers(): Promise<ManagedUser[]> {
    try {
      const response = await fetch(`${API_BASE}/api/users/all`)
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`)
      }
      const { data } = await response.json()
      return data || []
    } catch (error) {
      console.error('UserManagementService.getAllUsers failed:', error)
      throw error
    }
  }

  /**
   * Actualizar un usuario
   */
  static async updateUser(id: string, updates: UserUpdateData): Promise<ManagedUser> {
    try {
      const response = await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to update user: ${response.statusText}`)
      }

      const { data } = await response.json()
      return data
    } catch (error) {
      console.error('UserManagementService.updateUser failed:', error)
      throw error
    }
  }

  /**
   * Eliminar un usuario
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete user: ${response.statusText}`)
      }
    } catch (error) {
      console.error('UserManagementService.deleteUser failed:', error)
      throw error
    }
  }

  /**
   * Reenviar invitación (regenerar contraseña temporal)
   */
  static async resendInvitation(id: string): Promise<ManagedUser> {
    try {
      const response = await fetch(`${API_BASE}/api/users/${id}/resend-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to resend invitation: ${response.statusText}`)
      }

      const { data } = await response.json()
      return data
    } catch (error) {
      console.error('UserManagementService.resendInvitation failed:', error)
      throw error
    }
  }

  /**
   * Obtener usuarios por estado
   */
  static async getUsersByStatus(status: 'pending' | 'active' | 'inactive'): Promise<ManagedUser[]> {
    try {
      const all = await this.getAllUsers()
      return all.filter(u => u.status === status)
    } catch (error) {
      console.error('UserManagementService.getUsersByStatus failed:', error)
      throw error
    }
  }

  /**
   * Obtener usuarios por rol
   */
  static async getUsersByRole(role: 'admin' | 'employee' | 'mentor'): Promise<ManagedUser[]> {
    try {
      const all = await this.getAllUsers()
      return all.filter(u => u.role === role)
    } catch (error) {
      console.error('UserManagementService.getUsersByRole failed:', error)
      throw error
    }
  }

  /**
   * Buscar usuarios por texto
   */
  static async searchUsers(query: string): Promise<ManagedUser[]> {
    try {
      const all = await this.getAllUsers()
      const lowerQuery = query.toLowerCase()
      
      return all.filter(u => 
        u.email.toLowerCase().includes(lowerQuery) ||
        u.firstName.toLowerCase().includes(lowerQuery) ||
        u.lastName.toLowerCase().includes(lowerQuery) ||
        u.fullName.toLowerCase().includes(lowerQuery) ||
        (u.department && u.department.toLowerCase().includes(lowerQuery))
      )
    } catch (error) {
      console.error('UserManagementService.searchUsers failed:', error)
      throw error
    }
  }

  /**
   * Contar usuarios totales
   */
  static async getTotalCount(): Promise<number> {
    try {
      const users = await this.getAllUsers()
      return users.length
    } catch (error) {
      console.error('UserManagementService.getTotalCount failed:', error)
      return 0
    }
  }
}
