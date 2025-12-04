import { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends ComponentProps<'div'> {
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  textOverlay?: boolean
  variant?: 'dark' | 'light'
  children: ReactNode
}

export function GlassCard({
  blur = 'md',
  textOverlay = false,
  variant = 'dark',
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-card',
        blur === 'sm' && 'glass-panel-sm',
        blur === 'lg' && 'glass-panel-lg',
        blur === 'xl' && 'glass-panel-xl',
        textOverlay && 'glass-card-text-overlay',
        variant === 'light' && 'bg-white/70 dark:bg-white/70',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

