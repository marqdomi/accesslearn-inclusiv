import { useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Course, CourseStructure, CourseAssignment } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/lib/i18n'
import { useUserLibrary } from '@/hooks/use-user-library'
import { motion } from 'framer-motion'
import { BookBookmark, Play, Clock, Star, X } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MyLibraryProps {
  userId: string
  onSelectCourse: (course: Course) => void
  onBrowseLibrary: () => void
}

export function MyLibrary({ userId, onSelectCourse, onBrowseLibrary }: MyLibraryProps) {
  const { t } = useTranslation()
  const [courses] = useKV<CourseStructure[]>('courses', [])
  const [courseAssignments] = useKV<CourseAssignment[]>('course-assignments', [])
  const { library, removeFromLibrary } = useUserLibrary(userId)

  const libraryCourses = useMemo(() => {
    if (!library || !courses) return []

    return library.courseIds
      .map(courseId => courses.find(c => c.id === courseId))
      .filter((c): c is CourseStructure => c !== undefined)
      .sort((a, b) => {
        const timeA = library.addedAt[a.id] || 0
        const timeB = library.addedAt[b.id] || 0
        return timeB - timeA
      })
  }, [library, courses])

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

    removeFromLibrary(course.id)
    onSelectCourse(courseData)
  }

  const handleRemoveFromLibrary = (courseId: string) => {
    removeFromLibrary(courseId)
    toast.success(t('missionLibrary.removedFromLibrary'))
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
            <BookBookmark size={28} weight="fill" className="text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('myLibrary.title')}
            </h1>
            <p className="text-muted-foreground">{t('myLibrary.subtitle')}</p>
          </div>
        </div>
      </motion.div>

      {libraryCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookBookmark size={64} className="mb-4 text-muted-foreground" weight="thin" />
            <h3 className="text-xl font-semibold mb-2">{t('myLibrary.empty')}</h3>
            <p className="text-muted-foreground mb-6">{t('myLibrary.emptyDesc')}</p>
            <Button onClick={onBrowseLibrary} size="lg">
              {t('myLibrary.browseLibrary')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {libraryCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl line-clamp-2 flex-1">{course.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromLibrary(course.id)}
                      className="shrink-0 -mt-1 -mr-2"
                      aria-label={t('myLibrary.removeFromLibrary')}
                    >
                      <X size={18} />
                    </Button>
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

                <CardFooter>
                  <Button onClick={() => handleStartMission(course)} className="w-full gap-2">
                    <Play size={18} weight="fill" />
                    {t('myLibrary.startMission')}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
