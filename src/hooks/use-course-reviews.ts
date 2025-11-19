import { useState, useMemo } from 'react'
import { CourseReview, CourseRatingSummary, UserProgress } from '@/lib/types'

export function useCourseReviews(courseId: string, userId: string) {
  const [reviews, setReviews] = useState<CourseReview[]>([])
  const allProgress: Record<string, UserProgress> = {}

  const hasCompletedCourse = useMemo(() => {
    return allProgress?.[courseId]?.status === 'completed'
  }, [allProgress, courseId])

  const userReview = useMemo(() => {
    return reviews?.find(r => r.userId === userId)
  }, [reviews, userId])

  const ratingSummary = useMemo((): CourseRatingSummary => {
    if (!reviews || reviews.length === 0) {
      return {
        courseId,
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalRating = 0

    reviews.forEach(review => {
      totalRating += review.rating
      distribution[review.rating as keyof typeof distribution]++
    })

    return {
      courseId,
      averageRating: totalRating / reviews.length,
      totalReviews: reviews.length,
      ratingDistribution: distribution
    }
  }, [reviews, courseId])

  const submitReview = async (rating: number, reviewText?: string, userName?: string, userAvatar?: string) => {
    if (!hasCompletedCourse) {
      throw new Error('Must complete course before reviewing')
    }

    const newReview: CourseReview = {
      id: `review-${userId}-${courseId}-${Date.now()}`,
      courseId,
      userId,
      userName: userName || 'Anonymous',
      userAvatar,
      rating,
      reviewText,
      timestamp: Date.now(),
      helpful: 0,
      helpfulBy: [],
      verified: hasCompletedCourse
    }

    setReviews((current) => {
      const filtered = (current || []).filter(r => r.userId !== userId)
      return [...filtered, newReview]
    })

    return newReview
  }

  const markHelpful = async (reviewId: string) => {
    setReviews((current) => {
      return (current || []).map(review => {
        if (review.id === reviewId) {
          const hasMarked = review.helpfulBy.includes(userId)
          if (hasMarked) {
            return {
              ...review,
              helpful: review.helpful - 1,
              helpfulBy: review.helpfulBy.filter(id => id !== userId)
            }
          } else {
            return {
              ...review,
              helpful: review.helpful + 1,
              helpfulBy: [...review.helpfulBy, userId]
            }
          }
        }
        return review
      })
    })
  }

  const deleteReview = async () => {
    setReviews((current) => {
      return (current || []).filter(r => r.userId !== userId)
    })
  }

  const sortedReviews = useMemo(() => {
    if (!reviews) return []
    
    return [...reviews].sort((a, b) => {
      if (a.helpful !== b.helpful) {
        return b.helpful - a.helpful
      }
      return b.timestamp - a.timestamp
    })
  }, [reviews])

  return {
    reviews: sortedReviews,
    ratingSummary,
    userReview,
    hasCompletedCourse,
    submitReview,
    markHelpful,
    deleteReview
  }
}
