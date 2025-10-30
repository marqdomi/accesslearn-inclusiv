import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Course } from '@/lib/types'
import { SkipLink } from '@/components/accessibility/SkipLink'
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel'
import { SampleDataInitializer } from '@/components/SampleDataInitializer'
import { CourseDashboard } from '@/components/courses/CourseDashboard'
import { CourseViewer } from '@/components/courses/CourseViewer'
import { AchievementsDashboard } from '@/components/achievements/AchievementsDashboard'
import { XPWidget } from '@/components/gamification/XPWidget'
import { Button } from '@/components/ui/button'
import { Trophy, GraduationCap, Lightning } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import { motion } from 'framer-motion'

type View = 'courses' | 'achievements'

function App() {
  const [courses] = useKV<Course[]>('courses', [])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [currentView, setCurrentView] = useState<View>('courses')

  const handleViewChange = (view: View) => {
    setCurrentView(view)
    setSelectedCourse(null)
  }

  return (
    <>
      <SampleDataInitializer />
      <SkipLink />
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
                  variant={currentView === 'courses' && !selectedCourse ? 'default' : 'outline'}
                  onClick={() => handleViewChange('courses')}
                  className="gap-2"
                >
                  <GraduationCap size={20} aria-hidden="true" />
                  <span className="hidden sm:inline">My Courses</span>
                  <span className="sm:hidden">Courses</span>
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
              </nav>
            </div>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-7xl px-6 py-8" role="main">
          {!selectedCourse && currentView === 'courses' && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <XPWidget compact />
            </motion.div>
          )}

          {selectedCourse ? (
            <CourseViewer course={selectedCourse} onExit={() => setSelectedCourse(null)} />
          ) : currentView === 'achievements' ? (
            <AchievementsDashboard />
          ) : (
            <CourseDashboard 
              courses={courses || []} 
              onSelectCourse={setSelectedCourse}
              onViewAchievements={() => handleViewChange('achievements')}
            />
          )}
        </main>

        <AccessibilityPanel />
        <Toaster richColors position="top-center" />
      </div>
    </>
  )
}

export default App