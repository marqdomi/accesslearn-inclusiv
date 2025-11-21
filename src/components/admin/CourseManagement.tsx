import { useState, useEffect } from 'react'
import { CourseStructure } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Plus, 
  MagnifyingGlass, 
  PencilSimple, 
  Trash, 
  Clock,
  CheckCircle,
  FileText,
  Books,
  Lightning,
  CalendarBlank,
  User,
  Warning,
} from '@phosphor-icons/react'
import { ModernCourseBuilder } from '../courses/modern-builder'
import { ApiService } from '@/services/api.service'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface CourseManagementProps {
  onBack: () => void
}

export function CourseManagement({ onBack }: CourseManagementProps) {
  const { user } = useAuth()
  const [courses, setCourses] = useState<CourseStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'drafts' | 'pending' | 'published'>('all')

  // Fetch courses from Cosmos DB
  const fetchCourses = async () => {
    setLoading(true)
    try {
      const fetchedCourses = await ApiService.getCourses()
      // Filter by current user (only show their courses)
      const userCourses = fetchedCourses.filter(course => 
        course.instructorId === user?.id || 
        user?.role === 'super-admin' || 
        user?.role === 'tenant-admin' ||
        user?.role === 'content-manager'
      )
      setCourses(userCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Error al cargar los cursos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [user?.id])

  // Filter courses by search and tab
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'drafts' ? !course.published && course.status !== 'pending-review' :
      activeTab === 'pending' ? course.status === 'pending-review' :
      activeTab === 'published' ? course.published :
      true

    return matchesSearch && matchesTab
  })

  // Get counts for tabs
  const draftCount = courses.filter(c => !c.published && c.status !== 'pending-review').length
  const pendingCount = courses.filter(c => c.status === 'pending-review').length
  const publishedCount = courses.filter(c => c.published).length

  const deleteCourse = async (courseId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
      try {
        await ApiService.deleteCourse(courseId)
        setCourses(courses.filter(c => c.id !== courseId))
        toast.success('Curso eliminado correctamente')
      } catch (error) {
        console.error('Error deleting course:', error)
        toast.error('Error al eliminar el curso')
      }
    }
  }

  const handleCourseUpdated = () => {
    setIsCreating(false)
    setEditingCourseId(null)
    fetchCourses() // Refresh the list
  }

  // Status badge component
  const StatusBadge = ({ course }: { course: CourseStructure }) => {
    if (course.published) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <CheckCircle size={12} className="mr-1" weight="fill" />
          Publicado
        </Badge>
      )
    }
    if (course.status === 'pending-review') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
          <Clock size={12} className="mr-1" weight="fill" />
          En Revisión
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <FileText size={12} className="mr-1" />
        Borrador
      </Badge>
    )
  }

  if (isCreating || editingCourseId) {
    return (
      <ModernCourseBuilder
        courseId={editingCourseId || undefined}
        onBack={handleCourseUpdated}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Mis Cursos</h2>
            <p className="text-sm text-muted-foreground">
              {courses.length} {courses.length === 1 ? 'curso' : 'cursos'} totales
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreating(true)} size="lg">
          <Plus className="mr-2" size={20} />
          Crear Nuevo Curso
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Books size={24} className="text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-xs text-muted-foreground">Total Cursos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <FileText size={24} className="text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{draftCount}</p>
                <p className="text-xs text-muted-foreground">Borradores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock size={24} className="text-yellow-600 dark:text-yellow-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">En Revisión</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle size={24} className="text-green-600 dark:text-green-300" weight="fill" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publishedCount}</p>
                <p className="text-xs text-muted-foreground">Publicados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Buscar por título, categoría o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Books size={16} />
            Todos ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <FileText size={16} />
            Borradores ({draftCount})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock size={16} />
            En Revisión ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="published" className="flex items-center gap-2">
            <CheckCircle size={16} />
            Publicados ({publishedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Cargando cursos desde Cosmos DB...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Warning size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4 text-center">
                  {searchQuery 
                    ? 'No se encontraron cursos que coincidan con tu búsqueda' 
                    : activeTab === 'drafts'
                    ? 'No tienes borradores en este momento'
                    : activeTab === 'pending'
                    ? 'No tienes cursos en revisión'
                    : activeTab === 'published'
                    ? 'No tienes cursos publicados aún'
                    : 'No hay cursos creados aún'}
                </p>
                {!searchQuery && activeTab === 'all' && (
                  <Button onClick={() => setIsCreating(true)} size="lg">
                    <Plus className="mr-2" size={20} />
                    Crea Tu Primer Curso
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-all hover:scale-[1.02]">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <StatusBadge course={course} />
                      <Badge variant="outline">{course.category}</Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Course Stats */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Books size={14} className="text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {course.modules.length} módulos
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lightning size={14} className="text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {course.totalXP} XP
                          </span>
                        </div>
                        {course.estimatedHours > 0 && (
                          <>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {course.estimatedHours}h
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User size={14} className="text-muted-foreground" />
                              <span className="text-muted-foreground text-xs truncate">
                                {course.instructorName}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Last updated */}
                      {course.updatedAt && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                          <CalendarBlank size={12} />
                          <span>
                            Actualizado {formatDistanceToNow(new Date(course.updatedAt), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1"
                          onClick={() => setEditingCourseId(course.id)}
                        >
                          <PencilSimple className="mr-1" size={14} />
                          {course.published ? 'Ver' : 'Editar'}
                        </Button>
                        {!course.published && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteCourse(course.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Alert for Drafts */}
      {activeTab === 'drafts' && filteredCourses.length > 0 && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Los borradores se guardan automáticamente cada 30 segundos mientras editas. 
            Todos tus cursos están almacenados en Cosmos DB de forma segura.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
