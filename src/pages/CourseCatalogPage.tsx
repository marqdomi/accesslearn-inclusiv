import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { CourseCatalog } from '@/components/courses/CourseCatalog'
import { ArrowLeft } from '@phosphor-icons/react'

export function CourseCatalogPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isStudent = user?.role === 'student'

  const handleCourseEnrolled = () => {
    // Optionally navigate to library after enrollment
    // navigate('/library')
  }

  return (
    <div className={isStudent ? "tech-bg min-h-screen" : "min-h-screen bg-gradient-to-br from-background via-muted/20 to-background"}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className={cn(
              "gap-2",
              isStudent && "text-white hover:bg-white/10"
            )}
          >
            <ArrowLeft size={18} />
            Volver al Dashboard
          </Button>
        </div>

        <CourseCatalog onCourseEnrolled={handleCourseEnrolled} />
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
