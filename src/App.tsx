import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TenantProvider } from '@/contexts/TenantContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { TenantResolver } from '@/components/auth/TenantResolver'
import { TenantLoginPage } from '@/components/auth/TenantLoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CourseViewerPage } from '@/pages/CourseViewerPage'
import { MentorDirectoryPage } from '@/pages/MentorDirectoryPage'
import { MentorDashboardPage } from '@/pages/MentorDashboardPage'
import { MenteeMentorshipsPage } from '@/pages/MenteeMentorshipsPage'
import { LibraryPage } from '@/pages/LibraryPage'
import CourseApprovalDemo from '@/pages/CourseApprovalDemo'
import { ContentManagerDashboardPage } from '@/pages/ContentManagerDashboardPage'
import { CourseManagementPage } from '@/pages/CourseManagementPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
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
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <TenantLoginPage />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute>
            <CourseViewerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentors"
        element={
          <ProtectedRoute>
            <MentorDirectoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/dashboard"
        element={
          <ProtectedRoute>
            <MentorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-mentorships"
        element={
          <ProtectedRoute>
            <MenteeMentorshipsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <LibraryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/demo/course-approval"
        element={
          <ProtectedRoute>
            <CourseApprovalDemo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content-manager"
        element={
          <ProtectedRoute>
            <ContentManagerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-courses"
        element={
          <ProtectedRoute>
            <CourseManagementPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <TenantProvider>
        <TenantResolver>
          <AuthProvider>
            <AppRoutes />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </TenantResolver>
      </TenantProvider>
    </BrowserRouter>
  )
}

export default App
