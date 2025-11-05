import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthSession } from '@/lib/types'
import { createAuthSession, isSessionValid } from '@/lib/auth-utils'
import { AuthService } from '@/services/auth-service'

type LoginResult = { success: boolean; error?: string }
type SessionUpdater = AuthSession | null | ((prev: AuthSession | null) => AuthSession | null)

const STORAGE_KEY = 'accesslearn.auth-session'

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isReady, setIsReady] = useState(false)

  const persistSession = useCallback((next: SessionUpdater) => {
    setSession(prev => {
      const resolved = typeof next === 'function' ? (next as (value: AuthSession | null) => AuthSession | null)(prev) : next

      if (typeof window !== 'undefined') {
        try {
          if (resolved) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved))
          } else {
            window.localStorage.removeItem(STORAGE_KEY)
          }
        } catch (error) {
          console.warn('Failed to persist auth session:', error)
        }
      }

      return resolved
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsReady(true)
      return
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AuthSession
        if (isSessionValid(parsed)) {
          setSession(parsed)
        } else {
          window.localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch (error) {
      console.warn('Failed to restore auth session:', error)
    } finally {
      setIsReady(true)
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await AuthService.login(email, password)
      const user = response.data
      const baseSession = createAuthSession(user.id, user.email, user.role, false)
      const hydratedSession: AuthSession = {
        ...baseSession,
        requiresPasswordChange: false,
        requiresOnboarding: false,
        isFirstLogin: false
      }
      persistSession(hydratedSession)
      return { success: true }
    } catch (error) {
      console.error('useAuth.login failed:', error)
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.'
      return { success: false, error: message }
    }
  }, [persistSession])

  const logout = useCallback(() => {
    persistSession(null)
  }, [persistSession])

  const changePassword = useCallback(async (): Promise<LoginResult> => {
    return { success: false, error: 'Password changes are not yet available.' }
  }, [])

  const completeOnboarding = useCallback(async () => {
    persistSession(prev => {
      if (!prev) {
        return prev
      }

      return {
        ...prev,
        requiresOnboarding: false,
        lastActivity: Date.now()
      }
    })
  }, [persistSession])

  useEffect(() => {
    if (!session) {
      return
    }

    if (!isSessionValid(session)) {
      persistSession(null)
    }
  }, [session, persistSession])

  const isAuthenticated = useMemo(() => Boolean(session), [session])

  return {
    session: isAuthenticated ? session : null,
    login,
    changePassword,
    completeOnboarding,
    logout,
    isAuthenticated,
    isAuthReady: isReady
  }
}
