import { useKV } from '@github/spark/hooks'
import { AuthSession, EmployeeCredentials, UserProfile, OnboardingPreferences } from '@/lib/types'
import { createAuthSession, isSessionValid } from '@/lib/auth-utils'

export function useAuth() {
  const [session, setSession] = useKV<AuthSession | null>('auth-session', null)
  const [credentials] = useKV<EmployeeCredentials[]>('employee-credentials', [])
  const [profiles, setProfiles] = useKV<UserProfile[]>('user-profiles', [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const credential = (credentials || []).find(c => c.email.toLowerCase() === email.toLowerCase())
    
    if (!credential) {
      return { success: false, error: 'Invalid email or password' }
    }

    if (credential.status === 'disabled') {
      return { success: false, error: 'This account has been disabled' }
    }

    const profile = (profiles || []).find(p => p.email.toLowerCase() === email.toLowerCase())
    const isFirstLogin = !profile || credential.status === 'pending'
    
    if (isFirstLogin) {
      if (credential.temporaryPassword !== password) {
        return { success: false, error: 'Invalid email or password' }
      }
    } else {
      if (profile.id !== password) {
        return { success: false, error: 'Invalid email or password' }
      }
    }

    const newSession = createAuthSession(
      credential.id,
      email,
      'employee',
      isFirstLogin
    )

    setSession(newSession)
    return { success: true }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!session) {
      return { success: false, error: 'No active session' }
    }

    const credential = (credentials || []).find(c => c.id === session.userId)
    if (!credential) {
      return { success: false, error: 'User not found' }
    }

    if (credential.temporaryPassword !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' }
    }

    setSession((current) => {
      if (!current) return null
      return {
        ...current,
        requiresPasswordChange: false
      }
    })

    return { success: true }
  }

  const completeOnboarding = async (preferences: OnboardingPreferences): Promise<void> => {
    if (!session) return

    const credential = (credentials || []).find(c => c.id === session.userId)
    if (!credential) return

    const newProfile: UserProfile = {
      id: session.userId,
      email: credential.email,
      firstName: credential.firstName,
      lastName: credential.lastName,
      displayName: preferences.displayName,
      avatar: preferences.avatar,
      department: credential.department,
      role: 'employee',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      preferences
    }

    setProfiles((current) => [...(current || []), newProfile])

    setSession((current) => {
      if (!current) return null
      return {
        ...current,
        requiresOnboarding: false
      }
    })
  }

  const logout = () => {
    setSession(null)
  }

  const isValid = session ? isSessionValid(session) : false

  return {
    session: isValid ? session : null,
    login,
    changePassword,
    completeOnboarding,
    logout,
    isAuthenticated: isValid
  }
}
