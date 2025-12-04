import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ApiService } from '@/services/api.service'
import { User, UserRole } from '@/lib/types'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string, tenantId: string) => Promise<void>
  logout: () => void
  switchTenant: () => void
  refreshUser: () => Promise<void>
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
    const loadAuth = async () => {
      const storedToken = localStorage.getItem('auth-token')
      const storedUser = localStorage.getItem('current-user')

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          
          // Try to validate token, but don't block if it fails (might be network issue)
          // The API service will handle 401 errors on actual requests
          try {
            await ApiService.getCurrentUser()
            // Token is valid, use stored user data
            setToken(storedToken)
            setUser(userData)
          } catch (error: any) {
            // Token might be expired, but don't clear yet - let actual API calls handle it
            // This prevents clearing auth on network errors during initial load
            console.warn('[AuthContext] Token validation failed during init, will validate on first API call')
            // Still set user/token so UI can load, but first API call will trigger logout if invalid
            setToken(storedToken)
            setUser(userData)
          }
        } catch (error) {
          console.error('Error parsing stored user:', error)
          localStorage.removeItem('auth-token')
          localStorage.removeItem('current-user')
        }
      }

      setIsLoading(false)
    }

    loadAuth()
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
          enrolledCourses: backendUser.enrolledCourses || [],
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

  const refreshUser = async () => {
    if (!user || !token) return

    try {
      const updatedUser = await ApiService.getUserById(user.id, user.tenantId)
      
      // Construir objeto User completo desde response
      const userData: User = {
        id: updatedUser.id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role as UserRole,
        tenantId: updatedUser.tenantId,
        assignedCourses: updatedUser.assignedCourses || [],
        enrolledCourses: updatedUser.enrolledCourses || [],
        customPermissions: updatedUser.customPermissions,
        // Mexican compliance fields (if present)
        curp: updatedUser.curp,
        rfc: updatedUser.rfc,
        nss: updatedUser.nss,
        puesto: updatedUser.puesto,
        area: updatedUser.area,
        departamento: updatedUser.departamento,
        centroCostos: updatedUser.centroCostos,
      }

      setUser(userData)
      localStorage.setItem('current-user', JSON.stringify(userData))
    } catch (error) {
      console.error('Error refreshing user:', error)
      // No lanzar error, solo loguear para no interrumpir el flujo
    }
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    switchTenant,
    refreshUser,
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
