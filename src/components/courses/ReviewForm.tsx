import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from './StarRating'
import { useTranslation } from 'react-i18next'
import { PencilSimple, X } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ReviewFormProps {
  onSubmit: (rating: number, reviewText?: string) => Promise<void>
  onCancel?: () => void
  initialRating?: number
  initialReviewText?: string
  submitLabel?: string
}

export function ReviewForm({ 
  onSubmit, 
  onCancel, 
  initialRating = 0, 
  initialReviewText = '',
  submitLabel 
}: ReviewFormProps) {
  const { t } = useTranslation()
  const [rating, setRating] = useState(initialRating)
  const [reviewText, setReviewText] = useState(initialReviewText)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t('reviews.ratingRequired'))
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(rating, reviewText.trim() || undefined)
      toast.success(t('reviews.submitSuccess'))
      if (onCancel) onCancel()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('reviews.submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PencilSimple size={24} weight="duotone" className="text-primary" aria-hidden="true" />
          {t('reviews.writeReview')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="rating-input" className="text-sm font-medium text-foreground">
            {t('reviews.yourRating')}
          </label>
          <div id="rating-input">
            <StarRating 
              rating={rating} 
              interactive 
              onRatingChange={setRating}
              size={32}
              showValue
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="review-text" className="text-sm font-medium text-foreground">
            {t('reviews.yourReview')} <span className="text-muted-foreground">({t('reviews.optional')})</span>
          </label>
          <Textarea
            id="review-text"
            placeholder={t('reviews.reviewPlaceholder')}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            maxLength={1000}
            className="resize-none"
          />
          <div className="text-xs text-muted-foreground text-right">
            {reviewText.length} / 1000
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          onClick={handleSubmit} 
          disabled={rating === 0 || isSubmitting}
          className="flex-1"
        >
          {submitLabel || t('reviews.submit')}
        </Button>
        {onCancel && (
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X size={20} className="mr-2" aria-hidden="true" />
            {t('common.cancel')}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
