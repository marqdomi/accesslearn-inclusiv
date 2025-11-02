import { useState } from 'react'
import { useCourseReviews } from '@/hooks/use-course-reviews'
import { RatingSummary } from './RatingSummary'
import { ReviewForm } from './ReviewForm'
import { ReviewItem } from './ReviewItem'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from '@/lib/i18n'
import { Star, PencilSimple, Trash } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface CourseReviewsSectionProps {
  courseId: string
  userId: string
  userName: string
  userAvatar?: string
}

export function CourseReviewsSection({ courseId, userId, userName, userAvatar }: CourseReviewsSectionProps) {
  const { t } = useTranslation()
  const {
    reviews,
    ratingSummary,
    userReview,
    hasCompletedCourse,
    submitReview,
    markHelpful,
    deleteReview
  } = useCourseReviews(courseId, userId)

  const [isWritingReview, setIsWritingReview] = useState(false)
  const [isEditingReview, setIsEditingReview] = useState(false)

  const handleSubmitReview = async (rating: number, reviewText?: string) => {
    await submitReview(rating, reviewText, userName, userAvatar)
    setIsWritingReview(false)
    setIsEditingReview(false)
  }

  const handleDeleteReview = async () => {
    if (confirm(t('reviews.confirmDelete'))) {
      await deleteReview()
      toast.success(t('reviews.deleteSuccess'))
    }
  }

  const otherReviews = reviews.filter(r => r.userId !== userId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Star size={28} weight="fill" className="text-accent" aria-hidden="true" />
        <h2 className="text-2xl font-bold text-foreground">{t('reviews.ratingsAndReviews')}</h2>
      </div>

      <RatingSummary summary={ratingSummary} />

      <Separator />

      {!hasCompletedCourse && (
        <Alert>
          <AlertDescription>
            {t('reviews.completeToReview')}
          </AlertDescription>
        </Alert>
      )}

      {hasCompletedCourse && !userReview && !isWritingReview && (
        <div className="flex flex-col items-center gap-4 p-6 border border-dashed border-border rounded-lg bg-muted/20">
          <p className="text-sm text-muted-foreground text-center">
            {t('reviews.shareExperience')}
          </p>
          <Button onClick={() => setIsWritingReview(true)} className="gap-2">
            <PencilSimple size={20} aria-hidden="true" />
            {t('reviews.writeReview')}
          </Button>
        </div>
      )}

      {hasCompletedCourse && userReview && !isEditingReview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">{t('reviews.yourReview')}</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingReview(true)}
                className="gap-2"
              >
                <PencilSimple size={16} aria-hidden="true" />
                {t('common.edit')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteReview}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash size={16} aria-hidden="true" />
                {t('common.delete')}
              </Button>
            </div>
          </div>
          <ReviewItem
            review={userReview}
            onMarkHelpful={markHelpful}
            currentUserId={userId}
            showActions={false}
          />
        </div>
      )}

      <AnimatePresence>
        {(isWritingReview || isEditingReview) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ReviewForm
              onSubmit={handleSubmitReview}
              onCancel={() => {
                setIsWritingReview(false)
                setIsEditingReview(false)
              }}
              initialRating={userReview?.rating || 0}
              initialReviewText={userReview?.reviewText || ''}
              submitLabel={isEditingReview ? t('common.update') : t('reviews.submit')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {otherReviews.length > 0 && (
        <div className="space-y-4">
          <Separator />
          <h3 className="text-lg font-semibold text-foreground">
            {t('reviews.learnerReviews', { count: otherReviews.length.toString() })}
          </h3>
          <div className="space-y-4">
            {otherReviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                onMarkHelpful={markHelpful}
                currentUserId={userId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
