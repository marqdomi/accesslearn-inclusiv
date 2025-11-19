import { useState, useMemo, useEffect } from 'react'
import { useBranding } from '@/hooks/use-branding'
import { useBackendCourses } from '@/hooks/use-backend-courses'
import { useTenant } from '@/contexts/TenantContext'
import { Course } from '@/lib/types'
import { translateCourse } from '@/lib/translate-course'
import { TenantProvider } from '@/contexts/TenantContext'
import { TenantResolver } from '@/components/auth/TenantResolver'
import { TenantLoginPage } from '@/components/auth/TenantLoginPage'
import { SkipLink } from '@/components/accessibility/SkipLink'
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel'
import { UserDashboard } from '@/components/dashboard/UserDashboard'
import { CourseViewer } from '@/components/courses/CourseViewer'
import { AchievementsDashboard } from '@/components/achievements/AchievementsDashboard'
import { CommunityDashboard } from '@/components/community/CommunityDashboard'
import { NotificationsViewer } from '@/components/community/NotificationsViewer'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { MissionLibrary } from '@/components/library/MissionLibrary'
import { MyLibrary } from '@/components/library/MyLibrary'
import { DataSourceIndicator } from '@/components/dashboard/DataSourceIndicator'
import { TenantSelector } from '@/components/dashboard/TenantSelector'
import { Button } from '@/components/ui/button'
import { Trophy, GraduationCap, Lightning, ShieldCheck, SignOut, Users, BookmarksSimple, BookBookmark, Certificate } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { MyCertificates } from '@/components/dashboard/MyCertificates'

type View = 'dashboard' | 'achievements' | 'community' | 'admin' | 'mission-library' | 'my-library' | 'my-certificates'

