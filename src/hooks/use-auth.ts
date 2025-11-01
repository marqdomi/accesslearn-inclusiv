import { useKV } from '@github/spark/hooks'
import { AuthSession, EmployeeCredentials, UserProfile, OnboardingPreferences } from '@/lib/types'
import { createAuthSession, isSessionValid } from '@/lib/auth-utils'

export function useAuth() {
  const [session, setSession] = useKV<AuthSession | null>('auth-session', null)
  const [credentials] = useKV<EmployeeCredentials[]>('employee-credentials', [])
  const [profiles, setProfiles] = useKV<UserProfile[]>('user-profiles', [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    
    console.log('useAuth.login called with:', { email: trimmedEmail, passwordLength: trimmedPassword.length })
    console.log('useAuth - credentials available:', credentials?.length || 0)
    console.log('useAuth - credentials:', credentials)
    
    const credentialsList = credentials || []
    const credential = credentialsList.find(c => c.email.toLowerCase() === trimmedEmail.toLowerCase())
    
    console.log('useAuth - found credential:', credential)
    
    if (!credential) {
      console.log('useAuth - No credential found for email:', trimmedEmail)
      return { success: false, error: 'Invalid email or password' }
    }

    if (credential.status === 'disabled') {
      console.log('useAuth - Account is disabled')
      return { success: false, error: 'This account has been disabled' }
    }

    const profilesList = profiles || []
    const profile = profilesList.find(p => p.email.toLowerCase() === trimmedEmail.toLowerCase())
    const isFirstLogin = !profile || credential.status === 'pending'
    
    console.log('useAuth - Password check:', { 
      expected: credential.temporaryPassword, 
      received: trimmedPassword,
      match: credential.temporaryPassword === trimmedPassword 
    })
    
    if (credential.temporaryPassword !== trimmedPassword) {
      console.log('useAuth - Password mismatch')
      return { success: false, error: 'Invalid email or password' }
    }

    console.log('useAuth - Login successful, creating session')
    const userRole = credential.role || 'employee'
    const newSession = createAuthSession(
      credential.id,
      trimmedEmail,
      userRole,
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
      role: credential.role || 'employee',
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
