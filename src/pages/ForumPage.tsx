/**
 * ForumPage - Community Q&A Forum hub.
 *
 * Shows all published courses as forum categories. When a user selects
 * a course, the existing QandAForum component is rendered for per-course
 * discussion. Provides a community feel where learners can browse topics,
 * ask questions and help each other.
 */

import { useEffect, useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ChatsCircle,
  MagnifyingGlass,
  CaretLeft,
  BookOpen,
  Users as UsersIcon,
  ChatCircle,
  ArrowRight,
} from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { ApiService } from '@/services/api.service'
import { QandAForum } from '@/components/courses/QandAForum'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Course } from '@/lib/types'

export function ForumPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { currentTenant } = useTenant()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({})

  // Load published courses
  useEffect(() => {
    if (!currentTenant) return

    const loadCourses = async () => {
      try {
        setLoading(true)
        const allCourses = await ApiService.getCourses(currentTenant.id)
        // Only show published courses
        const published = allCourses.filter(
          (c: Course) => c.status === 'published'
        )
        setCourses(published)

        // Load question counts for each course
        const counts: Record<string, number> = {}
        for (const course of published) {
          try {
            const questions = await ApiService.getCourseQuestions(course.id)
            counts[course.id] = questions.length
          } catch {
            counts[course.id] = 0
          }
        }
        setQuestionCounts(counts)
      } catch (error) {
        console.error('Error loading forum courses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [currentTenant?.id])

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses
    const q = searchQuery.toLowerCase()
    return courses.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    )
  }, [courses, searchQuery])

  const totalQuestions = useMemo(
    () => Object.values(questionCounts).reduce((sum, n) => sum + n, 0),
    [questionCounts]
  )

  const userRole = useMemo(() => {
    const role = user?.role
    if (role === 'super-admin' || role === 'tenant-admin' || role === 'content-manager') return 'admin'
    if (role === 'mentor') return 'mentor'
    return 'employee'
  }, [user?.role])

  // ── Render per-course forum ─────────────────────────────────────
  if (selectedCourse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCourse(null)}
            className="gap-2"
          >
            <CaretLeft size={18} />
            Volver al Foro
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            <h1 className="text-xl font-bold">{selectedCourse.title}</h1>
          </div>
        </div>

        <QandAForum
          course={selectedCourse}
          userId={user?.id || ''}
          userRole={userRole}
        />
      </div>
    )
  }

  // ── Render course list (forum hub) ──────────────────────────────
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <ChatsCircle size={32} weight="duotone" className="text-primary" />
          <h1 className="text-3xl font-bold">Foro de la Comunidad</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Explora los foros de cada curso, haz preguntas, comparte conocimiento y
          ayuda a otros compañeros. ¡Juntos aprendemos mejor!
        </p>
      </div>

      {/* Stats + Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen size={18} />
            <span>
              <strong className="text-foreground">{courses.length}</strong>{' '}
              {courses.length === 1 ? 'curso' : 'cursos'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ChatCircle size={18} />
            <span>
              <strong className="text-foreground">{totalQuestions}</strong>{' '}
              {totalQuestions === 1 ? 'pregunta' : 'preguntas'}
            </span>
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar curso..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Course cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <ChatsCircle size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery ? 'Sin resultados' : 'No hay cursos disponibles'}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? 'Intenta con otro término de búsqueda.'
              : 'Cuando haya cursos publicados aparecerán aquí.'}
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, index) => {
              const count = questionCounts[course.id] ?? 0
              return (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                    onClick={() => setSelectedCourse(course)}
                  >
                    {course.coverImage && (
                      <div className="h-32 overflow-hidden">
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-snug line-clamp-2">
                          {course.title}
                        </CardTitle>
                        <ArrowRight
                          size={18}
                          className="shrink-0 mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="secondary" className="gap-1">
                          <BookOpen size={14} />
                          {course.modules.length}{' '}
                          {course.modules.length === 1 ? 'módulo' : 'módulos'}
                        </Badge>
                        <Badge
                          variant={count > 0 ? 'default' : 'outline'}
                          className="gap-1"
                        >
                          <ChatCircle size={14} />
                          {count} {count === 1 ? 'pregunta' : 'preguntas'}
                        </Badge>
                        {course.category && (
                          <Badge variant="outline" className="text-xs">
                            {course.category}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
