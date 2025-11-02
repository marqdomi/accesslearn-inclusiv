import { CourseRatingSummary } from '@/lib/types'
import { StarRating } from './StarRating'
import { useTranslation } from '@/lib/i18n'
import { Star } from '@phosphor-icons/react'

interface RatingSummaryProps {
  summary: CourseRatingSummary
  className?: string
}

export function RatingSummary({ summary, className }: RatingSummaryProps) {
  const { t } = useTranslation()

  if (summary.totalReviews === 0) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Star size={20} weight="regular" />
          <span className="text-sm">{t('reviews.noReviews')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-start gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl font-bold text-foreground">
            {summary.averageRating.toFixed(1)}
          </div>
          <StarRating rating={summary.averageRating} size={24} />
          <div className="text-sm text-muted-foreground">
            {t('reviews.totalReviews', { count: summary.totalReviews.toString() })}
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.ratingDistribution[stars as keyof typeof summary.ratingDistribution]
            const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0

            return (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-foreground">{stars}</span>
                  <Star size={14} weight="fill" className="text-accent" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div 
                    className="bg-primary/20 relative h-2 w-full overflow-hidden rounded-full"
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${stars} star ratings: ${percentage.toFixed(0)}%`}
                  >
                    <div 
                      className="bg-accent h-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
