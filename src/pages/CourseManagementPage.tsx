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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6">
        <CourseManagement onBack={() => navigate('/dashboard')} />
      </main>
    </div>
  )
}
