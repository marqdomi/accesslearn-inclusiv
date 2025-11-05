import { AuthSession, EmployeeCredentials, UserProfile, PasswordChangeRequest } from './types'

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateTemporaryPassword(): string {
  const adjectives = ['Swift', 'Bright', 'Quick', 'Bold', 'Clear', 'Smart', 'Strong', 'Fresh']
  const nouns = ['Eagle', 'Tiger', 'Phoenix', 'Dragon', 'Falcon', 'Wolf', 'Bear', 'Lion']
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 9000) + 1000
  return `${adjective}${noun}${number}!`
}

export function validatePassword(password: string): { valid: boolean; isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  const isValid = errors.length === 0
  
  return {
    valid: isValid,
    isValid,
    errors
  }
}

export function validatePasswordChange(request: PasswordChangeRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!request.currentPassword) {
    errors.push('Current password is required')
  }
  
  if (!request.newPassword) {
    errors.push('New password is required')
  }
  
  if (request.newPassword !== request.confirmPassword) {
    errors.push('Passwords do not match')
  }
  
  if (request.currentPassword === request.newPassword) {
    errors.push('New password must be different from current password')
  }
  
  const passwordValidation = validatePassword(request.newPassword)
  if (!passwordValidation.valid) {
    errors.push(...passwordValidation.errors)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

export function calculatePasswordStrength(password: string): {
  strength: 'weak' | 'fair' | 'good' | 'strong'
  score: number
} {
  let score = 0
  
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1
  if (password.length >= 16) score += 1
  
  let strength: 'weak' | 'fair' | 'good' | 'strong'
  if (score <= 2) strength = 'weak'
  else if (score <= 4) strength = 'fair'
  else if (score <= 5) strength = 'good'
  else strength = 'strong'
  
  return { strength, score }
}

export function parseCSVEmployees(csvContent: string): {
  employees: Array<{ email: string; firstName: string; lastName: string; department?: string }>
  errors: Array<{ row: number; message: string }>
} {
  const lines = csvContent.trim().split('\n')
  const employees: Array<{ email: string; firstName: string; lastName: string; department?: string }> = []
  const errors: Array<{ row: number; message: string }> = []
  
  if (lines.length < 2) {
    errors.push({ row: 0, message: 'CSV file must contain a header row and at least one data row' })
    return { employees, errors }
  }
  
  const header = lines[0].toLowerCase()
  if (!header.includes('email') || !header.includes('firstname') || !header.includes('lastname')) {
    errors.push({ row: 0, message: 'CSV must include columns: email, firstName, lastName (department is optional)' })
    return { employees, errors }
  }
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''))
    
    if (parts.length < 3) {
      errors.push({ row: i + 1, message: 'Row must have at least email, firstName, and lastName' })
      continue
    }
    
    const [email, firstName, lastName, department] = parts
    
    if (!email || !isValidEmail(email)) {
      errors.push({ row: i + 1, message: `Invalid email: ${email}` })
      continue
    }
    
    if (!firstName || !lastName) {
      errors.push({ row: i + 1, message: 'First name and last name are required' })
      continue
    }
    
    employees.push({
      email: email.toLowerCase(),
      firstName,
      lastName,
      department: department || undefined
    })
  }
  
  return { employees, errors }
}

export function formatCredentialsForDownload(credentials: EmployeeCredentials[]): string {
  const header = 'Email,First Name,Last Name,Department,Temporary Password,Instructions\n'
  const rows = credentials.map(cred => {
    const instructions = 'Please log in and change your password immediately'
    return `${cred.email},"${cred.firstName}","${cred.lastName}","${cred.department || ''}",${cred.temporaryPassword},"${instructions}"`
  })
  return header + rows.join('\n')
}

export function createAuthSession(userId: string, email: string, role: 'employee' | 'admin', isFirstLogin: boolean): AuthSession {
  return {
    userId,
    email,
    role,
    isFirstLogin,
    requiresPasswordChange: isFirstLogin,
    requiresOnboarding: isFirstLogin,
    createdAt: Date.now(),
    lastActivity: Date.now()
  }
}

export function isSessionValid(session: AuthSession | null): boolean {
  if (!session) return false
  
  const TWO_HOURS = 2 * 60 * 60 * 1000
  const timeSinceActivity = Date.now() - session.lastActivity
  
  return timeSinceActivity < TWO_HOURS
}

export function getPasswordStrengthColor(strength: 'weak' | 'fair' | 'good' | 'strong'): string {
  switch (strength) {
    case 'weak': return 'text-destructive'
    case 'fair': return 'text-accent'
    case 'good': return 'text-secondary'
    case 'strong': return 'text-success'
  }
}

export function getPasswordStrengthBg(strength: 'weak' | 'fair' | 'good' | 'strong'): string {
  switch (strength) {
    case 'weak': return 'bg-destructive'
    case 'fair': return 'bg-accent'
    case 'good': return 'bg-secondary'
    case 'strong': return 'bg-success'
  }
}
