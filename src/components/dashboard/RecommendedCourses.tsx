import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Clock,
  Zap,
  TrendingUp,
  Star,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Course {
  id: string
  title: string
  description: string
  difficulty: string
  estimatedHours: number
  modules: any[]
  totalXP?: number
  coverImage?: string
  enrollments?: number
  rating?: number
  category?: string
}

interface RecommendedCoursesProps {
  courses: Course[]
  currentEnrolledCourseIds?: string[]
  loading?: boolean
}

export function RecommendedCourses({
  courses,
  currentEnrolledCourseIds = [],
  loading = false,
}: RecommendedCoursesProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Smart recommendation algorithm
  // Priority: 1) Same category as enrolled courses, 2) New courses, 3) High XP courses, 4) Shorter courses
  const availableCourses = courses.filter((course) => !currentEnrolledCourseIds.includes(course.id))
  
  // Get categories of enrolled courses
  const enrolledCategories = courses
    .filter((c) => currentEnrolledCourseIds.includes(c.id))
    .map((c) => c.category)
    .filter(Boolean)
  
  const recommended = availableCourses
    .map((course) => {
      let score = 0
      
      // Boost: Same category as enrolled courses (+10 points)
      if (course.category && enrolledCategories.includes(course.category)) {
        score += 10
      }
      
      // Boost: High XP courses (+5 points per 100 XP)
      if (course.totalXP) {
        score += Math.floor(course.totalXP / 100) * 5
      }
      
      // Boost: Shorter courses (more accessible) (+3 points per hour under 5h)
      if (course.estimatedHours && course.estimatedHours < 5) {
        score += (5 - course.estimatedHours) * 3
      }
      
      // Boost: New courses (created in last 30 days) (+5 points)
      // Note: This would require createdAt field in Course interface
      
      return { course, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.course)

  if (loading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recommended.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t('recommended.exploredAll')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('recommended.newCoursesSoon')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 p-3 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <CardTitle className="text-sm sm:text-base truncate">{t('recommended.title')}</CardTitle>
          </div>
          {courses.length > recommended.length && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/catalog')}
              className="gap-1 flex-shrink-0 text-xs sm:text-sm touch-target"
            >
              <span className="hidden sm:inline">{t('recommended.viewAll')}</span>
              <span className="sm:hidden">{t('recommended.viewAllShort')}</span>
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-6 p-3 sm:p-6">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={cn(
                  "group relative p-3 sm:p-4 rounded-lg border-2 border-border/50",
                  "hover:border-primary/50 hover:shadow-md transition-all cursor-pointer touch-target",
                  "bg-card"
                )}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="space-y-2 sm:space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                        {course.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {course.estimatedHours && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{course.estimatedHours}h</span>
                      </div>
                    )}
                    {course.totalXP && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        <span>{course.totalXP} XP</span>
                      </div>
                    )}
                    {course.rating && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <Badge variant="outline" className="text-xs">
                      {course.difficulty}
                    </Badge>
                    {course.enrollments && course.enrollments > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {course.enrollments} {t('recommended.students')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

