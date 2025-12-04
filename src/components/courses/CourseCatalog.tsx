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
  const { user, refreshUser } = useAuth()
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
    if (!currentTenant) {
      console.warn('[CourseCatalog] No tenant available')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('[CourseCatalog] Loading courses for tenant:', currentTenant.id)
      
      // Refrescar usuario para obtener cursos inscritos actualizados
      if (user) {
        try {
          await refreshUser()
        } catch (error: any) {
          console.error('[CourseCatalog] Error refreshing user:', error)
          if (error.status === 401) {
            throw error // Re-throw 401 to trigger logout
          }
          // Continuar aunque falle el refresh
        }
      }
      
      const data = await ApiService.getCourses(currentTenant.id)
      console.log('[CourseCatalog] Courses received:', data?.length || 0)
      
      if (!data || !Array.isArray(data)) {
        console.error('[CourseCatalog] Invalid courses data:', data)
        setCourses([])
        toast.error('Error: Formato de datos inválido')
        return
      }
      
      // Filter only published/active courses
      const availableCourses = data.filter((c: Course) => 
        c.status === 'published' || c.status === 'active'
      )
      console.log('[CourseCatalog] Available courses after filter:', availableCourses.length)
      setCourses(availableCourses)
    } catch (error: any) {
      console.error('[CourseCatalog] Error loading courses:', error)
      if (error.status === 401) {
        // Let ApiService handle 401 errors (logout)
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
      } else {
        toast.error(error.message || 'Error al cargar cursos')
      }
      setCourses([]) // Set empty array on error
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
      
      // Actualizar estado local inmediatamente
      setEnrolledCourseIds(prev => {
        const updated = new Set(prev)
        updated.add(course.id)
        return updated
      })
      
      // Refrescar usuario del backend para sincronizar enrolledCourses
      await refreshUser()
      
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Catálogo de Cursos</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Explora y inscríbete en los cursos disponibles
        </p>
      </div>

      {/* Stats - Compact design similar to StatsCard */}
      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 md:grid-cols-3">
        {/* Mobile: Compact horizontal layout */}
        <Card className="bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-800">
          <CardContent className="p-2 sm:p-4 sm:pt-6">
            <div className="flex sm:hidden items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground truncate leading-tight">
                  Total de Cursos
                </p>
                <p className="text-lg font-bold leading-none mt-0.5">{courses.length}</p>
              </div>
            </div>
            {/* Desktop: Original vertical layout */}
            <div className="hidden sm:flex items-center justify-between">
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

        <Card className="bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/60 dark:border-purple-800">
          <CardContent className="p-2 sm:p-4 sm:pt-6">
            <div className="flex sm:hidden items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/50 flex-shrink-0">
                <FunnelSimple className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground truncate leading-tight">
                  Categorías
                </p>
                <p className="text-lg font-bold leading-none mt-0.5">{categories.length}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center justify-between">
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

        <Card className="bg-green-50/80 dark:bg-green-950/30 border-green-200/60 dark:border-green-800">
          <CardContent className="p-2 sm:p-4 sm:pt-6">
            <div className="flex sm:hidden items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/50 flex-shrink-0">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground truncate leading-tight">
                  Resultados
                </p>
                <p className="text-lg font-bold leading-none mt-0.5">{filteredCourses.length}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center justify-between">
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
        <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
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
              className="pl-10 h-12 touch-target"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-12 touch-target">
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
              <SelectTrigger className="w-full sm:w-[200px] h-12 touch-target">
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
          <CardContent className="py-12 sm:py-16 text-center p-4 sm:p-6">
            <BookOpen size={48} className="sm:hidden mx-auto text-muted-foreground mb-4" />
            <BookOpen size={64} className="hidden sm:block mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              {courses.length === 0 ? 'No hay cursos disponibles' : 'No se encontraron cursos'}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              {searchQuery || categoryFilter !== 'all' || levelFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Pronto habrá nuevos cursos disponibles'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id)
            const isEnrolling = enrolling === course.id

            return (
              <Card key={course.id} className="h-full flex flex-col hover:shadow-lg transition-shadow relative">
                {course.coverImage && (
                  <div className="h-40 sm:h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={course.coverImage} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {isEnrolled && (
                  <Badge 
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-emerald-100 text-emerald-700 border-emerald-200 text-xs"
                    variant="outline"
                  >
                    Inscrito
                  </Badge>
                )}
                
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl line-clamp-2">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 sm:line-clamp-3 text-sm">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-2 sm:space-y-3 p-4 sm:p-6 pt-0">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {course.category && (
                      <Badge variant="outline" className="text-xs">{course.category}</Badge>
                    )}
                    {course.level && (
                      <Badge variant="secondary" className="text-xs">{course.level}</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    {course.duration && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="sm:w-4 sm:h-4" />
                        <span>{course.duration}h</span>
                      </div>
                    )}
                    {course.totalXP && (
                      <div className="flex items-center gap-1">
                        <Star size={14} weight="fill" className="sm:w-4 sm:h-4 text-yellow-500" />
                        <span>{course.totalXP} XP</span>
                      </div>
                    )}
                  </div>

                  {course.instructorName && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                      Instructor: {course.instructorName}
                    </p>
                  )}
                </CardContent>

                <CardFooter className="p-4 sm:p-6 pt-0">
                  <Button 
                    onClick={() => handleEnroll(course)} 
                    className="w-full gap-2 touch-target h-12"
                    disabled={isEnrolling || isEnrolled}
                    variant={isEnrolled ? 'outline' : 'default'}
                  >
                    {isEnrolled ? (
                      <>
                        <CheckCircle size={18} weight="fill" />
                        <span className="hidden sm:inline">Inscrito</span>
                        <span className="sm:hidden">Inscrito</span>
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
