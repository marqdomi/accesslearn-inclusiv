import { useMemo, useState, useEffect } from 'react'
import { Course, CourseStructure, CourseAssignment } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/lib/i18n'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { BookBookmark, Play, Clock, Star } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MyLibraryProps {
  userId: string
  onSelectCourse: (course: Course) => void
  onBrowseLibrary: () => void
}

export function MyLibrary({ userId, onSelectCourse, onBrowseLibrary }: MyLibraryProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  const [libraryCourses, setLibraryCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && currentTenant) {
      loadLibrary()
    }
  }, [user, currentTenant])

  const loadLibrary = async () => {
    if (!user || !currentTenant) return

    try {
      setLoading(true)
      // Load user's enrolled courses (library)
      const userProgress = await ApiService.getUserLibrary(user.id, currentTenant.id)
      
      // Get course details for each enrolled course
      const courseIds = userProgress.map((p: any) => p.courseId)
      const allCourses = await ApiService.getCourses(currentTenant.id)
      const enrolledCourses = allCourses.filter((c: any) => courseIds.includes(c.id))
      
      setLibraryCourses(enrolledCourses)
    } catch (error: any) {
      console.error('Error loading library:', error)
      toast.error('Error al cargar biblioteca')
    } finally {
      setLoading(false)
    }
  }

  const handleStartMission = (course: any) => {
    const courseData: Course = {
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category || 'General',
      estimatedTime: (course.estimatedHours || course.duration || 1) * 60,
      modules: [],
      coverImage: course.coverImage
    }

    onSelectCourse(courseData)
  }

  const handleRemoveFromLibrary = (courseId: string) => {
    // Remove from local state
    setLibraryCourses(prev => prev.filter(c => c.id !== courseId))
    toast.success(t('missionLibrary.removedFromLibrary'))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando biblioteca...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Mi Biblioteca</h1>
        <p className="text-muted-foreground">
          Gestiona tus cursos y realiza seguimiento de tu progreso
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Cursos</p>
                <p className="text-2xl font-bold mt-1">{libraryCourses.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <BookBookmark className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Progreso</p>
                <p className="text-2xl font-bold mt-1">{libraryCourses.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <Star className="h-6 w-6 text-green-600 dark:text-green-400" weight="fill" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">XP Total Ganado</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" weight="fill" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      {libraryCourses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookBookmark size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tienes cursos en tu biblioteca</h3>
            <p className="text-muted-foreground mb-6">
              Explora el catálogo y inscríbete en cursos para comenzar tu aprendizaje
            </p>
            <Button onClick={onBrowseLibrary} size="lg">
              Explorar Catálogo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {libraryCourses.map((course) => (
            <Card key={course.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl line-clamp-2 flex-1">{course.title || 'Sin título'}</CardTitle>
                  </div>
                  <CardDescription className="line-clamp-3">{course.description || 'Sin descripción'}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {course.category && <Badge variant="outline">{course.category}</Badge>}
                    {course.difficulty && (
                      <Badge variant="outline">
                        <Star size={14} className="mr-1" weight="fill" />
                        {course.difficulty}
                      </Badge>
                    )}
                    {course.status && <Badge variant="secondary">{course.status}</Badge>}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {course.estimatedHours && (
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{course.estimatedHours}h</span>
                      </div>
                    )}
                    {course.totalXP && (
                      <div className="flex items-center gap-1">
                        <Star size={16} weight="fill" className="text-xp" />
                        <span className="font-semibold text-xp">{course.totalXP} XP</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button onClick={() => handleStartMission(course)} className="w-full gap-2">
                    <Play size={18} weight="fill" />
                    {t('myLibrary.startMission')}
                  </Button>
                </CardFooter>
              </Card>
          ))}
        </div>
      )}
    </div>
  )
}
