import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: {
    value: number
    label?: string
  }
  color?: 'blue' | 'purple' | 'green' | 'yellow' | 'orange'
  loading?: boolean
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  purple: {
    bg: 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/60 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
  green: {
    bg: 'bg-green-50/80 dark:bg-green-950/30 border-green-200/60 dark:border-green-800',
    iconBg: 'bg-green-100 dark:bg-green-900/50',
    icon: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  yellow: {
    bg: 'bg-yellow-50/80 dark:bg-yellow-950/30 border-yellow-200/60 dark:border-yellow-800',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
    icon: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  orange: {
    bg: 'bg-orange-50/80 dark:bg-orange-950/30 border-orange-200/60 dark:border-orange-800',
    iconBg: 'bg-orange-100 dark:bg-orange-900/50',
    icon: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800',
  },
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue',
  loading = false 
}: StatsCardProps) {
  const colors = colorClasses[color]

  if (loading) {
    return (
      <Card className={cn("border", colors.border)}>
        <CardContent className="p-2 sm:p-4">
          {/* Mobile skeleton */}
          <div className="flex sm:hidden items-center gap-2.5">
            <div className="h-7 w-7 bg-muted rounded-md animate-pulse"></div>
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 bg-muted rounded w-2/3 animate-pulse"></div>
              <div className="h-5 bg-muted rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
          {/* Desktop skeleton */}
          <div className="hidden sm:block animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const TrendIcon = trend 
    ? (trend.value > 0 ? TrendingUp : trend.value < 0 ? TrendingDown : Minus)
    : null
  const trendColor = trend
    ? (trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-muted-foreground')
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "border transition-all hover:shadow-md",
        colors.border,
        colors.bg
      )}>
        <CardContent className="p-2 sm:p-4">
          {/* Mobile: Compact horizontal layout */}
          <div className="flex sm:hidden items-center gap-2.5">
            <div className={cn("p-1.5 rounded-md flex-shrink-0", colors.iconBg)}>
              <Icon className={cn("h-4 w-4", colors.icon)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground truncate leading-tight">
                {title}
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <p className="text-lg font-bold leading-none">{value}</p>
                {trend && TrendIcon && (
                  <div className={cn("flex items-center gap-0.5 text-[10px]", trendColor)}>
                    <TrendIcon className="h-2.5 w-2.5" />
                    <span>{Math.abs(trend.value)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop: Original vertical layout */}
          <div className="hidden sm:flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1.5 truncate">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{value}</p>
                {trend && TrendIcon && (
                  <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
                    <TrendIcon className="h-3 w-3" />
                    <span>{Math.abs(trend.value)}%</span>
                  </div>
                )}
              </div>
              {trend?.label && (
                <p className="text-xs text-muted-foreground mt-1">{trend.label}</p>
              )}
            </div>
            <div className={cn("p-2 rounded-lg flex-shrink-0", colors.iconBg)}>
              <Icon className={cn("h-5 w-5", colors.icon)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

