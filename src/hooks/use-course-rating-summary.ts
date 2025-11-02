import { useKV } from '@github/spark/hooks'
import { CourseReview } from '@/lib/types'
import { useMemo } from 'react'

export function useCourseRatingSummary(courseId: string) {
  const [reviews] = useKV<CourseReview[]>(`course-reviews-${courseId}`, [])

  const summary = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { averageRating: 0, totalReviews: 0 }
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    return {
      averageRating: totalRating / reviews.length,
      totalReviews: reviews.length
    }
  }, [reviews])

  return summary
}
