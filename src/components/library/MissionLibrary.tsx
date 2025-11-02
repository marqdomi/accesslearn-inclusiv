import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Course, CourseStructure, UserProgress, CourseAssignment } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/lib/i18n'
import { useUserLibrary } from '@/hooks/use-user-library'
import { CourseRatingDisplay } from '@/components/courses/CourseRatingDisplay'
import { motion } from 'framer-motion'
import {  MagnifyingGlass, BookmarkSimple, BookmarksSimple, Play, Clock, Star, Bookmark, LockKey } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MissionLibraryProps {
  userId: string
  onSelectCourse: (course: Course) => void
}

export function MissionLibrary({ userId, onSelectCourse }: MissionLibraryProps) {
  const { t } = useTranslation()
  const [courses] = useKV<CourseStructure[]>('courses', [])
  const [courseProgress] = useKV<Record<string, UserProgress>>(`course-progress-${userId}`, {})
  const [courseAssignments] = useKV<CourseAssignment[]>('course-assignments', [])
  const { isInLibrary, addToLibrary, removeFromLibrary, requestAccess, hasRequestedAccess } = useUserLibrary(userId)

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')

  const categories = useMemo(() => {
    const cats = new Set(courses?.map(c => c.category) || [])
    return Array.from(cats)
  }, [courses])

  const filteredCourses = useMemo(() => {
    if (!courses) return []

    return courses.filter(course => {
      if (!course.published) return false
      
      if (course.enrollmentMode === 'admin-only') return false

      if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !course.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      if (categoryFilter !== 'all' && course.category !== categoryFilter) {
        return false
      }

      if (difficultyFilter !== 'all' && course.difficulty !== difficultyFilter) {
        return false
      }

      if (timeFilter !== 'all') {
        const hours = course.estimatedHours || 0
        if (timeFilter === 'less1' && hours >= 1) return false
        if (timeFilter === '1to3' && (hours < 1 || hours > 3)) return false
        if (timeFilter === 'more3' && hours <= 3) return false
      }

      return true
    })
  }, [courses, searchQuery, categoryFilter, difficultyFilter, timeFilter])

  const isEnrolled = (courseId: string) => {
    const assigned = courseAssignments?.some(a => a.courseId === courseId && a.userId === userId)
    const hasProgress = courseProgress?.[courseId]?.status !== 'not-started'
    return assigned || hasProgress
  }

  const handleStartMission = (course: CourseStructure) => {
    const courseData: Course = {
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      estimatedTime: course.estimatedHours * 60,
      modules: [],
      coverImage: course.coverImage
    }

    const newAssignment: CourseAssignment = {
      id: `assign-${userId}-${course.id}-${Date.now()}`,
      courseId: course.id,
      userId,
      assignedAt: Date.now(),
      assignedBy: userId
    }

    const currentAssignments = courseAssignments || []
    const assignmentExists = currentAssignments.some(a => a.courseId === course.id && a.userId === userId)
    
    if (!assignmentExists) {
      currentAssignments.push(newAssignment)
      toast.success(t('missionLibrary.enrollSuccess'))
    }

    if (isInLibrary(course.id)) {
      removeFromLibrary(course.id)
    }

    onSelectCourse(courseData)
  }

  const handleAddToLibrary = (courseId: string) => {
    if (isInLibrary(courseId)) {
      removeFromLibrary(courseId)
      toast.success(t('missionLibrary.removedFromLibrary'))
    } else {
      addToLibrary(courseId)
      toast.success(t('missionLibrary.addedToLibrary'))
    }
  }

  const handleRequestAccess = (courseId: string) => {
    requestAccess(courseId)
    toast.success(t('missionLibrary.requestSent'))
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-secondary to-accent">
            <BookmarksSimple size={28} weight="fill" className="text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('missionLibrary.title')}
            </h1>
            <p className="text-muted-foreground">{t('missionLibrary.subtitle')}</p>
          </div>
        </div>
      </motion.div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative md:col-span-2 lg:col-span-4">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder={t('missionLibrary.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label={t('common.search')}
              />
            </div>

            <div>
              <label htmlFor="category-filter" className="sr-only">{t('missionLibrary.category')}</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder={t('missionLibrary.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('missionLibrary.allCategories')}</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="difficulty-filter" className="sr-only">{t('missionLibrary.difficulty')}</label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger id="difficulty-filter">
                  <SelectValue placeholder={t('missionLibrary.difficulty')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('missionLibrary.allDifficulties')}</SelectItem>
                  <SelectItem value="Novice">{t('admin.difficulty.novice')}</SelectItem>
                  <SelectItem value="Specialist">{t('admin.difficulty.specialist')}</SelectItem>
                  <SelectItem value="Master">{t('admin.difficulty.master')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 lg:col-span-2">
              <label htmlFor="time-filter" className="sr-only">{t('missionLibrary.estimatedTime')}</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger id="time-filter">
                  <SelectValue placeholder={t('missionLibrary.estimatedTime')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('missionLibrary.allTimes')}</SelectItem>
                  <SelectItem value="less1">{t('missionLibrary.lessThan1Hour')}</SelectItem>
                  <SelectItem value="1to3">{t('missionLibrary.1to3Hours')}</SelectItem>
                  <SelectItem value="more3">{t('missionLibrary.moreThan3Hours')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookmarksSimple size={64} className="mb-4 text-muted-foreground" weight="thin" />
            <h3 className="text-xl font-semibold mb-2">{t('missionLibrary.noCourses')}</h3>
            <p className="text-muted-foreground">{t('missionLibrary.noCoursesDesc')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course, index) => {
            const enrolled = isEnrolled(course.id)
            const inLibrary = isInLibrary(course.id)
            const requested = hasRequestedAccess(course.id)
            const isRestricted = course.enrollmentMode === 'restricted'

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-xl line-clamp-2">{course.title}</CardTitle>
                      {enrolled && (
                        <Badge variant="default" className="shrink-0">
                          {t('missionLibrary.enrolled')}
                        </Badge>
                      )}
                      {!enrolled && inLibrary && (
                        <Badge variant="secondary" className="shrink-0">
                          {t('missionLibrary.inLibrary')}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{course.category}</Badge>
                      {course.difficulty && (
                        <Badge variant="outline">
                          <Star size={14} className="mr-1" weight="fill" />
                          {course.difficulty}
                        </Badge>
                      )}
                    </div>

                    <CourseRatingDisplay courseId={course.id} size={14} />

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{course.estimatedHours}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={16} weight="fill" className="text-xp" />
                        <span className="font-semibold text-xp">{course.totalXP} XP</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    {enrolled ? (
                      <Button onClick={() => handleStartMission(course)} className="flex-1 gap-2">
                        <Play size={18} weight="fill" />
                        {t('mainMission.continueAdventure')}
                      </Button>
                    ) : isRestricted && requested ? (
                      <Button disabled className="flex-1 gap-2">
                        <LockKey size={18} />
                        {t('missionLibrary.accessRequested')}
                      </Button>
                    ) : isRestricted ? (
                      <Button
                        onClick={() => handleRequestAccess(course.id)}
                        variant="secondary"
                        className="flex-1 gap-2"
                      >
                        <LockKey size={18} />
                        {t('missionLibrary.requestAccess')}
                      </Button>
                    ) : (
                      <>
                        <Button onClick={() => handleStartMission(course)} className="flex-1 gap-2">
                          <Play size={18} weight="fill" />
                          {t('missionLibrary.startMission')}
                        </Button>
                        <Button
                          onClick={() => handleAddToLibrary(course.id)}
                          variant={inLibrary ? 'default' : 'outline'}
                          size="icon"
                          aria-label={inLibrary ? t('missionLibrary.removeFromLibrary') : t('missionLibrary.addToLibrary')}
                        >
                          {inLibrary ? (
                            <Bookmark size={18} weight="fill" />
                          ) : (
                            <BookmarkSimple size={18} />
                          )}
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
