import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { TenantProvider } from '@/contexts/TenantContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { TenantResolver } from '@/components/auth/TenantResolver'
import { TenantLoginPage } from '@/components/auth/TenantLoginPage'
import { AcceptInvitationPage } from '@/pages/AcceptInvitationPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CourseViewerPage } from '@/pages/CourseViewerPage'
import { MentorDirectoryPage } from '@/pages/MentorDirectoryPage'
import { MentorDashboardPage } from '@/pages/MentorDashboardPage'
import { MenteeMentorshipsPage } from '@/pages/MenteeMentorshipsPage'
import { LibraryPage } from '@/pages/LibraryPage'
import { CourseCatalogPage } from '@/pages/CourseCatalogPage'
import CourseApprovalDemo from '@/pages/CourseApprovalDemo'
import { ContentManagerDashboardPage } from '@/pages/ContentManagerDashboardPage'
import { CourseManagementPage } from '@/pages/CourseManagementPage'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { AdminSettingsPage } from '@/pages/AdminSettingsPage'
import { BrandingSettingsPage } from '@/pages/BrandingSettingsPage'
import { NotificationSettingsPage } from '@/pages/NotificationSettingsPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { SecuritySettingsPage } from '@/pages/SecuritySettingsPage'
import { DataSettingsPage } from '@/pages/DataSettingsPage'
import { CategoryManagementPage } from '@/pages/CategoryManagementPage'
import { AccessibilitySettingsPage } from '@/pages/AccessibilitySettingsPage'
import { AdvancedAccessibilityPanel } from '@/components/accessibility/AdvancedAccessibilityPanel'
import { AdminAnalyticsPage } from '@/pages/AdminAnalyticsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { CertificateSettingsPage } from '@/pages/CertificateSettingsPage'

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
        path="/accept-invitation"
        element={<AcceptInvitationPage />}
      />
      <Route
        path="/register"
        element={<RegisterPage />}
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
        path="/catalog"
        element={
          <ProtectedRoute>
            <CourseCatalogPage />
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
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <AdminSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/branding"
        element={
          <ProtectedRoute>
            <BrandingSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/notifications"
        element={
          <ProtectedRoute>
            <NotificationSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/security"
        element={
          <ProtectedRoute>
            <SecuritySettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/data"
        element={
          <ProtectedRoute>
            <DataSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/categories"
        element={
          <ProtectedRoute>
            <CategoryManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/accessibility"
        element={
          <ProtectedRoute>
            <AccessibilitySettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/certificates"
        element={
          <ProtectedRoute>
            <CertificateSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
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
      <ThemeProvider>
        <AuthProvider>
          <TenantProvider>
            <TenantResolver>
              <AppRoutes />
              <AdvancedAccessibilityPanel />
              <Toaster position="top-right" richColors />
            </TenantResolver>
          </TenantProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
