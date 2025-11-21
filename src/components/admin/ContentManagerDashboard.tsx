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
  ArchiveBox, 
  MagnifyingGlass,
  FileText,
  AlertCircle,
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
    if (currentTenant) {
      loadCourses()
    }
  }, [currentTenant])

  const loadCourses = async () => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const data = await ApiService.getCourses(currentTenant.id)
      setCourses(data)
    } catch (error: any) {
      console.error('Error loading courses:', error)
      toast.error('Error al cargar cursos')
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
        <AlertCircle size={18} />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Content Manager Dashboard</h1>
        <p className="text-muted-foreground">
          Gestiona y revisa todos los cursos del sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold mt-1">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold mt-1">{stats.published}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50/50 dark:bg-gray-950/20 border-gray-100 dark:border-gray-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Archived</p>
                <p className="text-2xl font-bold mt-1">{stats.archived}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-900/50 flex items-center justify-center">
                <ArchiveBox className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold mt-1">{stats.draft}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Buscar por título, instructor, categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Courses Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="relative">
            Pending Review
            {stats.pending > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="published">Published ({stats.published})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({stats.archived})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({stats.draft})</TabsTrigger>
        </TabsList>

        {/* Courses List */}
        <div className="mt-6 space-y-4">
          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No se encontraron cursos</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? 'Intenta con otro término de búsqueda' : 'No hay cursos en esta categoría'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCourses.map(course => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <StatusBadge status={course.status} />
                      </div>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </div>
                    {course.status === 'pending-review' && onReviewCourse && (
                      <Button 
                        onClick={() => onReviewCourse(course.id)}
                        size="sm"
                      >
                        <Eye className="mr-2" size={16} />
                        Review
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Instructor</p>
                      <p className="font-medium">{course.instructorName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Categoría</p>
                      <p className="font-medium">{course.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Creado</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(course.createdAt), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
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
                    <Alert className="mt-4">
                      <AlertCircle size={16} />
                      <AlertDescription>
                        <strong>Cambios Solicitados:</strong>
                        <p className="mt-1">{course.requestedChanges}</p>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Review Comments */}
                  {course.reviewComments && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Comentarios de Revisión:</p>
                      <p className="text-sm text-muted-foreground mt-1">{course.reviewComments}</p>
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
