import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  PlayCircle, 
  Clock, 
  BookOpen, 
  ArrowRight,
  Zap,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'

const AUTO_ROTATE_INTERVAL = 8000 // 8 seconds

interface Course {
  id: string
  title: string
  description: string
  modules: any[]
  totalXP?: number
  estimatedHours?: number
  difficulty?: string
  coverImage?: string
}

interface CourseProgress {
  courseId: string
  status: string
  completedLessons?: string[]
  lastAccessedAt?: string
  progress?: number
}

interface CourseWithProgress {
  course: Course
  progress: CourseProgress
  progressPercent: number
  lastAccessed: number
}

interface DynamicLearningCardProps {
  coursesInProgress: CourseWithProgress[]
  enrolledCourses: CourseWithProgress[]
  loading?: boolean
}

export function DynamicLearningCard({ 
  coursesInProgress, 
  enrolledCourses,
  loading = false 
}: DynamicLearningCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = backward
  const [isPaused, setIsPaused] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Loading skeleton with fixed min-height to prevent CLS
  if (loading) {
    return (
      <Card className="border-2 border-primary/20 bg-linear-to-br from-primary/5 via-primary/10 to-primary/5 min-h-[220px]">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-2/3"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Priority 1: Show courses in progress
  const coursesToShow = coursesInProgress.length > 0 ? coursesInProgress : enrolledCourses
  const isInProgress = coursesInProgress.length > 0
  const hasMultiple = coursesToShow.length > 1

  // Empty state - no courses at all
  if (coursesToShow.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-dashed border-muted hover:border-primary/50 transition-colors">
          <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto w-20 h-20 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center"
              >
                <BookOpen className="h-10 w-10 text-primary" />
              </motion.div>
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold">{t('card.emptyTitle')}</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {t('card.emptyDescription')}
                </p>
                <Button 
                  onClick={() => navigate('/catalog')} 
                  className="gap-2 mt-4"
                  size="lg"
                >
                  <BookOpen className="h-4 w-4" />
                  {t('card.exploreCatalog')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const currentCourseData = coursesToShow[currentIndex]
  const { course, progress, progressPercent } = currentCourseData

  // Calculate progress details
  const totalLessons = course.modules?.reduce((sum: number, m: any) =>
    sum + (m.lessons?.length || 0), 0) || 0
  const completedLessons = progress?.completedLessons?.length || 0
  const remainingLessons = totalLessons - completedLessons
  const estimatedMinutes = remainingLessons * 15 // ~15 min per lesson

  const handleContinue = () => {
    navigate(`/courses/${course.id}`)
  }

  const handlePrevious = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev === 0 ? coursesToShow.length - 1 : prev - 1))
  }, [coursesToShow.length])

  const handleNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev === coursesToShow.length - 1 ? 0 : prev + 1))
  }, [coursesToShow.length])

  const handleGoTo = useCallback((idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1)
    setCurrentIndex(idx)
  }, [currentIndex])

  // Keyboard navigation (left/right arrows) — WCAG 2.1 AA
  useEffect(() => {
    if (!hasMultiple) return
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond when the card or its children are focused
      if (!cardRef.current?.contains(document.activeElement) && document.activeElement !== cardRef.current) return
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrevious() }
      if (e.key === 'ArrowRight') { e.preventDefault(); handleNext() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasMultiple, handlePrevious, handleNext])

  // Auto-rotate every 8s, paused on hover/focus
  useEffect(() => {
    if (!hasMultiple || isPaused) return
    const timer = setInterval(handleNext, AUTO_ROTATE_INTERVAL)
    return () => clearInterval(timer)
  }, [hasMultiple, isPaused, handleNext])

  // Swipe handler for mobile (Framer Motion drag)
  const SWIPE_THRESHOLD = 50
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) handleNext()
    else if (info.offset.x > SWIPE_THRESHOLD) handlePrevious()
  }

  // Slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        ref={cardRef}
        tabIndex={hasMultiple ? 0 : undefined}
        role={hasMultiple ? 'region' : undefined}
        aria-roledescription={hasMultiple ? t('card.yourEnrolledCourses') : undefined}
        aria-label={hasMultiple ? t('card.yourEnrolledCourses') : undefined}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={(e) => { if (!cardRef.current?.contains(e.relatedTarget)) setIsPaused(false) }}
        className="border-2 border-primary/30 bg-linear-to-br from-primary/5 via-primary/10 to-primary/5 hover:border-primary/50 transition-all shadow-lg relative overflow-hidden min-h-[220px] outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {/* Carousel Navigation Arrows */}
        {hasMultiple && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-md"
              onClick={handlePrevious}
              aria-label={t('card.previousCourse', 'Previous course')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-md"
              onClick={handleNext}
              aria-label={t('card.nextCourse', 'Next course')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        <CardContent className={cn("p-4 sm:p-6", hasMultiple && "px-10 sm:px-14")}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              drag={hasMultiple ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="flex flex-col md:flex-row gap-4 sm:gap-6"
            >
              {/* Left: Course Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {isInProgress ? (
                        <>
                          <PlayCircle className="h-5 w-5 text-primary shrink-0" />
                          <Badge variant="outline" className="text-xs">
                            {t('card.inProgress')}
                          </Badge>
                          {hasMultiple && (
                            <span className="text-xs text-muted-foreground">
                              {t('card.xOfY', { current: currentIndex + 1, total: coursesToShow.length })}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-5 w-5 text-primary shrink-0" />
                          <Badge variant="outline" className="text-xs">
                            {t('card.enrolled')}
                          </Badge>
                          {hasMultiple && (
                            <span className="text-xs text-muted-foreground">
                              {t('card.xOfY', { current: currentIndex + 1, total: coursesToShow.length })}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2">
                      {isInProgress ? t('card.continueWhereLeft') : t('card.yourEnrolledCourses')}
                    </h3>
                    <h4 className="text-base sm:text-lg font-semibold mb-2 line-clamp-1">
                      {course.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {course.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar - Only show if in progress */}
                {isInProgress && progressPercent > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{t('card.courseProgress')}</span>
                      <span className="text-muted-foreground">{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <span>{t('card.lessonsCompleted', { count: completedLessons })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{t('card.lessonsRemaining', { count: remainingLessons })}</span>
                      </div>
                      {estimatedMinutes > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{t('card.hoursRemaining', { hours: Math.round(estimatedMinutes / 60) })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button 
                      onClick={handleContinue}
                      size="lg"
                      className="gap-2 w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow touch-target"
                    >
                      {isInProgress ? (
                        <>
                          <PlayCircle className="h-4 w-4" />
                          {t('card.continueCourse')}
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4" />
                          {t('card.startCourse')}
                        </>
                      )}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="w-full sm:w-auto gap-2 hover:bg-primary/5 transition-colors touch-target"
                  >
                    {t('card.viewDetails')}
                  </Button>
                </div>
              </div>

              {/* Right: Stats - Hidden on mobile for cleaner layout */}
              <div className="hidden md:block md:w-48 space-y-3 shrink-0">
                {course.totalXP && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">{t('card.xpAvailable')}</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{course.totalXP}</p>
                  </div>
                )}
                
                {course.estimatedHours && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{t('card.duration')}</span>
                    </div>
                    <p className="text-lg font-semibold">{course.estimatedHours}h</p>
                  </div>
                )}

                {course.difficulty && (
                  <Badge variant="outline" className="w-full justify-center py-2">
                    {course.difficulty}
                  </Badge>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Indicators - Bottom Center */}
          {hasMultiple && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              {coursesToShow.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGoTo(idx)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    idx === currentIndex 
                      ? "w-6 bg-primary" 
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`${t('card.goToCourse', 'Go to course')} ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

