import { useMemo } from 'react'
import { CourseReview } from '@/lib/types'

export function useCourseRatingSummary(courseId: string) {
  const reviews: CourseReview[] = []

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
