import { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassPanelProps extends ComponentProps<'div'> {
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
  variant?: 'dark' | 'light'
  children: ReactNode
}

export function GlassPanel({
  blur = 'md',
  glow = false,
  variant = 'dark',
  className,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        'glass-panel',
        blur === 'sm' && 'glass-panel-sm',
        blur === 'lg' && 'glass-panel-lg',
        blur === 'xl' && 'glass-panel-xl',
        glow && 'glass-panel-glow',
        variant === 'light' && 'bg-white/70 dark:bg-white/70',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

