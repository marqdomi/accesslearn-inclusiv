import { useCourseRatingSummary } from '@/hooks/use-course-rating-summary'
import { StarRating } from './StarRating'

interface CourseRatingDisplayProps {
  courseId: string
  size?: number
  showCount?: boolean
  className?: string
}

export function CourseRatingDisplay({ courseId, size = 16, showCount = true, className }: CourseRatingDisplayProps) {
  const { averageRating, totalReviews } = useCourseRatingSummary(courseId)

  if (totalReviews === 0) {
    return null
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <StarRating rating={averageRating} size={size} showValue />
        {showCount && totalReviews > 0 && (
          <span className="text-xs text-muted-foreground">
            ({totalReviews})
          </span>
        )}
      </div>
    </div>
  )
}
