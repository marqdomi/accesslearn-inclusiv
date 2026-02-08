/**
 * EmptyState - Reusable empty state component with icon, title, description, and optional action
 */

import { Button } from '@/components/ui/button'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-6',
    md: 'py-10',
    lg: 'py-16',
  }

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6',
        sizeClasses[size],
        className,
      )}
    >
      {icon && (
        <div className={cn('text-muted-foreground/50 mb-3', iconSizes[size])}>{icon}</div>
      )}
      <h3
        className={cn(
          'font-medium text-foreground',
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg',
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            'text-muted-foreground mt-1 max-w-sm',
            size === 'sm' ? 'text-xs' : 'text-sm',
          )}
        >
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || 'outline'}
          size={size === 'sm' ? 'sm' : 'default'}
          onClick={action.onClick}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
