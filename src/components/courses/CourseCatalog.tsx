import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MagnifyingGlass, 
  BookOpen, 
  Clock, 
  Star, 
  CheckCircle,
  Storefront,
  FunnelSimple
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface Course {
  id: string
  tenantId: string
  title: string
  description: string
  instructor: string
  instructorName?: string
  category?: string
  level?: string
  duration?: number
  status: string
  createdAt: string
  publishedAt?: string
  totalXP?: number
  coverImage?: string
}

interface CourseCatalogProps {
  onCourseEnrolled?: () => void
}

export function CourseCatalog({ onCourseEnrolled }: CourseCatalogProps) {
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  useEffect(() => {
    if (currentTenant) {
      loadCourses()
    }
  }, [currentTenant])

  useEffect(() => {
    if (user?.enrolledCourses) {
      setEnrolledCourseIds(new Set(user.enrolledCourses))
    } else {
      setEnrolledCourseIds(new Set())
    }
  }, [user?.enrolledCourses])

  const loadCourses = async () => {
    if (!currentTenant) return

    try {
      setLoading(true)
      const data = await ApiService.getCourses(currentTenant.id)
      // Filter only published/active courses
      const availableCourses = data.filter((c: Course) => 
        c.status === 'published' || c.status === 'active'
      )
      setCourses(availableCourses)
    } catch (error: any) {
      console.error('Error loading courses:', error)
      toast.error('Error al cargar cursos')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (course: Course) => {
    if (!user) return

    // Prefer user's tenantId from auth context, fallback to currentTenant
    const tenantId = user.tenantId || currentTenant?.id
    if (!tenantId) {
      toast.error('No se pudo determinar el tenant. Por favor, inicia sesión nuevamente.')
      return
    }

    try {
      setEnrolling(course.id)
      console.log(`[CourseCatalog] Enrolling user ${user.id} in course ${course.id} with tenant ${tenantId}`)
      
      // Use self-enrollment endpoint for students (doesn't require enrollment:assign-individual permission)
      // Admins can still use the regular endpoint if needed
      if (user.role === 'student' || user.role === 'mentor') {
        await ApiService.enrollSelfInCourse(course.id, tenantId)
      } else {
        // For admins and other roles, use the regular enrollment endpoint
        await ApiService.enrollUserInCourse(user.id, tenantId, course.id)
      }
      
      toast.success(`¡Te has inscrito en "${course.title}"!`, {
        description: 'El curso ya está disponible en tu biblioteca'
      })
      setEnrolledCourseIds(prev => {
        const updated = new Set(prev)
        updated.add(course.id)
        return updated
      })
      onCourseEnrolled?.()
    } catch (error: any) {
      console.error('Error enrolling in course:', error)
      const errorMessage = error.status === 400 && error.message?.includes('no encontrado')
        ? 'Usuario no encontrado. Por favor, contacta al administrador.'
        : error.status === 403
        ? 'No tienes permisos para inscribirte en este curso o el curso no está disponible.'
        : error.message || 'Error al inscribirse en el curso'
      toast.error(errorMessage)
    } finally {
      setEnrolling(null)
    }
  }

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      (course.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.instructorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter

    return matchesSearch && matchesCategory && matchesLevel
  })

  // Get unique categories and levels
  const categories = Array.from(new Set(courses.map(c => c.category).filter(Boolean)))
  const levels = Array.from(new Set(courses.map(c => c.level).filter(Boolean)))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando catálogo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Catálogo de Cursos</h1>
        <p className="text-muted-foreground">
          Explora y inscríbete en los cursos disponibles
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Cursos</p>
                <p className="text-2xl font-bold mt-1">{courses.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categorías</p>
                <p className="text-2xl font-bold mt-1">{categories.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <FunnelSimple className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resultados</p>
                <p className="text-2xl font-bold mt-1">{filteredCourses.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlass 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              size={18} 
            />
            <Input
              placeholder="Buscar por título, descripción, instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos los niveles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                {levels.map(level => (
                  <SelectItem key={level} value={level!}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {courses.length === 0 ? 'No hay cursos disponibles' : 'No se encontraron cursos'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || categoryFilter !== 'all' || levelFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Pronto habrá nuevos cursos disponibles'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id)
            const isEnrolling = enrolling === course.id

            return (
              <Card key={course.id} className="h-full flex flex-col hover:shadow-lg transition-shadow relative">
                {course.coverImage && (
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={course.coverImage} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {isEnrolled && (
                  <Badge 
                    className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 border-emerald-200"
                    variant="outline"
                  >
                    Inscrito
                  </Badge>
                )}
                
                <CardHeader>
                  <CardTitle className="text-xl line-clamp-2">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {course.category && (
                      <Badge variant="outline">{course.category}</Badge>
                    )}
                    {course.level && (
                      <Badge variant="secondary">{course.level}</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {course.duration && (
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{course.duration}h</span>
                      </div>
                    )}
                    {course.totalXP && (
                      <div className="flex items-center gap-1">
                        <Star size={16} weight="fill" className="text-yellow-500" />
                        <span>{course.totalXP} XP</span>
                      </div>
                    )}
                  </div>

                  {course.instructorName && (
                    <p className="text-sm text-muted-foreground">
                      Instructor: {course.instructorName}
                    </p>
                  )}
                </CardContent>

                <CardFooter>
                  <Button 
                    onClick={() => handleEnroll(course)} 
                    className="w-full gap-2"
                    disabled={isEnrolling || isEnrolled}
                    variant={isEnrolled ? 'outline' : 'default'}
                  >
                    {isEnrolled ? (
                      <>
                        <CheckCircle size={18} weight="fill" />
                        Inscrito
                      </>
                    ) : isEnrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Inscribiendo...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} weight="fill" />
                        Inscribirse
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
