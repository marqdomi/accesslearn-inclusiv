import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Check,
  CheckCircle,
  FileText,
  Books,
  Lightning,
  CalendarBlank,
  User,
  Warning,
  Tag,
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
  const navigate = useNavigate()
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
      const backendCourses = await ApiService.getCourses()
      
      // Ensure backendCourses is an array
      if (!Array.isArray(backendCourses)) {
        console.error('Error: getCourses() did not return an array:', backendCourses)
        setCourses([])
        return
      }
      
      // Convert backend courses to frontend format
      const { adaptBackendCourseToFrontend } = await import('@/lib/course-adapter')
      const frontendCourses = backendCourses.map(adaptBackendCourseToFrontend)
      
      // Filter by current user (only show their courses) unless admin
      const userCourses = frontendCourses.filter(course => 
        course.createdBy === user?.id || 
        user?.role === 'super-admin' || 
        user?.role === 'tenant-admin' ||
        user?.role === 'content-manager'
      )
      setCourses(userCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Error al cargar los cursos')
      setCourses([]) // Set empty array on error to prevent undefined issues
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [user?.id])

  // Filter courses by search and tab
  const filteredCourses = (courses || []).filter(course => {
    if (!course || !course.title || !course.category || !course.description) {
      return false // Skip invalid courses
    }
    
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'drafts' ? (course.status === 'draft' || (!course.status && !course.published)) :
      activeTab === 'pending' ? course.status === 'pending-review' :
      activeTab === 'published' ? (course.published || course.status === 'published') :
      true

    return matchesSearch && matchesTab
  })

  // Get counts for tabs
  const draftCount = (courses || []).filter(c => c && (c.status === 'draft' || (!c.status && !c.published))).length
  const pendingCount = (courses || []).filter(c => c && c.status === 'pending-review').length
  const publishedCount = (courses || []).filter(c => c && (c.published || c.status === 'published')).length

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
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
          <CheckCircle size={11} className="mr-1 flex-shrink-0" weight="fill" />
          <span className="hidden sm:inline">Publicado</span>
          <span className="sm:hidden">Pub.</span>
        </Badge>
      )
    }
    if (course.status === 'pending-review') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 text-xs">
          <Clock size={11} className="mr-1 flex-shrink-0" weight="fill" />
          <span className="hidden sm:inline">En Revisión</span>
          <span className="sm:hidden">Revisión</span>
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="text-xs">
        <FileText size={11} className="mr-1 flex-shrink-0" />
        <span className="hidden sm:inline">Borrador</span>
        <span className="sm:hidden">Borrador</span>
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 md:space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold">Mis Cursos</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {(courses || []).length} {(courses || []).length === 1 ? 'curso' : 'cursos'} totales
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/settings/categories')}
            className="gap-2 w-full sm:w-auto"
            size="sm"
          >
            <Tag size={16} />
            <span className="hidden sm:inline">Gestionar Categorías</span>
            <span className="sm:hidden">Categorías</span>
          </Button>
          <Button 
            onClick={() => setIsCreating(true)}
            className="w-full sm:w-auto"
            size="sm"
          >
            <Plus className="mr-2" size={18} />
            <span className="hidden sm:inline">Crear Nuevo Curso</span>
            <span className="sm:hidden">Crear Curso</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">Total Cursos</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{(courses || []).length}</p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 ml-2">
                <Books className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50 border-border">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">Borradores</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{draftCount}</p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 ml-2">
                <FileText className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">En Revisión</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{pendingCount}</p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center flex-shrink-0 ml-2">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">Publicados</p>
                <p className="text-xl md:text-2xl font-bold mt-1">{publishedCount}</p>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 ml-2">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" weight="fill" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="relative">
            <MagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              placeholder="Buscar por título, categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm md:text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger 
            value="all" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 sm:py-2 text-xs sm:text-sm"
          >
            <Books size={14} className="sm:w-4 sm:h-4" />
            <span className="truncate w-full text-center">
              <span className="hidden sm:inline">Todos </span>
              <span>({(courses || []).length})</span>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="drafts" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 sm:py-2 text-xs sm:text-sm"
          >
            <FileText size={14} className="sm:w-4 sm:h-4" />
            <span className="truncate w-full text-center">
              <span className="hidden sm:inline">Borradores </span>
              <span>({draftCount})</span>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 sm:py-2 text-xs sm:text-sm"
          >
            <Clock size={14} className="sm:w-4 sm:h-4" />
            <span className="truncate w-full text-center">
              <span className="hidden sm:inline">Revisión </span>
              <span className="sm:hidden">Rev.</span>
              <span> ({pendingCount})</span>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="published" 
            className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-2 sm:py-2 text-xs sm:text-sm"
          >
            <CheckCircle size={14} className="sm:w-4 sm:h-4" />
            <span className="truncate w-full text-center">
              <span className="hidden sm:inline">Publicados </span>
              <span className="sm:hidden">Pub.</span>
              <span> ({publishedCount})</span>
            </span>
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
            <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-all hover:scale-[1.01] md:hover:scale-[1.02]">
                  <CardHeader className="pb-3 md:pb-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <StatusBadge course={course} />
                      <Badge variant="outline" className="text-xs truncate max-w-[40%]">
                        {course.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-base md:text-lg line-clamp-2 leading-tight">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm mt-1">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 md:space-y-3">
                      {/* Course Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Books size={12} className="text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground truncate">
                            {course.modules?.length || 0} módulos
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Lightning size={12} className="text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground truncate">
                            {course.totalXP || 0} XP
                          </span>
                        </div>
                        {(course.estimatedHours || 0) > 0 && (
                          <>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Clock size={12} className="text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground truncate">
                                {course.estimatedHours || 0}h
                              </span>
                            </div>
                            {course.instructorName && (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <User size={12} className="text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground text-xs truncate">
                                  {course.instructorName}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Last updated */}
                      {course.updatedAt && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
                          <CalendarBlank size={11} className="flex-shrink-0" />
                          <span className="truncate">
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
                          className="flex-1 text-xs md:text-sm h-8 md:h-9"
                          onClick={() => setEditingCourseId(course.id)}
                        >
                          <PencilSimple className="mr-1" size={12} />
                          {course.published ? 'Ver' : 'Editar'}
                        </Button>
                        {!course.published && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteCourse(course.id)}
                            className="text-destructive hover:text-destructive h-8 md:h-9 px-2 md:px-3"
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
        <Alert className="text-sm">
          <FileText className="h-4 w-4 flex-shrink-0" />
          <AlertDescription className="text-xs md:text-sm">
            Los borradores se guardan automáticamente cada 30 segundos mientras editas. 
            Todos tus cursos están almacenados en Cosmos DB de forma segura.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
