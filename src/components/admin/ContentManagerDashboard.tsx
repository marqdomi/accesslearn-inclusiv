import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Archive, 
  MagnifyingGlass,
  FileText,
  WarningCircle,
  Eye
} from '@phosphor-icons/react'
import { StatusBadge } from '@/components/courses'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

type CourseStatus = 'draft' | 'pending-review' | 'published' | 'archived'

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  instructorName: string
  status: CourseStatus
  category: string
  createdAt: string
  submittedForReviewAt?: string
  publishedAt?: string
  archivedAt?: string
  reviewComments?: string
  requestedChanges?: string
}



interface ContentManagerDashboardProps {
  onReviewCourse?: (courseId: string) => void
}

export function ContentManagerDashboard({ onReviewCourse }: ContentManagerDashboardProps) {
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('pending')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  // Check permissions
  const canManageContent = user?.role === 'super-admin' || 
                          user?.role === 'tenant-admin' || 
                          user?.role === 'content-manager'

  // Load courses from backend
  useEffect(() => {
    if (currentTenant && user) {
      loadCourses()
    }
  }, [currentTenant, user?.id, user?.tenantId])

  const loadCourses = async () => {
    if (!currentTenant || !user) return

    try {
      setLoading(true)
      // Use user's tenantId from auth context, fallback to currentTenant
      const tenantId = user.tenantId || currentTenant.id
      const data = await ApiService.getCourses(tenantId)
      
      // Get all unique instructor IDs
      const instructorIds = [...new Set(
        data
          .map((course: any) => course.createdBy || course.instructor)
          .filter((id: string | undefined) => id)
      )]
      
      // Fetch all instructors in parallel
      const instructorMap = new Map<string, string>()
      await Promise.all(
        instructorIds.map(async (instructorId: string) => {
          try {
            const instructor = await ApiService.getUserById(instructorId, tenantId)
            if (instructor) {
              const name = `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.email || 'Desconocido'
              instructorMap.set(instructorId, name)
            }
          } catch (err) {
            console.warn(`Could not fetch instructor ${instructorId}:`, err)
            instructorMap.set(instructorId, 'Desconocido')
          }
        })
      )
      
      // Map courses with instructor names
      const mappedCourses = data.map((course: any) => {
        const instructorId = course.createdBy || course.instructor
        const instructorName = instructorId ? instructorMap.get(instructorId) || 'Desconocido' : 'No asignado'
        
        return {
          id: course.id,
          title: course.title || 'Sin título',
          description: course.description || '',
          instructor: instructorId || '',
          instructorName: instructorName,
          status: course.status || 'draft',
          category: course.category || 'Sin categoría',
          createdAt: course.createdAt || new Date().toISOString(),
          submittedForReviewAt: course.submittedForReviewAt,
          publishedAt: course.publishedAt,
          archivedAt: course.archivedAt,
          reviewComments: course.reviewComments,
          requestedChanges: course.requestedChanges,
        }
      })
      
      setCourses(mappedCourses)
    } catch (error: any) {
      console.error('Error loading courses:', error)
      toast.error('Error al cargar cursos')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  // Filter courses by status and search
  const filteredCourses = useMemo(() => {
    let filteredList = courses

    // Filter by tab
    switch (selectedTab) {
      case 'pending':
        filteredList = filteredList.filter(c => c.status === 'pending-review')
        break
      case 'published':
        filteredList = filteredList.filter(c => c.status === 'published')
        break
      case 'archived':
        filteredList = filteredList.filter(c => c.status === 'archived')
        break
      case 'draft':
        filteredList = filteredList.filter(c => c.status === 'draft')
        break
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filteredList = filteredList.filter(c => 
        (c.title || '').toLowerCase().includes(query) ||
        (c.description || '').toLowerCase().includes(query) ||
        (c.instructorName || '').toLowerCase().includes(query) ||
        (c.category || '').toLowerCase().includes(query)
      )
    }

    return filteredList
  }, [courses, selectedTab, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    return {
      pending: courses.filter(c => c.status === 'pending-review').length,
      published: courses.filter(c => c.status === 'published').length,
      archived: courses.filter(c => c.status === 'archived').length,
      draft: courses.filter(c => c.status === 'draft').length,
    }
  }, [courses])

  if (!canManageContent) {
    return (
      <Alert variant="destructive">
        <WarningCircle size={18} />
        <AlertDescription>
          No tienes permisos para acceder al Content Manager Dashboard. 
          Solo content managers y administradores pueden gestionar la aprobación de contenido.
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="space-y-1 md:space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Panel de Gestión de Contenido</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gestiona y revisa todos los cursos del sistema
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar por título, instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm md:text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Courses Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger 
            value="pending" 
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 text-xs sm:text-sm relative"
          >
            <Clock size={16} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="flex items-center gap-1.5">
              <span className="hidden sm:inline">Pendientes</span>
              <span className="sm:hidden">Pend.</span>
              <Badge 
                variant={stats.pending > 0 ? "destructive" : "secondary"} 
                className="h-5 min-w-[20px] px-1.5 text-[10px] sm:text-xs font-semibold"
              >
                {stats.pending}
              </Badge>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="published"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 text-xs sm:text-sm"
          >
            <CheckCircle size={16} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="flex items-center gap-1.5">
              <span className="hidden sm:inline">Publicados</span>
              <span className="sm:hidden">Pub.</span>
              <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-[10px] sm:text-xs font-semibold">
                {stats.published}
              </Badge>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="archived"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 text-xs sm:text-sm"
          >
            <Archive size={16} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="flex items-center gap-1.5">
              <span className="hidden sm:inline">Archivados</span>
              <span className="sm:hidden">Arch.</span>
              <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-[10px] sm:text-xs font-semibold">
                {stats.archived}
              </Badge>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="draft"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2.5 sm:py-2 text-xs sm:text-sm"
          >
            <FileText size={16} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="flex items-center gap-1.5">
              <span className="hidden sm:inline">Borradores</span>
              <span className="sm:hidden">Borrad.</span>
              <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-[10px] sm:text-xs font-semibold">
                {stats.draft}
              </Badge>
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Courses List */}
        <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="py-8 md:py-12 text-center">
                <FileText size={40} className="md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                <p className="text-base md:text-lg font-medium">No se encontraron cursos</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {searchQuery ? 'Intenta con otro término de búsqueda' : 'No hay cursos en esta categoría'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCourses.map(course => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 md:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <CardTitle className="text-base md:text-lg line-clamp-2">{course.title}</CardTitle>
                        <StatusBadge status={course.status} />
                      </div>
                      <CardDescription className="line-clamp-2 text-sm">
                        {course.description}
                      </CardDescription>
                    </div>
                    {course.status === 'pending-review' && onReviewCourse && (
                      <Button 
                        onClick={() => onReviewCourse(course.id)}
                        size="sm"
                        className="w-full sm:w-auto touch-target h-9"
                      >
                        <Eye className="mr-2" size={16} />
                        Revisar
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Instructor</p>
                      <p className="font-medium truncate">{course.instructorName || 'No asignado'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Categoría</p>
                      <p className="font-medium truncate">{course.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Creado</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(course.createdAt), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">
                        {course.status === 'pending-review' && 'Enviado a revisión'}
                        {course.status === 'published' && 'Publicado'}
                        {course.status === 'archived' && 'Archivado'}
                        {course.status === 'draft' && 'Última actualización'}
                      </p>
                      <p className="font-medium">
                        {course.submittedForReviewAt && formatDistanceToNow(new Date(course.submittedForReviewAt), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                        {course.publishedAt && formatDistanceToNow(new Date(course.publishedAt), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                        {course.archivedAt && formatDistanceToNow(new Date(course.archivedAt), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                        {!course.submittedForReviewAt && !course.publishedAt && !course.archivedAt && 
                          formatDistanceToNow(new Date(course.createdAt), { 
                            addSuffix: true, 
                            locale: es 
                          })
                        }
                      </p>
                    </div>
                  </div>

                  {/* Requested Changes */}
                  {course.requestedChanges && (
                    <Alert className="mt-3 md:mt-4 text-xs md:text-sm">
                      <WarningCircle size={14} className="md:h-4 md:w-4 flex-shrink-0" />
                      <AlertDescription className="text-xs md:text-sm">
                        <strong>Cambios Solicitados:</strong>
                        <p className="mt-1">{course.requestedChanges}</p>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Review Comments */}
                  {course.reviewComments && (
                    <div className="mt-3 md:mt-4 p-2 md:p-3 bg-muted rounded-lg">
                      <p className="text-xs md:text-sm font-medium">Comentarios de Revisión:</p>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">{course.reviewComments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Tabs>
    </div>
  )
}
