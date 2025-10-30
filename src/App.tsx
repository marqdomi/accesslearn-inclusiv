import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Course } from '@/lib/types'
import { SkipLink } from '@/components/accessibility/SkipLink'
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel'
import { SampleDataInitializer } from '@/components/SampleDataInitializer'
import { UserDashboard } from '@/components/dashboard/UserDashboard'
import { CourseViewer } from '@/components/courses/CourseViewer'
import { AchievementsDashboard } from '@/components/achievements/AchievementsDashboard'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { Button } from '@/components/ui/button'
import { Trophy, GraduationCap, Lightning, ShieldCheck } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import { motion } from 'framer-motion'

type View = 'dashboard' | 'achievements' | 'admin'

function App() {
  const [courses] = useKV<Course[]>('courses', [])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [currentView, setCurrentView] = useState<View>('dashboard')

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
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
          <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-secondary to-accent">
                    <ShieldCheck size={24} weight="fill" className="text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      GameLearn Admin
                    </h1>
                    <p className="text-xs text-muted-foreground">Content Management</p>
                  </div>
                </motion.div>
                <Button variant="outline" onClick={() => handleViewChange('dashboard')}>
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
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
          <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-secondary to-accent">
                    <Lightning size={24} weight="fill" className="text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      GameLearn
                    </h1>
                    <p className="text-xs text-muted-foreground">Level Up Your Skills</p>
                  </div>
                </motion.div>
                <nav className="flex gap-2" aria-label="Main navigation">
                  <Button
                    variant={currentView === 'dashboard' && !selectedCourse ? 'default' : 'outline'}
                    onClick={() => handleViewChange('dashboard')}
                    className="gap-2"
                  >
                    <GraduationCap size={20} aria-hidden="true" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Home</span>
                  </Button>
                  <Button
                    variant={currentView === 'achievements' ? 'default' : 'outline'}
                    onClick={() => handleViewChange('achievements')}
                    className="gap-2"
                  >
                    <Trophy size={20} aria-hidden="true" />
                    <span className="hidden sm:inline">Achievements</span>
                    <span className="sm:hidden">Trophies</span>
                  </Button>
                  <Button
                    variant={isAdminView ? 'default' : 'outline'}
                    onClick={() => handleViewChange('admin' as View)}
                    className="gap-2"
                  >
                    <ShieldCheck size={20} aria-hidden="true" />
                    <span className="hidden sm:inline">Admin</span>
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