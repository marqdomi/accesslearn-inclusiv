import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Course } from '@/lib/types'
import { SkipLink } from '@/components/accessibility/SkipLink'
import { AccessibilityPanel } from '@/components/accessibility/AccessibilityPanel'
import { CourseDashboard } from '@/components/courses/CourseDashboard'
import { CourseViewer } from '@/components/courses/CourseViewer'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const [courses] = useKV<Course[]>('courses', [])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  return (
    <>
      <SkipLink />
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <h1 className="text-2xl font-bold text-foreground">
              Inclusive Learning Platform
            </h1>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-7xl px-6 py-8" role="main">
          {selectedCourse ? (
            <CourseViewer course={selectedCourse} onExit={() => setSelectedCourse(null)} />
          ) : (
            <CourseDashboard courses={courses || []} onSelectCourse={setSelectedCourse} />
          )}
        </main>

        <AccessibilityPanel />
        <Toaster richColors position="top-center" />
      </div>
    </>
  )
}

export default App