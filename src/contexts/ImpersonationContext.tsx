/**
 * Impersonation Context
 * Allows super-admins to impersonate tenant-admins for support/debugging
 */
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ImpersonatedUser {
  id: string
  email: string
  name: string
  tenantId: string
  tenantName: string
  role: string
  originalToken?: string
}

interface ImpersonationContextType {
  isImpersonating: boolean
  impersonatedUser: ImpersonatedUser | null
  startImpersonation: (user: ImpersonatedUser) => void
  endImpersonation: () => void
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined)

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const [impersonatedUser, setImpersonatedUser] = useState<ImpersonatedUser | null>(() => {
    // Restore impersonation state from sessionStorage (not localStorage for security)
    const saved = sessionStorage.getItem('impersonation')
    return saved ? JSON.parse(saved) : null
  })

  const startImpersonation = useCallback((user: ImpersonatedUser) => {
    // Store current token before impersonating
    const currentToken = localStorage.getItem('accesslearn_token')
    const userWithToken = { ...user, originalToken: currentToken || undefined }
    
    setImpersonatedUser(userWithToken)
    sessionStorage.setItem('impersonation', JSON.stringify(userWithToken))
    
    // Log impersonation start for audit
    console.log('[AUDIT] Impersonation started:', {
      targetUser: user.email,
      targetTenant: user.tenantId,
      timestamp: new Date().toISOString()
    })
  }, [])

  const endImpersonation = useCallback(() => {
    if (impersonatedUser) {
      // Log impersonation end for audit
      console.log('[AUDIT] Impersonation ended:', {
        targetUser: impersonatedUser.email,
        targetTenant: impersonatedUser.tenantId,
        timestamp: new Date().toISOString()
      })
      
      // Restore original token if exists
      if (impersonatedUser.originalToken) {
        localStorage.setItem('accesslearn_token', impersonatedUser.originalToken)
      }
    }
    
    setImpersonatedUser(null)
    sessionStorage.removeItem('impersonation')
  }, [impersonatedUser])

  return (
    <ImpersonationContext.Provider
      value={{
        isImpersonating: !!impersonatedUser,
        impersonatedUser,
        startImpersonation,
        endImpersonation
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  )
}

export function useImpersonation() {
  const context = useContext(ImpersonationContext)
  if (context === undefined) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider')
  }
  return context
}
