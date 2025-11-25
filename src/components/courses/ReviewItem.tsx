import { CourseReview } from '@/lib/types'
import { StarRating } from './StarRating'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { ThumbsUp, CheckCircle } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface ReviewItemProps {
  review: CourseReview
  onMarkHelpful: (reviewId: string) => void
  currentUserId: string
  showActions?: boolean
}

export function ReviewItem({ review, onMarkHelpful, currentUserId, showActions = true }: ReviewItemProps) {
  const { t } = useTranslation()
  const hasMarkedHelpful = review.helpfulBy.includes(currentUserId)
  const isOwnReview = review.userId === currentUserId

  const userInitials = review.userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  const timeAgo = formatDistanceToNow(new Date(review.timestamp), { addSuffix: true })

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            {review.userAvatar && <AvatarImage src={review.userAvatar} alt={review.userName} />}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">{review.userName}</span>
                  {review.verified && (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle size={14} weight="fill" className="text-success" aria-hidden="true" />
                      <span className="text-xs">{t('reviews.verified')}</span>
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <StarRating rating={review.rating} size={16} />
                  <span className="text-xs text-muted-foreground">{timeAgo}</span>
                </div>
              </div>
            </div>

            {review.reviewText && (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {review.reviewText}
              </p>
            )}

            {showActions && !isOwnReview && (
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkHelpful(review.id)}
                  className={cn(
                    'gap-2',
                    hasMarkedHelpful && 'text-primary'
                  )}
                >
                  <ThumbsUp 
                    size={16} 
                    weight={hasMarkedHelpful ? 'fill' : 'regular'}
                    aria-hidden="true"
                  />
                  <span className="text-xs">
                    {t('reviews.helpful')} {review.helpful > 0 && `(${review.helpful})`}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