function App() {
  const { t } = useTranslation()
  const { branding } = useBranding()
  const { currentTenant, isLoading: tenantLoading } = useTenant()
  
  // Backend authentication state
  const [backendUser, setBackendUser] = useState<any>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  // Use backend courses only
  const { courses: backendCourses, loading: coursesLoading } = useBackendCourses()
  const courses = backendCourses
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [currentView, setCurrentView] = useState<View>('dashboard')
  const [isInitializing, setIsInitializing] = useState(true)

  // Check for backend authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth-token')
      const userStr = localStorage.getItem('current-user')
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          // Adapt backend user to session format
          const adaptedSession = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: `${user.firstName} ${user.lastName}`,
            requiresPasswordChange: false,
            requiresOnboarding: false,
            tenantId: user.tenantId
          }
          setBackendUser(adaptedSession)
          console.log('[Auth] Usuario autenticado:', adaptedSession)
        } catch (error) {
          console.error('[Auth] Error parsing user:', error)
          localStorage.removeItem('auth-token')
          localStorage.removeItem('current-user')
        }
      }
      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [])

  useEffect(() => {
    // Give a brief moment for KV and tenant to initialize
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const translatedCourses = useMemo(() => {
    return (courses || []).map(course => translateCourse(course, t))
  }, [courses, t])
  
  const isLoading = isInitializing || tenantLoading || coursesLoading || isCheckingAuth

  // User is authenticated if backendUser exists
  const isAuthenticated = backendUser !== null
  const currentSession = backendUser

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Lightning size={48} className="animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // Show tenant-aware login page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <TenantLoginPage />
        <Toaster richColors position="top-center" />
      </>
    )
  }

  const handleLogout = () => {
    // Logout from backend
    localStorage.removeItem('auth-token')
    localStorage.removeItem('current-user')
    setBackendUser(null)
    
    // Reload to show login page
    window.location.reload()
  }

  const handleViewChange = (view: View) => {
    if (view === 'admin' && currentSession?.role !== 'admin') {
      return
    }
    setCurrentView(view)
    setSelectedCourse(null)
  }

  const isAdminView = currentView === 'admin' && currentSession?.role === 'admin'
  const isAdmin = currentSession?.role === 'admin'

  const appTitle = branding?.companyName || t('app.title')
  const logoElement = branding?.logoUrl ? (
    <img src={branding.logoUrl} alt={appTitle} className="h-10 max-w-[200px] object-contain" />
  ) : (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-secondary to-accent">
      <Lightning size={24} weight="fill" className="text-white" aria-hidden="true" />
    </div>
  )

  return (
    <>
      <SampleDataInitializer />
      <SkipLink />
      {isAdminView ? (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
          <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {logoElement}
                  {!branding?.logoUrl && (
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        {t('app.admin.title')}
                      </h1>
                      <p className="text-xs text-muted-foreground">{t('app.admin.subtitle')}</p>
                    </div>
                  )}
                </motion.div>
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <Button variant="outline" onClick={() => handleViewChange('dashboard')}>
                    <GraduationCap size={20} className="mr-2" />
                    {t('nav.exitAdminMode')}
                  </Button>
                </div>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-6 py-8">
            <AdminPanel />
          </main>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
          <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {logoElement}
                  {!branding?.logoUrl && (
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        {appTitle}
                      </h1>
                      <p className="text-xs text-muted-foreground">{t('app.subtitle')}</p>
                    </div>
                  )}
                </motion.div>
                <div className="flex items-center gap-3">
                  <TenantSelector />
                  <LanguageSwitcher />
                </div>
                <nav className="flex flex-wrap gap-2" aria-label="Main navigation">
                  <Button
                    variant={currentView === 'dashboard' && !selectedCourse ? 'default' : 'outline'}
                    onClick={() => handleViewChange('dashboard')}
                    className="gap-2"
                  >
                    <GraduationCap size={20} aria-hidden="true" />
                    <span className="hidden sm:inline">{t('nav.dashboard')}</span>
                    <span className="sm:hidden">{t('nav.home')}</span>
                  </Button>
                  <Button
                    variant={currentView === 'mission-library' ? 'default' : 'outline'}
                    onClick={() => handleViewChange('mission-library')}
                    className="gap-2"
                  >
                    <BookmarksSimple size={20} aria-hidden="true" />
                    <span className="hidden sm:inline">{t('nav.missionLibrary')}</span>
                  </Button>
                  <Button
                    variant={currentView === 'community' ? 'default' : 'outline'}
                    onClick={() => handleViewChange('community')}
                    className="gap-2"
                  >
                    <Users size={20} aria-hidden="true" />
                    <span className="hidden sm:inline">{t('nav.community')}</span>
                  </Button>
                  <Button
                    variant={currentView === 'achievements' ? 'default' : 'outline'}
                    onClick={() => handleViewChange('achievements')}
                    className="gap-2"
                  >
                    <Trophy size={20} aria-hidden="true" />
                    <span className="hidden sm:inline">{t('nav.achievements')}</span>
                    <span className="sm:hidden">{t('nav.trophies')}</span>
                  </Button>
                  <Button
                    variant={currentView === 'my-certificates' ? 'default' : 'outline'}
                    onClick={() => handleViewChange('my-certificates')}
                    className="gap-2"
                  >
                    <Certificate size={20} aria-hidden="true" />
                    <span className="hidden sm:inline">{t('nav.certificates')}</span>
                  </Button>
                  {isAdmin && (
                    <Button
                      variant={isAdminView ? 'default' : 'outline'}
                      onClick={() => handleViewChange('admin' as View)}
                      className="gap-2"
                    >
                      <ShieldCheck size={20} aria-hidden="true" />
                      <span className="hidden sm:inline">{t('nav.admin')}</span>
                    </Button>
                  )}
                  <NotificationsViewer userId={session.userId} />
                  <LanguageSwitcher />
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    variant="ghost"
                    title={t('nav.signOut')}
                  >
                    <SignOut size={20} aria-hidden="true" />
                    <span className="hidden sm:inline">{t('nav.signOut')}</span>
                  </Button>
                </nav>
              </div>
            </div>
          </header>

          <main id="main-content" className="mx-auto max-w-7xl px-6 py-8" role="main">
            {selectedCourse ? (
              <CourseViewer course={selectedCourse} onExit={() => setSelectedCourse(null)} userId={session.userId} />
            ) : currentView === 'achievements' ? (
              <AchievementsDashboard userId={session.userId} />
            ) : currentView === 'community' ? (
              <CommunityDashboard currentUserId={session.userId} />
            ) : currentView === 'mission-library' ? (
              <MissionLibrary userId={session.userId} onSelectCourse={setSelectedCourse} />
            ) : currentView === 'my-library' ? (
              <MyLibrary 
                userId={session.userId} 
                onSelectCourse={setSelectedCourse}
                onBrowseLibrary={() => handleViewChange('mission-library')}
              />
            ) : currentView === 'my-certificates' ? (
              <MyCertificates userId={session.userId} />
            ) : (
              <UserDashboard 
                courses={translatedCourses} 
                onSelectCourse={setSelectedCourse}
                userId={session.userId}
              />
            )}
          </main>

          <AccessibilityPanel />
          <DataSourceIndicator 
            usingBackend={backendCourses.length > 0} 
            coursesCount={courses.length}
          />
        </div>
      )}
      <Toaster richColors position="top-center" />
    </>
  )
}

function AppWithProviders() {
  return (
    <TenantProvider>
      <TenantResolver>
        <App />
      </TenantResolver>
    </TenantProvider>
  )
}

export default AppWithProviders