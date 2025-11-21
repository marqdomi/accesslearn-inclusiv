import { useState, useMemo } from 'react'
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
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

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

// Mock data - In production, this would come from the backend
const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Advanced TypeScript Patterns',
    description: 'Deep dive into advanced TypeScript patterns and best practices',
    instructor: 'user-123',
    instructorName: 'Carlos García',
    status: 'pending-review',
    category: 'Programming',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    submittedForReviewAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'course-2',
    title: 'React Performance Optimization',
    description: 'Learn how to optimize React applications for maximum performance',
    instructor: 'user-456',
    instructorName: 'María Instructor',
    status: 'pending-review',
    category: 'Web Development',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    submittedForReviewAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'course-3',
    title: 'JavaScript Fundamentals',
    description: 'Master the fundamentals of JavaScript programming',
    instructor: 'user-789',
    instructorName: 'Juan López',
    status: 'published',
    category: 'Programming',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    submittedForReviewAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    reviewComments: 'Excellent course! Well structured and comprehensive.',
  },
  {
    id: 'course-4',
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js',
    instructor: 'user-123',
    instructorName: 'Carlos García',
    status: 'published',
    category: 'Backend',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    submittedForReviewAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'course-5',
    title: 'Legacy AngularJS Basics',
    description: 'Introduction to AngularJS (outdated content)',
    instructor: 'user-999',
    instructorName: 'Pedro Antiguo',
    status: 'archived',
    category: 'Frontend',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    submittedForReviewAt: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString(),
    archivedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'course-6',
    title: 'Python Web Scraping',
    description: 'Learn web scraping techniques with Python',
    instructor: 'user-456',
    instructorName: 'María Instructor',
    status: 'draft',
    category: 'Python',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    requestedChanges: 'Please add more examples in module 2 and fix typos in lesson 3',
  },
]

interface ContentManagerDashboardProps {
  onReviewCourse?: (courseId: string) => void
}

export function ContentManagerDashboard({ onReviewCourse }: ContentManagerDashboardProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('pending')

  // Check permissions
  const canManageContent = user?.role === 'super-admin' || 
                          user?.role === 'tenant-admin' || 
                          user?.role === 'content-manager'

  // Filter courses by status and search
  const filteredCourses = useMemo(() => {
    let courses = mockCourses

    // Filter by tab
    switch (selectedTab) {
      case 'pending':
        courses = courses.filter(c => c.status === 'pending-review')
        break
      case 'published':
        courses = courses.filter(c => c.status === 'published')
        break
      case 'archived':
        courses = courses.filter(c => c.status === 'archived')
        break
      case 'draft':
        courses = courses.filter(c => c.status === 'draft')
        break
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      courses = courses.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.instructorName.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      )
    }

    return courses
  }, [selectedTab, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    return {
      pending: mockCourses.filter(c => c.status === 'pending-review').length,
      published: mockCourses.filter(c => c.status === 'published').length,
      archived: mockCourses.filter(c => c.status === 'archived').length,
      draft: mockCourses.filter(c => c.status === 'draft').length,
    }
  }, [])

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cursos esperando revisión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cursos publicados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Archived</CardTitle>
              <ArchiveBox className="h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archived}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cursos archivados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Borradores (con cambios solicitados)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Cursos</CardTitle>
        </CardHeader>
        <CardContent>
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
