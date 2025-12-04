import { ContentManagerDashboard } from '@/components/admin/ContentManagerDashboard'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function ContentManagerDashboardPage() {
  const navigate = useNavigate()

  const handleReviewCourse = (courseId: string) => {
    // Navigate to course review page
    // For now, navigate to the demo page with the course ID
    navigate(`/courses/${courseId}/review`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="touch-target"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Volver al Dashboard</span>
            <span className="sm:hidden">Volver</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-4 md:py-6 px-4">
        <ContentManagerDashboard onReviewCourse={handleReviewCourse} />
      </main>
    </div>
  )
}
