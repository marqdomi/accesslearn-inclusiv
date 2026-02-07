import { useNavigate } from 'react-router-dom'
import { CourseCatalog } from '@/components/courses/CourseCatalog'

export function CourseCatalogPage() {
  const navigate = useNavigate()

  const handleCourseEnrolled = () => {
    // Optionally navigate to library after enrollment
    // navigate('/library')
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <CourseCatalog onCourseEnrolled={handleCourseEnrolled} />
    </div>
  )
}
