import { useKV } from '@github/spark/hooks'
import { AuthSession, EmployeeCredentials, UserProfile, OnboardingPreferences } from '@/lib/types'
import { createAuthSession, isSessionValid, validatePassword } from '@/lib/auth-utils'

export function useAuth() {
  console.log('🔵 useAuth hook initialized')
  const [session, setSession] = useKV<AuthSession | null>('auth-session', null)
  const [profilesList, setProfiles] = useKV<UserProfile[]>('user-profiles', [])
  const [credentialsList, setCredentialsList] = useKV<EmployeeCredentials[]>('employee-credentials', [])
  const [hasAdminUser, setHasAdminUser] = useKV<boolean>('has-admin-user', false)
  
  console.log('📊 useAuth state:', { 
    hasAdminUser, 
    sessionExists: !!session,
    credentialsCount: credentialsList?.length || 0 
  })

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const trimmedEmail = email.trim()
      const trimmedPassword = password.trim()

      console.log('🔐 useAuth.login called with:', { email: trimmedEmail, passwordLength: trimmedPassword.length })

      console.log('🔍 useAuth - credentials from hook:', credentialsList?.length || 0)
      const credential = (credentialsList || []).find(c => c.email.toLowerCase() === trimmedEmail.toLowerCase())

      console.log('🎯 useAuth - found credential:', credential)

      if (!credential) {
        console.log('❌ useAuth - No credential found for email:', trimmedEmail)
        return { success: false, error: 'Invalid email or password' }
      }

      if (credential.status === 'disabled') {
        console.log('⛔ useAuth - Account is disabled')
        return { success: false, error: 'This account has been disabled' }
      }

      const profile = (profilesList || []).find(p => p.email.toLowerCase() === trimmedEmail.toLowerCase())
      const isFirstLogin = !profile || credential.status === 'pending'

      console.log('🔑 useAuth - Password check:', {
        expected: credential.temporaryPassword,
        received: trimmedPassword,
        match: credential.temporaryPassword === trimmedPassword
      })

      if (credential.temporaryPassword !== trimmedPassword) {
        console.log('❌ useAuth - Password mismatch')
        return { success: false, error: 'Invalid email or password' }
      }

      console.log('✅ useAuth - Login successful, creating session')
      const userRole = credential.role || 'employee'
      const newSession = createAuthSession(
        credential.id,
        trimmedEmail,
        userRole,
        isFirstLogin
      )

      setSession(newSession)
      return { success: true }
    } catch (e) {
      console.error('❗ useAuth.login unexpected error:', e)
      return { success: false, error: 'An unexpected error occurred during login' }
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!session) {
        return { success: false, error: 'No active session' }
      }

      const credential = (credentialsList || []).find(c => c.id === session.userId)
      if (!credential) {
        return { success: false, error: 'User not found' }
      }

      if (credential.temporaryPassword !== currentPassword) {
        return { success: false, error: 'Current password is incorrect' }
      }

      // Note: For demo purposes we do not persist the changed password.
      // We simply clear the password change requirement.
      setSession((current) => {
        if (!current) return null
        return {
          ...current,
          requiresPasswordChange: false
        }
      })

      return { success: true }
    } catch (e) {
      console.error('❗ useAuth.changePassword unexpected error:', e)
      return { success: false, error: 'An unexpected error occurred while changing password' }
    }
  }

  const completeOnboarding = async (preferences: OnboardingPreferences): Promise<void> => {
    if (!session) return

    const credential = (credentialsList || []).find(c => c.id === session.userId)
    if (!credential) return

    const newProfile: UserProfile = {
      id: session.userId,
      email: credential.email,
      firstName: credential.firstName,
      lastName: credential.lastName,
      fullName: preferences.displayName || `${credential.firstName} ${credential.lastName}`,
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

  const setupInitialAdmin = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Check if admin already exists
    if (hasAdminUser) {
      return { success: false, error: 'Administrator already exists' }
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.errors.join(', ') }
    }

    // Create admin credential
    const adminId = `admin-${Date.now()}`
    const adminCredential: EmployeeCredentials = {
      id: adminId,
      email: email.toLowerCase(),
      temporaryPassword: password, // In production, this should be hashed
      firstName,
      lastName,
      department: 'Administration',
      role: 'admin',
      status: 'activated',
      createdAt: Date.now()
    }

    // Create admin profile
    const adminProfile: UserProfile = {
      id: adminId,
      email: email.toLowerCase(),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      displayName: `${firstName} ${lastName}`,
      department: 'Administration',
      role: 'admin',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      preferences: {
        highContrast: false,
        textSize: 'normal',
        reduceMotion: false,
        disableSoundEffects: false
      }
    }

    // Save credentials and profile
    setCredentialsList([adminCredential])
    setProfiles([adminProfile])
    setHasAdminUser(true)

    // Auto-login the new admin
    const newSession = createAuthSession(adminId, email, 'admin', false)
    newSession.requiresPasswordChange = false
    newSession.requiresOnboarding = false
    
    setSession(newSession)

    return { success: true }
  }

  const isValid = session ? isSessionValid(session) : false

  return {
    session: isValid ? session : null,
    login,
    changePassword,
    completeOnboarding,
    logout,
    setupInitialAdmin,
    hasAdminUser,
    isAuthenticated: isValid
  }
}
