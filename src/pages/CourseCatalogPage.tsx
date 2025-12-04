import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CourseCatalog } from '@/components/courses/CourseCatalog'
import { ArrowLeft } from '@phosphor-icons/react'

export function CourseCatalogPage() {
  const navigate = useNavigate()

  const handleCourseEnrolled = () => {
    // Optionally navigate to library after enrollment
    // navigate('/library')
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mb-4 sm:mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="gap-2 touch-target"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Volver al Dashboard</span>
          <span className="sm:hidden">Volver</span>
        </Button>
      </div>

      <CourseCatalog onCourseEnrolled={handleCourseEnrolled} />
    </div>
  )
}
