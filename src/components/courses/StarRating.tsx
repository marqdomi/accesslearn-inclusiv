import { Star } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: number
  showValue?: boolean
  interactive?: boolean
  onRatingChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  showValue = false,
  interactive = false,
  onRatingChange,
  className
}: StarRatingProps) {
  const handleClick = (newRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, starIndex: number) => {
    if (!interactive) return

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick(starIndex + 1)
    } else if (e.key === 'ArrowRight' && starIndex < maxRating - 1) {
      e.preventDefault()
      handleClick(starIndex + 2)
    } else if (e.key === 'ArrowLeft' && starIndex > 0) {
      e.preventDefault()
      handleClick(starIndex)
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)} role="img" aria-label={`Rating: ${rating.toFixed(1)} out of ${maxRating} stars`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1
        const isFilled = starValue <= Math.round(rating)
        const isPartial = starValue > rating && starValue - 1 < rating

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(starValue)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            disabled={!interactive}
            className={cn(
              'transition-all',
              interactive && 'cursor-pointer hover:scale-110 focus:scale-110 focus:outline-ring',
              !interactive && 'cursor-default'
            )}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            tabIndex={interactive ? 0 : -1}
          >
            <Star
              size={size}
              weight={isFilled || isPartial ? 'fill' : 'regular'}
              className={cn(
                'transition-colors',
                (isFilled || isPartial) && 'text-accent',
                !isFilled && !isPartial && 'text-muted-foreground'
              )}
            />
          </button>
        )
      })}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-foreground" aria-hidden="true">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
