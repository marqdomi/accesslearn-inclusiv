import { CourseManagement } from '@/components/admin/CourseManagement'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export function CourseManagementPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  // Check if user can create courses
  const canCreateCourses = user?.role === 'super-admin' || 
                           user?.role === 'tenant-admin' || 
                           user?.role === 'content-manager' ||
                           user?.role === 'instructor'

  if (!canCreateCourses) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para crear cursos. Solo instructores, content managers y administradores pueden crear contenido.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Dashboard
        </Button>
      </div>
    )
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

      <CourseManagement onBack={() => navigate('/dashboard')} />
    </div>
  )
}
