import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Course } from '@/lib/types'
import { SkipLink } from '@/components/accessibility/SkipLink'
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel'
import { CourseDashboard } from '@/components/courses/CourseDashboard'
import { CourseViewer } from '@/components/courses/CourseViewer'
import { AchievementsDashboard } from '@/components/achievements/AchievementsDashboard'
import { Button } from '@/components/ui/button'
import { Trophy, GraduationCap } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'

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
      <SkipLink />
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-foreground">
                Inclusive Learning Platform
              </h1>
              <nav className="flex gap-2" aria-label="Main navigation">
                <Button
                  variant={currentView === 'courses' && !selectedCourse ? 'default' : 'outline'}
                  onClick={() => handleViewChange('courses')}
                  className="gap-2"
                >
                  <GraduationCap size={20} aria-hidden="true" />
                  My Courses
                </Button>
                <Button
                  variant={currentView === 'achievements' ? 'default' : 'outline'}
                  onClick={() => handleViewChange('achievements')}
                  className="gap-2"
                >
                  <Trophy size={20} aria-hidden="true" />
                  Achievements
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