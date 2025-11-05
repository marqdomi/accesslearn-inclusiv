import { EmployeeCredentials, BulkUploadResult } from '@/lib/types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export class EmployeeService {
  /**
   * Obtener todas las credenciales de empleados
   */
  static async getAll(): Promise<EmployeeCredentials[]> {
    try {
      const response = await fetch(`${API_BASE}/api/employee-credentials`)
      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.statusText}`)
      }
      const { data } = await response.json()
      return data || []
    } catch (error) {
      console.error('EmployeeService.getAll failed:', error)
      throw error
    }
  }

  /**
   * Obtener una credencial específica por ID
   */
  static async getById(id: string): Promise<EmployeeCredentials | null> {
    try {
      const response = await fetch(`${API_BASE}/api/employee-credentials/${id}`)
      if (response.status === 404) {
        return null
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch employee: ${response.statusText}`)
      }
      const { data } = await response.json()
      return data
    } catch (error) {
      console.error('EmployeeService.getById failed:', error)
      throw error
    }
  }

  /**
   * Crear un único empleado
   */
  static async create(employee: EmployeeCredentials): Promise<EmployeeCredentials> {
    try {
      const response = await fetch(`${API_BASE}/api/employee-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employee)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to create employee: ${response.statusText}`)
      }

      const { data } = await response.json()
      return data
    } catch (error) {
      console.error('EmployeeService.create failed:', error)
      throw error
    }
  }

  /**
   * Crear múltiples empleados en una sola transacción
   */
  static async createBulk(employees: EmployeeCredentials[]): Promise<BulkUploadResult> {
    try {
      const response = await fetch(`${API_BASE}/api/employees/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employees })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to create employees: ${response.statusText}`)
      }

      const { data } = await response.json()
      return data
    } catch (error) {
      console.error('EmployeeService.createBulk failed:', error)
      throw error
    }
  }

  /**
   * Actualizar una credencial de empleado
   */
  static async update(id: string, employee: EmployeeCredentials): Promise<EmployeeCredentials> {
    try {
      const response = await fetch(`${API_BASE}/api/employee-credentials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employee)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to update employee: ${response.statusText}`)
      }

      const { data } = await response.json()
      return data
    } catch (error) {
      console.error('EmployeeService.update failed:', error)
      throw error
    }
  }

  /**
   * Eliminar una credencial de empleado
   */
  static async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/api/employee-credentials/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete employee: ${response.statusText}`)
      }
    } catch (error) {
      console.error('EmployeeService.delete failed:', error)
      throw error
    }
  }

  /**
   * Marcar una credencial como activada
   */
  static async markAsActivated(id: string): Promise<EmployeeCredentials> {
    try {
      const employee = await this.getById(id)
      if (!employee) {
        throw new Error('Employee not found')
      }

      return await this.update(id, {
        ...employee,
        status: 'activated'
      })
    } catch (error) {
      console.error('EmployeeService.markAsActivated failed:', error)
      throw error
    }
  }

  /**
   * Obtener empleados pendientes de activación
   */
  static async getPending(): Promise<EmployeeCredentials[]> {
    try {
      const all = await this.getAll()
      return all.filter(e => e.status === 'pending')
    } catch (error) {
      console.error('EmployeeService.getPending failed:', error)
      throw error
    }
  }

  /**
   * Obtener empleados activados
   */
  static async getActivated(): Promise<EmployeeCredentials[]> {
    try {
      const all = await this.getAll()
      return all.filter(e => e.status === 'activated')
    } catch (error) {
      console.error('EmployeeService.getActivated failed:', error)
      throw error
    }
  }
}
