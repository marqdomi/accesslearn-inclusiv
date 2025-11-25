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
    bg: 'from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50',
    iconBg: 'bg-blue-500/10',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  purple: {
    bg: 'from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50',
    iconBg: 'bg-purple-500/10',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
  green: {
    bg: 'from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50',
    iconBg: 'bg-green-500/10',
    icon: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  yellow: {
    bg: 'from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50',
    iconBg: 'bg-yellow-500/10',
    icon: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  orange: {
    bg: 'from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50',
    iconBg: 'bg-orange-500/10',
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
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
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
        `bg-gradient-to-br ${colors.bg}`
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
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

