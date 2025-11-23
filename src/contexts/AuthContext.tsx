import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ApiService } from '@/services/api.service'
import { User, UserRole } from '@/lib/types'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string, tenantId: string) => Promise<void>
  logout: () => void
  switchTenant: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar auth desde localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('auth-token')
    const storedUser = localStorage.getItem('current-user')

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('auth-token')
        localStorage.removeItem('current-user')
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, tenantId: string) => {
    try {
      const response = await ApiService.login(email, password, tenantId)

      if (response.success && response.user && response.token) {
        // Construir objeto User completo desde response
        const backendUser = response.user as any // Backend puede tener campos adicionales
        const userData: User = {
          id: backendUser.id,
          name: `${backendUser.firstName} ${backendUser.lastName}`,
          firstName: backendUser.firstName,
          lastName: backendUser.lastName,
          email: backendUser.email,
          role: backendUser.role as UserRole,
          tenantId: backendUser.tenantId,
          assignedCourses: backendUser.assignedCourses || [],
          customPermissions: backendUser.customPermissions,
          // Mexican compliance fields (if present)
          curp: backendUser.curp,
          rfc: backendUser.rfc,
          nss: backendUser.nss,
          puesto: backendUser.puesto,
          area: backendUser.area,
          departamento: backendUser.departamento,
          centroCostos: backendUser.centroCostos,
        }

        setUser(userData)
        setToken(response.token)

        localStorage.setItem('auth-token', response.token)
        localStorage.setItem('current-user', JSON.stringify(userData))
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)

    // Limpiar TODOS los datos de sesión
    localStorage.removeItem('auth-token')
    localStorage.removeItem('current-user')
    localStorage.removeItem('current-tenant-id')

    // Redirigir a página de inicio
    window.location.href = '/'
  }

  const switchTenant = () => {
    // Limpiar solo el tenant, mantener autenticación
    localStorage.removeItem('current-tenant-id')

    // Redirigir a página de inicio para seleccionar nuevo tenant
    window.location.href = '/'
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    switchTenant,
    isAuthenticated: !!user && !!token,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
