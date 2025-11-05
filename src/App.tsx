import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/hooks/use-auth'
import { Course } from '@/lib/types'
import { SkipLink } from '@/components/accessibility/SkipLink'
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel'
import { SampleDataInitializer } from '@/components/SampleDataInitializer'
import { UserDashboard } from '@/components/dashboard/UserDashboard'
import { CourseViewer } from '@/components/courses/CourseViewer'
import { AchievementsDashboard } from '@/components/achievements/AchievementsDashboard'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { PasswordChangeScreen } from '@/components/auth/PasswordChangeScreen'
import { OnboardingScreen } from '@/components/auth/OnboardingScreen'
import { InitialSetupScreen } from '@/components/auth/InitialSetupScreen'
import { Button } from '@/components/ui/button'
import { Trophy, GraduationCap, Lightning, ShieldCheck, SignOut } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import { motion } from 'framer-motion'

type View = 'dashboard' | 'achievements' | 'admin'

function App() {
  const { session, login, changePassword, completeOnboarding, logout, setupInitialAdmin, hasAdminUser, isAuthenticated } = useAuth()
  const [courses] = useKV<Course[]>('courses', [])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [currentView, setCurrentView] = useState<View>('dashboard')

  // CRITICAL: Check if initial setup is required
  if (!hasAdminUser) {
    return (
      <>
        <InitialSetupScreen onSetupComplete={setupInitialAdmin} />
        <Toaster richColors position="top-center" />
      </>
    )
  }

  if (!isAuthenticated || !session) {
    return (
      <>
        <LoginScreen onLogin={login} />
        <Toaster richColors position="top-center" />
      </>
    )
  }

  if (session.requiresPasswordChange) {
    return (
      <>
        <PasswordChangeScreen onPasswordChange={changePassword} />
        <Toaster richColors position="top-center" />
      </>
    )
  }

  if (session.requiresOnboarding) {
    return (
      <>
        <OnboardingScreen userEmail={session.email} onComplete={completeOnboarding} />
        <Toaster richColors position="top-center" />
      </>
    )
  }

  const handleViewChange = (view: View) => {
    setCurrentView(view)
    setSelectedCourse(null)
  }

  const isAdminView = currentView === 'admin'

  return (
    <>
      <SampleDataInitializer />
      <SkipLink />
      {isAdminView ? (
        <div className="min-h-screen admin-bg">
          <header className="admin-header sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--admin-primary)]">
                    <ShieldCheck size={24} weight="fill" className="text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 className="text-2xl admin-heading">
                      AccessLearn Admin
                    </h1>
                    <p className="text-xs text-muted-foreground">Training Management System</p>
                  </div>
                </div>
                <Button variant="outline" className="admin-button admin-focus" onClick={() => handleViewChange('dashboard')}>
                  <GraduationCap size={20} className="mr-2" />
                  Exit Admin Mode
                </Button>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-6 py-8">
            <AdminPanel />
          </main>
        </div>
      ) : (
        <div className="min-h-screen learner-gradient-bg">
          <header className="border-b bg-card/90 backdrop-blur-md sticky top-0 z-50 shadow-lg">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-secondary to-accent shadow-lg">
                    <Lightning size={28} weight="fill" className="text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold learner-heading">
                      GameLearn
                    </h1>
                    <p className="text-sm font-semibold text-muted-foreground">Level Up Your Skills! 🚀</p>
                  </div>
                </motion.div>
                <nav className="flex gap-2" aria-label="Main navigation">
                  <Button
                    variant={currentView === 'dashboard' && !selectedCourse ? 'default' : 'outline'}
                    onClick={() => handleViewChange('dashboard')}
                    className="gap-2 learner-button learner-focus"
                  >
                    <GraduationCap size={20} aria-hidden="true" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Home</span>
                  </Button>
                  <Button
                    variant={currentView === 'achievements' ? 'default' : 'outline'}
                    onClick={() => handleViewChange('achievements')}
                    className="gap-2 learner-button learner-focus"
                  >
                    <Trophy size={20} aria-hidden="true" />
                    <span className="hidden sm:inline">Achievements</span>
                    <span className="sm:hidden">Trophies</span>
                  </Button>
                  <Button
                    variant={isAdminView ? 'default' : 'outline'}
                    onClick={() => handleViewChange('admin' as View)}
                    className="gap-2 learner-button learner-focus"
                  >
                    <ShieldCheck size={20} aria-hidden="true" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={logout}
                    className="gap-2 learner-button learner-focus"
                    title="Sign out"
                  >
                    <SignOut size={20} aria-hidden="true" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </nav>
              </div>
            </div>
          </header>

          <main id="main-content" className="mx-auto max-w-7xl px-6 py-8" role="main">
            {selectedCourse ? (
              <CourseViewer course={selectedCourse} onExit={() => setSelectedCourse(null)} />
            ) : currentView === 'achievements' ? (
              <AchievementsDashboard />
            ) : (
              <UserDashboard 
                courses={courses || []} 
                onSelectCourse={setSelectedCourse}
              />
            )}
          </main>

          <AccessibilityPanel />
        </div>
      )}
      <Toaster richColors position="top-center" />
    </>
  )
}

export default App