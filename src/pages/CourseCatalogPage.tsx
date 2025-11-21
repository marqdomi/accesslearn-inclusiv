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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <ArrowLeft size={18} />
          Volver al Dashboard
        </Button>
      </div>

      <CourseCatalog onCourseEnrolled={handleCourseEnrolled} />
    </div>
  )
}
