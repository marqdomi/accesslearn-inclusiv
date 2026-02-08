/**
 * LoadingState - Consistent loading component used across pages
 */

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullPage?: boolean
}

export function LoadingState({
  message,
  size = 'md',
  className,
  fullPage = false,
}: LoadingStateProps) {
  const spinnerSizes = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary', spinnerSizes[size])} />
      {message && (
        <p className={cn('text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {message}
        </p>
      )}
    </div>
  )

  if (fullPage) {
    return <div className="min-h-[60vh] flex items-center justify-center">{content}</div>
  }

  return content
}
