import { TenantProvider } from '@/contexts/TenantContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { TenantResolver } from '@/components/auth/TenantResolver'
import { TenantLoginPage } from '@/components/auth/TenantLoginPage'
import { DashboardPage } from '@/pages/DashboardPage'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <TenantLoginPage />
  }

  return <DashboardPage />
}

function App() {
  return (
    <TenantProvider>
      <TenantResolver>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TenantResolver>
    </TenantProvider>
  )
}

export default App
