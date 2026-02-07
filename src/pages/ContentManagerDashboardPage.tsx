import { ContentManagerDashboard } from '@/components/admin/ContentManagerDashboard'
import { useNavigate } from 'react-router-dom'

export function ContentManagerDashboardPage() {
  const navigate = useNavigate()

  const handleReviewCourse = (courseId: string) => {
    // Navigate to course review page
    // For now, navigate to the demo page with the course ID
    navigate(`/courses/${courseId}/review`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto py-4 md:py-6 px-4">
        <ContentManagerDashboard onReviewCourse={handleReviewCourse} />
      </main>
    </div>
  )
}
