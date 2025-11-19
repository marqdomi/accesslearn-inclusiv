import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ApiService } from '@/services/api.service'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'student' | 'mentor' | 'admin'
  tenantId: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string, tenantId: string) => Promise<void>
  logout: () => void
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
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          role: response.user.role as 'student' | 'mentor' | 'admin',
          tenantId: response.user.tenantId,
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
    localStorage.removeItem('auth-token')
    localStorage.removeItem('current-user')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
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
